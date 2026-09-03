#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');

// Site URL configuration
const DEFAULT_SITE_URL = process.env.VITE_SITE_URL || 'https://proseguranca.co.mz';
const cleanBaseUrl = DEFAULT_SITE_URL.replace(/\/+$/, '');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Function to extract items from TypeScript files without heavy external loaders
function parseData() {
  const productsFile = path.resolve(rootDir, 'src/data/products.ts');
  const categoriesFile = path.resolve(rootDir, 'src/data/categories.ts');

  const productsContent = fs.readFileSync(productsFile, 'utf-8');
  const categoriesContent = fs.readFileSync(categoriesFile, 'utf-8');

  // Extract products
  const products = [];
  const productMatches = productsContent.matchAll(/id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],(?:[\s\S]*?)image:\s*['"]([^'"]+)['"]/g);
  for (const match of productMatches) {
    products.push({
      id: match[1],
      name: match[2],
      image: match[3],
    });
  }

  // Extract categories
  const categories = [];
  const categoryMatches = categoriesContent.matchAll(/id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],(?:[\s\S]*?)slug:\s*['"]([^'"]+)['"],(?:[\s\S]*?)image:\s*['"]([^'"]+)['"]/g);
  for (const match of categoryMatches) {
    categories.push({
      id: match[1],
      name: match[2],
      slug: match[3],
      image: match[4],
    });
  }

  return { products, categories };
}

function buildSitemap(products, categories) {
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

  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${cleanBaseUrl}${page.path === '/' ? '' : page.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${cleanBaseUrl}/categoria/${cat.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (cat.image) {
      const imgUrl = cat.image.startsWith('http') ? cat.image : `${cleanBaseUrl}${cat.image}`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(cat.name)}</image:title>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  for (const prod of products) {
    xml += `  <url>\n`;
    xml += `    <loc>${cleanBaseUrl}/produto/${prod.id}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    if (prod.image) {
      const imgUrl = prod.image.startsWith('http') ? prod.image : `${cleanBaseUrl}${prod.image}`;
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

function buildRobots() {
  return `# robots.txt para ProSegurança (https://proseguranca.co.mz)
# Rastreamento público liberado para mecanismos de pesquisa
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

# Bloqueio estrito de áreas privadas e administrativas
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

# Localização oficial do Sitemap
Sitemap: ${cleanBaseUrl}/sitemap.xml
`;
}

try {
  const { products, categories } = parseData();
  console.log(`Parsed ${products.length} products and ${categories.length} categories for SEO.`);

  const sitemapXml = buildSitemap(products, categories);
  fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`Successfully generated public/sitemap.xml (${(sitemapXml.length / 1024).toFixed(1)} KB).`);

  const robotsTxt = buildRobots();
  fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('Successfully generated public/robots.txt.');
} catch (err) {
  console.error('Error generating SEO artifacts:', err);
  process.exit(1);
}
