import { describe, it, expect } from "vitest";
import {
  getUniqueCategories,
  filterPostsByCategory,
  normalizeCategoryForUrl,
  denormalizeCategoryFromUrl,
  sortPosts,
  type CategoryTranslations,
} from "../../lib/category-utils";
import type { CollectionEntry } from "astro:content";

describe("Category Page Logic", () => {
  // Mock des données d'articles pour tester
  const mockPosts = [
    {
      slug: "guide-astro",
      collection: "blog",
      data: {
        title: "Guide Astro : Framework Moderne",
        description: "Un guide complet pour Astro framework",
        pubDate: new Date("2024-01-20T00:00:00Z"),
        lang: "fr" as const,
        translationId: "123e4567-e89b-12d3-a456-426614174000",
        canonicalSlug: "guide-astro",
      },
      id: "fr/guide-astro.mdx",
      render: async () => ({
        Content: () => null,
        headings: [],
        remarkPluginFrontmatter: {},
      }),
    },
    {
      slug: "typescript-pour-debutants",
      collection: "blog",
      data: {
        title: "TypeScript pour Débutants",
        description: "Apprenez TypeScript facilement",
        pubDate: new Date("2024-01-15T00:00:00Z"),
        lang: "fr" as const,
        translationId: "223e4567-e89b-12d3-a456-426614174001",
        canonicalSlug: "typescript-pour-debutants",
      },
      id: "fr/typescript-pour-debutants.mdx",
      render: async () => ({
        Content: () => null,
        headings: [],
        remarkPluginFrontmatter: {},
      }),
    },
    {
      slug: "css-grid-layout-guide",
      collection: "blog",
      data: {
        title: "CSS Grid Layout Guide",
        description: "Maîtrisez CSS Grid pour créer des layouts",
        pubDate: new Date("2024-01-10T00:00:00Z"),
        lang: "fr" as const,
        translationId: "323e4567-e89b-12d3-a456-426614174002",
        canonicalSlug: "css-grid-layout-guide",
      },
      id: "fr/css-grid-layout-guide.mdx",
      render: async () => ({
        Content: () => null,
        headings: [],
        remarkPluginFrontmatter: {},
      }),
    },
    {
      slug: "api-rest-bonnes-pratiques",
      collection: "blog",
      data: {
        title: "API REST : Bonnes Pratiques",
        description: "Techniques avancées pour les API REST",
        pubDate: new Date("2024-01-05T00:00:00Z"),
        lang: "fr" as const,
        translationId: "423e4567-e89b-12d3-a456-426614174003",
        canonicalSlug: "api-rest-bonnes-pratiques",
      },
      id: "fr/api-rest-bonnes-pratiques.mdx",
      render: async () => ({
        Content: () => null,
        headings: [],
        remarkPluginFrontmatter: {},
      }),
    },
  ] as unknown as CollectionEntry<"blog">[];

  const translations: CategoryTranslations = {
    framework: "Framework",
    language: "Langage",
    performance: "Performance",
    styling: "Style",
    backend: "Backend",
    article: "Article",
  };

  describe("Category Utils", () => {
    it("should extract unique categories from posts", () => {
      const categories = getUniqueCategories(mockPosts, translations);

      expect(categories).toContain("Framework"); // guide-astro
      expect(categories).toContain("Langage"); // typescript
      expect(categories).toContain("Style"); // css-grid
      expect(categories).toContain("Backend"); // api-rest
      expect(categories.length).toBeGreaterThan(0);
    });

    it("should filter posts by category correctly", () => {
      const frameworkPosts = filterPostsByCategory(
        mockPosts,
        "Framework",
        translations,
      );
      const languagePosts = filterPostsByCategory(
        mockPosts,
        "Langage",
        translations,
      );
      const stylingPosts = filterPostsByCategory(
        mockPosts,
        "Style",
        translations,
      );
      const backendPosts = filterPostsByCategory(
        mockPosts,
        "Backend",
        translations,
      );

      expect(frameworkPosts).toHaveLength(1);
      expect(frameworkPosts[0].slug).toBe("guide-astro");

      expect(languagePosts).toHaveLength(1);
      expect(languagePosts[0].slug).toBe("typescript-pour-debutants");

      expect(stylingPosts).toHaveLength(1);
      expect(stylingPosts[0].slug).toBe("css-grid-layout-guide");

      expect(backendPosts).toHaveLength(1);
      expect(backendPosts[0].slug).toBe("api-rest-bonnes-pratiques");
    });

    it("should normalize category names for URLs", () => {
      expect(normalizeCategoryForUrl("Framework")).toBe("framework");
      expect(normalizeCategoryForUrl("Best Practices")).toBe("best-practices");
      expect(normalizeCategoryForUrl("CSS & Styling")).toBe("css-styling");
      expect(normalizeCategoryForUrl("API/Backend")).toBe("api-backend");
    });

    it("should denormalize category names from URLs", () => {
      const availableCategories = [
        "Framework",
        "Best Practices",
        "CSS & Styling",
      ];

      expect(denormalizeCategoryFromUrl("framework", availableCategories)).toBe(
        "Framework",
      );
      expect(
        denormalizeCategoryFromUrl("best-practices", availableCategories),
      ).toBe("Best Practices");
      expect(
        denormalizeCategoryFromUrl("css-styling", availableCategories),
      ).toBe("CSS & Styling");
      expect(
        denormalizeCategoryFromUrl("nonexistent", availableCategories),
      ).toBeNull();
    });
  });

  describe("Sorting Functions", () => {
    it("should sort posts by date descending (default)", () => {
      const sorted = sortPosts(mockPosts, "date-desc", "fr");

      expect(sorted[0].slug).toBe("guide-astro"); // 2024-01-20
      expect(sorted[1].slug).toBe("typescript-pour-debutants"); // 2024-01-15
      expect(sorted[2].slug).toBe("css-grid-layout-guide"); // 2024-01-10
      expect(sorted[3].slug).toBe("api-rest-bonnes-pratiques"); // 2024-01-05
    });

    it("should sort posts by date ascending", () => {
      const sorted = sortPosts(mockPosts, "date-asc", "fr");

      expect(sorted[0].slug).toBe("api-rest-bonnes-pratiques"); // 2024-01-05
      expect(sorted[1].slug).toBe("css-grid-layout-guide"); // 2024-01-10
      expect(sorted[2].slug).toBe("typescript-pour-debutants"); // 2024-01-15
      expect(sorted[3].slug).toBe("guide-astro"); // 2024-01-20
    });

    it("should sort posts by title ascending", () => {
      const sorted = sortPosts(mockPosts, "title-asc", "fr");

      // Ordre alphabétique : API, CSS, Guide, TypeScript
      expect(sorted[0].data.title).toBe("API REST : Bonnes Pratiques");
      expect(sorted[1].data.title).toBe("CSS Grid Layout Guide");
      expect(sorted[2].data.title).toBe("Guide Astro : Framework Moderne");
      expect(sorted[3].data.title).toBe("TypeScript pour Débutants");
    });

    it("should sort posts by title descending", () => {
      const sorted = sortPosts(mockPosts, "title-desc", "fr");

      // Ordre alphabétique inversé : TypeScript, Guide, CSS, API
      expect(sorted[0].data.title).toBe("TypeScript pour Débutants");
      expect(sorted[1].data.title).toBe("Guide Astro : Framework Moderne");
      expect(sorted[2].data.title).toBe("CSS Grid Layout Guide");
      expect(sorted[3].data.title).toBe("API REST : Bonnes Pratiques");
    });

    it("should sort posts by reading time", () => {
      // Test avec debug pour comprendre les temps de lecture
      const sortedAsc = sortPosts(mockPosts, "reading-time-asc", "fr");
      const sortedDesc = sortPosts(mockPosts, "reading-time-desc", "fr");

      // Debug: calculer les temps de lecture pour chaque article
      const readingTimes = mockPosts.map((post) => {
        const wordsPerMinute = 200;
        const descWords = post.data.description.split(/\s+/).length;
        let estimatedWords = descWords * 15;

        const slug = post.slug;
        const title = post.data.title.toLowerCase();

        if (slug.includes("guide") || title.includes("guide")) {
          estimatedWords *= 2.5;
        } else if (slug.includes("vs") || title.includes("vs")) {
          estimatedWords *= 1.8;
        } else if (slug.includes("api") || title.includes("api")) {
          estimatedWords *= 2.2;
        } else if (
          title.includes("techniques") ||
          title.includes("optimisation") ||
          title.includes("optimization")
        ) {
          estimatedWords *= 2.0;
        }

        return {
          slug: post.slug,
          descWords,
          estimatedWords,
          readingTime: Math.max(1, Math.ceil(estimatedWords / wordsPerMinute)),
        };
      });

      // Vérifier que le tri fonctionne - les temps de lecture doivent être ordonnés
      const readingTimesAsc = sortedAsc.map((post) => {
        const rt = readingTimes.find((r) => r.slug === post.slug);
        return rt?.readingTime || 0;
      });

      const readingTimesDesc = sortedDesc.map((post) => {
        const rt = readingTimes.find((r) => r.slug === post.slug);
        return rt?.readingTime || 0;
      });

      // Vérifier que l'ordre ascendant est croissant
      for (let i = 1; i < readingTimesAsc.length; i++) {
        expect(readingTimesAsc[i]).toBeGreaterThanOrEqual(
          readingTimesAsc[i - 1],
        );
      }

      // Vérifier que l'ordre descendant est décroissant
      for (let i = 1; i < readingTimesDesc.length; i++) {
        expect(readingTimesDesc[i]).toBeLessThanOrEqual(
          readingTimesDesc[i - 1],
        );
      }

      // Vérifier que les deux tris ne sont pas identiques (sauf cas particulier d'égalité parfaite)
      expect(sortedAsc).not.toEqual(sortedDesc);
    });
  });

  describe("Static Path Generation Logic", () => {
    it("should generate paths for all categories and languages", () => {
      const allPosts = [
        ...mockPosts,
        // Ajouter quelques articles en anglais
        {
          ...mockPosts[0],
          slug: "astro-guide",
          data: {
            ...mockPosts[0].data,
            lang: "en" as const,
            title: "Astro Guide",
          },
        },
        {
          ...mockPosts[1],
          slug: "typescript-beginners",
          data: {
            ...mockPosts[1].data,
            lang: "en" as const,
            title: "TypeScript for Beginners",
          },
        },
      ] as CollectionEntry<"blog">[];

      // Simuler la logique de getStaticPaths
      const paths = [];
      for (const lang of ["en", "fr"]) {
        const postsInLang = allPosts.filter((post) => post.data.lang === lang);
        const langTranslations: CategoryTranslations = {
          framework: lang === "fr" ? "Framework" : "Framework",
          language: lang === "fr" ? "Langage" : "Language",
          performance: lang === "fr" ? "Performance" : "Performance",
          styling: lang === "fr" ? "Style" : "Styling",
          backend: lang === "fr" ? "Backend" : "Backend",
          article: lang === "fr" ? "Article" : "Article",
        };

        const categories = getUniqueCategories(postsInLang, langTranslations);

        for (const category of categories) {
          const urlCategory = normalizeCategoryForUrl(category);
          const categoryPosts = filterPostsByCategory(
            postsInLang,
            category,
            langTranslations,
          );

          paths.push({
            params: { category: urlCategory },
            props: {
              category,
              posts: categoryPosts,
              lang,
              translations: langTranslations,
            },
          });
        }
      }

      expect(paths.length).toBeGreaterThan(0);
      expect(paths.some((p) => p.props.lang === "fr")).toBe(true);
      expect(paths.some((p) => p.props.lang === "en")).toBe(true);

      // Vérifier qu'on a des paths pour différentes catégories
      const categories = paths.map((p) => p.props.category);
      expect(categories).toContain("Framework");
      expect(categories).toContain("Langage");
      expect(categories).toContain("Language");
    });

    it("should ensure each path has the correct structure", () => {
      const categories = getUniqueCategories(mockPosts, translations);

      for (const category of categories) {
        const urlCategory = normalizeCategoryForUrl(category);
        const categoryPosts = filterPostsByCategory(
          mockPosts,
          category,
          translations,
        );

        const path = {
          params: { category: urlCategory },
          props: { category, posts: categoryPosts, lang: "fr", translations },
        };

        // Vérifier la structure du path
        expect(path.params).toHaveProperty("category");
        expect(path.props).toHaveProperty("category");
        expect(path.props).toHaveProperty("posts");
        expect(path.props).toHaveProperty("lang");
        expect(path.props).toHaveProperty("translations");

        // Vérifier que les posts appartiennent bien à la catégorie
        path.props.posts.forEach((post: CollectionEntry<"blog">) => {
          const postCategory = getUniqueCategories([post], translations);
          expect(postCategory).toContain(category);
        });
      }
    });
  });
});
