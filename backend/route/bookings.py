from flask import Blueprint, request, jsonify
from db import db

booking_bp = Blueprint("booking", __name__)

# BOOK SERVICE
@booking_bp.route("/book-service", methods=["POST"])
def book_service():

    data = request.json

    cursor = db.cursor()

    query = """
    INSERT INTO bookings(resident_id,service_id,status)
    VALUES(%s,%s,'pending')
    """

    cursor.execute(query,(
        data["resident_id"],
        data["service_id"]
    ))

    db.commit()

    return jsonify({"status":"booking_created"})


# VIEW BOOKINGS
@booking_bp.route("/bookings", methods=["GET"])
def view_bookings():

    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM bookings")

    bookings = cursor.fetchall()

    return jsonify(bookings)


# UPDATE STATUS
@booking_bp.route("/update-status", methods=["PUT"])
def update_status():

    data = request.json

    cursor = db.cursor()

    query = "UPDATE bookings SET status=%s WHERE id=%s"

    cursor.execute(query,(
        data["status"],
        data["booking_id"]
    ))

    db.commit()

    return jsonify({"status":"updated"})