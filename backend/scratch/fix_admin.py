import mysql.connector

try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Harish1002@@",
        database="apartment_service_system"
    )
    cursor = db.cursor()
    
    # Check if admin already exists
    cursor.execute("SELECT id FROM users WHERE id = 1")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (id, name, email, password, role) VALUES (1, 'Admin', 'admin@example.com', 'admin123', 'super admin')")
        db.commit()
        print("Admin user (ID: 1) created successfully.")
    else:
        print("User with ID: 1 already exists.")
    
    cursor.close()
    db.close()
except Exception as e:
    print(f"Error: {e}")
