import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // In a real production app, you would fetch all active tenant Slugs from Supabase 
  // and map them into this array. 
  // For the MVP, we statically return the known live tenants.
  
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/skincare-brand`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/derma-core-labs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ];
}
