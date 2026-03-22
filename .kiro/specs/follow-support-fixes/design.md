# Follow and Support Fixes Bugfix Design

## Overview

This design addresses four interconnected bugs in the follow/support engagement system:

1. **Following tab sync issues**: Items don't appear immediately after following, and don't disappear immediately after unfollowing
2. **Support toggle failures**: Unsupport action doesn't work reliably
3. **Missing activity tracking**: UNSAVE and UNSUPPORT actions aren't recorded in user activity history
4. **Missing card stats**: View, follow, and support counts aren't displayed in swipe and grid UIs

The root causes span multiple layers: API endpoint logic, database queries, cache invalidation, and UI component data fetching. The fix strategy focuses on ensuring proper engagement event creation/deletion, consistent cache invalidation, and enriching API responses with engagement statistics.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger each of the four bugs - when follow/unfollow actions don't sync, when unsupport fails, when UNSAVE/UNSUPPORT aren't tracked, and when stats aren't displayed
- **Property (P)**: The desired behavior - immediate UI updates, reliable toggle actions, complete activity tracking, and visible engagement statistics
- **Preservation**: Existing engagement functionality (first-time follow/support, view tracking, high-value action auditing) that must remain unchanged
- **EngagementEvent**: Database record tracking user interactions with civic items (SAVE, UNSAVE, SUPPORT, UNSUPPORT, VIEW, etc.)
- **Optimistic UI**: Client-side state updates that occur immediately before server confirmation, with rollback on error
- **Cache invalidation**: Clearing Redis cache entries when data changes to ensure fresh data on next fetch

## Bug Details

### Bug Condition 1: Following Tab Sync Issues

The bug manifests when a user follows an issue from the swipe or grid UI, or unfollows from the saved page. The Following tab doesn't reflect changes immediately.

**Formal Specification:**
```
FUNCTION isBugCondition1(input)
  INPUT: input of type { action: 'SAVE' | 'UNSAVE', uiContext: 'swipe' | 'grid' | 'saved' }
  OUTPUT: boolean
  
  RETURN (input.action === 'SAVE' AND input.uiContext IN ['swipe', 'grid'])
         OR (input.action === 'UNSAVE' AND input.uiContext === 'saved')
         AND NOT followingTabUpdatedImmediately()
END FUNCTION
```

### Bug Condition 2: Support Toggle Failures

The bug manifests when a user clicks the support button on an already-supported issue. The unsupport action doesn't work reliably.

**Formal Specification:**
```
FUNCTION isBugCondition2(input)
  INPUT: input of type { action: 'SUPPORT', alreadySupported: boolean }
  OUTPUT: boolean
  
  RETURN input.action === 'SUPPORT'
         AND input.alreadySupported === true
         AND NOT unsupportActionTriggered()
END FUNCTION
```

### Bug Condition 3: Missing Activity Tracking

The bug manifests when a user performs UNSAVE or UNSUPPORT actions. These actions are not recorded in the EngagementEvent table.

**Formal Specification:**
```
FUNCTION isBugCondition3(input)
  INPUT: input of type { action: 'UNSAVE' | 'UNSUPPORT' }
  OUTPUT: boolean
  
  RETURN input.action IN ['UNSAVE', 'UNSUPPORT']
         AND NOT engagementEventCreated(input.action)
END FUNCTION
```

### Bug Condition 4: Missing Card Stats

The bug manifests when viewing civic items in swipe or grid UI. Card stats (viewCount, saveCount, supporterCount) are not displayed.

**Formal Specification:**
```
FUNCTION isBugCondition4(input)
  INPUT: input of type { uiContext: 'swipe' | 'grid' }
  OUTPUT: boolean
  
  RETURN input.uiContext IN ['swipe', 'grid']
         AND NOT statsDisplayed(['viewCount', 'saveCount', 'supporterCount'])
END FUNCTION
```

### Examples

**Bug 1 Examples:**
- User swipes right on "Housing Bill 123" → Following tab doesn't show it until page refresh
- User clicks unfollow on saved page → Item remains visible until page refresh
- User follows from grid UI → Following tab shows stale data

**Bug 2 Examples:**
- User clicks support button (already supported) → Button doesn't toggle to "Supported" state
- User tries to unsupport → Support count doesn't decrement
- User clicks support multiple times → Inconsistent state

**Bug 3 Examples:**
- User unfollows an issue → No UNSAVE event in EngagementEvent table
- User unsupports an issue → No UNSUPPORT event in EngagementEvent table
- User views profile activity → UNSAVE and UNSUPPORT actions missing from history

**Bug 4 Examples:**
- Swipe card shows title and summary but no view/follow/support counts
- Grid card shows action buttons but no engagement statistics
- User can't see how popular an issue is before engaging

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- First-time SAVE action creates EngagementEvent with action='SAVE'
- First-time SUPPORT action increments currentSupport and creates EngagementEvent with action='SUPPORT'
- VIEW action tracking continues to work
- High-value actions (SUPPORT, SIGN, VOLUNTEER, CONTACT_REP) continue to create audit log entries
- Redis cache invalidation continues for relevant keys
- Share functionality continues to work via native API or clipboard fallback
- All existing UI elements (category badges, deadlines, summaries) continue to display correctly

**Scope:**
All engagement actions NOT involving SAVE/UNSAVE or SUPPORT/UNSUPPORT should be completely unaffected by this fix. This includes:
- VIEW tracking
- COMMENT actions
- SHARE actions
- SKIP actions (swipe left)
- Other high-value actions (SIGN, VOLUNTEER, CONTACT_REP, RSVP)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

### Bug 1: Following Tab Sync Issues

1. **Incomplete Cache Invalidation**: The `/api/civic-items/[slug]/engage` endpoint invalidates `user:${user.id}:saved` cache, but the saved page may be using stale data or not refetching properly
2. **Client-Side State Management**: The saved page (`src/app/(auth)/saved/page.tsx`) handles UNSAVE by filtering items locally, but the logic may not be triggered consistently
3. **Race Conditions**: Multiple rapid follow/unfollow actions may cause race conditions in state updates

### Bug 2: Support Toggle Failures

1. **Missing UNSUPPORT Logic in QuickActions**: The `QuickActions.tsx` component attempts to call `onEngage('UNSUPPORT')` but the parent components may not handle this action properly
2. **Idempotency Check**: The engage endpoint has idempotency logic that prevents duplicate SUPPORT actions, but doesn't properly handle the toggle-off case
3. **Optimistic State Rollback**: The optimistic UI updates may not be rolling back correctly on error

### Bug 3: Missing Activity Tracking

1. **Delete Instead of Create**: The engage endpoint deletes the original SAVE/SUPPORT engagement events when toggling off, but doesn't create new UNSAVE/UNSUPPORT events
2. **Activity Query Filters**: The profile activity query may be filtering out UNSAVE/UNSUPPORT events even if they existed

### Bug 4: Missing Card Stats

1. **Swipe API Missing Enrichment**: The `/api/swipe` endpoint includes engagement count enrichment logic, but it's already implemented correctly (lines 48-66 in route.ts)
2. **Grid API Missing Enrichment**: The feed page uses `getCivicItemsPage` which may not include engagement statistics
3. **Component Props Missing**: The `SwipeCard` and `CivicItemCard` components receive stats props but may not be displaying them

## Correctness Properties

Property 1: Bug Condition 1 - Following Tab Immediate Sync

_For any_ engagement action where a user follows (SAVE) or unfollows (UNSAVE) an issue, the Following tab SHALL immediately reflect the change without requiring a page refresh, showing the item in the list after SAVE and removing it after UNSAVE.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition 2 - Support Toggle Reliability

_For any_ support button click where the user has already supported the issue, the system SHALL toggle to unsupport, create an UNSUPPORT engagement event, decrement the support count, and update the UI to show the unsupported state.

**Validates: Requirements 2.3**

Property 3: Bug Condition 3 - Activity Tracking Completeness

_For any_ UNSAVE or UNSUPPORT action performed by a user, the system SHALL create an EngagementEvent record with the corresponding action type and timestamp, making it visible in the user's activity history.

**Validates: Requirements 2.4, 2.5**

Property 4: Bug Condition 4 - Card Stats Visibility

_For any_ civic item displayed in swipe or grid UI, the card SHALL display engagement statistics (viewCount, saveCount, supporterCount) prominently to help users understand issue popularity.

**Validates: Requirements 2.6, 2.7**

Property 5: Preservation - Existing Engagement Actions

_For any_ engagement action that is NOT SAVE, UNSAVE, SUPPORT, or UNSUPPORT, the system SHALL produce exactly the same behavior as before, preserving all existing functionality for VIEW, COMMENT, SHARE, SKIP, and high-value actions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

#### File 1: `src/app/api/civic-items/[slug]/engage/route.ts`

**Function**: `POST` handler

**Specific Changes**:

1. **UNSAVE Action - Create Event Instead of Delete**:
   - Current: Deletes the SAVE engagement event (line 54)
   - Fix: Create a new UNSAVE engagement event, keep the original SAVE event for history
   - Rationale: Activity tracking requires both SAVE and UNSAVE events to exist

2. **UNSUPPORT Action - Create Event Instead of Delete**:
   - Current: Deletes the SUPPORT engagement event (line 91)
   - Fix: Create a new UNSUPPORT engagement event, keep the original SUPPORT event for history
   - Rationale: Activity tracking requires both SUPPORT and UNSUPPORT events to exist

3. **Update User Engagement State Logic**:
   - Current: Queries all engagements after action (lines 70-76, 107-113)
   - Fix: Determine current state by finding the most recent SAVE/UNSAVE or SUPPORT/UNSUPPORT event
   - Rationale: With both events existing, we need to check which is most recent

4. **Cache Invalidation Enhancement**:
   - Current: Invalidates `user:${user.id}:saved` and `civic_item:${slug}` (lines 78-82, 115-119)
   - Fix: Also invalidate `user:${user.id}:activity` cache key
   - Rationale: Activity history needs to refresh when UNSAVE/UNSUPPORT events are created

#### File 2: `src/lib/civic/items.ts`

**Function**: `getCivicItemsPage`

**Specific Changes**:

1. **Add Engagement Count Enrichment**:
   - Current: Returns civic items without engagement statistics
   - Fix: Add engagement count aggregation similar to `/api/swipe` endpoint (lines 48-66)
   - Implementation:
     ```typescript
     const engagementCounts = await prisma.engagementEvent.groupBy({
       by: ['civicItemId', 'action'],
       where: { civicItemId: { in: itemIds } },
       _count: { action: true },
     })
     ```
   - Map counts to items: viewCount, saveCount, supporterCount

2. **Include Stats in Return Type**:
   - Add viewCount, saveCount, supporterCount to the returned item objects

#### File 3: `src/app/api/user/saved/route.ts`

**Function**: `GET` handler

**Specific Changes**:

1. **Update Save Detection Logic**:
   - Current: Queries for `action: 'SAVE'` (line 21)
   - Fix: Query for most recent SAVE/UNSAVE event per item, filter where SAVE is most recent
   - Implementation:
     ```typescript
     // Get latest SAVE or UNSAVE event for each item
     const latestSaveEvents = await prisma.$queryRaw`
       SELECT DISTINCT ON (civic_item_id) 
         civic_item_id, action, timestamp
       FROM engagement_event
       WHERE user_id = ${user.id}
         AND action IN ('SAVE', 'UNSAVE')
       ORDER BY civic_item_id, timestamp DESC
     `
     // Filter to only items where latest action is SAVE
     const savedItemIds = latestSaveEvents
       .filter(e => e.action === 'SAVE')
       .map(e => e.civic_item_id)
     ```

2. **Add Engagement Count Enrichment**:
   - Similar to grid feed, add viewCount, saveCount, supporterCount to returned items

#### File 4: `src/lib/user/profile.ts`

**Function**: `getProfilePageData`

**Specific Changes**:

1. **Update Activity Query**:
   - Current: Fetches recent engagements without filtering (line 67)
   - Fix: No change needed - query already fetches all engagement types
   - Verification: Ensure UNSAVE and UNSUPPORT events appear in results

2. **Update Stats Calculation**:
   - Current: Groups engagements by action (line 82)
   - Fix: Update to handle UNSAVE/UNSUPPORT in stats
   - Implementation:
     ```typescript
     // Calculate net saves (SAVE - UNSAVE)
     const saveCount = engagementStats.save || 0
     const unsaveCount = engagementStats.unsave || 0
     const netSaves = Math.max(0, saveCount - unsaveCount)
     
     // Calculate net supports (SUPPORT - UNSUPPORT)
     const supportCount = engagementStats.support || 0
     const unsupportCount = engagementStats.unsupport || 0
     const netSupports = Math.max(0, supportCount - unsupportCount)
     ```

#### File 5: `src/components/civic/CivicItemCard.tsx`

**Function**: Component render

**Specific Changes**:

1. **Add Stats Display Section**:
   - Current: No stats displayed
   - Fix: Add stats row similar to SwipeCard (lines 237-247 in SwipeCard.tsx)
   - Location: After summary, before deadline
   - Implementation:
     ```tsx
     {(item.viewCount !== undefined || item.saveCount !== undefined || item.supporterCount !== undefined) && (
       <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs text-on-surface-variant">
         <span className="flex items-center gap-1">
           <Eye className="h-3.5 w-3.5" />
           {item.viewCount ?? 0} views
         </span>
         <span className="flex items-center gap-1">
           <Plus className="h-3.5 w-3.5" />
           {item.saveCount ?? 0} followers
         </span>
         <span className="flex items-center gap-1">
           <Heart className="h-3.5 w-3.5" />
           {item.supporterCount ?? 0} supporters
         </span>
       </div>
     )}
     ```

2. **Update TypeScript Interface**:
   - Add optional fields to `CivicItemCardData`: `viewCount?: number`, `saveCount?: number`, `supporterCount?: number`

#### File 6: `src/components/discover/SwipeCard.tsx`

**Function**: Component render

**Specific Changes**:

1. **Verify Stats Display**:
   - Current: Stats display already implemented (lines 237-247)
   - Fix: No changes needed - already correct
   - Verification: Ensure props are being passed from parent

### Database Query Changes

1. **Engagement State Queries**: Change from simple existence checks to "most recent event" queries
2. **Saved Items Query**: Use raw SQL or subquery to get latest SAVE/UNSAVE per item
3. **Engagement Count Aggregation**: Add groupBy queries to count VIEW, SAVE, SUPPORT events per item

### Cache Invalidation Strategy

**Current Cache Keys**:
- `civic_item:${slug}` - Individual item data
- `user:${user.id}:saved` - User's saved items list
- `user:${user.id}:impact` - User's impact statistics

**New Cache Keys**:
- `user:${user.id}:activity` - User's recent activity (if cached)

**Invalidation Rules**:
- SAVE/UNSAVE: Invalidate `civic_item:${slug}`, `user:${user.id}:saved`, `user:${user.id}:activity`
- SUPPORT/UNSUPPORT: Invalidate `civic_item:${slug}`, `user:${user.id}:impact`, `user:${user.id}:activity`
- All actions: Invalidate `civic_item:${slug}` to refresh engagement counts

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write tests that simulate follow/unfollow and support/unsupport actions, then verify the expected state changes. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:
1. **Following Tab Sync Test**: Follow an item from grid UI, immediately fetch saved items API - expect item missing (will fail on unfixed code)
2. **Unfollow Sync Test**: Unfollow an item from saved page, verify it's removed from list - expect item still present (will fail on unfixed code)
3. **Unsupport Toggle Test**: Support an item, then click support again - expect unsupport to fail (will fail on unfixed code)
4. **Activity Tracking Test**: Perform UNSAVE action, query EngagementEvent table - expect no UNSAVE event (will fail on unfixed code)
5. **Stats Display Test**: Fetch swipe/grid items, check for viewCount/saveCount/supporterCount - expect undefined (will fail on unfixed code)

**Expected Counterexamples**:
- Following tab doesn't update immediately after SAVE/UNSAVE
- Support button doesn't toggle reliably
- UNSAVE and UNSUPPORT events missing from database
- Card stats are undefined or not displayed

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition1(input) DO
  result := engageEndpoint_fixed(input)
  ASSERT followingTabUpdatedImmediately(result)
END FOR

FOR ALL input WHERE isBugCondition2(input) DO
  result := engageEndpoint_fixed(input)
  ASSERT unsupportActionTriggered(result)
END FOR

FOR ALL input WHERE isBugCondition3(input) DO
  result := engageEndpoint_fixed(input)
  ASSERT engagementEventCreated(result, input.action)
END FOR

FOR ALL input WHERE isBugCondition4(input) DO
  result := fetchItems_fixed(input.uiContext)
  ASSERT statsDisplayed(result, ['viewCount', 'saveCount', 'supporterCount'])
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL input WHERE NOT (isBugCondition1(input) OR isBugCondition2(input) OR isBugCondition3(input) OR isBugCondition4(input)) DO
  ASSERT engageEndpoint_original(input) = engageEndpoint_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for VIEW, COMMENT, SHARE, SKIP actions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **VIEW Action Preservation**: Verify VIEW tracking continues to work after fix
2. **COMMENT Action Preservation**: Verify COMMENT actions continue to work after fix
3. **SHARE Action Preservation**: Verify share functionality continues to work after fix
4. **High-Value Action Preservation**: Verify SIGN, VOLUNTEER, CONTACT_REP continue to create audit logs
5. **First-Time SAVE Preservation**: Verify first-time SAVE still creates engagement event
6. **First-Time SUPPORT Preservation**: Verify first-time SUPPORT still increments currentSupport

### Unit Tests

- Test UNSAVE action creates EngagementEvent with action='UNSAVE'
- Test UNSUPPORT action creates EngagementEvent with action='UNSUPPORT'
- Test saved items query returns only items where latest action is SAVE
- Test engagement count aggregation returns correct viewCount, saveCount, supporterCount
- Test cache invalidation for all relevant keys
- Test optimistic UI updates and rollback on error

### Property-Based Tests

- Generate random sequences of SAVE/UNSAVE actions, verify final state matches latest action
- Generate random sequences of SUPPORT/UNSUPPORT actions, verify support count is correct
- Generate random civic items with engagement data, verify stats are calculated correctly
- Test that all non-SAVE/UNSAVE/SUPPORT/UNSUPPORT actions continue to work across many scenarios

### Integration Tests

- Test full flow: follow from grid → verify in saved tab → unfollow → verify removed
- Test full flow: support from swipe → verify count incremented → unsupport → verify count decremented
- Test activity history displays UNSAVE and UNSUPPORT events
- Test stats display in swipe and grid UIs with real engagement data
- Test cache invalidation across multiple user sessions
