import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const domains = [
    'https://www.valentes.cl',
    'https://www.almabela.cl',
    'https://www.jeffersonlopes.cl'
  ];
  const routes = ['', '/barberia', '/peluqueria', '/terapias', '/giftcards'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const domain of domains) {
    for (const route of routes) {
      sitemapEntries.push({
        url: `${domain}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  return sitemapEntries;
}
