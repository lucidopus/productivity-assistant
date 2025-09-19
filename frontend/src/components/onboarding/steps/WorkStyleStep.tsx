'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboardingStore } from '@/stores/onboarding'
import { workStyleSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { z } from 'zod'

type WorkStyleData = z.infer<typeof workStyleSchema>

interface WorkStyleStepProps {
  onNext: () => void
  onPrevious: () => void
}

const planningOptions = [
  { value: 'detailed', label: 'Detailed', description: 'I like specific plans with exact times and tasks' },
  { value: 'flexible', label: 'Flexible', description: 'I prefer loose guidelines and adapt as I go' },
  { value: 'mixed', label: 'Mixed', description: 'I like some structure but need flexibility for changes' }
]

const taskPreferences = [
  'Deep work sessions', 'Quick wins', 'Creative tasks', 'Analytical work',
  'Meetings & collaboration', 'Learning & research', 'Administrative tasks',
  'Physical activities', 'Problem solving', 'Writing & documentation'
]

const motivators = [
  'Progress tracking', 'Achievement rewards', 'Deadlines', 'Competition',
  'Learning new things', 'Helping others', 'Recognition', 'Autonomy',
  'Variety in tasks', 'Clear goals', 'Team collaboration', 'Personal growth'
]

const blockers = [
  'Perfectionism', 'Procrastination', 'Distractions (social media)', 'Unclear priorities',
  'Overwhelming workload', 'Lack of energy', 'Interruptions', 'Boring tasks',
  'Technical difficulties', 'Poor sleep', 'Stress/anxiety', 'Lack of motivation'
]

const focusDurationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 25, label: '25 minutes (Pomodoro)' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3+ hours' }
]

export function WorkStyleStep({ onNext, onPrevious }: WorkStyleStepProps) {
  const { progress, currentFormData, updateFormSection } = useOnboardingStore()

  const defaultValues = currentFormData?.workStyle || {
    planningPreference: 'mixed' as const,
    focusDuration: '60',
    taskPreferences: [],
    motivators: [],
    blockers: []
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<WorkStyleData>({
    resolver: zodResolver(workStyleSchema),
    defaultValues,
    mode: 'onTouched'
  })

  const selectedTaskPreferences = watch('taskPreferences') || []
  const selectedMotivators = watch('motivators') || []
  const selectedBlockers = watch('blockers') || []

  const onSubmit = (data: WorkStyleData) => {
    updateFormSection('workStyle', data, 4)
    onNext()
  }

  // Check if form has minimum required data
  const hasMinimumData = () => {
    const currentData = watch()
    return (
      currentData.planningPreference &&
      currentData.focusDuration &&
      currentData.taskPreferences?.length > 0 &&
      currentData.motivators?.length > 0 &&
      currentData.blockers?.length > 0
    )
  }

  const toggleSelection = (field: 'taskPreferences' | 'motivators' | 'blockers', value: string) => {
    const currentValues = watch(field) || []
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value))
    } else {
      setValue(field, [...currentValues, value])
    }
  }

  return (
    <StepContainer
      title="Your Work Style"
      description="Understanding how you work best helps us create more effective plans."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      isNextDisabled={!hasMinimumData()}
    >
      <form className="space-y-6">
        {/* Planning Preference */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Planning Style</h3>
          <p className="text-sm text-gray-600">
            How do you prefer your daily plans to be structured?
          </p>

          <div className="space-y-3">
            {planningOptions.map((option) => (
              <label key={option.value} className="flex items-start">
                <input
                  {...register('planningPreference')}
                  type="radio"
                  value={option.value}
                  className="sr-only"
                />
                <div className={cn(
                  "flex-1 p-4 border rounded-xl cursor-pointer",
                  "transition-all duration-200",
                  watch('planningPreference') === option.value
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400"
                )}>
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className={cn(
                    "text-sm",
                    watch('planningPreference') === option.value ? "text-gray-300" : "text-gray-600"
                  )}>
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.planningPreference && (
            <p className="mt-1 text-sm text-red-600">{errors.planningPreference.message}</p>
          )}
        </div>

        {/* Focus Duration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Focus Duration</h3>
          <p className="text-sm text-gray-600">
            How long can you typically focus on a single task without a break?
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {focusDurationOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  {...register('focusDuration')}
                  type="radio"
                  value={option.value.toString()}
                  className="sr-only"
                />
                <div className={cn(
                  "flex-1 px-3 py-2 border rounded-lg text-center cursor-pointer text-sm",
                  "transition-all duration-200",
                  parseInt(watch('focusDuration') || '0') === option.value
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400"
                )}>
                  {option.label}
                </div>
              </label>
            ))}
          </div>
          {errors.focusDuration && (
            <p className="mt-1 text-sm text-red-600">{errors.focusDuration.message}</p>
          )}
        </div>

        {/* Task Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Preferences</h3>
          <p className="text-sm text-gray-600">
            What types of tasks do you enjoy or perform best? (select at least one)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {taskPreferences.map((task) => (
              <button
                key={task}
                type="button"
                onClick={() => toggleSelection('taskPreferences', task)}
                className={cn(
                  "px-3 py-2 border rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  selectedTaskPreferences.includes(task)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                )}
              >
                {task}
              </button>
            ))}
          </div>
          {errors.taskPreferences && (
            <p className="mt-1 text-sm text-red-600">{errors.taskPreferences.message}</p>
          )}
        </div>

        {/* Motivators */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">What Motivates You</h3>
          <p className="text-sm text-gray-600">
            Select what helps keep you motivated and productive (select at least one):
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {motivators.map((motivator) => (
              <button
                key={motivator}
                type="button"
                onClick={() => toggleSelection('motivators', motivator)}
                className={cn(
                  "px-3 py-2 border rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  selectedMotivators.includes(motivator)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                )}
              >
                {motivator}
              </button>
            ))}
          </div>
          {errors.motivators && (
            <p className="mt-1 text-sm text-red-600">{errors.motivators.message}</p>
          )}
        </div>

        {/* Blockers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Common Blockers</h3>
          <p className="text-sm text-gray-600">
            What typically gets in the way of your productivity? (select at least one)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {blockers.map((blocker) => (
              <button
                key={blocker}
                type="button"
                onClick={() => toggleSelection('blockers', blocker)}
                className={cn(
                  "px-3 py-2 border rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  selectedBlockers.includes(blocker)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                )}
              >
                {blocker}
              </button>
            ))}
          </div>
          {errors.blockers && (
            <p className="mt-1 text-sm text-red-600">{errors.blockers.message}</p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-600 text-xl">🎯</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                <strong>Great!</strong> Understanding your work style helps us create plans that work with your natural tendencies, not against them.
              </p>
            </div>
          </div>
        </div>
      </form>
    </StepContainer>
  )
}