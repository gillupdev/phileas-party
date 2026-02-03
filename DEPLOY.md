# Deploying Phileas Birthday Party Website

## Option 1: Railway (Recommended - Free Tier)

### Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., "phileas-birthday")
3. Push your code:

```bash
cd phileas-birthday
git init
git add .
git commit -m "Initial commit - Phileas birthday party website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/phileas-birthday.git
git push -u origin main
```

### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your "phileas-birthday" repository
6. Railway will automatically detect and deploy!

### Step 3: Get Your URL
- Railway will give you a URL like: `https://phileas-birthday-production.up.railway.app`
- Share this URL with Phileas's classmates!

---

## Option 2: Render (Free Tier)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Click "Create Web Service"

---

## Option 3: Fly.io (Free Tier)

1. Install Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Run:
```bash
fly auth signup
fly launch
fly deploy
```

---

## Local Development

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend with hot reload):
```bash
npm run start:dev
```

Or run production build locally:
```bash
npm run build
npm start
```

Then open http://localhost:3000

---

## Environment Notes

- The SQLite database (`birthday.db`) is created automatically
- On free tiers, the database resets when the server sleeps/restarts
- For persistent data, consider upgrading or using a cloud database
