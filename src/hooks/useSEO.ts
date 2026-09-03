import { useEffect } from 'react';
import { SEOProps, updateDocumentSEO } from '../utils/seo';

/**
 * Custom hook to dynamically manage document head metadata,
 * Open Graph, Twitter Cards, canonical link, Google Search Console, and Schema.org structured data.
 */
export function useSEO(props: SEOProps) {
  const {
    title,
    description,
    canonicalPath,
    ogType,
    ogImage,
    noindex,
    product,
    category,
    breadcrumbs,
  } = props;

  useEffect(() => {
    if (!title && !description) return;
    updateDocumentSEO({
      title,
      description,
      canonicalPath,
      ogType,
      ogImage,
      noindex,
      product,
      category,
      breadcrumbs,
    });
  }, [
    title,
    description,
    canonicalPath,
    ogType,
    ogImage,
    noindex,
    product,
    category,
    breadcrumbs,
  ]);
}
