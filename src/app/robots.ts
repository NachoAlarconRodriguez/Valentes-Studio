import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = (headersList.get('host') || '').toLowerCase();

  let baseUrl = 'https://www.jeffersonlopes.cl';
  if (host.includes('valentes.cl')) {
    baseUrl = 'https://www.valentes.cl';
  } else if (host.includes('almabela.cl')) {
    baseUrl = 'https://www.almabela.cl';
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/reset-password'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
