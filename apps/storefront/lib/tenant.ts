import { supabaseAdmin } from './supabase';

export async function resolveTenantId(slug: string): Promise<string | null> {
  // 1. Mock MVP 매핑 (향후 tenants 테이블에 slug 컬럼이 추가되면 DB 연동)
  if (slug === 'dr-oracle') {
    return '00000000-0000-0000-0000-000000000001';
  }
  if (slug === 'vegan-root') {
    return '00000000-0000-0000-0000-000000000002';
  }
  
  // 2. 혹은 UUID가 직접 들어왔을 경우 검증
  if (slug.length === 36 && slug.includes('-')) {
    const { data } = await supabaseAdmin.from('tenants').select('id').eq('id', slug).single();
    if (data) return data.id;
  }
  
  return null;
}
