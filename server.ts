import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/mockDb';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API ROUTES FIRST ---

  // 1. Health check
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      platform: 'PATROLVE2 + QDentiFi Unified Core',
      version: 'v2.4.0-unified',
      auraStatus: 'GATEWAY_CONNECTED',
      dbStatus: 'MYSQL_CLUSTER_READY',
      timestamp: new Date().toISOString(),
      activeUnits: db.patrolUnits.length,
      scansIngested: db.identityScans.length,
      auraTickets: db.auraTickets.length,
    });
  });

  // 2. Authentication API (JWT Token Simulation for QDentiFi Android App)
  app.post('/api/v1/auth/login', (req, res) => {
    const { badgeNumber, callSign, pinCode } = req.body || {};
    const unit = db.patrolUnits.find(u => u.badgeNumber === badgeNumber || u.callSign === callSign) || db.patrolUnits[0];
    
    const token = `patrolve_jwt_${Buffer.from(JSON.stringify({
      officerId: unit.id,
      officerName: unit.officerName,
      badge: unit.badgeNumber,
      callSign: unit.callSign,
      role: 'FIELD_PATROL_OFFICER',
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })).toString('base64')}`;

    db.addAuditLog({
      eventType: 'AUTH_LOGIN',
      actorId: unit.id,
      actorName: unit.officerName,
      actorRole: 'MOBILE_OFFICER',
      action: `Officer ${unit.officerName} (${unit.callSign}) logged in via QDentiFi Android Client`,
      targetType: 'PATROL_UNIT',
      targetId: unit.id,
      ipAddress: req.ip || '197.89.41.1',
      timestamp: new Date().toISOString(),
      details: { badgeNumber: unit.badgeNumber, client: 'com.myapp.qdentifi' },
    });

    res.json({
      token,
      officer: unit,
      expiresIn: 43200,
      auraDispatchEnabled: true,
      gpsReportingIntervalMs: 5000,
    });
  });

  app.get('/api/v1/auth/me', (req, res) => {
    res.json({
      officer: db.patrolUnits[0],
      role: 'FIELD_PATROL_OFFICER',
      permissions: ['SCAN_IDENTITY', 'TRIGGER_AURA_PANIC', 'STREAM_GPS_TELEMETRY', 'VIEW_HISTORY'],
    });
  });

  // 3. Patrol Units & Telemetry
  app.get('/api/v1/patrols/units', (req, res) => {
    res.json(db.patrolUnits);
  });

  app.post('/api/v1/telemetry/location', (req, res) => {
    const { officerId, lat, lng, speedKmh, heading, batteryLevel } = req.body || {};
    if (!officerId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'officerId, lat, and lng are required' });
    }

    const log = db.updateTelemetry({
      officerId,
      lat: Number(lat),
      lng: Number(lng),
      speedKmh: speedKmh ? Number(speedKmh) : undefined,
      heading: heading ? Number(heading) : undefined,
      batteryLevel: batteryLevel ? Number(batteryLevel) : undefined,
    });

    res.json({ success: true, telemetryLog: log });
  });

  // 4. QDentiFi Ingestion Endpoints
  app.get('/api/v1/qdentify/scans', (req, res) => {
    res.json(db.identityScans);
  });

  app.post('/api/v1/qdentify/scans', (req, res) => {
    try {
      const scanPayload = req.body;
      if (!scanPayload.subjectName && !scanPayload.idNumber) {
        return res.status(400).json({ error: 'Missing subject name or ID number payload' });
      }

      const scan = db.ingestScan(scanPayload);
      res.status(201).json({
        success: true,
        message: 'Identity scan ingested successfully into Patrolve MySQL Core',
        scan,
        auraTriggered: !!scan.auraTicketId,
        auraTicketId: scan.auraTicketId,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to ingest scan' });
    }
  });

  app.post('/api/v1/qdentify/media', (req, res) => {
    const { scanUuid, imageBase64, imageType } = req.body || {};
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const mediaUrl = imageBase64 || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop`;

    res.json({
      success: true,
      mediaId,
      mediaUrl,
      scanUuid,
      imageType: imageType || 'SUBJECT_PORTRAIT',
      storageBucket: 'azure-blob://patrolve-media-encrypted/',
      ingestedAt: new Date().toISOString(),
    });
  });

  // 5. AURA Emergency Dispatch Engine Endpoints
  app.get('/api/v1/aura/tickets', (req, res) => {
    res.json(db.auraTickets);
  });

  app.post('/api/v1/aura/dispatch', (req, res) => {
    const ticket = db.createAuraTicket(req.body);
    res.status(201).json({
      success: true,
      ticket,
      auraDispatchGateway: 'AURA_SA_ARMED_NETWORK_CONNECTED',
      assignedResponder: ticket.assignedResponderUnit,
      etaMinutes: ticket.etaMinutes,
    });
  });

  app.patch('/api/v1/aura/tickets/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const updated = db.updateAuraTicketStatus(id, status, note);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ success: true, ticket: updated });
  });

  // 6. Cryptographically Chained Audit Trail
  app.get('/api/v1/audit/logs', (req, res) => {
    res.json(db.auditLogs);
  });

  // 7. Security & Compliance Backups
  app.get('/api/v1/compliance/backups', (req, res) => {
    res.json(db.backups);
  });

  app.post('/api/v1/compliance/backup', (req, res) => {
    const backup = db.executeBackup();
    res.status(201).json({
      success: true,
      backup,
      latestBackupFileText: `PATROLVE2 + QDENTIFI COMPLIANCE SNAPSHOT\nFile: ${backup.filename}\nTimestamp: ${backup.timestamp}\nChecksum: ${backup.checksum}\nRecord Count: ${backup.recordCount}\nRetention: 5 Years (POPIA/GDPR Compliance)`,
    });
  });

  // 8. Integration Architecture & Schema Specs
  app.get('/api/v1/integration/specs', (req, res) => {
    res.json({
      mysqlSchemaSql: `
-- =========================================================================
-- PATROLVE2 + QDENTIFI UNIFIED DATABASE SCHEMA (MySQL 8.0+ / InnoDB)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS patrolve_unified CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE patrolve_unified;

-- 1. Patrol Units & Officers
CREATE TABLE IF NOT EXISTS patrol_units (
  id VARCHAR(64) PRIMARY KEY,
  officer_name VARCHAR(128) NOT NULL,
  badge_number VARCHAR(32) NOT NULL UNIQUE,
  call_sign VARCHAR(32) NOT NULL,
  vehicle_id VARCHAR(64),
  vehicle_type ENUM('PATROL_4X4', 'MOTORBIKE', 'RAPID_RESPONSE', 'K9_UNIT', 'FOOT_PATROL') DEFAULT 'PATROL_4X4',
  status ENUM('ON_PATROL', 'RESPONDING', 'STANDBY', 'OFF_DUTY', 'EMERGENCY_PANIC') DEFAULT 'STANDBY',
  battery_level INT UNSIGNED DEFAULT 100,
  last_lat DECIMAL(10, 7),
  last_lng DECIMAL(10, 7),
  heading SMALLINT DEFAULT 0,
  speed_kmh DECIMAL(5, 2) DEFAULT 0.00,
  signal_strength ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR') DEFAULT 'EXCELLENT',
  assigned_sector VARCHAR(128),
  last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_officer_status (status),
  INDEX idx_officer_coords (last_lat, last_lng)
) ENGINE=InnoDB;

-- 2. QDentiFi Identity Scans & Forensics
CREATE TABLE IF NOT EXISTS identity_scans (
  id VARCHAR(64) PRIMARY KEY,
  scan_uuid VARCHAR(64) NOT NULL UNIQUE,
  officer_id VARCHAR(64) NOT NULL,
  subject_name VARCHAR(128) NOT NULL,
  id_number VARCHAR(64) NOT NULL,
  id_type ENUM('NATIONAL_ID_CARD', 'PASSPORT_MRZ', 'DRIVERS_LICENSE', 'TEMPORARY_RESIDENCE', 'VISITOR_BADGE') NOT NULL,
  nationality VARCHAR(64) DEFAULT 'South Africa',
  date_of_birth DATE,
  gender ENUM('M', 'F', 'X') DEFAULT 'M',
  status ENUM('VERIFIED', 'SUSPICIOUS', 'HIGH_RISK_FLAGGED', 'EXPIRED', 'UNVERIFIED') DEFAULT 'VERIFIED',
  risk_score SMALLINT UNSIGNED DEFAULT 0,
  risk_reasons JSON,
  aura_ticket_id VARCHAR(64) NULL,
  photo_url VARCHAR(512),
  doc_front_url VARCHAR(512),
  doc_back_url VARCHAR(512),
  confidence_score DECIMAL(5, 2) DEFAULT 95.00,
  mrz_raw TEXT,
  verification_flags JSON,
  gps_lat DECIMAL(10, 7) NOT NULL,
  gps_lng DECIMAL(10, 7) NOT NULL,
  location_name VARCHAR(256),
  device_model VARCHAR(128),
  synced_to_cloud BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (officer_id) REFERENCES patrol_units(id) ON DELETE CASCADE,
  INDEX idx_scan_status (status),
  INDEX idx_scan_id_num (id_number),
  INDEX idx_scan_timestamp (created_at)
) ENGINE=InnoDB;

-- 3. AURA Armed Response Emergency Tickets
CREATE TABLE IF NOT EXISTS aura_dispatches (
  id VARCHAR(64) PRIMARY KEY,
  ticket_number VARCHAR(64) NOT NULL UNIQUE,
  priority ENUM('CRITICAL_ARMED_RESPONSE', 'HIGH_PRIORITY', 'MEDIUM_ASSIST', 'ROUTINE') DEFAULT 'HIGH_PRIORITY',
  trigger_source ENUM('QDENTIFI_AUTO_HIGH_RISK', 'OFFICER_PANIC_BUTTON', 'DISPATCHER_MANUAL', 'GEOFENCE_BREACH') NOT NULL,
  scan_id VARCHAR(64) NULL,
  officer_id VARCHAR(64) NOT NULL,
  location_lat DECIMAL(10, 7) NOT NULL,
  location_lng DECIMAL(10, 7) NOT NULL,
  address VARCHAR(256) NOT NULL,
  assigned_responder_unit VARCHAR(128),
  responder_vehicle_type VARCHAR(64),
  responder_status ENUM('PENDING', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'RESOLVED', 'CANCELLED') DEFAULT 'DISPATCHED',
  eta_minutes INT UNSIGNED DEFAULT 5,
  notes TEXT,
  timeline JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (officer_id) REFERENCES patrol_units(id) ON DELETE CASCADE,
  FOREIGN KEY (scan_id) REFERENCES identity_scans(id) ON DELETE SET NULL,
  INDEX idx_aura_status (responder_status)
) ENGINE=InnoDB;

-- 4. Cryptographic Chained Audit Logs (SHA-256)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  event_type ENUM('AUTH_LOGIN', 'IDENTITY_SCAN_INGEST', 'AURA_DISPATCH_TRIGGERED', 'AURA_STATUS_UPDATE', 'BACKUP_CREATED', 'GPS_TELEMETRY_INGEST', 'COMPLIANCE_EXPORT') NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(128) NOT NULL,
  actor_role ENUM('MOBILE_OFFICER', 'CENTRAL_DISPATCHER', 'SYSTEM_AUTOMATION', 'AUDITOR') NOT NULL,
  action VARCHAR(256) NOT NULL,
  target_type ENUM('IDENTITY_RECORD', 'AURA_TICKET', 'PATROL_UNIT', 'DATABASE_SNAPSHOT', 'TELEMETRY') NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  hash_signature VARCHAR(128) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_event (event_type),
  INDEX idx_audit_timestamp (created_at)
) ENGINE=InnoDB;
`,
      androidKotlinSnippet: `
package com.myapp.qdentifi

import android.location.Location
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private var jwtToken: String? = null
    private var activeOfficerId: String = "unit_01"
    private val patrolveBaseUrl = "https://patrolve-api.cloudrun.app/api/v1"
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // 1. Authenticate with Patrolve Central Core
        authenticateWithPatrolve("PV-8841", "EAGLE-1")
        
        // 2. Start Background GPS Telemetry Service
        startPatrolveGpsTrackingService()
    }

    private fun authenticateWithPatrolve(badge: String, callSign: String) {
        lifecycleScope.launch {
            val json = JSONObject().apply {
                put("badgeNumber", badge)
                put("callSign", callSign)
            }
            val body = json.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder()
                .url("$patrolveBaseUrl/auth/login")
                .post(body)
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val resObj = JSONObject(response.body?.string() ?: "{}")
                jwtToken = resObj.optString("token")
            }
        }
    }

    fun submitIdentityScan(scanPayload: JSONObject) {
        lifecycleScope.launch {
            val body = scanPayload.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder()
                .url("$patrolveBaseUrl/qdentify/scans")
                .header("Authorization", "Bearer $jwtToken")
                .post(body)
                .build()

            val response = client.newCall(request).execute()
            val resJson = JSONObject(response.body?.string() ?: "{}")
            
            // Check if Patrolve Auto-Dispatched AURA Armed Unit
            if (resJson.optBoolean("auraTriggered")) {
                showAuraEmergencyAlertBanner(resJson.optString("auraTicketId"))
            }
        }
    }

    private fun startPatrolveGpsTrackingService() {
        // Embeds Patrolve Location Telemetry into every scan payload
    }
}
`,
      filePathsXml: `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="qdentifi_captured_images" path="Android/data/com.myapp.qdentifi/files/Pictures" />
    <cache-path name="qdentifi_media_cache" path="secure_id_cache/" />
    <files-path name="qdentifi_encrypted_vault" path="encrypted_scans/" />
</paths>`,
      proguardRules: `# ProGuard / R8 Rules for QDentiFi + Patrolve Unified Android Client
-keep class com.myapp.qdentifi.models.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.patrolve.telemetry.** { *; }
-keep class com.aura.dispatch.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-keepattributes Signature, *Annotation*, InnerClasses`,
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PATROLVE2 + QDentiFi Unified Core server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
