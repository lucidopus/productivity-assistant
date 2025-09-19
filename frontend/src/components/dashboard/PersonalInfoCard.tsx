'use client'

import { UserProfile } from '@/types/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import { User, MapPin, Globe, Heart, Calendar } from 'lucide-react'
import { formatDate, calculateAge } from '@/lib/utils'

interface PersonalInfoCardProps {
  personal: UserProfile['personal']
}

export function PersonalInfoCard({ personal }: PersonalInfoCardProps) {
  return (
    <Card className="h-full glass border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-subheading group-hover:text-primary transition-colors">
          <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <User className="h-5 w-5" />
          </div>
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Name and Age */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <h3 className="text-heading font-semibold text-foreground mb-2">{personal.name}</h3>
            <div className="flex items-center gap-2 text-caption">
              <Calendar className="h-3 w-3" />
              <span>{personal.age ? `${personal.age} years old` : 'Age not specified'}</span>
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-muted/20 to-muted/40 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-all duration-200 group-hover:bg-primary/20 group-hover:ring-primary/30">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-foreground">{personal.location || 'Location not specified'}</p>
                <div className="flex items-center gap-1.5 text-caption">
                  <Globe className="h-3 w-3" />
                  <span>{personal.timezone || 'Timezone not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Background */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
              <Globe className="h-4 w-4 text-accent" />
            </div>
            Background
          </h4>
          <div className="space-y-4 pl-8">
            <div className="space-y-2">
              <span className="text-label font-medium text-muted-foreground">Living Status</span>
              <p className="text-body text-foreground">{personal.background || 'Background not specified'}</p>
            </div>
            {false && (
              <div className="space-y-2">
                <span className="text-label font-medium text-muted-foreground">Cultural Context</span>
                <p className="text-body leading-relaxed text-foreground/90">Cultural context</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Personal Values */}
        {personal.values && personal.values.length > 0 && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="flex items-center gap-2 font-semibold text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-destructive/10">
                <Heart className="h-4 w-4 text-destructive" />
              </div>
              Personal Values
            </h4>
            <div className="flex flex-wrap gap-2 pl-8">
              {personal.values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <Badge
                    variant="outline"
                    className="transition-all duration-200 hover:bg-primary/5 hover:border-primary/30"
                  >
                    {value}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}