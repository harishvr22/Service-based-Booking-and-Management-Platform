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

    cursor = db.cursor(dictionary=True)

    query = "SELECT id,name,role FROM users WHERE email=%s AND password=%s"

    cursor.execute(query,(email,password))

    user = cursor.fetchone()

    if user:
        return jsonify({
            "status":"success",
            "role":user["role"]
        })
    else:
        return jsonify({"status":"invalid"})


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