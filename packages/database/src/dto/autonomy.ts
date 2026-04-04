import type { UUID, ISODateTime, SnapshotEnvelopeDTO } from './shared';

export interface SuspendRecommendationDTO {
  recommendationId: string;
  type: 'rollback_recommendation' | 'investigation_required';
  reason: string;
  suggestedAction: string;
}

// 1. Autopilot Lane DTO
export interface AutopilotLaneDTO {
  id: UUID;
  laneName: string;
  description: string;
  laneType: 'auto_backfill' | 'auto_reindex' | 'auto_revalidation' | 'cache_warmup';
  cronSchedule?: string;
  triggerCondition?: string;
  status: 'active' | 'paused' | 'disabled' | 'suspended_by_system';
  activeRecommendation?: SuspendRecommendationDTO;
}

// 2. Execution Journal DTO
export interface ExecutionJournalDTO {
  id: UUID;
  autopilotLaneId: UUID;
  laneName: string; // Hydrated for UI convenience
  executionRunId: string;
  actionSummary: string;
  status: 'success' | 'failed' | 'blocked_by_policy';
  detailsPayload?: any;
  policyBlockedReason?: string;
  executedAt: ISODateTime;
}

// 3. Human Override DTO
export interface HumanOverrideLogDTO {
  id: UUID;
  autopilotLaneId: UUID;
  laneName: string; // Hydrated for UI convenience
  actorId: UUID;
  previousStatus: string;
  newStatus: string;
  overrideReason: string;
  createdAt: ISODateTime;
}

// 4. Combined Snapshot DTO
export type AutonomyJournalSnapshotDTO = SnapshotEnvelopeDTO<{
  lanes: AutopilotLaneDTO[];
  recentExecutions: ExecutionJournalDTO[];
  recentOverrides: HumanOverrideLogDTO[];
}>;
