# Heroku Deployment Guide

## Prerequisites

1. Heroku CLI installed
2. Git repository initialized
3. Heroku account

## Deployment Steps

### 1. Create Heroku App

```bash
heroku create your-app-name
```

### 2. Set Environment Variables

Set these in your Heroku dashboard or via CLI:

```bash
# Required for production
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com

# Email configuration (optional - app will work without it)
heroku config:set USER_EMAIL=your-email@gmail.com
heroku config:set USER_PW=your-16-character-app-password

# Frontend environment variables
heroku config:set VITE_API_URL=https://your-app-name.herokuapp.com/api/votes
heroku config:set VITE_EMAIL_API_URL=https://your-app-name.herokuapp.com/api/email
```

### 3. Deploy

```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

## What Was Fixed

1. **Procfile**: Added to tell Heroku how to start the app
2. **CORS**: Updated to work with production URLs
3. **File Paths**: Fixed to work with Heroku's filesystem
4. **Build Process**: Added proper build scripts for the monorepo
5. **Static Files**: Backend now serves the built frontend
6. **Environment Variables**: Proper configuration for production

## Notes

- The app will work without email configuration (uses mock service)
- All data is stored in JSON files (consider upgrading to a database for production)
- The backend serves both API and frontend from the same port
- CORS is configured to allow requests from your deployed frontend URL

## Troubleshooting

If you get errors:

1. Check Heroku logs: `heroku logs --tail`
2. Verify all environment variables are set
3. Ensure the build process completes successfully
4. Check that the data files are copied to the backend directory
