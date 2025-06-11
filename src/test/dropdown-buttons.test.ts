import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { DropdownButtons } from "../scripts/header/dom-collections";
import { CssSelector } from "../scripts/header/value-objects";
import * as domUtils from "../scripts/utils/dom";

// Mock des fonctions DOM
vi.mock("../scripts/utils/dom", () => ({
  querySelectorAll: vi.fn(),
}));

interface MockHTMLElement {
  matches: ReturnType<typeof vi.fn>;
  setAttribute: ReturnType<typeof vi.fn>;
  getAttribute: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  closest: ReturnType<typeof vi.fn>;
}

describe("DropdownButtons", () => {
  let dropdownButtons: DropdownButtons;
  let mockButtons: MockHTMLElement[];
  let mockQuerySelectorAll: typeof domUtils.querySelectorAll;

  beforeEach(() => {
    // Créer des éléments DOM mock
    mockButtons = [
      {
        matches: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        addEventListener: vi.fn(),
        closest: vi.fn(),
      },
      {
        matches: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        addEventListener: vi.fn(),
        closest: vi.fn(),
      },
    ];

    // Spy on document.addEventListener et removeEventListener
    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");

    // Mock querySelectorAll
    mockQuerySelectorAll = domUtils.querySelectorAll as ReturnType<
      typeof vi.fn
    >;
    (mockQuerySelectorAll as ReturnType<typeof vi.fn>).mockReturnValue(
      mockButtons as unknown as NodeListOf<HTMLElement>,
    );

    dropdownButtons = new DropdownButtons(
      new CssSelector(
        '[aria-controls="desktop-lang-menu"], [aria-controls="mobile-lang-menu"]',
      ),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("devrait initialiser avec les boutons trouvés", () => {
      expect(dropdownButtons.getCount()).toBe(2);
    });
  });

  describe("setAriaExpanded", () => {
    beforeEach(() => {
      // Mock matches pour identifier le bouton
      mockButtons[0].matches.mockImplementation(
        (selector: string) =>
          selector === '[aria-controls="desktop-lang-menu"]',
      );
      mockButtons[1].matches.mockImplementation(
        (selector: string) => selector === '[aria-controls="mobile-lang-menu"]',
      );
    });

    it("devrait mettre à jour aria-expanded d'un bouton spécifique", () => {
      dropdownButtons.setAriaExpanded(
        '[aria-controls="desktop-lang-menu"]',
        true,
      );

      expect(mockButtons[0].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "true",
      );
      expect(mockButtons[1].setAttribute).not.toHaveBeenCalled();
    });

    it("devrait gérer les boutons non trouvés", () => {
      dropdownButtons.setAriaExpanded('[aria-controls="non-existent"]', true);

      expect(mockButtons[0].setAttribute).not.toHaveBeenCalled();
      expect(mockButtons[1].setAttribute).not.toHaveBeenCalled();
    });
  });

  describe("setAllAriaExpanded", () => {
    it("devrait mettre à jour tous les boutons en expanded", () => {
      dropdownButtons.setAllAriaExpanded(true);

      expect(mockButtons[0].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "true",
      );
      expect(mockButtons[1].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "true",
      );
    });

    it("devrait mettre à jour tous les boutons en collapsed", () => {
      dropdownButtons.setAllAriaExpanded(false);

      expect(mockButtons[0].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "false",
      );
      expect(mockButtons[1].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "false",
      );
    });
  });

  describe("bindAriaHandlers", () => {
    it("devrait attacher les event listeners aux boutons avec AbortController", () => {
      dropdownButtons.bindAriaHandlers();

      // Vérifier que addEventListener a été appelé pour chaque bouton avec signal
      expect(mockButtons[0].addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(mockButtons[0].addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(mockButtons[0].addEventListener).toHaveBeenCalledWith(
        "blur",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );

      expect(mockButtons[1].addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(mockButtons[1].addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(mockButtons[1].addEventListener).toHaveBeenCalledWith(
        "blur",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it("devrait attacher un event listener global au document avec AbortController", () => {
      dropdownButtons.bindAriaHandlers();

      expect(document.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  describe("interaction avec les boutons", () => {
    beforeEach(() => {
      // Mock getAttribute pour simuler l'état actuel
      mockButtons[0].getAttribute.mockReturnValue("false");
      mockButtons[1].getAttribute.mockReturnValue("false");
    });

    it("devrait basculer aria-expanded au clic", () => {
      dropdownButtons.bindAriaHandlers();

      // Récupérer le handler de click du premier bouton
      const clickHandler = mockButtons[0].addEventListener.mock.calls.find(
        (call) => call[0] === "click",
      )?.[1];

      expect(clickHandler).toBeDefined();

      // Simuler un clic
      if (clickHandler) {
        clickHandler({} as Event);
      }

      // Vérifier que l'état a été basculé
      expect(mockButtons[0].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "true",
      );
      // Vérifier que les autres dropdowns ont été fermés
      expect(mockButtons[1].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "false",
      );
    });

    it("devrait gérer les touches Enter et Espace", () => {
      dropdownButtons.bindAriaHandlers();

      // Récupérer le handler de keydown du premier bouton
      const keydownHandler = mockButtons[0].addEventListener.mock.calls.find(
        (call) => call[0] === "keydown",
      )?.[1];

      expect(keydownHandler).toBeDefined();

      // Simuler Enter
      const enterEvent = {
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      if (keydownHandler) {
        keydownHandler(enterEvent);
      }

      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(mockButtons[0].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "true",
      );
    });
  });

  describe("fermeture au blur", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("devrait fermer le dropdown après un délai au blur", () => {
      const mockDropdown = {
        matches: vi.fn().mockReturnValue(false), // Pas de focus-within
      };
      mockButtons[0].closest.mockReturnValue(mockDropdown);

      dropdownButtons.bindAriaHandlers();

      // Récupérer le handler de blur
      const blurHandler = mockButtons[0].addEventListener.mock.calls.find(
        (call) => call[0] === "blur",
      )?.[1];

      expect(blurHandler).toBeDefined();

      if (blurHandler) {
        blurHandler({} as Event);
      }

      // Avancer le timer
      vi.advanceTimersByTime(150);

      expect(mockButtons[0].setAttribute).toHaveBeenCalledWith(
        "aria-expanded",
        "false",
      );
    });

    it("ne devrait pas fermer le dropdown si toujours focus-within", () => {
      const mockDropdown = {
        matches: vi.fn().mockReturnValue(true), // focus-within actif
      };
      mockButtons[0].closest.mockReturnValue(mockDropdown);

      dropdownButtons.bindAriaHandlers();

      const blurHandler = mockButtons[0].addEventListener.mock.calls.find(
        (call) => call[0] === "blur",
      )?.[1];

      if (blurHandler) {
        blurHandler({} as Event);
      }

      vi.advanceTimersByTime(150);

      expect(mockButtons[0].setAttribute).not.toHaveBeenCalledWith(
        "aria-expanded",
        "false",
      );
    });
  });

  describe("cleanup", () => {
    it("devrait nettoyer automatiquement tous les event listeners avec AbortController", () => {
      // D'abord attacher les handlers
      dropdownButtons.bindAriaHandlers();

      const abortSpy = vi.spyOn(AbortController.prototype, "abort");

      // Appeler cleanup
      dropdownButtons.cleanup();

      // Vérifier que AbortController.abort a été appelé
      expect(abortSpy).toHaveBeenCalled();

      abortSpy.mockRestore();
    });

    it("devrait pouvoir être appelé plusieurs fois sans erreur", () => {
      dropdownButtons.bindAriaHandlers();

      // Premier cleanup
      dropdownButtons.cleanup();

      // Deuxième cleanup - ne devrait pas lever d'erreur
      expect(() => dropdownButtons.cleanup()).not.toThrow();
    });

    it("devrait pouvoir être appelé sans avoir appelé bindAriaHandlers", () => {
      // Cleanup sans avoir d'abord attaché des handlers
      expect(() => dropdownButtons.cleanup()).not.toThrow();
    });
  });
});
