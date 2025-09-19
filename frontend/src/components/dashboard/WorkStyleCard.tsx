'use client'

import { UserProfile } from '@/types/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Brain, Focus, CheckSquare, Lightbulb, AlertTriangle } from 'lucide-react'

interface WorkStyleCardProps {
  workStyle: UserProfile['workStyle']
}

export function WorkStyleCard({ workStyle }: WorkStyleCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Work Style & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Planning Style
            </h4>
            <div className="p-4 rounded-lg bg-secondary">
              <h5 className="font-medium">Structured Planning</h5>
              <p className="text-sm text-muted-foreground mt-1">
                Prefers detailed planning and structured approaches
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Focus className="h-4 w-4" />
              Focus Duration
            </h4>
            <div className="text-center p-4 rounded-lg bg-secondary">
              <p className="text-3xl font-bold">{workStyle.productivity?.focusTime || '45'}</p>
              <p className="text-sm text-muted-foreground">minutes of focused work</p>
            </div>
          </div>

          {workStyle.workStyle && workStyle.workStyle.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Task Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {workStyle.workStyle.map((preference, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {preference}
                  </span>
                ))}
              </div>
            </div>
          )}

          {false && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                What Motivates You
              </h4>
              <div className="space-y-2">
                {['Achievement', 'Recognition'].map((motivator, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-sm">{motivator}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {false && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Productivity Blockers
              </h4>
              <div className="space-y-2">
                {['Distractions', 'Multitasking'].map((blocker, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span className="text-sm">{blocker}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}