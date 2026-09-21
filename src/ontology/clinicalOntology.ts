import { ChiefComplaintId } from '../types';

export interface TapOption {
  id: string;
  labelEn: string;
  labelHi: string;
  iconName?: string;
  mapsToSlotValue: any;
}

export interface OntologySlot {
  key: string;
  nameEn: string;
  nameHi: string;
  questionPromptEn: string;
  questionPromptHi: string;
  inputType: 'single_tap' | 'multi_tap' | 'severity_scale' | 'body_map' | 'duration_chips' | 'yes_no' | 'free_speech';
  isRequired: boolean;
  options?: TapOption[];
  branchingCondition?: (filled: Record<string, any>) => boolean;
}

export interface ComplaintModule {
  id: ChiefComplaintId;
  titleEn: string;
  titleHi: string;
  icon: string;
  descriptionEn: string;
  descriptionHi: string;
  slots: OntologySlot[];
  redFlagKeywords: string[];
}

export const COMPLAINT_MODULES: Record<ChiefComplaintId, ComplaintModule> = {
  chest_pain: {
    id: 'chest_pain',
    titleEn: 'Chest Pain / Discomfort',
    titleHi: 'सीने में दर्द या भारीपन',
    icon: 'HeartPulse',
    descriptionEn: 'Pressure, tightness, sharp pain or burning in chest',
    descriptionHi: 'छाती में दबाव, जकड़न, चुभन या जलन',
    redFlagKeywords: ['breathless', 'sweat', 'jaw', 'left arm', 'radiat', 'faint', 'syncope', 'सांस', 'पसीना', 'बायां हाथ'],
    slots: [
      {
        key: 'duration',
        nameEn: 'Duration of Pain',
        nameHi: 'दर्द कितने समय से है',
        questionPromptEn: 'How long have you had this chest pain?',
        questionPromptHi: 'आपको यह सीने का दर्द कब से हो रहा है?',
        inputType: 'duration_chips',
        isRequired: true,
        options: [
          { id: 'under_1_hr', labelEn: '< 1 Hour', labelHi: '1 घंटे से कम', mapsToSlotValue: '< 1 hour' },
          { id: '1_to_6_hrs', labelEn: '1 - 6 Hours', labelHi: '1 से 6 घंटे', mapsToSlotValue: '1-6 hours' },
          { id: 'today', labelEn: 'Since Today Morning', labelHi: 'आज सुबह से', mapsToSlotValue: 'Since morning' },
          { id: '2_to_3_days', labelEn: '2 - 3 Days', labelHi: '2-3 दिन', mapsToSlotValue: '2-3 days' },
          { id: 'over_1_week', labelEn: 'More than 1 Week', labelHi: '1 हफ्ते से अधिक', mapsToSlotValue: '> 1 week' },
        ],
      },
      {
        key: 'site',
        nameEn: 'Location / Site',
        nameHi: 'दर्द का स्थान',
        questionPromptEn: 'Where exactly in the chest is the pain located?',
        questionPromptHi: 'सीने में दर्द बिल्कुल कहाँ महसूस हो रहा है?',
        inputType: 'body_map',
        isRequired: true,
        options: [
          { id: 'center', labelEn: 'Center of Chest', labelHi: 'सीने के बीच में', mapsToSlotValue: 'Center of chest' },
          { id: 'left_side', labelEn: 'Left Side of Chest', labelHi: 'बाईं तरफ (Left side)', mapsToSlotValue: 'Left precordial' },
          { id: 'right_side', labelEn: 'Right Side', labelHi: 'दाईं तरफ (Right side)', mapsToSlotValue: 'Right side' },
          { id: 'upper_abdomen', labelEn: 'Upper Stomach / Epigastric', labelHi: 'पेट के ऊपरी भाग में', mapsToSlotValue: 'Epigastric' },
        ],
      },
      {
        key: 'character',
        nameEn: 'Character of Pain',
        nameHi: 'दर्द का प्रकार',
        questionPromptEn: 'What does the pain feel like?',
        questionPromptHi: 'दर्द किस तरह का महसूस हो रहा है?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'heavy_pressure', labelEn: 'Heavy Pressure / Tightness', labelHi: 'भारीपन / दबाव', iconName: 'Weight', mapsToSlotValue: 'Heavy pressure / crushing' },
          { id: 'burning', labelEn: 'Burning Sensation', labelHi: 'जलन (Burning)', iconName: 'Flame', mapsToSlotValue: 'Burning' },
          { id: 'stabbing', labelEn: 'Sharp / Stabbing Pain', labelHi: 'चुभने जैसा तीखा दर्द', iconName: 'Zap', mapsToSlotValue: 'Sharp / pleuritic' },
          { id: 'aching', labelEn: 'Dull Aching', labelHi: 'हल्का धीमा दर्द (Aching)', iconName: 'Activity', mapsToSlotValue: 'Dull ache' },
        ],
      },
      {
        key: 'radiation',
        nameEn: 'Spread / Radiation',
        nameHi: 'क्या दर्द कहीं और फैल रहा है?',
        questionPromptEn: 'Does the pain spread to your arm, neck, jaw or back?',
        questionPromptHi: 'क्या दर्द आपके हाथ, गर्दन, जबड़े या पीठ की तरफ जा रहा है?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'left_arm', labelEn: 'To Left Arm / Shoulder', labelHi: 'बाएं हाथ या कंधे में', iconName: 'ArrowUpRight', mapsToSlotValue: 'Left arm/shoulder' },
          { id: 'neck_jaw', labelEn: 'To Neck or Jaw', labelHi: 'गर्दन या जबड़े में', iconName: 'ArrowUp', mapsToSlotValue: 'Neck/jaw' },
          { id: 'back', labelEn: 'To Upper Back', labelHi: 'पीठ के पीछे', iconName: 'ArrowDown', mapsToSlotValue: 'Upper back' },
          { id: 'no_spread', labelEn: 'No, does not spread', labelHi: 'नहीं, कहीं नहीं फैलता', iconName: 'CheckCircle2', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'associated_symptoms',
        nameEn: 'Associated Symptoms',
        nameHi: 'अन्य साथ में होने वाले लक्षण',
        questionPromptEn: 'Are you having breathlessness, sweating, or nausea?',
        questionPromptHi: 'क्या आपको सांस फूलने, पसीना आने या जी घबराने की समस्या है?',
        inputType: 'multi_tap',
        isRequired: true,
        options: [
          { id: 'breathlessness', labelEn: 'Shortness of Breath', labelHi: 'सांस फूलना', iconName: 'Wind', mapsToSlotValue: 'Breathlessness' },
          { id: 'cold_sweats', labelEn: 'Cold Sweating', labelHi: 'अचानक ठंडा पसीना आना', iconName: 'Droplets', mapsToSlotValue: 'Cold sweating' },
          { id: 'nausea_vomiting', labelEn: 'Nausea or Vomiting', labelHi: 'उल्टी या जी मिचलाना', iconName: 'AlertCircle', mapsToSlotValue: 'Nausea / vomiting' },
          { id: 'dizziness', labelEn: 'Dizziness / Lightheadedness', labelHi: 'चक्कर आना / बेहोशी जैसा लगना', iconName: 'Compass', mapsToSlotValue: 'Dizziness' },
          { id: 'none', labelEn: 'None of these', labelHi: 'इनमें से कोई नहीं', iconName: 'Check', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'severity',
        nameEn: 'Pain Severity (0 - 10)',
        nameHi: 'दर्द कितना तेज है (0 से 10)',
        questionPromptEn: 'On a scale of 0 to 10, how severe is your pain right now?',
        questionPromptHi: '0 से 10 के पैमाने पर आपका दर्द कितना तेज है?',
        inputType: 'severity_scale',
        isRequired: true,
      },
    ],
  },
  fever: {
    id: 'fever',
    titleEn: 'Fever / Chills',
    titleHi: 'बुखार / कंपकंपी',
    icon: 'Thermometer',
    descriptionEn: 'High body temperature, chills, shivering, bodyache',
    descriptionHi: 'शरीर तपना, ठंड लगना, कपकपी या बदन दर्द',
    redFlagKeywords: ['stiff neck', 'confusion', 'rash', 'convulsion', 'fit', 'गर्दन अकड़ना', 'बेहोशी', 'दौरा'],
    slots: [
      {
        key: 'duration',
        nameEn: 'Duration of Fever',
        nameHi: 'बुखार कितने दिनों से है',
        questionPromptEn: 'How many days have you had fever?',
        questionPromptHi: 'आपको बुखार कितने दिनों से आ रहा है?',
        inputType: 'duration_chips',
        isRequired: true,
        options: [
          { id: '1_day', labelEn: '1 Day', labelHi: '1 दिन', mapsToSlotValue: '1 day' },
          { id: '2_to_3_days', labelEn: '2 - 3 Days', labelHi: '2-3 दिन', mapsToSlotValue: '2-3 days' },
          { id: '4_to_7_days', labelEn: '4 - 7 Days', labelHi: '4-7 दिन', mapsToSlotValue: '4-7 days' },
          { id: 'over_1_week', labelEn: 'Over 1 Week', labelHi: '1 हफ्ते से ज्यादा', mapsToSlotValue: '> 1 week' },
        ],
      },
      {
        key: 'character',
        nameEn: 'Pattern of Fever',
        nameHi: 'बुखार का तरीका',
        questionPromptEn: 'Does the fever come with chills or stay continuous?',
        questionPromptHi: 'क्या बुखार ठंड लगकर आता है या लगातार बना रहता है?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'with_chills', labelEn: 'With Shivering / Chills', labelHi: 'ठंड और कपकपी के साथ', iconName: 'CloudSnow', mapsToSlotValue: 'With chills and rigors' },
          { id: 'continuous', labelEn: 'Continuous High Temperature', labelHi: 'लगातार तेज बुखार', iconName: 'Sun', mapsToSlotValue: 'Continuous' },
          { id: 'evening_rise', labelEn: 'Increases in Evening / Night', labelHi: 'शाम या रात को बढ़ता है', iconName: 'Moon', mapsToSlotValue: 'Evening rise' },
        ],
      },
      {
        key: 'associated_symptoms',
        nameEn: 'Dangerous Associated Symptoms',
        nameHi: 'क्या ये गंभीर लक्षण भी हैं?',
        questionPromptEn: 'Do you have neck stiffness, confusion, skin rash or vomiting?',
        questionPromptHi: 'क्या गर्दन में अकड़न, उल्टी, चकत्ते या बेहोशी जैसा लग रहा है?',
        inputType: 'multi_tap',
        isRequired: true,
        options: [
          { id: 'neck_stiffness', labelEn: 'Stiff Neck (Difficulty bending head)', labelHi: 'गर्दन में अकड़न', iconName: 'ShieldAlert', mapsToSlotValue: 'Neck stiffness' },
          { id: 'confusion', labelEn: 'Confusion / Drowsiness', labelHi: 'बेसुध या भ्रमित होना', iconName: 'Brain', mapsToSlotValue: 'Confusion' },
          { id: 'skin_rash', labelEn: 'Red Spots / Skin Rash', labelHi: 'त्वचा पर लाल चकत्ते', iconName: 'Grid', mapsToSlotValue: 'Skin rash' },
          { id: 'joint_pains', labelEn: 'Severe Joint & Eye Pain', labelHi: 'आँखों और जोड़ों में तेज दर्द', iconName: 'Eye', mapsToSlotValue: 'Severe arthralgia / retro-orbital pain' },
          { id: 'none', labelEn: 'None of these', labelHi: 'इनमें से कोई नहीं', iconName: 'Check', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'severity',
        nameEn: 'General Discomfort',
        nameHi: 'परेशानी की तीव्रता',
        questionPromptEn: 'How weak or ill do you feel right now?',
        questionPromptHi: 'आप कितनी कमजोरी या परेशानी महसूस कर रहे हैं?',
        inputType: 'severity_scale',
        isRequired: true,
      },
    ],
  },
  cough_breathlessness: {
    id: 'cough_breathlessness',
    titleEn: 'Cough / Breathlessness',
    titleHi: 'खांसी / सांस फूलना',
    icon: 'Wind',
    descriptionEn: 'Dry cough, phlegm, breathing difficulty, wheezing',
    descriptionHi: 'सूखी खांसी, बलगम, सांस लेने में तकलीफ, घरघराहट',
    redFlagKeywords: ['blue lips', 'blood', 'hemoptysis', 'severe dyspnea', 'खून', 'नीले होंठ'],
    slots: [
      {
        key: 'duration',
        nameEn: 'Duration',
        nameHi: 'कितने दिनों से है',
        questionPromptEn: 'How long have you been coughing or having breathlessness?',
        questionPromptHi: 'आपको यह खांसी या सांस फूलने की समस्या कब से है?',
        inputType: 'duration_chips',
        isRequired: true,
        options: [
          { id: '1_to_3_days', labelEn: '1 - 3 Days', labelHi: '1-3 दिन', mapsToSlotValue: '1-3 days' },
          { id: '1_to_2_weeks', labelEn: '1 - 2 Weeks', labelHi: '1-2 हफ्ते', mapsToSlotValue: '1-2 weeks' },
          { id: 'over_3_weeks', labelEn: 'More than 3 Weeks (Chronic)', labelHi: '3 हफ्ते से ज्यादा', mapsToSlotValue: '> 3 weeks' },
        ],
      },
      {
        key: 'character',
        nameEn: 'Cough Type',
        nameHi: 'खांसी का प्रकार',
        questionPromptEn: 'Is your cough dry or with phlegm/sputum?',
        questionPromptHi: 'खांसी सूखी है या बलगम आ रहा है?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'dry', labelEn: 'Dry Cough', labelHi: 'सूखी खांसी', iconName: 'Volume2', mapsToSlotValue: 'Dry cough' },
          { id: 'phlegm_yellow', labelEn: 'Yellow / Green Phlegm', labelHi: 'पीला या हरा बलगम', iconName: 'Droplet', mapsToSlotValue: 'Productive yellow/green sputum' },
          { id: 'blood_in_cough', labelEn: 'Blood in Cough / Sputum', labelHi: 'खांसी में खून आना', iconName: 'AlertTriangle', mapsToSlotValue: 'Hemoptysis (blood)' },
        ],
      },
      {
        key: 'associated_symptoms',
        nameEn: 'Breathing Difficulty',
        nameHi: 'सांस लेने की स्थिति',
        questionPromptEn: 'Are you having difficulty breathing while resting or speaking?',
        questionPromptHi: 'क्या बैठे रहने पर भी सांस फूल रही है या होंठ नीले पड़ रहे हैं?',
        inputType: 'multi_tap',
        isRequired: true,
        options: [
          { id: 'breathless_at_rest', labelEn: 'Cannot complete sentence / Gasping at rest', labelHi: 'बैठे-बैठे सांस फूलना / बोलने में तकलीफ', iconName: 'AlertCircle', mapsToSlotValue: 'Severe breathlessness at rest' },
          { id: 'wheezing', labelEn: 'Whistling sound (Wheezing)', labelHi: 'सीटी जैसी आवाज आना (घरघराहट)', iconName: 'Music', mapsToSlotValue: 'Wheezing' },
          { id: 'blue_lips', labelEn: 'Bluish Lips or Nails', labelHi: 'होंठ या नाखून नीले पड़ना', iconName: 'ShieldAlert', mapsToSlotValue: 'Cyanosis' },
          { id: 'none', labelEn: 'Normal breathing', labelHi: 'सांस सामान्य है', iconName: 'Check', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'severity',
        nameEn: 'Severity',
        nameHi: 'गंभीरता',
        questionPromptEn: 'Rate the severity of your breathing discomfort',
        questionPromptHi: 'अपनी सांस की परेशानी का स्तर बताएं',
        inputType: 'severity_scale',
        isRequired: true,
      },
    ],
  },
  abdominal_pain: {
    id: 'abdominal_pain',
    titleEn: 'Abdominal Pain / Vomiting',
    titleHi: 'पेट दर्द / उल्टी / दस्त',
    icon: 'Activity',
    descriptionEn: 'Cramps, stomach ache, vomiting, loose motions, acidity',
    descriptionHi: 'पेट में मरोड़, तेज दर्द, उल्टी, दस्त, गैस या एसिडिटी',
    redFlagKeywords: ['blood in vomit', 'black stool', 'rigid abdomen', 'severe dehydration', 'खून की उल्टी', 'काला मल'],
    slots: [
      {
        key: 'duration',
        nameEn: 'Duration',
        nameHi: 'कितने समय से है',
        questionPromptEn: 'How long has your stomach been hurting or vomiting?',
        questionPromptHi: 'पेट में दर्द या उल्टी कब से हो रही है?',
        inputType: 'duration_chips',
        isRequired: true,
        options: [
          { id: 'few_hours', labelEn: 'A Few Hours', labelHi: 'कुछ घंटे', mapsToSlotValue: '< 6 hours' },
          { id: '1_day', labelEn: '1 Day', labelHi: '1 दिन', mapsToSlotValue: '1 day' },
          { id: '2_to_4_days', labelEn: '2 - 4 Days', labelHi: '2-4 दिन', mapsToSlotValue: '2-4 days' },
          { id: 'chronic', labelEn: 'Many Weeks / Recurring', labelHi: 'काफी हफ्तों से रुक-रुक कर', mapsToSlotValue: 'Chronic' },
        ],
      },
      {
        key: 'site',
        nameEn: 'Pain Location',
        nameHi: 'दर्द किस हिस्से में है',
        questionPromptEn: 'Where in the stomach is the pain most intense?',
        questionPromptHi: 'पेट के किस हिस्से में सबसे ज्यादा दर्द है?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'right_lower', labelEn: 'Right Lower Side (Appendix area)', labelHi: 'पेट के निचले दाएं हिस्से में', mapsToSlotValue: 'Right lower quadrant' },
          { id: 'upper_center', labelEn: 'Upper Center / Burning', labelHi: 'ऊपरी बीच के हिस्से में (जलन)', mapsToSlotValue: 'Epigastric' },
          { id: 'all_over', labelEn: 'All Over Stomach (Cramps)', labelHi: 'पूरे पेट में मरोड़', mapsToSlotValue: 'Generalized' },
          { id: 'lower_pelvic', labelEn: 'Lower Abdomen / Bladder', labelHi: 'निचले पेल्विक हिस्से में', mapsToSlotValue: 'Suprapubic / pelvic' },
        ],
      },
      {
        key: 'associated_symptoms',
        nameEn: 'Dangerous Symptoms',
        nameHi: 'साथ में खतरनाक लक्षण',
        questionPromptEn: 'Is there blood in vomit, black stool, or rigid hard belly?',
        questionPromptHi: 'क्या उल्टी में खून, काला शौच या पेट पत्थर जैसा कड़ा लग रहा है?',
        inputType: 'multi_tap',
        isRequired: true,
        options: [
          { id: 'blood_vomit', labelEn: 'Blood in Vomit (Red or Coffee-brown)', labelHi: 'उल्टी में खून आना', iconName: 'AlertTriangle', mapsToSlotValue: 'Hematemesis' },
          { id: 'black_stool', labelEn: 'Black Tar-like Stool or Blood', labelHi: 'शौच में खून या काला मल आना', iconName: 'AlertCircle', mapsToSlotValue: 'Melena / hematochezia' },
          { id: 'rigid_board', labelEn: 'Stomach is Hard as a Board / Cannot Touch', labelHi: 'पेट पत्थर जैसा कड़ा हो जाना', iconName: 'ShieldAlert', mapsToSlotValue: 'Rigid abdomen / peritonitis' },
          { id: 'watery_loose', labelEn: 'Watery Loose Stool (> 5 times)', labelHi: 'पानी जैसे पतले दस्त (> 5 बार)', iconName: 'Droplets', mapsToSlotValue: 'Severe loose motions' },
          { id: 'none', labelEn: 'None of these', labelHi: 'इनमें से कोई नहीं', iconName: 'Check', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'severity',
        nameEn: 'Severity',
        nameHi: 'दर्द का स्तर',
        questionPromptEn: 'Rate your stomach pain on 0-10 scale',
        questionPromptHi: 'पेट दर्द की तीव्रता 0 से 10 के बीच बताएं',
        inputType: 'severity_scale',
        isRequired: true,
      },
    ],
  },
  headache: {
    id: 'headache',
    titleEn: 'Headache / Neuro',
    titleHi: 'सिरदर्द / चक्कर / कमजोरी',
    icon: 'Brain',
    descriptionEn: 'Severe headache, migraine, one-sided weakness, vision changes',
    descriptionHi: 'तेज सिरदर्द, आधे सिर का दर्द, एक तरफ कमजोरी, धुंधला दिखना',
    redFlagKeywords: ['worst headache of life', 'facial droop', 'one-sided weakness', 'speech difficulty', 'लकवा', 'दौरा'],
    slots: [
      {
        key: 'character',
        nameEn: 'Onset & Severity',
        nameHi: 'शुरुआत कैसी हुई',
        questionPromptEn: 'Did this headache start suddenly like a thunderclap (worst of life)?',
        questionPromptHi: 'क्या यह अचानक बिजली कड़कने जैसे शुरू हुआ (जिंदगी का सबसे तेज सिरदर्द)?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'thunderclap', labelEn: 'Sudden "Worst Headache of My Life"', labelHi: 'अचानक जिंदगी का सबसे तेज असहनीय दर्द', iconName: 'Zap', mapsToSlotValue: 'Thunderclap / worst ever' },
          { id: 'one_sided_throbbing', labelEn: 'Throbbing on One Side (Migraine-like)', labelHi: 'आधे सिर में धड़कने जैसा दर्द', iconName: 'Activity', mapsToSlotValue: 'Throbbing hemicranial' },
          { id: 'band_like', labelEn: 'Tight Band Around Head', labelHi: 'माथे पर पट्टी बंधे जैसा भारीपन', iconName: 'Minus', mapsToSlotValue: 'Tension-type' },
        ],
      },
      {
        key: 'associated_symptoms',
        nameEn: 'Stroke / Neuro Signs',
        nameHi: 'लकवा या नसों से जुड़े लक्षण',
        questionPromptEn: 'Notice any face drooping, arm weakness, or slurred speech?',
        questionPromptHi: 'क्या चेहरे का टेढ़ापन, हाथ-पैर में कमजोरी या बोली लड़खड़ाना है?',
        inputType: 'multi_tap',
        isRequired: true,
        options: [
          { id: 'face_droop', labelEn: 'Face Drooping on One Side', labelHi: 'चेहरा एक तरफ झुकना / टेढ़ा होना', iconName: 'AlertTriangle', mapsToSlotValue: 'Facial droop' },
          { id: 'arm_weakness', labelEn: 'One Arm or Leg Weak / Numb', labelHi: 'एक हाथ या पैर सुन्न या कमजोर होना', iconName: 'ShieldAlert', mapsToSlotValue: 'Unilateral weakness' },
          { id: 'speech_slur', labelEn: 'Difficulty Speaking / Slurred Words', labelHi: 'बोलने में रुकावट या बोली लड़खड़ाना', iconName: 'MicOff', mapsToSlotValue: 'Slurred speech' },
          { id: 'vision_loss', labelEn: 'Sudden Vision Loss in One Eye', labelHi: 'अचानक एक आंख से दिखना बंद होना', iconName: 'EyeOff', mapsToSlotValue: 'Sudden vision loss' },
          { id: 'none', labelEn: 'None of these', labelHi: 'इनमें से कोई नहीं', iconName: 'Check', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'severity',
        nameEn: 'Severity',
        nameHi: 'तीव्रता',
        questionPromptEn: 'Rate the pain severity',
        questionPromptHi: 'दर्द का स्तर बताएं',
        inputType: 'severity_scale',
        isRequired: true,
      },
    ],
  },
  joint_back_pain: {
    id: 'joint_back_pain',
    titleEn: 'Joint / Back Pain',
    titleHi: 'जोड़ों या कमर का दर्द',
    icon: 'Activity',
    descriptionEn: 'Knee pain, stiffness, lower back pain, swelling',
    descriptionHi: 'घुटनों में दर्द, अकड़न, कमर दर्द, जोड़ों में सूजन',
    redFlagKeywords: ['urinary incontinence', 'numbness between legs', 'cauda equina', 'पेशाब छूट जाना'],
    slots: [
      {
        key: 'site',
        nameEn: 'Affected Joint / Area',
        nameHi: 'प्रभावित जोड़ या स्थान',
        questionPromptEn: 'Which joint or body part hurts most?',
        questionPromptHi: 'किस जोड़ या हिस्से में सबसे अधिक दर्द है?',
        inputType: 'single_tap',
        isRequired: true,
        options: [
          { id: 'knees', labelEn: 'Both Knees', labelHi: 'दोनों घुटने (Knees)', mapsToSlotValue: 'Bilateral knees' },
          { id: 'lower_back', labelEn: 'Lower Back / Spine', labelHi: 'कमर का निचला हिस्सा (Back)', mapsToSlotValue: 'Lower back' },
          { id: 'multiple_small', labelEn: 'Fingers & Small Joints (Morning stiffness)', labelHi: 'हाथों की उंगलियाँ और छोटे जोड़', mapsToSlotValue: 'Small joints of hands' },
          { id: 'shoulder_neck', labelEn: 'Neck or Shoulder', labelHi: 'कंधा या गर्दन', mapsToSlotValue: 'Cervical / shoulder' },
        ],
      },
      {
        key: 'duration',
        nameEn: 'Duration',
        nameHi: 'कितने समय से है',
        questionPromptEn: 'How long have you had this joint or back pain?',
        questionPromptHi: 'यह जोड़ों या कमर का दर्द कितने समय से है?',
        inputType: 'duration_chips',
        isRequired: true,
        options: [
          { id: 'few_days', labelEn: 'A Few Days', labelHi: 'कुछ दिन', mapsToSlotValue: 'A few days' },
          { id: 'months', labelEn: 'Few Months', labelHi: 'कुछ महीने', mapsToSlotValue: '3-6 months' },
          { id: 'years', labelEn: 'Over a Year (Long-standing)', labelHi: '1 साल से अधिक (पुराना)', mapsToSlotValue: '> 1 year' },
        ],
      },
      {
        key: 'associated_symptoms',
        nameEn: 'Red Flags for Spine / Joint',
        nameHi: 'विशेष लक्षण',
        questionPromptEn: 'Do you have loss of bladder control or fever with hot swollen joints?',
        questionPromptHi: 'क्या पेशाब पर नियंत्रण खोना या जोड़ में बहुत लालिमा व तेज बुखार है?',
        inputType: 'multi_tap',
        isRequired: true,
        options: [
          { id: 'bladder_control', labelEn: 'Loss of Urine or Stool Control (Numbness)', labelHi: 'पेशाब या शौच पर नियंत्रण न रहना / सुन्नपन', iconName: 'ShieldAlert', mapsToSlotValue: 'Cauda equina signs / incontinence' },
          { id: 'morning_stiffness', labelEn: 'Morning Stiffness > 1 hour', labelHi: 'सुबह 1 घंटे से ज्यादा अकड़न रहना', iconName: 'Clock', mapsToSlotValue: 'Morning stiffness > 1 hr' },
          { id: 'hot_swollen', labelEn: 'Single Hot, Red, Highly Swollen Joint', labelHi: 'एक जोड़ का बहुत गर्म, लाल और सूजा होना', iconName: 'AlertCircle', mapsToSlotValue: 'Septic arthritis signs' },
          { id: 'none', labelEn: 'None of these', labelHi: 'इनमें से कोई नहीं', iconName: 'Check', mapsToSlotValue: 'None' },
        ],
      },
      {
        key: 'severity',
        nameEn: 'Pain Scale',
        nameHi: 'दर्द का स्तर',
        questionPromptEn: 'Rate the pain severity',
        questionPromptHi: 'दर्द का स्तर बताएं',
        inputType: 'severity_scale',
        isRequired: true,
      },
    ],
  },
  other: {
    id: 'other',
    titleEn: 'Other Concern',
    titleHi: 'अन्य कोई समस्या',
    icon: 'PlusCircle',
    descriptionEn: 'Skin conditions, weakness, diabetes check, ear/nose, etc.',
    descriptionHi: 'त्वचा, कमजोरी, शुगर जांच, कान-नाक या अन्य समस्या',
    redFlagKeywords: ['poison', 'snake bite', 'suicide', 'self harm', 'poisoning', 'जहर', 'सांप'],
    slots: [
      {
        key: 'description',
        nameEn: 'Brief Description',
        nameHi: 'अपनी समस्या बताएं',
        questionPromptEn: 'Please speak or tap your main concern.',
        questionPromptHi: 'कृपया बोलकर या लिखकर अपनी मुख्य परेशानी बताएं।',
        inputType: 'free_speech',
        isRequired: true,
      },
      {
        key: 'duration',
        nameEn: 'Duration',
        nameHi: 'कब से है',
        questionPromptEn: 'How long has this been bothering you?',
        questionPromptHi: 'यह समस्या कब से है?',
        inputType: 'duration_chips',
        isRequired: true,
        options: [
          { id: 'recent', labelEn: 'Recently (Days)', labelHi: 'हाल में (कुछ दिन)', mapsToSlotValue: 'Recent days' },
          { id: 'weeks', labelEn: 'A Few Weeks', labelHi: 'कुछ हफ्ते', mapsToSlotValue: 'Few weeks' },
          { id: 'months', labelEn: 'Months or Years', labelHi: 'महीने या साल', mapsToSlotValue: 'Long standing' },
        ],
      },
    ],
  },
};

// General Past History Questions (asked after Chief Complaint)
export const GENERAL_HISTORY_SLOTS: OntologySlot[] = [
  {
    key: 'past_medical',
    nameEn: 'Known Conditions',
    nameHi: 'पहले से कोई बीमारी',
    questionPromptEn: 'Do you have any existing diagnosed conditions?',
    questionPromptHi: 'क्या आपको पहले से इनमें से कोई बीमारी है?',
    inputType: 'multi_tap',
    isRequired: false,
    options: [
      { id: 'diabetes', labelEn: 'Diabetes (Sugar)', labelHi: 'मधुमेह (शुगर)', iconName: 'Activity', mapsToSlotValue: 'Type 2 Diabetes Mellitus' },
      { id: 'hypertension', labelEn: 'High Blood Pressure (BP)', labelHi: 'उच्च रक्तचाप (BP)', iconName: 'Heart', mapsToSlotValue: 'Hypertension' },
      { id: 'heart_disease', labelEn: 'Heart Disease / Stent', labelHi: 'दिल की बीमारी / स्टेंट', iconName: 'HeartPulse', mapsToSlotValue: 'Coronary Artery Disease' },
      { id: 'asthma', labelEn: 'Asthma / Breathing Trouble', labelHi: 'अस्थमा / दमा', iconName: 'Wind', mapsToSlotValue: 'Bronchial Asthma' },
      { id: 'kidney_disease', labelEn: 'Kidney Problem', labelHi: 'गुर्दे (किडनी) की बीमारी', iconName: 'Shield', mapsToSlotValue: 'Chronic Kidney Disease' },
      { id: 'none', labelEn: 'No prior illness', labelHi: 'कोई पुरानी बीमारी नहीं', iconName: 'Check', mapsToSlotValue: 'No known prior illness' },
    ],
  },
  {
    key: 'allergies',
    nameEn: 'Drug Allergies',
    nameHi: 'दवाओं से एलर्जी',
    questionPromptEn: 'Are you allergic to any medicines or injections?',
    questionPromptHi: 'क्या आपको किसी दवा या इंजेक्शन से कोई एलर्जी होती है?',
    inputType: 'single_tap',
    isRequired: false,
    options: [
      { id: 'penicillin', labelEn: 'Yes: Penicillin / Amoxicillin', labelHi: 'हाँ: पेनिसिलिन / एमोक्सिसिलिन से', iconName: 'AlertTriangle', mapsToSlotValue: 'Penicillin allergy' },
      { id: 'sulfa', labelEn: 'Yes: Sulfa drugs', labelHi: 'हाँ: सल्फा दवाओं से', iconName: 'AlertTriangle', mapsToSlotValue: 'Sulfa allergy' },
      { id: 'painkillers', labelEn: 'Yes: Painkillers (Ibuprofen/NSAIDs)', labelHi: 'हाँ: दर्द की गोलियों से', iconName: 'AlertTriangle', mapsToSlotValue: 'NSAID allergy' },
      { id: 'no_allergies', labelEn: 'No Known Drug Allergies', labelHi: 'नहीं, किसी दवा से एलर्जी नहीं है', iconName: 'CheckCircle2', mapsToSlotValue: 'NKDA' },
    ],
  },
  {
    key: 'personal_habits',
    nameEn: 'Diet & Habits',
    nameHi: 'खानपान और आदतें',
    questionPromptEn: 'Do you consume tobacco, bidi or alcohol?',
    questionPromptHi: 'क्या आप बीड़ी, गुटखा, तंबाकू या शराब का सेवन करते हैं?',
    inputType: 'multi_tap',
    isRequired: false,
    options: [
      { id: 'tobacco_gutkha', labelEn: 'Tobacco / Gutkha chewing', labelHi: 'तंबाकू / गुटखा', mapsToSlotValue: 'Smokeless tobacco' },
      { id: 'smoking_bidi', labelEn: 'Smoking (Bidi / Cigarette)', labelHi: 'बीड़ी / सिगरेट पीना', mapsToSlotValue: 'Smoker' },
      { id: 'alcohol', labelEn: 'Alcohol consumption', labelHi: 'शराब का सेवन', mapsToSlotValue: 'Alcohol consumer' },
      { id: 'none', labelEn: 'None of these', labelHi: 'इनमें से कुछ नहीं', mapsToSlotValue: 'No toxic habits' },
    ],
  },
];

// AYUSH / Ayurveda Questionnaire Slots
export const AYUSH_QUESTIONNAIRE_ITEMS: {
  id: string;
  category: 'prakriti' | 'agni' | 'koshtha' | 'ahara_vihara';
  questionEn: string;
  questionHi: string;
  options: { id: string; dosha: 'vata' | 'pitta' | 'kapha' | 'neutral'; textEn: string; textHi: string }[];
}[] = [
  {
    id: 'body_frame',
    category: 'prakriti',
    questionEn: 'How would you describe your natural physical body build?',
    questionHi: 'आपकी स्वाभाविक शारीरिक बनावट कैसी है?',
    options: [
      { id: 'bf_v', dosha: 'vata', textEn: 'Thin, slender, bones prominent, hard to gain weight', textHi: 'दुबले-पतले, हड्डियाँ उभरी हुई, वजन मुश्किल से बढ़ता है' },
      { id: 'bf_p', dosha: 'pitta', textEn: 'Medium build, balanced weight, muscular', textHi: 'मध्यम बनावट, संतुलित वजन और मांसपेशियां' },
      { id: 'bf_k', dosha: 'kapha', textEn: 'Broad, heavy build, gains weight easily', textHi: 'मजबूत, चौड़ा ढांचा, वजन आसानी से बढ़ता है' },
    ],
  },
  {
    id: 'skin_nature',
    category: 'prakriti',
    questionEn: 'What is the natural texture of your skin?',
    questionHi: 'आपकी त्वचा का सामान्य स्वभाव कैसा रहता है?',
    options: [
      { id: 'sk_v', dosha: 'vata', textEn: 'Dry, rough, tends to crack easily in cold', textHi: 'रूखी, खुरदरी, ठंड में जल्दी फटने वाली' },
      { id: 'sk_p', dosha: 'pitta', textEn: 'Warm, reddish, prone to acne/moles/freckles', textHi: 'गर्म, लालिमा युक्त, तिल या मुंहासे जल्दी होते हैं' },
      { id: 'sk_k', dosha: 'kapha', textEn: 'Soft, moist, oily, smooth and thick', textHi: 'मुलायम, तैलीय (ऑयली), चमकदार और चिकनी' },
    ],
  },
  {
    id: 'appetite_agni',
    category: 'agni',
    questionEn: 'How is your hunger and digestion (Agni)?',
    questionHi: 'आपकी भूख और पाचन शक्ति (अग्नि) कैसी है?',
    options: [
      { id: 'ag_v', dosha: 'vata', textEn: 'Irregular: sometimes very hungry, sometimes none (Vishama)', textHi: 'अनियमित (विषमाग्नि): कभी बहुत भूख, कभी बिल्कुल नहीं' },
      { id: 'ag_p', dosha: 'pitta', textEn: 'Intense: cannot skip meals, gets irritable when hungry (Tikshna)', textHi: 'तीव्र (तीक्ष्णाग्नि): भूख बर्दाश्त नहीं होती, समय पर खाना चाहिए' },
      { id: 'ag_k', dosha: 'kapha', textEn: 'Slow: low hunger, digestion takes many hours (Manda)', textHi: 'मंद (मंदाग्नि): कम भूख, खाना देर से पचता है' },
    ],
  },
  {
    id: 'bowel_koshtha',
    category: 'koshtha',
    questionEn: 'How are your daily bowel movements (Koshtha)?',
    questionHi: 'पेट साफ होने की आदत (कोष्ठ) कैसी है?',
    options: [
      { id: 'ko_v', dosha: 'vata', textEn: 'Hard, constipated, dry stools (Krura Koshtha)', textHi: 'कब्जियत, सूखा मल, कठिनाई से साफ होना (क्रूर कोष्ठ)' },
      { id: 'ko_p', dosha: 'pitta', textEn: 'Soft, loose, easily clears with milk/fruits (Mridu Koshtha)', textHi: 'मुलायम, थोड़ा भी गरम खाने पर तुरंत साफ होना (मृदु कोष्ठ)' },
      { id: 'ko_k', dosha: 'kapha', textEn: 'Regular, heavy, once a day without trouble (Madhyama)', textHi: 'नियमित, सामान्य, दिन में एक बार (मध्यम कोष्ठ)' },
    ],
  },
  {
    id: 'weather_preference',
    category: 'prakriti',
    questionEn: 'Which weather causes you most discomfort?',
    questionHi: 'किस मौसम में आपको सबसे ज्यादा परेशानी होती है?',
    options: [
      { id: 'wp_v', dosha: 'vata', textEn: 'Cold, windy weather (craves warmth)', textHi: 'ठंड और तेज हवा में (गर्मी पसंद है)' },
      { id: 'wp_p', dosha: 'pitta', textEn: 'Hot summer, direct sunlight (craves cool)', textHi: 'तेज धूप और गर्मी में (ठंडक पसंद है)' },
      { id: 'wp_k', dosha: 'kapha', textEn: 'Cold and damp / rainy weather', textHi: 'सर्द और सीलन भरे / बारिश के मौसम में' },
    ],
  },
  {
    id: 'sleep_nidra',
    category: 'ahara_vihara',
    questionEn: 'How is your sleep pattern (Nidra)?',
    questionHi: 'आपकी नींद (निद्रा) कैसी रहती है?',
    options: [
      { id: 'sl_v', dosha: 'vata', textEn: 'Light, interrupted sleep, dreams of flying/moving', textHi: 'हल्की, बार-बार टूटने वाली नींद' },
      { id: 'sl_p', dosha: 'pitta', textEn: 'Moderate 6-7 hours, can wake up fresh, vivid dreams', textHi: 'मध्यम 6-7 घंटे की नींद, स्पष्ट सपने' },
      { id: 'sl_k', dosha: 'kapha', textEn: 'Deep, heavy, hard to wake up, excess daytime sleepiness', textHi: 'गहरी, भारी नींद, सुबह उठने में आलस' },
    ],
  },
];
