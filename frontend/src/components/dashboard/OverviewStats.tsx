'use client'

import { UserProfile } from '@/types/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Target, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { isOverdue } from '@/lib/utils'

interface OverviewStatsProps {
  userProfile: UserProfile
}

export function OverviewStats({ userProfile }: OverviewStatsProps) {
  // Calculate statistics
  const totalProjects = userProfile.commitments.currentProjects?.length || 0
  const overdueProjects = userProfile.commitments.currentProjects?.filter(p => p.deadline && isOverdue(p.deadline)).length || 0
  const highPriorityProjects = userProfile.commitments.currentProjects?.filter(p => p.priority === 'high').length || 0
  const recurringCommitments = userProfile.commitments.weeklyCommitments?.length || 0

  // Calculate sleep duration (using default values since wakeTime/sleepTime not in ScheduleInfo)
  const wakeHour = 7 // Default wake time
  const sleepHour = 23 // Default sleep time
  const sleepDuration = sleepHour > wakeHour ? (24 - sleepHour) + wakeHour : wakeHour - sleepHour

  // Calculate work duration
  const workStartHour = parseInt(userProfile.schedule.workingHours?.start.split(':')[0] || '9')
  const workEndHour = parseInt(userProfile.schedule.workingHours?.end.split(':')[0] || '17')
  const workDuration = workEndHour - workStartHour

  // Energy score (using default values since energyPatterns not in WellnessInfo)
  const averageEnergy = 5 // Default moderate energy level

  const stats = [
    {
      title: 'Active Projects',
      value: totalProjects,
      subtitle: overdueProjects > 0 ? `${overdueProjects} overdue` : 'All on track',
      icon: Target,
      color: 'text-foreground',
      bgColor: 'bg-background/50'
    },
    {
      title: 'High Priority',
      value: highPriorityProjects,
      subtitle: 'Urgent tasks',
      icon: AlertTriangle,
      color: 'text-foreground',
      bgColor: 'bg-background/50'
    },
    {
      title: 'Sleep Schedule',
      value: `${sleepDuration}h`,
      subtitle: '7:00 AM - 11:00 PM',
      icon: Clock,
      color: 'text-foreground',
      bgColor: 'bg-background/50'
    },
    {
      title: 'Work Hours',
      value: `${workDuration}h`,
      subtitle: `${userProfile.schedule.workingHours?.start || '9:00'} - ${userProfile.schedule.workingHours?.end || '17:00'}`,
      icon: BarChart3,
      color: 'text-foreground',
      bgColor: 'bg-background/50'
    },
    {
      title: 'Energy Level',
      value: `${averageEnergy}/10`,
      subtitle: 'Daily average',
      icon: Activity,
      color: 'text-foreground',
      bgColor: 'bg-background/50'
    },
    {
      title: 'Commitments',
      value: recurringCommitments,
      subtitle: 'Recurring events',
      icon: CheckCircle,
      color: 'text-foreground',
      bgColor: 'bg-background/50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-12"
    >
      <div className="relative">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-foreground" />
                </div>
                Dashboard Overview
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="group relative"
                  >
                    {/* Stat card gradient background */}
                    <div className={`relative p-5 rounded-xl ${stat.bgColor} border border-border/40 group-hover:border-border/60 transition-all duration-300 group-hover:shadow-lg backdrop-blur-sm`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-foreground/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                      </div>

                      <div className="space-y-2">
                        <p className={`text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform origin-left`}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {stat.subtitle}
                        </p>
                      </div>

                      {/* Subtle hover accent */}
                      <div className="absolute inset-0 rounded-xl bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}