from flask import Blueprint, request, jsonify
from db import db

admins_bp = Blueprint("admins", __name__)

# GET ALL ADMINS
@admins_bp.route("/admins", methods=["GET"])
def get_admins():
    cursor = db.cursor(dictionary=True)
    
    # Get all users with admin roles
    query = "SELECT id, name, email, role, last_login FROM users WHERE role IN ('super admin', 'manager', 'support', 'admin') ORDER BY id DESC"
    
    cursor.execute(query)
    admins = cursor.fetchall()
    
    return jsonify({
        "status": "success",
        "admins": admins
    })

# ADD NEW ADMIN
@admins_bp.route("/admins/add", methods=["POST"])
def add_admin():
    data = request.json
    
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    
    if not all([name, email, password, role]):
        return jsonify({"status": "error", "message": "All fields are required"}), 400
    
    # Validate role
    valid_roles = ['super admin', 'manager', 'support', 'admin']
    if role.lower() not in valid_roles:
        return jsonify({"status": "error", "message": "Invalid role"}), 400
    
    cursor = db.cursor(dictionary=True)
    
    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({"status": "error", "message": "Email already exists"}), 400
    
    # Insert new admin
    query = """
    INSERT INTO users (name, email, password, role)
    VALUES (%s, %s, %s, %s)
    """
    
    cursor.execute(query, (name, email, password, role.lower()))
    db.commit()
    
    return jsonify({"status": "success", "message": "Admin added successfully"})

# DELETE/REVOKE ADMIN ACCESS
@admins_bp.route("/admins/delete", methods=["DELETE"])
def delete_admin():
    data = request.json
    
    admin_id = data.get("id")
    
    if not admin_id:
        return jsonify({"status": "error", "message": "Admin ID is required"}), 400
    
    cursor = db.cursor(dictionary=True)
    
    # Check if admin exists
    cursor.execute("SELECT id, role FROM users WHERE id = %s", (admin_id,))
    admin = cursor.fetchone()
    
    if not admin:
        return jsonify({"status": "error", "message": "Admin not found"}), 404
    
    # Prevent deleting the super admin
    if admin['role'] == 'super admin':
        return jsonify({"status": "error", "message": "Cannot delete super admin"}), 403
    
    # Delete the admin
    cursor.execute("DELETE FROM users WHERE id = %s", (admin_id,))
    db.commit()
    
    return jsonify({"status": "success", "message": "Admin access revoked"})