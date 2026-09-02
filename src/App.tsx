import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TacticalMap } from './components/TacticalMap';
import { IdentityVerificationHub } from './components/IdentityVerificationHub';
import { AuraDispatchEngine } from './components/AuraDispatchEngine';
import { PatrolTelemetryTracker } from './components/PatrolTelemetryTracker';
import { AuditAndCompliance } from './components/AuditAndCompliance';
import { ArchitectureIntegrationHub } from './components/ArchitectureIntegrationHub';
import { QDentiFiMobileSimulator } from './components/QDentiFiMobileSimulator';
import { 
  IdentityScan, 
  PatrolUnit, 
  AuraDispatchTicket, 
  AuditLog, 
  ComplianceBackup, 
  TelemetryLog,
  SupportedLanguage,
  AuraTicketStatus
} from './types';
import { soundManager } from './utils/audio';

export default function App() {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [viewMode, setViewMode] = useState<'admin' | 'mobile' | 'dual'>('admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Application Data States
  const [scans, setScans] = useState<IdentityScan[]>([]);
  const [units, setUnits] = useState<PatrolUnit[]>([]);
  const [auraTickets, setAuraTickets] = useState<AuraDispatchTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backups, setBackups] = useState<ComplianceBackup[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);

  // Selected Inspect Entities
  const [selectedScan, setSelectedScan] = useState<IdentityScan | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<PatrolUnit | null>(null);
  const [selectedAuraTicket, setSelectedAuraTicket] = useState<AuraDispatchTicket | null>(null);

  // Initial Fetch from Express API
  const fetchAllData = async () => {
    try {
      const [unitsRes, scansRes, auraRes, auditRes, backupsRes] = await Promise.all([
        fetch('/api/v1/patrols/units').then(r => r.json()),
        fetch('/api/v1/qdentify/scans').then(r => r.json()),
        fetch('/api/v1/aura/tickets').then(r => r.json()),
        fetch('/api/v1/audit/logs').then(r => r.json()),
        fetch('/api/v1/compliance/backups').then(r => r.json()),
      ]);

      if (Array.isArray(unitsRes)) setUnits(unitsRes);
      if (Array.isArray(scansRes)) setScans(scansRes);
      if (Array.isArray(auraRes)) setAuraTickets(auraRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      if (Array.isArray(backupsRes)) setBackups(backupsRes);
    } catch (e) {
      console.error('Error loading initial data from Patrolve API:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers for Ingesting Scans from QDentiFi Mobile
  const handleIngestScan = async (scanData: Partial<IdentityScan>) => {
    try {
      const response = await fetch('/api/v1/qdentify/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData),
      });
      const data = await response.json();
      if (data.success && data.scan) {
        setScans(prev => [data.scan, ...prev]);
        fetchAllData(); // Refresh all linked data (audit, aura tickets, telemetry)

        if (data.auraTriggered) {
          soundManager.playAlertSiren();
        }
      }
    } catch (e) {
      console.error('Error submitting scan to Patrolve core:', e);
    }
  };

  // Telemetry Ingestion from QDentiFi Mobile
  const handleSendTelemetry = async (lat: number, lng: number) => {
    try {
      const officerId = units[0]?.id || 'unit_01';
      const response = await fetch('/api/v1/telemetry/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId,
          lat,
          lng,
          speedKmh: Math.floor(20 + Math.random() * 25),
          heading: Math.floor(Math.random() * 360),
          batteryLevel: 94,
        }),
      });
      const data = await response.json();
      if (data.success && data.telemetryLog) {
        setTelemetryLogs(prev => [data.telemetryLog, ...prev.slice(0, 30)]);
        setUnits(prev => prev.map(u => u.id === officerId ? { ...u, lastLat: lat, lastLng: lng } : u));
      }
    } catch (e) {
      console.error('Error sending telemetry:', e);
    }
  };

  // Trigger AURA Armed Dispatch
  const handleTriggerAura = async (scan: IdentityScan) => {
    try {
      const response = await fetch('/api/v1/aura/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: 'CRITICAL_ARMED_RESPONSE',
          triggerSource: 'DISPATCHER_MANUAL',
          scanId: scan.id,
          officerId: scan.officerId,
          officerName: scan.officerName,
          locationLat: scan.gpsLat,
          locationLng: scan.gpsLng,
          address: scan.locationName,
          assignedResponderUnit: 'AURA Tactical Rapid Armed Unit-04',
          notes: `Manual Dispatch Escalation for Scan: ${scan.subjectName} (${scan.idNumber})`,
        }),
      });
      const data = await response.json();
      if (data.success && data.ticket) {
        setAuraTickets(prev => [data.ticket, ...prev]);
        soundManager.playAlertSiren();
        setActiveTab('aura');
        fetchAllData();
      }
    } catch (e) {
      console.error('Error triggering AURA dispatch:', e);
    }
  };

  const handleCreateManualAuraTicket = async (data: Partial<AuraDispatchTicket>) => {
    try {
      const response = await fetch('/api/v1/aura/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (resData.success && resData.ticket) {
        setAuraTickets(prev => [resData.ticket, ...prev]);
        fetchAllData();
      }
    } catch (e) {
      console.error('Error creating manual AURA ticket:', e);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: AuraTicketStatus, note?: string) => {
    try {
      const response = await fetch(`/api/v1/aura/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const data = await response.json();
      if (data.success && data.ticket) {
        setAuraTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
        fetchAllData();
      }
    } catch (e) {
      console.error('Error updating AURA ticket status:', e);
    }
  };

  const handleExecuteBackup = async () => {
    try {
      const response = await fetch('/api/v1/compliance/backup', { method: 'POST' });
      const data = await response.json();
      if (data.success && data.backup) {
        setBackups(prev => [data.backup, ...prev]);
        soundManager.playScanSuccess();
        fetchAllData();
      }
    } catch (e) {
      console.error('Error creating backup snapshot:', e);
    }
  };

  // Quick Simulation Scenarios
  const handleQuickSimulate = (type: 'wanted' | 'valid' | 'backup') => {
    if (type === 'wanted') {
      handleIngestScan({
        subjectName: 'Viktor Romanov',
        idNumber: 'P892100419',
        idType: 'PASSPORT_MRZ',
        nationality: 'Estonia / EU',
        dateOfBirth: '1979-11-20',
        gender: 'M',
        status: 'HIGH_RISK_FLAGGED',
        riskScore: 98,
        riskReasons: [
          'INTERPOL RED NOTICE: Wanted for International Wire Extradition',
          'Automated AURA Armed Response dispatch triggered',
        ],
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&crop=faces',
        mrzRaw: 'PESTROMANOV<<VIKTOR<<<<<<<<<<<<<<<<<<P892100419EST7911204M2809151<<<<<<<<<<4',
        locationName: 'Sandton Corporate Access Gate 1',
        verificationFlags: {
          faceMatchScore: 97.2,
          tamperDetected: true,
          blacklistHit: true,
          wantedPersonAlert: true,
          expiredDocument: false,
          mrzChecksumValid: true,
        },
        gpsLat: -26.148,
        gpsLng: 28.044,
      });
    } else if (type === 'valid') {
      handleIngestScan({
        subjectName: 'Bongani Khumalo',
        idNumber: '8803155123089',
        idType: 'NATIONAL_ID_CARD',
        nationality: 'South Africa',
        dateOfBirth: '1988-03-15',
        gender: 'M',
        status: 'VERIFIED',
        riskScore: 3,
        riskReasons: ['Civil Registry Verified 99.4%'],
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=faces',
        locationName: 'Oxford Road Checkpoint 3',
        verificationFlags: {
          faceMatchScore: 99.1,
          tamperDetected: false,
          blacklistHit: false,
          wantedPersonAlert: false,
          expiredDocument: false,
          mrzChecksumValid: true,
        },
        gpsLat: -26.145,
        gpsLng: 28.041,
      });
    } else if (type === 'backup') {
      handleExecuteBackup();
    }
  };

  const activeAuraCount = auraTickets.filter(t => t.responderStatus !== 'RESOLVED' && t.responderStatus !== 'CANCELLED').length;
  const primaryOfficer = units[0] || {
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
    lastPing: new Date().toISOString(),
    assignedSector: 'Rosebank Sector A',
    activeScanCount: 14,
  };

  return (
    <div className="min-h-screen bg-[#060E1A] text-slate-100 flex flex-col font-sans">
      
      {/* Platform Header */}
      <Header
        lang={lang}
        setLang={setLang}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        activeAuraCount={activeAuraCount}
        onQuickSimulate={handleQuickSimulate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW MODE 1: Standalone QDentiFi Mobile App */}
        {viewMode === 'mobile' && (
          <div className="flex flex-col items-center justify-center py-4">
            <QDentiFiMobileSimulator
              activeUnit={primaryOfficer}
              onIngestScan={handleIngestScan}
              onSendTelemetry={handleSendTelemetry}
            />
          </div>
        )}

        {/* VIEW MODE 2: Dual Split-Screen (Patrolve Command Hub + QDentiFi Android App) */}
        {viewMode === 'dual' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Tactical Command Center (8 Cols) */}
            <div className="xl:col-span-8 space-y-6">
              <TacticalMap
                units={units}
                scans={scans}
                auraTickets={auraTickets}
                onSelectScan={setSelectedScan}
                onSelectUnit={setSelectedUnit}
                onSelectAuraTicket={setSelectedAuraTicket}
              />

              {activeTab === 'scans' && (
                <IdentityVerificationHub
                  scans={scans}
                  onTriggerAura={handleTriggerAura}
                  selectedScan={selectedScan}
                  setSelectedScan={setSelectedScan}
                />
              )}

              {activeTab === 'aura' && (
                <AuraDispatchEngine
                  tickets={auraTickets}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  onCreateManualTicket={handleCreateManualAuraTicket}
                />
              )}

              {activeTab === 'telemetry' && (
                <PatrolTelemetryTracker
                  units={units}
                  telemetryLogs={telemetryLogs}
                  onSelectUnit={setSelectedUnit}
                />
              )}

              {activeTab === 'audit' && (
                <AuditAndCompliance
                  auditLogs={auditLogs}
                  backups={backups}
                  onExecuteBackup={handleExecuteBackup}
                />
              )}

              {activeTab === 'architecture' && (
                <ArchitectureIntegrationHub />
              )}

              {activeTab === 'dashboard' && (
                <IdentityVerificationHub
                  scans={scans.slice(0, 5)}
                  onTriggerAura={handleTriggerAura}
                  selectedScan={selectedScan}
                  setSelectedScan={setSelectedScan}
                />
              )}
            </div>

            {/* Right Column: Live QDentiFi Android Field App Simulator (4 Cols) */}
            <div className="xl:col-span-4 flex flex-col items-center">
              <div className="sticky top-20 w-full">
                <QDentiFiMobileSimulator
                  activeUnit={primaryOfficer}
                  onIngestScan={handleIngestScan}
                  onSendTelemetry={handleSendTelemetry}
                />
              </div>
            </div>

          </div>
        )}

        {/* VIEW MODE 3: Patrolve Admin Command Hub */}
        {viewMode === 'admin' && (
          <div className="space-y-6">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <TacticalMap
                  units={units}
                  scans={scans}
                  auraTickets={auraTickets}
                  onSelectScan={setSelectedScan}
                  onSelectUnit={setSelectedUnit}
                  onSelectAuraTicket={setSelectedAuraTicket}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase font-mono text-slate-400 mb-3">
                      Recent Identity Verifications Feed
                    </h3>
                    <IdentityVerificationHub
                      scans={scans.slice(0, 6)}
                      onTriggerAura={handleTriggerAura}
                      selectedScan={selectedScan}
                      setSelectedScan={setSelectedScan}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase font-mono text-slate-400 mb-3">
                      AURA Armed Response Dispatch Status
                    </h3>
                    <AuraDispatchEngine
                      tickets={auraTickets}
                      onUpdateTicketStatus={handleUpdateTicketStatus}
                      onCreateManualTicket={handleCreateManualAuraTicket}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scans' && (
              <IdentityVerificationHub
                scans={scans}
                onTriggerAura={handleTriggerAura}
                selectedScan={selectedScan}
                setSelectedScan={setSelectedScan}
              />
            )}

            {activeTab === 'aura' && (
              <AuraDispatchEngine
                tickets={auraTickets}
                onUpdateTicketStatus={handleUpdateTicketStatus}
                onCreateManualTicket={handleCreateManualAuraTicket}
              />
            )}

            {activeTab === 'telemetry' && (
              <PatrolTelemetryTracker
                units={units}
                telemetryLogs={telemetryLogs}
                onSelectUnit={setSelectedUnit}
              />
            )}

            {activeTab === 'audit' && (
              <AuditAndCompliance
                auditLogs={auditLogs}
                backups={backups}
                onExecuteBackup={handleExecuteBackup}
              />
            )}

            {activeTab === 'architecture' && (
              <ArchitectureIntegrationHub />
            )}

          </div>
        )}

      </main>

      {/* Security Footer */}
      <footer className="bg-[#060E1A] border-t border-[#1E314B] py-4 text-xs text-slate-400 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#C9A227] font-bold">JB3OPSSEC UNIFIED PLATFORM</span>
            <span>&bull;</span>
            <span>v2.4.0 (Enterprise)</span>
          </div>
          <div className="text-slate-400">POPIA &bull; GDPR &bull; ISO/IEC 27001 COMPLIANT &bull; AURA ARMED NETWORK CONNECTED</div>
        </div>
      </footer>

    </div>
  );
}
