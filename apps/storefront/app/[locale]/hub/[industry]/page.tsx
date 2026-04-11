import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import HubMatchmakingClient from './HubMatchmakingClient';

export default async function VerticalHubPage(props: { params: Promise<{ locale: string, industry: string }> }) {
  const params = await props.params;
  const { locale = 'ko', industry } = params;

  // Verify the industry pod exists or has active tenants
  const { data: tenants, error } = await supabaseAdmin
    .from('tenants')
    .select('id, slug, industry_type')
    .eq('industry_type', industry)
    .limit(10);

  if (error || !tenants || tenants.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 px-4 py-12 md:py-24 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-neutral-900 capitalize">
            {industry.replace('-', ' ')} <span className="text-emerald-600">Shared Hub</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {t(locale, '고민별 상황별 최적의 솔루션을 제안합니다.')} <br/>
            어떤 도움이 필요하신가요? 질문을 남기면 AI가 가장 적합한 브랜드와 전문가를 매칭해 드립니다.
          </p>
        </header>

        <HubMatchmakingClient locale={locale} industry={industry} />

      </div>
    </div>
  );
}
