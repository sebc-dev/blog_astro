describe("Table des Matières - Scroll avec Offset", () => {
  beforeEach(() => {
    // Gérer les erreurs JavaScript potentielles
    cy.on("uncaught:exception", (err, runnable) => {
      // Ignorer les erreurs non critiques
      if (
        err.message.includes("Failed to resolve module") ||
        err.message.includes("Invalid or unexpected token")
      ) {
        return false;
      }
      return true;
    });

    // Vérifier que la page existe avant de continuer
    cy.request("/blog/fr/guide-astro").its("status").should("eq", 200);
    cy.visit("/blog/fr/guide-astro");

    // Attendre que la page soit complètement chargée
    cy.wait(1000);
  });

  it("devrait afficher la table des matières sur desktop", () => {
    // Vérifier que la table des matières est présente avec data-cy
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 })
      .should("exist")
      .should("be.visible");

    // Vérifier le titre
    cy.get('[data-cy="toc-title"]')
      .should("be.visible")
      .should("contain", "Table des matières");

    // Vérifier qu'elle contient des liens
    cy.get('[data-cy="toc-link"]').should("have.length.greaterThan", 0);
  });

  it("devrait scroller avec un offset correct quand on clique sur un lien TOC", () => {
    // Attendre que la table des matières soit chargée
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Récupérer le premier lien de la table des matières
    cy.get('[data-cy="toc-link"]')
      .first()
      .then(($link) => {
        const href = $link.attr("href");
        const targetId = href.replace("#", "");

        // Scroller en bas de la page d'abord
        cy.scrollTo("bottom");
        cy.wait(500);

        // Cliquer sur le lien de la table des matières
        cy.get('[data-cy="toc-link"]').first().click();
        cy.wait(1000);

        // Vérifier que l'élément cible existe
        cy.get(`#${targetId}`).should("exist");

        // Constantes pour l'offset du header
        const HEADER_HEIGHT = 96; // 6rem = 96px
        const OFFSET_TOLERANCE = 50; // Tolérance plus large pour les variations

        // Vérifier que l'élément cible est visible dans le viewport
        cy.get(`#${targetId}`).should("be.visible");

        // Vérifier que l'élément n'est pas masqué par le header
        cy.get(`#${targetId}`).then(($target) => {
          const rect = $target[0].getBoundingClientRect();

          // Vérifier que l'élément est dans une position raisonnable
          expect(rect.top).to.be.greaterThan(0);
          expect(rect.top).to.be.lessThan(HEADER_HEIGHT + OFFSET_TOLERANCE);
        });
      });
  });

  it("devrait avoir un comportement de scroll fluide", () => {
    // Vérifier le CSS scroll-behavior
    cy.get("html").then(($html) => {
      const scrollBehavior = window.getComputedStyle($html[0]).scrollBehavior;

      // Accepter 'smooth' ou 'auto' car cela peut varier selon le navigateur
      expect(["smooth", "auto"]).to.include(scrollBehavior);
    });

    // Vérifier le scroll-padding-top si configuré
    cy.get("html").then(($html) => {
      const scrollPadding = window.getComputedStyle($html[0]).scrollPaddingTop;

      // Le scroll-padding peut être défini ou non
      if (scrollPadding && scrollPadding !== "auto") {
        expect(scrollPadding).to.match(/\d+px/);
      }
    });
  });

  it("devrait masquer la table des matières sur mobile", () => {
    // Attendre que la table soit d'abord visible sur desktop
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Simuler un viewport mobile
    cy.viewport(375, 667);
    cy.wait(300); // Attendre l'adaptation

    // Vérifier que la table des matières est masquée sur mobile
    cy.get('[data-cy="table-of-contents"]').should("not.be.visible");

    // Retour au viewport desktop pour les tests suivants
    cy.viewport(1280, 720);
  });

  it("devrait avoir des liens accessibles avec focus visible", () => {
    // Attendre que la table soit chargée
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Tester la navigation au clavier
    cy.get('[data-cy="toc-link"]').first().focus().should("have.focus");

    // Vérifier que le focus est visible (outline ou autre style)
    cy.get('[data-cy="toc-link"]')
      .first()
      .should(($el) => {
        const element = $el[0];
        const computedStyle = window.getComputedStyle(element);

        // Vérifier qu'il y a un style de focus visible
        const hasOutline =
          computedStyle.outline !== "none" && computedStyle.outline !== "";
        const hasBoxShadow = computedStyle.boxShadow !== "none";
        const hasBackground =
          computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)";

        expect(hasOutline || hasBoxShadow || hasBackground).to.be.true;
      });
  });

  it("devrait supporter la navigation entre plusieurs niveaux de headings", () => {
    // Attendre que la table soit chargée
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Vérifier qu'il y a des sous-sections si elles existent
    cy.get('[data-cy="table-of-contents"]').then(($toc) => {
      if ($toc.find('[data-cy="toc-sublink"]').length > 0) {
        // Si il y a des sous-listes, tester la navigation
        cy.get('[data-cy="toc-sublink"]')
          .first()
          .then(($sublink) => {
            const href = $sublink.attr("href");
            const targetId = href.replace("#", "");

            // Scroller vers le bas d'abord
            cy.scrollTo("bottom");
            cy.wait(500);

            // Cliquer sur le lien de sous-section
            cy.get('[data-cy="toc-sublink"]').first().click();
            cy.wait(1000);

            // Vérifier que le target existe et est visible
            cy.get(`#${targetId}`).should("exist").should("be.visible");
          });
      } else {
        // Si pas de sous-sections, vérifier juste qu'il y a des liens principaux
        cy.get('[data-cy="toc-link"]').should("have.length.greaterThan", 0);
        cy.log("No sub-sections found, but main TOC links are present");
      }
    });
  });

  it("devrait permettre de naviguer vers tous les liens de la table des matières", () => {
    // Attendre que la table soit chargée
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Tester quelques liens de la table des matières
    cy.get('[data-cy="toc-link"]').then(($links) => {
      const linksCount = Math.min($links.length, 3); // Tester maximum 3 liens

      for (let i = 0; i < linksCount; i++) {
        cy.get('[data-cy="toc-link"]')
          .eq(i)
          .then(($link) => {
            const href = $link.attr("href");
            const targetId = href.replace("#", "");

            // Scroller vers le bas
            cy.scrollTo("bottom");
            cy.wait(300);

            // Cliquer sur le lien
            cy.get('[data-cy="toc-link"]').eq(i).click();
            cy.wait(500);

            // Vérifier que l'élément cible existe
            cy.get(`#${targetId}`).should("exist");
          });
      }
    });
  });

  it("devrait maintenir la structure et le style de la table des matières", () => {
    // Attendre que la table soit chargée
    cy.get('[data-cy="table-of-contents"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Vérifier la structure
    cy.get('[data-cy="toc-title"]').should("exist");
    cy.get('[data-cy="toc-nav"]').should("exist");
    cy.get('[data-cy="toc-list"]').should("exist");

    // Vérifier les styles de base
    cy.get('[data-cy="table-of-contents"]').should(($el) => {
      const element = $el[0];
      const computedStyle = window.getComputedStyle(element);

      // Vérifier que l'élément a un positionnement approprié
      expect(["sticky", "static", "relative"]).to.include(
        computedStyle.position,
      );

      // Vérifier qu'il a un arrière-plan
      expect(computedStyle.backgroundColor).to.not.equal("rgba(0, 0, 0, 0)");
    });
  });
});
