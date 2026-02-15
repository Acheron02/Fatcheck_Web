// app/api/gradeLevels/[gradeId]/sections/[sectionId]/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

// ---------------------------
// GET: fetch all students in a section
// ---------------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
) {
  const params = await context.params;
  const { id, sectionId } = params;

  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");

    // Verify that the section belongs to the grade
    const section = await db.collection("sections").findOne({
      _id: new ObjectId(sectionId),
      gradeId: new ObjectId(id),
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found in this grade level" },
        { status: 404 },
      );
    }

    // Fetch students in the section
    const students = await db
      .collection("students")
      .find({ sectionId: new ObjectId(sectionId) })
      .toArray();

    const result = students.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      email: s.email || null,
      schoolStudentId: s.schoolStudentId || null,
      lrn: s.lrn || null,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch students" },
      { status: 500 },
    );
  }
}

// ---------------------------
// POST: add a student (admin or nurse only)
// ---------------------------
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
) {
  const params = await context.params;
  const { id, sectionId } = params;

  // RBAC: only admin or nurse
  const user = requireAuth(req, ["admin", "nurse"]);
  if (user instanceof NextResponse) return user; // unauthorized

  try {
    const body = await req.json();
    const { name, email, schoolStudentId, lrn } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");

    // Verify section exists in this grade
    const section = await db.collection("sections").findOne({
      _id: new ObjectId(sectionId),
      gradeId: new ObjectId(id),
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found in this grade level" },
        { status: 404 },
      );
    }

    // Insert the new student
    const result = await db.collection("students").insertOne({
      name: name.trim(),
      email: email?.trim() || null,
      schoolStudentId: schoolStudentId?.trim() || null,
      lrn: lrn?.trim() || null,
      gradeId: new ObjectId(id),
      sectionId: new ObjectId(sectionId),
      createdAt: new Date(),
    });

    return NextResponse.json({ insertedId: result.insertedId.toString() });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to add student" },
      { status: 500 },
    );
  }
}
