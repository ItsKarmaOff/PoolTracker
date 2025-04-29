# Pool Tracker API

## Description

Pool Tracker API is a backend application designed to manage student points during Epitech pools. It allows administrators to create teams, add students, assign points, and track team and student performance.

## Features

- Secure authentication (JWT)
- User management (students and administrators)
- Team management with color assignment
- Student points tracking
- Team and student rankings
- Points history
- RESTful API with documentation

## Prerequisites

- Node.js (version 14 or higher)
- MySQL (version 5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:ItsKarmaOff/PoolTracker.git
   cd PoolTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your information:
   ```
   HOST=localhost
   PORT=3000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=pool_tracker

   # JWT
   JWT_SECRET=your_very_secure_jwt_secret
   ```

4. Create the database (MySQL):
   ```sql
   CREATE DATABASE pool_tracker;
   ```

## Starting the Server

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The API will be accessible at: `http://localhost:3000` (or the address/port configured in your .env)

## Project Structure

```
server/
├── config/              # Configuration (database)
├── controllers/         # Controllers for business logic
├── middlewares/         # Middlewares (authentication, etc.)
├── models/              # Data models
├── routes/              # API routes
├── .env.example         # Example environment variables configuration
├── app.js               # Express application configuration
├── package.json         # Dependencies and npm scripts
└── server.js            # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/set-password` - Set/reset password
- `GET /api/auth/profile` - Get connected user profile

### Students
- `GET /api/students` - List all students (admin)
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create a student (admin)
- `PUT /api/students/:id` - Update a student (admin)
- `DELETE /api/students/:id` - Delete a student (admin)

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/with-points` - List teams with total score
- `GET /api/teams/:id` - Get team details
- `GET /api/teams/:id/students` - List students in a team
- `GET /api/teams/:id/top-students` - Top students in a team
- `POST /api/teams` - Create a team (admin)
- `PUT /api/teams/:id` - Update a team (admin)
- `DELETE /api/teams/:id` - Delete a team (admin)
- `POST /api/teams/:id/students` - Add a student to a team (admin)
- `DELETE /api/teams/:id/students/:userId` - Remove a student from a team (admin)

### Points
- `POST /api/points` - Assign points to a student (admin)
- `GET /api/points/summary` - Summary of points for all students (admin)
- `GET /api/points/user/:userId/history` - Points history for a student
- `GET /api/points/user/:userId/total` - Total points for a student

## Security

The API uses JWT (JSON Web Token) for authentication. Passwords are hashed using bcrypt. Different authorization levels are implemented:

- Public routes: login and first connection
- Protected routes: require a valid JWT token
- Admin routes: reserved for users with the "ADMIN" role
- Personal routes: accessible by the administrator or the concerned student

## First Start

On first startup, a default admin account is created:
- Email: admin@epitech.eu
- Password: admin123

**It is strongly recommended to change this password after the first login.**

## Development

### Installing development dependencies
```bash
npm install --save-dev nodemon
```

### Contribution
1. Create a branch for your feature
2. Commit your changes
3. Submit a pull request

## License

MIT © Christophe Vandevoir