# VoloLocal Backend API

A Node.js/Express backend service for connecting local service providers with customers. The platform enables users to request services, contractors to provide services, and admins to manage the entire ecosystem.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VoloLocal Backend API                      │
├─────────────────────────────────────────────────────────────────┤
│  📱 Client Apps  │  🌐 Admin Dashboard  │  👷 Contractor App    │
├─────────────────────────────────────────────────────────────────┤
│                        Express Server                          │
├─────────────────────────────────────────────────────────────────┤
│    Auth Routes    │   Service Routes   │   Lead Routes         │
│  User Management  │  Admin Controls    │ Contractor Management │
├─────────────────────────────────────────────────────────────────┤
│              Middleware & Authentication Layer                 │
├─────────────────────────────────────────────────────────────────┤
│                     Firebase Firestore                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### 👥 User Management
- User registration and authentication
- Profile management
- Role-based access control (User, Contractor, Admin)

### 🏢 Contractor System
- Contractor registration and approval workflow
- Status-based access control (Pending, Approved, Rejected, Suspended)
- Service category and area management
- Profile and availability management

### 📋 Service Management
- Dynamic service type creation
- Custom question templates for each service
- Template fields (budget, location, urgency, contact preferences)

### 🎯 Lead Generation System
- Lead creation with validation
- Lead filtering and analytics
- Multi-role lead access (Users, Contractors, Admins)
- Service-based lead matching

### 🔐 Security & Authentication
- Firebase Authentication
- JWT session management
- Role-based authorization
- Input validation and sanitization

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | User registration | Public |
| POST | `/login` | User login | Public |
| GET | `/profile` | Get user profile | Authenticated |
| POST | `/logout` | User logout | Authenticated |

### 👷 Contractor Authentication (`/api/contractor/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Contractor registration | Public |
| POST | `/login` | Contractor login | Public |
| GET | `/profile` | Get contractor profile | Contractor |
| PUT | `/profile` | Update contractor profile | Contractor |
| POST | `/logout` | Contractor logout | Contractor |
| GET | `/admin/contractors` | List all contractors | Admin |
| PATCH | `/admin/contractors/:id/status` | Update contractor status | Admin |

### 🛠️ Services (`/api/services`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all services | Public |
| GET | `/:serviceType/questions` | Get service questions | Public |
| POST | `/` | Create new service | Admin |
| PUT | `/:serviceType` | Update service questions | Admin |
| DELETE | `/:serviceType` | Delete service | Admin |

### 🎯 Leads (`/api/leads`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new lead | User, Admin |
| GET | `/` | Get user's leads | User |
| GET | `/filter` | Get filtered leads | User |
| GET | `/analytics` | Get lead analytics | User |
| GET | `/admin` | Get all leads | Admin |
| POST | `/contractor/bulk` | Get leads by service types | Approved Contractor |
| GET | `/:id` | Get specific lead | Authenticated |
| PATCH | `/:id` | Update lead | User |
| DELETE | `/:id` | Delete lead | User, Admin |

### 👤 Users (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/me` | Get current user profile | Authenticated |
| PUT | `/me` | Update user profile | Authenticated |
| DELETE | `/me` | Delete user account | Authenticated |

### 🔧 Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users | Admin |
| POST | `/users/:uid/role` | Update user role | Admin |

## 🗄️ Database Schema

### Collections Structure

```
📊 Firestore Collections:
├── 👥 users/
│   ├── uid (document ID)
│   ├── email, displayName, phone
│   ├── role: "user" | "admin"
│   └── timestamps
│
├── 👷 contractors/
│   ├── uid (document ID)
│   ├── email, displayName, phone, businessName
│   ├── serviceCategories[], serviceAreas[]
│   ├── licenseNumber, availability
│   ├── status: "pending" | "approved" | "rejected" | "suspended"
│   ├── approvedAt, approvedBy
│   └── timestamps
│
├── 🛠️ services/
│   ├── serviceType (document ID)
│   ├── questions[] (custom questions)
│   ├── templateFields[] (budget, location, urgent, etc.)
│   └── timestamps
│
└── 🎯 leads/
    ├── leadId (auto-generated)
    ├── userId, serviceType
    ├── responses{} (user answers)
    ├── templateData{} (budget, location, etc.)
    ├── status, priority
    └── timestamps
```

## 🔧 Environment Setup

### Prerequisites
- Node.js 18+
- Firebase Project
- Firestore Database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
PORT=3000
NODE_ENV=development
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
```

5. Add Firebase Admin SDK key:
```bash
# Place your Firebase service account key in:
config/sam_project_firebase_key.json
```

6. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📦 Dependencies

### Core Dependencies
- **express**: Web framework
- **firebase-admin**: Firebase Admin SDK
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **axios**: HTTP client
- **cookie-parser**: Cookie parsing middleware

### Development Dependencies
- **nodemon**: Development server with auto-reload

## 🔐 Authentication Flow

### User Registration/Login
```
1. Client sends email/password
2. Firebase Authentication validates credentials
3. Server creates custom JWT token
4. Token stored as HTTP-only cookie
5. Subsequent requests include token for authorization
```

### Contractor Approval Workflow
```
1. Contractor registers → Status: "pending"
2. Admin reviews contractor → Status: "approved"/"rejected"
3. Approved contractors can access leads
4. Rejected contractors receive error message
```

## 🛡️ Security Features

- **Firebase Authentication**: Industry-standard authentication
- **JWT Tokens**: Secure session management
- **HTTP-Only Cookies**: XSS protection
- **Role-Based Access Control**: Fine-grained permissions
- **Input Validation**: Data sanitization and validation
- **Error Handling**: Centralized error management

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* error details */ }
}
```

## 🚦 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🧪 Testing

### Manual Testing
```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Test contractor registration
curl -X POST http://localhost:3000/api/contractor/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"contractor@example.com","password":"password123","displayName":"Test Contractor","phone":"1234567890","businessName":"Test Business"}'
```

## 📈 Monitoring & Logging

- **Request Logging**: All API requests are logged
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **Security Logging**: Authentication and authorization events

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure Firebase credentials
- [ ] Set up HTTPS
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🔗 Related Projects

- **Frontend**: Customer-facing application
- **Admin Dashboard**: Management interface
- **Contractor App**: Service provider interface

---

**Built with ❤️ for connecting local communities**
