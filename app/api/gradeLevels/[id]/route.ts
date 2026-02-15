import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { verifyToken, type TokenPayload } from "@/lib/jwt";

const client = new MongoClient(process.env.MONGODB_URI!);
const dbName = process.env.MONGODB_DB || "Fatcheck";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("grades");

    const grade = await collection.findOne({ _id: new ObjectId(id) });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ _id: grade._id, name: grade.name });
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    console.log("Auth header:", authHeader); // DEBUG

    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return NextResponse.json({ error: "Malformed token" }, { status: 401 });

    const token = parts[1];
    const user = verifyToken(token);

    console.log("Decoded token:", user); // DEBUG

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // RBAC: only admin can update
    if (!user.role || user.role.toLowerCase().trim() === "teacher") {
      console.log("RBAC check failed:", user.role); // DEBUG
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- Validate params & body ---
    const params = await context.params;
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid grade ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Grade name is required" },
        { status: 400 },
      );
    }

    // --- Update grade ---
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("grades");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim() } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Grade updated successfully" });
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
