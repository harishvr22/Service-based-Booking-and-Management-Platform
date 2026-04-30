from flask import Blueprint, request, jsonify
from db import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/signup', methods=['POST'])
def register_user():
    print("=== SIGNUP REQUEST RECEIVED ===")
    data = request.json
    print(f"Received data: {data}")
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone', '')
    apartment_id = data.get('apartment_id', '')
    
    role = data.get('role', 'Resident')
    # Default to pending for admin approval
    status = 'pending'
    
    # Provider specific fields
    skills = data.get('skills', None)
    bio = data.get('bio', None)
    availability = data.get('availability', None)
    
    print(f"Parsed - Name: {name}, Email: {email}, Password: {password}, Role: {role}")
    
    missing = [field for field in ['name', 'email', 'password'] if not data.get(field)]
    if missing:
        return jsonify({'status': 'error', 'message': f'Missing fields: {", ".join(missing)}'}), 400
    
    cursor = db.cursor(dictionary=True, buffered=True)
    cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
    if cursor.fetchone():
        return jsonify({'status': 'error', 'message': 'Email already exists'}), 400
    
    query = 'INSERT INTO users (name, email, password, phone, apartment_id, role, status, skills, bio, availability, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())'
    cursor.execute(query, (name, email, password, phone, apartment_id, role, status, skills, bio, availability))
    cursor.close()
    db.commit()
    
    return jsonify({'status': 'success', 'message': 'Registration successful.'})

@users_bp.route('/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'status': 'error', 'message': 'Email and password are required'}), 400
    
    cursor = db.cursor(dictionary=True, buffered=True)
    cursor.execute('SELECT id, name, email, password, role, status, apartment_id, phone, availability, skills, bio FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
    
    if user['password'] != password:
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
    
    if user['status'] == 'pending':
        return jsonify({'status': 'error', 'message': 'Your application is in waiting process. Please wait for admin approval.'}), 401
    
    if user['status'] != 'active':
        return jsonify({'status': 'error', 'message': f'Account is {user["status"]}. Please contact admin.'}), 401
    
    cursor.close()
    del user['password']
    return jsonify({'status': 'success', 'message': 'Login successful', 'user': user})
