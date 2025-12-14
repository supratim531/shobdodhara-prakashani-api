# Technology Stack & Development Setup

## Programming Languages & Runtime
- **JavaScript (ES6+)**: Primary development language with modern syntax
- **Node.js**: Server-side JavaScript runtime environment
- **ES Modules**: Using `"type": "module"` for modern import/export syntax

## Core Framework & Libraries
- **Express.js v5.1.0**: Web application framework for API development
- **Mongoose v9.0.0**: MongoDB object modeling and schema validation
- **JWT (jsonwebtoken v9.0.2)**: Authentication and authorization tokens
- **Bcrypt v6.0.0**: Password hashing and security

## Database & Caching
- **MongoDB**: Primary NoSQL database for application data
- **Redis (ioredis v5.8.2)**: Caching layer and session management
- **BullMQ v5.65.1**: Redis-based queue system for background jobs

## Validation & Security
- **Joi v18.0.2**: Schema validation for request data
- **joi-password-complexity v5.2.0**: Password strength validation
- **CORS v2.8.5**: Cross-origin resource sharing configuration
- **Cookie Parser v1.4.7**: HTTP cookie parsing middleware

## Background Processing & Scheduling
- **Node-cron v4.2.1**: Scheduled task execution
- **p-limit v7.2.0**: Concurrency control for async operations
- **Nodemailer v7.0.10**: Email sending capabilities

## Development Tools
- **Nodemon v3.1.11**: Development server with auto-restart
- **dotenv v17.2.3**: Environment variable management
- **express-async-handler v1.2.0**: Async error handling wrapper

## Build & Deployment
- **PM2 (ecosystem.config.cjs)**: Production process management
- **GitHub Actions**: CI/CD pipeline configuration
- **Environment Configurations**: Separate .env files for development and production

## Development Commands

### Local Development
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm test            # Run test suite (placeholder)
```

### Environment Setup
```bash
npm install         # Install all dependencies
cp .env-template .env.development  # Setup development environment
```

### Database Operations
- MongoDB connection via Mongoose with connection pooling
- Redis connection for caching and queue management
- Automated database migrations through model schemas

## Project Configuration
- **Package Manager**: npm with package-lock.json for dependency locking
- **Module System**: ES6 modules with .js extensions
- **Entry Point**: server.js as main application file
- **License**: ISC license
- **Author**: Young-Architects team

## Performance & Scalability Features
- Connection pooling for database operations
- Redis caching for frequently accessed data
- Queue-based background processing
- Pagination utilities for large datasets
- Aggregation pipelines for complex queries