// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    site: 'https://votre-domaine.com',
    
    i18n: {
        defaultLocale: 'en',           // Anglais par défaut
        locales: ['en', 'fr'],
        routing: {
            prefixDefaultLocale: false   // Anglais sans préfixe (/, /blog, /about)
        }
    },
    
    vite: {
        plugins: [tailwindcss()],
    },
    
    integrations: [sitemap()]
});
