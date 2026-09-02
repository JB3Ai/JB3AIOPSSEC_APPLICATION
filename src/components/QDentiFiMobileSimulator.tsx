import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Smartphone, 
  Radio, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Send, 
  Scan, 
  User, 
  MapPin, 
  Battery, 
  Wifi, 
  WifiOff, 
  AlertOctagon,
  Sparkles,
  Zap,
  Fingerprint
} from 'lucide-react';
import { IdentityScan, PatrolUnit } from '../types';
import { soundManager } from '../utils/audio';

interface QDentiFiMobileSimulatorProps {
  onIngestScan: (scanData: Partial<IdentityScan>) => void;
  activeUnit: PatrolUnit;
  onSendTelemetry: (lat: number, lng: number) => void;
}

export const QDentiFiMobileSimulator: React.FC<QDentiFiMobileSimulatorProps> = ({
  onIngestScan,
  activeUnit,
  onSendTelemetry,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<Partial<IdentityScan>[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<'wanted' | 'valid_sa' | 'valid_fr' | 'tampered'>('valid_sa');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isGpsStreaming, setIsGpsStreaming] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<IdentityScan | null>(null);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ID Presets for realistic field demonstrations
  const presets = {
    valid_sa: {
      subjectName: 'Bongani Khumalo',
      idNumber: '8803155123089',
      idType: 'NATIONAL_ID_CARD' as const,
      nationality: 'South Africa',
      dateOfBirth: '1988-03-15',
      gender: 'M' as const,
      status: 'VERIFIED' as const,
      riskScore: 4,
      riskReasons: ['Civil Home Affairs Match 99.4%', 'No active criminal warrants'],
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=faces',
      mrzRaw: 'IDZAF8803155123089<<<<<<<<<<<<<8803155M2901014ZAF<<<<<<<<<<<2',
      locationName: 'Oxford Road Access Gate 3',
      verificationFlags: {
        faceMatchScore: 98.4,
        tamperDetected: false,
        blacklistHit: false,
        wantedPersonAlert: false,
        expiredDocument: false,
        mrzChecksumValid: true,
      },
    },
    wanted: {
      subjectName: 'Viktor Romanov',
      idNumber: 'P892100419',
      idType: 'PASSPORT_MRZ' as const,
      nationality: 'Estonia / EU',
      dateOfBirth: '1979-11-20',
      gender: 'M' as const,
      status: 'HIGH_RISK_FLAGGED' as const,
      riskScore: 96,
      riskReasons: [
        'INTERPOL RED NOTICE: Wanted for International Wire Extradition',
        'Civil database positive hit for high-risk fugitive',
        'Auto AURA Armed Response dispatch triggered',
      ],
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&crop=faces',
      mrzRaw: 'PESTROMANOV<<VIKTOR<<<<<<<<<<<<<<<<<<P892100419EST7911204M2809151<<<<<<<<<<4',
      locationName: 'Melrose Arch VIP Valet Bay',
      verificationFlags: {
        faceMatchScore: 96.2,
        tamperDetected: true,
        blacklistHit: true,
        wantedPersonAlert: true,
        expiredDocument: false,
        mrzChecksumValid: true,
      },
    },
    valid_fr: {
      subjectName: 'Claire Dubois',
      idNumber: 'FR-DL-994120',
      idType: 'DRIVERS_LICENSE' as const,
      nationality: 'France',
      dateOfBirth: '1992-06-04',
      gender: 'F' as const,
      status: 'VERIFIED' as const,
      riskScore: 6,
      riskReasons: ['International permit verified', 'Biometric face match 97.8%'],
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&crop=faces',
      locationName: 'Hyde Park Checkpoint 2',
      verificationFlags: {
        faceMatchScore: 97.8,
        tamperDetected: false,
        blacklistHit: false,
        wantedPersonAlert: false,
        expiredDocument: false,
        mrzChecksumValid: true,
      },
    },
    tampered: {
      subjectName: 'Alex Mercer (FORGED)',
      idNumber: 'SA-FORGED-0019',
      idType: 'NATIONAL_ID_CARD' as const,
      nationality: 'Unknown',
      dateOfBirth: '1985-02-12',
      gender: 'M' as const,
      status: 'SUSPICIOUS' as const,
      riskScore: 68,
      riskReasons: ['Hologram security thread missing', 'MRZ checksum disparity'],
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&fit=crop&crop=faces',
      locationName: 'Sector 4 Perimeter Gate',
      verificationFlags: {
        faceMatchScore: 72.1,
        tamperDetected: true,
        blacklistHit: false,
        wantedPersonAlert: false,
        expiredDocument: true,
        mrzChecksumValid: false,
      },
    },
  };

  // Real Webcam handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useRealCamera && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setUseRealCamera(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useRealCamera]);

  // Periodic simulated GPS Telemetry pinging
  useEffect(() => {
    if (!isGpsStreaming) return;
    const interval = setInterval(() => {
      // Add slight GPS jitter
      const jitterLat = activeUnit.lastLat + (Math.random() - 0.5) * 0.0004;
      const jitterLng = activeUnit.lastLng + (Math.random() - 0.5) * 0.0004;
      onSendTelemetry(jitterLat, jitterLng);
    }, 6000);
    return () => clearInterval(interval);
  }, [isGpsStreaming, activeUnit, onSendTelemetry]);

  const handleTriggerScan = () => {
    setIsScanning(true);
    soundManager.playDispatchChime();

    setTimeout(() => {
      const preset = presets[selectedPreset];
      const scanPayload: Partial<IdentityScan> = {
        ...preset,
        officerId: activeUnit.id,
        officerName: activeUnit.officerName,
        officerCallSign: activeUnit.callSign,
        gpsLat: activeUnit.lastLat + (Math.random() - 0.5) * 0.0002,
        gpsLng: activeUnit.lastLng + (Math.random() - 0.5) * 0.0002,
        timestamp: new Date().toISOString(),
        deviceModel: 'JB3OPSSEC Field Client (Rugged Android v3.4)',
      };

      if (!isOnline) {
        setOfflineQueue(prev => [scanPayload, ...prev]);
        setIsScanning(false);
        return;
      }

      onIngestScan(scanPayload);
      setIsScanning(false);

      if (preset.status === 'HIGH_RISK_FLAGGED') {
        soundManager.playAlertSiren();
      } else {
        soundManager.playScanSuccess();
      }
    }, 1200);
  };

  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    offlineQueue.forEach(item => {
      onIngestScan(item);
    });
    setOfflineQueue([]);
    soundManager.playScanSuccess();
  };

  const currentPreset = presets[selectedPreset];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6">
      
      {/* Smartphone Device Frame */}
      <div className="w-full max-w-[390px] bg-[#060E1A] border-4 border-[#1E314B] rounded-[44px] shadow-2xl overflow-hidden ring-4 ring-black/80 flex flex-col h-[740px] relative select-none">
        
        {/* Android Top Speaker & Camera Notch */}
        <div className="h-7 bg-black flex items-center justify-between px-6 pt-1">
          <div className="text-[11px] font-mono font-bold text-slate-300">09:41</div>
          <div className="w-20 h-4 bg-[#0A1628] rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0F1D32] border border-[#C9A227]/40" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
            <span className="text-[10px] font-mono text-[#C9A227]">{activeUnit.batteryLevel}%</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* QDentiFi Native App Header */}
        <div className="bg-[#0A1628] px-4 py-2.5 border-b border-[#1E314B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F1D32] border border-[#C9A227]/50 flex items-center justify-center text-[#C9A227]">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white tracking-tight flex items-center gap-1">
                JB3 QDentiFi <span className="text-[9px] px-1 rounded bg-[#0F1D32] text-[#C9A227] font-mono border border-[#C9A227]/30">v3.4</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {activeUnit.officerName.split(' ')[0]} ({activeUnit.callSign})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                isOnline ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
              }`}
            >
              {isOnline ? 'CLOUD ON' : 'OFFLINE'}
            </button>
          </div>
        </div>

        {/* Main App Body */}
        <div className="flex-1 bg-[#060E1A] p-3 overflow-y-auto space-y-3">
          
          {/* Live Camera Viewfinder / Scanner Area */}
          <div className="relative bg-[#0A1628] border-2 border-[#1E314B] rounded-2xl h-52 overflow-hidden flex items-center justify-center">
            
            {useRealCamera ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full relative">
                <img
                  src={currentPreset.photoUrl}
                  alt={currentPreset.subjectName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060E1A] via-transparent to-black/40" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-semibold bg-black/70 px-2.5 py-1 rounded backdrop-blur-sm flex justify-between border border-[#1E314B]">
                  <span>{currentPreset.subjectName}</span>
                  <span className="font-mono text-[#C9A227]">{currentPreset.idNumber}</span>
                </div>
              </div>
            )}

            {/* Scanner HUD Overlay */}
            <div className="absolute inset-4 border border-[#C9A227]/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-[#C9A227]" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-[#C9A227]" />
              </div>
              <div className="text-center font-mono text-[10px] text-[#C9A227] tracking-wider">
                [ ALIGN ID CARD / PASSPORT MRZ ]
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-[#C9A227]" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-[#C9A227]" />
              </div>
            </div>

            {/* Animated Laser Scanning Beam */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent shadow-lg shadow-[#C9A227]/80 animate-bounce" />
            )}
          </div>

          {/* Preset Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>DOCUMENT & SUBJECT PRESET:</span>
              <button
                onClick={() => setUseRealCamera(!useRealCamera)}
                className="text-[#C9A227] underline font-semibold"
              >
                {useRealCamera ? 'Switch to ID Presets' : 'Use Device Camera'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => setSelectedPreset('valid_sa')}
                className={`p-2 rounded-xl border text-left transition-colors ${
                  selectedPreset === 'valid_sa'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#0A1628] border-[#1E314B] text-slate-400'
                }`}
              >
                <div className="text-xs">South African Smart ID</div>
                <div className="text-[10px] opacity-70">Verified Citizen</div>
              </button>

              <button
                onClick={() => setSelectedPreset('wanted')}
                className={`p-2 rounded-xl border text-left transition-colors ${
                  selectedPreset === 'wanted'
                    ? 'bg-red-950/80 border-red-500 text-red-300 font-bold animate-pulse'
                    : 'bg-[#0A1628] border-[#1E314B] text-slate-400'
                }`}
              >
                <div className="text-xs text-red-400">Interpol Red Notice</div>
                <div className="text-[10px] text-red-300">High-Risk AURA Alert</div>
              </button>

              <button
                onClick={() => setSelectedPreset('valid_fr')}
                className={`p-2 rounded-xl border text-left transition-colors ${
                  selectedPreset === 'valid_fr'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#0A1628] border-[#1E314B] text-slate-400'
                }`}
              >
                <div className="text-xs">Drivers License (EU)</div>
                <div className="text-[10px] opacity-70">Valid Permit</div>
              </button>

              <button
                onClick={() => setSelectedPreset('tampered')}
                className={`p-2 rounded-xl border text-left transition-colors ${
                  selectedPreset === 'tampered'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#0A1628] border-[#1E314B] text-slate-400'
                }`}
              >
                <div className="text-xs text-amber-400">Tampered Document</div>
                <div className="text-[10px] text-amber-300">Hologram Check Fail</div>
              </button>
            </div>
          </div>

          {/* Offline Queue Badge if offline */}
          {!isOnline && offlineQueue.length > 0 && (
            <div className="bg-amber-950/60 border border-amber-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-300">
              <span>{offlineQueue.length} scans queued offline in local vault</span>
              <button
                onClick={handleSyncOfflineQueue}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg text-[10px]"
              >
                Sync All Now
              </button>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="pt-1 space-y-2">
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="w-full py-3 bg-[#C9A227] hover:bg-[#D8B237] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Processing OCR & Biometrics...' : 'EXECUTE IDENTITY SCAN & SYNC'}</span>
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGpsStreaming}
                  onChange={(e) => setIsGpsStreaming(e.target.checked)}
                  className="rounded bg-[#0A1628] border-[#1E314B] text-[#C9A227] focus:ring-0"
                />
                <span>Background GPS Telemetry Service</span>
              </label>
              <span className="text-emerald-400 font-mono">GPS: {activeUnit.lastLat.toFixed(3)}, {activeUnit.lastLng.toFixed(3)}</span>
            </div>
          </div>

        </div>

        {/* Android Home Navigation Bar */}
        <div className="h-10 bg-black flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>

      </div>

    </div>
  );
};
