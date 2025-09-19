'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { useOnboardingStore } from '@/stores/onboarding'
import { commitmentsSchema } from '@/lib/validations'
import { StepContainer } from '../StepContainer'
import { cn } from '@/lib/utils'
import { Plus, X, Calendar, Clock } from 'lucide-react'
import { z } from 'zod'

type CommitmentsData = z.infer<typeof commitmentsSchema>

interface CommitmentsStepProps {
  onNext: () => void
  onPrevious: () => void
  isLastStep?: boolean
}

const frequencyOptions = [
  'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'As needed'
]

const priorityOptions = [
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' }
]

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export function CommitmentsStep({ onNext, onPrevious, isLastStep = false }: CommitmentsStepProps) {
  const { updateFormSection } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isValid }
  } = useForm<CommitmentsData>({
    defaultValues: {
      recurring: [{ title: '', frequency: '', day: '', time: '', endTime: '', travelTime: 0 }],
      projects: [{ name: '', priority: 'medium' as const }]
    },
    mode: 'onChange'
  })

  const { fields: recurringFields, append: appendRecurring, remove: removeRecurring } = useFieldArray({
    control,
    name: 'recurring'
  })

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  })

  const onSubmit = (data: CommitmentsData) => {
    // Filter out empty commitments
    const cleanedData = {
      recurring: data.recurring.filter(item => item.title.trim() !== ''),
      projects: data.projects.filter(project => project.name.trim() !== '')
    }
    updateFormSection('commitments', cleanedData, 6)
    onNext()
  }

  return (
    <StepContainer
      title="Current Commitments & Goals"
      description="Tell us about your existing responsibilities and ongoing projects so we can plan around them."
      onNext={handleSubmit(onSubmit)}
      onPrevious={onPrevious}
      isLastStep={isLastStep}
      isNextDisabled={!isValid}
    >
      <form className="space-y-8">
        {/* Recurring Commitments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recurring Commitments</h3>
          </div>
          <p className="text-sm text-gray-600">
            Regular meetings, classes, appointments, or activities you need to attend. Include travel time after to account for commuting back.
          </p>

          <div className="space-y-4">
            {recurringFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title/Description
                    </label>
                    <input
                      {...register(`recurring.${index}.title`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                      placeholder="e.g., CS 556 Lecture, Team Meeting, Gym"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      {...register(`recurring.${index}.frequency`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    >
                      <option value="">Select frequency</option>
                      {frequencyOptions.map((freq) => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day (for weekly/bi-weekly)
                      </label>
                      <select
                        {...register(`recurring.${index}.day`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                      >
                        <option value="">Select day</option>
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Travel Time After (optional)
                      </label>
                      <select
                        {...register(`recurring.${index}.travelTime`, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                      >
                        <option value={0}>No travel time</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1 hour 30 minutes</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time (optional)
                      </label>
                      <input
                        {...register(`recurring.${index}.time`)}
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time (optional)
                      </label>
                      <input
                        {...register(`recurring.${index}.endTime`)}
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>

                {recurringFields.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRecurring(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendRecurring({ title: '', frequency: '', day: '', time: '', endTime: '', travelTime: 0 })}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add another commitment
            </button>
          </div>
        </div>

        {/* Current Projects */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Current Projects & Goals</h3>
          </div>
          <p className="text-sm text-gray-600">
            Ongoing projects, assignments, or personal goals you&apos;re working on.
          </p>

          <div className="space-y-4">
            {projectFields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project/Goal Name
                    </label>
                    <input
                      {...register(`projects.${index}.name`)}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                      placeholder="e.g., Capstone Project, Learn Python, Build Portfolio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline (optional)
                    </label>
                    <input
                      {...register(`projects.${index}.deadline`, { valueAsDate: true })}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-2">
                    {priorityOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          {...register(`projects.${index}.priority`)}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <div className={cn(
                          "px-3 py-1 border rounded-lg text-xs font-medium cursor-pointer",
                          "transition-all duration-200",
                          watch(`projects.${index}.priority`) === option.value
                            ? option.color
                            : "border-gray-300 hover:border-gray-400 text-gray-700"
                        )}>
                          {option.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {projectFields.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendProject({ name: '', priority: 'medium' })}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add another project
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Almost done!</strong> We&apos;ll use this information to ensure your daily plans respect your existing commitments and help you make progress on your goals.
              </p>
            </div>
          </div>
        </div>
      </form>
    </StepContainer>
  )
}