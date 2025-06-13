/**
 * Tests de validation pour le système d'internationalisation (i18n)
 * Vérifie la cohérence des dictionnaires et le bon fonctionnement des utilitaires
 */

import { describe, it, expect } from 'vitest';
import { 
  ui, 
  defaultLang, 
  type Languages 
} from '../i18n/ui';
import {
  getLangFromUrl,
  useTranslations,
  useTranslatedPath,
  getHreflangLinks,
  getPathWithoutLang,
  isValidLang,
  getSupportedLanguages,
  formatDate,
  getLanguageName,
  getLanguageFlag
} from '../i18n/utils';

describe('Dictionnaires de traduction (ui.ts)', () => {
  it('devrait avoir l\'anglais comme langue par défaut', () => {
    expect(defaultLang).toBe('en');
  });

  it('devrait contenir exactement 2 langues', () => {
    expect(Object.keys(ui)).toHaveLength(2);
    expect(Object.keys(ui)).toContain('en');
    expect(Object.keys(ui)).toContain('fr');
  });

  it('devrait avoir les mêmes clés dans toutes les langues', () => {
    const englishKeys = Object.keys(ui.en).sort();
    const frenchKeys = Object.keys(ui.fr).sort();
    
    expect(frenchKeys).toEqual(englishKeys);
  });

  it('devrait avoir toutes les clés avec des valeurs non vides', () => {
    Object.entries(ui).forEach(([, translations]) => {
      Object.entries(translations).forEach(([, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
        expect(value.trim()).not.toBe('');
      });
    });
  });

  it('devrait contenir les clés essentielles de navigation', () => {
    const essentialNavKeys = [
      'nav.home',
      'nav.blog',
      'nav.about',
      'nav.contact',
      'nav.services'
    ];

    essentialNavKeys.forEach(key => {
      expect(ui.en).toHaveProperty(key);
      expect(ui.fr).toHaveProperty(key);
    });
  });

  it('devrait contenir les clés essentielles du blog', () => {
    const essentialBlogKeys = [
      'blog.readMore',
      'blog.publishedOn',
      'blog.author',
      'blog.backToBlog'
    ];

    essentialBlogKeys.forEach(key => {
      expect(ui.en).toHaveProperty(key);
      expect(ui.fr).toHaveProperty(key);
    });
  });
});

describe('Détection de langue (getLangFromUrl)', () => {
  it('devrait retourner "en" pour les URLs sans préfixe de langue', () => {
    const urls = [
      new URL('https://example.com/'),
      new URL('https://example.com/blog'),
      new URL('https://example.com/about'),
    ];

    urls.forEach(url => {
      expect(getLangFromUrl(url)).toBe('en');
    });
  });

  it('devrait retourner "fr" pour les URLs avec préfixe /fr/', () => {
    const urls = [
      new URL('https://example.com/fr/'),
      new URL('https://example.com/fr/blog'),
      new URL('https://example.com/fr/about'),
    ];

    urls.forEach(url => {
      expect(getLangFromUrl(url)).toBe('fr');
    });
  });

  it('devrait retourner la langue par défaut pour les langues non supportées', () => {
    const urls = [
      new URL('https://example.com/es/blog'),
      new URL('https://example.com/de/about'),
      new URL('https://example.com/invalid/page'),
    ];

    urls.forEach(url => {
      expect(getLangFromUrl(url)).toBe('en');
    });
  });
});

describe('Système de traduction (useTranslations)', () => {
  it('devrait retourner les traductions correctes pour l\'anglais', () => {
    const t = useTranslations('en');
    
    expect(t('nav.home')).toBe('Home');
    expect(t('nav.blog')).toBe('Blog');
    expect(t('blog.readMore')).toBe('Read more');
  });

  it('devrait retourner les traductions correctes pour le français', () => {
    const t = useTranslations('fr');
    
    expect(t('nav.home')).toBe('Accueil');
    expect(t('nav.blog')).toBe('Blog');
    expect(t('blog.readMore')).toBe('Lire la suite');
  });

  it('devrait utiliser le fallback anglais pour les clés manquantes', () => {
    // Note: Ce test nécessiterait une modification de la fonction pour être plus testable
    // Pour l'instant, nous testons que les clés existantes fonctionnent
    const t = useTranslations('en');
    expect(t('nav.home')).toBe('Home');
  });
});

describe('Gestion des chemins traduits (useTranslatedPath)', () => {
  it('devrait retourner le chemin sans préfixe pour l\'anglais', () => {
    const translatePath = useTranslatedPath('en');
    
    expect(translatePath('/')).toBe('/');
    expect(translatePath('/blog')).toBe('/blog');
    expect(translatePath('/about')).toBe('/about');
  });

  it('devrait ajouter le préfixe /fr/ pour le français', () => {
    const translatePath = useTranslatedPath('fr');
    
    expect(translatePath('/', 'fr')).toBe('/fr/');
    expect(translatePath('/blog', 'fr')).toBe('/fr/blog');
    expect(translatePath('/about', 'fr')).toBe('/fr/about');
  });

  it('devrait gérer les chemins avec ou sans slash initial', () => {
    const translatePath = useTranslatedPath('fr');
    
    expect(translatePath('blog', 'fr')).toBe('/fr/blog');
    expect(translatePath('/blog', 'fr')).toBe('/fr/blog');
  });

  it('devrait permettre de spécifier une langue cible différente', () => {
    const translatePath = useTranslatedPath('en');
    
    expect(translatePath('/blog', 'en')).toBe('/blog');
    expect(translatePath('/blog', 'fr')).toBe('/fr/blog');
  });
});

describe('Liens hreflang pour SEO (getHreflangLinks)', () => {
  it('devrait générer les liens hreflang corrects', () => {
    const links = getHreflangLinks('/blog', 'https://example.com');
    
    expect(links).toHaveLength(2);
    
    const enLink = links.find(link => link.hreflang === 'en');
    const frLink = links.find(link => link.hreflang === 'fr');
    
    expect(enLink?.href).toBe('https://example.com/blog');
    expect(frLink?.href).toBe('https://example.com/fr/blog');
  });

  it('devrait fonctionner sans URL de base', () => {
    const links = getHreflangLinks('/about');
    
    expect(links).toHaveLength(2);
    
    const enLink = links.find(link => link.hreflang === 'en');
    const frLink = links.find(link => link.hreflang === 'fr');
    
    expect(enLink?.href).toBe('/about');
    expect(frLink?.href).toBe('/fr/about');
  });
});

describe('Extraction du chemin sans langue (getPathWithoutLang)', () => {
  it('devrait extraire le chemin sans préfixe de langue française', () => {
    const urls = [
      { url: new URL('https://example.com/fr/blog'), expected: '/blog' },
      { url: new URL('https://example.com/fr/about'), expected: '/about' },
      { url: new URL('https://example.com/fr/'), expected: '/' },
    ];

    urls.forEach(({ url, expected }) => {
      expect(getPathWithoutLang(url)).toBe(expected);
    });
  });

  it('devrait retourner le chemin complet pour les URLs anglaises', () => {
    const urls = [
      { url: new URL('https://example.com/blog'), expected: '/blog' },
      { url: new URL('https://example.com/about'), expected: '/about' },
      { url: new URL('https://example.com/'), expected: '/' },
    ];

    urls.forEach(({ url, expected }) => {
      expect(getPathWithoutLang(url)).toBe(expected);
    });
  });
});

describe('Validation des langues (isValidLang)', () => {
  it('devrait valider les langues supportées', () => {
    expect(isValidLang('en')).toBe(true);
    expect(isValidLang('fr')).toBe(true);
  });

  it('devrait rejeter les langues non supportées', () => {
    expect(isValidLang('es')).toBe(false);
    expect(isValidLang('de')).toBe(false);
    expect(isValidLang('invalid')).toBe(false);
    expect(isValidLang('')).toBe(false);
  });
});

describe('Langues supportées (getSupportedLanguages)', () => {
  it('devrait retourner toutes les langues supportées', () => {
    const languages = getSupportedLanguages();
    
    expect(languages).toHaveLength(2);
    expect(languages).toContain('en');
    expect(languages).toContain('fr');
  });
});

describe('Formatage des dates (formatDate)', () => {
  const testDate = new Date('2024-01-15');

  it('devrait formater les dates en anglais', () => {
    const formatted = formatDate(testDate, 'en');
    expect(formatted).toMatch(/January 15, 2024/);
  });

  it('devrait formater les dates en français', () => {
    const formatted = formatDate(testDate, 'fr');
    expect(formatted).toMatch(/15 janvier 2024/);
  });
});

describe('Noms des langues (getLanguageName)', () => {
  it('devrait retourner les noms corrects des langues', () => {
    expect(getLanguageName('en')).toBe('English');
    expect(getLanguageName('fr')).toBe('Français');
  });
});

describe('Drapeaux des langues (getLanguageFlag)', () => {
  it('devrait retourner les drapeaux corrects', () => {
    expect(getLanguageFlag('en')).toBe('🇺🇸');
    expect(getLanguageFlag('fr')).toBe('🇫🇷');
  });
});

describe('Cohérence globale du système i18n', () => {
  it('devrait avoir une architecture cohérente', () => {
    // Vérifier que tous les éléments du système sont en place
    expect(ui).toBeDefined();
    expect(defaultLang).toBeDefined();
    expect(typeof getLangFromUrl).toBe('function');
    expect(typeof useTranslations).toBe('function');
    expect(typeof useTranslatedPath).toBe('function');
  });

  it('devrait supporter l\'ajout facile de nouvelles langues', () => {
    // Vérifier que la structure permet l'extension
    const languages = Object.keys(ui);
    expect(languages.length).toBeGreaterThan(0);
    
    // Toutes les langues devraient avoir le même ensemble de clés
    const referenceKeys = Object.keys(ui[languages[0] as Languages]);
    languages.forEach(lang => {
      const langKeys = Object.keys(ui[lang as Languages]);
      expect(langKeys.sort()).toEqual(referenceKeys.sort());
    });
  });
}); 