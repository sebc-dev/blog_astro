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
  let mockHeaderElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset des listeners d'événements mockés
    Object.keys(mockScrollEventListeners).forEach(key => {
      mockScrollEventListeners[key] = [];
    });

    // Création d'un élément header mocké
    mockHeaderElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    } as unknown as HTMLElement;

    // Configuration par défaut : header trouvé
    mockGetElementById.mockReturnValue(mockHeaderElement);

    // Reset scrollY
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  afterEach(() => {
    if (scrollHandler) {
      scrollHandler.destroy();
    }
  });

  describe("constructor", () => {
    it("devrait initialiser avec l'ID par défaut 'main-header'", () => {
      scrollHandler = new ScrollHandler();

      expect(mockGetElementById).toHaveBeenCalledWith("main-header");
    });

    it("devrait initialiser avec un ID personnalisé", () => {
      const customId = "custom-header";
      scrollHandler = new ScrollHandler(customId);

      expect(mockGetElementById).toHaveBeenCalledWith(customId);
    });

    it("devrait configurer l'événement de scroll avec les bonnes options", () => {
      scrollHandler = new ScrollHandler();

      expect(window.addEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        { passive: true }
      );
    });

    it("devrait gérer le cas où l'élément header n'existe pas", () => {
      mockGetElementById.mockReturnValue(null);

      expect(() => {
        scrollHandler = new ScrollHandler();
      }).not.toThrow();

      expect(mockGetElementById).toHaveBeenCalledWith("main-header");
    });
  });

  describe("handleScroll", () => {
    beforeEach(() => {
      scrollHandler = new ScrollHandler();
    });

    it("devrait rendre le header transparent quand on scroll au-delà du threshold", () => {
      triggerScrollEvent(150); // Au-dessus du threshold de 100

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );
    });

    it("devrait rendre le header opaque quand on est en haut de page", () => {
      // D'abord scroll vers le bas
      triggerScrollEvent(150);
      vi.clearAllMocks();

      // Puis retour en haut
      triggerScrollEvent(50); // En-dessous du threshold de 100

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );
    });

    it("devrait gérer exactement le threshold (100px)", () => {
      triggerScrollEvent(100); // Exactement au threshold (pas supérieur, donc opaque)

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );
    });

    it("devrait gérer le scroll à 0px (top de la page)", () => {
      triggerScrollEvent(0);

      expect(mockRemoveClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );
    });

    it("ne devrait rien faire si le header n'existe pas", () => {
      // Créer un ScrollHandler sans header
      scrollHandler.destroy(); // Nettoyer l'instance précédente
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
        mockHeaderElement,
        "bg-base-100/95"
      );
    });

    it("devrait gérer plusieurs changements de direction de scroll", () => {
      // Scroll vers le bas
      triggerScrollEvent(200);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );

      vi.clearAllMocks();

      // Scroll vers le haut
      triggerScrollEvent(50);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );

      vi.clearAllMocks();

      // Scroll à nouveau vers le bas
      triggerScrollEvent(300);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
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

      // Démarrage en haut de page
      triggerScrollEvent(0);
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );

      vi.clearAllMocks();

      // Scroll progressif vers le bas
      triggerScrollEvent(50); // Encore opaque
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );

      vi.clearAllMocks();

      triggerScrollEvent(150); // Maintenant transparent
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );

      vi.clearAllMocks();

      triggerScrollEvent(500); // Toujours transparent
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );

      vi.clearAllMocks();

      // Retour vers le haut
      triggerScrollEvent(75); // Redevient opaque
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );
    });

    it("devrait préserver les performances avec passive: true", () => {
      scrollHandler = new ScrollHandler();

      // Vérifier que l'option passive est bien configurée
      expect(window.addEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        { passive: true }
      );
    });
  });

  describe("edge cases", () => {
    it("devrait gérer les valeurs de scroll négatives", () => {
      scrollHandler = new ScrollHandler();
      
      // Simuler un scroll négatif (peut arriver sur certains navigateurs)
      Object.defineProperty(window, "scrollY", { value: -10, writable: true });
      triggerScrollEvent(-10);

      // Devrait traiter comme 0 (en haut de page)
      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/95"
      );
    });

    it("devrait gérer les très grandes valeurs de scroll", () => {
      scrollHandler = new ScrollHandler();
      
      triggerScrollEvent(999999);

      expect(mockAddClass).toHaveBeenCalledWith(
        mockHeaderElement,
        "bg-base-100/60",
        "border-transparent"
      );
    });

    it("devrait fonctionner même si classList n'existe pas", () => {
      // Créer un élément mock sans classList
      const mockBrokenElement = {} as HTMLElement;
      mockGetElementById.mockReturnValue(mockBrokenElement);

      expect(() => {
        scrollHandler = new ScrollHandler();
        triggerScrollEvent(150);
      }).not.toThrow();
    });
  });
}); 