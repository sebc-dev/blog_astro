import { defineCollection, z } from "astro:content";
import { SLUG_REGEX } from "../lib/content/validate-content-utils";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    lang: z.enum(["en", "fr"]),
    translationId: z.string().uuid(),
    canonicalSlug: z.string().regex(SLUG_REGEX, {
      message:
        "canonicalSlug invalide : minuscules, chiffres, tirets, sans tiret en début/fin ni double tiret",
    }),
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog: blogCollection };
