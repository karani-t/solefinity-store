# SoleFinity Monitoring & Analytics Quick Reference

## 🎯 Quick Access Paths

### For Admins
| Feature | URL | Purpose |
|---------|-----|---------|
| Dashboard | `/admin` | Overview of all metrics |
| Audit Logs | `/admin` → Audit | Track all system changes |
| Login History | `/admin` → Users | View user access patterns |
| Staff Management | `/admin/staff` | Manage team |
| Product Reviews | `/admin/reviews` | Moderate customer feedback |
| Analytics | `/admin/analytics` | Detailed metrics & trends |

### For Distributors
| Feature | URL | Purpose |
|---------|-----|---------|
| Dashboard | `/dashboard/distributor` | Personal overview |
| Low Stock Alerts | `/dashboard/distributor` | Restock needs |
| Orders | `/dashboard/distributor` → Orders | B2B orders |
| Reports | `/dashboard/distributor` → Reports | Sales analytics |

---

## 🔍 Key Metrics to Monitor

### System Health
- ❌/✅ Failed login attempts (should be <5 per user)
- 🔒 Account lockouts (investigate if frequent)
- ⏱️ Avg response time (target: <500ms)
- 🗄️ Database size (monitor growth)

### Business Metrics
- 💰 Daily revenue (KES)
- 📦 Order volume (completed vs pending)
- 👥 Active users (daily/weekly/monthly)
- 🛍️ Top selling products (top 10)

### Inventory
- ⚠️ Low stock items (requires action)
- 📊 Stock turnover rate
- 🔄 Restock frequency
- 📦 Average inventory value

### Customer Engagement
- ⭐ Average product rating
- 📝 Review count & sentiment
- 🛒 Cart abandonment rate
- 📲 Email delivery rate

---

## 📋 Daily Admin Checklist

### Morning (8 AM)
- [ ] Check overnight order volume
- [ ] Review failed login attempts
- [ ] Check system alerts/errors
- [ ] Verify low-stock items

```bash
# Quick check command
curl http://localhost:3000/api/admin/analytics/dashboard
```

### Afternoon (2 PM)
- [ ] Review new reviews for moderation
- [ ] Check pending staff approvals
- [ ] Verify distributor orders

### Evening (5 PM)
- [ ] Backup database
- [ ] Review daily revenue
- [ ] Check for anomalies in audit logs

---

## 🚨 Alert Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| Failed logins | 5+ per account | Check user/block if suspicious |
| Low stock | Below threshold | Contact supplier |
| Revenue drop | <50% of avg | Investigate cause |
| High error rate | >1% of requests | Check logs, contact support |
| Pending orders | >20 | Increase staff |

---

## 📊 API Endpoints for Monitoring

### Dashboard Metrics
```bash
GET /api/admin/analytics/dashboard
# Returns: total users, orders, revenue, products, reviews

# Response:
{
  "totalUsers": 1250,
  "totalOrders": 5432,
  "totalRevenue": "1250000",
  "totalProducts": 450,
  "totalReviews": 892,
  "usersByRole": { "CUSTOMER": 1100, "STAFF": 50, ... },
  "peakOrderTime": "14:30",
  "monthlyRevenue": [...]
}
```

### Audit Logs
```bash
GET /api/admin/audit-logs?page=1&limit=50
# Filter by: action, userId, startDate, endDate

# Returns: action type, user, timestamp, old/new values
```

### Login History
```bash
GET /api/admin/login-history
# Returns: last 100 user logins with timestamp

# Response:
[
  {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "lastLogin": "2025-04-11T14:30:00Z",
    "createdAt": "2025-01-15T08:00:00Z"
  }
]
```

### Low Stock Items
```bash
GET /api/distributor/low-stock
# Returns: items below configured threshold with count

# Response:
[
  {
    "id": "prod123",
    "name": "Nike Air Max",
    "stock": 5,
    "lowStockThreshold": 10,
    "warehouse": "Nairobi HQ"
  }
]
```

---

## 🔐 Security Monitoring

### Failed Login Tracking
- **Location**: Database `User` table
- **Fields**: `failedLoginAttempts`, `lockedUntil`
- **Action**: Auto-locks after 5 failures
- **Duration**: 15-minute lockout

### Account Lockout Details
```javascript
if (failedLoginAttempts >= 5) {
  lockedUntil = now + 15 minutes
  sendEmail("Account temporarily locked")
}
```

### Bypassing Lockout (Admin Only)
```bash
# Reset failed attempts
UPDATE users SET failedLoginAttempts = 0 WHERE id = 'user123'
```

---

## 📈 Performance Tuning

### Query Optimization
- Paginate all list endpoints (50 items/page)
- Index on: `email`, `role`, `createdAt`, `lastLogin`
- Cache analytics for 5 minutes

### Database Maintenance
```sql
-- Cleanup old audit logs (older than 90 days)
DELETE FROM AuditLog WHERE createdAt < NOW() - INTERVAL '90 days';

-- Analyze table performance
ANALYZE users;
ANALYZE audit_logs;
```

---

## 🔧 Customization

### Change Low Stock Threshold
**File**: `prisma/schema.prisma`
```prisma
model Product {
  lowStockThreshold Int @default(10)
}
```

### Adjust Lockout Duration
**File**: `app/lib/auth.ts`
```typescript
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
```

### Change Pagination Limit
**File**: `app/api/admin/audit-logs/route.ts`
```typescript
const ITEMS_PER_PAGE = 50; // Adjust as needed
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Analytics dashboard loads slowly
- **Solution**: Check database connection, increase pagination limit, cache results

**Issue**: Audit logs not appearing
- **Solution**: Verify audit logging is enabled, check database permissions

**Issue**: Failed login attempts not resetting
- **Solution**: Manually reset in database, verify lockout duration

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check database
npx prisma studio
```

---

## 📚 Related Documentation

- [SECURITY_MONITORING_GUIDE.md](./SECURITY_MONITORING_GUIDE.md) - Full security features
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production setup
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - API reference

---

**Last Updated**: 2025-04-11
**Version**: 2.0.0
