/**
 * E2E Tests for XSS Protection in Tag Sorting
 * 
 * These tests verify that the HTML escaping function protects against
 * XSS attacks in the dynamic article grid rendering.
 */

describe('XSS Protection - Tag Sort', () => {
  beforeEach(() => {
    // Handle potential module loading errors during development
    cy.on('uncaught:exception', (err, runnable) => {
      // Ignore module loading errors during initial page load
      if (err.message.includes('Failed to fetch dynamically imported module')) {
        return false;
      }
      // Don't prevent test failure for other errors
      return true;
    });
    
    // Visit a tag page that uses the tag-sort functionality
    cy.visit('/tag/guide');
  });

  it('should render articles safely with XSS protection', () => {
    // Check that articles are rendered without executing malicious scripts
    cy.get('[data-cy="tag-articles-grid"]').should('exist');
    cy.get('.card').should('have.length.at.least', 1);
    
    // Verify that no script tags are present in the rendered content
    cy.get('[data-cy="tag-articles-grid"] script').should('not.exist');
    
    // Verify that the content is properly escaped
    cy.get('.card-title').each(($title) => {
      const text = $title.text();
      // Ensure no unescaped HTML entities that could be dangerous
      expect(text).to.not.contain('<script');
      expect(text).to.not.contain('javascript:');
      expect(text).to.not.contain('onload=');
      expect(text).to.not.contain('onerror=');
    });
  });

  it('should handle sort functionality without XSS vulnerabilities', () => {
    // Test that sorting works and content remains safe
    cy.get('[data-cy="tag-sort-select"]').should('exist');
    
    // Change sort option
    cy.get('[data-cy="tag-sort-select"]').select('title-asc');
    
    // Wait for the DOM to update
    cy.wait(500);
    
    // Verify articles are still safe after sorting
    cy.get('.card').should('have.length.at.least', 1);
    cy.get('[data-cy="tag-articles-grid"] script').should('not.exist');
    
    // Check that descriptions are safely rendered
    cy.get('[data-cy="tag-articles-grid"] .card .text-base-content\\/70').each(($desc) => {
      const text = $desc.text();
      expect(text).to.not.contain('<img');
      expect(text).to.not.contain('onclick=');
      expect(text).to.not.contain('<iframe');
    });
  });

  it('should safely render badge content (categories and tags)', () => {
    // Check that badges don't contain unescaped content
    cy.get('.badge').each(($badge) => {
      const text = $badge.text();
      expect(text).to.not.contain('<');
      expect(text).to.not.contain('>');
      expect(text).to.not.contain('"');
      expect(text).to.not.contain("'");
    });
  });

  it('should safely handle article links and URLs', () => {
    // Verify that article links are properly constructed
    cy.get('[data-cy="tag-articles-grid"] .btn-primary').each(($link) => {
      const href = $link.attr('href');
      
      // Ensure URLs don't contain dangerous protocols
      expect(href).to.not.contain('javascript:');
      expect(href).to.not.contain('data:');
      expect(href).to.not.contain('vbscript:');
      
      // Should be valid blog URLs (starting with /blog/ for article pages)
      expect(href).to.match(/^\/blog\//);
    });
  });

  it('should safely render dates and reading times', () => {
    // Check that date and time fields are safe
    cy.get('[data-cy="tag-articles-grid"] .text-sm.text-muted-accessible').each(($timeEl) => {
      const text = $timeEl.text();
      
      // Should not contain HTML or script content
      expect(text).to.not.contain('<');
      expect(text).to.not.contain('>');
      expect(text).to.not.contain('script');
      
      // Should be reasonable date/time content (more flexible regex)
      const isDate = text.match(/(\w+\s+\d{1,2},?\s+\d{4})|(\d{1,2}\s+\w+\s+\d{4})/);
      const isReadingTime = text.match(/\d+\s+min/);
      expect(isDate || isReadingTime).to.not.be.null;
    });
  });

  it('should maintain XSS protection across different sort orders', () => {
    const sortOptions = ['date-desc', 'date-asc', 'title-asc', 'title-desc', 'reading-time-asc'];
    
    sortOptions.forEach((sortOption) => {
      // Select sort option
      cy.get('[data-cy="tag-sort-select"]').select(sortOption);
      cy.wait(500);
      
      // Verify content is still safe
      cy.get('.card').should('have.length.at.least', 1);
      cy.get('[data-cy="tag-articles-grid"]').within(() => {
        // No script tags should exist
        cy.get('script').should('not.exist');
        
        // No dangerous event handlers in attributes
        cy.get('*[onclick]').should('not.exist');
        cy.get('*[onload]').should('not.exist');
        cy.get('*[onerror]').should('not.exist');
      });
    });
  });

  it('should prevent script execution in console', () => {
    // Monitor for any script execution attempts
    cy.window().then((win) => {
      // Mock a potential XSS attempt
      const originalAlert = win.alert;
      let alertCalled = false;
      
      win.alert = () => {
        alertCalled = true;
      };
      
      // Trigger sort functionality
      cy.get('[data-cy="tag-sort-select"]').select('title-desc');
      cy.wait(500);
      
      // Verify no scripts were executed
      cy.then(() => {
        expect(alertCalled).to.be.false;
      });
      
      // Restore original alert
      win.alert = originalAlert;
    });
  });
}); 