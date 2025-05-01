# Pool Tracker

A comprehensive pool tracking system designed to manage student points and team performance during Epitech pools.

## Description

PoolTracker is a full-stack web application that allows administrators, pedagogical team members, and assistants to track and manage student performance during Epitech pools. The system features role-based access control, team management, point assignment, and detailed performance tracking for students and teams.

## Key Features

- **Role-Based Access System**: Four distinct user roles (ADMIN, APE, AER, STUDENT) with appropriate permission levels
- **User Management**: Create, edit, and manage user accounts with role assignment
- **Team System**: Organize students into teams with customizable colors and descriptions
- **Points Tracking**: Assign positive or negative points to students with reasons
- **Performance Dashboard**: View team rankings and student performances
- **Student Profiles**: Individual performance tracking and point history

## Technology Stack

- **Frontend**: React, React Router, Axios, CSS
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
PoolTracker/
├── client/              # React frontend application
├── server/              # Node.js backend API
├── .gitignore           # Git ignore rules
├── LICENSE              # MIT License
└── README.md            # This file
```

## Installation

### Prerequisites

- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```
   cd PoolTracker/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file with your database credentials and other settings.

4. Create the database:
   ```sql
   CREATE DATABASE pool_tracker;
   ```

5. Start the server:
   ```
   npm run dev
   ```
   The API will be available at http://localhost:3001

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd PoolTracker/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Usage

### Default Admin Account

On the first startup, a default admin account is created:
- Email: admin@epitech.eu
- Password: admin123

**It is strongly recommended to change this password after the first login.**

### User Roles

1. **ADMIN**: Full access to all features, can manage all users
2. **APE (Assistant Pédagogique Epitech)**: Can manage teams, students, and points
3. **AER (Assistant Étudiant Référent)**: Can only manage points for students
4. **STUDENT**: Can view their profile and team information

## Documentation

- [Backend API Documentation](server/README.md)
- [Frontend Documentation](client/README.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Epitech for inspiring this project
- All contributors who have helped improve this system