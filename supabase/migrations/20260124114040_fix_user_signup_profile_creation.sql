/*
  # Fix User Signup Profile Creation Issue
  
  ## Problem
  The trigger function `handle_new_user()` was failing because RLS policies
  were blocking profile insertion during signup. The user isn't fully 
  "authenticated" in the RLS context during the signup trigger execution.
  
  ## Solution
  1. Grant the trigger function permission to bypass RLS when inserting profiles
  2. Recreate the function with SET search_path for security
  3. This allows the automatic profile creation to succeed during signup
  
  ## Security Notes
  - Function is SECURITY DEFINER, meaning it runs with creator privileges
  - search_path is set to prevent security issues
  - Function only inserts for the specific new user (NEW.id)
  - RLS policies still protect all other operations
*/

-- Drop the existing function and recreate with proper permissions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the new profile, bypassing RLS since this function has elevated privileges
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON public.profiles TO postgres;
GRANT SELECT, INSERT ON public.profiles TO authenticated;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
