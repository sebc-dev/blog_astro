import type { SortOption } from "@/lib/article/category-utils";
/**
 * Module de tri pour les pages de tags
 * Fonctionnalité identique au tri des catégories mais adapté aux tags
 */

/**
 * Interface pour les données des posts côté client (version simplifiée)
 */
interface PostData {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: string | Date;
  };
  category: string;
  tag: string | undefined;
  readingTime: number;
  formattedDate: string;
}

/**
 * Interface pour les traductions côté client
 */
interface TagTranslations {
  sortLabel: string;
  sortDateDesc: string;
  sortDateAsc: string;
  sortTitleAsc: string;
  sortTitleDesc: string;
  sortReadingTimeAsc: string;
  sortReadingTimeDesc: string;
  readText: string;
  tagText: string;
}

/**
 * Valide que les données des posts sont valides
 */
export function validatePostsData(data: unknown): data is PostData[] {
  if (!Array.isArray(data)) {
    console.error("Tag sort: Posts data is not an array", typeof data);
    return false;
  }

  // Vérifier que chaque élément a la structure attendue
  for (let i = 0; i < data.length; i++) {
    const post = data[i];
    if (!post || typeof post !== 'object') {
      console.error(`Tag sort: Post at index ${i} is not an object`, post);
      return false;
    }

    const typedPost = post as Record<string, unknown>;
    
    // Vérifications des propriétés essentielles
    if (typeof typedPost.slug !== 'string') {
      console.error(`Tag sort: Post at index ${i} missing valid slug`, typedPost);
      return false;
    }

    if (!typedPost.data || typeof typedPost.data !== 'object') {
      console.error(`Tag sort: Post at index ${i} missing valid data object`, typedPost);
      return false;
    }

    const postData = typedPost.data as Record<string, unknown>;
    if (typeof postData.title !== 'string' || 
        typeof postData.description !== 'string' ||
        (!postData.pubDate || (typeof postData.pubDate !== 'string' && !(postData.pubDate instanceof Date)))) {
      console.error(`Tag sort: Post at index ${i} missing required data properties`, postData);
      return false;
    }

    if (typeof typedPost.category !== 'string' ||
        typeof typedPost.readingTime !== 'number' ||
        typeof typedPost.formattedDate !== 'string') {
      console.error(`Tag sort: Post at index ${i} missing required properties`, typedPost);
      return false;
    }
  }

  return true;
}

/**
 * Valide que les données de traduction sont valides
 */
export function validateTranslationsData(data: unknown): data is TagTranslations {
  if (!data || typeof data !== 'object') {
    console.error("Tag sort: Translations data is not an object", typeof data);
    return false;
  }

  const translations = data as Record<string, unknown>;
  const requiredProperties = [
    'sortLabel',
    'sortDateDesc', 
    'sortDateAsc',
    'sortTitleAsc',
    'sortTitleDesc',
    'sortReadingTimeAsc',
    'sortReadingTimeDesc',
    'readText',
    'tagText'
  ];

  for (const prop of requiredProperties) {
    if (typeof translations[prop] !== 'string') {
      console.error(`Tag sort: Missing or invalid translation property: ${prop}`, translations[prop]);
      return false;
    }
  }

  return true;
}

/**
 * Trie les articles selon l'option spécifiée (version côté client)
 */
function sortPosts(posts: PostData[], sortOption: SortOption): PostData[] {
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
        a.data.title.localeCompare(b.data.title),
      );

    case "title-desc":
      return sortedPosts.sort((a, b) =>
        b.data.title.localeCompare(a.data.title),
      );

    case "reading-time-asc":
      return sortedPosts.sort((a, b) => a.readingTime - b.readingTime);

    case "reading-time-desc":
      return sortedPosts.sort((a, b) => b.readingTime - a.readingTime);

    default:
      return sortedPosts;
  }
}

/**
 * Échappe les caractères HTML pour prévenir les attaques XSS
 */
export function escapeHtml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) {
    return '';
  }
  
  const text = String(unsafe);
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (match) => map[match] || match);
}

/**
 * Applique le tri aux articles et met à jour l'affichage
 */
function applySorting(posts: PostData[], sortOption: SortOption): PostData[] {
  return sortPosts(posts, sortOption);
}

/**
 * Met à jour la grille d'articles avec les nouveaux articles triés
 */
function updateArticlesGrid(
  sortedPosts: PostData[],
  translations: TagTranslations,
): void {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  // Générer le HTML pour les cartes d'articles
  const articlesHTML = sortedPosts
    .map((post) => {
      const tagBadge = post.tag
        ? `<span class="badge badge-secondary badge-sm">${escapeHtml(post.tag)}</span>`
        : "";

      return `
        <article class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-base-content">${escapeHtml(post.data.title)}</h2>
            <p class="text-base-content/70">${escapeHtml(post.data.description)}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="badge badge-primary badge-sm">${escapeHtml(post.category)}</span>
              ${tagBadge}
            </div>
            <div class="flex items-center justify-between mt-4">
              <span class="text-sm text-muted-accessible">${escapeHtml(post.formattedDate)}</span>
              <span class="text-sm text-muted-accessible">${escapeHtml(post.readingTime)} min</span>
            </div>
            <div class="card-actions justify-end">
              <a href="/blog/${escapeHtml(post.slug)}" class="btn btn-primary btn-sm">
                ${escapeHtml(translations.readText)}
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  grid.innerHTML = articlesHTML;
}

/**
 * Gestion des événements de tri
 */
function handleSortChange(
  posts: PostData[],
  translations: TagTranslations,
): void {
  const sortSelect = document.getElementById(
    "sort-select",
  ) as HTMLSelectElement;
  if (!sortSelect) return;

  sortSelect.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    const sortOption = target.value as SortOption;

    // Appliquer le tri
    const sortedPosts = applySorting(posts, sortOption);

    // Mettre à jour l'affichage
    updateArticlesGrid(sortedPosts, translations);
  });
}

/**
 * Initialisation du module de tri
 */
function initTagSort(): void {
  // Vérification de l'existence des éléments avec validation du contenu
  const postsDataScript = document.getElementById("posts-data");
  const translationsDataScript = document.getElementById("translations-data");

  // Validation de l'existence des éléments
  if (!postsDataScript) {
    console.error("Tag sort: Element with id 'posts-data' not found, aborting initialization");
    return;
  }

  if (!translationsDataScript) {
    console.error("Tag sort: Element with id 'translations-data' not found, aborting initialization");
    return;
  }

  // Validation du contenu textuel des éléments
  const postsTextContent = postsDataScript.textContent;
  const translationsTextContent = translationsDataScript.textContent;

  if (!postsTextContent || postsTextContent.trim() === "") {
    console.error("Tag sort: Element 'posts-data' exists but contains no text content, aborting initialization");
    return;
  }

  if (!translationsTextContent || translationsTextContent.trim() === "") {
    console.error("Tag sort: Element 'translations-data' exists but contains no text content, aborting initialization");
    return;
  }

  // Parsing JSON sécurisé avec gestion d'erreurs spécifique
  let postsRaw: unknown;
  let translationsRaw: unknown;

  try {
    postsRaw = JSON.parse(postsTextContent);
  } catch (error) {
    console.error("Tag sort: Failed to parse posts JSON data", {
      error: error instanceof Error ? error.message : String(error),
      textContent: postsTextContent.substring(0, 100) + "..." // Log excerpt for debugging
    });
    return;
  }

  try {
    translationsRaw = JSON.parse(translationsTextContent);
  } catch (error) {
    console.error("Tag sort: Failed to parse translations JSON data", {
      error: error instanceof Error ? error.message : String(error),
      textContent: translationsTextContent.substring(0, 100) + "..." // Log excerpt for debugging
    });
    return;
  }

  // Vérification que les données posts sont un array avant validation avancée
  if (!Array.isArray(postsRaw)) {
    console.error("Tag sort: Parsed posts data is not an array", {
      type: typeof postsRaw,
      isArray: Array.isArray(postsRaw),
      value: postsRaw
    });
    return;
  }

  // Validation stricte des données parsées avec les fonctions existantes
  if (!validatePostsData(postsRaw)) {
    console.error("Tag sort: Posts data validation failed, aborting initialization");
    return;
  }

  if (!validateTranslationsData(translationsRaw)) {
    console.error("Tag sort: Translations data validation failed, aborting initialization");
    return;
  }

  // Les données sont maintenant typées et validées - safe to proceed
  const posts: PostData[] = postsRaw;
  const translations: TagTranslations = translationsRaw;

  console.log("Tag sort: Successfully initialized with validated data", {
    postsCount: posts.length,
    translationsKeys: Object.keys(translations)
  });

  // Configurer la gestion des événements de tri
  handleSortChange(posts, translations);
}

// Initialiser quand le DOM est prêt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTagSort);
} else {
  initTagSort();
}