'use client'

import { UserProfile } from '@/types/onboarding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Calendar, Repeat, FolderOpen, Clock, AlertCircle } from 'lucide-react'
import { formatTime, formatDate, isOverdue, getTimeUntilDeadline } from '@/lib/utils'

interface CommitmentsCardProps {
  commitments: UserProfile['commitments']
}

export function CommitmentsCard({ commitments }: CommitmentsCardProps) {
  const getPriorityColor = (priority: string) => {
    const colorMap = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500'
    }
    return colorMap[priority as keyof typeof colorMap] || 'bg-gray-500'
  }

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Commitments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {commitments.recurring && commitments.recurring.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Recurring Events
              </h4>
              <div className="space-y-3">
                {commitments.recurring.map((event, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{event.title}</h5>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
                        {event.frequency}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {event.day && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.day}
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.time)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </div>
                      )}
                      {event.travelTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.travelTime}min travel
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {commitments.projects && commitments.projects.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </h4>
              <div className="space-y-3">
                {commitments.projects.map((project, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{project.name}</h5>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} />
                        <span className="text-xs font-medium">
                          {getPriorityLabel(project.priority)}
                        </span>
                      </div>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        {isOverdue(project.deadline) ? (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={isOverdue(project.deadline) ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                          Due: {formatDate(project.deadline)} • {getTimeUntilDeadline(project.deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!commitments.recurring || commitments.recurring.length === 0) &&
           (!commitments.projects || commitments.projects.length === 0) && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-muted-foreground mb-1">No Commitments</h3>
              <p className="text-sm text-muted-foreground">No recurring events or projects to display</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}