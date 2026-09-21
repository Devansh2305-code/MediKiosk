import { LanguageCode } from '../types';

export interface TTSOptions {
  text: string;
  language: LanguageCode;
  promptKey?: string;
  rate?: number; // 0.8 to 1.2
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export interface TTSProvider {
  speak(options: TTSOptions): Promise<void>;
  stop(): void;
  isAvailable(): boolean;
  name: string;
}

const TTS_LOCALE_MAP: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
};

export class BrowserTTSProvider implements TTSProvider {
  name = 'Web SpeechSynthesis TTS';
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  async speak(options: TTSOptions): Promise<void> {
    this.stop();

    if (!this.isAvailable()) {
      options.onError?.('Speech synthesis not supported in this browser.');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.lang = TTS_LOCALE_MAP[options.language] || 'hi-IN';
      utterance.rate = options.rate || 0.95; // Slightly slower for clear hospital comprehension
      utterance.pitch = 1.0;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetLang = TTS_LOCALE_MAP[options.language];
      const match = voices.find((v) => v.lang.startsWith(targetLang) || v.lang.startsWith(options.language));
      if (match) {
        utterance.voice = match;
      }

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        options.onError?.(e.error || 'TTS error');
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      options.onError?.(err.message || 'TTS playback failed');
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }
}

// Bhashini / AI4Bharat IndicTTS stub
export class BhashiniTTSStub implements TTSProvider {
  name = 'Bhashini / AI4Bharat IndicTTS (Documented Stub)';

  isAvailable(): boolean {
    return false;
  }

  async speak(options: TTSOptions): Promise<void> {
    options.onError?.('Bhashini TTS requires pipeline credentials. Falling back to browser SpeechSynthesis.');
  }

  stop(): void {}
}

export const ttsService = new BrowserTTSProvider();

export class WebSpeechTTS {
  speak(text: string, options?: { language?: LanguageCode; rate?: number }): void {
    ttsService.speak({
      text,
      language: options?.language || 'hi',
      rate: options?.rate || 1.0,
    });
  }

  cancel(): void {
    ttsService.stop();
  }
}
