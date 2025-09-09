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

## 📦 Installation

### Prerequisites

- Node.js (version 18 or higher)
- MySQL (version 8.0 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd RID218399_Desafio07
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=database_name
DB_SYNC=true
DB_LOGGING=true

# Application Configuration
PORT=3000
JWT_SECRET=your_jwt_secret_here
```

4. **Run migrations**
```bash
npm run typeorm migration:run
```

5. **Start the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

### Authentication

#### POST `/auth/login`
Performs user login and returns JWT token.

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
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Users

#### POST `/users`
Creates a new user.

**Body:**
```json
{
  "name": "John Doe",
  "username": "john123",
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/users`
Lists all users (no authentication required).

#### GET `/users/:id`
Finds a specific user by ID.

#### PUT `/users/:id`
Updates a specific user.

**Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.new@example.com"
}
```

#### DELETE `/users/:id`
Removes a specific user.

### User Profile (Protected)

#### GET `/users/me`
Returns information about the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### PUT `/users/me`
Updates information for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "name": "New Name",
  "email": "new@example.com"
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode tests
npm run test:watch

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Available Scripts

```bash
# Development
npm run start:dev

# Production build
npm run build

# Start in production
npm run start:prod

# Linting
npm run lint

# Code formatting
npm run format

# TypeORM migrations
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
├── user/                # User module
│   ├── dto/             # Data Transfer Objects
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.entity.ts
│   └── user.module.ts
├── migrations/          # Database migrations
├── app.module.ts        # Main module
└── main.ts             # Entry file
```

## 🔒 Security

- Passwords are encrypted using bcrypt
- JWT authentication with secure tokens
- Input data validation
- Protected endpoints with guards
- Authorization headers required for sensitive routes

## 🚀 Deployment

### Production Environment Variables

```env
DB_SYNC=false
DB_LOGGING=false
NODE_ENV=production
```

### Production Build

```bash
npm run build
npm run start:prod
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 👨‍💻 Author

**RID218399** - Challenge 07

---

⭐ If this project was helpful to you, consider giving it a star!