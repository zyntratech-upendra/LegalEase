# LegalEase

A comprehensive legal assistance platform powered by AI, combining document scanning, legal AI chat, and lawyer matching services.

## Project Structure

```
LegalEase/
├── backend/              # Express.js API server
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic (OCR, Gemini, TTS)
│   ├── server.js        # Main application file
│   └── package.json     # Backend dependencies
│
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── config/      # Configuration files (Firebase)
│   │   ├── context/     # React context (Auth)
│   │   └── utils/       # Utility functions
│   ├── public/          # Static assets
│   ├── vite.config.js   # Vite configuration
│   └── package.json     # Frontend dependencies
│
└── README.md            # This file
```

## Prerequisites

- **Node.js** 16+ and **npm/yarn**
- **Gemini API Key** (for scanning and chat functionality)
- **ElevenLabs API Key** (for text-to-speech)
- **Firebase** credentials (for authentication)

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your API keys
npm start
```

Backend runs on: `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173` (Vite default)

## Development

### Running Both Services Together

**Option 1: Separate terminals**
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Option 2: Using mock server (for testing without backend)**
```bash
cd frontend
npm run mock-server
```

## Key Features

- **Smart Scanner**: Upload legal documents (PDF/Images) for OCR + AI analysis
- **AI Legal Chat**: Ask legal questions powered by Gemini AI
- **Text-to-Speech**: Generate audio summaries using ElevenLabs
- **User Authentication**: Firebase-based user authentication
- **Lawyer Matching**: Find and connect with legal professionals

## Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_key
CHAT_API_KEY=your_gemini_key
SCAN_API_KEY=your_gemini_key
ELEVEN_LABS_API_KEY=your_elevenlabs_key
PORT=3001
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## API Endpoints

### Chat API
- `POST /api/chat` - Send a message for legal advice

### Scan API
- `POST /api/scan` - Upload and scan a document

### Health Check
- `GET /api/health` - Server status

## Technologies Used

### Backend
- Express.js
- Google Generative AI (Gemini)
- Tesseract.js (OCR)
- Multer (File uploads)
- CORS

### Frontend
- React 19
- Vite
- React Router
- Firebase
- Tailwind CSS
- Framer Motion

## Contributing

Guidelines for contributing to LegalEase coming soon.

## License

MIT
