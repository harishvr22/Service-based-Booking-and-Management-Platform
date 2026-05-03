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
        cursor = db.cursor(buffered=True)
        query = """
        INSERT INTO bookings(resident_id, service_id, status, apartment_id, mobile_number, problem_description, time_duration, preferred_date, preferred_time, additional_notes)
        VALUES(%s, %s, 'pending', %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data.get("resident_id"),
            data.get("service_id"),
            data.get("apartment_id"),
            data.get("mobile_number"),
            data.get("problem_description"),
            data.get("time_duration"),
            data.get("preferred_date"),
            data.get("preferred_time"),
            data.get("additional_notes")
        ))
        db.commit()
        cursor.close()
    except Exception as e:
        print("Database error in book_service:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
    
    # Create a notification for providers about new booking
    try:
        notif_cursor = db.cursor(buffered=True)
        notif_query = """
        INSERT INTO notifications(title, message, audience, created_by, created_at)
        VALUES(%s, %s, %s, %s, NOW())
        """
        # Note: If no admin/system user exists with ID 0, this might fail due to FK constraint.
        # Assuming system notifications use a valid user or 0 is allowed.
        notif_cursor.execute(notif_query, (
            "New Service Booking",
            f"A resident has booked a service. Please check your dashboard.",
            "Providers",
            data.get("resident_id") # Use the resident's ID as creator
        ))
        db.commit()
        notif_cursor.close()
        
        # Emit to all connected clients
        socketio.emit('new_notification', {
            "title": "New Service Booking",
            "message": "A resident has booked a service. Please check your dashboard.",
            "audience": "Providers"
        })
    except Exception as e:
        print("Failed to create booking notification:", e)

    return jsonify({"status": "booking_created"})


# VIEW BOOKINGS
@booking_bp.route("/bookings", methods=["GET"])
def view_bookings():
    resident_id = request.args.get("resident_id")
    provider_id = request.args.get("provider_id")
    
    try:
        cursor = db.cursor(dictionary=True, buffered=True)
        
        query = """
            SELECT b.*, s.service_name 
            FROM bookings b 
            LEFT JOIN services s ON b.service_id = s.id 
        """
        params = []
        
        if resident_id:
            query += " WHERE b.resident_id = %s"
            params.append(resident_id)
        elif provider_id:
            query += " WHERE b.provider_id = %s"
            params.append(provider_id)
            
        query += " ORDER BY b.created_at DESC"
        
        cursor.execute(query, params)
        bookings = cursor.fetchall()
        cursor.close()
        
        # Convert date and time objects to strings for JSON serialization
        for b in bookings:
            if b.get('preferred_date'):
                b['preferred_date'] = str(b['preferred_date'])
            if b.get('preferred_time'):
                b['preferred_time'] = str(b['preferred_time'])
            if b.get('created_at'):
                b['created_at'] = str(b['created_at'])
            if b.get('booking_date'):
                b['booking_date'] = str(b['booking_date'])
            if b.get('booking_time'):
                b['booking_time'] = str(b['booking_time'])
                
        return jsonify(bookings)
    except Exception as e:
        print("Database error in view_bookings:", e)
        return jsonify([]), 500


# UPDATE STATUS
@booking_bp.route("/update-status", methods=["PUT"])
def update_status():
    data = request.json
    try:
        cursor = db.cursor(buffered=True)
        query = "UPDATE bookings SET status=%s WHERE id=%s"
        cursor.execute(query, (
            data["status"],
            data["booking_id"]
        ))
        db.commit()
        cursor.close()
        return jsonify({"status": "updated"})
    except Exception as e:
        print("Database error in update_status:", e)
        return jsonify({"status": "error", "message": str(e)}), 500