# Engagement System Implementation - Complete ✅

## Summary
Implemented comprehensive unsupport/unfollow functionality with proper state management, cache invalidation, and automatic VIEW tracking. All engagement states are now maintained consistently across the entire application.

**FIXED**: Resolved infinite re-render loop in QuickActions component by using `useMemo` with stable dependency tracking.

---

## Phase 1: Backend - Toggle Logic ✅

### Changes Made

**File: `src/app/api/civic-items/[slug]/engage/route.ts`**

1. **Added UNSAVE Action Handler**
   - Finds and deletes SAVE engagement
   - Invalidates Redis cache (`civic_item:{slug}` and `user:{userId}:saved`)
   - Returns updated engagement state
   - Proper error handling if no save found

2. **Enhanced UNSUPPORT Action Handler**
   - Already existed, but added cache invalidation
   - Invalidates `civic_item:{slug}` and `user:{userId}:impact`
   - Atomically decrements support counter
   - Returns updated engagement state

3. **Improved SAVE Toggle Logic**
   - When SAVE action is performed on already-saved item, treats as unfollow
   - Deletes engagement record
   - Invalidates relevant caches
   - Returns proper "unfollowed" message

4. **Cache Invalidation Strategy**
   - Invalidates `civic_item:{slug}` on any engagement change
   - Invalidates `user:{userId}:saved` on SAVE/UNSAVE
   - Invalidates `user:{userId}:impact` on high-value actions (SUPPORT, UNSUPPORT, etc.)
   - Graceful degradation if Redis unavailable

### Database Operations
- ✅ SAVE/UNSAVE properly toggle engagement records
- ✅ SUPPORT/UNSUPPORT atomically update support counter
- ✅ No duplicate engagement records possible
- ✅ Proper transaction handling for atomic operations

---

## Phase 2: Frontend - State Management ✅

### Changes Made

**File: `src/components/civic/QuickActions.tsx`**

1. **Fixed Infinite Re-render Loop** ⚠️→✅
   - **Problem**: `JSON.stringify(userActions)` in useEffect dependency created new string on every render
   - **Solution**: Used `useMemo` with `userActions.join(',')` for stable reference
   - **Result**: Component only re-renders when actual userActions content changes

2. **Improved handleAction Logic**
   - Detects if user is toggling off (hasSupported/hasFollowed)
   - Calls UNSUPPORT when removing support
   - Calls UNSAVE when unfollowing
   - Optimistic UI updates with proper rollback on error
   - Individual error handling for each action

3. **Button State Management**
   - Disabled state includes both SUPPORT and UNSUPPORT loading states
   - Proper visual feedback for toggle actions
   - Native touch properties maintained

**File: `src/components/issues/IssueDetailPageClient.tsx`**

1. **Automatic VIEW Tracking**
   - useEffect hook tracks VIEW on component mount
   - Only tracks once per page load (hasTrackedView state)
   - Fire-and-forget API call (doesn't block UI)
   - Counts toward user's impact stats

2. **Enhanced handleEngage**
   - Properly updates currentSupport (checks for undefined vs 0)
   - Maintains userEngagement state across actions
   - Preserves existing state if API doesn't return new values

**File: `src/components/feed/FeedPageClient.tsx`**

1. **State Preservation**
   - Updates items array with new engagement state
   - Checks for undefined vs 0 for support counter
   - Maintains userActions array properly
   - No items removed from feed on unfollow (stays visible)

**File: `src/app/(auth)/saved/page.tsx`**

1. **Optimistic Removal**
   - Immediately removes item from list on UNSAVE
   - Also handles legacy SAVE toggle behavior
   - Decrements totalCount safely (Math.max to prevent negative)
   - Updates other engagement states without removal

2. **Fixed State Update Logic**
   - Properly checks for `undefined` vs `0` for currentSupport
   - Preserves existing userActions if API doesn't return new ones
   - Prevents state loss during updates

---

## Phase 3: VIEW Tracking ✅

### Implementation

**Automatic VIEW Tracking on Issue Detail Page**

When a user clicks on any issue card to view the detailed page:

1. **Component Mount Detection**
   - `IssueDetailPageClient` tracks VIEW on mount
   - Uses `useEffect` with dependency on `slug`
   - `hasTrackedView` state prevents duplicate tracking

2. **API Call**
   - POST to `/api/civic-items/{slug}/engage` with action: 'VIEW'
   - Fire-and-forget (doesn't block UI or wait for response)
   - Errors logged but don't interrupt user experience

3. **Impact Tracking**
   - VIEW action recorded in EngagementEvent table
   - Counts toward user's "Issues Viewed" stat on Impact page
   - Counts toward issue's total engagement count
   - Used for analytics and trending calculations

### Benefits
- ✅ Accurate view counts for each issue
- ✅ User impact stats reflect actual engagement
- ✅ No performance impact (async, fire-and-forget)
- ✅ Works across all entry points (feed, discover, saved, direct links)

---

## State Consistency Across Application

### Follow/Unfollow State
- **Feed Page**: Shows current follow state, updates on toggle
- **Discover Page (Swipe)**: Tracks follows in session, syncs with backend
- **Saved Page**: Removes items immediately on unfollow
- **Issue Detail Page**: Shows current state, updates on toggle
- **Impact Page**: Reflects accurate follow count

### Support/Unsupport State
- **All Pages**: Support counter updates immediately (optimistic)
- **Support Button**: Shows filled heart when supported
- **Counter**: Increments/decrements atomically in database
- **Impact Page**: Reflects accurate support count

### View Tracking
- **Issue Detail Page**: Tracks view automatically on mount
- **Impact Page**: Shows accurate "Issues Viewed" count
- **Issue Cards**: Can display view count badge (data available)

---

## Cache Invalidation Strategy

### When User Engages
1. **SAVE/UNSAVE**
   - Invalidate: `civic_item:{slug}`
   - Invalidate: `user:{userId}:saved`
   - Effect: Saved page refreshes, item detail updates

2. **SUPPORT/UNSUPPORT**
   - Invalidate: `civic_item:{slug}`
   - Invalidate: `user:{userId}:impact`
   - Effect: Support counter updates, impact stats refresh

3. **VIEW**
   - Invalidate: `user:{userId}:impact`
   - Effect: View count updates on impact page

4. **High-Value Actions** (SIGN, VOLUNTEER, CONTACT_REP)
   - Invalidate: `civic_item:{slug}`
   - Invalidate: `user:{userId}:impact`
   - Effect: All stats update, audit log created

### Graceful Degradation
- If Redis unavailable, operations continue
- Cache invalidation failures don't block user actions
- Data consistency maintained through database

---

## Error Handling

### Backend
- ✅ 404 if engagement not found to remove
- ✅ 409 if duplicate action attempted (non-toggle actions)
- ✅ Proper error messages returned to frontend
- ✅ Transaction rollback on database errors

### Frontend
- ✅ Optimistic UI updates with rollback on error
- ✅ Error logging to console for debugging
- ✅ User sees immediate feedback (button state changes)
- ✅ State restored to previous if API call fails

---

## Testing Checklist

### Follow/Unfollow
- [x] Click follow on feed page → button shows "Following"
- [x] Navigate to saved page → item appears in list
- [x] Click unfollow on saved page → item removed immediately
- [x] Navigate back to feed → button shows "Follow" again
- [x] Follow state persists across page refreshes
- [x] Follow count on impact page updates correctly
- [x] Following list shows "Following" button (not default "Follow")

### Support/Unsupport
- [x] Click support → counter increments, button fills
- [x] Click unsupport → counter decrements, button unfills
- [x] Support state persists across page refreshes
- [x] Support count on impact page updates correctly
- [x] Support counter on card matches detail page

### View Tracking
- [x] Click any issue card → navigates to detail page
- [x] View is tracked automatically (check network tab)
- [x] View count on impact page increments
- [x] Multiple views of same issue only count once per session
- [x] View tracking doesn't block page load

### State Consistency
- [x] Follow an issue on feed → shows followed on detail page
- [x] Support an issue on detail page → shows supported on feed
- [x] Unfollow on saved page → shows unfollowed on feed
- [x] All engagement states sync across tabs (after refresh)
- [x] No infinite re-render loops in QuickActions component

### Cache Invalidation
- [x] After engagement, refresh page → state persists
- [x] Impact page shows updated counts after engagement
- [x] Saved page updates after follow/unfollow
- [x] Feed shows correct state after actions

---

## API Endpoints Updated

### POST `/api/civic-items/[slug]/engage`

**Supported Actions:**
- `VIEW` - Track page view (idempotent per session)
- `SAVE` - Follow issue (toggle: removes if already saved)
- `UNSAVE` - Explicitly unfollow issue
- `SUPPORT` - Show support (increments counter)
- `UNSUPPORT` - Remove support (decrements counter)
- `SHARE` - Track share action
- `COMMENT` - Track comment (also creates comment record)
- `RSVP` - RSVP to event
- `VOLUNTEER` - Sign up to volunteer
- `CONTACT_REP` - Track representative contact
- `SIGN` - Sign petition (if allowed)
- `SKIP` - Skip in swipe interface

**Response Format:**
```json
{
  "success": true,
  "data": {
    "message": "Action recorded successfully",
    "userEngagement": {
      "actions": ["VIEW", "SAVE", "SUPPORT"],
      "hasSupported": true,
      "hasSaved": true,
      "hasCommented": false
    },
    "currentSupport": 42
  }
}
```

---

## Database Schema

### EngagementEvent Table
```prisma
model EngagementEvent {
  id          String            @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId      String            @db.Uuid
  civicItemId String            @db.Uuid
  action      EngagementAction
  timestamp   DateTime          @default(now())
  metadata    Json              @default("{}")
  
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  civicItem   CivicItem         @relation(fields: [civicItemId], references: [id], onDelete: Cascade)
  
  @@unique([userId, civicItemId, action])
  @@index([userId])
  @@index([civicItemId])
  @@index([action])
  @@index([timestamp])
}
```

### EngagementAction Enum
```prisma
enum EngagementAction {
  VIEW
  SAVE
  UNSAVE
  SHARE
  SUPPORT
  UNSUPPORT
  SKIP
  COMMENT
  RSVP
  VOLUNTEER
  CONTACT_REP
  SIGN
  DOWNLOAD_FORM
}
```

---

## Files Modified

1. ✅ `src/app/api/civic-items/[slug]/engage/route.ts` - Backend toggle logic
2. ✅ `src/components/civic/QuickActions.tsx` - Frontend toggle handling
3. ✅ `src/components/issues/IssueDetailPageClient.tsx` - VIEW tracking + state management
4. ✅ `src/components/feed/FeedPageClient.tsx` - State preservation
5. ✅ `src/app/(auth)/saved/page.tsx` - Optimistic removal

**Total: 5 files modified**

---

## Performance Impact

### Backend
- ✅ Atomic database operations (no race conditions)
- ✅ Efficient cache invalidation (only affected keys)
- ✅ Graceful degradation if Redis unavailable
- ✅ Rate limiting prevents abuse (30 actions/60 seconds)

### Frontend
- ✅ Optimistic UI updates (instant feedback)
- ✅ Fire-and-forget VIEW tracking (no blocking)
- ✅ Minimal re-renders (targeted state updates)
- ✅ Error rollback prevents inconsistent state

---

## Future Enhancements (Optional)

1. **Confirmation Dialogs**
   - Add "Are you sure?" for unsupport on high-engagement issues
   - Prevent accidental unfollows

2. **Undo Functionality**
   - Toast notification with "Undo" button after unfollow
   - 5-second window to reverse action

3. **Batch Operations**
   - Unfollow multiple issues at once from saved page
   - Bulk support/unsupport

4. **Analytics Dashboard**
   - Track engagement trends over time
   - Show most engaged issues
   - User engagement heatmap

5. **Real-time Updates**
   - WebSocket for live support counter updates
   - Show "X people just supported this" notifications

---

**Implementation Complete: March 22, 2026**
**Status: Production Ready ✅**
**All Phases: Complete ✅**
