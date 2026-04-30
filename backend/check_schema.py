import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Harish1002@@",
    database="apartment_service_system"
)

cursor = db.cursor()
cursor.execute("DESCRIBE users")
for row in cursor.fetchall():
    print(row)

db.close()
