# 🔄 Reset User Data Guide

This guide explains how to reset user data in RallyPoint to give users a fresh first-time experience.

## 🎯 Use Cases

### When to Reset All Users
- Before a demo or presentation
- Starting a new testing phase
- After major feature changes
- Cleaning up test data

### When to Reset Specific Users
- Individual user requests a reset
- Testing specific user flows
- Fixing data issues for one user

## 📋 Option 1: Reset All Users

This resets **everyone** including existing users like `kkalra1@asu.edu`.

### Command

```bash
npm run reset-all-users
```

### What Gets Deleted

✗ All engagement events (views, saves, supports, comments, etc.)  
✗ All comments and replies  
✗ All user addresses  
✗ All user interests  
✗ Onboarding completion status  
✗ Audit logs  
✗ Fraud signals  

### What Stays

✓ User accounts (can still sign in with same credentials)  
✓ Civic items (issues, petitions, ordinances, etc.)  
✓ AI summaries  
✓ Source documents  
✓ Organizer updates  

### Step-by-Step

1. **Run the script:**
   ```bash
   npm run reset-all-users
   ```

2. **Review the stats:**
   The script will show you what will be deleted

3. **Confirm:**
   Type `yes` when prompted

4. **Wait for completion:**
   The script will delete data in the correct order

5. **Verify:**
   Check the final stats to confirm reset

### Example Output

```
📊 Current Database Stats:
   Users: 15
   Engagement Events: 234
   Comments: 67
   User Addresses: 15
   User Interests: 45
   Civic Items: 8 (will be kept)

⚠️  What will be deleted:
   ✗ All engagement events (views, saves, supports, etc.)
   ✗ All comments and replies
   ✗ All user addresses
   ✗ All user interests
   ✗ Onboarding completion status

Are you sure you want to reset all user data? (yes/no): yes

🧹 Starting data reset...
✅ DATA RESET COMPLETE
```

## 📋 Option 2: Reset Specific User

Reset just one user by their email address.

### Command

```bash
npm run reset-user <email>
```

### Examples

```bash
# Reset a specific ASU student
npm run reset-user kkalra1@asu.edu

# Reset a test user
npm run reset-user test.student@rallypoint.app

# Reset any user by email
npm run reset-user user@example.com
```

### What It Does

- Deletes all data for that specific user
- Resets their onboarding status
- Keeps their account active
- Doesn't affect other users

### Example Output

```
🔄 Resetting user: kkalra1@asu.edu

📊 Current data for Kush Kalra:
   Engagements: 45
   Comments: 12
   Addresses: 1
   Interests: 3
   Onboarding: Completed

🧹 Deleting user data...
   ✅ Deleted 0 moderation flags
   ✅ Deleted 12 comments
   ✅ Deleted 45 engagements
   ✅ Deleted 1 addresses
   ✅ Deleted 3 interests
   ✅ Reset onboarding status

✅ User reset complete!
```

## 🔄 What Happens After Reset

### For All Users

1. **Sign In Still Works**
   - Users can sign in with their existing credentials
   - No need to create new accounts

2. **Onboarding Flow**
   - Users will see the onboarding screen
   - They need to select interests
   - They need to enter their address

3. **Fresh Start**
   - No previous engagement history
   - No saved items
   - No comments
   - Clean "My Impact" dashboard

4. **Civic Items Available**
   - All issues, petitions, etc. are still there
   - Users can browse and engage with them
   - Support counts are preserved

## ⚠️ Important Notes

### Before Running

1. **Backup First** (Optional but recommended)
   ```bash
   # If you want to be extra safe
   pg_dump your_database > backup.sql
   ```

2. **Notify Users**
   - Let users know their data will be reset
   - Explain they'll need to complete onboarding again

3. **Test Environment**
   - Consider testing on a staging database first
   - Verify the reset works as expected

### After Running

1. **Verify Reset**
   - Sign in as a test user
   - Confirm onboarding appears
   - Check that previous data is gone

2. **Monitor**
   - Watch for any issues
   - Check that new engagements are tracked correctly

## 🚨 Troubleshooting

### "Cannot delete due to foreign key constraint"

This shouldn't happen as the script deletes in the correct order, but if it does:

```bash
# Check what's blocking deletion
npx prisma studio
# Look for related records
```

### "User not found" (for specific user reset)

```bash
# List all users to find the correct email
npx prisma studio
# Or check in your database
```

### Script hangs or times out

```bash
# Check database connection
# Verify DATABASE_URL in .env
# Try running with more verbose output
```

## 📊 Verification Queries

After reset, you can verify with these commands:

```bash
# Open Prisma Studio
npx prisma studio

# Or use psql
psql $DATABASE_URL

# Check engagement count (should be 0)
SELECT COUNT(*) FROM "EngagementEvent";

# Check comment count (should be 0)
SELECT COUNT(*) FROM "Comment";

# Check users still exist
SELECT COUNT(*) FROM "User";

# Check onboarding status (should all be false)
SELECT email, "onboardingCompleted" FROM "User";
```

## 🔐 Safety Features

Both scripts include safety features:

1. **Confirmation Prompt**
   - Must type "yes" to proceed
   - Shows what will be deleted

2. **Stats Display**
   - Shows before and after counts
   - Helps verify the reset worked

3. **Ordered Deletion**
   - Respects foreign key constraints
   - Prevents database errors

4. **Account Preservation**
   - Never deletes user accounts
   - Users can always sign back in

## 💡 Tips

### For Demos

```bash
# Before demo: Reset all users
npm run reset-all-users

# After demo: Keep data or reset again
```

### For Testing

```bash
# Reset specific test users
npm run reset-user test.student@rallypoint.app
npm run reset-user test.organizer@rallypoint.app

# Or reset everyone
npm run reset-all-users
```

### For Development

```bash
# Reset your own account for testing
npm run reset-user your.email@example.com

# Test onboarding flow
# Test engagement tracking
# Test impact dashboard
```

## 📞 Need Help?

If you encounter issues:

1. Check the error message
2. Verify database connection
3. Check foreign key constraints
4. Review the script output
5. Check Prisma Studio for data state

## 🎉 Success!

After running the reset:

- ✅ All users have a fresh start
- ✅ Accounts are preserved
- ✅ Civic items are intact
- ✅ Ready for testing/demos
- ✅ Clean slate for everyone

Users can now sign in and experience RallyPoint as if it's their first time!
