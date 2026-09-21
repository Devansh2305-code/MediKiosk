import { evaluateRedFlags } from '../ontology/redFlagRules';

interface TestCase {
  name: string;
  context: Parameters<typeof evaluateRedFlags>[0];
  expectedRuleId?: string;
  shouldTrigger: boolean;
}

export const RED_FLAG_TEST_CASES: TestCase[] = [
  // 1. Positive: Hindi voice chest pain + breathlessness (ACS)
  {
    name: 'Hindi speech: Chest pain with breathlessness and sweating',
    context: {
      complaint: 'chest_pain',
      slots: {
        character: { value: 'Heavy pressure' },
        associated_symptoms: { value: ['Breathlessness', 'Cold sweating'] },
      },
      utterances: ['मुझे दो दिन से सीने में दर्द है और सांस फूल रही है, पसीना आ रहा है'],
    },
    expectedRuleId: 'RF_ACS_CHEST_PAIN',
    shouldTrigger: true,
  },
  // 2. Negative: Mild chest burning without red flags (GERD-like)
  {
    name: 'Chest burning after meal without dyspnea or radiation',
    context: {
      complaint: 'chest_pain',
      slots: {
        character: { value: 'Burning' },
        radiation: { value: 'None' },
        associated_symptoms: { value: ['None'] },
      },
      utterances: ['खाना खाने के बाद हल्की सीने में जलन है'],
    },
    expectedRuleId: 'RF_ACS_CHEST_PAIN',
    shouldTrigger: false,
  },
  // 3. Positive: Stroke signs - sudden facial droop and arm weakness
  {
    name: 'Stroke: sudden facial droop and right arm weakness',
    context: {
      complaint: 'headache',
      slots: {
        associated_symptoms: { value: ['Facial droop', 'Unilateral weakness'] },
      },
      utterances: ['Patient noticed face drooping on right side and could not lift hand'],
    },
    expectedRuleId: 'RF_STROKE_FAST',
    shouldTrigger: true,
  },
  // 4. Negative: Tension headache without neuro deficits
  {
    name: 'Headache: Mild tension-type headache for 3 days',
    context: {
      complaint: 'headache',
      slots: {
        character: { value: 'Tight band' },
        associated_symptoms: { value: ['None'] },
      },
      utterances: ['तनाव के कारण माथे पर भारीपन है'],
    },
    expectedRuleId: 'RF_STROKE_FAST',
    shouldTrigger: false,
  },
  // 5. Positive: Thunderclap headache (subarachnoid hemorrhage suspicion)
  {
    name: 'Explosive thunderclap onset worst headache of life',
    context: {
      complaint: 'headache',
      slots: {
        character: { value: 'Thunderclap / worst ever' },
      },
      utterances: ['अचानक ऐसा लगा जैसे सिर में बिजली गिरी हो, जिंदगी का सबसे तेज दर्द'],
    },
    expectedRuleId: 'RF_THUNDERCLAP_HEADACHE',
    shouldTrigger: true,
  },
  // 6. Positive: Respiratory distress with cyanosis (blue lips)
  {
    name: 'Breathlessness: Cyanosis (blue lips) and gasping at rest',
    context: {
      complaint: 'cough_breathlessness',
      slots: {
        associated_symptoms: { value: ['Cyanosis', 'Severe breathlessness at rest'] },
      },
      utterances: ['होंठ नीले पड़ रहे हैं और सांस नहीं आ रही'],
    },
    expectedRuleId: 'RF_SEVERE_RESP_DISTRESS',
    shouldTrigger: true,
  },
  // 7. Negative: Chronic mild dry cough
  {
    name: 'Cough: Mild dry throat tickle for 4 days',
    context: {
      complaint: 'cough_breathlessness',
      slots: {
        character: { value: 'Dry cough' },
        associated_symptoms: { value: ['None'] },
      },
      utterances: ['हल्की सूखी खांसी है, सांस सामान्य है'],
    },
    expectedRuleId: 'RF_SEVERE_RESP_DISTRESS',
    shouldTrigger: false,
  },
  // 8. Positive: GI bleed - vomiting coffee ground blood
  {
    name: 'GI Bleed: Hematemesis / vomiting blood',
    context: {
      complaint: 'abdominal_pain',
      slots: {
        associated_symptoms: { value: ['Hematemesis'] },
      },
      utterances: ['दो बार खून की उल्टी हुई है'],
    },
    expectedRuleId: 'RF_GI_BLEED',
    shouldTrigger: true,
  },
  // 9. Positive: Acute peritonitis - board-like rigid abdomen
  {
    name: 'Peritonitis: Rigid board-like abdomen cannot touch',
    context: {
      complaint: 'abdominal_pain',
      slots: {
        associated_symptoms: { value: ['Rigid abdomen / peritonitis'] },
      },
      utterances: ['पेट पत्थर जैसा कड़ा हो गया है, छूने भी नहीं दे रहे'],
    },
    expectedRuleId: 'RF_ACUTE_PERITONITIS',
    shouldTrigger: true,
  },
  // 10. Negative: Simple gastric cramp with mild loose stool
  {
    name: 'Abdominal pain: Mild cramping with 1 loose motion',
    context: {
      complaint: 'abdominal_pain',
      slots: {
        associated_symptoms: { value: ['None'] },
      },
      utterances: ['पेट में थोड़ा मरोड़ है'],
    },
    expectedRuleId: 'RF_ACUTE_PERITONITIS',
    shouldTrigger: false,
  },
  // 11. Positive: Fever with stiff neck and confusion (meningitis)
  {
    name: 'Fever: High fever with neck stiffness and altered sensorium',
    context: {
      complaint: 'fever',
      slots: {
        associated_symptoms: { value: ['Neck stiffness', 'Confusion'] },
      },
      utterances: ['तेज बुखार है और गर्दन मुड़ नहीं रही, मरीज बेसुध है'],
    },
    expectedRuleId: 'RF_MENINGISM_SEPSIS',
    shouldTrigger: true,
  },
  // 12. Negative: Simple viral fever with bodyache
  {
    name: 'Fever: 2 days low-grade fever with mild myalgia',
    context: {
      complaint: 'fever',
      slots: {
        associated_symptoms: { value: ['None'] },
      },
      utterances: ['कल से हल्का बुखार और बदन दर्द है'],
    },
    expectedRuleId: 'RF_MENINGISM_SEPSIS',
    shouldTrigger: false,
  },
  // 13. Positive: Obstetric bleeding in pregnant patient
  {
    name: 'Pregnancy: 12 weeks pregnant with acute vaginal bleeding',
    context: {
      complaint: 'abdominal_pain',
      isPregnant: true,
      slots: {
        associated_symptoms: { value: ['Vaginal bleeding'] },
      },
      utterances: ['3 महीने का गर्भ है और पेट में तेज दर्द के साथ खून जा रहा है'],
    },
    expectedRuleId: 'RF_OBSTETRIC_EMERGENCY',
    shouldTrigger: true,
  },
  // 14. Positive: Acute Anaphylaxis / Airway swelling
  {
    name: 'Anaphylaxis: Lip swelling and throat choking after injection',
    context: {
      complaint: 'other',
      slots: {
        description: { value: 'Injected medicine then started choking' },
      },
      utterances: ['दवा लेने के बाद होंठ सूज गए और गले में सांस रुक रही है (lip swelling)'],
    },
    expectedRuleId: 'RF_ANAPHYLAXIS',
    shouldTrigger: true,
  },
  // 15. Positive: Snake bite reported
  {
    name: 'Toxicology: Snake bite in agricultural field',
    context: {
      complaint: 'other',
      slots: {
        description: { value: 'Bitten on foot' },
      },
      utterances: ['खेत में पैर पर सांप ने काटा है, दर्द बढ़ रहा है'],
    },
    expectedRuleId: 'RF_TOXICOLOGY_SNAKEBITE',
    shouldTrigger: true,
  },
  // 16. Positive: Self-harm / crisis protocol
  {
    name: 'Mental Health: Patient mentions desire to die / end life',
    context: {
      complaint: 'other',
      slots: {
        description: { value: 'Severe depression' },
      },
      utterances: ['मैं बहुत परेशान हूँ और आत्महत्या करना चाहता हूँ'],
    },
    expectedRuleId: 'RF_SELF_HARM_CRISIS',
    shouldTrigger: true,
  },
  // 17. Positive: Cauda Equina - back pain with sudden loss of bowel/bladder control
  {
    name: 'Spine: Severe lower back pain with urinary incontinence',
    context: {
      complaint: 'joint_back_pain',
      slots: {
        associated_symptoms: { value: ['Cauda equina signs / incontinence'] },
      },
      utterances: ['कमर में तेज दर्द के बाद से पेशाब पर कोई नियंत्रण नहीं रहा'],
    },
    expectedRuleId: 'RF_CAUDA_EQUINA',
    shouldTrigger: true,
  },
  // 18. Negative: Routine chronic knee osteoarthritis
  {
    name: 'Joint pain: Chronic knee pain on climbing stairs',
    context: {
      complaint: 'joint_back_pain',
      slots: {
        site: { value: 'Bilateral knees' },
        associated_symptoms: { value: ['None'] },
      },
      utterances: ['सीढ़ियां चढ़ने पर घुटने में दर्द होता है, 6 महीने से है'],
    },
    expectedRuleId: 'RF_CAUDA_EQUINA',
    shouldTrigger: false,
  },
];

export function runRedFlagUnitTests(): { total: number; passed: number; results: { name: string; success: boolean; details: string }[] } {
  const results: { name: string; success: boolean; details: string }[] = [];
  let passed = 0;

  for (const tc of RED_FLAG_TEST_CASES) {
    const alerts = evaluateRedFlags(tc.context);
    const triggeredRuleIds = alerts.map((a) => a.ruleId);
    let success = false;
    let details = '';

    if (tc.shouldTrigger) {
      if (tc.expectedRuleId && triggeredRuleIds.includes(tc.expectedRuleId)) {
        success = true;
        details = `Triggered expected ${tc.expectedRuleId} (${alerts.find((a) => a.ruleId === tc.expectedRuleId)?.title})`;
      } else {
        success = false;
        details = `Failed to trigger ${tc.expectedRuleId}. Triggered: [${triggeredRuleIds.join(', ')}]`;
      }
    } else {
      if (!tc.expectedRuleId || !triggeredRuleIds.includes(tc.expectedRuleId)) {
        success = true;
        details = `Correctly did not trigger ${tc.expectedRuleId || 'critical rule'}. Alerts count: ${alerts.length}`;
      } else {
        success = false;
        details = `False positive: unexpectedly triggered ${tc.expectedRuleId}`;
      }
    }

    if (success) passed++;
    results.push({ name: tc.name, success, details });
  }

  return { total: RED_FLAG_TEST_CASES.length, passed, results };
}
