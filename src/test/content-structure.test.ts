import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content');

describe('Content Structure Validation', () => {
  describe('Configuration', () => {
    it('should have content config file', () => {
      const configPath = join(CONTENT_DIR, 'config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      const configContent = readFileSync(configPath, 'utf-8');
      expect(configContent).toContain('defineCollection');
      expect(configContent).toContain('blog');
      // Vérifier la présence de l'enum lang avec les valeurs en et fr, indépendamment du style de guillemets
      expect(configContent).toMatch(/z\.enum\(\s*\[[\s'"]*en[\s'",]*fr[\s'"]*\]\s*\)/);
    });
  });

  describe('Blog Structure', () => {
    it('should have English blog directory', () => {
      const enBlogPath = join(CONTENT_DIR, 'blog', 'en');
      expect(existsSync(enBlogPath)).toBe(true);
    });

    it('should have French blog directory', () => {
      const frBlogPath = join(CONTENT_DIR, 'blog', 'fr');
      expect(existsSync(frBlogPath)).toBe(true);
    });

    it('should have English blog posts', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const astroGuidePath = join(CONTENT_DIR, 'blog', 'en', 'astro-guide.mdx');
      
      expect(existsSync(firstPostPath)).toBe(true);
      expect(existsSync(astroGuidePath)).toBe(true);
    });

    it('should have French blog posts', () => {
      const premierArticlePath = join(CONTENT_DIR, 'blog', 'fr', 'premier-article.mdx');
      const guideAstroPath = join(CONTENT_DIR, 'blog', 'fr', 'guide-astro.mdx');
      
      expect(existsSync(premierArticlePath)).toBe(true);
      expect(existsSync(guideAstroPath)).toBe(true);
    });
  });

  describe('Content Validation', () => {
    it('should have valid frontmatter in English posts', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const content = readFileSync(firstPostPath, 'utf-8');
      
      // Vérifier la présence des champs obligatoires
      expect(content).toContain('title:');
      expect(content).toContain('description:');
      expect(content).toContain('pubDate:');
      expect(content).toContain('author:');
      expect(content).toContain('lang: "en"');
      expect(content).toContain('translationId:');
      expect(content).toContain('canonicalSlug:');
    });

    it('should have valid frontmatter in French posts', () => {
      const premierArticlePath = join(CONTENT_DIR, 'blog', 'fr', 'premier-article.mdx');
      const content = readFileSync(premierArticlePath, 'utf-8');
      
      // Vérifier la présence des champs obligatoires
      expect(content).toContain('title:');
      expect(content).toContain('description:');
      expect(content).toContain('pubDate:');
      expect(content).toContain('author:');
      expect(content).toContain('lang: "fr"');
      expect(content).toContain('translationId:');
      expect(content).toContain('canonicalSlug:');
    });

    it('should have matching translation IDs', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const premierArticlePath = join(CONTENT_DIR, 'blog', 'fr', 'premier-article.mdx');
      
      const enContent = readFileSync(firstPostPath, 'utf-8');
      const frContent = readFileSync(premierArticlePath, 'utf-8');
      
      // Extraire les translationId
      const enTranslationId = enContent.match(/translationId: "([^"]+)"/)?.[1];
      const frTranslationId = frContent.match(/translationId: "([^"]+)"/)?.[1];
      
      expect(enTranslationId).toBeDefined();
      expect(frTranslationId).toBeDefined();
      expect(enTranslationId).toBe(frTranslationId);
    });

    it('should have valid dates', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const content = readFileSync(firstPostPath, 'utf-8');
      
      const dateMatch = content.match(/pubDate: (\d{4}-\d{2}-\d{2})/);
      expect(dateMatch).toBeDefined();
      
      if (dateMatch) {
        const date = new Date(dateMatch[1]);
        expect(date.getTime()).not.toBeNaN();
        expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    it('should have content after frontmatter', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const content = readFileSync(firstPostPath, 'utf-8');
      
      // Vérifier qu'il y a du contenu après le frontmatter
      const parts = content.split('---');
      expect(parts.length).toBeGreaterThanOrEqual(3); // début, frontmatter, contenu
      expect(parts[2].trim().length).toBeGreaterThan(0);
    });
  });

  describe('Schema Validation', () => {
    // Regex pour valider le format slug (identique à celui dans config.ts)
    const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    it('should have valid canonicalSlug format in English posts', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const content = readFileSync(firstPostPath, 'utf-8');
      
      const slugMatch = content.match(/canonicalSlug: "([^"]+)"/);
      expect(slugMatch).toBeDefined();
      
      if (slugMatch) {
        const slug = slugMatch[1];
        expect(slug).toMatch(SLUG_REGEX);
        expect(slug.length).toBeGreaterThan(0);
      }
    });

    it('should have valid canonicalSlug format in French posts', () => {
      const premierArticlePath = join(CONTENT_DIR, 'blog', 'fr', 'premier-article.mdx');
      const content = readFileSync(premierArticlePath, 'utf-8');
      
      const slugMatch = content.match(/canonicalSlug: "([^"]+)"/);
      expect(slugMatch).toBeDefined();
      
      if (slugMatch) {
        const slug = slugMatch[1];
        expect(slug).toMatch(SLUG_REGEX);
        expect(slug.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty translationId', () => {
      const firstPostPath = join(CONTENT_DIR, 'blog', 'en', 'first-post.mdx');
      const content = readFileSync(firstPostPath, 'utf-8');
      
      const translationIdMatch = content.match(/translationId: "([^"]+)"/);
      expect(translationIdMatch).toBeDefined();
      
      if (translationIdMatch) {
        const translationId = translationIdMatch[1];
        expect(translationId.length).toBeGreaterThan(0);
        expect(translationId.trim()).toBe(translationId); // Pas d'espaces au début/fin
      }
    });

    it('should reject invalid canonicalSlug formats', () => {
      // Test des formats invalides selon notre regex
      const invalidSlugs = [
        'My Post Title',           // espaces
        'my_post_title',          // underscores
        'my-post-title-',         // se termine par un trait d'union
        '-my-post-title',         // commence par un trait d'union
        'My-Post-Title',          // majuscules
        'my--post--title',        // traits d'union doubles
        'my.post.title',          // points
        'my/post/title',          // slashes
        'my@post#title',          // caractères spéciaux
        ''                        // vide
      ];

      invalidSlugs.forEach(slug => {
        expect(slug).not.toMatch(SLUG_REGEX);
      });
    });

    it('should accept valid canonicalSlug formats', () => {
      // Test des formats valides selon notre regex
      const validSlugs = [
        'welcome-to-our-blog',
        'bienvenue-sur-notre-blog',
        'first-post',
        'my-awesome-article',
        'tech-guide-2024',
        'simple',
        '123-test',
        'post-1',
        'a-very-long-slug-with-many-words-separated-by-hyphens'
      ];

      validSlugs.forEach(slug => {
        expect(slug).toMatch(SLUG_REGEX);
      });
    });
  });
}); 