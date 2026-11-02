// Bookmark utilities with pure functions for persistence and slug generation.

const STORAGE_KEY = 'mona-bookmarks';
const SLUG_PREFIX = 'mona-';

interface Bookmark {
  url: string;
  slug: string;
}

// Base62 alphabet for slug generation.
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Convert a number to base62.
 */
function toBase62(num: number): string {
  if (num === 0) return '0';
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

/**
 * Normalize a URL by adding https:// if it doesn't have a protocol.
 * Accepts any URL format the user types — with or without "https://".
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Generate a short slug with "mona-" prefix.
 * Uses timestamp + random number for uniqueness within a session.
 */
export function generateSlug(): string {
  // Combine timestamp and random number for uniqueness.
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const combined = timestamp + random;
  const base62 = toBase62(combined);
  // Take last 4 characters for brevity, fall back to full if shorter.
  const slug = base62.slice(-4) || base62;
  return `${SLUG_PREFIX}${slug}`;
}

/**
 * Format a bookmark as "<url> :: <slug>".
 */
export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

/**
 * Validate a bookmark object.
 */
function isValidBookmark(obj: unknown): obj is Bookmark {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'url' in obj &&
    'slug' in obj &&
    typeof (obj as any).url === 'string' &&
    typeof (obj as any).slug === 'string' &&
    (obj as any).url.length > 0 &&
    (obj as any).slug.length > 0
  );
}

/**
 * Load bookmarks from localStorage.
 * Treats localStorage as untrusted; validates and recovers gracefully.
 */
export function loadBookmarks(): Bookmark[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);

    // Handle empty or null storage.
    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);

    // Ensure it's an array.
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Validate each bookmark and filter out malformed entries.
    const bookmarks: Bookmark[] = [];
    for (const item of parsed) {
      if (isValidBookmark(item)) {
        bookmarks.push(item);
      }
    }
    return bookmarks;
  } catch {
    // Any error (parse, access) is treated as corrupted storage — recover gracefully.
    return [];
  }
}

/**
 * Save bookmarks to localStorage.
 */
export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Silently fail if storage is unavailable (quota exceeded, etc.).
  }
}

/**
 * Add a bookmark from a URL input.
 */
export function addBookmark(input: string, bookmarks: Bookmark[]): Bookmark | null {
  const normalizedUrl = normalizeUrl(input);
  if (!normalizedUrl) {
    return null;
  }

  // Check for duplicates.
  if (bookmarks.some((b) => b.url === normalizedUrl)) {
    return null;
  }

  const bookmark: Bookmark = {
    url: normalizedUrl,
    slug: generateSlug(),
  };

  return bookmark;
}
