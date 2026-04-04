import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import type { StudioAssistSnapshotDTO, GenerationOutputDTO, GeneratorRunDTO, PromptVersionDTO } from '@aihompyhub/database/dto/generator';
import type { SnapshotEnvelopeDTO } from '@aihompyhub/database/dto/shared';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);

    // Mock Payload for Assist UI
    const snapshotData: SnapshotEnvelopeDTO<StudioAssistSnapshotDTO> = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'studio_assist_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: context.tenantId },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        availableRuns: [
          {
            id: 'run-1111',
            runType: 'brand_foundation',
            status: 'completed',
            inputPackHash: 'hash-abc',
            rawInputState: {},
            promptVersion: {
              id: 'pv-001',
              registryId: 'reg-001',
              versionTag: 'v1.2.0',
              status: 'active'
            }
          },
          {
            id: 'run-3333',
            runType: 'content_draft',
            status: 'completed',
            inputPackHash: 'hash-answer',
            rawInputState: { question: "Is it safe?" },
            promptVersion: {
              id: 'pv-002',
              registryId: 'reg-002',
              versionTag: 'v2.0.0',
              status: 'active'
            }
          },
          {
            id: 'run-4444',
            runType: 'content_draft',
            status: 'blocked_missing_inputs',
            inputPackHash: 'hash-fail',
            rawInputState: { question: "Unknown ingredient" },
            promptVersion: {
              id: 'pv-002',
              registryId: 'reg-002',
              versionTag: 'v2.0.0',
              status: 'active'
            }
          },
          {
            id: 'run-5555',
            runType: 'content_draft',
            status: 'failed',
            inputPackHash: 'hash-routine-fail',
            rawInputState: { skinType: "Oily" },
            promptVersion: {
              id: 'pv-003',
              registryId: 'reg-003',
              versionTag: 'v1.0.0',
              status: 'active'
            }
          },
          {
            id: 'run-6666',
            runType: 'content_draft',
            status: 'completed',
            inputPackHash: 'hash-compare',
            rawInputState: { productA: "Retinol", productB: "Bakuchiol" },
            promptVersion: {
              id: 'pv-001',
              registryId: 'reg-001',
              versionTag: 'v1.0.0',
              status: 'active'
            }
          }
        ],
        pendingOutputs: [
          {
            id: 'out-8888',
            runId: 'run-1111',
            targetObjectType: 'BrandFoundation',
            acceptanceStatus: 'pending',
            proposedContent: {
              positioningSummary: "Ultra-premium vegan skincare focusing on clinical anti-aging outcomes without irritation.",
              brandVoice: "Authoritative, Clinical, Minimalist"
            },
            trustPlaceholders: []
          },
          {
            id: 'out-9999',
            runId: 'run-3333',
            targetObjectType: 'AnswerCard',
            acceptanceStatus: 'pending',
            proposedContent: {
              answerBody: "Yes, our formulation uses bakuchiol, providing similar anti-aging benefits without the typical irritation.",
              supportingClaims: ["Dermatologist tested", "Plan-based"]
            },
            trustPlaceholders: [{ type: 'dermatologist_review', required: true, hint: 'Review needed for sensitive claims.' }]
          },
          {
            id: 'out-6666',
            runId: 'run-6666',
            targetObjectType: 'AnswerCard', // Reusing target filter AnswerCard so it shows up in Content Studio
            acceptanceStatus: 'pending',
            proposedContent: {
              type: 'CompareDraft',
              comparison: "While Retinol is stronger, Bakuchiol offers 80% similar results with 0% irritation. Ideal for sensitive barriers."
            },
            trustPlaceholders: []
          }
        ],
        suggestedPromptVersions: [
          {
            id: 'pv-001',
            registryId: 'reg-001',
            versionTag: 'v1.2.0',
            status: 'active'
          }
        ],
        actions: []
      }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } },
      { status: isAuth ? 401 : 400 }
    );
  }
}
