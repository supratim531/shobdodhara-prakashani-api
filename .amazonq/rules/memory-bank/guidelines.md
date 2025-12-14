# Development Guidelines & Standards

## Code Quality Standards

### Import/Export Patterns
- **ES6 Modules**: Use `import`/`export` syntax consistently throughout the codebase
- **Named Exports**: Prefer named exports for service functions: `export { functionName }`
- **Default Imports**: Use default imports for models and external libraries
- **Relative Imports**: Use relative paths with `.js` extensions: `import Model from "../models/modelName.js"`

### Function Declaration Standards
- **Arrow Functions**: Use arrow functions for service methods and utilities
- **Async/Await**: Consistently use async/await pattern for asynchronous operations
- **Function Naming**: Use descriptive camelCase names that indicate action and entity
  ```javascript
  const fetchUserOrders = async (userId, query) => { ... }
  const saveCartItem = async (userId, productId, quantity) => { ... }
  ```

### Error Handling Patterns
- **Throw Errors**: Use `throw new Error("message")` for business logic errors
- **Global Handler**: Centralized error handling through middleware
- **Error Types**: Handle specific error types (TokenExpiredError, ValidationError, MongoServerError)
- **Status Codes**: Use imported constants for HTTP status codes

## Structural Conventions

### Service Layer Architecture
- **Single Responsibility**: Each service handles one domain (cart, product, order, etc.)
- **Pure Functions**: Services should be stateless and return consistent results
- **Database Abstraction**: Services encapsulate all database operations for their domain
- **Transaction Safety**: Handle rollbacks when operations fail (e.g., product creation with category data)

### MongoDB Integration Patterns
- **Aggregation Pipelines**: Use for complex queries with joins and transformations
  ```javascript
  const pipeline = [
    { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $match: filter },
    { $project: { __v: 0, "product.__v": 0 } }
  ];
  ```
- **Projection Standards**: Always exclude `__v` and unnecessary fields in projections
- **ObjectId Conversion**: Use `new mongoose.Types.ObjectId()` for ID conversions

### Pagination & Filtering
- **Utility Functions**: Use centralized pagination utilities (`getPaginationParams`, `buildMeta`)
- **Dynamic Filters**: Build filters dynamically from query parameters
- **Sort Mapping**: Use predefined sort maps for consistent sorting options
- **Meta Information**: Always return pagination metadata with results

## Semantic Patterns

### Business Logic Implementation
- **Stock Management**: Always check product stock before cart operations
- **Price Calculations**: Use `discountPrice || price` pattern for effective pricing
- **Coupon Logic**: Validate coupon eligibility before application
- **Cart Refresh**: Implement comprehensive cart item synchronization with product changes

### Data Validation & Sanitization
- **Input Trimming**: Always trim string inputs: `query.author.trim()`
- **Case Handling**: Use consistent case conversion: `toUpperCase()` for enums
- **Number Validation**: Check `Number.isNaN()` before using converted numbers
- **Array Processing**: Split comma-separated values and map with trim

### Response Patterns
- **Consistent Structure**: Return objects with predictable structure
- **Notification System**: Include user notifications for stock limitations
- **Metadata**: Always include pagination and summary information
- **Error Context**: Provide meaningful error messages with context

## Internal API Usage Patterns

### Model Interactions
```javascript
// Find with options
const item = await Model.findByIdAndUpdate(id, updateData, { new: true });

// Aggregation with lookup
const results = await Model.aggregate([
  { $lookup: { from: "collection", localField: "field", foreignField: "_id", as: "joined" } }
]);

// Conditional operations
const existingItem = await Model.findOne({ conditions });
if (existingItem) { /* update logic */ } else { /* create logic */ }
```

### Service Communication
- **Cross-Service Calls**: Import and call other services when needed
- **Data Transformation**: Transform data at service boundaries
- **Validation**: Validate inputs at service entry points
- **Return Consistency**: Return consistent data structures across services

## Code Quality Practices

### Variable Naming
- **Descriptive Names**: Use clear, descriptive variable names
- **Consistent Prefixes**: Use prefixes like `new`, `updated`, `existing` for clarity
- **Boolean Flags**: Use descriptive boolean names: `stockReduced`, `priceChanged`

### Function Organization
- **Single Purpose**: Each function should have one clear responsibility
- **Parameter Order**: Consistent parameter ordering (userId first, then specific IDs)
- **Return Values**: Return meaningful objects with clear property names

### Performance Considerations
- **Lean Queries**: Use `.lean()` for read-only operations
- **Selective Fields**: Use `.select()` to limit returned fields
- **Batch Operations**: Use `updateMany`, `deleteMany` for bulk operations
- **Index Usage**: Structure queries to utilize database indexes

### Documentation Standards
- **Inline Comments**: Use comments for complex business logic
- **Function Documentation**: Document complex algorithms and business rules
- **TODO Comments**: Mark areas needing future improvement
- **Error Context**: Provide context in error messages for debugging