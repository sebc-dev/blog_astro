import { defineCollection, z } from "astro:content";
import { SLUG_REGEX } from "../scripts/validate-content-utils";

// Store pour tracking des translationId utilisés (pour validation d'unicité)
const usedTranslationIds = new Set<string>();

// Fonction pour réinitialiser le cache des translationId (utile pour les tests et dev HMR)
export const resetTranslationIdCache = (): void => {
  usedTranslationIds.clear();
};

// Fonction de validation personnalisée pour l'unicité des translationId
const validateUniqueTranslationId = (id: string): boolean => {
  if (usedTranslationIds.has(id)) {
    return false;
  }
  usedTranslationIds.add(id);
  return true;
};

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    lang: z.enum(["en", "fr"]),
    translationId: z.string().uuid().refine(validateUniqueTranslationId, {
      message: "translationId must be unique within the collection",
    }),
    canonicalSlug: z.string().regex(SLUG_REGEX, {
      message:
        "canonicalSlug invalide : minuscules, chiffres, tirets, sans tiret en début/fin ni double tiret",
    }),
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog: blogCollection };
