import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
  icalEvent?: string;
}

export async function sendEmail({ to, subject, text, html, icalEvent }: SendEmailParams) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"EverAfter Team" <no-reply@example.com>`;

  const isConfigured = !!(host && port && user && pass);

  if (isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // Use SSL/TLS for port 465
        auth: {
          user,
          pass,
        },
      });

      const mailOptions: any = {
        from,
        to,
        subject,
        text,
        html,
      };

      if (icalEvent) {
        mailOptions.icalEvent = {
          filename: "invite.ics",
          method: "REQUEST",
          content: icalEvent
        };
      }

      const info = await transporter.sendMail(mailOptions);

      console.log(`[SMTP EMAIL DISPATCH] Real email successfully sent to: ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[SMTP EMAIL ERROR] Failed to send real email via SMTP, falling back to simulated logs. Error:", err);
      logSimulatedEmail(to, subject, text);
      return { success: false, fallback: true };
    }
  } else {
    console.warn(
      `\n[WARNING] SMTP is not fully configured in environment variables (.env.local).\n` +
      `To send real emails, define: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.\n` +
      `Falling back to simulated console logs.`
    );
    logSimulatedEmail(to, subject, text);
    return { success: true, simulated: true };
  }
}

function logSimulatedEmail(to: string, subject: string, text: string) {
  console.log("\n==================================================");
  console.log(`[SIMULATED EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------`);
  console.log(text);
  console.log("==================================================\n");
}
