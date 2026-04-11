import React from 'react';
import { Metadata } from 'next';
import KnowledgeGraphRenderer from '../../../components/store/KnowledgeGraphRenderer';

export const metadata: Metadata = {
  title: 'Brand Knowledge Graph Explorer | SSoT',
  description: 'Explore the interconnected semantic web of our brand\'s trusted knowledge, clinical evidences, and experts.',
};

export default async function ExplorePage(props: { params: Promise<{ tenantSlug: string }> }) {
  const params = await props.params;

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="mb-8">
         <h1 className="text-3xl font-bold font-[family-name:var(--theme-font)] text-[var(--theme-text)] tracking-tight mb-2">
            지식 지형도 (Knowledge Graph Explorer)
         </h1>
         <p className="text-gray-500 font-medium">
            공식 답변, 뷰티 루틴, 신뢰 근거, 검수 전문가들이 유기적으로 얽혀있는 우리 브랜드만의 시맨틱 지식 생태계를 탐험해보세요.
         </p>
      </div>

      <div className="w-full relative shadow-sm border border-gray-200 rounded-xl overflow-hidden min-h-[600px] h-[80vh]">
         {/* Server component providing base URL to client component */}
         <KnowledgeGraphRenderer 
            tenantSlug={params.tenantSlug} 
            apiEndpoint={`/api/v1/storefront/knowledge-graph?tenantSlug=${params.tenantSlug}`}
         />
      </div>
    </div>
  );
}
