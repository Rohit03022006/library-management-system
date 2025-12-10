# Library Management System - Complete Setup Guide
A comprehensive, production-ready library management platform with a robust backend API and modern responsive frontend for managing library operations with advanced features including user authentication, book catalog management, borrowing system, and analytics.
## Application Screenshots
 1. Landing Page
 ![Landing Page]([https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=600&fit=crop](https://github.com/Rohit03022006/library-management-system/blob/main/Screenshot/Home.PNG?raw=true))
 
## Features

- **User Management**: Registration, authentication, profile management and role-based access control (admin, librarian, member)
- **Book Catalog**: Full CRUD for books, advanced search, filtering, pagination and cover images
- **Borrowing System**: Borrow/return workflows, due dates, automatic fine calculation and borrow limits
- **Image Management**: Cloudinary integration for uploading and serving optimized book covers
- **QR Codes**: Generate location-based QR codes for physical book tracking
- **Analytics**: Inventory, borrowing statistics and user activity reports
- **Security**: JWT authentication, password hashing, input validation, rate limiting and security headers
- **Validation & Error Handling**: Joi schemas, request sanitization and global error handler
- **Frontend**: React + Vite application with Tailwind CSS, protected routes, dashboards and responsive UI


## Quick Start

### 1. Clone the Repository
```bash
# Clone the full project (both frontend and backend)
git clone <repository-url>
cd library-management-system
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB and Cloudinary credentials

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
# Open a new terminal
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
# Frontend runs on http://localhost:5173
```

## Backend Setup (Detailed)

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- npm or yarn

### Step-by-Step Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd library-management-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_db
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   
   # Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Library settings
   FINE_PER_DAY=5
   MAX_BORROW_DAYS=14
   MAX_BOOKS_PER_USER=5
   ```

4. **Seed initial data (optional)**
   ```bash
   # Create a seed script or use MongoDB Compass to add initial data
   ```

5. **Start the backend server**
   ```bash
   npm run dev    # Development with nodemon
   # OR
   npm start      # Production
   ```

6. **Verify backend is running**
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok","message":"Server is running"}
   ```

## Frontend Setup (Detailed)

### Prerequisites
- Node.js v16+
- Backend server running on port 5000

### Step-by-Step Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd library-management-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file (optional - defaults work for local development):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

5. **Build for production**
   ```bash
   npm run build    # Creates optimized production build
   npm run preview  # Preview production build locally
   ```

## API Testing Examples

### Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@library.com",
    "password": "Admin123!",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "password": "Admin123!"
  }'

# Save the JWT token from response for protected endpoints
```

### Test Book Operations
```bash
# Get all books (public endpoint)
curl http://localhost:5000/api/books

# Create a book (requires authentication)
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "genre": "Classic",
    "publishedYear": 1925,
    "totalCopies": 5,
    "availableCopies": 5
  }'
```

## Sample Data

### Create Sample Books (via API or MongoDB)
```javascript
// Sample book data
const sampleBooks = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    genre: "Fiction",
    publishedYear: 1960,
    totalCopies: 3,
    availableCopies: 3,
    description: "A novel about racial injustice and moral growth."
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    genre: "Dystopian",
    publishedYear: 1949,
    totalCopies: 4,
    availableCopies: 4,
    description: "A dystopian social science fiction novel."
  }
];
```

## Common Issues & Solutions

### 1. MongoDB Connection Error
**Problem**: `MongooseError: connect ECONNREFUSED`
**Solution**:
- Check if MongoDB is running locally: `mongod --version`
- For MongoDB Atlas: Ensure IP is whitelisted and credentials are correct
- Verify connection string in `.env`

### 2. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**:
- Ensure CORS_ORIGIN in backend `.env` matches frontend URL
- Backend default: `http://localhost:5173`
- Frontend runs on: `http://localhost:5173`

### 3. JWT Authentication Issues
**Problem**: `401 Unauthorized` on protected routes
**Solution**:
- Ensure token is included in Authorization header
- Format: `Authorization: Bearer <token>`
- Check if token expired (default 7 days)

### 4. Cloudinary Upload Errors
**Problem**: Image upload fails
**Solution**:
- Verify Cloudinary credentials in `.env`
- Ensure images are under 10MB
- Check file format (jpg, png, webp supported)

## Development Workflow

### 1. Start Both Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Access Applications
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:5173

### 3. Create Test Users
Use the registration endpoint to create users with different roles:
- Admin: Full access
- Librarian: Manage books and borrowing
- Member: Browse and borrow books

## Production Deployment

### Backend Deployment (e.g., Render, Railway, AWS)
1. Set environment variables in hosting platform
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Configure CORS for your frontend domain

### Frontend Deployment (e.g., Vercel, Netlify)
1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-url/api`

## Testing

### Backend Tests
```bash
cd backend
npm test        # Run tests
npm run test:coverage  # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test        # Run tests
```


```bash
# Clone repository
git clone <repository-url>
cd library-management-system

# Create new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to repository
git push origin feature/new-feature

# Create pull request on GitHub
```

## Maintenance

### Regular Tasks
1. **Database Backup**: Regular MongoDB backups
2. **Log Monitoring**: Check server logs for errors
3. **Security Updates**: Update dependencies regularly
4. **Performance Monitoring**: Monitor API response times

### Database Maintenance
```bash
# Check database size
# MongoDB Atlas provides monitoring dashboard
# Or use mongosh for local MongoDB

# Index optimization
db.books.createIndex({ title: "text", author: "text" })
db.users.createIndex({ email: 1 }, { unique: true })
```

## Support & Troubleshooting

### Quick Checks
1. **Both servers running?**
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:5173

2. **Database connected?**
   - Check MongoDB connection in backend logs

3. **CORS configured correctly?**
   - Backend .env: CORS_ORIGIN=http://localhost:5173

4. **JWT token valid?**
   - Check token expiration and format

### Debug Mode
```bash
# Backend with verbose logging
cd backend
DEBUG=express:* npm run dev

# Frontend with dev tools
# Browser DevTools → Network tab to see API requests
```

This balanced setup ensures both frontend and backend work together seamlessly with proper separation of concerns and easy development workflow.
