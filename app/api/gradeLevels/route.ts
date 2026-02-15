//app/api/gradeLevels/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // your MongoDB client
import { verifyToken, type TokenPayload } from "@/lib/jwt";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const grades = await db.collection("grades").find({}).toArray();
    return NextResponse.json(grades);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Only admins can POST
    if (decoded.role?.trim().toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const result = await db.collection("grades").insertOne({ name });

    return NextResponse.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add grade" }, { status: 500 });
  }
}

