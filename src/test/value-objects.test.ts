import { describe, it, expect } from "vitest";
import {
  Language,
  ElementId,
  CssSelector,
} from "../scripts/header/value-objects";

describe("Language", () => {
  describe("constructor", () => {
    it("devrait créer une instance avec un code de langue valide", () => {
      const frenchLang = new Language("fr");
      const englishLang = new Language("en");

      expect(frenchLang.getCode()).toBe("fr");
      expect(englishLang.getCode()).toBe("en");
    });

    it("devrait lever une erreur avec un code de langue invalide", () => {
      expect(() => new Language("es" as never)).toThrow(
        "Code de langue invalide: es",
      );
      expect(() => new Language("de" as never)).toThrow(
        "Code de langue invalide: de",
      );
      expect(() => new Language("" as never)).toThrow(
        "Code de langue invalide: ",
      );
    });
  });

  describe("fromString", () => {
    it("devrait créer une instance Language à partir d'une chaîne valide", () => {
      const frenchLang = Language.fromString("fr");
      const englishLang = Language.fromString("en");

      expect(frenchLang).toBeInstanceOf(Language);
      expect(frenchLang?.getCode()).toBe("fr");
      expect(englishLang).toBeInstanceOf(Language);
      expect(englishLang?.getCode()).toBe("en");
    });
  });

  describe("getCode", () => {
    it("devrait retourner le code de langue encapsulé", () => {
      const frenchLang = new Language("fr");
      const englishLang = new Language("en");

      expect(frenchLang.getCode()).toBe("fr");
      expect(englishLang.getCode()).toBe("en");
    });
  });

  describe("getDisplayText", () => {
    it("devrait retourner le code de langue en majuscules", () => {
      const frenchLang = new Language("fr");
      const englishLang = new Language("en");

      expect(frenchLang.getDisplayText()).toBe("FR");
      expect(englishLang.getDisplayText()).toBe("EN");
    });
  });

  describe("isFrench", () => {
    it("devrait retourner true pour le français", () => {
      const frenchLang = new Language("fr");
      expect(frenchLang.isFrench()).toBe(true);
    });

    it("devrait retourner false pour l'anglais", () => {
      const englishLang = new Language("en");
      expect(englishLang.isFrench()).toBe(false);
    });
  });

  describe("isEnglish", () => {
    it("devrait retourner true pour l'anglais", () => {
      const englishLang = new Language("en");
      expect(englishLang.isEnglish()).toBe(true);
    });

    it("devrait retourner false pour le français", () => {
      const frenchLang = new Language("fr");
      expect(frenchLang.isEnglish()).toBe(false);
    });
  });

  describe("equals", () => {
    it("devrait retourner true pour des langues identiques", () => {
      const french1 = new Language("fr");
      const french2 = new Language("fr");
      const english1 = new Language("en");
      const english2 = new Language("en");

      expect(french1.equals(french2)).toBe(true);
      expect(english1.equals(english2)).toBe(true);
    });

    it("devrait retourner false pour des langues différentes", () => {
      const frenchLang = new Language("fr");
      const englishLang = new Language("en");

      expect(frenchLang.equals(englishLang)).toBe(false);
      expect(englishLang.equals(frenchLang)).toBe(false);
    });
  });

  describe("defaultLanguage", () => {
    it("devrait retourner une instance Language avec le code 'fr'", () => {
      const defaultLang = Language.defaultLanguage();

      expect(defaultLang).toBeInstanceOf(Language);
      expect(defaultLang.getCode()).toBe("fr");
      expect(defaultLang.isFrench()).toBe(true);
    });
  });
});

describe("ElementId", () => {
  describe("constructor", () => {
    it("devrait créer une instance avec un ID valide", () => {
      const elementId = new ElementId("test-id");
      expect(elementId.getValue()).toBe("test-id");
    });

    it("devrait lever une erreur avec un ID vide", () => {
      expect(() => new ElementId("")).toThrow(
        "L'ID d'élément ne peut pas être vide",
      );
    });

    it("devrait lever une erreur avec un ID contenant seulement des espaces", () => {
      expect(() => new ElementId("   ")).toThrow(
        "L'ID d'élément ne peut pas être vide",
      );
      expect(() => new ElementId("\t\n")).toThrow(
        "L'ID d'élément ne peut pas être vide",
      );
    });

    it("devrait accepter un ID avec des espaces au début et à la fin", () => {
      const elementId = new ElementId("  test-id  ");
      expect(elementId.getValue()).toBe("  test-id  ");
    });
  });

  describe("getValue", () => {
    it("devrait retourner la valeur encapsulée", () => {
      const elementId = new ElementId("my-element");
      expect(elementId.getValue()).toBe("my-element");
    });

    it("devrait préserver la casse et les caractères spéciaux", () => {
      const elementId = new ElementId("MyElement_123-test");
      expect(elementId.getValue()).toBe("MyElement_123-test");
    });
  });

  describe("equals", () => {
    it("devrait retourner true pour des IDs identiques", () => {
      const id1 = new ElementId("test-id");
      const id2 = new ElementId("test-id");

      expect(id1.equals(id2)).toBe(true);
    });

    it("devrait retourner false pour des IDs différents", () => {
      const id1 = new ElementId("test-id-1");
      const id2 = new ElementId("test-id-2");

      expect(id1.equals(id2)).toBe(false);
    });

    it("devrait être sensible à la casse", () => {
      const id1 = new ElementId("Test-ID");
      const id2 = new ElementId("test-id");

      expect(id1.equals(id2)).toBe(false);
    });
  });
});

describe("CssSelector", () => {
  describe("constructor", () => {
    it("devrait créer une instance avec un sélecteur valide", () => {
      const selector = new CssSelector(".test-class");
      expect(selector.getValue()).toBe(".test-class");
    });

    it("devrait lever une erreur avec un sélecteur vide", () => {
      expect(() => new CssSelector("")).toThrow(
        "Le sélecteur CSS ne peut pas être vide",
      );
    });

    it("devrait lever une erreur avec un sélecteur contenant seulement des espaces", () => {
      expect(() => new CssSelector("   ")).toThrow(
        "Le sélecteur CSS ne peut pas être vide",
      );
      expect(() => new CssSelector("\t\n")).toThrow(
        "Le sélecteur CSS ne peut pas être vide",
      );
    });

    it("devrait accepter différents types de sélecteurs CSS", () => {
      const classSelector = new CssSelector(".my-class");
      const idSelector = new CssSelector("#my-id");
      const attributeSelector = new CssSelector("[data-test='value']");
      const complexSelector = new CssSelector(".parent > .child:hover");

      expect(classSelector.getValue()).toBe(".my-class");
      expect(idSelector.getValue()).toBe("#my-id");
      expect(attributeSelector.getValue()).toBe("[data-test='value']");
      expect(complexSelector.getValue()).toBe(".parent > .child:hover");
    });
  });

  describe("getValue", () => {
    it("devrait retourner la valeur encapsulée", () => {
      const selector = new CssSelector(".nav-link");
      expect(selector.getValue()).toBe(".nav-link");
    });

    it("devrait préserver les espaces et caractères spéciaux", () => {
      const selector = new CssSelector("  .class1, .class2  ");
      expect(selector.getValue()).toBe("  .class1, .class2  ");
    });
  });

  describe("equals", () => {
    it("devrait retourner true pour des sélecteurs identiques", () => {
      const selector1 = new CssSelector(".test-class");
      const selector2 = new CssSelector(".test-class");

      expect(selector1.equals(selector2)).toBe(true);
    });

    it("devrait retourner false pour des sélecteurs différents", () => {
      const selector1 = new CssSelector(".class1");
      const selector2 = new CssSelector(".class2");

      expect(selector1.equals(selector2)).toBe(false);
    });

    it("devrait être sensible à la casse et aux espaces", () => {
      const selector1 = new CssSelector(".Test-Class");
      const selector2 = new CssSelector(".test-class");
      const selector3 = new CssSelector(" .test-class ");

      expect(selector1.equals(selector2)).toBe(false);
      expect(selector2.equals(selector3)).toBe(false);
    });
  });
});
