import { describe, it, expect } from "vitest";

describe("Validation des Translation IDs", () => {
  // Mock des articles avec leurs translationId réels
  const mockArticles = [
    // Articles français
    { slug: "guide-astro", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440001" } },
    { slug: "css-grid-layout-guide", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440002" } },
    { slug: "optimisation-performance-web", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440003" } },
    { slug: "react-vs-vue-2024", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440004" } },
    { slug: "api-rest-bonnes-pratiques", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440005" } },
    { slug: "typescript-pour-debutants", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440006" } },
    { slug: "premier-article", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440007" } },
    
    // Articles anglais (traductions)
    { slug: "astro-guide", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440001" } },
    { slug: "css-grid-comprehensive-guide", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440002" } },
    { slug: "web-performance-optimization-techniques", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440003" } },
    { slug: "react-vs-vue-2024-comparison", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440004" } },
    { slug: "rest-api-best-practices-guide", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440005" } },
    { slug: "typescript-beginners-guide", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440006" } },
    { slug: "first-post", data: { lang: "en", translationId: "550e8400-e29b-41d4-a716-446655440007" } },
  ];

  function validateTranslationUniqueness(articles: typeof mockArticles) {
    // Grouper par langue
    const postsByLang = new Map<string, typeof mockArticles>();
    
    articles.forEach(post => {
      const lang = post.data.lang;
      if (!postsByLang.has(lang)) {
        postsByLang.set(lang, []);
      }
      postsByLang.get(lang)!.push(post);
    });
    
    // Vérifier l'unicité par langue
    const errors: string[] = [];
    
    postsByLang.forEach((posts, lang) => {
      const seenIds = new Set<string>();
      
      posts.forEach(post => {
        const translationId = post.data.translationId;
        
        if (seenIds.has(translationId)) {
          errors.push(`Duplicate translationId "${translationId}" in language "${lang}" (file: ${post.slug})`);
        } else {
          seenIds.add(translationId);
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      stats: {
        totalArticles: articles.length,
        byLanguage: Object.fromEntries(Array.from(postsByLang.entries()).map(([lang, posts]) => [lang, posts.length])),
        translationPairs: getTranslationPairs(articles)
      }
    };
  }

  function getTranslationPairs(articles: typeof mockArticles) {
    const pairs = new Map<string, string[]>();
    
    articles.forEach(post => {
      const id = post.data.translationId;
      if (!pairs.has(id)) {
        pairs.set(id, []);
      }
      pairs.get(id)!.push(`${post.data.lang}:${post.slug}`);
    });
    
    return Object.fromEntries(Array.from(pairs.entries()));
  }

  it("devrait valider l'unicité des translationId par langue", () => {
    const result = validateTranslationUniqueness(mockArticles);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("devrait permettre les translationId identiques entre langues différentes", () => {
    const result = validateTranslationUniqueness(mockArticles);
    
    // Vérifier qu'on a bien des paires de traduction
    const translationPairs = result.stats.translationPairs;
    
    Object.values(translationPairs).forEach(langs => {
      if (langs.length === 2) {
        // Chaque paire devrait avoir une version FR et EN
        const hasEnglish = langs.some(lang => lang.startsWith('en:'));
        const hasFrench = langs.some(lang => lang.startsWith('fr:'));
        expect(hasEnglish && hasFrench).toBe(true);
      }
    });
  });

  it("devrait détecter les doublons dans la même langue", () => {
    const articlesWithDuplicate = [
      ...mockArticles,
      // Ajouter un doublon dans la même langue
      { slug: "duplicate-article", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440001" } }
    ];
    
    const result = validateTranslationUniqueness(articlesWithDuplicate);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Duplicate translationId');
    expect(result.errors[0]).toContain('language "fr"');
  });

  it("devrait fournir des statistiques correctes", () => {
    const result = validateTranslationUniqueness(mockArticles);
    
    expect(result.stats.totalArticles).toBe(14);
    expect(result.stats.byLanguage.fr).toBe(7);
    expect(result.stats.byLanguage.en).toBe(7);
    
    // Vérifier qu'on a 7 paires de traduction
    const pairCount = Object.values(result.stats.translationPairs).filter(langs => langs.length === 2).length;
    expect(pairCount).toBe(7);
  });

  it("devrait valider le format UUID des translationId", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    mockArticles.forEach(article => {
      expect(article.data.translationId).toMatch(uuidRegex);
    });
  });

  it("devrait identifier les articles sans traduction", () => {
    const articlesWithOrphan = [
      ...mockArticles,
      // Ajouter un article sans traduction
      { slug: "orphan-article", data: { lang: "fr", translationId: "550e8400-e29b-41d4-a716-446655440999" } }
    ];
    
    const result = validateTranslationUniqueness(articlesWithOrphan);
    const translationPairs = result.stats.translationPairs;
    
    // Vérifier qu'on a un article orphelin
    const orphanPairs = Object.values(translationPairs).filter(langs => langs.length === 1);
    expect(orphanPairs).toHaveLength(1);
    expect(orphanPairs[0][0]).toBe('fr:orphan-article');
  });
}); 