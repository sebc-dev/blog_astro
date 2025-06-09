import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  HeaderManager,
  initializeHeader,
  getHeaderManager,
} from "../scripts/header/index";
import { ScrollHandler } from "../scripts/header/scroll-handler";
import { MobileMenu } from "../scripts/header/mobile-menu";
import { LanguageManager } from "../scripts/header/language";
import { ThemeManager } from "../scripts/header/theme";

// Mock de tous les sous-modules
vi.mock("../scripts/header/scroll-handler", () => ({
  ScrollHandler: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

vi.mock("../scripts/header/mobile-menu", () => ({
  MobileMenu: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

vi.mock("../scripts/header/language", () => ({
  LanguageManager: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

vi.mock("../scripts/header/theme", () => ({
  ThemeManager: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

const MockedScrollHandler = vi.mocked(ScrollHandler);
const MockedMobileMenu = vi.mocked(MobileMenu);
const MockedLanguageManager = vi.mocked(LanguageManager);
const MockedThemeManager = vi.mocked(ThemeManager);

describe("HeaderManager", () => {
  let headerManager: HeaderManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset complètement les mocks des constructeurs
    MockedScrollHandler.mockReset();
    MockedMobileMenu.mockReset();
    MockedLanguageManager.mockReset();
    MockedThemeManager.mockReset();

    // Reconfigurer les mocks
    MockedScrollHandler.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as ScrollHandler,
    );
    MockedMobileMenu.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as MobileMenu,
    );
    MockedLanguageManager.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as LanguageManager,
    );
    MockedThemeManager.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as ThemeManager,
    );
  });

  afterEach(() => {
    if (headerManager) {
      headerManager.destroy();
    }
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("devrait initialiser tous les sous-modules", () => {
      headerManager = new HeaderManager();

      expect(MockedScrollHandler).toHaveBeenCalledTimes(1);
      expect(MockedMobileMenu).toHaveBeenCalledTimes(1);
      expect(MockedLanguageManager).toHaveBeenCalledTimes(1);
      expect(MockedThemeManager).toHaveBeenCalledTimes(1);
    });

    it("devrait créer une instance valide", () => {
      headerManager = new HeaderManager();

      expect(headerManager).toBeInstanceOf(HeaderManager);
    });
  });

  describe("getters", () => {
    beforeEach(() => {
      headerManager = new HeaderManager();
    });

    it("devrait retourner le ScrollHandler", () => {
      const scrollHandler = headerManager.getScrollHandler();

      expect(scrollHandler).toBeDefined();
    });

    it("devrait retourner le MobileMenu", () => {
      const mobileMenu = headerManager.getMobileMenu();

      expect(mobileMenu).toBeDefined();
    });

    it("devrait retourner le LanguageManager", () => {
      const languageManager = headerManager.getLanguageManager();

      expect(languageManager).toBeDefined();
    });

    it("devrait retourner le ThemeManager", () => {
      const themeManager = headerManager.getThemeManager();

      expect(themeManager).toBeDefined();
    });
  });

  describe("destroy", () => {
    beforeEach(() => {
      headerManager = new HeaderManager();
    });

    it("devrait appeler destroy sur tous les sous-modules", () => {
      const scrollHandler = headerManager.getScrollHandler();
      const mobileMenu = headerManager.getMobileMenu();
      const languageManager = headerManager.getLanguageManager();
      const themeManager = headerManager.getThemeManager();

      headerManager.destroy();

      expect(
        (scrollHandler as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalledTimes(1);
      expect(
        (mobileMenu as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalledTimes(1);
      expect(
        (languageManager as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalledTimes(1);
      expect(
        (themeManager as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalledTimes(1);
    });

    it("devrait pouvoir être appelé plusieurs fois sans erreur", () => {
      expect(() => {
        headerManager.destroy();
        headerManager.destroy();
        headerManager.destroy();
      }).not.toThrow();
    });
  });
});

describe("Fonctions globales", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset complètement les mocks des constructeurs
    MockedScrollHandler.mockReset();
    MockedMobileMenu.mockReset();
    MockedLanguageManager.mockReset();
    MockedThemeManager.mockReset();

    // Reconfigurer les mocks
    MockedScrollHandler.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as ScrollHandler,
    );
    MockedMobileMenu.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as MobileMenu,
    );
    MockedLanguageManager.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as LanguageManager,
    );
    MockedThemeManager.mockImplementation(
      () => ({ destroy: vi.fn() }) as unknown as ThemeManager,
    );
  });

  afterEach(() => {
    // Nettoyer après chaque test
    const currentInstance = getHeaderManager();
    if (currentInstance) {
      currentInstance.destroy();
    }
    vi.restoreAllMocks();
  });

  describe("initializeHeader", () => {
    it("devrait créer une nouvelle instance HeaderManager", () => {
      const instance = initializeHeader();

      expect(instance).toBeInstanceOf(HeaderManager);
      expect(MockedScrollHandler).toHaveBeenCalled();
      expect(MockedMobileMenu).toHaveBeenCalled();
      expect(MockedLanguageManager).toHaveBeenCalled();
      expect(MockedThemeManager).toHaveBeenCalled();
    });

    it("devrait retourner la même instance que getHeaderManager", () => {
      const initializedInstance = initializeHeader();
      const retrievedInstance = getHeaderManager();

      expect(retrievedInstance).toBe(initializedInstance);
    });

    it("devrait détruire l'instance précédente si elle existe", () => {
      // Créer une première instance
      const firstInstance = initializeHeader();
      const destroySpy = vi.spyOn(firstInstance, "destroy");

      // Créer une deuxième instance
      const secondInstance = initializeHeader();

      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(secondInstance).not.toBe(firstInstance);
      expect(getHeaderManager()).toBe(secondInstance);
    });

    it("devrait gérer le cas où l'instance précédente est null", () => {
      expect(() => {
        const instance = initializeHeader();
        expect(instance).toBeInstanceOf(HeaderManager);
      }).not.toThrow();
    });
  });

  describe("getHeaderManager", () => {
    it("devrait retourner l'instance courante après initialisation", () => {
      const initializedInstance = initializeHeader();
      const retrievedInstance = getHeaderManager();

      expect(retrievedInstance).toBe(initializedInstance);
      expect(retrievedInstance).toBeInstanceOf(HeaderManager);
    });

    it("devrait maintenir la cohérence entre plusieurs appels", () => {
      const initializedInstance = initializeHeader();
      const firstRetrieval = getHeaderManager();
      const secondRetrieval = getHeaderManager();

      expect(firstRetrieval).toBe(initializedInstance);
      expect(secondRetrieval).toBe(initializedInstance);
      expect(firstRetrieval).toBe(secondRetrieval);
    });
  });

  describe("Pattern Singleton", () => {
    it("devrait maintenir une seule instance active à la fois", () => {
      const instance1 = initializeHeader();
      const retrieved1 = getHeaderManager();

      expect(retrieved1).toBe(instance1);

      const instance2 = initializeHeader();
      const retrieved2 = getHeaderManager();

      expect(retrieved2).toBe(instance2);
      expect(retrieved2).not.toBe(instance1);
    });

    it("devrait permettre la réinitialisation complète", () => {
      // Première initialisation
      const firstInstance = initializeHeader();
      const firstDestroySpy = vi.spyOn(firstInstance, "destroy");

      expect(getHeaderManager()).toBe(firstInstance);

      // Réinitialisation
      const secondInstance = initializeHeader();

      expect(firstDestroySpy).toHaveBeenCalledTimes(1);
      expect(getHeaderManager()).toBe(secondInstance);
      expect(secondInstance).not.toBe(firstInstance);
    });
  });

  describe("Tests d'intégration", () => {
    it("devrait créer un système complet fonctionnel", () => {
      const headerManager = initializeHeader();

      // Vérifier que tous les sous-modules sont accessibles
      const scrollHandler = headerManager.getScrollHandler();
      const mobileMenu = headerManager.getMobileMenu();
      const languageManager = headerManager.getLanguageManager();
      const themeManager = headerManager.getThemeManager();

      expect(scrollHandler).toBeDefined();
      expect(mobileMenu).toBeDefined();
      expect(languageManager).toBeDefined();
      expect(themeManager).toBeDefined();

      // Vérifier le nettoyage complet
      headerManager.destroy();

      expect(
        (scrollHandler as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalled();
      expect(
        (mobileMenu as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalled();
      expect(
        (languageManager as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalled();
      expect(
        (themeManager as unknown as { destroy: ReturnType<typeof vi.fn> })
          .destroy,
      ).toHaveBeenCalled();
    });

    it("devrait supporter plusieurs cycles d'initialisation/destruction", () => {
      // Cycle 1
      const instance1 = initializeHeader();
      const destroy1Spy = vi.spyOn(instance1, "destroy");
      instance1.destroy();

      expect(destroy1Spy).toHaveBeenCalled();

      // Cycle 2
      const instance2 = initializeHeader();
      const destroy2Spy = vi.spyOn(instance2, "destroy");

      expect(instance2).not.toBe(instance1);
      expect(getHeaderManager()).toBe(instance2);

      // Cycle 3 - réinitialisation automatique
      const instance3 = initializeHeader();

      expect(destroy2Spy).toHaveBeenCalled();
      expect(instance3).not.toBe(instance2);
      expect(getHeaderManager()).toBe(instance3);
    });

    it("devrait maintenir l'état correct des modules après réinitialisations", () => {
      // Première initialisation
      initializeHeader();

      expect(MockedScrollHandler).toHaveBeenCalledTimes(1);
      expect(MockedMobileMenu).toHaveBeenCalledTimes(1);
      expect(MockedLanguageManager).toHaveBeenCalledTimes(1);
      expect(MockedThemeManager).toHaveBeenCalledTimes(1);

      // Réinitialisation
      initializeHeader();

      expect(MockedScrollHandler).toHaveBeenCalledTimes(2);
      expect(MockedMobileMenu).toHaveBeenCalledTimes(2);
      expect(MockedLanguageManager).toHaveBeenCalledTimes(2);
      expect(MockedThemeManager).toHaveBeenCalledTimes(2);
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait gérer les erreurs d'initialisation des sous-modules", () => {
      // Faire échouer l'initialisation d'un module
      MockedScrollHandler.mockImplementation(() => {
        throw new Error("Erreur d'initialisation ScrollHandler");
      });

      expect(() => {
        initializeHeader();
      }).toThrow("Erreur d'initialisation ScrollHandler");
    });

    it("devrait maintenir la cohérence même en cas d'erreur partielle", () => {
      // Simuler une erreur sur le deuxième module
      MockedMobileMenu.mockImplementation(() => {
        throw new Error("Erreur MobileMenu");
      });

      expect(() => {
        initializeHeader();
      }).toThrow("Erreur MobileMenu");

      // Vérifier que le premier module a quand même été initialisé
      expect(MockedScrollHandler).toHaveBeenCalled();
    });
  });

  describe("Auto-initialisation DOMContentLoaded", () => {
    it("devrait s'auto-initialiser au chargement du DOM", () => {
      // Vérifier qu'une instance existe déjà
      const existingInstance = getHeaderManager();
      expect(existingInstance).toBeDefined();

      // Simuler un nouvel événement DOMContentLoaded
      const domContentLoadedEvent = new Event("DOMContentLoaded");
      const destroySpy = existingInstance
        ? vi.spyOn(existingInstance, "destroy")
        : null;

      document.dispatchEvent(domContentLoadedEvent);

      // Vérifier qu'une nouvelle instance a été créée
      if (destroySpy) {
        expect(destroySpy).toHaveBeenCalled();
      }

      const newInstance = getHeaderManager();
      expect(newInstance).toBeDefined();
      expect(newInstance).toBeInstanceOf(HeaderManager);
    });
  });
});
