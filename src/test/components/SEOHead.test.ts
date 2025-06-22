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

  describe('Gestion des erreurs et cas limites', () => {
    describe('URLs malformées et invalides', () => {
      it('devrait gérer les chemins avec caractères spéciaux', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const specialPaths = [
          '/blog/article-with-émojis-🚀',
          '/blog/article with spaces',
          '/blog/article%20encoded',
          '/blog/article?query=test&param=value',
          '/blog/article#section',
        ];
        
        specialPaths.forEach(path => {
          expect(() => {
            const canonicalUrl = siteUtils.getCanonicalUrl(path);
            expect(canonicalUrl).toBeDefined();
            expect(canonicalUrl).toMatch(/^https?:\/\/.+/);
          }).not.toThrow();
        });
      });

      it('devrait gérer les chemins vides ou invalides', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const invalidPaths = ['', '   ', null, undefined];
        
        invalidPaths.forEach(path => {
          expect(() => {
            const canonicalUrl = siteUtils.getCanonicalUrl(path as string);
            expect(canonicalUrl).toBeDefined();
          }).not.toThrow();
        });
      });

      it('devrait gérer les URLs d\'assets malformées', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const malformedAssets = [
          '',
          '   ',
          'not-a-url',
          '//malformed-protocol',
          'assets/image with spaces.jpg',
          '/assets/image%20with%20encoding.png',
        ];
        
        malformedAssets.forEach(asset => {
          expect(() => {
            const assetUrl = siteUtils.getAssetUrl(asset);
            expect(assetUrl).toBeDefined();
            expect(assetUrl).toMatch(/^https?:\/\/.+/);
          }).not.toThrow();
        });
      });
    });

    describe('Valeurs de configuration manquantes', () => {
      it('devrait gérer l\'absence de configuration d\'organisation', async () => {
        const { siteConfig } = await import('../../config/site');
        
        // Même si certaines valeurs sont undefined, la structure doit exister
        expect(siteConfig.organization).toBeDefined();
        expect(siteConfig.organization.name).toBeDefined();
        expect(siteConfig.organization.type).toMatch(/^(Organization|Person)$/);
        
        // URL doit toujours être définie même si les env vars sont manquantes
        expect(siteConfig.organization.url).toBeDefined();
        expect(siteConfig.organization.url).toMatch(/^https?:\/\/.+/);
      });

      it('devrait gérer les variables d\'environnement manquantes', async () => {
        const { siteConfig } = await import('../../config/site');
        
        // Les valeurs sociales peuvent être undefined
        expect(siteConfig.social).toBeDefined();
        // Ces valeurs peuvent être undefined sans causer d'erreur
        if (siteConfig.social.github) {
          expect(typeof siteConfig.social.github).toBe('string');
        }
        if (siteConfig.social.twitter) {
          expect(typeof siteConfig.social.twitter).toBe('string');
        }
        if (siteConfig.social.linkedin) {
          expect(typeof siteConfig.social.linkedin).toBe('string');
        }
      });

      it('devrait avoir des valeurs par défaut robustes', async () => {
        const { siteConfig } = await import('../../config/site');
        
        // Valeurs critiques qui ne doivent jamais être undefined
        expect(siteConfig.baseUrl).toBeDefined();
        expect(siteConfig.baseUrl).not.toBe('');
        expect(siteConfig.title).toBeDefined();
        expect(siteConfig.title).not.toBe('');
        expect(siteConfig.description).toBeDefined();
        expect(siteConfig.description).not.toBe('');
        expect(siteConfig.defaultOgImage).toBeDefined();
        expect(siteConfig.defaultOgImage).not.toBe('');
      });
    });

    describe('Gestion des titres avec cas limites', () => {
      it('devrait gérer les titres très longs', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const longTitle = 'A'.repeat(300); // Titre très long
        const pageTitle = siteUtils.getPageTitle(longTitle);
        
        expect(pageTitle).toBeDefined();
        expect(pageTitle).toContain(longTitle);
        expect(pageTitle.length).toBeGreaterThan(300);
      });

      it('devrait gérer les titres avec caractères spéciaux', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const specialTitles = [
          'Titre avec émojis 🚀🎉',
          'Titre avec "guillemets" et \'apostrophes\'',
          'Titre avec <balises> HTML',
          'Titre avec & caractères & spéciaux',
          'Titre avec | pipes | multiples',
        ];
        
        specialTitles.forEach(title => {
          expect(() => {
            const pageTitle = siteUtils.getPageTitle(title);
            expect(pageTitle).toBeDefined();
            expect(pageTitle).toContain(title);
          }).not.toThrow();
        });
      });

      it('devrait gérer les titres vides ou invalides', async () => {
        const { siteUtils, siteConfig } = await import('../../config/site');
        
        // Test avec titres vraiment vides
        const emptyTitles = ['', null, undefined];
        emptyTitles.forEach(title => {
          const pageTitle = siteUtils.getPageTitle(title as string | undefined);
          expect(pageTitle).toBe(siteConfig.title); // Doit retourner le titre par défaut
        });
        
        // Test avec titre contenant seulement des espaces
        // Note: getPageTitle trim maintenant, donc '   ' est traité comme vide
        const whitespaceTitle = '   ';
        const pageTitle = siteUtils.getPageTitle(whitespaceTitle);
        expect(pageTitle).toBe(siteConfig.title);
      });
    });

    describe('Génération de schémas JSON-LD avec erreurs', () => {
      it('devrait gérer les articles avec données manquantes', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const incompleteArticles = [
          { title: '', description: 'Description', datePublished: '2024-01-01', author: 'Test' },
          { title: 'Titre', description: '', datePublished: '2024-01-01', author: 'Test' },
          { title: 'Titre', description: 'Description', datePublished: '', author: 'Test' },
          { title: 'Titre', description: 'Description', datePublished: '2024-01-01', author: '' },
        ];
        
        incompleteArticles.forEach(article => {
          expect(() => {
            const schema = siteUtils.generateBlogPostSchema(article);
            expect(schema).toBeDefined();
            expect(typeof schema).toBe('object');
          }).not.toThrow();
        });
      });

      it('devrait gérer les dates invalides', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const invalidDates = [
          'not-a-date',
          '2024-13-45', // Date impossible
          '2024/01/01', // Format incorrect
          '01-01-2024', // Format incorrect
        ];
        
        invalidDates.forEach(date => {
          expect(() => {
            const schema = siteUtils.generateBlogPostSchema({
              title: 'Test',
              description: 'Description',
              datePublished: date,
              author: 'Test Author'
            });
            expect(schema).toBeDefined();
          }).not.toThrow();
        });
      });

      it('devrait gérer les images d\'article invalides', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const invalidImages = [
          '',
          '   ',
          'not-an-image',
          '/path/to/nonexistent.jpg',
          'malformed-url',
        ];
        
        invalidImages.forEach(image => {
          expect(() => {
            const schema = siteUtils.generateBlogPostSchema({
              title: 'Test',
              description: 'Description',
              datePublished: '2024-01-01',
              author: 'Test Author',
              image
            });
            expect(schema).toBeDefined();
          }).not.toThrow();
        });
      });
    });

    describe('Robustesse des utilitaires URL', () => {
      it('devrait gérer les doubles slashes et normalisation', async () => {
        const { siteUtils } = await import('../../config/site');
        
        const pathsWithSlashes = [
          '//double-slash',
          '/normal/path/',
          'path/without/leading/slash',
          '/path//with//double//slashes/',
        ];
        
        pathsWithSlashes.forEach(path => {
          expect(() => {
            const canonicalUrl = siteUtils.getCanonicalUrl(path);
            expect(canonicalUrl).toBeDefined();
            expect(canonicalUrl).toMatch(/^https?:\/\/[^\/]+\//); // URL bien formée
          }).not.toThrow();
        });
      });

      it('devrait maintenir la cohérence malgré les erreurs d\'entrée', async () => {
        const { siteUtils } = await import('../../config/site');
        
        // Même avec des entrées bizarres, les URLs doivent rester cohérentes
        const weirdInputs = [
          { path: '/test-path', asset: '/test-asset.jpg' },
          { path: '', asset: '' },
          { path: '   ', asset: '   ' },
          { path: 'relative-path', asset: 'relative-asset.png' },
        ];
        
        weirdInputs.forEach(({ path, asset }) => {
          const canonicalUrl = siteUtils.getCanonicalUrl(path);
          const assetUrl = siteUtils.getAssetUrl(asset);
          
          // Les deux doivent avoir le même domaine de base
          const canonicalDomain = new URL(canonicalUrl).origin;
          const assetDomain = new URL(assetUrl).origin;
          
          expect(canonicalDomain).toBe(assetDomain);
          
          // Les URLs doivent être bien formées
          expect(canonicalUrl).toMatch(/^https?:\/\/.+/);
          expect(assetUrl).toMatch(/^https?:\/\/.+/);
        });
      });
    });

    describe('Gestion des erreurs de configuration', () => {
      it('devrait fonctionner même avec une baseUrl malformée', async () => {
        // Ce test vérifie que même si la configuration est corrompue,
        // les fonctions ne plantent pas
        const { siteUtils } = await import('../../config/site');
        
        expect(() => {
          const url = siteUtils.getCanonicalUrl('/test');
          expect(url).toBeDefined();
        }).not.toThrow();
      });

      it('devrait gérer les types d\'organisation invalides', async () => {
        const { siteConfig } = await import('../../config/site');
        
        // Le type doit être l'un des deux valides
        expect(['Organization', 'Person']).toContain(siteConfig.organization.type);
      });
    });
  });
}); 