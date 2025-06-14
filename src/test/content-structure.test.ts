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
      
      const date = new Date(dateMatch![1]);
      expect(date.getTime()).not.toBeNaN();
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
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
}); 