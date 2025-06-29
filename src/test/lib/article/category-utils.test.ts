import { describe, it, expect } from "vitest";
import {
  normalizeCategoryForUrl,
  denormalizeCategoryFromUrl,
} from "@/lib/article/category-utils";

describe("Category Utils", () => {
  describe("URL normalization", () => {
    it("should normalize category names for URLs", () => {
      expect(normalizeCategoryForUrl("Framework")).toBe("framework");
      expect(normalizeCategoryForUrl("Best Practices")).toBe("best-practices");
      expect(normalizeCategoryForUrl("CSS & Styling")).toBe("css-styling");
      expect(normalizeCategoryForUrl("API/Backend")).toBe("api-backend");
    });

    it("should denormalize category names from URLs", () => {
      const availableCategories = [
        "Framework",
        "Best Practices",
        "CSS & Styling",
      ];

      expect(denormalizeCategoryFromUrl("framework", availableCategories)).toBe(
        "Framework",
      );
      expect(
        denormalizeCategoryFromUrl("best-practices", availableCategories),
      ).toBe("Best Practices");
      expect(
        denormalizeCategoryFromUrl("css-styling", availableCategories),
      ).toBe("CSS & Styling");
      expect(
        denormalizeCategoryFromUrl("nonexistent", availableCategories),
      ).toBeNull();
    });

    describe("Edge cases - normalizeCategoryForUrl", () => {
      it("should handle empty strings", () => {
        expect(normalizeCategoryForUrl("")).toBe("");
      });

      it("should handle strings with only whitespace", () => {
        expect(normalizeCategoryForUrl("   ")).toBe("");
        expect(normalizeCategoryForUrl("\t\n\r")).toBe("");
      });

      it("should handle multiple consecutive special characters", () => {
        expect(normalizeCategoryForUrl("CSS && Styling")).toBe("css-styling");
        expect(normalizeCategoryForUrl("API///Backend")).toBe("api-backend");
        expect(normalizeCategoryForUrl("Data\\\\Science")).toBe("data-science");
        expect(normalizeCategoryForUrl("Web   Development")).toBe(
          "web-development",
        );
      });

      it("should handle strings with leading and trailing hyphens", () => {
        expect(normalizeCategoryForUrl("-Frontend-")).toBe("frontend");
        expect(normalizeCategoryForUrl("--Backend--")).toBe("backend");
        expect(normalizeCategoryForUrl("---Web Development---")).toBe(
          "web-development",
        );
      });

      it("should handle categories composed only of special characters", () => {
        expect(normalizeCategoryForUrl("&&&")).toBe("");
        expect(normalizeCategoryForUrl("///")).toBe("");
        expect(normalizeCategoryForUrl("\\\\\\")).toBe("");
        expect(normalizeCategoryForUrl("!@#$%^*()")).toBe("");
        expect(normalizeCategoryForUrl("& / \\ -")).toBe("");
      });

      it("should handle mixed special characters and valid content", () => {
        expect(normalizeCategoryForUrl("!@#Web$%^Development&*()")).toBe(
          "webdevelopment",
        );
        expect(normalizeCategoryForUrl("###React###")).toBe("react");
        expect(normalizeCategoryForUrl("Vue.js 3.0!!!")).toBe("vuejs-30");
      });

      it("should handle unicode and accented characters", () => {
        expect(normalizeCategoryForUrl("Développement")).toBe("dveloppement");
        expect(normalizeCategoryForUrl("Diseño Web")).toBe("diseo-web");
        expect(normalizeCategoryForUrl("Programmação")).toBe("programmao");
      });

      it("should handle null and undefined inputs", () => {
        // @ts-expect-error Testing edge case with invalid input
        expect(() => normalizeCategoryForUrl(null)).toThrow();
        // @ts-expect-error Testing edge case with invalid input
        expect(() => normalizeCategoryForUrl(undefined)).toThrow();
      });

      it("should handle numbers and alphanumeric combinations", () => {
        expect(normalizeCategoryForUrl("Web 2.0")).toBe("web-20");
        expect(normalizeCategoryForUrl("HTML5 & CSS3")).toBe("html5-css3");
        expect(normalizeCategoryForUrl("Node.js v18")).toBe("nodejs-v18");
      });
    });

    describe("Edge cases - denormalizeCategoryFromUrl", () => {
      const availableCategories = [
        "Framework",
        "Best Practices",
        "CSS & Styling",
        "API/Backend",
        "Web Development",
        "Data Science",
      ];

      it("should handle empty strings", () => {
        expect(denormalizeCategoryFromUrl("", availableCategories)).toBeNull();
      });

      it("should handle strings with only whitespace", () => {
        expect(
          denormalizeCategoryFromUrl("   ", availableCategories),
        ).toBeNull();
        expect(
          denormalizeCategoryFromUrl("\t\n", availableCategories),
        ).toBeNull();
      });

      it("should handle categories with special characters in available list", () => {
        const specialCategories = [
          "CSS & Styling",
          "API/Backend",
          "C++",
          ".NET Core",
        ];

        expect(
          denormalizeCategoryFromUrl("css-styling", specialCategories),
        ).toBe("CSS & Styling");
        expect(
          denormalizeCategoryFromUrl("api-backend", specialCategories),
        ).toBe("API/Backend");
        expect(denormalizeCategoryFromUrl("c", specialCategories)).toBe("C++");
        expect(denormalizeCategoryFromUrl("net-core", specialCategories)).toBe(
          ".NET Core",
        );
      });

      it("should handle malformed URL categories", () => {
        expect(
          denormalizeCategoryFromUrl("--invalid--", availableCategories),
        ).toBeNull();
        expect(
          denormalizeCategoryFromUrl(
            "category-with-many-hyphens",
            availableCategories,
          ),
        ).toBeNull();
        expect(
          denormalizeCategoryFromUrl("nonexistent123", availableCategories),
        ).toBeNull();
      });

      it("should handle case variations in URL categories", () => {
        expect(
          denormalizeCategoryFromUrl("FRAMEWORK", availableCategories),
        ).toBe("Framework");
        expect(
          denormalizeCategoryFromUrl("Framework", availableCategories),
        ).toBe("Framework");
        expect(
          denormalizeCategoryFromUrl("fRaMeWoRk", availableCategories),
        ).toBe("Framework");
      });

      it("should handle empty available categories array", () => {
        expect(denormalizeCategoryFromUrl("framework", [])).toBeNull();
        expect(denormalizeCategoryFromUrl("any-category", [])).toBeNull();
      });
    });
  });
});
