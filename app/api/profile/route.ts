import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken, TokenPayload } from "@/lib/jwt";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token) as TokenPayload | null;
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { username, email, role } = await req.json();
    if (!username || !email)
      return NextResponse.json(
        { error: "Username and email required" },
        { status: 400 },
      );

    if (!ObjectId.isValid(payload.userId))
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("Fatcheck");

    // Check if user exists first (debug)
    const existingUser = await db.collection("admins").findOne({
      _id: new ObjectId(payload.userId),
    });
    if (!existingUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update user
    const result = await db
      .collection("admins")
      .findOneAndUpdate(
        { _id: new ObjectId(payload.userId) },
        { $set: { username, email, role } },
        { returnDocument: "after" },
      );

    // TypeScript-safe check
    if (!result?.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = result.value;

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    }); 
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
