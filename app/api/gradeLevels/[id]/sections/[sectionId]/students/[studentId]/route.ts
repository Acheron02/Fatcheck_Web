// /app/api/gradeLevels/[gradeId]/sections/[sectionId]/students/[studentId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string; sectionId: string; studentId: string }>;
  },
) {
  const params = await context.params;
  const { id, sectionId, studentId } = params;

  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");

    // Check section
    const section = await db.collection("sections").findOne({
      _id: new ObjectId(sectionId),
      gradeId: new ObjectId(id),
    });
    if (!section) {
      return NextResponse.json({ error: "Section not found in this grade level" }, { status: 404 });
    }

    // Fetch student
    const student = await db.collection("students").findOne({
      _id: new ObjectId(studentId),
      sectionId: new ObjectId(sectionId),
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: student._id.toString(),
      name: student.name || "",
      email: student.email || null,
      schoolStudentId: student.schoolStudentId || null, // fixed
      lrn: student.lrn || null,
      gradeId: student.gradeId?.toString() || null,
      sectionId: student.sectionId?.toString() || null,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch student" },
      { status: 500 },
    );
  }
}


export async function PUT(
  req: NextRequest,
  context: {
    params: Promise<{ id: string; sectionId: string; studentId: string }>;
  },
) {
  const params = await context.params;
  const { id, sectionId, studentId } = params;
  const { name, email, schoolStudentId, lrn } = await req.json();
  const user = requireAuth(req, ["admin", "nurse"]);
  if (user instanceof NextResponse) return user;

  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const result = await db.collection("students").updateOne(
      { _id: new ObjectId(studentId), sectionId: new ObjectId(sectionId) },
      {
        $set: {
          name,
          email: email || null,
          schoolStudentId: schoolStudentId || null,
          lrn: lrn || null,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ id: string; sectionId: string; studentId: string }>;
  },
) {
  const params = await context.params;
  const { id, sectionId, studentId } = params;
  const user = requireAuth(req, ["admin", "nurse"]);
  if (user instanceof NextResponse) return user;

  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const result = await db.collection("students").deleteOne({
      _id: new ObjectId(studentId),
      sectionId: new ObjectId(sectionId),
    });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to delete student" },
      { status: 500 },
    );
  }
}
