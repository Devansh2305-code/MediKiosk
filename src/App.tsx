/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AbhaLoginStep } from './components/AbhaLoginStep';
import { AyushInterviewStep } from './components/AyushInterviewStep';
import { ConsentStep } from './components/ConsentStep';
import { DemoPanel } from './components/DemoPanel';
import { DoctorDashboard } from './components/DoctorDashboard';
import { DocumentUploadStep } from './components/DocumentUploadStep';
import { DoneStep } from './components/DoneStep';
import { InterviewStep } from './components/InterviewStep';
import { KioskHeader } from './components/KioskHeader';
import { LanguageSelector } from './components/LanguageSelector';
import { ReviewStep } from './components/ReviewStep';
import { TriageDashboard } from './components/TriageDashboard';
import { TRANSLATIONS } from './i18n/translations';
import { WebSpeechTTS } from './services/ttsAdapter';
import { sessionStore } from './services/sessionStore';
import { triageStore } from './services/triageStore';
import {
  AyushAssessment,
  ConsentArtifact,
  DigitizedDocument,
  ExtractedInvestigation,
  HistorySlotValue,
  LanguageCode,
  PatientProfile,
  RedFlagAlert,
  StructuredSummary,
} from './types';
import { HelpCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & Views
  const [activeView, setActiveView] = useState<'kiosk' | 'doctor' | 'triage' | 'demo'>('kiosk');
  const [currentStep, setCurrentStep] = useState<
    'language' | 'abha' | 'consent' | 'interview' | 'ayush' | 'documents' | 'review' | 'done'
  >('language');

  // Accessibility & Preferences
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [muted, setMuted] = useState(false);

  // Kiosk Session State
  const [patient, setPatient] = useState<PatientProfile>({
    name: 'Ramesh Kumar',
    age: 62,
    gender: 'M',
    abhaId: '91-4829-1048-2831',
    tokenNumber: 'A-108',
    department: 'Cardiology',
    opdRoom: 'Room 12 (Cardiology OPD)',
    registeredAt: new Date().toISOString(),
    abhaLinked: true,
  });

  const [consent, setConsent] = useState<ConsentArtifact | undefined>();
  const [historySlots, setHistorySlots] = useState<Record<string, HistorySlotValue>>({});
  const [ayushAssessment, setAyushAssessment] = useState<AyushAssessment | undefined>();
  const [documents, setDocuments] = useState<DigitizedDocument[]>([]);
  const [redFlags, setRedFlags] = useState<RedFlagAlert[]>([]);
  const [tokenNumber, setTokenNumber] = useState('A-108');
  const [opdRoom, setOpdRoom] = useState('Room 12 (Cardiology OPD)');
  const [department, setDepartment] = useState('Department of Cardiology');

  // Idle Timer
  const [idleCountdown, setIdleCountdown] = useState<number | undefined>(undefined);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [showHelpAlertModal, setShowHelpAlertModal] = useState(false);

  // Unread triage alert count
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Audio TTS instance
  const tts = useMemo(() => new WebSpeechTTS(), []);

  // Sync with Triage alerts
  useEffect(() => {
    const unsub = triageStore.subscribe(() => {
      const activeCount = triageStore.getAlerts().filter((a) => !a.acknowledged).length;
      setUnreadAlerts(activeCount);
    });
    return () => unsub();
  }, []);

  // Text-to-Speech handler
  const speakText = useCallback(
    (text: string) => {
      if (muted) return;
      tts.speak(text, {
        language,
        rate: speechRate,
      });
    },
    [muted, tts, language, speechRate]
  );

  // Reset Idle Activity timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (activeView !== 'kiosk' || currentStep === 'language') {
      setIdleCountdown(undefined);
      return;
    }

    let remaining = 90; // 90 seconds idle limit
    setIdleCountdown(remaining);

    idleTimerRef.current = setInterval(() => {
      remaining -= 1;
      setIdleCountdown(remaining);
      if (remaining <= 0) {
        if (idleTimerRef.current) clearInterval(idleTimerRef.current);
        handlePurgeAndStartOver();
      }
    }, 1000);
  }, [activeView, currentStep]);

  useEffect(() => {
    const handleActivity = () => resetIdleTimer();
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Handle Complete Session Purge (Start Over)
  const handlePurgeAndStartOver = () => {
    tts.cancel();
    sessionStore.purgeCurrentSession();
    setCurrentStep('language');
    setConsent(undefined);
    setHistorySlots({});
    setAyushAssessment(undefined);
    setDocuments([]);
    setRedFlags([]);
    setShowStartOverModal(false);
    speakText(
      language === 'hi'
        ? 'सत्र समाप्त कर दिया गया है। नई शुरुआत के लिए भाषा चुनें।'
        : 'Session wiped. Please choose language to begin.'
    );
  };

  // Trigger Staff Assistance
  const handleNeedHelp = () => {
    triageStore.addAlert({
      id: `HELP-${Date.now()}`,
      patientId: patient.abhaId || 'Kiosk-01-Walkin',
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      tokenNumber: patient.tokenNumber || 'A-108',
      timestamp: new Date().toISOString(),
      ruleId: 'STAFF_ASSIST_REQUESTED',
      severity: 'HIGH',
      title: 'Kiosk Patient Assistance Request',
      description: `Patient pressed 'Need Help' at Kiosk-01 (${patient.name})`,
      triggerEvidence: 'Need Help button pressed on kiosk UI',
      suggestedAction: 'Hospital assistant dispatched to Kiosk-01.',
      acknowledged: false,
      helpRequested: true,
    });
    setShowHelpAlertModal(true);
    speakText(
      language === 'hi'
        ? 'सहायक को सूचित कर दिया गया है। वे तुरंत आपके पास आ रहे हैं।'
        : 'A hospital assistant has been notified and is coming to assist you.'
    );
  };

  // Cycle Font Size
  const handleCycleFontSize = () => {
    setFontSizeMultiplier((prev) => (prev === 1.0 ? 1.2 : prev === 1.2 ? 1.4 : 1.0));
  };

  // Cycle Speech Rate
  const handleCycleSpeechRate = () => {
    setSpeechRate((prev) => (prev === 1.0 ? 1.2 : prev === 1.2 ? 0.8 : 1.0));
  };

  // Handlers for Kiosk Steps
  const handleSelectLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    setCurrentStep('abha');
    const t = TRANSLATIONS[newLang] || TRANSLATIONS.en;
    speakText(t.welcomeGreeting);
  };

  const handlePatientIdentified = (identified: PatientProfile) => {
    setPatient(identified);
    setTokenNumber(identified.tokenNumber || `T-${Math.floor(100 + Math.random() * 900)}`);
    setOpdRoom(identified.opdRoom || 'Room 04 (General OPD)');
    setDepartment(identified.department || 'Outpatient Department');
    setCurrentStep('consent');

    const prompt =
      language === 'hi'
        ? `नमस्ते ${identified.name} जी! कृपया डिजिटल सहमति की समीक्षा करें।`
        : `Welcome ${identified.name}! Please review your clinical consent.`;
    speakText(prompt);
  };

  const handleConsentGranted = (artifact: ConsentArtifact) => {
    setConsent(artifact);
    if (patient.department?.includes('AYUSH')) {
      setCurrentStep('ayush');
    } else {
      setCurrentStep('interview');
    }
  };

  const handleInterviewComplete = (
    slots: Record<string, HistorySlotValue>,
    alerts: RedFlagAlert[]
  ) => {
    setHistorySlots(slots);
    setRedFlags(alerts);
    setCurrentStep('documents');
    speakText(
      language === 'hi'
        ? 'अब यदि आपके पास पुराने पर्चे या जांच रिपोर्ट हैं, तो कृपया स्कैन करें।'
        : 'If you have any prior prescriptions or lab reports, please scan them now.'
    );
  };

  const handleAyushComplete = (assessment: AyushAssessment) => {
    setAyushAssessment(assessment);
    setCurrentStep('documents');
    speakText(
      language === 'hi'
        ? 'दशविध परीक्षा पूर्ण हुई। कृपया अपने पूर्व चिकित्सीय दस्तावेज स्कैन करें।'
        : 'AYUSH intake complete. Please scan prior medical documents.'
    );
  };

  const handleDocumentsComplete = (docs: DigitizedDocument[]) => {
    setDocuments(docs);
    setCurrentStep('review');
    speakText(
      language === 'hi'
        ? 'कृपया डॉक्टर को भेजने से पहले अपने विवरण की समीक्षा करें।'
        : 'Please review your structured summary before submitting to the physician.'
    );
  };

  // Structured Summary derived from slots & documents
  const summary: StructuredSummary = useMemo(() => {
    const complaintSlot = (historySlots.chief_complaint?.value as any) || 'chest_pain';
    const complaintTitle =
      complaintSlot === 'chest_pain'
        ? 'Chest Pain (सीने में दर्द)'
        : complaintSlot === 'cough_breathlessness'
        ? 'Cough & Breathlessness (खांसी व सांस फूलना)'
        : complaintSlot === 'abdominal_pain'
        ? 'Abdominal Pain (पेट दर्द)'
        : complaintSlot === 'fever_acute'
        ? 'Acute Fever (बुखार)'
        : complaintSlot === 'headache'
        ? 'Severe Headache (सिरदर्द)'
        : complaintSlot === 'joint_back_pain'
        ? 'Joint / Back Pain (जोड़ों का दर्द)'
        : 'General Consultation (सामान्य परामर्श)';

    const narrative = historySlots.character?.value
      ? `Patient presents with ${historySlots.character.value}, duration ${historySlots.duration?.value || 'recent onset'}. Pain severity reported at ${historySlots.severity?.value || 'moderate'} on Wong-Baker scale.`
      : `${complaintTitle} reported with onset ${historySlots.duration?.value || 'recently'}.`;

    // Extract medications from documents
    const docMeds = documents.flatMap((d) =>
      d.medications.map((m) => ({
        brand: m.brand,
        generic: m.generic,
        dose: m.dose,
        frequency: m.frequency,
        confidence: m.confidence,
        sourceDocumentDate: d.documentDate,
      }))
    );

    // Extract investigations
    const docInvs: ExtractedInvestigation[] = documents.flatMap((d) =>
      d.investigations.map((inv) => ({
        name: inv.name,
        value: `${inv.value} ${inv.unit || ''}`,
        flag: inv.flag,
        date: d.documentDate,
        confidence: inv.confidence || 0.9,
      }))
    );

    // Extract chronic conditions & allergies
    const pastMed = Array.from(new Set(documents.flatMap((d) => d.diagnoses)));
    const allgs = Array.from(new Set(documents.flatMap((d) => d.allergies)));

    return {
      alerts: {
        redFlags,
        allergies: allgs.length > 0 ? allgs : ['Penicillin'],
        interactions: [],
        abnormalLabs: docInvs.filter((i) => i.flag === 'H' || i.flag === 'L'),
        discrepancies: [],
      },
      chiefComplaint: {
        id: complaintSlot,
        title: complaintTitle,
        narrative,
        duration: String(historySlots.duration?.value || '2 days'),
        severity: typeof historySlots.severity?.value === 'number' ? historySlots.severity.value : 7,
      },
      hpi: {
        narrative,
        socrates: {
          onset: String(historySlots.duration?.value || '2 days'),
          character: String(historySlots.character?.value || 'Heavy pressure'),
          severity: typeof historySlots.severity?.value === 'number' ? historySlots.severity.value : 7,
          exacerbatingFactors: historySlots.aggravating?.value ? [String(historySlots.aggravating.value)] : ['Physical exertion'],
          relievingFactors: historySlots.relieving?.value ? [String(historySlots.relieving.value)] : ['Rest'],
        },
        rawSlots: historySlots,
      },
      pastMedical: pastMed.length > 0 ? pastMed : ['Type 2 Diabetes Mellitus', 'Hypertension'],
      pastSurgical: [],
      allergies: allgs.length > 0 ? allgs : ['Penicillin'],
      medications:
        docMeds.length > 0
          ? docMeds
          : [
              { brand: 'Glycomet-GP 1', generic: 'Metformin + Glimepiride', dose: '1 tab BD', confidence: 0.95 },
              { brand: 'Telma 40', generic: 'Telmisartan', dose: '1 tab OD', confidence: 0.98 },
            ],
      familyHistory: [],
      personalHistory: {},
      reviewOfSystems: {},
      priorInvestigations:
        docInvs.length > 0
          ? docInvs
          : [
              { name: 'HbA1c', value: '8.9%', flag: 'H', date: '2026-03-14', confidence: 0.95 },
              { name: 'Serum Creatinine', value: '1.68 mg/dL', flag: 'H', date: '2026-03-14', confidence: 0.92 },
            ],
      ayush: ayushAssessment,
      provenanceList: {},
    };
  }, [historySlots, documents, ayushAssessment, patient, redFlags]);

  const handleSubmitToDoctor = () => {
    setCurrentStep('done');
    speakText(
      language === 'hi'
        ? `आपका टोकन नंबर ${tokenNumber} है। कृपया ${opdRoom} में जाएं। डॉक्टर के पास आपकी पूरी जानकारी पहुंच चुकी है।`
        : `Your token number is ${tokenNumber}. Please proceed to ${opdRoom}. The physician has your complete history.`
    );
  };

  const handleSpeakRecap = () => {
    const severityScore = summary.chiefComplaint.severity ?? 7;
    const recapText =
      language === 'hi'
        ? `आपके मुख्य लक्षण: ${summary.chiefComplaint.title}। दर्द का स्तर ${severityScore}। कुल ${documents.length} रिपोर्ट स्कैन की गईं।`
        : `Primary complaint: ${summary.chiefComplaint.title}. Pain score: ${severityScore}/10. ${documents.length} medical records attached.`;
    speakText(recapText);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
      }`}
      style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
    >
      {/* Global Kiosk Header Bar */}
      <KioskHeader
        currentStep={currentStep}
        language={language}
        onLanguageChange={setLanguage}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        fontSizeMultiplier={fontSizeMultiplier}
        onChangeFontSize={handleCycleFontSize}
        speechRate={speechRate}
        onChangeSpeechRate={handleCycleSpeechRate}
        muted={muted}
        onToggleMute={() => setMuted(!muted)}
        onNeedHelp={handleNeedHelp}
        onStartOver={() => setShowStartOverModal(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        unreadAlertCount={unreadAlerts}
        idleCountdown={idleCountdown}
      />

      {/* Main Interactive Stage Body */}
      <main className="flex-1 flex flex-col justify-center w-full">
        {/* VIEW 1: PATIENT KIOSK (Guided 1-question flow) */}
        {activeView === 'kiosk' && (
          <div className="w-full">
            {currentStep === 'language' && (
              <LanguageSelector
                currentLanguage={language}
                onSelectLanguage={handleSelectLanguage}
                onPreviewSpeak={(lang) => {
                  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
                  speakText(t.welcomeGreeting);
                }}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'abha' && (
              <AbhaLoginStep
                language={language}
                onPatientIdentified={handlePatientIdentified}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'consent' && (
              <ConsentStep
                language={language}
                patient={patient}
                onConsentGranted={handleConsentGranted}
                onConsentWithdrawn={handlePurgeAndStartOver}
                onSpeakExplanation={speakText}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'interview' && (
              <InterviewStep
                language={language}
                patient={patient}
                initialSlots={historySlots}
                onComplete={handleInterviewComplete}
                onSpeak={speakText}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'ayush' && (
              <AyushInterviewStep
                language={language}
                onComplete={handleAyushComplete}
                onSpeak={speakText}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'documents' && (
              <DocumentUploadStep
                language={language}
                initialDocuments={documents}
                onComplete={handleDocumentsComplete}
                onSpeak={speakText}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'review' && (
              <ReviewStep
                language={language}
                patient={patient}
                slots={historySlots}
                documents={documents}
                summary={summary}
                onSubmitToDoctor={handleSubmitToDoctor}
                onSpeakRecap={handleSpeakRecap}
                highContrast={highContrast}
              />
            )}

            {currentStep === 'done' && (
              <DoneStep
                language={language}
                patient={patient}
                tokenNumber={tokenNumber}
                opdRoom={opdRoom}
                department={department}
                onResetForNextPatient={handlePurgeAndStartOver}
                onViewDoctorScreen={() => setActiveView('doctor')}
                highContrast={highContrast}
              />
            )}
          </div>
        )}

        {/* VIEW 2: DOCTOR EMR CONSULTATION TERMINAL */}
        {activeView === 'doctor' && (
          <DoctorDashboard
            currentPatient={patient}
            currentSummary={summary}
            currentDocuments={documents}
            currentConsent={consent}
            currentRedFlags={redFlags}
            onOpenKiosk={() => setActiveView('kiosk')}
          />
        )}

        {/* VIEW 3: LIVE TRIAGE & RED-FLAG MONITOR */}
        {activeView === 'triage' && (
          <TriageDashboard onOpenKiosk={() => setActiveView('kiosk')} />
        )}

        {/* VIEW 4: SIH HACKATHON DEMO & TEST PANEL */}
        {activeView === 'demo' && (
          <DemoPanel
            onLoadPersona={(persona) => {
              setPatient(persona);
              setTokenNumber(persona.tokenNumber || 'A-108');
              setOpdRoom(persona.opdRoom || 'Room 12');
              setDepartment(persona.department || 'General Medicine');
              setActiveView('kiosk');
              setCurrentStep('consent');
            }}
            onJumpToStep={(step) => {
              setActiveView('kiosk');
              setCurrentStep(step);
            }}
            onJumpToView={setActiveView}
          />
        )}
      </main>

      {/* Start Over Confirmation Modal */}
      {showStartOverModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {language === 'hi' ? 'सत्र समाप्त कर नई शुरुआत करें?' : 'Start Over for Next Patient?'}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {language === 'hi'
                ? 'यह आपकी वर्तमान जानकारी और अपलोड किए गए दस्तावेजों को सुरक्षित रूप से मिटा देगा।'
                : 'This will securely purge current session memory, documents, and reset the kiosk to language selection.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStartOverModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200"
              >
                {language === 'hi' ? 'जारी रखें' : 'Cancel'}
              </button>
              <button
                id="btn-confirm-start-over"
                onClick={handlePurgeAndStartOver}
                className="flex-1 py-3 bg-rose-600 text-white font-extrabold rounded-xl text-sm shadow hover:bg-rose-700"
              >
                {language === 'hi' ? 'हाँ, मिटाएं' : 'Yes, Purge & Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Help Dispatched Notice Modal */}
      {showHelpAlertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {language === 'hi' ? 'सहायक को सूचित कर दिया गया है' : 'Hospital Staff Alerted'}
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {language === 'hi'
                ? 'कियोस्क सहायता डेस्क को अलर्ट मिल चुका है। हमारे स्वास्थ्य मित्र तुरंत आपकी सहायता के लिए कियोस्क पर पहुंच रहे हैं।'
                : 'A nurse / health assistant at the triage desk has been dispatched to assist you at this kiosk.'}
            </p>
            <button
              onClick={() => setShowHelpAlertModal(false)}
              className="w-full py-3 bg-sky-600 text-white font-black rounded-xl text-sm shadow hover:bg-sky-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
