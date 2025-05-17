# 🚀 Astrobalendar Deployment Guide

A full-stack monorepo powered by **React (frontend)**, **Express (backend)**, and **Firebase (auth + database)**. Deployment is split across **Netlify (frontend)** and **Render (backend)** with environment-driven configurations.

## 📁 Project Structure

```
astrobalendar/
├── apps/
│   ├── frontend/  # React frontend (Netlify)
│   └── backend/   # Node.js API backend (Render)
├── firebase/     # Firebase Auth + Firestore
├── .env.example  # Sample environment variables
├── render.yaml   # Render deployment config
└── netlify.toml  # Netlify deployment config
```

## 🛠️ Local Development

### 1. Clone & Install

```bash
git clone https://github.com/your-org/astrobalendar.git
cd astrobalendar

# Frontend
cd apps/frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. Setup Environment Variables

1. Copy `.env.example` to `.env` in both `apps/frontend/` and `apps/backend/`
2. Fill in values for Firebase and API URLs

### 3. Start Local Servers

```bash
# Frontend (http://localhost:3000)
cd apps/frontend
npm run dev

# Backend (http://localhost:3001/api)
cd ../backend
npm run dev
```

## 🧪 Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/astrobalendar.git
cd astrobalendar
```

### 2. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Firebase and other configuration values.

### 3. Install Dependencies

#### Frontend
```bash
cd apps/frontend
npm install
```

#### Backend
```bash
cd ../backend
npm install
```

### 4. Start Development Servers

#### Frontend
```bash
cd apps/frontend
npm run dev
# Access at http://localhost:3000
```

#### Backend
```bash
cd apps/backend
npm run dev
# API available at http://localhost:3001/api
```

## 🚢 Production Deployment

## 🌐 Frontend (Netlify)

### ✅ Configuration

`netlify.toml` is preconfigured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### ✅ Deploy

```bash
cd apps/frontend
npm run build
netlify deploy --prod
```

### ✅ Environment Variables

Set via Netlify Site Settings > Environment:
- `VITE_API_BASE_URL`
- `FIREBASE_*` (auth config)

## 🔧 Backend (Render)

### ✅ Configuration

`render.yaml` defines deployment:

```yaml
services:
  - type: web
    name: astrobalendar-backend
    rootDir: apps/backend
    buildCommand: npm install
    startCommand: npm run start
    env: node
```

### ✅ Deploy

1. Connect repo in Render dashboard
2. Render will auto-deploy on push

### ✅ Environment Variables

Set via Render > Environment:
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PROJECT_ID`
- `PORT`

## 🔐 Environment Variables

| Variable Name | Frontend | Backend | Description |
|--------------|----------|---------|-------------|
| VITE_API_BASE_URL | ✅ | | Backend base URL (used in frontend) |
| FIREBASE_API_KEY | ✅ | | Firebase Web key |
| FIREBASE_AUTH_DOMAIN | ✅ | | Firebase Auth domain |
| FIREBASE_PROJECT_ID | ✅ | ✅ | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | | ✅ | Firebase admin client email |
| FIREBASE_PRIVATE_KEY | | ✅ | Firebase admin private key |
| PORT | | ✅ | Backend server port |

> Use `.env.example` as reference.

## 🔁 CI/CD Pipelines

### Netlify
- Auto-deploys frontend on push
- PR preview builds
- Rollback support

### Render
- Auto-deploys backend on push
- Logs, deploy history available in dashboard

## 🧪 Testing & Validation

### Local Testing
- `npm run dev` on both frontend/backend
- Verify frontend can fetch backend APIs
- Ensure Firebase login and Firestore reads/writes work

### Production Testing
- Open deployed Netlify app
- Confirm login, data fetching, and backend responses work correctly

## 🧰 Maintenance

### Dependencies

```bash
cd apps/frontend && npm update
cd ../backend && npm update
```

### Firebase
- Manage auth and Firestore from Firebase Console
- Rotate service keys if necessary

## 🧯 Troubleshooting

| Problem | Fix |
|---------|-----|
| API fetch fails | Check `VITE_API_BASE_URL` in frontend `.env` |
| Auth not working | Verify Firebase keys & auth domain |
| Backend errors | View logs in Render dashboard |
| Netlify build fails | Check `netlify.toml` and build output |

## ✅ Summary

- **Frontend**: Netlify
- **Backend**: Render
- **Firebase**: Auth + DB
- Configured for CI/CD, clear `.env`, and full local dev

This guide ensures every team member can confidently develop, deploy, and maintain Astrobalendar across platforms.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
