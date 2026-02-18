# Fenmo Expense Tracker [Fenmo Online Assessment Task]

A full-stack personal finance tool for tracking and managing expenses with a focus on reliability, data correctness, and production-ready quality.

## Features

- ✅ Create expense entries with amount, category, description, and date
- ✅ View list of all expenses
- ✅ Filter expenses by category
- ✅ Sort expenses by date (newest first)
- ✅ Real-time total calculation of visible expenses
- ✅ Input validation and error handling
- ✅ Idempotency for handling network retries and duplicate submissions
- ✅ Loading states and user feedback
- ✅ Responsive design

## Tech Stack

### Frontend
- **React.js** - UI framework for building interactive components
- **TypeScript** - Type safety and better developer experience
- **TailwindCSS** - Utility-first CSS framework for styling
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for building REST API
- **sqlite3** - Synchronous SQLite3 bindings for Node.js

### Database
- **SQLite** - Lightweight, file-based relational database

## Why SQLite?

SQLite was chosen for this application for several reasons:

1. **Zero Configuration**: No separate database server to install or configure - the database is a single file
2. **Reliability**: ACID-compliant transactions ensure data integrity
3. **Performance**: Fast for read-heavy workloads typical of personal finance apps
4. **Simplicity**: Perfect for single-user applications without complex concurrent write requirements
5. **Portability**: The entire database is contained in one file, making backups and migrations trivial
6. **Production-Ready**: Used by many applications at scale (mobile apps, embedded systems, etc.)

For a personal expense tracker with a single user, SQLite provides all the benefits of a relational database without the operational overhead of PostgreSQL or MySQL.

## Key Design Decisions

### 1. Money Handling
- **Storage**: Amounts are stored as integers representing cents (e.g., ₹100.50 → 10050)
- **Rationale**: Avoids floating-point precision errors that can compound over time
- **Conversion**: API converts to/from decimal representation at the boundary

### 2. Idempotency Implementation
- **Approach**: Client generates unique idempotency key for each submission
- **Database**: Unique constraint on `idempotency_key` column prevents duplicates
- **Behavior**: If duplicate detected, returns original expense instead of error
- **Benefits**: Handles network retries, browser refreshes, and accidental double-clicks safely

### 3. Data Validation
- **Frontend**: Immediate feedback with HTML5 validation and custom checks
- **Backend**: Server-side validation as the authoritative source of truth
- **Money**: Validates positive amounts only
- **Dates**: Validates ISO 8601 format (YYYY-MM-DD)

### 4. Error Handling
- **User Feedback**: Clear error messages displayed in the UI
- **Network Errors**: Graceful handling with retry capability
- **API Errors**: Proper HTTP status codes and error responses
- **Loading States**: Visual feedback during async operations

### 5. API Design
- **RESTful**: Standard HTTP methods and status codes
- **Query Parameters**: Optional filtering and sorting via URL params
- **Response Format**: Consistent JSON structure
- **CORS**: Enabled for local development

## Trade-offs and Time-boxing Decisions

### Implemented
1. **Idempotency**: Critical for production reliability
2. **Input Validation**: Prevents bad data and improves UX
3. **Loading/Error States**: Essential for user experience
4. **Responsive Design**: Mobile-friendly layout with Tailwind
5. **Total Calculation**: Real-time sum of visible expenses

### Not Implemented (Due to Time Constraints)
1. **Automated Tests**: Would add unit tests for API endpoints and component tests for React
2. **Edit/Delete Functionality**: Would require additional API endpoints and UI components
3. **Pagination**: Current implementation loads all expenses (acceptable for personal use)
4. **Authentication**: Single-user application assumes trusted environment
5. **Advanced Filtering**: Multi-category filter, date range filtering
6. **Summary Dashboard**: Charts, graphs, category breakdowns
7. **Export Functionality**: CSV/PDF export of expenses
8. **Optimistic UI Updates**: Would improve perceived performance
9. **Service Worker**: Offline support and background sync

## Project Structure

```
expense-tracker/
├── server/
│   ├── server.js          # Express API server
│   ├── database.js        # SQLite database setup
│   ├── package.json       # Server dependencies
│   └── expenses.db        # SQLite database file (created on first run)
├── src/
│   ├── components/
│   │   ├── ExpenseForm.tsx    # Form for adding expenses
│   │   └── ExpenseList.tsx    # Table/list of expenses with filters
│   ├── api/
│   │   └── expenses.ts        # API client functions
│   ├── App.tsx                # Main application component
│   ├── main.tsx              # React entry point
│   └── index.css             # Global styles
└── package.json              # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

1. Start the backend server (in one terminal):
```bash
cd server
npm start
```
The API will be available at `http://localhost:3001`

2. Start the frontend dev server (in another terminal):
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## API Documentation

### POST /expenses
Create a new expense

**Request Body:**
```json
{
  "amount": "100.50",
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2024-01-15",
  "idempotencyKey": "unique-key-123"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "amount": 100.50,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2024-01-15",
  "created_at": "2024-01-15T12:30:00Z"
}
```

### GET /expenses
Retrieve expenses with optional filtering and sorting

**Query Parameters:**
- `category` (optional): Filter by category name
- `sort` (optional): "date_desc" for newest first

**Response:** (200 OK)
```json
[
  {
    "id": 1,
    "amount": 100.50,
    "category": "Food",
    "description": "Lunch at restaurant",
    "date": "2024-01-15",
    "created_at": "2024-01-15T12:30:00Z"
  }
]
```

### GET /categories
Retrieve list of unique categories

**Response:** (200 OK)
```json
["Food", "Transport", "Entertainment"]
```

## Database Schema

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,              -- Stored in cents
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,                   -- ISO 8601 format
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  idempotency_key TEXT UNIQUE           -- For preventing duplicates
);
```

## Production Considerations

### Already Implemented
- ✅ Idempotency for safe retries
- ✅ Input validation on frontend and backend
- ✅ Proper error handling and user feedback
- ✅ Money stored as integers to avoid precision errors
- ✅ Database indexes on frequently queried columns
- ✅ CORS configuration
- ✅ Loading states for async operations

### Would Add for Production
- 🔜 Automated tests (unit, integration, E2E)
- 🔜 Authentication and authorization
- 🔜 Rate limiting
- 🔜 Request logging and monitoring
- 🔜 Database migrations system
- 🔜 Environment configuration
- 🔜 API versioning
- 🔜 Data backup strategy
- 🔜 Docker containerization
- 🔜 CI/CD pipeline

## Potential Improvements

1. **Category Management**: Allow users to create custom categories
2. **Recurring Expenses**: Support for scheduled recurring transactions
3. **Budget Tracking**: Set and monitor category budgets
4. **Data Visualization**: Charts and graphs for spending trends
5. **Search Functionality**: Full-text search across descriptions
6. **Multi-Currency Support**: Handle multiple currencies with exchange rates
7. **Receipt Attachments**: Upload and store receipt images
8. **Data Export**: Export to CSV, Excel, or PDF
9. **Undo Functionality**: Ability to undo recent actions
10. **Performance Optimization**: Implement virtual scrolling for large lists

## License

MIT
