'use client'

import { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/profile'
import { PersonalInfoCard } from '@/components/dashboard/PersonalInfoCard'
import { ProfessionalInfoCard } from '@/components/dashboard/ProfessionalInfoCard'
import { ScheduleCard } from '@/components/dashboard/ScheduleCard'
import { WorkStyleCard } from '@/components/dashboard/WorkStyleCard'
import { WellnessCard } from '@/components/dashboard/WellnessCard'
import { CommitmentsCard } from '@/components/dashboard/CommitmentsCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { OverviewStats } from '@/components/dashboard/OverviewStats'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'

interface DashboardData {
  success: boolean
  data?: UserProfile
  sessionId?: string
  error?: string
}

// Animation variants following UI rules
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

export default function DashboardPage() {
  const { user, hasProfile, profileComplete, onboardingProgress, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Redirect to onboarding if profile is not complete
  useEffect(() => {
    if (!authLoading && user && !profileComplete) {
      router.push('/onboarding')
    }
  }, [authLoading, user, profileComplete, router])

  useEffect(() => {
    if (profileComplete) {
      fetchUserProfile()
    }
  }, [profileComplete])

  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/dashboard/user-profile')
      const result: DashboardData = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch user profile')
      }

      if (result.data) {
        setUserProfile(result.data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin mx-auto text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-heading">Loading Dashboard</h2>
            <p className="text-caption">Fetching your personalized insights...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center">
        <motion.div
          className="text-center space-y-6 max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          >
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-heading text-foreground">Dashboard Unavailable</h1>
            <p className="text-body text-muted-foreground">{error}</p>
          </div>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => fetchUserProfile()}
              size="lg"
              variant="default"
            >
              Try Again
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // If user is not authenticated or profile is not complete, show loading
  if (authLoading || !user || !profileComplete) {
    return (
      <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin mx-auto text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-heading">Loading Dashboard</h2>
            <p className="text-caption">
              {!profileComplete ? 'Redirecting to onboarding...' : 'Fetching your personalized insights...'}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Profile Loading...</h1>
          <p className="text-muted-foreground">
            Fetching your personalized dashboard data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Minimal Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/10" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <DashboardHeader
          userName={userProfile.personal.name}
          onRefresh={() => fetchUserProfile(true)}
          isRefreshing={refreshing}
        />
      </motion.div>

      {/* Main Content */}
      <motion.main
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Enhanced Spacing */}
        <section className="pt-8 pb-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div variants={itemVariants}>
              <OverviewStats userProfile={userProfile} />
            </motion.div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="pb-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div variants={itemVariants}>
              <QuickActions />
            </motion.div>
          </div>
        </section>

        {/* Detailed Information Section */}
        <section className="pb-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              variants={itemVariants}
              className="space-y-8"
            >
              {/* Section Header */}
              <motion.div
                variants={itemVariants}
                className="text-center space-y-4 mb-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Your Profile Details
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Comprehensive insights into your personal productivity patterns and preferences
                </p>
              </motion.div>

              {/* Row 1: Personal & Professional Info */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <PersonalInfoCard personal={userProfile.personal} />
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfessionalInfoCard professional={userProfile.professional} />
                </motion.div>
              </motion.div>

              {/* Row 2: Schedule & Work Style */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScheduleCard schedule={userProfile.schedule} />
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <WorkStyleCard workStyle={userProfile.workStyle} />
                </motion.div>
              </motion.div>

              {/* Row 3: Wellness & Commitments */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <WellnessCard wellness={userProfile.wellness} />
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <CommitmentsCard commitments={userProfile.commitments} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.footer
              variants={fadeInVariants}
              className="relative"
            >
              {/* Footer background */}
              <div className="absolute inset-0 bg-gradient-to-r from-muted/5 via-transparent to-muted/5 rounded-2xl blur-3xl -z-10" />

              <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-2 w-2 bg-foreground/40 rounded-full animate-pulse" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Dashboard Status: Active & Updated
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Profile last updated: {userProfile.metadata?.updatedAt ? formatDateTime(new Date(userProfile.metadata.updatedAt)) : 'Recently'}
                  </p>

                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/40">
                    <span>Version {userProfile.metadata?.version || '1'}</span>
                    <span>•</span>
                    <span>Productivity Assistant</span>
                    <span>•</span>
                    <span>Powered by AI</span>
                  </div>
                </div>
              </div>
            </motion.footer>
          </div>
        </section>
      </motion.main>
    </div>
  )
}