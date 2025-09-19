'use client'

import { useForm } from 'react-hook-form'
import { useOnboardingStore } from '@/stores/onboarding'
import { professionalInfoSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'
import { useState } from 'react'

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
  const { updateFormSection } = useOnboardingStore()

  // Simple state management for arrays
  const [shortTermGoals, setShortTermGoals] = useState<string[]>([''])
  const [longTermGoals, setLongTermGoals] = useState<string[]>([''])
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProfessionalInfoData>({
    mode: 'onChange',
    defaultValues: {
      status: 'student' as const,
      workLocation: 'remote' as const,
      organization: '',
      role: '',
      experience: 0,
      goals: {
        shortTerm: [''] as string[],
        longTerm: [''] as string[],
        skillsDevelopment: [''] as string[]
      }
    }
  })

  const currentStatus = watch('status')

  const onSubmit = (data: ProfessionalInfoData) => {
    try {
      // Filter out empty goals but ensure at least one exists
      const cleanedData = {
        ...data,
        goals: {
          shortTerm: shortTermGoals.filter(goal => goal.trim() !== ''),
          longTerm: longTermGoals.filter(goal => goal.trim() !== ''),
          skillsDevelopment: skillsToLearn.filter(skill => skill.trim() !== '')
        }
      }

      // Validate with schema
      professionalInfoSchema.parse(cleanedData)
      updateFormSection('professional', cleanedData, 2)
      onNext()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <StepContainer
      title="Your Professional Life"
      description="Tell us about your work or studies and your career aspirations."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      isNextDisabled={false}
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
              {shortTermGoals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...shortTermGoals]
                      newGoals[index] = e.target.value
                      setShortTermGoals(newGoals)
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., Complete my current project, Learn React"
                  />
                  {shortTermGoals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newGoals = shortTermGoals.filter((_, i) => i !== index)
                        setShortTermGoals(newGoals)
                      }}
                      className="px-3 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShortTermGoals([...shortTermGoals, ''])}
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
              {longTermGoals.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...longTermGoals]
                      newGoals[index] = e.target.value
                      setLongTermGoals(newGoals)
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., Become a senior engineer, Start my own company"
                  />
                  {longTermGoals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newGoals = longTermGoals.filter((_, i) => i !== index)
                        setLongTermGoals(newGoals)
                      }}
                      className="px-3 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLongTermGoals([...longTermGoals, ''])}
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
              {skillsToLearn.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...skillsToLearn]
                      newSkills[index] = e.target.value
                      setSkillsToLearn(newSkills)
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    placeholder="e.g., Public speaking, Machine learning, Leadership"
                  />
                  {skillsToLearn.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSkills = skillsToLearn.filter((_, i) => i !== index)
                        setSkillsToLearn(newSkills)
                      }}
                      className="px-3 py-3 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSkillsToLearn([...skillsToLearn, ''])}
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