'use client';

import React, { useState } from 'react';
import { Globe, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { batchTranslateContentAction } from '@/app/actions/i18n-actions';

// Stub UI for triggering translation pipeline
export default function TenantI18nSettingsPage({
  params
}: {
  params: { tenantId: string }
}) {
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, 'success' | 'error' | null>>({});

  const MOCK_RECORDS_TO_TRANSLATE = [
    { id: 'REC-001', title: '브랜드 핵심 가치 (Brand Hero)', table: 'universal_content_assets' as 'universal_content_assets', fields: { "title": "맞춤형 프리미엄 케어" } },
    { id: 'REC-002', title: '인기 질문 1 (QA)', table: 'answer_cards' as 'answer_cards', fields: { "title": "비용은 어떻게 되나요?", "content": "프리미엄 케어는 10만원부터 시작합니다." } }
  ];

  const handleTranslate = async (recordId: string, table: 'topics' | 'answer_cards' | 'universal_content_assets' | 'brand_profiles', fields: Record<string, string>) => {
    setTranslating(prev => ({ ...prev, [recordId]: true }));
    setResults(prev => ({ ...prev, [recordId]: null }));

    const res = await batchTranslateContentAction(params.tenantId, table, recordId, fields);
    
    setTranslating(prev => ({ ...prev, [recordId]: false }));
    setResults(prev => ({ ...prev, [recordId]: res.success ? 'success' : 'error' }));
  };

  return (
    <div className="p-6 max-w-4xl font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold text-slate-800">다국어 배포 관리 (Localization)</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">SSoT 다국어 번역 (Gemini AI Batch)</h2>
        <p className="text-sm text-slate-500 mb-6">
          SSoT 자산의 변경사항을 EN, JA 등 글로벌 타겟 언어로 실시간 번역하여 Storefront에 배포합니다.
        </p>

        <div className="space-y-4">
          {MOCK_RECORDS_TO_TRANSLATE.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors">
              <div>
                <p className="font-bold text-slate-800 text-sm">{record.title}</p>
                <div className="flex gap-2 mt-1 opacity-60 text-xs text-slate-500 font-mono">
                  <span>ID: {record.id}</span>
                  <span>Table: {record.table}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {results[record.id] === 'success' && <CheckCircle className="text-green-500" size={20} />}
                {results[record.id] === 'error' && <AlertCircle className="text-red-500" size={20} />}
                
                <button
                  onClick={() => handleTranslate(record.id, record.table, record.fields)}
                  disabled={translating[record.id]}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {translating[record.id] ? <RefreshCw className="animate-spin" size={16} /> : <Globe size={16} />}
                  EN/JA 번역 배포
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
