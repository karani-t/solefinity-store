# 🚀 SOLEFINITY DEPLOYMENT → LIVE IN 20 MINUTES

## **✨ WHAT YOU'LL GET**
- Live, shareable URL: `https://solefinity-app-xxxx.onrender.com`
- Full working e-commerce system with admin dashboard
- PostgreSQL database
- Free tier (perfect for testing/demo)

---

## **⏱️ QUICK START (20 minutes)**

### **Step 1: Push Code to GitHub** (5 min)

```bash
# Go to GitHub.com and create new repo "solefinity-store"

# Push code:
cd ~/Desktop/SoleFinity/solefinity-store
git init
git add .
git commit -m "Deploy to production"
git remote add origin https://github.com/karani-t/solefinity-store
git branch -M main
git push -u origin main
```

---

### **Step 2: Setup Render Database** (5 min)

1. Go to **https://dashboard.render.com** (create free account)
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name:** `solefinity-db`
   - **Database:** `solefinity`
   - **User:** `solefinity_user`
   - Keep defaults, click **"Create Database"**
4. ⏳ Wait 2 minutes
5. **Copy the "External Database URL"** (save it!)

**Example URL:**
```
postgresql://solefinity_user:password@oregon-postgres.render.com:5432/solefinity
```

---

### **Step 3: Deploy Web Service** (5 min)

1. In Render, click **"New +"** → **"Web Service"**
2. Select your GitHub repo
3. Fill in:
   - **Name:** `solefinity-app`
   - **Build Command:** 
     ```
     npm ci && npx prisma migrate deploy && npm run build
     ```
   - **Start Command:** 
     ```
     npm start
     ```
   - **Instance Type:** Free
4. Click **"Create Web Service"**
5. ⏳ Building now... (3 min)

---

### **Step 4: Add Environment Variables** (2 min)

While building, go to your web service, click **Settings** → **Environment**

**Copy & paste these variables:**

```
NODE_ENV=production
NEXTAUTH_URL=https://solefinity-app.onrender.com  [REPLACE solefinity-app with YOUR service name]
NEXTAUTH_SECRET=[RUN: openssl rand -base64 32]
DATABASE_URL=[PASTE from Step 2]

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@solefinity.com

AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_API_KEY=your-api-key
```

**⚠️ IMPORTANT - Generate NEXTAUTH_SECRET:**
```bash
# On your computer, run:
openssl rand -base64 32

# Copy the result into NEXTAUTH_SECRET field
```

Click **"Save Deploy"**

---

### **Step 5: Test Your Live App** (3 min)

1. Wait for green checkmark ✅ in Render
2. Find your URL: `https://solefinity-app-xxxx.onrender.com`
3. Click it!

**Test:**
- ✅ Home page loads?
- ✅ Can sign up?
- ✅ Can browse products?
- ✅ Admin dashboard works?

**🎉 LIVE!**

---

## **🧪 TEST ACCOUNTS**

### **Admin (if created)**
```
Email: admin@solefinity.com
Password: AdminPass123!
```

### **Or create new test account**
- Click Sign Up
- Fill in details
- Login
- Visit `/admin` to access admin panel

---

## **❌ COMMON ISSUES & FIXES**

| Problem | Cause | Fix |
|---------|-------|-----|
| **Build fails** | DATABASE_URL missing | Add DATABASE_URL from Step 2 to Render environment |
| **"No tables found"** | Migrations didn't run | Run manually: `npx prisma migrate deploy` |
| **Auth not working** | NEXTAUTH_SECRET wrong | Generate new secret: `openssl rand -base64 32` |
| **App crashes** | Check logs | Go to Render → Logs tab to see errors |
| **Emails not sending** | SMTP credentials | Use app-specific password, not Gmail password |

---

## **📱 SHARE WITH SUPERVISORS**

Send them this:

```
🎉 Testing Link: https://solefinity-app-xxxx.onrender.com

📌 Features to Test:
  ✅ Browse products & add to cart
  ✅ Create account & place order
  ✅ Order history in "My Orders"
  ✅ Admin dashboard (if role=ADMIN)
  ✅ Staff dashboard (if role=STAFF)

🔐 Test Credentials:
  • Email: test@solefinity.com
  • Password: TestPass123! (or create new)

💬 Send feedback to: [your email]
```

---

## **🔑 ENVIRONMENT VARIABLES EXPLAINED**

| Variable | What It Is | Where to Get It |
|----------|-----------|-----------------|
| `DATABASE_URL` | PostgreSQL connection | Step 2 of guide |
| `NEXTAUTH_SECRET` | Auth encryption key | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your live app URL | Render gives you after deploy |
| `SMTP_USER` | Gmail address | Your Gmail |
| `SMTP_PASS` | Gmail app password | Gmail account settings |
| `AFRICASTALKING_*` | SMS provider creds | Africa's Talking account |

---

## **🚨 TROUBLESHOOTING**

### **Database won't connect**
```
Error: "psycopg2: connection refused"
Fix: 1. Check DATABASE_URL is correct
     2. Wait 2 min after creating database
     3. Ensure URL has ?schema=public at end
```

### **App stuck building**
```
• Check: Render dashboard Logs
• If >5 min: Stop & rebuild
• Check build command runs locally: npm run build
```

### **Images not showing**
```
Expected behavior - images stored as base64 in DB.
This works fine for MVP!
```

### **Email/SMS not working**
```
• SMTP: Use app-specific Gmail password
• SMS: Verify API key is active in Africa's Talking
• Check: Render logs for errors
```

---

## **📊 MONITORING YOUR APP**

### **Daily**
- [ ] Visit your URL - loads?
- [ ] Sign in works?
- [ ] Create order test?

### **Weekly**
- [ ] Check Render logs for errors
- [ ] Monitor database size (Render shows usage)

### **Database Health**
- Visit Render → PostgreSQL instance → Query tab
- View table stats

---

## **🎯 NEXT STEPS AFTER DEMO**

1. ✅ Show supervisors & get feedback
2. ✅ Fix reported bugs
3. ✅ Consider paid tier if expanding ($7+/month)
4. ✅ Add custom domain ($10/yr - optional)
5. ✅ Setup monitoring/alerts

---

## **🆘 HELP**

**Rendering errors?**
- Render Docs: https://render.com/docs
- Check Logs in Render dashboard

**Database issues?**
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs

**Next.js problems?**
- Docs: https://nextjs.org/docs

---

**✅ YOU'RE READY TO DEPLOY!** 

Start with Step 1 above. You'll have a live link in 20 minutes! 🚀
