import mysql.connector
from mysql.connector import pooling
from flask import g, current_app

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Harish1002@@",
    "database": "apartment_service_system",
    "autocommit": True
}

# Create a connection pool
try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=10,
        pool_reset_session=True,
        **db_config
    )
    print("Database connection pool established")
except Exception as e:
    print(f"Failed to create connection pool: {e}")
    # Fallback to single connection if pool fails
    connection_pool = None

def get_db():
    if 'db_conn' not in g:
        if connection_pool:
            g.db_conn = connection_pool.get_connection()
        else:
            g.db_conn = mysql.connector.connect(**db_config)
    return g.db_conn

class DBProxy:
    def __getattr__(self, name):
        # Forward all calls to the connection in flask.g
        return getattr(get_db(), name)

# This 'db' object will be imported by blueprints
# It will always point to the connection for the CURRENT request
db = DBProxy()

def close_db(e=None):
    db_conn = g.pop('db_conn', None)
    if db_conn is not None:
        try:
            db_conn.close() # Return to pool
        except:
            pass