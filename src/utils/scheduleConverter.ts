
import { ScheduleItem } from '@/types/auth';
import { AIScheduleItem } from '@/services/aiScheduleService';

export const convertAIScheduleToScheduleItems = (aiSchedule: AIScheduleItem[]): ScheduleItem[] => {
  return aiSchedule.map(item => ({
    start: item.start,
    end: item.end,
    task: item.task,
  }));
};

export const validateScheduleItems = (items: ScheduleItem[]): boolean => {
  // Check if all items have required fields
  for (const item of items) {
    if (!item.start || !item.end || !item.task) {
      return false;
    }
  }

  // Check for time format consistency
  const timeFormatRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
  for (const item of items) {
    if (!timeFormatRegex.test(item.start) || !timeFormatRegex.test(item.end)) {
      return false;
    }
  }

  return true;
};

export const detectScheduleConflicts = (items: ScheduleItem[]): string[] => {
  const conflicts: string[] = [];
  
  // Convert time to minutes for easier comparison
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = minutes;
    
    if (period === 'AM') {
      totalMinutes += (hours === 12 ? 0 : hours) * 60;
    } else {
      totalMinutes += (hours === 12 ? 12 : hours + 12) * 60;
    }
    
    return totalMinutes;
  };

  for (let i = 0; i < items.length - 1; i++) {
    const currentEnd = timeToMinutes(items[i].end);
    const nextStart = timeToMinutes(items[i + 1].start);
    
    if (currentEnd > nextStart) {
      conflicts.push(`Conflict between "${items[i].task}" and "${items[i + 1].task}"`);
    }
  }

  return conflicts;
};
