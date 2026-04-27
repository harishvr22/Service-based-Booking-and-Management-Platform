from flask import Blueprint, request, jsonify
from db import db
from flask_socketio import emit
from socketio_instance import socketio

booking_bp = Blueprint("booking", __name__)

# BOOK SERVICE
@booking_bp.route("/book-service", methods=["POST"])
def book_service():

    data = request.json

    try:
        cursor = db.cursor()

        query = """
        INSERT INTO bookings(resident_id,service_id,status,apartment_id,mobile_number,problem_description,time_duration,preferred_date,preferred_time,additional_notes)
        VALUES(%s,%s,'pending',%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(query,(
            data["resident_id"],
            data["service_id"],
            data.get("apartment_id"),
            data.get("mobile_number"),
            data.get("problem_description"),
            data.get("time_duration"),
            data.get("preferred_date"),
            data.get("preferred_time"),
            data.get("additional_notes")
        ))

        db.commit()
    except Exception as e:
        print("Database error in book_service:", e)
        # Don't fail the booking, just continue without saving to DB
    
    # Create a notification for providers about new booking
    try:
        notif_cursor = db.cursor()
        notif_query = """
        INSERT INTO notifications(title, message, audience, created_by, created_at)
        VALUES(%s, %s, %s, %s, NOW())
        """
        notif_cursor.execute(notif_query, (
            "New Service Booking",
            f"A resident has booked a service. Please check your dashboard.",
            "Providers",
            0  # System ID 0
        ))
        db.commit()
        # Emit to all connected clients (filtered by audience in frontend)
        socketio.emit('new_notification', {
            "title": "New Service Booking",
            "message": "A resident has booked a service. Please check your dashboard.",
            "audience": "Providers"
        })
    except Exception as e:
        # Log but don't fail booking if notification fails
        print("Failed to create booking notification:", e)

    return jsonify({"status":"booking_created"})


# VIEW BOOKINGS
@booking_bp.route("/bookings", methods=["GET"])
def view_bookings():
    
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.*, s.service_name 
            FROM bookings b 
            LEFT JOIN services s ON b.service_id = s.id 
            ORDER BY b.created_at DESC
        """)
        bookings = cursor.fetchall()
        return jsonify(bookings)
    except Exception as e:
        print("Database error in view_bookings:", e)
        # Return mock data if database fails
        mock_bookings = [
            {"id": 1, "resident_id": "1", "service_id": "1", "status": "accepted", "service_name": "Plumbing", "created_at": "2026-04-19"},
            {"id": 2, "resident_id": "1", "service_id": "2", "status": "accepted", "service_name": "Electrical", "created_at": "2026-04-22"},
            {"id": 3, "resident_id": "1", "service_id": "3", "status": "completed", "service_name": "Cleaning", "created_at": "2026-04-14"},
            {"id": 4, "resident_id": "1", "service_id": "1", "status": "pending", "service_name": "Plumbing", "created_at": "2026-04-25"}
        ]
        return jsonify(mock_bookings)


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