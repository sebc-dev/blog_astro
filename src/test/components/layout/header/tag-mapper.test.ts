import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TagMapper } from "@/components/layout/header/page-mappers/tag-mapper";
import type { TagPageInfo, PageInfo } from "@/components/layout/header/page-detectors/types";
import type { TagTranslations } from "@/lib/article/tag-utils";

// Mock the tag-translations module
vi.mock("@/i18n/tag-translations", () => ({
  getTagTranslations: vi.fn(),
}));

// Mock the tag-utils module
vi.mock("@/lib/article/tag-utils", () => ({
  normalizeTagForUrl: vi.fn((tag: string) => tag.toLowerCase().replace(/\s+/g, "-")),
}));

import { getTagTranslations } from "@/i18n/tag-translations";
import { normalizeTagForUrl } from "@/lib/article/tag-utils";

const mockGetTagTranslations = vi.mocked(getTagTranslations);
const mockNormalizeTagForUrl = vi.mocked(normalizeTagForUrl);

describe("TagMapper", () => {
  let mapper: TagMapper;

  beforeEach(() => {
    mapper = new TagMapper();
    vi.clearAllMocks();
    
    // Setup default mock behavior
    mockNormalizeTagForUrl.mockImplementation((tag: string) => 
      tag.toLowerCase().replace(/\s+/g, "-")
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createUrlMapping with symmetric translations", () => {
    beforeEach(() => {
      mockGetTagTranslations.mockImplementation((lang: "en" | "fr") => {
        if (lang === "en") {
          return {
            guide: "Guide",
            optimization: "Optimization",
            bestPractices: "Best Practices",
            comparison: "Comparison",
          };
        } else {
          return {
            guide: "Guide",
            optimization: "Optimisation", 
            bestPractices: "Bonnes Pratiques",
            comparison: "Comparaison",
          };
        }
      });
    });

    it("should create correct URL mapping for English tag", () => {
      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "en",
        tag: "Optimization",
      };

      const result = mapper.createUrlMapping(pageInfo);

      expect(result).toEqual({
        en: "/tag/optimization",
        fr: "/fr/tag/optimisation",
      });
    });

    it("should create correct URL mapping for French tag", () => {
      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "fr",
        tag: "Bonnes Pratiques",
      };

      const result = mapper.createUrlMapping(pageInfo);

      expect(result).toEqual({
        en: "/tag/best-practices",
        fr: "/fr/tag/bonnes-pratiques",
      });
    });
  });

  describe("createUrlMapping with asymmetric translations (bug fix validation)", () => {
    it("should handle case where key exists only in French translations", () => {
      mockGetTagTranslations.mockImplementation((lang: "en" | "fr") => {
        if (lang === "en") {
          return {
            guide: "Guide",
            optimization: "Optimization",
            bestPractices: "Best Practices",
            // comparison missing in English
          } as Record<string, string>;
        } else {
          return {
            guide: "Guide",
            optimization: "Optimisation",
            bestPractices: "Bonnes Pratiques",
            comparison: "Comparaison",
            onlyInFrench: "Seulement en Français", // Key only in French
          } as Record<string, string>;
        }
      });

      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "fr",
        tag: "Seulement en Français",
      };

      const result = mapper.createUrlMapping(pageInfo);

      // Should fall back to normalized version since no English equivalent
      expect(result).toEqual({
        en: "/tag/seulement-en-français",
        fr: "/fr/tag/seulement-en-français",
      });
    });

    it("should handle case where key exists only in English translations", () => {
      mockGetTagTranslations.mockImplementation((lang: "en" | "fr") => {
        if (lang === "en") {
          return {
            guide: "Guide",
            optimization: "Optimization",
            bestPractices: "Best Practices",
            onlyInEnglish: "Only in English", // Key only in English
          } as Record<string, string>;
        } else {
          return {
            guide: "Guide",
            optimization: "Optimisation",
            bestPractices: "Bonnes Pratiques",
            // onlyInEnglish missing in French
          } as Record<string, string>;
        }
      });

      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "en",
        tag: "Only in English",
      };

      const result = mapper.createUrlMapping(pageInfo);

      // Should fall back to normalized version since no French equivalent
      expect(result).toEqual({
        en: "/tag/only-in-english",
        fr: "/fr/tag/only-in-english",
      });
    });

    it("should handle case where value exists but corresponding translation is undefined", () => {
      mockGetTagTranslations.mockImplementation((lang: "en" | "fr") => {
        if (lang === "en") {
          return {
            guide: "Guide",
            optimization: "Optimization",
            partialKey: "English Value",
          } as Record<string, string | undefined>;
        } else {
          return {
            guide: "Guide",
            optimization: "Optimisation",
            partialKey: undefined, // Explicitly undefined
          } as Record<string, string | undefined>;
        }
      });

      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "en",
        tag: "English Value",
      };

      const result = mapper.createUrlMapping(pageInfo);

      // Should fall back to normalized version since French value is undefined
      expect(result).toEqual({
        en: "/tag/english-value",
        fr: "/fr/tag/english-value",
      });
    });
  });

  describe("createUrlMapping with completely missing translations", () => {
    beforeEach(() => {
      mockGetTagTranslations.mockImplementation((lang: "en" | "fr") => {
        if (lang === "en") {
          return {
            guide: "Guide",
            optimization: "Optimization",
            bestPractices: "Best Practices",
            comparison: "Comparison",
          };
        } else {
          return {
            guide: "Guide", 
            optimization: "Optimisation",
            bestPractices: "Bonnes Pratiques",
            comparison: "Comparaison",
          };
        }
      });
    });

    it("should use fallback for unknown tag", () => {
      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "en",
        tag: "Unknown Tag",
      };

      const result = mapper.createUrlMapping(pageInfo);

      expect(result).toEqual({
        en: "/tag/unknown-tag",
        fr: "/fr/tag/unknown-tag",
      });
    });
  });

  describe("createUrlMapping edge cases", () => {
    it("should return null for non-tag page info", () => {
      const pageInfo = {
        pageType: "article",
        detectedLang: "en",
      } as PageInfo;

      const result = mapper.createUrlMapping(pageInfo);

      expect(result).toBeNull();
    });

    it("should have correct pageType", () => {
      expect(mapper.pageType).toBe("tag");
    });
  });

  describe("production environment behavior", () => {
    it("should not log warnings in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      mockGetTagTranslations.mockImplementation(() => ({
        guide: "Guide",
        optimization: "Optimization", 
        bestPractices: "Best Practices",
        comparison: "Comparison",
      }));

      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "en",
        tag: "Unknown Tag",
      };

      mapper.createUrlMapping(pageInfo);

      expect(consoleSpy).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should log warnings in non-production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      mockGetTagTranslations.mockImplementation(() => ({
        guide: "Guide",
        optimization: "Optimization",
        bestPractices: "Best Practices", 
        comparison: "Comparison",
      }));

      const pageInfo: TagPageInfo = {
        pageType: "tag",
        detectedLang: "en",
        tag: "Unknown Tag",
      };

      mapper.createUrlMapping(pageInfo);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Tag "Unknown Tag" not found in translations, using normalized version'
      );
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
}); 