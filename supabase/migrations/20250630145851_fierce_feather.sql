/*
  # Add test accounts

  1. New Data
    - Adds three test user accounts with different roles
    - Creates corresponding profile entries
    - Sets up projects for each test account
  
  2. Security
    - Uses secure password hashing
    - Maintains existing RLS policies
*/

-- Insert test users into auth.users table
-- Note: We're using the auth.users() function to properly hash passwords
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@chargur.app', crypt('Admin123!', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'user@chargur.app', crypt('User123!', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'demo@chargur.app', crypt('Demo123!', gen_salt('bf')), now(), now(), now());

-- Insert corresponding profiles
INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@chargur.app', 'Admin User', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'user@chargur.app', 'Standard User', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'demo@chargur.app', 'Demo User', now(), now());

-- Create sample projects for each user
INSERT INTO public.projects (id, user_id, name, description, current_stage_id, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Admin Project', 'Sample project for admin user', 'ideation-discovery', now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'User Project', 'Sample project for standard user', 'ideation-discovery', now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Demo Project', 'Sample project for demonstration', 'ideation-discovery', now(), now());