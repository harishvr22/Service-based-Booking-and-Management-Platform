# Apartment Service Booking and Management System

A service-based booking and management system for apartment complexes built with Flask backend and vanilla JavaScript frontend.

## Project Structure

```
├── backend/               # Flask REST API
│   ├── routes/           # API endpoints (auth, bookings, services, etc.)
│   ├── app.py            # Flask application entry point
│   ├── db.py             # Database connection pool
│   └── socketio_instance.py
├── frontend/             # Web interface
│   ├── html/             # HTML pages
│   ├── javascript/       # JavaScript modules
│   ├── css/              # Stylesheets
│   └── assets/           # Images and icons
└── .env                  # Environment configuration (create this file)
```

## Setup Instructions

### Backend Setup

1. **Create a Python virtual environment:**
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` file in the project root:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=apartment_service_system
   FLASK_ENV=development
   ```

4. **Ensure MySQL database exists:**
   - Database name: `apartment_service_system`
   - Use the schema from `backend/complete_schema.sql`

5. **Start the backend server:**
   ```bash
   python backend/app.py
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **No build step required** - Frontend uses vanilla JavaScript

2. **Open frontend in a browser:**
   - Open `frontend/html/landingpage.html` or any page
   - The frontend automatically detects the backend URL

3. **Frontend will connect to:**
   - `http://localhost:5000` (development)
   - Auto-detects based on hostname for production

## Configuration

### Environment Variables (.env file)

- `DB_HOST` - MySQL server hostname (default: localhost)
- `DB_USER` - MySQL user (default: root)
- `DB_PASSWORD` - MySQL password (required)
- `DB_NAME` - Database name (default: apartment_service_system)
- `FLASK_ENV` - Flask environment (default: development)

**⚠️ Security Note:** Never commit `.env` to version control. It's in `.gitignore`.

### Frontend API Configuration

The frontend automatically configures the API base URL:
- **Development:** `http://localhost:5000`
- **Production:** Uses the current host with port 5000

This is handled in `frontend/javascript/config.js` and automatically available as `window.API_BASE_URL` in all pages.

## Common Issues

### Database Connection Failed
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database exists: `apartment_service_system`

### Frontend Cannot Connect to Backend
- Ensure backend is running on `http://localhost:5000`
- Check browser console for errors
- Verify CORS is enabled (it is by default)

### Credentials Exposed in Source Code
- Old credentials were hardcoded in `db.py` - now loads from `.env`
- Never commit `.env` to git
- Always use environment variables for sensitive data

## API Endpoints

- `POST /login` - User login
- `POST /signup` - User registration
- `GET /bookings` - List bookings
- `POST /book-service` - Create new booking
- `GET /services` - List available services
- `GET /profile/<id>` - Get user profile
- `PUT /update-profile` - Update user profile

See individual route files in `backend/routes/` for full documentation.

## Technologies

**Backend:**
- Flask 3.1.3
- Flask-SocketIO 5.6.1
- MySQL with mysql-connector-python
- python-dotenv for environment configuration

**Frontend:**
- Vanilla JavaScript (no frameworks)
- HTML5 / CSS3
- Socket.IO client for real-time features

## Recent Fixes

1. **Credentials moved to environment variables** - DB credentials no longer hardcoded
2. **Centralized API URL configuration** - Frontend uses `config.js` for consistent API endpoint
3. **Added response validation** - Fetch calls now check `response.ok` before parsing JSON
4. **Added `.gitignore`** - Prevents accidental credential commits
5. **Created `requirements.txt`** - Better dependency management

## Deployment

For production deployment:

1. Update `.env` with production database credentials
2. Update frontend `config.js` or use environment detection
3. Enable HTTPS in production
4. Set `FLASK_ENV=production`
5. Use a production WSGI server (e.g., Gunicorn)
6. Consider using a reverse proxy (Nginx/Apache)

## Development

To contribute:

1. Create a new branch
2. Make changes
3. Test locally
4. Ensure `.env` and sensitive files are not included
5. Submit a pull request

---

**Last Updated:** May 2026  
**Status:** Actively maintained
