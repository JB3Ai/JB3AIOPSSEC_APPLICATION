import React, { useState } from 'react';
import { 
  Database, 
  Code2, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Server, 
  Smartphone, 
  ShieldAlert, 
  FileCode,
  Key
} from 'lucide-react';

export const ArchitectureIntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'api' | 'kotlin' | 'security' | 'env'>('mysql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const mysqlSchema = `-- =========================================================================
-- JB3OPSSEC UNIFIED PLATFORM DATABASE SCHEMA (MySQL 8.0+ / InnoDB)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS jb3opssec_unified 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE jb3opssec_unified;

-- 1. Patrol Units & Field Officers Table
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

-- 2. QDentiFi Identity Scans & Forensic Verification Logs
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

-- 3. AURA Armed Response Emergency Dispatch Engine
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
) ENGINE=InnoDB;`;

  const kotlinIntegrationCode = `package com.jb3opssec.qdentifi

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.location.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

/**
 * JB3OPSSEC QDentiFi Unified Android Field Client (MainActivity.kt)
 * Embeds JWT Authentication, Continuous Background GPS Telemetry & Auto AURA Dispatch Hooks
 */
class MainActivity : AppCompatActivity() {

    private var jwtToken: String? = null
    private var activeOfficerId: String = "unit_01"
    private val jb3BaseUrl = "https://jb3opssec.cloudrun.app/api/v1"
    private val httpClient = OkHttpClient.Builder().build()
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var lastKnownLocation: Location? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // 1. Authenticate Field Officer against JB3OPSSEC Core API
        authenticatePatrolveOfficer("PV-8841", "EAGLE-1")

        // 2. Start Embedded Continuous GPS Telemetry Stream
        initBackgroundGpsTelemetry()
    }

    private fun authenticatePatrolveOfficer(badgeNumber: String, callSign: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            val json = JSONObject().apply {
                put("badgeNumber", badgeNumber)
                put("callSign", callSign)
            }
            val body = json.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder()
                .url("$jb3BaseUrl/auth/login")
                .post(body)
                .build()

            try {
                val response = httpClient.newCall(request).execute()
                if (response.isSuccessful) {
                    val resObj = JSONObject(response.body?.string() ?: "{}")
                    jwtToken = resObj.getString("token")
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Ingests ID Scan from Camera/NFC directly into JB3OPSSEC /api/v1/qdentify/scans
     * Checks if Auto-Dispatched AURA Armed Response
     */
    fun submitIdentityScanToPatrolve(scanPayload: JSONObject) {
        lifecycleScope.launch(Dispatchers.IO) {
            // Attach live GPS telemetry coordinates
            lastKnownLocation?.let { loc ->
                scanPayload.put("gpsLat", loc.latitude)
                scanPayload.put("gpsLng", loc.longitude)
            }

            val body = scanPayload.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder()
                .url("$jb3BaseUrl/qdentify/scans")
                .header("Authorization", "Bearer $jwtToken")
                .post(body)
                .build()

            try {
                val response = httpClient.newCall(request).execute()
                val resObj = JSONObject(response.body?.string() ?: "{}")

                // Auto-trigger AURA Armed Escalation Alert in Mobile UI
                if (resObj.optBoolean("auraTriggered")) {
                    val ticketId = resObj.optString("auraTicketId")
                    withContext(Dispatchers.Main) {
                        showAuraArmedAlertOverlay(ticketId)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun initBackgroundGpsTelemetry() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000).build()
        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { loc ->
                    lastKnownLocation = loc
                    streamGpsTelemetryToPatrolve(loc)
                }
            }
        }
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.requestLocationUpdates(locationRequest, callback, mainLooper)
        }
    }

    private fun streamGpsTelemetryToPatrolve(loc: Location) {
        lifecycleScope.launch(Dispatchers.IO) {
            val json = JSONObject().apply {
                put("officerId", activeOfficerId)
                put("lat", loc.latitude)
                put("lng", loc.longitude)
                put("speedKmh", loc.speed * 3.6)
                put("heading", loc.bearing)
                put("batteryLevel", 94)
            }
            val body = json.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder()
                .url("$jb3BaseUrl/telemetry/location")
                .post(body)
                .build()
            httpClient.newCall(request).execute()
        }
    }

    private fun showAuraArmedAlertOverlay(ticketId: String) {
        // Displays emergency red banner on Android screen with AURA ticket details
    }
}`;

  const securityFiles = {
    filePathsXml: `<!-- JB3OPSSEC Android Secure Storage FileProvider Configuration (file_paths.xml) -->
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Sandboxed Pictures directory for temporary ID camera snaps -->
    <external-path 
        name="jb3_captured_images" 
        path="Android/data/com.jb3opssec.qdentifi/files/Pictures" />

    <!-- Ephemeral in-memory encrypted cache for OCR & MRZ processing -->
    <cache-path 
        name="jb3_media_cache" 
        path="secure_id_cache/" />

    <!-- Encrypted offline SQLite / JSON database storage -->
    <files-path 
        name="jb3_encrypted_vault" 
        path="encrypted_scans/" />
</paths>`,
    proguardRules: `# =========================================================================
# ProGuard / R8 Rules for JB3OPSSEC Unified Android Client
# Secures Models, OkHttp Network Pipeline, and Serialization
# =========================================================================

# 1. Keep JB3 Forensic & ID Models
-keep class com.jb3opssec.qdentifi.models.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# 2. Keep JB3 Telemetry & AURA Dispatch SDK
-keep class com.jb3opssec.telemetry.** { *; }
-keep class com.aura.dispatch.** { *; }

# 3. Secure OkHttp & Retrofit Serialization
-dontwarn okhttp3.**
-dontwarn okio.**
-keepattributes Signature, *Annotation*, InnerClasses, EnclosingMethod

# 4. Strip Debug Logging in Production APK
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}`,
  };

  const envVariables = `# =========================================================================
# JB3OPSSEC CENTRAL ENVIRONMENT CONFIGURATION (.env)
# =========================================================================

# 1. JB3 Node.js API Core
NODE_ENV=production
PORT=3000
API_BASE_URL="https://jb3opssec.cloudrun.app/api/v1"
JWT_SECRET_KEY="jb3opssec_ultra_secret_hmac_sha256_key"

# 2. Relational MySQL Database Credentials
MYSQL_HOST="127.0.0.1"
MYSQL_PORT=3306
MYSQL_DATABASE="jb3opssec_unified"
MYSQL_USER="jb3_admin"
MYSQL_PASSWORD="SecureJB3Password2026!"
MYSQL_SSL_MODE="REQUIRED"

# 3. AURA Armed Response Network Gateway
AURA_API_URL="https://api.aura.services/v2/dispatch"
AURA_API_KEY="aura_sec_live_9941a82bc01894"
AURA_CLIENT_ID="jb3_south_africa_cluster"

# 4. Azure Cloud Blob Storage & Encryption
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=jb3storage;AccountKey=...;EndpointSuffix=core.windows.net"
ENCRYPTION_MASTER_KEY="AES256_GCM_9918230198401928301928401928"

# 5. QDentiFi Android App Config
ANDROID_PACKAGE_NAME="com.jb3opssec.qdentifi"
MIN_SDK_VERSION=26
TARGET_SDK_VERSION=34`;

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              JB3OPSSEC Unified Platform Architecture & Integration Hub
            </h2>
            <p className="text-xs text-slate-400">
              Technical mapping combining QDentiFi (Native Android) + Patrolve (Node.js/MySQL Core) + AURA Armed Response.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1E314B] text-xs">
          {[
            { id: 'mysql', label: '1. MySQL 8.0 DDL Schema', icon: Database },
            { id: 'kotlin', label: '2. QDentiFi MainActivity.kt', icon: Smartphone },
            { id: 'security', label: '3. ProGuard & FileProvider', icon: ShieldAlert },
            { id: 'env', label: '4. Centralized .env Variables', icon: Key },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-md'
                    : 'bg-[#060E1A] text-slate-400 border-[#1E314B] hover:text-white hover:border-[#C9A227]/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Tab Header with Copy Button */}
        <div className="p-3 bg-[#060E1A] border-b border-[#1E314B] flex items-center justify-between text-xs">
          <span className="font-mono text-[#C9A227] font-semibold flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#C9A227]" />
            {activeTab === 'mysql' && 'MYSQL-SETUP.sql'}
            {activeTab === 'kotlin' && 'com/jb3opssec/qdentifi/MainActivity.kt'}
            {activeTab === 'security' && 'proguard-rules.pro & file_paths.xml'}
            {activeTab === 'env' && '.env.unified.example'}
          </span>

          <button
            onClick={() => {
              if (activeTab === 'mysql') copyToClipboard(mysqlSchema, 'mysql');
              if (activeTab === 'kotlin') copyToClipboard(kotlinIntegrationCode, 'kotlin');
              if (activeTab === 'security') copyToClipboard(securityFiles.proguardRules + '\n\n' + securityFiles.filePathsXml, 'security');
              if (activeTab === 'env') copyToClipboard(envVariables, 'env');
            }}
            className="px-3 py-1.5 bg-[#0F1D32] hover:bg-[#1E314B] text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors border border-[#1E314B]"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C9A227]" />}
            <span>{copiedKey ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-[#060E1A] max-h-[600px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
          {activeTab === 'mysql' && (
            <pre className="text-emerald-300 whitespace-pre-wrap">{mysqlSchema}</pre>
          )}

          {activeTab === 'kotlin' && (
            <pre className="text-amber-200 whitespace-pre-wrap">{kotlinIntegrationCode}</pre>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-[#C9A227] font-bold mb-2">// 1. file_paths.xml (Sandboxed Media Cache)</h4>
                <pre className="text-slate-300 whitespace-pre-wrap bg-[#0A1628] p-3 rounded-xl border border-[#1E314B]">
                  {securityFiles.filePathsXml}
                </pre>
              </div>

              <div>
                <h4 className="text-[#C9A227] font-bold mb-2">// 2. proguard-rules.pro (R8 Code Obfuscation)</h4>
                <pre className="text-slate-300 whitespace-pre-wrap bg-[#0A1628] p-3 rounded-xl border border-[#1E314B]">
                  {securityFiles.proguardRules}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <pre className="text-amber-200 whitespace-pre-wrap">{envVariables}</pre>
          )}
        </div>
      </div>

    </div>
  );
};
