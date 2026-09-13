# Environment Variables Setup for QueryIO

This document describes the required environment variables for running the QueryIO application.

## Required Variables

The following environment variables must be set in your `.env.local` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL (client-side accessible) | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJh...` |
| `SUPABASE_DATABASE_URL` | Direct database connection URL | `postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?schema=public&sslmode=require` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `AES_ENCRYPTION_KEY` | AES-256 encryption key (32 bytes, base64-encoded) | Generated with `node -e "console.log(Buffer.from(crypto.randomBytes(32)).toString('base64'))"` |

### Database Connection (Prisma)

The `SUPABASE_DATABASE_URL` variable is used by Prisma to connect to your Supabase PostgreSQL database. The connection string must include the following parameters:

- **Schema specification**: `?schema=public`
- **SSL mode**: `&sslmode=require` (mandatory for Supabase)

Example format:
```
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?schema=public&sslmode=require
```

Note: A copy of this connection string is also stored in `prisma/.env` for Prisma CLI tools, but the application will use the value from `.env.local`.

## Important Security Notes

1. **Never commit `.env.local` or any other `.env*` files to version control**
2. **The Firebase private key must include actual newline characters**
   - When setting in environment variables directly, use the literal `\n` in the string
   - The application will automatically replace these with actual newlines
3. **The AES encryption key must be 32 bytes (256 bits) encoded in base64**
   - Generate using the Node.js command mentioned in the table above
   - This key is used for sensitive data encryption

## Validation

The application automatically validates all environment variables on startup. If any required variable is missing, the application will fail to start with a clear error message.

To verify your configuration:
1. Start the development server: `npm run dev`
2. Visit the health check endpoint: [http://localhost:3000/api/health](http://localhost:3000/api/health)

The health check will display masked versions of your environment variables (first/last few characters only) to verify they're loaded correctly without exposing sensitive data. 

## Related Documentation

For information about the database schema and models, please refer to [DB-SCHEMA.md](./DB-SCHEMA.md).

For information about Firebase authentication and API route protection, please refer to [AUTH.md](./AUTH.md).

For information about the available API endpoints and usage, please refer to [API.md](./API.md). 