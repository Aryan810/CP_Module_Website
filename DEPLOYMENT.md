# Vercel Deployment Guide

## Setup for Single App Deployment (Frontend + Backend)

### 1. Project Structure
```
/
├── frontend/          # React + Vite app
├── backend/           # Express.js API
├── vercel.json        # Vercel configuration
├── .vercelignore      # Files to exclude from deployment
└── README.md
```

### 2. Configuration Files Created

**vercel.json**: Routes `/api/*` to backend, everything else to frontend
**.vercelignore**: Excludes unnecessary files from deployment
**frontend/.env.production**: Production environment variables

### 3. Environment Variables to Set in Vercel Dashboard

Go to your Vercel project settings → Environment Variables and add:

**For Backend (Server-side - secure):**
```
MONGODB_URI=your-mongodb-connection-string
PORT=3000
JWT_SECRET=your-jwt-secret-key
API_SECRET_KEY=your-api-secret
```

**For Frontend (Client-side - visible in browser):**
```
VITE_API_BASE_URL=/api
VITE_APP_TITLE=CodingClub-IITG
```

### 4. Deployment Steps

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Or via GitHub integration:**
   - Push to GitHub
   - Connect repository in Vercel dashboard
   - Auto-deploys on every push

### 5. What happens during deployment:

- **Frontend**: Vite builds static files to `frontend/dist/`
- **Backend**: Node.js serverless functions in `/api/` routes
- **Routing**: 
  - `/api/*` → Backend API
  - `/*` → Frontend static files

### 6. Local Development vs Production:

**Local**: 
- Frontend: `http://localhost:4001`
- Backend: `http://localhost:3000`
- API calls: `VITE_API_BASE_URL=http://localhost:3000`

**Production**: 
- Everything: `https://your-app.vercel.app`
- API calls: `VITE_API_BASE_URL=/api`

### 7. Important Notes:

- Backend runs as serverless functions (not persistent server)
- MongoDB connection should use connection pooling
- Static files served from CDN
- Environment variables are set in Vercel dashboard
- CORS is configured for same-origin requests in production

### 8. Testing:

After deployment, test these URLs:
- `https://your-app.vercel.app/` (Frontend)
- `https://your-app.vercel.app/api/` (Backend root)
- `https://your-app.vercel.app/api/users/` (User API)
