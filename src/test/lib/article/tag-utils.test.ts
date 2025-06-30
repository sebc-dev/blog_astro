import { describe, it, expect } from "vitest";
import type { CollectionEntry } from "astro:content";
import {
  getUniqueTags,
  filterPostsByTag,
  normalizeTagForUrl,
  denormalizeTagFromUrl,
  type TagTranslations,
} from "@/lib/article/tag-utils";

// Interface simplifiée pour les tests (correspondant aux besoins réels des fonctions)
interface TestPost {
  slug: string;
  data: {
    title: string;
    description: string;
  };
}

// Type assertion helper pour contourner la vérification TypeScript stricte
function asTestPosts(posts: TestPost[]): CollectionEntry<"blog">[] {
  return posts as unknown as CollectionEntry<"blog">[];
}

// Mock translations pour les tests
const mockTagTranslations: TagTranslations = {
  guide: "Guide",
  optimization: "Optimization",
  bestPractices: "Best Practices",
  comparison: "Comparison",
};

const mockTagTranslationsFr: TagTranslations = {
  guide: "Guide",
  optimization: "Optimisation",
  bestPractices: "Bonnes Pratiques",
  comparison: "Comparaison",
};

// Mock posts pour les tests
const createMockPost = (
  title: string,
  description: string,
  slug: string,
): TestPost => ({
  slug,
  data: {
    title,
    description,
  },
});

const mockPosts: TestPost[] = [
  createMockPost("Getting Started Guide", "A beginner's guide to web development", "getting-started-guide"),
  createMockPost("Performance vs Speed", "Comparing performance metrics", "performance-vs-speed"),
  createMockPost("Best Practices for React", "Essential practices for React development", "best-practices-react"),
  createMockPost("API Optimization Tips", "How to optimize your API calls", "api-optimization-tips"),
  createMockPost("Regular Article", "Just a regular article", "regular-article"),
];

describe("getUniqueTags", () => {
  it("should extract unique tags from posts", () => {
    const tags = getUniqueTags(asTestPosts(mockPosts), mockTagTranslations);
    
    expect(tags).toContain("Guide");
    expect(tags).toContain("Comparison");
    expect(tags).toContain("Best Practices");
    expect(tags).toContain("Optimization");
    expect(tags).toHaveLength(4);
  });

  it("should return sorted tags", () => {
    const tags = getUniqueTags(asTestPosts(mockPosts), mockTagTranslations);
    
    expect(tags).toEqual(["Best Practices", "Comparison", "Guide", "Optimization"]);
  });

  it("should work with French translations", () => {
    const tags = getUniqueTags(asTestPosts(mockPosts), mockTagTranslationsFr);
    
    expect(tags).toContain("Guide");
    expect(tags).toContain("Comparaison");
    expect(tags).toContain("Bonnes Pratiques");
    expect(tags).toContain("Optimisation");
  });

  it("should handle empty posts array", () => {
    const tags = getUniqueTags(asTestPosts([]), mockTagTranslations);
    
    expect(tags).toEqual([]);
  });
});

describe("filterPostsByTag", () => {
  it("should filter posts by Guide tag", () => {
    const filteredPosts = filterPostsByTag(asTestPosts(mockPosts), "Guide", mockTagTranslations);
    
    expect(filteredPosts).toHaveLength(1);
    expect(filteredPosts[0].data.title).toBe("Getting Started Guide");
  });

  it("should filter posts by Comparison tag", () => {
    const filteredPosts = filterPostsByTag(asTestPosts(mockPosts), "Comparison", mockTagTranslations);
    
    expect(filteredPosts).toHaveLength(1);
    expect(filteredPosts[0].data.title).toBe("Performance vs Speed");
  });

  it("should filter posts by Best Practices tag", () => {
    const filteredPosts = filterPostsByTag(asTestPosts(mockPosts), "Best Practices", mockTagTranslations);
    
    expect(filteredPosts).toHaveLength(1);
    expect(filteredPosts[0].data.title).toBe("Best Practices for React");
  });

  it("should filter posts by Optimization tag", () => {
    const filteredPosts = filterPostsByTag(asTestPosts(mockPosts), "Optimization", mockTagTranslations);
    
    expect(filteredPosts).toHaveLength(1);
    expect(filteredPosts[0].data.title).toBe("API Optimization Tips");
  });

  it("should return empty array for non-existent tag", () => {
    const filteredPosts = filterPostsByTag(asTestPosts(mockPosts), "Non-existent", mockTagTranslations);
    
    expect(filteredPosts).toEqual([]);
  });

  it("should work with French translations", () => {
    const filteredPosts = filterPostsByTag(asTestPosts(mockPosts), "Optimisation", mockTagTranslationsFr);
    
    expect(filteredPosts).toHaveLength(1);
    expect(filteredPosts[0].data.title).toBe("API Optimization Tips");
  });
});

describe("normalizeTagForUrl", () => {
  it("should normalize simple tag names", () => {
    expect(normalizeTagForUrl("Guide")).toBe("guide");
    expect(normalizeTagForUrl("Optimization")).toBe("optimization");
  });

  it("should handle tags with spaces", () => {
    expect(normalizeTagForUrl("Best Practices")).toBe("best-practices");
    expect(normalizeTagForUrl("Code Review")).toBe("code-review");
  });

  it("should handle special characters", () => {
    expect(normalizeTagForUrl("React & Vue")).toBe("react-vue");
    expect(normalizeTagForUrl("Front/Back-end")).toBe("front-back-end");
  });

  it("should handle accented characters", () => {
    expect(normalizeTagForUrl("Optimisation")).toBe("optimisation");
    expect(normalizeTagForUrl("Développement")).toBe("dveloppement");
  });

  it("should normalize French special characters with accents", () => {
    // Note: Current implementation removes accented characters entirely
    // This documents the current behavior for French special characters
    
    // Test various acute accents (é) - accents are removed
    expect(normalizeTagForUrl("Développé")).toBe("dvelopp");
    expect(normalizeTagForUrl("Créé")).toBe("cr");
    expect(normalizeTagForUrl("Généré")).toBe("gnr");
    
    // Test grave accents (è, à) - accents are removed
    expect(normalizeTagForUrl("Système")).toBe("systme");
    expect(normalizeTagForUrl("Modèle")).toBe("modle");
    expect(normalizeTagForUrl("À propos")).toBe("propos");
    
    // Test circumflex accents (ê, ô, â, î, û) - accents are removed
    expect(normalizeTagForUrl("Être")).toBe("tre");
    expect(normalizeTagForUrl("Contrôle")).toBe("contrle");
    expect(normalizeTagForUrl("Prêt")).toBe("prt");
    expect(normalizeTagForUrl("Maître")).toBe("matre");
    expect(normalizeTagForUrl("Sûr")).toBe("sr");
    
    // Test cedilla (ç) - cedilla is removed
    expect(normalizeTagForUrl("Français")).toBe("franais");
    expect(normalizeTagForUrl("Leçon")).toBe("leon");
    expect(normalizeTagForUrl("Façon")).toBe("faon");
    
    // Test dieresis/umlaut (ë, ï, ü) - diacritics are removed
    expect(normalizeTagForUrl("Noël")).toBe("nol");
    expect(normalizeTagForUrl("Naïf")).toBe("naf");
    expect(normalizeTagForUrl("Müller")).toBe("mller");
    
    // Test combinations of accents in same word - all accents removed
    expect(normalizeTagForUrl("Créée")).toBe("cre");
    expect(normalizeTagForUrl("Événement")).toBe("vnement");
    expect(normalizeTagForUrl("Spécialité")).toBe("spcialit");
    
    // Test mixed case with accents - lowercase with accents removed
    expect(normalizeTagForUrl("DéveloppeMENT Avancé")).toBe("dveloppement-avanc");
    expect(normalizeTagForUrl("Méthode TRÈS Efficace")).toBe("mthode-trs-efficace");
  });

  it("should handle multiple consecutive spaces and special chars", () => {
    expect(normalizeTagForUrl("  Multiple   Spaces  ")).toBe("multiple-spaces");
    expect(normalizeTagForUrl("Test---Tag")).toBe("test-tag");
  });

  it("should handle empty or invalid input", () => {
    expect(normalizeTagForUrl("")).toBe("");
    expect(normalizeTagForUrl("   ")).toBe("");
    expect(normalizeTagForUrl("---")).toBe("");
  });
});

describe("denormalizeTagFromUrl", () => {
  const availableTags = ["Guide", "Optimization", "Best Practices", "Comparison"];

  it("should denormalize valid tag URLs", () => {
    expect(denormalizeTagFromUrl("guide", availableTags)).toBe("Guide");
    expect(denormalizeTagFromUrl("optimization", availableTags)).toBe("Optimization");
    expect(denormalizeTagFromUrl("best-practices", availableTags)).toBe("Best Practices");
    expect(denormalizeTagFromUrl("comparison", availableTags)).toBe("Comparison");
  });

  it("should handle case insensitive matching", () => {
    expect(denormalizeTagFromUrl("GUIDE", availableTags)).toBe("Guide");
    expect(denormalizeTagFromUrl("OPTIMIZATION", availableTags)).toBe("Optimization");
  });

  it("should return null for non-existent tags", () => {
    expect(denormalizeTagFromUrl("non-existent", availableTags)).toBeNull();
    expect(denormalizeTagFromUrl("invalid-tag", availableTags)).toBeNull();
  });

  it("should handle empty input", () => {
    expect(denormalizeTagFromUrl("", availableTags)).toBeNull();
  });

  it("should handle empty available tags", () => {
    expect(denormalizeTagFromUrl("guide", [])).toBeNull();
  });
});