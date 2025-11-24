# Render Environment Variables Setup Guide

## Critical: Required Environment Variables

Your frontend is failing because Clerk authentication isn't configured. Follow these steps:

---

## Step 1: Get Your Clerk API Keys

1. Go to https://dashboard.clerk.com
2. Select your application (or create a new one)
3. Go to **API Keys** section
4. Copy both:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

---

## Step 2: Configure Clerk in Render Dashboard

### For Frontend Service (traveler-frontend):

1. Go to https://dashboard.render.com
2. Select your `traveler-frontend` service
3. Go to **Environment** tab
4. Add/Update these variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_your_key_here
CLERK_SECRET_KEY = sk_test_your_secret_here
```

### For Backend Service (traveler-backend):

1. Select your `traveler-backend` service
2. Go to **Environment** tab
3. Add:

```
CLERK_SECRET_KEY = sk_test_your_secret_here
```

---

## Step 3: Set Backend URL in Frontend

In your `traveler-frontend` service environment:

```
NEXT_PUBLIC_API_URL = https://traveler-backend.onrender.com
```

*(Replace with your actual backend URL from Render)*

---

## Step 4: Set Other Required Keys

### Backend Service (traveler-backend):

```bash
OPENAI_API_KEY = sk-proj-your_openai_key_here
AMADEUS_API_KEY = your_amadeus_key (optional)
AMADEUS_API_SECRET = your_amadeus_secret (optional)
```

---

## Step 5: Redeploy Services

After setting all environment variables:

1. Go to each service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for both services to rebuild

---

## Verification

### Check if services are running:

1. **Backend**: Visit `https://traveler-backend.onrender.com/api/v1/agentic/status`
   - Should return: `{"status":"healthy",...}`

2. **Frontend**: Visit `https://traveler-frontend.onrender.com`
   - Should show the landing page without 401 error

---

## Troubleshooting

### Still getting 401 error?

1. **Verify Clerk keys are correct**:
   - They should start with `pk_test_` and `sk_test_`
   - Copy them again from Clerk dashboard (they're long!)

2. **Check Clerk domain settings**:
   - In Clerk dashboard → **Domains**
   - Add your Render domain: `traveler-frontend.onrender.com`

3. **Check environment variables are saved**:
   - In Render dashboard, verify they appear in the Environment tab
   - They should NOT show as "not set"

4. **Redeploy after changes**:
   - Always redeploy when you change environment variables

---

## Quick Checklist

- [ ] Clerk publishable key set in frontend
- [ ] Clerk secret key set in both frontend and backend
- [ ] NEXT_PUBLIC_API_URL set to backend URL (with https://)
- [ ] OpenAI API key set in backend
- [ ] Database URL auto-connected (should be automatic)
- [ ] Both services redeployed after env vars are set
- [ ] Clerk domain configured with your Render URL

---

## Important Notes

1. **NEXT_PUBLIC_* variables**: These are exposed to the browser, so only use them for public keys
2. **Secret keys**: Never commit these to GitHub. Only set them in Render dashboard
3. **Deployment**: Changes to env vars require a manual redeploy
4. **Free tier**: Services may sleep after inactivity. First request will wake them up (takes ~30 seconds)

---

## Need Help?

If you're still having issues:

1. Check Render logs:
   - Dashboard → Select service → **Logs** tab
   - Look for errors related to authentication

2. Check browser console:
   - Open DevTools (F12)
   - Look for errors related to Clerk or API calls

3. Verify API connectivity:
   - Open browser console
   - Run: `fetch('https://traveler-backend.onrender.com/api/v1/agentic/status').then(r => r.json()).then(console.log)`
   - Should return status object

