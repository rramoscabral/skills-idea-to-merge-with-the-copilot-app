import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeUrl,
  generateSlug,
  formatBookmark,
  loadBookmarks,
  saveBookmarks,
  addBookmark,
} from './bookmarks';

describe('bookmarks utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test.
    localStorage.clear();
  });

  describe('normalizeUrl', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    it('should preserve https:// URLs', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should preserve http:// URLs', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should trim whitespace', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('should normalize the same URL regardless of protocol presence', () => {
      const with_protocol = normalizeUrl('https://example.com');
      const without_protocol = normalizeUrl('example.com');
      expect(with_protocol).toBe(without_protocol);
    });

    it('should return empty string for empty input', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('   ')).toBe('');
    });
  });

  describe('formatBookmark', () => {
    it('should format bookmark as "<url> :: <slug>"', () => {
      const bookmark = { url: 'https://example.com', slug: 'mona-abc1' };
      expect(formatBookmark(bookmark)).toBe('https://example.com :: mona-abc1');
    });

    it('should use exact " :: " separator', () => {
      const bookmark = { url: 'https://test.com', slug: 'mona-xyz9' };
      const formatted = formatBookmark(bookmark);
      expect(formatted).toContain(' :: ');
    });
  });

  describe('loadBookmarks', () => {
    it('should return empty array when storage is empty', () => {
      expect(loadBookmarks()).toEqual([]);
    });

    it('should return empty array when storage has null value', () => {
      localStorage.setItem('mona-bookmarks', 'null');
      expect(loadBookmarks()).toEqual([]);
    });

    it('should return empty array for non-array JSON', () => {
      localStorage.setItem('mona-bookmarks', '{"url": "test"}');
      expect(loadBookmarks()).toEqual([]);
    });

    it('should return empty array for corrupted JSON', () => {
      localStorage.setItem('mona-bookmarks', 'not valid json');
      expect(loadBookmarks()).toEqual([]);
    });

    it('should load valid bookmarks', () => {
      const bookmarks = [
        { url: 'https://example.com', slug: 'mona-abc1' },
        { url: 'https://test.com', slug: 'mona-xyz9' },
      ];
      localStorage.setItem('mona-bookmarks', JSON.stringify(bookmarks));
      expect(loadBookmarks()).toEqual(bookmarks);
    });

    it('should filter out malformed bookmarks', () => {
      const mixed = [
        { url: 'https://example.com', slug: 'mona-abc1' },
        { url: 'https://test.com' }, // missing slug
        { slug: 'mona-xyz9' }, // missing url
        { url: '', slug: 'mona-bad' }, // empty url
        { url: 'https://valid.com', slug: 'mona-valid' },
      ];
      localStorage.setItem('mona-bookmarks', JSON.stringify(mixed));
      const loaded = loadBookmarks();
      expect(loaded).toEqual([
        { url: 'https://example.com', slug: 'mona-abc1' },
        { url: 'https://valid.com', slug: 'mona-valid' },
      ]);
    });

    it('should handle legacy or corrupted values gracefully', () => {
      localStorage.setItem('mona-bookmarks', '[]');
      expect(loadBookmarks()).toEqual([]);

      localStorage.setItem('mona-bookmarks', 'undefined');
      expect(loadBookmarks()).toEqual([]);
    });
  });

  describe('saveBookmarks', () => {
    it('should save bookmarks to localStorage', () => {
      const bookmarks = [{ url: 'https://example.com', slug: 'mona-abc1' }];
      saveBookmarks(bookmarks);
      expect(localStorage.getItem('mona-bookmarks')).toBe(JSON.stringify(bookmarks));
    });

    it('should handle empty array', () => {
      saveBookmarks([]);
      expect(localStorage.getItem('mona-bookmarks')).toBe('[]');
    });
  });

  describe('addBookmark', () => {
    it('should create a bookmark with normalized URL and generated slug', () => {
      const bookmark = addBookmark('example.com', []);
      expect(bookmark).not.toBeNull();
      expect(bookmark?.url).toBe('https://example.com');
      expect(bookmark?.slug).toMatch(/^mona-/);
    });

    it('should return null for empty input', () => {
      expect(addBookmark('', [])).toBeNull();
      expect(addBookmark('   ', [])).toBeNull();
    });

    it('should return null for duplicate URLs', () => {
      const existing = [{ url: 'https://example.com', slug: 'mona-abc1' }];
      expect(addBookmark('example.com', existing)).toBeNull();
      expect(addBookmark('https://example.com', existing)).toBeNull();
    });

    it('should generate unique slugs on each call', () => {
      const bookmark1 = addBookmark('https://example1.com', []);
      const bookmark2 = addBookmark('https://example2.com', []);
      expect(bookmark1?.slug).not.toBe(bookmark2?.slug);
    });
  });
});
