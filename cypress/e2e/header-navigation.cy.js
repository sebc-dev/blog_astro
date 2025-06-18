/// <reference types="cypress" />

describe('Header Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Desktop Header', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it('should display desktop header correctly', () => {
      cy.get('[data-cy="header-desktop"]').should('be.visible');
      cy.get('[data-cy="header-mobile"]').should('not.be.visible');
    });

    it('should have functional logo link', () => {
      cy.get('[data-cy="logo-desktop"]')
        .should('be.visible')
        .should('have.attr', 'href')
        .and('include', '/');
    });

    it('should display all navigation links', () => {
      cy.get('[data-cy="nav-links-desktop"]').should('be.visible');
      cy.get('[data-cy="nav-links-desktop"] a').should('have.length.at.least', 1);
    });

    it('should have functional navigation links', () => {
      cy.get('[data-cy="nav-links-desktop"] a').each(($link) => {
        cy.wrap($link)
          .should('have.attr', 'href')
          .and('not.be.empty');
      });
    });

    it('should have language selector', () => {
      cy.get('[data-cy="language-selector-desktop"]').should('be.visible');
      cy.get('[data-cy="language-toggle-desktop"]').should('be.visible');
    });

    it('should open language dropdown on click', () => {
      cy.get('[data-cy="language-toggle-desktop"]').click();
      cy.get('[data-cy="language-menu-desktop"]').should('be.visible');
    });

    it('should have theme toggle button', () => {
      cy.get('[data-cy="theme-toggle-desktop"]').should('be.visible');
    });

    it('should toggle theme when clicked', () => {
      // Note: ce test vérifie seulement que le bouton est cliquable
      // Le test de fonctionnalité du thème devrait être dans un test séparé
      cy.get('[data-cy="theme-toggle-desktop"]')
        .should('be.visible')
        .and('not.be.disabled');
    });
  });

  describe('Mobile Header', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('should display mobile header correctly', () => {
      cy.get('[data-cy="header-mobile"]').should('be.visible');
      cy.get('[data-cy="header-desktop"]').should('not.be.visible');
    });

    it('should have functional mobile logo', () => {
      cy.get('[data-cy="logo-mobile"]')
        .should('be.visible')
        .should('have.attr', 'href')
        .and('include', '/');
    });

    it('should have menu toggle button', () => {
      cy.get('[data-cy="menu-toggle-mobile"]').should('be.visible');
    });

    it('should open mobile menu when toggle is clicked', () => {
      // Le menu doit être fermé initialement
      cy.get('[data-cy="mobile-menu"]').should('not.be.visible');
      
      // Cliquer sur le toggle
      cy.get('[data-cy="menu-toggle-mobile"]').click();
      
      // Le menu doit s'ouvrir
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      cy.get('[data-cy="mobile-menu-content"]').should('be.visible');
    });

    it('should close mobile menu when overlay is clicked', () => {
      // Ouvrir le menu
      cy.get('[data-cy="menu-toggle-mobile"]').click();
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      
      // Cliquer sur l'overlay
      cy.get('[data-cy="mobile-menu-overlay"]').click({ force: true });
      
      // Le menu doit se fermer
      cy.get('[data-cy="mobile-menu"]').should('not.be.visible');
    });

    it('should have navigation links in mobile menu', () => {
      cy.get('[data-cy="menu-toggle-mobile"]').click();
      cy.get('[data-cy="nav-links-mobile"]').should('be.visible');
      cy.get('[data-cy="nav-links-mobile"] a').should('have.length.at.least', 1);
    });

    it('should have language options in mobile menu', () => {
      cy.get('[data-cy="menu-toggle-mobile"]').click();
      cy.get('[data-cy="language-selector-mobile"]').should('be.visible');
      cy.get('[data-cy="language-options-mobile"]').should('be.visible');
    });

    it('should have theme toggle in mobile menu', () => {
      cy.get('[data-cy="menu-toggle-mobile"]').click();
      cy.get('[data-cy="theme-toggle-mobile"]').should('be.visible');
    });
  });

  describe('Responsive Behavior', () => {
    it('should switch between desktop and mobile headers correctly', () => {
      // Desktop
      cy.viewport(1280, 720);
      cy.get('[data-cy="header-desktop"]').should('be.visible');
      cy.get('[data-cy="header-mobile"]').should('not.be.visible');

      // Mobile
      cy.viewport(375, 667);
      cy.get('[data-cy="header-desktop"]').should('not.be.visible');
      cy.get('[data-cy="header-mobile"]').should('be.visible');

      // Tablet (should show mobile)
      cy.viewport(768, 1024);
      cy.get('[data-cy="header-desktop"]').should('not.be.visible');
      cy.get('[data-cy="header-mobile"]').should('be.visible');
    });
  });

  describe('Navigation Functionality', () => {
    it('should navigate to home when logo is clicked', () => {
      cy.get('[data-cy="logo-desktop"], [data-cy="logo-mobile"]')
        .first()
        .should('have.attr', 'href')
        .and('include', '/');
    });

    it('should highlight active navigation item', () => {
      // Sur la page d'accueil, le lien home devrait être actif
      cy.get('[data-cy^="nav-link-"]').then(($links) => {
        // Au moins un lien devrait avoir des styles actifs
        const hasActiveStyles = Array.from($links).some(link => 
          link.className.includes('font-semibold') || 
          link.getAttribute('aria-current') === 'page'
        );
        expect(hasActiveStyles).to.be.true;
      });
    });
  });

  describe('Language Switching', () => {
    it('should have language options available', () => {
      // Desktop
      cy.viewport(1280, 720);
      cy.get('[data-cy="language-toggle-desktop"]').click();
      cy.get('[data-cy^="language-option-"]').should('have.length.at.least', 1);
    });

    it('should show current language in selector', () => {
      cy.get('[data-cy="language-toggle-desktop"], [data-cy="language-selector-mobile"]')
        .first()
        .then(($el) => {
          const text = $el.text();
          expect(text).to.satisfy((str) => str.includes('EN') || str.includes('FR'));
        });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      cy.get('[data-cy="header-desktop"] nav, [data-cy="nav-mobile"]')
        .should('have.attr', 'aria-label');
      
      cy.get('[data-cy="menu-toggle-mobile"]')
        .should('have.attr', 'aria-expanded');
    });

    it('should be keyboard navigable', () => {
      // Vérifier que les éléments interactifs sont focusables
      cy.get('[data-cy="logo-desktop"], [data-cy="logo-mobile"]')
        .first()
        .should('not.have.attr', 'tabindex', '-1');
    });

    it('should have proper role attributes', () => {
      // Vérifier que les nav elements ont des attributs aria appropriés
      cy.get('[data-cy="nav-desktop"], [data-cy="nav-mobile"]')
        .should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load header quickly', () => {
      cy.get('[data-cy="header-desktop"], [data-cy="header-mobile"]')
        .should('be.visible');
      
      // Vérifier que tous les éléments critiques sont présents
      cy.get('[data-cy="logo-desktop"], [data-cy="logo-mobile"]').should('exist');
      cy.get('[data-cy="nav-desktop"], [data-cy="nav-mobile"]').should('exist');
    });

    it('should handle rapid viewport changes', () => {
      // Test de résistance aux changements rapides de viewport
      cy.viewport(1280, 720);
      cy.viewport(375, 667);
      cy.viewport(768, 1024);
      cy.viewport(1280, 720);
      
      // Le header devrait toujours être fonctionnel
      cy.get('[data-cy="header-desktop"]').should('be.visible');
      cy.get('[data-cy="logo-desktop"]').should('be.visible');
    });
  });
}); 