# KP Astrology AI/ML Platform – Production Deployment Guide

---

## 🚀 Overview

This document details the deployment setup for your full-stack KP Astrology AI/ML platform, covering Netlify (Frontend), Render (Backend/API), and Firebase (Auth/DB/Functions).

---

## 1️⃣ Git Repository Structure

- **Frontend:** `apps/frontend/`
- **Backend/API:** `apps/backend/`
- **Firebase Functions:** `firebase/functions/`
- **Shared Modules:** `packages/` or `@shared/*`

All deployments are Git-driven. Pushes to `main` trigger CI/CD on Netlify, Render, and optionally Firebase.

---

## 2️⃣ Netlify Frontend (React + Vite)

- **Config:** `netlify.toml`
- **Build Command:** `npm run build` (in root or apps/frontend/)
- **Publish Directory:** `apps/frontend/dist`
- **Environment:**
  - `NODE_VERSION = 18`
  - `VITE_API_BASE_URL = https://your-render-api-url.com`
- **Redirects:** SPA fallback to `/index.html`

Example `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "apps/frontend/dist"
[context.production.environment]
  NODE_VERSION = "18"
  VITE_API_BASE_URL = "https://your-render-api-url.com"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 3️⃣ Render Backend/API

- **Config:** `render.yaml`
- **Build Command:** `cd apps/backend && npm install && npm run build`
- **Start Command:** `node dist/server.js`
- **Environment:**
  - `NODE_ENV = production`
  - `FIREBASE_CONFIG` (set in Render dashboard)

Example `render.yaml`:

```yaml
services:
  - type: web
    name: kp-api
    env: node
    plan: free
    buildCommand: cd apps/backend && npm install && npm run build
    startCommand: node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: FIREBASE_CONFIG
        sync: false
```

---

## 4️⃣ Firebase Hosting + Functions

- **Config:** `firebase.json`
- **Hosting:**
  - `public`: `apps/frontend/dist`
  - `rewrites`: SPA fallback to `/index.html`
- **Functions:**
  - `source`: `firebase/functions`

Example `firebase.json`:

```json
{
  "hosting": {
    "public": "apps/frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "firebase/functions"
  }
}
```

---

## 5️⃣ Endpoints & Environment

- **Frontend:** `https://your-netlify-site.netlify.app/`
- **Backend/API:** `https://your-render-api-url.com/`
- **Firebase Auth/DB:** [Firebase Console](https://console.firebase.google.com/)

---

## 6️⃣ CI/CD & Deployment Flow

- **Netlify:** Auto-deploys on push to `main`.
- **Render:** Auto-deploys on push to `main`.
- **Firebase:** Deploy via CLI or GitHub Actions.

---

## 7️⃣ Credentials & Security

- Store all secrets in environment variables or the respective platform dashboards.
- Never commit `.env` or secrets to Git.

---

## 8️⃣ Staging Environments (Optional)

- Use feature branches for preview/staging deployments.
- Netlify and Render both support branch-based previews.

---

## 9️⃣ Troubleshooting

- **Build Fails:** Check logs on Netlify/Render dashboards.
- **API Errors:** Confirm `VITE_API_BASE_URL` and Firebase configs.
- **Auth Issues:** Check Firebase Console and service account permissions.

---

## 10️⃣ Support

- For deployment or CI/CD issues, check:
  - [Netlify Docs](https://docs.netlify.com/)
  - [Render Docs](https://render.com/docs)
  - [Firebase Docs](https://firebase.google.com/docs/hosting)

---

## 🎉 You are now production-ready
