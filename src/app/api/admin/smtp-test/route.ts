import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `"EverAfter Team" <no-reply@example.com>`;

    const isConfigured = !!(host && port && user && pass);

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: "SMTP environment variables are incomplete or missing. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS."
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000 // 5 seconds timeout for diagnostic check
    });

    // Run transporter verify check
    await transporter.verify();

    return NextResponse.json({
      success: true,
      configured: true,
      diagnostics: {
        host,
        port,
        user,
        from,
        secure: port === 465
      }
    });
  } catch (err: any) {
    console.error("[SMTP DIAGNOSTIC ERROR] Verification failed:", err);
    return NextResponse.json({
      success: false,
      configured: true,
      error: err.message || "Failed to verify connection to SMTP server."
    }, { status: 500 });
  }
}
