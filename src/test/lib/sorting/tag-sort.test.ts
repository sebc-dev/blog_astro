import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validatePostsData, validateTranslationsData, escapeHtml } from '@/lib/sorting/tag-sort';

/**
 * Tests pour le module de tri des tags
 * Validation des fonctions de validation des données JSON
 */

describe('Tag Sort Validation', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy sur console pour vérifier les logs d'erreur
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validatePostsData', () => {
    it('should reject non-array data', () => {
      const invalidData = { not: 'an array' };
      
      const result = validatePostsData(invalidData);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Posts data is not an array',
        'object'
      );
    });

    it('should reject null or undefined data', () => {
      expect(validatePostsData(null)).toBe(false);
      expect(validatePostsData(undefined)).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Posts data is not an array',
        'object'
      );
    });

    it('should reject posts with missing data property', () => {
      const invalidPosts = [
        {
          slug: 'test-post',
          // data manquant
          category: 'tech',
          readingTime: 5,
          formattedDate: '2024-01-01'
        }
      ];

      const result = validatePostsData(invalidPosts);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Post at index 0 missing valid data object',
        expect.objectContaining({ slug: 'test-post' })
      );
    });

    it('should reject posts with invalid data structure', () => {
      const invalidPosts = [
        {
          slug: 'test-post',
          data: {
            title: 'Test Title',
            description: 'Test Description',
            // pubDate manquant
          },
          category: 'tech',
          readingTime: 5,
          formattedDate: '2024-01-01'
        }
      ];

      const result = validatePostsData(invalidPosts);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Post at index 0 missing required data properties',
        expect.objectContaining({ title: 'Test Title' })
      );
    });

    it('should reject posts with missing required properties', () => {
      const invalidPosts = [
        {
          slug: 'test-post',
          data: {
            title: 'Test Title',
            description: 'Test Description',
            pubDate: '2024-01-01'
          },
          category: 'tech',
          // readingTime manquant
          formattedDate: '2024-01-01'
        }
      ];

      const result = validatePostsData(invalidPosts);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Post at index 0 missing required properties',
        expect.any(Object)
      );
    });

    it('should accept valid posts data', () => {
      const validPosts = [
        {
          slug: 'test-post',
          data: {
            title: 'Test Title',
            description: 'Test Description',
            pubDate: '2024-01-01'
          },
          category: 'tech',
          tag: 'javascript',
          readingTime: 5,
          formattedDate: '1 janvier 2024'
        }
      ];

      const result = validatePostsData(validPosts);
      
      expect(result).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should accept posts with tag as undefined', () => {
      const validPosts = [
        {
          slug: 'test-post',
          data: {
            title: 'Test Title',
            description: 'Test Description',
            pubDate: '2024-01-01'
          },
          category: 'tech',
          tag: undefined,
          readingTime: 5,
          formattedDate: '1 janvier 2024'
        }
      ];

      const result = validatePostsData(validPosts);
      
      expect(result).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should accept empty array', () => {
      const result = validatePostsData([]);
      
      expect(result).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateTranslationsData', () => {
    it('should reject non-object data', () => {
      const result1 = validateTranslationsData('not an object');
      const result2 = validateTranslationsData(123);
      const result3 = validateTranslationsData([]);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Translations data is not an object',
        'string'
      );
    });

    it('should reject null or undefined data', () => {
      expect(validateTranslationsData(null)).toBe(false);
      expect(validateTranslationsData(undefined)).toBe(false);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Translations data is not an object',
        'object'
      );
    });

    it('should reject translations with missing required properties', () => {
      const incompleteTranslations = {
        sortLabel: 'Trier par',
        // Propriétés manquantes
      };

      const result = validateTranslationsData(incompleteTranslations);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Missing or invalid translation property: sortDateDesc',
        undefined
      );
    });

    it('should reject translations with non-string properties', () => {
      const invalidTranslations = {
        sortLabel: 'Trier par',
        sortDateDesc: 123, // Should be string
        sortDateAsc: 'Date (ancien)',
        sortTitleAsc: 'Titre (A-Z)',
        sortTitleDesc: 'Titre (Z-A)',
        sortReadingTimeAsc: 'Lecture (court)',
        sortReadingTimeDesc: 'Lecture (long)',
        readText: 'Lire',
        tagText: 'Tag'
      };

      const result = validateTranslationsData(invalidTranslations);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Tag sort: Missing or invalid translation property: sortDateDesc',
        123
      );
    });

    it('should accept valid translations data', () => {
      const validTranslations = {
        sortLabel: 'Trier par',
        sortDateDesc: 'Date (récent)',
        sortDateAsc: 'Date (ancien)',
        sortTitleAsc: 'Titre (A-Z)',
        sortTitleDesc: 'Titre (Z-A)',
        sortReadingTimeAsc: 'Lecture (court)',
        sortReadingTimeDesc: 'Lecture (long)',
        readText: 'Lire',
        tagText: 'Tag'
      };

      const result = validateTranslationsData(validTranslations);
      
      expect(result).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('XSS Protection - escapeHtml', () => {
    it('should escape basic HTML characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape all dangerous characters', () => {
      const dangerous = '&<>"\'';
      const expected = '&amp;&lt;&gt;&quot;&#039;';
      
      expect(escapeHtml(dangerous)).toBe(expected);
    });

    it('should handle numbers correctly', () => {
      expect(escapeHtml(123)).toBe('123');
      expect(escapeHtml(0)).toBe('0');
    });

    it('should handle undefined and null values', () => {
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(null)).toBe('');
    });

    it('should preserve safe text unchanged', () => {
      const safeText = 'Hello World 123 !@#$%^*()_+-=[]{}|;:,./';
      expect(escapeHtml(safeText)).toBe(safeText);
    });

    it('should escape XSS attempts in titles', () => {
      const maliciousTitle = 'Article Title<script>steal()</script>';
      const escaped = escapeHtml(maliciousTitle);
      
      expect(escaped).toBe('Article Title&lt;script&gt;steal()&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
    });

    it('should escape XSS attempts in descriptions', () => {
      const maliciousDesc = 'Great article"onmouseover="alert(1)"';
      const escaped = escapeHtml(maliciousDesc);
      
      expect(escaped).toBe('Great article&quot;onmouseover=&quot;alert(1)&quot;');
      expect(escaped).not.toContain('"onmouseover="');
    });

    it('should escape XSS attempts in category names', () => {
      const maliciousCategory = 'Tech</span><img src=x onerror=alert(1)><span>';
      const escaped = escapeHtml(maliciousCategory);
      
      expect(escaped).toBe('Tech&lt;/span&gt;&lt;img src=x onerror=alert(1)&gt;&lt;span&gt;');
      expect(escaped).not.toContain('</span>');
      expect(escaped).not.toContain('<img');
    });

    it('should escape XSS attempts in tag names', () => {
      const maliciousTag = 'javascript\' onclick=\'alert(1)';
      const escaped = escapeHtml(maliciousTag);
      
      expect(escaped).toBe('javascript&#039; onclick=&#039;alert(1)');
      expect(escaped).not.toContain("onclick='");
    });

    it('should escape complex XSS payloads', () => {
      const complexPayload = '"><script>fetch("/steal?cookie="+document.cookie)</script><input type="hidden" value="';
      const escaped = escapeHtml(complexPayload);
      
      expect(escaped).toBe('&quot;&gt;&lt;script&gt;fetch(&quot;/steal?cookie=&quot;+document.cookie)&lt;/script&gt;&lt;input type=&quot;hidden&quot; value=&quot;');
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
      expect(escaped).not.toContain('<input');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle strings with only whitespace', () => {
      expect(escapeHtml('   \n\t   ')).toBe('   \n\t   ');
    });

    it('should handle mixed content correctly', () => {
      const mixed = 'Normal text <tag> & "quotes" \' apostrophes';
      const expected = 'Normal text &lt;tag&gt; &amp; &quot;quotes&quot; &#039; apostrophes';
      
      expect(escapeHtml(mixed)).toBe(expected);
    });
  });
}); 