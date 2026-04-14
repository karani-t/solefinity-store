# Staff & Distributor Onboarding & Dashboard Guide

## Admin Workflow

### 1. Adding Staff
1. Navigate to `/admin/staff`
2. Fill in the form:
   - Name
   - Email
   - Phone
   - Temporary Password
   - Department (Sales, Inventory, Management, Distribution)
   - Warehouse ID (optional)
3. Click "Create Staff"
4. Staff receives email with:
   - Login credentials
   - Role description
   - Link to sign in
   - Instructions to change password

### 2. Adding Distributors
1. Navigate to `/admin/distributors`
2. Fill in the form:
   - Name & Email
   - Phone & Password
   - Business Name & Type
   - Location & County
   - Credit Limit (KES)
   - Payment Terms (days)
3. Click "Create Distributor"
4. Distributor receives email with credentials and dashboard access

### 3. Role Management
In `/admin/staff`:
- Use the dropdown menu next to each staff member
- Select "STAFF" or "MANAGER" to change role
- MANAGER role grants access to staff management APIs
- Changes apply immediately

---

## Staff Dashboard (`/dashboard/staff`)

### Features
- **Sales Summary**: Total sales, orders processed, pending payments
- **Order Management**: View all customer orders with status
- **Payment Confirmation**: Click "Confirm Payment" to mark orders as PAID
- **Quick Actions**:
  - Browse Products & Create Sales
  - Generate Sales Reports (endpoint ready)

### Capabilities
- ✅ Make sales (access to `/products`)
- ✅ Manage customer orders
- ✅ Confirm M-Pesa payments
- ✅ Generate sales reports
- ✅ Track commission (ready for integration)

### Key Metrics
1. **Total Sales (KES)**: Sum of all order totals
2. **Orders Processed**: Count of orders handled by this staff
3. **Pending Payments**: Orders awaiting payment confirmation

---

## Distributor Dashboard (`/dashboard/distributor`)

### Features
- **Credit Management**:
  - Credit Limit: Maximum order value allowed (set by admin)
  - Credit Used: Total unpaid orders
  - Available Credit: Remaining capacity (updates in real-time)
- **Order Tracking**: View all distributor orders with status
- **Order Status Flow**:
  - PENDING → APPROVED → DISPATCHED → DELIVERED

### Capabilities
- ✅ Browse products with distributor pricing
- ✅ Place orders (up to credit limit)
- ✅ View tiered pricing by quantity
- ✅ Track order status
- ✅ Monitor payment due dates
- ✅ Manage credit utilization

### Payment Terms
- Default: 30 days from order date
- Customizable per distributor (set at creation or via admin update)

---

## Sign In Flow

### Common Entry Point
- All users sign in at `/auth/signin`
- Credentials sent via email after creation

### After Sign In (Role-Based Redirect)
```
ADMIN/MANAGER  → /admin
STAFF          → /dashboard/staff
DISTRIBUTOR    → /dashboard/distributor
CUSTOMER       → /orders (customer order history)
```

---

## Email Notifications

### Staff/Distributor Welcome Email
Sent immediately after admin creates account:
- Email & temporary password
- Role description & responsibilities
- Link to sign in
- Instructions to update password

### Future Enhancements
- Order status updates
- Payment reminders
- Low stock alerts (staff)
- Invoice generation (distributor)

---

## Security Notes

1. **Password**: Temporary password sent via email; users must change on first login
2. **Role Guards**: Each dashboard & API endpoint checks user role
3. **Email Unverified**: Currently mock email (logs to console in dev)
   - Replace with real provider (Mailgun, SendGrid, etc.) in production

---

## Database Relations

### Staff Table
- `staffId`: Unique employee ID
- `userId`: Reference to User row
- `department`: Role classification
- `warehouseId`: Optional warehouse assignment
- `isApproved`: Admin approval flag

### Distributor Table
- `userId`: Reference to User row
- `businessName`: Distributor business name
- `creditLimit`: Max order amount (KES)
- `creditUsed`: Current outstanding balance
- `paymentTerms`: Invoice due days
- `isApproved`: Admin approval flag

---

## Admin Control Panel URLs

- **Add Staff**: `/admin/staff` - Form + list with role dropdown
- **Add Distributor**: `/admin/distributors` - Form + list with deactivate
- **View Products**: `/admin/products` - Product CRUD
- **View Analytics**: `/admin/analytics` - Sales reports & trends

---

## Testing the Flow

### 1. Create Staff
```
Email: john.staff@example.com
Name: John Staff
Password: test123staff
Department: Sales
```
→ Check console for email output
→ Use those credentials to sign in
→ Redirected to `/dashboard/staff`

### 2. Create Distributor
```
Email: acme.dist@example.com
Name: ACME Distributor
Business: ACME Wholesale
Code Limit: 100000
```
→ Check console for email
→ Sign in to access `/dashboard/distributor`
→ Browse products & place orders

### 3. Manage Roles
→ Go to `/admin/staff`
→ Use dropdown to promote John to MANAGER
→ John can now manage inventory & staff (with additional pages to come)

---

## Next Steps (Optional Enhancements)

1. **Sales Reports**: Add `/dashboard/staff/reports` with date range, commission calculation
2. **Inventory Management**: Link staff to warehouse inventory tracking
3. **Commission Tracking**: Auto-calculate & display staff commissions
4. **Invoice Generation**: PDF invoices for distributor orders
5. **Approval Workflow**: Admin approval before orders ship
6. **Real Email Integration**: Replace mock with Mailgun/SendGrid
