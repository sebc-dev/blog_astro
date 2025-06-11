import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getElementById,
  querySelectorAll,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setBodyOverflow,
} from "../scripts/utils/dom";

// Mock du DOM global
const mockDocument = {
  getElementById: vi.fn(),
  querySelectorAll: vi.fn(),
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
    },
  },
};

// Mock de document global
Object.defineProperty(global, "document", {
  value: mockDocument,
  writable: true,
});

describe("Utilitaires DOM", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getElementById", () => {
    it("devrait retourner l'élément trouvé avec le bon type", () => {
      const mockElement = { id: "test-element" } as HTMLButtonElement;
      mockDocument.getElementById.mockReturnValue(mockElement);

      const result = getElementById<HTMLButtonElement>("test-element");

      expect(mockDocument.getElementById).toHaveBeenCalledWith("test-element");
      expect(result).toBe(mockElement);
    });

    it("devrait retourner null si l'élément n'existe pas", () => {
      mockDocument.getElementById.mockReturnValue(null);

      const result = getElementById("non-existent");

      expect(mockDocument.getElementById).toHaveBeenCalledWith("non-existent");
      expect(result).toBeNull();
    });

    it("devrait fonctionner avec le type par défaut HTMLElement", () => {
      const mockElement = { id: "test-element" } as HTMLElement;
      mockDocument.getElementById.mockReturnValue(mockElement);

      const result = getElementById("test-element");

      expect(result).toBe(mockElement);
    });

    it("devrait préserver le typage spécifique", () => {
      const mockButton = { 
        id: "test-button", 
        disabled: false 
      } as HTMLButtonElement;
      mockDocument.getElementById.mockReturnValue(mockButton);

      const result = getElementById<HTMLButtonElement>("test-button");

      expect(result).toBe(mockButton);
      // TypeScript devrait permettre l'accès à la propriété disabled
      if (result) {
        expect(result.disabled).toBe(false);
      }
    });
  });

  describe("querySelectorAll", () => {
    it("devrait retourner une NodeList d'éléments avec le bon type", () => {
      const mockElements = [
        { className: "test-class" },
        { className: "test-class" },
      ] as unknown as NodeListOf<HTMLElement>;
      mockDocument.querySelectorAll.mockReturnValue(mockElements);

      const result = querySelectorAll<HTMLElement>(".test-class");

      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith(".test-class");
      expect(result).toBe(mockElements);
    });

    it("devrait retourner une NodeList vide si aucun élément trouvé", () => {
      const emptyNodeList = [] as unknown as NodeListOf<Element>;
      mockDocument.querySelectorAll.mockReturnValue(emptyNodeList);

      const result = querySelectorAll(".non-existent");

      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith(".non-existent");
      expect(result).toBe(emptyNodeList);
    });

    it("devrait fonctionner avec le type par défaut Element", () => {
      const mockElements = [
        { tagName: "DIV" },
        { tagName: "SPAN" },
      ] as unknown as NodeListOf<Element>;
      mockDocument.querySelectorAll.mockReturnValue(mockElements);

      const result = querySelectorAll("div, span");

      expect(result).toBe(mockElements);
    });

    it("devrait préserver le typage spécifique", () => {
      const mockButtons = [
        { disabled: false },
        { disabled: true },
      ] as unknown as NodeListOf<HTMLButtonElement>;
      mockDocument.querySelectorAll.mockReturnValue(mockButtons);

      const result = querySelectorAll<HTMLButtonElement>("button");

      expect(result).toBe(mockButtons);
    });
  });

  describe("addClass", () => {
    let mockElement: Element;

    beforeEach(() => {
      mockElement = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          toggle: vi.fn(),
          contains: vi.fn(),
        },
      } as unknown as Element;
    });

    it("devrait ajouter une seule classe à un élément", () => {
      addClass(mockElement, "test-class");

      expect(mockElement.classList.add).toHaveBeenCalledWith("test-class");
    });

    it("devrait ajouter plusieurs classes à un élément", () => {
      addClass(mockElement, "class1", "class2", "class3");

      expect(mockElement.classList.add).toHaveBeenCalledWith("class1", "class2", "class3");
    });

    it("ne devrait rien faire si l'élément est null", () => {
      addClass(null, "test-class");

      // Aucune erreur ne devrait être levée
      expect(true).toBe(true);
    });

    it("devrait gérer les classes vides", () => {
      addClass(mockElement, "", "valid-class", "");

      expect(mockElement.classList.add).toHaveBeenCalledWith("", "valid-class", "");
    });
  });

  describe("removeClass", () => {
    let mockElement: Element;

    beforeEach(() => {
      mockElement = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          toggle: vi.fn(),
          contains: vi.fn(),
        },
      } as unknown as Element;
    });

    it("devrait retirer une seule classe d'un élément", () => {
      removeClass(mockElement, "test-class");

      expect(mockElement.classList.remove).toHaveBeenCalledWith("test-class");
    });

    it("devrait retirer plusieurs classes d'un élément", () => {
      removeClass(mockElement, "class1", "class2", "class3");

      expect(mockElement.classList.remove).toHaveBeenCalledWith("class1", "class2", "class3");
    });

    it("ne devrait rien faire si l'élément est null", () => {
      removeClass(null, "test-class");

      // Aucune erreur ne devrait être levée
      expect(true).toBe(true);
    });

    it("devrait gérer les classes vides", () => {
      removeClass(mockElement, "", "valid-class", "");

      expect(mockElement.classList.remove).toHaveBeenCalledWith("", "valid-class", "");
    });
  });

  describe("toggleClass", () => {
    let mockElement: Element;

    beforeEach(() => {
      mockElement = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          toggle: vi.fn(),
          contains: vi.fn(),
        },
      } as unknown as Element;
    });

    it("devrait basculer une classe sans paramètre force", () => {
      toggleClass(mockElement, "test-class");

      expect(mockElement.classList.toggle).toHaveBeenCalledWith("test-class");
    });

    it("devrait forcer l'ajout d'une classe avec force=true", () => {
      toggleClass(mockElement, "test-class", true);

      expect(mockElement.classList.toggle).toHaveBeenCalledWith("test-class", true);
    });

    it("devrait forcer le retrait d'une classe avec force=false", () => {
      toggleClass(mockElement, "test-class", false);

      expect(mockElement.classList.toggle).toHaveBeenCalledWith("test-class", false);
    });

    it("ne devrait rien faire si l'élément est null", () => {
      toggleClass(null, "test-class");
      toggleClass(null, "test-class", true);
      toggleClass(null, "test-class", false);

      // Aucune erreur ne devrait être levée
      expect(true).toBe(true);
    });

    it("devrait gérer force=undefined comme pas de paramètre", () => {
      toggleClass(mockElement, "test-class", undefined);

      expect(mockElement.classList.toggle).toHaveBeenCalledWith("test-class");
    });
  });

  describe("hasClass", () => {
    let mockElement: Element;

    beforeEach(() => {
      mockElement = {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          toggle: vi.fn(),
          contains: vi.fn(),
        },
      } as unknown as Element;
    });

    it("devrait retourner true si l'élément possède la classe", () => {
      (mockElement.classList.contains as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const result = hasClass(mockElement, "test-class");

      expect(mockElement.classList.contains).toHaveBeenCalledWith("test-class");
      expect(result).toBe(true);
    });

    it("devrait retourner false si l'élément ne possède pas la classe", () => {
      (mockElement.classList.contains as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = hasClass(mockElement, "test-class");

      expect(mockElement.classList.contains).toHaveBeenCalledWith("test-class");
      expect(result).toBe(false);
    });

    it("devrait retourner false si l'élément est null", () => {
      const result = hasClass(null, "test-class");

      expect(result).toBe(false);
    });

    it("devrait utiliser l'opérateur nullish coalescing", () => {
      // Test avec un élément qui retourne undefined
      const elementWithUndefined = {
        classList: {
          contains: vi.fn().mockReturnValue(undefined),
        },
      } as unknown as Element;

      const result = hasClass(elementWithUndefined, "test-class");

      expect(result).toBe(false);
    });
  });

  describe("setBodyOverflow", () => {
    beforeEach(() => {
      // Reset les mocks du body
      mockDocument.body.classList.toggle.mockClear();
    });

    it("devrait cacher le débordement du body avec hidden=true", () => {
      setBodyOverflow(true);

      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith("overflow-hidden", true);
    });

    it("devrait montrer le débordement du body avec hidden=false", () => {
      setBodyOverflow(false);

      expect(mockDocument.body.classList.toggle).toHaveBeenCalledWith("overflow-hidden", false);
    });

    it("devrait utiliser toggleClass en interne", () => {
      // Test que setBodyOverflow utilise bien toggleClass
      setBodyOverflow(true);
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledTimes(1);

      setBodyOverflow(false);
      expect(mockDocument.body.classList.toggle).toHaveBeenCalledTimes(2);
    });
  });
}); 