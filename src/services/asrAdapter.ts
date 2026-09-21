import { LanguageCode } from '../types';

export interface ASROptions {
  language: LanguageCode;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStateChange: (state: 'idle' | 'listening' | 'processing') => void;
}

export interface ASRProvider {
  start(options: ASROptions): Promise<void>;
  stop(): void;
  isAvailable(): boolean;
  name: string;
}

const LANGUAGE_LOCALE_MAP: Record<LanguageCode, string> = {
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

// 1. WebSpeechASR (Browser standard SpeechRecognition)
export class WebSpeechASR implements ASRProvider {
  name = 'WebSpeechASR (Browser native)';
  private recognition: any = null;
  private isListening = false;

  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  async start(options: ASROptions): Promise<void> {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      options.onError('Browser SpeechRecognition not supported on this browser. Use ScriptedASR or keyboard input.');
      return;
    }

    try {
      this.stop();
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = LANGUAGE_LOCALE_MAP[options.language] || 'hi-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
        options.onStateChange('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        options.onResult(currentText, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        options.onStateChange('idle');
        options.onError(event.error || 'Microphone capture error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onStateChange('idle');
      };

      this.recognition.start();
    } catch (err: any) {
      options.onStateChange('idle');
      options.onError(err.message || 'Failed to start speech recognition');
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Safe stop
      }
    }
    this.isListening = false;
  }
}

// 2. ScriptedASR (Demo mode for noisy hackathon halls)
export class ScriptedASR implements ASRProvider {
  name = 'ScriptedASR (Deterministic Demo)';
  private scriptedUtterance = '';

  setScriptedUtterance(text: string): void {
    this.scriptedUtterance = text;
  }

  isAvailable(): boolean {
    return true;
  }

  async start(options: ASROptions): Promise<void> {
    options.onStateChange('listening');
    await new Promise((r) => setTimeout(r, 600));
    options.onStateChange('processing');
    const text = this.scriptedUtterance || 'मुझे दो दिन से सीने में दर्द है और सांस फूल रही है';
    options.onResult(text, true);
    options.onStateChange('idle');
  }

  stop(): void {}
}

// 3. Documented Stub for Bhashini / AI4Bharat Indic ASR
// MOCK: In production, audio PCM buffer is streamed to Bhashini API (ULCA / Dhruva endpoint)
export class BhashiniASRStub implements ASRProvider {
  name = 'Bhashini / AI4Bharat IndicConformer (Documented Stub)';

  isAvailable(): boolean {
    return false; // Stub
  }

  async start(options: ASROptions): Promise<void> {
    options.onError('Bhashini API endpoint requires MeitY Bhashini API Key and pipeline ID. Falling back to WebSpeechASR.');
  }

  stop(): void {}
}
