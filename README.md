# Project Status
Track our development progress in the [Development Checklist](CHECKLIST.md). 

# Backend API Service

## Overview
A robust Node.js/Express backend API with TypeScript, featuring comprehensive user management, role-based access control, and administrative capabilities.

## Table of Contents
1. [Setup & Configuration](#setup--configuration)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Setup](#environment-setup)
   - [Project Structure](#project-structure)

2. [Authentication & Security](#authentication--security)
   - [JWT Authentication](#jwt-authentication)
   - [Role System](#role-system)
   - [Security Features](#security-features)
   - [Error Handling](#error-handling)

3. [User Management](#user-management)
   - [Registration & Login](#registration--login)
   - [Profile Management](#profile-management)
   - [Password Management](#password-management)

4. [File Management](#file-management)
   - [Profile Images](#profile-images)
   - [File Restrictions](#file-restrictions)
   - [Storage System](#storage-system)

5. [System Administration](#system-administration)
   - [User Administration](#user-administration)
   - [Role Management](#role-management)
   - [Suspension System](#suspension-system)

6. [API Reference](#api-reference)
   - [Authentication Endpoints](#authentication-endpoints)
   - [User Endpoints](#user-endpoints)
   - [Admin Endpoints](#admin-endpoints)
   - [File Upload Endpoints](#file-upload-endpoints)

7. [Development Guide](#development-guide)
   - [Available Scripts](#available-scripts)
   - [Development Setup](#development-setup)
   - [Error Handling](#error-handling)
   - [Best Practices](#best-practices)

## Setup & Configuration

### Prerequisites
- Node.js (v14+)
- MongoDB
- TypeScript
- npm/yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd [repository-name]

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Build the project
npm run build

# Start development server
npm run dev
```

### Environment Setup
```env
# Server Configuration
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database

# Security
JWT_SECRET=your-secret-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
UPLOAD_DIR=uploads/
```

### Project Structure
```plaintext
project-root/
├── src/
│   ├── config/
│   │   ├── environment.ts     # Environment configuration
│   │   └── database.ts        # Database configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── admin.routes.ts
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   └── email.utils.ts
│   └── index.ts
├── uploads/
│   └── profiles/             # User profile images
├── tests/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Authentication & Security

### JWT Authentication
The system uses JSON Web Tokens (JWT) for authentication. Each token contains:
- User ID
- Email
- Role
- Expiration time

### Role System

#### Available Roles
- **Owner**: Full system access
- **Admin**: User management and moderation
- **User**: Standard user access

#### Role Hierarchy
1. Owner
   - Can manage all users
   - Can create/manage admins
   - Cannot be suspended/deleted
2. Admin
   - Can manage regular users
   - Cannot manage other admins
   - Can be managed by owner
3. User
   - Basic access
   - Can be managed by admins and owner

### Security Features
- JWT Authentication
- Password Hashing
- Role-based Access Control
- File Upload Validation
- Input Sanitization
- Suspension System
- **Two-Factor Authentication**: Added for enhanced security.
- **Rate Limiting**: Implemented to prevent brute force attacks.
- **Device Tracking**: Monitors user devices for suspicious activity.
- **Helmet**: Implemented to set various HTTP headers for security, including:
  - **Content Security Policy**: Restricts the sources from which content can be loaded.
  - **Cross-Origin Resource Policy**: Set to `same-origin` to restrict access to the same origin.
  - **Referrer Policy**: Set to `no-referrer` to prevent sending referrer information.
  - **Strict-Transport-Security**: Enforces HTTPS for one year, including subdomains.
  - **X-Content-Type-Options**: Prevents MIME-sniffing.
  - **X-Frame-Options**: Prevents clickjacking by allowing framing only from the same origin.
  - **X-XSS-Protection**: Enabled to protect against cross-site scripting attacks.

- **Session Management**: Implemented using `express-session` to manage user sessions securely.
  - User ID is stored in the session upon successful login.
  - Sessions are cleared upon logout (if implemented).

- **Rate Limiting**: Implemented to prevent brute force attacks on authentication routes.
- **Two-Factor Authentication**: Added for enhanced security during user login.
- **Device Tracking**: Monitors user devices for suspicious activity.

### Error Handling

#### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

#### Error Response Examples
```json
# Authentication Error (401)
{
    "message": "Authentication Required",
    "error": "No token provided"
}

# Authorization Error (403)
{
    "message": "Access denied",
    "error": "Insufficient permissions"
}

# Validation Error (400)
{
    "message": "Validation failed",
    "error": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
    }
}
```

## User Management

### Registration & Login

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

Request:
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}

Response: (201 Created)
{
    "message": "User registered successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user"
    },
    "token": "jwt_token"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

Request:
{
    "email": "user@example.com",
    "password": "password123",
    "twoFactorToken": "123456",  // Optional for 2FA
    "isBackupCode": false         // Optional for backup code verification
}

Response: (200 OK)
{
    "message": "Login successful",
    "token": "jwt_token",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user"
    }
}
```

### Profile Management

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer jwt_token

Response: (200 OK)
{
    "message": "Profile retrieved successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "profileImage": "/uploads/profiles/image.jpg",
        "bio": "About me",
        "phoneNumber": "1234567890",
        "address": "123 Street"
    }
}
```

#### Update Profile
```http
PATCH /api/users/profile
Authorization: Bearer jwt_token
Content-Type: application/json

Request:
{
    "name": "New Name",
    "bio": "Updated bio",
    "phoneNumber": "9876543210",
    "address": "456 Avenue"
}

Response: (200 OK)
{
    "message": "Profile updated successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "New Name",
        "bio": "Updated bio",
        "phoneNumber": "9876543210",
        "address": "456 Avenue"
    }
}
```

## File Management

### Profile Images

#### Upload Profile Image
```http
POST /api/users/profile/image
Authorization: Bearer jwt_token
Content-Type: multipart/form-data

Request:
Form Data:
- file: [image file]

Response: (200 OK)
{
    "message": "Profile image uploaded successfully",
    "profileImage": "/uploads/profiles/profile-123456789.jpg"
}
```

### File Restrictions
- Supported formats: .jpg, .jpeg, .png, .gif
- Maximum file size: 5MB
- Automatic image optimization
- Secure file naming

### Storage System
- Base directory: `/uploads/profiles/`
- File naming pattern: `profile-{timestamp}-{random}.{ext}`
- Automatic cleanup of old files
- Secure file access control

## System Administration

### User Administration

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer jwt_token

Response: (200 OK)
{
    "message": "Users retrieved successfully",
    "users": [
        {
            "id": "user_id_1",
            "email": "user1@example.com",
            "name": "User One",
            "role": "user",
            "status": {
                "isActive": true
            }
        },
        {
            "id": "user_id_2",
            "email": "user2@example.com",
            "name": "User Two",
            "role": "admin",
            "status": {
                "isActive": false,
                "suspendedAt": "2023-01-01T00:00:00.000Z",
                "suspendedBy": {
                    "id": "admin_id",
                    "name": "Admin User"
                },
                "suspensionReason": "Violation of terms"
            }
        }
    ]
}
```

#### Get Specific User
```http
GET /api/admin/users/:id
Authorization: Bearer jwt_token

Response: (200 OK)
{
    "message": "User retrieved successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "user",
        "status": {
            "isActive": true
        },
        "profileImage": "/uploads/profiles/image.jpg",
        "phoneNumber": "1234567890",
        "address": "123 Street",
        "bio": "User bio",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
    }
}
```

### Role Management

#### Create Admin (Owner only)
```http
POST /api/admin/create-admin
Authorization: Bearer jwt_token
Content-Type: application/json

Request:
{
    "email": "newadmin@example.com",
    "password": "adminpass123",
    "name": "New Admin"
}

Response: (201 Created)
{
    "message": "Admin created successfully",
    "user": {
        "id": "admin_id",
        "email": "newadmin@example.com",
        "name": "New Admin",
        "role": "admin"
    }
}
```

#### Update User Role (Owner only)
```http
PATCH /api/admin/users/:id/role
Authorization: Bearer jwt_token
Content-Type: application/json

Request:
{
    "role": "admin"  // or "user"
}

Response: (200 OK)
{
    "message": "User role updated successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "admin"
    }
}
```

### Suspension System

#### Suspend User
```http
POST /api/admin/users/:id/suspend
Authorization: Bearer jwt_token
Content-Type: application/json

Request:
{
    "reason": "Violation of terms",
    "category": "VIOLATION",
    "duration": 7  // optional, in days
}

Response: (200 OK)
{
    "message": "User suspended successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "user",
        "status": {
            "isActive": false,
            "suspendedAt": "2023-01-01T00:00:00.000Z",
            "suspensionEnd": "2023-01-08T00:00:00.000Z",
            "suspensionCategory": "VIOLATION",
            "suspensionReason": "Violation of terms"
        }
    }
}
```

#### Reactivate User
```http
POST /api/admin/users/:id/reactivate
Authorization: Bearer jwt_token

Response: (200 OK)
{
    "message": "User reactivated successfully",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "user",
        "isActive": true
    }
}
```

## API Reference

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh token |

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PATCH | `/api/users/profile` | Update profile |
| POST | `/api/users/profile/image` | Upload profile image |
| DELETE | `/api/users/profile/image` | Delete profile image |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get specific user |
| POST | `/api/admin/create-admin` | Create admin (Owner) |
| PATCH | `/api/admin/users/:id/role` | Update user role |
| POST | `/api/admin/users/:id/suspend` | Suspend user |
| POST | `/api/admin/users/:id/reactivate` | Reactivate user |
| DELETE | `/api/admin/users/:id` | Delete user |

## Development Guide

### Available Scripts
```bash
npm run dev         # Start development server with hot-reload
npm run build      # Build TypeScript to JavaScript
npm run start      # Start production server
npm run test       # Run test suite
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Development Setup
1. **Database Setup**
   - Install MongoDB
   - Create database
   - Configure connection string in `.env`

2. **Email Configuration**
   - Set up Gmail account
   - Enable 2FA
   - Generate app password
   - Update `.env` with credentials

3. **File Storage**
   - Create uploads directory
   - Set proper permissions
   - Configure storage limits

### Best Practices

#### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Document with JSDoc comments
- Use meaningful variable names
- Keep functions small and focused

#### Security
- Never commit `.env` files
- Validate all inputs
- Sanitize file uploads
- Use proper CORS settings
- Implement rate limiting
- Log security events

#### Error Handling
- Use try-catch blocks
- Implement global error handler
- Log errors appropriately
- Return consistent error responses
- Handle edge cases

## Acknowledgments
- Node.js community
- Express.js team
- TypeScript team
- All contributors 

### Authentication

- **Login Endpoint**: 
  - **Method**: `POST`
  - **URL**: `/api/auth/login`
  - **Request Headers**:
    ```plaintext
    Content-Type: application/json
    Accept: application/json
    ```
  - **Request Body** (JSON):
    ```json
    {
        "email": "user@example.com",
        "password": "your_plain_text_password"
    }
    ```
  - **Response**:
    - On success:
      ```json
      {
          "message": "Login successful",
          "token": "your_jwt_token",
          "user": {
              "id": "user_id",
              "email": "user@example.com",
              "name": "User Name",
              "role": "user_role"
          }
      }
      ```
    - On failure:
      ```json
      {
          "message": "Invalid email or password"
      }
      ```

- **Logout Endpoint**: 
  - **Method**: `POST`
  - **URL**: `/api/auth/logout`
  - **Request Headers**:
    ```plaintext
    Content-Type: application/json
    Accept: application/json
    Authorization: Bearer <your_jwt_token> // If required
    ```
  - **Response**:
    - On success:
      ```json
      {
          "message": "Logout successful"
      }
      ```

