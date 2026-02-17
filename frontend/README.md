# ⚖️ LegalEase — AI-Powered Legal Assistance Platform

A modern, full-stack legal assistance platform built with **React + Vite** and **Node.js + Express**, featuring AI-powered document scanning, real-time legal chat, multilingual text-to-speech, and lawyer matchmaking.

---

## 🚀 Features

### 👤 Authentication & Roles
- Firebase Authentication (Email + Google Sign-In)
- Role-based access: **Citizen** and **Lawyer** dashboards
- Lawyer ID verification with file uploads

### 📄 Smart Legal Scanner
- **Self-hosted OCR** via Tesseract.js (unlimited, no API limits)
- **AI Summarization** powered by Gemini 1.5 Flash
- **Text-to-Speech** via ElevenLabs API (MP3 audio generation)
- Supports PDF, JPG, PNG, WebP, BMP, TIFF (up to 10MB)
- Multilingual translation (English, Hindi, Telugu)

### 💬 AI Legal Chat Assistant
- Context-aware legal Q&A powered by Gemini
- Specialized in Indian law — refuses non-legal queries
- Chat history management

### 🔔 Real-Time Notifications
- Firestore-powered with real-time `onSnapshot` listeners
- Unread badge count on bell icon
- Mark as read / Mark all as read
- Welcome notification on first login

### 👨‍⚖️ Lawyer Dashboard
- Client request management with accept/reject
- Phone and call integration
- Personalized greeting with lawyer name

### 🔍 Find Lawyers
- Searchable lawyer directory
- Filter by specialization, location
- Submit case requests with case title

### 📋 My Requests
- Track submitted case requests
- View request status and history

### 🗄️ Secure Vault
- Archive scanned documents to Firestore
- Document management with timestamps

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **OCR** | Tesseract.js (self-hosted) |
| **AI** | Google Gemini 1.5 Flash |
| **TTS** | ElevenLabs API |
| **PDF Parsing** | pdf-parse |

---

## 📁 Project Structure

```
LegalEase_sem/
├── src/
│   ├── components/          # React components
│   │   ├── SmartScanner.jsx
│   │   ├── AIChatAssistant.jsx
│   │   ├── FindLawyers.jsx
│   │   ├── NotificationDropdown.jsx
│   │   ├── TopBar.jsx
│   │   └── ...
│   ├── pages/               # Dashboard pages
│   │   ├── UserDashboard.jsx
│   │   └── LawyerDashboard.jsx
│   ├── context/             # Auth context
│   ├── config/              # Firebase config
│   └── utils/               # API utilities
│       ├── gemini.js
│       └── notificationService.js
├── services/                # Backend services
│   ├── ocrService.js        # Tesseract OCR
│   ├── geminiService.js     # Gemini AI
│   └── ttsService.js        # ElevenLabs TTS
├── controllers/
│   └── scanController.js    # Scan orchestrator
├── routes/
│   └── scanRoute.js         # /api/scan endpoint
├── server.js                # Express backend
├── .env.example             # Environment template
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/LegalEase.git
cd LegalEase
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI (get from https://aistudio.google.com/apikey)
CHAT_API_KEY=your_gemini_key_for_chat
SCAN_API_KEY=your_gemini_key_for_scan

# ElevenLabs TTS (get from https://elevenlabs.io)
ELEVEN_LABS_API_KEY=your_elevenlabs_key
```

### 4. Start the backend server
```bash
node server.js
```

### 5. Start the frontend dev server
```bash
npm run dev
```

### 6. Open in browser
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 🔑 API Keys Required

| Service | Get Key From | Free Tier |
|:---|:---|:---|
| **Firebase** | [Firebase Console](https://console.firebase.google.com) | Generous free tier |
| **Gemini AI** | [Google AI Studio](https://aistudio.google.com/apikey) | 1,500 req/day per project |
| **ElevenLabs** | [ElevenLabs](https://elevenlabs.io) | 10,000 chars/month |

> **Tip:** Create Gemini keys from two different Google Cloud projects to get 3,000 requests/day total.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| POST | `/api/scan` | Upload document → OCR → AI Summary → TTS Audio |
| POST | `/api/chat` | Legal chat with Gemini AI |
| POST | `/api/translate` | Translate text to target language |
| POST | `/api/generate-audio` | Generate TTS audio from text |

---

## 👥 Team

Built for **Smart India Hackathon** — LegalEase Team

---

## 📄 License

This project is for educational and hackathon purposes.
