# VoloLocal

VoloLocal is a full-stack platform designed to connect local service providers (contractors) with customers, featuring a robust backend API and a modern frontend web application.

## 🚀 What is VoloLocal?

VoloLocal enables users to request services (like cleaning, plumbing, electrical, car detailing, etc.), contractors to offer their expertise, and admins to manage the ecosystem. The platform supports secure payments, lead generation, and a credit-based system for contractors to purchase leads.

---

## 🏗️ Architecture Overview

- **Backend:** Node.js/Express REST API, Firebase Firestore, Stripe integration
- **Frontend:** React (Vite) SPA for users, contractors, and admins

```
┌─────────────────────────────────────────────────────────────────┐
│                     VoloLocal Platform                         │
├─────────────────────────────────────────────────────────────────┤
│  📱 Frontend (React)  │  🌐 Backend (Express/Firebase/Stripe)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 👥 User Management
- Registration, authentication (Firebase)
- Profile management
- Role-based access (User, Contractor, Admin)

### 👷 Contractor System
- Registration, approval workflow
- Service category/area management
- Credit-based lead purchasing
- Transaction history

### 💳 Payment System
- Stripe integration for credit purchases
- Secure checkout and webhook-based confirmation
- Real-time transaction updates

### 📋 Service & Lead Management
- Dynamic service types and custom questions
- Lead creation, filtering, analytics
- Multi-role access and purchase tracking

### 🔐 Security
- JWT session management
- Role-based authorization
- Input validation and sanitization
- Stripe webhook signature verification

---

## 🛠️ Technical Stack

### Backend
- **Node.js/Express**: RESTful API
- **Firebase Firestore**: NoSQL database
- **Firebase Authentication**: Secure user management
- **Stripe**: Payment processing
- **Core Libraries**: express, firebase-admin, cors, dotenv, axios, cookie-parser, stripe

### Frontend
- **React**: SPA for users, contractors, admins
- **Vite**: Fast build tool
- **ESLint**: Code quality

---

## 📡 API Overview

- **Auth:** `/api/auth` (register, login, profile)
- **Contractor:** `/api/contractor/auth` (register, login, credits, transactions)
- **Payments:** `/api/payments` (purchase credits, Stripe webhook)
- **Services:** `/api/services` (list, create, update, delete)
- **Leads:** `/api/leads` (create, filter, purchase)
- **Users/Admin:** `/api/users`, `/api/admin`

See backend README for full endpoint details.

---

## 🗄️ Database Schema

- **users/**: User profiles, roles
- **contractors/**: Contractor profiles, credits, transactions, status
- **services/**: Service types, custom questions
- **leads/**: Lead details, purchase status

---

## ⚙️ Setup & Installation

### Backend

1. `cd Backend`
2. `npm install`
3. Configure `.env` (see Backend/README.md)
4. Add Firebase Admin SDK key to `config/`
5. `npm run dev` (development) or `npm start` (production)

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev` (development)

---

## 🧪 Testing

- Manual API testing via `curl` (see Backend/README.md)
- Stripe test cards for payment flow

---

## 🚦 Status Codes & Responses

- Standard REST status codes (200, 201, 400, 401, 403, 404, 500)
- Consistent success/error response format

---

## 🛡️ Security

- Firebase Authentication & JWT
- HTTP-only cookies
- Role-based access control
- Stripe webhook verification

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

---

## 📝 License

ISC License

---

**Built with ❤️ for connecting local communities**

---
