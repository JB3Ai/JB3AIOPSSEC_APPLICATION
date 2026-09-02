import React, { useState } from 'react';
import { 
  Radio, 
  Battery, 
  BatteryWarning, 
  Signal, 
  Compass, 
  Car, 
  ShieldCheck, 
  User, 
  Clock, 
  MapPin, 
  Send,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { PatrolUnit, TelemetryLog } from '../types';

interface PatrolTelemetryTrackerProps {
  units: PatrolUnit[];
  telemetryLogs: TelemetryLog[];
  onSelectUnit: (unit: PatrolUnit) => void;
}

export const PatrolTelemetryTracker: React.FC<PatrolTelemetryTrackerProps> = ({
  units,
  telemetryLogs,
  onSelectUnit,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');

  const activeUnit = units.find(u => u.id === selectedUnitId) || units[0];

  const getVehicleBadge = (type: PatrolUnit['vehicleType']) => {
    switch (type) {
      case 'RAPID_RESPONSE':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800 font-mono">ARMORED RAPID RESPONSE</span>;
      case 'MOTORBIKE':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40 font-mono">TACTICAL MOTORBIKE</span>;
      case 'K9_UNIT':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-400 border border-purple-800 font-mono">K-9 SPECIAL UNIT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F1D32] text-slate-300 border border-[#1E314B] font-mono">PATROL 4X4</span>;
    }
  };

  const getStatusBadge = (status: PatrolUnit['status']) => {
    switch (status) {
      case 'ON_PATROL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ON ACTIVE PATROL</span>;
      case 'RESPONDING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">RESPONDING TO INCIDENT</span>;
      case 'STANDBY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/40">STANDBY / READY</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#0F1D32] text-slate-400 border border-[#1E314B]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map(unit => {
          const isSelected = unit.id === selectedUnitId;
          const isLowBattery = unit.batteryLevel < 25;

          return (
            <div
              key={unit.id}
              onClick={() => {
                setSelectedUnitId(unit.id);
                onSelectUnit(unit);
              }}
              className={`bg-[#0A1628] border rounded-2xl p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#C9A227] shadow-lg shadow-[#C9A227]/10 ring-1 ring-[#C9A227]/50'
                  : 'border-[#1E314B] hover:border-[#C9A227]/40 hover:bg-[#0F1D32]/60'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1E314B]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F1D32] flex items-center justify-center text-[#C9A227] font-mono font-bold text-xs border border-[#1E314B]">
                    {unit.callSign.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{unit.officerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{unit.badgeNumber} • {unit.callSign}</div>
                  </div>
                </div>
                {getStatusBadge(unit.status)}
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Hardware & Vehicle:</span>
                  <span className="text-slate-200 font-mono text-[11px]">{unit.vehicleId}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Assigned Sector:</span>
                  <span className="text-slate-200 truncate max-w-[130px] font-medium">{unit.assignedSector}</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    {isLowBattery ? (
                      <BatteryWarning className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                    ) : (
                      <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className={isLowBattery ? 'text-red-400 font-bold' : 'text-slate-300 font-mono'}>
                      {unit.batteryLevel}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#C9A227] font-mono font-semibold">
                    <Activity className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>{unit.speedKmh} km/h</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Signal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{unit.signalStrength}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Unit Telemetry Breadcrumbs & Deep Status */}
      {activeUnit && (
        <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#1E314B]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeUnit.officerName}</h3>
                  {getVehicleBadge(activeUnit.vehicleType)}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Call Sign: {activeUnit.callSign} | Vehicle ID: {activeUnit.vehicleId} | GPS: {activeUnit.lastLat.toFixed(4)}, {activeUnit.lastLng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Total Scans Executed Today:</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#0F1D32] text-[#C9A227] font-mono font-bold border border-[#C9A227]/40">
                {activeUnit.activeScanCount}
              </span>
            </div>
          </div>

          {/* Real-time Telemetry Telemetry Stream Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase font-mono text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#C9A227]" />
                Live Ingested GPS Telemetry Logs (Patrolve HTTPS Stream)
              </h4>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                HTTPS Stream Active (5s Interval)
              </span>
            </div>

            <div className="overflow-x-auto bg-[#060E1A] rounded-xl border border-[#1E314B]">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-[#0A1628] text-slate-400 uppercase text-[10px] border-b border-[#1E314B]">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Latitude / Longitude</th>
                    <th className="p-2.5">Speed</th>
                    <th className="p-2.5">Heading</th>
                    <th className="p-2.5">Battery</th>
                    <th className="p-2.5">Network & Tunnel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E314B]/60 text-[11px]">
                  {telemetryLogs.slice(0, 6).map((log, i) => (
                    <tr key={i} className="hover:bg-[#0F1D32]/60">
                      <td className="p-2.5 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2.5 text-[#C9A227] font-semibold">{log.lat.toFixed(5)}, {log.lng.toFixed(5)}</td>
                      <td className="p-2.5 text-slate-200">{log.speedKmh} km/h</td>
                      <td className="p-2.5 text-slate-400">{log.heading}°</td>
                      <td className="p-2.5 text-emerald-400">{log.batteryLevel}%</td>
                      <td className="p-2.5 text-slate-400">{log.networkType}</td>
                    </tr>
                  ))}
                  {telemetryLogs.length === 0 && (
                    <tr>
                      <td className="p-2.5 text-slate-400">{new Date().toLocaleTimeString()}</td>
                      <td className="p-2.5 text-[#C9A227] font-semibold">{activeUnit.lastLat.toFixed(5)}, {activeUnit.lastLng.toFixed(5)}</td>
                      <td className="p-2.5 text-slate-200">{activeUnit.speedKmh} km/h</td>
                      <td className="p-2.5 text-slate-400">{activeUnit.heading}°</td>
                      <td className="p-2.5 text-emerald-400">{activeUnit.batteryLevel}%</td>
                      <td className="p-2.5 text-slate-400">4G_LTE / SECURE_VPN</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
