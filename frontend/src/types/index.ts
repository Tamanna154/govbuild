export type Role = 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'ENGINEER' | 'INSPECTOR' | 'TECHNICIAN' | 'VIEWER' | 'CITIZEN';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AssetStatus = 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'DEGRADED' | 'FAILED' | 'DECOMMISSIONED';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_PARTS' | 'COMPLETED' | 'VERIFIED' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation?: string;
  department?: string;
  phone?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Building {
  id: string;
  buildingId: string;
  name: string;
  type: string;
  departmentId: string;
  department?: Department;
  district: string;
  taluka: string;
  address: string;
  latitude: number;
  longitude: number;
  constructionDate?: string;
  constructionCost?: number;
  builtUpArea?: number;
  totalFloors: number;
  contractor?: string;
  architect?: string;
  structuralEngineer?: string;
  completionDate?: string;
  currentCondition: string;
  currentHealthScore: number;
  status: string;
  responsibleOfficer?: string;
  contactInfo?: string;
  description?: string;
  _count?: {
    assets: number;
    tickets: number;
    alerts: number;
  };
}

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  type: string;
  buildingId: string;
  building?: { id: string; buildingId: string; name: string; district: string };
  systemId?: string;
  system?: { id: string; name: string };
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  vendorId?: string;
  vendor?: { id: string; companyName: string };
  purchaseDate?: string;
  installationDate?: string;
  commissioningDate?: string;
  purchaseCost?: number;
  installationCost?: number;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  amcStartDate?: string;
  amcEndDate?: string;
  expectedLifeYears: number;
  expectedEolDate?: string;
  currentStatus: AssetStatus;
  currentHealthScore: number;
  currentRiskScore: number;
  riskLevel: RiskLevel;
  criticalityLevel: PriorityLevel;
  lastInspectionDate?: string;
  nextScheduledInspection?: string;
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  responsiblePerson?: string;
  locationInBuilding?: string;
  description?: string;
  qrCodeUrl?: string;
  warranties?: Warranty[];
  amcContracts?: AMCContract[];
  lifecycleEvents?: LifecycleEvent[];
  inspections?: Inspection[];
  healthHistory?: HealthHistoryPoint[];
  riskHistory?: RiskHistoryPoint[];
  failures?: FailureRecord[];
}

export interface Warranty {
  id: string;
  assetId: string;
  providerName: string;
  startDate: string;
  endDate: string;
  terms?: string;
  coveredComponents?: string;
  status: string;
}

export interface AMCContract {
  id: string;
  contractNumber: string;
  assetId: string;
  startDate: string;
  endDate: string;
  contractValue?: number;
  serviceFrequency?: string;
  slaDetails?: string;
  status: string;
}

export interface LifecycleEvent {
  id: string;
  assetId: string;
  eventType: string;
  eventDate: string;
  performedBy?: string;
  description: string;
  oldStatus?: string;
  newStatus?: string;
}

export interface Inspection {
  id: string;
  inspectionId: string;
  assetId: string;
  asset?: Asset;
  inspectorId?: string;
  inspectionDate: string;
  physicalCondition: string;
  temperature?: number;
  vibration?: number;
  noise?: number;
  oilLevel?: number;
  voltage?: number;
  current?: number;
  operatingHours?: number;
  leakage: boolean;
  corrosion: boolean;
  damage: boolean;
  safetyStatus: string;
  photos?: string;
  remarks?: string;
  recommendedAction?: string;
}

export interface HealthHistoryPoint {
  id: string;
  healthScore: number;
  conditionRating: string;
  factorsJson?: string;
  recordedAt: string;
}

export interface RiskHistoryPoint {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  healthScore: number;
  recordedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketId: string;
  assetId: string;
  asset?: Asset;
  buildingId: string;
  building?: Building;
  problemDescription: string;
  priorityLevel: PriorityLevel;
  riskScoreAtCreation: number;
  status: TicketStatus;
  createdBy?: string;
  assignedOfficerId?: string;
  assignedTechnicianId?: string;
  expectedCompletion?: string;
  actualCompletion?: string;
  repairDetails?: string;
  partsReplaced?: string;
  labourCost: number;
  materialCost: number;
  totalCost: number;
  beforeHealthScore?: number;
  beforeRiskScore?: number;
  afterHealthScore?: number;
  afterRiskScore?: number;
  technicianRemarks?: string;
  verificationStatus: string;
  createdAt: string;
}

export interface FailureRecord {
  id: string;
  assetId: string;
  asset?: Asset;
  failureDate: string;
  failureType: string;
  symptoms?: string;
  rootCause?: string;
  downtimeHours: number;
  repairCost: number;
  severity: RiskLevel;
  resolution?: string;
}

export interface Alert {
  id: string;
  alertId: string;
  alertType: string;
  priority: 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE';
  title: string;
  message: string;
  buildingId?: string;
  building?: { name: string; district: string };
  assetId?: string;
  asset?: { assetId: string; name: string; currentRiskScore: number };
  isRead: boolean;
  createdAt: string;
}

export interface ExplainRiskData {
  assetId: string;
  name: string;
  buildingName: string;
  currentRiskScore: number;
  riskLevel: RiskLevel;
  currentHealthScore: number;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  reasons: string[];
  factors: string[];
  failureCount: number;
  dependentCount: number;
  lastInspectionDate?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  timestamp: string;
}
