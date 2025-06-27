
-- First, let's create a temporary function to safely delete non-admin data
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin's user_id from auth.users table
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@planner.com';
    
    -- Check if admin user exists
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin user with email admin@planner.com not found. No data will be deleted.';
    ELSE
        -- Delete all timetables that don't belong to the admin
        DELETE FROM public.timetables 
        WHERE user_id != admin_user_id;
        
        -- Log the result
        RAISE NOTICE 'Successfully deleted all non-admin timetables. Admin user_id: %', admin_user_id;
        
        -- Optionally, delete non-admin users from auth.users table
        -- (Uncomment the following lines if you want to delete the actual user accounts)
        -- DELETE FROM auth.users 
        -- WHERE id != admin_user_id;
        -- RAISE NOTICE 'Successfully deleted all non-admin users from auth.users';
    END IF;
END $$;
