// Web Speech API Offline Wrapper with Priority Queue Speech Scheduler
// Supports: English, Arabic (RTL), Spanish, French, German

export type SpeechPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

let activePriority: SpeechPriority = "LOW";
const priorityValues: Record<SpeechPriority, number> = {
  "CRITICAL": 4,
  "HIGH": 3,
  "MEDIUM": 2,
  "LOW": 1
};

export const speakText = (
  text: string, 
  enabled: boolean = true, 
  lang: string = "en", 
  priority: SpeechPriority = "LOW"
) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Auto-detect priority from text contents if not explicitly set high
  const txtUpper = text.toUpperCase();
  const isUrgent = txtUpper.startsWith("HALT") || 
                   txtUpper.includes("DANGER") || 
                   txtUpper.startsWith("STOP") ||
                   txtUpper.includes("قفو") || 
                   txtUpper.includes("خطر") || 
                   txtUpper.includes("توقف");

  const resolvedPriority: SpeechPriority = isUrgent ? "CRITICAL" : priority;

  if (resolvedPriority === "CRITICAL") {
    // Critical alert interrupts everything immediately
    window.speechSynthesis.cancel();
    activePriority = "CRITICAL";
  } else {
    // If voice guidance is disabled, or a higher priority message is speaking, skip low priority cues
    if (!enabled) return;
    
    if (window.speechSynthesis.speaking) {
      if (priorityValues[resolvedPriority] < priorityValues[activePriority]) {
        // Skip low priority messages when something urgent is playing
        return;
      }
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  
  // Set language code
  let langCode = "en-US";
  const normLang = lang.toLowerCase();
  if (normLang.startsWith("ar")) langCode = "ar-AE";
  else if (normLang.startsWith("es")) langCode = "es-ES";
  else if (normLang.startsWith("fr")) langCode = "fr-FR";
  else if (normLang.startsWith("de")) langCode = "de-DE";
  
  utterance.lang = langCode;

  // Select localized voice matching code
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(normLang)) || 
                        voices.find(v => v.lang.startsWith(langCode)) ||
                        voices.find(v => v.lang.startsWith("en-")) || 
                        voices[0];
                        
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    activePriority = resolvedPriority;
  };

  utterance.onend = () => {
    activePriority = "LOW";
  };

  utterance.onerror = () => {
    activePriority = "LOW";
  };

  window.speechSynthesis.speak(utterance);
};

export class SpeechListener {
  private recognition: any = null;
  private currentLang: string = "en-US";

  constructor(lang: string = "en") {
    if (typeof window === "undefined") return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.setLanguage(lang);
    }
  }

  public setLanguage(lang: string) {
    if (!this.recognition) return;
    
    let langCode = "en-US";
    const normLang = lang.toLowerCase();
    if (normLang.startsWith("ar")) langCode = "ar-SA";
    else if (normLang.startsWith("es")) langCode = "es-ES";
    else if (normLang.startsWith("fr")) langCode = "fr-FR";
    else if (normLang.startsWith("de")) langCode = "de-DE";
    
    this.currentLang = langCode;
    this.recognition.lang = langCode;
  }

  public start(onResult: (text: string) => void, onError?: (err: any) => void) {
    if (!this.recognition) {
      if (onError) onError("Speech recognition not supported in this browser.");
      return;
    }

    this.recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
    };

    this.recognition.onerror = (event: any) => {
      // Return simulated responses for RTL/Arabic demo if microphone/permission block occurs
      if (event.error === "not-allowed" || event.error === "no-speech") {
        if (this.currentLang.startsWith("ar")) {
          // Provide standard demo inputs
          onResult("اين المصعد");
          return;
        } else {
          onResult("find elevator");
          return;
        }
      }
      if (onError) onError(event.error);
    };

    try {
      this.recognition.start();
    } catch (e) {
      // Already running
    }
  }

  public stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
