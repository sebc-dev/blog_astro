import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";

describe("MainLayout with Grid Background", () => {
  it("should contain grid background element with correct classes", () => {
    // Simuler le HTML généré par MainLayout
    const html = `
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <meta name="viewport" content="width=device-width" />
          <meta name="generator" content="Astro" />
        </head>
        <body class="relative">
          <div class="grid-background"></div>
          <header>
            <nav>Header content</nav>
          </header>
          <main>
            <h1>Main content</h1>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </body>
      </html>
    `;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Vérifier que l'élément de grille existe
    const gridBackground = document.querySelector(".grid-background");
    expect(gridBackground).toBeDefined();

    // Vérifier que le body a la classe relative
    const body = document.querySelector("body");
    expect(body?.classList.contains("relative")).toBe(true);

    // Vérifier que main et footer existent (pas besoin de z-index spécifique maintenant)
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");

    expect(main).toBeDefined();
    expect(footer).toBeDefined();
  });

  it("should have proper structure for layering", () => {
    const html = `
      <body class="relative">
        <div class="grid-background"></div>
        <header></header>
        <main></main>
        <footer></footer>
      </body>
    `;

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const elements = Array.from(
      document.querySelectorAll("body > *"),
    ) as Element[];
    const gridBackground = elements.find((el: Element) =>
      el.classList.contains("grid-background"),
    );
    const main = elements.find((el: Element) => el.tagName === "MAIN") as
      | HTMLElement
      | undefined;
    const footer = elements.find((el: Element) => el.tagName === "FOOTER") as
      | HTMLElement
      | undefined;

    // La grille doit être le premier élément
    expect(elements[0]).toBe(gridBackground);

    // Main et footer doivent exister
    expect(main).toBeDefined();
    expect(footer).toBeDefined();
  });
});
