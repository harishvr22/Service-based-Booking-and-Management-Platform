import os
import re
from flask import g
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
DB_TYPE = os.getenv("DB_TYPE")

# If DB_TYPE is not explicitly specified, decide based on DATABASE_URL
if not DB_TYPE:
    if DATABASE_URL:
        DB_TYPE = "postgres"
    else:
        DB_TYPE = "mysql"

print(f"Database type configured: {DB_TYPE}")

connection_pool = None

if DB_TYPE == "postgres":
    import psycopg2
    import psycopg2.extras
    from psycopg2 import pool

    db_config = {}
    if not DATABASE_URL:
        db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "postgres"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "apartment_service_system"),
            "port": os.getenv("DB_PORT", "5432")
        }

    # Create connection pool
    try:
        if DATABASE_URL:
            connection_pool = pool.SimpleConnectionPool(1, 20, dsn=DATABASE_URL)
            print("PostgreSQL connection pool established using DATABASE_URL")
        else:
            connection_pool = pool.SimpleConnectionPool(1, 20, **db_config)
            print("PostgreSQL connection pool established using db_config")
    except Exception as e:
        print(f"Failed to create connection pool: {e}")
        connection_pool = None

    def get_db():
        if 'db_conn' not in g:
            if connection_pool:
                g.db_conn = connection_pool.getconn()
            else:
                if DATABASE_URL:
                    g.db_conn = psycopg2.connect(dsn=DATABASE_URL)
                else:
                    g.db_conn = psycopg2.connect(**db_config)
        return g.db_conn

    class PostgresCursorWrapper:
        def __init__(self, conn, *args, **kwargs):
            # Remove MySQL-specific arguments if present
            dictionary = kwargs.pop('dictionary', False)
            kwargs.pop('buffered', False) # Not used in psycopg2
            
            if dictionary:
                kwargs['cursor_factory'] = psycopg2.extras.RealDictCursor
                
            self.cursor = conn.cursor(*args, **kwargs)

        def __getattr__(self, name):
            return getattr(self.cursor, name)

        def __setattr__(self, name, value):
            if name == 'cursor':
                super().__setattr__(name, value)
            else:
                setattr(self.cursor, name, value)

        def execute(self, query, params=None):
            if params is not None:
                # Escape single % signs that are not part of %s or already escaped as %%
                query = re.sub(r'%(?!s|%)', '%%', query)
            return self.cursor.execute(query, params)

    class PostgresDBProxy:
        def __getattr__(self, name):
            # Forward calls to the connection
            conn = get_db()
            if name == 'cursor':
                return lambda *args, **kwargs: PostgresCursorWrapper(conn, *args, **kwargs)
            return getattr(conn, name)

    db = PostgresDBProxy()

    def close_db(e=None):
        db_conn = g.pop('db_conn', None)
        if db_conn is not None:
            try:
                # Rollback any uncommitted transaction to clean up connection state
                db_conn.rollback()
            except:
                pass
            try:
                if connection_pool:
                    connection_pool.putconn(db_conn)
                else:
                    db_conn.close()
            except:
                pass

else:
    # MySQL fallback
    import mysql.connector
    from mysql.connector import pooling

    db_config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "apartment_service_system"),
        "port": os.getenv("DB_PORT", "3306")
    }

    # Clean up DB_PASSWORD if it's None
    if db_config["password"] is None:
        db_config["password"] = ""

    # Create connection pool
    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="mypool",
            pool_size=10,
            pool_reset_session=True,
            **db_config
        )
        print("MySQL connection pool established")
    except Exception as e:
        print(f"Failed to create MySQL connection pool: {e}")
        connection_pool = None

    def get_db():
        if 'db_conn' not in g:
            if connection_pool:
                g.db_conn = connection_pool.get_connection()
            else:
                g.db_conn = mysql.connector.connect(**db_config)
        return g.db_conn

    class MySQLDBProxy:
        def __getattr__(self, name):
            return getattr(get_db(), name)

    db = MySQLDBProxy()

    def close_db(e=None):
        db_conn = g.pop('db_conn', None)
        if db_conn is not None:
            try:
                db_conn.close()
            except:
                pass