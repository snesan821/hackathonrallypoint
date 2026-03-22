# RallyPoint Scripts

Utility scripts for RallyPoint development and testing.

## Available Scripts

### Create Test Users

Creates test users in Clerk and syncs them to the database.

```bash
npm run create-test-users
# or
npx tsx scripts/create-test-users.ts
```

**Prerequisites:**
- `CLERK_SECRET_KEY` must be set in your `.env` file
- Database must be accessible

**What it does:**
1. Creates 5 test users in Clerk with predefined credentials
2. Syncs users to your PostgreSQL database
3. Sets up user addresses in Tempe, AZ
4. Configures user interests based on role
5. Marks users as onboarded (ready to use)

**Output:**
The script will display all created credentials in a formatted table.

### Reset All User Data

Clears all user interactions and history while keeping accounts intact.

```bash
npm run reset-all-users
# or
npx tsx scripts/reset-user-data.ts
```

**What it does:**
- Deletes all engagement events (views, saves, supports, etc.)
- Deletes all comments and replies
- Deletes all user addresses
- Deletes all user interests
- Resets onboarding status (users will see onboarding again)
- Keeps user accounts (can still sign in)
- Keeps civic items (issues, petitions, etc.)

**Use case:**
Give everyone a fresh first-time user experience for testing or demos.

### Reset Specific User

Resets data for a single user by email.

```bash
npm run reset-user kkalra1@asu.edu
# or
npx tsx scripts/reset-specific-user.ts kkalra1@asu.edu
```

**What it does:**
- Deletes all data for the specified user
- Resets their onboarding status
- Keeps their account active

**Use case:**
Reset individual users without affecting others.

## Test User Credentials

See [TEST_USERS.md](../TEST_USERS.md) for complete list of test users and their credentials.

**Quick Reference:**
- Email: `test.student@rallypoint.app`
- Password: `RallyPoint2026!`

All test users use the same password for simplicity.

## Troubleshooting

### "CLERK_SECRET_KEY not found"
Add your Clerk secret key to `.env`:
```
CLERK_SECRET_KEY=sk_test_your_key_here
```

### "User already exists"
This is normal. The script will skip existing users and continue.

### Database connection errors
Verify your `DATABASE_URL` in `.env` is correct and the database is running.

## Development

To add new scripts:

1. Create a new `.ts` file in this directory
2. Add appropriate imports and type safety
3. Add a script command to `package.json`
4. Document it in this README

## Notes

- All scripts use TypeScript and are executed with `tsx`
- Scripts should be idempotent (safe to run multiple times)
- Always include error handling and helpful console output
- Test scripts locally before committing
