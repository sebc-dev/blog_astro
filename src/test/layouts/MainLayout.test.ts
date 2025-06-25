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

  it("should contain grid background element", () => {
    expect(layoutContent).toContain('class="grid-background"');
    expect(layoutContent).toContain('data-cy="grid-background"');
  });

  it("should have proper HTML structure", () => {
    expect(layoutContent).toContain('<html lang={lang}>');
    expect(layoutContent).toContain('<head>');
    expect(layoutContent).toContain('<body class="relative bg-base-50 z-[0]" data-cy="app-body">');
    expect(layoutContent).toContain('<Header />');
    expect(layoutContent).toContain('<main data-cy="main-content">');
    expect(layoutContent).toContain('<Footer />');
  });

  it("should contain content background element for layering", () => {
    expect(layoutContent).toContain('class="content-background"');
    expect(layoutContent).toContain('data-cy="content-background"');
  });

  it("should have required meta tags structure", () => {
    expect(layoutContent).toContain('<meta charset="utf-8" />');
    expect(layoutContent).toContain('<meta name="viewport"');
    expect(layoutContent).toContain('<meta name="generator"');
    expect(layoutContent).toContain('<meta name="description"');
  });

  it("should contain Open Graph meta tags", () => {
    expect(layoutContent).toContain('<meta property="og:title"');
    expect(layoutContent).toContain('<meta property="og:description"');
    expect(layoutContent).toContain('<meta property="og:type"');
    expect(layoutContent).toContain('<meta property="og:url"');
    expect(layoutContent).toContain('<meta property="og:image"');
  });

  it("should contain Twitter Card meta tags", () => {
    expect(layoutContent).toContain('<meta name="twitter:card"');
    expect(layoutContent).toContain('<meta name="twitter:title"');
    expect(layoutContent).toContain('<meta name="twitter:description"');
    expect(layoutContent).toContain('<meta name="twitter:image"');
  });

  it("should have Props interface defined", () => {
    expect(layoutContent).toContain('interface Props {');
    expect(layoutContent).toContain('title?: string;');
    expect(layoutContent).toContain('description?: string;');
    expect(layoutContent).toContain('ogImage?: string;');
    expect(layoutContent).toContain('noindex?: boolean;');
  });

  it("should handle internationalization", () => {
    expect(layoutContent).toContain('const lang = getLangFromUrl(Astro.url)');
    expect(layoutContent).toContain('const t = useTranslations(lang)');
    expect(layoutContent).toContain('lang === "fr" ? "fr_FR" : "en_US"');
  });

  it("should include slot for additional head content", () => {
    expect(layoutContent).toContain('<slot name="head" />');
  });

  it("should include grid background CSS styles", () => {
    expect(layoutContent).toContain('.grid-background');
    expect(layoutContent).toContain('.content-background');
  });

  it("should have responsive design considerations", () => {
    expect(layoutContent).toContain('@media (max-width: 768px)');
    expect(layoutContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(layoutContent).toContain('@media (max-width: 480px)');
  });

  it("should utilize site configuration", () => {
    expect(layoutContent).toContain('siteUtils.getPageTitle(title)');
    expect(layoutContent).toContain('siteUtils.getCanonicalUrl');
    expect(layoutContent).toContain('siteUtils.getAssetUrl');
    expect(layoutContent).toContain('siteConfig.title');
    expect(layoutContent).toContain('siteConfig.defaultOgImage');
  });
});
