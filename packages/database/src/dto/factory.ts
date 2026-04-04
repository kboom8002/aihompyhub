import type { UUID, ISODateTime, SnapshotEnvelopeDTO, NextActionDTO } from './shared';

export interface RolloutCampaignDTO {
  id: UUID;
  campaignName: string;
  targetObjectType: 'TemplateProfile' | 'PromptVersion';
  targetObjectId: UUID;
  rolloutStrategy: 'canary' | 'phased' | 'all_at_once' | 'backfill';
  status: 'draft' | 'rolling_out' | 'frozen' | 'completed' | 'rolling_back' | 'rolled_back';
  startedAt?: ISODateTime;
  progressPercentage: number;
}

export interface SystemicRCACandidateDTO {
  id: UUID;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'monitoring' | 'escalated_to_incident' | 'resolved' | 'false_positive';
  affectedTenantCount: number;
  suspectedRolloutCampaignId?: UUID | null;
  createdAt: ISODateTime;
}

export interface TenantHealthSummaryDTO {
  tenantId: UUID;
  tenantName: string;
  trustScore: number;
  activeIncidents: number;
  failedRollouts: number;
  unresolvedAlerts: number;
  trend: 'improving' | 'stable' | 'degrading';
}

export type FactoryHomeSnapshotDTO = SnapshotEnvelopeDTO<{
  activeRollouts: RolloutCampaignDTO[];
  systemicCandidates: SystemicRCACandidateDTO[];
  healthSummaries: TenantHealthSummaryDTO[];
  globalMetrics: {
    averageTrustScore: number;
    totalTenants: number;
    criticalSystemicIssues: number;
  };
}>;

export type RolloutImpactSnapshotDTO = SnapshotEnvelopeDTO<{
  rolloutInfo: RolloutCampaignDTO;
  baselineMetrics: {
    generatorSuccessRate: number;
    timeoutRate: number;
    averageLatencyMs: number;
    trustScore: number;
  };
  impactMetrics: {
    generatorSuccessRate: number;
    timeoutRate: number;
    averageLatencyMs: number;
    trustScore: number;
  };
  regressionIdentified: boolean;
  affectedTenantsMap: Array<{
    tenantId: UUID;
    tenantName: string;
    status: 'applied' | 'failed' | 'pending' | 'rolled_back';
    errorContext?: string;
  }>;
}>;

export type SystemicRCASnapshotDTO = SnapshotEnvelopeDTO<{
  candidates: Array<SystemicRCACandidateDTO & {
    correlatedRolloutName?: string;
    correlatedRolloutTargetType?: string;
    tenantEvidenceLinks: Array<{
      tenantId: UUID;
      tenantName: string;
      localIncidentId: UUID;
      reportedAt: ISODateTime;
    }>;
  }>;
  globalMetrics: {
    totalTenants: number;
    openInvestigations: number;
  };
}>;
