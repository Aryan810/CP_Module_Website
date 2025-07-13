# CP Website TODO list ->

## 13 July, 2025

### Project Overview (What we've done so far)

**Backend:**
- Authentication system with MongoDB
- Password hashing
- User registration and login/logout APIs
- Codeforces data fetching setup
- Express.js server

**Frontend:**
- React 19 + Vite 7 setup
- Login and register pages
- Basic form validation and routing
- Responsive design

**Status:** Auth works, forms are done, need to build profile page next.

### Today's tasks (13 July)

**Frontend:**
- Remove login/register buttons when user is logged in
- Add user profile section in navbar (right side)
- Show user's name and Codeforces profile image
- Handle login/logout state properly
- Build leaderboard page with filtering options (contests and platform.)
- Add dropdown/select components for contest and platform selection.
- Display user rankings in a nice table format (COLOR - gold for 1st, silver for 2nd, bronze for 3rd)
- Fetch leaderboard data from backend APIs (specify which ranklist you want.)

**Backend:**
- Make sure user data includes Codeforces image URL
- API endpoint for leaderboard data (contest-specific rankings)
- API for platform-wise rankings (Codeforces, etc.)
- Overall ranking algorithm and API endpoint
- Scheduled function to fetch contest results when contests end (on some platform)
- Use Codeforces calendar API to track contest schedules
- Auto-fetch user ranks and questions solved after each contest (once codeforces API starts to work.)
- Ranking algorithm to calculate overall scores (TBD).

# ----------------------------------------------------------------

## 12 July, 2025

### Frontend Migration to Vite (COMPLETED)
#### -> Successfully migrated from Create React App to Vite
#### -> Updated all React components to use .jsx extensions for better Vite compatibility
#### -> Configured Vite with React plugin, port 3000, and build output to 'build' directory
#### -> All existing functionality preserved: routing, authentication UI, responsive design
#### -> Development server now starts faster with hot module replacement

# ----------------------------------------------------------------

## 11 July, 2025

### 1: frontend - building a basic profile page in frontend.
#### -> show Name, Rating, Max-rating, Image, Designation, etc.

### 2: backend - make a API endpoint which fetches user details from codeforces (for now) and if frontend makes a request at it. it returns that. (DONE)
#### -> also make a role based authentication system. which uses mongoDB to store user details and password is hashed for security. (DONE)
#### -> login/logout functionality (DONE)..only now we need to sync them in frontend.
#### -> migrated frontend from Create React App (CRA) to Vite for better performance and modern tooling. (DONE)
(Is this workflow ok ? - [ ? ]).

# ----------------------------------------------------------------

## 9 July, 2025

### 1: frontend - building a basic UI for a user profile (may use copilot or GPT to do faster.)
#### -> keep all class names and id meaning full, so that it would be easy to handle for backend.

### 2: backend - a simple script which fetches user data from codeforces. for now, -> 
#### -> Name, Image (recommended. ), Institue, rating, maxrating, questions, solved. (any other if possible.)

# These are just for reference, may include more (or maybe less).







