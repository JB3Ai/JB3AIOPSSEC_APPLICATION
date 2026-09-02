import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  Radio, 
  ShieldAlert, 
  MapPin, 
  Car, 
  User, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  Battery
} from 'lucide-react';
import { PatrolUnit, IdentityScan, AuraDispatchTicket } from '../types';

interface TacticalMapProps {
  units: PatrolUnit[];
  scans: IdentityScan[];
  auraTickets: AuraDispatchTicket[];
  onSelectScan: (scan: IdentityScan) => void;
  onSelectUnit: (unit: PatrolUnit) => void;
  onSelectAuraTicket: (ticket: AuraDispatchTicket) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  units,
  scans,
  auraTickets,
  onSelectScan,
  onSelectUnit,
  onSelectAuraTicket,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showScans, setShowScans] = useState(true);
  const [showAuraRouting, setShowAuraRouting] = useState(true);

  // Map Bounds / Coordinate normalization (Gauteng: Sandton/Rosebank sector -26.15, 28.04)
  const baseLat = -26.150;
  const baseLng = 28.042;
  const latSpan = 0.035;
  const lngSpan = 0.035;

  const projectCoords = (lat: number, lng: number) => {
    // Map to 0-1000 viewBox coordinate system
    const x = ((lng - (baseLng - lngSpan / 2)) / lngSpan) * 1000;
    const y = (((baseLat + latSpan / 2) - lat) / latSpan) * 1000;
    return { x: Math.max(50, Math.min(950, x)), y: Math.max(50, Math.min(950, y)) };
  };

  const activeAuraTickets = auraTickets.filter(t => t.responderStatus !== 'RESOLVED' && t.responderStatus !== 'CANCELLED');

  return (
    <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[560px]">
      
      {/* Map Control Toolbar */}
      <div className="bg-[#060E1A]/90 px-4 py-2.5 border-b border-[#1E314B] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
            <Radio className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <span className="tracking-wide font-sans">JB3OPSSEC GAUTENG TACTICAL RADAR</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 font-mono font-semibold">
            SECTOR: JHB-SANDTON-ALPHA
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              showGeofences 
                ? 'bg-[#0F1D32] text-[#C9A227] border-[#C9A227]/50' 
                : 'bg-[#060E1A] text-slate-500 border-[#1E314B]'
            }`}
          >
            Geofence Zones
          </button>

          <button
            onClick={() => setShowScans(!showScans)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              showScans 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                : 'bg-[#060E1A] text-slate-500 border-[#1E314B]'
            }`}
          >
            ID Geotags ({scans.length})
          </button>

          <button
            onClick={() => setShowAuraRouting(!showAuraRouting)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              showAuraRouting 
                ? 'bg-red-950/80 text-red-300 border-red-700/60' 
                : 'bg-[#060E1A] text-slate-500 border-[#1E314B]'
            }`}
          >
            AURA Armed Vectors ({activeAuraTickets.length})
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#060E1A] border border-[#1E314B] rounded-lg p-0.5">
            <button 
              onClick={() => setZoom(z => Math.max(0.8, z - 0.2))} 
              className="p-1 hover:bg-[#0F1D32] rounded text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-300">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(1.8, z + 0.2))} 
              className="p-1 hover:bg-[#0F1D32] rounded text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-1 bg-[#060E1A] overflow-hidden cursor-crosshair">
        
        {/* Radar Scanner background grid */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A227 1px, transparent 1px), linear-gradient(to right, #1E314B 1px, transparent 1px), linear-gradient(to bottom, #1E314B 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 80px 80px, 80px 80px'
          }}
        />

        {/* Live SVG Vector Layer */}
        <svg 
          viewBox="0 0 1000 1000" 
          className="w-full h-full object-cover transition-transform duration-300 select-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Defs for gradients & patterns */}
          <defs>
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#0A1628" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#060E1A" stopOpacity="0" />
            </radialGradient>
            <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#C9A227" strokeWidth="1" strokeOpacity="0.25" />
            </pattern>
          </defs>

          {/* Road / Sector Arteries Simulation */}
          <g stroke="#1E314B" strokeWidth="8" strokeLinecap="round" opacity="0.6">
            <line x1="100" y1="200" x2="900" y2="220" />
            <line x1="80" y1="500" x2="920" y2="480" />
            <line x1="120" y1="800" x2="880" y2="820" />
            <line x1="250" y1="80" x2="280" y2="920" />
            <line x1="500" y1="50" x2="510" y2="950" />
            <line x1="750" y1="90" x2="720" y2="910" />
          </g>

          {/* Concentric Sector Rings */}
          <circle cx="500" cy="500" r="180" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="4,6" opacity="0.35" />
          <circle cx="500" cy="500" r="360" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="6,8" opacity="0.25" />

          {/* Geofence Security Zones */}
          {showGeofences && (
            <g>
              {/* VIP Estate Zone */}
              <polygon
                points="220,180 420,160 460,340 240,360"
                fill="url(#diagonalHatch)"
                stroke="#C9A227"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.8"
              />
              <text x="240" y="200" fill="#C9A227" fontSize="13" fontFamily="monospace" fontWeight="bold">
                ZONE ALPHA: SANDTON EMBASSY PRECINCT
              </text>

              {/* Transit Mall Zone */}
              <polygon
                points="540,440 820,420 860,680 580,710"
                fill="#0F1D32"
                fillOpacity="0.5"
                stroke="#1E314B"
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.9"
              />
              <text x="560" y="470" fill="#94A3B8" fontSize="13" fontFamily="monospace" fontWeight="600">
                ZONE BRAVO: ROSEBANK ARTERIAL
              </text>
            </g>
          )}

          {/* Active AURA Armed Response Vectors */}
          {showAuraRouting && activeAuraTickets.map(ticket => {
            const incidentPos = projectCoords(ticket.locationLat, ticket.locationLng);
            const responderUnit = units.find(u => u.callSign === 'AURA-TACTICAL-1' || u.vehicleType === 'RAPID_RESPONSE') || units[2];
            const responderPos = projectCoords(responderUnit.lastLat, responderUnit.lastLng);

            return (
              <g key={ticket.id} className="cursor-pointer" onClick={() => onSelectAuraTicket(ticket)}>
                {/* Tactical Dispatch Vector */}
                <line
                  x1={responderPos.x}
                  y1={responderPos.y}
                  x2={incidentPos.x}
                  y2={incidentPos.y}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="8,6"
                  className="animate-pulse"
                />

                {/* Pulsing High-Risk Incident Beacon */}
                <circle cx={incidentPos.x} cy={incidentPos.y} r="28" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
                <circle cx={incidentPos.x} cy={incidentPos.y} r="18" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2.5" />
                <text x={incidentPos.x} y={incidentPos.y + 4} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  !
                </text>

                {/* Dispatch Tag */}
                <rect
                  x={incidentPos.x - 75}
                  y={incidentPos.y - 42}
                  width="150"
                  height="22"
                  rx="4"
                  fill="#0A1628"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <text x={incidentPos.x} y={incidentPos.y - 27} textAnchor="middle" fill="#fee2e2" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  AURA ARMED ETA: {ticket.etaMinutes} MIN
                </text>
              </g>
            );
          })}

          {/* Identity Scans Geotags */}
          {showScans && scans.map(scan => {
            const pos = projectCoords(scan.gpsLat, scan.gpsLng);
            const isHighRisk = scan.status === 'HIGH_RISK_FLAGGED';
            const isSuspicious = scan.status === 'SUSPICIOUS';
            const strokeColor = isHighRisk ? '#ef4444' : isSuspicious ? '#C9A227' : '#10b981';
            const fillColor = isHighRisk ? '#7f1d1d' : isSuspicious ? '#42330b' : '#064e3b';

            return (
              <g
                key={scan.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  setSelectedEntity(scan);
                  onSelectScan(scan);
                }}
              >
                <circle cx={pos.x} cy={pos.y} r="10" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
                <circle cx={pos.x} cy={pos.y} r="4" fill="#ffffff" />
                {/* Subject Name Tag */}
                <text x={pos.x + 14} y={pos.y + 4} fill={strokeColor} fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                  {scan.subjectName.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Patrol Units with Vehicles & Heading Vectors */}
          {units.map(unit => {
            const pos = projectCoords(unit.lastLat, unit.lastLng);
            const isAura = unit.callSign.includes('AURA') || unit.vehicleType === 'RAPID_RESPONSE';

            return (
              <g
                key={unit.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  setSelectedEntity(unit);
                  onSelectUnit(unit);
                }}
              >
                {/* Heading Arrow */}
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={pos.x + Math.sin((unit.heading * Math.PI) / 180) * 26}
                  y2={pos.y - Math.cos((unit.heading * Math.PI) / 180) * 26}
                  stroke={isAura ? '#ef4444' : '#C9A227'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Unit Icon Pin */}
                <rect
                  x={pos.x - 14}
                  y={pos.y - 14}
                  width="28"
                  height="28"
                  rx="6"
                  fill={isAura ? '#991b1b' : '#0F1D32'}
                  stroke={isAura ? '#fca5a5' : '#C9A227'}
                  strokeWidth="2"
                />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {unit.callSign.slice(0, 3)}
                </text>

                {/* Unit Tag Label */}
                <rect
                  x={pos.x - 45}
                  y={pos.y + 18}
                  width="90"
                  height="16"
                  rx="3"
                  fill="#060E1A"
                  fillOpacity="0.95"
                  stroke={isAura ? '#ef4444' : '#1E314B'}
                  strokeWidth="1"
                />
                <text x={pos.x} y={pos.y + 30} textAnchor="middle" fill="#e2e8f0" fontSize="9" fontFamily="monospace" fontWeight="600">
                  {unit.callSign} • {unit.speedKmh}km/h
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Entity Quick Inspector Overlay */}
        {selectedEntity && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 bg-[#0A1628]/95 border border-[#C9A227]/40 rounded-xl p-3 backdrop-blur-md shadow-2xl z-20 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E314B]">
              <div className="flex items-center gap-1.5 font-bold text-slate-100">
                {selectedEntity.officerName ? (
                  <>
                    <User className="w-4 h-4 text-[#C9A227]" />
                    <span>{selectedEntity.officerName}</span>
                    <span className="font-mono text-[#C9A227]">({selectedEntity.callSign})</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-[#C9A227]" />
                    <span>Scan: {selectedEntity.subjectName}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#0F1D32]"
              >
                ✕
              </button>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2 text-slate-300">
              {selectedEntity.vehicleType ? (
                <>
                  <div>
                    <span className="text-slate-500 block">Status:</span>
                    <span className="font-semibold text-emerald-400">{selectedEntity.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Battery:</span>
                    <span className="font-mono">{selectedEntity.batteryLevel}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Sector:</span>
                    <span>{selectedEntity.assignedSector}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-slate-500 block">ID Number:</span>
                    <span className="font-mono">{selectedEntity.idNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Risk Score:</span>
                    <span className={`font-bold ${selectedEntity.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {selectedEntity.riskScore}/100
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Location:</span>
                    <span>{selectedEntity.locationName}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
