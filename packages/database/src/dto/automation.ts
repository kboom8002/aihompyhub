import type { UUID, ISODateTime, SnapshotEnvelopeDTO } from './shared';

export interface ActionBundleDTO {
  id: UUID;
  description: string;
  status: 'pending_approval' | 'executed' | 'cancelled' | 'execution_failed';
  actionsPayload: any; // Omitted deep typing for the stub payload
  requiredRole: string;
}

export interface AutomationSuggestionDTO {
  id: UUID;
  targetContextType: 'SystemicRCA' | 'RolloutCampaign' | 'TenantAlert';
  targetContextId: UUID;
  suggestionType: 'fixit_suggestion' | 'mitigation_suggestion' | 'rollout_guard_suggestion' | 'revalidation_suggestion';
  title: string;
  reasoningLog: string;
  confidenceScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'dismissed' | 'blocked_by_policy';
  actionBundle?: ActionBundleDTO;
  policyWarning?: string; // Hydrated human readable warning if bound to a guard
  createdAt: ISODateTime;
}

export type AutomationSuggestionSnapshotDTO = SnapshotEnvelopeDTO<{
  pendingSuggestions: AutomationSuggestionDTO[];
  recentDecisions: AutomationSuggestionDTO[];
  activePolicyGuards: Array<{
    id: UUID;
    policyName: string;
    enforcementAction: 'block' | 'warn' | 'require_approval';
  }>;
}>;
