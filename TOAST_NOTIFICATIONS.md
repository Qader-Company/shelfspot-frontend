# Toast Notifications - Complete Guide

## ✅ What's Been Implemented

A comprehensive toast notification system for real-time and regular notifications in ShelfSpot.

## 📦 Packages Installed

```bash
npm install sonner
```

- **sonner**: Modern, elegant toast notification library for React

## 🎯 Features

### 1. **Real-Time Notifications with Toast**
When a notification arrives via WebSocket (Laravel Echo), it:
- ✅ Shows a toast notification immediately
- ✅ Updates the notification bell badge
- ✅ Adds to the notification dropdown
- ✅ Plays animation and auto-dismisses after 5 seconds
- ✅ Includes "View Details" action button

### 2. **Multiple Notification Categories**
Supports various notification types:

#### **Task Notifications**
- `task.published` - New task available
- `task.reassigned` - Task reassigned
- `task.reopened` - Task reopened
- `task.completed` - Task completed
- `task.failed` - Task failed
- `task.worker_cancelled` - Worker cancelled
- `task.rejected` - Task rejected

#### **Payment Notifications**
- `payment.completed` - Payment successful
- `payment.pending` - Payment pending
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded

#### **System Notifications**
- `system.maintenance` - System maintenance
- `system.update` - System updated

#### **Account Notifications**
- `account.verified` - Account verified
- `account.suspended` - Account suspended

### 3. **Smart Toast Types**
Toasts automatically use appropriate type based on event:
- **Success** (green): `task.completed`, `payment.completed`, `account.verified`
- **Error** (red): `task.failed`, `task.rejected`, `payment.failed`, `account.suspended`
- **Warning** (yellow): `task.reassigned`, `payment.pending`, `payment.refunded`
- **Info** (blue): `task.published`, `system.maintenance`, `system.update`

### 4. **Bilingual Support**
- ✅ English translations
- ✅ Arabic translations
- ✅ RTL support
- ✅ Dynamic locale switching

### 5. **Action Buttons**
Each toast includes a "View Details" button that navigates to:
- Task notifications → `/dashboard/requests/{id}`
- Payment notifications → `/dashboard/payments/{id}`
- System notifications → `/dashboard`

## 📁 Files Created/Modified

### Created Files

1. **`src/shared/components/ui/toaster.tsx`**
   - Toaster component wrapper for sonner
   - Theme-aware (light/dark mode)
   - Positioned top-right

2. **`src/shared/lib/notifications/notification-toast.tsx`**
   - `showNotificationToast()` - Shows formatted notification toast
   - `showSimpleNotificationToast()` - Shows simple toast without translations
   - Icon mapping for different notification events

### Modified Files

1. **`src/shared/types/notification.ts`**
   - Added `PaymentNotificationPayload`
   - Added `GeneralNotificationPayload`
   - Added `NotificationEvent` union type
   - Extended `RealtimeNotification` to support all types

2. **`src/shared/lib/notifications/format-notification.ts`**
   - Extended `formatNotification()` to handle all notification types
   - Added `getActionUrl()` helper for routing
   - Updated `getNotificationTone()` for all event types

3. **`src/shared/hooks/use-notifications.ts`**
   - Added toast display when realtime notification arrives
   - Integrated with translations
   - Includes action button for navigation

4. **`src/shared/components/dashboard/notification-button.tsx`**
   - Updated to display custom titles/messages
   - Support for payment notifications (amount, currency)
   - Enhanced debug logging

5. **`src/shared/stores/notification-store.ts`**
   - Added debug logging for realtime notifications

6. **`src/providers/app-provider.tsx`**
   - Added `<Toaster />` component

7. **Translation Files** (`en.json` & `ar.json`)
   - Added `viewDetails` key
   - Added payment notification translations
   - Added system notification translations
   - Added account notification translations

## 🎨 How It Works

### Toast Display Flow

```
Backend sends notification
    ↓
Laravel Reverb broadcasts
    ↓
Laravel Echo receives (client)
    ↓
use-notifications.ts hook processes
    ↓
┌─────────────────────┬─────────────────────┐
│                     │                     │
│ showNotificationToast()  │  upsertRealtimeNotification()  │
│ (Shows toast popup) │  (Updates store)    │
│                     │                     │
└─────────────────────┴─────────────────────┘
                │                 │
                ↓                 ↓
    Toast appears         Notification bell updates
    with action button    & dropdown refreshes
```

### Example Toast Configuration

```typescript
showNotificationToast(notification, {
  locale: "en",
  translations: {
    title: "Payment Completed",
    description: "Payment #123 of 500 SAR has been completed",
  },
  actionLabel: "View Details",
  onAction: () => {
    router.push("/dashboard/payments/123");
  },
});
```

## 🧪 Testing

### Manual Testing

1. **Login** to the dashboard (Admin or Company)
2. **Open browser DevTools console** (F12)
3. **Trigger a notification** from Laravel backend:

```php
use App\Notifications\RealtimeNotification;

// Task notification
$user->notify(new RealtimeNotification([
    'event' => 'task.completed',
    'category' => 'task',
    'priority' => 'high',
    'task_id' => 123,
    'company_id' => 1,
    'status' => 'completed',
    'actor_id' => null,
    'action' => [
        'resource' => 'task',
        'id' => 123,
    ],
    'meta' => [
        'status_history_id' => 456,
        'from_status' => 'in_progress',
        'to_status' => 'completed',
    ],
    'occurred_at' => now()->toISOString(),
]));

// Payment notification
$user->notify(new RealtimeNotification([
    'event' => 'payment.completed',
    'category' => 'payment',
    'priority' => 'high',
    'payment_id' => 789,
    'amount' => 500.00,
    'currency' => 'SAR',
    'status' => 'completed',
    'actor_id' => null,
    'action' => [
        'resource' => 'payment',
        'id' => 789,
    ],
    'meta' => [],
    'occurred_at' => now()->toISOString(),
]));
```

4. **Observe**:
   - ✅ Toast appears in top-right corner
   - ✅ Appropriate icon (✅ for success, ❌ for error, etc.)
   - ✅ Title and description in correct language
   - ✅ "View Details" button
   - ✅ Toast auto-dismisses after 5 seconds
   - ✅ Notification bell badge increments
   - ✅ Notification appears in dropdown

### Test Page

Visit: `/notifications-test`

This page provides:
- Manual connection controls
- Real-time event logs
- API data display
- Connection status indicator
- Configuration inspector

## 🎨 Customization

### Change Toast Position

Edit `src/shared/components/ui/toaster.tsx`:

```typescript
<Sonner
  position="top-right"  // or "top-left", "bottom-right", "bottom-left", etc.
  // ...
/>
```

### Change Toast Duration

Edit `src/shared/lib/notifications/notification-toast.tsx`:

```typescript
const toastConfig = {
  duration: 5000, // Change to 3000 for 3 seconds, etc.
  // ...
};
```

### Add Sound

Edit `src/shared/hooks/use-notifications.ts`:

```typescript
// After showing toast
const audio = new Audio("/notification-sound.mp3");
audio.play().catch(console.error);
```

### Customize Toast Styling

Toasts automatically adapt to your theme. To customize further, edit:
`src/shared/components/ui/toaster.tsx`

## 🚀 Next Steps

### Optional Enhancements

1. **Browser Notifications**: Add desktop notifications using Notification API
2. **Sound Alerts**: Play sound for high-priority notifications
3. **Notification Groups**: Group similar notifications
4. **Rich Media**: Add images to notifications
5. **Custom Actions**: Multiple action buttons per toast
6. **Undo Actions**: Add undo button for certain notifications
7. **Notification Preferences**: Let users choose which notifications to see

## 🐛 Troubleshooting

### Toasts Not Showing

1. **Check console logs**: Look for `📬 Hook: New notification received:`
2. **Verify Toaster is mounted**: Check `src/providers/app-provider.tsx`
3. **Check translations**: Ensure notification event keys exist in `en.json`/`ar.json`
4. **Verify WebSocket connection**: Should see `✅ Subscribed to App.Models.User.{userId}`

### Toasts Showing But Not Styled

1. **Check theme**: Toasts use theme colors, ensure ThemeProvider is working
2. **Check Tailwind**: Ensure Tailwind is processing the toaster classes
3. **Clear cache**: Try `npm run dev` with clean cache

### Action Button Not Working

1. **Check router**: Ensure `next/navigation` router is available
2. **Check URL**: Verify the action URL is correct in console logs
3. **Check permissions**: Ensure user has access to the target page

## 📚 References

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Laravel Echo Documentation](https://laravel.com/docs/broadcasting)
- [Next-intl Documentation](https://next-intl-docs.vercel.app/)

## 🎉 Summary

Your ShelfSpot application now has a complete toast notification system that:

✅ Shows real-time notifications via toast popups  
✅ Supports multiple notification categories (task, payment, system, account)  
✅ Provides action buttons for quick navigation  
✅ Fully bilingual (English/Arabic)  
✅ Theme-aware (light/dark mode)  
✅ Auto-dismisses with smooth animations  
✅ Includes comprehensive debugging logs  
✅ Works seamlessly with existing notification system  

Test it with your Laravel backend and enjoy the enhanced user experience! 🚀
