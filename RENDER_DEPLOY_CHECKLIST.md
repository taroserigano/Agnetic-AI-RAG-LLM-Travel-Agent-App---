# ✅ Render Deployment Checklist

Use this quick checklist when deploying to Render.

## 📋 Pre-Deployment

- [ ] Code is working locally
- [ ] All tests pass
- [ ] `.env` files are NOT in git (check `.gitignore`)
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Have all required API keys ready

## 🔑 API Keys Required

Gather these before starting deployment:

- [ ] OpenAI API Key (`sk-proj-...`)
- [ ] Clerk Publishable Key (`pk_test_...` or `pk_live_...`)
- [ ] Clerk Secret Key (`sk_test_...` or `sk_live_...`)
- [ ] Amadeus API Key (optional)
- [ ] Amadeus API Secret (optional)
- [ ] OpenWeather API Key (optional)

## 🚀 Render Setup

- [ ] Created Render account at [render.com](https://render.com)
- [ ] Connected Git repository to Render
- [ ] Selected "Blueprint" deployment option
- [ ] Render detected `render.yaml` file

## ⚙️ Configuration

### Backend Service (`traveler-backend`)

- [ ] Set `OPENAI_API_KEY`
- [ ] Set `CLERK_SECRET_KEY`
- [ ] Set `AMADEUS_API_KEY` (optional)
- [ ] Set `AMADEUS_API_SECRET` (optional)
- [ ] Set `OPENWEATHER_API_KEY` (optional)
- [ ] Set `HF_MODEL_NAME` = `sentence-transformers/all-MiniLM-L6-v2`
- [ ] `DATABASE_URL` auto-connected ✓
- [ ] `FRONTEND_URL` will be set after frontend deploys

### Frontend Service (`traveler-frontend`)

- [ ] Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Set `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_API_URL` auto-connected ✓
- [ ] `DATABASE_URL` auto-connected ✓
- [ ] `NODE_ENV` = `production` ✓

### Database Service (`traveler-db`)

- [ ] Auto-configured by Render ✓

## 🎬 Deployment

- [ ] Clicked "Apply" or "Deploy Blueprint"
- [ ] Waited 5-10 minutes for build to complete
- [ ] All 3 services show green "Live" status
- [ ] No build errors in logs

## 🗄️ Database Setup

After deployment completes:

- [ ] Opened backend service shell
- [ ] Ran: `cd agentic-service`
- [ ] Ran: `npx prisma migrate deploy`
- [ ] Migration completed successfully

## 🔐 Clerk Configuration

In [Clerk Dashboard](https://dashboard.clerk.com):

- [ ] Added frontend Render URL to "Allowed Origins"
- [ ] Added backend Render URL to "Allowed Origins"
- [ ] Added frontend URL to "Redirect URLs": `https://traveler-frontend.onrender.com/*`

## 🧪 Testing

- [ ] Frontend URL loads successfully
- [ ] Can sign in/sign up with Clerk
- [ ] Backend health check works: `/api/v1/agentic/status`
- [ ] Can upload document to Knowledge Vault
- [ ] Can generate travel plan in Travel Agent
- [ ] Can chat in Chat tab
- [ ] No console errors in browser

## 🔄 Post-Deployment

- [ ] Update frontend `FRONTEND_URL` in backend env vars
- [ ] Verify CORS is working (no CORS errors in browser console)
- [ ] Test all major features
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts (optional)

## 📊 Performance Check

- [ ] Page load time acceptable
- [ ] API responses fast
- [ ] No timeout errors
- [ ] Database queries working

## 🎉 Launch!

- [ ] All features working
- [ ] No critical errors
- [ ] Users can access the app
- [ ] Share your deployed URL! 🚀

---

## 🆘 If Something Goes Wrong

1. **Check Logs**: Each service has a "Logs" tab
2. **Check Environment Variables**: Settings → Environment
3. **Check Build Logs**: Look for errors during build
4. **Restart Services**: Manual Deploy → Deploy Latest Commit
5. **Review [DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed troubleshooting

---

## 📝 Your Deployed URLs

Fill these in after deployment:

- **Frontend**: `https://traveler-frontend.onrender.com`
- **Backend**: `https://traveler-backend.onrender.com`
- **Database**: (Internal - auto-connected)

---

**Last Updated**: After completing deployment

**Deployment Status**: 
- [ ] In Progress
- [ ] Deployed Successfully ✅
- [ ] Needs Fixes 🔧

