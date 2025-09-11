# User Management System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

## 📋 Description

User management system developed with NestJS, offering complete authentication and user CRUD functionality. The project implements JWT authentication, data validation, password encryption, and a robust RESTful API.

## 🚀 Features

- **JWT Authentication**: Secure login system with JWT tokens
- **User CRUD**: Complete create, read, update, and delete operations
- **Data Validation**: Robust validation with class-validator
- **Encryption**: Passwords encrypted with bcrypt
- **Database**: MySQL integration using TypeORM
- **Migrations**: Migration system for schema control
- **User Profile**: Protected endpoints for profile management

## 🛠️ Technologies Used

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Encryption**: bcrypt
- **Testing**: Jest

## 📋 API Endpoints

### Authentication

**POST** `/auth/login` – Returns JWT token

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "<jwt_token_here>"
}
```

---

### Users

| Method | Endpoint       | Description                  |
|--------|----------------|------------------------------|
| POST   | `/users`       | Create a new user            |
| GET    | `/users`       | List all users               |
| GET    | `/users/:id`   | Get user by ID               |
| PUT    | `/users/:id`   | Update a specific user       |
| DELETE | `/users/:id`   | Delete a specific user       |

---

### Authenticated Profile

| Method | Endpoint     | Description                  |
|--------|--------------|------------------------------|
| GET    | `/users/me`  | Get info of logged-in user   |
| PUT    | `/users/me`  | Update info of logged-in user |

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

⭐ If this project was helpful to you, consider giving it a star!