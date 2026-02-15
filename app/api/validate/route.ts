// app/api/auth/validate/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // 🔑 fetch user from MongoDB
    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    const user = await users.findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user._id.toString(), // ✅ normalized
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
