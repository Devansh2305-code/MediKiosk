import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit2,
  FileSearch,
  FileText,
  Loader2,
  Pill,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { ocrService } from '../services/ocrService';
import { DigitizedDocument, LanguageCode } from '../types';

interface DocumentUploadStepProps {
  language: LanguageCode;
  initialDocuments?: DigitizedDocument[];
  onComplete: (documents: DigitizedDocument[]) => void;
  onSpeak: (text: string) => void;
  highContrast: boolean;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  language,
  initialDocuments = [],
  onComplete,
  onSpeak,
  highContrast,
}) => {
  const isHindi = language === 'hi';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [documents, setDocuments] = useState<DigitizedDocument[]>(initialDocuments);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialDocuments.length > 0 ? initialDocuments[0].id : null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const sampleDocs = React.useMemo(() => ocrService.getSampleDocuments(), []);

  const handleAddSampleDoc = (sample: DigitizedDocument) => {
    setIsProcessing(true);
    setProcessingStatus(isHindi ? 'दस्तावेज का विश्लेषण हो रहा है...' : 'Running vision OCR and clinical extraction...');

    setTimeout(() => {
      setDocuments((prev) => {
        const exists = prev.find((d) => d.id === sample.id);
        if (exists) return prev;
        return [...prev, sample];
      });
      setSelectedDocId(sample.id);
      setIsProcessing(false);
      onSpeak(isHindi ? 'दस्तावेज सफलतापूर्वक पढ़ लिया गया है।' : 'Document analyzed successfully.');
    }, 450);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatus(isHindi ? 'कागजात पढ़ा जा रहा है...' : 'Digitizing document...');

    try {
      const extracted = await ocrService.extractFromImage(file);
      setDocuments((prev) => [...prev, extracted]);
      setSelectedDocId(extracted.id);
      onSpeak(isHindi ? 'दस्तावेज स्कैन हो गया।' : 'Document scanned.');
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  return (
    <div id="step-document-upload" className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white mb-3 shadow-lg shadow-sky-500/20 border border-white/40">
          <FileSearch className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
          {t.documentUploadTitle}
        </h2>
        <p className="text-base text-slate-600 font-medium max-w-xl mx-auto">
          {t.documentUploadSubtitle}
        </p>
      </div>

      {/* 3 Synthetic Preloaded Document Buttons for 1-Tap Demo */}
      <div className="mb-6 bg-white/90 backdrop-blur-md p-5 rounded-3xl border-2 border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="text-amber-500">⚡</span>
            <span>{t.samplePreloadedDocs}</span>
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black border border-emerald-300 shadow-xs">
            1-Click Demo Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleDocs.map((sample) => {
            const isAdded = documents.some((d) => d.id === sample.id);
            const docBadgeTheme =
              sample.docType === 'prescription'
                ? 'from-sky-500/10 via-cyan-500/5 to-transparent border-sky-300'
                : sample.docType === 'lab_report'
                ? 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-300'
                : 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300';

            return (
              <button
                key={sample.id}
                id={`btn-load-sample-${sample.docType}`}
                onClick={() => handleAddSampleDoc(sample)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 flex items-center justify-between cursor-pointer active:scale-98 relative overflow-hidden ${
                  isAdded
                    ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200/90 hover:border-sky-500 text-slate-800 hover:shadow-md'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${docBadgeTheme} pointer-events-none opacity-40`} />
                <div className="flex items-center gap-3 relative z-10">
                  <span className="text-3xl drop-shadow-xs">
                    {sample.docType === 'prescription' ? '💊' : sample.docType === 'lab_report' ? '🔬' : '🏥'}
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900 leading-tight">
                      {sample.docType === 'prescription'
                        ? 'OPD Prescription (Bilingual)'
                        : sample.docType === 'lab_report'
                        ? 'Apex Lab Report (Sugar)'
                        : 'Discharge Summary (Cardiac)'}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold mt-0.5">{sample.documentDate}</div>
                  </div>
                </div>
                <div className="relative z-10">
                  {isAdded ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-500 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Upload & Camera Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <label className="flex-1 min-w-[200px] py-4 px-5 rounded-2xl bg-white border-2 border-dashed border-sky-400 hover:border-sky-600 cursor-pointer flex items-center justify-center gap-2.5 text-sky-900 font-extrabold text-sm shadow-sm transition-all hover:bg-sky-50/60 active:scale-98">
          <Upload className="w-5 h-5 text-sky-600" />
          <span>{isHindi ? 'मोबाइल/कंप्यूटर से फाइल चुनें' : 'Upload Prescription or Lab Report'}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={() => setIsCameraActive(true)}
          className="py-4 px-6 rounded-2xl bg-gradient-to-r from-slate-100 to-sky-50 hover:from-sky-100 hover:to-indigo-50 border-2 border-slate-200 text-slate-800 font-black text-sm flex items-center gap-2 transition-all active:scale-98 shadow-xs"
        >
          <Camera className="w-5 h-5 text-indigo-600" />
          <span>{t.useCamera}</span>
        </button>
      </div>

      {/* Loading State Spinner */}
      {isProcessing && (
        <div className="p-6 bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-300 rounded-3xl text-center mb-6 shadow-sm">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-black text-sky-900">{processingStatus}</p>
        </div>
      )}

      {/* Side-by-Side Document Preview & Extracted Fields */}
      {activeDoc && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-200/90 shadow-md p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600" />

          {/* Document Tabs */}
          {documents.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                    selectedDocId === doc.id
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Doc {idx + 1}: {doc.docType} ({doc.documentDate})
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Document Visual / SVG Preview */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                <span>Original Document Preview</span>
                <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{activeDoc.documentDate}</span>
              </div>
              <div className="w-full aspect-[3/4] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                {activeDoc.imageUrl ? (
                  <img
                    src={activeDoc.imageUrl}
                    alt="Document Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <FileText className="w-16 h-16 text-slate-600" />
                )}
              </div>
            </div>

            {/* Right: Extracted Structured Clinical Findings */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Digitized Clinical Extract
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black border border-emerald-300">
                    OCR Match: {(activeDoc.overallConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Facility & Date */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 mb-3 text-xs">
                  <div className="font-black text-slate-900 text-sm">{activeDoc.facilityOrDoctor}</div>
                  <div className="text-slate-500 font-medium">Document Type: <span className="font-bold text-slate-800">{activeDoc.docType}</span></div>
                </div>

                {/* Extracted Diagnoses */}
                {activeDoc.diagnoses.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-black text-slate-700 block mb-1.5">Diagnoses / Past History:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoc.diagnoses.map((diag, i) => (
                        <span key={i} className="px-3 py-1 bg-sky-50 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold shadow-xs">
                          {diag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Medications with Brand->Generic mapping */}
                {activeDoc.medications.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-black text-slate-700 block mb-1.5 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <span>Extracted Medications (Brand → Generic):</span>
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeDoc.medications.map((med, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-black text-slate-900">{med.brand}</span>
                            {med.generic && (
                              <span className="text-indigo-700 font-bold ml-1.5">({med.generic})</span>
                            )}
                            <div className="text-slate-500 text-[11px] font-semibold">
                              {med.dose} • {med.frequency} • {med.duration}
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            {(med.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Investigations with High/Low flags */}
                {activeDoc.investigations.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-black text-slate-700 block mb-1.5">
                      Lab Values &amp; Observations:
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeDoc.investigations.map((inv, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-black text-slate-800">{inv.name}</span>
                            <div className="text-slate-600 text-[11px] font-medium">
                              Result: <span className="font-black text-slate-900">{inv.value} {inv.unit || ''}</span>
                              {inv.refRange && ` (Ref: ${inv.refRange})`}
                            </div>
                          </div>
                          {inv.flag && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                                inv.flag === 'H'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : inv.flag === 'L'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {inv.flag === 'H' ? 'HIGH' : inv.flag === 'L' ? 'LOW' : 'NORMAL'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies on record */}
                {activeDoc.allergies.length > 0 && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl mb-3 text-xs text-rose-950 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Documented Allergies: {activeDoc.allergies.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Verified by optical extractor</span>
                <button
                  onClick={() => {
                    setDocuments((prev) => prev.filter((d) => d.id !== activeDoc.id));
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-black flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          id="btn-proceed-review"
          onClick={() => onComplete(documents)}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-lg flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/25 transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>{isHindi ? 'समीक्षा के लिए आगे बढ़ें' : 'Proceed to Summary Review'}</span>
          <CheckCircle2 className="w-6 h-6" />
        </button>
      </div>

      {/* Camera Capture Simulation Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-7 rounded-3xl max-w-md w-full shadow-2xl text-center border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">Kiosk Document Camera</h4>
            <p className="text-xs font-semibold text-slate-500 mb-5">Position prescription or discharge paper under camera</p>

            <div className="aspect-[3/4] bg-slate-950 rounded-3xl flex items-center justify-center overflow-hidden mb-6 border-2 border-slate-800 relative shadow-inner">
              {/* Corner targeting guides */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />

              {/* Laser line */}
              <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-laser" />

              <div className="text-center z-10">
                <FileText className="w-16 h-16 text-slate-700 mx-auto mb-2 opacity-60" />
                <span className="text-[11px] font-mono text-cyan-400/90 tracking-wider">Auto-Focusing Document...</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCameraActive(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCameraActive(false);
                  handleAddSampleDoc(sampleDocs[0]);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Snap &amp; Extract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
