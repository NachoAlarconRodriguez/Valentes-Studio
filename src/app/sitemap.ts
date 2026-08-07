import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = (headersList.get('host') || '').toLowerCase();

  let baseUrl = 'https://www.jeffersonlopes.cl';
  if (host.includes('valentes.cl')) {
    baseUrl = 'https://www.valentes.cl';
  } else if (host.includes('almabela.cl')) {
    baseUrl = 'https://www.almabela.cl';
  }

  const routes = ['', '/barberia', '/peluqueria', '/terapias', '/giftcards'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
