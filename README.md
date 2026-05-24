# Apartment Service Booking and Management System

A service-based booking and management system for apartment complexes built with Flask backend and vanilla JavaScript frontend.

## Project Structure

```text
.
├── backend/                              # Flask REST API Backend
│   ├── routes/                           # API Route Handlers
│   │   ├── __init__.py                   # Package initialization for routing blueprint
│   │   ├── admins.py                     # Routes for admin dashboard, stats, and provider management
│   │   ├── auth.py                       # User authentication routes (sign up, log in, status, profiles)
│   │   ├── bookings.py                   # Service booking routes (creation, tracking, history)
│   │   ├── complaints.py                 # Ticketing and support complaints routes
│   │   ├── notifications.py              # User notifications endpoints
│   │   ├── services.py                   # Services directory / services list endpoints
│   │   └── users.py                      # User information management routes
│   ├── app.py                            # Flask application main entry point
│   ├── complete_schema.sql               # Reference SQL script with full database schema (MySQL)
│   ├── db.py                             # Database connection setup & connection pooling
│   └── socketio_instance.py              # Socket.IO main server initialization
├── frontend/                             # Vanilla CSS, HTML, and JS Frontend
│   ├── assets/                           # Images and Icons for Service Offerings
│   │   ├── ac service.png                # Asset for AC service listings
│   │   ├── apartment.jpg                 # Background image for the application landing page
│   │   ├── carpentering.png              # Asset for carpentry service listings
│   │   ├── cleaning.png                  # Asset for cleaning service listings
│   │   ├── electrical.png                # Asset for electrical service listings
│   │   ├── monitoring.png                # Asset for monitoring panels
│   │   ├── painting.png                  # Asset for painting service listings
│   │   └── plumber.png                   # Asset for plumbing service listings
│   ├── css/                              # Page-Specific Styling
│   │   ├── ProviderProfile.css           # Styling for Service Provider profiles
│   │   ├── Resident.css                  # Global resident styling components
│   │   ├── ResidentProfile.css           # Styling for Resident profile editor
│   │   ├── admin_bookings.css            # Styling for Admin bookings overview
│   │   ├── admin_complaints.css          # Styling for Admin complaints resolution console
│   │   ├── admin_dark.css                # Admin console dark-theme variables and styles
│   │   ├── admin_dashboard.css           # Grid layouts for the main Admin dashboard
│   │   ├── admin_monitoring.css          # Styling for Admin system/activity monitoring
│   │   ├── admin_providers.css           # Styling for Admin service provider details
│   │   ├── admin_residents.css           # Styling for Admin resident directory
│   │   ├── admin_roles.css               # Styling for Admin user role control panel
│   │   ├── announcements.css             # Styling for complex announcements interface
│   │   ├── landing.css                   # Styling for landing and greeting interfaces
│   │   ├── login.css                     # Styling for login pages
│   │   ├── mybookings.css                # Styling for "My Bookings" user panels
│   │   ├── notifications.css             # Styling for in-app alert lists
│   │   ├── providerdashboard.css         # Styling for Provider job dashboards
│   │   ├── servicebooking.css            # Styling for scheduling/booking screens
│   │   ├── servicerequests.css           # Styling for incoming service job panels
│   │   ├── settings.css                  # Styling for application configuration controls
│   │   ├── theme.css                     # Main CSS theme definitions, colors, and layout variables
│   │   ├── updatejobstatus.css           # Styling for status update modals
│   │   └── users.css                     # General user dashboard layouts
│   ├── html/                             # Client-side Views/Screens
│   │   ├── JobHistory.html               # Provider view for past completed service jobs
│   │   ├── ProviderDashboard.html        # Main landing interface for logged-in Service Providers
│   │   ├── ProviderProfile.html          # Profile settings management for Service Providers
│   │   ├── ResidentDashboard.html        # Main landing interface for logged-in Residents
│   │   ├── ResidentProfile.html          # Profile settings management for Residents
│   │   ├── ServiceRequests.html          # Service Provider interface for pending and active jobs
│   │   ├── UpdateJobStatus.html          # Service Provider status manager panel for ongoing jobs
│   │   ├── admin_complaints.html         # Admin view for reviewing resident issues/complaints
│   │   ├── admin_dashboard.html          # Core administrative dashboard hub page
│   │   ├── admin_monitoring.html         # Live activity, usage and status console
│   │   ├── admin_profile.html            # Profile configuration panel for admins
│   │   ├── admin_providers.html          # Admin tool for editing and verifying providers
│   │   ├── admin_roles.html              # Admin panel for modifying user system levels/roles
│   │   ├── announcements.html            # Board for apartment-wide notification banners
│   │   ├── landingpage.html              # Main welcome entry point page for visitors
│   │   ├── login.html                    # Unified login form for residents, providers, and admins
│   │   ├── mybookings.html               # Resident service bookings tracker
│   │   ├── notifications.html            # Real-time message/alert repository page
│   │   ├── provider_notifications.html   # Provider-tailored notification panel
│   │   ├── provider_support.html         # Helpdesk ticket center for providers
│   │   ├── resident_support.html         # Helpdesk ticket center for residents
│   │   ├── servicebooking.html           # Multi-step booking configuration page
│   │   ├── settings.html                 # Central settings panel for themes/passwords
│   │   ├── signup.html                   # Universal user registration form
│   │   └── users.html                    # Main user dashboard grid overview
│   └── javascript/                       # Client-side Logic and Interactions
│       ├── admin_bookings.js             # Controls for the admin bookings explorer
│       ├── admin_common.js               # Common script functions shared across admin utilities
│       ├── admin_complaints.js           # Logic to fetch, filter, and resolve complaints
│       ├── admin_dashboard.js            # Controller for main admin board charts and summaries
│       ├── admin_monitoring.js           # Live data handlers for system diagnostics dashboard
│       ├── admin_profile.js              # Admin account details binding and update handling
│       ├── admin_providers.js            # Controller for verifying and editing providers
│       ├── admin_residents.js            # Controls for listing and managing residents
│       ├── admin_roles.js                # Logic to assign, edit, and audit system roles
│       ├── announcements.js              # Logic for displaying and creating announcements
│       ├── auth.js                       # Authentication helper routines (token verification, logout)
│       ├── config.js                     # Global API address endpoints definition (window.API_BASE_URL)
│       ├── header.js                     # Dynamic header/navigation menu injection script
│       ├── jobhistory.js                 # Handler for rendering historical provider tasks
│       ├── landing.js                    # Landing page interactivity and scroll bindings
│       ├── mybookings.js                 # Resident bookings listing, filtering, and cancel options
│       ├── notifications.js              # Real-time WebSocket connection to notifications hub
│       ├── provider_profile.js           # Binding and updating provider specific details
│       ├── providerdashboard.js          # Operations for active provider panels
│       ├── resident_dashboard.js         # Controls for resident home widgets
│       ├── resident_profile.js           # Binding and updating resident specific details
│       ├── resident_support.js           # logic to file and check resident helpdesk tickets
│       ├── servicebook.js                # Core API submission scripts for bookings
│       ├── servicebooking.js             # Booking layout form helper logic and calculations
│       ├── servicerequests.js            # Controls for rendering pending provider requests
│       ├── settings.js                   # Handles application preferences modifications
│       ├── theme.js                      # Handles dark-theme switching state persisting
│       ├── updatejobstatus.js            # Helper logic to update task status
│       └── users.js                      # Admin user explorer data management
├── .env                                  # Local environment configuration secrets (ignored by git)
├── .gitignore                            # Specifier list for untracked files and folders
├── README.md                             # Detailed project documentation and setup manual (this file)
└── requirements.txt                      # List of backend Python dependencies
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
