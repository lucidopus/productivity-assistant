import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getWeeklyPlansCollection } from "./mongodb";
import { HARDCODED_USER_ID } from "./constants";
import { TaskItem } from "@/types/bella";
import { WeekdayType, RescheduleTaskOutput } from "@/types/daily";

export const getTodayPlanTool = tool(
  async (input: unknown) => {
    const { weekday } = input as { weekday: WeekdayType };
    try {
      const weeklyPlansCollection = await getWeeklyPlansCollection();
      const activePlan = await weeklyPlansCollection.findOne({
        userId: HARDCODED_USER_ID,
        status: 'active'
      });

      if (!activePlan) {
        throw new Error("No active weekly plan found");
      }

      const dayPlan = activePlan.days[weekday];
      if (!dayPlan) {
        return JSON.stringify({
          success: false,
          message: `No plan found for ${weekday}`,
          tasks: []
        });
      }

      return JSON.stringify({
        success: true,
        weekday,
        date: dayPlan.date,
        tasks: dayPlan.tasks,
        tasksCount: dayPlan.tasks.length
      });
    } catch (error) {
      throw new Error(`Failed to get today's plan: ${(error as Error).message}`);
    }
  },
  {
    name: "get_today_plan",
    description: "Retrieve today's schedule from the active weekly plan",
    schema: z.object({
      weekday: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday"])
        .describe("Current weekday to get plan for")
    })
  }
);

export const updateWeeklyPlanTool = tool(
  async (input: unknown) => {
    const { weekday, updatedTasks } = input as { weekday: WeekdayType; updatedTasks: TaskItem[] };
    try {
      const weeklyPlansCollection = await getWeeklyPlansCollection();

      const result = await weeklyPlansCollection.updateOne(
        { userId: HARDCODED_USER_ID, status: 'active' },
        {
          $set: {
            [`days.${weekday}.tasks`]: updatedTasks,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error("No active weekly plan found to update");
      }

      return JSON.stringify({
        success: true,
        weekday,
        tasksCount: updatedTasks.length,
        message: `Successfully updated ${weekday}'s schedule with ${updatedTasks.length} tasks`
      });
    } catch (error) {
      throw new Error(`Failed to update weekly plan: ${(error as Error).message}`);
    }
  },
  {
    name: "update_weekly_plan",
    description: "Update specific day's tasks in the weekly plan",
    schema: z.object({
      weekday: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday"]),
      updatedTasks: z.array(z.object({
        time: z.string().describe("Time in HH:MM AM/PM format"),
        task: z.string().describe("Task description"),
        duration: z.number().optional().describe("Duration in minutes"),
        type: z.enum(["routine", "work", "break", "personal", "travel"]).optional()
      }))
    })
  }
);

export const rescheduleTaskTool = tool(
  async (input: unknown): Promise<RescheduleTaskOutput> => {
    const { originalTask, originalDay, reason, preferredDays } = input as {
      originalTask: TaskItem;
      originalDay: WeekdayType;
      reason: string;
      preferredDays?: string[]
    };
    try {
      const weeklyPlansCollection = await getWeeklyPlansCollection();
      const activePlan = await weeklyPlansCollection.findOne({
        userId: HARDCODED_USER_ID,
        status: 'active'
      });

      if (!activePlan) {
        throw new Error("No active weekly plan found");
      }

      // Determine available days for rescheduling
      const availableDays = preferredDays || ["tuesday", "wednesday", "thursday", "friday"];
      const targetDay = findAvailableTimeSlot(activePlan, originalTask, availableDays);

      if (!targetDay) {
        throw new Error("No available time slots found for rescheduling");
      }

      // Remove task from original day
      const originalDayTasks = activePlan.days[originalDay].tasks.filter(
        (task: TaskItem) => task.time !== originalTask.time || task.task !== originalTask.task
      );

      // Add task to target day (for now, append to end - could be made smarter)
      const targetDayTasks = [...activePlan.days[targetDay.day].tasks, {
        ...originalTask,
        time: targetDay.suggestedTime
      }];

      // Update both days in the database
      const updateResult = await weeklyPlansCollection.updateOne(
        { userId: HARDCODED_USER_ID, status: 'active' },
        {
          $set: {
            [`days.${originalDay}.tasks`]: originalDayTasks,
            [`days.${targetDay.day}.tasks`]: targetDayTasks,
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        throw new Error("Failed to update weekly plan with rescheduled task");
      }

      return JSON.stringify({
        success: true,
        rescheduledTo: targetDay.day,
        reason,
        newTimeSlot: targetDay.suggestedTime
      });
    } catch (error) {
      throw new Error(`Failed to reschedule task: ${(error as Error).message}`);
    }
  },
  {
    name: "reschedule_task",
    description: "Find new time slot for incomplete task in remaining week",
    schema: z.object({
      originalTask: z.object({
        time: z.string(),
        task: z.string(),
        duration: z.number().optional(),
        type: z.string().optional()
      }),
      originalDay: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday"]),
      reason: z.string().describe("Reason for rescheduling"),
      preferredDays: z.array(z.string()).optional()
        .describe("Preferred days for rescheduling (defaults to remaining week)")
    })
  }
);

// Helper function to find available time slots
function findAvailableTimeSlot(
  weeklyPlan: Record<string, unknown>,
  taskToReschedule: TaskItem,
  availableDays: string[]
): { day: WeekdayType; suggestedTime: string } | null {
  const workingHours = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
  const planDays = weeklyPlan.days as Record<string, { tasks: TaskItem[] }>;

  for (const day of availableDays) {
    if (day in planDays) {
      const dayPlan = planDays[day as WeekdayType];
      const existingTimes = dayPlan.tasks.map((task: TaskItem) => task.time);

      // Find first available working hour
      for (const time of workingHours) {
        if (!existingTimes.includes(time)) {
          return {
            day: day as WeekdayType,
            suggestedTime: time
          };
        }
      }
    }
  }

  // If no slots available in working hours, suggest end of day
  const fallbackDay = availableDays[0] as WeekdayType;
  return {
    day: fallbackDay,
    suggestedTime: "6:00 PM"
  };
}

// Helper function to get current weekday
export function getCurrentWeekday(): WeekdayType {
  const days: WeekdayType[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Convert to weekday index (0 = Monday)
  const weekdayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

  // Return weekday or default to monday if weekend
  return weekdayIndex < 5 ? days[weekdayIndex] : 'monday';
}

// Helper function to get active weekly plan ID
export async function getActiveWeeklyPlanId(userId: string): Promise<string | undefined> {
  try {
    const weeklyPlansCollection = await getWeeklyPlansCollection();
    const activePlan = await weeklyPlansCollection.findOne({
      userId,
      status: 'active'
    });
    return activePlan?._id?.toString();
  } catch (error) {
    console.error('Error getting active weekly plan ID:', error);
    return undefined;
  }
}