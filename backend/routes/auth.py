from flask import Blueprint, request, jsonify
from db import db

auth_bp = Blueprint("auth", __name__)



# DELETE ACCOUNT API
@auth_bp.route("/delete-account", methods=["DELETE"])
def delete_account():

    data = request.json

    user_id = data.get("user_id")
    email = data.get("email")
    password = data.get("password")  # For confirmation

    if not user_id and not email:
        return jsonify({"status": "error", "message": "User ID or email required"}), 400

    cursor = db.cursor(dictionary=True, buffered=True)

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

    # Delete related bookings
    cursor.execute("DELETE FROM bookings WHERE resident_id=%s OR resident_id IN (SELECT id FROM users WHERE email=%s)", (user["id"], user["email"]))

    # Delete related complaints
    try:
        cursor.execute("DELETE FROM complaints WHERE user_id=%s OR user_email=%s", (user["id"], user["email"]))
    except:
        pass

    # Delete the user
    cursor.execute("DELETE FROM users WHERE id=%s", (user["id"],))

    cursor.close()
    db.commit()

    return jsonify({"status": "success", "message": "Account deleted successfully"})


# GET PROFILE API
@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    cursor = db.cursor(dictionary=True, buffered=True)
    query = "SELECT id, name, email, phone, role, apartment_id, availability, skills, bio FROM users WHERE id=%s"
    cursor.execute(query, (user_id,))
    user = cursor.fetchone()
    
    cursor.close()
    if user:
        return jsonify({"status": "success", "user": user})
    else:
        return jsonify({"status": "error", "message": "User not found"}), 404


# UPDATE PROFILE API
@auth_bp.route("/update-profile", methods=["PUT"])
def update_profile():
    data = request.json

    user_id = int(data.get("user_id"))
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    role = data.get("role")
    apartment_id = data.get("apartment_id")
    availability = data.get("availability")
    skills = data.get("skills")
    bio = data.get("bio")

    if not user_id:
        return jsonify({"status": "error", "message": "User ID required"}), 400

    cursor = db.cursor(buffered=True)

    query = "UPDATE users SET name=%s, email=%s, phone=%s, role=%s, apartment_id=%s, availability=%s, skills=%s, bio=%s WHERE id=%s"
    cursor.execute(query, (name, email, phone, role, apartment_id, availability, skills, bio, user_id))

    cursor.close()
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

    cursor = db.cursor(dictionary=True, buffered=True)

    # Verify current password
    query = "SELECT id FROM users WHERE id=%s AND password=%s"
    cursor.execute(query, (user_id, current_password))

    user = cursor.fetchone()

    if not user:
        return jsonify({"status": "error", "message": "Current password is incorrect"}), 401

    # Update password
    query = "UPDATE users SET password=%s WHERE id=%s"
    cursor.execute(query, (new_password, user_id))

    cursor.close()
    db.commit()

    return jsonify({"status": "password_changed"})


# GET PROVIDERS
@auth_bp.route("/providers", methods=["GET"])
def get_providers():
    cursor = db.cursor(dictionary=True, buffered=True)

    query = """
        SELECT u.*, 
        (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id) as total_bookings 
        FROM users u WHERE u.role LIKE 'Provider%'
    """
    cursor.execute(query)

    providers = cursor.fetchall()
    cursor.close()

    return jsonify({"providers": providers})


# UPDATE PROVIDER STATUS
@auth_bp.route("/update-provider-status", methods=["PUT"])
def update_provider_status():
    data = request.json

    provider_id = int(data.get("provider_id"))
    status = data.get("status")  # 'active', 'suspended', 'approved', 'rejected'

    if not provider_id or not status:
        return jsonify({"status": "error", "message": "Provider ID and status required"}), 400

    cursor = db.cursor(buffered=True)

    # Map 'approved' to 'active' status for backend consistency
    db_status = 'active' if status == 'approved' else status

    query = "UPDATE users SET status=%s WHERE id=%s AND role LIKE 'Provider%'"
    cursor.execute(query, (db_status, provider_id))

    cursor.close()
    db.commit()

    return jsonify({"status": "updated"})


# GET RESIDENTS
@auth_bp.route("/residents", methods=["GET"])
def get_residents():
    cursor = db.cursor(dictionary=True, buffered=True)

    query = """
        SELECT u.*, 
        (SELECT COUNT(*) FROM bookings WHERE resident_id = u.id) as total_bookings 
        FROM users u WHERE u.role LIKE 'Resident%'
    """
    cursor.execute(query)

    residents = cursor.fetchall()
    cursor.close()

    return jsonify({"residents": residents})


# UPDATE RESIDENT STATUS
@auth_bp.route("/update-resident-status", methods=["PUT"])
def update_resident_status():
    data = request.json

    resident_id = int(data.get("resident_id"))
    status = data.get("status")  # 'active', 'suspended', 'approved'

    if not resident_id or not status:
        return jsonify({"status": "error", "message": "Resident ID and status required"}), 400

    cursor = db.cursor(buffered=True)

    # Map 'approved' to 'active' status
    db_status = 'active' if status == 'approved' else status

    query = "UPDATE users SET status=%s WHERE id=%s AND role LIKE 'Resident%'"
    cursor.execute(query, (db_status, resident_id))

    cursor.close()
    db.commit()

    return jsonify({"status": "updated"})


# GET ADMIN DASHBOARD DATA
@auth_bp.route("/admin/dashboard", methods=["GET"])
def get_admin_dashboard():
    cursor = db.cursor(dictionary=True)

    # 1. Total users (Residents only as requested)
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role LIKE 'Resident%'")
    total_users = cursor.fetchone()['count']

    # 2. Providers (All providers)
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role LIKE 'Provider%'")
    active_providers = cursor.fetchone()['count']

    # 3. Active bookings
    cursor.execute("SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'accepted')")
    active_bookings = cursor.fetchone()['count']

    # 4. Revenue (Set to $0 since no revenue feature yet)
    revenue = "$0"

    # 5. Action Required counts
    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role LIKE 'Resident%' AND status = 'pending'")
    pending_residents = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM users WHERE role LIKE 'Provider%' AND status = 'pending'")
    pending_providers = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM complaints WHERE status = 'open'")
    open_complaints = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")
    pending_bookings = cursor.fetchone()['count']

    return jsonify({
        "stats": {
            "total_users": total_users,
            "active_providers": active_providers,
            "active_bookings": active_bookings,
            "revenue": revenue
        },
        "action_required": {
            "resident_approvals": pending_residents,
            "provider_approvals": pending_providers,
            "open_complaints": open_complaints,
            "pending_bookings": pending_bookings
        }
    })

# DELETE RESIDENT
@auth_bp.route("/resident/<int:resident_id>", methods=["DELETE"])
def delete_resident(resident_id):
    cursor = db.cursor(buffered=True)
    
    try:
        # Delete related child records first to avoid Foreign Key constraint errors
        cursor.execute("DELETE FROM bookings WHERE resident_id=%s OR provider_id=%s", (resident_id, resident_id))
        cursor.execute("DELETE FROM notifications WHERE user_id=%s OR created_by=%s", (resident_id, resident_id))
        cursor.execute("DELETE FROM complaints WHERE user_id=%s", (resident_id,))
        cursor.execute("DELETE FROM announcements WHERE created_by=%s", (resident_id,))
        
        # Finally delete the user
        cursor.execute("DELETE FROM users WHERE id=%s AND role LIKE 'Resident%'", (resident_id,))
        
        db.commit()
        return jsonify({"status": "deleted"})
    except Exception as e:
        db.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()

# DELETE PROVIDER
@auth_bp.route("/provider/<int:provider_id>", methods=["DELETE"])
def delete_provider(provider_id):
    cursor = db.cursor(buffered=True)
    
    try:
        # Delete related child records first to avoid Foreign Key constraint errors
        cursor.execute("DELETE FROM bookings WHERE provider_id=%s", (provider_id,))
        cursor.execute("DELETE FROM notifications WHERE user_id=%s OR created_by=%s", (provider_id, provider_id))
        cursor.execute("DELETE FROM complaints WHERE user_id=%s", (provider_id,))
        cursor.execute("DELETE FROM announcements WHERE created_by=%s", (provider_id,))
        
        # Finally delete the user
        cursor.execute("DELETE FROM users WHERE id=%s AND role LIKE 'Provider%'", (provider_id,))
        
        db.commit()
        return jsonify({"status": "deleted"})
    except Exception as e:
        db.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        cursor.close()