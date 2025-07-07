# E-Voting System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register Voter
```http
POST /auth/register
Content-Type: application/json

{
  "voterId": "VOTER123",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "phone": "1234567890",
  "address": "123 Main St, City, State"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification and wait for admin approval.",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "voterId": "VOTER123",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": false,
      "isAdminApproved": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login Voter
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "voterId": "VOTER123",
      "name": "John Doe",
      "email": "john@example.com",
      "isAdmin": false,
      "isEmailVerified": true,
      "hasVoted": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Admin Login
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@evoting.com",
  "password": "Admin@123"
}
```

#### Check Approval Status
```http
GET /auth/approval-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isEmailVerified": true,
    "isAdminApproved": false,
    "isActive": true,
    "canVote": false,
    "rejectionReason": null
  }
}
```

### Elections

#### Get All Elections
```http
GET /elections?page=1&limit=10&status=active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "elections": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Presidential Election 2024",
        "description": "Choose the next President",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2024-01-16T00:00:00.000Z",
        "status": "active",
        "candidates": [
          {
            "id": "60f7b3b3b3b3b3b3b3b3b3b3",
            "name": "John Anderson",
            "party": "Democratic Party",
            "symbol": "🔵",
            "aadharId": "1234-5678-9012"
          }
        ],
        "totalVotes": 150,
        "createdBy": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "Admin User",
          "email": "admin@evoting.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Create Election (Admin Only)
```http
POST /elections
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "New Election",
  "description": "Election description",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-02T00:00:00.000Z",
  "requirements": {
    "minimumAge": 18,
    "allowedGenders": ["male", "female", "other"]
  },
  "settings": {
    "allowMultipleVotes": false,
    "requirePhotoId": true,
    "showResultsBeforeEnd": false
  }
}
```

#### Add Candidate (Admin Only)
```http
POST /elections/60f7b3b3b3b3b3b3b3b3b3b3/candidates
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "party": "Republican Party",
  "symbol": "🔴",
  "aadharId": "2345-6789-0123",
  "description": "Candidate description",
  "manifesto": "Candidate manifesto"
}
```

### Votes

#### Cast Vote
```http
POST /votes
Authorization: Bearer <voter-token>
Content-Type: application/json

{
  "electionId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "candidateId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "electionId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "candidateId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "isVerified": false
    },
    "candidate": {
      "name": "John Anderson",
      "party": "Democratic Party",
      "symbol": "🔵"
    }
  }
}
```

#### Get Voting History
```http
GET /votes/history?page=1&limit=10
Authorization: Bearer <voter-token>
```

#### Cancel Vote (within 24 hours)
```http
POST /votes/60f7b3b3b3b3b3b3b3b3b3b3/cancel
Authorization: Bearer <voter-token>
Content-Type: application/json

{
  "reason": "Voted for wrong candidate"
}
```

### Admin Dashboard

#### Get Dashboard Overview
```http
GET /admin/dashboard
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVoters": 1247,
      "totalElections": 5,
      "totalVotes": 892,
      "totalCandidates": 12,
      "votesToday": 45,
      "votesThisWeek": 234,
      "verificationRate": 85.2,
      "votingRate": 71.5
    },
    "recentActivity": {
      "votes": [
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "voterId": {
            "name": "John Doe"
          },
          "electionId": {
            "title": "Presidential Election 2024"
          },
          "timestamp": "2024-01-15T10:30:00.000Z"
        }
      ],
      "registrations": [
        {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "createdAt": "2024-01-15T09:00:00.000Z"
        }
      ]
    },
    "activeElections": [
      {
        "title": "Presidential Election 2024",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2024-01-16T00:00:00.000Z",
        "totalVotes": 150
      }
    ]
  }
}
```

#### Get System Statistics
```http
GET /admin/stats?period=30
Authorization: Bearer <admin-token>
```

#### Get Pending Approvals Count
```http
GET /api/admin/pending-approvals-count
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingApprovals": 5,
    "unverifiedUsers": 3
  }
}
```

### Voter Management (Admin Only)

#### Get All Voters
```http
GET /voters?page=1&limit=20&search=john&isEmailVerified=true
Authorization: Bearer <admin-token>
```

#### Update Voter Status
```http
PUT /voters/60f7b3b3b3b3b3b3b3b3b3b3/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false,
  "isEmailVerified": true
}
```

#### Export Voters Data
```http
GET /voters/export
Authorization: Bearer <admin-token>
```

Returns a CSV file with voter data.

#### Get Pending Approvals
```http
GET /api/voters/pending-approvals
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingVoters": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "voterId": "VOTER123",
        "name": "John Doe",
        "email": "john@example.com",
        "isEmailVerified": true,
        "isAdminApproved": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

#### Approve/Reject Voter
```http
PUT /api/voters/60f7b3b3b3b3b3b3b3b3b3b3/approval
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isAdminApproved": true
}
```

**For rejection:**
```json
{
  "isAdminApproved": false,
  "rejectionReason": "Incomplete documentation provided"
}
```

#### Bulk Approve/Reject Voters
```http
POST /api/voters/bulk-approval
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "voterIds": ["60f7b3b3b3b3b3b3b3b3b3b3", "60f7b3b3b3b3b3b3b3b3b3b4"],
  "isAdminApproved": true
}
```

#### Get Voters with Status Filter
```http
GET /api/voters?status=pending&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Status options:**
- `pending` - Email verified but not admin approved
- `approved` - Both email verified and admin approved
- `rejected` - Admin rejected (account deactivated)

### Email Services

#### Send OTP
```http
POST /email/send-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Doe"
}
```

#### Verify OTP
```http
POST /email/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "",
      "msg": "Email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Not authorized, token failed"
}
```

### Not Found Error
```json
{
  "success": false,
  "error": "Election not found"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses

## Pagination

List endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Pagination metadata is included in responses:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
``` 