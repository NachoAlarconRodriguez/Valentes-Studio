import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/reset-password'],
    },
    sitemap: [
      'https://www.valentes.cl/sitemap.xml',
      'https://www.almabela.cl/sitemap.xml',
      'https://www.jeffersonlopes.cl/sitemap.xml',
    ],
  };
}
