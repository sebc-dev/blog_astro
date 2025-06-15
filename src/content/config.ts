import { defineCollection, z } from 'astro:content';

// Regex pour valider le format slug : lettres minuscules, chiffres, traits d'union
// Commence et finit par un caractère alphanumérique, peut contenir des traits d'union au milieu
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Store pour tracking des translationId utilisés (pour validation d'unicité)
const usedTranslationIds = new Set<string>();

// Fonction de validation personnalisée pour l'unicité des translationId
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateUniqueTranslationId = (id: string): boolean => {
  if (usedTranslationIds.has(id)) {
    throw new Error(`Translation ID "${id}" is already used. Each translationId must be unique across the collection.`);
  }
  usedTranslationIds.add(id);
  return true;
};

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    lang: z.enum(['en', 'fr']),
    translationId: z.string()
      .uuid()
      .refine(validateUniqueTranslationId, {
        message: 'translationId must be unique within the collection',
      }),
    canonicalSlug: z.string().regex(SLUG_REGEX, {
      message:
        'canonicalSlug invalide : minuscules, chiffres, tirets, sans tiret en début/fin ni double tiret',
    }),
    heroImage: z.string().optional(),
  })
});

export const collections = { blog: blogCollection }; 