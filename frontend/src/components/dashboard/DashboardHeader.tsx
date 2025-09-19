'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Settings, User, RefreshCw, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardHeaderProps {
  userName: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function DashboardHeader({ userName, onRefresh, isRefreshing = false }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-foreground/10 flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-foreground/20 rounded-full border-2 border-background" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome back, {userName.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base font-medium">
                  Here&apos;s your personalized productivity dashboard
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {onRefresh && (
              <motion.button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 rounded-lg bg-card hover:bg-accent border border-border/40 hover:border-border/60 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                title="Refresh Dashboard"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            )}

            <motion.button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg bg-card hover:bg-accent border border-border/40 hover:border-border/60 transition-all duration-200 flex items-center justify-center"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm">{theme === 'light' ? '🌙' : '☀️'}</span>
            </motion.button>

            <motion.button
              className="h-9 w-9 rounded-lg bg-card hover:bg-accent border border-border/40 hover:border-border/60 transition-all duration-200 flex items-center justify-center"
              title="Settings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </motion.button>

            <motion.button
              onClick={logout}
              className="h-9 w-9 rounded-lg bg-card hover:bg-destructive/10 border border-border/40 hover:border-destructive/20 transition-all duration-200 flex items-center justify-center group"
              title="Sign out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
            </motion.button>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="h-9 w-9 rounded-lg bg-card hover:bg-accent border border-border/40 hover:border-border/60 transition-all duration-200 flex items-center justify-center"
                title="Go Home"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}