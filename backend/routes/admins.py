from flask import Blueprint, request, jsonify
from db import db
from werkzeug.security import generate_password_hash

admins_bp = Blueprint("admins", __name__)

# GET ALL ADMINS
@admins_bp.route("/admins", methods=["GET"])
def get_admins():
    cursor = db.cursor(dictionary=True)
    
    # Get all admin users; use created_at as a fallback for last activity
    query = "SELECT id, name, email, role, created_at AS last_login FROM users WHERE role IN ('super admin', 'manager', 'support', 'admin') ORDER BY id DESC"
    
    cursor.execute(query)
    admins = cursor.fetchall()
    
    # Convert datetimes to strings for JSON serialization
    for admin in admins:
        if admin.get('last_login') is not None:
            admin['last_login'] = str(admin['last_login'])
    
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
    hashed_password = generate_password_hash(password)
    query = """
    INSERT INTO users (name, email, password, role)
    VALUES (%s, %s, %s, %s)
    """
    
    cursor.execute(query, (name, email, hashed_password, role.lower()))
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

# GET ALL BOOKINGS FOR MONITORING
@admins_bp.route("/admin/bookings", methods=["GET"])
def get_admin_bookings():
    try:
        cursor = db.cursor(dictionary=True, buffered=True)
        
        query = """
            SELECT 
                b.id, 
                s.service_name as service, 
                b.apartment_id as apartment, 
                u_res.name as resident, 
                COALESCE(u_prov.name, 'Unassigned') as provider, 
                b.status, 
                b.preferred_date as date, 
                b.preferred_time as time, 
                'normal' as priority,
                b.problem_description as description,
                b.created_at,
                b.rating,
                b.review
            FROM bookings b
            LEFT JOIN services s ON b.service_id = s.id
            LEFT JOIN users u_res ON b.resident_id = u_res.id
            LEFT JOIN users u_prov ON b.provider_id = u_prov.id
            ORDER BY b.created_at DESC
        """
        
        cursor.execute(query)
        bookings = cursor.fetchall()
        cursor.close()
        
        # Format dates and times for JSON
        for b in bookings:
            if b.get('date'):
                b['date'] = str(b['date'])
            if b.get('time'):
                b['time'] = str(b['time'])
            if b.get('created_at'):
                b['created_at'] = str(b['created_at'])
            b['id'] = str(b['id'])
                
        return jsonify({
            "status": "success",
            "bookings": bookings
        })
    except Exception as e:
        print("Error fetching admin bookings:", e)
        return jsonify({"status": "error", "message": str(e)}), 500