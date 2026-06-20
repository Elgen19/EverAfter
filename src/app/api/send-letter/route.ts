import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, letterLink, senderName, recipientName, title } = body;

    // Validate letterLink origin to prevent open email relay spam/phishing abuse
    if (letterLink) {
      try {
        const parsedLink = new URL(letterLink);
        const requestUrl = new URL(request.url);
        
        if (parsedLink.hostname !== requestUrl.hostname) {
          return NextResponse.json(
            { success: false, error: "Forbidden: letterLink hostname must match origin server hostname." },
            { status: 400 }
          );
        }
        
        if (parsedLink.pathname !== "/letter") {
          return NextResponse.json(
            { success: false, error: "Forbidden: letterLink pathname must be exactly /letter." },
            { status: 400 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, error: "Invalid URL provided for letterLink." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Missing letterLink parameter." },
        { status: 400 }
      );
    }

    const emailSubject = `💌 Sealed with a Kiss: A secret message from ${senderName || "your partner"} is waiting...`;

    // Plain Text Version
    let plainText = `Hi ${recipientName || "there"},\n\n`;
    plainText += `Some feelings are too precious to be kept in silence. ${senderName || "Someone special"} has written and sealed a special digital message for you.\n\n`;
    plainText += `"Every beat of my heart is written in these lines, waiting just for you. Let this message bring a smile to your face and warmth to your soul."\n\n`;
    plainText += `You can unlock, read, and experience it by visiting this link:\n`;
    plainText += `🔗 ${letterLink}\n\n`;
    plainText += `EverAfter\nMade with love by Elgen for Faith\n`;

    // HTML Version
    const htmlContent = `
      <link href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap" rel="stylesheet">
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0913; color: #f3f1f6; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1.5px solid #ff4b72; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">💌</div>
        <h1 style="color: #ff4b72; font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 38px; margin: 0 0 12px 0; font-weight: normal; letter-spacing: 1px;">EverAfter</h1>
        
        <p style="font-size: 15px; color: #f3f1f6; line-height: 1.6; margin-bottom: 20px;">
          Hi <strong>${recipientName || "there"}</strong>,<br/><br/>
          Some feelings are too precious to be kept in silence. <strong>${senderName || "Someone special"}</strong> has written and sealed a special digital message for you.
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 18px; margin: 24px 0; font-style: italic; color: #a18aa6; font-size: 14px; line-height: 1.5; text-align: center;">
          "Every beat of my heart is written in these lines, waiting just for you. Let this message bring a smile to your face and warmth to your soul."
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${letterLink}" target="_blank" style="display: inline-block; padding: 14px 32px; border-radius: 30px; background: #ff4b72; backgroundImage: linear-gradient(135deg, #ff4b72, #d9264c); color: #ffffff; font-size: 15px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 15px rgba(255, 75, 114, 0.4); text-transform: uppercase; letter-spacing: 1px;">
            ❤️ Open Your Letter
          </a>
        </div>
        
        <p style="font-size: 12px; color: #a18aa6; line-height: 1.6; margin-bottom: 0;">
          If the button doesn't work, copy and paste this link in your browser:<br/>
          <a href="${letterLink}" target="_blank" style="color: #bd9b62; text-decoration: underline;">${letterLink}</a>
        </p>
        
        <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 12px; color: #bd9b62;">
          <strong style="font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; font-weight: normal;">EverAfter</strong><br/>
          <span style="font-size: 11px; color: #a18aa6; display: block; margin-top: 4px;">Made with love by Elgen for Faith</span>
        </div>
      </div>
    `;

    await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      text: plainText,
      html: htmlContent
    });

    return NextResponse.json({
      success: true,
      message: `Letter invite confirmation simulated and sent to ${recipientEmail || "recipient"}`
    });
  } catch (error) {
    console.error("Error simulating Letter invite dispatch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Letter invite request." },
      { status: 500 }
    );
  }
}
