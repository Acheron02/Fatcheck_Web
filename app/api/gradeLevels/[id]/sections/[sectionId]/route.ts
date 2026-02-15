import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.MONGODB_DB || "Fatcheck";

// ---------------------------
// GET: Fetch section by ID
// ---------------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
) {
  const params = await context.params;
  const { id, sectionId } = params;

  try {
    // Validate IDs
    if (!ObjectId.isValid(id) || !ObjectId.isValid(sectionId)) {
      return NextResponse.json(
        { error: "Invalid grade or section ID" },
        { status: 400 },
      );
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("sections");

    const section = await collection.findOne({
      _id: new ObjectId(sectionId),
      gradeId: new ObjectId(id),
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Return only the name (and ID if needed)
    return NextResponse.json({
      _id: section._id.toString(),
      name: section.name,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// ---------------------------
// PUT: Update section name
// ---------------------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
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

    // RBAC: only admin can edit sections
    const allowedRoles = ["admin", "nurse"];
    if (!user.role || !allowedRoles.includes(user.role.toLowerCase().trim())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- Validate params & body ---
    const params = await context.params;
    const { id, sectionId } = await params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(sectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 },
      );
    }

    // --- Update section ---
    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const result = await db
      .collection("sections")
      .updateOne(
        { _id: new ObjectId(sectionId), gradeId: new ObjectId(id) },
        { $set: { name: name.trim() } },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Section updated successfully" });
  } catch (err) {
    console.error("PUT section error:", err);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/gradeLevels/[id]/sections/[sectionId]
 * Delete a section (admin only)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
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

    const allowedRoles = ["admin", "nurse"];
    if (!user.role || !allowedRoles.includes(user.role.toLowerCase().trim())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- Validate params ---
    const params = await context.params;
    const { id, sectionId } = await params;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(sectionId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const result = await db
      .collection("sections")
      .deleteOne({ _id: new ObjectId(sectionId), gradeId: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Section deleted successfully" });
  } catch (err) {
    console.error("DELETE section error:", err);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 },
    );
  }
}
