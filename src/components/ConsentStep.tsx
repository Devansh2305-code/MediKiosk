import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  RefreshCcw,
  Shield,
  Volume2,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { ConsentArtifact, LanguageCode, PatientProfile } from '../types';

export interface ConsentPurposesState {
  recordHistory: boolean;
  aiDocumentAnalysis: boolean;
  shareWithHospital: boolean;
  linkToAbhaRecord: boolean;
}

interface ConsentStepProps {
  language: LanguageCode;
  patient: PatientProfile;
  onConsentGranted: (consent: ConsentArtifact) => void;
  onConsentWithdrawn: () => void;
  onSpeakExplanation: (text: string) => void;
  highContrast: boolean;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({
  language,
  patient,
  onConsentGranted,
  onConsentWithdrawn,
  onSpeakExplanation,
  highContrast,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [purposes, setPurposes] = useState<ConsentPurposesState>({
    recordHistory: true,
    aiDocumentAnalysis: true,
    shareWithHospital: true,
    linkToAbhaRecord: patient.abhaLinked ?? true,
  });

  const [confirmWithdrawModal, setConfirmWithdrawModal] = useState(false);

  const togglePurpose = (key: keyof ConsentPurposesState) => {
    setPurposes((prev: ConsentPurposesState) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGrant = () => {
    const artifact: ConsentArtifact = {
      id: `CONSENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientRef: patient.abhaId || 'LOCAL-WALKIN',
      purposes: {
        recordHistory: purposes.recordHistory,
        aiDocumentAnalysis: purposes.aiDocumentAnalysis,
        shareWithHospital: purposes.shareWithHospital,
        linkToAbhaRecord: purposes.linkToAbhaRecord,
      },
      language,
      version: '1.0',
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    };
    onConsentGranted(artifact);
  };

  const items = [
    {
      key: 'recordHistory' as const,
      icon: '📋',
      title: t.consentRecordHistory,
      desc: t.consentRecordHistoryDesc,
      audioText: language === 'hi' ? 'हम आपकी वर्तमान बीमारी, लक्षण और पुरानी बीमारियों का विवरण डॉक्टर के लिए दर्ज करेंगे।' : 'We will record your present illness, symptoms, and medical history for your doctor.',
    },
    {
      key: 'aiDocumentAnalysis' as const,
      icon: '🔬',
      title: t.consentAiDoc,
      desc: t.consentAiDocDesc,
      audioText: language === 'hi' ? 'आपके द्वारा लाए गए पुराने पर्चे और लैब जांच की फोटो को स्थानीय रूप से स्कैन किया जाएगा।' : 'Your previous prescription and lab report images will be locally scanned.',
    },
    {
      key: 'shareWithHospital' as const,
      icon: '🏥',
      title: t.consentShareHospital,
      desc: t.consentShareHospitalDesc,
      audioText: language === 'hi' ? 'यह जानकारी केवल आपके ओपीडी डॉक्टर के कंप्यूटर पर परामर्श के समय दिखाई जाएगी।' : 'This summary will be transmitted only to your treating hospital OPD doctor.',
    },
    {
      key: 'linkToAbhaRecord' as const,
      icon: '🇮🇳',
      title: t.consentLinkAbha,
      desc: t.consentLinkAbhaDesc,
      audioText: language === 'hi' ? 'परामर्श समाप्त होने पर डॉक्टर द्वारा सत्यापित पर्चा आपके आभा खाते में सुरक्षित जोड़ा जा सकता है।' : 'Doctor-verified summary can be added to your ABHA digital health record.',
    },
  ];

  return (
    <div id="step-consent" className="max-w-3xl mx-auto px-4 py-8">
      {/* Header with DPDP Trust Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white mb-3 shadow-lg shadow-sky-500/20 border border-white/40">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          {t.consentTitle}
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto font-medium">
          {t.consentSubtitle}
        </p>
      </div>

      {/* Patient Greeting & ABHA status banner */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200/90 rounded-3xl p-5 mb-6 shadow-md flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600" />
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Patient Identity Verified
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {patient.name} <span className="text-sm font-semibold text-slate-500">({patient.age} Y • {patient.gender})</span>
          </div>
          <div className="text-xs text-sky-800 font-mono font-bold mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ABHA: {patient.abhaId || 'Walk-in (Unlinked)'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>DPDP 2023 Compliant</span>
        </div>
      </div>

      {/* Granular Purpose Toggles */}
      <div className="space-y-3 mb-8">
        {items.map((item) => {
          const isChecked = purposes[item.key];
          return (
            <div
              key={item.key}
              className={`p-4 md:p-5 rounded-3xl border-2 transition-all duration-150 flex items-start justify-between gap-4 ${
                isChecked
                  ? 'bg-white/95 border-sky-500 shadow-md shadow-sky-500/5 ring-1 ring-sky-500/20'
                  : 'bg-slate-50 border-slate-200/80 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <span className="text-2xl pt-0.5 shrink-0 drop-shadow-xs">{item.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base md:text-lg font-black text-slate-900">
                      {item.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onSpeakExplanation(item.audioText)}
                      className="p-1 rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Audio explanation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Big Touch-Friendly Toggle Switch */}
              <button
                type="button"
                id={`toggle-consent-${item.key}`}
                onClick={() => togglePurpose(item.key)}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-200 flex items-center shrink-0 cursor-pointer shadow-inner ${
                  isChecked
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 justify-end'
                    : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200" />
              </button>
            </div>
          );
        })}
      </div>

      {/* DPDP Legal Disclaimer Text */}
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed max-w-xl mx-auto">
        {t.privacyNoticePlain}
      </p>

      {/* Action Buttons: Accept vs Revoke / Opt-out */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          id="btn-withdraw-consent"
          onClick={() => setConfirmWithdrawModal(true)}
          className="py-4 px-6 rounded-2xl border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-black text-base transition-colors flex items-center justify-center gap-2 order-2 sm:order-1 cursor-pointer active:scale-98 shadow-xs"
        >
          <RefreshCcw className="w-5 h-5 text-slate-500" />
          <span>{t.consentWithdrawButton}</span>
        </button>

        <button
          type="button"
          id="btn-accept-consent"
          onClick={handleGrant}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 active:scale-[0.99] text-white font-black text-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 order-1 sm:order-2 cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>{t.consentAcceptButton}</span>
        </button>
      </div>

      {/* Confirmation modal if patient wants to withdraw */}
      {confirmWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {language === 'hi' ? 'सहमति वापस लें?' : 'Withdraw Consent & Cancel?'}
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {language === 'hi'
                ? 'यदि आप सहमति नहीं देना चाहते, तो यह कियोस्क सत्र समाप्त हो जाएगा और आपका कोई भी डेटा सहेजा नहीं जाएगा।'
                : 'Under DPDP, you have the right to withdraw at any moment. Your session will be purged and you can consult the doctor directly.'}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmWithdrawModal(false)}
                className="flex-1 py-3 bg-slate-100 rounded-2xl font-bold text-slate-700 text-sm hover:bg-slate-200 transition-colors"
              >
                {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
              </button>
              <button
                type="button"
                id="btn-confirm-purge-session"
                onClick={onConsentWithdrawn}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 rounded-2xl font-black text-white text-sm shadow-md transition-colors"
              >
                {language === 'hi' ? 'हाँ, सत्र मिटाएं' : 'Purge & Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
