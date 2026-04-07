import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  try {
    const context = getRequestContext(request);
    const body = await request.json();
    const targetLocale = body.targetLocale || 'ko-KR';
    const targetMarket = body.targetMarket || 'Global';
    
    const supabase = createServerSupabaseAdminClient();

    const { data: newBundle, error } = await supabase
      .from('publish_bundles')
      .insert({
        tenant_id: context.tenantId,
        status: 'published',
        target_locale: targetLocale,
        target_market: targetMarket,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create publish bundle: ${error.message}`);
    }

    // [Soft Publish] 
    // Next.js App Router의 Cache Invalidation을 통해 정적 페이지들을 최신화합니다.
    // 실무 환경에서는 스토어프론트 URL 도메인에 대한 웹훅을 날리거나 Redis 캐시를 초기화합니다.
    revalidatePath('/', 'layout');
    revalidateTag('ssot-content');

    return NextResponse.json({
      data: {
        bundleId: newBundle.id,
        status: newBundle.status,
      },
      meta: {
        requestId: context.requestId as string,
      }
    });

  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } },
      { status: isAuth ? 401 : 400 }
    );
  }
}
