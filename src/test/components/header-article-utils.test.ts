import { describe, it, expect } from "vitest";
import {
  isArticlePage,
  detectArticleLanguage,
  extractArticleSlug,
  extractSlugWithoutLanguagePrefix,
  createArticleTranslationMappingPure,
  analyzeLanguageContextPure,
  generateHreflangLinks,
  isCategoryPage,
  extractCategoryFromUrl,
  detectCategoryLanguage,
  createCategoryUrlMapping,
} from "../../components/header/article-utils";

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
  describe("isArticlePage", () => {
    it("should detect article pages correctly", () => {
      const articleUrl = new URL(
        "http://localhost:4321/blog/en/rest-api-guide",
      );
      const homeUrl = new URL("http://localhost:4321/");
      const aboutUrl = new URL("http://localhost:4321/about");

      expect(isArticlePage(articleUrl)).toBe(true);
      expect(isArticlePage(homeUrl)).toBe(false);
      expect(isArticlePage(aboutUrl)).toBe(false);
    });

    it("should handle French article pages", () => {
      const frArticleUrl = new URL(
        "http://localhost:4321/fr/blog/fr/guide-typescript",
      );
      expect(isArticlePage(frArticleUrl)).toBe(true);
    });
  });

  describe("detectArticleLanguage", () => {
    it("should detect valid language codes (en and fr)", () => {
      const enUrl = new URL("http://localhost:4321/blog/en/rest-api-guide");
      const frUrl = new URL("http://localhost:4321/blog/fr/guide-typescript");

      expect(detectArticleLanguage(enUrl)).toBe("en");
      expect(detectArticleLanguage(frUrl)).toBe("fr");
    });

    it("should return null for invalid language codes (only en and fr are supported)", () => {
      // Test various unsupported language codes
      const spanishUrl = new URL("http://localhost:4321/blog/es/some-article");
      const germanUrl = new URL("http://localhost:4321/blog/de/some-article");
      const italianUrl = new URL("http://localhost:4321/blog/it/some-article");
      const chineseUrl = new URL("http://localhost:4321/blog/zh/some-article");
      const invalidCodeUrl = new URL(
        "http://localhost:4321/blog/invalid/some-article",
      );

      expect(detectArticleLanguage(spanishUrl)).toBeNull();
      expect(detectArticleLanguage(germanUrl)).toBeNull();
      expect(detectArticleLanguage(italianUrl)).toBeNull();
      expect(detectArticleLanguage(chineseUrl)).toBeNull();
      expect(detectArticleLanguage(invalidCodeUrl)).toBeNull();
    });

    it("should return null for non-article URLs", () => {
      const homeUrl = new URL("http://localhost:4321/");
      expect(detectArticleLanguage(homeUrl)).toBeNull();
    });
  });

  describe("extractArticleSlug", () => {
    it("should extract slug from article URLs", () => {
      const url = new URL(
        "http://localhost:4321/blog/en/rest-api-best-practices-guide",
      );
      expect(extractArticleSlug(url)).toBe("rest-api-best-practices-guide");
    });

    it("should handle complex slugs", () => {
      const url = new URL(
        "http://localhost:4321/blog/fr/guide/typescript/pour-debutants",
      );
      expect(extractArticleSlug(url)).toBe("guide/typescript/pour-debutants");
    });

    it("should return null for non-article URLs", () => {
      const url = new URL("http://localhost:4321/about");
      expect(extractArticleSlug(url)).toBeNull();
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
      });
    });

    it("should analyze non-article page context", () => {
      const url = new URL("http://localhost:4321/about");
      const context = analyzeLanguageContextPure(url);

      expect(context).toMatchObject({
        isArticlePage: false,
        detectedLang: "en",
      });
    });

    it("should handle article page without blog posts data", () => {
      const url = new URL("http://localhost:4321/blog/en/some-article");
      const context = analyzeLanguageContextPure(url);

      expect(context).toMatchObject({
        isArticlePage: true,
        detectedLang: "en",
        articleSlug: "some-article",
      });
      expect(context.translationMapping).toBeUndefined();
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

  describe("Category page detection and mapping", () => {
    describe("isCategoryPage", () => {
      it("should detect English category pages", () => {
        const url = new URL("http://localhost:4321/category/framework");
        expect(isCategoryPage(url)).toBe(true);
      });

      it("should detect French category pages", () => {
        const url = new URL("http://localhost:4321/fr/categorie/langage");
        expect(isCategoryPage(url)).toBe(true);
      });

      it("should not detect non-category pages", () => {
        const url = new URL("http://localhost:4321/blog/en/some-article");
        expect(isCategoryPage(url)).toBe(false);
      });

      it("should not detect home pages", () => {
        const url = new URL("http://localhost:4321/");
        expect(isCategoryPage(url)).toBe(false);
      });
    });

    describe("extractCategoryFromUrl", () => {
      it("should extract category from English URLs", () => {
        const url = new URL("http://localhost:4321/category/framework");
        expect(extractCategoryFromUrl(url)).toBe("framework");
      });

      it("should extract category from French URLs", () => {
        const url = new URL("http://localhost:4321/fr/categorie/langage");
        expect(extractCategoryFromUrl(url)).toBe("langage");
      });

      it("should return null for non-category pages", () => {
        const url = new URL("http://localhost:4321/blog/en/some-article");
        expect(extractCategoryFromUrl(url)).toBe(null);
      });
    });

    describe("detectCategoryLanguage", () => {
      it("should detect English for category pages without language prefix", () => {
        const url = new URL("http://localhost:4321/category/framework");
        expect(detectCategoryLanguage(url)).toBe("en");
      });

      it("should detect French for category pages with fr prefix", () => {
        const url = new URL("http://localhost:4321/fr/categorie/langage");
        expect(detectCategoryLanguage(url)).toBe("fr");
      });

      it("should return null for non-category pages", () => {
        const url = new URL("http://localhost:4321/blog/en/some-article");
        expect(detectCategoryLanguage(url)).toBe(null);
      });
    });

    describe("createCategoryUrlMapping", () => {
      it("should create correct URL mapping for English categories", () => {
        const mapping = createCategoryUrlMapping("language", "en");
        
        expect(mapping).toEqual({
          en: "/category/language",
          fr: "/fr/categorie/langage",
        });
      });

      it("should create correct URL mapping for French categories", () => {
        const mapping = createCategoryUrlMapping("langage", "fr");
        
        expect(mapping).toEqual({
          en: "/category/language",
          fr: "/fr/categorie/langage",
        });
      });

      it("should handle framework category (same in both languages)", () => {
        const mapping = createCategoryUrlMapping("framework", "en");
        
        expect(mapping).toEqual({
          en: "/category/framework",
          fr: "/fr/categorie/framework",
        });
      });

      it("should handle style/styling difference", () => {
        const mappingFromEn = createCategoryUrlMapping("styling", "en");
        expect(mappingFromEn).toEqual({
          en: "/category/styling",
          fr: "/fr/categorie/style",
        });

        const mappingFromFr = createCategoryUrlMapping("style", "fr");
        expect(mappingFromFr).toEqual({
          en: "/category/styling",
          fr: "/fr/categorie/style",
        });
      });

      it("should return null for unknown categories", () => {
        const mapping = createCategoryUrlMapping("unknown-category", "en");
        expect(mapping).toBe(null);
      });
    });
  });

  describe("analyzeLanguageContextPure with categories", () => {
    it("should correctly analyze English category context", () => {
      const url = new URL("http://localhost:4321/category/framework");
      const context = analyzeLanguageContextPure(url);

      expect(context.isArticlePage).toBe(false);
      expect(context.isCategoryPage).toBe(true);
      expect(context.detectedLang).toBe("en");
      expect(context.categorySlug).toBe("framework");
      expect(context.categoryUrlMapping).toEqual({
        en: "/category/framework",
        fr: "/fr/categorie/framework",
      });
    });

    it("should correctly analyze French category context", () => {
      const url = new URL("http://localhost:4321/fr/categorie/langage");
      const context = analyzeLanguageContextPure(url);

      expect(context.isArticlePage).toBe(false);
      expect(context.isCategoryPage).toBe(true);
      expect(context.detectedLang).toBe("fr");
      expect(context.categorySlug).toBe("langage");
      expect(context.categoryUrlMapping).toEqual({
        en: "/category/language",
        fr: "/fr/categorie/langage",
      });
    });

    it("should handle normal pages correctly", () => {
      const url = new URL("http://localhost:4321/about");
      const context = analyzeLanguageContextPure(url);

      expect(context.isArticlePage).toBe(false);
      expect(context.isCategoryPage).toBe(false);
      expect(context.detectedLang).toBe("en");
      expect(context.categorySlug).toBeUndefined();
      expect(context.categoryUrlMapping).toBeUndefined();
    });
  });
});
