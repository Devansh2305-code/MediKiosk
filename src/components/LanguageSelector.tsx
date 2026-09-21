import React from 'react';
import { Volume2 } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import { LanguageCode } from '../types';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onPreviewSpeak: (lang: LanguageCode) => void;
  highContrast: boolean;
}

const LANGUAGES: {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  greeting: string;
  scriptFontClass?: string;
}[] = [
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    greeting: 'नमस्ते! कृपया अपनी भाषा चुनें।',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'Indian English',
    greeting: 'Welcome! Please select your language to begin.',
  },
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    greeting: 'नमस्कार! कृपया आपली भाषा निवडा.',
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    greeting: 'வணக்கம்! தயவுசெய்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.',
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    greeting: 'নমস্কার! অনুগ্রহ করে আপনার ভাষা নির্বাচন করুন।',
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    greeting: 'నమస్కారం! దయచేసి మీ భాషను ఎంచుకోండి.',
  },
  {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    greeting: 'નમસ્તે! કૃપા કરીને તમારી ભાષા પસંદ કરો.',
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    greeting: 'ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    greeting: 'നമസ്കാരം! ദയവായി നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക.',
  },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  onPreviewSpeak,
  highContrast,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <div
      id="kiosk-language-selector"
      className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[72vh]"
    >
      {/* Welcome Heading with Large Touch-Friendly Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 text-3xl mb-4 shadow-sm">
          🇮🇳
        </div>
        <h1
          id="lang-title"
          className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-3 ${
            highContrast ? 'text-yellow-300' : 'text-slate-900'
          }`}
        >
          {t.selectLanguage}
        </h1>
        <p className={`text-lg md:text-xl font-medium ${highContrast ? 'text-yellow-200' : 'text-slate-600'}`}>
          {t.selectLanguageSubtitle}
        </p>
      </div>

      {/* Grid of 9 Native Language Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;

          return (
            <div
              key={lang.code}
              id={`lang-card-${lang.code}`}
              onClick={() => onSelectLanguage(lang.code)}
              className={`relative flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-150 min-h-[84px] shadow-sm select-none active:scale-[0.98] ${
                isSelected
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-200'
                    : 'bg-sky-50 text-sky-950 border-sky-600 ring-4 ring-sky-100 shadow-md'
                  : highContrast
                  ? 'bg-zinc-900 text-yellow-300 border-zinc-700 hover:border-yellow-400'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-sky-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight">{lang.nativeName}</span>
                <span className={`text-sm font-semibold ${isSelected ? 'text-sky-700' : 'text-slate-500'}`}>
                  {lang.englishName}
                </span>
              </div>

              {/* Speaker Preview Button */}
              <button
                id={`btn-speaker-${lang.code}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewSpeak(lang.code);
                }}
                title={`Listen in ${lang.englishName}`}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                  isSelected
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Reassuring footer note */}
      <div className="mt-8 text-center text-sm font-medium text-slate-500 max-w-md">
        <span>🌐 </span>
        <span>All clinical history and document scanning will be conducted in your selected language.</span>
      </div>
    </div>
  );
};
