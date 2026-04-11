import { MetadataRoute } from 'next';
import { supabaseAdmin } from '../lib/supabase';

export const revalidate = 3600; // Cache the sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  // Fetch all active tenants
  const { data: tenants } = await supabaseAdmin.from('tenants').select('slug, updated_at, created_at');
  
  if (tenants) {
    for (const tenant of tenants) {
      // Add tenant homepage
      routes.push({
        url: `${baseUrl}/${tenant.slug}`,
        lastModified: new Date(tenant.updated_at || tenant.created_at || new Date()),
        changeFrequency: 'daily',
        priority: 0.9,
      });

      // Add tenant answers index
      routes.push({
        url: `${baseUrl}/${tenant.slug}/answers`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });

      const { resolveTenantId } = await import('../lib/tenant');
      const tenantId = await resolveTenantId(tenant.slug);

      if (tenantId) {
        // Fetch answer cards for the tenant
        const { data: answerCards } = await supabaseAdmin
          .from('answer_cards')
          .select('id, updated_at, created_at')
          .eq('tenant_id', tenantId);

        if (answerCards) {
          for (const card of answerCards) {
            routes.push({
              url: `${baseUrl}/${tenant.slug}/answers/${card.id}`,
              lastModified: new Date(card.updated_at || card.created_at || new Date()),
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        }

        // Fetch universal content assets of type answer
        const { data: assets } = await supabaseAdmin
          .from('universal_content_assets')
          .select('id, updated_at, created_at')
          .eq('tenant_id', tenantId)
          .eq('type', 'answer');
        
        if (assets) {
          for (const asset of assets) {
            routes.push({
               url: `${baseUrl}/${tenant.slug}/answers/${asset.id}`,
               lastModified: new Date(asset.updated_at || asset.created_at || new Date()),
               changeFrequency: 'weekly',
               priority: 0.7,
            });
          }
        }

        // Add expert routes
        routes.push({
          url: `${baseUrl}/${tenant.slug}/trust/experts`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });

        const { data: experts } = await supabaseAdmin
          .from('universal_content_assets')
          .select('id, updated_at, created_at')
          .eq('tenant_id', tenantId)
          .eq('type', 'expert');

        if (experts) {
          for (const expert of experts) {
            routes.push({
               url: `${baseUrl}/${tenant.slug}/trust/experts/${expert.id}`,
               lastModified: new Date(expert.updated_at || expert.created_at || new Date()),
               changeFrequency: 'weekly',
               priority: 0.8,
            });
          }
        }
      }
    }
  }

  return routes;
}
