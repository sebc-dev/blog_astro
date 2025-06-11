import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ScrollHandler } from "../scripts/header/scroll-handler";

// Mock des utilitaires DOM
vi.mock("../scripts/utils/dom", () => ({
  getElementById: vi.fn(),
  addClass: vi.fn(),
  removeClass: vi.fn(),
}));

// Import des mocks après les avoir définis
import { getElementById, addClass, removeClass } from "../scripts/utils/dom";

// Récupération des fonctions mockées avec typage approprié
const mockGetElementById = vi.mocked(getElementById);
const mockAddClass = vi.mocked(addClass);
const mockRemoveClass = vi.mocked(removeClass);

// Mock de l'objet window et scroll
const mockScrollEventListeners: { [key: string]: EventListener[] } = {};

Object.defineProperty(global, "window", {
  value: {
    addEventListener: vi.fn((event: string, listener: EventListener) => {
      if (!mockScrollEventListeners[event]) {
        mockScrollEventListeners[event] = [];
      }
      mockScrollEventListeners[event].push(listener);
    }),
    removeEventListener: vi.fn((event: string, listener: EventListener) => {
      if (mockScrollEventListeners[event]) {
        const index = mockScrollEventListeners[event].indexOf(listener);
        if (index > -1) {
          mockScrollEventListeners[event].splice(index, 1);
        }
      }
    }),
    scrollY: 0,
  },
  writable: true,
});

// Fonction utilitaire pour simuler un événement de scroll
const triggerScrollEvent = (scrollY: number) => {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true });
  mockScrollEventListeners["scroll"]?.forEach((listener) => {
    listener(new Event("scroll"));
  });
};

describe("ScrollHandler", () => {
  let scrollHandler: ScrollHandler;
  let mockDesktopHeader: HTMLElement;
  let mockMobileHeader: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset des listeners d'événements mockés
    Object.keys(mockScrollEventListeners).forEach(key => {
      mockScrollEventListeners[key] = [];
    });

    // Création des éléments header mockés
    mockDesktopHeader = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    } as unknown as HTMLElement;

    mockMobileHeader = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    } as unknown as HTMLElement;

    // Configuration par défaut : headers trouvés
    mockGetElementById
      .mockReturnValueOnce(mockDesktopHeader) // desktop-header
      .mockReturnValueOnce(mockMobileHeader); // mobile-header

    // Reset scrollY
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    if (scrollHandler) {
      scrollHandler.destroy();
    }
  });

  describe("constructor", () => {
    it("devrait initialiser avec les IDs par défaut pour desktop et mobile", () => {
      scrollHandler = new ScrollHandler();

      expect(mockGetElementById).toHaveBeenCalledWith("desktop-header");
      expect(mockGetElementById).toHaveBeenCalledWith("mobile-header");
    });

    it("devrait configurer l'événement de scroll avec les bonnes options", () => {
      scrollHandler = new ScrollHandler();

      expect(window.addEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        { passive: true }
      );
    });

    it("devrait gérer le cas où les éléments header n'existent pas", () => {
      mockGetElementById.mockReset();
      mockGetElementById.mockReturnValue(null);

      expect(() => {
        scrollHandler = new ScrollHandler();
      }).not.toThrow();

      expect(mockGetElementById).toHaveBeenCalledWith("desktop-header");
      expect(mockGetElementById).toHaveBeenCalledWith("mobile-header");
    });
  });

  describe("handleScroll", () => {
    beforeEach(() => {
      scrollHandler = new ScrollHandler();
    });

    it("devrait rendre les headers transparents quand on scroll au-delà du threshold", () => {
      triggerScrollEvent(150); // Au-dessus du threshold de 100

      // Vérifier que les deux headers sont rendus transparents
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );
    });

    it("devrait rendre les headers opaques quand on est en haut de page", () => {
      // D'abord scroll vers le bas
      triggerScrollEvent(150);
      vi.clearAllMocks();

      // Puis retour en haut
      triggerScrollEvent(50); // En-dessous du threshold de 100

      // Vérifier que les deux headers sont rendus opaques
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );
    });

    it("devrait gérer exactement le threshold (100px)", () => {
      triggerScrollEvent(100); // Exactement au threshold (pas supérieur, donc opaque)

      // Vérifier que les headers restent opaques
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );
    });

    it("devrait gérer le scroll à 0px (top de la page)", () => {
      triggerScrollEvent(0);

      // Vérifier que les headers sont opaques
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );
    });

    it("ne devrait rien faire si les headers n'existent pas", () => {
      // Créer un ScrollHandler sans headers
      scrollHandler.destroy(); // Nettoyer l'instance précédente
      mockGetElementById.mockReset();
      mockGetElementById.mockReturnValue(null);
      vi.clearAllMocks(); // Nettoyer tous les appels précédents
      
      scrollHandler = new ScrollHandler();
      triggerScrollEvent(150);

      expect(mockAddClass).not.toHaveBeenCalled();
      expect(mockRemoveClass).not.toHaveBeenCalled();
    });

    it("devrait mettre à jour lastScrollY après chaque scroll", () => {
      // Test indirect : vérifier que les appels successifs sont cohérents
      triggerScrollEvent(150);
      vi.clearAllMocks();

      // Scroll à nouveau à la même position
      triggerScrollEvent(150);

      // Devrait appliquer à nouveau la logique car la condition se base sur currentScrollY
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );
    });

    it("devrait gérer plusieurs changements de direction de scroll", () => {
      // Scroll vers le bas
      triggerScrollEvent(200);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );

      vi.clearAllMocks();

      // Scroll vers le haut
      triggerScrollEvent(50);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );

      vi.clearAllMocks();

      // Scroll à nouveau vers le bas
      triggerScrollEvent(300);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );
    });
  });

  describe("destroy", () => {
    beforeEach(() => {
      scrollHandler = new ScrollHandler();
    });

    it("devrait supprimer l'événement de scroll", () => {
      scrollHandler.destroy();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function)
      );
    });

    it("devrait être appelable plusieurs fois sans erreur", () => {
      expect(() => {
        scrollHandler.destroy();
        scrollHandler.destroy();
      }).not.toThrow();
    });

    it("ne devrait plus réagir aux événements de scroll après destroy", () => {
      scrollHandler.destroy();
      
      // Nettoyer les mocks après destroy pour voir si les nouveaux événements sont ignorés
      vi.clearAllMocks();

      triggerScrollEvent(200);

      expect(mockAddClass).not.toHaveBeenCalled();
      expect(mockRemoveClass).not.toHaveBeenCalled();
    });
  });

  describe("intégration", () => {
    it("devrait gérer un scénario complet de navigation", () => {
      scrollHandler = new ScrollHandler();

      // 1. Page chargée (scroll = 0)
      triggerScrollEvent(0);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );

      vi.clearAllMocks();

      // 2. Scroll vers le bas
      triggerScrollEvent(200);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );

      vi.clearAllMocks();

      // 3. Retour en haut
      triggerScrollEvent(0);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
    });

    it("devrait préserver les performances avec passive: true", () => {
      scrollHandler = new ScrollHandler();

      expect(window.addEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        { passive: true }
      );
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      scrollHandler = new ScrollHandler();
    });

    it("devrait gérer les valeurs de scroll négatives", () => {
      triggerScrollEvent(-10);

      // Valeur négative traitée comme 0, donc header opaque
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/95"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/95"
      );
    });

    it("devrait gérer les très grandes valeurs de scroll", () => {
      triggerScrollEvent(999999);

      // Grande valeur, donc header transparent
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockMobileHeader,
        "bg-base-100/60",
        "border-transparent"
      );
    });

    it("devrait fonctionner même si un seul header existe", () => {
      scrollHandler.destroy();
      mockGetElementById.mockReset();
      mockGetElementById
        .mockReturnValueOnce(mockDesktopHeader) // desktop-header existe
        .mockReturnValueOnce(null); // mobile-header n'existe pas
      vi.clearAllMocks();

      scrollHandler = new ScrollHandler();
      triggerScrollEvent(150);

      // Seul le desktop header devrait être modifié
      expect(mockAddClass).toHaveBeenCalledWith(
        mockDesktopHeader,
        "bg-base-100/60",
        "border-transparent"
      );
      // Le mobile header ne devrait pas générer d'erreur
      expect(() => triggerScrollEvent(150)).not.toThrow();
    });
  });
}); 