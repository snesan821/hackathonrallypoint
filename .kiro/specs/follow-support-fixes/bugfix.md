# Bugfix Requirements Document

## Introduction

This document addresses multiple bugs in the follow and support logic for civic items. The issues affect user experience across the swipe UI, grid UI, and saved items page. Users are unable to reliably follow/unfollow issues, support/unsupport issues, and view accurate engagement statistics. Additionally, certain engagement actions (UNSAVE and UNSUPPORT) are not being tracked in user activity history.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user follows an issue from any UI (swipe or grid) THEN the "Following" tab (saved page) does not always populate with the followed issue

1.2 WHEN a user unfollows an issue from the saved page THEN the issue is not removed from the tab instantly, requiring a page refresh

1.3 WHEN a user clicks the support button on an issue they have already supported THEN the unsupport action does not work reliably

1.4 WHEN a user performs an UNSAVE action (unfollow) THEN the action is not tracked in the user's recent activity

1.5 WHEN a user performs an UNSUPPORT action THEN the action is not tracked in the user's recent activity

1.6 WHEN viewing civic items in the swipe UI THEN card stats (views, follows, supports) are not displayed

1.7 WHEN viewing civic items in the grid UI THEN card stats (views, follows, supports) are not displayed

### Expected Behavior (Correct)

2.1 WHEN a user follows an issue from any UI (swipe or grid) THEN the "Following" tab SHALL immediately reflect the followed issue

2.2 WHEN a user unfollows an issue from the saved page THEN the issue SHALL be removed from the tab instantly without requiring a page refresh

2.3 WHEN a user clicks the support button on an issue they have already supported THEN the system SHALL toggle to unsupport, decrement the support count, and update the UI accordingly

2.4 WHEN a user performs an UNSAVE action (unfollow) THEN the system SHALL create an EngagementEvent record with action='UNSAVE' and timestamp for activity tracking

2.5 WHEN a user performs an UNSUPPORT action THEN the system SHALL create an EngagementEvent record with action='UNSUPPORT' and timestamp for activity tracking

2.6 WHEN viewing civic items in the swipe UI THEN card stats (viewCount, saveCount, supporterCount) SHALL be displayed prominently

2.7 WHEN viewing civic items in the grid UI THEN card stats (viewCount, saveCount, supporterCount) SHALL be displayed prominently

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user follows an issue for the first time THEN the system SHALL CONTINUE TO create a SAVE engagement event

3.2 WHEN a user supports an issue for the first time THEN the system SHALL CONTINUE TO increment currentSupport and create a SUPPORT engagement event

3.3 WHEN a user views the saved page THEN the system SHALL CONTINUE TO fetch items ordered by save timestamp (most recent first)

3.4 WHEN a user performs high-value actions (SUPPORT, SIGN, VOLUNTEER, CONTACT_REP) THEN the system SHALL CONTINUE TO create audit log entries

3.5 WHEN engagement actions are performed THEN the system SHALL CONTINUE TO invalidate relevant Redis caches

3.6 WHEN a user shares an issue THEN the share functionality SHALL CONTINUE TO work via native share API or clipboard fallback

3.7 WHEN viewing civic item cards THEN all existing UI elements (category badges, deadlines, summaries, action buttons) SHALL CONTINUE TO display correctly
