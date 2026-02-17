# Image Setup Instructions

## To add your login background and logo:

### Option 1: Manual Upload (Recommended)
1. Open your file explorer
2. Navigate to: `src/assets/images/` folder
3. Copy your two images:
   - Logo image → rename to `logo.png`
   - Background image (lawyer handshake) → rename to `login-bg.png`
4. Paste them in the `images` folder

### Option 2: Using Public Folder
1. Create a `public` folder in the root if it doesn't exist
2. Place images there and update paths in Login.jsx:
   ```js
   const logo = '/logo.png';
   const loginBg = '/login-bg.png';
   ```

### Current Status:
- ✅ Glassmorphism UI implemented
- ✅ Image paths configured
- ⏳ Waiting for images to be placed in `src/assets/images/`

The page will use a gradient fallback until the images are added.
