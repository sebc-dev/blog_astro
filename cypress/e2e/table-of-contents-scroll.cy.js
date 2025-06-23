describe('Table des Matières - Scroll avec Offset', () => {
  beforeEach(() => {
    // Visiter un article qui a une table des matières
    cy.visit('/blog/fr/guide-astro');
    
    // Attendre que la page se charge complètement
    cy.wait(1000);
  });

  it('devrait afficher la table des matières sur desktop', () => {
    // Vérifier que la table des matières est présente
    cy.get('.table-of-contents')
      .should('be.visible')
      .should('contain', 'Table des matières');
    
    // Vérifier qu'elle contient des liens
    cy.get('.table-of-contents .toc-link')
      .should('have.length.greaterThan', 0);
  });

  it('devrait scroller avec un offset correct quand on clique sur un lien TOC', () => {
    // Récupérer le premier lien de la table des matières
    cy.get('.table-of-contents .toc-link').first().then(($link) => {
      const href = $link.attr('href');
      const targetId = href.replace('#', '');
      
      // Scroller en bas de la page d'abord
      cy.scrollTo('bottom');
      cy.wait(500);
      
      // Cliquer sur le lien de la table des matières
      cy.get('.table-of-contents .toc-link').first().click();
      cy.wait(1000);
      
      // Vérifier que l'élément cible existe
      cy.get(`#${targetId}`).should('exist');
      
      // Vérifier que l'élément cible est visible dans le viewport
      cy.get(`#${targetId}`).should('be.visible');
      
      // Vérifier que l'élément n'est pas masqué par le header
      // En mesurant la distance depuis le haut du viewport
      cy.get(`#${targetId}`).then(($target) => {
        const rect = $target[0].getBoundingClientRect();
        
        // L'élément devrait être au moins à 96px du haut (6rem = 96px)
        // pour éviter d'être masqué par le header
        expect(rect.top).to.be.greaterThan(80);
        expect(rect.top).to.be.lessThan(150); // Pas trop loin non plus
      });
    });
  });

  it('devrait avoir un comportement de scroll fluide', () => {
    // Vérifier que le CSS scroll-behavior est appliqué
    cy.get('html').should('have.css', 'scroll-behavior', 'smooth');
    
    // Vérifier le scroll-padding-top
    cy.get('html').invoke('css', 'scroll-padding-top').should('contain', '96px'); // 6rem = 96px
  });

  it('devrait masquer la table des matières sur mobile', () => {
    // Simuler un viewport mobile
    cy.viewport(375, 667);
    
    // Vérifier que la table des matières est masquée sur mobile
    cy.get('.table-of-contents')
      .should('not.be.visible');
  });

  it('devrait avoir des liens accessibles avec focus visible', () => {
    // Tester la navigation au clavier
    cy.get('.table-of-contents .toc-link').first()
      .focus()
      .should('have.focus')
      .should('have.css', 'outline-style', 'solid'); // Focus visible
  });

  it('devrait supporter la navigation entre plusieurs niveaux de headings', () => {
    // Vérifier qu'il y a des sous-sections si elles existent
    cy.get('.table-of-contents').then(($toc) => {
      if ($toc.find('.toc-sublist').length > 0) {
        // Si il y a des sous-listes, tester la navigation
        cy.get('.table-of-contents .toc-sublink').first().then(($sublink) => {
          const href = $sublink.attr('href');
          const targetId = href.replace('#', '');
          
          // Scroller vers le bas d'abord
          cy.scrollTo('bottom');
          cy.wait(500);
          
          // Cliquer sur le lien de sous-section
          cy.get('.table-of-contents .toc-sublink').first().click();
          cy.wait(1000);
          
          // Vérifier que le target existe et est visible
          cy.get(`#${targetId}`)
            .should('exist')
            .should('be.visible');
        });
      }
    });
  });
}); 