// Configuration globale pour les tests Vitest
import { beforeEach } from "vitest";
import '@testing-library/jest-dom/vitest';
import { resetTranslationIdCache } from '../content/config';

// Nettoyage avant chaque test
beforeEach(() => {
  // Réinitialiser les mocks, DOM, etc.
  document.body.innerHTML = "";
  
  // Réinitialiser le cache des translationId pour éviter les faux positifs
  resetTranslationIdCache();
});

// Configuration globale pour jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
