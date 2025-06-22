import { describe, it, expect } from 'vitest';
import { siteConfig, siteUtils, envConfig } from '../../config/site';

describe('Configuration du Site', () => {
  describe('siteConfig', () => {
    it('devrait avoir une URL de base valide', () => {
      expect(siteConfig.baseUrl).toBeDefined();
      expect(siteConfig.baseUrl).toMatch(/^https?:\/\/.+/);
      expect(siteConfig.baseUrl).not.toMatch(/\/$/); // Pas de slash final
    });

    it('devrait avoir les métadonnées de base correctes', () => {
      expect(siteConfig.title).toBe('sebc.dev');
      expect(siteConfig.description).toContain('Blog de développement web moderne');
      expect(siteConfig.defaultOgImage).toBe('/assets/og-default.jpg');
      expect(siteConfig.author).toBe('Sebastien');
    });

    it('devrait avoir une structure social définie', () => {
      expect(siteConfig.social).toBeDefined();
      expect(siteConfig.social).toHaveProperty('github');
      expect(siteConfig.social).toHaveProperty('twitter');
      expect(siteConfig.social).toHaveProperty('linkedin');
    });
  });

  describe('siteUtils', () => {
    describe('getCanonicalUrl', () => {
      it('devrait construire une URL canonique correcte', () => {
        const pathname = '/blog/article';
        const result = siteUtils.getCanonicalUrl(pathname);
        
        expect(result).toBe(`${siteConfig.baseUrl}/blog/article`);
      });

      it('devrait gérer les chemins avec slash initial', () => {
        const result = siteUtils.getCanonicalUrl('/about');
        
        expect(result).toBe(`${siteConfig.baseUrl}/about`);
      });

      it('devrait gérer les chemins sans slash initial', () => {
        const result = siteUtils.getCanonicalUrl('contact');
        
        expect(result).toBe(`${siteConfig.baseUrl}/contact`);
      });

      it('devrait gérer la racine', () => {
        const result = siteUtils.getCanonicalUrl('/');
        
        expect(result).toBe(`${siteConfig.baseUrl}/`);
      });
    });

    describe('getAssetUrl', () => {
      it('devrait construire une URL d\'asset correcte', () => {
        const assetPath = '/assets/image.jpg';
        const result = siteUtils.getAssetUrl(assetPath);
        
        expect(result).toBe(`${siteConfig.baseUrl}/assets/image.jpg`);
      });

      it('devrait gérer les assets relatifs', () => {
        const result = siteUtils.getAssetUrl('favicon.ico');
        
        expect(result).toBe(`${siteConfig.baseUrl}/favicon.ico`);
      });
    });

    describe('getPageTitle', () => {
      it('devrait retourner le titre du site seul si aucun titre de page', () => {
        const result = siteUtils.getPageTitle();
        
        expect(result).toBe(siteConfig.title);
      });

      it('devrait retourner le titre du site seul pour un titre vide', () => {
        const result = siteUtils.getPageTitle('');
        
        expect(result).toBe(siteConfig.title);
      });

      it('devrait combiner le titre de page avec le titre du site', () => {
        const pageTitle = 'Mon Article';
        const result = siteUtils.getPageTitle(pageTitle);
        
        expect(result).toBe(`${pageTitle} | ${siteConfig.title}`);
      });

      it('devrait gérer les titres avec caractères spéciaux', () => {
        const pageTitle = 'Guide TypeScript & React';
        const result = siteUtils.getPageTitle(pageTitle);
        
        expect(result).toBe(`${pageTitle} | ${siteConfig.title}`);
      });

      it('devrait traiter null comme un titre manquant', () => {
        const result = siteUtils.getPageTitle(undefined);
        
        expect(result).toBe(siteConfig.title);
      });

      it('devrait traiter les chaînes avec seulement des espaces comme vides', () => {
        const result = siteUtils.getPageTitle('   ');
        
        expect(result).toBe(siteConfig.title);
      });

      it('devrait traiter les chaînes avec tabs et espaces comme vides', () => {
        const result = siteUtils.getPageTitle(' \t \n ');
        
        expect(result).toBe(siteConfig.title);
      });

      it('devrait traiter une chaîne vide avec espaces en début/fin comme vide', () => {
        const result = siteUtils.getPageTitle('  \t  ');
        
        expect(result).toBe(siteConfig.title);
      });
    });

    describe('generateBlogPostSchema', () => {
      it('devrait générer un schéma JSON-LD valide pour un article', () => {
        const article = {
          title: 'Guide Astro Complet',
          description: 'Un guide complet pour maîtriser Astro',
          image: '/assets/astro-guide.jpg',
          datePublished: '2024-01-15T10:00:00.000Z',
          author: 'Sebastien',
        };

        const schema = siteUtils.generateBlogPostSchema(article);

        expect(schema).toEqual({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": article.title,
          "description": article.description,
          "image": siteUtils.getAssetUrl(article.image),
          "datePublished": article.datePublished,
          "author": {
            "@type": "Person",
            "name": article.author
          },
          "publisher": {
            "@type": siteConfig.organization.type,
            "name": siteConfig.organization.name,
            "url": siteConfig.organization.url
          }
        });
      });

      it('devrait gérer un article sans image', () => {
        const article = {
          title: 'Article Sans Image',
          description: 'Description de l\'article',
          datePublished: '2024-01-15T10:00:00.000Z',
          author: 'Sebastien',
        };

        const schema = siteUtils.generateBlogPostSchema(article);

        expect(schema).toHaveProperty('@context', 'https://schema.org');
        expect(schema).toHaveProperty('@type', 'BlogPosting');
        expect(schema).toHaveProperty('headline', article.title);
        expect(schema).toHaveProperty('image', undefined);
        expect(schema).toHaveProperty('publisher.name', siteConfig.organization.name);
      });

      it('devrait utiliser la configuration d\'organisation dynamique', () => {
        const article = {
          title: 'Test Organisation',
          description: 'Test',
          datePublished: '2024-01-15T10:00:00.000Z',
          author: 'Test Author',
        };

        const schema = siteUtils.generateBlogPostSchema(article) as {
          publisher: {
            "@type": string;
            name: string;
            url: string;
          };
        };

        expect(schema.publisher).toEqual({
          "@type": siteConfig.organization.type,
          "name": siteConfig.organization.name,
          "url": siteConfig.organization.url
        });
      });
    });
  });

  describe('envConfig', () => {
    it('devrait avoir les propriétés d\'environnement définies', () => {
      expect(typeof envConfig.isDev).toBe('boolean');
      expect(typeof envConfig.isProd).toBe('boolean');
      expect(typeof envConfig.isPreview).toBe('boolean');
      expect(typeof envConfig.isDebug).toBe('boolean');
    });

    it('devrait avoir une logique cohérente pour isDebug', () => {
      // isDebug devrait être true si isDev ou isPreview
      const expectedDebug = envConfig.isDev || envConfig.isPreview;
      expect(envConfig.isDebug).toBe(expectedDebug);
    });
  });

  describe('Intégration complète', () => {
    it('devrait fonctionner ensemble pour une page complète', () => {
      const pageTitle = 'Guide Astro';
      const pathname = '/blog/guide-astro';
      const ogImage = '/assets/guide-astro.jpg';
      
      const finalTitle = siteUtils.getPageTitle(pageTitle);
      const canonicalUrl = siteUtils.getCanonicalUrl(pathname);
      const ogImageUrl = siteUtils.getAssetUrl(ogImage);
      
      expect(finalTitle).toBe(`${pageTitle} | ${siteConfig.title}`);
      expect(canonicalUrl).toBe(`${siteConfig.baseUrl}${pathname}`);
      expect(ogImageUrl).toBe(`${siteConfig.baseUrl}${ogImage}`);
    });

    it('devrait maintenir la cohérence entre les URLs', () => {
      const pathname = '/test';
      
      const canonical = siteUtils.getCanonicalUrl(pathname);
      const asset = siteUtils.getAssetUrl(pathname);
      
      // Les deux devraient utiliser la même base URL
      expect(canonical).toContain(siteConfig.baseUrl);
      expect(asset).toContain(siteConfig.baseUrl);
      expect(canonical).toBe(asset); // Dans ce cas ils sont identiques
    });
  });
}); 