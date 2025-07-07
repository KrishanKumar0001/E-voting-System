# E-Voting System Backend

A secure and scalable backend API for the E-Voting System built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 👥 **User Management**: Voter registration, email verification, and admin management
- 🗳️ **Election Management**: Create, manage, and monitor elections with candidates
- 🎯 **Voting System**: Secure vote casting with verification and audit trails
- 📧 **Email Services**: OTP verification, password reset, and notifications
- 📊 **Analytics**: Comprehensive dashboard with statistics and reporting
- 🔒 **Security**: Rate limiting, input validation, and data encryption
- 📱 **API Documentation**: RESTful API with proper error handling

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/e-voting-system
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Security
   BCRYPT_ROUNDS=12
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new voter
- `POST /api/auth/login` - Voter login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Elections
- `GET /api/elections` - Get all elections
- `GET /api/elections/:id` - Get single election
- `POST /api/elections` - Create new election (Admin)
- `PUT /api/elections/:id` - Update election (Admin)
- `DELETE /api/elections/:id` - Delete election (Admin)
- `POST /api/elections/:id/candidates` - Add candidate (Admin)
- `PUT /api/elections/:electionId/candidates/:candidateId` - Update candidate (Admin)
- `DELETE /api/elections/:electionId/candidates/:candidateId` - Remove candidate (Admin)
- `GET /api/elections/:id/results` - Get election results

### Votes
- `POST /api/votes` - Cast a vote
- `GET /api/votes/history` - Get voting history
- `GET /api/votes/:id` - Get vote details
- `POST /api/votes/:id/cancel` - Cancel vote (within 24 hours)
- `POST /api/votes/:id/verify` - Verify vote (Admin)
- `GET /api/votes` - Get all votes (Admin)

### Voters (Admin)
- `GET /api/voters` - Get all voters
- `GET /api/voters/:id` - Get voter details
- `PUT /api/voters/:id/status` - Update voter status
- `DELETE /api/voters/:id` - Delete voter
- `GET /api/voters/stats/overview` - Get voter statistics
- `GET /api/voters/export` - Export voters data

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard overview
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/health` - Check system health
- `GET /api/admin/export` - Export system data
- `POST /api/admin/create-admin` - Create admin user

### Email Services
- `POST /api/email/send-otp` - Send OTP email
- `POST /api/email/verify-otp` - Verify OTP
- `POST /api/email/test` - Send test email

## Database Models

### User
- Voter registration and authentication
- Email verification and password reset
- Role-based access (voter/admin)
- Profile information and voting status

### Election
- Election details and scheduling
- Candidate management
- Requirements and settings
- Status tracking (upcoming/active/completed)

### Vote
- Vote casting and verification
- Audit trail with metadata
- Cancellation support
- Statistical aggregation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **Data Sanitization**: Protection against injection attacks

## Email Configuration

The system uses Nodemailer for email services. For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in EMAIL_PASS

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `EMAIL_*` - Email service configuration
- `RATE_LIMIT_*` - Rate limiting configuration

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production MongoDB
   - Set up email service

2. **Security**
   - Use HTTPS
   - Configure CORS properly
   - Set up proper rate limiting
   - Use environment variables for secrets

3. **Monitoring**
   - Set up logging
   - Monitor system health
   - Track API usage

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors (if any)
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 