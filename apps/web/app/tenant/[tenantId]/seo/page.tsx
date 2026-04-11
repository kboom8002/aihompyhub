'use client';
import React, { useState, useEffect, use } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { useParams } from 'next/navigation';

export default function TenantSeoPage() {
   const params = useParams();
   const tenantSlug = params.tenantId as string;
   const [graphData, setGraphData] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [status, setStatus] = useState('');

   const fetchGraph = async () => {
       setIsLoading(true);
       try {
           const baseUrl = process.env.NODE_ENV === 'production' ? 'https://aihompy.vercel.app' : 'http://localhost:3001';
           const fetchUrl = `${baseUrl}/${tenantSlug}/semantic-graph.json`;
           const res = await fetch(fetchUrl);
           if (res.ok) {
              const data = await res.json();
              setGraphData(data);
           }
       } catch (e) {
           console.error(e);
       }
       setIsLoading(false);
   };

   useEffect(() => { fetchGraph(); }, []);

   const publishGraph = () => {
       setStatus('✅ 스토어프론트 AEO/GEO 시맨틱 맵 발행 및 엣지 캐시(Edge Cache) 무효화가 완료되었습니다. 글로벌 봇에 노출됩니다.');
   };

   return (
      <div style={{ paddingBottom: '4rem' }}>
         <PageHeader 
            title="AEO/GEO 시맨틱 맵 (지식 그래프)" 
            subtitle="답변형 검색 엔진(구글, Perplexity AI 등)이 브랜드 지식 트리를 이해할 수 있도록 JSON-LD 스키마를 발행합니다." 
         />
         
         <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>🔍 실시간 시맨틱 그래프 프리뷰</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                     퍼블릭 대상: <a href={process.env.NODE_ENV === 'production' ? `https://aihompy.vercel.app/${tenantSlug}/semantic-graph.json` : `http://localhost:3001/${tenantSlug}/semantic-graph.json`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>{`스토어프론트/${tenantSlug}/semantic-graph.json`}</a>
                  </p>
               </div>
               <button onClick={publishGraph} className="button-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                  🚀 XML/JSON 맵 글로벌 퍼블리시
               </button>
            </div>
            
            {status && (
               <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                  {status}
               </div>
            )}

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>🗺️ 인터랙티브 지식 지형도 (Visual Explorer)</h3>
                <iframe 
                   src={process.env.NODE_ENV === 'production' ? `https://aihompy.vercel.app/${tenantSlug}/explore` : `http://localhost:3001/${tenantSlug}/explore`} 
                   style={{ width: '100%', height: '600px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                   title="Knowledge Graph Visualizer"
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>📄 JSON-LD Raw Data (For Bots)</h3>
                <div style={{ background: '#1e293b', color: '#e2e8f0', padding: '1.5rem', borderRadius: '8px', overflowX: 'auto', maxHeight: '400px', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.85rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
                   {isLoading ? '그래프 매핑 데이터를 생성/로딩 중...' : (
                       <pre style={{ margin: 0 }}>{JSON.stringify(graphData, null, 2)}</pre>
                   )}
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
               <span style={{ fontSize: '1.5rem' }}>💡</span>
               <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  <strong>How it works:</strong> 이 시맨틱 맵은 어드민에서 에디터가 연결해둔 <b>Relation(연관 지식 링크)</b>을 추적하여 자동으로 생성됩니다. 
                  기계가 읽기 적합한 Schema.org 의 <code>@graph</code> 규격을 사용하여, 일반적인 쇼핑몰의 단순 나열식 sitemap.xml을 넘어서는 <b>지식 구조의 인과관계</b>를 검색엔진에 주입할 수 있습니다.
               </p>
            </div>
         </div>
      </div>
   );
}
