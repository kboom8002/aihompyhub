import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { fetchPendingReviewTasks } from '@aihompyhub/database/repositories/reviews';
import type { QueryResponseDTO } from '@aihompyhub/database/dto/shared';

export async function GET(request: Request) {
  try {
    // 1. Guard (Auth & Context Extraction)
    const context = getRequestContext(request);

    // 2. Fetch Data from Repository
    const inboxItems = await fetchPendingReviewTasks(context.tenantId);

    // 3. Envelope formatting
    const response: QueryResponseDTO<any> = {
      data: {
        snapshotId: 'snap-reviewer-1',
        snapshotType: 'reviewer_home_snapshot',
        inbox: inboxItems
      },
      meta: {
        requestId: context.requestId || 'req-1',
        tenantId: context.tenantId,
        snapshotAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'PERMISSION_DENIED', message: err.message } }, { status: 401 });
  }
}
