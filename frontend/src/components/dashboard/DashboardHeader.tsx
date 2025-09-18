'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Settings, User, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface DashboardHeaderProps {
  userName: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function DashboardHeader({ userName, onRefresh, isRefreshing = false }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome back, {userName.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Here's your personalized productivity dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                title="Refresh Dashboard"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <Link
              href="/"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              title="Go Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}