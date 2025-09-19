'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireProfile = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, hasProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (requireProfile && !hasProfile) {
        router.push('/onboarding');
        return;
      }
    }
  }, [user, hasProfile, loading, requireProfile, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireProfile && !hasProfile) {
    return null;
  }

  return <>{children}</>;
}