# Required Environment Variables for Vercel

## Add these in Vercel Dashboard → Project Settings → Environment Variables:

### Backend (Server-side):
MONGO_URI=mongodb+srv://cccptest:cccp2025@cluster0.7rn9h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=your-random-secret-key-123
PORT=3000

### Frontend (Client-side):
VITE_API_BASE_URL=""
VITE_APP_TITLE=CodingClub-IITG

## Important Notes:
- The MONGO_URI includes your credentials, make sure it's correct
- JWT_SECRET should be a random string for security
- VITE_ prefixed variables are accessible in the browser
- Non-VITE_ variables are only accessible on the server
