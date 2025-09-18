'use client'

import { UserProfile } from '@/types/onboarding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Target, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { isOverdue } from '@/lib/utils'

interface OverviewStatsProps {
  userProfile: UserProfile
}

export function OverviewStats({ userProfile }: OverviewStatsProps) {
  // Calculate statistics
  const totalProjects = userProfile.commitments.projects?.length || 0
  const overdueProjects = userProfile.commitments.projects?.filter(p => p.deadline && isOverdue(p.deadline)).length || 0
  const highPriorityProjects = userProfile.commitments.projects?.filter(p => p.priority === 'high').length || 0
  const recurringCommitments = userProfile.commitments.recurring?.length || 0

  // Calculate sleep duration
  const wakeHour = parseInt(userProfile.schedule.wakeTime.split(':')[0])
  const sleepHour = parseInt(userProfile.schedule.sleepTime.split(':')[0])
  const sleepDuration = sleepHour > wakeHour ? (24 - sleepHour) + wakeHour : wakeHour - sleepHour

  // Calculate work duration
  const workStartHour = parseInt(userProfile.schedule.workHours.start.split(':')[0])
  const workEndHour = parseInt(userProfile.schedule.workHours.end.split(':')[0])
  const workDuration = workEndHour - workStartHour

  // Energy score (average of all energy patterns)
  const averageEnergy = Math.round(
    (userProfile.wellness.energyPatterns.morning +
     userProfile.wellness.energyPatterns.afternoon +
     userProfile.wellness.energyPatterns.evening) / 3
  )

  const stats = [
    {
      title: 'Active Projects',
      value: totalProjects,
      subtitle: overdueProjects > 0 ? `${overdueProjects} overdue` : 'All on track',
      icon: Target,
      color: overdueProjects > 0 ? 'text-red-500' : 'text-green-500',
      bgColor: overdueProjects > 0 ? 'bg-red-50 dark:bg-red-950/20' : 'bg-green-50 dark:bg-green-950/20'
    },
    {
      title: 'High Priority',
      value: highPriorityProjects,
      subtitle: 'Urgent tasks',
      icon: AlertTriangle,
      color: highPriorityProjects > 0 ? 'text-orange-500' : 'text-muted-foreground',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      title: 'Sleep Schedule',
      value: `${sleepDuration}h`,
      subtitle: `${userProfile.schedule.wakeTime} - ${userProfile.schedule.sleepTime}`,
      icon: Clock,
      color: sleepDuration >= 7 && sleepDuration <= 9 ? 'text-green-500' : 'text-yellow-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Work Hours',
      value: `${workDuration}h`,
      subtitle: `${userProfile.schedule.workHours.start} - ${userProfile.schedule.workHours.end}`,
      icon: BarChart3,
      color: 'text-blue-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      title: 'Energy Level',
      value: `${averageEnergy}/10`,
      subtitle: 'Daily average',
      icon: Activity,
      color: averageEnergy >= 7 ? 'text-green-500' : averageEnergy >= 5 ? 'text-yellow-500' : 'text-red-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      title: 'Commitments',
      value: recurringCommitments,
      subtitle: 'Recurring events',
      icon: CheckCircle,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${stat.bgColor} border transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}