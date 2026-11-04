"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { listenForNotifications } from "@/lib/firebase";

export default function UserHome() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("userEmail")) {
      router.push("/login");
      return;
    }

    let unsubscribe;

    listenForNotifications((payload) => {
      alert(
        payload.notification?.title +
        ": " +
        payload.notification?.body
      );
    }).then((fn) => {
      unsubscribe = fn;
    });

    return () => unsubscribe?.();
  }, []);

  async function sendNotification() {
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
      });

      const data = await response.json();

      alert(data.message);
    } catch (error) {
      alert("Notification sending failed");
    }
  }

  return (
    <div>
      <h1>User Home</h1>

      <button onClick={sendNotification}>
        Send Notification
      </button>
    </div>
  );
}