import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ThemeManager } from "../scripts/header/theme";
import * as domUtils from "../scripts/utils/dom";

// Mock des utilitaires DOM
vi.mock("../scripts/utils/dom", () => ({
  getElementById: vi.fn(),
}));

const mockGetElementById = vi.mocked(domUtils.getElementById);

// Mock de MutationObserver
class MockMutationObserver {
  callback: MutationCallback;
  
  constructor(callback: MutationCallback) {
    this.callback = callback;
  }
  
  observe = vi.fn();
  disconnect = vi.fn();
  
  // Méthode helper pour simuler des mutations
  trigger() {
    this.callback([], this);
  }
}

// Mock global de MutationObserver
const mockMutationObserver = vi.fn().mockImplementation((callback) => {
  return new MockMutationObserver(callback);
});

Object.defineProperty(global, 'MutationObserver', {
  value: mockMutationObserver,
  writable: true,
});

describe("ThemeManager", () => {
  let themeManager: ThemeManager;
  let mockDesktopToggle: HTMLInputElement;
  let mockMobileToggle: HTMLInputElement;
  let mockDocumentElement: HTMLElement;
  let observerInstance: MockMutationObserver;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock du document.documentElement
    mockDocumentElement = {
      getAttribute: vi.fn(),
    } as unknown as HTMLElement;

    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    });

    // Créer des toggles simulés
    mockDesktopToggle = {
      checked: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLInputElement;

    mockMobileToggle = {
      checked: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLInputElement;

    // Configuration des mocks pour retourner les éléments simulés
    mockGetElementById
      .mockReturnValueOnce(mockDesktopToggle) // theme-toggle
      .mockReturnValueOnce(mockMobileToggle); // mobile-theme-toggle

    // Capturer l'instance de l'observer pour les tests
    mockMutationObserver.mockImplementation((callback) => {
      observerInstance = new MockMutationObserver(callback);
      return observerInstance;
    });
  });

  afterEach(() => {
    if (themeManager) {
      themeManager.destroy();
    }
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("devrait initialiser les références DOM correctement", () => {
      themeManager = new ThemeManager();

      expect(mockGetElementById).toHaveBeenCalledWith("theme-toggle");
      expect(mockGetElementById).toHaveBeenCalledWith("mobile-theme-toggle");
    });

    it("devrait synchroniser l'état des toggles avec le thème actuel", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      
      themeManager = new ThemeManager();

      expect(mockDesktopToggle.checked).toBe(true);
      expect(mockMobileToggle.checked).toBe(true);
    });

    it("devrait configurer les événements sur le toggle desktop", () => {
      themeManager = new ThemeManager();

      expect(mockDesktopToggle.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("devrait configurer les événements sur le toggle mobile", () => {
      themeManager = new ThemeManager();

      expect(mockMobileToggle.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("devrait configurer l'observateur de mutations", () => {
      themeManager = new ThemeManager();

      expect(mockMutationObserver).toHaveBeenCalledWith(expect.any(Function));
      expect(observerInstance.observe).toHaveBeenCalledWith(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    });

    it("devrait gérer les toggles manquants sans erreur", () => {
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null) // theme-toggle
        .mockReturnValueOnce(null); // mobile-theme-toggle

      expect(() => {
        themeManager = new ThemeManager();
      }).not.toThrow();
    });
  });

  describe("syncThemeToggles", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait synchroniser les toggles avec le thème sombre", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      
      themeManager.sync();

      expect(mockDesktopToggle.checked).toBe(true);
      expect(mockMobileToggle.checked).toBe(true);
    });

    it("devrait synchroniser les toggles avec le thème clair", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("light");
      
      themeManager.sync();

      expect(mockDesktopToggle.checked).toBe(false);
      expect(mockMobileToggle.checked).toBe(false);
    });

    it("devrait traiter l'absence de thème comme thème clair", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue(null);
      
      themeManager.sync();

      expect(mockDesktopToggle.checked).toBe(false);
      expect(mockMobileToggle.checked).toBe(false);
    });

    it("devrait gérer les toggles manquants sans erreur", () => {
      // Recréer avec des éléments null
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);
      
      const themeManagerWithNullToggles = new ThemeManager();
      
      expect(() => {
        themeManagerWithNullToggles.sync();
      }).not.toThrow();
      
      themeManagerWithNullToggles.destroy();
    });
  });

  describe("handleDesktopChange", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait synchroniser le toggle mobile quand le desktop change", () => {
      // Simuler un changement sur le toggle desktop
      mockDesktopToggle.checked = true;
      const changeEvent = new Event("change");
      Object.defineProperty(changeEvent, "target", {
        value: mockDesktopToggle,
        writable: false,
      });

      // Déclencher l'événement
      const changeHandler = vi.mocked(mockDesktopToggle.addEventListener).mock.calls[0][1] as EventListener;
      changeHandler(changeEvent);

      expect(mockMobileToggle.checked).toBe(true);
    });

    it("devrait gérer l'absence du toggle mobile", () => {
      // Recréer avec un mobile toggle null
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(mockDesktopToggle)
        .mockReturnValueOnce(null);
      
      const themeManagerWithoutMobile = new ThemeManager();
      
      // Simuler un changement sur le toggle desktop
      mockDesktopToggle.checked = true;
      const changeEvent = new Event("change");
      Object.defineProperty(changeEvent, "target", {
        value: mockDesktopToggle,
        writable: false,
      });

      expect(() => {
        const changeHandler = vi.mocked(mockDesktopToggle.addEventListener).mock.calls[0][1] as EventListener;
        changeHandler(changeEvent);
      }).not.toThrow();
      
      themeManagerWithoutMobile.destroy();
    });
  });

  describe("handleMobileChange", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait synchroniser le toggle desktop quand le mobile change", () => {
      // Simuler un changement sur le toggle mobile
      mockMobileToggle.checked = true;
      const changeEvent = new Event("change");
      Object.defineProperty(changeEvent, "target", {
        value: mockMobileToggle,
        writable: false,
      });

      // Déclencher l'événement
      const changeHandler = vi.mocked(mockMobileToggle.addEventListener).mock.calls[0][1] as EventListener;
      changeHandler(changeEvent);

      expect(mockDesktopToggle.checked).toBe(true);
    });

    it("devrait gérer l'absence du toggle desktop", () => {
      // Recréer avec un desktop toggle null
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockMobileToggle);
      
      const themeManagerWithoutDesktop = new ThemeManager();
      
      // Simuler un changement sur le toggle mobile
      mockMobileToggle.checked = true;
      const changeEvent = new Event("change");
      Object.defineProperty(changeEvent, "target", {
        value: mockMobileToggle,
        writable: false,
      });

      expect(() => {
        const changeHandler = vi.mocked(mockMobileToggle.addEventListener).mock.calls[0][1] as EventListener;
        changeHandler(changeEvent);
      }).not.toThrow();
      
      themeManagerWithoutDesktop.destroy();
    });
  });

  describe("setupThemeObserver", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait synchroniser les toggles quand le thème change", () => {
      // Configurer un thème initial
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("light");
      mockDesktopToggle.checked = false;
      mockMobileToggle.checked = false;

      // Changer le thème
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      
      // Déclencher l'observateur
      observerInstance.trigger();

      expect(mockDesktopToggle.checked).toBe(true);
      expect(mockMobileToggle.checked).toBe(true);
    });

    it("devrait observer les changements d'attributs data-theme", () => {
      expect(observerInstance.observe).toHaveBeenCalledWith(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    });
  });

  describe("isDarkTheme", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait retourner true quand le thème est sombre", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      
      expect(themeManager.isDarkTheme()).toBe(true);
    });

    it("devrait retourner false quand le thème est clair", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("light");
      
      expect(themeManager.isDarkTheme()).toBe(false);
    });

    it("devrait retourner false quand aucun thème n'est défini", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue(null);
      
      expect(themeManager.isDarkTheme()).toBe(false);
    });

    it("devrait retourner false pour un thème inconnu", () => {
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("auto");
      
      expect(themeManager.isDarkTheme()).toBe(false);
    });
  });

  describe("sync", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait forcer la synchronisation des toggles", () => {
      // Configurer un état initial différent
      mockDesktopToggle.checked = false;
      mockMobileToggle.checked = false;
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      
      themeManager.sync();

      expect(mockDesktopToggle.checked).toBe(true);
      expect(mockMobileToggle.checked).toBe(true);
    });
  });

  describe("destroy", () => {
    beforeEach(() => {
      themeManager = new ThemeManager();
    });

    it("devrait supprimer les événements du toggle desktop", () => {
      themeManager.destroy();

      expect(mockDesktopToggle.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("devrait supprimer les événements du toggle mobile", () => {
      themeManager.destroy();

      expect(mockMobileToggle.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("devrait déconnecter l'observateur de mutations", () => {
      themeManager.destroy();

      expect(observerInstance.disconnect).toHaveBeenCalled();
    });

    it("devrait gérer les toggles manquants sans erreur", () => {
      // Recréer avec des éléments null
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);
      
      const themeManagerWithNullToggles = new ThemeManager();
      
      expect(() => {
        themeManagerWithNullToggles.destroy();
      }).not.toThrow();
    });

    it("devrait gérer l'observateur manquant sans erreur", () => {
      // Simuler un observateur null
      if (themeManager && (themeManager as any).observer) {
        (themeManager as any).observer = null;
      }
      
      expect(() => {
        themeManager.destroy();
      }).not.toThrow();
    });
  });

  describe("Tests d'intégration", () => {
    it("devrait synchroniser correctement les toggles lors de cycles complets", () => {
      themeManager = new ThemeManager();

      // Scénario 1: Changement desktop -> mobile
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("light");
      mockDesktopToggle.checked = true;
      const desktopChangeEvent = new Event("change");
      Object.defineProperty(desktopChangeEvent, "target", {
        value: mockDesktopToggle,
        writable: false,
      });

      const desktopHandler = vi.mocked(mockDesktopToggle.addEventListener).mock.calls[0][1] as EventListener;
      desktopHandler(desktopChangeEvent);

      expect(mockMobileToggle.checked).toBe(true);

      // Scénario 2: Changement mobile -> desktop
      mockMobileToggle.checked = false;
      const mobileChangeEvent = new Event("change");
      Object.defineProperty(mobileChangeEvent, "target", {
        value: mockMobileToggle,
        writable: false,
      });

      const mobileHandler = vi.mocked(mockMobileToggle.addEventListener).mock.calls[0][1] as EventListener;
      mobileHandler(mobileChangeEvent);

      expect(mockDesktopToggle.checked).toBe(false);
    });

    it("devrait maintenir la cohérence lors de changements de thème externes", () => {
      themeManager = new ThemeManager();

      // État initial
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("light");
      themeManager.sync();
      expect(mockDesktopToggle.checked).toBe(false);
      expect(mockMobileToggle.checked).toBe(false);

      // Changement externe du thème
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      observerInstance.trigger();

      expect(mockDesktopToggle.checked).toBe(true);
      expect(mockMobileToggle.checked).toBe(true);

      // Retour au thème clair
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("light");
      observerInstance.trigger();

      expect(mockDesktopToggle.checked).toBe(false);
      expect(mockMobileToggle.checked).toBe(false);
    });
  });

  describe("Gestion des cas limites", () => {
    it("devrait fonctionner avec un seul toggle disponible", () => {
      // Créer avec seulement le toggle desktop
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(mockDesktopToggle)
        .mockReturnValueOnce(null);
      
      const partialThemeManager = new ThemeManager();
      
      // Vérifier que la synchronisation fonctionne
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      partialThemeManager.sync();
      
      expect(mockDesktopToggle.checked).toBe(true);
      
      partialThemeManager.destroy();
    });

    it("devrait gérer les thèmes avec des valeurs non-standard", () => {
      themeManager = new ThemeManager();

      // Tester avec des valeurs non-standard
      const nonStandardThemes = ["", "undefined", "null", "auto", "system"];
      
      nonStandardThemes.forEach(theme => {
        vi.mocked(mockDocumentElement.getAttribute).mockReturnValue(theme);
        expect(themeManager.isDarkTheme()).toBe(false);
      });
    });

    it("devrait maintenir l'état correct après plusieurs destroy/recreate", () => {
      // Premier cycle
      themeManager = new ThemeManager();
      vi.mocked(mockDocumentElement.getAttribute).mockReturnValue("dark");
      themeManager.sync();
      expect(mockDesktopToggle.checked).toBe(true);
      themeManager.destroy();

      // Reset des mocks pour le deuxième cycle
      mockDesktopToggle.checked = false;
      mockMobileToggle.checked = false;
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(mockDesktopToggle)
        .mockReturnValueOnce(mockMobileToggle);

      // Deuxième cycle
      const newThemeManager = new ThemeManager();
      expect(mockDesktopToggle.checked).toBe(true); // Doit être synchronisé automatiquement
      expect(mockMobileToggle.checked).toBe(true);
      newThemeManager.destroy();
    });
  });
});