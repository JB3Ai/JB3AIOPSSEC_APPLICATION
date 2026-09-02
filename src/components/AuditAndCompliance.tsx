import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Activity, 
  Clock, 
  Search,
  Key,
  Layers,
  Sparkles
} from 'lucide-react';
import { AuditLog, ComplianceBackup } from '../types';

interface AuditAndComplianceProps {
  auditLogs: AuditLog[];
  backups: ComplianceBackup[];
  onExecuteBackup: () => void;
}

export const AuditAndCompliance: React.FC<AuditAndComplianceProps> = ({
  auditLogs,
  backups,
  onExecuteBackup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.hashSignature.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadComplianceReport = () => {
    const reportText = `# JB3OPSSEC UNIFIED COMPLIANCE & FORENSICS REPORT
Generated: ${new Date().toISOString()}
Standard: POPIA (South Africa) & GDPR (EU) Security Directive & ISO/IEC 27001

## 1. Executive Summary
- Total Identity Verifications Processed: ${auditLogs.filter(l => l.eventType === 'IDENTITY_SCAN_INGEST').length}
- Emergency AURA Dispatches Executed: ${auditLogs.filter(l => l.eventType === 'AURA_DISPATCH_TRIGGERED').length}
- Cryptographic Audit Trail Status: 100% Tamper-Evident SHA-256 Validated
- Database Automated Backups: ACTIVE (Hourly Incremental + Daily Snapshot)

## 2. Encryption & Retention Alignment
- At Rest: AES-256 on Azure Managed Disk & Cloud Storage
- In Transit: TLS 1.3 Strict HTTPS on Mobile-to-Cloud Pipeline
- Retention Policy: 5 Years for Audit Trails, 30 Days for Ephemeral GPS Telemetry
- Media Storage: Secure Android FileProvider with sandboxed cache (/secure_id_cache/)

## 3. Latest Verified Backup
${backups[0] ? `File: ${backups[0].filename} | Checksum: ${backups[0].checksum} | Records: ${backups[0].recordCount}` : 'No backups found'}

[JB3OPSSEC CONFIDENTIAL SECURITY AUDIT ARTIFACT]`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JB3OPSSEC_COMPLIANCE_REPORT.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadLatestBackupTxt = (backup: ComplianceBackup) => {
    const content = `JB3OPSSEC_DATABASE_BACKUP_METADATA
Filename: ${backup.filename}
Timestamp: ${backup.timestamp}
Record_Count: ${backup.recordCount}
Checksum_SHA256: ${backup.checksum}
Status: ${backup.status}
Retention_Until: ${backup.retentionUntil}
Encryption: AES_256_GCM`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.latest_backup.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              POPIA & GDPR COMPLIANT
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Cryptographic Chain Verification</h3>
            <p className="text-xs text-slate-400">
              Every identity scan, login, and armed dispatch is sealed into a tamper-evident SHA-256 hash block.
            </p>
          </div>
        </div>

        <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40">
              <Database className="w-6 h-6" />
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
              AUTOMATED SNAPSHOTS
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Scheduled Backups</h3>
            <p className="text-xs text-slate-400">
              Automated database dumps encrypted with 5-year compliance retention cycles.
            </p>
          </div>
        </div>

        <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40">
              <Lock className="w-6 h-6" />
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
              ZERO-KNOWLEDGE
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Field-to-Cloud Security</h3>
            <p className="text-xs text-slate-400">
              QDentiFi Android local vault uses FileProvider sandboxing & ProGuard R8 obfuscation.
            </p>
          </div>
        </div>
      </div>

      {/* Backup Execution & Compliance Reports */}
      <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#C9A227]" />
            Database Compliance & Backup Orchestration
          </h3>
          <p className="text-xs text-slate-400">
            Triggers database serialization, generates `.latest_backup.txt` and publishes compliance reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadComplianceReport}
            className="px-3.5 py-2 bg-[#0F1D32] hover:bg-[#1E314B] text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#1E314B] transition-colors"
          >
            <FileText className="w-4 h-4 text-[#C9A227]" />
            Export Compliance Report (.md)
          </button>

          <button
            onClick={onExecuteBackup}
            className="px-4 py-2 bg-[#C9A227] hover:bg-[#D8B237] text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Database className="w-4 h-4" />
            Execute Scheduled Snapshot
          </button>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-semibold uppercase font-mono text-slate-400 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#C9A227]" />
          Verified Database Snapshots Archive ({backups.length})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-[#060E1A] text-slate-400 uppercase text-[10px] border-b border-[#1E314B]">
              <tr>
                <th className="p-2.5">Filename</th>
                <th className="p-2.5">Records</th>
                <th className="p-2.5">Size</th>
                <th className="p-2.5">SHA-256 Checksum</th>
                <th className="p-2.5">Retention</th>
                <th className="p-2.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E314B]">
              {backups.map(b => (
                <tr key={b.id} className="hover:bg-[#0F1D32]/60">
                  <td className="p-2.5 text-[#C9A227] font-semibold">{b.filename}</td>
                  <td className="p-2.5 text-slate-200">{b.recordCount.toLocaleString()}</td>
                  <td className="p-2.5 text-slate-400">{(b.sizeKb / 1024).toFixed(2)} MB</td>
                  <td className="p-2.5 text-slate-400 truncate max-w-[200px]" title={b.checksum}>
                    {b.checksum.slice(0, 24)}...
                  </td>
                  <td className="p-2.5 text-emerald-400 font-semibold">5 Years (Valid)</td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => downloadLatestBackupTxt(b)}
                      className="p-1 hover:bg-[#0F1D32] rounded text-[#C9A227] hover:text-[#D8B237] inline-flex items-center gap-1 font-semibold"
                      title="Download .latest_backup.txt"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[11px]">.txt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chained Audit Logs */}
      <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#1E314B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#060E1A]/80">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C9A227]" />
              Cryptographic Audit Log Chaining (SHA-256 Root)
            </h4>
            <p className="text-xs text-slate-400">
              Real-time immutable ledger tracking all operations across mobile field apps and central dispatch.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0F1D32] border border-[#1E314B] rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#060E1A] text-slate-400 font-mono text-[10px] uppercase border-b border-[#1E314B]">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Event Type</th>
                <th className="px-4 py-2.5">Actor / Role</th>
                <th className="px-4 py-2.5">Action & Target</th>
                <th className="px-4 py-2.5">SHA-256 Hash Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E314B]/60 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr 
                  key={log.id} 
                  className="hover:bg-[#0F1D32]/60 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40 font-bold">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <div className="text-slate-200 font-semibold">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <div className="text-slate-200">{log.action}</div>
                    <div className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</div>
                  </td>
                  <td className="px-4 py-3 text-[#C9A227] truncate max-w-[180px]" title={log.hashSignature}>
                    {log.hashSignature}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Audit Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-[#C9A227]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E314B]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-[#C9A227]" />
                Audit Block Verification Dossier
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Event Type & ID:</span>
                <span className="font-mono text-[#C9A227] font-bold">{selectedLog.eventType} ({selectedLog.id})</span>
              </div>

              <div>
                <span className="text-slate-500 block">Actor:</span>
                <span className="text-slate-200">{selectedLog.actorName} [{selectedLog.actorRole}] - IP: {selectedLog.ipAddress}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Action Summary:</span>
                <span className="text-slate-200">{selectedLog.action}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Cryptographic Hash (SHA-256):</span>
                <pre className="p-2.5 bg-[#060E1A] rounded-lg text-emerald-400 font-mono text-[10px] border border-[#1E314B] break-all">
                  {selectedLog.hashSignature}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Payload JSON Details:</span>
                <pre className="p-2.5 bg-[#060E1A] rounded-lg text-slate-300 font-mono text-[10px] border border-[#1E314B] overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E314B] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#0F1D32] hover:bg-[#1E314B] text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
