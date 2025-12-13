# Project Structure & Architecture

## Directory Organization

### Core Application Structure
```
shobdodhara-prakashani-api/
├── server.js                 # Application entry point
├── config/                   # Configuration files
│   ├── dbConfig.js          # MongoDB connection setup
│   └── redisConfig.js       # Redis cache configuration
├── models/                   # Database schemas and models
├── controllers/              # Request handlers and business logic
├── services/                 # Business logic and data processing
├── routes/                   # API endpoint definitions
├── middlewares/              # Custom middleware functions
├── validators/               # Input validation schemas
└── utils/                    # Utility functions and helpers
```

### Supporting Infrastructure
```
├── cron-jobs/               # Scheduled background tasks
├── queues/                  # Message queue configurations
├── workers/                 # Background job processors
├── constants/               # Application constants and enums
└── .github/workflows/       # CI/CD pipeline configuration
```

## Core Components & Relationships

### MVC Architecture Pattern
- **Models**: Database schemas using Mongoose ODM for MongoDB
- **Controllers**: Handle HTTP requests, delegate to services, return responses
- **Services**: Contain business logic, interact with models and external services
- **Routes**: Define API endpoints and connect to appropriate controllers

### Key Model Relationships
- **User → Order**: One-to-many relationship for customer orders
- **Order → OrderItem**: One-to-many for order line items
- **User → Cart → CartItem**: Shopping cart management
- **Product**: Polymorphic model supporting books, clothes, and other items
- **Reservation**: Temporary product holds during checkout process

### Service Layer Architecture
- **Authentication Services**: User registration, login, token management
- **Product Services**: Catalog management, search, filtering
- **Cart Services**: Shopping cart operations and persistence
- **Order Services**: Order processing, status management
- **Checkout Services**: Payment processing and order finalization
- **Admin Services**: Administrative operations and reporting

### Middleware Stack
- **Global Error Handler**: Centralized error processing and response formatting
- **Token Validation**: JWT authentication and authorization
- **Role Handler**: Permission-based access control
- **Input Validators**: Request validation using Joi schemas

### Background Processing
- **Email Queue**: Asynchronous email sending using BullMQ
- **Cron Schedulers**: Automated cleanup and maintenance tasks
- **Redis Integration**: Caching and session management

## Architectural Patterns

### Service-Oriented Design
Each major feature area has dedicated service modules that encapsulate business logic and data access patterns.

### Repository Pattern
Models serve as data access layer with services providing business logic abstraction.

### Queue-Based Processing
Background tasks are handled through Redis-backed queues for improved performance and reliability.

### Middleware Pipeline
Express.js middleware chain handles cross-cutting concerns like authentication, validation, and error handling.

### Configuration Management
Environment-specific configurations with template files for easy deployment across different environments.