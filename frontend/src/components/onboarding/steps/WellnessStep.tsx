'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboardingStore } from '@/stores/onboarding'
import { wellnessSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { z } from 'zod'

type WellnessData = z.infer<typeof wellnessSchema>

interface WellnessStepProps {
  onNext: () => void
  onPrevious: () => void
}

const stressManagementOptions = [
  'Exercise/Physical activity', 'Meditation/Mindfulness', 'Deep breathing',
  'Talking to friends/family', 'Listening to music', 'Reading',
  'Taking walks', 'Journaling', 'Taking breaks', 'Getting enough sleep',
  'Time in nature', 'Hobbies/Creative activities'
]

export function WellnessStep({ onNext, onPrevious }: WellnessStepProps) {
  const { progress, updateFormSection } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<WellnessData>({
    resolver: zodResolver(wellnessSchema),
    defaultValues: progress.formData.wellness || {
      energyPatterns: { morning: '5', afternoon: '5', evening: '5' },
      stressManagement: []
    },
    mode: 'onTouched'
  })

  const selectedStressManagement = watch('stressManagement') || []

  const onSubmit = (data: WellnessData) => {
    updateFormSection('wellness', data)
    onNext()
  }

  const toggleStressManagement = (technique: string) => {
    const currentTechniques = selectedStressManagement
    if (currentTechniques.includes(technique)) {
      setValue('stressManagement', currentTechniques.filter(t => t !== technique))
    } else {
      setValue('stressManagement', [...currentTechniques, technique])
    }
  }

  const energyLevels = [
    { value: 1, label: 'Very Low' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Below Average' },
    { value: 4, label: 'Average' },
    { value: 5, label: 'Good' },
    { value: 6, label: 'Above Average' },
    { value: 7, label: 'High' },
    { value: 8, label: 'Very High' },
    { value: 9, label: 'Excellent' },
    { value: 10, label: 'Peak Energy' }
  ]

  return (
    <StepContainer
      title="Health & Wellness"
      description="Your physical and mental well-being affects your productivity. Let's understand your patterns."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      isNextDisabled={!isValid}
    >
      <form className="space-y-6">
        {/* Exercise Routine */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Exercise & Physical Activity</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your current exercise routine (optional)
            </label>
            <textarea
              {...register('exerciseRoutine')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
              placeholder="e.g., I go to the gym 3 times a week, run on weekends, walk 30 minutes daily..."
            />
            <p className="mt-1 text-xs text-gray-500">
              This helps us understand how physical activity fits into your schedule.
            </p>
          </div>
        </div>

        {/* Energy Patterns */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Energy Levels Throughout the Day</h3>
          <p className="text-sm text-gray-600">
            Rate your typical energy levels during different parts of the day (1 = Very Low, 10 = Peak Energy):
          </p>

          <div className="space-y-4">
            {/* Morning Energy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Morning Energy (6 AM - 12 PM)
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {energyLevels.map((level) => (
                  <label key={`morning-${level.value}`} className="flex flex-col items-center">
                    <input
                      {...register('energyPatterns.morning')}
                      type="radio"
                      value={level.value.toString()}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium cursor-pointer",
                      "transition-all duration-200",
                      parseInt(watch('energyPatterns.morning') || '0') === level.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    )}>
                      {level.value}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 text-center">{level.label}</span>
                  </label>
                ))}
              </div>
              {errors.energyPatterns?.morning && (
                <p className="mt-1 text-sm text-red-600">{errors.energyPatterns.morning.message}</p>
              )}
            </div>

            {/* Afternoon Energy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Afternoon Energy (12 PM - 6 PM)
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {energyLevels.map((level) => (
                  <label key={`afternoon-${level.value}`} className="flex flex-col items-center">
                    <input
                      {...register('energyPatterns.afternoon')}
                      type="radio"
                      value={level.value.toString()}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium cursor-pointer",
                      "transition-all duration-200",
                      parseInt(watch('energyPatterns.afternoon') || '0') === level.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    )}>
                      {level.value}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 text-center">{level.label}</span>
                  </label>
                ))}
              </div>
              {errors.energyPatterns?.afternoon && (
                <p className="mt-1 text-sm text-red-600">{errors.energyPatterns.afternoon.message}</p>
              )}
            </div>

            {/* Evening Energy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Evening Energy (6 PM - 12 AM)
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {energyLevels.map((level) => (
                  <label key={`evening-${level.value}`} className="flex flex-col items-center">
                    <input
                      {...register('energyPatterns.evening')}
                      type="radio"
                      value={level.value.toString()}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium cursor-pointer",
                      "transition-all duration-200",
                      parseInt(watch('energyPatterns.evening') || '0') === level.value
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-400"
                    )}>
                      {level.value}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 text-center">{level.label}</span>
                  </label>
                ))}
              </div>
              {errors.energyPatterns?.evening && (
                <p className="mt-1 text-sm text-red-600">{errors.energyPatterns.evening.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stress Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Stress Management</h3>
          <p className="text-sm text-gray-600">
            How do you typically manage stress? (select at least one)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stressManagementOptions.map((technique) => (
              <button
                key={technique}
                type="button"
                onClick={() => toggleStressManagement(technique)}
                className={cn(
                  "px-3 py-2 border rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  selectedStressManagement.includes(technique)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                )}
              >
                {technique}
              </button>
            ))}
          </div>
          {errors.stressManagement && (
            <p className="mt-1 text-sm text-red-600">{errors.stressManagement.message}</p>
          )}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-purple-600 text-xl">🧘</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-purple-800">
                <strong>Wellness matters!</strong> We'll factor in your energy patterns and stress management techniques when creating your daily plans.
              </p>
            </div>
          </div>
        </div>
      </form>
    </StepContainer>
  )
}