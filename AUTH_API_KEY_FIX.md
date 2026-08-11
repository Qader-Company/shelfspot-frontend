# Authentication API Key Fix

## Problem
Login was failing with "unauthorized" error even though the same credentials worked in Postman. This was because authentication endpoints weren't using portal-specific API keys.

## Root Cause
The `proxyAuthRequest()` function used `createServerApiClient()` which only set a single default API key, but the backend requires:
- **Admin login** → `ADMIN_API_KEY`
- **Company login** → `COMPANY_API_KEY`

## Solution

### 1. Updated `createServerApiClient()` 
**File:** `src/shared/lib/api/server.ts`

Added optional `apiKey` parameter to allow passing portal-specific keys:

```typescript
export async function createServerApiClient(apiKey?: string) {
  // ...
  headers: {
    "X-Authorization": apiKey || API_CONFIG.serverApiKey,
    // ...
  }
}
```

### 2. Updated `proxyAuthRequest()`
**File:** `src/shared/lib/api/auth-proxy.ts`

Added `apiKey` option to pass through to the API client:

```typescript
export async function proxyAuthRequest(
  request: NextRequest,
  upstreamPath: string,
  options?: {
    // ... other options
    apiKey?: string;
  },
) {
  const apiClient = await createServerApiClient(options?.apiKey);
  // ...
}
```

### 3. Updated All Authentication Routes

#### Dynamic Auth Route (handles both admin & company)
**File:** `src/app/api/auth/[authContext]/[action]/route.ts`

```typescript
// Get correct API key based on auth context
const apiKey = authContext === "admin" 
  ? API_CONFIG.adminApiKey 
  : API_CONFIG.companyApiKey;

// Pass apiKey to all auth requests
proxyAuthRequest(request, upstreamPath, { apiKey, ... });
```

This handles:
- `/api/auth/admin/login`
- `/api/auth/admin/logout`
- `/api/auth/admin/refresh`
- `/api/auth/company/login`
- `/api/auth/company/logout`
- `/api/auth/company/refresh`

#### Company-Specific Routes
Updated these routes to use `API_CONFIG.companyApiKey`:
- `src/app/api/auth/company/register/route.ts`
- `src/app/api/auth/company/email-verification/route.ts`
- `src/app/api/auth/company/email-verification/send-otp/route.ts`

#### Admin-Specific Routes
Updated:
- `src/app/api/auth/admin/login/route.ts` → uses `API_CONFIG.adminApiKey`

## Environment Variables

Required in `.env.local`:

```env
ADMIN_API_KEY=jvdu3YJsZkrALmHVMT6jNkaGzKJcqvqjed4yo5GaQ9nP96ZSqcRNiKKZnzG4w8I4
COMPANY_API_KEY=RYDwpYKGlnmSgwgILJusHwAKINDbY22S12IR1j5b0bMtlPqtgbuU5nKDqjfqTyPs
```

## Testing

**IMPORTANT:** Restart your dev server after these changes!

```bash
# Stop server (Ctrl+C) then:
npm run dev
```

### Test Admin Login
1. Go to: `http://localhost:3000/en/admin/login`
2. Credentials:
   - Email: `admin@shelfspot.com`
   - Password: `password`
3. Should successfully login and redirect to admin dashboard

### Test Company Login
1. Go to: `http://localhost:3000/en/auth/login`
2. Credentials:
   - Email: `owner@shelfspot.test`
   - Password: `password`
3. Should successfully login and redirect to company dashboard

### Verify in DevTools
1. Open Network tab
2. Filter for login request
3. Check Request Headers - should see:
   - `X-Authorization: {correct-portal-api-key}`
4. Check Response - should be 200 OK with token data

## Summary of Changes

✅ All authentication routes now use portal-specific API keys  
✅ Admin routes use `ADMIN_API_KEY`  
✅ Company routes use `COMPANY_API_KEY`  
✅ API keys sent in `X-Authorization` header  
✅ Works for login, logout, refresh, register, and email verification  

Both admin and company logins should now work exactly like they do in Postman! 🎉
