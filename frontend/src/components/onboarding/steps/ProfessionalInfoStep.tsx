'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboardingStore } from '@/stores/onboarding'
import { professionalInfoSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'

type ProfessionalInfoData = z.infer<typeof professionalInfoSchema>

interface ProfessionalInfoStepProps {
  onNext: () => void
  onPrevious: () => void
}

const statusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'other', label: 'Other' }
]

const workLocationOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' }
]

export function ProfessionalInfoStep({ onNext, onPrevious }: ProfessionalInfoStepProps) {
  const { progress, updateFormSection } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid }
  } = useForm<ProfessionalInfoData>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: progress.formData.professional || {
      status: 'student',
      workLocation: 'remote',
      goals: { shortTerm: [''], longTerm: [''], skillsDevelopment: [''] }
    },
    mode: 'onChange'
  })

  const { fields: shortTermFields, append: appendShortTerm, remove: removeShortTerm } = useFieldArray({
    control,
    name: 'goals.shortTerm'
  })

  const { fields: longTermFields, append: appendLongTerm, remove: removeLongTerm } = useFieldArray({
    control,
    name: 'goals.longTerm'
  })

  const { fields: skillsFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'goals.skillsDevelopment'
  })

  const currentStatus = watch('status')

  const onSubmit = (data: ProfessionalInfoData) => {
    // Filter out empty goals
    const cleanedData = {
      ...data,
      goals: {
        shortTerm: data.goals.shortTerm.filter(goal => goal.trim() !== ''),
        longTerm: data.goals.longTerm.filter(goal => goal.trim() !== ''),
        skillsDevelopment: data.goals.skillsDevelopment.filter(skill => skill.trim() !== '')
      }
    }
    updateFormSection('professional', cleanedData)
    onNext()
  }

  return (
    <StepContainer
      title="Your Professional Life"
      description="Tell us about your work or studies and your career aspirations."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      isNextDisabled={!isValid}
    >
      <form className="space-y-6">
        {/* Current Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What best describes your current situation?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    {...register('status')}
                    type="radio"
                    value={option.value}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex-1 px-4 py-3 border rounded-xl text-center cursor-pointer",
                    "transition-all duration-200",
                    currentStatus === option.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  )}>
                    {option.label}
                  </div>
                </label>
              ))}
            </div>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentStatus === 'student' ? 'University/School' : 'Company/Organization'}
              </label>
              <input
                {...register('organization')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                placeholder={currentStatus === 'student' ? 'e.g., Stanford University' : 'e.g., Google'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentStatus === 'student' ? 'Major/Field of Study' : 'Role/Position'}
              </label>
              <input
                {...register('role')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                placeholder={currentStatus === 'student' ? 'e.g., Computer Science' : 'e.g., Software Engineer'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentStatus === 'student' ? 'Year in Program' : 'Years of Experience'}
            </label>
            <input
              {...register('experience', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Work/Study Location
            </label>
            <div className="grid grid-cols-3 gap-3">
              {workLocationOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    {...register('workLocation')}
                    type="radio"
                    value={option.value}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex-1 px-4 py-3 border rounded-xl text-center cursor-pointer",
                    "transition-all duration-200",
                    watch('workLocation') === option.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  )}>
                    {option.label}
                  </div>
                </label>
              ))}
            </div>
            {errors.workLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.workLocation.message}</p>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Goals & Aspirations</h3>

          {/* Short-term Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Short-term Goals (1-6 months)
            </label>
            <div className="space-y-3">
              {shortTermFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`goals.shortTerm.${index}`)}
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., Complete my current project, Learn React"
                  />
                  {shortTermFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeShortTerm(index)}
                      className="px-3 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendShortTerm('')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another goal
              </button>
            </div>
            {errors.goals?.shortTerm && (
              <p className="mt-1 text-sm text-red-600">{errors.goals.shortTerm.message}</p>
            )}
          </div>

          {/* Long-term Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Long-term Goals (1-5 years)
            </label>
            <div className="space-y-3">
              {longTermFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`goals.longTerm.${index}`)}
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., Become a senior engineer, Start my own company"
                  />
                  {longTermFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLongTerm(index)}
                      className="px-3 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendLongTerm('')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another goal
              </button>
            </div>
            {errors.goals?.longTerm && (
              <p className="mt-1 text-sm text-red-600">{errors.goals.longTerm.message}</p>
            )}
          </div>

          {/* Skills Development */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Skills You Want to Develop
            </label>
            <div className="space-y-3">
              {skillsFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`goals.skillsDevelopment.${index}`)}
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., Public speaking, Machine learning, Leadership"
                  />
                  {skillsFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="px-3 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendSkill('')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another skill
              </button>
            </div>
            {errors.goals?.skillsDevelopment && (
              <p className="mt-1 text-sm text-red-600">{errors.goals.skillsDevelopment.message}</p>
            )}
          </div>
        </div>
      </form>
    </StepContainer>
  )
}