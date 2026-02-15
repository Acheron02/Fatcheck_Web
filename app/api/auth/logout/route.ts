import { NextResponse } from "next/server";

// For a stateless JWT, this API can optionally implement token blacklisting
export async function POST(request: Request) {
  try {
    // If you want, you can parse the token and store it in a blacklist collection
    // const body = await request.json();
    // const token = body.token;

    // Here we just respond success; client will remove the token
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 },
    );
  }
}
