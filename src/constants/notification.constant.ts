/**
 * Regular expressions used when parsing notification payloads from the API.
 * Used by `parseNotificationMessage` in `@/lib/utils` to extract links and plain text.
 */

/** Matches `href="..."` or `href='...'` in notification HTML fragments. */
export const NOTIFICATION_HREF_REGEX = /href=["']([^"']+)["']/i;

/** Matches the first http(s) URL in the message (non-greedy by character class). */
export const NOTIFICATION_URL_REGEX = /https?:\/\/[^\s"'<>]+/i;

/** Strips trailing `Download url: https://...` duplicates after HTML is removed. */
export const NOTIFICATION_DOWNLOAD_URL_REGEX = /download\s+url:\s*https?:\/\/[^\s"'<>]+/gi;

/** Collapses whitespace when normalizing notification body text. */
export const NOTIFICATION_WHITESPACE_REGEX = /\s+/g;
