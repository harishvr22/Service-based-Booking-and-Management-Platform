import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Harish1002@@",
        database="apartment_service_system"
    )
    cursor = conn.cursor()

    # Get existing columns
    cursor.execute("DESCRIBE bookings")
    columns = [row[0] for row in cursor.fetchall()]
    print("Current columns in bookings:", columns)

    # Add service_name column if it does not exist
    if "service_name" not in columns:
        cursor.execute("ALTER TABLE bookings ADD COLUMN service_name VARCHAR(100) NULL")
        print("Successfully added service_name column")

    # Add amount column if it does not exist
    if "amount" not in columns:
        cursor.execute("ALTER TABLE bookings ADD COLUMN amount INT NOT NULL DEFAULT 0")
        print("Successfully added amount column")

    # Add payment_status column if it does not exist
    if "payment_status" not in columns:
        cursor.execute("ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'")
        print("Successfully added payment_status column")

    conn.commit()
    print("Database migration completed successfully!")
except Exception as e:
    print("Error during database migration:", e)
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
