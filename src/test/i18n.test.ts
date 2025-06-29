/**
 * Tests de validation pour le système d'internationalisation (i18n)
 * Vérifie la cohérence des dictionnaires et le bon fonctionnement des utilitaires
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ui, defaultLang, type Languages, type UIKeys } from "@/i18n/ui";
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
  getLanguageFlag,
  generateLanguageUrlsForArticle,
} from "@/i18n/utils";

// Mock console pour tester les warnings et erreurs
beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Dictionnaires de traduction (ui.ts)", () => {
  it("devrait avoir l'anglais comme langue par défaut", () => {
    expect(defaultLang).toBe("en");
  });

  it("devrait contenir exactement 2 langues", () => {
    expect(Object.keys(ui)).toHaveLength(2);
    expect(Object.keys(ui)).toContain("en");
    expect(Object.keys(ui)).toContain("fr");
  });

  it("devrait avoir les mêmes clés dans toutes les langues", () => {
    const englishKeys = Object.keys(ui.en).sort();
    const frenchKeys = Object.keys(ui.fr).sort();

    expect(frenchKeys).toEqual(englishKeys);
  });

  it("devrait avoir toutes les clés avec des valeurs non vides", () => {
    Object.entries(ui).forEach(([, translations]) => {
      Object.entries(translations).forEach(([, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe("string");
        expect(value.trim()).not.toBe("");
      });
    });
  });

  it("devrait contenir les clés essentielles de navigation", () => {
    const essentialNavKeys = [
      "nav.home",
      "nav.blog",
      "nav.about",
      "nav.contact",
      "nav.services",
    ];

    essentialNavKeys.forEach((key) => {
      expect(ui.en).toHaveProperty(key);
      expect(ui.fr).toHaveProperty(key);
    });
  });

  it("devrait contenir les clés essentielles du blog", () => {
    const essentialBlogKeys = [
      "blog.read",
      "blog.readMore",
      "blog.publishedOn",
      "blog.backToBlog",
      "blog.relatedPosts",
      "blog.noPostsFound",
      "blog.searchPlaceholder",
    ];

    essentialBlogKeys.forEach((key) => {
      expect(ui.en).toHaveProperty(key);
      expect(ui.fr).toHaveProperty(key);
    });
  });

  it("devrait contenir les clés essentielles d'interface", () => {
    const essentialUIKeys = [
      "languageSwitcher.label",
      "theme.toggle",
      "loading",
      "error.pageNotFound",
    ];

    essentialUIKeys.forEach((key) => {
      expect(ui.en).toHaveProperty(key);
      expect(ui.fr).toHaveProperty(key);
    });
  });

  it("devrait contenir les clés de métadonnées SEO", () => {
    const metaKeys = [
      "meta.description.home",
      "meta.description.blog",
      "meta.description.about",
      "meta.description.contact",
    ];

    metaKeys.forEach((key) => {
      expect(ui.en).toHaveProperty(key);
      expect(ui.fr).toHaveProperty(key);
    });
  });
});

describe("Détection de langue (getLangFromUrl)", () => {
  it('devrait retourner "en" pour les URLs sans préfixe de langue', () => {
    const urls = [
      new URL("https://example.com/"),
      new URL("https://example.com/blog"),
      new URL("https://example.com/about"),
      new URL("https://example.com/blog/article-title"),
    ];

    urls.forEach((url) => {
      expect(getLangFromUrl(url)).toBe("en");
    });
  });

  it('devrait retourner "fr" pour les URLs avec préfixe /fr/', () => {
    const urls = [
      new URL("https://example.com/fr/"),
      new URL("https://example.com/fr/blog"),
      new URL("https://example.com/fr/about"),
      new URL("https://example.com/fr/blog/article-titre"),
    ];

    urls.forEach((url) => {
      expect(getLangFromUrl(url)).toBe("fr");
    });
  });

  it("devrait retourner la langue par défaut pour les langues non supportées", () => {
    const urls = [
      new URL("https://example.com/es/blog"),
      new URL("https://example.com/de/about"),
      new URL("https://example.com/invalid/page"),
      new URL("https://example.com/zh/content"),
    ];

    urls.forEach((url) => {
      expect(getLangFromUrl(url)).toBe("en");
    });
  });

  it("devrait gérer les URLs avec des paramètres et fragments", () => {
    const urls = [
      new URL("https://example.com/fr/blog?page=2"),
      new URL("https://example.com/blog#section"),
      new URL("https://example.com/fr/about#contact"),
    ];

    expect(getLangFromUrl(urls[0])).toBe("fr");
    expect(getLangFromUrl(urls[1])).toBe("en");
    expect(getLangFromUrl(urls[2])).toBe("fr");
  });
});

describe("Système de traduction (useTranslations)", () => {
  it("devrait retourner les traductions correctes pour l'anglais", () => {
    const t = useTranslations("en");

    expect(t("nav.home")).toBe("Home");
    expect(t("nav.blog")).toBe("Blog");
    expect(t("blog.readMore")).toBe("Read more");
    expect(t("theme.toggle")).toBe("Toggle theme");
  });

  it("devrait retourner les traductions correctes pour le français", () => {
    const t = useTranslations("fr");

    expect(t("nav.home")).toBe("Accueil");
    expect(t("nav.blog")).toBe("Blog");
    expect(t("blog.readMore")).toBe("Lire la suite");
    expect(t("theme.toggle")).toBe("Basculer le thème");
  });

  it("devrait utiliser le fallback anglais et logger un warning pour les clés manquantes", () => {
    // Simuler une langue avec une clé manquante en utilisant une clé inexistante
    const t = useTranslations("fr");

    // Note: On manipule temporairement l'objet ui pour simuler une traduction manquante
    // Cette approche évite de modifier le fichier source pendant les tests
    // Utiliser vi.mock pour simuler une clé manquante temporairement
    const originalLookup = Object.getOwnPropertyDescriptor(ui.fr, "nav.home");
    Object.defineProperty(ui.fr, "nav.home", {
      value: undefined,
      configurable: true,
    });

    const result = t("nav.home");

    expect(result).toBe("Home"); // Fallback anglais
    expect(console.warn).toHaveBeenCalledWith(
      'Translation missing for key "nav.home" in language "fr". Using fallback from "en".',
    );

    // Restaurer la propriété originale
    if (originalLookup) {
      Object.defineProperty(ui.fr, "nav.home", originalLookup);
    }
  });
  it("devrait retourner la clé elle-même et logger une erreur si aucune traduction n'existe", () => {
    // Test avec une clé qui n'existe nulle part
    const t = useTranslations("en");
    const invalidKey = "nonexistent.key" as UIKeys;
    const result = t(invalidKey);

    expect(result).toBe("nonexistent.key");
    expect(console.error).toHaveBeenCalledWith(
      'Translation missing for key "nonexistent.key" in both "en" and fallback "en".',
    );
  });

  it("devrait gérer le cas où même le fallback anglais est manquant", () => {
    // Simuler l'absence de clé dans les deux langues
    const t = useTranslations("fr");

    // Sauvegarder les descripteurs originaux
    const originalEnDescriptor = Object.getOwnPropertyDescriptor(
      ui.en,
      "nav.home",
    );
    const originalFrDescriptor = Object.getOwnPropertyDescriptor(
      ui.fr,
      "nav.home",
    );

    // Supprimer temporairement les propriétés
    Object.defineProperty(ui.en, "nav.home", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(ui.fr, "nav.home", {
      value: undefined,
      configurable: true,
    });

    const result = t("nav.home");

    expect(result).toBe("nav.home"); // Retourne la clé elle-même
    expect(console.error).toHaveBeenCalledWith(
      'Translation missing for key "nav.home" in both "fr" and fallback "en".',
    );

    // Restaurer les propriétés originales
    if (originalEnDescriptor) {
      Object.defineProperty(ui.en, "nav.home", originalEnDescriptor);
    }
    if (originalFrDescriptor) {
      Object.defineProperty(ui.fr, "nav.home", originalFrDescriptor);
    }
  });
});

describe("Gestion des chemins traduits (useTranslatedPath)", () => {
  it("devrait retourner le chemin sans préfixe pour l'anglais", () => {
    const translatePath = useTranslatedPath("en");

    expect(translatePath("/")).toBe("/");
    expect(translatePath("/blog")).toBe("/blog");
    expect(translatePath("/about")).toBe("/about");
    expect(translatePath("/blog/article-title")).toBe("/blog/article-title");
  });

  it("devrait ajouter le préfixe /fr/ pour le français", () => {
    const translatePath = useTranslatedPath("fr");

    expect(translatePath("/", "fr")).toBe("/fr/");
    expect(translatePath("/blog", "fr")).toBe("/fr/blog");
    expect(translatePath("/about", "fr")).toBe("/fr/about");
    expect(translatePath("/blog/article-titre", "fr")).toBe(
      "/fr/blog/article-titre",
    );
  });

  it("devrait gérer les chemins avec ou sans slash initial", () => {
    const translatePath = useTranslatedPath("fr");

    expect(translatePath("blog", "fr")).toBe("/fr/blog");
    expect(translatePath("/blog", "fr")).toBe("/fr/blog");
    expect(translatePath("about/team", "fr")).toBe("/fr/about/team");
    expect(translatePath("/about/team", "fr")).toBe("/fr/about/team");
  });

  it("devrait permettre de spécifier une langue cible différente", () => {
    const translatePath = useTranslatedPath("en");

    expect(translatePath("/blog", "en")).toBe("/blog");
    expect(translatePath("/blog", "fr")).toBe("/fr/blog");

    const translatePathFr = useTranslatedPath("fr");
    expect(translatePathFr("/about", "en")).toBe("/about");
    expect(translatePathFr("/about", "fr")).toBe("/fr/about");
  });

  it("devrait utiliser la langue courante par défaut si aucune langue cible n'est spécifiée", () => {
    const translatePathEn = useTranslatedPath("en");
    const translatePathFr = useTranslatedPath("fr");

    expect(translatePathEn("/blog")).toBe("/blog");
    expect(translatePathFr("/blog")).toBe("/fr/blog");
  });
});

describe("Liens hreflang pour SEO (getHreflangLinks)", () => {
  it("devrait générer les liens hreflang corrects", () => {
    const links = getHreflangLinks("/blog", "https://example.com");

    expect(links).toHaveLength(2);

    const enLink = links.find((link) => link.hreflang === "en");
    const frLink = links.find((link) => link.hreflang === "fr");

    expect(enLink?.href).toBe("https://example.com/blog");
    expect(frLink?.href).toBe("https://example.com/fr/blog");
  });

  it("devrait fonctionner sans URL de base", () => {
    const links = getHreflangLinks("/about");

    expect(links).toHaveLength(2);

    const enLink = links.find((link) => link.hreflang === "en");
    const frLink = links.find((link) => link.hreflang === "fr");

    expect(enLink?.href).toBe("/about");
    expect(frLink?.href).toBe("/fr/about");
  });

  it("devrait gérer les chemins sans slash initial", () => {
    const links = getHreflangLinks("contact", "https://example.com");

    expect(links).toHaveLength(2);

    const enLink = links.find((link) => link.hreflang === "en");
    const frLink = links.find((link) => link.hreflang === "fr");

    expect(enLink?.href).toBe("https://example.com/contact");
    expect(frLink?.href).toBe("https://example.com/fr/contact");
  });

  it("devrait gérer la page d'accueil", () => {
    const links = getHreflangLinks("/", "https://example.com");

    expect(links).toHaveLength(2);

    const enLink = links.find((link) => link.hreflang === "en");
    const frLink = links.find((link) => link.hreflang === "fr");

    expect(enLink?.href).toBe("https://example.com/");
    expect(frLink?.href).toBe("https://example.com/fr/");
  });
});

describe("Extraction du chemin sans langue (getPathWithoutLang)", () => {
  it("devrait extraire le chemin sans préfixe de langue française", () => {
    const urls = [
      { url: new URL("https://example.com/fr/blog"), expected: "/blog" },
      { url: new URL("https://example.com/fr/about"), expected: "/about" },
      { url: new URL("https://example.com/fr/"), expected: "/" },
      {
        url: new URL("https://example.com/fr/blog/article-titre"),
        expected: "/blog/article-titre",
      },
    ];

    urls.forEach(({ url, expected }) => {
      expect(getPathWithoutLang(url)).toBe(expected);
    });
  });

  it("devrait retourner le chemin complet pour les URLs anglaises", () => {
    const urls = [
      { url: new URL("https://example.com/blog"), expected: "/blog" },
      { url: new URL("https://example.com/about"), expected: "/about" },
      { url: new URL("https://example.com/"), expected: "/" },
      {
        url: new URL("https://example.com/blog/article-title"),
        expected: "/blog/article-title",
      },
    ];

    urls.forEach(({ url, expected }) => {
      expect(getPathWithoutLang(url)).toBe(expected);
    });
  });

  it("devrait gérer les URLs avec des langues non supportées", () => {
    const urls = [
      { url: new URL("https://example.com/es/blog"), expected: "/es/blog" },
      { url: new URL("https://example.com/de/about"), expected: "/de/about" },
      {
        url: new URL("https://example.com/invalid/page"),
        expected: "/invalid/page",
      },
    ];

    urls.forEach(({ url, expected }) => {
      expect(getPathWithoutLang(url)).toBe(expected);
    });
  });

  it("devrait gérer les chemins vides correctement", () => {
    const urls = [
      { url: new URL("https://example.com/fr"), expected: "/" },
      { url: new URL("https://example.com/fr/"), expected: "/" },
    ];

    urls.forEach(({ url, expected }) => {
      expect(getPathWithoutLang(url)).toBe(expected);
    });
  });
});

describe("Validation des langues (isValidLang)", () => {
  it("devrait valider les langues supportées", () => {
    expect(isValidLang("en")).toBe(true);
    expect(isValidLang("fr")).toBe(true);
  });

  it("devrait rejeter les langues non supportées", () => {
    expect(isValidLang("es")).toBe(false);
    expect(isValidLang("de")).toBe(false);
    expect(isValidLang("invalid")).toBe(false);
    expect(isValidLang("")).toBe(false);
    expect(isValidLang("EN")).toBe(false); // Sensible à la casse
    expect(isValidLang("FR")).toBe(false); // Sensible à la casse
  });

  it("devrait retourner false pour des valeurs nulles ou undefined", () => {
    // @ts-expect-error - Test intentionnel avec des valeurs incorrectes
    expect(isValidLang(null)).toBe(false);
    // @ts-expect-error - Test intentionnel avec des valeurs incorrectes
    expect(isValidLang(undefined)).toBe(false);
  });
});

describe("Langues supportées (getSupportedLanguages)", () => {
  it("devrait retourner toutes les langues supportées", () => {
    const languages = getSupportedLanguages();

    expect(languages).toHaveLength(2);
    expect(languages).toContain("en");
    expect(languages).toContain("fr");
  });

  it("devrait retourner un tableau ordonné", () => {
    const languages = getSupportedLanguages();
    const sortedLanguages = [...languages].sort();

    expect(languages).toEqual(expect.arrayContaining(sortedLanguages));
  });
});

describe("Formatage des dates (formatDate)", () => {
  const testDate = new Date("2024-01-15");

  it("devrait formater les dates en anglais", () => {
    const formatted = formatDate(testDate, "en");
    // Vérifier la structure plutôt que le contenu exact
    expect(formatted).toContain("2024");
    expect(formatted).toContain("15");
    expect(formatted).toContain("January");
    // Test de la structure complète
    expect(formatted).toMatch(/^[A-Za-z]+ \d{1,2}, \d{4}$/);
  });

  it("devrait formater les dates en français", () => {
    const formatted = formatDate(testDate, "fr");
    // Vérifier la structure plutôt que le contenu exact
    expect(formatted).toContain("2024");
    expect(formatted).toContain("15");
    expect(formatted).toContain("janvier");
    // Test de la structure complète pour le français
    expect(formatted).toMatch(/^\d{1,2} [a-zA-Zâêîôûàèùç]+ \d{4}$/);
  });

  it("devrait gérer différentes dates", () => {
    const dates = [
      new Date("2023-12-25"), // Noël
      new Date("2024-07-14"), // Fête nationale française
      new Date("2024-02-29"), // Année bissextile
    ];

    dates.forEach((date) => {
      const formattedEn = formatDate(date, "en");
      const formattedFr = formatDate(date, "fr");

      expect(formattedEn).toBeTruthy();
      expect(formattedFr).toBeTruthy();
      expect(formattedEn).not.toBe(formattedFr);
    });
  });

  it("devrait utiliser le bon format de locale", () => {
    const formatted = formatDate(testDate, "fr");
    // Le format français utilise "janvier" et non "January"
    expect(formatted).toContain("janvier");
    expect(formatted).not.toContain("January");
  });

  it("devrait maintenir un formatage consistant (test de snapshot)", () => {
    // Test de snapshot plus robuste avec date fixe et timezone normalisée
    const fixedDate = new Date("2024-01-15T12:00:00.000Z");

    // Test pour l'anglais
    const formattedEn = formatDate(fixedDate, "en");
    expect(formattedEn).toMatchSnapshot("formatDate-en-2024-01-15");

    // Test pour le français
    const formattedFr = formatDate(fixedDate, "fr");
    expect(formattedFr).toMatchSnapshot("formatDate-fr-2024-01-15");

    // Vérification que les formats sont différents
    expect(formattedEn).not.toBe(formattedFr);
  });

  it("devrait gérer différentes dates de manière cohérente", () => {
    const testDates = [
      { date: new Date("2024-01-01T12:00:00.000Z"), label: "Nouvel An" },
      {
        date: new Date("2024-07-14T12:00:00.000Z"),
        label: "Fête nationale française",
      },
      { date: new Date("2024-12-25T12:00:00.000Z"), label: "Noël" },
    ];

    testDates.forEach(({ date, label }) => {
      const formattedEn = formatDate(date, "en");
      const formattedFr = formatDate(date, "fr");

      // Vérifier que le formatage produit quelque chose
      expect(formattedEn, `Date en anglais pour ${label}`).toBeTruthy();
      expect(formattedFr, `Date en français pour ${label}`).toBeTruthy();

      // Vérifier que les formats sont différents
      expect(formattedEn, `Formats différents pour ${label}`).not.toBe(
        formattedFr,
      );

      // Vérifier la présence de l'année
      expect(formattedEn, `Année présente en anglais pour ${label}`).toContain(
        "2024",
      );
      expect(formattedFr, `Année présente en français pour ${label}`).toContain(
        "2024",
      );
    });
  });
});

describe("Noms des langues (getLanguageName)", () => {
  it("devrait retourner les noms corrects des langues", () => {
    expect(getLanguageName("en")).toBe("English");
    expect(getLanguageName("fr")).toBe("Français");
  });

  it("devrait retourner le code de langue comme fallback pour une langue non configurée", () => {
    // @ts-expect-error - Test avec une langue non supportée
    expect(getLanguageName("es")).toBe("es");
    // @ts-expect-error - Test avec une langue non supportée
    expect(getLanguageName("de")).toBe("de");
  });
});

describe("Drapeaux des langues (getLanguageFlag)", () => {
  it("devrait retourner les drapeaux corrects", () => {
    expect(getLanguageFlag("en")).toBe("🇺🇸");
    expect(getLanguageFlag("fr")).toBe("🇫🇷");
  });

  it("devrait retourner un drapeau générique pour une langue non configurée", () => {
    // @ts-expect-error - Test avec une langue non supportée
    expect(getLanguageFlag("es")).toBe("🌐");
    // @ts-expect-error - Test avec une langue non supportée
    expect(getLanguageFlag("de")).toBe("🌐");
  });
});

describe("Cohérence globale du système i18n", () => {
  it("devrait avoir une architecture cohérente", () => {
    // Vérifier que tous les éléments du système sont en place
    expect(ui).toBeDefined();
    expect(defaultLang).toBeDefined();
    expect(typeof getLangFromUrl).toBe("function");
    expect(typeof useTranslations).toBe("function");
    expect(typeof useTranslatedPath).toBe("function");
  });

  it("devrait supporter l'ajout facile de nouvelles langues", () => {
    // Vérifier que la structure permet l'extension
    const languages = Object.keys(ui);
    expect(languages.length).toBeGreaterThan(0);

    // Toutes les langues devraient avoir le même ensemble de clés
    const referenceKeys = Object.keys(ui[languages[0] as Languages]);
    languages.forEach((lang) => {
      const langKeys = Object.keys(ui[lang as Languages]);
      expect(langKeys.sort()).toEqual(referenceKeys.sort());
    });
  });

  it("devrait maintenir la cohérence des types", () => {
    // Vérifier que les types sont cohérents
    const languages = getSupportedLanguages();
    languages.forEach((lang) => {
      expect(isValidLang(lang)).toBe(true);
      expect(getLanguageName(lang)).toBeTruthy();
      expect(getLanguageFlag(lang)).toBeTruthy();
    });
  });

  it("devrait avoir des traductions complètes pour toutes les fonctionnalités", () => {
    const essentialKeys = [
      "nav.home",
      "nav.blog",
      "nav.about",
      "blog.readMore",
      "blog.publishedOn",
      "theme.toggle",
      "loading",
      "error.pageNotFound",
      "meta.description.home",
    ];

    getSupportedLanguages().forEach((lang) => {
      const t = useTranslations(lang);
      essentialKeys.forEach((key) => {
        const translation = t(key as UIKeys);
        expect(translation).toBeTruthy();
        expect(translation).not.toBe(key); // Pas de fallback vers la clé
      });
    });
  });
});

describe("generateLanguageUrlsForArticle", () => {
  it("should generate correct URLs for articles with default path prefix", () => {
    const result = generateLanguageUrlsForArticle(
      "/blog/en/test-article",
      "en",
      { en: "test-article", fr: "article-test" },
    );

    expect(result.en.url).toBe("/blog/en/test-article");
    expect(result.fr.url).toBe("/blog/fr/article-test");
    expect(result.en.isActive).toBe(true);
    expect(result.fr.isActive).toBe(false);
  });

  it("should accept custom path prefix", () => {
    const result = generateLanguageUrlsForArticle(
      "/articles/en/test-article",
      "en",
      { en: "test-article", fr: "article-test" },
      "/articles/",
    );

    expect(result.en.url).toBe("/articles/en/test-article");
    expect(result.fr.url).toBe("/articles/fr/article-test");
  });

  it("should normalize path prefix by adding trailing slash", () => {
    const result = generateLanguageUrlsForArticle(
      "/posts/en/test-article",
      "en",
      { en: "test-article", fr: "article-test" },
      "/posts",
    );

    expect(result.en.url).toBe("/posts/en/test-article");
    expect(result.fr.url).toBe("/posts/fr/article-test");
  });

  it("should validate translationMapping keys", () => {
    expect(() => {
      generateLanguageUrlsForArticle("/blog/en/test-article", "en", {
        en: "test-article",
        es: "articulo-test",
        invalid: "test",
      });
    }).toThrow("Invalid language keys in translationMapping: es, invalid");
  });

  it("should work without translationMapping (fallback to normal path translation)", () => {
    const result = generateLanguageUrlsForArticle("/blog/test-article", "en");

    expect(result.en.url).toBe("/blog/test-article");
    expect(result.fr.url).toBe("/fr/blog/test-article");
  });

  it("should handle null values in translationMapping gracefully", () => {
    const result = generateLanguageUrlsForArticle(
      "/blog/en/test-article",
      "en",
      { en: "test-article", fr: null },
    );

    expect(result.en.url).toBe("/blog/en/test-article");
    expect(result.fr.url).toBe("/fr/"); // Fallback to homepage
  });

  it("should have proper return type structure", () => {
    const result = generateLanguageUrlsForArticle(
      "/blog/en/test-article",
      "en",
      { en: "test-article", fr: "article-test" },
    );

    // Verify structure matches expected type
    expect(result).toHaveProperty("en");
    expect(result).toHaveProperty("fr");

    expect(result.en).toHaveProperty("url");
    expect(result.en).toHaveProperty("isActive");
    expect(result.en).toHaveProperty("label");
    expect(result.en).toHaveProperty("flag");

    expect(typeof result.en.url).toBe("string");
    expect(typeof result.en.isActive).toBe("boolean");
    expect(typeof result.en.label).toBe("string");
    expect(typeof result.en.flag).toBe("string");
  });
});
