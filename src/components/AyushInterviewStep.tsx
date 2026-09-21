import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flower2,
  Info,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AYUSH_QUESTIONNAIRE_ITEMS } from '../ontology/clinicalOntology';
import { TRANSLATIONS } from '../i18n/translations';
import { AyushAssessment, LanguageCode } from '../types';

interface AyushInterviewStepProps {
  language: LanguageCode;
  onComplete: (assessment: AyushAssessment) => void;
  onSpeak: (text: string) => void;
  highContrast: boolean;
}

export const AyushInterviewStep: React.FC<AyushInterviewStepProps> = ({
  language,
  onComplete,
  onSpeak,
  highContrast,
}) => {
  const isHindi = language === 'hi';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; dosha: string }>>({});

  const currentQ = AYUSH_QUESTIONNAIRE_ITEMS[currentQuestionIndex];

  const handleSelectOption = (option: { id: string; dosha: string; textEn: string; textHi: string }) => {
    const updated = {
      ...answers,
      [currentQ.id]: {
        value: option.id,
        dosha: option.dosha,
      },
    };
    setAnswers(updated);

    if (currentQuestionIndex < AYUSH_QUESTIONNAIRE_ITEMS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      const nextQ = AYUSH_QUESTIONNAIRE_ITEMS[currentQuestionIndex + 1];
      onSpeak(isHindi ? nextQ.questionHi : nextQ.questionEn);
    } else {
      // Calculate dosha score
      let vata = 0;
      let pitta = 0;
      let kapha = 0;

      Object.values(updated).forEach((ans: { value: string; dosha: string }) => {
        if (ans.dosha === 'vata') vata++;
        else if (ans.dosha === 'pitta') pitta++;
        else if (ans.dosha === 'kapha') kapha++;
      });

      let dominantPrakriti = 'Tridoshic (Vata-Pitta-Kapha)';
      if (vata > pitta && vata > kapha) dominantPrakriti = 'Vata Dominant (वातज प्रकृति)';
      else if (pitta > vata && pitta > kapha) dominantPrakriti = 'Pitta Dominant (पित्तज प्रकृति)';
      else if (kapha > vata && kapha > pitta) dominantPrakriti = 'Kapha Dominant (कफज प्रकृति)';
      else if (vata === pitta && vata > kapha) dominantPrakriti = 'Vata-Pitta (द्वन्द्वज वात-पित्त)';
      else if (pitta === kapha && pitta > vata) dominantPrakriti = 'Pitta-Kapha (द्वन्द्वज पित्त-कफ)';

      const agniChoice = updated.appetite_agni?.value;
      const agniType: 'Sama' | 'Vishama' | 'Tikshna' | 'Manda' | 'Unspecified' =
        agniChoice === 'ag_p' ? 'Tikshna' : agniChoice === 'ag_k' ? 'Manda' : agniChoice === 'ag_v' ? 'Vishama' : 'Sama';

      const koshthaChoice = updated.bowel_koshtha?.value;
      const koshthaType: 'Mridu' | 'Madhyama' | 'Krura' | 'Unspecified' =
        koshthaChoice === 'ko_v' ? 'Krura' : koshthaChoice === 'ko_p' ? 'Mridu' : 'Madhyama';

      const finalAssessment: AyushAssessment = {
        isAyushMode: true,
        department: 'Kayachikitsa & Panchakarma',
        prakritiScores: {
          vata,
          pitta,
          kapha,
          dominantPrakriti,
        },
        prakritiSelfReported: Object.fromEntries(
          Object.entries(updated).map(([k, v]) => [k, v.value])
        ),
        vikritiSymptoms: ['Joint stiffness', 'Heavy post-meal fullness'],
        agniType,
        koshthaType,
        aharaViharaNotes: 'Self-reported Dashavidha baseline: Agni, Koshtha and basic Prakriti.',
        nidraPattern: 'Moderate, occasionally disturbed',
        vyayamaShakti: 'Madhyama',
        sattvaStrength: 'Madhyama',
        ashtavidhaStatus: 'pending_vaidya_examination',
      };

      onComplete(finalAssessment);
    }
  };

  return (
    <div id="step-ayush-intake" className="max-w-3xl mx-auto px-4 py-8">
      {/* Notice Banner: Ashtavidha Pariksha Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 mb-6 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="text-xs md:text-sm text-amber-950 font-medium">
          <span className="font-extrabold block text-amber-900 mb-0.5">
            {isHindi ? 'आयुष / आयुर्वेद ओपीडी - दशविध एवं प्रकृति प्राथमिक मूल्यांकन' : 'AYUSH / Ayurveda OPD - Dashavidha & Prakriti Triage'}
          </span>
          {isHindi
            ? 'यह प्रारंभिक जानकारी आपकी प्रकृति और अग्नि को समझने के लिए है। नाड़ी परीक्षा (अष्टविध परीक्षा) डॉक्टर/वैद्य द्वारा परामर्श कक्ष में ही की जाएगी।'
            : 'This self-reported baseline captures Prakriti, Agni, and Koshtha. Physical Ashtavidha examination (Nadi, Mutra, Mala, Jihva) is conducted in-person by the Vaidya.'}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500">
          {isHindi ? 'प्रश्न' : 'Question'} {currentQuestionIndex + 1} of {AYUSH_QUESTIONNAIRE_ITEMS.length}
        </span>
        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / AYUSH_QUESTIONNAIRE_ITEMS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-4">
          <Flower2 className="w-3.5 h-3.5" />
          <span>{currentQ.category.toUpperCase()}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-snug">
          {isHindi ? currentQ.questionHi : currentQ.questionEn}
        </h2>

        <button
          onClick={() => onSpeak(isHindi ? currentQ.questionHi : currentQ.questionEn)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 text-xs font-bold transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>{isHindi ? 'प्रश्न दोबारा सुनें' : 'Listen Question'}</span>
        </button>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQ.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option)}
            className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 shadow-sm transition-all flex items-center justify-between text-left group active:scale-[0.99]"
          >
            <div>
              <div className="text-base md:text-lg font-extrabold text-slate-900 group-hover:text-emerald-950">
                {isHindi ? option.textHi : option.textEn}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">
                {isHindi ? option.textEn : option.textHi}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-3" />
          </button>
        ))}
      </div>
    </div>
  );
};
