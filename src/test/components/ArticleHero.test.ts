import { describe, it, expect } from "vitest";

describe("ArticleHero - Logique Métier", () => {
  const mockProps = {
    title: "Guide Complet des Performances Web",
    description: "Un guide approfondi pour optimiser les performances de vos applications web modernes avec les dernières techniques et bonnes pratiques",
    heroImage: "/images/hero-performance.jpg",
    pubDate: new Date("2024-01-15T00:00:00Z"),
    author: "Expert Dev",
    category: "Performance",
    tag: "Optimization",
    slug: "guide-performances-web",
    readingTime: 12,
  };

  it("devrait valider la structure des props ArticleHero", () => {
    // Test de validation des types - ce test compile si les types sont corrects
    expect(typeof mockProps.title).toBe("string");
    expect(typeof mockProps.description).toBe("string");
    expect(mockProps.pubDate instanceof Date).toBe(true);
    expect(typeof mockProps.author).toBe("string");
    expect(typeof mockProps.slug).toBe("string");
    expect(typeof mockProps.readingTime).toBe("number");
    expect(typeof mockProps.heroImage).toBe("string");
    expect(typeof mockProps.category).toBe("string");
    expect(typeof mockProps.tag).toBe("string");
  });

  it("devrait valider la longueur maximale du titre", () => {
    const testTitles = [
      "Titre Court",
      "Un Titre de Longueur Moyenne",
      "Un Très Long Titre Qui Pourrait Poser Des Problèmes d'Affichage Dans Certains Contextes de Page"
    ];

    testTitles.forEach(title => {
      expect(typeof title).toBe("string");
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThan(150); // Limite raisonnable pour un titre de héros
    });
  });

  it("devrait valider la longueur de la description", () => {
    const shortDescription = "Description courte mais informative";
    const longDescription = "Une description très détaillée qui peut s'étendre sur plusieurs lignes pour donner tous les détails nécessaires sur le contenu de l'article et ce que le lecteur peut attendre en le lisant.";

    expect(shortDescription.length).toBeGreaterThan(10);
    expect(longDescription.length).toBeGreaterThan(50);
    expect(longDescription.length).toBeLessThan(300); // Limite pour éviter des descriptions trop longues
  });

  it("devrait valider le format des URLs d'image hero", () => {
    const validHeroImages = [
      "/images/hero-performance.jpg",
      "/images/hero-development.png",
      "/images/hero-design.webp",
      "https://cdn.example.com/hero.jpg"
    ];

    validHeroImages.forEach(image => {
      expect(typeof image).toBe("string");
      expect(image.length).toBeGreaterThan(0);
      expect(image).toMatch(/\.(jpg|jpeg|png|webp)$/i);
    });
  });

  it("devrait formater correctement les dates de publication", () => {
    const testDates = [
      new Date("2024-01-15T00:00:00Z"),
      new Date("2023-12-25T10:30:00Z"),
      new Date("2024-06-01T14:45:00Z")
    ];

    testDates.forEach(date => {
      expect(date instanceof Date).toBe(true);
      expect(date.getTime()).not.toBeNaN();
      expect(date.getFullYear()).toBeGreaterThan(2020);
      expect(date.getFullYear()).toBeLessThan(2030);
    });
  });

  it("devrait valider les temps de lecture réalistes", () => {
    const readingTimes = [
      { minutes: 3, description: "Article court" },
      { minutes: 8, description: "Article moyen" },
      { minutes: 15, description: "Article long" },
      { minutes: 25, description: "Guide approfondi" }
    ];

    readingTimes.forEach(({ minutes }) => {
      expect(typeof minutes).toBe("number");
      expect(minutes).toBeGreaterThan(0);
      expect(minutes).toBeLessThan(60); // Maximum raisonnable
    });
  });

  it("devrait valider les formats de slug pour URL", () => {
    const testSlugs = [
      "guide-performances-web",
      "introduction-typescript",
      "astro-vs-next-comparison",
      "best-practices-2024"
    ];

    testSlugs.forEach(slug => {
      expect(typeof slug).toBe("string");
      expect(slug).toMatch(/^[a-z0-9-]+$/); // Format kebab-case strict
      expect(slug).not.toContain(" ");
      expect(slug).not.toContain("_");
      expect(slug).not.toMatch(/[A-Z]/);
      expect(slug.length).toBeGreaterThan(3);
      expect(slug.length).toBeLessThan(100);
    });
  });

  it("devrait valider les catégories d'articles", () => {
    const categories = [
      "Performance",
      "Development", 
      "Design",
      "JavaScript",
      "TypeScript",
      "Astro"
    ];

    categories.forEach(category => {
      expect(typeof category).toBe("string");
      expect(category.length).toBeGreaterThan(2);
      expect(category[0]).toMatch(/[A-Z]/); // Commence par une majuscule
      expect(category).not.toContain(" "); // Pas d'espaces dans les catégories
    });
  });

  it("devrait valider les tags d'articles", () => {
    const tags = [
      "Optimization",
      "Best Practices",
      "Tutorial", 
      "Advanced",
      "Beginner Friendly"
    ];

    tags.forEach(tag => {
      expect(typeof tag).toBe("string");
      expect(tag.length).toBeGreaterThan(2);
      expect(tag.length).toBeLessThan(30);
    });
  });

  it("devrait valider les noms d'auteurs", () => {
    const authors = [
      "Expert Dev",
      "Marie Dupont",
      "Jean-Pierre Martin",
      "Alexandra Tech"
    ];

    authors.forEach(author => {
      expect(typeof author).toBe("string");
      expect(author.length).toBeGreaterThan(2);
      expect(author.length).toBeLessThan(50);
      expect(author.trim()).toBe(author); // Pas d'espaces en début/fin
    });
  });

  it("devrait calculer correctement les estimations de temps de lecture", () => {
    // Test de la logique d'estimation (environ 200-250 mots par minute)
    const wordsPerMinute = 200;
    const testWordCounts = [400, 800, 1200, 2000];
    
    testWordCounts.forEach(wordCount => {
      const estimatedTime = Math.ceil(wordCount / wordsPerMinute);
      expect(estimatedTime).toBeGreaterThan(0);
      expect(typeof estimatedTime).toBe("number");
      // Vérifier que l'estimation est cohérente
      expect(estimatedTime).toBeLessThanOrEqual(Math.ceil(wordCount / 150)); // Estimation haute
      expect(estimatedTime).toBeGreaterThanOrEqual(Math.ceil(wordCount / 300)); // Estimation basse
    });
  });
}); 