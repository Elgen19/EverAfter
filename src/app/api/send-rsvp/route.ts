import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, senderName, recipientName, date, time, place, mapLink, accepted, notes } = body;

    // Simulate sending email by printing it to server console log
    console.log("\n==================================================");
    console.log(`[SIMULATED EMAIL DISPATCH]`);
    console.log(`To: ${recipientEmail || "unknown@example.com"}`);
    console.log(`Subject: 🌹 Confirmation: Your Date RSVP with ${senderName || "your partner"}!`);
    console.log(`--------------------------------------------------`);
    console.log(`Hi ${recipientName || "there"},`);
    console.log(`This is a copy of your date confirmation with ${senderName || "your partner"}!`);
    console.log(`Here are the details of your upcoming date:`);
    console.log(`  📅 Date: ${date || "N/A"}`);
    console.log(`  ⏰ Time: ${time || "N/A"}`);
    console.log(`  📍 Place: ${place || "N/A"}`);
    if (mapLink) {
      console.log(`  🗺️ Location Link: ${mapLink}`);
    }
    console.log(`  💌 RSVP Status: ${accepted ? "Accepted! 🥰" : "Declined 💔"}`);
    if (notes) {
      console.log(`  ✍️ Your Notes: "${notes}"`);
    }
    console.log("==================================================\n");

    return NextResponse.json({
      success: true,
      message: `RSVP confirmation email simulated and sent to ${recipientEmail || "recipient"}`
    });
  } catch (error) {
    console.error("Error simulating RSVP email dispatch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process RSVP request." },
      { status: 500 }
    );
  }
}
