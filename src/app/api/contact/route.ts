import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import { sendEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // 1. Save contact message to Firestore
    const docRef = await addDoc(collection(db, "contacts"), {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: Date.now(),
    });

    // 2. Dispatch Email to Company
    const companyEmail = process.env.COMPANY_EMAIL || "info@everafterletters.xyz";
    const emailSubject = `📬 New Whisper Received from ${name.trim()}`;

    // Plain text version
    let plainText = `You have received a new message through the "Leave a Whisper" contact form on EverAfter.\n\n`;
    plainText += `From: ${name.trim()} (${email.trim()})\n`;
    plainText += `Date: ${new Date().toLocaleString()}\n\n`;
    plainText += `Message:\n`;
    plainText += `--------------------------------------------------\n`;
    plainText += `${message.trim()}\n`;
    plainText += `--------------------------------------------------\n\n`;
    plainText += `EverAfter Team\n`;

    // HTML version
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0913; color: #f3f1f6; padding: 30px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1.5px solid #ff4b72; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
        <h2 style="color: #ff4b72; border-bottom: 1px solid rgba(255, 75, 114, 0.2); padding-bottom: 10px; margin-top: 0;">📬 New Whisper Received</h2>
        <p style="font-size: 14px; margin: 10px 0;"><strong>From:</strong> ${name.trim()} (<a href="mailto:${email.trim()}" style="color: #ff4b72; text-decoration: none;">${email.trim()}</a>)</p>
        <p style="font-size: 14px; margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 18px; border-radius: 8px; font-style: italic; white-space: pre-wrap; margin-top: 15px; font-size: 14px; line-height: 1.6; color: #f3f1f6;">
          ${message.trim()}
        </div>
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 15px; font-size: 11px; color: #bd9b62;">
          <strong>EverAfter Suite</strong> • Sent via Contact Whisper Form
        </div>
      </div>
    `;

    await sendEmail({
      to: companyEmail,
      subject: emailSubject,
      text: plainText,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error("Error saving contact message or sending email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save contact message." },
      { status: 500 }
    );
  }
}
