// Configuration globale pour les tests Vitest
import { beforeEach } from "vitest";

// Nettoyage avant chaque test
beforeEach(() => {
  // Réinitialiser les mocks, DOM, etc.
  document.body.innerHTML = "";
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
