"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug: mark mount
    console.log('[AuthProvider] mount, subscribing to onAuthStateChanged');
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('[AuthProvider] onAuthStateChanged fired. user:', !!u);
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  useEffect(() => {
    console.log('[AuthProvider] loading state changed:', loading);
  }, [loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
