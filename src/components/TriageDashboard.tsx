import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  Radio,
  RefreshCw,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { triageStore } from '../services/triageStore';
import { RedFlagAlert } from '../types';

interface TriageDashboardProps {
  onOpenKiosk: () => void;
}

export const TriageDashboard: React.FC<TriageDashboardProps> = ({ onOpenKiosk }) => {
  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [assignedRooms, setAssignedRooms] = useState<Record<string, string>>({});

  const refreshAlerts = () => {
    setAlerts(triageStore.getAlerts());
  };

  useEffect(() => {
    refreshAlerts();

    const unsubscribe = triageStore.subscribe((newAlert) => {
      refreshAlerts();
      if (soundEnabled && !newAlert.acknowledged) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 tone
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } catch {
          // Audio blocked
        }
      }
    });

    const interval = setInterval(refreshAlerts, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [soundEnabled]);

  const handleAssignDisposition = (alertId: string, disposition: string) => {
    triageStore.assignRoom(alertId, disposition);
    setAssignedRooms((prev) => ({ ...prev, [alertId]: disposition }));
    refreshAlerts();
  };

  const handleResolveAlert = (alertId: string) => {
    triageStore.acknowledgeAlert(alertId, 'Staff Nurse (Triage Bay)');
    refreshAlerts();
  };

  const handleInjectDemoRedFlag = (ruleId: string, title: string, severity: 'CRITICAL' | 'HIGH') => {
    triageStore.addAlert({
      id: `DEMO-ALERT-${Date.now()}`,
      patientId: 'PAT-91-4829',
      patientName: 'Demo Patient',
      patientAge: 58,
      patientGender: 'M',
      tokenNumber: 'A-108',
      timestamp: new Date().toISOString(),
      ruleId,
      severity,
      title,
      description: 'Acute clinical red-flag simulation during SIH evaluation',
      triggerEvidence: 'Voice input: "अचानक बोलने में लड़खड़ाहट और दाएं हाथ में कमजोरी"',
      suggestedAction: 'Immediate stroke protocol, non-contrast CT head, stat neuro review.',
      acknowledged: false,
    });
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const activeCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div id="triage-live-monitor" className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner with Hospital Triage Status */}
      <div className="bg-rose-950 text-white p-6 rounded-3xl mb-6 shadow-lg border border-rose-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center animate-pulse shadow-md">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight">
                Live Emergency Triage &amp; Red-Flag Monitor
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider animate-pulse">
                LIVE KIOSK FEED
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-1 font-medium">
              Autonomous safety surveillance • Zero LLM hallucination risk (Deterministic Rules Evaluator)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
              soundEnabled
                ? 'bg-rose-900 border-rose-700 text-white'
                : 'bg-rose-900/50 border-rose-800 text-rose-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Alarm Audio ON' : 'Alarm Muted'}</span>
          </button>

          <button
            onClick={onOpenKiosk}
            className="py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-rose-950 text-xs font-black shadow transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Kiosk</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Hackathon Demo Injection Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Unresolved</div>
            <div className="text-3xl font-black text-rose-600 mt-1">{activeCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Triggered</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{alerts.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Quick Simulator Buttons for Judges */}
        <div className="md:col-span-2 p-5 bg-slate-900 text-white rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
              ⚡ SIH Evaluator Trigger Injector
            </span>
            <span className="text-[10px] text-slate-400">Deterministic Engine</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                handleInjectDemoRedFlag(
                  'RF_STROKE_FAST',
                  'Acute Stroke Suspected (Sudden Speech Slur + Weakness)',
                  'CRITICAL'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
            >
              + Inject Stroke Alert
            </button>
            <button
              onClick={() =>
                handleInjectDemoRedFlag(
                  'RF_ANAPHYLAXIS',
                  'Acute Anaphylaxis / Stridor (Severe Allergy)',
                  'CRITICAL'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
            >
              + Inject Anaphylaxis Alert
            </button>
            <button
              onClick={() =>
                handleInjectDemoRedFlag(
                  'RF_SEPSIS_FEVER',
                  'qSOFA Sepsis Screen Positive (High Fever + Hypotension)',
                  'HIGH'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all"
            >
              + Inject Sepsis Alert
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter:</span>
          {(['ALL', 'CRITICAL', 'HIGH'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <button
          onClick={refreshAlerts}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Feed Cards */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-900 mb-1">All Clear - No Active Alerts</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No critical red flags currently active. Any patient mentioning chest pressure, facial droop, or acute hemorrhage will alert here within 200 milliseconds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isResolved = alert.acknowledged;
            const assigned = assignedRooms[alert.id] || alert.assignedRoom;

            return (
              <div
                key={alert.id}
                className={`p-6 rounded-3xl border-2 transition-all shadow-md ${
                  isResolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-200'
                    : 'bg-amber-50/70 border-amber-500'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {alert.severity} PRIORITY ALERT
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600">
                      Token: {alert.tokenNumber || 'A-108'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                  </div>

                  {assigned && (
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
                      Assigned: {assigned}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-black text-slate-900 mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-sm font-semibold text-rose-900">
                    Patient Trigger / Evidence: <span className="italic font-normal">"{alert.triggerEvidence}"</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {alert.suggestedAction}
                  </p>
                </div>

                {/* Routing & Action Buttons */}
                {!isResolved && (
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="text-slate-500 py-1.5 mr-1">Direct to:</span>
                      <button
                        onClick={() => handleAssignDisposition(alert.id, 'Resuscitation Bay 1')}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:border-slate-400"
                      >
                        Resuscitation Bay
                      </button>
                      <button
                        onClick={() => handleAssignDisposition(alert.id, 'Emergency / Trauma Centre')}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:border-slate-400"
                      >
                        Trauma Centre
                      </button>
                      <button
                        onClick={() => handleAssignDisposition(alert.id, 'Priority OPD Room 12')}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:border-slate-400"
                      >
                        Priority Room 12
                      </button>
                    </div>

                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition-all active:scale-95"
                    >
                      Acknowledge &amp; Escort Patient
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
