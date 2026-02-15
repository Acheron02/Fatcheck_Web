import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

type Role = "Admin" | "Teacher" | "Nurse";

interface User {
  _id: string;
  email: string;
  username: string;
  role: Role;
  password?: string;
  createdAt: Date;
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username, role } = body as {
      email: string;
      password: string;
      username: string;
      role: Role;
    };

    if (!email || !password || !username || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const allowedRoles: Role[] = ["Admin", "Teacher", "Nurse"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    // Check if email exists
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      email,
      password: hashedPassword,
      username,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

// GET: Fetch all users
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    const allUsers = await users
      .find({})
      .project({ password: 0 }) // hide password
      .toArray();

    return NextResponse.json(allUsers);
  } catch (err) {
    console.error("FETCH USERS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}


