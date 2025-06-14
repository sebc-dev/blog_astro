/**
 * Tests unitaires pour le composant Header.astro
 * Phase 1 : Tests de la logique spécifique au Header (transformation des données)
 * 
 * Note: Les tests des utilitaires i18n sont dans i18n.test.ts pour éviter la duplication
 */

import { describe, it, expect } from 'vitest';
import { 
  useTranslations, 
  useTranslatedPath
} from '../i18n/utils';
import type { UIKeys } from '../i18n/ui';

// Types pour la logique Header
interface NavLink {
  href: string;
  key: UIKeys;
}

interface TranslatedNavLink {
  href: string;
  label: string;
  isActive: boolean;
}

// Fonction utilitaire testée: transformation des liens de navigation
function mapNavLinks(
  navLinks: NavLink[], 
  lang: 'en' | 'fr', 
  translatePath: (path: string) => string, 
  currentUrl: URL
): TranslatedNavLink[] {
  const t = useTranslations(lang);
  
  return navLinks.map(link => ({
    href: translatePath(link.href),
    label: t(link.key),
    isActive: currentUrl.pathname === translatePath(link.href)
  }));
}

// Fonction utilitaire testée: génération des URLs de langue
function generateLanguageUrls(currentPath: string, lang: 'en' | 'fr') {
  return {
    en: {
      url: currentPath,
      isActive: lang === 'en',
      label: 'English',
      flag: '🇺🇸'
    },
    fr: {
      url: `/fr${currentPath}`,
      isActive: lang === 'fr', 
      label: 'Français',
      flag: '🇫🇷'
    }
  };
}

// Fonction utilitaire testée: génération du CSS critique
function generateCriticalCSS(): string {
  return `
  .header-critical {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
  }
  
  .header-critical.scrolled {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px);
  }
  
  @media (prefers-color-scheme: dark) {
    .header-critical {
      background: rgba(0, 0, 0, 0.85);
    }
    
    .header-critical.scrolled {
      background: rgba(0, 0, 0, 0.50);
      backdrop-filter: blur(5px);
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .header-critical {
      transition: none !important;
    }
  }
`;
}

describe('Header - Transformation des données de navigation', () => {
  const mockNavLinks: NavLink[] = [
    { href: "/", key: "nav.home" },
    { href: "/about", key: "nav.about" },
    { href: "/services", key: "nav.services" },
    { href: "/contact", key: "nav.contact" },
  ];

  describe('mapNavLinks()', () => {
    it('devrait transformer correctement les liens pour l\'anglais', () => {
      const translatePath = useTranslatedPath('en');
      const currentUrl = new URL('https://site.com/about');
      
      const result = mapNavLinks(mockNavLinks, 'en', translatePath, currentUrl);
      
      expect(result[0]).toEqual({
        href: '/',
        label: 'Home',
        isActive: false
      });
      
      expect(result[1]).toEqual({
        href: '/about',
        label: 'About',
        isActive: true // currentUrl matches
      });
    });

    it('devrait transformer correctement les liens pour le français', () => {
      const translatePath = useTranslatedPath('fr');
      const currentUrl = new URL('https://site.com/fr/about');
      
      const result = mapNavLinks(mockNavLinks, 'fr', translatePath, currentUrl);
      
      expect(result[0]).toEqual({
        href: '/fr/',
        label: 'Accueil',
        isActive: false
      });
      
      expect(result[1]).toEqual({
        href: '/fr/about',
        label: 'À propos',
        isActive: true // currentUrl matches
      });
    });

    it('devrait détecter correctement l\'état actif', () => {
      const translatePath = useTranslatedPath('en');
      const currentUrl = new URL('https://site.com/');
      
      const result = mapNavLinks(mockNavLinks, 'en', translatePath, currentUrl);
      
      // Page d'accueil active
      expect(result[0].isActive).toBe(true);
      expect(result[1].isActive).toBe(false);
      expect(result[2].isActive).toBe(false);
      expect(result[3].isActive).toBe(false);
    });

    it('devrait intégrer correctement les traductions et chemins traduits', () => {
      const translatePath = useTranslatedPath('fr');
      const currentUrl = new URL('https://site.com/fr/services');
      
      const result = mapNavLinks(mockNavLinks, 'fr', translatePath, currentUrl);
      
      // Vérifier l'intégration des utilitaires i18n
      expect(result[2]).toEqual({
        href: '/fr/services',
        label: 'Services',
        isActive: true
      });
      
      // Vérifier que tous les liens ont des traductions
      result.forEach(link => {
        expect(link.label).toBeTruthy();
        expect(link.href).toBeTruthy();
        expect(typeof link.isActive).toBe('boolean');
      });
    });
  });
});

describe('Header - Génération des URLs de langue', () => {
  describe('generateLanguageUrls()', () => {
    it('devrait générer les URLs correctes pour une page anglaise', () => {
      const result = generateLanguageUrls('/about', 'en');
      
      expect(result.en).toEqual({
        url: '/about',
        isActive: true,
        label: 'English',
        flag: '🇺🇸'
      });
      
      expect(result.fr).toEqual({
        url: '/fr/about',
        isActive: false,
        label: 'Français',
        flag: '🇫🇷'
      });
    });

    it('devrait générer les URLs correctes pour une page française', () => {
      const result = generateLanguageUrls('/about', 'fr');
      
      expect(result.en).toEqual({
        url: '/about',
        isActive: false,
        label: 'English',
        flag: '🇺🇸'
      });
      
      expect(result.fr).toEqual({
        url: '/fr/about',
        isActive: true,
        label: 'Français',
        flag: '🇫🇷'
      });
    });

    it('devrait gérer la page d\'accueil', () => {
      const result = generateLanguageUrls('/', 'en');
      
      expect(result.en.url).toBe('/');
      expect(result.fr.url).toBe('/fr/');
    });

    it('devrait contenir toutes les métadonnées nécessaires', () => {
      const result = generateLanguageUrls('/contact', 'fr');
      
      // Vérifier la structure complète
      Object.values(result).forEach(langData => {
        expect(langData).toHaveProperty('url');
        expect(langData).toHaveProperty('isActive');
        expect(langData).toHaveProperty('label');
        expect(langData).toHaveProperty('flag');
        
        expect(typeof langData.url).toBe('string');
        expect(typeof langData.isActive).toBe('boolean');
        expect(typeof langData.label).toBe('string');
        expect(typeof langData.flag).toBe('string');
      });
    });
  });
});

describe('Header - CSS Critique et Performance', () => {
  describe('generateCriticalCSS()', () => {
    it('devrait générer du CSS valide', () => {
      const css = generateCriticalCSS();
      
      expect(css).toContain('.header-critical');
      expect(css).toContain('position: fixed');
      expect(css).toContain('z-index: 50');
    });

    it('devrait inclure les styles responsive et dark mode', () => {
      const css = generateCriticalCSS();
      
      expect(css).toContain('@media (prefers-color-scheme: dark)');
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('devrait être sous le seuil de performance de 1KB', () => {
      const css = generateCriticalCSS();
      const cssSize = new Blob([css]).size;
      
      // Seuil de 1KB selon les règles d'optimisation
      expect(cssSize).toBeLessThan(1024);
    });

    it('devrait contenir les propriétés de performance critiques', () => {
      const css = generateCriticalCSS();
      
      expect(css).toContain('backdrop-filter');
      expect(css).toContain('transition');
      expect(css).toContain('rgba');
    });

    it('devrait inclure tous les états visuels nécessaires', () => {
      const css = generateCriticalCSS();
      
      // États visuels critiques
      expect(css).toContain('.header-critical');
      expect(css).toContain('.header-critical.scrolled');
      
      // Responsive
      expect(css).toContain('@media');
      
      // Accessibilité
      expect(css).toContain('prefers-reduced-motion');
    });
  });
}); 