import { describe, it, expect } from "vitest";
import {
  buildTocHierarchy,
  filterHeadingsByDepth,
  countHeadingsByLevel,
  shouldShowToc,
  type AstroHeading,
} from "@/lib/content/toc-utils";

describe("TOC Utils", () => {
  const mockHeadings: AstroHeading[] = [
    { depth: 1, text: "Title", slug: "title" },
    { depth: 2, text: "Introduction", slug: "introduction" },
    { depth: 2, text: "Main Section", slug: "main-section" },
    { depth: 3, text: "Subsection 1", slug: "subsection-1" },
    { depth: 3, text: "Subsection 2", slug: "subsection-2" },
    { depth: 2, text: "Conclusion", slug: "conclusion" },
    { depth: 4, text: "Deep section", slug: "deep-section" },
  ];

  describe("buildTocHierarchy", () => {
    it("devrait construire une hiérarchie correcte à partir des headings", () => {
      const result = buildTocHierarchy(mockHeadings);

      expect(result).toHaveLength(3); // 3 sections principales (H2)
      expect(result[0].text).toBe("Introduction");
      expect(result[1].text).toBe("Main Section");
      expect(result[2].text).toBe("Conclusion");

      // Vérifier les sous-sections
      expect(result[1].subheadings).toHaveLength(2);
      expect(result[1].subheadings[0].text).toBe("Subsection 1");
      expect(result[1].subheadings[1].text).toBe("Subsection 2");
    });

    it("devrait ignorer les headings H1 par défaut", () => {
      const result = buildTocHierarchy(mockHeadings);

      // Le H1 ne devrait pas être inclus
      expect(result.find((h) => h.text === "Title")).toBeUndefined();
    });

    it("devrait permettre de changer la profondeur minimale", () => {
      const result = buildTocHierarchy(mockHeadings, 3);

      expect(result).toHaveLength(2); // Seulement les H3
      expect(result[0].text).toBe("Subsection 1");
      expect(result[1].text).toBe("Subsection 2");
    });

    it("devrait retourner un tableau vide pour des headings vides", () => {
      expect(buildTocHierarchy([])).toEqual([]);
      expect(buildTocHierarchy(null as unknown as AstroHeading[])).toEqual([]);
      expect(buildTocHierarchy(undefined as unknown as AstroHeading[])).toEqual(
        [],
      );
    });

    it("devrait gérer les niveaux imbriqués complexes", () => {
      const complexHeadings: AstroHeading[] = [
        { depth: 2, text: "Section 1", slug: "section-1" },
        { depth: 4, text: "Deep subsection", slug: "deep-subsection" }, // Pas de H3 parent
      ];

      const result = buildTocHierarchy(complexHeadings);

      expect(result).toHaveLength(1);
      expect(result[0].subheadings).toHaveLength(1);
      expect(result[0].subheadings[0].text).toBe("Deep subsection");
    });
  });

  describe("filterHeadingsByDepth", () => {
    it("devrait filtrer par profondeur maximale", () => {
      const result = filterHeadingsByDepth(mockHeadings, 3);

      expect(result).toHaveLength(6); // Tout sauf le H4
      expect(result.find((h) => h.depth === 4)).toBeUndefined();
    });

    it("devrait garder tous les headings si maxDepth est élevé", () => {
      const result = filterHeadingsByDepth(mockHeadings, 6);

      expect(result).toHaveLength(mockHeadings.length);
    });
  });

  describe("countHeadingsByLevel", () => {
    it("devrait compter correctement les headings par niveau", () => {
      const result = countHeadingsByLevel(mockHeadings);

      expect(result[1]).toBe(1); // 1 H1
      expect(result[2]).toBe(3); // 3 H2
      expect(result[3]).toBe(2); // 2 H3
      expect(result[4]).toBe(1); // 1 H4
    });

    it("devrait retourner un objet vide pour des headings vides", () => {
      const result = countHeadingsByLevel([]);

      expect(result).toEqual({});
    });
  });

  describe("shouldShowToc", () => {
    it("devrait retourner true si assez de headings", () => {
      expect(shouldShowToc(mockHeadings)).toBe(true);
      expect(shouldShowToc(mockHeadings, 5)).toBe(true);
    });

    it("devrait retourner false si pas assez de headings", () => {
      const fewHeadings = mockHeadings.slice(0, 2);
      expect(shouldShowToc(fewHeadings)).toBe(false);
      expect(shouldShowToc(fewHeadings, 5)).toBe(false);
    });

    it("devrait gérer les cas limites", () => {
      expect(shouldShowToc([])).toBe(false);
      expect(shouldShowToc(null as unknown as AstroHeading[])).toBe(false);
      expect(shouldShowToc(undefined as unknown as AstroHeading[])).toBe(false);
    });

    it("devrait respecter le seuil minimal personnalisé", () => {
      const threeHeadings = mockHeadings.slice(0, 3);
      expect(shouldShowToc(threeHeadings, 3)).toBe(true);
      expect(shouldShowToc(threeHeadings, 4)).toBe(false);
    });
  });
});
