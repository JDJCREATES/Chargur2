-- Fix the handle_new_user function to explicitly set search_path
-- This ensures the function can find the profiles table in the public schema

/*
  # Fix search_path in handle_new_user function

  1. Changes
     - Modify handle_new_user function to explicitly set search_path to public
     - This ensures the function can find the profiles table regardless of the session's default search_path
     - Fixes the "relation profiles does not exist" error during user signup

  2. Security
     - Maintains SECURITY DEFINER setting for proper permissions
     - No changes to existing RLS policies
*/

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Explicitly set search_path to ensure the function can find the profiles table
  SET search_path = public, pg_temp;
  
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();