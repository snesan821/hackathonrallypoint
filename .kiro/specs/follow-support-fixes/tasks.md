# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Follow/Unfollow and Support/Unsupport State Tracking
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test implementation details from Bug Conditions in design:
    - Bug 1: Follow an item from grid UI, immediately fetch saved items API - expect item missing (will fail on unfixed code)
    - Bug 2: Support an item, then click support again - expect unsupport to fail (will fail on unfixed code)
    - Bug 3: Perform UNSAVE action, query EngagementEvent table - expect no UNSAVE event (will fail on unfixed code)
    - Bug 4: Fetch swipe/grid items, check for viewCount/saveCount/supporterCount - expect undefined (will fail on unfixed code)
  - The test assertions should match the Expected Behavior Properties from design
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Engagement Actions Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - VIEW action tracking
    - COMMENT actions
    - SHARE functionality
    - High-value actions (SIGN, VOLUNTEER, CONTACT_REP) creating audit logs
    - First-time SAVE creating engagement event
    - First-time SUPPORT incrementing currentSupport
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix engagement event tracking for UNSAVE and UNSUPPORT actions

  - [x] 3.1 Update engage API endpoint to create UNSAVE/UNSUPPORT events
    - Modify `src/app/api/civic-items/[slug]/engage/route.ts`
    - Change UNSAVE action: create new UNSAVE engagement event instead of deleting SAVE event
    - Change UNSUPPORT action: create new UNSUPPORT engagement event instead of deleting SUPPORT event
    - Update user engagement state logic to find most recent SAVE/UNSAVE or SUPPORT/UNSUPPORT event
    - Add cache invalidation for `user:${user.id}:activity` key
    - _Bug_Condition: isBugCondition3(input) where input.action IN ['UNSAVE', 'UNSUPPORT']_
    - _Expected_Behavior: engagementEventCreated(result, input.action) from design_
    - _Preservation: Preservation Requirements - existing engagement actions unchanged_
    - _Requirements: 1.4, 1.5, 2.4, 2.5, 3.1, 3.2, 3.4, 3.5_

  - [x] 3.2 Update saved items API to detect current save state
    - Modify `src/app/api/user/saved/route.ts`
    - Query for most recent SAVE/UNSAVE event per item
    - Filter to only items where latest action is SAVE
    - Add engagement count enrichment (viewCount, saveCount, supporterCount)
    - _Bug_Condition: isBugCondition1(input) where input.action === 'UNSAVE' AND input.uiContext === 'saved'_
    - _Expected_Behavior: followingTabUpdatedImmediately(result) from design_
    - _Preservation: Preservation Requirements - saved page continues to fetch items ordered by save timestamp_
    - _Requirements: 1.2, 2.2, 3.3_

  - [x] 3.3 Add engagement count enrichment to grid feed API
    - Modify `src/lib/civic/items.ts` function `getCivicItemsPage`
    - Add engagement count aggregation similar to swipe endpoint
    - Group by civicItemId and action, count engagements
    - Map counts to items: viewCount, saveCount, supporterCount
    - Include stats in return type
    - _Bug_Condition: isBugCondition4(input) where input.uiContext === 'grid'_
    - _Expected_Behavior: statsDisplayed(result, ['viewCount', 'saveCount', 'supporterCount']) from design_
    - _Preservation: Preservation Requirements - existing UI elements continue to display correctly_
    - _Requirements: 1.7, 2.7, 3.7_

  - [x] 3.4 Update profile stats calculation to handle UNSAVE/UNSUPPORT
    - Modify `src/lib/user/profile.ts` function `getProfilePageData`
    - Calculate net saves (SAVE - UNSAVE)
    - Calculate net supports (SUPPORT - UNSUPPORT)
    - Verify activity query includes UNSAVE and UNSUPPORT events
    - _Bug_Condition: isBugCondition3(input) where input.action IN ['UNSAVE', 'UNSUPPORT']_
    - _Expected_Behavior: engagementEventCreated(result, input.action) visible in activity history_
    - _Preservation: Preservation Requirements - existing stats calculation unchanged_
    - _Requirements: 1.4, 1.5, 2.4, 2.5, 3.3_

  - [x] 3.5 Add stats display to CivicItemCard component
    - Modify `src/components/civic/CivicItemCard.tsx`
    - Add stats row after summary, before deadline
    - Display viewCount, saveCount, supporterCount with icons
    - Update TypeScript interface to include optional stats fields
    - _Bug_Condition: isBugCondition4(input) where input.uiContext === 'grid'_
    - _Expected_Behavior: statsDisplayed(result, ['viewCount', 'saveCount', 'supporterCount']) from design_
    - _Preservation: Preservation Requirements - existing UI elements continue to display correctly_
    - _Requirements: 1.7, 2.7, 3.7_

  - [x] 3.6 Verify SwipeCard stats display (already implemented)
    - Review `src/components/discover/SwipeCard.tsx`
    - Confirm stats display is already implemented (lines 237-247)
    - Verify props are being passed from parent component
    - No code changes needed - verification only
    - _Bug_Condition: isBugCondition4(input) where input.uiContext === 'swipe'_
    - _Expected_Behavior: statsDisplayed(result, ['viewCount', 'saveCount', 'supporterCount']) from design_
    - _Preservation: Preservation Requirements - existing UI elements continue to display correctly_
    - _Requirements: 1.6, 2.6, 3.7_

  - [x] 3.7 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Follow/Unfollow and Support/Unsupport State Tracking
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - _Requirements: Expected Behavior Properties from design - 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Engagement Actions Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: Preservation Requirements from design - 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all bug condition exploration tests - expect PASS
  - Run all preservation property tests - expect PASS
  - Test full flow: follow from grid → verify in saved tab → unfollow → verify removed
  - Test full flow: support from swipe → verify count incremented → unsupport → verify count decremented
  - Test activity history displays UNSAVE and UNSUPPORT events
  - Test stats display in swipe and grid UIs with real engagement data
  - Ensure all tests pass, ask the user if questions arise
