import React from 'react';
import { 
  Shield, 
  Radio, 
  Smartphone, 
  LayoutDashboard, 
  Columns, 
  Volume2, 
  VolumeX, 
  Globe, 
  Zap, 
  AlertTriangle,
  Database,
  Activity,
  UserCheck
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';
import { soundManager } from '../utils/audio';
import { JB3Logo } from './JB3Logo';

interface HeaderProps {
  lang: SupportedLanguage;
  setLang: (l: SupportedLanguage) => void;
  viewMode: 'admin' | 'mobile' | 'dual';
  setViewMode: (mode: 'admin' | 'mobile' | 'dual') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  activeAuraCount: number;
  onQuickSimulate: (type: 'wanted' | 'valid' | 'backup') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  activeAuraCount,
  onQuickSimulate,
}) => {
  const t = translations[lang] || translations.en;

  const handleToggleSound = () => {
    const nextState = !isMuted;
    soundManager.toggleMute(nextState);
    setIsMuted(nextState);
  };

  return (
    <header className="bg-[#0A1628]/95 border-b border-[#1E314B] sticky top-0 z-40 backdrop-blur-md">
      {/* Top Emergency Bar for Active AURA Escalations */}
      {activeAuraCount > 0 && (
        <div className="bg-red-950/90 text-red-200 border-b border-red-700/80 px-4 py-1.5 flex items-center justify-between text-xs sm:text-sm font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C9A227] animate-bounce" />
            <span className="text-white font-mono">{t.auraAlertDetected} ({activeAuraCount} ACTIVE DISPATCHES)</span>
          </div>
          <button
            onClick={() => {
              setViewMode('admin');
              setActiveTab('aura');
            }}
            className="bg-black/50 hover:bg-black/80 px-2.5 py-0.5 rounded text-xs font-mono uppercase tracking-wider text-[#C9A227] border border-[#C9A227]/40 transition-colors"
          >
            View Live Dispatch &rarr;
          </button>
        </div>
      )}

      {/* Main Brand Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Official JB3OPSSEC Brand Logo & Subtitle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <JB3Logo variant="full" theme="reversed" size="md" />
              <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#1E314B]">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Gauteng Core Online
                </span>
                <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
                  AURA ARMED LINKED
                </span>
              </div>
            </div>

            {/* Mobile View Switcher */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={() => setViewMode(viewMode === 'admin' ? 'mobile' : 'admin')}
                className="px-2.5 py-1 text-xs bg-[#0F1D32] text-slate-200 border border-[#1E314B] rounded-lg flex items-center gap-1.5"
              >
                {viewMode === 'admin' ? <Smartphone className="w-3.5 h-3.5 text-[#C9A227]" /> : <LayoutDashboard className="w-3.5 h-3.5 text-[#C9A227]" />}
                <span>{viewMode === 'admin' ? 'Mobile' : 'Admin'}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions, Mode Switcher & Tools */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* View Mode Toggle */}
            <div className="hidden lg:flex items-center bg-[#060E1A] p-1 rounded-xl border border-[#1E314B] text-xs font-medium">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'admin'
                    ? 'bg-[#C9A227] text-black shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="JB3OPSSEC Tactical Command Hub"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Command Hub</span>
              </button>

              <button
                onClick={() => setViewMode('dual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'dual'
                    ? 'bg-[#C9A227] text-black shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Split Screen Dual Tactical View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Dual Split View</span>
              </button>

              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-[#C9A227] text-black shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="QDentiFi Android Field App Simulator"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>QDentiFi Field App</span>
              </button>
            </div>

            {/* Fast Scenario Simulator */}
            <div className="flex items-center gap-1.5 bg-[#060E1A] p-1 rounded-xl border border-[#1E314B]">
              <button
                onClick={() => onQuickSimulate('wanted')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 transition-colors"
                title="Simulates scanning a high-risk Interpol Red Notice suspect which automatically triggers AURA armed response"
              >
                <Zap className="w-3 h-3 text-red-400" />
                <span className="hidden sm:inline">Simulate</span> Wanted Suspect
              </button>

              <button
                onClick={() => onQuickSimulate('valid')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-[#0F1D32] hover:bg-[#1E314B] text-emerald-300 border border-emerald-800/40 transition-colors"
                title="Simulates scanning a verified citizen ID card"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Simulate</span> Citizen ID
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                !isMuted 
                  ? 'bg-[#C9A227]/10 border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/20' 
                  : 'bg-[#0F1D32] border-[#1E314B] text-slate-400 hover:text-white'
              }`}
              title={isMuted ? 'Tactical Audio Muted' : 'Tactical Audio Siren Active'}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                className="pl-7 pr-3 py-1.5 bg-[#0F1D32] text-slate-200 border border-[#1E314B] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="af">Afrikaans (AF)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="pt">Português (PT)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Tab Navigation with Metallic Gold Accents */}
        {(viewMode === 'admin' || viewMode === 'dual') && (
          <nav className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-[#1E314B] mt-3 text-xs scrollbar-none">
            {[
              { id: 'dashboard', label: t.tabDashboard, icon: LayoutDashboard },
              { id: 'scans', label: t.tabScans, icon: UserCheck },
              { id: 'aura', label: t.tabAura, icon: AlertTriangle, badge: activeAuraCount },
              { id: 'telemetry', label: t.tabTelemetry, icon: Radio },
              { id: 'audit', label: t.tabAudit, icon: Activity },
              { id: 'architecture', label: t.tabArchitecture, icon: Database },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all relative font-semibold ${
                    isActive
                      ? 'bg-[#0F1D32] text-[#C9A227] border border-[#C9A227]/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0F1D32]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A227]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

      </div>
    </header>
  );
};
