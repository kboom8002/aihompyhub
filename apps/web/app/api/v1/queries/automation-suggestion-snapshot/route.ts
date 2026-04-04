import { NextResponse } from 'next/server';
import { getRequestContext } from '@aihompyhub/database/auth';
import { createServerSupabaseAdminClient } from '@aihompyhub/database/server';
import type { AutomationSuggestionSnapshotDTO } from '@aihompyhub/database/dto/automation';

export async function GET(request: Request) {
  try {
    const context = getRequestContext(request);
    const supabase = createServerSupabaseAdminClient();

    // Fetch related tables to construct the suggestion array manually to avoid strict explicit foreign key dependencies in JS
    const [
      { data: suggestions, error: errS },
      { data: bundles, error: errB },
      { data: policies, error: errP }
    ] = await Promise.all([
      supabase.from('automation_suggestions').select('*').order('created_at', { ascending: false }),
      supabase.from('operator_action_bundles').select('*'),
      supabase.from('automation_policy_guards').select('*')
    ]);

    if (errS || errB || errP) {
      console.error('DB fetch errors:', { errS, errB, errP });
    }

    const safeSuggestions = suggestions || [];
    const safeBundles = bundles || [];
    const safePolicies = policies || [];

    // Map suggestions and attach bundles/policies
    const mappedSuggestions = safeSuggestions.map((s: any) => {
      const bundle = safeBundles.find((b: any) => b.id === s.action_bundle_id);
      const policy = safePolicies.find((p: any) => p.id === s.policy_guard_id);
      
      let policyWarning = undefined;
      if (policy && policy.enforcement_action === 'block') {
         policyWarning = `SYSTEM BLOCKED: Execution violates [${policy.policy_name}] policy.`;
      } else if (policy && policy.enforcement_action === 'require_approval') {
         policyWarning = `Action requires explicit approval per Policy [${policy.policy_name}].`;
      } else if (policy && policy.enforcement_action === 'warn') {
         policyWarning = `Warning: Flagged by [${policy.policy_name}]. Monitor after execution.`;
      }

      return {
        id: s.id,
        targetContextType: s.target_context_type,
        targetContextId: s.target_context_id,
        suggestionType: s.suggestion_type,
        title: s.title,
        reasoningLog: s.reasoning_log,
        confidenceScore: s.confidence_score,
        status: s.status,
        actionBundle: bundle ? {
           id: bundle.id,
           description: bundle.description,
           status: bundle.status,
           requiredRole: bundle.required_role,
           actionsPayload: bundle.actions_payload
        } : undefined,
        policyWarning,
        decidedBy: s.decided_by,
        decidedAt: s.decided_at,
        createdAt: s.created_at
      };
    });

    const pendingStatuses = ['pending', 'blocked_by_policy'];
    const pendingSuggestions = mappedSuggestions.filter(s => pendingStatuses.includes(s.status));
    const recentDecisions = mappedSuggestions.filter(s => ['accepted', 'rejected', 'dismissed'].includes(s.status));

    const activePolicyGuards = safePolicies.map((p: any) => ({
      id: p.id,
      policyName: p.policy_name,
      enforcementAction: p.enforcement_action
    }));

    const snapshotData: AutomationSuggestionSnapshotDTO = {
      snapshotId: crypto.randomUUID(),
      snapshotType: 'automation_suggestion_snapshot',
      snapshotVersion: 'v1',
      context: { tenantId: 'SYSTEM' },
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', sourceLagSeconds: 0 },
      actions: [],
      warnings: [],
      criticalFlags: [],
      data: {
        pendingSuggestions,
        recentDecisions,
        activePolicyGuards
      }
    };

    return NextResponse.json({ data: snapshotData, meta: { requestId: 'req-' + Date.now(), tenantId: context.tenantId, snapshotAt: new Date().toISOString() } });
  } catch (error: any) {
    const isAuth = error.message === 'UNAUTHORIZED';
    return NextResponse.json({ error: { code: isAuth ? 'PERMISSION_DENIED' : 'INVALID_STATE', message: error.message } }, { status: isAuth ? 401 : 400 });
  }
}
