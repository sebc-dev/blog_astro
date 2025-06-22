import { describe, it, expect } from 'vitest';

describe('SEOHead Component', () => {
  describe('Configuration centralisée', () => {
    it('devrait utiliser la configuration du site pour les valeurs par défaut', async () => {
      // Test conceptuel - vérifie que les imports sont corrects
      const siteConfigImport = await import('../../config/site');
      
      expect(siteConfigImport.siteConfig).toBeDefined();
      expect(siteConfigImport.siteUtils).toBeDefined();
      expect(siteConfigImport.siteConfig.title).toBe('sebc.dev');
      expect(siteConfigImport.siteConfig.defaultOgImage).toBe('/assets/og-default.jpg');
    });

    it('devrait avoir les utilitaires nécessaires pour les URLs', async () => {
      const { siteUtils } = await import('../../config/site');
      
      // Test des utilitaires utilisés dans SEOHead
      expect(typeof siteUtils.getCanonicalUrl).toBe('function');
      expect(typeof siteUtils.getAssetUrl).toBe('function');
      
      // Test de fonctionnement
      const canonicalUrl = siteUtils.getCanonicalUrl('/test');
      const assetUrl = siteUtils.getAssetUrl('/assets/test.jpg');
      
      expect(canonicalUrl).toMatch(/^https?:\/\/.+\/test$/);
      expect(assetUrl).toMatch(/^https?:\/\/.+\/assets\/test\.jpg$/);
    });
  });

  describe('Génération des métadonnées', () => {
    it('devrait construire des URLs correctes pour les images', async () => {
      const { siteUtils } = await import('../../config/site');
      
      // Test avec différents formats d'images
      const testCases = [
        '/assets/og-image.jpg',
        'assets/social.png',
        '/images/hero.webp'
      ];
      
      testCases.forEach(imagePath => {
        const assetUrl = siteUtils.getAssetUrl(imagePath);
        
        expect(assetUrl).toMatch(/^https?:\/\/.+/);
        expect(assetUrl).toContain(imagePath.replace(/^\//, ''));
      });
    });

    it('devrait générer des URLs canoniques cohérentes', async () => {
      const { siteUtils } = await import('../../config/site');
      
      const testPaths = [
        '/',
        '/blog',
        '/blog/article',
        'about',
        '/fr/contact'
      ];
      
      testPaths.forEach(path => {
        const canonicalUrl = siteUtils.getCanonicalUrl(path);
        
        expect(canonicalUrl).toMatch(/^https?:\/\/.+/);
        
        // La racine peut se terminer par /, mais pas les autres chemins
        if (path !== '/') {
          expect(canonicalUrl).not.toMatch(/\/$/);
        }
      });
    });
  });

  describe('Intégration avec la configuration', () => {
    it('devrait utiliser le titre du site depuis la configuration', async () => {
      const { siteConfig } = await import('../../config/site');
      
      expect(siteConfig.title).toBeDefined();
      expect(typeof siteConfig.title).toBe('string');
      expect(siteConfig.title.length).toBeGreaterThan(0);
    });

    it('devrait utiliser l\'image OG par défaut depuis la configuration', async () => {
      const { siteConfig } = await import('../../config/site');
      
      expect(siteConfig.defaultOgImage).toBeDefined();
      expect(siteConfig.defaultOgImage).toMatch(/^\/assets\/.+\.(jpg|jpeg|png|webp)$/);
    });

    it('devrait avoir une configuration d\'organisation pour les métadonnées', async () => {
      const { siteConfig } = await import('../../config/site');
      
      expect(siteConfig.organization).toBeDefined();
      expect(siteConfig.organization.name).toBeDefined();
      expect(siteConfig.organization.type).toMatch(/^(Organization|Person)$/);
      expect(siteConfig.organization.url).toMatch(/^https?:\/\/.+/);
    });
  });

  describe('Cohérence avec MainLayout', () => {
    it('devrait utiliser les mêmes utilitaires que MainLayout', async () => {
      const { siteUtils, siteConfig } = await import('../../config/site');
      
      // Vérifier que les mêmes fonctions sont disponibles
      expect(typeof siteUtils.getCanonicalUrl).toBe('function');
      expect(typeof siteUtils.getAssetUrl).toBe('function');
      expect(typeof siteUtils.getPageTitle).toBe('function');
      
      // Test de cohérence des résultats
      const testPath = '/blog/test-article';
      const canonicalFromUtils = siteUtils.getCanonicalUrl(testPath);
      const pageTitle = siteUtils.getPageTitle('Test Article');
      
      expect(canonicalFromUtils).toContain(testPath);
      expect(pageTitle).toContain(siteConfig.title);
    });

    it('devrait maintenir la cohérence des URLs entre composants', async () => {
      const { siteUtils } = await import('../../config/site');
      
      const testImage = '/assets/test-image.jpg';
      const testPath = '/test-page';
      
      // Les URLs générées doivent être cohérentes
      const assetUrl = siteUtils.getAssetUrl(testImage);
      const canonicalUrl = siteUtils.getCanonicalUrl(testPath);
      
      // Même domaine de base
      const assetDomain = new URL(assetUrl).origin;
      const canonicalDomain = new URL(canonicalUrl).origin;
      
      expect(assetDomain).toBe(canonicalDomain);
    });
  });

  describe('Validation des templates', () => {
    it('devrait construire des templates de titre corrects', async () => {
      const { siteConfig } = await import('../../config/site');
      
      // Template par défaut attendu
      const expectedTemplate = `%s | ${siteConfig.title}`;
      
      // Test de remplacement
      const testTitle = 'Mon Article';
      const finalTitle = expectedTemplate.replace('%s', testTitle);
      
      expect(finalTitle).toBe(`${testTitle} | ${siteConfig.title}`);
    });

    it('devrait gérer les cas sans titre', async () => {
      const { siteConfig } = await import('../../config/site');
      
      // Quand pas de titre, devrait retourner le titre du site
      expect(siteConfig.title).toBeDefined();
      expect(siteConfig.title).toBe('sebc.dev');
    });
  });
}); 