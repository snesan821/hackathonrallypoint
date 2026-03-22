# 🚀 Quick Start: Testing RallyPoint

## Step 1: Create Test Users

Run this command once to create all test users:

```bash
npm run create-test-users
```

## Step 2: Sign In

Go to your RallyPoint app and sign in with any of these:

### 👤 Test Users

```
Email:    test.student@rallypoint.app
Password: RallyPoint2026!
Role:     Student User
```

```
Email:    test.organizer@rallypoint.app
Password: RallyPoint2026!
Role:     Organizer
```

```
Email:    test.admin@rallypoint.app
Password: RallyPoint2026!
Role:     Admin
```

```
Email:    test.user1@rallypoint.app
Password: RallyPoint2026!
Role:     General User
```

```
Email:    test.user2@rallypoint.app
Password: RallyPoint2026!
Role:     General User
```

## Step 3: Start Testing!

All users are pre-configured with:
- ✅ Tempe, AZ addresses
- ✅ Interest categories
- ✅ Onboarding completed
- ✅ Ready to use immediately

## 🔄 Reset User Data (Optional)

If you want to give everyone a fresh start:

```bash
# Reset ALL users (including kkalra1@asu.edu, etc.)
npm run reset-all-users

# Or reset just one user
npm run reset-user kkalra1@asu.edu
```

This will:
- Delete all engagement history
- Delete all comments
- Reset onboarding status
- Keep accounts active (can still sign in)
- Keep all civic items

See [RESET_USERS_GUIDE.md](./RESET_USERS_GUIDE.md) for details.

## 🎯 What to Test

### As Student User
- Browse issues in swipe mode
- Save issues for later
- Support housing/transit petitions
- Post comments on issues
- Check "My Impact" stats

### As Organizer
- Create new civic items
- Post organizer updates
- Moderate comments
- Track engagement on your issues

### As Admin
- Access admin dashboard
- Review moderation queue
- View platform analytics
- Manage users and content

## 💡 Tips

- **Same password for all**: `RallyPoint2026!`
- **Works on any machine**: As long as you're connected to the shared database
- **No setup needed**: Users are ready to go after creation
- **Safe to recreate**: Run the script again if needed

## 🔧 Troubleshooting

**Can't sign in?**
1. Make sure you ran `npm run create-test-users`
2. Check your `.env` has correct Clerk keys
3. Verify database connection

**Script fails?**
1. Ensure `CLERK_SECRET_KEY` is in `.env`
2. Check database is running
3. See [TEST_USERS.md](./TEST_USERS.md) for manual creation

## 📚 More Info

- Full documentation: [TEST_USERS.md](./TEST_USERS.md)
- Script details: [scripts/README.md](./scripts/README.md)
