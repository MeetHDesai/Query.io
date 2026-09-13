# Firebase Authentication for QueryIO

This document describes the authentication system used in QueryIO to secure API routes using Firebase Authentication.

## Setup and Configuration

The authentication system requires the following environment variables to be set in your `.env.local` file:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

These credentials must be from a Firebase service account with appropriate permissions.

## How It Works

1. **Firebase Admin Initialization**
   - The Firebase Admin SDK is initialized once when the application starts
   - This initialization happens in `lib/auth.ts`
   - The singleton pattern prevents multiple initializations during hot reloading

2. **Authentication Middleware**
   - The `verifyAuth` middleware in `lib/auth.ts` handles token validation
   - It extracts the Bearer token from the Authorization header
   - Verifies the token with Firebase Admin SDK
   - Attaches the user's UID to the request object for downstream handlers

3. **Protected Routes**
   - API routes that require authentication use the `verifyAuth` middleware
   - Example: `pages/api/secure.ts` demonstrates a protected endpoint

## Usage in API Routes

To protect an API route:

```typescript
import { NextApiResponse } from "next";
import { verifyAuth, AuthenticatedRequest } from "../../lib/auth";

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await verifyAuth(req, res, () => {
    // This code only runs for authenticated requests
    // You can access the user's UID via req.user.uid
    res.status(200).json({ data: "This is protected data" });
  });
}
```

## Client-Side Authentication

When making requests to protected API routes from the client:

1. Get an ID token from the Firebase Authentication client SDK
2. Include the token in the Authorization header:

```javascript
// Example fetch request with authentication
const idToken = await firebase.auth().currentUser.getIdToken();
const response = await fetch('/api/secure', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

## Testing Authentication

You can test the authentication middleware using:

```bash
npm run auth:test
```

This runs a script that tests the `/api/secure` endpoint with:
- No authentication header (should return 401)
- Invalid token (should return 401)

To test with a valid token, you'll need to:
1. Obtain a valid Firebase ID token from a logged-in client
2. Use curl or Postman to make a request with the token:

```bash
curl -H "Authorization: Bearer YOUR_VALID_TOKEN" http://localhost:3000/api/secure
```

## Authentication Flow

1. User signs in using Firebase Authentication on the client
2. Client obtains an ID token from Firebase
3. Client includes the token in API requests
4. Server verifies the token and processes the request
5. If the token is invalid or missing, the server returns 401 Unauthorized

## Security Considerations

- Tokens expire and need to be refreshed (Firebase handles this automatically)
- Always use HTTPS in production to prevent token interception
- The middleware handles errors securely without exposing internal details
- All authentication failures are logged for debugging purposes 