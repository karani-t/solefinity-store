# 🎯 GROOMERS CAVE - COMPLETE TEST DATA & CREDENTIALS

**Last Generated:** April 14, 2026  
**Status:** ✅ Production Ready for Testing
**Brand:** Premium Men's Grooming & Luxury Lifestyle

---

## 📋 TABLE OF CONTENTS

1. [Login Credentials](#login-credentials)
2. [Test Users Overview](#test-users-overview)
3. [Products Catalog](#products-catalog)
4. [Orders & Status](#orders--status)
5. [Admin Features](#admin-features)
6. [Staff Features](#staff-features)
7. [Distributor Features](#distributor-features)
8. [Customer Features](#customer-features)
9. [Testing Workflows](#testing-workflows)

---

## 🔐 LOGIN CREDENTIALS

### ADMIN ACCOUNT
```
Email:    admin@groomerscave.com
Password: Admin@123
Role:     Administrator
```
**Access:** Full system control, analytics, user management, approvals

### STAFF ACCOUNTS (2)
```
Staff Member 1:
Email:    staff.john@groomerscave.com
Password: Staff@123
Role:     STAFF (Sales Department)
ID:       STAFF-001

Staff Member 2:
Email:    staff.grace@groomerscave.com
Password: Staff@123
Role:     STAFF (Inventory Department)
ID:       STAFF-002
```
**Access:** Order processing, inventory management, order tracking

### DISTRIBUTOR ACCOUNTS (2)
```
Distributor 1:
Email:       distributor.nairobi@groomerscave.com
Password:    Dist@123
Role:        DISTRIBUTOR
Business:    Njeri Retail Solutions
Type:        Retail
Location:    Nairobi City Center
Credit Limit: KES 500,000 (Used: KES 125,000)
Payment Terms: 30 days

Distributor 2:
Email:       distributor.mombasa@groomerscave.com
Password:    Dist@123
Role:        DISTRIBUTOR
Business:    Coastal Wholesale
Type:        Wholesale
Location:    Mombasa
Credit Limit: KES 750,000 (Used: KES 250,000)
Payment Terms: 45 days
```
**Access:** Bulk ordering, pricing views, inventory notifications, activity logs

### CUSTOMER ACCOUNTS (3)
```
Customer 1:
Email:    customer.alice@gmail.com
Password: Cust@123
Name:     Alice Johnson
Phone:    +254712345020

Customer 2:
Email:    customer.james@gmail.com
Password: Cust@123
Name:     James Kiprotich
Phone:    +254712345021

Customer 3:
Email:    customer.sarah@gmail.com
Password: Cust@123
Name:     Sarah Omondi
Phone:    +254712345022
```
**Access:** Shopping, orders, reviews, wishlist, account management

---

## 👥 TEST USERS OVERVIEW

| Role | Count | Email Pattern | Status |
|------|-------|---|--------|
| Admin | 1 | admin@groomerscave.com | ✅ Active |
| Staff | 2 | staff.{name}@groomerscave.com | ✅ Approved |
| Distributor | 2 | distributor.{location}@groomerscave.com | ✅ Approved |
| Customer | 3 | customer.{name}@gmail.com | ✅ Active |
| **TOTAL** | **8 Users** | | |

---

## 👟 PRODUCTS CATALOG

### 28 Premium Products (8 Categories)

| # | Product Name | Category | Price (KES) | Stock | Status |
|---|---|---|---|---|---|
| 1 | Air Max Running Shoes | Shoes | 15,999 | 45 | ✅ In Stock |
| 2 | Urban Street Sneakers | Shoes | 8,999 | 60 | ✅ In Stock |
| 3 | Professional Basketball Shoes | Shoes | 17,999 | 25 | ✅ In Stock |
| 4 | Trail Hiking Boots | Shoes | 21,999 | 18 | ⚠️ Low Stock |
| 5 | Classic Leather Loafers | Shoes | 12,999 | 35 | ✅ In Stock |
| 6 | Casual Canvas Shoes | Shoes | 4,999 | 80 | ✅ In Stock |
| 7 | Tennis Performance Shoes | Shoes | 13,999 | 30 | ✅ In Stock |
| 8 | Winter Boots Premium | Shoes | 18,999 | 22 | ✅ In Stock |
| 9 | Club de Nuit Intense Man | Designer Perfumes | 7,999 | 50 | ✅ In Stock |
| 10 | Dior Sauvage Eau de Toilette | Designer Perfumes | 12,999 | 38 | ✅ In Stock |
| 11 | Creed Aventus | Designer Perfumes | 18,999 | 25 | ✅ In Stock |
| 12 | Tom Ford Noir | Designer Perfumes | 14,999 | 32 | ✅ In Stock |
| 13-28 | *Additional products across Body Sprays, Pocket Perfumes, Smart Collections, Wallets, Belts, Boxers* | *Various* | *Varies* | *Varies* | ✅ In Stock |

**Total Inventory Value:** ~2,800,000 KES  
**Total Low Stock Items:** 2 (below threshold of 20)
**Total Categories:** 8 (Shoes, Designer Perfumes, Body Sprays, Pocket Perfumes, Smart Collections, Wallets, Belts, Boxers)

---

## 📦 ORDERS & STATUS

### Order Summary

| Order # | Customer | Items | Total (KES) | Status | Payment | Tracking |
|---------|----------|-------|----------|--------|---------|---------|
| ORD-{ts}-001 | Alice Johnson | 2 | 25,998 | PENDING | PENDING | - |
| ORD-{ts}-002 | James Kiprotich | 2 | 35,998 | PROCESSING | PAID | - |
| ORD-{ts}-003 | Alice Johnson | 1 | 27,998 | SHIPPED | PAID | TRACK-001 |
| ORD-{ts}-004 | Sarah Omondi | 1 | 13,998 | DELIVERED | PAID | TRACK-002 |
| ORD-{ts}-005 | James Kiprotich | 2 | 19,998 | DELIVERED | PAID | TRACK-003 |

### Order Details

**🔴 PENDING ORDER (For Staff Processing)**
```
Order: ORD-{ts}-001
Customer: Alice Johnson (customer.alice@gmail.com)
Status: PENDING (awaiting staff approval)
Items:
  - Air Max Running Shoes (1x) - KES 15,999
  - Urban Street Sneakers (1x) - KES 8,999
Total: KES 25,998 (incl. tax: KES 4,160)
Shipping Address: 123 Nairobi Street, Nairobi
Payment: Pending (MPESA)
Action: Staff should process and update to PROCESSING
```

**🟡 PROCESSING ORDER (Being Prepared)**
```
Order: ORD-{ts}-002
Customer: James Kiprotich (customer.james@gmail.com)
Status: PROCESSING (staff is preparing)
Items:
  - Professional Basketball Shoes (2x) - KES 17,999 each
Total: KES 35,998 (incl. tax: KES 5,760)
Shipping Address: 456 Mombasa Road, Mombasa
Payment: ✅ PAID
Action: Ready to transition to SHIPPED
```

**🟢 SHIPPED ORDER (In Transit)**
```
Order: ORD-{ts}-003
Customer: Alice Johnson (customer.alice@gmail.com)
Status: SHIPPED
Items:
  - Trail Hiking Boots (1x) - KES 21,999
Total: KES 27,998 (incl. tax: KES 4,480)
Tracking: TRACK-2026-04-14-001
Estimated Delivery: 3 days from now
Payment: ✅ PAID
```

**✅ DELIVERED ORDERS (Completed)**
```
Order 1: ORD-{ts}-004
Customer: Sarah Omondi
Status: DELIVERED (2 days ago)
Items: Classic Leather Loafers (1x)
Tracking: TRACK-2026-04-14-002

Order 2: ORD-{ts}-005
Customer: James Kiprotich
Status: DELIVERED (5 days ago)
Items: Casual Canvas Shoes (1x) + Tennis Performance Shoes (1x)
Tracking: TRACK-2026-04-14-003
```

---

## 🏢 ADMIN FEATURES

### Admin Dashboard Data

**User Activity Summary:**
- 8 total users (1 admin, 2 staff, 2 distributors, 3 customers)
- Last login tracking for all users
- Role-based access control configured

**Sales Analytics:**
- Total Orders: 5
- Total Revenue: ~123,992 KES
- Average Order Value: ~24,798 KES
- Completed Orders: 2 (40%)
- Pending Orders: 1 (20%)
- In Progress: 1 (20%)
- In Transit: 1 (20%)

**Product Management:**
- Total Products: 28
- Total Inventory: ~1,200+ units
- Total Inventory Value: ~2,800,000 KES
- Low Stock Items: 2 (Trail Hiking Boots, Cycling Shoes)
- Categories: 8 (Shoes, Perfumes, Body Sprays, Pocket Perfumes, Smart Collections, Wallets, Belts, Boxers)

**Staff Management:**
- John Mutua (STAFF-001) - Sales Department - Rating: 4.5/5
- Grace Wanjiru (STAFF-002) - Inventory Department - Rating: 4.2/5

**Distributor Management:**
- Njeri Retail Solutions (Nairobi) - Approved ✅
- Coastal Wholesale (Mombasa) - Approved ✅

### Admin Tasks to Test

1. **View Dashboard Analytics** - Check total sales, revenue, order stats
2. **Review Pending Orders** - See ORD-{ts}-001 awaiting approval
3. **Manage Low Stock Alerts** - View 2 products below threshold
4. **Approve Pending Staff** - Staff profiles are pre-approved for immediate use
5. **Monitor Distributor Activity** - View activity logs and restocking patterns
6. **Review Product Reviews** - 3 reviews (2 approved, 1 pending approval)
7. **Generate Reports** - Sales by category, customer analytics
8. **User Login History** - Track last login for compliance

---

## 👨‍💼 STAFF FEATURES

### Staff Dashboard Data

**John Mutua (STAFF-001) - Sales:**
- Department: Sales
- Performance Rating: 4.5/5
- Can view all customer orders
- Can update order statuses
- Can process payments

**Grace Wanjiru (STAFF-002) - Inventory:**
- Department: Inventory
- Performance Rating: 4.2/5
- Can view inventory levels
- Can log stock movements
- Can create inventory adjustments

### Available Orders for Processing

**Priority: HIGH** ⚠️
```
Order: ORD-{ts}-001
Status: PENDING
Action Needed: 
  ✓ Verify payment
  ✓ Confirm inventory
  ✓ Update to PROCESSING
  ✓ Prepare shipping label
```

**Priority: MEDIUM**
```
Order: ORD-{ts}-002
Status: PROCESSING
Action Needed:
  ✓ Package items
  ✓ QC check
  ✓ Update tracking
  ✓ Transition to SHIPPED
```

### Staff Tasks to Test

1. **View Order Queue** - Filter by PENDING, PROCESSING
2. **Process Order** ORD-{ts}-001 - Mark as PROCESSING
3. **Add Tracking** - Update ORD-{ts}-002 with tracking number
4. **View Inventory** - Check stock levels for all products
5. **Log Stock Movement** - Record inventory adjustments
6. **Generate Daily Report** - Sales by order status
7. **Customer Communications** - Send status updates to customers

---

## 🏪 DISTRIBUTOR FEATURES

### Distributor Dashboard Data

**Distributor 1: Njeri Retail Solutions (Nairobi)**
```
Business Type: Retail
Location: Nairobi City Center, Nairobi County
Credit Limit: KES 500,000
Credit Used: KES 125,000 (25% utilization)
Payment Terms: 30 days
Tax ID: P051234567A
Status: ✅ APPROVED
```

**Distributor 2: Coastal Wholesale (Mombasa)**
```
Business Type: Wholesale
Location: Mombasa, Mombasa County
Credit Limit: KES 750,000
Credit Used: KES 250,000 (33% utilization)
Payment Terms: 45 days
Tax ID: P051234568B
Status: ✅ APPROVED
```

### Low Stock Alerts

**Njeri Retail Solutions** has 1 low stock notification:
```
Product: Trail Hiking Boots
Current Stock: 18 units
Threshold: 20 units
Status: Action needed
Action: Place restock order
```

**Coastal Wholesale** has 1 low stock notification:
```
Product: Cycling Shoes Aero
Current Stock: 15 units
Threshold: 20 units
Status: Action needed
Action: Place restock order
```

### Recent Distributor Activities

**Njeri Retail Solutions:**
1. ✅ Placed order for 50 units of Urban Street Sneakers (Total: 449,950 KES)
2. ✅ Restocked 30 units of Air Max Running Shoes

**Coastal Wholesale:**
1. ✅ Viewed pricing for Winter Boots Premium
2. ✅ Updated business profile information

### Distributor Tasks to Test

1. **View Dashboard** - Check credit balance, pending alerts
2. **View Low Stock Items** - Receive notifications for 2 products
3. **Check Pricing Tiers** - View distributor-specific pricing
4. **View Activity Log** - See 4 recent activities
5. **Place Bulk Order** - Order 50+ units of a product
6. **View Messages** - Check communication history
7. **Update Profile** - Modify business information

---

## 👨‍🛍️ CUSTOMER FEATURES

### Registered Customers

**Customer 1: Alice Johnson** (customer.alice@gmail.com)
- Orders: 2 (PENDING, SHIPPED)
- Wishlist Items: -
- Review History: 1 review (5-star on Running Shoes)
- Active Orders: 1 (SHIPPED)

**Customer 2: James Kiprotich** (customer.james@gmail.com)
- Orders: 2 (PROCESSING, DELIVERED)
- Wishlist Items: -
- Review History: 1 review (5-star on Basketball Shoes)
- Active Orders: 1 (PROCESSING)

**Customer 3: Sarah Omondi** (customer.sarah@gmail.com)
- Orders: 1 (DELIVERED)
- Wishlist Items: -
- Review History: 1 review (4-star on Formal Shoes)
- Completed Orders: 1

### Product Reviews

```
Review 1: ✅ APPROVED
Product: Air Max Running Shoes
Rating: 5/5 ⭐⭐⭐⭐⭐
Customer: Alice Johnson
Comment: "Excellent running shoes! Very comfortable and durable. Highly recommended!"
Approved By: Admin

Review 2: ✅ APPROVED
Product: Classic Leather Loafers
Rating: 4/5 ⭐⭐⭐⭐
Customer: Sarah Omondi
Comment: "Great quality leather loafers. Perfect for office wear."
Approved By: Admin

Review 3: ⏳ PENDING APPROVAL
Product: Professional Basketball Shoes
Rating: 5/5 ⭐⭐⭐⭐⭐
Customer: James Kiprotich
Comment: "Basketball shoes are of premium quality. Ankle support is excellent."
Status: Awaiting admin approval
```

### Customer Tasks to Test

1. **Browse Products** - View all 12 products by category
2. **Add to Cart** - Add products from any of the 5 orders
3. **Checkout** - Complete purchase with MPESA payment
4. **View Orders** - Check order history and status
5. **Track Order** - Use tracking number for shipped orders
6. **View Order Details** - See itemized order with taxes
7. **Leave Review** - Submit 5-star review on delivered products
8. **Add to Wishlist** - Save favorite products
9. **View Account** - Check profile information and settings

---

## 🧪 TESTING WORKFLOWS

### WORKFLOW 1: New Order (Customer Journey)

**Objective:** Test complete customer order flow

1. **Login as Alice Johnson**
   - Email: customer.alice@gmail.com
   - Password: Cust@123

2. **Browse Products**
   - Navigate to Products page
   - Filter by category (e.g., "Running")
   - View product details including reviews

3. **Add to Cart**
   - Add "Urban Street Sneakers" (KES 8,999)
   - Add "Casual Canvas Shoes" (KES 4,999)
   - View cart summary

4. **Checkout**
   - Enter shipping address
   - Select MPESA payment
   - Confirm order

5. **Verify Order**
   - Check email for confirmation
   - Login to view new order in dashboard

---

### WORKFLOW 2: Staff Order Processing

**Objective:** Test staff role and order management

1. **Login as Staff (John Mutua)**
   - Email: staff.john@groomerscave.com
   - Password: Staff@123

2. **View Dashboard**
   - Check pending orders (should see: ORD-{ts}-001)
   - Check order count by status

3. **Process PENDING Order**
   - Click on ORD-{ts}-001
   - Review order details and totals
   - Mark as PROCESSING
   - Add staff notes

4. **Update Order Status**
   - Navigate to PROCESSING order
   - Generate tracking number
   - Mark as SHIPPED
   - Customer receives tracking email

5. **View Reports**
   - Generate daily sales report
   - Export order data

---

### WORKFLOW 3: Distributor Management

**Objective:** Test distributor features and inventory alerts

1. **Login as Distributor (Nairobi)**
   - Email: distributor.nairobi@groomerscave.com
   - Password: Dist@123

2. **Check Dashboard**
   - View credit balance: KES 500,000 (125,000 used)
   - View low stock alerts: 1 product
   - View recent activities: 2 recorded

3. **View Low Stock Items**
   - Click on alert for "Trail Hiking Boots"
   - Check current stock: 18 units
   - View threshold: 20 units

4. **Check Pricing**
   - View product pricing tiers
   - Compare wholesale vs retail prices

5. **View Activity Log**
   - See all previous orders placed
   - Track restocking history

---

### WORKFLOW 4: Admin Reporting

**Objective:** Test admin analytics and management tools

1. **Login as Admin**
   - Email: admin@groomerscave.com
   - Password: Admin@123

2. **Dashboard Analytics**
   - Check total revenue: ~123,992 KES
   - View order breakdown by status
   - Check product inventory value

3. **Review Low Stock**
   - Identify 2 products below threshold
   - Set reorder alerts
   - Notify distributors

4. **Manage Staff**
   - View staff profiles
   - Check performance ratings (4.5 & 4.2)
   - View assigned departments

5. **Approve Items**
   - Review pending product review
   - Approve/reject review from James Kiprotich
   - View all approved reviews

6. **Generate Reports**
   - Sales by category
   - Customer activity
   - Staff performance

---

### WORKFLOW 5: Product Reviews

**Objective:** Test customer review system

1. **Login as Customer (Sarah Omondi)**
   - Email: customer.sarah@gmail.com
   - Password: Cust@123

2. **Access Delivered Order**
   - Find order: ORD-{ts}-004
   - Click on product: Classic Leather Loafers

3. **Leave Review**
   - Rating: 4/5 ⭐⭐⭐⭐
   - Comment: "Great quality leather loafers. Perfect for office wear."
   - Submit review

4. **Verify Review**
   - As Admin, check pending reviews
   - Approve the new review
   - Customer can see approved review on product page

---

## 📊 KEY METRICS FOR TESTING

| Metric | Value | Status |
|--------|-------|--------|
| Total Users | 8 | ✅ Ready |
| Total Products | 12 | ✅ Ready |
| Total Orders | 5 | ✅ Ready |
| Total Revenue | ~123,992 KES | ✅ Ready |
| Pending Orders | 1 | ⏳ Needs Processing |
| Low Stock Items | 2 | ⚠️ Alerts Active |
| Pending Reviews | 1 | ⏳ Needs Approval |
| Distributor Alerts | 2 | ⚠️ Action Needed |

---

## ✅ QUICK REFERENCE

### URLs
- **Home:** http://localhost:3000
- **Products:** http://localhost:3000/products
- **Login:** http://localhost:3000/auth/signin
- **Admin:** http://localhost:3000/admin
- **Staff Dashboard:** http://localhost:3000/dashboard/staff
- **Distributor Dashboard:** http://localhost:3000/dashboard/distributor
- **Customer Dashboard:** http://localhost:3000/dashboard/customer

### Payments
- All test orders use **MPESA** as payment method
- Test payment statuses: PENDING, PAID
- Test scenario: Accept all MPESA payments automatically

### Database
- **Database File:** `prisma/dev.db` (SQLite)
- **Seed Script:** `prisma/seed.ts`
- **Reset Command:** `npm run db:reset`
- **Seed Command:** `npx prisma db seed`

---

## 🚀 GETTING STARTED

### Step 1: Verify Database
```bash
npx prisma studio  # View current test data in database
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Test Login
- Navigate to: http://localhost:3000/auth/signin
- Use any credentials from above
- Each role should have different features available

### Step 4: Follow Workflows
- Start with Workflow 1 (Customer Journey)
- Progress through all workflows
- Report any issues

---

## 📝 NOTES

- All passwords are **case-sensitive**
- Test data simulates realistic business scenarios
- Pending order is awaiting staff action
- Low stock items have automatic notifications
- Review moderation system is working (1 pending)
- All customers have purchase history for testing
- Staff members are pre-approved and active
- Distributors have established credit limits

---

**Generated:** April 14, 2026  
**System:** Groomers Cave - Premium Men's Grooming & Luxury Lifestyle Platform  
**Status:** ✅ Ready for QA Testing
