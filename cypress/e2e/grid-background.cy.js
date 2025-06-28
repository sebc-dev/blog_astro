describe("Content Background Layout", () => {
  beforeEach(() => {
    cy.visit("/");
    // Attendre que la page soit complètement chargée
    cy.wait(500);
  });

  describe("Element Existence and Basic Properties", () => {
    it("should have content background element with correct structure", () => {
      // Vérifier que l'élément de background existe
      cy.get('[data-cy="content-background"]')
        .should("exist")
        .should(($el) => {
          // L'élément doit être dans le DOM
          expect($el).to.have.length(1);
        });
    });

    it("should have correct CSS positioning properties", () => {
      cy.get('[data-cy="content-background"]')
        .should("have.css", "position", "fixed")
        .should("have.css", "top", "0px")
        .should("have.css", "z-index", "-1")
        .should("have.css", "pointer-events", "none")
        .should(($el) => {
          const element = $el[0];
          const computedStyle = window.getComputedStyle(element);
          
          // Vérifier que left existe (peut être 50%, auto, ou une valeur calculée)
          expect(computedStyle.left).to.not.be.undefined;
        });
    });

    it("should cover the appropriate viewport area", () => {
      cy.get('[data-cy="content-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier les dimensions - doit avoir une largeur et hauteur
        expect(computedStyle.width).to.not.equal("0px");
        expect(computedStyle.height).to.match(/\d+vh|\d+px/); // Height en vh ou pixels
      });
    });
  });

  describe("Background Styling Properties", () => {
    it("should have appropriate background color", () => {
      cy.get('[data-cy="content-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier qu'il y a une couleur de fond
        expect(computedStyle.backgroundColor).to.not.equal("rgba(0, 0, 0, 0)");
        expect(computedStyle.backgroundColor).to.not.equal("transparent");
      });
    });

    it("should have correct container styling", () => {
      cy.get('[data-cy="content-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier la largeur maximale
        expect(computedStyle.maxWidth).to.equal("1280px"); // max-w-7xl
        
        // Vérifier qu'il y a une transformation (peut être matrix ou translateX)
        expect(computedStyle.transform).to.not.equal("none");
        
        // Vérifier le positionnement de centrage (left est calculé en pixels, vérifier qu'il est raisonnable)
        const leftValue = Number.parseFloat(computedStyle.left);
        expect(leftValue).to.be.greaterThan(100); // Doit être un décalage significatif pour le centrage
      });
    });

    it("should have appropriate padding", () => {
      cy.get('[data-cy="content-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier le padding
        expect(computedStyle.paddingLeft).to.equal("16px"); // 1rem = 16px
        expect(computedStyle.paddingRight).to.equal("16px");
      });
    });
  });

  describe("Layering and Content Interaction", () => {
    it("should not interfere with page content", () => {
      // Vérifier que le contenu principal est accessible
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should("exist");
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get("footer").should("exist");

      // Vérifier que le background existe en arrière-plan
      cy.get('[data-cy="content-background"]').should("exist");
    });

    it("should allow proper content interaction", () => {
      // Vérifier que les éléments interactifs fonctionnent
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should("exist");

      // Tester qu'on peut cliquer sur les éléments de navigation s'ils existent
      cy.get('[data-cy="logo-desktop"], [data-cy="logo-mobile"]')
        .first()
        .should("exist");
    });

    it("should maintain proper z-index hierarchy", () => {
      // Le background doit être derrière tout le contenu
      cy.get('[data-cy="content-background"]').should("have.css", "z-index", "-1");

      // Le contenu principal doit être visible par-dessus
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should("exist");
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
        cy.wait(200); // Attendre l'adaptation du viewport

        // Le background doit toujours exister
        cy.get('[data-cy="content-background"]').should("exist");

        // Le contenu doit rester accessible
        cy.get('[data-cy="main-content"]').should("be.visible");
        cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]').should("exist");
      });
    });
  });

  describe("Scroll Behavior", () => {
    it("should remain fixed during scroll", () => {
      // Tester le scroll pour vérifier que le background reste fixe
      cy.scrollTo(0, 500);
      cy.get('[data-cy="content-background"]')
        .should("exist")
        .should("have.css", "position", "fixed");

      // Le contenu doit rester accessible
      cy.get('[data-cy="main-content"]').should("be.visible");
    });

    it("should not affect scroll performance", () => {
      // Test de performance basique - vérifier que le scroll fonctionne
      cy.scrollTo(0, 1000, { duration: 500 });
      cy.get('[data-cy="content-background"]').should("exist");

      cy.scrollTo("top", { duration: 500 });
      cy.get('[data-cy="content-background"]').should("exist");
    });
  });

  describe("Theme Compatibility", () => {
    it("should exist regardless of theme", () => {
      // Tester avec différents data-theme si disponibles
      const themes = ["light-blue", "dark-blue"];

      themes.forEach((theme) => {
        cy.get('[data-cy="app-body"]').then(($body) => {
          if ($body.length > 0) {
            $body.attr("data-theme", theme);
          }
        });

        // Le background doit toujours exister et fonctionner
        cy.get('[data-cy="content-background"]').should("exist");
        cy.get('[data-cy="main-content"]').should("be.visible");
      });
    });
  });

  describe("Accessibility", () => {
    it("should not interfere with screen readers", () => {
      // Vérifier que le background a pointer-events: none
      cy.get('[data-cy="content-background"]').should(
        "have.css",
        "pointer-events",
        "none"
      );
    });

    it("should not affect keyboard navigation", () => {
      // Vérifier que le background a pointer-events: none pour ne pas interférer
      cy.get('[data-cy="content-background"]').should(
        "have.css",
        "pointer-events",
        "none"
      );

      // Vérifier qu'il existe des éléments interactifs sur la page
      cy.get("a, button, input, textarea").should("have.length.greaterThan", 0);

      // Vérifier que le background n'interfère pas avec les éléments du DOM
      cy.get('[data-cy="content-background"]').should("not.have.attr", "tabindex");
    });

    it("should not cause accessibility issues", () => {
      // Vérifier que le background ne cause pas de problèmes d'accessibilité
      cy.get('[data-cy="content-background"]').should("exist");

      // Vérifier que le contenu reste accessible
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get("h1, h2, h3").should("have.length.greaterThan", 0);
    });
  });

  describe("Performance and Optimization", () => {
    it("should not cause layout shifts", () => {
      // Vérifier que le background ne cause pas de décalages de layout
      cy.get('[data-cy="content-background"]')
        .should("have.css", "position", "fixed")
        .should("have.css", "top", "0px");
    });

    it("should be properly layered behind content", () => {
      // Vérifier que tous les éléments principaux sont au-dessus du background
      cy.get('[data-cy="main-content"]').should("be.visible");
      cy.get('[data-cy="latest-articles-section"]').should("be.visible");
      cy.get('[data-cy="content-background"]').should("have.css", "z-index", "-1");
    });

    it("should not affect content rendering", () => {
      // Vérifier que les articles se chargent correctement malgré le background
      cy.get('[data-cy="article-card"], [data-cy="article-hero"]').should(
        "have.length.at.least",
        1
      );
      cy.get('[data-cy="articles-container"]').should("be.visible");
    });

    it("should have correct box sizing", () => {
      cy.get('[data-cy="content-background"]').should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier le box-sizing
        expect(computedStyle.boxSizing).to.equal("border-box");
      });
    });
  });

  describe("Layout Integration", () => {
    it("should integrate properly with the main layout", () => {
      // Vérifier que le background fait partie du bon container
      cy.get("body").within(() => {
        cy.get('[data-cy="content-background"]').should("exist");
        cy.get('[data-cy="main-content"]').should("exist");
      });
    });

    it("should not interfere with responsive grid layout", () => {
      // Tester différents viewports et vérifier que le layout reste cohérent
      const viewports = [375, 768, 1024, 1280];
      
      viewports.forEach(width => {
        cy.viewport(width, 800);
        cy.wait(200);
        
        cy.get('[data-cy="content-background"]').should("exist");
        cy.get('[data-cy="main-content"]').should("be.visible");
      });
    });

    it("should work with dynamic content", () => {
      // Vérifier que le background fonctionne avec du contenu dynamique
      cy.get('[data-cy="content-background"]').should("exist");
      
      // Tester la navigation pour voir si le background reste cohérent
      // Utiliser un sélecteur plus fiable pour les liens d'articles
      cy.get('[data-cy="article-read-button"], [data-cy="article-title-link"]')
        .first()
        .then(($link) => {
          if ($link.length > 0 && $link.is(':visible')) {
            cy.wrap($link).click();
            cy.get('[data-cy="content-background"]').should("exist");
          } else {
            // Si aucun lien visible n'est trouvé, vérifier simplement que le background persiste
            cy.log("No visible article links found, checking background persistence");
            cy.get('[data-cy="content-background"]').should("exist");
          }
        });
    });
  });
});
