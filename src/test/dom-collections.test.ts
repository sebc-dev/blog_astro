import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ClickableElements,
  NavigationLinks,
  LanguageIndicators,
} from "../scripts/header/dom-collections";
import { CssSelector, ElementId } from "../scripts/header/value-objects";
import { querySelectorAll, getElementById } from "../scripts/utils/dom";

// Mock des fonctions DOM
vi.mock("../scripts/utils/dom", () => ({
  querySelectorAll: vi.fn(),
  getElementById: vi.fn(),
}));

describe("ClickableElements", () => {
  let clickableElements: ClickableElements;
  const mockElements = [
    { addEventListener: vi.fn(), removeEventListener: vi.fn() },
    { addEventListener: vi.fn(), removeEventListener: vi.fn() },
  ] as unknown as NodeListOf<HTMLElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    (querySelectorAll as ReturnType<typeof vi.fn>).mockReturnValue(
      mockElements,
    );
    clickableElements = new ClickableElements(
      new CssSelector(".test-selector"),
    );
  });

  it("devrait créer une collection avec le sélecteur CSS fourni", () => {
    expect(querySelectorAll).toHaveBeenCalledWith(".test-selector");
  });

  it("devrait attacher le gestionnaire de clic à tous les éléments avec AbortController", () => {
    const handler = vi.fn();
    clickableElements.bindClickHandler(handler);

    mockElements.forEach((element) => {
      expect(element.addEventListener).toHaveBeenCalledWith(
        "click",
        handler,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it("devrait nettoyer automatiquement tous les event listeners avec destroy", () => {
    const handler = vi.fn();
    clickableElements.bindClickHandler(handler);

    const abortSpy = vi.spyOn(AbortController.prototype, "abort");

    clickableElements.destroy();

    expect(abortSpy).toHaveBeenCalled();

    abortSpy.mockRestore();
  });

  it("devrait retourner le nombre correct d'éléments", () => {
    expect(clickableElements.getCount()).toBe(2);
  });
});

describe("NavigationLinks", () => {
  let navigationLinks: NavigationLinks;
  const mockLinks = [
    { getAttribute: vi.fn(), textContent: "" },
    { getAttribute: vi.fn(), textContent: "" },
  ] as unknown as NodeListOf<HTMLElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    (querySelectorAll as ReturnType<typeof vi.fn>).mockReturnValue(mockLinks);
    navigationLinks = new NavigationLinks(new CssSelector(".nav-link"));
  });

  it("devrait créer une collection avec le sélecteur CSS fourni", () => {
    expect(querySelectorAll).toHaveBeenCalledWith(".nav-link");
  });

  it("devrait mettre à jour les textes en français", () => {
    mockLinks.forEach((link) => {
      (link.getAttribute as ReturnType<typeof vi.fn>).mockReturnValue(
        "Texte FR",
      );
    });

    navigationLinks.updateTexts(true);

    mockLinks.forEach((link) => {
      expect(link.getAttribute).toHaveBeenCalledWith("data-fr");
    });
  });

  it("devrait mettre à jour les textes en anglais", () => {
    mockLinks.forEach((link) => {
      (link.getAttribute as ReturnType<typeof vi.fn>).mockReturnValue(
        "Text EN",
      );
    });

    navigationLinks.updateTexts(false);

    mockLinks.forEach((link) => {
      expect(link.getAttribute).toHaveBeenCalledWith("data-en");
    });
  });

  it("ne devrait pas mettre à jour le texte si l'attribut est manquant", () => {
    (mockLinks[0].getAttribute as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );
    const originalText = mockLinks[0].textContent;

    navigationLinks.updateTexts(true);

    expect(mockLinks[0].textContent).toBe(originalText);
  });

  it("devrait retourner le nombre correct de liens", () => {
    expect(navigationLinks.getCount()).toBe(2);
  });
});

describe("LanguageIndicators", () => {
  let languageIndicators: LanguageIndicators;
  const mockIndicators = [
    { textContent: "" },
    { textContent: "" },
  ] as HTMLElement[];

  beforeEach(() => {
    vi.clearAllMocks();
    (getElementById as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockIndicators[0])
      .mockReturnValueOnce(mockIndicators[1]);

    languageIndicators = new LanguageIndicators([
      new ElementId("indicator-1"),
      new ElementId("indicator-2"),
    ]);
  });

  it("devrait créer une collection avec les IDs fournis", () => {
    expect(getElementById).toHaveBeenCalledTimes(2);
    expect(getElementById).toHaveBeenCalledWith("indicator-1");
    expect(getElementById).toHaveBeenCalledWith("indicator-2");
  });

  it("devrait filtrer les éléments null", () => {
    (getElementById as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(mockIndicators[1]);

    const indicators = new LanguageIndicators([
      new ElementId("non-existent"),
      new ElementId("indicator-2"),
    ]);

    expect(indicators.getCount()).toBe(1);
  });

  it("devrait mettre à jour tous les indicateurs avec le nouveau texte", () => {
    const newText = "FR";
    languageIndicators.updateAll(newText);

    mockIndicators.forEach((indicator) => {
      expect(indicator.textContent).toBe(newText);
    });
  });

  it("devrait retourner le nombre correct d'indicateurs", () => {
    expect(languageIndicators.getCount()).toBe(2);
  });
});
