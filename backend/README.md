# Backend API Documentation

## Overview
This backend provides REST API endpoints for the Competitive Programming Module Website. The main functionality includes user authentication and Codeforces data integration.

## Base URL
```
http://localhost:3000
```

## API Routes Structure

### Root Endpoints
- `GET /` - Welcome message
- `GET /api` - API information

### User Management
- `GET /api/users/*` - User management endpoints

### Codeforces Integration
- `GET /api/cf/*` - Codeforces data endpoints

---

## User Management API Endpoints

All user endpoints work with the user authentication system and require proper credentials for sensitive operations.

### 1. Get All Users - `/api/users/all/:admin_name`

**Purpose**: Admin-only endpoint to view all users in the system

**Requirements**: 
- Admin user must exist and be logged in
- Only users with `role: 'admin'` can access

**Sample Response**:
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@iitg.ac.in",
    "role": "user",
    "name": "John Doe",
    "cfusername": "john_cf",
    "ccusername": "john_cc",
    "lcusername": "john_lc",
    "acusername": "john_ac",
    "loggedIn": true,
    "createdAt": "2025-07-11T10:00:00.000Z",
    "updatedAt": "2025-07-11T14:30:00.000Z"
  }
]
```

**Error Cases**:
- `403`: Access denied - not an admin or admin not logged in
- `500`: Server error

---

### 2. Get User by Username - `/api/users/:username`

**Purpose**: Get specific user information

**Requirements**: User must be logged in

**Sample Response**:
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "username": "john_doe",
  "email": "john@iitg.ac.in",
  "role": "user",
  "name": "John Doe",
  "cfusername": "john_cf",
  "ccusername": "john_cc",
  "lcusername": "john_lc",
  "acusername": "john_ac",
  "loggedIn": true,
  "createdAt": "2025-07-11T10:00:00.000Z",
  "updatedAt": "2025-07-11T14:30:00.000Z"
}
```

**Error Cases**:
- `404`: User not found
- `403`: User not logged in
- `500`: Server error

---

### 3. Create New User - `POST /api/users/`

**Purpose**: Register a new user in the system

**Required Fields**:
- `username` (string, unique)
- `email` (string, unique) 
- `password` (string)
- `role` (string: 'admin', 'user', 'guest')
- `cfusername` (string, unique)

**Optional Fields**:
- `name` (string)
- `ccusername` (string, unique)
- `lcusername` (string, unique) 
- `acusername` (string, unique)

**Sample Request**:
```json
{
  "username": "jane_doe",
  "email": "jane@iitg.ac.in",
  "password": "securePassword123",
  "role": "user",
  "cfusername": "jane_cf",
  "name": "Jane Doe"
}
```

**Sample Response**:
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "username": "jane_doe",
  "email": "jane@iitg.ac.in",
  "role": "user",
  "name": "Jane Doe",
  "cfusername": "jane_cf",
  "loggedIn": false,
  "createdAt": "2025-07-11T15:00:00.000Z",
  "updatedAt": "2025-07-11T15:00:00.000Z"
}
```

**Error Cases**:
- `400`: Missing required fields or validation error
- `400`: Username/email/cfusername already exists

---

### 4. Login User - `PUT /api/users/login/:username`

**Purpose**: Authenticate user and set logged in status

**Required Body**:
- `password` (string)

**Sample Request**:
```json
{
  "password": "securePassword123"
}
```

**Sample Response**:
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "username": "john_doe",
  "email": "john@iitg.ac.in",
  "role": "user",
  "name": "John Doe",
  "cfusername": "john_cf",
  "loggedIn": true,
  "updatedAt": "2025-07-11T16:00:00.000Z"
}
```

**Error Cases**:
- `404`: User not found
- `403`: User already logged in
- `400`: Incorrect password

---

### 5. Logout User - `PUT /api/users/logout/:username`

**Purpose**: Log out user and set logged in status to false

**Sample Response**:
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "username": "john_doe",
  "email": "john@iitg.ac.in",
  "role": "user",
  "name": "John Doe",
  "cfusername": "john_cf",
  "loggedIn": false,
  "updatedAt": "2025-07-11T17:00:00.000Z"
}
```

**Error Cases**:
- `404`: User not found
- `403`: User already logged out

---

### 6. Update User - `PUT /api/users/:username`

**Purpose**: Update user information (requires password verification)

**Required Body**:
- `password` (string) - current password for verification

**Note**: Currently validates password but doesn't update fields. Implementation may need enhancement for actual field updates.

**Sample Request**:
```json
{
  "password": "currentPassword123"
}
```

**Error Cases**:
- `404`: User not found
- `400`: Incorrect password

---

### 7. Delete User - `DELETE /api/users/:username`

**Purpose**: Delete user account (requires password verification)

**Required Body**:
- `password` (string) - user's password for verification

**Sample Request**:
```json
{
  "password": "userPassword123"
}
```

**Sample Response**:
```json
{
  "message": "User deleted successfully"
}
```

**Error Cases**:
- `404`: User not found
- `400`: Incorrect password
- `500`: Server error

---

## Codeforces API Endpoints

All Codeforces endpoints require:
- User must be logged in
- User must have a valid Codeforces username configured

### 1. Basic Profile Info - `/api/cf/basic/:username`

**Purpose**: Minimal user information for quick overview (dashboards, cards)

**Response Time**: ~200ms (single API call)

**Sample Response**:
```json
{
  "success": true,
  "username": "john_doe",
  "basic": {
    "handle": "tourist",
    "rating": 3822,
    "maxRating": 3979,
    "rank": "legendary grandmaster",
    "isOnline": false
  }
}
```

---

### 2. Full Profile - `/api/cf/profile/:username`

**Purpose**: Complete user profile information for profile pages

**Response Time**: ~200ms (single API call)

**Sample Response**:
```json
{
  "success": true,
  "username": "john_doe",
  "profile": {
    "handle": "tourist",
    "firstName": "Gennady",
    "lastName": "Korotkevich",
    "country": "Belarus",
    "city": "Gomel",
    "organization": "ITMO University",
    "avatar": "https://userpic.codeforces.org/2896/title/1905bb9c4d0be38a.jpg",
    "titlePhoto": "https://userpic.codeforces.org/2896/avatar/b4b552dd5d8da1b9.jpg",
    "rank": "legendary grandmaster",
    "rating": 3822,
    "maxRank": "legendary grandmaster",
    "maxRating": 3979,
    "lastOnlineTime": "2025-07-11T14:30:15.000Z",
    "registrationTime": "2010-07-23T09:15:30.000Z",
    "friendOfCount": 15420,
    "contribution": 156
  }
}
```

---

### 3. Contest History - `/api/cf/contests/:username`

**Purpose**: Contest participation data for rating analysis and graphs

**Response Time**: ~300ms (single API call)

**Sample Response**:
```json
{
  "success": true,
  "username": "john_doe",
  "contests": {
    "totalContests": 245,
    "contestHistory": [
      {
        "contestId": 2051,
        "contestName": "Codeforces Round 995 (Div. 1)",
        "handle": "tourist",
        "rank": 1,
        "oldRating": 3810,
        "newRating": 3822,
        "ratingUpdateTime": "2025-07-10T18:45:00.000Z"
      },
      {
        "contestId": 2050,
        "contestName": "Educational Codeforces Round 172",
        "handle": "tourist",
        "rank": 2,
        "oldRating": 3825,
        "newRating": 3810,
        "ratingUpdateTime": "2025-07-05T16:30:00.000Z"
      }
    ]
  }
}
```

---

### 4. Recent Submissions - `/api/cf/submissions/:username`

**Purpose**: Latest coding activity for activity feeds

**Query Parameters**:
- `count` (optional): Number of submissions to fetch (default: 10, max: 100)

**Response Time**: ~250ms (single API call)

**Sample Request**:
```
GET /api/cf/submissions/john_doe?count=5
```

**Sample Response**:
```json
{
  "success": true,
  "username": "john_doe",
  "submissions": [
    {
      "id": 285643210,
      "contestId": 2051,
      "problemIndex": "A",
      "problemName": "Maximum Subarray",
      "problemRating": 1200,
      "verdict": "OK",
      "programmingLanguage": "GNU C++20 (64)",
      "creationTime": "2025-07-11T10:25:45.000Z"
    },
    {
      "id": 285643195,
      "contestId": 2051,
      "problemIndex": "B",
      "problemName": "Binary Operations",
      "problemRating": 1400,
      "verdict": "WRONG_ANSWER",
      "programmingLanguage": "GNU C++20 (64)",
      "creationTime": "2025-07-11T10:15:22.000Z"
    }
  ]
}
```

---

### 5. Statistics - `/api/cf/stats/:username`

**Purpose**: Quick statistics for dashboard widgets

**Response Time**: ~400ms (three parallel API calls)

**Sample Response**:
```json
{
  "success": true,
  "username": "john_doe",
  "stats": {
    "isOnline": false,
    "totalSubmissions": "10+",
    "ratingChange": 12
  }
}
```

**Field Explanations**:
- `isOnline`: `true` if user was active within last 1 minute
- `totalSubmissions`: String showing count ("10+" if 10 or more fetched)
- `ratingChange`: Rating points gained/lost in most recent contest

---

### 6. Complete Data - `/api/cf/full/:username`

**Purpose**: All data in one response for comprehensive views

**Response Time**: ~400ms (three parallel API calls)

**Sample Response**:
```json
{
  "success": true,
  "username": "john_doe",
  "cf": {
    "profile": {
      "handle": "tourist",
      "firstName": "Gennady",
      "lastName": "Korotkevich",
      "country": "Belarus",
      "city": "Gomel",
      "organization": "ITMO University",
      "avatar": "https://userpic.codeforces.org/2896/title/1905bb9c4d0be38a.jpg",
      "titlePhoto": "https://userpic.codeforces.org/2896/avatar/b4b552dd5d8da1b9.jpg",
      "rank": "legendary grandmaster",
      "rating": 3822,
      "maxRank": "legendary grandmaster",
      "maxRating": 3979,
      "lastOnlineTime": "2025-07-11T14:30:15.000Z",
      "registrationTime": "2010-07-23T09:15:30.000Z",
      "friendOfCount": 15420,
      "contribution": 156
    },
    "contests": {
      "totalContests": 245,
      "contestHistory": [
        {
          "contestId": 2051,
          "contestName": "Codeforces Round 995 (Div. 1)",
          "handle": "tourist",
          "rank": 1,
          "oldRating": 3810,
          "newRating": 3822,
          "ratingUpdateTime": "2025-07-10T18:45:00.000Z"
        }
      ]
    },
    "recentActivity": {
      "submissions": [
        {
          "id": 285643210,
          "contestId": 2051,
          "problemIndex": "A",
          "problemName": "Maximum Subarray",
          "problemRating": 1200,
          "verdict": "OK",
          "programmingLanguage": "GNU C++20 (64)",
          "creationTime": "2025-07-11T10:25:45.000Z"
        }
      ]
    },
    "stats": {
      "isOnline": false,
      "totalSubmissions": "10+",
      "ratingChange": 12
    }
  }
}
```

---

### 7. Backward Compatibility - `/api/cf/:username`

**Purpose**: Maintains compatibility with existing frontend code

**Behavior**: Redirects to `/api/cf/full/:username`

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "message": "Error description"
}
```

**Common Error Cases**:
- `400`: User not found, not logged in, or missing Codeforces username
- `400`: Codeforces API failure or invalid Codeforces username
- `403`: User not logged in
- `404`: User not found in database

---

## Performance Optimization

### Endpoint Selection Guide:

| Use Case | Recommended Endpoint | Response Size | Speed |
|----------|---------------------|---------------|-------|
| Profile cards, leaderboards | `/basic/:username` | ~200 bytes | Fastest |
| User profile page header | `/profile/:username` | ~500 bytes | Fast |
| Activity feeds | `/submissions/:username` | ~1-5KB | Fast |
| Rating graphs | `/contests/:username` | ~2-10KB | Medium |
| Dashboard widgets | `/stats/:username` | ~150 bytes | Medium |
| Complete user page | `/full/:username` | ~5-15KB | Slower |

### Caching Recommendations:
- Cache responses for 1-5 minutes to reduce Codeforces API load
- Use `/basic` for frequent updates
- Use `/full` sparingly for initial page loads

---

## Authentication & Security

### Password Security
- All passwords are automatically hashed using bcrypt before storage
- Password comparison uses bcrypt's secure comparison method
- Minimum security: 10 salt rounds for password hashing

### User Authentication
- Login/logout system tracks user session state
- Password verification required for sensitive operations (update, delete)
- Admin-only endpoints protected by role-based access control

### Data Validation
- Unique constraints on username, email, and platform usernames
- Required field validation on user creation
- Email format validation (should end with @iitg.ac.in for students)

---

## Authentication Requirements

### For Codeforces Endpoints:
All Codeforces endpoints require:
1. User exists in database
2. User has `loggedIn: true`
3. User has valid `cfusername` field

### For User Management Endpoints:
- **Public**: User creation (POST /api/users/)
- **Authentication Required**: Login, logout, get user info
- **Password Verification**: Update user, delete user
- **Admin Only**: Get all users (requires admin role + logged in)

## External Dependencies

- **MongoDB**: Database for user management and authentication
- **bcrypt**: Password hashing and verification
- **Mongoose**: MongoDB object modeling
- **Codeforces API**: All CF endpoints depend on Codeforces public API
- **Rate Limiting**: Respects Codeforces API rate limits (1 request per second)
- **No API Keys**: Uses only public Codeforces endpoints

---

## Complete API Reference

### User Management Endpoints Summary:
```
GET    /api/users/all/:admin_name    - Get all users (admin only)
GET    /api/users/:username          - Get user by username
POST   /api/users/                   - Create new user
PUT    /api/users/login/:username    - Login user
PUT    /api/users/logout/:username   - Logout user  
PUT    /api/users/:username          - Update user (password required)
DELETE /api/users/:username          - Delete user (password required)
```

### Codeforces Endpoints Summary:
```
GET /api/cf/basic/:username       - Basic profile info
GET /api/cf/profile/:username     - Full profile details
GET /api/cf/contests/:username    - Contest history
GET /api/cf/submissions/:username - Recent submissions (?count=N)
GET /api/cf/stats/:username       - Quick statistics
GET /api/cf/full/:username        - Complete data
GET /api/cf/:username             - Alias for /full (backward compatibility)
```

---

## Development Setup

1. **Install Dependencies**: `npm install`
2. **Setup MongoDB**: Ensure MongoDB is running locally or configure connection string
3. **Environment Variables**: Configure in `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/cp_website
   ```
4. **Start Server**: `npm start`
5. **Test Endpoints**: Use tools like Postman, curl, or REST client

**Example Tests**:
```bash
# Test user creation
curl -X POST http://localhost:3000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@iitg.ac.in","password":"test123","role":"user","cfusername":"testcf"}'

# Test user login  
curl -X PUT http://localhost:3000/api/users/login/testuser \
  -H "Content-Type: application/json" \
  -d '{"password":"test123"}'

# Test Codeforces basic info
curl http://localhost:3000/api/cf/basic/testuser
```

## Database Schema

### User Model:
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'user', 'guest'], default: 'user'),
  name: String (optional),
  cfusername: String (required, unique),
  ccusername: String (optional, unique),
  lcusername: String (optional, unique),
  acusername: String (optional, unique),
  loggedIn: Boolean (default: false),
  timestamps: true (createdAt, updatedAt)
}
```
