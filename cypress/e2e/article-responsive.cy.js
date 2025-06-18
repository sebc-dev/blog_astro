/// <reference types="cypress" />

describe('Articles Responsive Display', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Desktop Display (lg+)', () => {
    beforeEach(() => {
      // Simuler un viewport desktop
      cy.viewport(1280, 720);
    });

    it('devrait afficher ArticleHero sur desktop', () => {
      cy.get('[data-cy="hero-section"]').should('be.visible');
      cy.get('[data-cy="article-hero"]').should('exist');
    });

    it('devrait afficher la grille d\'articles desktop (sans le premier)', () => {
      cy.get('[data-cy="grid-section-desktop"]').should('be.visible');
      cy.get('[data-cy="articles-grid-desktop"]').should('exist');
      cy.get('[data-cy="articles-grid-desktop"]').should('have.class', 'lg:grid-cols-3');
    });

    it('ne devrait pas afficher la grille mobile sur desktop', () => {
      cy.get('[data-cy="grid-section-mobile"]').should('not.be.visible');
    });

    it('devrait avoir les éléments héro correctement structurés', () => {
      cy.get('[data-cy="article-hero"]').within(() => {
        cy.get('[data-cy="hero-title"]').should('be.visible');
        cy.get('[data-cy="hero-description"]').should('be.visible');
        cy.get('[data-cy="hero-read-button"]').should('be.visible');
        cy.get('[data-cy="hero-metadata"]').should('be.visible');
      });
    });
  });

  describe('Mobile Display (< lg)', () => {
    beforeEach(() => {
      // Simuler un viewport mobile
      cy.viewport(375, 667);
    });

    it('ne devrait pas afficher ArticleHero sur mobile', () => {
      cy.get('[data-cy="hero-section"]').should('not.be.visible');
    });

    it('devrait afficher la grille mobile avec tous les articles', () => {
      cy.get('[data-cy="grid-section-mobile"]').should('be.visible');
      cy.get('[data-cy="articles-grid-mobile"]').should('have.class', 'grid-cols-1');
    });

    it('devrait avoir une mise en page en colonne sur petit mobile', () => {
      cy.get('[data-cy="articles-grid-mobile"]').should('have.class', 'grid-cols-1');
    });

    it('devrait afficher les articles avec tous les éléments nécessaires', () => {
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]').first().within(() => {
        cy.get('[data-cy="article-title"]').should('be.visible');
        cy.get('[data-cy="article-description"]').should('be.visible');
        cy.get('[data-cy="article-read-button"]').should('be.visible');
        cy.get('[data-cy="article-metadata"]').should('be.visible');
      });
    });

    it('devrait afficher les métadonnées correctement', () => {
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]').first().within(() => {
        cy.get('[data-cy="article-metadata"]').should('be.visible');
        cy.get('[data-cy="article-date"]').should('be.visible');
        cy.get('[data-cy="article-reading-time"]').should('be.visible');
      });
    });
  });

  describe('Tablet Display (sm-md)', () => {
    beforeEach(() => {
      // Simuler un viewport tablette
      cy.viewport(768, 1024);
    });

    it('ne devrait pas afficher ArticleHero sur tablette', () => {
      cy.get('[data-cy="hero-section"]').should('not.be.visible');
    });

    it('devrait afficher 2 colonnes sur tablette', () => {
      cy.get('[data-cy="grid-section-mobile"]').should('be.visible');
      cy.get('[data-cy="articles-grid-mobile"]').should('have.class', 'sm:grid-cols-2');
    });
  });

  describe('Responsive Breakpoints', () => {
    it('devrait basculer correctement entre mobile et desktop', () => {
      // Mobile d'abord
      cy.viewport(375, 667);
      cy.get('[data-cy="hero-section"]').should('not.be.visible');
      cy.get('[data-cy="grid-section-mobile"]').should('be.visible');

      // Puis desktop
      cy.viewport(1280, 720);
      cy.get('[data-cy="hero-section"]').should('be.visible');
      cy.get('[data-cy="grid-section-mobile"]').should('not.be.visible');
    });
  });

  describe('Contenu des Articles', () => {
    it('devrait afficher le même contenu sur mobile et desktop', () => {
      // Desktop - récupérer le titre du premier article en grille
      cy.viewport(1280, 720);
      cy.get('[data-cy="articles-grid-desktop"] [data-cy="article-card"]')
        .first()
        .find('[data-cy="article-title"]')
        .invoke('text')
        .as('desktopFirstGridTitle');

      // Mobile - vérifier que le deuxième article (premier en grille desktop) existe
      cy.viewport(375, 667);
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]')
        .eq(1) // Deuxième article car le premier est celui qui était en hero
        .find('[data-cy="article-title"]')
        .invoke('text')
        .then((mobileSecondTitle) => {
          cy.get('@desktopFirstGridTitle').then((desktopFirstTitle) => {
            expect(mobileSecondTitle).to.equal(desktopFirstTitle);
          });
        });
    });

    it('devrait inclure le premier article dans la grille mobile', () => {
      cy.viewport(375, 667);
      
      // Vérifier qu'il y a au moins un article dans la grille mobile
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]').should('have.length.at.least', 1);
      
      // Le premier article mobile devrait être présent
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]')
        .first()
        .should('be.visible');
    });

    it('devrait avoir des liens d\'articles fonctionnels', () => {
      // Tester sur mobile dans le contexte de cette section
      cy.viewport(375, 667);
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]').first().within(() => {
        cy.get('[data-cy="article-title-link"]').should('have.attr', 'href').and('include', '/blog/');
        cy.get('[data-cy="article-read-button"]').should('have.attr', 'href').and('include', '/blog/');
      });
    });
  });

  describe('Interaction utilisateur', () => {
    it('devrait permettre de naviguer vers un article via le titre', () => {
      // Tester sur mobile
      cy.viewport(375, 667);
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]').first().within(() => {
        cy.get('[data-cy="article-title-link"]').should('be.visible').and('not.be.disabled');
      });
    });

    it('devrait permettre de naviguer vers un article via le bouton', () => {
      // Tester sur mobile
      cy.viewport(375, 667);
      cy.get('[data-cy="articles-grid-mobile"] [data-cy="article-card"]').first().within(() => {
        cy.get('[data-cy="article-read-button"]').should('be.visible').and('not.be.disabled');
      });
    });

    it('devrait permettre de naviguer vers un article hero', () => {
      cy.viewport(1280, 720);
      cy.get('[data-cy="article-hero"]').within(() => {
        cy.get('[data-cy="hero-title-link"]').should('be.visible').and('not.be.disabled');
        cy.get('[data-cy="hero-read-button"]').should('be.visible').and('not.be.disabled');
      });
    });
  });
}); 