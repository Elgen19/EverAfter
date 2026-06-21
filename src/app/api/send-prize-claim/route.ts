import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, senderEmail, senderName, recipientName, prizeTitle, prizeDesc } = body;

    const emailSubject = `🏆 Grand Prize Claimed! ${recipientName || "your partner"} won the Love Quiz! 🎉`;
    
    // Plain Text Version (Sender Copy)
    let plainText = `Hi ${senderName || "there"},\n\n`;
    plainText += `Amazing news! ${recipientName || "your partner"} has successfully solved all questions in your Love Quiz and unlocked their Grand Prize! 🏆\n\n`;
    plainText += `Here is the prize they claimed:\n`;
    plainText += `  🎁 Prize: ${prizeTitle || "N/A"}\n`;
    plainText += `  📝 Description: ${prizeDesc || "N/A"}\n\n`;
    plainText += `Make sure to coordinate and deliver their well-deserved reward! 😉\n\n`;
    plainText += `EverAfter\nMade with love by Elgen for Faith\n`;

    // HTML Version (Sender Copy)
    const htmlContent = `
      <link href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap" rel="stylesheet">
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0913; color: #f3f1f6; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1.5px solid #bd9b62; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="text-align: center; border-bottom: 1px dashed rgba(226,184,87,0.3); padding-bottom: 20px; margin-bottom: 24px;">
          <span style="font-size: 32px;">🏆</span>
          <h1 style="color: #bd9b62; font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 38px; margin: 8px 0 0 0; font-weight: normal; letter-spacing: 1px;">EverAfter</h1>
          <p style="font-size: 10px; color: #a18aa6; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Prize Unlocked</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <p style="font-size: 15px; color: #f3f1f6; font-style: italic; line-height: 1.6; margin: 0;">
              🎉 Amazing news! <strong>${recipientName || "your partner"}</strong> has successfully answered all questions in your Love Quiz and unlocked their Grand Prize certificate!
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #a18aa6; width: 30%;">Claimant</td>
              <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${recipientName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a18aa6;">Prize Title</td>
              <td style="padding: 8px 0; color: #bd9b62; font-weight: bold; text-align: right;">🎁 ${prizeTitle || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a18aa6;">Description</td>
              <td style="padding: 8px 0; color: #ffffff; font-weight: normal; text-align: right; line-height: 1.4;">${prizeDesc || "N/A"}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; font-size: 13px; color: #a18aa6; margin-top: 16px;">
          Coordinate with them to deliver their romantic coupon! 🥰
        </div>
        
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 12px; color: #bd9b62;">
          <strong style="font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; font-weight: normal;">EverAfter</strong><br/>
          <span style="font-size: 11px; color: #a18aa6; display: block; margin-top: 4px;">Made with love by Elgen for Faith</span>
        </div>
      </div>
    `;

    // Send copy to sender notifying them of the won prize
    if (senderEmail) {
      await sendEmail({
        to: senderEmail,
        subject: emailSubject,
        text: plainText,
        html: htmlContent
      });
    }

    // Also send a copy to recipient confirming their claim
    if (recipientEmail) {
      const recipientSubject = `🎟️ Prize Claimed! Your Love Quiz Certificate is saved 💖`;
      let recPlainText = `Hi ${recipientName || "there"},\n\n`;
      recPlainText += `Congratulations on winning the quiz! Your reward certificate has been claimed. We have notified ${senderName || "your partner"} so they can prepare your prize!\n\n`;
      recPlainText += `Here is your prize coupon info:\n`;
      recPlainText += `  🎁 Prize: ${prizeTitle || "N/A"}\n`;
      recPlainText += `  📝 Description: ${prizeDesc || "N/A"}\n\n`;
      recPlainText += `EverAfter\n`;

      const recipientHtmlContent = `
        <link href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap" rel="stylesheet">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0913; color: #f3f1f6; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1.5px solid #bd9b62; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; border-bottom: 1px dashed rgba(226,184,87,0.3); padding-bottom: 20px; margin-bottom: 24px;">
            <span style="font-size: 32px;">🎟️</span>
            <h1 style="color: #bd9b62; font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 38px; margin: 8px 0 0 0; font-weight: normal; letter-spacing: 1px;">EverAfter</h1>
            <p style="font-size: 10px; color: #a18aa6; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Prize Certificate</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <p style="font-size: 15px; color: #f3f1f6; font-style: italic; line-height: 1.6; margin: 0;">
                💖 Congratulations! Your prize is registered. We have sent a notification email to <strong>${senderName || "your partner"}</strong> so they can get your reward ready!
              </p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #a18aa6; width: 30%;">Prize</td>
                <td style="padding: 8px 0; color: #bd9b62; font-weight: bold; text-align: right;">🎁 ${prizeTitle || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a18aa6;">Description</td>
                <td style="padding: 8px 0; color: #ffffff; font-weight: normal; text-align: right; line-height: 1.4;">${prizeDesc || "N/A"}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 12px; color: #bd9b62;">
             <strong style="font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; font-weight: normal;">EverAfter</strong><br/>
             <span style="font-size: 11px; color: #a18aa6; display: block; margin-top: 4px;">Made with love by Elgen for Faith</span>
          </div>
        </div>
      `;

      await sendEmail({
        to: recipientEmail,
        subject: recipientSubject,
        text: recPlainText,
        html: recipientHtmlContent
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send prize claim email:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
