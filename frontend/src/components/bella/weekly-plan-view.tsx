'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Target, CheckCircle2, Loader2 } from 'lucide-react';
import { WeeklyPlan, TaskItem } from '@/types/bella';
import { cn } from '@/lib/utils';

interface WeeklyPlanViewProps {
  className?: string;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' }
] as const;

const TASK_TYPE_COLORS = {
  routine: 'bg-blue-100 text-blue-800 border-blue-200',
  work: 'bg-purple-100 text-purple-800 border-purple-200',
  break: 'bg-green-100 text-green-800 border-green-200',
  personal: 'bg-orange-100 text-orange-800 border-orange-200',
  travel: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function WeeklyPlanView({ className }: WeeklyPlanViewProps) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        // Only show loading on initial load
        if (isInitialLoad) {
          setIsLoading(true);
        }

        const response = await fetch('/api/bella/plans');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch plan');
        }

        // Only update state if plan actually changed
        if (data.success && data.hasActivePlan) {
          const newPlan = data.plan;
          setPlan(prevPlan => {
            // Simple comparison - update if no previous plan or plan ID changed
            if (!prevPlan || prevPlan._id !== newPlan._id) {
              return newPlan;
            }
            return prevPlan;
          });
        } else {
          setPlan(null);
        }
      } catch (error) {
        console.error('Failed to fetch weekly plan:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        if (isInitialLoad) {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    fetchActivePlan();

    // Poll for plan updates every 10 seconds
    const interval = setInterval(fetchActivePlan, 10000);
    return () => clearInterval(interval);
  }, [isInitialLoad]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your weekly plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <Target className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-muted-foreground">Failed to load weekly plan</p>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-4">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            No active weekly plan found
          </p>
          <p className="text-sm text-muted-foreground">
            Your plan will appear here after completing the weekly planning session with Bella
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Plan Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Weekly Plan</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(plan.weekStart)} - {formatDate(plan.weekEnd)}
            </span>
          </div>
        </div>

        {/* Weekly Targets */}
        {plan.weeklyTargets && plan.weeklyTargets.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Weekly Targets
            </h3>
            <div className="space-y-2">
              {plan.weeklyTargets.map((target, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-md"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{target}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DAYS.map(({ key, label }) => {
          const dayPlan = plan.days[key as keyof typeof plan.days];

          return (
            <div key={key} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Day Header */}
              <div className="bg-primary/10 px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-center">{label}</h3>
                <p className="text-xs text-center text-muted-foreground">
                  {formatDate(dayPlan.date)}
                </p>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {dayPlan.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks planned
                  </p>
                ) : (
                  dayPlan.tasks.map((task, taskIndex) => (
                    <TaskCard key={taskIndex} task={task} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: TaskItem }) {
  return (
    <div className="p-3 bg-background border border-border rounded-md space-y-2 hover:shadow-sm transition-shadow">
      {/* Time and Type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium">{task.time}</span>
        </div>
        {task.type && (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full border",
              TASK_TYPE_COLORS[task.type] || "bg-gray-100 text-gray-800 border-gray-200"
            )}
          >
            {task.type}
          </span>
        )}
      </div>

      {/* Task Description */}
      <p className="text-sm leading-relaxed">{task.task}</p>

      {/* Duration */}
      {task.duration && (
        <div className="text-xs text-muted-foreground">
          Duration: {task.duration} min
        </div>
      )}
    </div>
  );
}