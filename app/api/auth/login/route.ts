import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const body: LoginRequest = await req.json();
  const { email, password} = body;

  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
