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
    background: hsl(var(--b1) / 0.85);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
  }
  
  .header-critical.scrolled {
    background: hsl(var(--b1) / 0.75);
    backdrop-filter: blur(20px);
  }
  
  @media (prefers-color-scheme: dark) {
    .header-critical {
      background: hsl(var(--b1) / 0.85);
    }
    .header-critical.scrolled {
      background: hsl(var(--b1) / 0.50);
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .header-critical {
      transition: none !important;
    }
  }
`.trim();
}
