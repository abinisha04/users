"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateFCMToken } from "@/lib/firebase";

export default function UserLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      if (!email.trim()) {
        alert("Enter your email");
        return;
      }

      // Check whether the user already exists
      const checkResponse = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkData.message);
      }

      // First-time user
      if (checkData.needsName) {
        setNeedsName(true);
        return;
      }

      // Generate token for existing user
      const token = await generateFCMToken();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("userEmail", email.trim().toLowerCase());

      router.push("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    try {
      setLoading(true);

      if (!name.trim()) {
        alert("Enter your name");
        return;
      }

      const token = await generateFCMToken();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem("userEmail", email.trim().toLowerCase());

      router.push("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>User Login</h2>

      {!needsName ? (
        <>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Loading..." : "Continue"}
          </button>
        </>
      ) : (
        <>
          <h3>Signup</h3>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={handleSignup} disabled={loading}>
            {loading ? "Loading..." : "Signup"}
          </button>
        </>
      )}
    </div>
  );
}