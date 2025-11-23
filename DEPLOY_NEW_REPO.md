# 🔀 Deploy from New Repository - Step by Step

Follow these steps to push your code to a new repository and deploy from there.

## 📝 Prerequisites

- [ ] Code is working locally
- [ ] All changes are committed
- [ ] You have a GitHub/GitLab account

---

## 🚀 Step-by-Step Instructions

### Step 1: Create New Repository (2 min)

1. Go to [GitHub](https://github.com/new) or [GitLab](https://gitlab.com/projects/new)
2. Repository name: `ai-travel-planner` (or whatever you prefer)
3. Description: "AI-powered travel planning application with RAG and agentic workflows"
4. Visibility: **Public** or **Private** (both work with Render)
5. ⚠️ **DO NOT** check "Initialize with README"
6. ⚠️ **DO NOT** add .gitignore or license (you already have these)
7. Click **"Create repository"**
8. Copy the repository URL (e.g., `https://github.com/yourusername/ai-travel-planner.git`)

---

### Step 2: Verify No Secrets in Git (1 min)

```bash
# Make sure .env files are not tracked
git status

# Check .gitignore includes .env
cat .gitignore | grep .env

# If .env is tracked, remove it:
# git rm --cached .env
# git rm --cached agentic-service/.env
# git commit -m "Remove .env from tracking"
```

✅ **Expected**: `.env` files should NOT appear in `git status`

---

### Step 3: Add New Remote Repository (1 min)

```bash
# Option A: Add as new remote called 'deploy'
git remote add deploy YOUR_NEW_REPO_URL

# Example:
# git remote add deploy https://github.com/yourusername/ai-travel-planner.git

# Option B: Replace existing 'origin' with new repo
# git remote set-url origin YOUR_NEW_REPO_URL

# Verify remote was added
git remote -v
```

✅ **Expected Output**:
```
deploy  https://github.com/yourusername/ai-travel-planner.git (fetch)
deploy  https://github.com/yourusername/ai-travel-planner.git (push)
```

---

### Step 4: Push to New Repository (2 min)

```bash
# Check what branch you're on
git branch

# If you're on 'main' branch:
git push -u deploy main

# If you're on 'master' branch:
git push -u deploy master

# If you want to push all branches:
git push -u deploy --all

# Push tags too (optional):
git push deploy --tags
```

✅ **Expected**: Code pushed successfully to new repository

---

### Step 5: Verify on GitHub/GitLab (1 min)

1. Go to your new repository URL
2. Check that files are there:
   - ✅ `render.yaml`
   - ✅ `package.json`
   - ✅ `agentic-service/` folder
   - ✅ `components/` folder
   - ✅ All deployment docs
3. ⚠️ Make sure `.env` files are **NOT** visible

---

### Step 6: Deploy on Render (5 min)

1. Go to [render.com](https://render.com)
2. Sign in or create account
3. Click **"New +"** → **"Blueprint"**
4. Click **"Connect a repository"**
5. If first time:
   - Click "Connect GitHub" or "Connect GitLab"
   - Authorize Render to access your repositories
6. Select your **new repository** from the list
7. Render will detect `render.yaml` automatically
8. Click **"Apply"**

---

### Step 7: Add Environment Variables (3 min)

Render will prompt for these values:

#### Backend Service

```
OPENAI_API_KEY=sk-proj-your-key-here
CLERK_SECRET_KEY=sk_test_your-key-here
AMADEUS_API_KEY=your-amadeus-key (optional)
AMADEUS_API_SECRET=your-amadeus-secret (optional)
OPENWEATHER_API_KEY=your-weather-key (optional)
```

#### Frontend Service

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
CLERK_SECRET_KEY=sk_test_your-key-here
```

Click **"Apply"** to start deployment.

---

### Step 8: Wait for Build (5-10 min)

☕ Grab a coffee while Render:
- Creates PostgreSQL database
- Builds backend (Python dependencies)
- Builds frontend (Next.js)
- Connects services

✅ **Expected**: All 3 services show green "Live" status

---

### Step 9: Run Database Migration (2 min)

1. Go to **"traveler-backend"** service in Render
2. Click **"Shell"** tab
3. Wait for shell to load
4. Run these commands:

```bash
cd agentic-service
npx prisma migrate deploy
```

✅ **Expected**: "Migration completed successfully"

---

### Step 10: Update Clerk Settings (2 min)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **"API Keys"** → **"Domains"**
4. Add these URLs:
   - `https://traveler-frontend.onrender.com` (your actual URL)
   - `https://traveler-backend.onrender.com` (your actual URL)

5. Go to **"Paths"** → **"Redirect URLs"**
6. Add: `https://traveler-frontend.onrender.com/*`

---

### Step 11: Test Your Deployment 🎉

Visit: `https://traveler-frontend.onrender.com`

Test these features:
- [ ] Sign up / Log in works
- [ ] Travel Agent generates itinerary
- [ ] Top 10 places show up
- [ ] Daily plans appear
- [ ] Knowledge Vault upload works
- [ ] Chat works

---

## 🔄 Future Deployments

Now every time you push to your new repository, Render auto-deploys:

```bash
# Make changes
git add .
git commit -m "New feature"
git push deploy main

# Render automatically rebuilds and deploys!
```

---

## 🔧 Troubleshooting

### Issue: "Permission denied" when pushing

**Solution**: Make sure you have access to the repository
```bash
# For HTTPS (will prompt for username/password):
git remote set-url deploy https://github.com/yourusername/repo.git

# For SSH (if you have SSH keys set up):
git remote set-url deploy git@github.com:yourusername/repo.git
```

### Issue: "src refspec main does not match any"

**Solution**: You're on 'master' branch, not 'main'
```bash
git push deploy master
# Or rename your branch:
git branch -M main
git push deploy main
```

### Issue: ".env file is in the repository"

**Solution**: Remove it from tracking
```bash
git rm --cached .env
git rm --cached agentic-service/.env
git commit -m "Remove .env from tracking"
git push deploy main
```

### Issue: "Repository not found"

**Solution**: Check the URL is correct
```bash
# Remove and re-add the remote
git remote remove deploy
git remote add deploy CORRECT_URL_HERE
git push -u deploy main
```

---

## 📋 Summary

| Step | Command | Time |
|------|---------|------|
| 1. Create repo | (Web UI) | 2 min |
| 2. Check secrets | `git status` | 1 min |
| 3. Add remote | `git remote add deploy URL` | 1 min |
| 4. Push code | `git push -u deploy main` | 2 min |
| 5. Verify | (Web UI) | 1 min |
| 6. Deploy | Render Blueprint | 5 min |
| 7. Add env vars | (Render UI) | 3 min |
| 8. Wait for build | ☕ | 5-10 min |
| 9. Run migration | `prisma migrate deploy` | 2 min |
| 10. Update Clerk | (Web UI) | 2 min |
| 11. Test | (Browser) | 5 min |

**Total: ~30-35 minutes**

---

## ✅ Checklist

- [ ] New repository created on GitHub/GitLab
- [ ] No `.env` files in git
- [ ] Remote added (`git remote add deploy URL`)
- [ ] Code pushed (`git push -u deploy main`)
- [ ] Code visible on GitHub/GitLab
- [ ] Render connected to new repository
- [ ] Blueprint deployed
- [ ] Environment variables added
- [ ] All services showing "Live"
- [ ] Database migration run
- [ ] Clerk settings updated
- [ ] Application tested and working

---

## 🎉 You're Done!

Your app is now:
- ✅ Deployed from your own repository
- ✅ Automatically deploying on push
- ✅ Live on the internet
- ✅ Secure and production-ready

**Your URLs:**
- Frontend: `https://traveler-frontend.onrender.com`
- Backend: `https://traveler-backend.onrender.com`

Share your app with the world! 🌍✈️🚀

---

## 💡 Pro Tips

1. **Use meaningful commit messages** - They appear in Render's deployment history
2. **Tag releases** - Use git tags for version tracking
3. **Branch deploys** - Create preview deployments for feature branches
4. **Monitor logs** - Check Render dashboard regularly
5. **Set up notifications** - Get alerts on deployment success/failure

---

**Need help?** Check:
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Detailed deployment guide
- [`RENDER_DEPLOY_CHECKLIST.md`](./RENDER_DEPLOY_CHECKLIST.md) - Full checklist
- [Render Community](https://community.render.com) - Community support

