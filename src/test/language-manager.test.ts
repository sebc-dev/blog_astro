import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LanguageManager } from "../scripts/header";
import { Language } from "../scripts/header";

// Mock des dépendances
const mockClickableElements = {
  bindClickHandler: vi.fn(),
  unbindClickHandler: vi.fn(),
  destroy: vi.fn(),
  getCount: vi.fn().mockReturnValue(2),
};

const mockNavigationLinks = {
  updateTexts: vi.fn(),
  destroy: vi.fn(),
  getCount: vi.fn().mockReturnValue(3),
};

const mockLanguageIndicators = {
  updateAll: vi.fn(),
  destroy: vi.fn(),
  getCount: vi.fn().mockReturnValue(2),
};

const mockDropdownButtons = {
  setAriaExpanded: vi.fn(),
  setAllAriaExpanded: vi.fn(),
  bindAriaHandlers: vi.fn(),
  destroy: vi.fn(),
  getCount: vi.fn().mockReturnValue(2),
};

vi.mock("../scripts/header/dom-collections", () => ({
  ClickableElements: vi.fn().mockImplementation(() => mockClickableElements),
  NavigationLinks: vi.fn().mockImplementation(() => mockNavigationLinks),
  LanguageIndicators: vi.fn().mockImplementation(() => mockLanguageIndicators),
  DropdownButtons: vi.fn().mockImplementation(() => mockDropdownButtons),
}));

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("LanguageManager", () => {
  let languageManager: LanguageManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    // Reset dropdown buttons mock
    mockDropdownButtons.setAriaExpanded.mockClear();
    mockDropdownButtons.setAllAriaExpanded.mockClear();
    mockDropdownButtons.bindAriaHandlers.mockClear();
  });

  afterEach(() => {
    if (languageManager) {
      languageManager.destroy();
    }
  });

  describe("constructor", () => {
    it("devrait initialiser avec la langue par défaut (français)", () => {
      languageManager = new LanguageManager();

      expect(languageManager.getCurrentLanguage().getCode()).toBe("fr");
      expect(languageManager.getCurrentLanguage().isFrench()).toBe(true);
    });

    it("devrait charger la langue sauvegardée depuis localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("en");

      languageManager = new LanguageManager();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        "preferred-language",
      );
      expect(languageManager.getCurrentLanguage().getCode()).toBe("en");
    });

    it("devrait ignorer une langue invalide dans localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-lang");

      languageManager = new LanguageManager();

      expect(languageManager.getCurrentLanguage().getCode()).toBe("fr");
    });

    it("devrait configurer les gestionnaires d'événements", () => {
      languageManager = new LanguageManager();

      expect(mockClickableElements.bindClickHandler).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockDropdownButtons.bindAriaHandlers).toHaveBeenCalled();
    });
  });

  describe("updateLanguage", () => {
    beforeEach(() => {
      languageManager = new LanguageManager();
    });

    it("devrait mettre à jour la langue courante", () => {
      const englishLang = new Language("en");

      languageManager.updateLanguage(englishLang);

      expect(languageManager.getCurrentLanguage().equals(englishLang)).toBe(
        true,
      );
    });

    it("devrait sauvegarder la langue dans localStorage", () => {
      const englishLang = new Language("en");

      languageManager.updateLanguage(englishLang);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "preferred-language",
        "en",
      );
    });

    it("devrait mettre à jour l'affichage des éléments UI", () => {
      const englishLang = new Language("en");

      languageManager.updateLanguage(englishLang);

      expect(mockLanguageIndicators.updateAll).toHaveBeenCalledWith("EN");
      expect(mockNavigationLinks.updateTexts).toHaveBeenCalledWith(false); // false car c'est l'anglais
      expect(mockDropdownButtons.setAllAriaExpanded).toHaveBeenCalledWith(
        false,
      ); // Fermer les dropdowns après sélection
    });

    it("devrait gérer le passage du français à l'anglais", () => {
      const englishLang = new Language("en");

      languageManager.updateLanguage(englishLang);

      expect(languageManager.getCurrentLanguage().isEnglish()).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "preferred-language",
        "en",
      );
    });

    it("devrait gérer le passage de l'anglais au français", () => {
      // Commencer avec l'anglais
      languageManager.updateLanguage(new Language("en"));
      vi.clearAllMocks();

      const frenchLang = new Language("fr");
      languageManager.updateLanguage(frenchLang);

      expect(languageManager.getCurrentLanguage().isFrench()).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "preferred-language",
        "fr",
      );
    });
  });

  describe("getCurrentLanguage", () => {
    beforeEach(() => {
      languageManager = new LanguageManager();
    });

    it("devrait retourner la langue courante", () => {
      const currentLang = languageManager.getCurrentLanguage();

      expect(currentLang).toBeInstanceOf(Language);
      expect(currentLang.getCode()).toBe("fr");
    });

    it("devrait retourner la langue mise à jour", () => {
      const englishLang = new Language("en");
      languageManager.updateLanguage(englishLang);

      const currentLang = languageManager.getCurrentLanguage();

      expect(currentLang.equals(englishLang)).toBe(true);
    });
  });

  describe("handleLanguageClick", () => {
    beforeEach(() => {
      languageManager = new LanguageManager();
    });

    it("devrait configurer les gestionnaires de clic", () => {
      // Vérifier que bindClickHandler a été appelé avec une fonction
      expect(mockClickableElements.bindClickHandler).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    // Note: Les tests de handleLanguageClick nécessiteraient d'accéder à des méthodes privées
    // Ce qui n'est pas recommandé. Ces fonctionnalités sont testées via updateLanguage.
  });

  describe("loadSavedLanguage", () => {
    it("devrait charger le français depuis localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("fr");

      languageManager = new LanguageManager();

      expect(languageManager.getCurrentLanguage().getCode()).toBe("fr");
    });

    it("devrait charger l'anglais depuis localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("en");

      languageManager = new LanguageManager();

      expect(languageManager.getCurrentLanguage().getCode()).toBe("en");
    });

    it("devrait utiliser la langue par défaut si localStorage est vide", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      languageManager = new LanguageManager();

      expect(languageManager.getCurrentLanguage().getCode()).toBe("fr");
    });

    it("devrait utiliser la langue par défaut si localStorage contient une valeur invalide", () => {
      mockLocalStorage.getItem.mockReturnValue("es");

      languageManager = new LanguageManager();

      expect(languageManager.getCurrentLanguage().getCode()).toBe("fr");
    });

    it("devrait gérer les erreurs de lecture localStorage gracieusement", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage read error");
      });

      languageManager = new LanguageManager();

      // Devrait utiliser la langue par défaut sans lever d'erreur
      expect(languageManager.getCurrentLanguage().getCode()).toBe("fr");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Impossible de charger la langue depuis localStorage:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("destroy", () => {
    beforeEach(() => {
      languageManager = new LanguageManager();
    });

    it("devrait appeler destroy() sur les DropdownButtons", () => {
      if (languageManager) {
        languageManager.destroy();
      }

      expect(mockDropdownButtons.destroy).toHaveBeenCalled();
    });

    it("devrait pouvoir être appelé plusieurs fois sans erreur", () => {
      if (languageManager) {
        languageManager.destroy();
        expect(mockDropdownButtons.destroy).toHaveBeenCalledTimes(1);

        // Deuxième appel - ne devrait pas lever d'erreur
        expect(() => languageManager.destroy()).not.toThrow();
        expect(mockDropdownButtons.destroy).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe("intégration localStorage", () => {
    it("devrait persister les changements de langue", () => {
      languageManager = new LanguageManager();

      // Changer vers l'anglais
      languageManager.updateLanguage(new Language("en"));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "preferred-language",
        "en",
      );

      // Changer vers le français
      languageManager.updateLanguage(new Language("fr"));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "preferred-language",
        "fr",
      );
    });

    it("devrait gérer les erreurs de localStorage gracieusement", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      languageManager = new LanguageManager();

      // Le LanguageManager gère maintenant les erreurs gracieusement
      expect(() => {
        languageManager.updateLanguage(new Language("en"));
      }).not.toThrow();

      // Vérifier que l'erreur est loggée
      expect(consoleSpy).toHaveBeenCalledWith(
        "Impossible de sauvegarder la langue dans localStorage:",
        expect.any(Error),
      );

      // La langue doit quand même être mise à jour en mémoire
      expect(languageManager.getCurrentLanguage().getCode()).toBe("en");

      consoleSpy.mockRestore();
    });
  });

  describe("synchronisation UI", () => {
    beforeEach(() => {
      // S'assurer que localStorage fonctionne pour ces tests
      mockLocalStorage.setItem.mockImplementation(() => {});
    });

    it("devrait synchroniser tous les éléments UI lors du changement de langue", () => {
      languageManager = new LanguageManager();

      // Test changement vers anglais
      languageManager.updateLanguage(new Language("en"));
      expect(mockLanguageIndicators.updateAll).toHaveBeenCalledWith("EN");
      expect(mockNavigationLinks.updateTexts).toHaveBeenCalledWith(false);

      // Test changement vers français
      languageManager.updateLanguage(new Language("fr"));
      expect(mockLanguageIndicators.updateAll).toHaveBeenCalledWith("FR");
      expect(mockNavigationLinks.updateTexts).toHaveBeenCalledWith(true);
    });
  });
});
