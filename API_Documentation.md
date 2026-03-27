# Nexus API Documentation

Base URL: `https://nexus-production-b210.up.railway.app/api`

## Authentication

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- POST `/auth/register` - Register user
- POST `/auth/login` - Login user
- GET `/auth/me` - Get current user
- PUT `/auth/profile` - Update profile

### Users
- GET `/users/entrepreneurs` - Get all entrepreneurs
- GET `/users/investors` - Get all investors
- GET `/users/:id` - Get user by ID

### Meetings
- POST `/meetings` - Create meeting
- GET `/meetings` - Get user meetings
- PUT `/meetings/:id/status` - Update status

### Messages
- POST `/messages` - Send message
- GET `/messages/:userId` - Get conversation
- GET `/messages/conversations` - Get all conversations

### Collaborations
- POST `/collaborations` - Create proposal
- GET `/collaborations` - Get proposals
- PUT `/collaborations/:id/status` - Update status

### Documents
- POST `/documents/upload` - Upload document
- GET `/documents` - Get user documents
- DELETE `/documents/:id` - Delete document

### Payments
- POST `/payments/transaction` - Create transaction
- GET `/payments/transactions` - Get transactions
- GET `/payments/balance` - Get balance