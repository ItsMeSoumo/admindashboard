"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../../../firebaseConfig/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig/firebaseConfig";
export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const friendlyAuthError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Email already in use. Try signing in.";
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/weak-password":
        return "Password is too weak (min 6 characters).";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return undefined;
    }
  };

  const onGoogle = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      router.replace("/");
    } catch (e) {
      setError(e?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const em = email.trim();
    const pw = password.trim();
    if (!em) return setError("Enter a valid email");
    if (pw.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, em, pw);
      const user = cred.user;
      const name = (displayName || em.split("@")[0]).trim();
      if (name) await updateProfile(user, { displayName: name });
      // Create Firestore profile for new user with role 'student'
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email || em,
            username: name || em.split("@")[0],
            role: "student",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (pfErr) {
        // Swallow profile creation errors
      }
      try {
        await sendEmailVerification(user);
        setInfo("Verification email sent. Please check your inbox.");
      } catch {}
      router.replace("/");
    } catch (err) {
      const msg = friendlyAuthError(err?.code) || err?.message || "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Already have an account? <Link href="/sign-in" className="underline">Sign in</Link>
      </p>

      <form onSubmit={onSignup} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-sm underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Display name (optional)</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="e.g. Soumo"
            autoComplete="name"
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {info && <div className="text-sm text-green-700">{info}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium ${loading ? "opacity-70" : ""}`}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className={`w-full rounded-lg border px-4 py-2 font-medium ${loading ? "opacity-70" : ""}`}
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}