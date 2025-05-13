# KP Newcombe Stellar Astrology Platform - Source Package Documentation

## 1. Project Structure
```
kp-newcombe-stellar/
├── apps/            # Main application code
│   ├── frontend/    # Web application
│   └── mobile/      # Mobile application
├── backend/         # Node.js functions
├── shared/          # Shared code
├── DOCS/           # Documentation
└── config/         # Configuration files
```

## 2. Source Code Organization

### Web Application
- **Components**: Reusable UI components
- **Pages**: Main application pages
- **Services**: API and utility services
- **Types**: TypeScript definitions
- **Styles**: Styling and themes
- **Utils**: Helper functions

### Mobile Application
- **Screens**: Mobile-specific screens
- **Components**: Mobile components
- **Navigation**: Navigation setup
- **Assets**: Mobile assets
- **Utils**: Mobile utilities

### Backend
- **Functions**: Cloud functions
- **Models**: Data models
- **Controllers**: API controllers
- **Services**: Backend services
- **Security**: Role-based access

## 3. API Documentation

### Authentication
- `/auth/login`
- `/auth/signup`
- `/auth/verify`

### Prediction Engine
- `/api/predict`
- `/api/predict/edit`
- `/api/predict/history`

### Horoscope Management
- `/api/horoscope`
- `/api/horoscope/rectify`
- `/api/horoscope/export`

### User Management
- `/api/user`
- `/api/user/profile`
- `/api/user/settings`

## 4. Database Schema

### Users
```typescript
interface User {
  id: string;
  fullName: string;
  role: 'astrologer' | 'client' | 'student' | 'admin';
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Horoscopes
```typescript
interface Horoscope {
  id: string;
  userId: string;
  fullName: string;
  birthDetails: {
    date: string;
    time: string;
    place: string;
    lat: number;
    lng: number;
  };
  rectifiedTime: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 5. Deployment Instructions

### 1. Local Preview & Verification
- Use the local development server to **preview all modules**:
  - Web App (React.js)
  - Mobile Emulator (Expo Go or web preview)
  - Prediction outputs, AI/ML response formats
  - Chart visualizations (KP, Dasa, Transit, etc.)
  - PDF/Excel export behavior
- Ensure all Firebase Auth, Firestore sync, and prediction endpoints work in dev environment.

### 2. GitHub Integration
- Push the verified source code to the appropriate GitHub repository:
  - Repo name: `kp-astrobalendar-platform`
  - Structure:
    ```
    /web-app
    /mobile-app
    /functions (for Firebase Functions)
    /docs (Build Summary, Deployment URLs, API Docs, etc.)
    ```
- Include:
  - `BUILD_SUMMARY.md`
  - `DEPLOYMENT_PREVIEW.md`
  - `SOURCE_PACKAGE.md`

### 3. Astrobalendar.com Staging
- Use preview from `astrobalendar.com` domain:
  - Configure subdomain (e.g., `preview.astrobalendar.com`) to serve staging build
  - Link GitHub repo to staging environment

### 4. Netlify Deployment
- Use **Netlify** to deploy the React.js frontend:
  - Connect GitHub repo
  - Set up continuous deployment on push to `main` branch
  - Add environment variables for Firebase config
  - Enable Netlify forms and asset optimizations

### 5. Final DNS Update
- Once preview is approved:
  - Switch DNS for `www.astrobalendar.com` to point to Netlify live deployment
  - Retain `preview.astrobalendar.com` for staging

---

**Last Updated**: 2025-05-13
**Version**: 1.0.0
