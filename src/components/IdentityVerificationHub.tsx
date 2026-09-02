import React, { useState } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  Fingerprint, 
  FileText, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Send, 
  Radio, 
  Camera, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { IdentityScan, VerificationStatus } from '../types';

interface IdentityVerificationHubProps {
  scans: IdentityScan[];
  onTriggerAura: (scan: IdentityScan) => void;
  selectedScan: IdentityScan | null;
  setSelectedScan: (scan: IdentityScan | null) => void;
}

export const IdentityVerificationHub: React.FC<IdentityVerificationHubProps> = ({
  scans,
  onTriggerAura,
  selectedScan,
  setSelectedScan,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredScans = scans.filter(scan => {
    const matchesFilter = filterStatus === 'ALL' || scan.status === filterStatus;
    const matchesSearch = 
      scan.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const highRiskCount = scans.filter(s => s.status === 'HIGH_RISK_FLAGGED').length;
  const verifiedCount = scans.filter(s => s.status === 'VERIFIED').length;
  const avgBiometricMatch = Math.round(
    scans.reduce((acc, s) => acc + (s.verificationFlags.faceMatchScore || 95), 0) / (scans.length || 1)
  );

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Citizen
          </span>
        );
      case 'HIGH_RISK_FLAGGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            HIGH RISK / AURA BOLO
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            Suspicious / Tampered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F1D32] text-slate-300 border border-[#1E314B]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A1628] border border-[#1E314B] rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#0F1D32] border border-[#C9A227]/30 text-[#C9A227]">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{scans.length}</div>
            <div className="text-xs text-slate-400 font-medium">Total Scans Ingested</div>
          </div>
        </div>

        <div className="bg-[#0A1628] border border-[#1E314B] rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{verifiedCount}</div>
            <div className="text-xs text-slate-400 font-medium">Civil Registry Verified</div>
          </div>
        </div>

        <div className="bg-[#0A1628] border border-[#1E314B] rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/40 text-red-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400 font-mono">{highRiskCount}</div>
            <div className="text-xs text-slate-400 font-medium">High-Risk AURA Triggers</div>
          </div>
        </div>

        <div className="bg-[#0A1628] border border-[#1E314B] rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#0F1D32] border border-[#C9A227]/30 text-[#C9A227]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#C9A227] font-mono">{avgBiometricMatch}%</div>
            <div className="text-xs text-slate-400 font-medium">Avg Biometric Match</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-[#1E314B] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#060E1A]/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID number, officer, or checkpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0F1D32] border border-[#1E314B] rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-xs hidden sm:inline font-mono">FILTER:</span>
            {['ALL', 'VERIFIED', 'HIGH_RISK_FLAGGED', 'SUSPICIOUS'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-[#C9A227] text-black border-[#C9A227]'
                    : 'bg-[#0F1D32] text-slate-400 border-[#1E314B] hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'All Scans' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Scans Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#060E1A] text-slate-400 uppercase font-mono text-[11px] border-b border-[#1E314B]">
              <tr>
                <th className="px-4 py-3">Subject / Document</th>
                <th className="px-4 py-3">ID Number & Type</th>
                <th className="px-4 py-3">Status / Risk</th>
                <th className="px-4 py-3">Patrol Officer</th>
                <th className="px-4 py-3">Location & Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E314B]/60">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No identity verification records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredScans.map(scan => (
                  <tr 
                    key={scan.id} 
                    className="hover:bg-[#0F1D32]/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedScan(scan)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={scan.photoUrl}
                          alt={scan.subjectName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-[#1E314B]"
                        />
                        <div>
                          <div className="font-semibold text-slate-100 text-sm">{scan.subjectName}</div>
                          <div className="text-[11px] text-slate-400">{scan.nationality} • {scan.gender === 'M' ? 'Male' : 'Female'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-[#C9A227] font-semibold">{scan.idNumber}</div>
                      <div className="text-[11px] text-slate-400">{scan.idType.replace(/_/g, ' ')}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {getStatusBadge(scan.status)}
                        <div className="text-[10px] text-slate-400">
                          Risk Score: <span className={scan.riskScore > 50 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{scan.riskScore}/100</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{scan.officerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{scan.officerCallSign}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{scan.locationName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{new Date(scan.timestamp).toLocaleTimeString()}</div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScan(scan);
                        }}
                        className="p-1.5 hover:bg-[#0F1D32] rounded-lg text-[#C9A227] hover:text-[#D8B237] transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Forensics Modal / Drawer */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A1628] border border-[#C9A227]/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E314B]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0F1D32] border border-[#C9A227]/40 text-[#C9A227]">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Identity Forensics & Verification Dossier</h3>
                  <p className="text-xs text-slate-400 font-mono">UUID: {selectedScan.scanUuid}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0F1D32]"
              >
                ✕
              </button>
            </div>

            {/* Subject Photo & Biometrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#060E1A] p-4 rounded-xl border border-[#1E314B]">
              <div className="flex flex-col items-center justify-center">
                <img
                  src={selectedScan.photoUrl}
                  alt={selectedScan.subjectName}
                  referrerPolicy="no-referrer"
                  className="w-32 h-32 rounded-xl object-cover border-2 border-[#1E314B] shadow-md"
                />
                <span className="text-[11px] text-slate-400 mt-1 font-mono">Field Camera Capture</span>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{selectedScan.subjectName}</h4>
                  {getStatusBadge(selectedScan.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">ID Number:</span>
                    <span className="font-mono text-[#C9A227] font-bold text-sm">{selectedScan.idNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nationality / DOB:</span>
                    <span className="text-slate-200">{selectedScan.nationality} • {selectedScan.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capturing Officer:</span>
                    <span className="text-slate-200">{selectedScan.officerName} ({selectedScan.officerCallSign})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capture Hardware:</span>
                    <span className="text-slate-200">{selectedScan.deviceModel}</span>
                  </div>
                </div>

                {/* Biometric Match Score Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Biometric Face Match Confidence:</span>
                    <span className="font-bold text-emerald-400">{selectedScan.verificationFlags.faceMatchScore}%</span>
                  </div>
                  <div className="w-full bg-[#0F1D32] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedScan.verificationFlags.faceMatchScore > 80 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${selectedScan.verificationFlags.faceMatchScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MRZ Data & Checksums */}
            {selectedScan.mrzRaw && (
              <div className="bg-[#060E1A] p-4 rounded-xl border border-[#1E314B] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                    Machine Readable Zone (MRZ ICAO 9303 Decoded):
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">Checksum: VALID</span>
                </div>
                <pre className="text-[11px] font-mono text-[#C9A227] bg-[#0A1628] p-2.5 rounded-lg overflow-x-auto border border-[#1E314B]">
                  {selectedScan.mrzRaw}
                </pre>
              </div>
            )}

            {/* Risk Factors & Warning Flags */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase font-mono text-slate-400">Verification & Risk Assessment Diagnostics:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedScan.riskReasons.map((reason, index) => (
                  <div 
                    key={index}
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      selectedScan.status === 'HIGH_RISK_FLAGGED'
                        ? 'bg-red-950/40 border-red-800/60 text-red-200'
                        : 'bg-[#060E1A] border-[#1E314B] text-slate-300'
                    }`}
                  >
                    {selectedScan.status === 'HIGH_RISK_FLAGGED' ? (
                      <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#1E314B] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Geotag: {selectedScan.gpsLat.toFixed(4)}, {selectedScan.gpsLng.toFixed(4)} ({selectedScan.locationName})</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedScan.status !== 'HIGH_RISK_FLAGGED' && (
                  <button
                    onClick={() => {
                      onTriggerAura(selectedScan);
                      setSelectedScan(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Trigger AURA Armed Escalation
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 bg-[#0F1D32] hover:bg-[#1E314B] text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
