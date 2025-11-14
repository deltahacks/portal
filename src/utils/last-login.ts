/**
 * Utility functions for reading last login information from cookies
 */

export interface LastLoginInfo {
  timestamp: string;
  provider: string;
}

/**
 * Parse the last-login cookie value
 * @param cookieValue The raw cookie value
 * @returns Parsed last login info or null if invalid
 */
export function parseLastLoginCookie(
  cookieValue: string | undefined
): LastLoginInfo | null {
  if (!cookieValue) return null;

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);

    if (parsed.timestamp && parsed.provider) {
      return {
        timestamp: parsed.timestamp,
        provider: parsed.provider,
      };
    }
  } catch (error) {
    console.error("Failed to parse last-login cookie:", error);
  }

  return null;
}

/**
 * Get last login info from cookies (client-side)
 * @returns Last login info or null if not found
 */
export function getLastLoginInfo(): LastLoginInfo | null {
  if (typeof window === "undefined") {
    console.warn("getLastLoginInfo can only be called on the client side");
    return null;
  }

  const cookies = document.cookie.split(";");
  const lastLoginCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("last-login=")
  );

  if (!lastLoginCookie) return null;

  const cookieValue = lastLoginCookie.split("=")[1];
  return parseLastLoginCookie(cookieValue);
}

/**
 * Get last login info from request cookies (server-side)
 * @param cookies Cookie header value or cookies object
 * @returns Last login info or null if not found
 */
export function getLastLoginInfoFromRequest(
  cookies: string | Record<string, string> | undefined
): LastLoginInfo | null {
  if (!cookies) return null;

  let cookieValue: string | undefined;

  if (typeof cookies === "string") {
    // Parse cookie header string
    const cookieArray = cookies.split(";");
    const lastLoginCookie = cookieArray.find((cookie) =>
      cookie.trim().startsWith("last-login=")
    );
    cookieValue = lastLoginCookie?.split("=")[1];
  } else {
    // Use cookies object (e.g., from Next.js req.cookies)
    cookieValue = cookies["last-login"];
  }

  return parseLastLoginCookie(cookieValue);
}

/**
 * Format the last login timestamp as a human-readable string
 * @param timestamp ISO timestamp string
 * @returns Formatted string like "2 days ago" or "just now"
 */
export function formatLastLoginTime(timestamp: string): string {
  const loginDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - loginDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

/**
 * Get a user-friendly provider name
 * @param provider Provider ID from the cookie
 * @returns Formatted provider name
 */
export function formatProviderName(provider: string): string {
  const providerNames: Record<string, string> = {
    google: "Google",
    github: "GitHub",
    discord: "Discord",
    linkedin: "LinkedIn",
    "azure-ad": "Microsoft Azure AD",
  };

  return providerNames[provider] || provider;
}
