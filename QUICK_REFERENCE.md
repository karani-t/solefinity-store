# 🎯 SoleFinity Quick Reference Card

**Keep this handy while building & launching**

---

## ⚡ Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm start                # Run production build

# Database
npx prisma migrate dev   # Create & run migration
npx prisma studio       # Open Prisma data browser
npx prisma db push      # Sync schema to DB
npx prisma migrate reset # ⚠️ Clear all data (dev only!)

# Code Quality
npm run lint             # Check for errors
```

---

## 🔐 Authentication

**Test Credentials** (Local Dev)
```
Email:    admin@solefinity.com
Password: password123
Role:     MANAGER
```

**Create New User** (API)
```javascript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "123456",
  "name": "User Name",
  "phone": "+254712345678"
}
```

---

## 💳 M-Pesa Payment Test

**Development (Mock)**
```javascript
// Payment auto-completes in dev mode
POST /api/payments/mpesa
{
  "phone": "0712345678",      // 254 format works too
  "amount": 1000,             // KES
  "accountReference": "ORD-001",
  "description": "Test payment"
}

// Response: { paymentId: "xxx", status: "COMPLETED" }
```

**Production Setup**
```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASS_KEY=your_pass_key
MPESA_SHORT_CODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa-callback
NODE_ENV=production
```

---

## 📦 Core API Endpoints

### Products
```javascript
GET  /api/products                    // List all
GET  /api/products?category=Running   // Filter
GET  /api/products/[id]               // Single product
POST /api/products                    // Create (admin)
PUT  /api/products/[id]               // Update (admin)
DELETE /api/products/[id]             // Delete (admin)
```

### Orders
```javascript
POST /api/orders                      // Create order
GET  /api/orders                      // List user's orders
PUT  /api/orders/[id]                 // Update status (admin)
GET  /api/orders/[id]                 // Get single order
```

### Admin Dashboard
```javascript
GET  /api/admin/analytics             // Revenue, trends, etc.
GET  /api/admin/staff                 // List staff
POST /api/admin/staff                 // Add staff
PUT  /api/admin/staff/[id]            // Update staff
GET  /api/admin/inventory             // Stock levels
POST /api/admin/inventory             // Add batch
PUT  /api/admin/inventory/[id]        // Adjust stock
```

### Distributor (B2B)
```javascript
POST /api/distributor/orders          // Place order
GET  /api/distributor/orders          // View my orders
GET  /api/distributor/orders/[id]     // Single order
```

### Wishlist & Reviews
```javascript
GET  /api/user/wishlist               // User's wishlist
POST /api/user/wishlist               // Add to wishlist
DELETE /api/user/wishlist/[id]        // Remove from wishlist
POST /api/reviews                     // Add review
GET  /api/reviews?productId=xxx       // Product reviews
```

---

## 🇰🇪 Currency & Pricing

**Always use KES** (Kenyan Shillings)

```javascript
// Database fields
{
  priceKES: 15990,        // Selling price
  costPriceKES: 8000,     // Your cost
  totalPriceKES: 35890    // Order total
}

// Tax calculation
import { taxCalculator } from '@/lib/taxes';

const breakdown = taxCalculator.calculateTotalWithVAT(15990);
// Returns: { netPrice: 15990, taxAmount: 2558.4, totalPrice: 18548.4 }
```

---

## 👥 User Roles

| Role | Can Do | Use Cases |
|------|--------|-----------|
| CUSTOMER | Browse/buy | End users |
| SALES_STAFF | Process orders | Sales team |
| INVENTORY_MANAGER | Stock management | Inventory |
| DISTRIBUTOR_HANDLER | B2B orders | Distributor relations |
| MANAGER | Everything | Owner/Admin |

**Assign Role** (API)
```javascript
PUT /api/admin/staff/[staffId]
{
  "role": "INVENTORY_MANAGER"  // CUSTOMER, SALES_STAFF, etc.
}
```

---

## 📊 Database Models

```
User
├── StaffProfile
├── DistributorProfile
└── Order
    ├── OrderItem
    └── MpesaPayment

Product
├── ProductBatch
│   └── InventoryLog
├── Review
└── Wishlist

Warehouse
├── InventoryBatch
└── Staff (assigned)

TaxRate
└── (Predefined for VAT, excise)
```

---

## 🚀 Deploy Commands

### Vercel
```bash
vercel deploy         # Deploy staging
vercel deploy --prod  # Deploy production
```

### Self-Hosted (Linux)
```bash
npm run build
pm2 start npm --name "solefinity" -- start
pm2 save
# Setup Nginx + SSL
```

### Heroku
```bash
heroku create app-name
git push heroku main
heroku logs --tail
```

---

## 🧪 Testing Scenarios

### Test M-Pesa Payment
```
1. Add shoe to cart (15,990 KES)
2. Checkout → Select M-Pesa
3. Enter: 0712345678
4. Dev: Auto-completes | Prod: STK Push to phone
5. Check /admin/analytics for revenue
```

### Test Staff Management
```
1. Login as MANAGER
2. Create new staff → Nairobi warehouse
3. Set role: INVENTORY_MANAGER
4. Logout → Login as new staff
5. Verify can only see inventory features
```

### Test Distributor Portal
```
1. Distributor signup
2. Add 100 units to cart (15% bulk discount applies)
3. Create B2B order
4. Admin approves → SMS sent
5. Distributor has 30 days to pay
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `NEXTAUTH_SECRET required` | Missing env var | `openssl rand -hex 32 > .env` |
| `Database connection failed` | DB URL wrong | Check `DATABASE_URL` in `.env` |
| `M-Pesa credentials invalid` | Wrong API keys | Verify Daraja API keys |
| `SMS not sending` | SMS off/wrong API key | Enable SMS provider & check key |
| `Build failed: type error` | TypeScript error | Run `npm run build` to see full error |

---

## 📱 Key UI Routes

| Path | What It Does | Role |
|------|-------------|------|
| `/` | Home/products | Public |
| `/products` | Product catalog | Public |
| `/products/[id]` | Product detail + reviews | Public |
| `/cart` | Shopping cart | CUSTOMER+ |
| `/checkout` | Payment page | CUSTOMER+ |
| `/orders` | Order history | CUSTOMER+ |
| `/auth/signin` | Login | Public |
| `/auth/signup` | Register | Public |
| `/admin` | Dashboard | MANAGER |
| `/wishlist` | Saved items | CUSTOMER+ |

---

## 🔒 Security Essentials

```bash
# Generate strong secret
openssl rand -hex 32

# Add to .env
NEXTAUTH_SECRET=your_generated_secret

# Verify no secrets in git
git status  # Should NOT show .env
cat .gitignore  # Should have .env

# HTTPS only
NODE_ENV=production  # Enforces HTTPS cookies
```

---

## 📞 Quick Help

**Start from scratch**
```bash
rm -rf node_modules .next
npm install
npx prisma migrate reset
npm run dev
```

**Database problems**
```bash
npx prisma studio          # Browse data
npx prisma migrate status  # Check migrations
npx prisma db push         # Sync schema
```

**Payment testing**
```
Dev mode: Payments auto-complete, check console
Prod mode: Uses real M-Pesa, watch logs for callbacks
```

---

## 🎯 Launch Sequence

1. `npm install` - Install dependencies
2. Copy `.env.example` → `.env.local` - Configure
3. `npx prisma migrate dev` - Setup database  
4. `npm run dev` - Test locally
5. Add real M-Pesa/SMS credentials - Enable real payments
6. `npm run build` - Build for production (test build)
7. Deploy to Vercel/Heroku/VPS - Go live
8. Monitor logs 24/7 - Watch for errors
9. **Celebrate! 🎉** - You're live

---

## 💡 Performance Tips

- Cache products (change rarely): 1 hour TTL
- Cache reviews: 5 min TTL
- Cache analytics: 30 min TTL
- Use CDN for images: Cloudinary/Imgix
- Database: Index on frequently queried fields
- API: Rate limit at 100 req/min per IP

---

## 🆘 Emergency Contacts

| Issue | Action |
|-------|--------|
| Site down | Check Vercel/host status → Restart app |
| M-Pesa failing | Check Safaricom status → Verify callback |
| SMS queue stuck | Check Africa's Talking account → Restart workers |
| Database full | Check storage → Delete old logs/backups |
| Payment stuck | Check transaction ID → Manual verification |

---

**Everything you need on one screen. Reference & share with your team!**

Last updated: April 2026 | Version 2.0.0