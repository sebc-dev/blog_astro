import type { CollectionEntry } from "astro:content";
import { getPostCategory } from "./article-utils";

/**
 * Configuration des multiplicateurs de temps de lecture par mots-clés
 */
const READING_TIME_MULTIPLIERS = {
  guide: { multiplier: 2.5, checkIn: ['slug', 'title'] as const },
  vs: { multiplier: 1.8, checkIn: ['slug', 'title'] as const },
  api: { multiplier: 2.2, checkIn: ['slug', 'title'] as const },
  techniques: { multiplier: 2.0, checkIn: ['title'] as const },
  optimisation: { multiplier: 2.0, checkIn: ['title'] as const },
  optimization: { multiplier: 2.0, checkIn: ['title'] as const },
} as const;

/**
 * Type pour les options de tri des articles
 */
export type SortOption =
  | "date-desc"
  | "date-asc"
  | "title-asc"
  | "title-desc"
  | "reading-time-asc"
  | "reading-time-desc";

/**
 * Interface pour les traductions des catégories
 */
export interface CategoryTranslations {
  framework: string;
  language: string;
  performance: string;
  styling: string;
  backend: string;
  article: string;
}

/**
 * Extrait toutes les catégories uniques des articles
 * @param posts - Liste des articles
 * @param translations - Traductions des catégories
 * @returns Liste des catégories uniques
 */
export function getUniqueCategories(
  posts: CollectionEntry<"blog">[],
  translations: CategoryTranslations,
): string[] {
  const categories = new Set<string>();

  posts.forEach((post) => {
    const category = getPostCategory(post, { translations });
    categories.add(category);
  });

  return Array.from(categories).sort();
}

/**
 * Filtre les articles par catégorie
 * @param posts - Liste des articles
 * @param category - Catégorie à filtrer
 * @param translations - Traductions des catégories
 * @returns Articles filtrés par catégorie
 */
export function filterPostsByCategory(
  posts: CollectionEntry<"blog">[],
  category: string,
  translations: CategoryTranslations,
): CollectionEntry<"blog">[] {
  return posts.filter((post) => {
    const postCategory = getPostCategory(post, { translations });
    return postCategory === category;
  });
}

/**
 * Trie les articles selon l'option spécifiée
 * @param posts - Articles à trier
 * @param sortOption - Option de tri
 * @param lang - Langue pour le calcul du temps de lecture
 * @returns Articles triés
 */
export function sortPosts(
  posts: CollectionEntry<"blog">[],
  sortOption: SortOption,
  lang = "fr",
): CollectionEntry<"blog">[] {
  const sortedPosts = [...posts];

  switch (sortOption) {
    case "date-desc":
      return sortedPosts.sort(
        (a, b) =>
          new Date(b.data.pubDate).getTime() -
          new Date(a.data.pubDate).getTime(),
      );

    case "date-asc":
      return sortedPosts.sort(
        (a, b) =>
          new Date(a.data.pubDate).getTime() -
          new Date(b.data.pubDate).getTime(),
      );

    case "title-asc":
      return sortedPosts.sort((a, b) =>
        a.data.title.localeCompare(b.data.title, lang),
      );

    case "title-desc":
      return sortedPosts.sort((a, b) =>
        b.data.title.localeCompare(a.data.title, lang),
      );

    case "reading-time-asc":
      return sortedPosts.sort((a, b) => {
        const timeA = estimateReadingTimeForSort(a, lang);
        const timeB = estimateReadingTimeForSort(b, lang);
        return timeA - timeB;
      });

    case "reading-time-desc":
      return sortedPosts.sort((a, b) => {
        const timeA = estimateReadingTimeForSort(a, lang);
        const timeB = estimateReadingTimeForSort(b, lang);
        return timeB - timeA;
      });

    default:
      return sortedPosts;
  }
}

/**
 * Estimation rapide du temps de lecture pour le tri
 * (Version simplifiée de estimateReadingTime)
 */
function estimateReadingTimeForSort(
  post: CollectionEntry<"blog">,
  lang = "fr",
): number {
  const wordsPerMinute = lang === "fr" ? 200 : 220;
  const descWords = post.data.description.split(/\s+/).length;
  let estimatedWords = descWords * 15;

  const slug = post.slug;
  const title = post.data.title.toLowerCase();

  // Appliquer les multiplicateurs basés sur les mots-clés
  for (const [keyword, config] of Object.entries(READING_TIME_MULTIPLIERS)) {
    const shouldCheck = config.checkIn.some(location => {
      if (location === 'slug') return slug.includes(keyword);
      if (location === 'title') return title.includes(keyword);
      return false;
    });

    if (shouldCheck) {
      estimatedWords *= config.multiplier;
      break; // Appliquer seulement le premier multiplicateur trouvé
    }
  }

  return Math.max(1, Math.ceil(estimatedWords / wordsPerMinute));
}

/**
 * Normalise le nom de catégorie pour l'URL
 * @param category - Nom de la catégorie
 * @returns Nom normalisé pour l'URL
 */
export function normalizeCategoryForUrl(category: string): string {
  return category
    .toLowerCase()
    .replace(/[&/\\]/g, "-") // Remplacer &, /, \ par des tirets
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, "") // Supprimer les caractères non alphanumériques et non-tirets
    .replace(/-+/g, "-") // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, ""); // Supprimer les tirets en début et fin
}

/**
 * Dénormalise le nom de catégorie depuis l'URL
 * @param urlCategory - Nom de catégorie depuis l'URL
 * @param availableCategories - Catégories disponibles
 * @returns Nom de catégorie correspondant ou null
 */
export function denormalizeCategoryFromUrl(
  urlCategory: string,
  availableCategories: string[],
): string | null {
  const normalized = urlCategory.toLowerCase();

  return (
    availableCategories.find(
      (category) => normalizeCategoryForUrl(category) === normalized,
    ) || null
  );
}
