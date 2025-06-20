import type { CollectionEntry } from "astro:content";

/**
 * Calcule le temps de lecture estimé d'un article
 * @param post - L'article pour lequel calculer le temps de lecture
 * @param lang - La langue pour ajuster la vitesse de lecture (optionnel, par défaut 'fr')
 * @returns Le temps de lecture estimé en minutes
 */
export function estimateReadingTime(
  post:
    | CollectionEntry<"blog">
    | { slug: string; data: { title: string; description: string } },
  lang: string = "fr",
): number {
  const wordsPerMinute = lang === "fr" ? 200 : 220; // Différence de vitesse de lecture

  // Estimation basée sur la description et quelques indices du slug/titre
  const descWords = post.data.description.split(/\s+/).length;

  // Estimation basée sur des patterns de longueur d'articles connus
  const slug = post.slug;
  let estimatedWords = descWords * 15; // Ratio description/contenu moyen

  // Ajustements basés sur le type d'article détecté
  if (
    slug.includes("guide") ||
    post.data.title.toLowerCase().includes("guide")
  ) {
    estimatedWords *= 2.5; // Les guides sont plus longs
  } else if (
    slug.includes("vs") ||
    post.data.title.toLowerCase().includes("vs")
  ) {
    estimatedWords *= 1.8; // Les comparaisons sont moyennement longues
  } else if (
    slug.includes("api") ||
    post.data.title.toLowerCase().includes("api")
  ) {
    estimatedWords *= 2.2; // Les articles API sont techniques et longs
  } else if (
    post.data.title.toLowerCase().includes("techniques") ||
    post.data.title.toLowerCase().includes("optimisation") ||
    post.data.title.toLowerCase().includes("optimization")
  ) {
    estimatedWords *= 2.0; // Les articles techniques sont plus longs
  }

  return Math.max(1, Math.ceil(estimatedWords / wordsPerMinute));
}

/**
 * Détermine la catégorie d'un article basée sur son titre et sa description
 * @param post - L'article à catégoriser
 * @param options - Options de traduction (optionnel)
 * @returns La catégorie de l'article
 */
export function getPostCategory(
  post:
    | CollectionEntry<"blog">
    | { slug: string; data: { title: string; description: string } },
  options?: {
    translations?: {
      framework?: string;
      language?: string;
      performance?: string;
      styling?: string;
      backend?: string;
      article?: string;
    };
  },
): string {
  const title = post.data.title.toLowerCase();
  const description = post.data.description.toLowerCase();

  // Utiliser les traductions fournies ou des valeurs par défaut
  const defaultTranslations = {
    framework: "Framework",
    language: "Language",
    performance: "Performance",
    styling: "Styling",
    backend: "Backend",
    article: "Article",
  };

  const t = {
    framework:
      options?.translations?.framework ?? defaultTranslations.framework,
    language: options?.translations?.language ?? defaultTranslations.language,
    performance:
      options?.translations?.performance ?? defaultTranslations.performance,
    styling: options?.translations?.styling ?? defaultTranslations.styling,
    backend: options?.translations?.backend ?? defaultTranslations.backend,
    article: options?.translations?.article ?? defaultTranslations.article,
  };

  if (title.includes("astro") || description.includes("astro"))
    return t.framework;
  if (title.includes("typescript") || description.includes("typescript"))
    return t.language;
  if (title.includes("performance") || description.includes("performance"))
    return t.performance;
  if (title.includes("css") || description.includes("css")) return t.styling;
  if (title.includes("api") || description.includes("api")) return t.backend;
  if (title.includes("react") || title.includes("vue")) return t.framework;

  return t.article;
}

/**
 * Extrait un tag basé sur le contenu de l'article
 * @param post - L'article à analyser
 * @param options - Options de traduction (optionnel)
 * @returns Le tag de l'article ou undefined
 */
export function getPostTag(
  post:
    | CollectionEntry<"blog">
    | { slug: string; data: { title: string; description: string } },
  options?: {
    translations?: {
      guide?: string;
      optimization?: string;
      bestPractices?: string;
      comparison?: string;
    };
  },
): string | undefined {
  const title = post.data.title.toLowerCase();
  const description = post.data.description.toLowerCase();

  // Utiliser les traductions fournies ou des valeurs par défaut
  const defaultTranslations = {
    guide: "Guide",
    optimization: "Optimization",
    bestPractices: "Best Practices",
    comparison: "Comparison",
  };

  const t = {
    guide: options?.translations?.guide ?? defaultTranslations.guide,
    optimization:
      options?.translations?.optimization ?? defaultTranslations.optimization,
    bestPractices:
      options?.translations?.bestPractices ?? defaultTranslations.bestPractices,
    comparison:
      options?.translations?.comparison ?? defaultTranslations.comparison,
  };

  if (
    title.includes("guide") ||
    title.includes("débuter") ||
    title.includes("beginner")
  )
    return t.guide;
  if (
    title.includes("optimisation") ||
    description.includes("optimiser") ||
    title.includes("optimization")
  )
    return t.optimization;
  if (
    title.includes("bonnes pratiques") ||
    description.includes("pratiques") ||
    title.includes("best practices")
  )
    return t.bestPractices;
  if (
    title.includes("vs") ||
    title.includes("comparaison") ||
    title.includes("comparison")
  )
    return t.comparison;

  return undefined;
}
