'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { OnboardingProgress } from '@/types/profile';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface LoginResult {
  success: boolean;
  profileComplete: boolean;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  hasProfile: boolean;
  profileComplete: boolean;
  onboardingProgress: OnboardingProgress | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setHasProfile(data.hasProfile);
        setProfileComplete(data.profileComplete || false);
        setOnboardingProgress(data.onboardingProgress || null);
      } else {
        setUser(null);
        setHasProfile(false);
        setProfileComplete(false);
        setOnboardingProgress(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setHasProfile(false);
      setProfileComplete(false);
      setOnboardingProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setHasProfile(data.hasProfile);
        setProfileComplete(data.profileComplete || false);
        setOnboardingProgress(data.onboardingProgress || null);
        toast.success('Logged in successfully!');
        return {
          success: true,
          profileComplete: data.profileComplete || false,
          user: data.user
        };
      } else {
        toast.error(data.error || 'Login failed');
        return { success: false, profileComplete: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, profileComplete: false };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setHasProfile(true); // New users now have empty profiles
        setProfileComplete(false); // But they're not complete yet
        setOnboardingProgress({
          currentStep: 1,
          completedSteps: [],
          isComplete: false,
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
        });
        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(data.error || 'Signup failed');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setHasProfile(false);
      setProfileComplete(false);
      setOnboardingProgress(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.onboardingProgress) {
          setOnboardingProgress(data.onboardingProgress);
          setProfileComplete(data.onboardingProgress.isComplete || false);
        }
      }
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hasProfile,
        profileComplete,
        onboardingProgress,
        loading,
        login,
        signup,
        logout,
        checkAuth,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}