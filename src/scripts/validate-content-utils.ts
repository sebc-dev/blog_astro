// Types pour la validation
export interface BlogPost {
  collection: string;
  id: string;
  data: {
    translationId: string;
    canonicalSlug: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Regex pour valider le format slug : lettres minuscules, chiffres, traits d'union
 * Commence et finit par un caractère alphanumérique, peut contenir des traits d'union au milieu
 */
export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Valide l'unicité des translationId
 */
export function validateTranslationIdUniqueness(posts: BlogPost[]): ValidationResult {
  const translationIds = new Map<string, string[]>();
  
  // Grouper les posts par translationId
  posts.forEach(post => {
    const { translationId } = post.data;
    const postPath = `${post.collection}/${post.id}`;
    
    if (!translationIds.has(translationId)) {
      translationIds.set(translationId, []);
    }
    translationIds.get(translationId)!.push(postPath);
  });
  
  // Identifier les doublons (plus de 2 traductions)
  const errors: string[] = [];
  for (const [translationId, paths] of translationIds.entries()) {
    if (paths.length > 2) {
      errors.push(`translationId "${translationId}" found in ${paths.length} posts: ${paths.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide le format des canonicalSlug
 */
export function validateCanonicalSlugs(posts: BlogPost[]): ValidationResult {
  const errors: string[] = [];
  
  posts.forEach(post => {
    const { canonicalSlug } = post.data;
    const postPath = `${post.collection}/${post.id}`;
    
    if (!canonicalSlug || canonicalSlug.trim().length === 0) {
      errors.push(`Empty canonicalSlug in ${postPath}`);
    } else if (!SLUG_REGEX.test(canonicalSlug)) {
      errors.push(`Invalid canonicalSlug "${canonicalSlug}" in ${postPath}: must be lowercase letters, numbers, and hyphens only`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Exécute toutes les validations sur une liste de posts
 */
export function validateAllContent(posts: BlogPost[]): { 
  isValid: boolean;
  translationResult: ValidationResult;
  slugResult: ValidationResult;
} {
  const translationResult = validateTranslationIdUniqueness(posts);
  const slugResult = validateCanonicalSlugs(posts);
  
  return {
    isValid: translationResult.isValid && slugResult.isValid,
    translationResult,
    slugResult
  };
} 