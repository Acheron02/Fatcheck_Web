// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Malformed token" },
        { status: 401 },
      );
    }

    // Decode JWT
    const payload = verifyToken(token); // should return { userId, email, username }

    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 },
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    const user = await users.findOne(
      { _id: new Object(payload.userId) }, // ensure correct ObjectId
      { projection: { email: 1, username: 1 } }, // only fetch required fields
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
