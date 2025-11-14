# Last Login Tracking - Usage Guide

This document explains how to use the cookie-based last login tracking feature.

## Overview

The application now tracks the last login timestamp and provider for each user using a cookie. This information is stored in a cookie named `last-login` with the following structure:

```json
{
  "timestamp": "2025-11-14T10:30:00.000Z",
  "provider": "google"
}
```

## Features

- Tracks the timestamp of the last successful login
- Records which OAuth provider was used (Google, GitHub, Discord, LinkedIn, Azure AD)
- Stored as an HttpOnly cookie for security
- Cookie expires after 1 year
- No database storage required

## Usage Examples

### Client-Side Usage

```typescript
import { getLastLoginInfo, formatLastLoginTime, formatProviderName } from "@/utils/last-login";

// Get last login information
const lastLogin = getLastLoginInfo();

if (lastLogin) {
  console.log(`Last logged in: ${formatLastLoginTime(lastLogin.timestamp)}`);
  console.log(`Provider: ${formatProviderName(lastLogin.provider)}`);
  // Output: "Last logged in: 2 hours ago"
  // Output: "Provider: Google"
}
```

### Server-Side Usage (API Routes)

```typescript
import { getLastLoginInfoFromRequest } from "@/utils/last-login";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get last login from request cookies
  const lastLogin = getLastLoginInfoFromRequest(req.cookies);

  if (lastLogin) {
    return res.json({
      lastLoginTime: lastLogin.timestamp,
      lastLoginProvider: lastLogin.provider,
    });
  }

  return res.status(404).json({ error: "No last login information found" });
}
```

### Server-Side Usage (getServerSideProps)

```typescript
import { getLastLoginInfoFromRequest } from "@/utils/last-login";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const lastLogin = getLastLoginInfoFromRequest(context.req.cookies);

  return {
    props: {
      lastLogin: lastLogin || null,
    },
  };
};
```

### React Component Example

```tsx
import { useEffect, useState } from "react";
import { getLastLoginInfo, formatLastLoginTime, formatProviderName } from "@/utils/last-login";
import type { LastLoginInfo } from "@/utils/last-login";

export function LastLoginDisplay() {
  const [lastLogin, setLastLogin] = useState<LastLoginInfo | null>(null);

  useEffect(() => {
    setLastLogin(getLastLoginInfo());
  }, []);

  if (!lastLogin) {
    return <p>No previous login information available</p>;
  }

  return (
    <div>
      <p>Last login: {formatLastLoginTime(lastLogin.timestamp)}</p>
      <p>Provider: {formatProviderName(lastLogin.provider)}</p>
    </div>
  );
}
```

## API Reference

### `getLastLoginInfo()`

Client-side only. Reads the last-login cookie from `document.cookie`.

**Returns:** `LastLoginInfo | null`

### `getLastLoginInfoFromRequest(cookies)`

Server-side only. Reads the last-login cookie from request cookies.

**Parameters:**
- `cookies`: Cookie header string or cookies object from `req.cookies`

**Returns:** `LastLoginInfo | null`

### `formatLastLoginTime(timestamp)`

Formats an ISO timestamp into a human-readable relative time string.

**Parameters:**
- `timestamp`: ISO 8601 timestamp string

**Returns:** String like "2 hours ago", "3 days ago", etc.

### `formatProviderName(provider)`

Converts provider ID to a user-friendly name.

**Parameters:**
- `provider`: Provider ID (e.g., "google", "github")

**Returns:** Formatted name (e.g., "Google", "GitHub")

## Security Notes

- The cookie is **HttpOnly**, meaning it cannot be accessed via JavaScript on the client side for security purposes. Use the provided utility functions instead.
- The cookie uses **SameSite=Lax** to prevent CSRF attacks
- The cookie is valid for 1 year and will be updated on each new login

## Provider Values

The following provider values are tracked:

- `google` - Google OAuth
- `github` - GitHub OAuth
- `discord` - Discord OAuth
- `linkedin` - LinkedIn OAuth
- `azure-ad` - Microsoft Azure AD OAuth
