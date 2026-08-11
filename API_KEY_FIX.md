# API Key Configuration Fix

## Problem
The application was unable to load requests for both admin and company portals because it was using a single API key for all requests, but the backend requires different API keys for each portal.

## Solution
Updated the proxy system to use portal-specific API keys:

### 1. Environment Variables (`.env.local`)
```env
# Admin portal uses this key
ADMIN_API_KEY=jvdu3YJsZkrALmHVMT6jNkaGzKJcqvqjed4yo5GaQ9nP96ZSqcRNiKKZnzG4w8I4

# Company portal uses this key  
COMPANY_API_KEY=RYDwpYKGlnmSgwgILJusHwAKINDbY22S12IR1j5b0bMtlPqtgbuU5nKDqjfqTyPs
```

### 2. Updated `src/shared/lib/api/proxy.ts`
Refactored the proxy functions to use the correct API key based on the portal:

- **`proxyAdminRequest()`** - Now uses `API_CONFIG.adminApiKey`
- **`proxyCompanyRequest()`** - Now uses `API_CONFIG.companyApiKey`

Both functions now call a shared `proxyRequest()` function that accepts the API key as a parameter and sets it in the `X-Authorization` header.

### 3. API Config (`src/config/api.ts`)
Already had support for portal-specific keys with fallback logic:
```typescript
adminApiKey: serverEnv.ADMIN_API_KEY ?? serverEnv.API_KEY ?? serverEnv.NEXT_PUBLIC_API_KEY
companyApiKey: serverEnv.COMPANY_API_KEY ?? serverEnv.API_KEY ?? serverEnv.NEXT_PUBLIC_API_KEY
```

## How It Works

```
Admin Request → proxyAdminRequest() → X-Authorization: {ADMIN_API_KEY}
Company Request → proxyCompanyRequest() → X-Authorization: {COMPANY_API_KEY}
```

## Testing

**Restart your development server** for the environment variable changes to take effect:

```bash
# Stop the server (Ctrl+C) then:
npm run dev
```

Then test:
1. Login to **admin portal** - requests should load
2. Login to **company portal** - requests should load
3. Check browser DevTools Network tab - verify `X-Authorization` header contains the correct key

## Troubleshooting

If you still see "Unable to load requests":

1. **Verify environment variables loaded**:
   - Restart dev server after changing `.env.local`
   - Check server logs for any errors

2. **Check API keys are correct**:
   - Admin key: `jvdu3YJsZkrALmHVMT6jNkaGzKJcqvqjed4yo5GaQ9nP96ZSqcRNiKKZnzG4w8I4`
   - Company key: `RYDwpYKGlnmSgwgILJusHwAKINDbY22S12IR1j5b0bMtlPqtgbuU5nKDqjfqTyPs`

3. **Check browser DevTools Network tab**:
   - Look at failing request
   - Check if `X-Authorization` header is present
   - Verify backend response error message

4. **Check backend logs**:
   - Confirm the key being sent matches what backend expects
   - Look for authentication/authorization errors
