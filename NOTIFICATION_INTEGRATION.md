# Real-Time Notifications Integration

## ✅ Completed Integration

This document describes the real-time notification system integrated with Laravel Reverb (WebSocket server) for the ShelfSpot Next.js frontend.

## 📦 Installed Packages

```bash
npm install laravel-echo pusher-js
```

- **laravel-echo**: Laravel's official WebSocket client library
- **pusher-js**: Required dependency for Laravel Echo to work with Reverb

## 🔧 Environment Configuration

Added to `.env.local`:

```env
# Reverb WebSocket Configuration  
NEXT_PUBLIC_REVERB_APP_KEY=6c68c324c2eea63b46ec03756cf63b52
NEXT_PUBLIC_REVERB_HOST=testing.api.shelfspots.com
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

## 📁 Created Files

### 1. Type Definitions
- **`src/shared/types/notification.ts`**: Complete TypeScript interfaces for notifications, including:
  - `TaskNotificationEvent`: All task event types
  - `TaskNotificationPayload`: Notification payload structure
  - `PersistedNotification`: REST API notification format
  - `RealtimeNotification`: WebSocket notification format
  - API response types

### 2. Echo WebSocket Client
- **`src/shared/lib/notifications/echo.ts`**: Laravel Echo setup and management
  - `createEchoInstance()`: Initializes Echo with Reverb config
  - `subscribeToUserChannel()`: Subscribes to user's private channel (`App.Models.User.{userId}`)
  - `disconnectEcho()`: Cleanup function

### 3. REST API Service
- **`src/shared/services/notifications-api.ts`**: REST API functions for notifications
  - `getNotifications()`: Fetch paginated notifications
  - `getUnreadCount()`: Get unread notification count
  - `markNotificationRead()`: Mark single notification as read
  - `markAllNotificationsRead()`: Mark all as read

### 4. State Management
- **`src/shared/stores/notification-store.ts`**: Zustand store for notification state
  - Manages notifications list
  - Tracks unread count
  - Handles realtime connection status
  - Provides actions for read/unread management

### 5. React Hooks
- **`src/shared/hooks/use-notifications.ts`**: Main hook for notifications
  - Fetches REST notifications on mount
  - Sets up WebSocket connection
  - Handles realtime notifications
  - Provides mark as read functions
  
- **`src/shared/hooks/use-session.ts`**: Gets current user profile
  - Fetches user ID needed for WebSocket channel
  - Works for both admin and company portals

### 6. Utilities
- **`src/shared/lib/auth/get-access-token.ts`**: Extracts access token from cookies
- **`src/shared/lib/notifications/format-notification.ts`**: Formats notifications for UI display
- **`src/shared/lib/notifications/notification-helpers.ts`**: Helper functions for notification display

### 7. API Routes (Backend Proxy)

#### Admin Portal
- `/api/admin/notifications` → GET notifications
- `/api/admin/notifications/unread-count` → GET unread count
- `/api/admin/notifications/:id/read` → PATCH mark as read
- `/api/admin/notifications/read-all` → PATCH mark all as read

#### Company Portal
- `/api/company/notifications` → GET notifications
- `/api/company/notifications/unread-count` → GET unread count
- `/api/company/notifications/:id/read` → PATCH mark as read
- `/api/company/notifications/read-all` → PATCH mark all as read

### 8. UI Components
- **`src/shared/components/notifications/notification-button-wrapper.tsx`**: Wrapper component
  - Connects NotificationButton to real-time notifications
  - Handles portal-specific logic
  
- **Updated `src/shared/components/dashboard/dashboard-topbar.tsx`**: 
  - Now uses `NotificationButtonWrapper` instead of direct `NotificationButton`
  - Passes portal type (admin/company) automatically

### 9. Translations
Updated both `en.json` and `ar.json` with:
- Event-based notification titles and descriptions
- UI labels (markAllRead, noNotifications, etc.)
- Support for all 7 task notification events

## 🔄 How It Works

### 1. User Login Flow
```
User logs in → Profile API called (gets user ID) → 
WebSocket connection established → 
Subscribe to private channel: App.Models.User.{userId} →
REST API fetches persisted notifications
```

### 2. Receiving Notifications

#### REST API (Initial Load)
- On component mount, fetch all notifications
- Get unread count
- Display in notification dropdown

#### WebSocket (Real-time)
- Listen to private channel `App.Models.User.{userId}`
- When backend broadcasts a notification:
  - Echo receives it via `.notification()` listener
  - Store upserts notification (deduplicated by ID)
  - Unread count increments
  - UI updates immediately

### 3. Marking as Read
- User clicks notification → `markAsRead(notificationId)` called
- API request sent to backend
- Store updated locally (optimistic UI)
- Unread count decrements

## 🎯 Supported Notification Events

Based on the backend contract:

1. **`task.published`** - New task available (workers)
2. **`task.reassigned`** - Task reassigned to worker
3. **`task.reopened`** - Task reopened
4. **`task.completed`** - Worker completed task
5. **`task.failed`** - Task expired/failed
6. **`task.worker_cancelled`** - Worker cancelled task
7. **`task.rejected`** - Company rejected completed task

## 🔐 Authentication & Authorization

### Access Token
- Stored in HTTP-only cookies (`shelfspot-access` or `__Host-shelfspot-access`)
- Extracted client-side via `getAccessToken()` helper
- Sent in WebSocket authorization header: `Authorization: Bearer {token}`

### Private Channel Authorization
- Backend endpoint: `POST /broadcasting/auth`
- Echo automatically calls this when subscribing
- Backend validates:
  - Token is valid
  - User ID in channel matches token user ID
  
### Portal Access
- Admin portal: requires `admin,access` Sanctum ability
- Company portal: requires `company,access` Sanctum ability
- Worker portal: requires `worker,access` Sanctum ability (not implemented yet)

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Backend   │
│  (Laravel)  │
└──────┬──────┘
       │
       │ Broadcasts notification
       ↓
┌──────────────────┐
│ Laravel Reverb   │ ← WebSocket Server
│  (Port 443/wss)  │
└────────┬─────────┘
         │
         │ Sends to subscribed client
         ↓
┌──────────────────────┐
│   Laravel Echo       │ ← Client library
│   (Next.js browser)  │
└──────────┬───────────┘
           │
           │ .notification() callback
           ↓
┌──────────────────────┐
│  Zustand Store       │ ← State management
└──────────┬───────────┘
           │
           │ Updates
           ↓
┌──────────────────────┐
│   UI Components      │ ← NotificationButton
│  (React)             │
└──────────────────────┘
```

## 🧪 Testing the Integration

### Manual Testing Steps

1. **Start the Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Login as Admin or Company user**

3. **Open browser DevTools Console** - You should see:
   ```
   ✅ Subscribed to App.Models.User.{userId}
   ✅ Realtime notifications connected
   ```

4. **Trigger a notification from backend** (Laravel):
   ```php
   $user->notify(new RealtimeNotification($taskNotificationData));
   ```

5. **Observe**:
   - Console log: `📬 Received notification: ...`
   - Notification bell badge updates
   - Dropdown shows new notification
   - Unread count increments

### Testing with Backend Test Tool

If the screenshot you provided is a test interface:

1. Fill in:
   - **Portal**: `company` or `admin`
   - **Authenticated user ID**: Your logged-in user's ID
   - **Bearer token**: Copy from browser cookies (DevTools → Application → Cookies)
   - **Platform API key**: Already filled
   - **Reverb settings**: Already filled

2. Click **Connect realtime**
3. Click **Load API data** to fetch persisted notifications
4. Use backend to send test notification
5. Observe real-time arrival in **Realtime payloads** panel

## ⚠️ Important Notes

### Token Management
- Access token is stored in HTTP-only cookies for security
- Automatically sent with API requests (`withCredentials: true`)
- Manually extracted for WebSocket auth header

### Error Handling
- **401 on WebSocket**: Token expired → Disconnect and show login
- **403 on WebSocket**: Wrong portal or insufficient permissions
- **Network issues**: Echo auto-reconnects, then refetches notifications

### Performance
- REST API refetches every 60 seconds (configurable in `use-notifications.ts`)
- WebSocket is persistent and immediate
- Notifications are deduplicated by ID
- Pagination supported (default 20 per page)

### Multi-Tab Behavior
- Each browser tab creates its own WebSocket connection
- All tabs receive the same notifications
- Local state is not shared between tabs (could add localStorage sync if needed)

## 🚀 Next Steps

### Optional Enhancements

1. **Toast Notifications**: Add toast/snackbar for new notifications
2. **Sound Alerts**: Play sound when high-priority notification arrives
3. **Desktop Notifications**: Use browser Notification API
4. **Notification Actions**: Quick actions in notification card
5. **Pagination**: Load more notifications on scroll
6. **Filtering**: Filter by read/unread, event type, priority
7. **Worker Portal**: Add worker notification support

### Production Checklist

- [ ] Test with real backend
- [ ] Verify CORS settings on backend
- [ ] Confirm Reverb is running in production
- [ ] Test with multiple users simultaneously
- [ ] Monitor WebSocket connection stability
- [ ] Add error tracking (Sentry, etc.)
- [ ] Load test notification throughput

## 📚 References

- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
- [Laravel Echo Documentation](https://laravel.com/docs/broadcasting#client-side-installation)
- [Backend Contract](./NOTIFICATION_CONTRACT.md) - The document you provided

## 🎉 Summary

The notification system is **fully integrated** and ready for testing with your Laravel backend. All components follow the contract you provided:

✅ REST API for persisted notifications  
✅ WebSocket for real-time delivery  
✅ Proper authentication and authorization  
✅ Admin and Company portal support  
✅ UI components with unread badges  
✅ Mark as read functionality  
✅ Internationalization (EN/AR)  
✅ Type-safe TypeScript implementation  

Test it with your backend and let me know if you need any adjustments!
