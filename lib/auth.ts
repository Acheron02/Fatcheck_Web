// lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type TokenPayload } from "./jwt";

/**
 * Verifies JWT and optionally checks allowed roles.
 * @param req NextRequest
 * @param allowedRoles Array of lowercase roles e.g. ["admin", "nurse"]
 * @returns TokenPayload if authorized, otherwise NextResponse (401 or 403)
 */
export function requireAuth(
  req: NextRequest,
  allowedRoles: string[] = [],
): TokenPayload | NextResponse {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return NextResponse.json({ error: "Malformed token" }, { status: 401 });
  }

  const token = parts[1];
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RBAC check
  if (
    allowedRoles.length &&
    !allowedRoles.includes((user.role ?? "").toLowerCase().trim())
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  return user;
}
