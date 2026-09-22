import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Heart,
  Pill,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { detectDiscrepancies } from '../services/reconciliation';
import {
  ClinicalDiscrepancy,
  DigitizedDocument,
  HistorySlotValue,
  LanguageCode,
  PatientProfile,
  StructuredSummary,
} from '../types';

interface ReviewStepProps {
  language: LanguageCode;
  patient: PatientProfile;
  slots: Record<string, HistorySlotValue>;
  documents: DigitizedDocument[];
  summary: StructuredSummary;
  onSubmitToDoctor: () => void;
  onSpeakRecap: () => void;
  highContrast: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  language,
  slots,
  documents,
  summary,
  onSubmitToDoctor,
  onSpeakRecap,
}) => {
  const isHindi = language === 'hi';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const discrepancies: ClinicalDiscrepancy[] = React.useMemo(() => {
    return detectDiscrepancies(slots, documents);
  }, [slots, documents]);

  return (
    <div id="step-review-recap" className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white mb-3 shadow-lg shadow-emerald-500/20 border border-white/40">
          <FileCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          {t.recapTitle}
        </h2>
        <p className="text-base text-slate-600 font-medium max-w-xl mx-auto">
          {t.recapSubtitle}
        </p>
      </div>

      {/* Audio Listen Aloud Bar */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-sky-200 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-sky-500/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600" />
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900">
              {isHindi ? 'पूरा विवरण आवाज में सुनें' : 'Listen to Clinical Summary Aloud'}
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {isHindi ? 'डॉक्टर को भेजने से पहले अपनी भाषा में पूरी जानकारी सुनें' : 'Verify all recorded details before final transmission to OPD'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-speak-recap"
          onClick={onSpeakRecap}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-sm shadow-md shadow-sky-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          {t.recapListenAudio}
        </button>
      </div>

      {/* Discrepancy Alert Banner if detected */}
      {discrepancies.length > 0 && (
        <div className="mb-8 space-y-3">
          {discrepancies.map((disc) => (
            <div
              key={disc.id}
              className={`p-5 rounded-3xl border-2 flex items-start gap-4 shadow-md ${
                disc.severity === 'CRITICAL'
                  ? 'bg-rose-50/90 border-rose-400 text-rose-950 ring-2 ring-rose-500/20'
                  : 'bg-amber-50/90 border-amber-400 text-amber-950 ring-2 ring-amber-500/20'
              }`}
            >
              <div className={`p-2.5 rounded-2xl ${disc.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'} shrink-0 shadow-xs`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-black text-base">{disc.title}</h5>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${disc.severity === 'CRITICAL' ? 'bg-rose-200 text-rose-900 border border-rose-300' : 'bg-amber-200 text-amber-900 border border-amber-300'}`}>
                    {disc.severity} Discrepancy
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold leading-relaxed">{disc.description}</p>
                <div className="mt-2 text-xs flex flex-wrap gap-2.5 font-bold">
                  <span className="bg-white/90 px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                    🗣️ Patient oral: <span className="font-black text-slate-900">{disc.patientStatement}</span>
                  </span>
                  <span className="bg-white/90 px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                    📄 Document record: <span className="font-black text-slate-900">{disc.documentEvidence}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structured Recap Cards with Provenance Chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 1. Chief Complaint & HPI */}
        <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Presenting Complaint &amp; HPI</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                Patient Stated
              </span>
            </div>

            <h4 className="text-xl font-black text-slate-900 mb-2">
              {summary.chiefComplaint.title}
            </h4>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-3 font-medium">
              {summary.hpi.narrative}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              {summary.hpi.socrates?.onset && <div>• Onset: <span className="font-black text-slate-900">{summary.hpi.socrates.onset}</span></div>}
              {summary.hpi.socrates?.character && <div>• Character: <span className="font-black text-slate-900">{summary.hpi.socrates.character}</span></div>}
              {summary.hpi.socrates?.severity !== undefined && (
                <div className="flex items-center gap-2">
                  <span>• Pain Severity:</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-black text-xs border border-rose-200">
                    {summary.hpi.socrates.severity}/10 (Wong-Baker scale)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Active Medications on Record */}
        <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-600" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-sky-600" />
                <span>Current Medications</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-black border border-sky-300">
                OCR Extracted
              </span>
            </div>

            {summary.medications.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No current medications extracted or reported.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {summary.medications.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="font-black text-slate-900 flex items-center justify-between">
                      <span className="text-sm">{med.brand}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border">{(med as any).sourceDocumentDate || 'Recorded'}</span>
                    </div>
                    {med.generic && <div className="text-indigo-700 font-bold mt-0.5">({med.generic})</div>}
                    <div className="text-slate-500 text-[11px] font-semibold mt-0.5">{med.dose} • {med.frequency}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Allergies & Past Conditions */}
        <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Allergies &amp; Chronic History
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-300">
              Verified
            </span>
          </div>

          <div className="mb-4">
            <span className="text-xs font-black text-slate-700 block mb-1.5">Known Allergies:</span>
            {summary.allergies.length === 0 ? (
              <span className="text-xs text-slate-500 font-semibold">No known allergies reported</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {summary.allergies.map((all, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-100 text-rose-950 border border-rose-300 rounded-xl text-xs font-black shadow-xs">
                    {all}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-black text-slate-700 block mb-1.5">Past Medical History:</span>
            <div className="flex flex-wrap gap-1.5">
              {summary.pastMedical.map((pm, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold">
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Digitized Reports Summary */}
        <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Attached Digital Records
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black border border-purple-300">
              {documents.length} Records
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No prior documents attached for this consultation.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-800 capitalize text-sm">{doc.docType.replace('_', ' ')}</div>
                    <div className="text-slate-500 text-[11px] font-medium">{doc.facilityOrDoctor || 'Medical Center'}</div>
                  </div>
                  <span className="font-mono text-slate-700 text-xs font-black bg-white px-2 py-0.5 rounded border">{doc.documentDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="button"
          id="btn-submit-to-doctor"
          onClick={onSubmitToDoctor}
          className="w-full sm:w-auto min-w-[360px] py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-black text-xl shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-3 mx-auto cursor-pointer"
        >
          <CheckCircle2 className="w-7 h-7" />
          <span>{t.submitToDoctor}</span>
        </button>
        <p className="text-xs text-slate-500 mt-2.5 font-semibold">
          ABDM FHIR Bundle will be pushed to Hospital HIS, and Kiosk session memory will be wiped cleanly.
        </p>
      </div>
    </div>
  );
};
