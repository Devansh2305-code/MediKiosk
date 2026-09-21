import { z } from 'zod';

export type LanguageCode = 'hi' | 'en' | 'mr' | 'ta' | 'bn' | 'te' | 'gu' | 'kn' | 'ml';

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  script: string;
  greetingPrompt: string;
  isFullySupported: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', script: 'Devanagari', greetingPrompt: 'नमस्ते, मेडीकियोस्क में आपका स्वागत है।', isFullySupported: true },
  { code: 'en', label: 'English', nativeLabel: 'English', script: 'Latin', greetingPrompt: 'Welcome to MediKiosk.', isFullySupported: true },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', script: 'Devanagari', greetingPrompt: 'मेडीकियोस्कमध्ये आपले स्वागत आहे.', isFullySupported: false },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', script: 'Tamil', greetingPrompt: 'மெடிகியோஸ்க்கிற்கு வரவேற்கிறோம்.', isFullySupported: false },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', script: 'Bengali', greetingPrompt: 'মেডিকিয়স্কে স্বাগতম।', isFullySupported: false },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', script: 'Telugu', greetingPrompt: 'మెడికియోస్క్‌కు స్వాగతం.', isFullySupported: false },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', script: 'Gujarati', greetingPrompt: 'મેડિકિયોસ્કમાં આપનું સ્વાગત છે.', isFullySupported: false },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', script: 'Kannada', greetingPrompt: 'ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಸುಸ್ವಾಗತ.', isFullySupported: false },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', script: 'Malayalam', greetingPrompt: 'മെഡികിയോസ്കിലേക്ക് സ്വാഗതം.', isFullySupported: false },
];

export interface PatientProfile {
  abhaId?: string;
  abhaAddress?: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  mobileNumber?: string;
  photoUrl?: string;
  abhaLinked: boolean;
  department: string;
  tokenNumber?: string;
  opdRoom?: string;
  registeredAt: string;
}

export interface ConsentArtifact {
  id: string;
  patientRef: string;
  purposes: {
    recordHistory: boolean;
    aiDocumentAnalysis: boolean;
    shareWithHospital: boolean;
    linkToAbhaRecord: boolean;
  };
  language: LanguageCode;
  version: string;
  grantedAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
}

export type ProvenanceSource = 'patient_voice' | 'patient_tap' | 'document_ocr' | 'rule_inferred' | 'doctor_edit';

export interface ProvenanceMetadata {
  source: ProvenanceSource;
  sourceRef?: string;
  confidence: number;
  evidence?: string;
  timestamp: string;
}

export interface HistorySlotValue {
  slotKey: string;
  value: any;
  label?: string;
  metadata: ProvenanceMetadata;
}

export type ChiefComplaintId =
  | 'chest_pain'
  | 'fever'
  | 'cough_breathlessness'
  | 'abdominal_pain'
  | 'headache'
  | 'joint_back_pain'
  | 'other';

export interface RedFlagAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  tokenNumber: string;
  timestamp: string;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH';
  title: string;
  description: string;
  triggerEvidence: string;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  assignedRoom?: string;
  helpRequested?: boolean;
}

export interface ExtractedMedication {
  brand: string;
  generic?: string;
  strength?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  confidence: number;
}

export interface ExtractedInvestigation {
  name: string;
  value: string;
  numericValue?: number;
  unit?: string;
  refRange?: string;
  date?: string;
  flag?: 'H' | 'L' | 'N' | 'ABNORMAL';
  confidence: number;
}

export interface DigitizedDocument {
  id: string;
  docType: 'prescription' | 'lab_report' | 'discharge_summary' | 'imaging' | 'other';
  documentDate: string; // ISO or DD/MM/YYYY parsed
  isDateAmbiguous?: boolean;
  facilityOrDoctor?: string;
  language?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  diagnoses: string[];
  medications: ExtractedMedication[];
  investigations: ExtractedInvestigation[];
  procedures: string[];
  allergies: string[];
  advice?: string;
  needsReview: string[];
  overallConfidence: number;
  patientConfirmed: boolean;
}

export interface ClinicalDiscrepancy {
  id: string;
  type: 'condition_denied_but_medicated' | 'allergy_conflict' | 'contradictory_timeline' | 'drug_interaction';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  patientStatement?: string;
  documentEvidence?: string;
}

export interface AyushAssessment {
  isAyushMode: boolean;
  department: string; // e.g. 'Kayachikitsa'
  prakritiScores: {
    vata: number;
    pitta: number;
    kapha: number;
    dominantPrakriti: string;
  };
  prakritiSelfReported: Record<string, string>;
  vikritiSymptoms: string[];
  agniType: 'Sama' | 'Vishama' | 'Tikshna' | 'Manda' | 'Unspecified';
  koshthaType: 'Mridu' | 'Madhyama' | 'Krura' | 'Unspecified';
  aharaViharaNotes: string;
  nidraPattern: string;
  vyayamaShakti: string;
  sattvaStrength: string;
  ashtavidhaStatus: 'pending_vaidya_examination'; // Mandatory label
}

export interface StructuredSummary {
  alerts: {
    redFlags: RedFlagAlert[];
    allergies: string[];
    interactions: string[];
    abnormalLabs: ExtractedInvestigation[];
    discrepancies: ClinicalDiscrepancy[];
  };
  chiefComplaint: {
    id: ChiefComplaintId;
    title: string;
    narrative: string;
    duration: string;
    severity?: number; // 0-10
    bodyLocations?: string[];
  };
  hpi: {
    narrative: string;
    socrates: {
      site?: string;
      onset?: string;
      character?: string;
      radiation?: string;
      associatedSymptoms?: string[];
      timeCourse?: string;
      exacerbatingFactors?: string[];
      relievingFactors?: string[];
      severity?: number;
    };
    rawSlots: Record<string, HistorySlotValue>;
  };
  pastMedical: string[];
  pastSurgical: string[];
  medications: ExtractedMedication[];
  allergies: string[];
  familyHistory: string[];
  personalHistory: {
    diet?: string;
    tobacco?: string;
    alcohol?: string;
    sleep?: string;
    occupation?: string;
    bowelHabits?: string;
    urinaryHabits?: string;
  };
  reviewOfSystems: Record<string, string[]>;
  priorInvestigations: ExtractedInvestigation[];
  ayush?: AyushAssessment;
  provenanceList: Record<string, ProvenanceMetadata>;
}

export interface DoctorReviewSession {
  sessionId: string;
  patientId: string;
  doctorName: string;
  reviewTimestamp: string;
  sectionStatus: Record<string, 'accepted' | 'edited' | 'rejected'>;
  editedSummary: StructuredSummary;
  doctorNotes: string;
  status: 'draft' | 'confirmed' | 'rejected';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resourceId: string;
  details: string;
}

export interface KioskSessionState {
  sessionId: string;
  step: 'language' | 'login' | 'consent' | 'history' | 'ayush' | 'documents' | 'recap' | 'done';
  language: LanguageCode;
  patient?: PatientProfile;
  consent?: ConsentArtifact;
  activeComplaint?: ChiefComplaintId;
  slots: Record<string, HistorySlotValue>;
  documents: DigitizedDocument[];
  summary?: StructuredSummary;
  redFlags: RedFlagAlert[];
  discrepancies: ClinicalDiscrepancy[];
  isAyushMode: boolean;
  idleSeconds: number;
  createdAt: number;
  lastActiveAt: number;
  fhirBundleId?: string;
}

// Zod schemas for structured validation
export const SlotValueSchema = z.object({
  slot: z.string(),
  value: z.any(),
  confidence: z.number().min(0).max(1),
  evidence: z.string().optional(),
});

export const LlmTurnOutputSchema = z.object({
  extracted: z.array(SlotValueSchema),
  reply: z.object({
    speak: z.string(),
    display: z.string(),
    options: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        icon: z.string().optional(),
      })
    ).optional(),
    isCompleteForComplaint: z.boolean().optional(),
  }),
});

export type LlmTurnOutput = z.infer<typeof LlmTurnOutputSchema>;
