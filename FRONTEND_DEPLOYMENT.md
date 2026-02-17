# LegalEase + Render Frontend Deployment Quick Guide

## Option A: Deploy to Vercel (Recommended for Frontend)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Go to Vercel
- Visit: https://vercel.com
- Click "New Project"
- Select your GitHub repository
- Framework: **Vite**
- Root Directory: **.** (monorepo)

### 3. Build Settings
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `npm install`

### 4. Environment Variables
Add these in Vercel settings:

```
VITE_API_URL=https://your-backend.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Deploy
- Click "Deploy"
- Wait for build to complete
- Your frontend will be live! 🎉

---

## Option B: Deploy to Render (All-in-one)

### 1. Push to GitHub (if not done)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Go to Render
- Visit: https://render.com
- Click "New +" → "Static Site"
- Select your GitHub repository

### 3. Settings
- **Name:** `legalease-frontend`
- **Build Command:** `cd frontend && npm install && npm run build`
- **Publish Directory:** `frontend/dist`

### 4. Environment Variables
- Go to "Environment" tab
- Add all VITE_* variables (same as Vercel above)

### 5. Deploy
- Click "Create Static Site"
- Deployment will start automatically
- Your site will be live! 🎉

---

## Local Testing Before Deployment

### 1. Update Frontend .env
```bash
cd frontend
# Edit .env and update Firebase credentials
nano .env
# Or use your editor to add Firebase keys
```

### 2. Install & Build
```bash
npm install
npm run build
npm run preview  # Preview the production build
```

### 3. Test the Build
- Open: http://localhost:4173 (or shown URL)
- Test login, chat, document scanning
- Check browser console for errors

---

## Environment Variables Needed

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Your backend URL |
| `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `project-123` | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | `project.appspot.com` | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase Console |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc...` | Firebase Console |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-ABC123` | Firebase Console |

---

## Getting Firebase Credentials

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ (Settings) → "Project Settings"
4. Scroll down to "Your apps"
5. Click on your web app
6. Copy the `firebaseConfig` object
7. Paste values into environment variables

---

## Troubleshooting

### Build Fails: "Cannot find module"
- Make sure `cd frontend` is in build command
- Check `.env` has all required variables

### API Calls Fail
- Verify `VITE_API_URL` points to your backend
- Check backend is running (test `/api/health`)
- Check CORS is enabled in backend

### Firebase Auth Not Working
- Verify all Firebase credentials are correct
- Check Firebase console for domain restrictions
- Enable authentication methods in Firebase

### Blank Page on Deploy
- Check browser console (F12) for errors
- Verify `.env` variables are set correctly
- Check `/api/health` endpoint works

---

## Files Ready for Deployment

✅ `frontend/.env` - Environment variables  
✅ `frontend/vite.config.js` - Vite configuration  
✅ `vercel.json` - Vercel configuration  
✅ `render.yaml` - Render configuration  
✅ `DEPLOYMENT.md` - Detailed deployment guide  

---

## Next Steps

1. **Add Firebase Credentials** to `frontend/.env`
2. **Test Locally:** `npm run build && npm run preview`
3. **Deploy:** Choose Vercel or Render
4. **Monitor:** Check logs for any issues

**Good luck! 🚀**
