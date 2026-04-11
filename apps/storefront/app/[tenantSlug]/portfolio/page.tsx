import { notFound } from 'next/navigation';
import { resolveTenantId } from '../../../lib/tenant';
import { supabaseAdmin } from '../../../lib/supabase';
import { PortfolioCard } from '../../../components/store/PortfolioCard';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(props: { params: Promise<{ tenantSlug: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `${params.tenantSlug.toUpperCase()} Portfolio & Cases`,
    description: 'Expert Case Studies & Records'
  };
}

export default async function TenantPortfolioPage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const { tenantSlug } = params;
  
  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    notFound();
  }

  // Fetch the brand profile for industry check
  const { data: dbBrandProfile } = await supabaseAdmin.from('brand_profiles').select('industry_type').eq('tenant_id', tenantId).single();
  const industryType = dbBrandProfile?.industry_type || 'skincare';

  // Fetch only portfolio assets
  const { data: portfolios, error } = await supabaseAdmin
    .from('universal_content_assets')
    .select('id, title, json_payload')
    .eq('tenant_id', tenantId)
    .eq('type', 'portfolio')
    .eq('status', 'active');

  if (error || !portfolios || portfolios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4 tracking-tight text-slate-800">No Portfolios Found</h1>
        <p className="text-slate-500 max-w-lg mx-auto">This tenant has not published any records or case studies yet.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
          {industryType === 'clinic' ? '치료/시술 레퍼런스' : industryType === 'real_estate' ? '거래 성공 사례' : 'Best Practice & Case Studies'}
        </h1>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          문제 해결의 본질에 집중한 구체적인 성과와 도입 효과를 먼저 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolios.map((item: any) => (
          <PortfolioCard key={item.id} portfolio={item} tenantSlug={tenantSlug} industryType={industryType} />
        ))}
      </div>
    </main>
  );
}
