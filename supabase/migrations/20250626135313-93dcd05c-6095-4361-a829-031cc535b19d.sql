
-- Create the timetables table to store user schedules
CREATE TABLE public.timetables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only access their own timetables
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own timetables
CREATE POLICY "Users can view their own timetables" 
  ON public.timetables 
  FOR SELECT 
  USING (user_id::text = auth.uid()::text);

-- Create policy that allows users to INSERT their own timetables
CREATE POLICY "Users can create their own timetables" 
  ON public.timetables 
  FOR INSERT 
  WITH CHECK (user_id::text = auth.uid()::text);

-- Create policy that allows users to UPDATE their own timetables
CREATE POLICY "Users can update their own timetables" 
  ON public.timetables 
  FOR UPDATE 
  USING (user_id::text = auth.uid()::text);

-- Create policy that allows users to DELETE their own timetables
CREATE POLICY "Users can delete their own timetables" 
  ON public.timetables 
  FOR DELETE 
  USING (user_id::text = auth.uid()::text);

-- Create an index for better performance when querying by user_id
CREATE INDEX idx_timetables_user_id ON public.timetables(user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_timetables_updated_at 
    BEFORE UPDATE ON public.timetables 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
