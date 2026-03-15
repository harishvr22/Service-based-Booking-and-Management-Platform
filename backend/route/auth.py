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