import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  Filter,
  Flame,
  Heart,
  History,
  Pill,
  Save,
  Search,
  Send,
  ShieldAlert,
  SortDesc,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { auditAndHisStore } from '../services/auditStore';
import { buildAbdmOpConsultFhirBundle, FhirBundle } from '../services/fhirBuilder';
import { triageStore } from '../services/triageStore';
import {
  ConsentArtifact,
  DigitizedDocument,
  DoctorReviewSession,
  ExtractedInvestigation,
  ExtractedMedication,
  HistorySlotValue,
  PatientProfile,
  RedFlagAlert,
  StructuredSummary,
} from '../types';

export type PatientSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE';

export interface QueuePatientItem {
  id: string;
  token: string;
  name: string;
  ageGender: string;
  complaint: string;
  department: string;
  severity: PatientSeverity;
  severityScore: number;
  severityReason: string;
  redFlagsCount: number;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';
  kioskReady: boolean;
  patient: PatientProfile;
  summary: StructuredSummary;
  documents: DigitizedDocument[];
}

interface DoctorDashboardProps {
  currentPatient?: PatientProfile;
  currentSummary?: StructuredSummary;
  currentDocuments?: DigitizedDocument[];
  currentConsent?: ConsentArtifact;
  currentRedFlags?: RedFlagAlert[];
  onOpenKiosk: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentPatient,
  currentSummary,
  currentDocuments = [],
  currentConsent,
  currentRedFlags = [],
  onOpenKiosk,
}) => {
  // Mock Queue of Patients in OPD with varied clinical severity
  const [queue, setQueue] = useState<QueuePatientItem[]>([
    {
      id: 'P-101',
      token: currentPatient?.tokenNumber || 'A-108',
      name: currentPatient?.name || 'Ramesh Kumar',
      ageGender: `${currentPatient?.age || 62} / ${currentPatient?.gender || 'M'}`,
      complaint: currentSummary?.chiefComplaint.title || 'Chest pain & breathlessness (2 days)',
      department: 'Cardiology',
      severity: currentRedFlags.length > 0 ? 'CRITICAL' : 'HIGH',
      severityScore: 10,
      severityReason: 'Red Flag: Suspected Acute Coronary Syndrome (ACS) • Pain 8/10 • Cold diaphoresis',
      redFlagsCount: currentRedFlags.length > 0 ? currentRedFlags.length : 1,
      status: 'IN_CONSULTATION',
      kioskReady: true,
      patient: currentPatient || {
        name: 'Ramesh Kumar',
        age: 62,
        gender: 'M',
        abhaId: '91-4829-1048-2831',
        tokenNumber: 'A-108',
        department: 'Cardiology',
        opdRoom: 'Room 12',
        registeredAt: new Date().toISOString(),
        abhaLinked: true,
      },
      summary: currentSummary || {
        alerts: {
          redFlags: [
            {
              id: 'RF-ACS-01',
              timestamp: new Date().toISOString(),
              ruleId: 'ACS_SUSPECTED',
              severity: 'CRITICAL',
              title: 'Suspected Acute Coronary Syndrome (ACS)',
              description: 'Patient reports retrosternal heavy pressure with radiation to arm and cold diaphoresis.',
              triggerEvidence: 'Crushing retrosternal pressure with diaphoresis',
              suggestedAction: 'Stat 12-lead ECG and immediate cardiology consultation.',
              patientId: '91-4829-1048-2831',
              patientName: 'Ramesh Kumar',
              patientAge: 62,
              patientGender: 'M',
              tokenNumber: 'A-108',
              status: 'NEW',
              acknowledged: false,
            } as any,
          ],
          allergies: ['Penicillin'],
          interactions: [],
          abnormalLabs: [],
          discrepancies: [],
        },
        chiefComplaint: {
          id: 'chest_pain',
          title: 'Chest Pain (सीने में दर्द)',
          narrative: 'Patient reports 2-day retrosternal crushing pressure, aggravated on walking, associated with breathlessness and cold sweating.',
          duration: '2 days',
          severity: 8,
        },
        hpi: {
          narrative: 'Patient reports 2-day retrosternal crushing pressure, aggravated on walking, associated with breathlessness and cold sweating.',
          socrates: {
            onset: '2 days ago',
            character: 'Heavy crushing pressure',
            severity: 8,
            exacerbatingFactors: ['Walking', 'physical exertion'],
            relievingFactors: ['Rest'],
          },
          rawSlots: {},
        },
        pastMedical: ['Type 2 Diabetes Mellitus', 'Essential Hypertension', 'Ischemic Heart Disease'],
        pastSurgical: [],
        allergies: ['Penicillin (Severe anaphylaxis)'],
        medications: [
          { brand: 'Glycomet-GP 1', generic: 'Metformin + Glimepiride', dose: '1 tab BD', confidence: 0.95 },
          { brand: 'Telma 40', generic: 'Telmisartan', dose: '1 tab OD', confidence: 0.98 },
          { brand: 'Ecosprin 75', generic: 'Aspirin', dose: '1 tab OD', confidence: 0.96 },
        ],
        familyHistory: [],
        personalHistory: {},
        reviewOfSystems: {},
        priorInvestigations: [
          { name: 'HbA1c', value: '8.9%', flag: 'H', date: '2026-03-14', confidence: 0.95 },
          { name: 'Serum Creatinine', value: '1.68 mg/dL', flag: 'H', date: '2026-03-14', confidence: 0.92 },
          { name: 'Fasting Blood Sugar', value: '184 mg/dL', flag: 'H', date: '2026-03-14', confidence: 0.96 },
        ],
        provenanceList: {},
      },
      documents: currentDocuments.length > 0 ? currentDocuments : [],
    },
    {
      id: 'P-104',
      token: 'A-114',
      name: 'Rajesh Verma',
      ageGender: '51 / M',
      complaint: 'Acute severe epigastric pain radiating to back (6 hrs)',
      department: 'General Medicine',
      severity: 'HIGH',
      severityScore: 8,
      severityReason: 'Severe Acute Abdomen (Pain 8/10) • Acute Pancreatitis / Cholecystitis risk • Repeated Vomiting',
      redFlagsCount: 0,
      status: 'WAITING',
      kioskReady: true,
      patient: {
        name: 'Rajesh Verma',
        age: 51,
        gender: 'M',
        abhaId: '91-7721-3941-8842',
        tokenNumber: 'A-114',
        department: 'General Medicine',
        opdRoom: 'Room 12',
        registeredAt: new Date().toISOString(),
        abhaLinked: true,
      },
      summary: {
        alerts: {
          redFlags: [],
          allergies: [],
          interactions: [],
          abnormalLabs: [{ name: 'Serum Amylase', value: '380 U/L', flag: 'H', confidence: 0.95 }],
          discrepancies: [],
        },
        chiefComplaint: {
          id: 'abdominal_pain',
          title: 'Acute Severe Epigastric Pain',
          narrative: 'Sudden severe epigastric stabbing pain radiating through to the back, associated with persistent nausea and bilious vomiting.',
          duration: '6 hours',
          severity: 8,
        },
        hpi: {
          narrative: 'Sudden onset severe epigastric stabbing pain radiating to the back for 6 hours. Pain worsens when supine, slightly eased by leaning forward.',
          socrates: { onset: '6 hours', character: 'Severe stabbing/burning', severity: 8 },
          rawSlots: {},
        },
        pastMedical: ['Gallstone disease (cholelithiasis)', 'Dyslipidemia'],
        pastSurgical: [],
        allergies: [],
        medications: [{ brand: 'Pantocid 40', generic: 'Pantoprazole', dose: '1 tab OD', confidence: 0.97 }],
        familyHistory: [],
        personalHistory: {},
        reviewOfSystems: {},
        priorInvestigations: [{ name: 'Ultrasound Abdomen', value: 'Multiple gallbladder calculi with acoustic shadowing', date: '2026-02-12', confidence: 0.94 }],
        provenanceList: {},
      },
      documents: [],
    },
    {
      id: 'P-102',
      token: 'B-215',
      name: 'Priya Sharma',
      ageGender: '34 / F',
      complaint: 'Chronic cough with wheezing & chest tightness (3 weeks)',
      department: 'Pulmonology',
      severity: 'MODERATE',
      severityScore: 5,
      severityReason: 'Bronchial Asthma flare-up • Nocturnal awakenings • Discomfort 5/10',
      redFlagsCount: 0,
      status: 'WAITING',
      kioskReady: true,
      patient: {
        name: 'Priya Sharma',
        age: 34,
        gender: 'F',
        abhaId: '91-8932-4412-9012',
        tokenNumber: 'B-215',
        department: 'Pulmonology',
        opdRoom: 'Room 08',
        registeredAt: new Date().toISOString(),
        abhaLinked: true,
      },
      summary: {
        alerts: { redFlags: [], allergies: [], interactions: [], abnormalLabs: [], discrepancies: [] },
        chiefComplaint: {
          id: 'cough_breathlessness',
          title: 'Cough with wheezing',
          narrative: 'Non-productive nocturnal cough for 3 weeks.',
          duration: '3 weeks',
          severity: 5,
        },
        hpi: {
          narrative: 'Non-productive nocturnal cough for 3 weeks, nocturnal awakenings, denies hemoptysis or fever.',
          socrates: { onset: '3 weeks', character: 'Dry hacking with wheeze', severity: 5 },
          rawSlots: {},
        },
        pastMedical: ['Bronchial Asthma since childhood'],
        pastSurgical: [],
        allergies: ['Dust mites', 'Sulfa drugs'],
        medications: [{ brand: 'Budecort Inhaler', generic: 'Budesonide', dose: '2 puffs BD', confidence: 0.94 }],
        familyHistory: [],
        personalHistory: {},
        reviewOfSystems: {},
        priorInvestigations: [{ name: 'Chest X-Ray', value: 'Hyperinflated lung fields', date: '2026-01-10', confidence: 0.9 }],
        provenanceList: {},
      },
      documents: [],
    },
    {
      id: 'P-105',
      token: 'C-302',
      name: 'Meera Bai',
      ageGender: '58 / F',
      complaint: 'Uncontrolled blood sugar, polyuria, diabetic tingling in feet',
      department: 'General Medicine',
      severity: 'MODERATE',
      severityScore: 4,
      severityReason: 'Poorly controlled Type 2 Diabetes • HbA1c 9.2% • Peripheral neuropathy symptoms • Discomfort 4/10',
      redFlagsCount: 0,
      status: 'WAITING',
      kioskReady: true,
      patient: {
        name: 'Meera Bai',
        age: 58,
        gender: 'F',
        abhaId: '91-6651-2918-4011',
        tokenNumber: 'C-302',
        department: 'General Medicine',
        opdRoom: 'Room 12',
        registeredAt: new Date().toISOString(),
        abhaLinked: true,
      },
      summary: {
        alerts: {
          redFlags: [],
          allergies: [],
          interactions: [],
          abnormalLabs: [{ name: 'HbA1c', value: '9.2%', flag: 'H', confidence: 0.98 }],
          discrepancies: [],
        },
        chiefComplaint: {
          id: 'other',
          title: 'Diabetic Polyuria & Neuropathy',
          narrative: 'Fatigue, frequent nocturnal urination, burning paresthesia in both feet for 2 months.',
          duration: '2 months',
          severity: 4,
        },
        hpi: {
          narrative: 'Reports persistent polydipsia, nocturia 4-5 times per night, and symmetrical glove-and-stocking tingling in both soles.',
          socrates: { onset: '2 months', severity: 4 },
          rawSlots: {},
        },
        pastMedical: ['Type 2 Diabetes Mellitus (8 years)', 'Hypertension'],
        pastSurgical: [],
        allergies: [],
        medications: [{ brand: 'Zoryl M2', generic: 'Glimepiride + Metformin', dose: '1 tab BD', confidence: 0.96 }],
        familyHistory: [],
        personalHistory: {},
        reviewOfSystems: {},
        priorInvestigations: [{ name: 'Fasting Plasma Glucose', value: '198 mg/dL', flag: 'H', date: '2026-03-01', confidence: 0.95 }],
        provenanceList: {},
      },
      documents: [],
    },
    {
      id: 'P-103',
      token: 'AY-042',
      name: 'Sunita Devi',
      ageGender: '45 / F',
      complaint: 'Joint stiffness & sluggish digestion (AYUSH OPD)',
      department: 'AYUSH OPD',
      severity: 'ROUTINE',
      severityScore: 2,
      severityReason: 'Chronic Sandhivata / Prakriti assessment • Stable ambulatory • Pain 2/10',
      redFlagsCount: 0,
      status: 'WAITING',
      kioskReady: true,
      patient: {
        name: 'Sunita Devi',
        age: 45,
        gender: 'F',
        abhaId: '91-2309-8819-7612',
        tokenNumber: 'AY-042',
        department: 'AYUSH OPD',
        opdRoom: 'AYUSH Room 3',
        registeredAt: new Date().toISOString(),
        abhaLinked: true,
      },
      summary: {
        alerts: { redFlags: [], allergies: [], interactions: [], abnormalLabs: [], discrepancies: [] },
        chiefComplaint: {
          id: 'joint_back_pain',
          title: 'Sandhivata / Amavata (Joint Stiffness)',
          narrative: 'Morning stiffness in knee joints, heaviness after eating.',
          duration: '4 months',
          severity: 3,
        },
        hpi: {
          narrative: 'Morning stiffness in knee joints, feeling of heaviness after eating (Mandagni), constipation tendency (Krura koshtha).',
          socrates: { onset: '4 months', severity: 3 },
          rawSlots: {},
        },
        pastMedical: ['Hypothyroidism'],
        pastSurgical: [],
        allergies: [],
        medications: [{ brand: 'Thyronorm 50mcg', generic: 'Levothyroxine', dose: '1 tab fasting', confidence: 0.98 }],
        familyHistory: [],
        personalHistory: {},
        reviewOfSystems: {},
        priorInvestigations: [{ name: 'Serum TSH', value: '4.8 uIU/mL', flag: 'N', date: '2026-02-18', confidence: 0.95 }],
        provenanceList: {},
      },
      documents: [],
    },
  ]);

  const [activePatientId, setActivePatientId] = useState<string>('P-101');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE'>('ALL');
  const [activeTab, setActiveTab] = useState<'summary' | 'med_recon' | 'timeline' | 'fhir'>('summary');
  const [copiedFhir, setCopiedFhir] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Sync current patient intake into the doctor queue dynamically
  useEffect(() => {
    if (!currentPatient) return;

    const redFlagCount =
      (currentRedFlags?.length || 0) + (currentSummary?.alerts?.redFlags?.length || 0);
    const painSeverity = currentSummary?.chiefComplaint?.severity ?? 6;
    const isCritical = redFlagCount > 0 || painSeverity >= 9;
    const isHigh = !isCritical && painSeverity >= 7;
    const isModerate = !isCritical && !isHigh && painSeverity >= 4;
    const computedSeverity: PatientSeverity = isCritical
      ? 'CRITICAL'
      : isHigh
      ? 'HIGH'
      : isModerate
      ? 'MODERATE'
      : 'ROUTINE';

    const severityReason =
      redFlagCount > 0
        ? `Red Flag: ${currentRedFlags[0]?.title || currentSummary?.alerts?.redFlags?.[0]?.title || 'Clinical Alert'} • Pain ${painSeverity}/10`
        : painSeverity >= 8
        ? `Severe Acute Distress (Pain ${painSeverity}/10) - High Urgency`
        : painSeverity >= 6
        ? `High Symptom Severity (Pain ${painSeverity}/10)`
        : painSeverity >= 4
        ? `Moderate Discomfort (Pain ${painSeverity}/10)`
        : `Stable Intake (Pain ${painSeverity}/10)`;

    const severityScore =
      computedSeverity === 'CRITICAL'
        ? 10
        : computedSeverity === 'HIGH'
        ? 8
        : computedSeverity === 'MODERATE'
        ? 5
        : 2;

    setQueue((prevQueue) => {
      const existingIndex = prevQueue.findIndex(
        (p) =>
          (currentPatient.abhaId && p.patient.abhaId === currentPatient.abhaId) ||
          p.token === currentPatient.tokenNumber
      );

      const updatedRecord: QueuePatientItem = {
        id: existingIndex >= 0 ? prevQueue[existingIndex].id : `P-${Date.now().toString().slice(-4)}`,
        token: currentPatient.tokenNumber || 'A-108',
        name: currentPatient.name,
        ageGender: `${currentPatient.age} / ${currentPatient.gender}`,
        complaint:
          currentSummary?.chiefComplaint?.title ||
          (existingIndex >= 0 ? prevQueue[existingIndex].complaint : 'Clinical Intake Completed'),
        department: currentPatient.department || 'Cardiology',
        severity: computedSeverity,
        severityScore,
        severityReason,
        redFlagsCount: redFlagCount,
        status: existingIndex >= 0 ? prevQueue[existingIndex].status : 'IN_CONSULTATION',
        kioskReady: true,
        patient: currentPatient,
        summary: currentSummary || (existingIndex >= 0 ? prevQueue[existingIndex].summary : (prevQueue[0].summary as StructuredSummary)),
        documents: currentDocuments.length > 0 ? currentDocuments : (existingIndex >= 0 ? prevQueue[existingIndex].documents : []),
      };

      if (existingIndex >= 0) {
        const copy = [...prevQueue];
        copy[existingIndex] = updatedRecord;
        return copy;
      } else {
        return [updatedRecord, ...prevQueue];
      }
    });
  }, [currentPatient, currentSummary, currentDocuments, currentRedFlags]);

  // Strict Severity Priority Hierarchy: CRITICAL (4) > HIGH (3) > MODERATE (2) > ROUTINE (1)
  const SEVERITY_ORDER: Record<PatientSeverity, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MODERATE: 2,
    ROUTINE: 1,
  };

  // High severe cases are always sorted at the very top of the queue!
  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      // 1. High severe case at the top of the queue (Critical first, then High, Moderate, Routine)
      const rankDiff = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
      if (rankDiff !== 0) return rankDiff;

      // 2. Numerical severity score descending (10 > 8 > 5 > 2)
      const scoreDiff = (b.severityScore || 0) - (a.severityScore || 0);
      if (scoreDiff !== 0) return scoreDiff;

      // 3. Waiting / In-Consultation before Completed
      if (a.status !== b.status) {
        if (a.status === 'COMPLETED') return 1;
        if (b.status === 'COMPLETED') return -1;
      }

      return 0;
    });
  }, [queue]);

  const filteredQueue = useMemo(() => {
    if (severityFilter === 'ALL') return sortedQueue;
    return sortedQueue.filter((item) => item.severity === severityFilter);
  }, [sortedQueue, severityFilter]);

  // Active selected patient - guaranteed to exist from sorted queue
  const activeRecord = sortedQueue.find((q) => q.id === activePatientId) || sortedQueue[0] || queue[0];

  // Medication Reconciliation status map (brand -> ACCEPTED | STOPPED | MODIFIED)
  const [medReconStatus, setMedReconStatus] = useState<Record<string, 'ACCEPTED' | 'STOPPED' | 'MODIFIED'>>({});

  const handleSetMedRecon = (brand: string, status: 'ACCEPTED' | 'STOPPED' | 'MODIFIED') => {
    setMedReconStatus((prev) => ({ ...prev, [brand]: status }));
  };

  // Generate FHIR bundle on the fly
  const fhirBundle: FhirBundle = React.useMemo(() => {
    return buildAbdmOpConsultFhirBundle({
      patient: activeRecord.patient,
      summary: activeRecord.summary,
      documents: activeRecord.documents,
      consent: currentConsent,
      doctorName: 'Dr. S. K. Mukherjee, MD (Senior Consultant)',
    });
  }, [activeRecord, currentConsent]);

  const handleCopyFhir = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  const handleCommitConsultation = () => {
    const session: DoctorReviewSession = {
      sessionId: `REV-${Date.now()}`,
      patientId: activeRecord.patient.abhaId || activeRecord.id,
      doctorName: 'Dr. S. K. Mukherjee, MD',
      reviewTimestamp: new Date().toISOString(),
      sectionStatus: {
        hpi: 'accepted',
        medications: Object.values(medReconStatus).some((s) => s === 'MODIFIED') ? 'edited' : 'accepted',
        allergies: 'accepted',
      },
      editedSummary: activeRecord.summary,
      doctorNotes,
      status: 'confirmed',
    };

    auditAndHisStore.saveConfirmedConsultation(session);

    setQueue((prev) =>
      prev.map((p) => (p.id === activeRecord.id ? { ...p, status: 'COMPLETED' } : p))
    );
    setCommitSuccess(true);
    setTimeout(() => setCommitSuccess(false), 3000);
  };

  return (
    <div id="doctor-emr-dashboard" className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Dr. S. K. Mukherjee, MD</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                OPD Room 12
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Department of Internal Medicine &amp; Cardiology • ABDM EMR Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenKiosk}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Patient Kiosk</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Patient Queue + Right 1-Screen Consultation Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Patient Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Live OPD Queue</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                {sortedQueue.filter((q) => q.status !== 'COMPLETED').length} Waiting
              </span>
            </div>

            {/* Severity Auto-Sort Notification */}
            <div className="mb-3 px-3 py-1.5 bg-gradient-to-r from-rose-50 to-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1 text-rose-700">
                <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>Auto-sorted: High Severity at Top</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Triage Rank 1→4</span>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-4 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSeverityFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  severityFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({sortedQueue.length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('CRITICAL')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  severityFilter === 'CRITICAL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Critical ({sortedQueue.filter((q) => q.severity === 'CRITICAL').length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('HIGH')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  severityFilter === 'HIGH'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                High ({sortedQueue.filter((q) => q.severity === 'HIGH').length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('MODERATE')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  severityFilter === 'MODERATE'
                    ? 'bg-yellow-600 text-white shadow-xs'
                    : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Moderate ({sortedQueue.filter((q) => q.severity === 'MODERATE').length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('ROUTINE')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  severityFilter === 'ROUTINE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Routine ({sortedQueue.filter((q) => q.severity === 'ROUTINE').length})
              </button>
            </div>

            {/* Patient Cards in Queue */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredQueue.map((item, index) => {
                const isSelected = item.id === activeRecord.id;
                const isCritical = item.severity === 'CRITICAL';
                const isHigh = item.severity === 'HIGH';
                const isModerate = item.severity === 'MODERATE';
                const isRoutine = item.severity === 'ROUTINE';

                return (
                  <div
                    key={item.id}
                    id={`queue-card-${item.id}`}
                    onClick={() => setActivePatientId(item.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/90 border-sky-600 shadow-md ring-2 ring-sky-200'
                        : isCritical
                        ? 'bg-rose-50/70 border-l-4 border-l-rose-600 border-rose-300 hover:border-rose-400'
                        : isHigh
                        ? 'bg-amber-50/50 border-l-4 border-l-amber-500 border-amber-200 hover:border-amber-300'
                        : isModerate
                        ? 'bg-white border-l-4 border-l-yellow-400 border-slate-200 hover:border-slate-300'
                        : 'bg-white border-l-4 border-l-emerald-400 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Token & Severity Marker */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          #{index + 1} • {item.token}
                        </span>
                        {item.status === 'IN_CONSULTATION' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                            In Room
                          </span>
                        )}
                        {item.status === 'COMPLETED' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      {/* Prominent Severity Badge */}
                      {isCritical && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs animate-pulse">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Level 1 • Critical
                        </span>
                      )}
                      {isHigh && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          Level 2 • High
                        </span>
                      )}
                      {isModerate && (
                        <span className="px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-900 border border-yellow-300 font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1">
                          <Activity className="w-3 h-3 text-yellow-700 shrink-0" />
                          Level 3 • Moderate
                        </span>
                      )}
                      {isRoutine && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          Level 4 • Routine
                        </span>
                      )}
                    </div>

                    {/* Patient Name & Demographics */}
                    <div className="flex items-baseline justify-between gap-1 mb-1">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                        {item.name} <span className="font-semibold text-slate-500 text-xs">({item.ageGender})</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        Score: {item.severityScore}/10
                      </span>
                    </div>

                    {/* Complaint */}
                    <p className="text-xs text-slate-700 line-clamp-1 mb-1.5 font-medium">
                      {item.complaint}
                    </p>

                    {/* Severity Reason Clinical Callout */}
                    <div
                      className={`text-[11px] font-semibold rounded-lg px-2 py-1 mb-2 flex items-start gap-1.5 leading-snug ${
                        isCritical
                          ? 'bg-rose-100/90 text-rose-900 font-bold'
                          : isHigh
                          ? 'bg-amber-100/90 text-amber-900 font-bold'
                          : isModerate
                          ? 'bg-yellow-100/70 text-yellow-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCritical ? (
                        <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      ) : isHigh ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className="line-clamp-2">{item.severityReason}</span>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Kiosk Ready
                      </span>
                      <span className="font-medium text-slate-600">{item.department}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 1-Screen Consultation Terminal (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
            {/* Patient Header Banner */}
            <div className="pb-5 mb-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900">
                    {activeRecord.patient.name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                    {activeRecord.patient.age} Y / {activeRecord.patient.gender}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono font-bold">
                    ABHA: {activeRecord.patient.abhaId || '91-XXXX-XXXX'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  OPD Token: <span className="font-mono font-black text-sky-700">{activeRecord.token}</span> • Consult Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Consultation Navigation Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'summary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Intake Summary
                </button>
                <button
                  onClick={() => setActiveTab('med_recon')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'med_recon' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Med Reconciliation
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Past Records ({activeRecord.documents.length})
                </button>
                <button
                  onClick={() => setActiveTab('fhir')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'fhir' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>FHIR R4 Bundle</span>
                </button>
              </div>
            </div>

            {/* Clinical Severity & Triage Priority Banner */}
            {activeRecord.severity === 'CRITICAL' && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-3.5 shadow-sm">
                <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Flame className="w-3 h-3" />
                      🚨 Severity: Level 1 • Critical (Immediate Action)
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded">
                      Triage Score: {activeRecord.severityScore}/10
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-rose-950 mt-1">
                    {activeRecord.severityReason}
                  </h4>
                  <p className="text-xs font-medium text-rose-900 mt-1 leading-relaxed">
                    Immediate Clinical Protocol: Stat 12-lead ECG within 10 minutes, continuous cardiac/vital monitoring, oxygen saturation assessment, and emergency IV access.
                  </p>
                </div>
              </div>
            )}

            {activeRecord.severity === 'HIGH' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3.5 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3 h-3" />
                      ⚠️ Severity: Level 2 • High (Urgent OPD Attention)
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                      Triage Score: {activeRecord.severityScore}/10
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-amber-950 mt-1">
                    {activeRecord.severityReason}
                  </h4>
                  <p className="text-xs font-medium text-amber-900 mt-1 leading-relaxed">
                    High symptom distress or potential acute surgical/medical abdomen. Expedite physical examination, stat laboratory workup, and pain management.
                  </p>
                </div>
              </div>
            )}

            {activeRecord.severity === 'MODERATE' && (
              <div className="mb-6 p-3.5 rounded-2xl bg-yellow-50/90 border border-yellow-300 text-yellow-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-yellow-700 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-yellow-900 uppercase tracking-wide">
                        Severity: Level 3 • Moderate
                      </span>
                      <span className="text-[11px] font-mono font-bold text-yellow-800 bg-yellow-200/70 px-1.5 py-0.2 rounded">
                        Score: {activeRecord.severityScore}/10
                      </span>
                    </div>
                    <p className="text-xs text-yellow-900 font-medium mt-0.5">{activeRecord.severityReason}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-yellow-800 bg-yellow-100 px-2.5 py-1 rounded-lg border border-yellow-200 shrink-0">
                  Standard OPD Flow
                </span>
              </div>
            )}

            {activeRecord.severity === 'ROUTINE' && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                        Severity: Level 4 • Routine (Stable)
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-200/70 px-1.5 py-0.2 rounded">
                        Score: {activeRecord.severityScore}/10
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium mt-0.5">{activeRecord.severityReason}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  Non-urgent Intake
                </span>
              </div>
            )}

            {/* TAB 1: 1-Screen Consultation Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* 1. HPI Narrative with Provenance Badge */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-600" />
                      <span>History of Present Illness (HPI)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                      Patient Reported
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {activeRecord.summary.hpi.narrative}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
                    <span><strong>Onset:</strong> {activeRecord.summary.hpi.socrates?.onset || '2 days'}</span>
                    <span><strong>Character:</strong> {activeRecord.summary.hpi.socrates?.character || 'Pressure'}</span>
                    <span><strong>Pain Score:</strong> <span className="font-bold text-rose-700">{activeRecord.summary.hpi.socrates?.severity || 8}/10</span></span>
                  </div>
                </div>

                {/* 2. Known Allergies Banner */}
                {activeRecord.summary.allergies.length > 0 && (
                  <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-xs font-bold text-rose-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>DOCUMENTED ALLERGY: {activeRecord.summary.allergies.join(', ')}</span>
                  </div>
                )}

                {/* 3. Chronic Conditions & Medications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Past Medical History
                    </span>
                    <ul className="space-y-1.5 text-xs font-semibold text-slate-800">
                      {activeRecord.summary.pastMedical.map((pm, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-600 rounded-full" />
                          <span>{pm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Prior Diagnostic Highlights
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                      {activeRecord.summary.priorInvestigations.map((inv, i) => (
                        <li key={i} className="flex justify-between items-center">
                          <span>{inv.name}</span>
                          <span className={`font-black ${inv.flag === 'H' ? 'text-rose-700' : 'text-slate-900'}`}>
                            {inv.value} {inv.flag && `[${inv.flag}]`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Doctor Note Input & Rx */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physician Examination &amp; Clinical Impression:
                    </label>
                    <textarea
                      rows={2}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="e.g. S1 S2 heard, no murmur. Bilateral chest clear. ECG ordered stat. Suspected NSTE-ACS..."
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:border-sky-600 focus:outline-none"
                    />
                  </div>

                  {commitSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Consultation successfully committed to Hospital HIS (Version 1.0) &amp; ABDM Bundle pushed.</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      id="btn-commit-his"
                      onClick={handleCommitConsultation}
                      className="py-3 px-6 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl shadow flex items-center gap-2 transition-all active:scale-[0.99]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Accept &amp; Commit to EMR (Version 1.0)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Interactive Medication Reconciliation Table */}
            {activeTab === 'med_recon' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Medications on Record (Accept / Stop / Modify)
                  </span>
                  <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    Reconciled: {Object.keys(medReconStatus).length} / {activeRecord.summary.medications.length}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Brand / Generic</th>
                        <th className="p-3">Dose &amp; Frequency</th>
                        <th className="p-3">Source Provenance</th>
                        <th className="p-3 text-right">Reconciliation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeRecord.summary.medications.map((med, i) => {
                        const status = medReconStatus[med.brand] || 'ACCEPTED';
                        return (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <span className="font-bold text-slate-900">{med.brand}</span>
                              <div className="text-slate-500 text-[11px]">{med.generic}</div>
                            </td>
                            <td className="p-3 text-slate-700">{med.dose} • {med.frequency}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-bold text-[10px]">
                                Document Extracted
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-bold">
                                <button
                                  onClick={() => handleSetMedRecon(med.brand, 'ACCEPTED')}
                                  className={`px-2.5 py-1 rounded-md transition-colors ${
                                    status === 'ACCEPTED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Continue
                                </button>
                                <button
                                  onClick={() => handleSetMedRecon(med.brand, 'STOPPED')}
                                  className={`px-2.5 py-1 rounded-md transition-colors ${
                                    status === 'STOPPED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Stop
                                </button>
                                <button
                                  onClick={() => handleSetMedRecon(med.brand, 'MODIFIED')}
                                  className={`px-2.5 py-1 rounded-md transition-colors ${
                                    status === 'MODIFIED' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Modify
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Timeline of Previous Care Episodes */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">
                  Chronological Medical History &amp; Document Artifacts
                </div>

                {activeRecord.documents.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-2xl">
                    No prior digitized documents for this patient in this session.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {activeRecord.documents.map((doc, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-sky-400 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-sm text-slate-900 capitalize">
                              {doc.docType.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-500">{doc.documentDate}</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{doc.facilityOrDoctor}</p>

                          {doc.diagnoses.length > 0 && (
                            <div className="text-xs mb-2">
                              <strong>Diagnoses:</strong> {doc.diagnoses.join(', ')}
                            </div>
                          )}

                          {doc.imageUrl && (
                            <div className="mt-2 max-w-[200px] aspect-[4/3] bg-white rounded-lg border overflow-hidden">
                              <img src={doc.imageUrl} alt="Document" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ABDM NRCeS FHIR R4 Bundle JSON */}
            {activeTab === 'fhir' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    ABDM NRCeS OPConsultRecord Bundle (FHIR R4 Validated)
                  </span>
                  <button
                    onClick={handleCopyFhir}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedFhir ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFhir ? 'Copied JSON!' : 'Copy FHIR Bundle'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-900 text-sky-300 rounded-2xl font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed">
                  {JSON.stringify(fhirBundle, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
