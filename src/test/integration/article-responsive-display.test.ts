import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Article Responsive Display Tests', () => {
  const latestArticlesSectionPath = join(process.cwd(), 'src/components/LatestArticlesSection.astro');
  const componentContent = readFileSync(latestArticlesSectionPath, 'utf-8');

  describe('Desktop vs Mobile Layout Logic', () => {
    it('devrait avoir la logique de séparation des articles pour desktop et mobile', () => {
      // Vérifier que les variables pour desktop et mobile existent
      expect(componentContent).toContain('gridPostsDesktop');
      expect(componentContent).toContain('gridPostsMobile');
      expect(componentContent).toContain('heroPosts');
    });

    it('devrait définir correctement les articles pour mobile (tous)', () => {
      expect(componentContent).toContain('const gridPostsMobile = limitedPosts');
    });

    it('devrait définir correctement les articles pour desktop (sans le premier)', () => {
      expect(componentContent).toContain('const gridPostsDesktop = showHero && limitedPosts.length > 1');
      expect(componentContent).toContain('limitedPosts.slice(1)');
    });
  });

  describe('Classes CSS Responsive', () => {
    it('devrait masquer ArticleHero sur mobile avec la classe hidden lg:block', () => {
      expect(componentContent).toContain('class="hero-section hidden lg:block"');
    });

    it('devrait masquer la grille desktop sur mobile avec hidden lg:block', () => {
      expect(componentContent).toContain('class="grid-section hidden lg:block pt-16"');
    });

    it('devrait afficher la grille mobile uniquement sur mobile avec lg:hidden', () => {
      expect(componentContent).toContain('class="grid-section lg:hidden"');
    });

    it('devrait utiliser une grille adaptée pour mobile (1 colonne, puis 2)', () => {
      expect(componentContent).toContain('grid-cols-1 sm:grid-cols-2');
    });
  });

  describe('Mappage des Données', () => {
    it('devrait utiliser gridPostsDesktop pour la grille desktop', () => {
      const desktopGridMatch = componentContent.match(/grid-section hidden lg:block[\s\S]*?gridPostsDesktop\.map/);
      expect(desktopGridMatch).toBeTruthy();
    });

    it('devrait utiliser gridPostsMobile pour la grille mobile', () => {
      const mobileGridMatch = componentContent.match(/grid-section lg:hidden[\s\S]*?gridPostsMobile\.map/);
      expect(mobileGridMatch).toBeTruthy();
    });

    it('devrait utiliser heroPosts pour le composant Hero desktop', () => {
      const heroMatch = componentContent.match(/hero-section hidden lg:block[\s\S]*?heroPosts\.map/);
      expect(heroMatch).toBeTruthy();
    });
  });

  describe('Cohérence des Props entre Hero et Card', () => {
    it('devrait passer les mêmes props à ArticleHero et ArticleCard', () => {
      const propsPattern = /title={post\.data\.title}[\s\S]*?description={post\.data\.description}[\s\S]*?heroImage={post\.data\.heroImage}[\s\S]*?pubDate={post\.data\.pubDate}[\s\S]*?author={post\.data\.author}/;
      
      // Vérifier que les props sont cohérentes dans les 3 endroits
      const matches = componentContent.match(new RegExp(propsPattern.source, 'g'));
      expect(matches).toHaveLength(3); // Hero + Desktop Grid + Mobile Grid
    });
  });

  describe('Structure Responsive Complète', () => {
    it('devrait avoir une architecture complète desktop/mobile', () => {
      const sections = [
        '<!-- Article Héro (desktop uniquement) -->',
        '<!-- Grille d\'articles Desktop (sans le premier article qui est en hero) -->',
        '<!-- Grille d\'articles Mobile (tous les articles, y compris le premier) -->'
      ];

      sections.forEach(section => {
        expect(componentContent).toContain(section);
      });
    });

    it('devrait conserver les fonctionnalités existantes', () => {
      const features = [
        'showHero',
        'maxArticles',
        'getPostCategory',
        'getPostTag',
        'estimateReadingTime',
        'translatePath'
      ];

      features.forEach(feature => {
        expect(componentContent).toContain(feature);
      });
    });
  });
}); 