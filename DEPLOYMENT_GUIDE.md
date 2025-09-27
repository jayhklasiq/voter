# Deployment Guide: Frontend (Vercel) + Backend (Heroku)

## Overview
- **Frontend**: Deployed on Vercel (React + Vite)
- **Backend**: Deployed on Heroku (Node.js + Express)
- **Backend URL**: https://voter-backend-d2204486ce63.herokuapp.com/

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy from project root
vercel

# Or connect your GitHub repo to Vercel dashboard
```

### 2. Environment Variables (Already Set)
The following are already configured in `vercel.json`:
- `VITE_API_URL`: https://voter-backend-d2204486ce63.herokuapp.com/api/votes
- `VITE_EMAIL_API_URL`: https://voter-backend-d2204486ce63.herokuapp.com/api/email

### 3. Build Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x (auto-detected)

## Backend Deployment (Heroku)

### 1. Deploy Backend
```bash
cd backend
git add .
git commit -m "Update CORS for Vercel frontend"
git push heroku main
```

### 2. Environment Variables (Set in Heroku)
```bash
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app

# Optional: Email configuration
heroku config:set USER_EMAIL=your-email@gmail.com
heroku config:set USER_PW=your-16-character-app-password
```

### 3. CORS Configuration
The backend is configured to allow:
- `https://voter-frontend.vercel.app`
- `https://voter-frontend-git-main.vercel.app`
- Any `*.vercel.app` domain (for preview deployments)

## Testing the Connection

### 1. Test Backend Health
```bash
curl https://voter-backend-d2204486ce63.herokuapp.com/
```

### 2. Test API Endpoints
```bash
# Test vote API
curl https://voter-backend-d2204486ce63.herokuapp.com/api/votes/health

# Test email API
curl https://voter-backend-d2204486ce63.herokuapp.com/api/email/health
```

### 3. Test Frontend Connection
1. Deploy frontend to Vercel
2. Open the Vercel URL
3. Check browser console for any CORS errors
4. Try voting to test the full flow

## File Structure Changes

### Frontend (Vercel)
- ✅ Removed backend dependencies from `package.json`
- ✅ Updated `vercel.json` with correct backend URLs
- ✅ Removed static file serving code
- ✅ Updated start script for frontend-only

### Backend (Heroku)
- ✅ Updated CORS to allow Vercel domains
- ✅ Removed frontend serving code
- ✅ Added health check endpoint
- ✅ Kept data file handling

## Troubleshooting

### CORS Errors
If you get CORS errors:
1. Check that your Vercel domain is in the allowed origins
2. Verify the backend is running: `heroku logs --tail`
3. Test the backend health endpoint

### API Connection Issues
1. Verify environment variables are set correctly
2. Check that the backend URL is accessible
3. Test individual API endpoints

### Build Issues
1. Ensure all dependencies are in the correct `package.json`
2. Check that build commands are correct
3. Verify the output directory matches Vercel configuration

## Development vs Production

### Local Development
```bash
# Run both frontend and backend
npm run dev:full

# Or run separately
npm run dev          # Frontend only
npm run backend      # Backend only
```

### Production
- Frontend: Automatically deployed on Vercel
- Backend: Deployed on Heroku
- No need to run both together
