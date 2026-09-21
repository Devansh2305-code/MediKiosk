import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Heart,
  HelpCircle,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { COMPLAINT_MODULES, ComplaintModule, OntologySlot } from '../ontology/clinicalOntology';
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

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [pendingValue, setPendingValue] = useState<any>(null);
  const [manualInputText, setManualInputText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

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

  // Speak prompt when changing slots
  useEffect(() => {
    if (currentSlot) {
      const promptText = isHindi ? currentSlot.questionPromptHi : currentSlot.questionPromptEn;
      onSpeak(promptText);
    }
  }, [currentSlotIndex, selectedComplaintId]);

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

  const handleConfirmSlotValue = (val: any) => {
    if (!currentSlot || !selectedComplaintId) return;

    const newSlotVal: HistorySlotValue = {
      slotKey: currentSlot.key,
      value: val,
      metadata: {
        source: isListening ? 'patient_voice' : 'patient_tap',
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      },
    };

    const updatedSlots: Record<string, HistorySlotValue> = {
      ...filledSlots,
      [currentSlot.key]: newSlotVal,
    };

    setFilledSlots(updatedSlots);
    setIsAwaitingConfirmation(false);
    setTranscript('');
    setPendingValue(null);
    setShowManualInput(false);
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

    return (
      <div id="step-chief-complaint" className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 mb-3 shadow-sm">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            {isHindi ? 'आपको मुख्य रूप से क्या तकलीफ है?' : 'What is your main symptom or concern today?'}
          </h2>
          <p className="text-base text-slate-600 font-medium">
            {isHindi ? 'नीचे दिए गए विकल्पों में से सबसे सही लक्षण को छुएं' : 'Tap the primary symptom below to start the interview'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {complaintsList.map((mod) => (
            <button
              key={mod.id}
              id={`complaint-card-${mod.id}`}
              onClick={() => handleSelectComplaint(mod.id)}
              className="p-6 rounded-3xl border-2 border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/50 shadow-sm cursor-pointer transition-all duration-150 flex flex-col items-center text-center group active:scale-[0.98]"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {mod.icon === 'HeartPulse' ? '❤️' : mod.icon === 'Lungs' ? '🫁' : mod.icon === 'Thermometer' ? '🌡️' : '🩺'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-sky-800 mb-1">
                {isHindi ? mod.titleHi : mod.titleEn}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {isHindi ? mod.titleEn : mod.titleHi}
              </p>
            </button>
          ))}
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

      {/* Progress & Slot Counter */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (currentSlotIndex > 0) setCurrentSlotIndex((prev) => prev - 1);
            else setSelectedComplaintId(null);
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          ← {isHindi ? 'पिछला सवाल' : 'Previous'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            {isHindi ? 'सवाल' : 'Question'} {currentSlotIndex + 1} / {currentModule?.slots.length}
          </span>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 transition-all duration-300"
              style={{
                width: `${(((currentSlotIndex + 1) / (currentModule?.slots.length || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Primary Question Box with Large Font & Speaker Replay */}
      {currentSlot && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold mb-4">
            <span>🩺</span>
            <span>{isHindi ? currentModule?.titleHi : currentModule?.titleEn}</span>
          </div>

          <h2
            id="kiosk-question-prompt"
            className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-snug"
          >
            {isHindi ? currentSlot.questionPromptHi : currentSlot.questionPromptEn}
          </h2>

          <button
            onClick={() =>
              onSpeak(isHindi ? currentSlot.questionPromptHi : currentSlot.questionPromptEn)
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 text-xs font-bold transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isHindi ? 'सवाल दोबारा सुनें' : 'Replay Question'}</span>
          </button>
        </div>
      )}

      {/* "Did I Hear Right?" Confirmation Box if voice was just captured */}
      {isAwaitingConfirmation && (
        <div className="bg-sky-50 border-2 border-sky-400 rounded-3xl p-6 mb-6 text-center animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-2">
            {isHindi ? 'क्या मैंने सही सुना?' : 'Did I hear this correctly?'}
          </div>
          <div className="text-2xl font-black text-slate-900 mb-4">
            "{String(pendingValue)}"
          </div>

          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={() => {
                setIsAwaitingConfirmation(false);
                setPendingValue(null);
                setTranscript('');
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 text-sm hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              {isHindi ? 'दोबारा बोलें' : 'Retry'}
            </button>

            <button
              id="btn-confirm-voice-match"
              onClick={() => handleConfirmSlotValue(pendingValue)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md"
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
          <div className="text-sm font-bold text-slate-700 mb-3 text-center">
            {isHindi ? 'चेहरे के अनुसार दर्द की तीव्रता चुनें:' : 'Select the face matching your pain intensity:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {WONG_BAACES_SCALE(WONG_BAKER_FACES, handleConfirmSlotValue, isHindi)}
          </div>
        </div>
      )}

      {/* Touch Options Grid for Multiple Choice Slots */}
      {currentSlot?.options && currentSlot.inputType !== 'severity_scale' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {currentSlot.options.map((opt) => (
            <button
              key={opt.id}
              id={`slot-opt-${opt.id}`}
              onClick={() => handleConfirmSlotValue(opt.mapsToSlotValue)}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-600 bg-white hover:bg-sky-50/50 shadow-sm transition-all flex items-center justify-between text-left font-bold text-base md:text-lg text-slate-800 min-h-[64px] active:scale-[0.99] group"
            >
              <span>{isHindi ? opt.labelHi : opt.labelEn}</span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Voice Multimodal Input Bar (Big Mic Button with Pulse Waveform) */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center mb-6">
        <div className="flex flex-col items-center">
          <button
            id="btn-voice-mic"
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                : 'bg-sky-600 hover:bg-sky-700 text-white ring-4 ring-sky-100'
            }`}
          >
            {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
          </button>

          <p className="text-sm font-bold text-slate-700 mt-3">
            {isListening
              ? isHindi
                ? 'सुन रहे हैं... कृपया साफ आवाज में बोलें'
                : 'Listening... Please speak clearly'
              : isHindi
              ? 'बोलने के लिए माइक दबाएं'
              : 'Tap Mic to Speak Answer'}
          </p>

          {transcript && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-800 max-w-md">
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
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border rounded-lg text-xs font-semibold text-slate-700"
              >
                Hindi: "भारी दबाव + सांस फूलना" (ACS Trigger)
              </button>
              <button
                onClick={() => handleScriptedVoiceDemo('खाना खाने के बाद हल्की सीने में जलन है')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border rounded-lg text-xs font-semibold text-slate-700"
              >
                Hindi: "हल्की जलन"
              </button>
            </>
          )}

          {currentSlot?.key === 'duration' && (
            <>
              <button
                onClick={() => handleScriptedVoiceDemo('मुझे दो दिन से यह तकलीफ है')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border rounded-lg text-xs font-semibold text-slate-700"
              >
                Hindi: "दो दिन से है"
              </button>
            </>
          )}

          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="px-2.5 py-1 text-sky-700 text-xs font-bold underline"
          >
            {showManualInput ? 'Close keyboard' : 'Type manually'}
          </button>
        </div>

        {showManualInput && (
          <div className="mt-4 flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={manualInputText}
              onChange={(e) => setManualInputText(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 px-4 py-2.5 border rounded-xl text-sm"
            />
            <button
              onClick={() => {
                if (manualInputText.trim()) {
                  handleConfirmSlotValue(manualInputText.trim());
                }
              }}
              className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-sm"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function WONG_BAACES_SCALE(
  faces: typeof WONG_BAKER_FACES,
  onSelect: (val: number) => void,
  isHindi: boolean
) {
  return faces.map((face) => (
    <button
      key={face.level}
      id={`face-scale-${face.level}`}
      onClick={() => onSelect(face.level)}
      className="p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50 transition-all flex flex-col items-center text-center group active:scale-95 min-h-[96px]"
    >
      <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">{face.emoji}</span>
      <span className="text-lg font-black text-slate-900">{face.level}</span>
      <span className="text-xs font-semibold text-slate-500 leading-tight">
        {isHindi ? face.labelHi : face.labelEn}
      </span>
    </button>
  ));
}
