# AstroBalendar – Production Deployment Guide

## Frontend (Netlify)
- URL: https://akuraastrology.netlify.app
- Build Tool: Vite
- Hosting: Netlify
- Deployment Command:
  ```
  npm run build
  ```

## Backend (Render)
- URL: https://api.astrobalendar.onrender.com
- Stack: FastAPI + MongoDB
- Hosting: Render.com
- Health Check: /api/health

## Environment Variables

### Frontend (.env)
```
VITE_BACKEND_URL=https://api.astrobalendar.onrender.com
```

### Backend (.env.production or Render Dashboard)
```
MONGO_URI=mongodb://mongodb:27017/astrobalendar
ALLOWED_ORIGINS=https://akuraastrology.netlify.app
SESSION_SECRET=your_secret_key
```

## Deployment Steps
1. Push to GitHub
2. Netlify auto-builds frontend
3. Render auto-builds backend (Blueprint deploy)
4. Confirm both URLs are healthy

## Validation Checklist
- All endpoints return 200
- Assets load
- Auth, DB, API work
