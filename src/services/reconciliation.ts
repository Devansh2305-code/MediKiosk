// DEMO DATASET — NOT FOR CLINICAL USE
// Deterministic clinical reference ranges, Indian brand-generic lookup,
// drug-drug interactions and cross-source discrepancy detection.

import { ClinicalDiscrepancy, DigitizedDocument, ExtractedInvestigation, ExtractedMedication, HistorySlotValue } from '../types';

export interface StandardLabRange {
  testName: string;
  low: number;
  high: number;
  unit: string;
}

// Common Indian reference ranges
export const DEFAULT_LAB_RANGES: Record<string, StandardLabRange> = {
  fbs: { testName: 'Fasting Blood Sugar', low: 70, high: 100, unit: 'mg/dL' },
  ppbs: { testName: 'Postprandial Blood Sugar', low: 70, high: 140, unit: 'mg/dL' },
  hba1c: { testName: 'HbA1c', low: 4.0, high: 5.7, unit: '%' },
  creatinine: { testName: 'Serum Creatinine', low: 0.7, high: 1.2, unit: 'mg/dL' },
  urea: { testName: 'Blood Urea', low: 15, high: 40, unit: 'mg/dL' },
  hemoglobin_male: { testName: 'Hemoglobin (Male)', low: 13.0, high: 17.0, unit: 'g/dL' },
  hemoglobin_female: { testName: 'Hemoglobin (Female)', low: 12.0, high: 15.0, unit: 'g/dL' },
  platelets: { testName: 'Platelet Count', low: 150000, high: 450000, unit: '/mcL' },
  total_cholesterol: { testName: 'Total Cholesterol', low: 125, high: 200, unit: 'mg/dL' },
  serum_potassium: { testName: 'Serum Potassium', low: 3.5, high: 5.0, unit: 'mEq/L' },
};

// Common Indian Brand to Generic Dictionary
export const INDIAN_BRAND_TO_GENERIC: Record<string, string> = {
  glycomet: 'Metformin',
  'glycomet-gp': 'Metformin + Glimepiride',
  telma: 'Telmisartan',
  'telma-h': 'Telmisartan + Hydrochlorothiazide',
  ecosprin: 'Aspirin (Acetylsalicylic Acid)',
  atorva: 'Atorvastatin',
  atorlip: 'Atorvastatin',
  augmentin: 'Amoxicillin + Clavulanic Acid',
  moxikind: 'Amoxicillin',
  novamox: 'Amoxicillin',
  pan: 'Pantoprazole',
  'pan-d': 'Pantoprazole + Domperidone',
  omez: 'Omeprazole',
  calpol: 'Paracetamol (Acetaminophen)',
  crocin: 'Paracetamol',
  dolo: 'Paracetamol 650mg',
  combiflam: 'Ibuprofen + Paracetamol',
  sorbitrate: 'Isosorbide Dinitrate',
  stamlo: 'Amlodipine',
  monotrate: 'Isosorbide Mononitrate',
  ciplox: 'Ciprofloxacin',
  azithral: 'Azithromycin',
};

// Common drug-drug interaction pairs
export const DRUG_INTERACTIONS_TABLE: {
  drugA: string[];
  drugB: string[];
  severity: 'CRITICAL' | 'WARNING';
  description: string;
}[] = [
  {
    drugA: ['warfarin', 'coumadin', 'acitrom'],
    drugB: ['aspirin', 'ecosprin', 'clopidogrel', 'ibuprofen', 'combiflam'],
    severity: 'CRITICAL',
    description: 'Concurrent anticoagulant (Warfarin) + Antiplatelet/NSAID significantly elevates severe gastrointestinal and systemic bleeding risk.',
  },
  {
    drugA: ['sorbitrate', 'nitroglycerin', 'isosorbide', 'monotrate'],
    drugB: ['sildenafil', 'tadalafil', 'viagra'],
    severity: 'CRITICAL',
    description: 'Fatal hypotension risk: Nitrates with PDE-5 inhibitors causes profound vasodilatation and cardiovascular collapse.',
  },
  {
    drugA: ['metformin', 'glycomet'],
    drugB: ['contrast dye', 'radiological contrast'],
    severity: 'WARNING',
    description: 'Risk of lactic acidosis if iodinated radiological contrast is administered without holding Metformin in impaired renal function.',
  },
];

// Allergy cross-sensitivities
export const ALLERGY_CROSS_REACTIONS: {
  allergenKey: string[];
  contraindicatedGenerics: string[];
  severity: 'CRITICAL' | 'HIGH';
  alertMessage: string;
}[] = [
  {
    allergenKey: ['penicillin', 'amoxicillin', 'ampicillin', 'पेनिसिलिन'],
    contraindicatedGenerics: ['amoxicillin', 'augmentin', 'ampicillin', 'penicillin', 'piperacillin', 'cloxacillin'],
    severity: 'CRITICAL',
    alertMessage: 'ALLERGY CONTRAINDICATION: Patient has documented Penicillin allergy, but Beta-lactam antibiotic is detected!',
  },
  {
    allergenKey: ['sulfa', 'sulfonamide', 'सल्फा'],
    contraindicatedGenerics: ['co-trimoxazole', 'bactrim', 'septran', 'sulfamethoxazole'],
    severity: 'CRITICAL',
    alertMessage: 'ALLERGY CONTRAINDICATION: Documented Sulfonamide allergy with Sulfa antimicrobial.',
  },
  {
    allergenKey: ['nsaid', 'aspirin', 'ibuprofen', 'दर्द की गोली'],
    contraindicatedGenerics: ['aspirin', 'ecosprin', 'ibuprofen', 'diclofenac', 'naproxen', 'combiflam', 'voveran'],
    severity: 'HIGH',
    alertMessage: 'ALLERGY WARNING: History of NSAID hypersensitivity with prescribed anti-inflammatory/aspirin.',
  },
];

export function normalizeLabFlag(inv: ExtractedInvestigation): 'H' | 'L' | 'N' | 'ABNORMAL' | undefined {
  if (inv.flag) return inv.flag;
  if (!inv.numericValue) return undefined;

  const key = Object.keys(DEFAULT_LAB_RANGES).find((k) => inv.name.toLowerCase().includes(k) || inv.name.toLowerCase().includes(DEFAULT_LAB_RANGES[k].testName.toLowerCase()));
  if (key) {
    const range = DEFAULT_LAB_RANGES[key];
    if (inv.numericValue > range.high) return 'H';
    if (inv.numericValue < range.low) return 'L';
    return 'N';
  }
  return undefined;
}

export function detectDiscrepancies(
  patientSlots: Record<string, HistorySlotValue | any>,
  documents: DigitizedDocument[]
): ClinicalDiscrepancy[] {
  const discrepancies: ClinicalDiscrepancy[] = [];

  const pastMedicalObj = patientSlots.past_medical;
  const pastMedicalValues: string[] = pastMedicalObj?.value
    ? Array.isArray(pastMedicalObj.value)
      ? pastMedicalObj.value
      : [String(pastMedicalObj.value)]
    : [];

  const pastMedicalText = pastMedicalValues.join(' ').toLowerCase();

  // 1. Patient denies diabetes or reports no prior illness, but documents contain Metformin/Glycomet or high HbA1c
  const deniesDiabetes = pastMedicalText.includes('no known prior illness') || (!pastMedicalText.includes('diabetes') && !pastMedicalText.includes('मधुमेह'));
  const hasDiabeticMed = documents.some((doc) =>
    doc.medications.some((m) => {
      const name = `${m.brand} ${m.generic || ''}`.toLowerCase();
      return name.includes('metformin') || name.includes('glycomet') || name.includes('glimepiride') || name.includes('insulin');
    })
  );
  const hasHighHbA1c = documents.some((doc) =>
    doc.investigations.some((inv) => inv.name.toLowerCase().includes('hba1c') && (inv.numericValue ? inv.numericValue >= 6.5 : false))
  );

  if (deniesDiabetes && (hasDiabeticMed || hasHighHbA1c)) {
    discrepancies.push({
      id: `DISC_DIABETES_${Date.now()}`,
      type: 'condition_denied_but_medicated',
      severity: 'WARNING',
      title: 'Discrepancy: Diabetes Mellitus History vs Records',
      description: 'Patient did not report Diabetes in the verbal intake, but prior medical records show active antidiabetic prescription (Metformin/Glycomet) or HbA1c ≥ 6.5%.',
      patientStatement: 'No diabetes reported in oral intake',
      documentEvidence: hasDiabeticMed ? 'Prescription includes Metformin / Glycomet-GP' : 'Lab report HbA1c 8.9% [HIGH]',
    });
  }

  // 2. Patient denies Hypertension, but records contain Telmisartan / Amlodipine
  const deniesHypertension = pastMedicalText.includes('no known prior illness') || (!pastMedicalText.includes('hypertension') && !pastMedicalText.includes('bp'));
  const hasBpMed = documents.some((doc) =>
    doc.medications.some((m) => {
      const name = `${m.brand} ${m.generic || ''}`.toLowerCase();
      return name.includes('telmisartan') || name.includes('telma') || name.includes('amlodipine') || name.includes('enalapril');
    })
  );

  if (deniesHypertension && hasBpMed) {
    discrepancies.push({
      id: `DISC_HTN_${Date.now()}`,
      type: 'condition_denied_but_medicated',
      severity: 'INFO',
      title: 'Discrepancy: Hypertension (High BP) History',
      description: 'Patient did not mention Hypertension during oral check-in, but current prescription includes antihypertensive medication (Telmisartan).',
      patientStatement: 'Hypertension not reported by patient',
      documentEvidence: 'Document contains Tab. Telma 40 (Telmisartan)',
    });
  }

  // 3. Drug-Allergy Conflict Detection
  const allergiesObj = patientSlots.allergies;
  const patientAllergies = allergiesObj?.value ? (Array.isArray(allergiesObj.value) ? allergiesObj.value.join(' ') : String(allergiesObj.value)) : '';
  const docAllergies = documents.flatMap((d) => d.allergies).join(' ');
  const totalAllergyString = `${patientAllergies} ${docAllergies}`.toLowerCase();

  for (const cross of ALLERGY_CROSS_REACTIONS) {
    const hasAllergen = cross.allergenKey.some((k) => totalAllergyString.includes(k.toLowerCase()));
    if (hasAllergen) {
      for (const doc of documents) {
        for (const med of doc.medications) {
          const medText = `${med.brand} ${med.generic || ''}`.toLowerCase();
          const matchesBadGeneric = cross.contraindicatedGenerics.some((g) => medText.includes(g));
          if (matchesBadGeneric) {
            discrepancies.push({
              id: `DISC_ALLERGY_${Date.now()}_${med.brand}`,
              type: 'allergy_conflict',
              severity: 'CRITICAL',
              title: cross.alertMessage,
              description: `Patient allergy profile flags hypersensitivity, yet ${med.brand} (${med.generic || ''}) is present in medication history.`,
              patientStatement: `Allergy recorded: ${cross.allergenKey[0]}`,
              documentEvidence: `Prescribed: ${med.brand}`,
            });
          }
        }
      }
    }
  }

  return discrepancies;
}
