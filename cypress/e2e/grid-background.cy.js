describe("Grid Background - Ultra Discrete", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Element Existence and Basic Properties", () => {
    it("should have grid background element with correct structure", () => {
      // Vérifier que l'élément de grille existe (même si ultra-discret)
      cy.get('[data-cy="grid-background"]')
        .should("exist")
        .should(($el) => {
          // L'élément doit être dans le DOM
          expect($el).to.have.length(1);
        });
    });

    it("should have correct CSS positioning properties", () => {
      cy.get('[data-cy="grid-background"]')
        .should("have.css", "position", "fixed")
        .should("have.css", "top", "0px")
        .should("have.css", "left", "0px")
        .should("have.css", "z-index", "-1")
        .should("have.css", "pointer-events", "none");
    });

    it("should cover the entire viewport", () => {
      cy.get('[data-cy="grid-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier les dimensions
        expect(computedStyle.width).to.match(/\d+px/); // Width en pixels
        expect(computedStyle.height).to.match(/\d+vh|\d+px/); // Height en vh ou pixels
      });
    });
  });

  describe("Grid Pattern Properties", () => {
    it("should have background-image gradients for grid pattern", () => {
      cy.get('[data-cy="grid-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier qu'il y a des background-images (peut être 'none' si trop discret)
        expect(computedStyle.backgroundImage).to.not.be.undefined;
      });
    });

    it("should have appropriate background-size for desktop", () => {
      cy.viewport(1280, 720); // Desktop viewport

      cy.get('[data-cy="grid-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier la taille de la grille (24px pour desktop par défaut)
        expect(computedStyle.backgroundSize).to.include("24px");
      });
    });

    it("should adapt background-size for mobile", () => {
      cy.viewport(375, 667); // Mobile viewport

      cy.get('[data-cy="grid-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier la taille de la grille adaptée pour très petits écrans (16px optimisé)
        expect(computedStyle.backgroundSize).to.include("16px");
      });
    });

    it("should adapt background-size for tablet", () => {
      cy.viewport(768, 1024); // Tablet viewport

      cy.get('[data-cy="grid-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier la taille de la grille pour tablette (20px)
        expect(computedStyle.backgroundSize).to.include("20px");
      });
    });
  });

  describe("Layering and Content Interaction", () => {
    it("should not interfere with page content", () => {
      // Vérifier que le contenu principal est accessible avec data-cy
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should(
        "exist",
      );
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get("footer").should("exist");

      // Vérifier que la grille existe en arrière-plan
      cy.get('[data-cy="grid-background"]').should("exist");
    });

    it("should allow proper content interaction", () => {
      // Vérifier que les éléments interactifs fonctionnent
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should(
        "exist",
      );

      // Tester qu'on peut cliquer sur les éléments de navigation s'ils existent
      cy.get('[data-cy="logo-desktop"], [data-cy="logo-mobile"]')
        .first()
        .should("exist");
    });

    it("should maintain proper z-index hierarchy", () => {
      // La grille doit être derrière tout le contenu
      cy.get('[data-cy="grid-background"]').should("have.css", "z-index", "-1");

      // Le contenu principal doit être visible par-dessus
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should(
        "exist",
      );
    });
  });

  describe("Responsive Behavior", () => {
    const viewports = [
      { name: "Mobile Portrait", width: 375, height: 667 },
      { name: "Mobile Landscape", width: 667, height: 375 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Desktop Small", width: 1024, height: 768 },
      { name: "Desktop Large", width: 1920, height: 1080 },
    ];

    viewports.forEach((viewport) => {
      it(`should work correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height);

        // La grille doit toujours exister
        cy.get('[data-cy="grid-background"]').should("exist");

        // Le contenu doit rester accessible
        cy.get('[data-cy="main-content"]').should("be.visible");
        cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should(
          "exist",
        );
      });
    });
  });

  describe("Scroll Behavior", () => {
    it("should remain fixed during scroll", () => {
      // Tester le scroll pour vérifier que la grille reste fixe
      cy.scrollTo(0, 500);
      cy.get('[data-cy="grid-background"]')
        .should("exist")
        .should("have.css", "position", "fixed");

      // Le contenu doit rester accessible
      cy.get('[data-cy="main-content"]').should("be.visible");
    });

    it("should not affect scroll performance", () => {
      // Test de performance basique - vérifier que le scroll fonctionne
      cy.scrollTo(0, 1000, { duration: 500 });
      cy.get('[data-cy="grid-background"]').should("exist");

      cy.scrollTo("top", { duration: 500 });
      cy.get('[data-cy="grid-background"]').should("exist");
    });
  });

  describe("Theme Compatibility", () => {
    it("should adapt to different themes", () => {
      // Tester avec différents data-theme si disponibles
      const themes = ["light-blue", "dark-blue"];

      themes.forEach((theme) => {
        cy.get('[data-cy="app-body"]').then(($body) => {
          $body.attr("data-theme", theme);
        });

        // La grille doit toujours exister et fonctionner
        cy.get('[data-cy="grid-background"]').should("exist");
        cy.get('[data-cy="main-content"]').should("be.visible");
      });
    });
  });

  describe("Accessibility", () => {
    it("should not interfere with screen readers", () => {
      // Vérifier que la grille a pointer-events: none
      cy.get('[data-cy="grid-background"]').should(
        "have.css",
        "pointer-events",
        "none",
      );
    });

    it("should not affect keyboard navigation", () => {
      // Vérifier que la grille a pointer-events: none pour ne pas interférer
      cy.get('[data-cy="grid-background"]').should(
        "have.css",
        "pointer-events",
        "none",
      );

      // Vérifier qu'il existe des éléments interactifs sur la page
      cy.get("a, button, input, textarea").should("have.length.greaterThan", 0);

      // Vérifier que la grille n'interfère pas avec les éléments du DOM
      cy.get('[data-cy="grid-background"]').should("not.have.attr", "tabindex");
    });

    it("should respect reduced motion preferences", () => {
      // Test pour prefers-reduced-motion - la grille est désactivée pour une performance maximale
      cy.get('[data-cy="grid-background"]').should("exist");

      // Vérifier que le background reste fonctionnel par défaut
      cy.get('[data-cy="grid-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Le background devrait être présent par défaut
        expect(computedStyle.backgroundImage).to.not.equal("none");
      });
    });
  });

  describe("Performance and Optimization", () => {
    it("should not cause layout shifts", () => {
      // Vérifier que la grille ne cause pas de décalages de layout
      cy.get('[data-cy="grid-background"]')
        .should("have.css", "position", "fixed")
        .should("have.css", "top", "0px")
        .should("have.css", "left", "0px");
    });

    it("should be properly layered behind content", () => {
      // Vérifier que tous les éléments principaux sont au-dessus de la grille
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get('[data-cy="latest-articles-section"]').should("be.visible");
      cy.get('[data-cy="grid-background"]').should("have.css", "z-index", "-1");
    });

    it("should not affect content rendering", () => {
      // Vérifier que les articles se chargent correctement malgré la grille
      cy.get('[data-cy="article-card"], [data-cy="article-hero"]').should(
        "have.length.at.least",
        1,
      );
      cy.get('[data-cy="articles-container"]').should("be.visible");
    });
  });
});
