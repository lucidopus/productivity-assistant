'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboardingStore } from '@/stores/onboarding'
import { scheduleInfoSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { z } from 'zod'

type ScheduleInfoData = z.infer<typeof scheduleInfoSchema>

interface ScheduleInfoStepProps {
  onNext: () => void
  onPrevious: () => void
}

const productivePeriodOptions = [
  'Early morning (5-8 AM)',
  'Morning (8-12 PM)',
  'Afternoon (12-5 PM)',
  'Evening (5-9 PM)',
  'Late night (9 PM-12 AM)',
  'Night owl (12-5 AM)'
]

export function ScheduleInfoStep({ onNext, onPrevious }: ScheduleInfoStepProps) {
  const { currentFormData, updateFormSection } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ScheduleInfoData>({
    resolver: zodResolver(scheduleInfoSchema as any), // eslint-disable-line @typescript-eslint/no-explicit-any -- Fix for @hookform/resolvers v5 compatibility
    defaultValues: (currentFormData?.schedule as ScheduleInfoData) || {
      wakeTime: '07:00',
      sleepTime: '23:00',
      workHours: { start: '09:00', end: '17:00' },
      productivePeriods: [],
      breakPreferences: { frequency: 2, duration: 15 }
    },
    mode: 'onChange'
  })

  const selectedPeriods = watch('productivePeriods') || []

  const onSubmit = (data: ScheduleInfoData) => {
    updateFormSection('schedule', data, 3)
    onNext()
  }

  const togglePeriod = (period: string) => {
    const currentPeriods = selectedPeriods
    if (currentPeriods.includes(period)) {
      setValue('productivePeriods', currentPeriods.filter(p => p !== period))
    } else {
      setValue('productivePeriods', [...currentPeriods, period])
    }
  }

  return (
    <StepContainer
      title="Your Daily Schedule"
      description="Help us understand your daily routines and when you're most productive."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      isNextDisabled={!isValid}
    >
      <form className="space-y-6">
        {/* Sleep Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sleep Schedule</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wake-up Time
              </label>
              <input
                {...register('wakeTime')}
                type="time"
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.wakeTime ? "border-red-300" : "border-gray-300"
                )}
              />
              {errors.wakeTime && (
                <p className="mt-1 text-sm text-red-600">{errors.wakeTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Time
              </label>
              <input
                {...register('sleepTime')}
                type="time"
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.sleepTime ? "border-red-300" : "border-gray-300"
                )}
              />
              {errors.sleepTime && (
                <p className="mt-1 text-sm text-red-600">{errors.sleepTime.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Work Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Work/Study Hours</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                {...register('workHours.start')}
                type="time"
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.workHours?.start ? "border-red-300" : "border-gray-300"
                )}
              />
              {errors.workHours?.start && (
                <p className="mt-1 text-sm text-red-600">{errors.workHours.start.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                {...register('workHours.end')}
                type="time"
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.workHours?.end ? "border-red-300" : "border-gray-300"
                )}
              />
              {errors.workHours?.end && (
                <p className="mt-1 text-sm text-red-600">{errors.workHours.end.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Productive Periods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Most Productive Times</h3>
          <p className="text-sm text-gray-600">
            Select when you typically feel most focused and energetic (choose at least one):
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            {productivePeriodOptions.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => togglePeriod(period)}
                className={cn(
                  "px-4 py-3 border rounded-xl text-sm font-medium text-left",
                  "transition-all duration-200",
                  selectedPeriods.includes(period)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                )}
              >
                {period}
              </button>
            ))}
          </div>
          {errors.productivePeriods && (
            <p className="mt-1 text-sm text-red-600">{errors.productivePeriods.message}</p>
          )}
        </div>

        {/* Break Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Break Preferences</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many breaks per day?
              </label>
              <select
                {...register('breakPreferences.frequency', { valueAsNumber: true })}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.breakPreferences?.frequency ? "border-red-300" : "border-gray-300"
                )}
              >
                <option value={1}>1 break</option>
                <option value={2}>2 breaks</option>
                <option value={3}>3 breaks</option>
                <option value={4}>4 breaks</option>
                <option value={5}>5+ breaks</option>
              </select>
              {errors.breakPreferences?.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.breakPreferences.frequency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred break duration (minutes)
              </label>
              <select
                {...register('breakPreferences.duration', { valueAsNumber: true })}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.breakPreferences?.duration ? "border-red-300" : "border-gray-300"
                )}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
              {errors.breakPreferences?.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.breakPreferences.duration.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> We&apos;ll use this information to create daily plans that align with your natural energy patterns and preferred schedule.
              </p>
            </div>
          </div>
        </div>
      </form>
    </StepContainer>
  )
}