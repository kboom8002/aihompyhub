import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // API 라우팅 크롤링 방지
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
