export interface PolaroidItem {
  imageUrl?: string;
  caption?: string;
  backText?: string;
}

export interface LetterData {
  recipient: string;
  sender: string;
  title: string;
  content: string;
  theme: string;
  sealSymbol: string;
  sealColor: string;
  music: boolean;
  timestamp: number;

  polaroids?: {
    enabled: boolean;
    items: PolaroidItem[];
    layout?: "stack" | "collage";
    collageStyle?: "simple" | "forever" | "sunset";
    collageBgPosition?: "top" | "center" | "bottom";
    collageBgZoom?: number;
    title?: string;
    showHearts?: boolean;
  };
  mailboxTheme?: {
    enabled: boolean;
    customBgUrl?: string;
    musicUrl?: string;
    musicAutoplay?: boolean;
    statement?: string;
  };
  email?: string;
  backdrop?: string;
  audioMessage?: {
    enabled: boolean;
    audioUrl?: string;
    customMessage?: string;
  };
  musicType?: "synth" | "url";
  musicUrl?: string;
  sendLaterDate?: string;
  greeting?: string;
  farewell?: string;
  security?: {
    enabled: boolean;
    type: "date" | "boolean" | "choice";
    question: string;
    answer: string;
    choices?: string[];
  };
  intro?: {
    enabled: boolean;
    text: string;
    animation: "typewriter" | "fade-float" | "pulse";
  };
  closing?: {
    enabled: boolean;
    text: string;
    animation: "typewriter" | "fade-float" | "pulse";
  };
  survey?: {
    enabled: boolean;
    type: "emoji" | "text" | "both";
    question: string;
  };
  dateInvite?: {
    enabled: boolean;
    question: string;
    activity?: string;
    dateTime?: string;
    date?: string;
    time?: string;
    place?: string;
    mapLink?: string;
    email?: string;
  };
  loveQuiz?: {
    enabled: boolean;
    prizeTitle: string;
    prizeDesc: string;
    gameOverMsg?: string;
    strictness?: "restart" | "hearts";
    questions: {
      question: string;
      correctAnswer: string;
      incorrectAnswers: string[];
      hint?: string;
    }[];
  };
  stepOrder?: string[];
  envelopeStyle?: string;
}

export function encodeLetterData(data: LetterData): string {
  try {
    const jsonStr = JSON.stringify(data);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    const binString = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (err) {
    console.error("Encoding error:", err);
    return "";
  }
}

export function decodeLetterData(base64: string): LetterData | null {
  try {
    let standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    while (standardBase64.length % 4) {
      standardBase64 += "=";
    }
    const binString = atob(standardBase64);
    const utf8Bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(utf8Bytes);
    return JSON.parse(jsonStr) as LetterData;
  } catch (err) {
    console.error("Decoding error:", err);
    return null;
  }
}
