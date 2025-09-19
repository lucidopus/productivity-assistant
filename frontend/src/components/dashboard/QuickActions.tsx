'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Plus, Calendar, Settings, BarChart3, Target, Edit } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      title: 'Add Project',
      description: 'Create a new project',
      icon: Plus,
      color: 'text-foreground',
      bgColor: 'bg-background/50',
      hoverColor: 'hover:bg-background/70',
      borderColor: 'border-border/40',
      action: () => console.log('Add project')
    },
    {
      title: 'Schedule Event',
      description: 'Add to calendar',
      icon: Calendar,
      color: 'text-foreground',
      bgColor: 'bg-background/50',
      hoverColor: 'hover:bg-background/70',
      borderColor: 'border-border/40',
      action: () => console.log('Schedule event')
    },
    {
      title: 'View Analytics',
      description: 'Check productivity',
      icon: BarChart3,
      color: 'text-foreground',
      bgColor: 'bg-background/50',
      hoverColor: 'hover:bg-background/70',
      borderColor: 'border-border/40',
      action: () => console.log('View analytics')
    },
    {
      title: 'Set Goals',
      description: 'Update targets',
      icon: Target,
      color: 'text-foreground',
      bgColor: 'bg-background/50',
      hoverColor: 'hover:bg-background/70',
      borderColor: 'border-border/40',
      action: () => console.log('Set goals')
    },
    {
      title: 'Edit Profile',
      description: 'Update information',
      icon: Edit,
      color: 'text-foreground',
      bgColor: 'bg-background/50',
      hoverColor: 'hover:bg-background/70',
      borderColor: 'border-border/40',
      action: () => console.log('Edit profile')
    },
    {
      title: 'Settings',
      description: 'App preferences',
      icon: Settings,
      color: 'text-foreground',
      bgColor: 'bg-background/50',
      hoverColor: 'hover:bg-background/70',
      borderColor: 'border-border/40',
      action: () => console.log('Settings')
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
      className="mb-12"
    >
      <div className="relative">
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-foreground" />
                </div>
                Quick Actions
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.6 + index * 0.08,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -8,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{
                      scale: 0.95,
                      transition: { duration: 0.1 }
                    }}
                    onClick={action.action}
                    className={`relative group p-6 rounded-xl ${action.bgColor} ${action.hoverColor} border ${action.borderColor} hover:border-opacity-80 transition-all duration-300 text-left hover:shadow-lg`}
                  >
                    <div className="relative flex flex-col items-center text-center space-y-3">
                      {/* Icon container with glassmorphism */}
                      <div className="h-12 w-12 rounded-xl bg-foreground/10 backdrop-blur-sm border border-border/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground group-hover:text-foreground/90 transition-colors">
                          {action.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    {/* Subtle hover accent */}
                    <div className="absolute inset-0 rounded-xl bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}