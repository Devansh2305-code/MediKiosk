import React, { useState } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { SYNTHETIC_ABDM_IDENTITIES } from '../services/mockAbdm';
import { LanguageCode, PatientProfile } from '../types';

interface AbhaLoginStepProps {
  language: LanguageCode;
  onPatientIdentified: (patient: PatientProfile) => void;
  highContrast: boolean;
}

export const AbhaLoginStep: React.FC<AbhaLoginStepProps> = ({
  language,
  onPatientIdentified,
  highContrast,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [abhaInput, setAbhaInput] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectDemoPersona = (persona: PatientProfile) => {
    onPatientIdentified(persona);
  };

  const handleManualAbhaSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!abhaInput.trim()) {
      setErrorMsg('Please enter an ABHA Number, ABHA Address, or tap a demo persona.');
      return;
    }
    setErrorMsg('');
    setShowOtpScreen(true);
  };

  const handleOtpVerify = () => {
    // Simulated OTP verification: '123456' or any 6 digits accepted
    const matched = SYNTHETIC_ABDM_IDENTITIES.find(
      (p) =>
        p.abhaId?.replace(/[^0-9]/g, '') === abhaInput.replace(/[^0-9]/g, '') ||
        p.abhaAddress?.toLowerCase() === abhaInput.toLowerCase()
    );

    if (matched) {
      onPatientIdentified(matched);
    } else {
      // Dynamic profile creation for entered ABHA
      const newProfile: PatientProfile = {
        abhaId: abhaInput.includes('-') ? abhaInput : `91-${abhaInput.slice(0, 4)}-${abhaInput.slice(4, 8)}-${abhaInput.slice(8, 12) || '4921'}`,
        abhaAddress: `citizen.${Math.floor(1000 + Math.random() * 9000)}@abdm`,
        name: abhaInput.includes('ramesh') ? 'Ramesh Kumar' : 'Verified Citizen (सत्यापित नागरिक)',
        age: 52,
        gender: 'M',
        mobileNumber: '98765-XXXXX',
        abhaLinked: true,
        department: 'General OPD',
        tokenNumber: `T-${Math.floor(100 + Math.random() * 900)}`,
        opdRoom: 'Room 04 (General Medicine)',
        registeredAt: new Date().toISOString(),
      };
      onPatientIdentified(newProfile);
    }
  };

  const handleContinueWithoutAbha = () => {
    const localProfile: PatientProfile = {
      name: patientNameInput.trim() || 'Walk-in Citizen (सामान्य मरीज)',
      age: 45,
      gender: 'M',
      abhaLinked: false,
      department: 'General Outpatient Dept',
      tokenNumber: `OPD-${Math.floor(100 + Math.random() * 900)}`,
      opdRoom: 'Room 02 (Walk-in Triage)',
      registeredAt: new Date().toISOString(),
    };
    onPatientIdentified(localProfile);
  };

  const handleSimulateAadhaarRegister = () => {
    const generatedAbha: PatientProfile = {
      abhaId: `91-7291-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      abhaAddress: `${(patientNameInput || 'citizen').toLowerCase().replace(/\s+/g, '')}${Math.floor(10 + Math.random() * 90)}@abdm`,
      name: patientNameInput.trim() || 'Suresh Patel (सुरेश पटेल)',
      age: 38,
      gender: 'M',
      mobileNumber: '98221-55441',
      abhaLinked: true,
      department: 'General Medicine OPD',
      tokenNumber: `T-${Math.floor(100 + Math.random() * 900)}`,
      opdRoom: 'Room 06',
      registeredAt: new Date().toISOString(),
    };
    onPatientIdentified(generatedAbha);
  };

  return (
    <div id="step-abha-login" className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mb-3 shadow-sm">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2
          className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-2 ${
            highContrast ? 'text-yellow-300' : 'text-slate-900'
          }`}
        >
          {t.abhaLoginTitle}
        </h2>
        <p className={`text-base md:text-lg font-medium ${highContrast ? 'text-yellow-200' : 'text-slate-600'}`}>
          {t.abhaLoginSubtitle}
        </p>
      </div>

      {/* 3 Synthetic Demo Personas - One-Tap Hackathon Demonstration */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold tracking-wide uppercase text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {t.tapDemoCard}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
            1-Tap Demo Cards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SYNTHETIC_ABDM_IDENTITIES.map((persona) => (
            <div
              key={persona.abhaId}
              id={`persona-card-${persona.name.split(' ')[0]}`}
              onClick={() => handleSelectDemoPersona(persona)}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 shadow-sm cursor-pointer transition-all duration-150 active:scale-[0.98] group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {persona.department?.includes('AYUSH') ? '🌿 AYUSH' : '🩺 Allopathy'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Token: {persona.tokenNumber}</span>
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-800 leading-snug">
                  {persona.name}
                </h4>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  {persona.age} Y / {persona.gender === 'M' ? 'Male' : 'Female'} • {persona.department}
                </p>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-xs text-slate-600 mb-2">
                  {persona.abhaId}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Select this patient</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual ABHA Input Form & QR Code Scan Option */}
      {!showOtpScreen && !isNewRegistration && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm mb-6">
          <form onSubmit={handleManualAbhaSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.enterAbhaNumber}</label>
              <div className="relative">
                <input
                  id="input-abha-number"
                  type="text"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  placeholder="e.g. 91-4829-1048-2831 or ramesh.kumar62@abdm"
                  className="w-full px-4 py-4 text-lg md:text-xl font-mono border-2 border-slate-300 rounded-2xl focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="absolute right-3 top-3 bottom-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border border-slate-300"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>
              {errorMsg && <p className="text-red-600 text-xs font-bold mt-1.5">{errorMsg}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                id="btn-verify-proceed"
                className="flex-1 py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
              >
                <span>{t.verifyAndProceed}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                id="btn-without-abha"
                onClick={handleContinueWithoutAbha}
                className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-all"
              >
                Continue without ABHA
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsNewRegistration(true)}
              className="text-sm font-bold text-sky-700 hover:text-sky-800 underline inline-flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.orRegisterNew} (Aadhaar Instant KYC)</span>
            </button>
          </div>
        </div>
      )}

      {/* Simulated OTP Screen */}
      {showOtpScreen && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">ABDM OTP Verification</h3>
          <p className="text-sm text-slate-600 mb-4">{t.otpPrompt}</p>

          <div className="bg-amber-50 text-amber-800 text-xs px-3 py-1.5 rounded-lg border border-amber-200 mb-4 font-semibold">
            Demo Simulator OTP: <span className="font-mono font-extrabold">123456</span>
          </div>

          <input
            id="input-otp"
            type="text"
            maxLength={6}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="123456"
            className="w-full text-center text-3xl font-mono tracking-widest py-3 border-2 border-slate-300 rounded-2xl mb-4 focus:border-sky-600 focus:outline-none"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setShowOtpScreen(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              {t.back}
            </button>
            <button
              id="btn-confirm-otp"
              onClick={handleOtpVerify}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow"
            >
              Confirm OTP
            </button>
          </div>
        </div>
      )}

      {/* Instant Aadhaar Registration Simulator */}
      {isNewRegistration && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto">
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">Generate New ABHA with Aadhaar</h3>
          <p className="text-xs text-slate-500 mb-4">{t.aadhaarSimulated}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                value={patientNameInput}
                onChange={(e) => setPatientNameInput(e.target.value)}
                placeholder="e.g. Suresh Patel"
                className="w-full px-3 py-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">12-Digit Aadhaar Number</label>
              <input
                type="text"
                maxLength={12}
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full px-3 py-2.5 border font-mono rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsNewRegistration(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                {t.back}
              </button>
              <button
                id="btn-create-abha"
                onClick={handleSimulateAadhaarRegister}
                className="flex-1 py-3 bg-sky-600 text-white font-extrabold rounded-xl shadow"
              >
                Create &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal Simulation */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl text-center">
            <h4 className="text-lg font-bold text-slate-900 mb-2">ABHA QR Code Scanner</h4>
            <p className="text-xs text-slate-500 mb-4">Hold your physical ABHA card or mobile QR up to the kiosk camera</p>

            <div className="relative aspect-square max-w-[260px] mx-auto bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden mb-4 border-4 border-sky-400">
              <Camera className="w-12 h-12 text-slate-400 animate-pulse" />
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_red] animate-bounce" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsQrScannerOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsQrScannerOpen(false);
                  handleSelectDemoPersona(SYNTHETIC_ABDM_IDENTITIES[0]);
                }}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow"
              >
                Simulate QR Detect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
