"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebaseConfig/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig/firebaseConfig';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const friendlyAuthError = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return undefined;
    }
  };

  const onLogin = async () => {
    const e = email.trim();
    const p = password.trim();
    if (!e || !p) return window.alert('Enter email and password');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, e, p);
      try {
        const u = cred.user;
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            email: u.email || e,
            username: u.displayName || (e.split('@')[0]),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } else {
          await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
        }
      } catch (pf) {
        console.warn('[AUTH][signin] ensure profile failed', pf);
      }
      router.replace('/');
    } catch (err) {
      const msg = friendlyAuthError(err?.code) || (err?.message ? String(err.message) : 'Unknown error');
      window.alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-12 pb-6 px-4 border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
            <span className="sr-only">Back</span>
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600 text-sm mt-1">Use your email and password</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <div className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full text-gray-900 text-base outline-none" type="email" autoComplete="email" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <div className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3 flex items-center">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="text-gray-900 text-base flex-1 outline-none" type={showPassword ? 'text' : 'password'} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(s => !s)} className="text-gray-400 ml-2 text-sm">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">Forgot password? We can add reset next.</p>
        </div>

        <button onClick={onLogin} disabled={loading} className={`w-full bg-blue-600 rounded-xl py-4 text-white font-semibold text-lg ${loading ? 'opacity-70' : ''}`}>
          Login
        </button>
        <p className="text-sm text-gray-600 mt-4">
          New here? <Link href="/sign-up" className="underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
