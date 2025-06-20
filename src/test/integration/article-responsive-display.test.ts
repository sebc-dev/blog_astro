import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Article Responsive Display Tests", () => {
  const latestArticlesSectionPath = join(
    process.cwd(),
    "src/components/LatestArticlesSection.astro",
  );
  const componentContent = readFileSync(latestArticlesSectionPath, "utf-8");

  describe("Desktop vs Mobile Layout Logic", () => {
    it("devrait avoir la logique de séparation des articles pour desktop et mobile", () => {
      // Vérifier que les variables pour desktop et mobile existent
      expect(componentContent).toContain("gridPostsDesktop");
      expect(componentContent).toContain("gridPostsMobile");
      expect(componentContent).toContain("heroPosts");
    });

    it("devrait définir correctement les articles pour mobile (tous)", () => {
      expect(componentContent).toContain(
        "const gridPostsMobile = limitedPosts",
      );
    });

    it("devrait définir correctement les articles pour desktop (sans le premier)", () => {
      // Utiliser une regex pour gérer les retours à la ligne dans la définition
      expect(componentContent).toMatch(
        /const\s+gridPostsDesktop\s*=\s*showHero\s*&&\s*limitedPosts\.length\s*>\s*1[\s\S]*?limitedPosts\.slice\(1\)/,
      );
      expect(componentContent).toContain("limitedPosts.slice(1)");
    });
  });

  describe("Classes CSS Responsive", () => {
    it("devrait masquer ArticleHero sur mobile avec la classe hidden lg:block", () => {
      // Recherche plus flexible pour la classe hero
      expect(componentContent).toMatch(/hero-section[^>]*hidden[^>]*lg:block/);
    });

    it("devrait masquer la grille desktop sur mobile avec hidden lg:block", () => {
      // Recherche plus flexible - chercher la structure complète
      expect(componentContent).toMatch(/grid-section[^>]*hidden[^>]*lg:block/);
    });

    it("devrait afficher la grille mobile uniquement sur mobile avec lg:hidden", () => {
      // Recherche plus flexible pour lg:hidden
      expect(componentContent).toMatch(/grid-section[^>]*lg:hidden/);
    });

    it("devrait utiliser une grille adaptée pour mobile (1 colonne, puis 2)", () => {
      // Recherche des classes individuelles (l'ordre peut varier avec le formatage)
      expect(componentContent).toContain("grid-cols-1");
      expect(componentContent).toContain("sm:grid-cols-2");
    });
  });

  describe("Mappage des Données", () => {
    it("devrait utiliser gridPostsDesktop pour la grille desktop", () => {
      // Recherche plus large de la section desktop avec gridPostsDesktop
      const hasDesktopSection = componentContent.includes(
        "gridPostsDesktop.map",
      );
      const hasHiddenLgBlock = componentContent.includes("hidden lg:block");
      expect(hasDesktopSection).toBe(true);
      expect(hasHiddenLgBlock).toBe(true);
    });

    it("devrait utiliser gridPostsMobile pour la grille mobile", () => {
      // Recherche plus large de la section mobile avec gridPostsMobile
      const hasMobileSection = componentContent.includes("gridPostsMobile.map");
      const hasLgHidden = componentContent.includes("lg:hidden");
      expect(hasMobileSection).toBe(true);
      expect(hasLgHidden).toBe(true);
    });

    it("devrait utiliser heroPosts pour le composant Hero desktop", () => {
      // Vérification que heroPosts est utilisé avec le composant ArticleHero
      expect(componentContent).toMatch(/heroPosts\.map[\s\S]*?ArticleHero/);
    });
  });

  describe("Cohérence des Props entre Hero et Card", () => {
    it("devrait passer les mêmes props à ArticleHero et ArticleCard", () => {
      // Vérifier la présence des props essentiels
      const hasTitle = componentContent.includes("title={post.data.title}");
      const hasDescription = componentContent.includes(
        "description={post.data.description}",
      );
      const hasHeroImage = componentContent.includes(
        "heroImage={post.data.heroImage}",
      );
      const hasPubDate = componentContent.includes(
        "pubDate={post.data.pubDate}",
      );
      const hasAuthor = componentContent.includes("author={post.data.author}");

      expect(hasTitle).toBe(true);
      expect(hasDescription).toBe(true);
      expect(hasHeroImage).toBe(true);
      expect(hasPubDate).toBe(true);
      expect(hasAuthor).toBe(true);
    });
  });

  describe("Structure Responsive Complète", () => {
    it("devrait avoir une architecture complète desktop/mobile", () => {
      const sections = [
        "<!-- Article Héro (desktop uniquement) -->",
        "<!-- Grille d'articles Desktop (sans le premier article qui est en hero) -->",
        "<!-- Grille d'articles Mobile (tous les articles, y compris le premier) -->",
      ];

      sections.forEach((section) => {
        expect(componentContent).toContain(section);
      });
    });

    it("devrait conserver les fonctionnalités existantes", () => {
      const features = [
        "showHero",
        "maxArticles",
        "getPostCategory",
        "getPostTag",
        "estimateReadingTime",
        "translatePath",
      ];

      features.forEach((feature) => {
        expect(componentContent).toContain(feature);
      });
    });
  });

  describe("Debug Information", () => {
    it("devrait fournir des informations de debug pour GitHub Actions", () => {
      // Test de debug pour comprendre les problèmes sur GitHub
      console.log("🔍 File path:", latestArticlesSectionPath);
      console.log("📄 File length:", componentContent.length);
      console.log(
        "🏷️  Contains hero-section:",
        componentContent.includes("hero-section"),
      );
      console.log(
        "🏷️  Contains grid-section:",
        componentContent.includes("grid-section"),
      );
      console.log(
        "🏷️  Contains lg:hidden:",
        componentContent.includes("lg:hidden"),
      );
      console.log(
        "🏷️  Contains hidden lg:block:",
        componentContent.includes("hidden lg:block"),
      );
      console.log(
        "🏷️  Contains gridPostsDesktop.map:",
        componentContent.includes("gridPostsDesktop.map"),
      );
      console.log(
        "🏷️  Contains gridPostsMobile.map:",
        componentContent.includes("gridPostsMobile.map"),
      );

      // Ce test passe toujours, il est juste pour le debug
      expect(componentContent.length).toBeGreaterThan(0);
    });
  });
});
