import os
from dotenv import load_dotenv
import psycopg

# Load root .env
load_dotenv('.env')
db_url = os.getenv('DATABASE_URL')
if not db_url:
    load_dotenv('web/.env.local')
    db_url = os.getenv('DATABASE_URL')

if not db_url:
    raise Exception("DATABASE_URL not found")

conn = psycopg.connect(db_url)
cur = conn.cursor()

sql = """
-- 1. Auto-confirm email trigger
CREATE OR REPLACE FUNCTION public.handle_user_autoconfirm()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auth_user_autoconfirm ON auth.users;
CREATE TRIGGER tr_auth_user_autoconfirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_autoconfirm();

-- 2. Auto-create/update profile trigger
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, phone, role, location_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')),
        NEW.raw_user_meta_data->>'location_id'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        role = COALESCE(EXCLUDED.role, public.profiles.role),
        location_id = COALESCE(EXCLUDED.location_id, public.profiles.location_id),
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auth_user_profile_sync ON auth.users;
CREATE TRIGGER tr_auth_user_profile_sync
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_profile_sync();

-- 3. RLS policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
CREATE POLICY "Allow users to insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
"""

cur.execute(sql)
conn.commit()
print("PostgreSQL triggers and RLS policies created successfully.")
conn.close()
