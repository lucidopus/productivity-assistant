'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

export function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Step Indicators */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={cn(
                "w-4 h-4 rounded-full border-2 bg-white -mt-1 flex items-center justify-center",
                index <= currentStep ? "border-black" : "border-gray-300",
                step.completed && "bg-black"
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {step.completed && (
                <Check className="w-2 h-2 text-white" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-sm">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "text-center max-w-20",
              index <= currentStep ? "text-black font-medium" : "text-gray-400"
            )}
          >
            {step.title}
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-4">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
    </div>
  )
}