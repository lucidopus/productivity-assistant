'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, profileComplete } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push(profileComplete ? '/dashboard' : '/onboarding');
    }
  }, [user, profileComplete, router]);

  // Show loading or nothing while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    // Manual validation
    const validation = loginSchema.safeParse(data);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      if (firstError.path.includes('email')) {
        setError('email', { message: firstError.message });
      } else if (firstError.path.includes('password')) {
        setError('password', { message: firstError.message });
      }
      return;
    }

    setIsLoading(true);
    const result = await login(data.email, data.password);
    if (result.success) {
      // Redirect directly based on profile completion status
      if (result.profileComplete) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bg-card border border-border rounded-lg shadow-sm p-8">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="w-16 h-16 mx-auto bg-primary rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
              <p className="mt-2 text-muted-foreground">Sign in to your productivity assistant</p>
            </motion.div>

            {/* Form */}
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="w-full h-9 px-3 py-1 bg-transparent border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-destructive" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    className="w-full h-9 px-3 py-1 bg-transparent border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-destructive" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="default"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="font-medium text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}