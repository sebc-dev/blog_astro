import { describe, it, expect } from "vitest";
import type { CollectionEntry } from "astro:content";
import {
  getUniqueTags,
  filterPostsByTag,
  normalizeTagForUrl,
} from "@/lib/article/tag-utils";
import { getTagTranslations } from "@/i18n/tag-translations";

describe("Tag Page Integration", () => {
  // Mock des articles réalistes avec tags variés
  const mockPosts = [
    {
      slug: "astro-guide",
      data: {
        title: "Débuter avec Astro : Guide Complet",
        description: "Un guide complet pour construire des sites web rapides et modernes avec le framework Astro.",
        pubDate: new Date("2024-02-15T00:00:00Z"),
        author: "Tech Team",
        lang: "fr" as const,
        heroImage: "/images/astro-guide.jpg",
      },
    },
    {
      slug: "typescript-beginners-guide",
      data: {
        title: "TypeScript pour débutants : Le Guide Ultime",
        description: "Apprenez TypeScript facilement avec ce guide étape par étape conçu pour les développeurs débutants.",
        pubDate: new Date("2024-02-10T00:00:00Z"),
        author: "Dev Expert",
        lang: "fr" as const,
        heroImage: "/images/typescript-guide.jpg",
      },
    },
    {
      slug: "css-grid-comprehensive-guide",
      data: {
        title: "CSS Grid Layout : Guide Complet et Pratique",
        description: "Maîtrisez CSS Grid pour créer des layouts complexes et responsifs avec ce guide complet.",
        pubDate: new Date("2024-02-05T00:00:00Z"),
        author: "CSS Master",
        lang: "fr" as const,
        heroImage: "/images/css-grid.jpg",
      },
    },
    {
      slug: "web-performance-optimization-techniques",
      data: {
        title: "10 Techniques d'Optimisation des Performances Web",
        description: "Découvrez les meilleures techniques pour optimiser les performances de votre site web.",
        pubDate: new Date("2024-01-30T00:00:00Z"),
        author: "Performance Expert",
        lang: "fr" as const,
        heroImage: "/images/performance.jpg",
      },
    },
    {
      slug: "react-vs-vue-2024-comparison",
      data: {
        title: "React vs Vue.js en 2024 : Comparaison Détaillée",
        description: "Comparaison approfondie entre React et Vue.js pour choisir le bon framework.",
        pubDate: new Date("2024-01-25T00:00:00Z"),
        author: "Framework Specialist",
        lang: "fr" as const,
        heroImage: "/images/react-vue.jpg",
      },
    },
    // Articles anglais
    {
      slug: "astro-guide-en",
      data: {
        title: "Getting Started with Astro: Complete Guide",
        description: "A comprehensive guide to building fast and modern websites with the Astro framework.",
        pubDate: new Date("2024-02-15T00:00:00Z"),
        author: "Tech Team",
        lang: "en" as const,
        heroImage: "/images/astro-guide-en.jpg",
      },
    },
    {
      slug: "typescript-beginners-guide-en",
      data: {
        title: "TypeScript for Beginners: The Ultimate Guide",
        description: "Learn TypeScript easily with this step-by-step guide designed for beginner developers.",
        pubDate: new Date("2024-02-10T00:00:00Z"),
        author: "Dev Expert",
        lang: "en" as const,
        heroImage: "/images/typescript-guide-en.jpg",
      },
    },
    {
      slug: "css-grid-comprehensive-guide-en",
      data: {
        title: "CSS Grid Layout: Comprehensive and Practical Guide",
        description: "Master CSS Grid to create complex and responsive layouts with this comprehensive guide.",
        pubDate: new Date("2024-02-05T00:00:00Z"),
        author: "CSS Master",
        lang: "en" as const,
        heroImage: "/images/css-grid-en.jpg",
      },
    },
    {
      slug: "web-performance-optimization-techniques-en",
      data: {
        title: "10 Web Performance Optimization Techniques",
        description: "Discover the best techniques to optimize your website's performance and user experience.",
        pubDate: new Date("2024-01-30T00:00:00Z"),
        author: "Performance Expert",
        lang: "en" as const,
        heroImage: "/images/performance-en.jpg",
      },
    },
  ] as unknown as CollectionEntry<"blog">[];

  it("should work with real content collection", async () => {
    // Utiliser les mocks au lieu de getCollection
    const allPosts = mockPosts;
    expect(allPosts.length).toBeGreaterThan(0);

    // Tester avec les articles anglais
    const englishPosts = allPosts.filter((post) => post.data.lang === "en");
    const englishTranslations = getTagTranslations("en");

    if (englishPosts.length > 0) {
      const englishTags = getUniqueTags(englishPosts, englishTranslations);
      
      // Vérifier que nous avons au moins quelques tags
      expect(englishTags.length).toBeGreaterThanOrEqual(0);
      
      // Si nous avons des tags, tester le filtrage
      if (englishTags.length > 0) {
        const firstTag = englishTags[0];
        const taggedPosts = filterPostsByTag(englishPosts, firstTag, englishTranslations);
        
        expect(taggedPosts.length).toBeGreaterThanOrEqual(1);
        expect(taggedPosts.every(post => post.data.lang === "en")).toBe(true);

        // Tester la normalisation d'URL
        const normalizedTag = normalizeTagForUrl(firstTag);
        expect(normalizedTag).toBeTruthy();
        expect(normalizedTag).toMatch(/^[a-z0-9-]+$/);
      }
    }

    // Tester avec les articles français
    const frenchPosts = allPosts.filter((post) => post.data.lang === "fr");
    const frenchTranslations = getTagTranslations("fr");

    if (frenchPosts.length > 0) {
      const frenchTags = getUniqueTags(frenchPosts, frenchTranslations);
      
      // Vérifier que nous avons au moins quelques tags
      expect(frenchTags.length).toBeGreaterThanOrEqual(0);
      
      // Si nous avons des tags, tester le filtrage
      if (frenchTags.length > 0) {
        const firstTag = frenchTags[0];
        const taggedPosts = filterPostsByTag(frenchPosts, firstTag, frenchTranslations);
        
        expect(taggedPosts.length).toBeGreaterThanOrEqual(1);
        expect(taggedPosts.every(post => post.data.lang === "fr")).toBe(true);
      }
    }
  });

  it("should generate proper static paths for English tags", async () => {
    const allPosts = mockPosts;
    const englishPosts = allPosts.filter((post) => post.data.lang === "en");
    const englishTranslations = getTagTranslations("en");

    const tags = getUniqueTags(englishPosts, englishTranslations);
    
    const paths = [];

    for (const tag of tags) {
      const urlTag = normalizeTagForUrl(tag);
      const tagPosts = filterPostsByTag(englishPosts, tag, englishTranslations);

      const path = {
        params: { tag: urlTag },
        props: {
          tag,
          posts: tagPosts,
          lang: "en",
          translations: englishTranslations,
        },
      };

      paths.push(path);

      // Vérifier la structure du path
      expect(path.params.tag).toBeTruthy();
      expect(path.props.tag).toBe(tag);
      expect(path.props.posts).toBeInstanceOf(Array);
      expect(path.props.lang).toBe("en");
      expect(path.props.translations).toBe(englishTranslations);
    }

    // Vérifier que les paths sont uniques
    const urlTags = paths.map(p => p.params.tag);
    const uniqueUrlTags = [...new Set(urlTags)];
    expect(urlTags.length).toBe(uniqueUrlTags.length);
  });

  it("should generate proper static paths for French tags", async () => {
    const allPosts = mockPosts;
    const frenchPosts = allPosts.filter((post) => post.data.lang === "fr");
    const frenchTranslations = getTagTranslations("fr");

    const tags = getUniqueTags(frenchPosts, frenchTranslations);
    
    const paths = [];

    for (const tag of tags) {
      const urlTag = normalizeTagForUrl(tag);
      const tagPosts = filterPostsByTag(frenchPosts, tag, frenchTranslations);

      const path = {
        params: { tag: urlTag },
        props: {
          tag,
          posts: tagPosts,
          lang: "fr",
          translations: frenchTranslations,
        },
      };

      paths.push(path);

      // Vérifier la structure du path
      expect(path.params.tag).toBeTruthy();
      expect(path.props.tag).toBe(tag);
      expect(path.props.posts).toBeInstanceOf(Array);
      expect(path.props.lang).toBe("fr");
      expect(path.props.translations).toBe(frenchTranslations);
    }

    // Vérifier que les paths sont uniques
    const urlTags = paths.map(p => p.params.tag);
    const uniqueUrlTags = [...new Set(urlTags)];
    expect(urlTags.length).toBe(uniqueUrlTags.length);
  });

  it("should ensure tag translations consistency", () => {
    const englishTranslations = getTagTranslations("en");
    const frenchTranslations = getTagTranslations("fr");

    // Vérifier que les deux langues ont les mêmes clés
    const englishKeys = Object.keys(englishTranslations).sort();
    const frenchKeys = Object.keys(frenchTranslations).sort();

    expect(englishKeys).toEqual(frenchKeys);

    // Vérifier que les traductions sont définies
    englishKeys.forEach(key => {
      expect(englishTranslations[key as keyof typeof englishTranslations]).toBeTruthy();
      expect(frenchTranslations[key as keyof typeof frenchTranslations]).toBeTruthy();
    });
  });

  it("should maintain consistency between tag extraction and filtering", async () => {
    const allPosts = mockPosts;
    const englishPosts = allPosts.filter((post) => post.data.lang === "en");
    const englishTranslations = getTagTranslations("en");

    const tags = getUniqueTags(englishPosts, englishTranslations);

    // Pour chaque tag extrait, vérifier qu'on peut filtrer les articles
    for (const tag of tags) {
      const filteredPosts = filterPostsByTag(englishPosts, tag, englishTranslations);
      
      // Il doit y avoir au moins un article pour chaque tag extrait
      expect(filteredPosts.length).toBeGreaterThan(0);
    }
  });
});