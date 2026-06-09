import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const response = NextResponse.json({ nonce });
  
  const cookieStore = await cookies();
  cookieStore.set("siwe-nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes validity
    path: "/",
  });

  return response;
}
