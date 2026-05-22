import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Harish1002@@",
    database="apartment_service_system"
)

cursor = db.cursor(dictionary=True)
cursor.execute("SELECT id, name, email, role, status, availability, created_at FROM users")
rows = cursor.fetchall()
print("--- ALL USERS IN DB ---")
for row in rows:
    print(row)
db.close()
