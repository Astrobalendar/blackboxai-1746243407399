# 🌌 AstroBalendar – AI-powered KP Astrology – Advanced AI/ML-Based KP Paddhati Stellar Analysis

## 🚀 Project Overview
This project is a production-grade, AI/ML-enhanced KP Paddhati framework for accurate stellar prediction and astrological computation. The architecture is clean, extensible, and optimized for rapid research and deployment.

---

## 📁 Directory Structure

```
astrobalendar/
├── apps/
│   ├── frontend/ 
│   │   ├── src/
│   │   │   ├── components/ 
│   │   │   ├── pages/ 
│   │   │   ├── contexts/ 
│   │   │   ├── hooks/ 
│   │   │   ├── utils/ 
│   │   │   ├── types/ 
│   │   │   ├── firebase/ 
│   │   │   ├── shared/ 
│   │   │   ├── styles/ 
│   │   │   ├── ai/ 
│   ├── backend/ 
│   ├── mobile/ 
├── lib/ 
├── shared/ 
├── firebase/ 
├── scripts/ 
├── tests/ 
├── docs/ 
├── docker/ 
├── .github/ 
├── public/ 
└── configs/ 
```

---

## 🔑 Key Modules
- `SidebarMenu.tsx`: Modular sidebar for layout navigation.
- `contexts/`: Centralized React context providers.
- `firebase/` + `firebase.ts`: Unified Firebase integration.
- `ai/`: (Planned) KP AI/ML prediction logic and data.

---

## ⚙️ Setup & Integration
```bash
npm install
npm run dev
npm run build
npm test
```

    Firebase: Config in src/firebase/, used globally.

    Tailwind: In tailwind.config.js, imported via index.css.

    Routing: Via react-router-dom, src/pages/

    CI/CD: Configured for GitHub Actions, Netlify, Render, or Firebase Hosting

🧠 KP AI/ML Integration

All ML logic lives in src/ai/ and includes:

    models/ – KP predictive models

    datasets/ – Input/validation sets

    processors/ – Input pre-processing

    predict/ – Prediction engine wrapper

    README.md – Module-specific documentation

👥 Contributing

    Add components to src/components/, pages to src/pages/

    Document logic in src/ai/

    Follow TypeScript + accessibility best practices

🛡️ Code Quality

    Linting: ESLint + Prettier

    Strict TypeScript config

    Dead code removed

    Centralized test and mock directories

---

## 🪐 Tech Stack

| Layer      | Tech                             |
|------------|----------------------------------|
| Web        | React + Vite + TypeScript        |
| Mobile     | React Native + Expo              |
| Backend    | FastAPI + MongoDB (Dockerized)   |
| Cloud      | Netlify (frontend), Render (API) |
| Shared     | TypeScript modules for API/types |
| Auth/Sync  | Firebase (optional)              |

---

## 📁 Monorepo Structure

```
astrobalendar/
├── apps/
│   ├── frontend/   → Web (React + Vite)
│   ├── backend/    → API (FastAPI + MongoDB)
│   └── mobile/     → React Native (Expo)
├── shared/         → Shared TS: types, api, utils
├── docker/         → Dockerfiles for each service
└── .github/workflows/ → CI/CD pipelines (optional)
```

---

## ⚙️ Local Development

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/astrobalendar.git
cd astrobalendar
npm install --workspaces
```

### 2. Start Web App
```bash
cd apps/frontend
cp .env.example .env
npm run dev
```

### 3. Start Backend API
```bash
cd apps/backend
uvicorn main:app --reload
```

### 4. Start Mobile App
```bash
cd apps/mobile
npx expo start
```

---

## 🌐 Deployment

| Platform | Hosting   | Setup                     |
|----------|-----------|---------------------------|
| Web      | Netlify   | Connect /apps/frontend dir|
| Backend  | Render    | Deploy /apps/backend, set env vars |
| Mobile   | Expo      | OTA via GitHub or manual EAS config |

---

## 🌍 Environment Variables
See `.env.example` in each app folder. Common keys:
- `VITE_BACKEND_URL`
- `MONGO_URI`
- `FIREBASE_API_KEY`

---

## 🧪 Testing
- Form validation (Jest + DOM testing)
- API unit tests (Pytest)
- Manual export checks (PDF/JSON/image)
- Mobile navigation flow + device testing

---

## 📦 CI/CD
- GitHub Actions workflows: `/frontend.yml`, `/backend.yml`, `/mobile.yml`
- Netlify auto-deploy from main
- Render auto-deploy via webhook

---

## 🛠️ Contributing & Maintainers
- Fork, branch, and PR as usual
- See `CONTRIBUTING.md` (if present) for code style and CI details

---

## 📬 Support & Contact
- File issues or feature requests via GitHub Issues
- For roadmap or onboarding, see the repo Projects/Discussions

---

Happy coding! 🚀
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB Atlas (Free Tier)
- OpenAI API Key (if using GPT chat)

### 🧱 Backend (FastAPI)
```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 🌐 Frontend (Vite + React)
```bash
cd apps/frontend
npm install
npm run dev
```

### 🔐 .env File Examples

**Frontend:**
```ini
VITE_BACKEND_URL=http://localhost:8000
```

**Backend:**
```ini
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/db
JWT_SECRET_KEY=your_secret
JWT_ALGORITHM=HS256
```

---

## 🧪 Usage

- Enter birth details to generate KP chart
- Ask questions in the chatbot: “Will I succeed in my career?”
- Get real-time AI responses or consult a live astrologer (WIP)
- Download reports (PDF export coming soon)

---

## 🗺️ Platform Matrix

| Platform  | Stack                      | Directory         | Deployment      |
|-----------|----------------------------|-------------------|-----------------|
| Web       | React + Vite + TS          | apps/frontend     | Netlify         |
| Mobile    | React Native + Expo        | apps/mobile       | Expo EAS (WIP)  |
| Backend   | FastAPI + MongoDB          | apps/backend      | Render/Docker   |
| Shared    | TypeScript modules         | shared/           | -               |
| Desktop   | Electron (optional)        | apps/desktop      | -               |
| Docker    | Dockerfiles (FE/BE)        | docker/           | -               |

---

## 🗂️ Directory Structure

```sh
astrobalendar/
├── apps/
│   ├── frontend/    # React web client
│   ├── mobile/      # Expo mobile app
│   ├── backend/     # FastAPI backend
│   └── desktop/     # Electron shell (optional)
├── shared/          # Shared TS types, API, utils
├── docker/          # Dockerfiles for frontend/backend
├── .github/workflows/ # CI/CD workflows
└── README.md
```

---

## ⚙️ Local Development

### Backend (FastAPI)
```bash
cd apps/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Vite + React)
```bash
cd apps/frontend
npm install
npm run dev
```

### Mobile (Expo)
```bash
cd apps/mobile
npm install # or yarn install
npx expo start
```

---

## 🔐 Environment Setup

### `.env.example` files are provided in each app folder. Copy to `.env` and fill in required values:

- **Frontend:**
  - `VITE_BACKEND_URL=http://localhost:8000`
- **Backend:**
  - `MONGODB_URI=...`
  - `JWT_SECRET_KEY=...`
  - `OPENAI_API_KEY=...` (if using AstroGPT)
- **Mobile:**
  - `MOBILE_BACKEND_URL=http://localhost:8000`

---

## 🚀 Deployment Notes

- **Frontend:**
  - Connect repo to Netlify, set env vars from `.env.example`.
  - Auto-deploys on push to `main` or `apps/frontend/**`.
- **Backend:**
  - Deploy to Render (Docker or Python), set env vars.
  - Webhook for auto-deploy on push.
- **Mobile:**
  - Expo EAS setup (manual for now, CI scaffolded).

---

## 🔄 CI/CD (GitHub Actions)

- `.github/workflows/frontend.yml`: Lint, build, Netlify trigger
- `.github/workflows/backend.yml`: Python lint/test, Render deploy
- `.github/workflows/mobile.yml`: Lint, typecheck, Expo EAS build (scaffold)

---

## 🧪 Usage

- Enter birth details to generate KP chart
- Ask questions in the chatbot: “Will I succeed in my career?”
- Get real-time AI responses or consult a live astrologer (WIP)
- Download reports (PDF export, JSON, image)

---

## 🗺️ Roadmap

- AI-Powered Daily Horoscope Generator
- Admin Dashboard for Astrologers
- User Authentication + Profile
- Mobile App (React Native)
- Video Chat with Experts
- Full-featured Chart Editor

---

## 🤝 Contributing

PRs welcome! Please open issues before large changes.

---

## 📄 License

MIT – Free to use and modify

Made with ❤️ and KP astrology 🪐
