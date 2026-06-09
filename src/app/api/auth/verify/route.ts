import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyEIP712Signature, signJWT } from "@/utils/web3";

export async function POST(req: NextRequest) {
  try {
    const { address, signature, nonce, issuedAt } = await req.json();

    if (!address || !signature || !nonce || !issuedAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const storedNonce = cookieStore.get("siwe-nonce")?.value;

    if (!storedNonce || storedNonce !== nonce) {
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const isValid = await verifyEIP712Signature({
      address,
      nonce,
      signature,
      origin,
      issuedAt,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const token = await signJWT({ address });

    const response = NextResponse.json({ success: true, user: { address } });
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    response.cookies.delete("siwe-nonce");

    return response;
  } catch (error) {
    console.error("Error in verify route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
