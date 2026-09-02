export type VerificationStatus = 'VERIFIED' | 'SUSPICIOUS' | 'HIGH_RISK_FLAGGED' | 'EXPIRED' | 'UNVERIFIED';

export type AuraTicketStatus = 'PENDING' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED' | 'CANCELLED';

export type DutyStatus = 'ON_PATROL' | 'RESPONDING' | 'STANDBY' | 'OFF_DUTY' | 'EMERGENCY_PANIC';

export interface PatrolUnit {
  id: string;
  officerName: string;
  badgeNumber: string;
  callSign: string;
  vehicleId: string;
  vehicleType: 'PATROL_4X4' | 'MOTORBIKE' | 'RAPID_RESPONSE' | 'K9_UNIT' | 'FOOT_PATROL';
  status: DutyStatus;
  batteryLevel: number;
  lastLat: number;
  lastLng: number;
  heading: number; // degrees
  speedKmh: number;
  signalStrength: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  lastPing: string;
  assignedSector: string;
  activeScanCount: number;
}

export interface IdentityScan {
  id: string;
  scanUuid: string;
  officerId: string;
  officerName: string;
  officerCallSign: string;
  subjectName: string;
  idNumber: string;
  idType: 'NATIONAL_ID_CARD' | 'PASSPORT_MRZ' | 'DRIVERS_LICENSE' | 'TEMPORARY_RESIDENCE' | 'VISITOR_BADGE';
  nationality: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  status: VerificationStatus;
  riskScore: number; // 0 - 100
  riskReasons: string[];
  auraTicketId?: string;
  photoUrl: string;
  docFrontUrl?: string;
  docBackUrl?: string;
  confidenceScore: number;
  mrzRaw?: string;
  verificationFlags: {
    faceMatchScore: number;
    tamperDetected: boolean;
    blacklistHit: boolean;
    wantedPersonAlert: boolean;
    expiredDocument: boolean;
    mrzChecksumValid: boolean;
  };
  gpsLat: number;
  gpsLng: number;
  locationName: string;
  timestamp: string;
  deviceModel: string;
  syncedToCloud: boolean;
}

export interface AuraDispatchTicket {
  id: string;
  ticketNumber: string;
  priority: 'CRITICAL_ARMED_RESPONSE' | 'HIGH_PRIORITY' | 'MEDIUM_ASSIST' | 'ROUTINE';
  triggerSource: 'QDENTIFI_AUTO_HIGH_RISK' | 'OFFICER_PANIC_BUTTON' | 'DISPATCHER_MANUAL' | 'GEOFENCE_BREACH';
  scanId?: string;
  officerId: string;
  officerName: string;
  locationLat: number;
  locationLng: number;
  address: string;
  assignedResponderUnit?: string;
  responderVehicleType?: string;
  responderStatus: AuraTicketStatus;
  etaMinutes: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    time: string;
    status: AuraTicketStatus;
    event: string;
  }[];
}

export interface TelemetryLog {
  id: string;
  officerId: string;
  officerCallSign: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  batteryLevel: number;
  signalStrength: string;
  networkType: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  eventType: 'AUTH_LOGIN' | 'IDENTITY_SCAN_INGEST' | 'AURA_DISPATCH_TRIGGERED' | 'AURA_STATUS_UPDATE' | 'BACKUP_CREATED' | 'GPS_TELEMETRY_INGEST' | 'COMPLIANCE_EXPORT';
  actorId: string;
  actorName: string;
  actorRole: 'MOBILE_OFFICER' | 'CENTRAL_DISPATCHER' | 'SYSTEM_AUTOMATION' | 'AUDITOR';
  action: string;
  targetType: 'IDENTITY_RECORD' | 'AURA_TICKET' | 'PATROL_UNIT' | 'DATABASE_SNAPSHOT' | 'TELEMETRY';
  targetId: string;
  ipAddress: string;
  hashSignature: string; // SHA-256 for tamper evidence
  timestamp: string;
  details: Record<string, any>;
}

export interface ComplianceBackup {
  id: string;
  filename: string;
  recordCount: number;
  sizeKb: number;
  checksum: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'VERIFIED';
  type: 'HOURLY_INCREMENTAL' | 'DAILY_FULL' | 'ENCRYPTED_ARCHIVE';
  timestamp: string;
  retentionUntil: string;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt' | 'af';
