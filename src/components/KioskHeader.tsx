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
      className={`w-full border-b transition-colors shadow-sm ${
        highContrast ? 'bg-black text-yellow-300 border-yellow-500' : 'bg-white text-slate-800 border-slate-200'
      }`}
    >
      {/* Top Banner with Hospital Title and System Mode Switches */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            +
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-base leading-tight flex items-center gap-2">
              <span>{t.appName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                ABDM First-Mile
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">AIIMS / Apex Hospital OPD Gateway</p>
          </div>
        </div>

        {/* View Switcher: Patient Kiosk vs Doctor vs Triage vs Demo */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-semibold gap-1">
          <button
            id="nav-btn-kiosk"
            onClick={() => onSelectView('kiosk')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'kiosk'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🖥️</span>
            <span>Patient Kiosk</span>
          </button>
          <button
            id="nav-btn-doctor"
            onClick={() => onSelectView('doctor')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'doctor'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>👨‍⚕️</span>
            <span>/doctor (EMR)</span>
          </button>
          <button
            id="nav-btn-triage"
            onClick={() => onSelectView('triage')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 relative ${
              activeView === 'triage'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
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
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'demo'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
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
            className={`p-2 rounded-lg border flex items-center gap-1 text-xs font-bold transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-500'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {highContrast ? <Sun className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">Aa</span>
          </button>

          {/* Font Size Toggle */}
          <button
            id="btn-font-size"
            onClick={onChangeFontSize}
            title={t.textSize}
            className="px-2.5 py-1.5 rounded-lg border bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{fontSizeMultiplier === 1 ? '100%' : fontSizeMultiplier === 1.2 ? '120%' : '140%'}</span>
          </button>

          {/* Speech Speed */}
          <button
            id="btn-speech-rate"
            onClick={onChangeSpeechRate}
            title={t.speechSpeed}
            className="px-2 py-1.5 rounded-lg border bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 text-xs font-semibold"
          >
            {speechRate}x
          </button>

          {/* Audio Mute/Unmute */}
          <button
            id="btn-toggle-mute"
            onClick={onToggleMute}
            title="Audio Mute"
            className={`p-2 rounded-lg border text-xs font-bold transition-all ${
              muted
                ? 'bg-rose-100 text-rose-700 border-rose-300'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Emergency Assistance Button */}
          <button
            id="btn-need-help"
            onClick={onNeedHelp}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.needHelp}</span>
          </button>

          {/* Start Over Button */}
          <button
            id="btn-start-over"
            onClick={onStartOver}
            className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
            title={t.startOver}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.startOver}</span>
          </button>
        </div>
      </div>

      {/* Step Indicator Bar (Only for Kiosk mode when beyond language selection) */}
      {activeView === 'kiosk' && currentStep !== 'language' && currentStep !== 'done' && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {steps.map((step, idx) => {
              const isActive = idx === currentIdx;
              const isPast = idx < currentIdx;
              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : step.icon}
                  </div>
                  <span
                    className={`text-xs md:text-sm font-semibold hidden sm:inline ${
                      isActive ? 'text-sky-900 font-bold' : isPast ? 'text-emerald-800' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full hidden md:block ${
                        isPast ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    />
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
