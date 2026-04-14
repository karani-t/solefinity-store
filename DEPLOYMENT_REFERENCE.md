# 📋 DEPLOYMENT QUICK REFERENCE CARD

**Print this page or keep it handy while deploying!**

---

## **🎯 DEPLOYMENT IN 4 STEPS**

### **Step 1️⃣: Push to GitHub (5 min)**
```bash
cd ~/Desktop/SoleFinity/solefinity-store
git init
git add .
git commit -m "Deploy to production"
git remote add origin https://github.com/USERNAME/solefinity-store.git
git branch -M main
git push -u origin main
```

### **Step 2️⃣: Create Render PostgreSQL (5 min)**
- Go: https://dashboard.render.com
- Click: "New +" → "PostgreSQL"
- Name: `solefinity-db`
- Database: `solefinity`
- User: `solefinity_user`
- **COPY the "External Database URL"**

### **Step 3️⃣: Deploy Web Service (5 min)**
- Click: "New +" → "Web Service"
- Connect GitHub repo
- Build: `npm ci && npx prisma migrate deploy && npm run build`
- Start: `npm start`
- Instance: **Free**

### **Step 4️⃣: Environment Variables (2 min)**
```
NODE_ENV=production
NEXTAUTH_URL=https://solefinity-app-xxxx.onrender.com [YOUR URL]
NEXTAUTH_SECRET=[Run: openssl rand -base64 32]
DATABASE_URL=[FROM STEP 2]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@solefinity.com
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_API_KEY=your-api-key
```

---

## **🔐 GENERATE SECRETS**

```bash
# Terminal command (on your computer):
openssl rand -base64 32

# Copy the output and paste into:
# Render → Environment → NEXTAUTH_SECRET
```

---

## **📧 GMAIL APP-SPECIFIC PASSWORD**

⚠️ **DON'T use your regular Gmail password!**

1. Go: https://myaccount.google.com/apppasswords
2. Select: Mail → Windows (or Other)
3. Generate password
4. Copy 16-character password
5. Paste into: SMTP_PASS

---

## **✅ QUICK TEST CASES**

| Test | Expected | Status |
|------|----------|--------|
| Home page loads | Products visible | ☐ |
| Sign up works | Can create account | ☐ |
| Sign in works | Redirect to dashboard | ☐ |
| Product browse | Images load | ☐ |
| Admin access | Dashboard shows | ☐ |
| Product create | Can upload image | ☐ |
| No errors | Console clean | ☐ |

---

## **🆘 ONE-LINER FIXES**

| Problem | Command |
|---------|---------|
| Generate secret | `openssl rand -base64 32` |
| Check build locally | `npm run build` |
| View Render logs | Render Dashboard → Service → Logs |
| Kill stuck build | Render Dashboard → Settings → Redeploy |
| Reset DB (⚠️ deletes data) | `npx prisma migrate reset` |

---

## **💾 CRITICAL URLs**

| Service | URL |
|---------|-----|
| Render Dashboard | https://dashboard.render.com |
| GitHub | https://github.com |
| Gmail App Passwords | https://myaccount.google.com/apppasswords |
| After Deploy | https://solefinity-app-xxxx.onrender.com |

---

## **📝 ENVIRONMENT VARIABLE CHECKLIST**

Copy this exact format and fill in your values:

```
✓ NODE_ENV = production
✓ NEXTAUTH_URL = https://solefinity-app-____.onrender.com
✓ NEXTAUTH_SECRET = ________________________________
✓ DATABASE_URL = postgresql://user:pass@host:5432/db
✓ SMTP_HOST = smtp.gmail.com
✓ SMTP_PORT = 587
✓ SMTP_USER = your-email@gmail.com
✓ SMTP_PASS = ____ ____ ____ ____
✓ SMTP_FROM = noreply@solefinity.com
✓ AFRICASTALKING_USERNAME = ______________
✓ AFRICASTALKING_API_KEY = ____________________
```

---

## **⚡ DEPLOYMENT TIMELINE**

```
00:00 - 05:00   Push to GitHub
05:00 - 10:00   Create PostgreSQL on Render
10:00 - 15:00   Create Web Service (building)
15:00 - 17:00   Add Environment Variables
17:00 - 20:00   Wait for build to complete
20:00 - 25:00   Verify app is live
```

---

## **🐛 COMMON ERRORS**

| Error | Fix |
|-------|-----|
| `Build failed` | Check DATABASE_URL in env vars |
| `Cannot connect to DB` | Verify PostgreSQL is created first |
| `NEXTAUTH_SECRET not set` | Generate: `openssl rand -base64 32` |
| `Email not sending` | Use app-specific Gmail password |
| `Localhost pages` | Already fixed - URLs use NEXTAUTH_URL |
| `App stuck on 404` | Check NEXTAUTH_URL matches domain exactly |

---

## **📞 SUPERVISION LINK TEMPLATE**

```
✅ DEPLOYMENT COMPLETE!

🌐 Live URL: https://solefinity-app-xxxx.onrender.com

📊 Test These Features:
   • Browse products & add to cart
   • Create account & place order
   • Admin dashboard (create products)
   • Order history
   • All dashboards

🔐 Test Credentials:
   • Email: [create new or use existing]
   • Password: [your test password]

📧 Contact: [your email]
```

---

## **FILE REFERENCE**

**For deployment help, open:**
- `RENDER_QUICKSTART.md` - Step-by-step guide
- `PRODUCTION_DEPLOYMENT.md` - Comprehensive reference
- `DEPLOYMENT_STATUS.md` - Current status & checklist
- `.env.production` - Example environment variables

---

## **✅ FINAL CHECKLIST**

Before deployment:
- [ ] Code builds locally: `npm run build`
- [ ] GitHub repo created
- [ ] GitHub tokens ready
- [ ] Gmail account ready (for SMTP)
- [ ] Africa's Talking account ready (for SMS)
- [ ] Render account created
- [ ] This reference card handy

During deployment:
- [ ] Step 1: GitHub push complete
- [ ] Step 2: PostgreSQL created & URL copied
- [ ] Step 3: Web Service created
- [ ] Step 4: All environment variables set
- [ ] Waiting for build (watch logs)
- [ ] Build complete & green status

After deployment:
- [ ] App loads at live URL
- [ ] Can create account
- [ ] Can sign in
- [ ] Admin features work
- [ ] No console errors

---

**YOU'RE READY! 🚀 Start with Step 1 above.**

