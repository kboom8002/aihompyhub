import React from 'react';
import { notFound } from 'next/navigation';
import { ReadinessChecker } from '../../../components/store/ReadinessChecker';
import { resolveTenantId } from '../../../lib/tenant';
import { supabaseAdmin } from '../../../lib/supabase';
import { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(props: { params: Promise<{ tenantSlug: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `${params.tenantSlug.toUpperCase()} Consultation Readiness`,
    description: 'Verify your fit before booking a consultation.'
  };
}

export default async function TenantConsultationPage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;
  const { tenantSlug } = params;
  
  const tenantId = await resolveTenantId(tenantSlug);
  if (!tenantId) {
    notFound();
  }

  const { data: readinessRecords, error } = await supabaseAdmin
    .from('universal_content_assets')
    .select('json_payload')
    .eq('tenant_id', tenantId)
    .eq('type', 'readiness_checker')
    .eq('status', 'active')
    .limit(1);

  if (error || !readinessRecords || readinessRecords.length === 0) {
    return (
      <div className="p-24 text-center">
         <h1 className="text-2xl font-bold">진단/상담 페이지 준비중</h1>
         <p className="text-muted-foreground mt-4">사전 진단 매트릭스가 설정되지 않았습니다.</p>
      </div>
    );
  }

  const readinessData = readinessRecords[0].json_payload;

  // Handle parsing based on schema rules
  const parseList = (str: string) => {
     if (!str) return [];
     return str.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  };

  return (
    <main className="container mx-auto px-4 py-16 min-h-[70vh] bg-slate-50/50">
      <div className="text-center mb-12">
         <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Consultation & Readiness</h1>
         <p className="text-slate-600 font-medium">단순한 미팅이 아닌, 해결책을 찾는 프로젝트의 시작입니다.</p>
      </div>
      
      <ReadinessChecker 
        notFitCriteria={parseList(readinessData.not_fit || readinessData.not_fit_criteria)}
        prerequisites={parseList(readinessData.prerequisites)}
        expectedBudget={readinessData.expected_budget}
        brandName={tenantSlug.toUpperCase()}
      />
    </main>
  );
}
