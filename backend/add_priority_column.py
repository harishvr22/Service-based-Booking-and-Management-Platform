import mysql.connector

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Harish1002@@",
    "database": "apartment_service_system",
}

try:
    db = mysql.connector.connect(**db_config)
    cursor = db.cursor()
    # Check if column exists
    cursor.execute("SHOW COLUMNS FROM bookings LIKE 'priority';")
    if not cursor.fetchone():
        cursor.execute("ALTER TABLE bookings ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' AFTER status;")
        db.commit()
        print("Column 'priority' added to 'bookings' table.")
    else:
        print("Column 'priority' already exists.")
    cursor.close()
    db.close()
except Exception as e:
    print(f"Error: {e}")
