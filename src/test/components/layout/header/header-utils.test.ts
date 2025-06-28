/**
 * Tests unitaires pour les utilitaires Header - Fonctions testées
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCriticalCSS } from "../../../../components/header/header-styles";
import { prepareHeaderData } from "../../../../components/header/utils";
import { NormalMapper } from "../../../../components/header/page-mappers/normal-mapper";
import type { NormalPageInfo } from "../../components/header/page-detectors/types";

// Mock server-utils
vi.mock("../../../../components/header/server-utils", () => ({
  analyzeLanguageContext: vi.fn(),
}));

// Mock article-utils
vi.mock("../../../../components/header/article-utils", () => ({
  generateContextualLanguageUrls: vi.fn(),
  generateHreflangLinks: vi.fn(),
}));

// Mock i18n utils
vi.mock("../../../../i18n/utils", () => ({
  getLangFromUrl: vi.fn(),
  useTranslations: vi.fn(),
  useTranslatedPath: vi.fn(),
  getPathWithoutLang: vi.fn(),
  generateLanguageUrls: vi.fn(),
}));

import {
  getLangFromUrl,
  useTranslations,
  useTranslatedPath,
  getPathWithoutLang,
  generateLanguageUrls,
} from "../../../../i18n/utils";
import { analyzeLanguageContext } from "../../../../components/header/server-utils";
import {
  generateContextualLanguageUrls,
  generateHreflangLinks,
} from "../../../../components/header/article-utils";

// Mock des fonctions
const mockGetLangFromUrl = vi.mocked(getLangFromUrl);
const mockUseTranslations = vi.mocked(useTranslations);
const mockUseTranslatedPath = vi.mocked(useTranslatedPath);
const mockGetPathWithoutLang = vi.mocked(getPathWithoutLang);
const mockGenerateLanguageUrls = vi.mocked(generateLanguageUrls);
const mockAnalyzeLanguageContext = vi.mocked(analyzeLanguageContext);
const mockGenerateContextualLanguageUrls = vi.mocked(
  generateContextualLanguageUrls,
);
const mockGenerateHreflangLinks = vi.mocked(generateHreflangLinks);

describe("Header Utils - CSS Critique", () => {
  describe("generateCriticalCSS()", () => {
    it("devrait générer du CSS valide", () => {
      const css = generateCriticalCSS();

      expect(css).toContain(".header-critical");
      expect(css).toContain("position: fixed");
      expect(css).toContain("z-index: 50");
    });

    it("devrait inclure les styles responsive et accessibilité", () => {
      const css = generateCriticalCSS();

      expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    });

    it("devrait être sous le seuil de performance de 1KB", () => {
      const css = generateCriticalCSS();
      const cssSize = new Blob([css]).size;

      // Seuil de 1KB selon les règles d'optimisation
      expect(cssSize).toBeLessThan(1024);
    });

    it("devrait contenir les propriétés de performance critiques", () => {
      const css = generateCriticalCSS();

      expect(css).toContain("backdrop-filter");
      expect(css).toContain("transition");
    });

    it("devrait inclure tous les états visuels nécessaires", () => {
      const css = generateCriticalCSS();

      // États visuels critiques présents
      expect(css).toContain(".header-critical");
    });
  });
});

describe("prepareHeaderData - Gestion d'erreur gracieuse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait utiliser getLangFromUrl comme fallback quand detectedLang est null", async () => {
    const mockUrl = new URL("https://example.com/about");
    const mockNavLinks = [
      { href: "/", key: "nav.home" as const },
      { href: "/about", key: "nav.about" as const },
    ];

    // Mock du contexte avec detectedLang null
    const mockLanguageContext = {
      isArticlePage: false,
      detectedLang: null,
    };

    // Mock des fonctions
    mockAnalyzeLanguageContext.mockResolvedValue(mockLanguageContext);
    mockGetLangFromUrl.mockReturnValue("en");
    mockUseTranslations.mockReturnValue((key: string) => key);
    mockUseTranslatedPath.mockReturnValue((path: string) => path);
    mockGenerateContextualLanguageUrls.mockReturnValue({
      en: { url: "/about", label: "English", flag: "🇺🇸", isActive: true },
      fr: { url: "/fr/about", label: "Français", flag: "🇫🇷", isActive: false },
    });
    mockGenerateHreflangLinks.mockReturnValue([
      { hreflang: "en", href: "/about" },
      { hreflang: "fr", href: "/fr/about" },
    ]);

    const result = await prepareHeaderData(mockUrl, mockNavLinks);

    // Vérifier que getLangFromUrl a été utilisé comme fallback
    expect(mockGetLangFromUrl).toHaveBeenCalledWith(mockUrl);

    // Vérifier que le résultat contient la langue par défaut
    expect(result.lang).toBe("en");

    // Vérifier que le flag de fallback est true
    expect(result.usingLanguageFallback).toBe(true);

    // Vérifier la structure complète du résultat
    expect(result).toHaveProperty("languageContext");
    expect(result).toHaveProperty("t");
    expect(result).toHaveProperty("translatePath");
    expect(result).toHaveProperty("translatedNavLinks");
    expect(result).toHaveProperty("languageUrls");
    expect(result).toHaveProperty("hreflangLinks");
  });

  it("devrait ne pas utiliser le fallback quand detectedLang est valide", async () => {
    const mockUrl = new URL("https://example.com/fr/about");
    const mockNavLinks = [{ href: "/", key: "nav.home" as const }];

    // Mock du contexte avec detectedLang valide
    const mockLanguageContext = {
      isArticlePage: false,
      detectedLang: "fr" as const,
    };

    mockAnalyzeLanguageContext.mockResolvedValue(mockLanguageContext);
    mockUseTranslations.mockReturnValue((key: string) => key);
    mockUseTranslatedPath.mockReturnValue((path: string) => `/fr${path}`);
    mockGenerateContextualLanguageUrls.mockReturnValue({
      en: { url: "/about", label: "English", flag: "🇺🇸", isActive: false },
      fr: { url: "/fr/about", label: "Français", flag: "🇫🇷", isActive: true },
    });
    mockGenerateHreflangLinks.mockReturnValue([
      { hreflang: "en", href: "/about" },
      { hreflang: "fr", href: "/fr/about" },
    ]);

    const result = await prepareHeaderData(mockUrl, mockNavLinks);

    // Vérifier que getLangFromUrl n'a pas été appelé
    expect(mockGetLangFromUrl).not.toHaveBeenCalled();

    // Vérifier que la langue détectée est utilisée
    expect(result.lang).toBe("fr");

    // Vérifier que le flag de fallback est false
    expect(result.usingLanguageFallback).toBe(false);
  });
});

describe("NormalMapper - Dynamic Path Extraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("devrait utiliser le chemin dynamique au lieu du chemin hardcodé", () => {
    const normalMapper = new NormalMapper();
    
    // Créer un pageInfo pour une page normale
    const pageInfo: NormalPageInfo = {
      pageType: "normal",
      detectedLang: "en",
    };

    // Test avec différents chemins
    const testCases = [
      {
        url: new URL("http://localhost:4321/about"),
        expectedPath: "/about",
        description: "page about"
      },
      {
        url: new URL("http://localhost:4321/contact"),
        expectedPath: "/contact", 
        description: "page contact"
      },
      {
        url: new URL("http://localhost:4321/fr/about"),
        expectedPath: "/about",
        description: "page française (chemin sans préfixe de langue)"
      },
      {
        url: new URL("http://localhost:4321/services/consulting"),
        expectedPath: "/services/consulting",
        description: "page avec sous-chemin"
      }
    ];

    testCases.forEach(({ url, expectedPath, description }) => {
      // Configurer les mocks pour chaque test
      mockGetPathWithoutLang.mockReturnValue(expectedPath);
      mockGenerateLanguageUrls.mockReturnValue({
        en: { url: expectedPath, label: "English", flag: "🇺🇸", isActive: true },
        fr: { url: `/fr${expectedPath}`, label: "Français", flag: "🇫🇷", isActive: false },
      });

      const additionalData = { currentUrl: url };
      const result = normalMapper.createUrlMapping(pageInfo, additionalData);
      
      expect(result, `Devrait générer un mapping pour ${description}`).not.toBeNull();
      
             if (result) {
         // Vérifier que les URLs générées utilisent le bon chemin de base
         Object.values(result).forEach((mappedUrl: string) => {
           if (expectedPath === "/") {
             // Pour la racine, les URLs peuvent être "/" ou avec préfixe de langue
             expect(
               mappedUrl === "/" || mappedUrl.startsWith("/fr"),
               `URL mappée "${mappedUrl}" devrait correspondre au chemin racine pour ${description}`
             ).toBe(true);
           } else {
             // Pour les autres chemins, vérifier que l'URL contient le chemin attendu
             expect(
               mappedUrl.includes(expectedPath),
               `URL mappée "${mappedUrl}" devrait contenir "${expectedPath}" pour ${description}`
             ).toBe(true);
           }
         });
       }
    });
  });

  test("devrait utiliser '/' comme fallback quand aucune URL n'est fournie", () => {
    const normalMapper = new NormalMapper();
    
    const pageInfo: NormalPageInfo = {
      pageType: "normal",
      detectedLang: "en",
    };

    // Configurer le mock pour le fallback
    mockGenerateLanguageUrls.mockReturnValue({
      en: { url: "/", label: "English", flag: "🇺🇸", isActive: true },
      fr: { url: "/fr", label: "Français", flag: "🇫🇷", isActive: false },
    });

    // Test sans additionalData (fallback vers "/")
    const result = normalMapper.createUrlMapping(pageInfo);
    
    expect(result).not.toBeNull();
    
    if (result) {
      // Vérifier que le mapping contient les langues supportées
      expect(result).toHaveProperty("en");
      expect(result).toHaveProperty("fr");
      
      // Pour le fallback, on s'attend à des URLs racines
      expect(result.en === "/" || result.en === "").toBe(true);
      expect(result.fr === "/fr" || result.fr === "/fr/").toBe(true);
    }
  });

  test("devrait gérer les URLs invalides dans additionalData", () => {
    const normalMapper = new NormalMapper();
    
    const pageInfo: NormalPageInfo = {
      pageType: "normal",
      detectedLang: "en",
    };

    // Configurer le mock pour le fallback quand URL invalide
    mockGenerateLanguageUrls.mockReturnValue({
      en: { url: "/", label: "English", flag: "🇺🇸", isActive: true },
      fr: { url: "/fr", label: "Français", flag: "🇫🇷", isActive: false },
    });

    // Test avec currentUrl invalide (fallback vers "/")
    const additionalData = { currentUrl: "not-a-url" };
    const result = normalMapper.createUrlMapping(pageInfo, additionalData);
    
    expect(result).not.toBeNull();
    
    if (result) {
      // Devrait utiliser le fallback
      expect(result.en === "/" || result.en === "").toBe(true);
      expect(result.fr === "/fr" || result.fr === "/fr/").toBe(true);
    }
  });
});
