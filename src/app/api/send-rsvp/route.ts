import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/email";

function buildGoogleCalendarUrl(senderName: string, date: string, time: string, place: string, notes: string) {
  if (!date || !time) return "";
  try {
    const [yr, mo, dy] = date.split("-").map(Number);
    const [hr, mn] = time.split(":").map(Number);
    const startDate = new Date(yr, mo - 1, dy, hr, mn);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const formatGCalDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const s = "00";
      return `${y}${m}${day}T${h}${min}${s}`;
    };

    const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
    const text = encodeURIComponent(`🌹 Date with ${senderName || "my love"} 🌹`);
    const dates = encodeURIComponent(datesParam);
    const details = encodeURIComponent(
      `Looking forward to our romantic date! 🥰\n\nNotes from RSVP: ${notes || "None"}\n\nGenerated via Digital Love Letter.`
    );
    const locationParam = encodeURIComponent(place || "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${locationParam}`;
  } catch (err) {
    console.error("Error building GCal URL:", err);
    return "";
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, senderEmail, senderName, recipientName, date, time, place, mapLink, accepted, notes } = body;

    if (!accepted) {
      return NextResponse.json({
        success: true,
        message: "RSVP declined. Email dispatch skipped per configuration."
      });
    }

    const gcalUrl = accepted ? buildGoogleCalendarUrl(senderName, date, time, place, notes) : "";

    const emailSubject = accepted 
      ? `✨ It's a Date! RSVP Confirmed with ${senderName || "your partner"} 🌹`
      : `💔 RSVP Update: Date Invitation with ${senderName || "your partner"}`;
    
    // Plain Text Version (Receiver Copy)
    let plainText = `Hi ${recipientName || "there"},\n\n`;
    plainText += `💖 A beautiful promise is sealed! You have confirmed a romantic date with ${senderName || "your partner"}. Let the anticipation of sweet memories warm your heart.\n\n`;
    plainText += `Here are the details of your upcoming date:\n`;
    plainText += `  📅 Date: ${date || "N/A"}\n`;
    plainText += `  ⏰ Time: ${time || "N/A"}\n`;
    plainText += `  📍 Place: ${place || "N/A"}\n`;
    if (mapLink) {
      plainText += `  🗺️ Location Link: ${mapLink}\n`;
    }
    plainText += `  💌 RSVP Status: ${accepted ? "Accepted! 🥰" : "Declined 💔"}\n`;
    if (notes) {
      plainText += `  ✍️ Your Notes: "${notes}"\n`;
    }
    if (gcalUrl) {
      plainText += `  📅 Google Calendar Reminder: ${gcalUrl}\n`;
    }
    plainText += `\nEverAfter\nMade with love by Elgen for Faith\n`;

    // HTML Version (Receiver Copy)
    const htmlContent = `
      <link href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap" rel="stylesheet">
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0913; color: #f3f1f6; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1.5px solid #bd9b62; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="text-align: center; border-bottom: 1px dashed rgba(226,184,87,0.3); padding-bottom: 20px; margin-bottom: 24px;">
          <span style="font-size: 24px;">🎫</span>
          <h1 style="color: #bd9b62; font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 38px; margin: 8px 0 0 0; font-weight: normal; letter-spacing: 1px;">EverAfter</h1>
          <p style="font-size: 10px; color: #a18aa6; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Admit Two</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <p style="font-size: 15px; color: #f3f1f6; font-style: italic; line-height: 1.6; margin: 0;">
              💖 A beautiful promise is sealed! You have confirmed a romantic date with <strong>${senderName || "your partner"}</strong>. Let the anticipation of sweet memories warm your heart.
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #a18aa6; width: 40%;">Host</td>
              <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${senderName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a18aa6;">Guest</td>
              <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${recipientName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a18aa6;">Place / Location</td>
              <td style="padding: 8px 0; color: #bd9b62; font-weight: bold; text-align: right;">📍 ${place || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a18aa6;">Date & Time</td>
              <td style="padding: 8px 0; color: #ff4b72; font-weight: bold; text-align: right;">⏰ ${date || "N/A"} at ${time || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a18aa6;">RSVP Status</td>
              <td style="padding: 8px 0; color: ${accepted ? "#2ec4b6" : "#ff4b72"}; font-weight: bold; text-align: right;">${accepted ? "Accepted 🥰" : "Declined 💔"}</td>
            </tr>
          </table>
          
          ${notes ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); font-style: italic; font-size: 13px; color: #a18aa6; text-align: center;">
              " ${notes} "
            </div>
          ` : ""}
        </div>

        <div style="text-align: center;">
          ${mapLink ? `
            <a href="${mapLink}" target="_blank" style="display: inline-block; padding: 10px 20px; border-radius: 30px; background: rgba(226, 184, 87, 0.1); border: 1px dashed #bd9b62; color: #bd9b62; font-size: 12px; font-weight: bold; text-decoration: none; margin: 4px;">
              🗺️ VIEW PLACE
            </a>
          ` : ""}
          
          ${gcalUrl ? `
            <a href="${gcalUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; border-radius: 30px; background: #ff4b72; color: #ffffff; font-size: 12px; font-weight: bold; text-decoration: none; margin: 4px; box-shadow: 0 4px 15px rgba(255, 75, 114, 0.3);">
              📅 ADD TO GOOGLE CALENDAR
            </a>
          ` : ""}
        </div>
        
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 12px; color: #bd9b62;">
          <strong style="font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; font-weight: normal;">EverAfter</strong><br/>
          <span style="font-size: 11px; color: #a18aa6; display: block; margin-top: 4px;">Made with love by Elgen for Faith</span>
        </div>
      </div>
    `;

    // Send copy to receiver
    await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      text: plainText,
      html: htmlContent
    });

    // Send copy to sender notifying them of acceptance
    if (accepted && senderEmail) {
      try {
        const senderSubject = `💖 She Accepted! Date Confirmed with ${recipientName || "your partner"} 🌹`;
        
        let senderPlainText = `Hi ${senderName || "there"},\n\n`;
        senderPlainText += `Wonderful news! ${recipientName || "your partner"} has accepted your date invitation! 🥰\n\n`;
        senderPlainText += `Here are the details of your confirmed date:\n`;
        senderPlainText += `  📅 Date: ${date || "N/A"}\n`;
        senderPlainText += `  ⏰ Time: ${time || "N/A"}\n`;
        senderPlainText += `  📍 Place: ${place || "N/A"}\n`;
        if (notes) {
          senderPlainText += `  ✍_Notes from ${recipientName}: "${notes}"\n`;
        }
        senderPlainText += `\nEverAfter\nMade with love by Elgen for Faith\n`;

        const senderHtmlContent = `
          <link href="https://fonts.googleapis.com/css2?family=Sacramento&display=swap" rel="stylesheet">
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0913; color: #f3f1f6; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1.5px solid #bd9b62; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; border-bottom: 1px dashed rgba(226,184,87,0.3); padding-bottom: 20px; margin-bottom: 24px;">
              <span style="font-size: 24px;">💖</span>
              <h1 style="color: #bd9b62; font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 38px; margin: 8px 0 0 0; font-weight: normal; letter-spacing: 1px;">EverAfter</h1>
              <p style="font-size: 10px; color: #a18aa6; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Date Accepted</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px; padding: 10px 15px;">
              <p style="font-size: 16px; color: #f3f1f6; font-style: italic; line-height: 1.6; margin: 0;">
                ✨ Wonderful news! <strong>${recipientName || "your partner"}</strong> has accepted your date invitation! 🌹<br/>
                "Two souls, one date, and a beautiful journey ahead..."
              </p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #a18aa6; width: 40%;">Host</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${senderName || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a18aa6;">Guest</td>
                  <td style="padding: 8px 0; color: #ffffff; font-weight: bold; text-align: right;">${recipientName || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a18aa6;">Place / Location</td>
                  <td style="padding: 8px 0; color: #bd9b62; font-weight: bold; text-align: right;">📍 ${place || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #a18aa6;">Date & Time</td>
                  <td style="padding: 8px 0; color: #ff4b72; font-weight: bold; text-align: right;">⏰ ${date || "N/A"} at ${time || "N/A"}</td>
                </tr>
              </table>
              
              ${notes ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); font-style: italic; font-size: 13px; color: #a18aa6; text-align: center;">
                  " ${notes} "
                </div>
              ` : ""}
            </div>

            <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; font-size: 12px; color: #bd9b62;">
              <strong style="font-family: 'Sacramento', 'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; font-weight: normal;">EverAfter</strong><br/>
              <span style="font-size: 11px; color: #a18aa6; display: block; margin-top: 4px;">Made with love by Elgen for Faith</span>
            </div>
          </div>
        `;

        await sendEmail({
          to: senderEmail,
          subject: senderSubject,
          text: senderPlainText,
          html: senderHtmlContent
        });
      } catch (err) {
        console.error("Failed to send RSVP confirmation to sender:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `RSVP confirmation email processed successfully`
    });
  } catch (error) {
    console.error("Error simulating RSVP email dispatch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process RSVP request." },
      { status: 500 }
    );
  }
}
