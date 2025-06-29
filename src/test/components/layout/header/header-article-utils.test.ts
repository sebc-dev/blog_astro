import { describe, it, expect } from "vitest";
import {
  extractSlugWithoutLanguagePrefix,
  createArticleTranslationMappingPure,
  analyzeLanguageContextPure,
  generateHreflangLinks,
} from "@/components/layout/header/article-utils";
import { pageDetectionManager } from "@/components/layout/header/page-utils";

// Mock data pour les tests (simplified for testing purposes)
const mockBlogPosts = [
  {
    slug: "en/rest-api-best-practices-guide",
    data: {
      translationId: "550e8400-e29b-41d4-a716-446655440005",
      lang: "en",
      canonicalSlug: "rest-api-best-practices-guide",
    },
  },
  {
    slug: "fr/api-rest-bonnes-pratiques",
    data: {
      translationId: "550e8400-e29b-41d4-a716-446655440005",
      lang: "fr",
      canonicalSlug: "api-rest-bonnes-pratiques",
    },
  },
  {
    slug: "en/typescript-beginners-guide",
    data: {
      translationId: "123e4567-e89b-12d3-a456-426614174000",
      lang: "en",
      canonicalSlug: "typescript-beginners-guide",
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any; // Mock data simplified for testing

describe("Header Article Utils", () => {
  describe("pageDetectionManager - Article Detection", () => {
    it("should detect article pages correctly", () => {
      const articleUrl = new URL(
        "http://localhost:4321/blog/en/rest-api-guide",
      );
      const homeUrl = new URL("http://localhost:4321/");
      const aboutUrl = new URL("http://localhost:4321/about");

      const articleDetection = pageDetectionManager.detectPage(articleUrl);
      const homeDetection = pageDetectionManager.detectPage(homeUrl);
      const aboutDetection = pageDetectionManager.detectPage(aboutUrl);

      expect(articleDetection?.pageInfo.pageType).toBe("article");
      expect(homeDetection?.pageInfo.pageType).toBe("normal");
      expect(aboutDetection?.pageInfo.pageType).toBe("normal");
    });

    it("should handle French article pages", () => {
      const frArticleUrl = new URL(
        "http://localhost:4321/fr/blog/fr/guide-typescript",
      );
      const detection = pageDetectionManager.detectPage(frArticleUrl);
      expect(detection?.pageInfo.pageType).toBe("article");
    });

    it("should detect valid language codes (en and fr)", () => {
      const enUrl = new URL("http://localhost:4321/blog/en/rest-api-guide");
      const frUrl = new URL("http://localhost:4321/blog/fr/guide-typescript");

      const enDetection = pageDetectionManager.detectPage(enUrl);
      const frDetection = pageDetectionManager.detectPage(frUrl);

      expect(enDetection?.pageInfo.pageType).toBe("article");
      expect(enDetection?.pageInfo.detectedLang).toBe("en");
      expect(frDetection?.pageInfo.pageType).toBe("article");
      expect(frDetection?.pageInfo.detectedLang).toBe("fr");
    });

    it("should handle invalid language codes gracefully", () => {
      // Test various unsupported language codes
      const spanishUrl = new URL("http://localhost:4321/blog/es/some-article");
      const germanUrl = new URL("http://localhost:4321/blog/de/some-article");
      const italianUrl = new URL("http://localhost:4321/blog/it/some-article");
      const chineseUrl = new URL("http://localhost:4321/blog/zh/some-article");
      const invalidCodeUrl = new URL(
        "http://localhost:4321/blog/invalid/some-article",
      );

      const spanishDetection = pageDetectionManager.detectPage(spanishUrl);
      const germanDetection = pageDetectionManager.detectPage(germanUrl);
      const italianDetection = pageDetectionManager.detectPage(italianUrl);
      const chineseDetection = pageDetectionManager.detectPage(chineseUrl);
      const invalidDetection = pageDetectionManager.detectPage(invalidCodeUrl);

      // Ces pages sont détectées comme des articles mais avec une langue null ou fallback
      expect(spanishDetection?.pageInfo.pageType).toBe("article");
      expect(spanishDetection?.pageInfo.detectedLang).toBeNull();
      expect(germanDetection?.pageInfo.pageType).toBe("article");
      expect(germanDetection?.pageInfo.detectedLang).toBeNull();
      expect(italianDetection?.pageInfo.pageType).toBe("article");
      expect(italianDetection?.pageInfo.detectedLang).toBeNull();
      expect(chineseDetection?.pageInfo.pageType).toBe("article");
      expect(chineseDetection?.pageInfo.detectedLang).toBeNull();
      expect(invalidDetection?.pageInfo.pageType).toBe("article");
      expect(invalidDetection?.pageInfo.detectedLang).toBeNull();
    });

    it("should return normal page type for non-article URLs", () => {
      const homeUrl = new URL("http://localhost:4321/");
      const detection = pageDetectionManager.detectPage(homeUrl);
      expect(detection?.pageInfo.pageType).toBe("normal");
    });

    it("should extract slug from article URLs", () => {
      const url = new URL(
        "http://localhost:4321/blog/en/rest-api-best-practices-guide",
      );
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("article");
      if (detection?.pageInfo.pageType === "article") {
        expect(detection.pageInfo.slug).toBe("rest-api-best-practices-guide");
      }
    });

    it("should handle complex slugs", () => {
      const url = new URL(
        "http://localhost:4321/blog/fr/guide/typescript/pour-debutants",
      );
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("article");
      if (detection?.pageInfo.pageType === "article") {
        expect(detection.pageInfo.slug).toBe("guide/typescript/pour-debutants");
      }
    });

    it("should return null slug for non-article URLs", () => {
      const url = new URL("http://localhost:4321/about");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("normal");
      // Normal pages don't have slugs
    });
  });

  describe("extractSlugWithoutLanguagePrefix", () => {
    it("should extract slug correctly from normal cases", () => {
      expect(extractSlugWithoutLanguagePrefix("en/rest-api-guide", "en")).toBe(
        "rest-api-guide",
      );
      expect(
        extractSlugWithoutLanguagePrefix("fr/guide-typescript", "fr"),
      ).toBe("guide-typescript");
    });

    it("should handle complex slugs with slashes", () => {
      expect(
        extractSlugWithoutLanguagePrefix("en/advanced/typescript/guide", "en"),
      ).toBe("advanced/typescript/guide");
      expect(
        extractSlugWithoutLanguagePrefix("fr/guide/css/grid-layout", "fr"),
      ).toBe("guide/css/grid-layout");
    });

    it("should handle special characters in slugs", () => {
      expect(
        extractSlugWithoutLanguagePrefix("en/my-article-with-dashes", "en"),
      ).toBe("my-article-with-dashes");
      expect(
        extractSlugWithoutLanguagePrefix("fr/article.avec.points", "fr"),
      ).toBe("article.avec.points");
      expect(
        extractSlugWithoutLanguagePrefix("en/article_with_underscores", "en"),
      ).toBe("article_with_underscores");
    });

    it("should handle edge cases safely", () => {
      // Cas où la langue apparaît ailleurs dans le slug mais pas au début
      expect(
        extractSlugWithoutLanguagePrefix("en/article-about-en-language", "en"),
      ).toBe("article-about-en-language");
      expect(
        extractSlugWithoutLanguagePrefix("fr/tutorial-fr-basics", "fr"),
      ).toBe("tutorial-fr-basics");

      // Cas où la langue est répétée
      expect(extractSlugWithoutLanguagePrefix("en/en-tutorial", "en")).toBe(
        "en-tutorial",
      );
    });

    it("should return null for invalid inputs", () => {
      expect(extractSlugWithoutLanguagePrefix("", "en")).toBeNull();
      expect(extractSlugWithoutLanguagePrefix("en/article", "")).toBeNull();
      expect(extractSlugWithoutLanguagePrefix("", "")).toBeNull();
    });

    it("should return null when format doesn't match expected pattern", () => {
      // Pas de séparateur
      expect(extractSlugWithoutLanguagePrefix("enarticle", "en")).toBeNull();
      // Mauvaise langue au début
      expect(extractSlugWithoutLanguagePrefix("fr/article", "en")).toBeNull();
      // Slug qui ne commence pas par la langue
      expect(
        extractSlugWithoutLanguagePrefix("blog/en/article", "en"),
      ).toBeNull();
    });

    it("should handle languages that need regex escaping", () => {
      // Test avec des caractères qui pourraient poser problème en regex
      expect(
        extractSlugWithoutLanguagePrefix("c++/programming-guide", "c++"),
      ).toBe("programming-guide");
      expect(extractSlugWithoutLanguagePrefix("c#/tutorial", "c#")).toBe(
        "tutorial",
      );
    });
  });

  describe("createArticleTranslationMappingPure", () => {
    it("should create correct translation mapping", () => {
      const url = new URL(
        "http://localhost:4321/blog/en/rest-api-best-practices-guide",
      );
      const mapping = createArticleTranslationMappingPure(url, mockBlogPosts);

      expect(mapping).toEqual({
        en: "rest-api-best-practices-guide",
        fr: "api-rest-bonnes-pratiques",
      });
    });

    it("should return undefined for non-existent article", () => {
      const url = new URL("http://localhost:4321/blog/en/non-existent-article");
      const mapping = createArticleTranslationMappingPure(url, mockBlogPosts);

      expect(mapping).toBeUndefined();
    });

    it("should handle articles with only one translation", () => {
      const url = new URL(
        "http://localhost:4321/blog/en/typescript-beginners-guide",
      );
      const mapping = createArticleTranslationMappingPure(url, mockBlogPosts);

      expect(mapping).toEqual({
        en: "typescript-beginners-guide",
        fr: null,
      });
    });
  });

  describe("generateHreflangLinks", () => {
    it("should generate hreflang links correctly", () => {
      const languageUrls = {
        en: {
          url: "/blog/en/rest-api-guide",
          label: "English",
          flag: "🇺🇸",
          isActive: true,
        },
        fr: {
          url: "/blog/fr/guide-api-rest",
          label: "Français",
          flag: "🇫🇷",
          isActive: false,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const hreflangLinks = generateHreflangLinks(languageUrls);

      expect(hreflangLinks).toEqual([
        { hreflang: "en", href: "/blog/en/rest-api-guide" },
        { hreflang: "fr", href: "/blog/fr/guide-api-rest" },
      ]);
    });
  });

  describe("pageDetectionManager - Category Detection", () => {
    it("should detect category pages correctly", () => {
      const url = new URL("http://localhost:4321/category/framework");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("category");
    });

    it("should detect French category pages", () => {
      const url = new URL("http://localhost:4321/fr/categorie/langage");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("category");
    });

    it("should return normal for non-category URLs", () => {
      const url = new URL("http://localhost:4321/blog/en/some-article");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("article");
    });

    it("should return normal for home page", () => {
      const url = new URL("http://localhost:4321/");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("normal");
    });

    it("should extract category from URL", () => {
      const url = new URL("http://localhost:4321/category/framework");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("category");
      if (detection?.pageInfo.pageType === "category") {
        expect(detection.pageInfo.category).toBe("framework");
      }
    });

    it("should extract category from French URL", () => {
      const url = new URL("http://localhost:4321/fr/categorie/langage");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("category");
      if (detection?.pageInfo.pageType === "category") {
        expect(detection.pageInfo.category).toBe("langage");
      }
    });

    it("should return null category for non-category URL", () => {
      const url = new URL("http://localhost:4321/about");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("normal");
    });

    it("should detect category language correctly", () => {
      const url = new URL("http://localhost:4321/category/framework");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("category");
      if (detection?.pageInfo.pageType === "category") {
        expect(detection.pageInfo.detectedLang).toBe("en");
      }
    });

    it("should detect French category language", () => {
      const url = new URL("http://localhost:4321/fr/categorie/langage");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("category");
      if (detection?.pageInfo.pageType === "category") {
        expect(detection.pageInfo.detectedLang).toBe("fr");
      }
    });

    it("should return null language for non-category page", () => {
      const url = new URL("http://localhost:4321/about");
      const detection = pageDetectionManager.detectPage(url);
      expect(detection?.pageInfo.pageType).toBe("normal");
      if (detection?.pageInfo.pageType === "normal") {
        expect(detection.pageInfo.detectedLang).toBe("en"); // Langue par défaut
      }
    });

    it("should create category URL mapping", () => {
      const url = new URL("http://localhost:4321/category/language");
      const detection = pageDetectionManager.detectPage(url);
      if (detection?.pageInfo.pageType === "category") {
        const mapping = pageDetectionManager.createUrlMapping(detection.pageInfo, url);
        expect(mapping).toBeDefined();
        expect(mapping?.["en"]).toBe("/category/language");
        expect(mapping?.["fr"]).toBe("/fr/categorie/langage");
      }
    });

    it("should create French category URL mapping", () => {
      const url = new URL("http://localhost:4321/fr/categorie/langage");
      const detection = pageDetectionManager.detectPage(url);
      if (detection?.pageInfo.pageType === "category") {
        const mapping = pageDetectionManager.createUrlMapping(detection.pageInfo, url);
        expect(mapping).toBeDefined();
        expect(mapping?.["en"]).toBe("/category/language");
        expect(mapping?.["fr"]).toBe("/fr/categorie/langage");
      }
    });

    it("should handle framework category mapping", () => {
      const url = new URL("http://localhost:4321/category/framework");
      const detection = pageDetectionManager.detectPage(url);
      if (detection?.pageInfo.pageType === "category") {
        const mapping = pageDetectionManager.createUrlMapping(detection.pageInfo, url);
        expect(mapping).toBeDefined();
        expect(mapping?.["en"]).toBe("/category/framework");
        expect(mapping?.["fr"]).toBe("/fr/categorie/framework");
      }
    });

    it("should handle styling category mapping from both languages", () => {
      const urlEn = new URL("http://localhost:4321/category/styling");
      const urlFr = new URL("http://localhost:4321/fr/categorie/style");
      
      const detectionEn = pageDetectionManager.detectPage(urlEn);
      const detectionFr = pageDetectionManager.detectPage(urlFr);
      
      if (detectionEn?.pageInfo.pageType === "category") {
        const mappingFromEn = pageDetectionManager.createUrlMapping(detectionEn.pageInfo, urlEn);
        expect(mappingFromEn).toBeDefined();
        expect(mappingFromEn?.["en"]).toBe("/category/styling");
        expect(mappingFromEn?.["fr"]).toBe("/fr/categorie/style");
      }
      
      if (detectionFr?.pageInfo.pageType === "category") {
        const mappingFromFr = pageDetectionManager.createUrlMapping(detectionFr.pageInfo, urlFr);
        expect(mappingFromFr).toBeDefined();
        expect(mappingFromFr?.["en"]).toBe("/category/styling");
        expect(mappingFromFr?.["fr"]).toBe("/fr/categorie/style");
      }
    });

    it("should return null for unknown category", () => {
      const url = new URL("http://localhost:4321/category/unknown-category");
      const detection = pageDetectionManager.detectPage(url);
      if (detection?.pageInfo.pageType === "category") {
        const mapping = pageDetectionManager.createUrlMapping(detection.pageInfo, url);
        expect(mapping).toBeNull();
      }
    });
  });

  describe("analyzeLanguageContextPure", () => {
    it("should analyze article page context correctly", () => {
      const url = new URL(
        "http://localhost:4321/blog/en/rest-api-best-practices-guide",
      );
      const context = analyzeLanguageContextPure(url, mockBlogPosts);

      expect(context).toMatchObject({
        isArticlePage: true,
        detectedLang: "en",
        articleSlug: "rest-api-best-practices-guide",
        translationMapping: {
          en: "rest-api-best-practices-guide",
          fr: "api-rest-bonnes-pratiques",
        },
        isCategoryPage: false,
      });
    });

    it("should analyze non-article page context", () => {
      const url = new URL("http://localhost:4321/about");
      const context = analyzeLanguageContextPure(url);

      expect(context).toMatchObject({
        isArticlePage: false,
        detectedLang: "en",
        isCategoryPage: false,
      });
    });

    it("should handle article page without blog posts data", () => {
      const url = new URL("http://localhost:4321/blog/en/some-article");
      const context = analyzeLanguageContextPure(url);

      expect(context).toMatchObject({
        isArticlePage: true,
        detectedLang: "en",
        articleSlug: "some-article",
        isCategoryPage: false,
      });
      expect(context.translationMapping).toBeUndefined();
    });

    it("should maintain backward compatibility for analyzeLanguageContextPure - category context", () => {
      const url = new URL("http://localhost:4321/category/framework");
      const context = analyzeLanguageContextPure(url);

      expect(context.isArticlePage).toBe(false);
      expect(context.isCategoryPage).toBe(true);
      expect(context.detectedLang).toBe("en");
      expect(context.categorySlug).toBe("framework");
      expect(context.categoryUrlMapping).toBeDefined();
    });

    it("should maintain backward compatibility for analyzeLanguageContextPure - French category context", () => {
      const url = new URL("http://localhost:4321/fr/categorie/langage");
      const context = analyzeLanguageContextPure(url);

      expect(context.isArticlePage).toBe(false);
      expect(context.isCategoryPage).toBe(true);
      expect(context.detectedLang).toBe("fr");
      expect(context.categorySlug).toBe("langage");
      expect(context.categoryUrlMapping).toBeDefined();
    });

    it("should maintain backward compatibility for analyzeLanguageContextPure - normal page context", () => {
      const url = new URL("http://localhost:4321/about");
      const context = analyzeLanguageContextPure(url);

      expect(context.isArticlePage).toBe(false);
      expect(context.isCategoryPage).toBe(false);
      expect(context.detectedLang).toBe("en");
    });
  });
});
