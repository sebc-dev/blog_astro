import type { UrlMapper, PageInfo, TagPageInfo } from "../page-detectors/types";
import { isTagPageInfo } from "../page-detectors/types";
import { normalizeTagForUrl } from "@/lib/article/tag-utils";

/**
 * Mapper d'URLs pour les pages de tags
 * Crée les URLs correspondantes dans toutes les langues
 */
export class TagMapper implements UrlMapper {
  readonly pageType = "tag" as const;

  createUrlMapping(pageInfo: PageInfo): Record<string, string> | null {
    if (!isTagPageInfo(pageInfo)) {
      return null;
    }

    const tagPageInfo = pageInfo as TagPageInfo;
    const normalizedTag = normalizeTagForUrl(tagPageInfo.tag);

    return {
      en: `/tag/${normalizedTag}`,
      fr: `/fr/tag/${normalizedTag}`,
    };
  }
}