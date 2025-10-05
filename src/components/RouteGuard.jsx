"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "../firebaseConfig/providers/AuthProvider";

export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuthContext();

  const isAuthRoute = pathname === "/sign-in" || pathname === "/sign-up";

  useEffect(() => {
    if (loading) return;
    if (!isAuthRoute && !user) {
      router.replace("/sign-in");
    }
    if (isAuthRoute && user) {
      router.replace("/");
    }
  }, [loading, user, isAuthRoute, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // While performing client-side redirects, show a minimal loader instead of flashing the page
  if ((isAuthRoute && user) || (!isAuthRoute && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // If on auth routes and not logged in, or on protected routes and logged in
  return <>{children}</>;
}
