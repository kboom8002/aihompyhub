'use client';
import React, { useState, useEffect, useRef } from 'react';

export function ContentRelationMultiSelect({ 
  value = [], 
  onChange, 
  tenantId, 
  relationTarget 
}: { 
  value: string[], 
  onChange: (val: string[]) => void,
  tenantId: string,
  relationTarget: string
}) {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenantId || !relationTarget) return;
    
    // Fetch generic content based on relationTarget (which acts as type)
    // NOTE: Depending on your system structure, category might not be fixed to brand_ssot for everything,
    // but typically universal_content_assets fetch depends mostly on type matching.
    const url = `/api/v1/tenant/content?type=${relationTarget}`;
    
    fetch(url, { headers: { 'x-tenant-id': tenantId } })
      .then(res => res.json())
      .then(res => { 
          if (res.data) setItems(res.data); 
      })
      .catch(console.error);
  }, [tenantId, relationTarget]);

  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
      if (!value.includes(id)) onChange([...value, id]);
      setSearch('');
      setIsOpen(false);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter(v => v !== id));
  };

  const filtered = items.filter(t => !value.includes(t.id) && t.title.toLowerCase().includes(search.toLowerCase()));

  // Icon selector based on relation type for UI charm
  const getIcon = (type: string) => {
      switch(type) {
          case 'expert': return '🩺';
          case 'trust': return '🔬';
          case 'answer': return '💡';
          case 'topic_hub': return '📚';
          case 'creator': return '📸';
          case 'product': return '🛍️';
          case 'offer': return '🎁';
          default: return '🔗';
      }
  };
  const icon = getIcon(relationTarget);

  return (
      <div ref={wrapperRef} style={{ position: 'relative', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.75rem', background: 'white' }}>
          {value.length > 0 && (
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {value.map(id => {
                    const t = items.find(t => t.id === id);
                    return (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e2e8f0', padding: '6px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                           <span style={{ marginRight: '2px' }}>{icon}</span> <span>{t ? t.title : '불러오는 중...'}</span>
                           <button type="button" onClick={(e) => handleRemove(id, e)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', marginLeft: '4px' }}>✕</button>
                        </div>
                    )
                })}
             </div>
          )}
          <input 
             type="text" 
             value={search}
             onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
             onFocus={() => setIsOpen(true)}
             placeholder={`🔍 연결할 [${relationTarget}] 아이템을 검색하세요`}
             style={{ width: '100%', border: 'none', outline: 'none', padding: '0.25rem', fontSize: '0.9rem' }}
          />
          {isOpen && search && filtered.length > 0 && (
              <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', zIndex: 10, listStyle: 'none', margin: '4px 0 0', padding: 0, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                  {filtered.map(t => (
                      <li key={t.id} onClick={() => handleSelect(t.id)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#0f172a' }}>
                         {t.title}
                      </li>
                  ))}
              </ul>
          )}
          {isOpen && search && filtered.length === 0 && (
               <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', zIndex: 10, padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                  매칭되는 아이템이 없습니다.
               </div>
          )}
      </div>
  )
}
