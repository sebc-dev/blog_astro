/**
 * Module utilitaire pour la génération des styles critiques du Header
 * Centralise le CSS critique pour éviter la duplication entre composant et tests
 */

/**
 * Génère le CSS critique pour le composant Header
 *
 * Ce CSS est critique car il définit le positionnement et les styles de base
 * du header qui doivent être appliqués immédiatement pour éviter le layout shift.
 *
 * @returns Le CSS critique sous forme de chaîne de caractères
 */
export function generateCriticalCSS(): string {
  return `
  .header-critical {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .header-critical {
      transition: none !important;
    }
  }
`.trim();
}
