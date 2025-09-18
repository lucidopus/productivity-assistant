'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Target, Brain, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const features = [
  {
    icon: Target,
    title: 'Personalized Planning',
    description: 'Daily plans based on your energy levels, preferences, and goals',
  },
  {
    icon: Brain,
    title: 'AI Memory',
    description: 'Remembers everything about you and learns from your patterns',
  },
  {
    icon: MessageSquare,
    title: 'Slack Integration',
    description: 'Proactive check-ins and planning through your favorite platform',
  },
]

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4 relative">
      <ThemeToggle />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
        {/* Logo/Icon */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="w-20 h-20 mx-auto bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="w-10 h-10" />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Personal AI
            <br />
            <span className="text-foreground">
              Productivity Assistant
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Let&apos;s build an AI that truly understands you. We&apos;ll gather information about your life,
            work style, and goals to create personalized daily plans that help you achieve your weekly targets.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.25, 0.1, 0.25, 1]
                  },
                },
              }}
              className="group"
            >
              <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/20 cursor-pointer">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="group px-8 py-4 text-lg font-medium rounded-2xl shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Takes about 10-15 minutes • Your data stays secure
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}