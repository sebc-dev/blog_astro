import { describe, it, expect } from "vitest";
import {
  validateTranslationIdUniqueness,
  validateCanonicalSlugs,
  validateAllContent,
  SLUG_REGEX,
  type BlogPost,
} from "../scripts/validate-content-utils";

describe("Content Validation Utils", () => {
  describe("validateTranslationIdUniqueness", () => {
    it("should pass when translation IDs are unique within language pairs", () => {
      const mockPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/first-post.mdx",
          data: { translationId: "welcome-post", canonicalSlug: "welcome" },
        },
        {
          collection: "blog",
          id: "fr/premier-article.mdx",
          data: { translationId: "welcome-post", canonicalSlug: "bienvenue" },
        },
        {
          collection: "blog",
          id: "en/astro-guide.mdx",
          data: { translationId: "astro-guide", canonicalSlug: "astro-guide" },
        },
        {
          collection: "blog",
          id: "fr/guide-astro.mdx",
          data: { translationId: "astro-guide", canonicalSlug: "guide-astro" },
        },
      ];

      const result = validateTranslationIdUniqueness(mockPosts);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when translation IDs have more than 2 instances", () => {
      const mockPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/first-post.mdx",
          data: { translationId: "duplicate-id", canonicalSlug: "first" },
        },
        {
          collection: "blog",
          id: "fr/premier-article.mdx",
          data: { translationId: "duplicate-id", canonicalSlug: "premier" },
        },
        {
          collection: "blog",
          id: "es/primer-articulo.mdx",
          data: { translationId: "duplicate-id", canonicalSlug: "primer" },
        },
      ];

      const result = validateTranslationIdUniqueness(mockPosts);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("duplicate-id");
      expect(result.errors[0]).toContain("3 posts");
    });

    it("should handle empty collection", () => {
      const result = validateTranslationIdUniqueness([]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle single post without duplicates", () => {
      const mockPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/single-post.mdx",
          data: { translationId: "single-post", canonicalSlug: "single-post" },
        },
      ];

      const result = validateTranslationIdUniqueness(mockPosts);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validateCanonicalSlugs", () => {
    it("should pass when all canonical slugs are valid", () => {
      const mockPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/first-post.mdx",
          data: {
            translationId: "welcome",
            canonicalSlug: "welcome-to-our-blog",
          },
        },
        {
          collection: "blog",
          id: "fr/premier-article.mdx",
          data: {
            translationId: "welcome",
            canonicalSlug: "bienvenue-sur-notre-blog",
          },
        },
        {
          collection: "blog",
          id: "en/simple.mdx",
          data: { translationId: "simple", canonicalSlug: "simple" },
        },
        {
          collection: "blog",
          id: "en/tech-guide.mdx",
          data: { translationId: "tech", canonicalSlug: "tech-guide-2024" },
        },
      ];

      const result = validateCanonicalSlugs(mockPosts);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when canonical slugs have invalid format", () => {
      const mockPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/invalid-post.mdx",
          data: {
            translationId: "invalid1",
            canonicalSlug: "Invalid Post Title",
          }, // espaces et majuscules
        },
        {
          collection: "blog",
          id: "fr/invalid-article.mdx",
          data: { translationId: "invalid2", canonicalSlug: "my_post_title" }, // underscores
        },
        {
          collection: "blog",
          id: "en/another-invalid.mdx",
          data: {
            translationId: "invalid3",
            canonicalSlug: "-starts-with-hyphen",
          }, // commence par trait d'union
        },
        {
          collection: "blog",
          id: "en/ends-invalid.mdx",
          data: {
            translationId: "invalid4",
            canonicalSlug: "ends-with-hyphen-",
          }, // finit par trait d'union
        },
      ];

      const result = validateCanonicalSlugs(mockPosts);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);

      // Vérifier que tous les problèmes sont détectés
      expect(
        result.errors.some((error) => error.includes("Invalid Post Title")),
      ).toBe(true);
      expect(
        result.errors.some((error) => error.includes("my_post_title")),
      ).toBe(true);
      expect(
        result.errors.some((error) => error.includes("-starts-with-hyphen")),
      ).toBe(true);
      expect(
        result.errors.some((error) => error.includes("ends-with-hyphen-")),
      ).toBe(true);
    });

    it("should handle empty and special character slugs", () => {
      const mockPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/empty.mdx",
          data: { translationId: "empty", canonicalSlug: "" }, // vide
        },
        {
          collection: "blog",
          id: "en/special.mdx",
          data: { translationId: "special", canonicalSlug: "my@post#title" }, // caractères spéciaux
        },
        {
          collection: "blog",
          id: "en/dots.mdx",
          data: { translationId: "dots", canonicalSlug: "my.post.title" }, // points
        },
        {
          collection: "blog",
          id: "en/whitespace.mdx",
          data: { translationId: "whitespace", canonicalSlug: "   " }, // espaces seulement
        },
      ];

      const result = validateCanonicalSlugs(mockPosts);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });

    it("should handle empty collection", () => {
      const result = validateCanonicalSlugs([]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validateAllContent", () => {
    it("should validate both translation IDs and canonical slugs", () => {
      const validPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/post1.mdx",
          data: { translationId: "post1", canonicalSlug: "first-post" },
        },
        {
          collection: "blog",
          id: "fr/post1.mdx",
          data: { translationId: "post1", canonicalSlug: "premier-article" },
        },
      ];

      const result = validateAllContent(validPosts);

      expect(result.isValid).toBe(true);
      expect(result.translationResult.isValid).toBe(true);
      expect(result.slugResult.isValid).toBe(true);
    });

    it("should fail when either validation fails", () => {
      const invalidPosts: BlogPost[] = [
        {
          collection: "blog",
          id: "en/post1.mdx",
          data: {
            translationId: "post1",
            canonicalSlug: "Invalid Slug Format",
          }, // slug invalide
        },
        {
          collection: "blog",
          id: "fr/post1.mdx",
          data: { translationId: "post1", canonicalSlug: "valide-slug" },
        },
        {
          collection: "blog",
          id: "es/post1.mdx",
          data: { translationId: "post1", canonicalSlug: "slug-valido" }, // 3 traductions = trop
        },
      ];

      const result = validateAllContent(invalidPosts);

      expect(result.isValid).toBe(false);
      expect(result.translationResult.isValid).toBe(false); // Plus de 2 traductions
      expect(result.slugResult.isValid).toBe(false); // Slug invalide
    });
  });

  describe("SLUG_REGEX", () => {
    it("should reject invalid slug formats", () => {
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

    it("should accept valid slug formats", () => {
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
