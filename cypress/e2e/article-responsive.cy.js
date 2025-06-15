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
      cy.get('.hero-section').should('be.visible');
      cy.get('[class*="h-[calc(100vh-6rem)]"]').should('exist');
    });

    it('devrait afficher la grille d\'articles desktop (sans le premier)', () => {
      cy.get('.grid-section.hidden.lg\\:block').should('be.visible');
      cy.get('.articles-grid').should('have.class', 'lg:grid-cols-3');
    });

    it('ne devrait pas afficher la grille mobile sur desktop', () => {
      cy.get('.grid-section.lg\\:hidden').should('not.be.visible');
    });
  });

  describe('Mobile Display (< lg)', () => {
    beforeEach(() => {
      // Simuler un viewport mobile
      cy.viewport(375, 667);
    });

    it('ne devrait pas afficher ArticleHero sur mobile', () => {
      cy.get('.hero-section.hidden.lg\\:block').should('not.be.visible');
    });

    it('devrait afficher la grille mobile avec tous les articles', () => {
      cy.get('.grid-section.lg\\:hidden').should('be.visible');
      cy.get('.grid-section.lg\\:hidden .articles-grid').should('have.class', 'grid-cols-1');
    });

    it('devrait avoir une mise en page en colonne sur petit mobile', () => {
      cy.get('.articles-grid').should('have.class', 'grid-cols-1');
    });
  });

  describe('Tablet Display (sm-md)', () => {
    beforeEach(() => {
      // Simuler un viewport tablette
      cy.viewport(768, 1024);
    });

    it('ne devrait pas afficher ArticleHero sur tablette', () => {
      cy.get('.hero-section.hidden.lg\\:block').should('not.be.visible');
    });

    it('devrait afficher 2 colonnes sur tablette', () => {
      cy.get('.grid-section.lg\\:hidden').should('be.visible');
      cy.get('.articles-grid').should('have.class', 'sm:grid-cols-2');
    });
  });

  describe('Responsive Breakpoints', () => {
    it('devrait basculer correctement entre mobile et desktop', () => {
      // Mobile d'abord
      cy.viewport(375, 667);
      cy.get('.hero-section').should('not.be.visible');
      cy.get('.grid-section.lg\\:hidden').should('be.visible');

      // Puis desktop
      cy.viewport(1280, 720);
      cy.get('.hero-section').should('be.visible');
      cy.get('.grid-section.lg\\:hidden').should('not.be.visible');
    });
  });

  describe('Contenu des Articles', () => {
    it('devrait afficher le même contenu sur mobile et desktop', () => {
      // Desktop - récupérer le titre du premier article en grille
      cy.viewport(1280, 720);
      cy.get('.grid-section.hidden.lg\\:block .articles-grid article')
        .first()
        .find('h3')
        .invoke('text')
        .as('desktopFirstGridTitle');

      // Mobile - vérifier que le deuxième article (premier en grille desktop) existe
      cy.viewport(375, 667);
      cy.get('.grid-section.lg\\:hidden .articles-grid article')
        .eq(1) // Deuxième article car le premier est celui qui était en hero
        .find('h3')
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
      cy.get('.grid-section.lg\\:hidden .articles-grid article').should('have.length.at.least', 1);
      
      // Le premier article mobile devrait être présent
      cy.get('.grid-section.lg\\:hidden .articles-grid article')
        .first()
        .should('be.visible');
    });
  });
}); 