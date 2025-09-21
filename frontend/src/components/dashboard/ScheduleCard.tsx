'use client'

import { UserProfile } from '@/types/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Clock, Sunrise, Moon, Coffee, Zap } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface ScheduleCardProps {
  schedule: UserProfile['schedule']
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const getProductivePeriodIcon = (period: string) => {
    if (period.toLowerCase().includes('morning')) return <Sunrise className="h-3 w-3" />
    if (period.toLowerCase().includes('evening') || period.toLowerCase().includes('night')) return <Moon className="h-3 w-3" />
    return <Zap className="h-3 w-3" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule & Routines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Sleep Schedule</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Wake time:</span>
                  <span className="font-medium">{(schedule as { wakeTime?: string }).wakeTime || '7:00 AM'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sleep time:</span>
                  <span className="font-medium">{(schedule as { sleepTime?: string }).sleepTime || '11:00 PM'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Work Hours</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Start:</span>
                  <span className="font-medium">{formatTime(schedule.workingHours?.start || (schedule as { workHours?: { start?: string } }).workHours?.start || '9:00')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">End:</span>
                  <span className="font-medium">{formatTime(schedule.workingHours?.end || (schedule as { workHours?: { end?: string } }).workHours?.end || '17:00')}</span>
                </div>
              </div>
            </div>
          </div>

          {(() => {
            const productivePeriods = schedule.timePreferences || (schedule as { productivePeriods?: string[] }).productivePeriods || [];
            return productivePeriods.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Productive Periods
                </h4>
                <div className="flex flex-wrap gap-2">
                  {productivePeriods.map((period: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {getProductivePeriodIcon(period)}
                      {period}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {false && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Break Preferences
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-muted-foreground">breaks per day</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-xs text-muted-foreground">minutes each</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}