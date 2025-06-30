/**
 * Module de tri pour les pages de tags
 * Fonctionnalité identique au tri des catégories mais adapté aux tags
 */

/**
 * Type pour les options de tri des articles
 */
type SortOption =
  | "date-desc"
  | "date-asc"
  | "title-asc"
  | "title-desc"
  | "reading-time-asc"
  | "reading-time-desc";

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
        ? `<span class="badge badge-secondary badge-sm">${post.tag}</span>`
        : "";

      return `
        <article class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-base-content">${post.data.title}</h2>
            <p class="text-base-content/70">${post.data.description}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="badge badge-primary badge-sm">${post.category}</span>
              ${tagBadge}
            </div>
            <div class="flex items-center justify-between mt-4">
              <span class="text-sm text-muted-accessible">${post.formattedDate}</span>
              <span class="text-sm text-muted-accessible">${post.readingTime} min</span>
            </div>
            <div class="card-actions justify-end">
              <a href="/blog/${post.slug}" class="btn btn-primary btn-sm">
                ${translations.readText}
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
  // Récupérer les données des scripts JSON
  const postsDataScript = document.getElementById("posts-data");
  const translationsDataScript = document.getElementById("translations-data");

  if (!postsDataScript || !translationsDataScript) {
    console.warn("Tag sort: Required data scripts not found");
    return;
  }

  try {
    const posts: PostData[] = JSON.parse(postsDataScript.textContent || "[]");
    const translations: TagTranslations = JSON.parse(
      translationsDataScript.textContent || "{}",
    );

    // Configurer la gestion des événements de tri
    handleSortChange(posts, translations);
  } catch (error) {
    console.error("Tag sort: Error parsing data", error);
  }
}

// Initialiser quand le DOM est prêt
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTagSort);
} else {
  initTagSort();
}