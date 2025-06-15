/**
 * Tests de Build Statique - Phase 2
 * Teste la génération HTML multilingue et l'optimisation des assets
 */

import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import { readFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

// Configuration pour les tests de build
const BUILD_CONFIG = {
  buildDir: 'dist',
  languages: ['en', 'fr'],
  maxBundleSize: 3 * 1024, // 3KB max JS
  maxCSSSize: 1024,    // 1KB max CSS critique
  requiredPages: ['/', '/fr/']
} as const;

// const execAsync = promisify(spawn); // Réservé pour usage futur

vi.setConfig({ testTimeout: 10000 });

// Helper pour vérifier l'existence d'un fichier
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Helper pour lire un fichier HTML
async function readHTMLFile(relativePath: string): Promise<string> {
  const fullPath = resolve(BUILD_CONFIG.buildDir, relativePath);
  return await readFile(fullPath, 'utf-8');
}

// Setup : Build du projet avant les tests
describe('Build Static Tests - Phase 2', () => {
  beforeAll(async () => {
    console.log('🏗️  Building project for static tests...');
    
    // Utiliser pnpm build pour construire le projet
    const buildProcess = spawn('pnpm', ['build'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    // Attendre que le build se termine
    await new Promise<void>((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Build completed successfully');
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
      
      buildProcess.on('error', (error) => {
        reject(error);
      });
    });
  }, 60000); // 60s timeout pour le build

  afterAll(() => {
    console.log('🧹 Build static tests completed');
  });

  describe('1. Génération HTML Statique', () => {
    test('génère les pages pour chaque langue', async () => {
      // Vérifier que le dossier dist existe
      const distExists = await fileExists(BUILD_CONFIG.buildDir);
      expect(distExists).toBe(true);

      // Vérifier page anglaise (/)
      const enPageExists = await fileExists(join(BUILD_CONFIG.buildDir, 'index.html'));
      expect(enPageExists).toBe(true);

      // Vérifier page française (/fr/)
      const frPageExists = await fileExists(join(BUILD_CONFIG.buildDir, 'fr', 'index.html'));
      expect(frPageExists).toBe(true);
    });

    test('contient la structure HTML correcte', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // Vérifier la structure HTML de base
      expect(enHTML).toContain('<!DOCTYPE html>');
      expect(enHTML).toContain('<html');
      expect(enHTML).toContain('<head>');
      expect(enHTML).toContain('<body>');

      expect(frHTML).toContain('<!DOCTYPE html>');
      expect(frHTML).toContain('<html');
      expect(frHTML).toContain('<head>');
      expect(frHTML).toContain('<body>');
    });

    test('inclut la navigation dans le HTML statique', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // Vérifier la présence de la navigation
      expect(enHTML).toContain('<nav');
      expect(frHTML).toContain('<nav');

      // Vérifier les attributs d'accessibilité
      expect(enHTML).toContain('aria-label');
      expect(frHTML).toContain('aria-label');
    });
  });

  describe('2. Traitement i18n au Build-time', () => {
    test('contient le contenu spécifique à chaque langue', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // Les deux pages doivent avoir du contenu distinct
      expect(enHTML).not.toEqual(frHTML);
      
      // Vérifier que chaque page a la langue correcte dans <html>
      expect(enHTML).toMatch(/<html[^>]*lang="en"/);
      expect(frHTML).toMatch(/<html[^>]*lang="fr"/);
    });

    test('génère les URLs multilingues correctement', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // La page anglaise ne doit pas avoir de préfixe /en/
      expect(enHTML).not.toContain('href="/en/');
      
      // La page française doit avoir des liens vers /fr/
      expect(frHTML).toContain('href="/fr/');
    });

    test('génère les liens hreflang pour le SEO', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // Vérifier les liens hreflang dans les deux versions
      expect(enHTML).toContain('hreflang="en"');
      expect(enHTML).toContain('hreflang="fr"');
      
      expect(frHTML).toContain('hreflang="en"');
      expect(frHTML).toContain('hreflang="fr"');
    });
  });

  describe('3. Optimisation Assets - Phase 2 Étape 2', () => {
    test('CSS critique intégré inline < 1KB', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // Extraire le CSS critique inline (direct <style> dans le Header)
      const enCSSMatch = enHTML.match(/<style[^>]*>(.*?)<\/style>/gs);
      const frCSSMatch = frHTML.match(/<style[^>]*>(.*?)<\/style>/gs);

      expect(enCSSMatch).toBeTruthy();
      expect(frCSSMatch).toBeTruthy();

      if (enCSSMatch && frCSSMatch) {
        // Calculer la taille totale du CSS inline
        const enCSSSize = enCSSMatch.reduce((acc, style) => {
          const cssContent = style.replace(/<\/?style[^>]*>/g, '');
          return acc + cssContent.length;
        }, 0);

        const frCSSSize = frCSSMatch.reduce((acc, style) => {
          const cssContent = style.replace(/<\/?style[^>]*>/g, '');
          return acc + cssContent.length;
        }, 0);

        // Vérifier les seuils de performance (< 1KB selon les règles)
        expect(enCSSSize).toBeLessThan(BUILD_CONFIG.maxCSSSize);
        expect(frCSSSize).toBeLessThan(BUILD_CONFIG.maxCSSSize);

        console.log(`📊 CSS Inline - EN: ${enCSSSize}B, FR: ${frCSSSize}B (Max: ${BUILD_CONFIG.maxCSSSize}B)`);
      }
    });

    test('contient les styles Header critiques', async () => {
      const enHTML = await readHTMLFile('index.html');
      
      // Vérifier que le CSS critique contient les classes Header essentielles
      const inlineCSS = enHTML.match(/<style[^>]*>(.*?)<\/style>/gs)?.[0] || '';
      
      // Classes critiques pour le Header selon l'implémentation réelle
      expect(inlineCSS).toContain('.header-critical'); // Classe principale Header
      expect(inlineCSS).toContain('backdrop-filter'); // Optimisations modernes
      expect(inlineCSS).toContain('@media'); // Media queries responsive
      expect(inlineCSS).toContain('prefers-color-scheme'); // Support dark mode
    });

    test('bundle JavaScript total < 3KB', async () => {
      const { readdirSync, statSync } = await import('node:fs');
      // `join` est déjà disponible dans la portée – supprimer cette ligne superflue
      
      const distPath = resolve(BUILD_CONFIG.buildDir);
      
      // Fonction récursive pour trouver tous les fichiers JS
      function findJSFiles(dir: string): string[] {
        const files: string[] = [];
        
        try {
          const items = readdirSync(dir);
          
          for (const item of items) {
            const fullPath = join(dir, item);
            const stat = statSync(fullPath);
            
            if (stat.isDirectory()) {
              files.push(...findJSFiles(fullPath));
            } else if (item.endsWith('.js')) {
              files.push(fullPath);
            }
          }
                 } catch {
           // Ignorer les erreurs de lecture de répertoire
         }
        
        return files;
      }
      
      const jsFiles = findJSFiles(distPath);
      
      // Calculer la taille totale des fichiers JS
      const totalSize = jsFiles.reduce((acc, file) => {
        try {
          return acc + statSync(file).size;
        } catch {
          return acc;
        }
      }, 0);
      
      console.log(`📊 JS Bundle - Total: ${totalSize}B (Max: ${BUILD_CONFIG.maxBundleSize}B)`);
      console.log(`📁 JS Files found: ${jsFiles.length}`);
      
      // Vérifier le seuil de performance selon les règles Astro
      expect(totalSize).toBeLessThan(BUILD_CONFIG.maxBundleSize);
    });

    test('génère les preload/prefetch links pour optimisation', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');

      // Vérifier la présence de liens prefetch/preload (réellement implémentés)
      const hasOptimizationLinks = (html: string) => {
        return html.includes('rel="prefetch"') || 
               html.includes('rel="preload"') ||
               html.includes('rel="dns-prefetch"') ||
               html.includes('rel="alternate"'); // hreflang SEO
      };

      // Les deux pages doivent avoir des liens d'optimisation
      const enHasOptimization = hasOptimizationLinks(enHTML);
      const frHasOptimization = hasOptimizationLinks(frHTML);
      
      expect(enHasOptimization).toBe(true);
      expect(frHasOptimization).toBe(true);
      
      // Vérifier spécifiquement les prefetch de navigation
      expect(enHTML).toContain('rel="prefetch"');
      expect(frHTML).toContain('rel="prefetch"');
      
      console.log(`📊 Optimization Links - EN: ${enHasOptimization}, FR: ${frHasOptimization}`);
    });

    test('optimise les meta tags de performance', async () => {
      const enHTML = await readHTMLFile('index.html');
      
      // Vérifier les meta tags essentiels (réellement présents)
      expect(enHTML).toMatch(/<meta[^>]*name="viewport"[^>]*>/);
      expect(enHTML).toMatch(/<meta[^>]*charset="utf-8"[^>]*>/);
      expect(enHTML).toMatch(/<meta[^>]*name="generator"[^>]*>/); // Astro generator
      
      // Vérifier l'optimisation du favicon
      expect(enHTML).toContain('type="image/svg+xml"'); // SVG favicon optimisé
      
      // Vérifier l'absence de meta tags bloquants inutiles
      const blockingMetas = enHTML.match(/<meta[^>]*http-equiv="refresh"[^>]*>/g) || [];
      expect(blockingMetas.length).toBe(0); // Pas de refresh automatique
    });
  });

  describe('4. Métriques de Performance Sites Statiques', () => {
    test('structure HTML minimale et optimisée', async () => {
      const enHTML = await readHTMLFile('index.html');
      
      // Vérifier que le HTML n'est pas excessivement volumineux
      const htmlSize = new TextEncoder().encode(enHTML).length;
      const maxHTMLSize = 50 * 1024; // 50KB max pour une page statique
      
      expect(htmlSize).toBeLessThan(maxHTMLSize);
      console.log(`📊 HTML Size: ${htmlSize}B (Max: ${maxHTMLSize}B)`);
      
      // Vérifier l'absence de JavaScript inutile dans le HTML
      const scriptTags = enHTML.match(/<script[^>]*>/g) || [];
      const inlineScriptCount = scriptTags.filter(tag => !tag.includes('src=')).length;
      
      // Sites statiques doivent avoir un minimum de scripts inline
      expect(inlineScriptCount).toBeLessThan(5);
      console.log(`📊 Inline Scripts: ${inlineScriptCount} (Max: 5)`);
    });

    test('absence de ressources bloquantes critiques', async () => {
      const enHTML = await readHTMLFile('index.html');
      
      // Vérifier l'absence de CSS externe bloquant
      const externalCSS = enHTML.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
      
      // Pour un site statique optimisé, le CSS doit être principalement inline
      expect(externalCSS.length).toBeLessThan(3);
      console.log(`📊 External CSS: ${externalCSS.length} (Max: 3)`);
      
      // Vérifier que les scripts ne bloquent pas le rendu
      const blockingScripts = enHTML.match(/<script(?![^>]*(?:async|defer))[^>]*src=[^>]*>/g) || [];
      expect(blockingScripts.length).toBe(0);
    });

    test('conformité aux seuils de performance globaux', async () => {
      const enHTML = await readHTMLFile('index.html');
      const frHTML = await readHTMLFile('fr/index.html');
      
      // Taille totale des pages HTML
      const enSize = new TextEncoder().encode(enHTML).length;
      const frSize = new TextEncoder().encode(frHTML).length;
      
      // Seuils pour sites statiques (plus stricts)
      const maxPageSize = 100 * 1024; // 100KB max par page statique
      
      expect(enSize).toBeLessThan(maxPageSize);
      expect(frSize).toBeLessThan(maxPageSize);
      
      console.log(`📊 Page Sizes - EN: ${enSize}B, FR: ${frSize}B (Max: ${maxPageSize}B)`);
      
      // Vérifier la cohérence entre les versions linguistiques
      const sizeDifference = Math.abs(enSize - frSize);
      const maxSizeDifference = 10 * 1024; // 10KB de différence max acceptable
      
      expect(sizeDifference).toBeLessThan(maxSizeDifference);
      console.log(`📊 Size Difference: ${sizeDifference}B (Max: ${maxSizeDifference}B)`);
    });
  });
}); 