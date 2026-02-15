// lib/jwt.ts
import jwt, { JwtPayload } from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to your .env.local");
}

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "3600"; // 1 hour default

export interface TokenPayload {
  userId: string;
  email: string;
  username?: string;
  role?: string;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: Number(EXPIRES_IN) });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    if (typeof decoded === "string") return null; // unexpected
    return decoded as TokenPayload; // cast safely
  } catch (err) {
    return null;
  }
}
