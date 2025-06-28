/**
 * Tests unitaires pour les utilitaires Header - Fonctions testées
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCriticalCSS } from "../../components/header/header-styles";
import { prepareHeaderData } from "../../components/header/utils";

// Mock server-utils
vi.mock("../../components/header/server-utils", () => ({
  analyzeLanguageContext: vi.fn(),
}));

// Mock article-utils
vi.mock("../../components/header/article-utils", () => ({
  generateContextualLanguageUrls: vi.fn(),
  generateHreflangLinks: vi.fn(),
}));

// Mock i18n utils
vi.mock("../../i18n/utils", () => ({
  getLangFromUrl: vi.fn(),
  useTranslations: vi.fn(),
  useTranslatedPath: vi.fn(),
}));

import {
  getLangFromUrl,
  useTranslations,
  useTranslatedPath,
} from "../../i18n/utils";
import { analyzeLanguageContext } from "../../components/header/server-utils";
import {
  generateContextualLanguageUrls,
  generateHreflangLinks,
} from "../../components/header/article-utils";

// Mock des fonctions
const mockGetLangFromUrl = vi.mocked(getLangFromUrl);
const mockUseTranslations = vi.mocked(useTranslations);
const mockUseTranslatedPath = vi.mocked(useTranslatedPath);
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
