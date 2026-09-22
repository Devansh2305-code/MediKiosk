import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Printer,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { LanguageCode, PatientProfile } from '../types';

interface DoneStepProps {
  language: LanguageCode;
  patient: PatientProfile;
  tokenNumber: string;
  opdRoom: string;
  department: string;
  onResetForNextPatient: () => void;
  onViewDoctorScreen: () => void;
  highContrast: boolean;
}

export const DoneStep: React.FC<DoneStepProps> = ({
  language,
  patient,
  tokenNumber,
  opdRoom,
  department,
  onResetForNextPatient,
  onViewDoctorScreen,
  highContrast,
}) => {
  const isHindi = language === 'hi';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onResetForNextPatient();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onResetForNextPatient]);

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div id="step-done-slip" className="max-w-2xl mx-auto px-4 py-8">
      {/* Printable Token Slip Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-300 shadow-2xl p-6 md:p-8 text-center relative overflow-hidden mb-6">
        {/* Top colored accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600" />

        {/* Hospital Header */}
        <div className="border-b-2 border-dashed border-slate-300 pb-5 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-2xl mb-2 shadow-md shadow-sky-500/20 border border-white/40">
            +
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">AIIMS / APEX GENERAL HOSPITAL</h3>
          <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">
            Outpatient Department • ABDM First-Mile Clinical Intake Slip
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600 font-mono font-bold border border-slate-200">
            <span>Generated:</span>
            <span>{new Date().toLocaleDateString('en-IN')}</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Big Token Number */}
        <div className="mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
            {t.tokenNumberLabel}
          </span>
          <div className="inline-block py-2 px-8 rounded-3xl bg-sky-50 border-2 border-sky-300/80 shadow-inner">
            <span className="text-6xl md:text-7xl font-black tracking-tight text-sky-800 font-mono">
              {tokenNumber}
            </span>
          </div>
        </div>

        {/* Assigned OPD Room & Department */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50/60 border-2 border-sky-200 rounded-3xl p-5 mb-6 text-center shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider text-sky-900 block mb-1">
            {t.opdRoomLabel}
          </span>
          <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
            {opdRoom}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{department}</span>
          </div>
        </div>

        {/* Patient Details */}
        <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Patient Name:</span>
            <span className="font-black text-slate-900 text-sm">{patient.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Age / Gender:</span>
            <span className="font-bold text-slate-800">{patient.age} Y / {patient.gender}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">ABHA Address:</span>
            <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{patient.abhaId || 'General Token'}</span>
          </div>
        </div>

        {/* Reassuring Instruction Message */}
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-950 text-xs md:text-sm mb-6 text-left flex items-start gap-3.5 shadow-xs">
          <div className="p-1 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="font-semibold leading-relaxed">
            {isHindi
              ? 'कृपया अपने निर्दिष्ट कमरे के बाहर प्रतीक्षा करें। डॉक्टर की स्क्रीन पर आपकी पूरी जानकारी, दवाइयां और रिपोर्ट पहले से खुली हुई हैं। आपका टोकन पुकारे जाने पर अंदर जाएं।'
              : 'Please proceed to your designated OPD room. The physician already has your structured history and digitized reports on screen. You will be called in by your token number.'}
          </p>
        </div>

        {/* Privacy Wipe Guarantee Badge */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-xs font-black text-emerald-800">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>{t.privacyWipedNotice}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={handlePrintSlip}
          id="btn-print-slip"
          className="flex-1 py-4 px-6 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printSlip}</span>
        </button>

        <button
          onClick={onViewDoctorScreen}
          id="btn-open-doctor-view"
          className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Switch to /doctor EMR View</span>
        </button>
      </div>

      {/* Auto Reset Timer Bar */}
      <div className="text-center bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="inline-flex items-center gap-2 text-xs font-black text-slate-600 mb-2">
          <Clock className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Kiosk will automatically reset for next patient in <span className="font-mono text-sky-700 font-black">{countdown}</span> seconds</span>
        </div>
        <div>
          <button
            onClick={onResetForNextPatient}
            className="text-xs font-black text-sky-700 hover:text-sky-900 underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.newPatientSession}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
