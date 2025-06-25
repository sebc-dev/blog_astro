// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("MainLayout Structure and Configuration", () => {
  // Lire le contenu du fichier MainLayout pour analyser sa structure
  const layoutPath = join(process.cwd(), "src/layouts/MainLayout.astro");
  const layoutContent = readFileSync(layoutPath, "utf-8");

  it("should import required dependencies", () => {
    expect(layoutContent).toContain('import Header from "../components/header/Header.astro"');
    expect(layoutContent).toContain('import Footer from "../components/Footer.astro"');
    expect(layoutContent).toContain('import { getLangFromUrl, useTranslations } from "../i18n/utils"');
    expect(layoutContent).toContain('import { siteConfig, siteUtils } from "../config/site"');
  });

  it("should have proper HTML structure", () => {
    // Tests granulaires robustes utilisant includes() pour éviter les problèmes CI/CD
    const hasLangAttribute = layoutContent.includes('<html lang={lang}>');
    const hasHeadTag = layoutContent.includes('<head>');
    const hasBodyClass = layoutContent.includes('class="relative bg-base-50 z-[0]"');
    const hasAppBodyCy = layoutContent.includes('data-cy="app-body"');
    const hasHeaderComponent = layoutContent.includes('<Header />');
    const hasMainContent = layoutContent.includes('<main data-cy="main-content">');
    const hasFooterComponent = layoutContent.includes('<Footer />');

    expect(hasLangAttribute).toBe(true);
    expect(hasHeadTag).toBe(true);
    expect(hasBodyClass).toBe(true);
    expect(hasAppBodyCy).toBe(true);
    expect(hasHeaderComponent).toBe(true);
    expect(hasMainContent).toBe(true);
    expect(hasFooterComponent).toBe(true);
  });

  it("should contain content background element for layering", () => {
    const hasContentBackground = layoutContent.includes('class="content-background"');
    const hasContentBackgroundCy = layoutContent.includes('data-cy="content-background"');
    
    expect(hasContentBackground).toBe(true);
    expect(hasContentBackgroundCy).toBe(true);
  });

  it("should have required meta tags structure", () => {
    const hasCharsetMeta = layoutContent.includes('<meta charset="utf-8" />');
    const hasViewportMeta = layoutContent.includes('<meta name="viewport"');
    const hasGeneratorMeta = layoutContent.includes('<meta name="generator"');
    const hasDescriptionMeta = layoutContent.includes('<meta name="description"');

    expect(hasCharsetMeta).toBe(true);
    expect(hasViewportMeta).toBe(true);
    expect(hasGeneratorMeta).toBe(true);
    expect(hasDescriptionMeta).toBe(true);
  });

  it("should contain Open Graph meta tags", () => {
    const hasOgTitle = layoutContent.includes('<meta property="og:title"');
    const hasOgDescription = layoutContent.includes('<meta property="og:description"');
    const hasOgType = layoutContent.includes('<meta property="og:type"');
    const hasOgUrl = layoutContent.includes('<meta property="og:url"');
    const hasOgImage = layoutContent.includes('<meta property="og:image"');

    expect(hasOgTitle).toBe(true);
    expect(hasOgDescription).toBe(true);
    expect(hasOgType).toBe(true);
    expect(hasOgUrl).toBe(true);
    expect(hasOgImage).toBe(true);
  });

  it("should contain Twitter Card meta tags", () => {
    const hasTwitterCard = layoutContent.includes('<meta name="twitter:card"');
    const hasTwitterTitle = layoutContent.includes('<meta name="twitter:title"');
    const hasTwitterDescription = layoutContent.includes('<meta name="twitter:description"');
    const hasTwitterImage = layoutContent.includes('<meta name="twitter:image"');

    expect(hasTwitterCard).toBe(true);
    expect(hasTwitterTitle).toBe(true);
    expect(hasTwitterDescription).toBe(true);
    expect(hasTwitterImage).toBe(true);
  });

  it("should have Props interface defined", () => {
    const hasPropsInterface = layoutContent.includes('interface Props {');
    const hasTitleProp = layoutContent.includes('title?: string;');
    const hasDescriptionProp = layoutContent.includes('description?: string;');
    const hasOgImageProp = layoutContent.includes('ogImage?: string;');
    const hasNoindexProp = layoutContent.includes('noindex?: boolean;');

    expect(hasPropsInterface).toBe(true);
    expect(hasTitleProp).toBe(true);
    expect(hasDescriptionProp).toBe(true);
    expect(hasOgImageProp).toBe(true);
    expect(hasNoindexProp).toBe(true);
  });

  it("should handle internationalization", () => {
    const hasLangFromUrl = layoutContent.includes('const lang = getLangFromUrl(Astro.url)');
    const hasTranslations = layoutContent.includes('const t = useTranslations(lang)');
    const hasLocaleLogic = layoutContent.includes('lang === "fr" ? "fr_FR" : "en_US"');

    expect(hasLangFromUrl).toBe(true);
    expect(hasTranslations).toBe(true);
    expect(hasLocaleLogic).toBe(true);
  });

  it("should include slot for additional head content", () => {
    const hasHeadSlot = layoutContent.includes('<slot name="head" />');
    expect(hasHeadSlot).toBe(true);
  });

  it("should include grid background CSS styles", () => {
    const hasGridBackground = layoutContent.includes('.grid-background');
    const hasContentBackground = layoutContent.includes('.content-background');

    expect(hasGridBackground).toBe(true);
    expect(hasContentBackground).toBe(true);
  });

  it("should have responsive design considerations", () => {
    const hasTabletMediaQuery = layoutContent.includes('@media (max-width: 768px)');
    const hasMotionMediaQuery = layoutContent.includes('@media (prefers-reduced-motion: reduce)');
    const hasMobileMediaQuery = layoutContent.includes('@media (max-width: 480px)');

    expect(hasTabletMediaQuery).toBe(true);
    expect(hasMotionMediaQuery).toBe(true);
    expect(hasMobileMediaQuery).toBe(true);
  });

  it("should utilize site configuration", () => {
    const hasPageTitle = layoutContent.includes('siteUtils.getPageTitle(title)');
    const hasCanonicalUrl = layoutContent.includes('siteUtils.getCanonicalUrl');
    const hasAssetUrl = layoutContent.includes('siteUtils.getAssetUrl');
    const hasSiteTitle = layoutContent.includes('siteConfig.title');
    const hasDefaultOgImage = layoutContent.includes('siteConfig.defaultOgImage');

    expect(hasPageTitle).toBe(true);
    expect(hasCanonicalUrl).toBe(true);
    expect(hasAssetUrl).toBe(true);
    expect(hasSiteTitle).toBe(true);
    expect(hasDefaultOgImage).toBe(true);
  });

  // Test de debug pour diagnostiquer les problèmes CI/CD selon les bonnes pratiques
  describe("Debug Information", () => {
    it("devrait fournir des informations de debug pour GitHub Actions", () => {
      console.log("🔍 File path:", layoutPath);
      console.log("📄 File length:", layoutContent.length);
      console.log("🏷️ Contains body class:", {
        hasRelativeClass: layoutContent.includes('relative'),
        hasBgBase50Class: layoutContent.includes('bg-base-50'),
        hasZIndexClass: layoutContent.includes('z-[0]'),
        hasFullBodyClass: layoutContent.includes('class="relative bg-base-50 z-[0]"'),
        hasBodyTag: layoutContent.includes('<body'),
        hasDataCy: layoutContent.includes('data-cy="app-body"')
      });
      console.log("🔧 Environment info:", {
        platform: process.platform,
        nodeVersion: process.version,
        isCI: process.env.CI === 'true',
        isGitHubActions: process.env.GITHUB_ACTIONS === 'true'
      });
      
      // Ce test passe toujours, il est juste pour le debug
      expect(layoutContent.length).toBeGreaterThan(0);
    });
  });
});
