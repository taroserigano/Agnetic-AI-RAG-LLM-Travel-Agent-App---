# 🚀 Deployment Guide - Render

This guide will help you deploy the Agentic AI Travel Planner to Render.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A [Render account](https://render.com) (free tier is fine)
2. ✅ Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. ✅ API keys ready:
   - OpenAI API Key
   - Clerk API Keys (Publishable & Secret)
   - Amadeus API Keys (optional but recommended)
   - OpenWeather API Key (optional)

---

## 🎯 Deployment Architecture

Render will deploy 3 services:

1. **PostgreSQL Database** - Stores user data, documents, chat history
2. **Backend (FastAPI)** - Python API service on port 8000
3. **Frontend (Next.js)** - React application

---

## 📝 Step-by-Step Deployment

### Step 1: Push Your Code to Git

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Add your remote repository
git remote add origin YOUR_GIT_REPO_URL

# Push to main branch
git push -u origin main
```

### Step 2: Create Render Account & Connect Repository

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Blueprint"**
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file

### Step 3: Configure Environment Variables

Render will prompt you for environment variables. Here's what you need:

#### 🔐 Required Environment Variables

**For Backend Service (`traveler-backend`):**

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_live_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_live_...` |
| `AMADEUS_API_KEY` | Amadeus API key (optional) | Your key |
| `AMADEUS_API_SECRET` | Amadeus API secret (optional) | Your secret |
| `OPENWEATHER_API_KEY` | OpenWeather API key (optional) | Your key |
| `HF_MODEL_NAME` | HuggingFace model | `sentence-transformers/all-MiniLM-L6-v2` |

**For Frontend Service (`traveler-frontend`):**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_live_...` |
| `NEXT_PUBLIC_API_URL` | Backend URL | Auto-filled by Render |
| `NODE_ENV` | Environment | `production` |

**For Database (`traveler-db`):**

Automatically configured by Render - no manual setup needed!

### Step 4: Deploy!

1. Click **"Apply"** or **"Deploy Blueprint"**
2. Render will:
   - Create the PostgreSQL database
   - Build and deploy the backend
   - Build and deploy the frontend
   - Connect everything automatically

3. Wait 5-10 minutes for initial deployment

### Step 5: Run Database Migrations

After deployment completes:

1. Go to your **backend service** (`traveler-backend`)
2. Click **"Shell"** tab
3. Run these commands:

```bash
cd agentic-service
npx prisma migrate deploy
```

This will create all necessary database tables.

### Step 6: Update Clerk Settings

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **"API Keys"** → **"Allowed Origins"**
3. Add your Render URLs:
   - `https://traveler-frontend.onrender.com` (your frontend URL)
   - `https://traveler-backend.onrender.com` (your backend URL)

4. In **"Redirect URLs"**, add:
   - `https://traveler-frontend.onrender.com/*`

---

## 🎉 Your App is Live!

Your application should now be accessible at:

**Frontend:** `https://traveler-frontend.onrender.com`

**Backend API:** `https://traveler-backend.onrender.com`

**Database:** Connected automatically (internal connection)

---

## 🔧 Post-Deployment Configuration

### Update Frontend to Use Production Backend

The `NEXT_PUBLIC_API_URL` should be automatically set, but verify:

1. Go to frontend service → **Environment**
2. Check `NEXT_PUBLIC_API_URL` = `https://traveler-backend.onrender.com`

### Enable CORS for Your Domain

The backend is already configured to accept requests from:
- Your Render frontend URL (via `FRONTEND_URL` env var)
- Localhost (for development)

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Check:**
- All required environment variables are set
- `DATABASE_URL` is properly connected
- Build logs for Python dependency errors

**Solution:**
```bash
# In backend shell
pip install -r requirements.txt
prisma generate
```

### Issue: Frontend can't connect to backend

**Check:**
- `NEXT_PUBLIC_API_URL` is set correctly
- Backend health check passes: `https://traveler-backend.onrender.com/api/v1/agentic/status`
- CORS settings allow your frontend domain

**Solution:**
Add your frontend URL to backend's `FRONTEND_URL` environment variable

### Issue: Database connection errors

**Check:**
- `DATABASE_URL` is connected to the database service
- Database is running (should be automatic)

**Solution:**
- Restart the backend service
- Check database logs

### Issue: Prisma client errors

**Solution:**
```bash
# In backend shell
cd agentic-service
npx prisma generate
npx prisma migrate deploy
```

### Issue: Build failures

**Backend:**
- Check Python version (should be 3.12)
- Verify `requirements.txt` is valid

**Frontend:**
- Check Node version (Render uses latest LTS by default)
- Clear build cache: Settings → Build & Deploy → Clear Build Cache

---

## 💰 Cost Considerations

### Free Tier Limitations

Render's free tier includes:
- ✅ 750 hours/month of service runtime
- ✅ 1GB PostgreSQL database storage
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ Cold starts can take 30-60 seconds

### Upgrading for Production

For better performance:
- **Starter Plan** ($7/month per service): No spin-down, always on
- **Standard Plan** ($25/month per service): More resources, faster performance
- **Database Pro** ($7-20/month): More storage, better performance

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Rebuild affected services
# 3. Deploy the new version
```

### Manual Deployment

You can also manually deploy:
1. Go to your service in Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📊 Monitoring

### View Logs

1. Go to your service in Render
2. Click **"Logs"** tab
3. See real-time logs from your application

### Health Checks

Render automatically monitors:
- **Backend:** `/api/v1/agentic/status`
- **Frontend:** `/`

If health checks fail, Render will attempt to restart the service.

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` files** - Use Render's environment variables
2. ✅ **Use Render's secret storage** - Mark sensitive vars as "secret"
3. ✅ **Enable HTTPS** - Render provides this automatically
4. ✅ **Rotate API keys regularly** - Update in Render dashboard
5. ✅ **Review CORS settings** - Only allow trusted domains

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Python Guide](https://render.com/docs/deploy-fastapi)
- [Render Node.js Guide](https://render.com/docs/deploy-nextjs)
- [Prisma with Render](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **Logs** tab in Render dashboard
2. Review this guide's **Troubleshooting** section
3. Check [Render Community](https://community.render.com)
4. Review the [GitHub Issues](https://github.com/render-examples)

---

## ✅ Deployment Checklist

Use this checklist to ensure everything is set up:

- [ ] Code pushed to Git repository
- [ ] Render account created
- [ ] Repository connected to Render
- [ ] All environment variables configured
- [ ] Blueprint deployed successfully
- [ ] Database migrations run (`prisma migrate deploy`)
- [ ] Clerk settings updated with Render URLs
- [ ] Frontend accessible at Render URL
- [ ] Backend health check passing
- [ ] Test the Travel Agent feature
- [ ] Test document upload in Knowledge Vault
- [ ] Test chat functionality

---

**🎊 Congratulations! Your app is deployed!** 🎊

Visit your frontend URL and start planning amazing trips with AI! ✈️🌍

