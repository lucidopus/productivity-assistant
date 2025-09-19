'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'

export function CompletionStep() {
  const { currentFormData } = useOnboardingStore()

  const completionPercentage = Math.round(
    (Object.keys(currentFormData || {}).length / 6) * 100
  )

  const handleContinue = () => {
    // Navigate to dashboard since onboarding is complete
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-black mb-4">
            Welcome to Your AI Assistant!
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Perfect! We&apos;ve gathered everything we need to create your personalized productivity experience.
            Your AI assistant now understands your preferences, schedule, and goals.
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Profile Complete</h3>
            <p className="text-sm text-gray-600">
              {completionPercentage}% of your profile information collected
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Goals Set</h3>
            <p className="text-sm text-gray-600">
              Ready to help you achieve your weekly targets
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Ready</h3>
            <p className="text-sm text-gray-600">
              Your assistant is configured and ready to help
            </p>
          </div>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">What happens next?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">📅 Weekly Planning</h3>
              <p className="text-gray-300 text-sm">
                Every Sunday at 9 PM, your AI will reach out via Slack to plan your week together.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📱 Daily Check-ins</h3>
              <p className="text-gray-300 text-sm">
                Each evening at 10 PM, you&apos;ll receive a personalized plan for the next day.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🎯 Smart Planning</h3>
              <p className="text-gray-300 text-sm">
                Plans will adapt to your energy levels, commitments, and progress on goals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📈 Continuous Learning</h3>
              <p className="text-gray-300 text-sm">
                Your assistant learns from your patterns to make better recommendations over time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <button
            onClick={handleContinue}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl text-lg font-medium transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Continue to Home
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            You can always update your preferences later in settings
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}