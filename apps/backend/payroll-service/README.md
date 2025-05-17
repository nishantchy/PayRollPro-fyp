# PayrollPro - Payroll Service

This microservice handles all payroll-related functionality for the PayrollPro application.

## Features

- Payroll generation and processing
- Salary calculations
- Tax deductions
- Integration with core service for user/customer/organization data

## API Endpoints

### Payroll Endpoints

- `GET /api/payroll` - Get all payrolls
- `GET /api/payroll/:id` - Get a specific payroll by ID
- `POST /api/payroll` - Create a new payroll
- `PUT /api/payroll/:id` - Update a payroll
- `DELETE /api/payroll/:id` - Delete a payroll

### Test Endpoints

- `GET /api/test/connection` - Test connection to core service
- `GET /api/test/user/:userId` - Test fetching a user from core service
- `GET /api/test/customer/:customerId` - Test fetching a customer from core service
- `GET /api/test/organization/:orgId` - Test fetching an organization from core service

## Setup and Installation

### Prerequisites

- Node.js v18 or higher
- MongoDB
- Core Service running

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Core Service Connection
CORE_SERVICE_URL=http://localhost:5000
CORE_SERVICE_API_KEY=your-api-key

# Server Configuration
PORT=5001

# Database Connection
MONGO_URI=mongodb://localhost:27017/payroll-service

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d

# Logging
LOG_LEVEL=info
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Testing

### Running Tests

```bash
# Run unit tests
npm test

# Run specific tests
npm test -- --grep "test-pattern"

# Test core service connection
npx ts-node src/tests/core-service-test.ts
```

## Architecture

The payroll service follows a modular architecture:

- `controllers/` - HTTP request handlers
- `models/` - MongoDB schema definitions
- `routes/` - API route definitions
- `services/` - Business logic layer
- `utils/` - Utility functions
- `middlewares/` - Express middleware functions
- `config/` - Configuration files

## Core Service Integration

This service connects to the Core Service to retrieve user, customer, and organization data. The connection is configured in `src/config/config.ts` and implemented in `src/services/core-service.ts`.
