import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

// GET all students
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
) {
  const params = await context.params;
  const { id, sectionId } = params;

  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const section = await db.collection("sections").findOne({
      _id: new ObjectId(sectionId),
      gradeId: new ObjectId(id),
    });

    if (!section)
      return NextResponse.json({ error: "Section not found" }, { status: 404 });

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
      birthday: s.birthday ? new Date(s.birthday).toISOString() : null,
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

// POST add a student
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; sectionId: string }> },
) {
  const params = await context.params;
  const { id, sectionId } = params;

  const user = requireAuth(req, ["admin", "nurse"]);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const { name, email, schoolStudentId, lrn, birthday } = body;

    if (!name || typeof name !== "string")
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 },
      );

    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const section = await db
      .collection("sections")
      .findOne({ _id: new ObjectId(sectionId), gradeId: new ObjectId(id) });
    if (!section)
      return NextResponse.json({ error: "Section not found" }, { status: 404 });

    const result = await db.collection("students").insertOne({
      name: name.trim(),
      email: email?.trim() || null,
      schoolStudentId: schoolStudentId?.trim() || null,
      lrn: lrn?.trim() || null,
      birthday: birthday ? new Date(birthday + "T00:00:00") : null,
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
