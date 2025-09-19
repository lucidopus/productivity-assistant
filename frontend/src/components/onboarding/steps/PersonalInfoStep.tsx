'use client'

import { useForm } from 'react-hook-form'
import { useOnboardingStore } from '@/stores/onboarding'
import { personalInfoSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { z } from 'zod'

type PersonalInfoData = z.infer<typeof personalInfoSchema>

interface PersonalInfoStepProps {
  onNext: () => void
  onPrevious: () => void
  showPrevious?: boolean
}

const personalValues = [
  'Family time', 'Career growth', 'Health & wellness', 'Learning',
  'Creativity', 'Financial security', 'Work-life balance', 'Adventure',
  'Community service', 'Independence', 'Stability', 'Innovation'
]

const livingStatusOptions = [
  'Live alone', 'With family', 'With roommates', 'With partner/spouse'
]

export function PersonalInfoStep({ onNext, onPrevious, showPrevious = true }: PersonalInfoStepProps) {
  const { currentFormData, updateFormSection } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<PersonalInfoData>({
    mode: 'onChange',
    defaultValues: {
      name: currentFormData?.personal?.name || '',
      dateOfBirth: new Date(),
      location: {
        city: '',
        country: '',
        timezone: ''
      },
      background: {
        livingStatus: '',
        personalValues: [],
        culturalContext: ''
      }
    }
  })

  const selectedValues = watch('background.personalValues') || []

  const onSubmit = (data: PersonalInfoData) => {
    try {
      personalInfoSchema.parse(data)
      updateFormSection('personal', data, 1)
      onNext()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const toggleValue = (value: string) => {
    const currentValues = selectedValues
    if (currentValues.includes(value)) {
      setValue('background.personalValues', currentValues.filter(v => v !== value))
    } else {
      setValue('background.personalValues', [...currentValues, value])
    }
  }

  return (
    <StepContainer
      title="Tell us about yourself"
      description="Help us understand your background and what matters most to you."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      showPrevious={showPrevious}
      isNextDisabled={!isValid}
    >
      <form className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              className={cn(
                "w-full px-4 py-3 border rounded-xl text-gray-900",
                "focus:ring-2 focus:ring-black focus:border-transparent",
                "transition-colors duration-200",
                errors.name ? "border-red-300" : "border-gray-300"
              )}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              {...register('dateOfBirth', { valueAsDate: true })}
              type="date"
              className={cn(
                "w-full px-4 py-3 border rounded-xl text-gray-900",
                "focus:ring-2 focus:ring-black focus:border-transparent",
                "transition-colors duration-200",
                errors.dateOfBirth ? "border-red-300" : "border-gray-300"
              )}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                {...register('location.city')}
                type="text"
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.location?.city ? "border-red-300" : "border-gray-300"
                )}
                placeholder="e.g., New York"
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                {...register('location.country')}
                type="text"
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-gray-900",
                  "focus:ring-2 focus:ring-black focus:border-transparent",
                  "transition-colors duration-200",
                  errors.location?.country ? "border-red-300" : "border-gray-300"
                )}
                placeholder="e.g., United States"
              />
              {errors.location?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              {...register('location.timezone')}
              className={cn(
                "w-full px-4 py-3 border rounded-xl text-gray-900",
                "focus:ring-2 focus:ring-black focus:border-transparent",
                "transition-colors duration-200",
                errors.location?.timezone ? "border-red-300" : "border-gray-300"
              )}
            >
              <option value="">Select your timezone</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">GMT</option>
              <option value="Europe/Paris">CET</option>
              <option value="Asia/Tokyo">JST</option>
              <option value="Asia/Shanghai">CST</option>
            </select>
            {errors.location?.timezone && (
              <p className="mt-1 text-sm text-red-600">{errors.location.timezone.message}</p>
            )}
          </div>
        </div>

        {/* Background */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Living Situation</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who do you live with?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {livingStatusOptions.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    {...register('background.livingStatus')}
                    type="radio"
                    value={option}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex-1 px-4 py-3 border rounded-xl text-center cursor-pointer",
                    "transition-all duration-200",
                    watch('background.livingStatus') === option
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  )}>
                    {option}
                  </div>
                </label>
              ))}
            </div>
            {errors.background?.livingStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.background.livingStatus.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cultural Context (Optional)
            </label>
            <textarea
              {...register('background.culturalContext')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
              placeholder="Tell us about your cultural background or anything that influences your daily life..."
            />
          </div>
        </div>

        {/* Personal Values */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Values</h3>
          <p className="text-sm text-gray-600">
            Select the values that are most important to you (choose at least one):
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {personalValues.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleValue(value)}
                className={cn(
                  "px-4 py-3 border rounded-xl text-sm font-medium",
                  "transition-all duration-200",
                  selectedValues.includes(value)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                )}
              >
                {value}
              </button>
            ))}
          </div>
          {errors.background?.personalValues && (
            <p className="mt-1 text-sm text-red-600">{errors.background.personalValues.message}</p>
          )}
        </div>
      </form>
    </StepContainer>
  )
}