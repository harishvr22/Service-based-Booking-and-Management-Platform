from flask import Blueprint, request, jsonify
from flask_socketio import emit
from socketio_instance import socketio
from db import db

notifications_bp = Blueprint("notifications", __name__)

# Get notifications
@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    cursor = db.cursor(dictionary=True, buffered=True)
    cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC")
    notifications = cursor.fetchall()
    cursor.close()
    return jsonify(notifications)

# Create notification/announcement
@notifications_bp.route("/notifications", methods=["POST"])
def create_notification():
    data = request.json
    cursor = db.cursor(buffered=True)
    query = """
    INSERT INTO notifications(title, message, audience, created_by, created_at)
    VALUES(%s, %s, %s, %s, NOW())
    """
    cursor.execute(query, (
        data["title"],
        data["message"],
        data["audience"],
        int(data.get("created_by", 1))  # default to admin ID 1
    ))
    cursor.close()
    db.commit()
    
    # Emit to all connected clients
    socketio.emit('new_notification', data)
    
    return jsonify({"status": "notification_created"})

# Mark as read
@notifications_bp.route("/notifications/<int:id>/read", methods=["PUT"])
def mark_read(id):
    cursor = db.cursor(buffered=True)
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = %s", (id,))
    cursor.close()
    db.commit()
    return jsonify({"status": "marked_read"})

# Delete notification
@notifications_bp.route("/notifications/<int:id>", methods=["DELETE"])
def delete_notification(id):
    cursor = db.cursor(buffered=True)
    cursor.execute("DELETE FROM notifications WHERE id = %s", (id,))
    cursor.close()
    db.commit()
    return jsonify({"status": "deleted"})