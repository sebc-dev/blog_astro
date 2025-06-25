// Interface pour les headings de la table des matières
export interface TocHeading {
  depth: number;
  text: string;
  slug: string;
  subheadings: TocHeading[];
}

// Interface pour les headings raw d'Astro
export interface AstroHeading {
  depth: number;
  text: string;
  slug: string;
}

/**
 * Construit une hiérarchie de table des matières à partir des headings d'Astro
 * @param headings - Array des headings extraits par Astro
 * @param minDepth - Profondeur minimale à inclure (défaut: 2)
 * @returns Hiérarchie de table des matières
 */
export function buildTocHierarchy(
  headings: AstroHeading[], 
  minDepth: number = 2
): TocHeading[] {
  const toc: TocHeading[] = [];
  const parentHeadings = new Map<number, TocHeading>();
  
  if (!headings || headings.length === 0) {
    return toc;
  }
  
  headings.forEach((heading) => {
    // Ignorer les headings plus profonds que nécessaire
    if (heading.depth < minDepth) {
      return;
    }

    const tocHeading: TocHeading = { 
      depth: heading.depth,
      text: heading.text,
      slug: heading.slug,
      subheadings: [] 
    };
    
    parentHeadings.set(tocHeading.depth, tocHeading);
    
    // Élément de niveau racine (par défaut H2)
    if (tocHeading.depth === minDepth) {
      toc.push(tocHeading);
    } else {
      // Trouve le parent le plus proche
      const parent = parentHeadings.get(tocHeading.depth - 1);
      if (parent) {
        parent.subheadings.push(tocHeading);
      } else {
        // Fallback : si pas de parent direct (ex: H2 → H4 sans H3),
        // chercher le parent de niveau supérieur le plus proche
        for (let i = tocHeading.depth - 2; i >= minDepth; i--) {
          const fallbackParent = parentHeadings.get(i);
          if (fallbackParent) {
            fallbackParent.subheadings.push(tocHeading);
            break;
          }
        }
      }
    }
  });
  
  return toc;
}

/**
 * Filtre les headings par profondeur maximale
 * @param headings - Array des headings
 * @param maxDepth - Profondeur maximale à inclure
 * @returns Headings filtrés
 */
export function filterHeadingsByDepth(
  headings: AstroHeading[], 
  maxDepth: number = 4
): AstroHeading[] {
  return headings.filter(heading => heading.depth <= maxDepth);
}

/**
 * Compte les headings par niveau
 * @param headings - Array des headings
 * @returns Objet avec le nombre de headings par niveau
 */
export function countHeadingsByLevel(headings: AstroHeading[]): Record<number, number> {
  return headings.reduce((acc, heading) => {
    acc[heading.depth] = (acc[heading.depth] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
}

/**
 * Vérifie si un article a suffisamment de contenu pour une table des matières
 * @param headings - Array des headings
 * @param minHeadings - Nombre minimum de headings requis (défaut: 3)
 * @returns true si l'article mérite une table des matières
 */
export function shouldShowToc(headings: AstroHeading[], minHeadings: number = 3): boolean {
  return Boolean(headings && headings.length >= minHeadings);
} 