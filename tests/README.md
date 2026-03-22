# Bug Condition Exploration Tests

This directory contains bug condition exploration tests for the follow-support-fixes bugfix spec.

## Overview

These tests follow the exploratory bugfix workflow methodology:

1. **Bug Condition Tests** - Tests that FAIL on unfixed code, confirming bugs exist
2. **Preservation Tests** - Tests that PASS on unfixed code, establishing baseline behavior
3. **Implementation** - Fix the bugs
4. **Verification** - Re-run tests to confirm fixes work and no regressions

## Running Tests

### Prerequisites

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Set up test environment variables (create `.env.test.local`):
   ```bash
   TEST_API_URL=http://localhost:3000
   TEST_USER_ID=your-test-user-id
   TEST_AUTH_TOKEN=your-test-auth-token
   ```

### Run Bug Condition Tests

```bash
pnpm test:bugfix
```

### Expected Outcomes

**Before Fix (Current State)**:
- ✗ Bug Condition 1 tests SHOULD FAIL (confirms following tab sync issues)
- ✗ Bug Condition 2 tests SHOULD FAIL (confirms support toggle failures)
- ✗ Bug Condition 3 tests SHOULD FAIL (confirms missing activity tracking)
- ✗ Bug Condition 4 tests SHOULD FAIL (confirms missing card stats)

**After Fix (Target State)**:
- ✓ All Bug Condition tests SHOULD PASS (confirms bugs are fixed)
- ✓ All Preservation tests SHOULD PASS (confirms no regressions)

## Test Structure

### Bug Condition 1: Following Tab Sync Issues
- Tests that followed items appear immediately in saved items API
- Tests that unfollowed items are removed immediately from saved items

### Bug Condition 2: Support Toggle Failures
- Tests that unsupport action works reliably
- Tests that support count decrements correctly

### Bug Condition 3: Missing Activity Tracking
- Tests that UNSAVE actions are tracked in engagement events
- Tests that UNSUPPORT actions are tracked in engagement events

### Bug Condition 4: Missing Card Stats
- Tests that swipe API includes viewCount, saveCount, supporterCount
- Tests that grid feed API includes viewCount, saveCount, supporterCount

## Notes

- These tests use Node.js built-in test runner (Node 20+)
- Tests are integration tests that hit real API endpoints
- Test data should be cleaned up after each run
- DO NOT modify tests when they fail - they encode the expected behavior
