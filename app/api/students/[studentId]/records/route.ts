// /app/api/students/[studentId]/records/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// For now, assume records are stored in this folder on the Raspi
const RECORDS_DIR = "/home/pi/student_records"; // adjust as needed

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } },
) {
  const { studentId } = params;

  try {
    const studentDir = path.join(RECORDS_DIR, studentId);
    if (!fs.existsSync(studentDir)) {
      return NextResponse.json([], { status: 200 });
    }

    const files = fs.readdirSync(studentDir);

    const records = files.map((file) => {
      const ext = path.extname(file).toLowerCase();
      let type: "pdf" | "xls" | "other" = "other";
      if (ext === ".pdf") type = "pdf";
      else if (ext === ".xls" || ext === ".xlsx") type = "xls";

      const stats = fs.statSync(path.join(studentDir, file));

      return {
        _id: file,
        filename: file,
        type,
        date: stats.mtime.toISOString(),
        url: `/api/students/${studentId}/records/files/${file}`, // route to serve the file
      };
    });

    return NextResponse.json(records);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 },
    );
  }
}