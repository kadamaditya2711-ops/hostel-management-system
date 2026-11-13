
# Hostel Management System

A Full-Stack Web-Based Hostel Management System developed as an academic project to simplify and digitize hostel management activities.

## Project Overview

The Hostel Management System is designed to manage hostel-related operations through a centralized web application.

The system supports different user roles such as Admin, Warden, and Student. It helps manage student information, hostel facilities, room allocation, fees, attendance, complaints, maintenance, notices, and visitor records.

The application is designed to support both boys' and girls' hostels.

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST APIs
- JSON Web Token (JWT)
- bcrypt

### Database
- PostgreSQL

### Development Tools
- Visual Studio Code
- pgAdmin
- Postman
- Google Chrome

## Main Features

### 1. User Authentication
- User Login
- Student Registration
- Role-Based Access Control
- Admin, Warden, and Student Roles

### 2. Student Management
- Add Student
- View Student Details
- Update Student Information
- Manage Student Status

### 3. Hostel Management
- Hostel Management
- Block Management
- Floor Management
- Room Management
- Bed Management

### 4. Room and Bed Allocation
- Bed Allocation
- Active Allocation Tracking
- Room Transfer Management

### 5. Fees and Payments
- Student Fee Records
- Payment Management
- Paid and Pending Fee Tracking
- Cash and Cheque Payment Records

### 6. Attendance Management
- Student Attendance Records
- Attendance Status Tracking

### 7. Complaint Management
- Student Complaints
- Complaint Status Tracking

### 8. Maintenance Management
- Maintenance Requests
- Maintenance Status Tracking

### 9. Additional Modules
- Notice Management
- Visitor Management
- Visitor Logs
- Student Check-in and Check-out
- Room Transfer History

### 10. Student Portal
- Student Dashboard
- Student Profile
- Hostel and Room Details
- Fee Information
- Attendance
- Complaints
- Maintenance
- Notices
- Visitor Information

## Project Structure

```text
Hostel-Management-System/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── HTML Pages
│
├── database/
│   └── Database SQL Files
│
├── README.md
└── .gitignore
```

## Installation and Setup

### Prerequisites

Install the following software:

- Node.js
- PostgreSQL
- pgAdmin
- Visual Studio Code
- Google Chrome or any modern web browser

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Open the Project

```bash
cd hostel-management-system
```

### Step 3: Setup Database

1. Start PostgreSQL.
2. Create a database named `hostel_management`.
3. Execute the database schema SQL script provided with the project.
4. Configure database connection settings in the backend environment.

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5: Configure Environment Variables

Create a `.env` file inside the backend folder.

Configure the database credentials and JWT secret according to the variable names used in the backend configuration.

Do not upload your actual `.env` file to GitHub.

### Step 6: Start the Backend Server

```bash
node server.js
```

The backend server runs at:

```text
http://localhost:5000
```

### Step 7: Run the Frontend

Open the frontend folder in Visual Studio Code and launch `index.html` using the Live Server extension.

## User Roles

| Role | Description |
|---|---|
| Admin | Manages the overall hostel system |
| Warden | Handles assigned hostel operations |
| Student | Accesses personal details and student services |

## Project Information

**Project Name:** Hostel Management System

**Project Type:** Academic / Demo Project

**Architecture:** Full-Stack Web Application

**Database:** PostgreSQL

## Future Enhancements

- Online Payment Gateway Integration
- Email and SMS Notifications
- Biometric Attendance
- Advanced Reports and Analytics
- Cloud Deployment

## Important Note

This project is developed for academic and demonstration purposes. Database configuration and environment variables must be provided before running the application.

## Author

Developed as an academic project.

**GitHub:** YOUR_GITHUB_PROFILE_LINK
