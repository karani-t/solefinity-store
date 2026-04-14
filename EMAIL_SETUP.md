# Real Email Setup Guide for SoleFinity

## Overview

The application now uses **Nodemailer** with SMTP for real email delivery instead of console logging. Credentials are sent to new staff/distributors automatically.

---

## Quick Setup (Gmail)

### 1. Enable Gmail App Password
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password generated

### 2. Update `.env` File
Create or update `.env` in the project root:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM=noreply@solefinity.com
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `xxxx-xxxx-xxxx-xxxx` with the 16-character App Password

### 3. Test It
```bash
npm run dev
```
- Sign in as admin
- Create a staff member
- Check Gmail Sent folder (should see credentials email there, not in console)

---

## Alternative Email Providers

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-api-key
SMTP_FROM=noreply@your-domain.mailgun.org
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@solefinity.com
```

### AWS SES (Simple Email Service)
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
SMTP_FROM=verified-email@yourdomain.com
```

---

## How It Works

1. **Admin creates staff/distributor** → automatic email sent
2. **Nodemailer connects to SMTP server** using environment variables
3. **Email credentials are send** with:
   - Login email & temporary password
   - Link to sign in page
   - Role description
   - Instructions to change password

### If SMTP not configured:
- Service logs warning to console during build
- Email functions still work but log to console (dev fallback)
- Production: emails will fail silently with error in logs

---

## Implementation Details

### File Changed
- `app/lib/email.ts`: Replaced mock transport with real Nodemailer SMTP

### Environment Variables
```
SMTP_HOST     - Email server hostname (e.g., smtp.gmail.com)
SMTP_PORT     - Port (usually 587 for TLS, 465 for SSL)
SMTP_USER     - Email account username
SMTP_PASS     - Email account password or app token
SMTP_FROM     - Sender address for emails
```

### Auto-Retry & Error Handling
- Invalid credentials → logged to console, email fails gracefully
- Network errors → caught and logged, app continues
- Success → email sent, user receives credentials

---

## Troubleshooting

### "Email service connection failed"
- Check SMTP_HOST and SMTP_PORT are correct
- Verify credentials (SMTP_USER and SMTP_PASS)
- Check firewall/network allows outbound port 587 or 465

### Emails not sending in production
- Verify environment variables are set on deployment (Vercel, Railway, etc.)
- Check SMTP provider's rate limits
- Review server logs for error details

### Gmail showing "Sign-in attempt blocked"
- Use **App Password**, not your Google account password
- Must have 2-Step Verification enabled
- Password is the 16-character code from apppasswords page

### Still seeing emails in console?
- Check that `.env` file exists with all SMTP settings
- Restart dev server after updating `.env`
- Verify no missing quotes or typos in variable names

---

## Email Templates

### Credentials Email (sent on account creation)
- **To**: User's email
- **Subject**: `[SoleFinity] Welcome {Name}! Your Account is Ready`
- **Contains**:
  - Email & temporary password
  - Role type & description
  - First steps instructions
  - Sign-in link

### Future Email Triggers
Ready to add:
- Order confirmations
- Status updates (shipped, delivered)
- Payment reminders
- Low stock alerts
- Invoice generation

---

## Testing Checklist

- [ ] `.env` file created with SMTP settings
- [ ] Dev server started: `npm run dev`
- [ ] Admin creates staff account
- [ ] Email appears in provider's sent folder (Gmail Sent, etc.)
- [ ] Recipient can sign in with credentials
- [ ] Password change works

---

## Production Deployment

1. **Add SMTP secrets** to deployment platform:
   - Vercel: Project Settings → Environment Variables
   - Railway: Variables tab
   - Other: Refer to platform docs

2. **Use a dedicated email account**:
   - Don't use personal email
   - Create business email account
   - Enable security requirements (2FA for Gmail, etc.)

3. **Monitor email delivery**:
   - Check logs for failures
   - Set up alerts for delivery issues
   - Test transactional emails regularly

---

## Support

For issues with specific email providers, refer to their SMTP documentation:
- Gmail: [support.google.com/accounts](https://support.google.com/accounts/answer/185833)
- Mailgun: [mailgun.com/smtp](https://www.mailgun.com/smtp/)
- SendGrid: [sendgrid.com/docs](https://sendgrid.com/docs/for-developers/)
- AWS SES: [aws.amazon.com/ses](https://aws.amazon.com/ses/)
