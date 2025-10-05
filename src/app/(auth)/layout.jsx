'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '../../firebaseConfig/providers/AuthProvider';

export default function AuthRoutesLayout({ children }) {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // If signed-in (regardless of email verification), redirect away from auth pages
    if (user) {
      if (pathname === '/sign-in' || pathname === '/sign-up') {
        router.replace('/');
      }
      return;
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
