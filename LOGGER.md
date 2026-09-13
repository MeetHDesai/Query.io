# Logging and Error Handling Guide

This document describes the centralized logging and error handling system implemented in the QueryIO application.

## Overview

The application uses a centralized logging system based on [Winston](https://github.com/winstonjs/winston) to provide consistent, structured logging across all API routes and services. It also includes an error handling wrapper for API routes to catch unhandled exceptions.

## Logger Configuration

The logger is configured in `lib/logger.ts` with the following features:

- Multiple log levels (error, warn, info, debug)
- Timestamps for all log entries
- Error stack traces for better debugging
- Colorized console output for development
- JSON format for potential future log aggregation

## Using the Logger

### Importing

To use the logger in your code:

```typescript
import { logger } from "../lib/logger";
```

### Log Levels

Use the appropriate log level for different types of messages:

```typescript
// For errors that affect application functionality
logger.error("Failed to connect to database: %O", error);

// For recoverable issues or potential problems
logger.warn("Invalid user input: %s", userId);

// For normal operational messages
logger.info("User logged in: %s", userId);

// For detailed debugging information
logger.debug("Query parameters: %O", params);
```

### Log Formatting

The logger supports printf-style formatting:

- `%s` - String
- `%d` - Number
- `%j` - JSON
- `%O` - Object with all properties

### Sensitive Data

When logging potentially sensitive information, use the `maskSensitive` helper function:

```typescript
import { logger, maskSensitive } from "../lib/logger";

// Only shows first and last 2 characters, masks the rest
logger.info("Processing URL: %s", maskSensitive(url));
```

## Error Handling

### API Route Wrapper

All API routes should be wrapped with the `withErrorHandler` function to catch unhandled exceptions:

```typescript
import { withErrorHandler } from "../lib/logger";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your route logic here
}

export default withErrorHandler(handler);
```

### Benefits

The error handler:

1. Catches unhandled exceptions that would otherwise crash the server
2. Logs detailed error information including stack traces
3. Returns a consistent 500 error response
4. Preserves headers if they've already been sent

## Implementation Checklist

When creating new API routes or services:

- [ ] Import `logger` instead of using `console.log`/`console.error`
- [ ] Use appropriate log levels (error, warn, info, debug)
- [ ] Wrap API handlers with `withErrorHandler`
- [ ] Mask sensitive data using `maskSensitive`
- [ ] Add context to error logs (user IDs, request IDs, etc.)

## Configuration

The default log level is "info", but can be customized using the `LOG_LEVEL` environment variable. Valid values are:

- `error` - Only show errors
- `warn` - Show errors and warnings
- `info` - Show errors, warnings, and info messages (default)
- `debug` - Show all messages including debug

Example:

```
# In .env.local
LOG_LEVEL=debug
``` 