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
- `GET /api/users` - User management endpoints

### Codeforces Integration
- `GET /api/cf/*` - Codeforces data endpoints

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

## Authentication Requirements

All Codeforces endpoints require:
1. User exists in database
2. User has `loggedIn: true`
3. User has valid `cfusername` field

## External Dependencies

- **Codeforces API**: All endpoints depend on Codeforces public API
- **Rate Limiting**: Respects Codeforces API rate limits (1 request per second)
- **No API Keys**: Uses only public Codeforces endpoints

---

## Development Setup

1. Ensure MongoDB is running
2. Configure environment variables in `.env`
3. Start server: `npm start`
4. Test endpoints with tools like Postman or curl

**Example Test**:
```bash
curl http://localhost:3000/api/cf/basic/testuser
```
