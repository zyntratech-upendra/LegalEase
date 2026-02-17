# LegalEase Deployment Guide for Render

## Prerequisites

- GitHub repository with LegalEase code
- Render account (https://render.com)
- Firebase project configured
- Google Gemini API keys
- ElevenLabs API key

## Deployment Steps

### 1. Backend Deployment (Express API)

1. **Create Web Service on Render:**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set name: `legalease-backend`
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Select Node environment

2. **Configure Environment Variables:**
   - Go to "Environment" tab
   - Add the following variables:
     ```
     PORT=3001
     NODE_ENV=production
     GEMINI_API_KEY=your_gemini_api_key
     CHAT_API_KEY=your_chat_api_key (optional, falls back to GEMINI_API_KEY)
     SCAN_API_KEY=your_scan_api_key (optional, falls back to GEMINI_API_KEY)
     ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
     ```

3. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., `https://legalease-backend.onrender.com`)

### 2. Frontend Deployment (React + Vite)

1. **Create Static Site on Render:**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Set name: `legalease-frontend`
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`

2. **Configure Environment Variables:**
   - Go to "Environment" tab
   - Add the following variables:
     ```
     VITE_API_URL=https://legalease-backend.onrender.com
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

3. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Your frontend will be available at the provided URL

## Alternative: Vercel Deployment

Vercel is optimized for frontend deployment. Use this approach to deploy the frontend to Vercel while keeping the backend on Render.

### 1. Backend on Render (same steps as above)

Deploy the backend following the "Backend Deployment (Express API)" section above.

### 2. Frontend Deployment on Vercel

1. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Select the root directory

2. **Configure Build Settings:**
   - Framework: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Go to "Settings" → "Environment Variables"
   - Add the following (Production):
     ```
     VITE_API_URL=https://legalease-backend.onrender.com
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically redeploy on every GitHub push

### 3. Environment Variables for Development

On Vercel Preview/Development:
- Add the same environment variables
- Or use different API URLs for development vs production

## Local Development

### With Environment Variables

1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your local API keys
   npm install
   npm start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:3001 (default)
   npm install
   npm run dev
   ```

### Quick Start Commands

```bash
# Terminal 1: Backend
cd backend && npm install && npm start

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables Explained

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | production / development |
| GEMINI_API_KEY | Google Gemini API key | sk-xxxxx |
| CHAT_API_KEY | Chat-specific API key (optional) | sk-xxxxx |
| SCAN_API_KEY | Scanning-specific API key (optional) | sk-xxxxx |
| ELEVEN_LABS_API_KEY | ElevenLabs TTS API key | xxxxx |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API base URL | http://localhost:3001 / https://legalease-backend.onrender.com |
| VITE_FIREBASE_* | Firebase credentials | From Firebase Console |

## API Endpoints

- **Health Check:** `GET /api/health`
- **Chat:** `POST /api/chat` (body: { message, history })
- **Document Scan:** `POST /api/scan` (multipart: document file)
- **Generate Audio:** `POST /api/generate-audio` (body: { text })

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure the backend server has CORS enabled for your frontend domain.

### API URL Not Working
- Verify `VITE_API_URL` is set correctly in frontend environment
- Check backend service is running on Render
- Test with `curl https://your-backend.onrender.com/api/health`

### Firebase Auth Not Working
- Verify all Firebase credentials are correctly set
- Check Firebase is configured for your domain in console

### File Upload Fails
- Check backend has proper multer configuration
- Max file size is 10 MB
- Allowed types: PDF, JPG, PNG

## Monitoring & Logs

1. **Render Dashboard:**
   - View logs for each service
   - Monitor resource usage
   - Check deployment history

2. **Firebase Console:**
   - Monitor authentication events
   - Check Firestore database usage
   - Review security rules

3. **Frontend Errors:**
   - Open browser console (F12)
   - Check browser network tab for API calls
   - Look for CORS or fetch errors

## Security Best Practices

1. **API Keys:**
   - Never commit `.env` files to Git
   - Use Render's or Vercel's environment variables
   - Rotate keys periodically

2. **CORS:**
   - Configure CORS for specific domains
   - Don't use `origin: '*'` in production (currently enabled for dev)

3. **Firebase:**
   - Set proper security rules in Firestore
   - Restrict API access by domain
   - Enable authentication for API endpoints

## Deployment Comparison

| Feature | Render | Vercel |
|---------|--------|--------|
| **Best For** | Backend + Frontend together | Frontend focused |
| **Frontend Hosting** | Static Site | Optimized Hosting |
| **Backend Hosting** | Web Service (Node.js) | Serverless Functions |
| **Free Tier** | Yes (with limitations) | Yes (with limitations) |
| **Cold Start** | ~30s | Instant (cached) |
| **Getting Started** | Easy | Very Easy |
| **Configuration** | render.yaml | vercel.json |

### Recommended Setup

**Option 1: Render** (All-in-one)
- Deploy both backend and frontend on Render
- Simpler setup for beginners
- Use `render.yaml` for configuration

**Option 2: Render Backend + Vercel Frontend** (Recommended)
- Backend on Render (Web Service)
- Frontend on Vercel (optimized hosting)
- Use `render.yaml` for backend, `vercel.json` for frontend
- Best performance and flexibility

**Option 3: Vercel Serverless** (Advanced)
- Convert backend to serverless functions
- Deploy everything on Vercel
- Requires backend refactoring

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Setup Guide](https://firebase.google.com/docs/getting-started)
- [Google Gemini API](https://ai.google.dev/)
- [ElevenLabs API](https://elevenlabs.io/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
