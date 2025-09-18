'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserProfile } from '@/types/onboarding'
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
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

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
          transition={{ duration: 0.4, ease: "easeOut" }}
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
          transition={{ duration: 0.5, ease: "easeOut" }}
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">No Profile Found</h1>
          <p className="text-muted-foreground">
            Complete the onboarding process to see your personalized dashboard.
          </p>
          <Button asChild size="lg">
            <Link href="/onboarding">
              Start Onboarding
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <DashboardHeader
          userName={userProfile.personal.name}
          onRefresh={() => fetchUserProfile(true)}
          isRefreshing={refreshing}
        />
      </motion.div>

      {/* Main Content */}
      <motion.main
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants}>
              <OverviewStats userProfile={userProfile} />
            </motion.div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div variants={itemVariants}>
              <QuickActions />
            </motion.div>
          </div>
        </section>

        {/* Detailed Information Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              variants={itemVariants}
              className="space-y-16"
            >
              {/* Row 1: Personal & Professional Info */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                <motion.div variants={itemVariants}>
                  <PersonalInfoCard personal={userProfile.personal} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ProfessionalInfoCard professional={userProfile.professional} />
                </motion.div>
              </motion.div>

              {/* Row 2: Schedule & Work Style */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                <motion.div variants={itemVariants}>
                  <ScheduleCard schedule={userProfile.schedule} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <WorkStyleCard workStyle={userProfile.workStyle} />
                </motion.div>
              </motion.div>

              {/* Row 3: Wellness & Commitments */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                <motion.div variants={itemVariants}>
                  <WellnessCard wellness={userProfile.wellness} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CommitmentsCard commitments={userProfile.commitments} />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.footer
              variants={fadeInVariants}
              className="pt-12 border-t border-border/40 text-center"
            >
              <p className="text-caption">
                Profile last updated: {userProfile.metadata?.lastUpdated ? formatDateTime(userProfile.metadata.lastUpdated) : 'Recently'}
              </p>
            </motion.footer>
          </div>
        </section>
      </motion.main>
    </div>
  )
}