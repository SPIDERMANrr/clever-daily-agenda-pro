
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScheduleItem } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

export interface TimetableData {
  id: string;
  user_id: string;
  data: ScheduleItem[];
  created_at: string;
  updated_at: string;
}

export const useTimetable = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = async (): Promise<ScheduleItem[] | null> => {
    if (!userId) {
      console.log('No user ID provided for fetch');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching timetable:', error);
        setError('Failed to load your schedule');
        return null;
      }

      if (data) {
        console.log('Timetable loaded successfully:', data);
        return data.data as ScheduleItem[];
      }

      return null;
    } catch (err) {
      console.error('Unexpected error fetching timetable:', err);
      setError('An unexpected error occurred while loading your schedule');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveTimetable = async (scheduleData: ScheduleItem[]): Promise<boolean> => {
    if (!userId) {
      console.log('No user ID provided for save');
      toast({
        title: "Save failed",
        description: "Please log in to save your schedule",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Check if a timetable already exists for this user
      const { data: existingData } = await supabase
        .from('timetables')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingData) {
        // Update existing timetable
        const { error } = await supabase
          .from('timetables')
          .update({ 
            data: scheduleData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating timetable:', error);
          setError('Failed to save your schedule');
          return false;
        }
      } else {
        // Create new timetable
        const { error } = await supabase
          .from('timetables')
          .insert({
            user_id: userId,
            data: scheduleData
          });

        if (error) {
          console.error('Error creating timetable:', error);
          setError('Failed to save your schedule');
          return false;
        }
      }

      console.log('Timetable saved successfully');
      return true;
    } catch (err) {
      console.error('Unexpected error saving timetable:', err);
      setError('An unexpected error occurred while saving your schedule');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fetchTimetable,
    saveTimetable,
    isLoading,
    isSaving,
    error,
    clearError: () => setError(null)
  };
};
