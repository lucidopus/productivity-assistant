'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading your dashboard. This might be a temporary issue.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-2 p-4 bg-secondary rounded-lg text-xs overflow-auto">
                {error.message}
                {error.digest && `\nError ID: ${error.digest}`}
              </pre>
            </details>
          )}
        </motion.div>
      </div>
    </div>
  )
}