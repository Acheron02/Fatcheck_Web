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

// PUT: Update a user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, username, email, password, role } = body as {
      userId: string;
      username?: string;
      email?: string;
      password?: string;
      role?: Role;
    };

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await users.updateOne(
      { _id: new (require("mongodb").ObjectId)(userId) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("Fatcheck");
    const users = db.collection("admins");

    const result = await users.deleteOne({
      _id: new (require("mongodb").ObjectId)(userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
