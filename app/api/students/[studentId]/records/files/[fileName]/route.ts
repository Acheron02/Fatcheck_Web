// /app/api/students/[studentId]/records/files/[fileName]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const RECORDS_DIR = "/home/pi/student_records"; // adjust to your Raspi folder

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string; fileName: string } },
) {
  const { studentId, fileName } = params;

  const filePath = path.join(RECORDS_DIR, studentId, fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath); // read as Buffer
  const ext = path.extname(fileName).toLowerCase();

  let contentType = "application/octet-stream";
  if (ext === ".pdf") contentType = "application/pdf";
  else if (ext === ".xls" || ext === ".xlsx")
    contentType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
