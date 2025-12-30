# Job Tracker – Full-Stack Web Application

A production-ready job tracking application that enables users to securely manage job applications and receive AI-generated interview insights.

This project demonstrates backend engineering fundamentals including authentication, authorization, database design, and third-party API integration.

---

## 🔹 Key Features

- Secure user authentication using **JWT stored in HTTP-only cookies**
- Role-independent authorization with protected routes
- CRUD operations for job applications
- Application status tracking (Applied, Interview, Rejected, etc.)
- AI-generated interview preparation insights using **Google Gemini**
- Server-side rendering with EJS
- Fully deployed with managed PostgreSQL on **Render**

---

## 🔹 Tech Stack

**Backend**
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt (password hashing)

**Frontend**
- EJS (Server-Side Rendering)
- HTML, CSS
- Axios

**AI Integration**
- Google Gemini API

**Deployment**
- Render (Web Service + PostgreSQL)

---

## 🔹 Architecture Overview

- RESTful API for authentication and job management
- Separation of concerns between API layer and frontend routes
- Stateless authentication using JWT
- Secure cookie handling with HTTP-only cookies
- Parameterized SQL queries to prevent SQL injection

---

## 🔹 Authentication Flow

1. User logs in via frontend route
2. Backend API validates credentials
3. JWT is generated and returned
4. Frontend stores JWT in an HTTP-only cookie
5. Protected routes are guarded using middleware

---

## 🔹 Live Demo

🔗 **Live Application**  
https://job-tracker-1pce.onrender.com

---

## 🔹 Environment Variables

The application uses environment-based configuration:

