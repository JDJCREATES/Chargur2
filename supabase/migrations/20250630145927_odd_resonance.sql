/*
  # Add test accounts with existence checks

  1. New Data
    - Adds test user accounts to auth.users if they don't exist
    - Adds corresponding profiles to public.profiles if they don't exist
    - Creates sample projects for each test user
  2. Security
    - Uses proper password hashing with crypt and gen_salt
    - Uses fixed UUIDs for consistent references
*/

-- Insert test users into auth.users table with existence check
DO $$
BEGIN
  -- Admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@chargur.app') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000001', 'admin@chargur.app', crypt('Admin123!', gen_salt('bf')), now(), now(), now());
  END IF;
  
  -- Standard user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user@chargur.app') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000002', 'user@chargur.app', crypt('User123!', gen_salt('bf')), now(), now(), now());
  END IF;
  
  -- Demo user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo@chargur.app') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000003', 'demo@chargur.app', crypt('Demo123!', gen_salt('bf')), now(), now(), now());
  END IF;
END
$$;

-- Insert corresponding profiles with existence check
DO $$
BEGIN
  -- Admin profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000001', 'admin@chargur.app', 'Admin User', now(), now());
  END IF;
  
  -- Standard user profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000002') THEN
    INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000002', 'user@chargur.app', 'Standard User', now(), now());
  END IF;
  
  -- Demo user profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000003') THEN
    INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000003', 'demo@chargur.app', 'Demo User', now(), now());
  END IF;
END
$$;

-- Create sample projects for each user with existence check
DO $$
DECLARE
  admin_project_exists BOOLEAN;
  user_project_exists BOOLEAN;
  demo_project_exists BOOLEAN;
BEGIN
  -- Check if projects already exist
  SELECT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Admin Project'
  ) INTO admin_project_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'User Project'
  ) INTO user_project_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'Demo Project'
  ) INTO demo_project_exists;
  
  -- Insert projects if they don't exist
  IF NOT admin_project_exists THEN
    INSERT INTO public.projects (id, user_id, name, description, current_stage_id, created_at, updated_at)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Admin Project', 'Sample project for admin user', 'ideation-discovery', now(), now());
  END IF;
  
  IF NOT user_project_exists THEN
    INSERT INTO public.projects (id, user_id, name, description, current_stage_id, created_at, updated_at)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'User Project', 'Sample project for standard user', 'ideation-discovery', now(), now());
  END IF;
  
  IF NOT demo_project_exists THEN
    INSERT INTO public.projects (id, user_id, name, description, current_stage_id, created_at, updated_at)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Demo Project', 'Sample project for demonstration', 'ideation-discovery', now(), now());
  END IF;
END
$$;