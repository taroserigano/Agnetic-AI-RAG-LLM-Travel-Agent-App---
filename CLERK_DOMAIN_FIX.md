# Fix Clerk 401 Error on Render

## Additional Steps Required

If you've set all environment variables and still getting 401, follow these steps:

---

## 1. Add Render Domain to Clerk

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Domains** (in left sidebar)
4. Click **Add domain**
5. Add your Render frontend URL:
   ```
   traveler-frontend.onrender.com
   ```
6. Save changes

---

## 2. Verify Environment Variables Format

In your Render dashboard, check the exact format:

### Frontend (traveler-frontend):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=https://traveler-backend.onrender.com
DATABASE_URL=(auto-connected)
NODE_ENV=production
```

⚠️ **Important**: 
- NO spaces around `=`
- NO quotes around values
- Must include `https://` in API URL

---

## 3. Check Clerk Instance Settings

In Clerk dashboard:

1. Go to **Settings** → **Instances**
2. Under **Session & token settings**:
   - Make sure "Enable session tokens" is ON
   - Check "JWT Template" is set to default

---

## 4. Update Clerk Redirect URLs

In Clerk dashboard:

1. Go to **Paths**
2. Set these URLs:
   ```
   Sign-in URL: /sign-in
   Sign-up URL: /sign-up
   After sign-in: /chat
   After sign-up: /chat
   ```

3. Under **Allowed redirect URLs**, add:
   ```
   https://traveler-frontend.onrender.com/*
   ```

---

## 5. Rebuild Both Services

After making ALL changes:

1. **Backend**: Manual Deploy → Deploy latest commit
2. **Frontend**: Manual Deploy → Deploy latest commit
3. Wait 5-10 minutes for full deployment

---

## 6. Test the Deployment

### A. Test Backend:
```bash
curl https://traveler-backend.onrender.com/api/v1/agentic/status
```
Should return: `{"status":"healthy",...}`

### B. Test Frontend:
1. Open: `https://traveler-frontend.onrender.com`
2. Should see landing page (not 401)
3. Click "Get Started"
4. Should redirect to Clerk sign-in (not error)

---

## 7. Common Issues

### Issue: Still getting 401

**Check:**
- Clerk keys are from the SAME Clerk application
- Publishable key starts with `pk_test_` (for development) or `pk_live_` (for production)
- Secret key starts with `sk_test_` or `sk_live_`
- Both keys are for the same environment (both test OR both live)

### Issue: "Clerk: Invalid publishable key"

**Fix:**
- You're using keys from different Clerk applications
- Or mixing test/live keys
- Generate fresh keys from the same Clerk app

### Issue: "Network Error" when signing in

**Fix:**
- NEXT_PUBLIC_API_URL is wrong
- Backend service is not running
- Check backend logs for errors

---

## 8. Enable Clerk Debug Mode (Temporary)

To see detailed Clerk errors:

1. In Render frontend environment, add:
   ```
   CLERK_DEBUG=true
   ```

2. Redeploy frontend

3. Check browser console (F12) for detailed Clerk logs

4. Remove this variable once debugging is done

---

## 9. Check Render Service Logs

### Frontend Logs:
1. Render Dashboard → traveler-frontend → Logs
2. Look for errors like:
   - `Clerk: Missing publishableKey`
   - `Clerk: Invalid publishable key`
   - `401 Unauthorized`

### Backend Logs:
1. Render Dashboard → traveler-backend → Logs
2. Look for:
   - Startup errors
   - Database connection issues
   - Missing environment variables

---

## 10. Nuclear Option: Recreate Services

If nothing works:

1. Delete both services in Render
2. Delete and recreate the Blueprint deployment
3. Set ALL environment variables fresh
4. Deploy

---

## Quick Verification Checklist

- [ ] Clerk domain added: `traveler-frontend.onrender.com`
- [ ] Clerk redirect URLs configured
- [ ] Environment variables have NO spaces or quotes
- [ ] Using keys from SAME Clerk app
- [ ] Both services redeployed after env changes
- [ ] Backend returns healthy status
- [ ] Frontend loads landing page (no 401)
- [ ] Middleware.ts allows public routes
- [ ] Database connected in both services

---

## Still Not Working?

Share these details:

1. **Frontend logs** (last 50 lines from Render)
2. **Backend logs** (last 50 lines from Render)
3. **Browser console errors** (F12 → Console tab)
4. **Clerk environment** (test or production?)
5. Screenshot of Render environment variables (hide sensitive values)

