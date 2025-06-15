// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    site: process.env.ASTRO_SITE ?? 'https://example.com',
    
    i18n: {
        defaultLocale: 'en',           // Anglais par défaut
        locales: ['en', 'fr'],
        routing: {
            prefixDefaultLocale: false   // Anglais sans préfixe (/, /blog, /about)
        }
    },
    
    vite: {
        plugins: [tailwindcss()],
        server: {
            watch: {
                ignored: [
                        '**/coverage/**',
                    '**/node_modules/**',
                    '**/vitest.config.ts',
                    '**/test/**',
                    '**/test-helpers/**',
                    '**/__tests__/**',
                ]
            }
        }
    },
    
    integrations: [mdx(), sitemap()]
});
