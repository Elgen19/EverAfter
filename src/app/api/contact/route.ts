import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "contacts"), {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error("Error saving contact message to Firestore:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save contact message." },
      { status: 500 }
    );
  }
}
