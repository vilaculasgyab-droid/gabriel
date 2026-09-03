import { Category, Product } from '../types';
import { ADDRESS_DISPLAY, EMAIL_DISPLAY, WHATSAPP_PHONE_DISPLAY } from './whatsapp';

/**
 * Production Site URL configuration
 * Defaults to the official ProSegurança domain or can be customized via VITE_SITE_URL.
 * In browser environments, if VITE_SITE_URL is not provided and the app is running on a live host,
 * it can adapt to window.location.origin while avoiding localhost in production.
 */
export const DEFAULT_PRODUCTION_URL = 'https://proseguranca.co.mz';

export function getSiteUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin;
    }
  }
  return DEFAULT_PRODUCTION_URL;
}

/**
 * Google Search Console Verification Code
 * Configured via VITE_GOOGLE_SITE_VERIFICATION environment variable.
 * Does NOT inject fake codes if not configured.
 */
export function getGoogleSiteVerification(): string | undefined {
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_GOOGLE_SITE_VERIFICATION &&
    import.meta.env.VITE_GOOGLE_SITE_VERIFICATION.trim() !== ''
  ) {
    return import.meta.env.VITE_GOOGLE_SITE_VERIFICATION.trim();
  }
  return undefined;
}

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  product?: Product;
  category?: Category;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

/**
 * Generates absolute canonical URL
 */
export function getCanonicalUrl(path = '/'): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Normalize trailing slashes (except root)
  const normalizedPath = cleanPath === '/' ? '' : cleanPath.replace(/\/+$/, '');
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Schema.org: Organization / Store / LocalBusiness
 */
export function buildStoreSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${baseUrl}/#store`,
    name: 'ProSegurança',
    alternateName: 'ProSegurança Moçambique - EPIs e Segurança no Trabalho',
    url: baseUrl,
    logo: `${baseUrl}/pwa-512x512.png`,
    image: `${baseUrl}/pwa-512x512.png`,
    description:
      'Loja especializada em Equipamentos de Proteção Individual (EPI) e segurança profissional em Moçambique. Fornecimento de capacetes, luvas, calçado de segurança, óculos e proteção respiratória.',
    telephone: '+258846159254',
    email: EMAIL_DISPLAY,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mozal',
      addressLocality: 'Boane',
      addressRegion: 'Maputo',
      addressCountry: 'MZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -25.9083,
      longitude: 32.4089,
    },
    currenciesAccepted: 'MZN',
    paymentAccepted: 'M-Pesa, e-Mola, Transferência Bancária, Pagamento na Entrega',
    priceRange: 'MZN',
    areaServed: [
      {
        '@type': 'Country',
        name: 'Moçambique',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Maputo',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Matola',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Boane',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+258846159254',
      contactType: 'customer service',
      areaServed: 'MZ',
      availableLanguage: ['Portuguese', 'English'],
    },
  };
}

/**
 * Schema.org: WebSite with SearchAction
 */
export function buildWebSiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'ProSegurança',
    description: 'Equipamentos de Proteção Individual e Segurança no Trabalho em Moçambique',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/produtos?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'pt-MZ',
  };
}

/**
 * Schema.org: Product
 * Uses real product information. Does NOT include fake ratings or aggregateRating.
 */
export function buildProductSchema(product: Product, baseUrl: string) {
  const productUrl = `${baseUrl}/produto/${product.id}`;
  const imageUrl = product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    image: [imageUrl],
    description: product.shortDescription || product.description,
    sku: product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'ProSegurança',
    },
    category: product.categoryName,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'MZN',
      price: product.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Store',
        name: 'ProSegurança',
      },
      areaServed: 'Moçambique',
    },
  };
}

/**
 * Schema.org: BreadcrumbList
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

/**
 * Helper to dynamically inject or update a meta tag in document.head
 */
function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string | undefined) {
  if (typeof document === 'undefined') return;

  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;

  if (!content) {
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update canonical link in document.head
 */
function setCanonical(url: string) {
  if (typeof document === 'undefined') return;

  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Helper to inject/update JSON-LD script tags
 */
function setJsonLd(id: string, data: object | null) {
  if (typeof document === 'undefined') return;

  let script = document.getElementById(id) as HTMLScriptElement | null;

  if (!data) {
    if (script) {
      script.remove();
    }
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Apply complete SEO settings to the active document
 */
export function updateDocumentSEO(props: SEOProps) {
  if (typeof document === 'undefined') return;

  const baseUrl = getSiteUrl();
  const canonicalPath = props.canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = getCanonicalUrl(canonicalPath);

  // 1. Title
  const title = props.title || 'ProSegurança | Equipamentos de Segurança e EPI em Moçambique';
  document.title = title;

  // 2. Meta Description
  const description =
    props.description ||
    'Loja especializada em Equipamentos de Proteção Individual (EPIs) em Moçambique. Capacetes, luvas anticorte, calçado de segurança, óculos e proteção respiratória com pedidos via WhatsApp.';
  setMetaTag('name', 'description', description);

  // 3. Robots meta tag
  const robotsValue = props.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  setMetaTag('name', 'robots', robotsValue);
  setMetaTag('name', 'googlebot', robotsValue);

  // 4. Canonical
  setCanonical(canonicalUrl);

  // 5. Open Graph
  const ogType = props.ogType || (props.product ? 'product' : 'website');
  const ogImage = props.ogImage || (props.product?.image ? `${baseUrl}${props.product.image}` : `${baseUrl}/pwa-512x512.png`);

  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:site_name', 'ProSegurança');
  setMetaTag('property', 'og:locale', 'pt_MZ');
  setMetaTag('property', 'og:image', ogImage);

  // 6. Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', ogImage);

  // 7. Google Site Verification
  const verificationCode = getGoogleSiteVerification();
  if (verificationCode) {
    setMetaTag('name', 'google-site-verification', verificationCode);
  }

  // 8. Structured Data (JSON-LD)
  // Store Schema & Website Schema
  setJsonLd('schema-store', buildStoreSchema(baseUrl));
  setJsonLd('schema-website', buildWebSiteSchema(baseUrl));

  // Product Schema
  if (props.product) {
    setJsonLd('schema-product', buildProductSchema(props.product, baseUrl));
  } else {
    setJsonLd('schema-product', null);
  }

  // Breadcrumbs Schema
  if (props.breadcrumbs && props.breadcrumbs.length > 0) {
    setJsonLd('schema-breadcrumbs', buildBreadcrumbSchema(props.breadcrumbs, baseUrl));
  } else {
    setJsonLd('schema-breadcrumbs', null);
  }
}

/**
 * Generates XML Sitemap content from real products and categories
 */
export function generateSitemapXml(
  products: Product[],
  categories: Category[],
  baseUrl = DEFAULT_PRODUCTION_URL
): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/produtos', priority: '0.9', changefreq: 'daily' },
    { path: '/categorias', priority: '0.8', changefreq: 'weekly' },
    { path: '/sobre-nos', priority: '0.7', changefreq: 'monthly' },
    { path: '/vantagens', priority: '0.7', changefreq: 'monthly' },
    { path: '/contactos', priority: '0.8', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Static institutional pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path === '/' ? '' : page.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Categories
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/categoria/${cat.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (cat.image) {
      const imgUrl = cat.image.startsWith('http') ? cat.image : `${baseUrl}${cat.image}`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(cat.name)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  // Products
  for (const prod of products) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/produto/${prod.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    if (prod.image) {
      const imgUrl = prod.image.startsWith('http') ? prod.image : `${baseUrl}${prod.image}`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(prod.name)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

/**
 * Generates Robots.txt content
 */
export function generateRobotsTxt(baseUrl = DEFAULT_PRODUCTION_URL): string {
  return `# robots.txt para ProSegurança (https://proseguranca.co.mz)
# Permitir rastreamento das páginas e produtos públicos
User-agent: *
Allow: /
Allow: /produtos
Allow: /produto/
Allow: /categoria/
Allow: /categorias
Allow: /sobre-nos
Allow: /vantagens
Allow: /contactos
Allow: /assets/
Allow: /products/
Allow: /manifest.webmanifest
Allow: /favicon.svg
Allow: /favicon.png
Allow: /pwa-192x192.png
Allow: /pwa-512x512.png

# Bloquear áreas privadas, administrativas e de carrinho
Disallow: /admin
Disallow: /admin/
Disallow: /carrinho
Disallow: /checkout
Disallow: /pedidos
Disallow: /login
Disallow: /dashboard

# Googlebot específico
User-agent: Googlebot
Allow: /
Allow: /produtos
Allow: /produto/
Allow: /categoria/
Allow: /categorias
Allow: /sobre-nos
Allow: /vantagens
Allow: /contactos
Allow: /assets/
Allow: /products/
Disallow: /admin
Disallow: /admin/
Disallow: /carrinho
Disallow: /checkout
Disallow: /pedidos

# Sitemap oficial
Sitemap: ${baseUrl}/sitemap.xml
`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
