# Vercel Deployment Checklist

## ❌ Most Common Deployment Failures & Fixes

### 1. **DATABASE_URL is Missing or Wrong**
- **Error Message:** `DATABASE_URL is undefined` or `connect ECONNREFUSED localhost`
- **Fix:** 
  - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  - Add: `DATABASE_URL=postgresql://user:pass@host:port/dbname`
  - Use production database (not localhost)
  - Recommended: Use Vercel Postgres or Railway.app

### 2. **DATABASE_URL Points to Localhost**
- **Error Message:** Build fails silently or API calls timeout
- **Fix:**
  - Replace `localhost:5432` with your production database host
  - Whitelist Vercel's IP range in your database firewall

### 3. **Missing JWT_SECRET**
- **Error Message:** `JWT_SECRET is undefined` 
- **Fix:**
  - Go to Vercel Dashboard → Settings → Environment Variables
  - Add: `JWT_SECRET=your_strong_secret_here` (32+ chars recommended)

### 4. **NEXT_PUBLIC_API_URL is Not Set**
- **Error Message:** API calls fail with 404
- **Fix:**
  - Go to Vercel Dashboard → Settings → Environment Variables
  - Add: `NEXT_PUBLIC_API_URL=https://your-vercel-domain.vercel.app`
  - Note: During deployment preview, use the preview URL

### 5. **Prisma Client Not Generated**
- **Error Message:** `Cannot find module '@prisma/client'`
- **Fix:**
  - Already configured in vercel.json: `"buildCommand": "prisma generate && next build"`
  - Make sure postinstall script is set in package.json: `"postinstall": "prisma generate"`

### 6. **Node.js Version Mismatch**
- **Error Message:** Unexpected token errors, build fails
- **Fix:**
  - Go to Vercel Dashboard → Settings → Node.js Version
  - Set to: `20.x` or `18.x`

---

## ✅ Pre-Deployment Checklist

### Environment Variables in Vercel
- [ ] DATABASE_URL (production database URL, NOT localhost)
- [ ] JWT_SECRET (random 32+ char string)
- [ ] NEXT_PUBLIC_API_URL (your Vercel domain)

### Build Configuration
- [ ] vercel.json exists with correct buildCommand
- [ ] package.json has postinstall script for Prisma
- [ ] Node.js version set to 20.x or 18.x

### Git Status
- [ ] All changes committed
- [ ] Pushed to GitHub main branch
- [ ] No uncommitted .env files

### Database
- [ ] Production PostgreSQL database created
- [ ] DATABASE_URL is production database
- [ ] Database is accessible from Vercel (IPs whitelisted)
- [ ] Migrations applied: `npx prisma migrate deploy`

### Code Quality
- [ ] No hardcoded localhost URLs
- [ ] All API routes use dynamic rendering (no static gen)
- [ ] "use client" directives on client-side pages

---

## 🔧 Quick Fix Steps

1. **Fix DATABASE_URL**
   - Create PostgreSQL on Vercel or Railway
   - Update in Vercel Dashboard

2. **Add Missing Env Vars**
   - JWT_SECRET
   - NEXT_PUBLIC_API_URL

3. **Redeploy**
   - In Vercel Dashboard, click "Redeploy"

4. **Check Logs**
   - Click failed deployment
   - View "Build Logs" tab
   - Share any errors in chat

---

## 🆘 If Still Failing

**Please share:**
1. Full error message from Vercel Build Logs
2. Screenshot of the error
3. What Vercel says about the failure
