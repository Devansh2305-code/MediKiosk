import React from 'react';
import {
  AlertCircle,
  Clock,
  Eye,
  Globe,
  HelpCircle,
  Moon,
  RefreshCw,
  Sun,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { LanguageCode } from '../types';

interface KioskHeaderProps {
  currentStep: 'language' | 'abha' | 'consent' | 'interview' | 'ayush' | 'documents' | 'review' | 'done';
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSizeMultiplier: number;
  onChangeFontSize: () => void;
  speechRate: number;
  onChangeSpeechRate: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onNeedHelp: () => void;
  onStartOver: () => void;
  activeView: 'kiosk' | 'doctor' | 'triage' | 'demo';
  onSelectView: (view: 'kiosk' | 'doctor' | 'triage' | 'demo') => void;
  unreadAlertCount?: number;
  idleCountdown?: number;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  currentStep,
  language,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
  fontSizeMultiplier,
  onChangeFontSize,
  speechRate,
  onChangeSpeechRate,
  muted,
  onToggleMute,
  onNeedHelp,
  onStartOver,
  activeView,
  onSelectView,
  unreadAlertCount = 0,
  idleCountdown,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const steps = [
    { id: 'abha', label: t.stepIdentify, icon: '🆔' },
    { id: 'interview', label: t.stepTalk, icon: '🗣️' },
    { id: 'documents', label: t.stepScan, icon: '📄' },
    { id: 'review', label: t.stepReview, icon: '📋' },
    { id: 'done', label: t.stepDone, icon: '🎫' },
  ];

  const getStepIndex = (step: string) => {
    if (step === 'language' || step === 'abha' || step === 'consent') return 0;
    if (step === 'interview' || step === 'ayush') return 1;
    if (step === 'documents') return 2;
    if (step === 'review') return 3;
    if (step === 'done') return 4;
    return 0;
  };

  const currentIdx = getStepIndex(currentStep);

  return (
    <header
      id="kiosk-global-header"
      className={`w-full border-b transition-colors shadow-sm sticky top-0 z-40 ${
        highContrast ? 'bg-black text-yellow-300 border-yellow-500' : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Indian Healthcare National Mission Micro Accent Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-sky-100 via-white to-emerald-600" />

      {/* Top Banner with Hospital Title and System Mode Switches */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-teal-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-500/20 border border-white/40">
            +
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-base leading-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 bg-clip-text text-transparent">
                {t.appName}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 font-bold border border-emerald-300/80 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ABDM First-Mile
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span>🏛️ AIIMS / Apex Public Hospital OPD Gateway</span>
            </p>
          </div>
        </div>

        {/* View Switcher: Patient Kiosk vs Doctor vs Triage vs Demo */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 text-xs font-bold gap-1 shadow-xs">
          <button
            id="nav-btn-kiosk"
            onClick={() => onSelectView('kiosk')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 select-none ${
              activeView === 'kiosk'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 font-black scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <span>🖥️</span>
            <span>Patient Kiosk</span>
          </button>
          <button
            id="nav-btn-doctor"
            onClick={() => onSelectView('doctor')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 select-none ${
              activeView === 'doctor'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25 font-black scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <span>👨‍⚕️</span>
            <span>/doctor (EMR)</span>
          </button>
          <button
            id="nav-btn-triage"
            onClick={() => onSelectView('triage')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 relative select-none ${
              activeView === 'triage'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25 font-black scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <span>🚨</span>
            <span>/triage (Red Flags)</span>
            {unreadAlertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>
          <button
            id="nav-btn-demo"
            onClick={() => onSelectView('demo')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 select-none ${
              activeView === 'demo'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-black scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <span>⚡</span>
            <span>SIH Demo Panel</span>
          </button>
        </div>

        {/* Accessibility Toolbar */}
        <div className="flex items-center gap-2">
          {idleCountdown !== undefined && idleCountdown <= 30 && (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300 font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Reset in {idleCountdown}s</span>
            </div>
          )}

          {/* High Contrast Toggle */}
          <button
            id="btn-high-contrast"
            onClick={onToggleHighContrast}
            title={t.highContrast}
            className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-500'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
            }`}
          >
            {highContrast ? <Sun className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-600" />}
            <span className="hidden sm:inline">Aa</span>
          </button>

          {/* Font Size Toggle */}
          <button
            id="btn-font-size"
            onClick={onChangeFontSize}
            title={t.textSize}
            className="px-2.5 py-1.5 rounded-xl border bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            <span>{fontSizeMultiplier === 1 ? '100%' : fontSizeMultiplier === 1.2 ? '120%' : '140%'}</span>
          </button>

          {/* Speech Speed */}
          <button
            id="btn-speech-rate"
            onClick={onChangeSpeechRate}
            title={t.speechSpeed}
            className="px-2.5 py-1.5 rounded-xl border bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            {speechRate}x
          </button>

          {/* Audio Mute/Unmute */}
          <button
            id="btn-toggle-mute"
            onClick={onToggleMute}
            title="Audio Mute"
            className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              muted
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Emergency Assistance Button */}
          <button
            id="btn-need-help"
            onClick={onNeedHelp}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.needHelp}</span>
          </button>

          {/* Start Over Button */}
          <button
            id="btn-start-over"
            onClick={onStartOver}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all border border-slate-200/80"
            title={t.startOver}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.startOver}</span>
          </button>
        </div>
      </div>

      {/* Step Indicator Bar (Only for Kiosk mode when beyond language selection) */}
      {activeView === 'kiosk' && currentStep !== 'language' && currentStep !== 'done' && (
        <div className="bg-gradient-to-r from-slate-50 via-sky-50/50 to-slate-50 border-t border-slate-200/80 px-4 py-2.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {steps.map((step, idx) => {
              const isActive = idx === currentIdx;
              const isPast = idx < currentIdx;
              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white ring-4 ring-sky-200 shadow-md shadow-sky-500/30 scale-105'
                        : isPast
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xs'
                        : 'bg-slate-200/80 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : step.icon}
                  </div>
                  <span
                    className={`text-xs md:text-sm hidden sm:inline ${
                      isActive
                        ? 'text-sky-950 font-black tracking-tight'
                        : isPast
                        ? 'text-emerald-900 font-bold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1.5 mx-2.5 rounded-full hidden md:block overflow-hidden bg-slate-200/70`}
                    >
                      <div
                        className={`h-full transition-all duration-300 ${
                          isPast
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-full'
                            : isActive
                            ? 'bg-gradient-to-r from-teal-500 to-sky-500 w-1/2'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
