'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface StepContainerProps {
  title: string
  description: string
  children: ReactNode
  onNext?: () => void
  onPrevious?: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  isLastStep?: boolean
  showPrevious?: boolean
  isLoading?: boolean
}

export function StepContainer({
  title,
  description,
  children,
  onNext,
  onPrevious,
  nextLabel = 'Continue',
  isNextDisabled = false,
  isLastStep = false,
  showPrevious = true,
  isLoading = false
}: StepContainerProps) {
  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4 relative">
      <ThemeToggle />
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-2xl mx-auto"
      >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">{title}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {children}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex justify-between items-center"
      >
        {showPrevious ? (
          <Button
            variant="ghost"
            onClick={onPrevious}
            className="gap-2 px-6 py-3 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          loading={isLoading}
          size="lg"
          className="gap-2 px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl"
        >
          {isLastStep ? 'Complete Setup' : nextLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
      </motion.div>
    </div>
  )
}