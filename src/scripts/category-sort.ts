/**
 * Category Sort - Script d'interactivité pour le tri des articles
 * Optimisé pour les performances (<2KB) - Interactivité pure uniquement
 */

interface PostData {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: string;
    heroImage?: string;
  };
  category: string;
  tag?: string;
  readingTime: number;
  formattedDate: string;
}

interface Translations {
  sortLabel: string;
  sortDateDesc: string;
  sortDateAsc: string;
  sortTitleAsc: string;
  sortTitleDesc: string;
  sortReadingTimeAsc: string;
  sortReadingTimeDesc: string;
  readText: string;
  categoryText: string;
}

type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc" | "reading-time-asc" | "reading-time-desc";

export function initializeCategorySort(): void {
  // Pattern d'initialisation sécurisé
  (() => {
    'use strict';
    
    // Récupération des données et traductions depuis le DOM
    const postsDataElement = document.getElementById('posts-data');
    const translationsDataElement = document.getElementById('translations-data');
    
    if (!postsDataElement || !translationsDataElement) {
      console.warn('[CategorySort] Données manquantes pour le tri');
      return;
    }

    let postsData: PostData[];
    let translations: Translations;
    
    try {
      postsData = JSON.parse(postsDataElement.textContent || '[]');
      translations = JSON.parse(translationsDataElement.textContent || '{}');
    } catch (error) {
      console.error('[CategorySort] Erreur parsing données JSON:', error);
      return;
    }

    // Éléments DOM critiques
    const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
    const articlesGrid = document.getElementById('articles-grid');

    if (!sortSelect || !articlesGrid) {
      console.warn('[CategorySort] Éléments DOM manquants pour le tri');
      return;
    }

    // Fonction de tri optimisée
    function sortPosts(posts: PostData[], sortOption: SortOption): PostData[] {
      const sortedPosts = [...posts];
      
      switch (sortOption) {
        case "date-desc":
          return sortedPosts.sort((a, b) => 
            new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
          );
        
        case "date-asc":
          return sortedPosts.sort((a, b) => 
            new Date(a.data.pubDate).getTime() - new Date(b.data.pubDate).getTime()
          );
        
        case "title-asc":
          return sortedPosts.sort((a, b) => 
            a.data.title.localeCompare(b.data.title)
          );
        
        case "title-desc":
          return sortedPosts.sort((a, b) => 
            b.data.title.localeCompare(a.data.title)
          );
        
        case "reading-time-asc":
          return sortedPosts.sort((a, b) => a.readingTime - b.readingTime);
        
        case "reading-time-desc":
          return sortedPosts.sort((a, b) => b.readingTime - a.readingTime);
        
        default:
          return sortedPosts;
      }
    }

    // Génération DOM sécurisée (protection XSS)
    function createArticleCardElement(post: PostData): HTMLElement {
      // Création de l'article principal
      const article = document.createElement('article');
      article.className = 'card bg-base-300 border-base-content/10 group h-full overflow-hidden border shadow-lg transition-all duration-300 hover:shadow-xl';
      article.setAttribute('data-cy', 'article-card');
      article.setAttribute('data-article-slug', post.slug);

      // Image héro optionnelle
      if (post.data.heroImage) {
        const figure = document.createElement('figure');
        figure.className = 'aspect-video overflow-hidden';
        figure.setAttribute('data-cy', 'article-image');

        const img = document.createElement('img');
        img.src = post.data.heroImage;
        img.alt = post.data.title;
        img.className = 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105';
        img.loading = 'lazy';

        figure.appendChild(img);
        article.appendChild(figure);
      }

      // Corps de la carte
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body flex flex-col justify-between p-4';
      cardBody.setAttribute('data-cy', 'article-content');

      // Métadonnées
      const metadata = document.createElement('div');
      metadata.className = 'mb-3 flex flex-wrap gap-1';
      metadata.setAttribute('data-cy', 'article-metadata');

      // Badge catégorie
      const categoryBadge = document.createElement('span');
      categoryBadge.className = 'badge badge-primary badge-sm';
      categoryBadge.setAttribute('data-cy', 'article-category');
      categoryBadge.textContent = post.category;
      metadata.appendChild(categoryBadge);

      // Badge tag optionnel
      if (post.tag) {
        const tagBadge = document.createElement('span');
        tagBadge.className = 'badge badge-outline badge-sm';
        tagBadge.setAttribute('data-cy', 'article-tag');
        tagBadge.textContent = post.tag;
        metadata.appendChild(tagBadge);
      }

      // Date
      const dateSpan = document.createElement('span');
      dateSpan.className = 'text-secondary-accessible ml-auto text-xs';
      dateSpan.setAttribute('data-cy', 'article-date');
      dateSpan.textContent = post.formattedDate;
      metadata.appendChild(dateSpan);

      cardBody.appendChild(metadata);

      // Titre
      const title = document.createElement('h3');
      title.className = 'card-title group-hover:text-primary mb-3 line-clamp-2 text-lg leading-tight font-bold transition-colors';
      title.setAttribute('data-cy', 'article-title');

      const titleLink = document.createElement('a');
      titleLink.href = `/blog/${post.slug}`;
      titleLink.className = 'link-hover';
      titleLink.setAttribute('data-cy', 'article-title-link');
      titleLink.textContent = post.data.title;

      title.appendChild(titleLink);
      cardBody.appendChild(title);

      // Description
      const description = document.createElement('p');
      description.className = 'text-muted-accessible mb-4 line-clamp-2 flex-grow text-sm leading-relaxed';
      description.setAttribute('data-cy', 'article-description');
      const truncatedDesc = post.data.description.length > 120 
        ? post.data.description.substring(0, 120) + '...' 
        : post.data.description;
      description.textContent = truncatedDesc;
      cardBody.appendChild(description);

      // Actions
      const cardActions = document.createElement('div');
      cardActions.className = 'card-actions mt-auto items-center justify-between';
      cardActions.setAttribute('data-cy', 'article-footer');

      // Temps de lecture
      const readingTime = document.createElement('span');
      readingTime.className = 'text-secondary-accessible text-xs';
      readingTime.setAttribute('data-cy', 'article-reading-time');
      readingTime.textContent = `${post.readingTime} min`;
      cardActions.appendChild(readingTime);

      // Bouton de lecture
      const readButton = document.createElement('a');
      readButton.href = `/blog/${post.slug}`;
      readButton.className = 'btn btn-primary btn-xs';
      readButton.setAttribute('aria-label', `Lire: ${post.data.title}`);
      readButton.setAttribute('data-cy', 'article-read-button');
      readButton.textContent = translations.readText + ' ';

      // Icône SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '12');
      svg.setAttribute('height', '12');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');

      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M7 17L17 7');
      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M7 7h10v10');

      svg.appendChild(path1);
      svg.appendChild(path2);
      readButton.appendChild(svg);

      cardActions.appendChild(readButton);
      cardBody.appendChild(cardActions);
      article.appendChild(cardBody);

      return article;
    }

    // Rendu sécurisé avec éléments DOM
    function renderArticlesGrid(posts: PostData[]): void {
      if (!articlesGrid) return;
      
      // Vider le conteneur de manière sécurisée
      while (articlesGrid.firstChild) {
        articlesGrid.removeChild(articlesGrid.firstChild);
      }
      
      // Création d'un DocumentFragment pour performance
      const fragment = document.createDocumentFragment();
      
      posts.forEach(post => {
        const articleElement = createArticleCardElement(post);
        fragment.appendChild(articleElement);
      });
      
      articlesGrid.appendChild(fragment);
    }

    // Gestionnaire d'événement optimisé
    function handleSortChange(event: Event): void {
      const target = event.target as HTMLSelectElement;
      const sortOption = target.value as SortOption;
      
      const sortedPosts = sortPosts(postsData, sortOption);
      renderArticlesGrid(sortedPosts);
    }

    // Initialisation de l'événement
    sortSelect.addEventListener('change', handleSortChange);
    
    // Cleanup optionnel pour SPA (pas nécessaire pour Astro statique)
    // window.addEventListener('beforeunload', () => {
    //   sortSelect.removeEventListener('change', handleSortChange);
    // });
  })();
}

// Auto-initialisation pour les pages de catégorie
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategorySort);
  } else {
    initializeCategorySort();
  }
} 