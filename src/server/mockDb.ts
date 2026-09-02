import { PatrolUnit, IdentityScan, AuraDispatchTicket, TelemetryLog, AuditLog, ComplianceBackup } from '../types';

function generateSha256Sim(data: string, prevHash: string = '0000000000000000'): string {
  let hash = 0;
  const str = prevHash + data;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}${Date.now().toString(16).slice(-8)}${Math.random().toString(16).slice(2, 8)}`;
}

export class PatrolveDatabase {
  public patrolUnits: PatrolUnit[] = [];
  public identityScans: IdentityScan[] = [];
  public auraTickets: AuraDispatchTicket[] = [];
  public telemetryLogs: TelemetryLog[] = [];
  public auditLogs: AuditLog[] = [];
  public backups: ComplianceBackup[] = [];
  private lastAuditHash: string = 'sha256_genesis_patrolve_root_0001';

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Initial Patrol Units on Duty
    this.patrolUnits = [
      {
        id: 'unit_01',
        officerName: 'Sgt. Thabo Molefe',
        badgeNumber: 'PV-8841',
        callSign: 'EAGLE-1',
        vehicleId: 'TOY-HILUX-04',
        vehicleType: 'PATROL_4X4',
        status: 'ON_PATROL',
        batteryLevel: 94,
        lastLat: -26.1452,
        lastLng: 28.0418,
        heading: 45,
        speedKmh: 28,
        signalStrength: 'EXCELLENT',
        lastPing: new Date(Date.now() - 1000 * 15).toISOString(),
        assignedSector: 'Rosebank Central Sector A',
        activeScanCount: 14,
      },
      {
        id: 'unit_02',
        officerName: 'Ofc. Sarah Jenkins',
        badgeNumber: 'PV-9102',
        callSign: 'VIPER-3',
        vehicleId: 'BMW-GS1250',
        vehicleType: 'MOTORBIKE',
        status: 'ON_PATROL',
        batteryLevel: 82,
        lastLat: -26.1528,
        lastLng: 28.0342,
        heading: 180,
        speedKmh: 42,
        signalStrength: 'GOOD',
        lastPing: new Date(Date.now() - 1000 * 30).toISOString(),
        assignedSector: 'Melrose Boulevard Transit',
        activeScanCount: 9,
      },
      {
        id: 'unit_03',
        officerName: 'Cmdr. Sipho Ndlovu',
        badgeNumber: 'PV-7700',
        callSign: 'AURA-TACTICAL-1',
        vehicleId: 'FORD-RANGER-ARMORED',
        vehicleType: 'RAPID_RESPONSE',
        status: 'STANDBY',
        batteryLevel: 99,
        lastLat: -26.1388,
        lastLng: 28.0520,
        heading: 90,
        speedKmh: 0,
        signalStrength: 'EXCELLENT',
        lastPing: new Date(Date.now() - 1000 * 5).toISOString(),
        assignedSector: 'Sandton High-Security Perimeter',
        activeScanCount: 3,
      },
      {
        id: 'unit_04',
        officerName: 'Ofc. Marcus Van Der Merwe',
        badgeNumber: 'PV-6523',
        callSign: 'K9-BRAVO',
        vehicleId: 'ISUZU-DMAX-K9',
        vehicleType: 'K9_UNIT',
        status: 'ON_PATROL',
        batteryLevel: 76,
        lastLat: -26.1580,
        lastLng: 28.0495,
        heading: 270,
        speedKmh: 15,
        signalStrength: 'GOOD',
        lastPing: new Date(Date.now() - 1000 * 45).toISOString(),
        assignedSector: 'Hyde Park Checkpoint 2',
        activeScanCount: 19,
      },
    ];

    // 2. Initial Identity Scans (mix of Verified, Suspicious, High Risk)
    this.identityScans = [
      {
        id: 'scan_001',
        scanUuid: 'qden-f91b-44a1-b8d9-918237190011',
        officerId: 'unit_01',
        officerName: 'Sgt. Thabo Molefe',
        officerCallSign: 'EAGLE-1',
        subjectName: 'Bongani Khumalo',
        idNumber: '8803155123089',
        idType: 'NATIONAL_ID_CARD',
        nationality: 'South Africa',
        dateOfBirth: '1988-03-15',
        gender: 'M',
        status: 'VERIFIED',
        riskScore: 4,
        riskReasons: ['Clear record', 'NHA Database Match 99.4%'],
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=faces',
        confidenceScore: 99.2,
        mrzRaw: 'IDZAF8803155123089<<<<<<<<<<<<<8803155M2901014ZAF<<<<<<<<<<<2',
        verificationFlags: {
          faceMatchScore: 98.6,
          tamperDetected: false,
          blacklistHit: false,
          wantedPersonAlert: false,
          expiredDocument: false,
          mrzChecksumValid: true,
        },
        gpsLat: -26.1465,
        gpsLng: 28.0425,
        locationName: 'Oxford Road Access Gate 3',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        deviceModel: 'Samsung Galaxy XCover Pro 6 (Rugged)',
        syncedToCloud: true,
      },
      {
        id: 'scan_002',
        scanUuid: 'qden-331c-88b2-c119-994102830192',
        officerId: 'unit_02',
        officerName: 'Ofc. Sarah Jenkins',
        officerCallSign: 'VIPER-3',
        subjectName: 'Viktor Romanov',
        idNumber: 'P892100419',
        idType: 'PASSPORT_MRZ',
        nationality: 'Estonia / EU',
        dateOfBirth: '1979-11-20',
        gender: 'M',
        status: 'HIGH_RISK_FLAGGED',
        riskScore: 96,
        riskReasons: [
          'INTERPOL BOLO Red Notice: Financial Fraud & Wire Extradition',
          'Document hologram microprint disparity',
          'Security database match positive',
        ],
        auraTicketId: 'aura_tk_901',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&crop=faces',
        confidenceScore: 94.8,
        mrzRaw: 'PESTROMANOV<<VIKTOR<<<<<<<<<<<<<<<<<<P892100419EST7911204M2809151<<<<<<<<<<4',
        verificationFlags: {
          faceMatchScore: 96.2,
          tamperDetected: true,
          blacklistHit: true,
          wantedPersonAlert: true,
          expiredDocument: false,
          mrzChecksumValid: true,
        },
        gpsLat: -26.1534,
        gpsLng: 28.0355,
        locationName: 'Melrose Arch VIP Valet Bay',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        deviceModel: 'Zebra TC58 Enterprise Touch Computer',
        syncedToCloud: true,
      },
      {
        id: 'scan_003',
        scanUuid: 'qden-772a-11e4-d901-441029481720',
        officerId: 'unit_04',
        officerName: 'Ofc. Marcus Van Der Merwe',
        officerCallSign: 'K9-BRAVO',
        subjectName: 'Claire Dubois',
        idNumber: 'FR-DL-994120',
        idType: 'DRIVERS_LICENSE',
        nationality: 'France',
        dateOfBirth: '1992-06-04',
        gender: 'F',
        status: 'VERIFIED',
        riskScore: 6,
        riskReasons: ['International permit verified', 'Biometric face match 97.8%'],
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&crop=faces',
        confidenceScore: 97.8,
        verificationFlags: {
          faceMatchScore: 97.8,
          tamperDetected: false,
          blacklistHit: false,
          wantedPersonAlert: false,
          expiredDocument: false,
          mrzChecksumValid: true,
        },
        gpsLat: -26.1582,
        gpsLng: 28.0498,
        locationName: 'Hyde Park Shopping Center South Gate',
        timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        deviceModel: 'Honeywell ScanPal EDA52',
        syncedToCloud: true,
      },
    ];

    // 3. Initial AURA Armed Dispatch Tickets
    this.auraTickets = [
      {
        id: 'aura_tk_901',
        ticketNumber: 'AURA-2026-90412',
        priority: 'CRITICAL_ARMED_RESPONSE',
        triggerSource: 'QDENTIFI_AUTO_HIGH_RISK',
        scanId: 'scan_002',
        officerId: 'unit_02',
        officerName: 'Ofc. Sarah Jenkins (VIPER-3)',
        locationLat: -26.1534,
        locationLng: 28.0355,
        address: 'Melrose Arch VIP Valet Bay, JHB',
        assignedResponderUnit: 'AURA Tactical Team Delta (Alpha Armed 2)',
        responderVehicleType: 'Toyota Land Cruiser Armored V8',
        responderStatus: 'EN_ROUTE',
        etaMinutes: 2,
        notes: 'High-risk wanted Interpol subject scanned via QDentiFi Android device. Backup requested immediately.',
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        timeline: [
          {
            time: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
            status: 'PENDING',
            event: 'QDentiFi auto-triggered AURA emergency armed response ticket via /api/v1/qdentify/scans',
          },
          {
            time: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
            status: 'DISPATCHED',
            event: 'AURA Dispatch Control assigned Tactical Team Delta. GPS link broadcasted.',
          },
          {
            time: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
            status: 'EN_ROUTE',
            event: 'Unit Delta en-route with sirens engaged. Distance 1.1km. Live tracker active.',
          },
        ],
      },
    ];

    // 4. Initial Audit Log chain
    this.addAuditLog({
      eventType: 'AUTH_LOGIN',
      actorId: 'unit_01',
      actorName: 'Sgt. Thabo Molefe',
      actorRole: 'MOBILE_OFFICER',
      action: 'Patrolve Mobile JWT Authentication issued for QDentiFi Android App',
      targetType: 'PATROL_UNIT',
      targetId: 'unit_01',
      ipAddress: '197.89.41.12',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      details: { device: 'Samsung Galaxy XCover Pro 6', token_exp: '8h' },
    });

    this.addAuditLog({
      eventType: 'IDENTITY_SCAN_INGEST',
      actorId: 'unit_02',
      actorName: 'Ofc. Sarah Jenkins',
      actorRole: 'MOBILE_OFFICER',
      action: 'High-risk Interpol Red Notice identity scan ingested from QDentiFi',
      targetType: 'IDENTITY_RECORD',
      targetId: 'scan_002',
      ipAddress: '197.89.41.88',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      details: { subject: 'Viktor Romanov', risk_score: 96, aura_triggered: true },
    });

    this.addAuditLog({
      eventType: 'AURA_DISPATCH_TRIGGERED',
      actorId: 'sys_engine',
      actorName: 'PATROLVE2 AURA Automation Daemon',
      actorRole: 'SYSTEM_AUTOMATION',
      action: 'AURA Armed Response Auto-Dispatched for scan_002',
      targetType: 'AURA_TICKET',
      targetId: 'aura_tk_901',
      ipAddress: '10.0.0.4',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      details: { ticket: 'AURA-2026-90412', priority: 'CRITICAL_ARMED_RESPONSE' },
    });

    // 5. Compliance Backups
    this.backups = [
      {
        id: 'bak_001',
        filename: 'patrolve_db_backup_20260902_020000.sql.gz',
        recordCount: 14892,
        sizeKb: 3418,
        checksum: 'sha256_e819fa001928bc8192a01948bc81290141',
        status: 'VERIFIED',
        type: 'DAILY_FULL',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        retentionUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 5).toISOString(),
      },
    ];
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'hashSignature'>): AuditLog {
    const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const hash = generateSha256Sim(JSON.stringify(entry), this.lastAuditHash);
    this.lastAuditHash = hash;

    const fullLog: AuditLog = {
      id,
      ...entry,
      hashSignature: hash,
    };
    this.auditLogs.unshift(fullLog);
    return fullLog;
  }

  public ingestScan(scanData: Partial<IdentityScan>): IdentityScan {
    const id = `scan_${Date.now()}`;
    const scanUuid = scanData.scanUuid || `qden-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;
    
    // Auto calculate risk if not given
    const isWanted = !!scanData.verificationFlags?.wantedPersonAlert;
    const isTampered = !!scanData.verificationFlags?.tamperDetected;
    const isBlacklist = !!scanData.verificationFlags?.blacklistHit;
    
    let riskScore = scanData.riskScore ?? 5;
    let status = scanData.status || 'VERIFIED';
    const riskReasons: string[] = scanData.riskReasons || [];

    if (isWanted || isBlacklist) {
      riskScore = Math.max(riskScore, 95);
      status = 'HIGH_RISK_FLAGGED';
      if (isWanted && !riskReasons.includes('WANTED SUSPECT ALERT (Interpol / SAPS Database)')) {
        riskReasons.push('WANTED SUSPECT ALERT (Interpol / SAPS Database)');
      }
      if (isBlacklist && !riskReasons.includes('Blacklist Security Registry Hit')) {
        riskReasons.push('Blacklist Security Registry Hit');
      }
    } else if (isTampered) {
      riskScore = Math.max(riskScore, 65);
      status = 'SUSPICIOUS';
      if (!riskReasons.includes('Document Security Hologram Tamper Alert')) {
        riskReasons.push('Document Security Hologram Tamper Alert');
      }
    }

    let auraTicketId: string | undefined = undefined;

    // Trigger AURA dispatch automatically if high risk
    if (status === 'HIGH_RISK_FLAGGED' || riskScore >= 80) {
      const ticket = this.createAuraTicket({
        priority: 'CRITICAL_ARMED_RESPONSE',
        triggerSource: 'QDENTIFI_AUTO_HIGH_RISK',
        scanId: id,
        officerId: scanData.officerId || 'unit_01',
        officerName: scanData.officerName || 'Field Officer',
        locationLat: scanData.gpsLat || -26.145,
        locationLng: scanData.gpsLng || 28.041,
        address: scanData.locationName || 'Live Field Scan GPS Location',
        assignedResponderUnit: 'AURA Rapid Armed Unit-07',
        responderVehicleType: 'Toyota Land Cruiser Armored',
        notes: `AUTOMATED AURA DISPATCH: High Risk Scan (${scanData.subjectName || 'Suspect'}) - ${riskReasons.join(', ')}`,
      });
      auraTicketId = ticket.id;
    }

    const newScan: IdentityScan = {
      id,
      scanUuid,
      officerId: scanData.officerId || 'unit_01',
      officerName: scanData.officerName || 'Sgt. Thabo Molefe',
      officerCallSign: scanData.officerCallSign || 'EAGLE-1',
      subjectName: scanData.subjectName || 'Unknown Subject',
      idNumber: scanData.idNumber || '0000000000000',
      idType: scanData.idType || 'NATIONAL_ID_CARD',
      nationality: scanData.nationality || 'South Africa',
      dateOfBirth: scanData.dateOfBirth || '1990-01-01',
      gender: scanData.gender || 'M',
      status,
      riskScore,
      riskReasons: riskReasons.length > 0 ? riskReasons : ['Verified against civil registry'],
      auraTicketId,
      photoUrl: scanData.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&fit=crop&crop=faces',
      docFrontUrl: scanData.docFrontUrl,
      docBackUrl: scanData.docBackUrl,
      confidenceScore: scanData.confidenceScore || 96.5,
      mrzRaw: scanData.mrzRaw,
      verificationFlags: scanData.verificationFlags || {
        faceMatchScore: 97.0,
        tamperDetected: false,
        blacklistHit: false,
        wantedPersonAlert: false,
        expiredDocument: false,
        mrzChecksumValid: true,
      },
      gpsLat: scanData.gpsLat || -26.1452,
      gpsLng: scanData.gpsLng || 28.0418,
      locationName: scanData.locationName || 'Patrol Perimeter Sector 4',
      timestamp: scanData.timestamp || new Date().toISOString(),
      deviceModel: scanData.deviceModel || 'QDentiFi Rugged Android Field Client v3.4',
      syncedToCloud: true,
    };

    this.identityScans.unshift(newScan);

    // Update officer scan count
    const unit = this.patrolUnits.find(u => u.id === newScan.officerId);
    if (unit) {
      unit.activeScanCount += 1;
      unit.lastLat = newScan.gpsLat;
      unit.lastLng = newScan.gpsLng;
      unit.lastPing = new Date().toISOString();
    }

    // Add audit trail entry
    this.addAuditLog({
      eventType: 'IDENTITY_SCAN_INGEST',
      actorId: newScan.officerId,
      actorName: newScan.officerName,
      actorRole: 'MOBILE_OFFICER',
      action: `Identity Scan ingested from QDentiFi: ${newScan.subjectName} (${newScan.status})`,
      targetType: 'IDENTITY_RECORD',
      targetId: newScan.id,
      ipAddress: '197.89.41.15',
      timestamp: new Date().toISOString(),
      details: {
        scanUuid: newScan.scanUuid,
        idType: newScan.idType,
        riskScore: newScan.riskScore,
        auraTicketId: newScan.auraTicketId,
      },
    });

    return newScan;
  }

  public createAuraTicket(params: Partial<AuraDispatchTicket>): AuraDispatchTicket {
    const id = `aura_tk_${Date.now()}`;
    const ticketNumber = `AURA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const ticket: AuraDispatchTicket = {
      id,
      ticketNumber,
      priority: params.priority || 'HIGH_PRIORITY',
      triggerSource: params.triggerSource || 'DISPATCHER_MANUAL',
      scanId: params.scanId,
      officerId: params.officerId || 'unit_01',
      officerName: params.officerName || 'Field Patrol Unit',
      locationLat: params.locationLat || -26.1452,
      locationLng: params.locationLng || 28.0418,
      address: params.address || 'Patrol Point Alpha Sector 1',
      assignedResponderUnit: params.assignedResponderUnit || 'AURA Tactical Rapid Armed Unit 1',
      responderVehicleType: params.responderVehicleType || 'Armored Tactical Hilux',
      responderStatus: 'DISPATCHED',
      etaMinutes: 3,
      notes: params.notes || 'Emergency response initiated via Patrolve Platform core.',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          time: now,
          status: 'DISPATCHED',
          event: `Armed unit dispatched to location (${params.address || 'Field GPS Coordinates'})`,
        },
      ],
    };

    this.auraTickets.unshift(ticket);

    this.addAuditLog({
      eventType: 'AURA_DISPATCH_TRIGGERED',
      actorId: params.officerId || 'system',
      actorName: params.officerName || 'AURA Dispatcher',
      actorRole: params.triggerSource === 'QDENTIFI_AUTO_HIGH_RISK' ? 'SYSTEM_AUTOMATION' : 'CENTRAL_DISPATCHER',
      action: `AURA Emergency Dispatch created: ${ticket.ticketNumber} [Priority: ${ticket.priority}]`,
      targetType: 'AURA_TICKET',
      targetId: ticket.id,
      ipAddress: '10.0.0.2',
      timestamp: now,
      details: {
        ticketNumber: ticket.ticketNumber,
        trigger: ticket.triggerSource,
        scanId: ticket.scanId,
      },
    });

    return ticket;
  }

  public updateAuraTicketStatus(ticketId: string, status: AuraDispatchTicket['responderStatus'], note?: string): AuraDispatchTicket | null {
    const ticket = this.auraTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.responderStatus = status;
    ticket.updatedAt = new Date().toISOString();
    if (status === 'ON_SCENE') {
      ticket.etaMinutes = 0;
    } else if (status === 'RESOLVED') {
      ticket.etaMinutes = 0;
    }

    ticket.timeline.push({
      time: new Date().toISOString(),
      status,
      event: note || `Status transitioned to ${status}`,
    });

    this.addAuditLog({
      eventType: 'AURA_STATUS_UPDATE',
      actorId: 'disp_01',
      actorName: 'Central Dispatch Command',
      actorRole: 'CENTRAL_DISPATCHER',
      action: `AURA Ticket ${ticket.ticketNumber} status changed to ${status}`,
      targetType: 'AURA_TICKET',
      targetId: ticket.id,
      ipAddress: '10.0.0.2',
      timestamp: new Date().toISOString(),
      details: { newStatus: status, note },
    });

    return ticket;
  }

  public updateTelemetry(data: { officerId: string; lat: number; lng: number; speedKmh?: number; heading?: number; batteryLevel?: number }) {
    const unit = this.patrolUnits.find(u => u.id === data.officerId);
    if (unit) {
      unit.lastLat = data.lat;
      unit.lastLng = data.lng;
      if (data.speedKmh !== undefined) unit.speedKmh = data.speedKmh;
      if (data.heading !== undefined) unit.heading = data.heading;
      if (data.batteryLevel !== undefined) unit.batteryLevel = data.batteryLevel;
      unit.lastPing = new Date().toISOString();
    }

    const log: TelemetryLog = {
      id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      officerId: data.officerId,
      officerCallSign: unit ? unit.callSign : 'FIELD-UNIT',
      lat: data.lat,
      lng: data.lng,
      speedKmh: data.speedKmh || 0,
      heading: data.heading || 0,
      batteryLevel: data.batteryLevel || 100,
      signalStrength: 'EXCELLENT',
      networkType: '4G_LTE / SECURE_VPN',
      timestamp: new Date().toISOString(),
    };

    this.telemetryLogs.unshift(log);
    if (this.telemetryLogs.length > 200) {
      this.telemetryLogs.pop();
    }
    return log;
  }

  public executeBackup(): ComplianceBackup {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `patrolve_unified_backup_${dateStr}.sql.gz`;
    const recordCount = this.identityScans.length + this.patrolUnits.length + this.auraTickets.length + this.auditLogs.length;
    const sizeKb = Math.floor(2500 + Math.random() * 1500 + recordCount * 12);
    const checksum = `sha256_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

    const backup: ComplianceBackup = {
      id: `bak_${Date.now()}`,
      filename,
      recordCount,
      sizeKb,
      checksum,
      status: 'VERIFIED',
      type: 'DAILY_FULL',
      timestamp: now.toISOString(),
      retentionUntil: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365 * 5).toISOString(),
    };

    this.backups.unshift(backup);

    this.addAuditLog({
      eventType: 'BACKUP_CREATED',
      actorId: 'cron_scheduler',
      actorName: 'Patrolve Automated Backup Service',
      actorRole: 'SYSTEM_AUTOMATION',
      action: `Automated Compliance Snapshot created: ${filename} (${recordCount} records, Checksum: ${checksum.slice(0, 16)}...)`,
      targetType: 'DATABASE_SNAPSHOT',
      targetId: backup.id,
      ipAddress: '127.0.0.1',
      timestamp: now.toISOString(),
      details: { filename, sizeKb, checksum },
    });

    return backup;
  }
}

export const db = new PatrolveDatabase();
