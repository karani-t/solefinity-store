# Account Settings Components - Implementation Guide

## Overview
Complete account management UI components for customer, staff, and distributor accounts. Includes profile picture upload, account info editing, password changes, and activity tracking.

## Components

### 1. ProfilePictureUpload

**Props**:
```tsx
interface ProfilePictureUploadProps {
  currentImage?: string;        // Current profile image URL
  userName?: string;            // User's name for alt text
  onUpload?: (file: File) => Promise<void>;  // Upload handler
}
```

**Features**:
- Display current profile picture or default avatar placeholder
- File input with drag-and-drop support
- Image preview before upload
- File validation (image files only)
- Size validation (max 5MB)
- Loading state during upload
- Error handling with toast notifications
- Success feedback

**Styling**:
- Circular profile image (w-24 h-24)
- Responsive layout
- Gold accent border on image
- Dark theme card design

**Example**:
```tsx
<ProfilePictureUpload 
  currentImage={user.profilePicture}
  userName={user.name}
  onUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/user/profile-picture', {
      method: 'POST',
      body: formData
    });
  }}
/>
```

---

### 2. AccountInfoForm

**Props**:
```tsx
interface AccountInfoFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSubmit?: (data: any) => Promise<void>;
}
```

**Features**:
- Full name editing with text input
- Email display (read-only, cannot change)
- Phone number editing with placeholder formatting
- Form submission with async handling
- Field validation (empty checks)
- Loading state during submission
- Success/error toast notifications
- Professional card design

**Styling**:
- Form fields with consistent styling
- Disabled email input (read-only appearance)
- Helper text for read-only fields
- Dark theme consistent design
- Stack layout on mobile, proper spacing

**Example**:
```tsx
<AccountInfoForm
  initialData={{
    name: "John Doe",
    email: "john@example.com",
    phone: "+254712345678"
  }}
  onSubmit={async (data) => {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }}
/>
```

---

### 3. PasswordChangeForm

**Props**:
```tsx
interface PasswordChangeFormProps {
  onSubmit?: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
}
```

**Features**:
- Current password input with visibility toggle
- New password with strength validation:
  - Minimum 8 characters
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&)
- Confirm password field with matching validation
- Individual field error messages
- Password visibility toggles (👁️/🙈 icons)
- Real-time validation feedback
- Loading state during submission
- Form reset on success

**Validation Rules**:
```
✓ Current password required
✓ New password must be 8+ characters
✓ New password must include: UPPER + lower + number + symbol
✓ Passwords must match
✓ All fields required
```

**Styling**:
- Password input with eye toggle button
- Error states with red text
- Helper text for password requirements
- Dark theme inputs
- Responsive button layout

**Example**:
```tsx
<PasswordChangeForm
  onSubmit={async (data) => {
    const res = await fetch('/api/user/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Password change failed');
  }}
/>
```

---

### 4. ActivitySummary

**Props**:
```tsx
interface ActivitySummaryProps {
  lastLogin?: string;              // ISO date string
  loginCount?: number;             // Total login count
  accountCreated?: string;         // ISO date string
  accountStatus?: "active" | "inactive" | "suspended";
}
```

**Features**:
- Account status display with color-coded badges:
  - Active: Green
  - Inactive: Amber/Warning
  - Suspended: Red
- Last login timestamp with date and time
- Total login count display
- Account creation date
- Dividers between fields
- Read-only information display

**Styling**:
- Card design with dark theme
- Field dividers (border-bottom)
- Badge colors matching status
- Consistent typography hierarchy
- Professional information layout

**Example**:
```tsx
<ActivitySummary
  lastLogin="2025-12-20T14:30:00Z"
  loginCount={42}
  accountCreated="2024-01-15T09:00:00Z"
  accountStatus="active"
/>
```

---

## Integration Example

**Complete Account Settings Page**:
```tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ProfilePictureUpload,
  AccountInfoForm,
  PasswordChangeForm,
  ActivitySummary
} from "@/components/AccountSettingsForm";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [accountData, setAccountData] = useState({
    name: session?.user?.name,
    email: session?.user?.email,
    phone: ""
  });

  const handleProfileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/user/profile-picture", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
  };

  const handleAccountUpdate = async (data: any) => {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Update failed");
    setAccountData(data);
  };

  const handlePasswordChange = async (data: any) => {
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Password change failed");
  };

  return (
    <div className="space-y-lg">
      <h1 className="text-h1 font-bold text-white">Account Settings</h1>

      <div className="grid gap-lg">
        {/* Profile Picture */}
        <ProfilePictureUpload
          currentImage={session?.user?.image}
          userName={session?.user?.name}
          onUpload={handleProfileUpload}
        />

        {/* Account Info */}
        <AccountInfoForm
          initialData={accountData}
          onSubmit={handleAccountUpdate}
        />

        {/* Password */}
        <PasswordChangeForm onSubmit={handlePasswordChange} />

        {/* Activity */}
        <ActivitySummary
          lastLogin={session?.user?.lastLogin}
          loginCount={session?.user?.loginCount}
          accountCreated={session?.user?.createdAt}
          accountStatus="active"
        />
      </div>
    </div>
  );
}
```

---

## API Endpoints Required

### 1. POST /api/user/profile-picture
Upload/update user profile picture

**Request**:
```
Content-Type: multipart/form-data
Body: { file: File }
```

**Response**:
```json
{
  "success": true,
  "url": "https://...",
  "message": "Picture updated"
}
```

---

### 2. PUT /api/user/profile
Update user account information

**Request**:
```json
{
  "name": "New Name",
  "phone": "+254712345678"
}
```

**Response**:
```json
{
  "success": true,
  "user": { "name", "email", "phone" }
}
```

---

### 3. POST /api/user/password
Change user password

**Request**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Validation & Error Handling

### File Upload Validation
- ✅ File type check: `file.type.startsWith("image/")`
- ✅ File size check: `file.size <= 5MB`
- ✅ Error toast on failure
- ✅ Loading state during upload

### Form Validation
- ✅ Required field checks
- ✅ Email format validation (on backend)
- ✅ Phone format helpers (placeholder)
- ✅ Real-time error display

### Password Validation
- ✅ Minimum length (8 chars)
- ✅ Character type requirements
- ✅ Match confirmation
- ✅ Strength indicator
- ✅ Field-level error messages

### Error Handling
- ✅ Try/catch around async operations
- ✅ Toast notifications for all outcomes
- ✅ User-friendly error messages
- ✅ Loading state prevents double-submit

---

## Styling Classes Used

**Cards & Containers**:
- `card bg-base-900 border border-base-800` - Card wrapper
- `p-lg` - Padding
- `space-y-lg` - Vertical spacing

**Text**:
- `text-h4 font-bold text-white` - Section titles
- `text-body text-text-secondary` - Input labels
- `text-caption text-text-muted` - Helper text
- `text-xs text-error` - Error messages

**Inputs**:
- `input` - Text input base class
- `input-error` - Error state
- `pr-12` - Padding for icon

**Buttons**:
- `btn btn-primary w-full` - Primary button
- Disabled state: `disabled`

**Status Badges**:
- `badge badge-success` - Active status
- `badge badge-warning` - Inactive
- `badge badge-error` - Suspended

---

## Security Considerations

1. **Password Strength**: Enforced character requirements prevent weak passwords
2. **Password Visibility**: Toggles allow user to verify typed password
3. **Confirmation Field**: Prevents typos in password change
4. **File Upload**: Type and size validation on client (backend should also validate)
5. **Email Read-Only**: Prevents email changes through UI (backend should enforce)
6. **HTTPS Only**: All API calls must use HTTPS in production

---

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Touch-friendly inputs
- ✅ File input fallback for older browsers

---

## Accessibility Features

- ✅ Label-for-input associations
- ✅ Form error messaging
- ✅ Color not only indicator (badges have text)
- ✅ Focus management
- ✅ Semantic HTML
- ✅ ARIA labels where applicable

---

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA setup to security settings
2. **Session Management**: Show active sessions and sign-out options
3. **Email Verification**: Add email verification flow
4. **Activity Log**: Detailed login history with location/device info
5. **Data Export**: Allow users to export account data (GDPR)
6. **Account Deletion**: Safe account deletion with confirmation
7. **Privacy Settings**: Control who can contact user
8. **Theme Preference**: Store user theme preference
