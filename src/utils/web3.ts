import { verifyTypedData } from "viem";
import { SignJWT, jwtVerify } from "jose";

export const SIWE_DOMAIN = {
  name: "Digital Love Letter",
  version: "1",
  chainId: 1,
} as const;

export const SIWE_TYPES = {
  SignIn: [
    { name: "statement", type: "string" },
    { name: "uri", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "nonce", type: "string" },
    { name: "issuedAt", type: "string" },
  ],
} as const;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-digital-love-letter-123456!"
);

export async function verifyEIP712Signature({
  address,
  nonce,
  signature,
  origin,
  issuedAt,
}: {
  address: string;
  nonce: string;
  signature: string;
  origin: string;
  issuedAt: string;
}): Promise<boolean> {
  try {
    return await verifyTypedData({
      address: address as `0x${string}`,
      domain: SIWE_DOMAIN,
      types: SIWE_TYPES,
      primaryType: "SignIn",
      message: {
        statement: "Sign in to Digital Love Letter to verify your ownership of this wallet.",
        uri: origin,
        version: "1",
        chainId: BigInt(1),
        nonce,
        issuedAt,
      },
      signature: signature as `0x${string}`,
    });
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

export async function signJWT(payload: { address: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { address: string };
  } catch {
    return null;
  }
}
