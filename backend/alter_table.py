import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Harish1002@@",
    database="apartment_service_system"
)

cursor = db.cursor()
try:
    # Change role column to VARCHAR(50) to allow more descriptive roles
    cursor.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL")
    db.commit()
    print("Table altered successfully: role column is now VARCHAR(50)")
except Exception as e:
    print(f"Error altering table: {e}")
finally:
    db.close()
