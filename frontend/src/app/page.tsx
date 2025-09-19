'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, profileComplete, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Use replace instead of push to avoid back button issues
      if (profileComplete) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [user, profileComplete, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto bg-black rounded-2xl flex items-center justify-center mb-8">
          <span className="text-3xl">🤖</span>
        </div>

        <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
          Your Personal AI
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Productivity Assistant
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Transform your productivity with an AI that truly understands you.
          Get personalized daily plans, weekly goal tracking, and proactive support
          through Slack integration.
        </p>

        <div className="space-y-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl text-lg font-medium transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Get Started
            <span>→</span>
          </Link>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-black hover:text-gray-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Takes about 10-15 minutes • Your data stays secure
        </p>
      </div>
    </div>
  );
}
