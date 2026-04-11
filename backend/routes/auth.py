from flask import Blueprint, request, jsonify
from db import db

auth_bp = Blueprint("auth", __name__)

# SIGNUP API
@auth_bp.route("/signup", methods=["POST"])
def signup():

    data = request.json

    cursor = db.cursor()

    query = """
    INSERT INTO users(name,email,password,phone,role,apartment_id)
    VALUES(%s,%s,%s,%s,%s,%s)
    """

    cursor.execute(query,(
        data["name"],
        data["email"],
        data["password"],
        data["phone"],
        data["role"],
        data["apartment_id"]
    ))

    db.commit()

    return jsonify({"status":"registered"})


# LOGIN API
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data["email"]
    password = data["password"]
    
    # DEBUG: Print what was received
    print(f"DEBUG LOGIN - Email: '{email}' (len={len(email)})")
    print(f"DEBUG LOGIN - Password: '{password}' (len={len(password)})")

    cursor = db.cursor(dictionary=True)

    query = "SELECT id,name,role FROM users WHERE email=%s AND password=%s"

    cursor.execute(query,(email,password))

    user = cursor.fetchone()
    
    # DEBUG: Print query result
    print(f"DEBUG LOGIN - User found: {user}")

    if user:
        print(f"✓ Login successful for {email} with role {user['role']}")
        return jsonify({
            "status":"success",
            "role":user["role"],
            "id":user["id"],
            "name":user["name"]
        })
    else:
        print(f"✗ Login failed - Invalid credentials for {email}")
        return jsonify({"status":"invalid", "message":"Invalid email or password"})


# DELETE ACCOUNT API
@auth_bp.route("/delete-account", methods=["DELETE"])
def delete_account():

    data = request.json

    user_id = data.get("user_id")
    email = data.get("email")
    password = data.get("password")  # For confirmation

    if not user_id and not email:
        return jsonify({"status": "error", "message": "User ID or email required"}), 400

    cursor = db.cursor(dictionary=True)

    # Verify user exists and password matches
    if user_id:
        query = "SELECT id, email FROM users WHERE id=%s AND password=%s"
        cursor.execute(query, (user_id, password))
    else:
        query = "SELECT id, email FROM users WHERE email=%s AND password=%s"
        cursor.execute(query, (email, password))

    user = cursor.fetchone()

    if not user:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    # Delete related bookings first
    cursor.execute("DELETE FROM bookings WHERE resident_id=%s", (user["id"],))

    # Delete the user
    cursor.execute("DELETE FROM users WHERE id=%s", (user["id"],))

    db.commit()

    return jsonify({"status": "deleted"})


# UPDATE PROFILE API
@auth_bp.route("/update-profile", methods=["PUT"])
def update_profile():
    data = request.json

    user_id = int(data.get("user_id"))
    name = data.get("name")
    email = data.get("email")

    if not user_id:
        return jsonify({"status": "error", "message": "User ID required"}), 400

    cursor = db.cursor()

    query = "UPDATE users SET name=%s, email=%s WHERE id=%s"
    cursor.execute(query, (name, email, user_id))

    db.commit()

    return jsonify({"status": "updated"})


# CHANGE PASSWORD API
@auth_bp.route("/change-password", methods=["PUT"])
def change_password():
    data = request.json

    user_id = int(data.get("user_id"))
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not user_id or not current_password or not new_password:
        return jsonify({"status": "error", "message": "User ID, current password, and new password required"}), 400

    cursor = db.cursor(dictionary=True)

    # Verify current password
    query = "SELECT id FROM users WHERE id=%s AND password=%s"
    cursor.execute(query, (user_id, current_password))

    user = cursor.fetchone()

    if not user:
        return jsonify({"status": "error", "message": "Current password is incorrect"}), 401

    # Update password
    query = "UPDATE users SET password=%s WHERE id=%s"
    cursor.execute(query, (new_password, user_id))

    db.commit()

    return jsonify({"status": "password_changed"})


# GET PROVIDERS
@auth_bp.route("/providers", methods=["GET"])
def get_providers():
    cursor = db.cursor(dictionary=True)

    query = "SELECT id, name, email, phone, role FROM users WHERE role LIKE 'Provider%'"
    cursor.execute(query)

    providers = cursor.fetchall()

    return jsonify({"providers": providers})


# UPDATE PROVIDER STATUS
@auth_bp.route("/update-provider-status", methods=["PUT"])
def update_provider_status():
    data = request.json

    provider_id = int(data.get("provider_id"))
    status = data.get("status")  # 'approved', 'rejected', 'suspended'

    if not provider_id or not status:
        return jsonify({"status": "error", "message": "Provider ID and status required"}), 400

    cursor = db.cursor()

    # First check if status column exists, if not we'll need to handle it differently
    # For now, let's assume we add a status column or use a different approach
    # Since the current table doesn't have status, let's use a different field or create logic

    # For now, let's use the role field to indicate status
    # 'Provider' = pending, 'Provider_Approved' = approved, 'Provider_Rejected' = rejected, 'Provider_Suspended' = suspended

    role_mapping = {
        'approved': 'Provider_Approved',
        'rejected': 'Provider_Rejected',
        'suspended': 'Provider_Suspended',
        'pending': 'Provider'
    }

    new_role = role_mapping.get(status, 'Provider')

    query = "UPDATE users SET role=%s WHERE id=%s AND role LIKE 'Provider%'"
    cursor.execute(query, (new_role, provider_id))

    db.commit()

    return jsonify({"status": "updated"})


# GET RESIDENTS
@auth_bp.route("/residents", methods=["GET"])
def get_residents():
    cursor = db.cursor(dictionary=True)

    query = "SELECT id, name, email, phone, role, apartment_id FROM users WHERE role LIKE 'Resident%'"
    cursor.execute(query)

    residents = cursor.fetchall()

    return jsonify({"residents": residents})


# UPDATE RESIDENT STATUS
@auth_bp.route("/update-resident-status", methods=["PUT"])
def update_resident_status():
    data = request.json

    resident_id = int(data.get("resident_id"))
    status = data.get("status")  # 'active', 'suspended'

    if not resident_id or not status:
        return jsonify({"status": "error", "message": "Resident ID and status required"}), 400

    cursor = db.cursor()

    role_mapping = {
        'active': 'Resident',
        'suspended': 'Resident_Suspended'
    }

    new_role = role_mapping.get(status, 'Resident')

    query = "UPDATE users SET role=%s WHERE id=%s AND role LIKE 'Resident%'"
    cursor.execute(query, (new_role, resident_id))

    db.commit()

    return jsonify({"status": "updated"})