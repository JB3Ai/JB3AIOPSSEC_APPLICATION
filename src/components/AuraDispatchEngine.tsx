import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Car, 
  Radio, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Plus, 
  MapPin, 
  PhoneCall, 
  Send, 
  Sparkles, 
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuraDispatchTicket, AuraTicketStatus } from '../types';
import { soundManager } from '../utils/audio';

interface AuraDispatchEngineProps {
  tickets: AuraDispatchTicket[];
  onUpdateTicketStatus: (ticketId: string, status: AuraTicketStatus, note?: string) => void;
  onCreateManualTicket: (data: Partial<AuraDispatchTicket>) => void;
}

export const AuraDispatchEngine: React.FC<AuraDispatchEngineProps> = ({
  tickets,
  onUpdateTicketStatus,
  onCreateManualTicket,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<AuraDispatchTicket | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualAddress, setManualAddress] = useState('Oxford Road Corporate Park Gate 1, Rosebank');
  const [manualPriority, setManualPriority] = useState<AuraDispatchTicket['priority']>('CRITICAL_ARMED_RESPONSE');
  const [manualNotes, setManualNotes] = useState('Officer panic button triggered - suspect armed');

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateManualTicket({
      address: manualAddress,
      priority: manualPriority,
      notes: manualNotes,
      triggerSource: 'DISPATCHER_MANUAL',
    });
    setShowManualModal(false);
    soundManager.playAlertSiren();
  };

  const handleAdvanceStatus = (ticket: AuraDispatchTicket) => {
    let nextStatus: AuraTicketStatus = 'EN_ROUTE';
    let note = '';

    if (ticket.responderStatus === 'DISPATCHED') {
      nextStatus = 'EN_ROUTE';
      note = 'Armed Tactical unit engaged blue lights & siren. ETA 2 mins.';
      soundManager.playDispatchChime();
    } else if (ticket.responderStatus === 'EN_ROUTE') {
      nextStatus = 'ON_SCENE';
      note = 'Tactical unit arrived on scene. Perimeter secured.';
      soundManager.playDispatchChime();
    } else if (ticket.responderStatus === 'ON_SCENE') {
      nextStatus = 'RESOLVED';
      note = 'Incident neutralized. Suspect detained. Case handed to SAPS.';
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onUpdateTicketStatus(ticket.id, nextStatus, note);
  };

  const activeTickets = tickets.filter(t => t.responderStatus !== 'RESOLVED' && t.responderStatus !== 'CANCELLED');
  const resolvedTickets = tickets.filter(t => t.responderStatus === 'RESOLVED');

  const getPriorityBadge = (priority: AuraDispatchTicket['priority']) => {
    switch (priority) {
      case 'CRITICAL_ARMED_RESPONSE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">CRITICAL ARMED RESPONSE</span>;
      case 'HIGH_PRIORITY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40">HIGH PRIORITY</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F1D32] text-slate-300 border border-[#1E314B]">ROUTINE BACKUP</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Manual Dispatch Trigger */}
      <div className="bg-gradient-to-r from-red-950/60 via-[#0A1628] to-[#0A1628] border border-red-900/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                JB3OPSSEC AURA Dispatch Gateway
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
                  LIVE ARMED NETWORK ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connects field security incidents directly to external armed response networks via automated QDentiFi triggers in Gauteng.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Dispatch Armed Response Unit
        </button>
      </div>

      {/* Active Dispatch Incidents Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase font-mono text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400" />
          Active Armed Response Tickets ({activeTickets.length})
        </h3>

        {activeTickets.length === 0 ? (
          <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-base font-semibold text-white">All Security Sectors Normal</div>
            <p className="text-xs max-w-md mx-auto">
              No active emergency tickets at this moment. Any high-risk identity scan or officer panic trigger will instantly activate armed responder dispatch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeTickets.map(ticket => (
              <div 
                key={ticket.id}
                className="bg-[#0A1628] border-2 border-red-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4"
              >
                {/* Top Ticket Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1E314B]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-red-400">{ticket.ticketNumber}</span>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Trigger: <span className="font-semibold text-slate-200">{ticket.triggerSource.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-[#C9A227] font-bold flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      ETA: {ticket.etaMinutes} MIN
                    </div>
                    <div className="text-[10px] text-slate-500">Target SLA: &lt; 5 mins</div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Incident Location:</span>
                    <span className="text-slate-200 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {ticket.address}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Assigned Armed Unit:</span>
                    <span className="text-[#C9A227] font-semibold flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      {ticket.assignedResponderUnit || 'AURA Tactical Team 1'}
                    </span>
                  </div>

                  <div className="col-span-2 bg-[#060E1A] p-2.5 rounded-xl border border-[#1E314B]">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Incident Dispatch Notes:</span>
                    <span className="text-slate-300">{ticket.notes}</span>
                  </div>
                </div>

                {/* Status Timeline / Steps */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>Response Lifecycle:</span>
                    <span className="font-bold text-[#C9A227] uppercase">{ticket.responderStatus}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-semibold">
                    {['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE'].map((step, idx) => {
                      const isPastOrCurrent = 
                        (ticket.responderStatus === 'DISPATCHED' && idx <= 1) ||
                        (ticket.responderStatus === 'EN_ROUTE' && idx <= 2) ||
                        (ticket.responderStatus === 'ON_SCENE' && idx <= 3);
                      return (
                        <div
                          key={step}
                          className={`py-1.5 rounded-lg border transition-colors ${
                            ticket.responderStatus === step
                              ? 'bg-red-600 text-white border-red-500 font-bold animate-pulse'
                              : isPastOrCurrent
                              ? 'bg-[#0F1D32] text-slate-300 border-[#1E314B]'
                              : 'bg-[#060E1A] text-slate-600 border-[#1E314B]'
                          }`}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advance Button */}
                <div className="pt-2 border-t border-[#1E314B] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Timeline Logs
                  </button>

                  <button
                    onClick={() => handleAdvanceStatus(ticket)}
                    className="px-4 py-2 bg-[#C9A227] hover:bg-[#D8B237] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <span>
                      {ticket.responderStatus === 'DISPATCHED' && 'Advance: Armed Unit En Route'}
                      {ticket.responderStatus === 'EN_ROUTE' && 'Advance: Unit Arrived On Scene'}
                      {ticket.responderStatus === 'ON_SCENE' && 'Resolve & Close Ticket'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Tickets Table */}
      {resolvedTickets.length > 0 && (
        <div className="bg-[#0A1628] border border-[#1E314B] rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-semibold uppercase font-mono text-slate-400">
            Resolved Armed Dispatch Incidents ({resolvedTickets.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#060E1A] text-slate-400 uppercase font-mono text-[10px] border-b border-[#1E314B]">
                <tr>
                  <th className="p-2.5">Ticket</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">Assigned Unit</th>
                  <th className="p-2.5">Resolved At</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E314B]">
                {resolvedTickets.map(t => (
                  <tr key={t.id} className="hover:bg-[#0F1D32]/60">
                    <td className="p-2.5 font-mono text-[#C9A227] font-semibold">{t.ticketNumber}</td>
                    <td className="p-2.5">{getPriorityBadge(t.priority)}</td>
                    <td className="p-2.5">{t.address}</td>
                    <td className="p-2.5">{t.assignedResponderUnit}</td>
                    <td className="p-2.5 text-slate-400">{new Date(t.updatedAt).toLocaleTimeString()}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        RESOLVED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Dispatch Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-[#C9A227]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E314B]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Trigger Manual AURA Armed Response
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Incident Address / Sector:</label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#060E1A] border border-[#1E314B] rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Priority Level:</label>
                <select
                  value={manualPriority}
                  onChange={(e) => setManualPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-[#060E1A] border border-[#1E314B] rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
                >
                  <option value="CRITICAL_ARMED_RESPONSE">CRITICAL ARMED RESPONSE (Armed suspect / Panic)</option>
                  <option value="HIGH_PRIORITY">HIGH PRIORITY (Perimeter breach / Unverified fugitive)</option>
                  <option value="MEDIUM_ASSIST">MEDIUM ASSIST (Officer backup request)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Dispatcher Operational Notes:</label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={3}
                  required
                  className="w-full p-2.5 bg-[#060E1A] border border-[#1E314B] rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              <div className="pt-3 border-t border-[#1E314B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-[#0F1D32] hover:bg-[#1E314B] text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30"
                >
                  <Zap className="w-4 h-4" />
                  Transmit Live AURA Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Timeline Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-[#C9A227]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E314B]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#C9A227]" />
                AURA Dispatch Lifecycle: {selectedTicket.ticketNumber}
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              {selectedTicket.timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#C9A227] mt-1.5 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">{new Date(event.time).toLocaleTimeString()}</div>
                    <div className="font-semibold text-slate-200">{event.status}</div>
                    <div className="text-slate-400">{event.event}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1E314B] flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
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
