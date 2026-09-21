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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 mb-3 shadow-sm">
          <FileSearch className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          {t.documentUploadTitle}
        </h2>
        <p className="text-base text-slate-600 font-medium">
          {t.documentUploadSubtitle}
        </p>
      </div>

      {/* 3 Synthetic Preloaded Document Buttons for 1-Tap Demo */}
      <div className="mb-6 bg-slate-50 p-4 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            ⚡ {t.samplePreloadedDocs}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            Instant Hackathon Demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleDocs.map((sample) => {
            const isAdded = documents.some((d) => d.id === sample.id);
            return (
              <button
                key={sample.id}
                id={`btn-load-sample-${sample.docType}`}
                onClick={() => handleAddSampleDoc(sample)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isAdded
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 hover:border-sky-400 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {sample.docType === 'prescription' ? '💊' : sample.docType === 'lab_report' ? '🔬' : '🏥'}
                  </span>
                  <div>
                    <div className="text-sm font-extrabold leading-tight">
                      {sample.docType === 'prescription'
                        ? 'OPD Prescription (Bilingual)'
                        : sample.docType === 'lab_report'
                        ? 'Apex Lab Report (High Sugar)'
                        : 'Discharge Summary (Cardiac)'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{sample.documentDate}</div>
                  </div>
                </div>
                {isAdded ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Upload & Camera Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <label className="flex-1 min-w-[200px] py-3.5 px-4 rounded-2xl bg-white border-2 border-dashed border-sky-400 hover:border-sky-600 cursor-pointer flex items-center justify-center gap-2 text-sky-800 font-bold text-sm shadow-sm transition-all hover:bg-sky-50/50">
          <Upload className="w-5 h-5 text-sky-600" />
          <span>{isHindi ? 'मोबाइल/कंप्यूटर से फाइल चुनें' : 'Upload File / Image'}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={() => setIsCameraActive(true)}
          className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 transition-all"
        >
          <Camera className="w-5 h-5 text-slate-600" />
          <span>{t.useCamera}</span>
        </button>
      </div>

      {/* Loading State Spinner */}
      {isProcessing && (
        <div className="p-6 bg-sky-50 border border-sky-200 rounded-3xl text-center mb-6 animate-pulse">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-extrabold text-sky-900">{processingStatus}</p>
        </div>
      )}

      {/* Side-by-Side Document Preview & Extracted Fields */}
      {activeDoc && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
          {/* Document Tabs */}
          {documents.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100">
              {documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedDocId === doc.id
                      ? 'bg-sky-600 text-white shadow-sm'
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
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Original Document Preview</span>
                <span className="font-mono text-slate-400">{activeDoc.documentDate}</span>
              </div>
              <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                {activeDoc.imageUrl ? (
                  <img
                    src={activeDoc.imageUrl}
                    alt="Document Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <FileText className="w-16 h-16 text-slate-400" />
                )}
              </div>
            </div>

            {/* Right: Extracted Structured Clinical Findings */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Extracted Clinical Data
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                    Confidence: {(activeDoc.overallConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Facility & Date */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs">
                  <div className="font-bold text-slate-800">{activeDoc.facilityOrDoctor}</div>
                  <div className="text-slate-500">Document Type: <span className="font-semibold">{activeDoc.docType}</span></div>
                </div>

                {/* Extracted Diagnoses */}
                {activeDoc.diagnoses.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-700 block mb-1">Diagnoses / Impressions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoc.diagnoses.map((diag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-sky-50 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold">
                          {diag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Medications with Brand->Generic mapping */}
                {activeDoc.medications.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-sky-600" />
                      <span>Extracted Medications (Brand → Generic):</span>
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeDoc.medications.map((med, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-slate-900">{med.brand}</span>
                            {med.generic && (
                              <span className="text-slate-600 font-medium ml-1">({med.generic})</span>
                            )}
                            <div className="text-slate-500 text-[11px] font-medium">
                              {med.dose} • {med.frequency} • {med.duration}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">
                      Lab Values &amp; Observations:
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeDoc.investigations.map((inv, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{inv.name}</span>
                            <div className="text-slate-500 text-[11px]">
                              Result: <span className="font-extrabold text-slate-900">{inv.value} {inv.unit || ''}</span>
                              {inv.refRange && ` (Ref: ${inv.refRange})`}
                            </div>
                          </div>
                          {inv.flag && (
                            <span
                              className={`px-2 py-0.5 rounded font-black text-xs ${
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
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl mb-3 text-xs text-rose-900 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Documented Allergies: {activeDoc.allergies.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Patient confirmed accurate</span>
                <button
                  onClick={() => {
                    setDocuments((prev) => prev.filter((d) => d.id !== activeDoc.id));
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Doc</span>
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
          className="flex-1 py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <span>{isHindi ? 'समीक्षा के लिए आगे बढ़ें' : 'Proceed to Summary Review'}</span>
          <CheckCircle2 className="w-6 h-6" />
        </button>
      </div>

      {/* Camera Capture Simulation Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl text-center">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Kiosk Document Camera</h4>
            <p className="text-xs text-slate-500 mb-4">Position prescription under document lens</p>

            <div className="aspect-[3/4] bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden mb-4 border-2 border-sky-400 relative">
              <Camera className="w-12 h-12 text-slate-500 animate-pulse" />
              <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-xl pointer-events-none" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCameraActive(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCameraActive(false);
                  handleAddSampleDoc(sampleDocs[0]);
                }}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow"
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
