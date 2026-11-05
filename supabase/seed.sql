-- Local-dev seed (does not run in production).
-- Useful for `supabase db reset` cycles. Plans are already inserted by the migration.
-- Add a developer test teacher here after creating an auth user via Supabase Studio.

-- Example (uncomment and substitute the auth user UUID):
-- insert into teachers (user_id, name_ar, name_en, email, subdomain)
-- values ('00000000-0000-0000-0000-000000000000', 'مدرس تجريبي', 'Test Teacher', 'test@ostazna.com', 'test');
