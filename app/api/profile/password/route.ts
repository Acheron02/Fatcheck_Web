import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // JWT should include email
    const userEmail = decoded.email;
    if (!userEmail)
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 },
      );

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword)
      return NextResponse.json(
        { error: "Current and new password required" },
        { status: 400 },
      );

    const client = await clientPromise;
    const db = client.db("Fatcheck");

    const user = await db.collection("admins").findOne({ email: userEmail });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      return NextResponse.json(
        { error: "Current password incorrect" },
        { status: 400 },
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("admins").updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
