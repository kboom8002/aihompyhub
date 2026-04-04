import type { UUID, ISODateTime, ObjectRef, SnapshotEnvelopeDTO, NextActionDTO } from './shared';

// ----------------------------------------------------
// OPS BASE ENTITIES
// ----------------------------------------------------

export interface SystemSignalDTO {
  id: UUID;
  signalType: string;
  sourceTarget: ObjectRef | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, unknown>;
  createdAt: ISODateTime;
}

export interface AlertDTO {
  id: UUID;
  ruleId: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'muted';
  contextRef: ObjectRef | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RcaRecordDTO {
  id: UUID;
  alertId: UUID;
  domain: string;
  description: string;
  status: 'draft' | 'confirmed';
  createdAt: ISODateTime;
}

export interface FixItTaskDTO {
  id: UUID;
  rcaId: UUID;
  taskType: string;
  status: 'pending' | 'in_progress' | 'verified' | 'failed';
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface IncidentDTO {
  id: UUID;
  alertId: UUID;
  severity: 'sev1' | 'sev2' | 'sev3' | 'sev4';
  status: 'active' | 'mitigated' | 'resolved';
  mitigationState: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// ----------------------------------------------------
// OPS SNAPSHOTS (SSoT Envelopes)
// ----------------------------------------------------

export type OpsHomeSnapshotDTO = SnapshotEnvelopeDTO<{
  openAlertsCount: number;
  activeIncidentsCount: number;
  pendingFixItsCount: number;
  recentSignals: SystemSignalDTO[];
}>;

export type AlertListSnapshotDTO = SnapshotEnvelopeDTO<{
  alerts: AlertDTO[];
  totalAlerts: number;
}>;

export type RcaWorkbenchSnapshotDTO = SnapshotEnvelopeDTO<{
  rcaRecords: RcaRecordDTO[];
  linkedFixIts: Record<UUID, FixItTaskDTO[]>; 
}>;

export type FixitBoardSnapshotDTO = SnapshotEnvelopeDTO<{
  totalPendingFixIts: number;
  fixIts: FixItTaskDTO[];
}>;

export type RuntimeHealthSnapshotDTO = SnapshotEnvelopeDTO<{
  globalStatus: 'healthy' | 'degraded' | 'down';
  lanes: Array<{
    laneId: string;
    status: 'healthy' | 'degraded' | 'paused' | 'down';
    currentBacklog: number;
    lastHeartbeat: ISODateTime;
  }>;
  recentDlqEvents: Array<{
    eventId: UUID;
    laneId: string;
    errorReason: string;
    status: 'pending' | 'requeued' | 'dropped';
    createdAt: ISODateTime;
  }>;
}>;

export type IncidentBridgeSnapshotDTO = SnapshotEnvelopeDTO<{
  activeIncidents: IncidentDTO[];
  ongoingMitigations: Record<string, unknown>;
}>;
