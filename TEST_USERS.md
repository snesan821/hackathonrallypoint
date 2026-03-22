# RallyPoint Test User Credentials

These test users can be used to sign in to RallyPoint on any machine connected to your shared database.

## 🔐 Test User Credentials

| Role      | Email                              | Password          | Description                    |
|-----------|------------------------------------|--------------------|--------------------------------|
| USER      | test.student@rallypoint.app        | RallyPoint2026!   | Student user with housing/transit interests |
| ORGANIZER | test.organizer@rallypoint.app      | RallyPoint2026!   | Organizer with environment/zoning interests |
| ADMIN     | test.admin@rallypoint.app          | RallyPoint2026!   | Admin user with full permissions |
| USER      | test.user1@rallypoint.app          | RallyPoint2026!   | General user with healthcare interests |
| USER      | test.user2@rallypoint.app          | RallyPoint2026!   | General user with safety interests |

## 📋 How to Use

### Option 1: Automatic Creation (Recommended)

Run the automated script to create all test users:

```bash
# Make sure CLERK_SECRET_KEY is set in your .env file
npx tsx scripts/create-test-users.ts
```

This will:
- Create users in Clerk
- Sync them to your database
- Set up addresses and interests
- Mark them as onboarded

### Option 2: Manual Creation via Clerk Dashboard

If the script doesn't work, create users manually:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your RallyPoint application
3. Go to "Users" section
4. Click "Create User"
5. For each test user above:
   - Enter the email address
   - Set password to: `RallyPoint2026!`
   - Set first/last name (e.g., "Alex Martinez" for student)
   - Click "Create"

6. After creating in Clerk, the users will auto-sync to your database on first sign-in

### Option 3: Sign Up Through the App

1. Go to your RallyPoint app
2. Click "Sign Up"
3. Use the email addresses above
4. Set password to: `RallyPoint2026!`
5. Complete onboarding

## 🎯 User Details

### Test Student (test.student@rallypoint.app)
- **Name**: Alex Martinez
- **Role**: USER
- **Interests**: Housing, Transit, Education
- **Address**: 1151 S Forest Ave, Tempe, AZ 85281 (Near ASU)
- **Use Case**: Testing student-focused features, transit petitions, housing issues

### Test Organizer (test.organizer@rallypoint.app)
- **Name**: Jordan Chen
- **Role**: ORGANIZER
- **Interests**: Environment, Zoning
- **Address**: 31 E 5th St, Tempe, AZ 85281 (Downtown Tempe)
- **Use Case**: Testing organizer features, creating civic items, posting updates

### Test Admin (test.admin@rallypoint.app)
- **Name**: Sam Rivera
- **Role**: ADMIN
- **Interests**: City Services, Budget
- **Address**: 120 E 1st St, Tempe, AZ 85281 (City Hall area)
- **Use Case**: Testing admin features, moderation, analytics

### Test User 1 (test.user1@rallypoint.app)
- **Name**: Taylor Johnson
- **Role**: USER
- **Interests**: Healthcare, Education
- **Address**: 660 S Mill Ave, Tempe, AZ 85281 (Mill Avenue District)
- **Use Case**: Testing general user features, healthcare issues

### Test User 2 (test.user2@rallypoint.app)
- **Name**: Morgan Davis
- **Role**: USER
- **Interests**: Public Safety, Transit
- **Address**: 1255 E University Dr, Tempe, AZ 85281 (Near ASU)
- **Use Case**: Testing safety features, transit issues

## 🔧 Troubleshooting

### "User already exists" error
- This is normal if users were created previously
- Just use the credentials to sign in

### Can't sign in
1. Verify you're using the correct email/password
2. Check that Clerk is properly configured in your .env:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Make sure your database is accessible
4. Try resetting the password in Clerk Dashboard

### Users not syncing to database
- Users auto-sync on first sign-in
- Check that the Clerk webhook is configured
- Verify DATABASE_URL is correct in .env

## 🚀 Quick Start

1. Run the creation script:
   ```bash
   npx tsx scripts/create-test-users.ts
   ```

2. Sign in with any test user:
   - Go to http://localhost:3000/sign-in
   - Use email: `test.student@rallypoint.app`
   - Use password: `RallyPoint2026!`

3. Start testing!

## 📝 Notes

- All test users use the same password for simplicity
- Users are pre-configured with Tempe, AZ addresses
- Each user has different interests for testing personalization
- Users are marked as onboarded (skip onboarding flow)
- Safe to run the script multiple times (idempotent)

## 🔒 Security

**⚠️ IMPORTANT**: These are TEST credentials only!

- Never use these in production
- Change passwords before deploying
- Use strong, unique passwords for real users
- Enable 2FA for admin accounts in production
