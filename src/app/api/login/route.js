import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { email, name, token } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const userEmail = email.trim().toLowerCase();

    await connectDB();

    const existingUser = await User.findOne({
      email: userEmail,
    });

    // First-time user
    if (!existingUser) {
      if (!name) {
        return NextResponse.json({
          needsName: true,
        });
      }

      if (!token) {
        return NextResponse.json(
          { message: "FCM token is required" },
          { status: 400 }
        );
      }

      await User.create({
        email: userEmail,
        name: name.trim(),
        fcmToken: token,
      });

      return NextResponse.json({
        message: "Signup successful",
        success: true,
      });
    }

    // Existing user: update FCM token
    if (!token) {
      return NextResponse.json({
        needsToken: true,
      });
    }

    await User.updateOne(
      { email: userEmail },
      {
        $set: {
          fcmToken: token,
        },
      }
    );

    return NextResponse.json({
      message: "Login successful",
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}