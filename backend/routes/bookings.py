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
        INSERT INTO bookings(resident_id, service_id, status, priority, apartment_id, mobile_number, problem_description, time_duration, preferred_date, preferred_time, additional_notes)
        VALUES(%s, %s, 'pending', %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data.get("resident_id"),
            data.get("service_id"),
            data.get("priority", "medium"),
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
        notif_cursor.execute(notif_query, (
            "New Service Booking",
            f"A resident has booked a service. Please check your dashboard.",
            "Providers",
            data.get("resident_id")
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
            SELECT b.*, s.service_name, u.name as resident_name 
            FROM bookings b 
            LEFT JOIN services s ON b.service_id = s.id 
            LEFT JOIN users u ON b.resident_id = u.id
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
    print(f"DEBUG: Received update-status request: {data}")
    
    try:
        status = data.get("status")
        booking_id = data.get("booking_id")
        provider_id = data.get("provider_id")

        if not booking_id or not status:
            return jsonify({"status": "error", "message": "Missing booking_id or status"}), 400

        cursor = db.cursor(buffered=True)
        
        # Convert to int safely
        try:
            b_id = int(booking_id)
            p_id = int(provider_id) if provider_id else None
        except (ValueError, TypeError):
            return jsonify({"status": "error", "message": "Invalid ID format"}), 400

        if p_id and status == 'accepted':
            query = "UPDATE bookings SET status=%s, provider_id=%s WHERE id=%s"
            cursor.execute(query, (status, p_id, b_id))
        else:
            query = "UPDATE bookings SET status=%s WHERE id=%s"
            cursor.execute(query, (status, b_id))
            
        db.commit()
        cursor.close()
        return jsonify({"status": "updated"})
    except Exception as e:
        print(f"DEBUG: Database error in update_status for booking {data.get('booking_id')}: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# DELETE BOOKING
@booking_bp.route("/bookings/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    try:
        cursor = db.cursor(buffered=True)
        cursor.execute("DELETE FROM bookings WHERE id = %s", (booking_id,))
        db.commit()
        cursor.close()
        return jsonify({"status": "success", "message": "Booking deleted"})
    except Exception as e:
        print("Database error in delete_booking:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
