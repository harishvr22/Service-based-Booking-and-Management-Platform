import os
import mysql.connector
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

# Load environment variables
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(dotenv_path)

db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "apartment_service_system")
}

def migrate_passwords():
    print("Connecting to the database...")
    try:
        db = mysql.connector.connect(**db_config)
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        return

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, password FROM users")
    users = cursor.fetchall()
    
    print(f"Found {len(users)} users in the database.")
    
    migrated_count = 0
    skipped_count = 0
    
    for u in users:
        user_id = u['id']
        name = u['name']
        email = u['email']
        pwd = u['password'] or ""
        
        # Determine if the password is already hashed
        # Werkzeug hashes usually start with 'scrypt:' or 'pbkdf2:sha256:' or 'pbkdf2:sha512:' etc.
        is_already_hashed = False
        if pwd.startswith(('scrypt:', 'pbkdf2:sha256:', 'pbkdf2:sha512:', 'pbkdf2:')):
            is_already_hashed = True
        
        if is_already_hashed:
            print(f"Skipping user {name} ({email}) - Password already hashed.")
            skipped_count += 1
        else:
            print(f"Migrating user {name} ({email}) - Hashing plaintext password...")
            hashed_pwd = generate_password_hash(pwd)
            
            # Update in database
            update_cursor = db.cursor()
            update_cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_pwd, user_id))
            update_cursor.close()
            migrated_count += 1
            
    db.commit()
    cursor.close()
    db.close()
    
    print("\n=== MIGRATION COMPLETE ===")
    print(f"Successfully migrated: {migrated_count} users")
    print(f"Already migrated (skipped): {skipped_count} users")
    print("==========================\n")

if __name__ == "__main__":
    migrate_passwords()
