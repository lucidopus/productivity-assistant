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
      color: 'text-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30',
      action: () => console.log('Add project')
    },
    {
      title: 'Schedule Event',
      description: 'Add to calendar',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30',
      action: () => console.log('Schedule event')
    },
    {
      title: 'View Analytics',
      description: 'Check productivity',
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/30',
      action: () => console.log('View analytics')
    },
    {
      title: 'Set Goals',
      description: 'Update targets',
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/30',
      action: () => console.log('Set goals')
    },
    {
      title: 'Edit Profile',
      description: 'Update information',
      icon: Edit,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30',
      action: () => console.log('Edit profile')
    },
    {
      title: 'Settings',
      description: 'App preferences',
      icon: Settings,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/20 dark:hover:bg-gray-950/30',
      action: () => console.log('Settings')
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  className={`p-4 rounded-lg ${action.bgColor} border transition-all text-left group`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}