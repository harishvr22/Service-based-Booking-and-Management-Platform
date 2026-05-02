from flask import Blueprint, request, jsonify
from db import db
from datetime import datetime
from socketio_instance import socketio

complaints_bp = Blueprint('complaints', __name__)

@complaints_bp.route('/complaints', methods=['POST'])
def add_complaint():
    data = request.json
    print(f"=== COMPLAINT REQUEST RECEIVED ===")
    print(f"Data: {data}")
    
    user_id = data.get('user_id')
    title = data.get('title')
    description = data.get('description')
    priority = data.get('priority', 'medium')
    
    print(f"Parsed - user_id: {user_id}, title: {title}, desc: {description}")
    
    if not user_id:
        return jsonify({'status': 'error', 'message': 'User session not found. Please log in again.'}), 400
    if not title:
        return jsonify({'status': 'error', 'message': 'Subject is required.'}), 400
    if not description:
        return jsonify({'status': 'error', 'message': 'Description is required.'}), 400
        
    try:
        cursor = db.cursor(buffered=True)
        query = """
        INSERT INTO complaints (user_id, title, description, priority, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, 'open', NOW(), NOW())
        """
        cursor.execute(query, (user_id, title, description, priority))
        db.commit()
        cursor.close()
        
        # Notify admin via socket
        socketio.emit('new_complaint', {'user_id': user_id, 'title': title})
        
        return jsonify({'status': 'success', 'message': 'Complaint raised successfully'})
    except Exception as e:
        print(f"Error raising complaint: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@complaints_bp.route('/admin/complaints', methods=['GET'])
def get_complaints():
    try:
        cursor = db.cursor(dictionary=True, buffered=True)
        query = """
        SELECT c.*, u.name as user_name 
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
        """
        cursor.execute(query)
        complaints = cursor.fetchall()
        
        # Format dates for JSON
        for c in complaints:
            if c['created_at']:
                c['date'] = c['created_at'].strftime('%Y-%m-%d %H:%M')
            else:
                c['date'] = 'N/A'
                
        cursor.close()
        return jsonify({'status': 'success', 'complaints': complaints})
    except Exception as e:
        print(f"Error fetching complaints: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
