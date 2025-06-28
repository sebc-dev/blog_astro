import { describe, it, expect } from "vitest";
import {
  estimateReadingTime,
  getPostCategory,
} from "../../lib/article-utils";

describe("Articles Réels - Tests d'Intégration", () => {
  // Mock des vrais articles basés sur les fichiers MDX existants
  const realArticlesMock = [
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
    {
      slug: "react-vs-vue-2024",
      data: {
        title: "React vs Vue.js en 2024 : Quel Framework Choisir ?",
        description:
          "Comparaison approfondie entre React et Vue.js pour vous aider à choisir le bon framework pour votre prochain projet.",
        pubDate: new Date("2024-01-25T00:00:00Z"),
        author: "Marc Lefebvre",
        lang: "fr" as const,
        heroImage: "/images/react-vue-comparison.jpg",
      },
    },
    {
      slug: "api-rest-bonnes-pratiques",
      data: {
        title: "API REST : Guide des Bonnes Pratiques en 2024",
        description:
          "Découvrez les meilleures pratiques pour concevoir et implémenter des API REST modernes, sécurisées et performantes.",
        pubDate: new Date("2024-01-20T00:00:00Z"),
        author: "Thomas Dupont",
        lang: "fr" as const,
        heroImage: "/images/api-rest-guide.jpg",
      },
    },
  ];

  it("devrait estimer correctement le temps de lecture pour différents types d'articles", () => {
    const cssGuideTime = estimateReadingTime(realArticlesMock[0]);
    const performanceTime = estimateReadingTime(realArticlesMock[1]);
    const comparisonTime = estimateReadingTime(realArticlesMock[2]);
    const apiTime = estimateReadingTime(realArticlesMock[3]);

    // Les guides CSS devraient être longs (contient "guide")
    expect(cssGuideTime).toBeGreaterThan(3);

    // Les articles d'optimisation devraient être moyennement longs (contient "optimisation")
    expect(performanceTime).toBeGreaterThanOrEqual(3);

    // Les comparaisons devraient être moyennement longues (contient "vs")
    expect(comparisonTime).toBeGreaterThanOrEqual(2);

    // Les articles API devraient être longs (contient "api")
    expect(apiTime).toBeGreaterThanOrEqual(3);

    // Aucun temps ne devrait être inférieur à 1 minute
    expect(
      Math.min(cssGuideTime, performanceTime, comparisonTime, apiTime),
    ).toBeGreaterThanOrEqual(1);
  });

  it("devrait catégoriser correctement les vrais articles", () => {
    const categories = realArticlesMock.map((post) => getPostCategory(post));

    expect(categories[0]).toBe("Styling"); // CSS Grid
    expect(categories[1]).toBe("Performance"); // Optimisation
    expect(categories[2]).toBe("Framework"); // React vs Vue
    expect(categories[3]).toBe("Backend"); // API REST
  });

  it("devrait trier les vrais articles par date (plus récent en premier)", () => {
    const sortedArticles = [...realArticlesMock].sort((a, b) => {
      return (
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
      );
    });

    expect(sortedArticles[0].slug).toBe("css-grid-layout-guide"); // 15 fév
    expect(sortedArticles[1].slug).toBe("optimisation-performance-web"); // 1 fév
    expect(sortedArticles[2].slug).toBe("react-vs-vue-2024"); // 25 jan
    expect(sortedArticles[3].slug).toBe("api-rest-bonnes-pratiques"); // 20 jan
  });

  it("devrait fonctionner avec la logique de séparation Hero/Grille", () => {
    const sortedPosts = [...realArticlesMock].sort((a, b) => {
      return (
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
      );
    });

    const showHero = true;
    const heroPosts =
      showHero && sortedPosts.length > 0 ? [sortedPosts[0]] : [];
    const gridPosts =
      showHero && sortedPosts.length > 1 ? sortedPosts.slice(1) : sortedPosts;

    // L'article hero devrait être le plus récent
    expect(heroPosts[0].slug).toBe("css-grid-layout-guide");
    expect(heroPosts[0].data.title).toContain("CSS Grid");

    // La grille devrait contenir les autres articles
    expect(gridPosts).toHaveLength(3);
    expect(gridPosts.map((p) => p.slug)).toEqual([
      "optimisation-performance-web",
      "react-vs-vue-2024",
      "api-rest-bonnes-pratiques",
    ]);
  });

  it("devrait gérer correctement les métadonnées des vrais articles", () => {
    realArticlesMock.forEach((article) => {
      // Vérifier que tous les champs requis sont présents
      expect(article.data.title).toBeTruthy();
      expect(article.data.description).toBeTruthy();
      expect(article.data.pubDate).toBeInstanceOf(Date);
      expect(article.data.author).toBeTruthy();
      expect(article.data.lang).toBe("fr");
      expect(article.data.heroImage).toBeTruthy();
      expect(article.slug).toBeTruthy();

      // Vérifier les formats
      expect(article.data.heroImage).toMatch(/^\/images\/.+\.(jpg|png|webp)$/);
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("devrait calculer des temps de lecture raisonnables", () => {
    const readingTimes = realArticlesMock.map((post) =>
      estimateReadingTime(post),
    );

    // Tous les temps devraient être entre 1 et 30 minutes (raisonnable pour des articles de blog)
    readingTimes.forEach((time) => {
      expect(time).toBeGreaterThanOrEqual(1);
      expect(time).toBeLessThanOrEqual(30);
    });

    // Les guides devraient généralement être plus longs que les autres types
    const guideTime = estimateReadingTime(realArticlesMock[0]); // CSS Guide
    const regularTime = estimateReadingTime(realArticlesMock[1]); // Performance (pas guide)

    expect(guideTime).toBeGreaterThan(regularTime);
  });
});
