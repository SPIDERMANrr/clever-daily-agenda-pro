
-- Create a function to ensure admin user exists and is properly configured
CREATE OR REPLACE FUNCTION public.ensure_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'admin@planner.com';
BEGIN
    -- Check if admin user exists in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        -- Admin user doesn't exist, we'll need to create it via the application
        RAISE NOTICE 'Admin user does not exist. Will be created via application.';
    ELSE
        -- Admin user exists, ensure email is confirmed
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user exists with ID: %. Email confirmation updated.', admin_user_id;
    END IF;
END;
$$;

-- Create a trigger to prevent deletion of admin user data
CREATE OR REPLACE FUNCTION public.protect_admin_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@planner.com';
    
    -- Prevent deletion of admin user's timetable data
    IF TG_OP = 'DELETE' AND OLD.user_id = admin_user_id THEN
        RAISE EXCEPTION 'Cannot delete admin user data';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the protection trigger to timetables
DROP TRIGGER IF EXISTS protect_admin_timetables ON public.timetables;
CREATE TRIGGER protect_admin_timetables
    BEFORE DELETE ON public.timetables
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_admin_data();

-- Run the admin user check
SELECT public.ensure_admin_user();
