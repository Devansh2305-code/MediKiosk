import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Heart,
  HelpCircle,
  Keyboard,
  ListChecks,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { COMPLAINT_MODULES, ComplaintModule, OntologySlot, TapOption } from '../ontology/clinicalOntology';
import { evaluateRedFlags } from '../ontology/redFlagRules';
import { WebSpeechASR } from '../services/asrAdapter';
import { llmService } from '../services/llmAdapter';
import { triageStore } from '../services/triageStore';
import { ChiefComplaintId, HistorySlotValue, LanguageCode, PatientProfile, RedFlagAlert } from '../types';

interface InterviewStepProps {
  language: LanguageCode;
  patient: PatientProfile;
  initialSlots?: Record<string, HistorySlotValue>;
  onComplete: (slots: Record<string, HistorySlotValue>, redFlags: RedFlagAlert[]) => void;
  onSpeak: (text: string) => void;
  highContrast: boolean;
}

const WONG_BAKER_FACES = [
  { level: 0, labelEn: 'No Hurt', labelHi: 'बिल्कुल दर्द नहीं', emoji: '😄', color: 'text-emerald-500' },
  { level: 2, labelEn: 'Hurts Little', labelHi: 'हल्का दर्द', emoji: '🙂', color: 'text-lime-500' },
  { level: 4, labelEn: 'Hurts Little More', labelHi: 'थोड़ा ज्यादा', emoji: '😐', color: 'text-amber-500' },
  { level: 6, labelEn: 'Hurts Even More', labelHi: 'काफी दर्द', emoji: '🙁', color: 'text-orange-500' },
  { level: 8, labelEn: 'Hurts Whole Lot', labelHi: 'बहुत तेज दर्द', emoji: '😣', color: 'text-rose-500' },
  { level: 10, labelEn: 'Hurts Worst', labelHi: 'असहनीय दर्द', emoji: '😭', color: 'text-red-700' },
];

export const InterviewStep: React.FC<InterviewStepProps> = ({
  language,
  patient,
  initialSlots = {},
  onComplete,
  onSpeak,
  highContrast,
}) => {
  const isHindi = language === 'hi';

  const [selectedComplaintId, setSelectedComplaintId] = useState<ChiefComplaintId | null>(null);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [filledSlots, setFilledSlots] = useState<Record<string, HistorySlotValue>>(initialSlots);
  const [activeAlerts, setActiveAlerts] = useState<RedFlagAlert[]>([]);

  // Multi-option selection state for current slot
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState<any>(null);
  const [manualInputText, setManualInputText] = useState('');

  const asr = React.useMemo(() => new WebSpeechASR(), []);

  // 1. Select Chief Complaint
  const handleSelectComplaint = (id: ChiefComplaintId) => {
    setSelectedComplaintId(id);
    setCurrentSlotIndex(0);

    const module = COMPLAINT_MODULES[id];
    const initialSlot = module.slots[0];
    const promptText = isHindi ? initialSlot.questionPromptHi : initialSlot.questionPromptEn;
    onSpeak(promptText);

    const slotVal: HistorySlotValue = {
      slotKey: 'chief_complaint',
      value: id,
      label: isHindi ? module.titleHi : module.titleEn,
      metadata: {
        source: 'patient_tap',
        confidence: 1.0,
        timestamp: new Date().toISOString(),
      },
    };

    setFilledSlots((prev) => ({
      ...prev,
      chief_complaint: slotVal,
    }));
  };

  const currentModule: ComplaintModule | null = selectedComplaintId
    ? COMPLAINT_MODULES[selectedComplaintId]
    : null;
  const currentSlot: OntologySlot | null = currentModule
    ? currentModule.slots[currentSlotIndex] || null
    : null;

  // Synchronize options & input state whenever current question / slot changes
  useEffect(() => {
    if (!currentSlot) return;

    const existing = filledSlots[currentSlot.key];
    if (existing) {
      if (existing.metadata && (existing.metadata as any).selectedOptionIds) {
        setSelectedOptionIds((existing.metadata as any).selectedOptionIds);
      } else if (currentSlot.options) {
        const existingStr = String(existing.value || '');
        const matched = currentSlot.options
          .filter(
            (opt) =>
              existingStr.includes(String(opt.mapsToSlotValue)) ||
              existingStr.includes(opt.labelEn) ||
              existingStr.includes(opt.labelHi) ||
              opt.id === existingStr
          )
          .map((opt) => opt.id);
        setSelectedOptionIds(matched);
      } else {
        setSelectedOptionIds([]);
      }

      if (
        existing.value &&
        !currentSlot.options?.some((o) => o.mapsToSlotValue === existing.value) &&
        currentSlot.inputType !== 'severity_scale'
      ) {
        setManualInputText(String(existing.value));
      } else {
        setManualInputText('');
      }
    } else {
      setSelectedOptionIds([]);
      setManualInputText('');
    }
  }, [currentSlotIndex, selectedComplaintId]);

  // Speak prompt when changing slots
  useEffect(() => {
    if (currentSlot) {
      const promptText = isHindi ? currentSlot.questionPromptHi : currentSlot.questionPromptEn;
      onSpeak(promptText);
    }
  }, [currentSlotIndex, selectedComplaintId]);

  // Multi-option toggle logic
  const toggleOption = (opt: TapOption) => {
    setSelectedOptionIds((prev) => {
      const isExclusive =
        opt.id === 'none' ||
        opt.id === 'no_spread' ||
        opt.mapsToSlotValue === 'None' ||
        opt.mapsToSlotValue === 'none';

      if (isExclusive) {
        return prev.includes(opt.id) ? [] : [opt.id];
      }

      const nonExclusive = prev.filter((id) => {
        const o = currentSlot?.options?.find((x) => x.id === id);
        return !(
          o?.id === 'none' ||
          o?.id === 'no_spread' ||
          o?.mapsToSlotValue === 'None' ||
          o?.mapsToSlotValue === 'none'
        );
      });

      if (nonExclusive.includes(opt.id)) {
        return nonExclusive.filter((id) => id !== opt.id);
      } else {
        return [...nonExclusive, opt.id];
      }
    });
  };

  const handleConfirmSelectedOptions = () => {
    if (!currentSlot || selectedOptionIds.length === 0) return;

    const chosenOptions =
      currentSlot.options?.filter((o) => selectedOptionIds.includes(o.id)) || [];

    const displayLabel = chosenOptions
      .map((o) => (isHindi ? o.labelHi : o.labelEn))
      .join(', ');
    const combinedSlotValue = chosenOptions
      .map((o) => o.mapsToSlotValue)
      .join(', ');

    handleConfirmSlotValue(combinedSlotValue, displayLabel, selectedOptionIds);
  };

  // Voice recognition toggle
  const toggleListening = () => {
    if (isListening) {
      asr.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      asr.start({
        language,
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            handleSpeechResult(text);
          }
        },
        onError: () => {
          setIsListening(false);
        },
        onStateChange: (state) => {
          setIsListening(state === 'listening');
        },
      });
    }
  };

  const handleSpeechResult = async (utterance: string) => {
    if (!currentSlot || !selectedComplaintId) return;

    // Evaluate Red Flags immediately on speech
    const newAlerts = evaluateRedFlags({
      complaint: selectedComplaintId,
      slots: { ...filledSlots, [currentSlot.key]: utterance },
      utterances: [utterance],
      patientAge: patient.age,
      patientGender: patient.gender,
    });

    if (newAlerts.length > 0) {
      setActiveAlerts((prev) => [...prev, ...newAlerts]);
      newAlerts.forEach((a) => triageStore.addAlert(a));
    }

    // Call LLM / Deterministic Parser
    const turnResult = await llmService.processTurn({
      language,
      complaintId: selectedComplaintId,
      currentSlotKey: currentSlot.key,
      filledSlots,
      utterance,
    });

    const extractedItem = turnResult.extracted.find((e) => e.slot === currentSlot.key) || turnResult.extracted[0];
    const val = extractedItem ? extractedItem.value : utterance;

    setPendingValue(val);
    setIsAwaitingConfirmation(true);
  };

  const handleConfirmSlotValue = (val: any, customLabel?: string, selectedIds?: string[]) => {
    if (!currentSlot || !selectedComplaintId) return;

    const newSlotVal: HistorySlotValue = {
      slotKey: currentSlot.key,
      value: val,
      label: customLabel || (typeof val === 'string' ? val : JSON.stringify(val)),
      metadata: {
        source: isListening ? 'patient_voice' : 'patient_tap',
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        selectedOptionIds: selectedIds,
      } as any,
    };

    const updatedSlots: Record<string, HistorySlotValue> = {
      ...filledSlots,
      [currentSlot.key]: newSlotVal,
    };

    setFilledSlots(updatedSlots);
    setIsAwaitingConfirmation(false);
    setTranscript('');
    setPendingValue(null);
    setManualInputText('');

    // Re-evaluate Red Flags on confirmed slot state
    const redFlagHits = evaluateRedFlags({
      complaint: selectedComplaintId,
      slots: updatedSlots,
      patientAge: patient.age,
      patientGender: patient.gender,
    });

    if (redFlagHits.length > 0) {
      setActiveAlerts((prev) => [...prev, ...redFlagHits]);
      redFlagHits.forEach((a) => triageStore.addAlert(a));
    }

    // Advance to next slot or complete
    if (currentModule && currentSlotIndex < currentModule.slots.length - 1) {
      setCurrentSlotIndex((prev) => prev + 1);
    } else {
      // Finished all slots for complaint
      onComplete(updatedSlots, activeAlerts);
    }
  };

  // Demo shortcut button to simulate voice input (for hackathon)
  const handleScriptedVoiceDemo = (sampleUtterance: string) => {
    setTranscript(sampleUtterance);
    handleSpeechResult(sampleUtterance);
  };

  // 1. Chief Complaint Selection Screen
  if (!selectedComplaintId) {
    const complaintsList = Object.values(COMPLAINT_MODULES);

    const COMPLAINT_THEMES: Record<string, {
      gradient: string;
      hoverBorder: string;
      badgeBg: string;
      badgeText: string;
      icon: string;
    }> = {
      chest_pain: {
        gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
        hoverBorder: 'hover:border-rose-500 hover:shadow-rose-500/20',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        badgeText: 'Cardiology',
        icon: '❤️',
      },
      cough: {
        gradient: 'from-sky-500/10 via-cyan-500/5 to-transparent',
        hoverBorder: 'hover:border-sky-500 hover:shadow-sky-500/20',
        badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
        badgeText: 'Pulmonology',
        icon: '🫁',
      },
      abdominal_pain: {
        gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
        hoverBorder: 'hover:border-amber-500 hover:shadow-amber-500/20',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        badgeText: 'Gastroenterology',
        icon: '🤢',
      },
      fever: {
        gradient: 'from-orange-500/10 via-red-500/5 to-transparent',
        hoverBorder: 'hover:border-orange-500 hover:shadow-orange-500/20',
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        badgeText: 'Internal Medicine',
        icon: '🌡️',
      },
      headache: {
        gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
        hoverBorder: 'hover:border-purple-500 hover:shadow-purple-500/20',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        badgeText: 'Neurology',
        icon: '🧠',
      },
      joint_pain: {
        gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
        hoverBorder: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        badgeText: 'Orthopedics / AYUSH',
        icon: '🦴',
      },
    };

    return (
      <div id="step-chief-complaint" className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white mb-3 shadow-lg shadow-sky-500/20 border border-white/40">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {isHindi ? 'आपको मुख्य रूप से क्या तकलीफ है?' : 'What is your main symptom or concern today?'}
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium">
            {isHindi ? 'नीचे दिए गए मुख्य लक्षण को छुएं ताकि सही डॉक्टर चुन सकें' : 'Select your primary symptom below to begin the guided clinical interview'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {complaintsList.map((mod) => {
            const theme = COMPLAINT_THEMES[mod.id] || {
              gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
              hoverBorder: 'hover:border-sky-500 hover:shadow-sky-500/20',
              badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
              badgeText: 'General OPD',
              icon: '🩺',
            };

            return (
              <button
                key={mod.id}
                id={`complaint-card-${mod.id}`}
                onClick={() => handleSelectComplaint(mod.id)}
                className={`p-6 rounded-3xl border-2 border-slate-200/90 ${theme.hoverBorder} bg-white hover:bg-white shadow-sm hover:shadow-xl cursor-pointer transition-all duration-200 flex flex-col items-center text-center group active:scale-[0.98] relative overflow-hidden`}
              >
                {/* Subtle Ambient Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                      {theme.badgeText}
                    </span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
                      Tap to Start →
                    </span>
                  </div>

                  <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">
                    {theme.icon}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-900 mb-1 leading-snug">
                    {isHindi ? mod.titleHi : mod.titleEn}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {isHindi ? mod.titleEn : mod.titleHi}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Active 1-Question-Per-Screen Dialogue Screen
  return (
    <div id="step-interview-active" className="max-w-3xl mx-auto px-4 py-6">
      {/* Calm Patient Red-Flag Alert Banner if rule fired */}
      {activeAlerts.length > 0 && (
        <div
          id="kiosk-red-flag-banner"
          className="mb-6 p-5 rounded-3xl bg-amber-500 text-white shadow-lg border-2 border-amber-600 flex items-start gap-4 animate-fadeIn"
        >
          <div className="p-3 bg-white/20 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-black mb-1">
              {isHindi ? 'कृपया यहीं आराम से बैठें' : 'Please remain seated comfortably'}
            </h4>
            <p className="text-base font-medium leading-relaxed">
              {isHindi
                ? 'हमारे नर्सिंग एवं मेडिकल स्टाफ को सूचित कर दिया गया है। वे प्राथमिकता के साथ तुरंत आपकी सहायता के लिए आ रहे हैं।'
                : 'Our clinical triage staff has been notified with high priority and is attending to you immediately.'}
            </p>
          </div>
        </div>
      )}

      {/* Progress, Stepper & Navigation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <button
            id="btn-nav-previous-question"
            onClick={() => {
              if (currentSlotIndex > 0) {
                setCurrentSlotIndex((prev) => prev - 1);
              } else {
                setSelectedComplaintId(null);
              }
            }}
            className="px-3.5 py-2 rounded-2xl bg-white border-2 border-slate-200 hover:border-sky-500 text-xs font-black text-slate-700 hover:text-sky-900 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-sky-600" />
            <span>
              {currentSlotIndex > 0
                ? isHindi
                  ? '← पिछला सवाल देखें'
                  : '← View Previous Question'
                : isHindi
                ? '← मुख्य लक्षण बदलें'
                : '← Change Complaint'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-700">
              {isHindi ? 'सवाल' : 'Question'} {currentSlotIndex + 1} / {currentModule?.slots.length}
            </span>
            <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
                style={{
                  width: `${(((currentSlotIndex + 1) / (currentModule?.slots.length || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Question Stepper Pills (Tap any completed question to view/edit) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {currentModule?.slots.map((slot, idx) => {
            const isCurrent = idx === currentSlotIndex;
            const hasAnswer = !!filledSlots[slot.key];
            const isPrevious = idx < currentSlotIndex;

            return (
              <button
                key={slot.key}
                type="button"
                id={`step-pill-${slot.key}`}
                onClick={() => {
                  if (idx <= currentSlotIndex || hasAnswer) {
                    setCurrentSlotIndex(idx);
                  }
                }}
                disabled={idx > currentSlotIndex && !hasAnswer}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 flex items-center gap-1.5 border ${
                  isCurrent
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/25 ring-2 ring-sky-300'
                    : hasAnswer
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title={isHindi ? slot.nameHi : slot.nameEn}
              >
                {hasAnswer && !isCurrent ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      isCurrent ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[120px]">{isHindi ? slot.nameHi : slot.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Previous Question Card - Lets Patient clearly view what was asked and answered */}
      {currentSlotIndex > 0 && currentModule && (
        <div
          id="card-previous-question-summary"
          className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-slate-50 via-sky-50/40 to-indigo-50/30 border-2 border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border border-sky-200 shadow-2xs">
              Q{currentSlotIndex}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>{isHindi ? 'पिछला सवाल' : 'Previous Question'}</span>
                <span>•</span>
                <span className="text-slate-800 font-extrabold">
                  {isHindi ? currentModule.slots[currentSlotIndex - 1].nameHi : currentModule.slots[currentSlotIndex - 1].nameEn}
                </span>
              </div>
              <p className="text-xs md:text-sm font-black text-slate-900 line-clamp-1 mt-0.5">
                {isHindi
                  ? currentModule.slots[currentSlotIndex - 1].questionPromptHi
                  : currentModule.slots[currentSlotIndex - 1].questionPromptEn}
              </p>
              {filledSlots[currentModule.slots[currentSlotIndex - 1].key] && (
                <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mt-1">
                  <span className="text-emerald-700 font-black">
                    ✓ {isHindi ? 'आपका दर्ज उत्तर:' : 'Your recorded answer:'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-white text-slate-900 font-black border border-emerald-300 shadow-2xs text-[11px] truncate max-w-xs">
                    {String(
                      filledSlots[currentModule.slots[currentSlotIndex - 1].key]?.label ||
                        filledSlots[currentModule.slots[currentSlotIndex - 1].key]?.value ||
                        'Recorded'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            id="btn-jump-previous-question"
            onClick={() => setCurrentSlotIndex((prev) => prev - 1)}
            className="px-3.5 py-2 rounded-2xl bg-white border-2 border-slate-300 hover:border-sky-500 text-slate-800 hover:text-sky-900 text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95 self-end sm:self-center"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>{isHindi ? 'सवाल देखें / बदलें' : 'View / Edit Question'}</span>
          </button>
        </div>
      )}

      {/* Notice if patient is currently reviewing an already answered question */}
      {currentSlot && filledSlots[currentSlot.key] && (
        <div className="mb-4 p-3.5 bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isHindi ? 'वर्तमान दर्ज उत्तर: ' : 'Previously recorded answer: '}
              <strong className="underline">
                "{String(filledSlots[currentSlot.key]?.label || filledSlots[currentSlot.key]?.value)}"
              </strong>
              {isHindi ? ' (आप नया चयन कर सकते हैं या आगे बढ़ सकते हैं)' : ' (You can change options or continue forward)'}
            </span>
          </div>

          {currentModule && currentSlotIndex < currentModule.slots.length - 1 && (
            <button
              type="button"
              id="btn-skip-to-next-question"
              onClick={() => setCurrentSlotIndex((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shrink-0 flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            >
              <span>{isHindi ? 'अगला सवाल →' : 'Next Question →'}</span>
            </button>
          )}
        </div>
      )}

      {/* Primary Question Box with Large Font & Speaker Replay */}
      {currentSlot && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 border-slate-200/90 shadow-md shadow-slate-200/50 mb-6 text-center relative overflow-hidden">
          {/* Subtle top accent ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-900 text-xs font-black mb-4 shadow-xs">
            <span className="text-base">🩺</span>
            <span>{isHindi ? currentModule?.titleHi : currentModule?.titleEn}</span>
          </div>

          <h2
            id="kiosk-question-prompt"
            className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-snug tracking-tight"
          >
            {isHindi ? currentSlot.questionPromptHi : currentSlot.questionPromptEn}
          </h2>

          <button
            onClick={() =>
              onSpeak(isHindi ? currentSlot.questionPromptHi : currentSlot.questionPromptEn)
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-100 to-sky-50 hover:from-sky-100 hover:to-indigo-50 text-slate-800 hover:text-sky-900 text-xs font-black transition-all shadow-xs border border-slate-200/80 active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-sky-600" />
            <span>{isHindi ? 'सवाल दोबारा सुनें (Listen Again)' : 'Replay Question Voice'}</span>
          </button>
        </div>
      )}

      {/* "Did I Hear Right?" Confirmation Box if voice was just captured */}
      {isAwaitingConfirmation && (
        <div className="bg-gradient-to-br from-sky-50 via-teal-50/40 to-indigo-50 border-2 border-sky-500 rounded-3xl p-6 mb-6 text-center animate-fadeIn shadow-lg shadow-sky-500/10">
          <div className="text-xs font-black uppercase tracking-wider text-sky-900 mb-1 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span>{isHindi ? 'क्या मैंने सही सुना?' : 'Did I hear this correctly?'}</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 my-3 bg-white/80 py-3 px-6 rounded-2xl border border-sky-200 inline-block shadow-xs">
            "{String(pendingValue)}"
          </div>

          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={() => {
                setIsAwaitingConfirmation(false);
                setPendingValue(null);
                setTranscript('');
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 font-extrabold text-slate-700 text-sm hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-1 text-slate-500" />
              {isHindi ? 'दोबारा बोलें' : 'Retry'}
            </button>

            <button
              id="btn-confirm-voice-match"
              onClick={() => handleConfirmSlotValue(pendingValue)}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 inline mr-1" />
              {isHindi ? 'हाँ, सही है' : 'Yes, Correct'}
            </button>
          </div>
        </div>
      )}

      {/* Wong-Baker FACES Scale for Severity Slot */}
      {currentSlot?.inputType === 'severity_scale' && (
        <div className="mb-8">
          <div className="text-sm font-black text-slate-800 mb-3 text-center flex items-center justify-center gap-2">
            <span>⚡</span>
            <span>{isHindi ? 'चेहरे के अनुसार दर्द की तीव्रता चुनें:' : 'Select the face matching your pain intensity:'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {WONG_BAACES_SCALE(
              WONG_BAKER_FACES,
              handleConfirmSlotValue,
              isHindi,
              typeof filledSlots[currentSlot.key]?.value === 'number'
                ? Number(filledSlots[currentSlot.key]?.value)
                : undefined
            )}
          </div>
        </div>
      )}

      {/* Multi-Option Selection Grid for Options Slots */}
      {currentSlot?.options && currentSlot.inputType !== 'severity_scale' && (
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs md:text-sm font-black text-slate-700 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-sky-600" />
              <span>
                {isHindi
                  ? 'एक या अधिक विकल्प चुनें (आप कई लक्षण एक साथ चुन सकते हैं):'
                  : 'Select one or more options that apply (multiple selections allowed):'}
              </span>
            </div>
            {selectedOptionIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedOptionIds([])}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                {isHindi ? 'सभी हटाएं (Clear)' : 'Clear All'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentSlot.options.map((opt) => {
              const isSelected = selectedOptionIds.includes(opt.id);

              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`slot-opt-${opt.id}`}
                  onClick={() => toggleOption(opt)}
                  className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between text-left min-h-[68px] active:scale-[0.99] cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-50 via-teal-50/40 to-indigo-50 border-sky-500 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/30'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 group-hover:border-sky-400 bg-white'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-sky-300" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-base md:text-lg font-black transition-colors block ${
                          isSelected ? 'text-sky-950' : 'text-slate-800 group-hover:text-slate-900'
                        }`}
                      >
                        {isHindi ? opt.labelHi : opt.labelEn}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {isHindi ? opt.labelEn : opt.labelHi}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : 'bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (isHindi ? '✓ चुना' : '✓ Selected') : (isHindi ? '+ चुनें' : '+ Select')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Bar for Multiple Selections */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-slate-200 shadow-sm">
            <div className="text-xs md:text-sm font-bold text-slate-600 flex-1">
              {selectedOptionIds.length === 0 ? (
                <span className="text-slate-400">
                  {isHindi
                    ? 'कृपया ऊपर से 1 या अधिक विकल्प चुनें, या नीचे बोलें/लिखें'
                    : 'Select 1 or more options above, or speak / type below'}
                </span>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-black text-xs border border-sky-200">
                    {selectedOptionIds.length} {isHindi ? 'विकल्प चुने गए' : 'selected'}
                  </span>
                  <span className="text-slate-800 font-bold text-xs truncate max-w-md">
                    {currentSlot.options
                      .filter((o) => selectedOptionIds.includes(o.id))
                      .map((o) => (isHindi ? o.labelHi : o.labelEn))
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-confirm-slot-options"
              disabled={selectedOptionIds.length === 0}
              onClick={handleConfirmSelectedOptions}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-sm md:text-base shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>
                {selectedOptionIds.length > 1
                  ? isHindi
                    ? `चुने गए (${selectedOptionIds.length}) विकल्प दर्ज करें व आगे बढ़ें`
                    : `Confirm ${selectedOptionIds.length} Options & Continue`
                  : isHindi
                  ? 'चयन दर्ज करें व अगला सवाल देखें'
                  : 'Confirm & Next Question'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Voice Multimodal Input Bar (Big Mic Button with Pulse Waveform) */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border-2 border-slate-200/90 shadow-md text-center mb-6 relative overflow-hidden">
        <div className="flex flex-col items-center relative z-10">
          <button
            id="btn-voice-mic"
            onClick={toggleListening}
            className={`w-22 h-22 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xl ${
              isListening
                ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white ring-8 ring-rose-200/80 shadow-rose-500/30 scale-105 animate-pulse'
                : 'bg-gradient-to-tr from-sky-500 via-teal-500 to-indigo-600 hover:scale-105 text-white ring-4 ring-sky-100 shadow-sky-500/25'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>

          <p className="text-sm md:text-base font-black text-slate-800 mt-3">
            {isListening
              ? isHindi
                ? 'सुन रहे हैं... कृपया साफ आवाज में बोलें'
                : 'Listening... Please speak your answer'
              : isHindi
              ? 'बोलने के लिए माइक बटन दबाएं'
              : 'Tap Mic to Speak in Any Indian Language'}
          </p>

          {transcript && (
            <div className="mt-3 p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-sm font-bold text-sky-900 max-w-md shadow-xs">
              "{transcript}"
            </div>
          )}
        </div>

        {/* Hackathon Demo Quick-Utterance Shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-slate-400">⚡ Demo Voice Simulator:</span>
          {currentSlot?.key === 'character' && (
            <>
              <button
                onClick={() =>
                  handleScriptedVoiceDemo('सीने में बहुत भारी दबाव महसूस हो रहा है और सांस फूल रही है')
                }
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-extrabold text-rose-800 transition-colors"
              >
                Hindi: "भारी दबाव + सांस फूलना" (ACS Red Flag)
              </button>
              <button
                onClick={() => handleScriptedVoiceDemo('खाना खाने के बाद हल्की सीने में जलन है')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                Hindi: "हल्की जलन"
              </button>
            </>
          )}

          {currentSlot?.key === 'duration' && (
            <>
              <button
                onClick={() => handleScriptedVoiceDemo('मुझे दो दिन से यह तकलीफ है')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                Hindi: "दो दिन से है"
              </button>
            </>
          )}
        </div>

        {/* Permanent Text Box: Tap/Click to open on-screen/device keyboard */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-left max-w-xl mx-auto w-full">
          <label
            htmlFor="slot-text-input"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 mb-2"
          >
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <span>
              {isHindi
                ? 'या यहाँ लिखकर बताएं (कीबोर्ड खोलने के लिए बॉक्स छुएं):'
                : 'Or Type Your Response (click box to open keyboard):'}
            </span>
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInputText.trim()) {
                handleConfirmSlotValue(manualInputText.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                id="slot-text-input"
                type="text"
                value={manualInputText}
                onChange={(e) => setManualInputText(e.target.value)}
                placeholder={
                  isHindi
                    ? 'यहाँ टाइप करें (उदा. दो दिन से, तेज जलन, सीने में दर्द)...'
                    : 'Type your answer here (e.g. 2 days, heavy pressure)...'
                }
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-2xl text-sm md:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                autoComplete="off"
              />
              {manualInputText && (
                <button
                  type="button"
                  onClick={() => setManualInputText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              id="btn-submit-text-input"
              disabled={!manualInputText.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-2xl text-sm shadow-md shadow-sky-500/20 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>{isHindi ? 'दर्ज करें' : 'Submit'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

function WONG_BAACES_SCALE(
  faces: typeof WONG_BAKER_FACES,
  onSelect: (val: number) => void,
  isHindi: boolean,
  currentScore?: number
) {
  const PAIN_COLORS: Record<number, {
    bg: string;
    border: string;
    badge: string;
    glow: string;
  }> = {
    0: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/80',
      border: 'border-emerald-300 hover:border-emerald-500',
      badge: 'bg-emerald-500 text-white',
      glow: 'hover:shadow-emerald-500/20',
    },
    2: {
      bg: 'bg-lime-50/80 hover:bg-lime-100/80',
      border: 'border-lime-300 hover:border-lime-500',
      badge: 'bg-lime-600 text-white',
      glow: 'hover:shadow-lime-500/20',
    },
    4: {
      bg: 'bg-amber-50/80 hover:bg-amber-100/80',
      border: 'border-amber-300 hover:border-amber-500',
      badge: 'bg-amber-500 text-white',
      glow: 'hover:shadow-amber-500/20',
    },
    6: {
      bg: 'bg-orange-50/80 hover:bg-orange-100/80',
      border: 'border-orange-300 hover:border-orange-500',
      badge: 'bg-orange-500 text-white',
      glow: 'hover:shadow-orange-500/20',
    },
    8: {
      bg: 'bg-rose-50/80 hover:bg-rose-100/80',
      border: 'border-rose-300 hover:border-rose-500',
      badge: 'bg-rose-600 text-white',
      glow: 'hover:shadow-rose-500/20',
    },
    10: {
      bg: 'bg-red-50/90 hover:bg-red-100/90',
      border: 'border-red-400 hover:border-red-600',
      badge: 'bg-red-700 text-white animate-pulse',
      glow: 'hover:shadow-red-500/30',
    },
  };

  return faces.map((face) => {
    const style = PAIN_COLORS[face.level] || PAIN_COLORS[0];
    const isSelected = currentScore !== undefined && currentScore === face.level;

    return (
      <button
        key={face.level}
        id={`face-scale-${face.level}`}
        onClick={() => onSelect(face.level)}
        className={`p-3.5 rounded-3xl border-2 transition-all duration-150 flex flex-col items-center text-center group active:scale-95 min-h-[115px] justify-between cursor-pointer ${
          isSelected
            ? 'ring-4 ring-sky-500 border-sky-500 bg-white scale-105 shadow-md shadow-sky-500/20'
            : `${style.border} ${style.bg} hover:shadow-lg ${style.glow}`
        }`}
      >
        <span className="text-4xl mb-1 group-hover:scale-115 transition-transform drop-shadow-xs">{face.emoji}</span>
        <span
          className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs ${
            isSelected ? 'bg-sky-600 text-white' : style.badge
          }`}
        >
          {isSelected ? (isHindi ? '✓ चुना (Score ' + face.level + ')' : '✓ Selected (' + face.level + ')') : `Score ${face.level}`}
        </span>
        <span className="text-[11px] font-bold text-slate-700 leading-tight mt-1">
          {isHindi ? face.labelHi : face.labelEn}
        </span>
      </button>
    );
  });
}
