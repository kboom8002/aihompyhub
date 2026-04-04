import type { UUID, ISODateTime, SnapshotEnvelopeDTO } from './shared';

// 1. Experiment Compare DTOs
export interface VariantMetricsDTO {
  variantId: UUID;
  variantLabel: string; // e.g. "Baseline (v1)" or "Test (v2)"
  trafficAllocation: number;
  successRate: number;
  timeoutRate: number;
  averageLatencyMs: number;
  trustScore: number;
}

export interface ExperimentCompareSummaryDTO {
  id: UUID;
  experimentName: string;
  targetObjectType: 'TemplateProfile' | 'PromptVersion' | 'GeneratorPipeline';
  status: 'running' | 'concluded' | 'aborted';
  primaryMetric: 'success_rate' | 'latency_ms' | 'trust_score';
  startedAt: ISODateTime;
  baselineMetrics: VariantMetricsDTO;
  testMetrics: VariantMetricsDTO;
  statisticalSignificanceReached: boolean;
  conclusionReason?: string;
}

export type ExperimentCompareSnapshotDTO = SnapshotEnvelopeDTO<{
  activeExperiments: ExperimentCompareSummaryDTO[];
  concludedExperiments: ExperimentCompareSummaryDTO[];
}>;

// 2. Benchmark Explorer DTOs
export interface BenchmarkRunDTO {
  id: UUID;
  targetObjectType: 'PromptVersion' | 'GeneratorPipeline';
  targetObjectId: UUID;
  targetIdentifier: string; // Human readable name for the target
  datasetRef: string;
  overallScore: number;
  qualityScore: number;
  safeguardScore: number;
  latencyMsP95: number | null;
  status: 'pass' | 'fail' | 'degraded';
  runDate: ISODateTime;
}

export type BenchmarkExplorerSnapshotDTO = SnapshotEnvelopeDTO<{
  recentRuns: BenchmarkRunDTO[];
  topPerformers: BenchmarkRunDTO[];
}>;

// 3. Postmortem Browse DTOs
export interface PostmortemRecordDTO {
  id: UUID;
  systemicRcaId: UUID;
  title: string;
  rootCauseAnalysis: string;
  resolutionSummary: string;
  preventativeMeasures?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  publishedAt: ISODateTime;
  authorId: UUID;
}

export type PostmortemBrowseSnapshotDTO = SnapshotEnvelopeDTO<{
  library: PostmortemRecordDTO[];
}>;
