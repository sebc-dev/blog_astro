import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MobileMenu } from "../scripts/header/mobile-menu";
import * as domUtils from "../scripts/utils/dom";

// Mock des utilitaires DOM
vi.mock("../scripts/utils/dom", () => ({
  getElementById: vi.fn(),
  addClass: vi.fn(),
  removeClass: vi.fn(),
  setBodyOverflow: vi.fn(),
  querySelectorAll: vi.fn(),
}));

const mockGetElementById = vi.mocked(domUtils.getElementById);
const mockAddClass = vi.mocked(domUtils.addClass);
const mockRemoveClass = vi.mocked(domUtils.removeClass);
const mockSetBodyOverflow = vi.mocked(domUtils.setBodyOverflow);
const mockQuerySelectorAll = vi.mocked(domUtils.querySelectorAll);

describe("MobileMenu", () => {
  let mobileMenu: MobileMenu;
  let mockCheckbox: HTMLInputElement;
  let mockOverlay: HTMLElement;
  let mockContent: HTMLElement;
  let mockNavLinks: NodeListOf<HTMLElement>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Créer des éléments DOM simulés
    mockCheckbox = {
      checked: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLInputElement;

    mockOverlay = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    mockContent = {} as HTMLElement;

    // Simuler NodeListOf pour les liens de navigation
    const navLink1 = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    const navLink2 = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    mockNavLinks = {
      length: 2,
      item: vi.fn(),
      forEach: vi.fn((callback) => {
        callback(navLink1, 0, mockNavLinks);
        callback(navLink2, 1, mockNavLinks);
      }),
      [0]: navLink1,
      [1]: navLink2,
    } as unknown as NodeListOf<HTMLElement>;

    // Configuration des mocks pour retourner les éléments simulés
    mockGetElementById
      .mockReturnValueOnce(mockCheckbox) // mobile-menu
      .mockReturnValueOnce(mockOverlay) // mobile-overlay
      .mockReturnValueOnce(mockContent); // mobile-menu-content

    mockQuerySelectorAll.mockReturnValue(mockNavLinks);
  });

  afterEach(() => {
    if (mobileMenu) {
      mobileMenu.destroy();
    }
  });

  describe("constructor", () => {
    it("devrait initialiser les références DOM correctement", () => {
      mobileMenu = new MobileMenu();

      expect(mockGetElementById).toHaveBeenCalledWith("mobile-menu");
      expect(mockGetElementById).toHaveBeenCalledWith("mobile-overlay");
      expect(mockGetElementById).toHaveBeenCalledWith("mobile-menu-content");
      expect(mockQuerySelectorAll).toHaveBeenCalledWith(".mobile-nav-link");
    });

    it("devrait configurer les événements sur la checkbox", () => {
      mobileMenu = new MobileMenu();

      expect(mockCheckbox.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("devrait configurer les événements sur l'overlay", () => {
      mobileMenu = new MobileMenu();

      expect(mockOverlay.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("devrait configurer les événements sur tous les liens de navigation", () => {
      mobileMenu = new MobileMenu();

      expect(mockNavLinks.forEach).toHaveBeenCalled();
    });

    it("devrait gérer les éléments DOM manquants sans erreur", () => {
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null) // mobile-menu
        .mockReturnValueOnce(null) // mobile-overlay
        .mockReturnValueOnce(null); // mobile-menu-content
      
      const emptyNodeList = {
        length: 0,
        item: vi.fn().mockReturnValue(null),
        forEach: vi.fn(),
      } as unknown as NodeListOf<HTMLElement>;
      
      mockQuerySelectorAll.mockReturnValue(emptyNodeList);

      expect(() => {
        mobileMenu = new MobileMenu();
      }).not.toThrow();
    });
  });

  describe("open", () => {
    beforeEach(() => {
      mobileMenu = new MobileMenu();
    });

    it("devrait supprimer les classes d'overlay pour rendre visible", () => {
      mobileMenu.open();

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockOverlay,
        "opacity-0",
        "pointer-events-none"
      );
    });

    it("devrait supprimer la classe de translation du contenu", () => {
      mobileMenu.open();

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockContent,
        "translate-x-full"
      );
    });

    it("devrait bloquer le scroll du body", () => {
      mobileMenu.open();

      expect(mockSetBodyOverflow).toHaveBeenCalledWith(true);
    });
  });

  describe("close", () => {
    beforeEach(() => {
      mobileMenu = new MobileMenu();
    });

    it("devrait décocher la checkbox", () => {
      mockCheckbox.checked = true;

      mobileMenu.close();

      expect(mockCheckbox.checked).toBe(false);
    });

    it("devrait ajouter les classes d'overlay pour masquer", () => {
      mobileMenu.close();

      expect(mockAddClass).toHaveBeenCalledWith(
        mockOverlay,
        "opacity-0",
        "pointer-events-none"
      );
    });

    it("devrait ajouter la classe de translation au contenu", () => {
      mobileMenu.close();

      expect(mockAddClass).toHaveBeenCalledWith(
        mockContent,
        "translate-x-full"
      );
    });

    it("devrait rétablir le scroll du body", () => {
      mobileMenu.close();

      expect(mockSetBodyOverflow).toHaveBeenCalledWith(false);
    });

    it("devrait gérer le cas où la checkbox est null", () => {
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null) // mobile-menu
        .mockReturnValueOnce(mockOverlay) // mobile-overlay
        .mockReturnValueOnce(mockContent); // mobile-menu-content

      mobileMenu = new MobileMenu();

      expect(() => {
        mobileMenu.close();
      }).not.toThrow();
    });
  });

  describe("gestion des événements", () => {
    beforeEach(() => {
      mobileMenu = new MobileMenu();
    });

    it("devrait configurer correctement tous les event listeners", () => {
      // Vérifier que les event listeners sont bien configurés
      expect(mockCheckbox.addEventListener).toHaveBeenCalled();
      expect(mockOverlay.addEventListener).toHaveBeenCalled();
      expect(mockNavLinks.forEach).toHaveBeenCalled();
    });
  });

  describe("destroy", () => {
    beforeEach(() => {
      mobileMenu = new MobileMenu();
    });

    it("devrait supprimer l'événement de la checkbox", () => {
      mobileMenu.destroy();

      expect(mockCheckbox.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("devrait supprimer l'événement de l'overlay", () => {
      mobileMenu.destroy();

      expect(mockOverlay.removeEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("devrait supprimer les événements de tous les liens de navigation", () => {
      mobileMenu.destroy();

      expect(mockNavLinks.forEach).toHaveBeenCalled();
    });

    it("devrait gérer les éléments null sans erreur", () => {
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(null) // mobile-menu
        .mockReturnValueOnce(null) // mobile-overlay
        .mockReturnValueOnce(null); // mobile-menu-content
      
      const emptyNodeList = {
        length: 0,
        item: vi.fn().mockReturnValue(null),
        forEach: vi.fn(),
      } as unknown as NodeListOf<HTMLElement>;
      
      mockQuerySelectorAll.mockReturnValue(emptyNodeList);

      mobileMenu = new MobileMenu();

      expect(() => {
        mobileMenu.destroy();
      }).not.toThrow();
    });
  });

  describe("intégration - scénarios complets", () => {
    beforeEach(() => {
      mobileMenu = new MobileMenu();
    });

    it("devrait gérer un cycle complet d'ouverture/fermeture", () => {
      // 1. Ouvrir le menu
      mobileMenu.open();

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockOverlay,
        "opacity-0",
        "pointer-events-none"
      );
      expect(mockSetBodyOverflow).toHaveBeenCalledWith(true);

      vi.clearAllMocks();

      // 2. Fermer le menu
      mobileMenu.close();

      expect(mockCheckbox.checked).toBe(false);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockOverlay,
        "opacity-0",
        "pointer-events-none"
      );
      expect(mockSetBodyOverflow).toHaveBeenCalledWith(false);
    });

    it("devrait gérer plusieurs interactions successives", () => {
      // Ouvrir
      mobileMenu.open();
      expect(mockSetBodyOverflow).toHaveBeenCalledWith(true);

      vi.clearAllMocks();

      // Fermer
      mobileMenu.close();
      expect(mockSetBodyOverflow).toHaveBeenCalledWith(false);
      expect(mockCheckbox.checked).toBe(false);

      vi.clearAllMocks();

      // Rouvrir
      mobileMenu.open();
      expect(mockSetBodyOverflow).toHaveBeenCalledWith(true);
    });
  });
}); 