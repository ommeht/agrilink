# 🚀 AgriLink Deployment Guide

## Quick Deploy (Free Hosting)

### Prerequisites
- GitHub account
- MongoDB Atlas (already configured ✅)

---

## Step 1: Push to GitHub

```bash
cd c:\Users\ommeh\Desktop\proje\agrilink
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Deploy Backend on Render

1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `ommeht/agrilink`
4. Configure:
   ```
   Name: agrilink-backend
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node src/server.js
   Instance Type: Free
   ```

5. **Environment Variables** → Add these:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://ommehta708_db_user:xBhmQEI0GifMd5ra@cluster0.df7yks1.mongodb.net/agrilink?retryWrites=true&w=majority
   JWT_SECRET=agrilink_super_secret_jwt_key_2024
   JWT_EXPIRE=7d
   NODE_ENV=production
   FRONTEND_URL=https://agrilink.vercel.app
   ```
   *(Update FRONTEND_URL after deploying frontend)*

6. Click **"Create Web Service"**
7. Wait 3-5 minutes → Copy your backend URL (e.g., `https://agrilink-backend.onrender.com`)

---

## Step 3: Deploy Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `ommeht/agrilink`
4. Configure:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install --legacy-peer-deps
   ```

5. **Environment Variables** → Add:
   ```
   REACT_APP_API_URL = https://agrilink-backend.onrender.com/api
   ```
   *(Replace with your actual Render backend URL)*

6. Click **"Deploy"**
7. Wait 2-3 minutes → You get a URL like `https://agrilink.vercel.app`

---

## Step 4: Update Backend CORS

1. Go back to **Render** → your backend service
2. **Environment** → Edit `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://agrilink.vercel.app
   ```
   *(Use your actual Vercel URL)*
3. Click **"Save Changes"** → Render auto-redeploys

---

## Step 5: Test Your Live App

1. Open your Vercel URL: `https://agrilink.vercel.app`
2. Register a new account
3. Check MongoDB Atlas → you should see data in the `users` collection
4. Test all features: add products, place orders, reviews, etc.

---

## Alternative Hosting Options

### Backend Alternatives:
- **Railway.app** (Free $5 credit/month, no sleep)
- **Cyclic.sh** (Free, no sleep)
- **AWS EC2 Free Tier** (More complex setup)
- **Heroku** ($5/month minimum)

### Frontend Alternatives:
- **Netlify** (Free, similar to Vercel)
- **GitHub Pages** (Free, but requires HashRouter)
- **Cloudflare Pages** (Free)

### Database:
- MongoDB Atlas Free Tier (512MB) — already using ✅

---

## Important Notes

⚠️ **Render Free Tier Limitation:**
- Backend spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Solution: Upgrade to $7/month or use Railway/Cyclic

✅ **Vercel Free Tier:**
- No sleep, instant response
- 100GB bandwidth/month
- Perfect for frontend

---

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads correctly
- [ ] Register a test user
- [ ] Check MongoDB Atlas for new data
- [ ] Test image uploads
- [ ] Test order flow
- [ ] Create an admin user in MongoDB Atlas
- [ ] Test all roles (customer, farmer, admin)

---

## Custom Domain (Optional)

### Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `agrilink.com`)
3. Update DNS records as shown

### Render:
1. Go to your service → **Settings** → **Custom Domain**
2. Add domain → Update DNS CNAME record

---

## Troubleshooting

**Backend not connecting to MongoDB:**
- Check Atlas Network Access → `0.0.0.0/0` is whitelisted
- Verify `MONGO_URI` in Render environment variables

**Frontend can't reach backend:**
- Check `REACT_APP_API_URL` in Vercel
- Check `FRONTEND_URL` in Render
- Check browser console for CORS errors

**Images not loading:**
- Render free tier doesn't persist uploaded files
- Solution: Use **Cloudinary** or **AWS S3** for image storage (requires code changes)

---

Need help with any step? Let me know!
