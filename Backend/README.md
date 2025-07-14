# VoloLocal Backend API

A Node.js/Express backend service for connecting local service providers with customers. The platform enables users to request services, contractors to provide services, and admins to manage the entire ecosystem with integrated payment processing.

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
│                   │  Stripe Payments   │   Credit System       │
├─────────────────────────────────────────────────────────────────┤
│              Middleware & Authentication Layer                 │
├─────────────────────────────────────────────────────────────────┤
│               Firebase Firestore  │  Stripe Payment Gateway    │
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
- **Credit-based lead purchasing system**
- **Credit balance management**
- **Transaction history tracking**

### 💳 Payment System
- **Stripe integration for credit purchases**
- **Secure checkout sessions**
- **Webhook-based payment confirmation**
- **Real-time transaction updates**
- **Credit purchase range: $20-$500 CAD**
- **1 CAD = 1 Credit conversion**
- **Comprehensive transaction audit trail**

### 📋 Service Management
- Dynamic service type creation
- Custom question templates for each service
- Template fields (budget, location, urgency, contact preferences)

### 🎯 Lead Generation System
- Lead creation with validation
- Lead filtering and analytics
- Multi-role lead access (Users, Contractors, Admins)
- Service-based lead matching
- **Lead pricing and purchase system**
- **Purchase tracking and analytics**

### 🔐 Security & Authentication
- Firebase Authentication
- JWT session management
- Role-based authorization
- Input validation and sanitization
- **Stripe webhook signature verification**
- **Secure payment processing**

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
| GET | `/credits` | Get contractor credits balance | Contractor |
| GET | `/transactions` | Get contractor transaction history | Contractor |
| GET | `/admin/contractors` | List all contractors | Admin |
| PATCH | `/admin/contractors/:id/status` | Update contractor status | Admin |
| POST | `/admin/contractors/:id/credits` | Add credits to contractor | Admin |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/purchase-credits` | Create Stripe checkout session | Approved Contractor |
| POST | `/stripe-webhook` | Handle Stripe webhook events | Stripe Webhook |

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
| PATCH | `/:leadId/price` | Set lead price | Admin |
| POST | `/:leadId/purchase` | Purchase a lead | Approved Contractor |
| POST | `/:leadId/purchase-with-credits` | Purchase lead with credits | Approved Contractor |
| GET | `/:leadId/purchase-status` | Check lead purchase status | Approved Contractor |

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
│   ├── credits (default: 0)
│   ├── purchasedLeads[] (lead IDs)
│   ├── transactions[] (transaction history)
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
    ├── price (default: 0)
    ├── purchaseCount (default: 0)
    ├── purchasedBy[] (contractor UIDs)
    └── timestamps
```

### Transaction Schema
```javascript
// Transaction Object Structure
{
  id: "txn_1234567890_abc123",
  type: "credit_purchase" | "credit_addition" | "lead_purchase",
  amount: 100, // Amount in CAD
  description: "Successful credit purchase - 100 CAD",
  status: "pending" | "completed" | "failed",
  timestamp: Date, // Creation time
  completedAt?: Date, // Completion time
  failedAt?: Date, // Failure time
  updatedAt?: Date, // Last update time
  metadata: {
    stripeSessionId?: "cs_...",
    stripePaymentIntentId?: "pi_...",
    stripeChargeId?: "ch_...",
    stripePaymentStatus?: "paid" | "failed",
    currency: "CAD",
    paymentMethod?: "card",
    amountReceived?: 100.00,
    error?: "Error message",
    failureReason?: "Failure details",
    adminId?: "admin_uid" // For manual credit additions
  }
}
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

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL for Stripe redirects
FRONTEND_URL=http://localhost:5173
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
- **stripe**: Stripe payment processing SDK

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

### Credit Purchase Flow
```
1. Contractor initiates credit purchase ($20-$500)
2. System creates transaction record (status: "pending")
3. Stripe checkout session created with transaction ID
4. Contractor completes payment on Stripe
5. Stripe webhook updates transaction (status: "completed")
6. Credits added to contractor account
7. Transaction history updated with payment details
```

### Webhook Security
```
1. Stripe sends webhook with signature
2. Server verifies webhook signature
3. Processes payment events securely
4. Updates transaction status accordingly
5. Handles retries and duplicate events
```

## 🛡️ Security Features

- **Firebase Authentication**: Industry-standard authentication
- **JWT Tokens**: Secure session management
- **HTTP-Only Cookies**: XSS protection
- **Role-Based Access Control**: Fine-grained permissions
- **Input Validation**: Data sanitization and validation
- **Error Handling**: Centralized error management
- **Stripe Webhook Verification**: Cryptographic signature validation
- **Payment Security**: PCI-compliant payment processing
- **Transaction Integrity**: Atomic transaction updates

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

# Test creating credit purchase checkout session
curl -X POST http://localhost:3000/api/payments/purchase-credits \
  -H "Content-Type: application/json" \
  -H "Cookie: contractorSession=CONTRACTOR_SESSION_COOKIE" \
  -d '{"amount": 100}'

# Test webhook endpoint (for development only)
curl -X POST http://localhost:3000/api/payments/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{"test": "webhook_data"}'

# Test getting contractor transaction history
curl -X GET http://localhost:3000/api/contractor/auth/transactions \
  -H "Cookie: contractorSession=CONTRACTOR_SESSION_COOKIE"

# Test setting lead price (Admin only)
curl -X PATCH http://localhost:3000/api/leads/LEAD_ID/price \
  -H "Content-Type: application/json" \
  -H "Cookie: session=ADMIN_SESSION_COOKIE" \
  -d '{"price": 25.00}'

# Test purchasing lead with credits (Contractor only)
curl -X POST http://localhost:3000/api/leads/LEAD_ID/purchase-with-credits \
  -H "Content-Type: application/json" \
  -H "Cookie: contractorSession=CONTRACTOR_SESSION_COOKIE"

# Test adding credits to contractor (Admin only)
curl -X POST http://localhost:3000/api/contractor/auth/admin/contractors/CONTRACTOR_ID/credits \
  -H "Content-Type: application/json" \
  -H "Cookie: session=ADMIN_SESSION_COOKIE" \
  -d '{"amount": 100}'

# Test getting contractor credits balance
curl -X GET http://localhost:3000/api/contractor/auth/credits \
  -H "Cookie: contractorSession=CONTRACTOR_SESSION_COOKIE"
```

### Stripe Testing
```bash
# Use Stripe test cards for development
# Success: 4242424242424242
# Declined: 4000000000000002
# Insufficient funds: 4000000000009995

# Test webhook with Stripe CLI
stripe listen --forward-to localhost:3000/api/payments/stripe-webhook
stripe trigger checkout.session.completed
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
- [ ] **Set up Stripe live mode**
- [ ] **Configure production webhook endpoints**
- [ ] **Verify SSL certificate for webhooks**
- [ ] **Set up payment monitoring and alerts**

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
