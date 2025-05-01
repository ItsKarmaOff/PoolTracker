# Pool Tracker - Client

## Description

Pool Tracker Client is the frontend application for the Pool Tracker system, designed to manage student points and team performance during Epitech pools. This React-based application provides an intuitive interface for administrators, APEs, AERs, and students to interact with the system based on their respective permissions.

## Technologies

- React 18
- React Router v6
- Axios for API communication
- React Toastify for notifications
- CSS for styling (custom components)

## Features

- **Role-based access control**: Different interfaces and permissions for ADMIN, APE, AER, and STUDENT roles
- **Authentication system**: Login with first-time password setup
- **Dashboard**: Overview of team rankings and performance
- **Team management**: Create, update, and manage teams with student assignments
- **Points system**: Assign and track points for students
- **User management**: Admin interface for managing users and their roles
- **Student profiles**: Personal dashboard showing points history and team information

## Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── pages/           # Page components
│   │   └── admin/       # Admin-specific pages
│   ├── services/        # API services
│   ├── App.css          # Global styles
│   ├── App.jsx          # Main application component
│   ├── Routes.js        # Application routes
│   └── index.jsx        # Entry point
├── package.json         # Dependencies and scripts
└── README.md            # Documentation
```

## Installation

1. Make sure you have Node.js (v14+) installed
2. Clone the repository
3. Navigate to the client directory:
   ```
   cd PoolTracker/client
   ```
4. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Development Mode
```
npm start
```
The application will be available at http://localhost:3000 and will proxy API requests to http://localhost:3001.

### Production Build
```
npm run build
```
This command creates a production-ready build in the `build` directory.

## Usage

### User Roles

- **ADMIN**: Full access to all features, can manage all users and their roles
- **APE**: Can manage teams, students, and points; cannot manage ADMIN or other APE accounts
- **AER**: Can only manage points for students
- **STUDENT**: Can view their profile and team information

### Key Pages

- **Home**: Displays team rankings and top students
- **Login**: Authentication page with support for first-time login
- **Profile**: Student's personal dashboard
- **Admin/Students**: Manage student accounts
- **Admin/Teams**: Manage teams and team membership
- **Admin/Points**: Assign and manage points
- **Admin/Users**: Manage user accounts and roles (ADMIN only)

## Configuration

The application is configured to connect to the backend API using a proxy defined in `package.json`:

```json
"proxy": "http://localhost:3001"
```

Change this value if your backend is running on a different port or host.

## Notes

- The application uses JWT tokens for authentication, stored in localStorage
- All API requests are intercepted to include the authentication token
- Role-based component rendering ensures users only see what they have permission to access