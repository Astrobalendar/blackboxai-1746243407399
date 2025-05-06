# 🌌 AstroBalendar – AI-powered KP Astrology App

AstroBalendar is a modern, mobile-first astrology platform that brings the power of KP Stellar astrology to your fingertips — with real-time predictions powered by AI/ML, dynamic charting, and chat-based guidance.

---

## 👥 Who It's For

- Astrologers and astrology enthusiasts
- Individuals seeking accurate, science-backed KP predictions
- Users curious about health, career, or relationship forecasts

---

## 🚀 Features

### ✅ Frontend (Vite + React + TypeScript)
- 🔮 KP Chart Visualizer (Rasi, Navamsa)
- 💬 AstroGPT Chat UI
- 📅 Event Calendar placeholder
- 📜 Report Generator (PDF - WIP)

### ✅ Backend (FastAPI + MongoDB Atlas)
- `POST /predict`: Generate KP predictions
- `POST /chat`: AI assistant (OpenAI GPT integrated)
- MongoDB for storing charts, predictions, user info

---

## 🛠️ Setup Instructions

### 📦 Prerequisites
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
