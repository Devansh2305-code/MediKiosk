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
    <div id="step-review-recap" className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-sm">
          <FileCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          {t.recapTitle}
        </h2>
        <p className="text-base text-slate-600 font-medium">
          {t.recapSubtitle}
        </p>
      </div>

      {/* Audio Listen Aloud Bar */}
      <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5 mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-sky-950">
              {isHindi ? 'पूरा विवरण आवाज में सुनें' : 'Listen to Intake Summary Aloud'}
            </h4>
            <p className="text-xs text-sky-800 font-medium">
              {isHindi ? 'डॉक्टर को भेजने से पहले अपनी भाषा में पूरी जानकारी सुनें' : 'Verify all details in plain spoken language'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-speak-recap"
          onClick={onSpeakRecap}
          className="py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow transition-all active:scale-95"
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
              className={`p-5 rounded-2xl border-2 flex items-start gap-3.5 shadow-sm ${
                disc.severity === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-400 text-rose-950'
                  : 'bg-amber-50 border-amber-400 text-amber-950'
              }`}
            >
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${disc.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-extrabold text-sm md:text-base">{disc.title}</h5>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-black uppercase tracking-wider bg-white/70 border border-current">
                    {disc.severity} Discrepancy
                  </span>
                </div>
                <p className="text-xs md:text-sm font-medium mt-1">{disc.description}</p>
                <div className="mt-2 text-xs flex flex-wrap gap-3 font-semibold">
                  <span className="bg-white/80 px-2.5 py-1 rounded-md border">
                    🗣️ Patient oral: {disc.patientStatement}
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-md border">
                    📄 Document record: {disc.documentEvidence}
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
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Presenting Complaint &amp; HPI</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Patient Stated
              </span>
            </div>

            <h4 className="text-xl font-black text-slate-900 mb-2">
              {summary.chiefComplaint.title}
            </h4>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-3">
              {summary.hpi.narrative}
            </p>

            <div className="space-y-1 text-xs text-slate-600 font-medium">
              {summary.hpi.socrates?.onset && <div>• Onset: <span className="font-bold text-slate-800">{summary.hpi.socrates.onset}</span></div>}
              {summary.hpi.socrates?.character && <div>• Character: <span className="font-bold text-slate-800">{summary.hpi.socrates.character}</span></div>}
              {summary.hpi.socrates?.severity !== undefined && (
                <div>• Pain Severity: <span className="font-bold text-slate-800">{summary.hpi.socrates.severity}/10 (Wong-Baker scale)</span></div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Active Medications on Record */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Pill className="w-4 h-4 text-sky-600" />
                <span>Current Medications</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                Document Extracted
              </span>
            </div>

            {summary.medications.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No current medications extracted or reported.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {summary.medications.map((med, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{med.brand}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{(med as any).sourceDocumentDate || 'Recorded'}</span>
                    </div>
                    {med.generic && <div className="text-slate-600 font-medium">{med.generic}</div>}
                    <div className="text-slate-500 text-[11px]">{med.dose} • {med.frequency}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Allergies & Past Conditions */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Allergies &amp; Chronic History
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              Verified
            </span>
          </div>

          <div className="mb-4">
            <span className="text-xs font-bold text-slate-700 block mb-1">Known Allergies:</span>
            {summary.allergies.length === 0 ? (
              <span className="text-xs text-slate-500 font-semibold">No known allergies reported</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {summary.allergies.map((all, i) => (
                  <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-xs font-black">
                    {all}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1">Past Medical History:</span>
            <div className="flex flex-wrap gap-1.5">
              {summary.pastMedical.map((pm, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold">
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Digitized Reports Summary */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached Digital Records
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
              {documents.length} Records
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No prior documents attached for this consultation.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 capitalize">{doc.docType.replace('_', ' ')}</div>
                    <div className="text-slate-500 text-[11px]">{doc.facilityOrDoctor || 'Medical Center'}</div>
                  </div>
                  <span className="font-mono text-slate-600 text-xs font-bold">{doc.documentDate}</span>
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
          className="w-full sm:w-auto min-w-[340px] py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-3 mx-auto"
        >
          <CheckCircle2 className="w-7 h-7" />
          <span>{t.submitToDoctor}</span>
        </button>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          ABDM FHIR Bundle will be pushed to Hospital HIS, and Kiosk session memory will be wiped cleanly.
        </p>
      </div>
    </div>
  );
};
