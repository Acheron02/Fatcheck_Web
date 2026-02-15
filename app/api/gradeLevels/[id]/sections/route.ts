import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken, type TokenPayload } from "@/lib/jwt";

/**
 * GET /api/gradeLevels/[id]/sections
 * Fetch all sections under a grade level
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const sections = await db
      .collection("sections")
      .find({ gradeId: new ObjectId(id) })
      .toArray();

    return NextResponse.json(sections);
  } catch (err) {
    console.error("GET sections error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/gradeLevels/[id]/sections
 * Add a new section under a grade level (admin only)
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return NextResponse.json({ error: "Malformed token" }, { status: 401 });

    const token = parts[1];
    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // RBAC: only admin can add sections
    const allowedRoles = ["admin", "nurse"];
    if (!user.role || !allowedRoles.includes(user.role.toLowerCase().trim())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- Validate params & body ---
    const params = await context.params;
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 },
      );
    }

    // --- Insert section ---
    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const result = await db.collection("sections").insertOne({
      name: name.trim(),
      gradeId: new ObjectId(id),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { insertedId: result.insertedId },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST section error:", err);
    return NextResponse.json(
      { error: "Failed to add section" },
      { status: 500 },
    );
  }
}
