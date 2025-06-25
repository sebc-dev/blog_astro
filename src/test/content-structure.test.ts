import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "path";
import { SLUG_REGEX } from "../scripts/validate-content-utils.js";

const CONTENT_DIR = join(process.cwd(), "src", "content");

// Blog directory constants
const BLOG_DIR_EN = join(CONTENT_DIR, "blog", "en");
const BLOG_DIR_FR = join(CONTENT_DIR, "blog", "fr");

// Post filename constants
const POST_FIRST_EN = "first-post.mdx";
const POST_ASTRO_GUIDE_EN = "astro-guide.mdx";
const POST_PREMIER_FR = "premier-article.mdx";
const POST_GUIDE_ASTRO_FR = "guide-astro.mdx";

// Complete post path constants
const FIRST_POST_PATH = join(BLOG_DIR_EN, POST_FIRST_EN);
const ASTRO_GUIDE_PATH = join(BLOG_DIR_EN, POST_ASTRO_GUIDE_EN);
const PREMIER_ARTICLE_PATH = join(BLOG_DIR_FR, POST_PREMIER_FR);
const GUIDE_ASTRO_PATH = join(BLOG_DIR_FR, POST_GUIDE_ASTRO_FR);

describe("Content Structure Validation", () => {
  describe("Configuration", () => {
    it("should have content config file", () => {
      const configPath = join(CONTENT_DIR, "config.ts");
      expect(existsSync(configPath)).toBe(true);

      const configContent = readFileSync(configPath, "utf-8");
      expect(configContent).toContain("defineCollection");
      expect(configContent).toContain("blog");
      // Vérifier la présence de l'enum lang avec les valeurs en et fr, indépendamment du style de guillemets
      expect(configContent).toMatch(
        /z\.enum\(\s*\[[\s'"]*en[\s'",]*fr[\s'"]*\]\s*\)/,
      );
    });
  });

  describe("Blog Structure", () => {
    it("should have English blog directory", () => {
      expect(existsSync(BLOG_DIR_EN)).toBe(true);
    });

    it("should have French blog directory", () => {
      expect(existsSync(BLOG_DIR_FR)).toBe(true);
    });

    it("should have English blog posts", () => {
      expect(existsSync(FIRST_POST_PATH)).toBe(true);
      expect(existsSync(ASTRO_GUIDE_PATH)).toBe(true);
    });

    it("should have French blog posts", () => {
      expect(existsSync(PREMIER_ARTICLE_PATH)).toBe(true);
      expect(existsSync(GUIDE_ASTRO_PATH)).toBe(true);
    });
  });

  describe("Content Validation", () => {
    it("should have valid frontmatter in English posts", () => {
      const files = readdirSync(BLOG_DIR_EN);
      files.forEach((file: string) => {
        const content = readFileSync(
          join(BLOG_DIR_EN, file),
          "utf-8",
        );
        expect(content).toContain("title:");
        expect(content).toContain("description:");
        expect(content).toContain("pubDate:");
        expect(content).toContain('lang: "en"');
        expect(content).toContain("translationId:");
        expect(content).toContain("canonicalSlug:");
      });
    });

    it("should have valid frontmatter in French posts", () => {
      const files = readdirSync(BLOG_DIR_FR);
      files.forEach((file: string) => {
        const content = readFileSync(
          join(BLOG_DIR_FR, file),
          "utf-8",
        );
        expect(content).toContain("title:");
        expect(content).toContain("description:");
        expect(content).toContain("pubDate:");
        expect(content).toContain('lang: "fr"');
        expect(content).toContain("translationId:");
        expect(content).toContain("canonicalSlug:");
      });
    });

    it("should have matching translation IDs", () => {
      const enContent = readFileSync(FIRST_POST_PATH, "utf-8");
      const frContent = readFileSync(PREMIER_ARTICLE_PATH, "utf-8");

      // Extraire les translationId
      const enTranslationId = enContent.match(/translationId: "([^"]+)"/)?.[1];
      const frTranslationId = frContent.match(/translationId: "([^"]+)"/)?.[1];

      expect(enTranslationId).toBeDefined();
      expect(frTranslationId).toBeDefined();
      expect(enTranslationId).toBe(frTranslationId);
    });

    it("should have valid dates", () => {
      const content = readFileSync(FIRST_POST_PATH, "utf-8");

      const dateMatch = content.match(/pubDate: (\d{4}-\d{2}-\d{2})/);
      expect(dateMatch).toBeDefined();

      if (dateMatch) {
        const date = new Date(dateMatch[1]);
        expect(date.getTime()).not.toBeNaN();
        expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    it("should have content after frontmatter", () => {
      const content = readFileSync(FIRST_POST_PATH, "utf-8");

      // Vérifier qu'il y a du contenu après le frontmatter
      const parts = content.split("---");
      expect(parts.length).toBeGreaterThanOrEqual(3); // début, frontmatter, contenu
      expect(parts[2].trim().length).toBeGreaterThan(0);
    });
  });

  describe("Schema Validation", () => {
    // Regex pour valider le format slug (identique à celui dans config.ts)

    it("should have valid canonicalSlug format in English posts", () => {
      const content = readFileSync(FIRST_POST_PATH, "utf-8");

      const slugMatch = content.match(/canonicalSlug: "([^"]+)"/);
      expect(slugMatch).toBeDefined();

      if (slugMatch) {
        const slug = slugMatch[1];
        expect(slug).toMatch(SLUG_REGEX);
        expect(slug.length).toBeGreaterThan(0);
      }
    });

    it("should have valid canonicalSlug format in French posts", () => {
      const content = readFileSync(PREMIER_ARTICLE_PATH, "utf-8");

      const slugMatch = content.match(/canonicalSlug: "([^"]+)"/);
      expect(slugMatch).toBeDefined();

      if (slugMatch) {
        const slug = slugMatch[1];
        expect(slug).toMatch(SLUG_REGEX);
        expect(slug.length).toBeGreaterThan(0);
      }
    });

    it("should have non-empty translationId", () => {
      const content = readFileSync(FIRST_POST_PATH, "utf-8");

      const translationIdMatch = content.match(/translationId: "([^"]+)"/);
      expect(translationIdMatch).toBeDefined();

      if (translationIdMatch) {
        const translationId = translationIdMatch[1];
        expect(translationId.length).toBeGreaterThan(0);
        expect(translationId.trim()).toBe(translationId); // Pas d'espaces au début/fin
      }
    });

    it("should reject invalid canonicalSlug formats", () => {
      // Test des formats invalides selon notre regex
      const invalidSlugs = [
        "My Post Title", // espaces
        "my_post_title", // underscores
        "my-post-title-", // se termine par un trait d'union
        "-my-post-title", // commence par un trait d'union
        "My-Post-Title", // majuscules
        "my--post--title", // traits d'union doubles
        "my.post.title", // points
        "my/post/title", // slashes
        "my@post#title", // caractères spéciaux
        "", // vide
      ];

      invalidSlugs.forEach((slug) => {
        expect(slug).not.toMatch(SLUG_REGEX);
      });
    });

    it("should accept valid canonicalSlug formats", () => {
      // Test des formats valides selon notre regex
      const validSlugs = [
        "welcome-to-our-blog",
        "bienvenue-sur-notre-blog",
        "first-post",
        "my-awesome-article",
        "tech-guide-2024",
        "simple",
        "123-test",
        "post-1",
        "a-very-long-slug-with-many-words-separated-by-hyphens",
      ];

      validSlugs.forEach((slug) => {
        expect(slug).toMatch(SLUG_REGEX);
      });
    });
  });
});
