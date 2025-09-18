'use client'

import { UserProfile } from '@/types/onboarding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Heart, Activity, Sunrise, Sun, Sunset, Shield } from 'lucide-react'

interface WellnessCardProps {
  wellness: UserProfile['wellness']
}

export function WellnessCard({ wellness }: WellnessCardProps) {
  const getEnergyRating = (rating: number) => {
    if (rating >= 8) return { label: 'High', color: 'bg-green-500' }
    if (rating >= 6) return { label: 'Good', color: 'bg-yellow-500' }
    if (rating >= 4) return { label: 'Moderate', color: 'bg-orange-500' }
    return { label: 'Low', color: 'bg-red-500' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health & Wellness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {wellness.exerciseRoutine && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Exercise Routine
              </h4>
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm">{wellness.exerciseRoutine}</p>
              </div>
            </div>
          )}

          {wellness.energyPatterns && (
            <div className="space-y-3">
              <h4 className="font-medium">Energy Patterns</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sunrise className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Morning</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getEnergyRating(wellness.energyPatterns.morning).color}`} />
                    <span className="text-lg font-bold">{wellness.energyPatterns.morning}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getEnergyRating(wellness.energyPatterns.morning).label}
                  </p>
                </div>

                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Afternoon</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getEnergyRating(wellness.energyPatterns.afternoon).color}`} />
                    <span className="text-lg font-bold">{wellness.energyPatterns.afternoon}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getEnergyRating(wellness.energyPatterns.afternoon).label}
                  </p>
                </div>

                <div className="text-center p-4 rounded-lg bg-secondary">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sunset className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Evening</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getEnergyRating(wellness.energyPatterns.evening).color}`} />
                    <span className="text-lg font-bold">{wellness.energyPatterns.evening}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getEnergyRating(wellness.energyPatterns.evening).label}
                  </p>
                </div>
              </div>
            </div>
          )}

          {wellness.stressManagement && wellness.stressManagement.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Stress Management
              </h4>
              <div className="space-y-2">
                {wellness.stressManagement.map((method, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span className="text-sm">{method}</span>
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