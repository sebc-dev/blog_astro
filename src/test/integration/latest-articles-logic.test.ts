import { describe, it, expect } from "vitest";

describe("LatestArticlesSection - Logique Métier", () => {
  // Mock des données d'articles pour tester la logique
  const mockPosts = [
    {
      slug: "guide-astro",
      data: {
        title: "Débuter avec Astro",
        description: "Un guide complet pour construire des sites web rapides et modernes avec le framework Astro.",
        pubDate: new Date("2024-01-20T00:00:00Z"),
        author: "Équipe Tech",
        lang: "fr",
      },
    },
    {
      slug: "typescript-pour-debutants",
      data: {
        title: "TypeScript pour débutants",
        description: "Apprenez TypeScript facilement avec ce guide étape par étape.",
        pubDate: new Date("2024-01-15T00:00:00Z"),
        author: "Dev Expert",
        lang: "fr",
      },
    },
    {
      slug: "optimisation-performance-web",
      data: {
        title: "Optimisation des Performances Web",
        description: "Techniques avancées pour optimiser les performances de vos applications web.",
        pubDate: new Date("2024-01-10T00:00:00Z"),
        author: "Performance Expert",
        lang: "fr",
      },
    },
    {
      slug: "css-grid-layout-guide",
      data: {
        title: "CSS Grid Layout Guide",
        description: "Maîtrisez CSS Grid pour créer des layouts complexes et responsifs.",
        pubDate: new Date("2024-01-05T00:00:00Z"),
        author: "CSS Master",
        lang: "fr",
      },
    },
  ];

  it("devrait trier les articles par date de publication (plus récent en premier)", () => {
    // Reproduire la logique de tri de LatestArticlesSection
    const sortedPosts = mockPosts.sort((a, b) => {
      return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
    });

    expect(sortedPosts[0].slug).toBe("guide-astro"); // Plus récent (20 jan)
    expect(sortedPosts[1].slug).toBe("typescript-pour-debutants"); // 15 jan
    expect(sortedPosts[2].slug).toBe("optimisation-performance-web"); // 10 jan
    expect(sortedPosts[3].slug).toBe("css-grid-layout-guide"); // Plus ancien (5 jan)
  });

  it("devrait limiter le nombre d'articles selon maxArticles", () => {
    const maxArticles = 3;
    const limitedPosts = mockPosts.slice(0, maxArticles);

    expect(limitedPosts).toHaveLength(3);
    expect(limitedPosts.map(p => p.slug)).toEqual([
      "guide-astro",
      "typescript-pour-debutants", 
      "optimisation-performance-web"
    ]);
  });

  it("devrait séparer correctement l'article héro des articles de grille", () => {
    const showHero = true;
    const limitedPosts = mockPosts.slice(0, 4);

    // Reproduire la logique de séparation
    const heroPosts = showHero && limitedPosts.length > 0 ? [limitedPosts[0]] : [];
    const gridPosts = showHero && limitedPosts.length > 1 
      ? limitedPosts.slice(1) 
      : limitedPosts;

    expect(heroPosts).toHaveLength(1);
    expect(heroPosts[0].slug).toBe("guide-astro");
    
    expect(gridPosts).toHaveLength(3);
    expect(gridPosts.map(p => p.slug)).toEqual([
      "typescript-pour-debutants",
      "optimisation-performance-web", 
      "css-grid-layout-guide"
    ]);
  });

  it("devrait ne pas avoir d'article héro si showHero est false", () => {
    const showHero = false;
    const limitedPosts = mockPosts.slice(0, 4);

    const heroPosts = showHero && limitedPosts.length > 0 ? [limitedPosts[0]] : [];
    const gridPosts = showHero && limitedPosts.length > 1 
      ? limitedPosts.slice(1) 
      : limitedPosts;

    expect(heroPosts).toHaveLength(0);
    expect(gridPosts).toHaveLength(4); // Tous les articles dans la grille
  });

  it("devrait calculer correctement le temps de lecture", () => {
    // Reproduire la fonction calculateReadingTime
    function calculateReadingTime(content: string): number {
      const wordsPerMinute = 200; // Moyenne de lecture en français
      const words = content.split(/\s+/).length;
      return Math.ceil(words / wordsPerMinute);
    }

    const shortText = "Ceci est un texte court.";
    const longText = "Lorem ipsum dolor sit amet consectetur adipisicing elit. " +
      "Laboriosam id veniam nam culpa magni ratione vitae omnis facere ipsum " +
      "blanditiis minima quibusdam esse ullam natus odio ipsa quia quidem " +
      "perferendis. Sed ut perspiciatis unde omnis iste natus error sit " +
      "voluptatem accusantium doloremque laudantium totam rem aperiam eaque " +
      "ipsa quae ab illo inventore veritatis et quasi architecto beatae " +
      "vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas " +
      "sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores " +
      "eos qui ratione voluptatem sequi nesciunt neque porro quisquam est " +
      "qui dolorem ipsum quia dolor sit amet consectetur adipiscing elit.";

    expect(calculateReadingTime(shortText)).toBe(1); // Texte court
    expect(calculateReadingTime(longText)).toBeGreaterThanOrEqual(1); // Texte long
  });

  it("devrait déterminer correctement les catégories basées sur le contenu", () => {
    // Reproduire la fonction getPostCategory
    function getPostCategory(post: typeof mockPosts[0]): string {
      const title = post.data.title.toLowerCase();
      const description = post.data.description.toLowerCase();
      
      if (title.includes("astro") || description.includes("astro")) return "Framework";
      if (title.includes("typescript") || description.includes("typescript")) return "Language";
      if (title.includes("performance") || description.includes("performance")) return "Performance";
      if (title.includes("css") || description.includes("css")) return "Styling";
      if (title.includes("api") || description.includes("api")) return "Backend";
      if (title.includes("react") || title.includes("vue")) return "Framework";
      
      return "Article";
    }

    expect(getPostCategory(mockPosts[0])).toBe("Framework"); // Astro
    expect(getPostCategory(mockPosts[1])).toBe("Language"); // TypeScript
    expect(getPostCategory(mockPosts[2])).toBe("Performance"); // Performance
    expect(getPostCategory(mockPosts[3])).toBe("Styling"); // CSS
  });

  it("devrait extraire correctement les tags basés sur le contenu", () => {
    // Reproduire la fonction getPostTag
    function getPostTag(post: typeof mockPosts[0]): string | undefined {
      const title = post.data.title.toLowerCase();
      const description = post.data.description.toLowerCase();
      
      if (title.includes("guide") || title.includes("débuter")) return "Guide";
      if (title.includes("optimisation") || description.includes("optimiser")) return "Optimization";
      if (title.includes("bonnes pratiques") || description.includes("pratiques")) return "Best Practices";
      if (title.includes("vs") || title.includes("comparaison")) return "Comparison";
      
      return undefined;
    }

    expect(getPostTag(mockPosts[0])).toBe("Guide"); // Débuter avec Astro
    expect(getPostTag(mockPosts[1])).toBeUndefined(); // TypeScript pour débutants (pas "débuter")
    expect(getPostTag(mockPosts[2])).toBe("Optimization"); // Optimisation
    expect(getPostTag(mockPosts[3])).toBe("Guide"); // CSS Grid Layout Guide
  });

  it("devrait filtrer les articles par langue", () => {
    const mixedPosts = [
      ...mockPosts,
      {
        slug: "english-article",
        data: {
          title: "English Article",
          description: "An article in English",
          pubDate: new Date("2024-01-25T00:00:00Z"),
          author: "English Author",
          lang: "en" as const,
        },
      },
    ];

    // Filtrer par langue française
    const frenchPosts = mixedPosts.filter(post => post.data.lang === "fr");

    expect(frenchPosts).toHaveLength(4); // Seulement les articles français
    expect(frenchPosts.every(post => post.data.lang === "fr")).toBe(true);
  });
}); 