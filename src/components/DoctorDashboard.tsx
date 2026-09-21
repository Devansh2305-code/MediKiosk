import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
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
  Heart,
  History,
  Pill,
  Save,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  Users,
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
  // Mock Queue of Patients in OPD
  const [queue, setQueue] = useState<
    {
      id: string;
      token: string;
      name: string;
      ageGender: string;
      complaint: string;
      priority: 'CRITICAL' | 'HIGH' | 'ROUTINE';
      status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';
      kioskReady: boolean;
      patient: PatientProfile;
      summary: StructuredSummary;
      documents: DigitizedDocument[];
    }[]
  >([
    {
      id: 'P-101',
      token: currentPatient?.tokenNumber || 'A-108',
      name: currentPatient?.name || 'Ramesh Kumar',
      ageGender: `${currentPatient?.age || 62} / ${currentPatient?.gender || 'M'}`,
      complaint: currentSummary?.chiefComplaint.title || 'Chest pain & breathlessness (2 days)',
      priority: currentRedFlags.length > 0 ? 'CRITICAL' : 'HIGH',
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
          redFlags: [],
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
      id: 'P-102',
      token: 'B-215',
      name: 'Priya Sharma',
      ageGender: '34 / F',
      complaint: 'Chronic cough with wheezing (3 weeks)',
      priority: 'ROUTINE',
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
      id: 'P-103',
      token: 'AY-042',
      name: 'Sunita Devi',
      ageGender: '45 / F',
      complaint: 'Joint stiffness & sluggish digestion (AYUSH OPD)',
      priority: 'ROUTINE',
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
          severity: 6,
        },
        hpi: {
          narrative: 'Morning stiffness in knee joints, feeling of heaviness after eating (Mandagni), constipation tendency (Krura koshtha).',
          socrates: { onset: '4 months', severity: 6 },
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
  const [activeTab, setActiveTab] = useState<'summary' | 'med_recon' | 'timeline' | 'fhir'>('summary');
  const [copiedFhir, setCopiedFhir] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Active selected patient
  const activeRecord = queue.find((q) => q.id === activePatientId) || queue[0];

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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Live OPD Queue</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                {queue.filter((q) => q.status !== 'COMPLETED').length} Waiting
              </span>
            </div>

            <div className="space-y-2.5">
              {queue.map((item) => {
                const isSelected = item.id === activeRecord.id;
                const isPriority = item.priority === 'CRITICAL';
                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePatientId(item.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-600 shadow-sm ring-2 ring-sky-100'
                        : isPriority
                        ? 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {item.token}
                      </span>
                      {isPriority && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-black animate-pulse flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          RED FLAG
                        </span>
                      )}
                      {item.status === 'COMPLETED' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight mb-1">
                      {item.name} ({item.ageGender})
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-1 mb-2 font-medium">
                      {item.complaint}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Intake Ready
                      </span>
                      <span className="text-slate-400 font-mono">Room 12</span>
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

            {/* Red Flag Alert Callout if Active */}
            {activeRecord.priority === 'CRITICAL' && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex items-start gap-3 shadow-sm">
                <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-sm uppercase tracking-wide text-rose-800">
                    CLINICAL RED FLAG: Possible Acute Coronary Syndrome (ACS)
                  </div>
                  <p className="text-xs font-medium text-rose-900 mt-0.5">
                    Patient reported crushing chest pain with radiation to left arm and cold sweating. Stat 12-lead ECG and troponin indicated.
                  </p>
                </div>
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
