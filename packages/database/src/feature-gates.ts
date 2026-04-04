/**
 * Feature Gate Global Utility (Sprint 9)
 * 
 * Centralized evaluation logic for resolving commercial limits and entitlements.
 * Use this across all Factory API boundaries to ensure zero Entitlement Leakage.
 */

const PLAN_RANKS = ['trial', 'basic', 'pro', 'enterprise'];

/**
 * Validates if the tenant's current plan meets or exceeds the required threshold.
 * 
 * @param currentPlanCode The active plan code attached to the Tenant's subscription.
 * @param minimumRequiredPlan The minimum plan rank string required to process the action.
 * @throws Error if the threshold is not met.
 */
export function assertFeatureGate(currentPlanCode: string, minimumRequiredPlan: string): void {
  const currentRank = PLAN_RANKS.indexOf(currentPlanCode.toLowerCase());
  const requiredRank = PLAN_RANKS.indexOf(minimumRequiredPlan.toLowerCase());

  if (currentRank === -1) {
    throw new Error(`[Feature Gate] Unknown Tenant Plan Code: ${currentPlanCode}`);
  }
  
  if (requiredRank === -1) {
    throw new Error(`[Feature Gate] Unknown Target Requirement: ${minimumRequiredPlan}`);
  }

  if (currentRank < requiredRank) {
    throw new Error(`FEATURE_GATE_LOCKED: Action requires minimum plan rank '${minimumRequiredPlan.toUpperCase()}', but tenant holds '${currentPlanCode.toUpperCase()}'.`);
  }
}

/**
 * Validates purely for UI/Render contexts where throwing an error is not desired.
 */
export function checkFeatureGateOrFalse(currentPlanCode: string, minimumRequiredPlan: string): boolean {
  try {
    assertFeatureGate(currentPlanCode, minimumRequiredPlan);
    return true;
  } catch (e) {
    return false;
  }
}
