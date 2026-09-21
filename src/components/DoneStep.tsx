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
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-6 md:p-8 text-center relative overflow-hidden mb-6">
        {/* Hospital Header */}
        <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white font-extrabold text-2xl mb-2">
            +
          </div>
          <h3 className="text-xl font-black text-slate-900">AIIMS / APEX GENERAL HOSPITAL</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Outpatient Department • ABDM First-Mile Clinical Intake Slip
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Generated: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Big Token Number */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
            {t.tokenNumberLabel}
          </span>
          <div className="text-6xl md:text-7xl font-black tracking-tight text-sky-700 font-mono">
            {tokenNumber}
          </div>
        </div>

        {/* Assigned OPD Room & Department */}
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800 block mb-1">
            {t.opdRoomLabel}
          </span>
          <div className="text-2xl md:text-3xl font-black text-slate-900 mb-1">
            {opdRoom}
          </div>
          <div className="text-sm font-bold text-sky-700">
            {department}
          </div>
        </div>

        {/* Patient Details */}
        <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-medium space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient Name:</span>
            <span className="font-extrabold text-slate-900">{patient.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Age / Gender:</span>
            <span className="font-bold text-slate-800">{patient.age} Y / {patient.gender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ABHA ID:</span>
            <span className="font-mono font-bold text-slate-800">{patient.abhaId || 'General Token'}</span>
          </div>
        </div>

        {/* Reassuring Instruction Message */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs md:text-sm mb-6 text-left flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            {isHindi
              ? 'कृपया अपने निर्दिष्ट कमरे के बाहर प्रतीक्षा करें। डॉक्टर की स्क्रीन पर आपकी पूरी जानकारी, दवाइयां और रिपोर्ट पहले से खुली हुई हैं। आपका टोकन पुकारे जाने पर अंदर जाएं।'
              : 'Please proceed to your designated OPD room. The physician already has your structured history and digitized reports on screen. You will be called in by your token number.'}
          </p>
        </div>

        {/* Privacy Wipe Guarantee Badge */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
          <Lock className="w-4 h-4" />
          <span>{t.privacyWipedNotice}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={handlePrintSlip}
          id="btn-print-slip"
          className="flex-1 py-3.5 px-5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printSlip}</span>
        </button>

        <button
          onClick={onViewDoctorScreen}
          id="btn-open-doctor-view"
          className="flex-1 py-3.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Switch to /doctor EMR View</span>
        </button>
      </div>

      {/* Auto Reset Timer Bar */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>Kiosk will automatically reset for next patient in {countdown} seconds</span>
        </div>
        <div>
          <button
            onClick={onResetForNextPatient}
            className="text-xs font-bold text-slate-700 hover:text-sky-700 underline"
          >
            {t.newPatientSession}
          </button>
        </div>
      </div>
    </div>
  );
};
