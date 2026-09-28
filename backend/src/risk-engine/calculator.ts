export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface HealthInputs {
  physicalCondition?: string;
  temperature?: number | null;
  vibration?: number | null;
  voltage?: number | null;
  leakage?: boolean;
  corrosion?: boolean;
  damage?: boolean;
  recentFailuresCount?: number;
  ageYears?: number;
  expectedLifeYears?: number;
}

export interface HealthResult {
  healthScore: number;
  conditionRating: string;
  factors: string[];
}

export interface RiskInputs {
  healthScore: number;
  ageYears: number;
  expectedLifeYears: number;
  failureCount: number;
  criticality: PriorityLevel;
  overdueMaintenanceDays?: number;
  warrantyExpiredWithoutAMC?: boolean;
  dependentCount?: number;
  hasAbnormalTelemetry?: boolean;
}

export interface RiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
  factors: string[];
}

export interface MaintenancePriorityResult {
  priorityScore: number;
  priorityLevel: PriorityLevel;
  reasons: string[];
}

/**
 * Calculate Asset Health Score (0-100)
 */
export function calculateHealthScore(inputs: HealthInputs): HealthResult {
  let score = 100;
  const factors: string[] = [];

  if (inputs.physicalCondition) {
    const cond = inputs.physicalCondition.toLowerCase();
    if (cond === 'critical' || cond === 'damaged') {
      score -= 35;
      factors.push('Physical condition rated CRITICAL/DAMAGED');
    } else if (cond === 'poor') {
      score -= 25;
      factors.push('Physical condition rated POOR');
    } else if (cond === 'moderate' || cond === 'fair') {
      score -= 15;
      factors.push('Physical condition rated MODERATE');
    }
  }

  if (inputs.vibration && inputs.vibration > 3.5) {
    score -= 20;
    factors.push(`High vibration level detected (${inputs.vibration} mm/s)`);
  } else if (inputs.vibration && inputs.vibration > 2.5) {
    score -= 10;
    factors.push(`Elevated vibration level detected (${inputs.vibration} mm/s)`);
  }

  if (inputs.temperature && inputs.temperature > 85) {
    score -= 20;
    factors.push(`Abnormal temperature reading (${inputs.temperature}°C)`);
  } else if (inputs.temperature && inputs.temperature > 70) {
    score -= 10;
    factors.push(`Elevated operating temperature (${inputs.temperature}°C)`);
  }

  if (inputs.damage) {
    score -= 15;
    factors.push('Physical structural or operational damage present');
  }
  if (inputs.corrosion) {
    score -= 10;
    factors.push('Corrosion detected on asset casing/components');
  }
  if (inputs.leakage) {
    score -= 10;
    factors.push('Fluid/oil leakage observed');
  }

  if (inputs.recentFailuresCount && inputs.recentFailuresCount > 0) {
    const penalty = Math.min(30, inputs.recentFailuresCount * 10);
    score -= penalty;
    factors.push(`${inputs.recentFailuresCount} failure(s) recorded in recent history`);
  }

  if (inputs.ageYears && inputs.expectedLifeYears && inputs.expectedLifeYears > 0) {
    const ageRatio = inputs.ageYears / inputs.expectedLifeYears;
    if (ageRatio > 1.2) {
      score -= 20;
      factors.push(`Asset beyond expected lifespan (${inputs.ageYears}y vs ${inputs.expectedLifeYears}y)`);
    } else if (ageRatio > 0.9) {
      score -= 10;
      factors.push(`Asset near end of design life (${inputs.ageYears}y vs ${inputs.expectedLifeYears}y)`);
    }
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let conditionRating = 'Excellent';
  if (finalScore < 40) conditionRating = 'Critical';
  else if (finalScore < 60) conditionRating = 'Poor';
  else if (finalScore < 80) conditionRating = 'Moderate';
  else if (finalScore < 95) conditionRating = 'Good';

  if (factors.length === 0) {
    factors.push('All parameters within optimal range');
  }

  return {
    healthScore: finalScore,
    conditionRating,
    factors
  };
}

/**
 * Calculate Asset Risk Score (0-100) & Risk Level
 */
export function calculateRiskScore(inputs: RiskInputs): RiskResult {
  const factors: string[] = [];

  const healthDeficit = 100 - inputs.healthScore;
  let riskFromHealth = (healthDeficit / 100) * 45;
  if (inputs.healthScore < 40) {
    factors.push(`Health score below critical threshold (${inputs.healthScore}%)`);
  } else if (inputs.healthScore < 60) {
    factors.push(`Health score in poor range (${inputs.healthScore}%)`);
  }

  let riskFromFailures = Math.min(25, inputs.failureCount * 8.5);
  if (inputs.failureCount > 0) {
    factors.push(`${inputs.failureCount} historical failure(s) recorded`);
  }

  let ageRatio = inputs.expectedLifeYears > 0 ? inputs.ageYears / inputs.expectedLifeYears : 0.5;
  let riskFromAge = Math.min(15, ageRatio * 12);
  if (ageRatio >= 1.0) {
    factors.push(`Operating beyond design lifespan (${inputs.ageYears}y)`);
  }

  let riskFromTelemetry = inputs.hasAbnormalTelemetry ? 10 : 0;
  if (inputs.hasAbnormalTelemetry) {
    factors.push('High vibration or temperature anomaly detected');
  }

  let riskFromOverdue = 0;
  if (inputs.overdueMaintenanceDays && inputs.overdueMaintenanceDays > 0) {
    riskFromOverdue = Math.min(10, inputs.overdueMaintenanceDays * 0.5);
    factors.push(`Scheduled maintenance overdue by ${inputs.overdueMaintenanceDays} days`);
  }

  let riskFromWarranty = 0;
  if (inputs.warrantyExpiredWithoutAMC) {
    riskFromWarranty = 5;
    factors.push('Warranty expired without active AMC contract');
  }

  let riskFromDependencies = 0;
  if (inputs.dependentCount && inputs.dependentCount > 0) {
    riskFromDependencies = Math.min(15, inputs.dependentCount * 4);
    factors.push(`High dependency impact: ${inputs.dependentCount} downstream asset(s) depend on this unit`);
  }

  let rawScore = riskFromHealth + riskFromFailures + riskFromAge + riskFromTelemetry + riskFromOverdue + riskFromWarranty + riskFromDependencies;

  let multiplier = 1.0;
  if (inputs.criticality === 'URGENT' || inputs.criticality === 'HIGH') {
    multiplier = 1.25;
  } else if (inputs.criticality === 'LOW') {
    multiplier = 0.85;
  }

  let finalRisk = Math.max(0, Math.min(100, Math.round(rawScore * multiplier)));

  let riskLevel: RiskLevel = 'LOW';
  if (finalRisk >= 80) riskLevel = 'CRITICAL';
  else if (finalRisk >= 60) riskLevel = 'HIGH';
  else if (finalRisk >= 31) riskLevel = 'MEDIUM';

  if (factors.length === 0) {
    factors.push('Low overall risk profile');
  }

  return {
    riskScore: finalRisk,
    riskLevel,
    factors
  };
}

/**
 * Calculate Dynamic Maintenance Priority & Explainable Reasons
 */
export function calculateDynamicMaintenancePriority(
  healthScore: number,
  riskScore: number,
  riskLevel: RiskLevel,
  riskFactors: string[],
  dependencyCount: number,
  calendarDaysRemaining?: number
): MaintenancePriorityResult {
  const reasons: string[] = [];

  let priorityScore = riskScore * 0.6 + (100 - healthScore) * 0.4;
  if (dependencyCount > 0) {
    priorityScore += Math.min(15, dependencyCount * 3);
  }

  priorityScore = Math.max(0, Math.min(100, Math.round(priorityScore)));

  let priorityLevel: PriorityLevel = 'LOW';

  if (priorityScore >= 75 || healthScore <= 45 || riskScore >= 75) {
    priorityLevel = 'URGENT';
  } else if (priorityScore >= 55 || healthScore <= 60 || riskScore >= 55) {
    priorityLevel = 'HIGH';
  } else if (priorityScore >= 35 || healthScore <= 75 || riskScore >= 35) {
    priorityLevel = 'MEDIUM';
  }

  if (healthScore <= 45) {
    reasons.push(`✓ Asset health severely degraded at ${healthScore}% (below 45% threshold)`);
  } else if (healthScore <= 60) {
    reasons.push(`✓ Asset health declining at ${healthScore}%`);
  }

  if (riskScore >= 75) {
    reasons.push(`✓ Risk score in CRITICAL zone (${riskScore}/100)`);
  } else if (riskScore >= 55) {
    reasons.push(`✓ Risk score in HIGH zone (${riskScore}/100)`);
  }

  if (dependencyCount > 0) {
    reasons.push(`✓ Critical infrastructure dependency (${dependencyCount} dependent system(s))`);
  }

  riskFactors.forEach(rf => {
    if (!reasons.some(r => r.includes(rf))) {
      reasons.push(`✓ ${rf}`);
    }
  });

  if (calendarDaysRemaining !== undefined && calendarDaysRemaining > 30 && priorityLevel === 'URGENT') {
    reasons.push(`✓ Dynamic Override: Maintenance moved forward from calendar date (${calendarDaysRemaining} days away) due to risk & health factors`);
  }

  if (reasons.length === 0) {
    reasons.push('✓ Routine maintenance schedule applies');
  }

  return {
    priorityScore,
    priorityLevel,
    reasons
  };
}
