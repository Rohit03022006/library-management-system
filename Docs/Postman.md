# Library Management System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except login/register require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### Register User
**POST** `/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "membershipId": "MEM123456789"
  }
}
```

### Login User
**POST** `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "membershipId": "MEM123456789",
    "avatar": "avatar_url"
  }
}
```

---

## 2. Books Management

### Get All Books
**GET** `/books`
**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `search` - Search in title, author, ISBN
- `genre` - Filter by genre

**Response:**
```json
{
  "books": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### Advanced Search
**GET** `/books/search`
**Query Parameters:**
- `search` - Search in title, author, description
- `genre` - Filter by genre
- `author` - Filter by author
- `yearFrom`, `yearTo` - Filter by publication year
- `status` - available|unavailable|maintenance
- `language` - Filter by language
- `tags` - Filter by tags (comma-separated)
- `page`, `limit`, `sortBy`, `sortOrder`

### Get Single Book
**GET** `/books/:id`

### Get Book QR Code
**GET** `/books/:id/qr-code`
**Returns:** QR code image for book location

### Get Book Analytics
**GET** `/books/analytics/overview`
**Required Role:** admin, librarian

### Create Book
**POST** `/books`
**Required Role:** admin, librarian
**Content-Type:** `multipart/form-data` or `application/json`
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "genre": "Fiction",
  "publishedYear": 1925,
  "publisher": "Scribner",
  "description": "A classic novel...",
  "totalCopies": 5,
  "availableCopies": 5,
  "location": {
    "shelf": "A",
    "row": 1,
    "position": 1,
    "section": "Classics"
  },
  "tags": ["classic", "fiction"],
  "language": "English",
  "coverImage": "file" // for form-data upload
}
```

### Update Book
**PUT** `/books/:id`
**Required Role:** admin, librarian
```json
{
  "title": "Updated Title",
  "author": "Updated Author",
  "totalCopies": 10
}
```

### Update Book Cover
**PATCH** `/books/:id/cover`
**Required Role:** admin, librarian
**Content-Type:** `multipart/form-data`

### Delete Book
**DELETE** `/books/:id`
**Required Role:** admin

---

## 3. Borrow Management

### Get Borrow Records
**GET** `/borrow`
**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page  
- `status` - borrowed|returned|overdue
- `userId` - Filter by user ID

**Response:**
```json
{
  "borrowRecords": [
    {
      "_id": "borrow_id",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "membershipId": "MEM123456789",
        "avatar": "avatar_url"
      },
      "book": {
        "title": "Book Title",
        "author": "Book Author",
        "isbn": "1234567890",
        "coverImage": "cover_url"
      },
      "borrowDate": "2023-01-01T00:00:00.000Z",
      "dueDate": "2023-01-15T00:00:00.000Z",
      "returnDate": null,
      "status": "borrowed",
      "fineAmount": 0
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25
}
```

### Borrow a Book
**POST** `/borrow/borrow`
**Required Role:** admin, librarian
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "bookId": "64f1a2b3c4d5e6f7a8b9c0d2", 
  "dueDate": "2023-12-31"
}
```

**Response:**
```json
{
  "message": "Book borrowed successfully",
  "borrowRecord": {
    // full borrow record with populated user and book
  }
}
```

### Return a Book
**PATCH** `/borrow/return/:borrowId`
**Required Role:** admin, librarian

**Response:**
```json
{
  "message": "Book returned successfully",
  "borrowRecord": {
    // updated borrow record with return date and any fines
  }
}
```

---

## 4. Users Management

### Get User Profile (Current User)
**GET** `/users/profile`

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "membershipId": "MEM123456789",
    "phone": "1234567890",
    "address": "123 Main St",
    "avatar": "avatar_url",
    "isActive": true
  },
  "currentBorrows": [...],
  "borrowHistory": [...]
}
```

### Update User Profile
**PUT** `/users/profile`
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": "456 Oak St",
  "avatar": "new_avatar_url"
}
```

### Get All Users
**GET** `/users`
**Required Role:** admin, librarian
**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `search` - Search in name, email, membershipId
- `role` - Filter by role
- `status` - active|inactive

### Get User Stats
**GET** `/users/stats`
**Required Role:** admin, librarian

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 145,
  "adminUsers": 2,
  "librarianUsers": 5,
  "memberUsers": 143,
  "usersWithActiveBorrows": 47
}
```

### Get User by ID
**GET** `/users/:id`
**Required Role:** admin, librarian

### Update User
**PUT** `/users/:id`
**Required Role:** admin, librarian
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "9876543210",
  "address": "456 Oak St",
  "isActive": true
}
```

### Delete User
**DELETE** `/users/:id`
**Required Role:** admin

### Deactivate User
**PATCH** `/users/:id/deactivate`
**Required Role:** admin

### Activate User
**PATCH** `/users/:id/activate`
**Required Role:** admin

---

## 5. Password Reset Endpoints

### Request Password Reset
**POST** `/auth/forgot-password`
```json
{
  "email": "user@example.com"
}
```

### Reset Password
**POST** `/auth/reset-password`
```json
{
  "token": "reset_token_from_email",
  "newPassword": "new_password_123"
}
```

---

## 6. System Endpoints

### Health Check
**GET** `/health`

**Response:**
```json
{
  "success": true,
  "message": " Library Management System API is running!",
  "environment": "development",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Root Endpoint
**GET** `/`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": "Email must be a valid email address"
}
```

### 401 Unauthorized
```json
{
  "error": "No token, authorization denied"
}
```

```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Book not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

```json
{
  "error": "ISBN already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error creating book"
}
```

---

## Role-Based Access Control
| Endpoint                    | Method | Admin | Librarian | Member | Public |
| --------------------------- | ------ | ----- | --------- | ------ | ------ |
| `/auth/register`            | POST   | yes   | yes       | yes    | yes    |
| `/auth/login`               | POST   | yes   | yes       | yes    | yes    |
| `/books`                    | GET    | yes   | yes       | yes    | yes    |
| `/books/search`             | GET    | yes   | yes       | yes    | yes    |
| `/books/:id`                | GET    | yes   | yes       | yes    | yes    |
| `/books/:id/qr-code`        | GET    | yes   | yes       | yes    | yes    |
| `/books`                    | POST   | yes   | yes       | no     | no     |
| `/books/:id`                | PUT    | yes   | yes       | no     | no     |
| `/books/:id/cover`          | PATCH  | yes   | yes       | no     | no     |
| `/books/:id`                | DELETE | yes   | no        | no     | no     |
| `/books/analytics/overview` | GET    | yes   | yes       | no     | no     |
| `/borrow`                   | GET    | yes   | yes       | yes    | no     |
| `/borrow/borrow`            | POST   | yes   | yes       | no     | no     |
| `/borrow/return/:id`        | PATCH  | yes   | yes       | no     | no     |
| `/users/profile`            | GET    | yes   | yes       | yes    | no     |
| `/users/profile`            | PUT    | yes   | yes       | yes    | no     |
| `/users`                    | GET    | yes   | no        | no     | no     |
| `/users/stats`              | GET    | yes   | yes       | no     | no     |
| `/users/:id`                | GET    | yes   | yes       | no     | no     |
| `/users/:id`                | PUT    | yes   | yes       | no     | no     |
| `/users/:id`                | DELETE | yes   | no        | no     | no     |
| `/users/:id/deactivate`     | PATCH  | yes   | no        | no     | no     |
| `/users/:id/activate`       | PATCH  | yes   | no        | no     | no     |

---

## Query Examples

### Pagination with Search
```
GET /books?page=2&limit=15&search=harry&genre=Fantasy
```

### Advanced Book Search
```
GET /books/search?author=Tolkien&yearFrom=1950&yearTo=2000&tags=fantasy,adventure&sortBy=publishedYear&sortOrder=desc
```

### Filter Borrow Records
```
GET /borrow?status=borrowed&userId=64f1a2b3c4d5e6f7a8b9c0d1&page=1&limit=20
```

### User Management
```
GET /users?role=member&status=active&search=john&page=1&limit=10
```

---

## Headers Example

```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// For file uploads:
Content-Type: multipart/form-data
```

## File Upload
- Maximum file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Field name: `coverImage`

---

## Success Response Format
```json
{
  "message": "Operation successful",
  "data": { ... }, // optional
  "token": "..." // for auth endpoints
}
```
