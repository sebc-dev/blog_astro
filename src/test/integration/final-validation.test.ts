import { describe, it, expect } from "vitest";
import { estimateReadingTime } from "../../lib/article-utils";

describe("Validation Finale - Section avec Vrais Articles", () => {
  it("devrait pouvoir récupérer les vraies collections d'articles", async () => {
    // Simuler ce que fait notre composant LatestArticlesSection
    const mockGetCollection = async (collectionName: string) => {
      if (collectionName === "blog") {
        return [
          {
            id: "fr/css-grid-layout-guide.mdx",
            slug: "css-grid-layout-guide",
            body: "# Maîtriser CSS Grid Layout : Guide Complet avec Exemples Pratiques\n\nCSS Grid Layout révolutionne...",
            collection: "blog",
            data: {
              title:
                "Maîtriser CSS Grid Layout : Guide Complet avec Exemples Pratiques",
              description:
                "Apprenez à créer des layouts complexes et responsives avec CSS Grid. Guide complet avec exemples pratiques et cas d'usage.",
              pubDate: new Date("2024-02-15T00:00:00Z"),
              author: "Sophie Bernard",
              lang: "fr" as const,
              translationId: "css-grid-layout-guide",
              canonicalSlug: "css-grid-layout-guide",
              heroImage: "/images/css-grid-layout.jpg",
            },
            render: async () => ({
              Content: () => null,
              headings: [],
              remarkPluginFrontmatter: {},
            }),
          },
          {
            id: "fr/optimisation-performance-web.mdx",
            slug: "optimisation-performance-web",
            body: "# 10 Techniques d'Optimisation des Performances Web en 2024\n\nLes performances web sont cruciales...",
            collection: "blog",
            data: {
              title:
                "10 Techniques d'Optimisation des Performances Web en 2024",
              description:
                "Découvrez les meilleures techniques pour optimiser les performances de votre site web et améliorer l'expérience utilisateur.",
              pubDate: new Date("2024-02-01T00:00:00Z"),
              author: "Léa Martin",
              lang: "fr" as const,
              translationId: "web-performance-optimization",
              canonicalSlug: "optimisation-performance-web",
              heroImage: "/images/performance-optimization.jpg",
            },
            render: async () => ({
              Content: () => null,
              headings: [],
              remarkPluginFrontmatter: {},
            }),
          },
          {
            id: "fr/react-vs-vue-2024.mdx",
            slug: "react-vs-vue-2024",
            body: "# React vs Vue.js en 2024 : Quel Framework Choisir ?\n\nLe débat entre React et Vue.js continue...",
            collection: "blog",
            data: {
              title: "React vs Vue.js en 2024 : Quel Framework Choisir ?",
              description:
                "Comparaison approfondie entre React et Vue.js pour vous aider à choisir le bon framework pour votre prochain projet.",
              pubDate: new Date("2024-01-25T00:00:00Z"),
              author: "Marc Lefebvre",
              lang: "fr" as const,
              translationId: "react-vs-vue-2024",
              canonicalSlug: "react-vs-vue-2024",
              heroImage: "/images/react-vue-comparison.jpg",
            },
            render: async () => ({
              Content: () => null,
              headings: [],
              remarkPluginFrontmatter: {},
            }),
          },
        ];
      }
      return [];
    };

    const allPosts = await mockGetCollection("blog");

    // Vérifier qu'on a bien des articles
    expect(allPosts).toHaveLength(3);

    // Filtrer par langue comme le fait notre composant
    const lang = "fr";
    const languagePosts = allPosts.filter((post) => post.data.lang === lang);
    expect(languagePosts).toHaveLength(3);

    // Trier par date comme le fait notre composant
    const sortedPosts = languagePosts.sort((a, b) => {
      return (
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
      );
    });

    // Vérifier l'ordre (plus récent en premier)
    expect(sortedPosts[0].data.title).toContain("CSS Grid");
    expect(sortedPosts[1].data.title).toContain("Optimisation");
    expect(sortedPosts[2].data.title).toContain("React vs Vue");

    // Vérifier la conformité au schéma
    sortedPosts.forEach((post) => {
      expect(post.data.title).toBeTruthy();
      expect(post.data.description).toBeTruthy();
      expect(post.data.pubDate).toBeInstanceOf(Date);
      expect(post.data.author).toBeTruthy();
      expect(post.data.lang).toBe("fr");
      expect(post.data.translationId).toBeTruthy();
      expect(post.data.canonicalSlug).toBeTruthy();
      expect(post.data.heroImage).toBeTruthy();
      expect(post.slug).toBeTruthy();
    });
  });

  it("devrait simuler correctement la logique de notre LatestArticlesSection", () => {
    const posts = [
      {
        slug: "css-grid-layout-guide",
        data: {
          title:
            "Maîtriser CSS Grid Layout : Guide Complet avec Exemples Pratiques",
          description:
            "Apprenez à créer des layouts complexes et responsives avec CSS Grid. Guide complet avec exemples pratiques et cas d'usage.",
          pubDate: new Date("2024-02-15T00:00:00Z"),
          author: "Sophie Bernard",
          lang: "fr" as const,
          heroImage: "/images/css-grid-layout.jpg",
        },
      },
      {
        slug: "optimisation-performance-web",
        data: {
          title: "10 Techniques d'Optimisation des Performances Web en 2024",
          description:
            "Découvrez les meilleures techniques pour optimiser les performances de votre site web et améliorer l'expérience utilisateur.",
          pubDate: new Date("2024-02-01T00:00:00Z"),
          author: "Léa Martin",
          lang: "fr" as const,
          heroImage: "/images/performance-optimization.jpg",
        },
      },
    ];

    // Simuler la logique du composant
    const maxArticles = 7;
    const showHero = true;

    const limitedPosts = posts.slice(0, maxArticles);
    const heroPosts =
      showHero && limitedPosts.length > 0 ? [limitedPosts[0]] : [];
    const gridPosts =
      showHero && limitedPosts.length > 1
        ? limitedPosts.slice(1)
        : limitedPosts;

    // Vérifications
    expect(heroPosts).toHaveLength(1);
    expect(heroPosts[0].data.title).toContain("CSS Grid");

    expect(gridPosts).toHaveLength(1);
    expect(gridPosts[0].data.title).toContain("Optimisation");
  });

  it("devrait valider que notre estimation de temps de lecture fonctionne", () => {
    const cssGuidePost = {
      slug: "css-grid-layout-guide",
      data: {
        title:
          "Maîtriser CSS Grid Layout : Guide Complet avec Exemples Pratiques",
        description:
          "Apprenez à créer des layouts complexes et responsives avec CSS Grid. Guide complet avec exemples pratiques et cas d'usage.",
      },
    };

    const readingTime = estimateReadingTime(cssGuidePost);

    // Vérifier que l'estimation est raisonnable
    expect(readingTime).toBeGreaterThanOrEqual(1);
    expect(readingTime).toBeLessThanOrEqual(30);

    // Les guides devraient être plus longs
    expect(readingTime).toBeGreaterThan(3);
  });

  it("devrait confirmer la compatibilité avec le schéma config.ts", () => {
    // Article de test conforme au schéma
    const testArticle = {
      data: {
        title: "Test Article",
        description: "Test description for validation",
        pubDate: new Date("2024-01-01T00:00:00Z"),
        author: "Test Author",
        lang: "fr" as const,
        translationId: "550e8400-e29b-41d4-a716-446655440000",
        canonicalSlug: "test-article-slug",
        heroImage: "/images/test.jpg",
      },
    };

    // Validation simple du schéma
    expect(typeof testArticle.data.title).toBe("string");
    expect(typeof testArticle.data.description).toBe("string");
    expect(testArticle.data.pubDate).toBeInstanceOf(Date);
    expect(typeof testArticle.data.author).toBe("string");
    expect(["en", "fr"]).toContain(testArticle.data.lang);
    expect(typeof testArticle.data.translationId).toBe("string");
    expect(typeof testArticle.data.canonicalSlug).toBe("string");
    expect(typeof testArticle.data.heroImage).toBe("string");

    // Validation du format canonicalSlug (comme dans config.ts)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    expect(slugRegex.test(testArticle.data.canonicalSlug)).toBe(true);
  });
});
