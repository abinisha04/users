import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import { messaging } from "@/lib/firebaseAdmin";

export async function POST() {
  try {
    await connectDB();

    const shop = await Shop.findOne({
      email: process.env.SHOP_EMAIL.toLowerCase(),
    });

    if (!shop?.fcmToken) {
      return NextResponse.json(
        { message: "Shop FCM token not found" },
        { status: 404 }
      );
    }

    try {
      await messaging.send({
        token: shop.fcmToken,
        notification: {
          title: "User Notification",
          body: "A user has sent you a notification.",
        },
      });
    } catch (error) {
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token"
      ) {
        await Shop.updateOne(
          {
            email: process.env.SHOP_EMAIL.toLowerCase(),
            fcmToken: shop.fcmToken,
          },
          {
            $unset: { fcmToken: "" },
          }
        );
      }

      throw error;
    }

    return NextResponse.json({
      message: "Notification sent to Shop successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Notification sending failed" },
      { status: 500 }
    );
  }
}