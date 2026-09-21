import { ChiefComplaintId, HistorySlotValue, RedFlagAlert } from '../types';

export interface RedFlagRule {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH';
  description: string;
  suggestedAction: string;
  calmPatientMessageEn: string;
  calmPatientMessageHi: string;
  evaluate: (ctx: EvaluationContext) => { matches: boolean; evidence?: string };
}

export interface EvaluationContext {
  complaint?: ChiefComplaintId;
  slots: Record<string, HistorySlotValue | any>;
  utterances?: string[];
  patientAge?: number;
  patientGender?: string;
  isPregnant?: boolean;
}

const normalizeText = (text: string): string => {
  return (text || '').toLowerCase().trim();
};

const hasAnyKeyword = (haystack: string, keywords: string[]): boolean => {
  const norm = normalizeText(haystack);
  return keywords.some((kw) => norm.includes(kw.toLowerCase()));
};

export const RED_FLAG_RULES: RedFlagRule[] = [
  // Rule 1: Acute Coronary Syndrome (Chest pain with red flags)
  {
    id: 'RF_ACS_CHEST_PAIN',
    title: 'Possible Acute Coronary Syndrome (Cardiac Red Flag)',
    severity: 'CRITICAL',
    description: 'Chest pain associated with dyspnea, diaphoresis, radiation to left arm/jaw, or syncope.',
    suggestedAction: 'Immediate ECG, stat cardiology review, transfer to Resuscitation/Triage Bay 1.',
    calmPatientMessageEn: 'Please rest comfortably. Our nursing staff has been alerted and will attend to you immediately.',
    calmPatientMessageHi: 'कृपया आराम से बैठें। हमारे नर्सिंग स्टाफ को सूचित कर दिया गया है और वे तुरंत आपकी सहायता के लिए आ रहे हैं।',
    evaluate: (ctx) => {
      const isChestPain = ctx.complaint === 'chest_pain';
      const slotValues = Object.values(ctx.slots).map((s) => (s && typeof s === 'object' && 'value' in s ? JSON.stringify(s.value) : JSON.stringify(s))).join(' ');
      const utteranceText = (ctx.utterances || []).join(' ');
      const allText = `${slotValues} ${utteranceText}`.toLowerCase();

      if (isChestPain || hasAnyKeyword(allText, ['chest pain', 'सीने में दर्द', 'छाती में दर्द', 'heart attack'])) {
        const hasRadiation = hasAnyKeyword(allText, ['left arm', 'shoulder', 'jaw', 'neck', 'पीठ', 'बायां हाथ', 'गर्दन', 'जबड़ा']);
        const hasDyspnea = hasAnyKeyword(allText, ['breathless', 'shortness of breath', 'सांस फूल', 'dyspnea']);
        const hasSweat = hasAnyKeyword(allText, ['sweat', 'cold sweat', 'पसीना']);
        const hasSyncope = hasAnyKeyword(allText, ['faint', 'passed out', 'syncope', 'बेहोश', 'चक्कर']);

        if (hasRadiation || hasDyspnea || hasSweat || hasSyncope) {
          const matchedFlags = [];
          if (hasRadiation) matchedFlags.push('Radiation to arm/jaw');
          if (hasDyspnea) matchedFlags.push('Breathlessness');
          if (hasSweat) matchedFlags.push('Diaphoresis');
          if (hasSyncope) matchedFlags.push('Syncope/Fainting');
          return { matches: true, evidence: `Chest discomfort with: ${matchedFlags.join(', ')}` };
        }
      }
      return { matches: false };
    },
  },

  // Rule 2: Acute Stroke Signs (FAST)
  {
    id: 'RF_STROKE_FAST',
    title: 'Acute Stroke Alert (FAST Criteria)',
    severity: 'CRITICAL',
    description: 'Sudden facial asymmetry, unilateral motor weakness, dysarthria, or sudden vision loss.',
    suggestedAction: 'Code Stroke activation, immediate non-contrast CT brain, stroke team notification.',
    calmPatientMessageEn: 'Please remain seated safely. A medical team member is coming right over to assist you.',
    calmPatientMessageHi: 'कृपया आराम से बैठे रहें। मेडिकल टीम का सदस्य तुरंत आपकी सहायता के लिए आ रहा है।',
    evaluate: (ctx) => {
      const slotValues = Object.values(ctx.slots).map((s) => JSON.stringify(s)).join(' ');
      const utteranceText = (ctx.utterances || []).join(' ');
      const allText = `${slotValues} ${utteranceText}`.toLowerCase();

      const hasFacial = hasAnyKeyword(allText, ['face droop', 'facial droop', 'चेहरा टेढ़ा', 'facial weakness']);
      const hasWeakness = hasAnyKeyword(allText, ['one arm', 'one-sided weakness', 'leg weak', 'एक तरफ कमजोरी', 'हाथ सुन्न', 'unilateral']);
      const hasSpeech = hasAnyKeyword(allText, ['slurred speech', 'difficulty speaking', 'speech slur', 'बोली लड़खड़ा', 'आवाज बंद']);
      const hasVision = hasAnyKeyword(allText, ['sudden vision loss', 'अचानक आंख से दिखना बंद', 'blindness in one eye']);

      if (hasFacial || hasWeakness || hasSpeech || hasVision) {
        const detected = [];
        if (hasFacial) detected.push('Facial droop');
        if (hasWeakness) detected.push('Unilateral weakness');
        if (hasSpeech) detected.push('Speech disturbance');
        if (hasVision) detected.push('Sudden vision loss');
        return { matches: true, evidence: `Suspected acute stroke: ${detected.join(', ')}` };
      }
      return { matches: false };
    },
  },

  // Rule 3: Thunderclap Headache
  {
    id: 'RF_THUNDERCLAP_HEADACHE',
    title: 'Sudden Severe Headache (Possible Subarachnoid Hemorrhage)',
    severity: 'CRITICAL',
    description: 'Thunderclap onset of headache described as the worst headache of life reaching peak within seconds.',
    suggestedAction: 'Immediate neurological assessment, non-contrast head CT to rule out intracranial hemorrhage.',
    calmPatientMessageEn: 'Please stay seated and rest your eyes. A clinical officer is on their way.',
    calmPatientMessageHi: 'कृपया शांत बैठें। डॉक्टर आपकी जांच के लिए तुरंत आ रहे हैं।',
    evaluate: (ctx) => {
      const slotValues = Object.values(ctx.slots).map((s) => JSON.stringify(s)).join(' ');
      const utteranceText = (ctx.utterances || []).join(' ');
      const allText = `${slotValues} ${utteranceText}`.toLowerCase();

      if (ctx.complaint === 'headache' || allText.includes('headache') || allText.includes('सिरदर्द')) {
        if (hasAnyKeyword(allText, ['thunderclap', 'worst headache of life', 'worst ever', 'जिंदगी का सबसे तेज', 'बिजली कड़कने', 'असहनीय सिरदर्द'])) {
          return { matches: true, evidence: 'Thunderclap explosive headache onset reported' };
        }
      }
      return { matches: false };
    },
  },

  // Rule 4: Severe Respiratory Distress / Central Cyanosis
  {
    id: 'RF_SEVERE_RESP_DISTRESS',
    title: 'Severe Respiratory Distress / Hypoxemia Alert',
    severity: 'CRITICAL',
    description: 'Patient unable to speak in sentences, cyanosis (blue lips/nails), or gasping at rest.',
    suggestedAction: 'Immediate high-flow oxygen, SpO2 monitoring, nebulization assessment, priority bed.',
    calmPatientMessageEn: 'Take slow, gentle breaths. Our nursing staff is bringing oxygen and assistance.',
    calmPatientMessageHi: 'धीरे-धीरे गहरी सांस लें। हमारा स्टाफ तुरंत ऑक्सीजन और सहायता लेकर आ रहा है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasCyanosis = hasAnyKeyword(allText, ['blue lips', 'cyanosis', 'नीले होंठ', 'नीले नाखून']);
      const hasSevereDyspnea = hasAnyKeyword(allText, ['cannot complete sentence', 'gasping at rest', 'severe breathlessness at rest', 'सांस नहीं आ रही', 'दम घुट रहा']);
      if (hasCyanosis || hasSevereDyspnea) {
        return { matches: true, evidence: `Respiratory failure signs: ${hasCyanosis ? 'Cyanosis' : ''} ${hasSevereDyspnea ? 'Dyspnea at rest' : ''}`.trim() };
      }
      return { matches: false };
    },
  },

  // Rule 5: Gastrointestinal Bleeding (Hematemesis or Melena)
  {
    id: 'RF_GI_BLEED',
    title: 'Acute Upper/Lower GI Hemorrhage',
    severity: 'CRITICAL',
    description: 'Vomiting blood (fresh red or coffee-ground) or passage of black tarry stool.',
    suggestedAction: 'Hemodynamic monitoring, large bore IV cannula, IV fluids, urgent cross-match and gastroenterology consult.',
    calmPatientMessageEn: 'Please sit comfortably. Our medical team has been alerted for priority assessment.',
    calmPatientMessageHi: 'कृपया आराम से बैठें। मेडिकल टीम को प्राथमिकता के साथ सूचित किया गया है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasHematemesis = hasAnyKeyword(allText, ['hematemesis', 'vomit blood', 'blood in vomit', 'खून की उल्टी']);
      const hasMelena = hasAnyKeyword(allText, ['melena', 'black stool', 'black tar-like stool', 'काला मल', 'शौच में खून']);
      if (hasHematemesis || hasMelena) {
        return { matches: true, evidence: `GI Bleed: ${hasHematemesis ? 'Vomiting blood' : ''} ${hasMelena ? 'Black/bloody stool' : ''}`.trim() };
      }
      return { matches: false };
    },
  },

  // Rule 6: Peritonitis / Acute Abdomen (Board-like rigidity)
  {
    id: 'RF_ACUTE_PERITONITIS',
    title: 'Acute Surgical Abdomen / Peritonitis',
    severity: 'CRITICAL',
    description: 'Severe abdominal pain with rigid board-like abdomen or severe persistent vomiting.',
    suggestedAction: 'Immediate surgical triage, keep NPO, urgent abdominal erect X-ray/ultrasound, IV analgesia.',
    calmPatientMessageEn: 'Please stay still and avoid eating or drinking. A doctor will examine you right away.',
    calmPatientMessageHi: 'कृपया शांत बैठें, कुछ भी खाएं या पिएं नहीं। डॉक्टर तुरंत आपकी जांच करेंगे।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasRigidity = hasAnyKeyword(allText, ['rigid', 'hard as a board', 'peritonitis', 'पत्थर जैसा कड़ा', 'rigid abdomen']);
      const hasSevereAbd = (ctx.complaint === 'abdominal_pain' || allText.includes('pet dard') || allText.includes('stomach')) &&
        (hasAnyKeyword(allText, ['persistent vomiting', 'severe loose motions', 'dehydration', 'चक्कर']) && (ctx.slots.severity?.value >= 8 || allText.includes('severity: 9') || allText.includes('severity: 10')));

      if (hasRigidity || hasSevereAbd) {
        return { matches: true, evidence: hasRigidity ? 'Board-like abdominal rigidity' : 'Severe abdominal pain with intractable vomiting/dehydration' };
      }
      return { matches: false };
    },
  },

  // Rule 7: Meningism / Sepsis (Fever with stiff neck / altered sensorium / purpuric rash)
  {
    id: 'RF_MENINGISM_SEPSIS',
    title: 'Suspected Central Nervous System Infection / Sepsis',
    severity: 'CRITICAL',
    description: 'High fever accompanied by neck rigidity, altered consciousness, convulsions, or petechial/purpuric rash.',
    suggestedAction: 'Stat isolation bed, lumbar puncture workup, blood cultures, prompt IV antibiotic/antiviral initiation.',
    calmPatientMessageEn: 'Please rest comfortably. A dedicated doctor is coming to check your temperature and signs.',
    calmPatientMessageHi: 'कृपया आराम से बैठें। डॉक्टर आपकी तुरंत जांच करने आ रहे हैं।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasFever = ctx.complaint === 'fever' || hasAnyKeyword(allText, ['fever', 'बुखार', 'chills']);
      if (hasFever) {
        const hasStiffNeck = hasAnyKeyword(allText, ['stiff neck', 'neck stiffness', 'गर्दन में अकड़न']);
        const hasConfusion = hasAnyKeyword(allText, ['confusion', 'drowsiness', 'altered mental', 'बेसुध', 'भ्रमित']);
        const hasConvulsion = hasAnyKeyword(allText, ['convulsion', 'fit', 'seizure', 'दौरा', 'मिर्गी']);
        const hasRash = hasAnyKeyword(allText, ['purpura', 'petechiae', 'skin rash', 'लाल चकत्ते']);

        if (hasStiffNeck || hasConfusion || hasConvulsion || hasRash) {
          const reasons = [];
          if (hasStiffNeck) reasons.push('Neck stiffness');
          if (hasConfusion) reasons.push('Altered sensorium');
          if (hasConvulsion) reasons.push('Convulsion');
          if (hasRash) reasons.push('Rash');
          return { matches: true, evidence: `Fever with meningeal/septic signs: ${reasons.join(', ')}` };
        }
      }
      return { matches: false };
    },
  },

  // Rule 8: Obstetric Emergency (Pregnancy with bleeding or severe pain)
  {
    id: 'RF_OBSTETRIC_EMERGENCY',
    title: 'Obstetric Emergency / Threatened Miscarriage or Ectopic',
    severity: 'CRITICAL',
    description: 'Pregnant patient presenting with vaginal bleeding, acute pelvic pain, or syncope.',
    suggestedAction: 'Immediate transfer to Labor Room / Obstetric Casualty, urgent fetal Doppler and ultrasound.',
    calmPatientMessageEn: 'Please lie down or sit comfortably. The maternity emergency nurse has been alerted.',
    calmPatientMessageHi: 'कृपया आराम से बैठें या लेटें। प्रसूति इमरजेंसी स्टाफ को तुरंत बुला लिया गया है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const isPreg = ctx.isPregnant || hasAnyKeyword(allText, ['pregnant', 'pregnancy', 'गर्भवती', 'गर्भ', 'lmp missed']);
      if (isPreg) {
        const hasBleeding = hasAnyKeyword(allText, ['bleeding', 'spotting', 'रक्तस्राव', 'खून जाना', 'vaginal bleeding']);
        const hasSeverePelvic = hasAnyKeyword(allText, ['pelvic pain', 'severe abdominal pain', 'cramps', 'पेट में तेज दर्द']);
        if (hasBleeding || hasSeverePelvic) {
          return { matches: true, evidence: `Pregnancy with ${hasBleeding ? 'vaginal bleeding' : ''} ${hasSeverePelvic ? 'severe abdominal pain' : ''}`.trim() };
        }
      }
      return { matches: false };
    },
  },

  // Rule 9: Anaphylaxis / Airway Compromise
  {
    id: 'RF_ANAPHYLAXIS',
    title: 'Suspected Anaphylaxis / Airway Angioedema',
    severity: 'CRITICAL',
    description: 'Sudden swelling of lips, tongue or throat with stridor, wheezing, or post-allergen collapse.',
    suggestedAction: 'Immediate IM Epinephrine (Adrenaline 1:1000), oxygen, airway protection, IV antihistamine.',
    calmPatientMessageEn: 'Stay calm and breathe steadily. Emergency staff is bringing medication right now.',
    calmPatientMessageHi: 'घबराएं नहीं, धीरे-धीरे सांस लें। इमरजेंसी स्टाफ तुरंत दवाई लेकर आ रहा है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasSwelling = hasAnyKeyword(allText, ['lip swelling', 'throat swelling', 'tongue swelling', 'गला घुट', 'होंठ सूजना']);
      const hasStridor = hasAnyKeyword(allText, ['stridor', 'choking', 'difficulty swallowing and breathing', 'गले में रुकावट']);
      if (hasSwelling || hasStridor) {
        return { matches: true, evidence: 'Signs of upper airway swelling / acute anaphylaxis' };
      }
      return { matches: false };
    },
  },

  // Rule 10: Poisoning / Snakebite / Overdose
  {
    id: 'RF_TOXICOLOGY_SNAKEBITE',
    title: 'Acute Envenomation / Poisoning / Overdose',
    severity: 'CRITICAL',
    description: 'Suspected snake bite, organophosphate / pesticide ingestion, or medication overdose.',
    suggestedAction: 'Immediate resuscitation room admission, ASV (Anti-Snake Venom) or specific antidote protocol, keep bite limb immobilized.',
    calmPatientMessageEn: 'Please stay completely still and calm. Specialized medical staff is attending immediately.',
    calmPatientMessageHi: 'कृपया शांत और स्थिर रहें, बिल्कुल हिलें-डुलें नहीं। विशेष मेडिकल टीम तुरंत आ रही है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasSnakeBite = hasAnyKeyword(allText, ['snake', 'snake bite', 'सांप ने काटा', 'सांप का काटना', 'fang marks']);
      const hasPoison = hasAnyKeyword(allText, ['poison', 'insecticide', 'pesticide', 'overdose', 'जहर', 'दवाई ज्यादा खा ली']);
      if (hasSnakeBite || hasPoison) {
        return { matches: true, evidence: hasSnakeBite ? 'Reported snake bite / envenomation' : 'Suspected toxic ingestion / overdose' };
      }
      return { matches: false };
    },
  },

  // Rule 11: Self-Harm / Crisis Protocol
  // DESIGN PRINCIPLE: "If a patient mentions self-harm: calm supportive message + immediate staff alert; never discuss methods."
  {
    id: 'RF_SELF_HARM_CRISIS',
    title: 'Urgent Mental Health Crisis / Self-Harm Alert',
    severity: 'CRITICAL',
    description: 'Patient expressed feelings or intent of self-harm or despair.',
    suggestedAction: 'Immediate gentle, non-judgmental staff accompaniment. Ensure patient is not left alone. Notify Psychiatry liaison / Counselor.',
    calmPatientMessageEn: 'You are safe here, and you are not alone. A caring team member is coming right now to speak with you.',
    calmPatientMessageHi: 'आप यहाँ पूरी तरह सुरक्षित हैं और आप अकेले नहीं हैं। हमारी टीम का एक सदस्य आपसे बात करने और सहायता के लिए आ रहा है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasSelfHarmKeywords = hasAnyKeyword(allText, [
        'suicide',
        'kill myself',
        'end my life',
        'want to die',
        'आत्महत्या',
        'जान देना',
        'मरना चाहता',
        'मरने का मन',
        'self harm',
        'hurt myself',
      ]);
      if (hasSelfHarmKeywords) {
        return { matches: true, evidence: 'Patient communicated thoughts of self-harm or suicidal despair' };
      }
      return { matches: false };
    },
  },

  // Rule 12: Cauda Equina Syndrome (Spinal red flag)
  {
    id: 'RF_CAUDA_EQUINA',
    title: 'Suspected Cauda Equina Syndrome',
    severity: 'CRITICAL',
    description: 'Back pain with new-onset urinary/fecal incontinence or saddle anesthesia.',
    suggestedAction: 'Emergency MRI lumbar spine, stat neurosurgery/ortho spine consultation to prevent permanent deficit.',
    calmPatientMessageEn: 'Please rest comfortably while our spinal triage team is notified.',
    calmPatientMessageHi: 'कृपया आराम से बैठें, हमारे विशेषज्ञ डॉक्टर को सूचित कर दिया गया है।',
    evaluate: (ctx) => {
      const allText = `${JSON.stringify(ctx.slots)} ${(ctx.utterances || []).join(' ')}`.toLowerCase();
      const hasBackPain = ctx.complaint === 'joint_back_pain' || allText.includes('back') || allText.includes('कमर');
      const hasIncontinence = hasAnyKeyword(allText, ['incontinence', 'loss of urine control', 'loss of stool', 'पेशाब छूट', 'saddle anesthesia', 'cauda equina']);
      if (hasBackPain && hasIncontinence) {
        return { matches: true, evidence: 'Back discomfort with loss of bowel/bladder control or saddle numbness' };
      }
      return { matches: false };
    },
  },
];

export function evaluateRedFlags(ctx: EvaluationContext): RedFlagAlert[] {
  const alerts: RedFlagAlert[] = [];
  const patientId = (ctx.slots.patientId as string) || 'PAT-' + Math.floor(100000 + Math.random() * 900000);
  const patientName = (ctx.slots.patientName as string) || 'Patient';
  const tokenNumber = (ctx.slots.tokenNumber as string) || 'T-101';

  for (const rule of RED_FLAG_RULES) {
    try {
      const result = rule.evaluate(ctx);
      if (result.matches) {
        alerts.push({
          id: `ALERT_${rule.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          patientId,
          patientName,
          patientAge: ctx.patientAge || 45,
          patientGender: ctx.patientGender || 'M',
          tokenNumber,
          timestamp: new Date().toISOString(),
          ruleId: rule.id,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          triggerEvidence: result.evidence || 'Deterministic criteria met',
          suggestedAction: rule.suggestedAction,
          acknowledged: false,
        });
      }
    } catch {
      // Deterministic evaluation failsafe
    }
  }

  return alerts;
}
