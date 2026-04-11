import { StoreHeader } from '../../components/store/StoreHeader';

import { getTenantDesignConfig } from '../../lib/designConfig';
import { ThemeProvider } from '../../components/store/ThemeProvider';
import { AnalyticsProvider } from '../../components/store/AnalyticsProvider';

import { supabaseAdmin } from '../../lib/supabase';
import { resolveTenantId, resolveTenant } from '../../lib/tenant';

export const revalidate = 0;

export default async function TenantLayout(props: { children: React.ReactNode, params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const tenantSlug = params.tenantSlug;
  const designConfig = await getTenantDesignConfig(tenantSlug);
  const tenantName = designConfig.brand_name;

  const tenantData = await resolveTenant(tenantSlug);
  const tenantId = tenantData?.id;
  const industryType = tenantData?.industry_type || 'skincare';
  
  let iaNodes = null;
  if (tenantId) {
     const { data } = await supabaseAdmin.from('universal_content_assets').select('json_payload').eq('tenant_id', tenantId).eq('type', 'ia_config').single();
     if (data && data.json_payload?.nodes) {
         iaNodes = data.json_payload.nodes;
     }
  }

  return (
    <ThemeProvider config={designConfig} industryType={industryType}>
      {/* Global GNB Navigation for Storefront */}
      <StoreHeader tenantName={tenantName} tenantSlug={tenantSlug} customNodes={iaNodes} />
      
      {/* Analytics Provider (App-wide) */}
      {tenantId && <AnalyticsProvider tenantId={tenantId} />}

      {/* Page Content */}
      <div className="flex-1">
        {props.children}
      </div>
    </ThemeProvider>
  );
}
