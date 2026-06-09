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

  // New optional customizations
  email?: string;
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
  stepOrder?: string[];
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
