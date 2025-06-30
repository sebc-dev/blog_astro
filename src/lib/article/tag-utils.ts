import type { CollectionEntry } from "astro:content";
import { getPostTag } from "./article-utils";

/**
 * Interface pour les traductions des tags
 */
export interface TagTranslations {
  guide: string;
  optimization: string;
  bestPractices: string;
  comparison: string;
}

/**
 * Extrait tous les tags uniques des articles
 * @param posts - Liste des articles
 * @param translations - Traductions des tags
 * @returns Liste des tags uniques (filtrés pour exclure undefined)
 */
export function getUniqueTags(
  posts: CollectionEntry<"blog">[],
  translations: TagTranslations,
): string[] {
  const tags = new Set<string>();

  posts.forEach((post) => {
    const tag = getPostTag(post, { translations });
    if (tag) {
      tags.add(tag);
    }
  });

  return Array.from(tags).sort();
}

/**
 * Filtre les articles par tag
 * @param posts - Liste des articles
 * @param tag - Tag à filtrer
 * @param translations - Traductions des tags
 * @returns Articles filtrés par tag
 */
export function filterPostsByTag(
  posts: CollectionEntry<"blog">[],
  tag: string,
  translations: TagTranslations,
): CollectionEntry<"blog">[] {
  return posts.filter((post) => {
    const postTag = getPostTag(post, { translations });
    return postTag === tag;
  });
}

/**
 * Normalise le nom de tag pour l'URL
 * @param tag - Nom du tag
 * @returns Nom normalisé pour l'URL
 */
export function normalizeTagForUrl(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[&/\\]/g, "-") // Remplacer &, /, \ par des tirets
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, "") // Supprimer les caractères non alphanumériques et non-tirets
    .replace(/-+/g, "-") // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, ""); // Supprimer les tirets en début et fin
}

/**
 * Dénormalise le nom de tag depuis l'URL
 * @param urlTag - Nom de tag depuis l'URL
 * @param availableTags - Tags disponibles
 * @returns Nom de tag correspondant ou null
 */
export function denormalizeTagFromUrl(
  urlTag: string,
  availableTags: string[],
): string | null {
  const normalized = urlTag.toLowerCase();

  return (
    availableTags.find(
      (tag) => normalizeTagForUrl(tag) === normalized,
    ) || null
  );
}