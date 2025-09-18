'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-48 bg-secondary rounded animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-9 w-9 bg-secondary rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-secondary rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading your dashboard...</h2>
            <p className="text-muted-foreground">Gathering your personalized data</p>
          </motion.div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border rounded-lg bg-card shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-5 bg-secondary rounded animate-pulse" />
                  <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-secondary rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}