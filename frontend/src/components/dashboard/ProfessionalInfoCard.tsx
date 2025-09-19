'use client'

import { UserProfile } from '@/types/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Briefcase, Building, MapPin, Target, TrendingUp, BookOpen } from 'lucide-react'

interface ProfessionalInfoCardProps {
  professional: UserProfile['professional']
}

export function ProfessionalInfoCard({ professional }: ProfessionalInfoCardProps) {
  const getStatusLabel = (status: string) => {
    const statusMap = {
      'student': 'Student',
      'employed': 'Employed',
      'self-employed': 'Self-Employed',
      'other': 'Other'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getWorkLocationLabel = (workLocation: string) => {
    const locationMap = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site'
    }
    return locationMap[workLocation as keyof typeof locationMap] || workLocation
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{getStatusLabel(professional.status)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Work Location</p>
                  <p className="font-medium">{getWorkLocationLabel(professional.workLocation || 'remote')}</p>
                </div>
              </div>
            </div>
          </div>

          {(professional.profession || professional.experience) && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Work Details
              </h4>
              <div className="space-y-2">
                {professional.profession && (
                  <div>
                    <span className="text-sm text-muted-foreground">Organization:</span>
                    <p className="font-medium">{professional.profession}</p>
                  </div>
                )}
                {false && (
                  <div>
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <p className="font-medium">Role not specified</p>
                  </div>
                )}
                {professional.experience && (
                  <div>
                    <span className="text-sm text-muted-foreground">Experience:</span>
                    <p className="font-medium">{professional.experience} years</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {professional.goals && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals & Development
              </h4>

              {professional.goals && professional.goals.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Short-term Goals
                  </h5>
                  <div className="space-y-1">
                    {professional.goals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {false && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Long-term Goals
                  </h5>
                  <div className="space-y-1">
                    {['Goal 1', 'Goal 2'].map((goal, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {false && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Skills Development
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {['Skill 1', 'Skill 2'].map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}