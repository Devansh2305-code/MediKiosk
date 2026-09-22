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

interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  greeting: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  borderHover: string;
}

const LANGUAGES: LanguageMeta[] = [
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    greeting: 'नमस्ते! कृपया अपनी भाषा चुनें।',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: '🇮🇳 भारत',
    accentColor: 'from-amber-500/15 via-orange-500/10 to-transparent',
    borderHover: 'hover:border-amber-400',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'Indian English',
    greeting: 'Welcome! Please select your language to begin.',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    badgeText: 'Common',
    accentColor: 'from-sky-500/15 via-blue-500/10 to-transparent',
    borderHover: 'hover:border-sky-400',
  },
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    greeting: 'नमस्कार! कृपया आपली भाषा निवडा.',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    badgeText: 'महाराष्ट्र',
    accentColor: 'from-orange-500/15 via-amber-500/10 to-transparent',
    borderHover: 'hover:border-orange-400',
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    greeting: 'வணக்கம்! தயவுசெய்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    badgeText: 'தமிழ்நாடு',
    accentColor: 'from-rose-500/15 via-red-500/10 to-transparent',
    borderHover: 'hover:border-rose-400',
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    greeting: 'নমস্কার! অনুগ্রহ করে আপনার ভাষা নির্বাচন করুন।',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    badgeText: 'পশ্চিমবঙ্গ',
    accentColor: 'from-teal-500/15 via-emerald-500/10 to-transparent',
    borderHover: 'hover:border-teal-400',
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    greeting: 'నమస్కారం! దయచేసి మీ భాషను ఎంచుకోండి.',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'తెలుగు',
    accentColor: 'from-emerald-500/15 via-teal-500/10 to-transparent',
    borderHover: 'hover:border-emerald-400',
  },
  {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    greeting: 'નમસ્તે! કૃપા કરીને તમારી ભાષા પસંદ કરો.',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    badgeText: 'ગુજરાત',
    accentColor: 'from-yellow-500/15 via-amber-500/10 to-transparent',
    borderHover: 'hover:border-yellow-400',
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    greeting: 'ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    badgeText: 'ಕರ್ನಾಟಕ',
    accentColor: 'from-indigo-500/15 via-purple-500/10 to-transparent',
    borderHover: 'hover:border-indigo-400',
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    greeting: 'നമസ്കാരം! ദയവായി നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക.',
    badgeBg: 'bg-green-100 text-green-900 border-green-300',
    badgeText: 'കേരളം',
    accentColor: 'from-green-500/15 via-emerald-500/10 to-transparent',
    borderHover: 'hover:border-green-400',
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
      className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[76vh]"
    >
      {/* Welcome Banner with National Health Portal Identity */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-50 via-white to-emerald-50 border border-slate-200 shadow-xs text-xs font-bold text-slate-700 mb-4">
          <span className="text-base">🇮🇳</span>
          <span>Ayushman Bharat Digital Mission • Multilingual Kiosk</span>
        </div>
        <h1
          id="lang-title"
          className={`text-3xl md:text-5xl font-black tracking-tight mb-3 ${
            highContrast ? 'text-yellow-300' : 'text-slate-900'
          }`}
        >
          {t.selectLanguage}
        </h1>
        <p className={`text-base md:text-lg font-medium ${highContrast ? 'text-yellow-200' : 'text-slate-600'}`}>
          {t.selectLanguageSubtitle} • <span className="font-semibold text-sky-700">Tap your language or listen below</span>
        </p>
      </div>

      {/* Grid of 9 Colorful Language Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;

          return (
            <div
              key={lang.code}
              id={`lang-card-${lang.code}`}
              onClick={() => onSelectLanguage(lang.code)}
              className={`relative flex items-center justify-between p-5 rounded-3xl border-2 cursor-pointer transition-all duration-200 min-h-[96px] shadow-sm select-none active:scale-[0.98] overflow-hidden ${
                isSelected
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 ring-4 ring-yellow-200'
                    : 'bg-white text-slate-900 border-sky-600 ring-4 ring-sky-200/80 shadow-lg shadow-sky-500/15 scale-[1.02]'
                  : highContrast
                  ? 'bg-zinc-900 text-yellow-300 border-zinc-700 hover:border-yellow-400'
                  : `bg-white/90 text-slate-800 border-slate-200/90 ${lang.borderHover} hover:shadow-md hover:bg-white`
              }`}
            >
              {/* Subtle Ambient Background Gradient on Active/Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${lang.accentColor} pointer-events-none transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-30'
                }`}
              />

              <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${lang.badgeBg}`}>
                    {lang.badgeText}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white flex items-center gap-0.5 shadow-xs">
                      ✓ Active
                    </span>
                  )}
                </div>
                <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  {lang.nativeName}
                </span>
                <span className={`text-xs font-bold ${isSelected ? 'text-sky-700' : 'text-slate-500'}`}>
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
                title={`Listen preview in ${lang.englishName}`}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 relative z-10 shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/30 ring-2 ring-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 border border-slate-200'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Reassuring footer note */}
      <div className="mt-8 text-center text-xs sm:text-sm font-semibold text-slate-500 max-w-md bg-white/70 px-4 py-2 rounded-full border border-slate-200 shadow-xs flex items-center justify-center gap-2">
        <span className="text-base">🌐</span>
        <span>Voice questions & documents will automatically adapt to your selection.</span>
      </div>
    </div>
  );
};
