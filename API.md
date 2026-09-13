# QueryIO API Reference

This document describes the API endpoints available in the QueryIO application.

## Authentication

All API endpoints require authentication using Firebase Authentication. Include the user's ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

Failure to include a valid token will result in a `401 Unauthorized` response.

## Database Connections API

The Connections API allows users to manage their database connections.

### List Connections

```
GET /api/connections
```

**Response (200 OK)**
```json
[
  {
    "id": "clu123abc456",
    "name": "Production Database",
    "createdAt": "2025-04-17T21:30:45.123Z"
  },
  {
    "id": "clu456def789",
    "name": "Development Database",
    "createdAt": "2025-04-17T20:15:30.456Z"
  }
]
```

### Create Connection

```
POST /api/connections
```

**Request Body**
```json
{
  "name": "My Database",
  "url": "postgresql://username:password@hostname:port/database"
}
```

**Response (201 Created)**
```json
{
  "id": "clu789ghi012",
  "name": "My Database",
  "createdAt": "2025-04-18T01:45:12.789Z"
}
```

**Validation**
- `name`: Required, non-empty string
- `url`: Required, valid PostgreSQL connection string

**Error Responses**
- `400 Bad Request`: Invalid input parameters
- `500 Internal Server Error`: Server error

### Delete Connection

```
DELETE /api/connections/:id
```

**Parameters**
- `id`: The ID of the connection to delete

**Response (204 No Content)**
No response body is returned for successful deletion.

**Error Responses**
- `404 Not Found`: Connection not found or doesn't belong to the authenticated user
- `500 Internal Server Error`: Server error

## Security Considerations

- Connection URLs are encrypted using AES-256 before storage
- Only the connection owner can access their own connections
- Sensitive information (like connection URLs) is never returned in API responses
- All delete operations verify ownership before proceeding

## Testing the API

The API can be tested using the provided test script:

```bash
# Test with default configuration (invalid token)
npm run connections:test

# Test with a valid Firebase token
FIREBASE_TOKEN=your-token npm run connections:test
```

For more details on obtaining a valid token, see [AUTH.md](./AUTH.md). 