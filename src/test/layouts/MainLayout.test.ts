// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import MainLayout from "../../layouts/MainLayout.astro";

describe("MainLayout with Grid Background", () => {
  it("should contain grid background element with correct classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MainLayout, {
      slots: {
        default: "<h1>Test Content</h1>",
      },
    });

    // Parse the HTML string into a DOM element
    const template = document.createElement("template");
    template.innerHTML = html;
    const renderedContent = template.content;

    // Chercher l'élément grid-background 
    const gridBackground = renderedContent.querySelector(".grid-background");
    expect(gridBackground).not.toBeNull();
    expect(gridBackground?.classList.contains("grid-background")).toBe(true);

    // Vérifier que le body a la classe relative (si présent dans le rendu)
    const body = renderedContent.querySelector("body");
    if (body) {
      expect(body.classList.contains("relative")).toBe(true);
    }

    // Vérifier que main et footer existent
    const main = renderedContent.querySelector("main");
    const footer = renderedContent.querySelector("footer");
    expect(main).not.toBeNull();
    expect(footer).not.toBeNull();
  });

  it("should have proper structure for layering", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MainLayout, {
      slots: {
        default: "<h1>Test Content</h1>",
      },
    });

    const template = document.createElement("template");
    template.innerHTML = html;
    const renderedContent = template.content;

    // Si body n'est pas présent, utiliser le contenu racine
    const rootContent = renderedContent.querySelector("body") || renderedContent;
    
    const gridBackground = rootContent.querySelector(".grid-background");
    const header = rootContent.querySelector("header");
    const main = rootContent.querySelector("main");
    const footer = rootContent.querySelector("footer");

    // Tous les éléments doivent exister
    expect(gridBackground).not.toBeNull();
    expect(header).not.toBeNull();
    expect(main).not.toBeNull();
    expect(footer).not.toBeNull();
  });

  it("should render custom content in main slot", async () => {
    const customContent = "<div class='custom-test'>Custom Test Content</div>";
    const container = await AstroContainer.create();
    const html = await container.renderToString(MainLayout, {
      slots: {
        default: customContent,
      },
    });

    expect(html).toContain("Custom Test Content");
    expect(html).toContain("custom-test");
  });

  it("should have correct language attribute", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MainLayout, {
      slots: {
        default: "<h1>Test Content</h1>",
      },
    });

    const template = document.createElement("template");
    template.innerHTML = html;
    const renderedContent = template.content;

    const htmlElement = renderedContent.querySelector("html");
    if (htmlElement) {
      expect(htmlElement.getAttribute("lang")).toBe("en"); // Default language
    } else {
      // Si l'élément html n'est pas dans le rendu, vérifier le string HTML
      expect(html).toContain('lang="en"');
    }
  });

  it("should contain required meta tags", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MainLayout, {
      slots: {
        default: "<h1>Test Content</h1>",
      },
    });

    expect(html).toContain('charset="utf-8"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('name="generator"');
  });
});
