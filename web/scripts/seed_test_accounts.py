import os
import json
import uuid
import urllib.request
import urllib.error
from dotenv import load_dotenv, dotenv_values
import psycopg

load_dotenv('.env')
db_url = os.getenv('DATABASE_URL')
conn = psycopg.connect(db_url)
cur = conn.cursor()

# Password hash for 'Password123!'
PWD_HASH = '$2a$10$7mUh/WzQP9PPcuzb.1Pa5uTwWgXak3n5bjTX2vJ/EtomvPDrrXdoW'

test_users = [
    {
        'email': 'farmer.test@gmail.com',
        'role': 'farmer',
        'name': 'Rameshwar Patil (Farmer)',
        'phone': '+91 98765 43210',
        'location_id': 'blk-mh-amr-ach',
    },
    {
        'email': 'officer.test@gmail.com',
        'role': 'officer',
        'name': 'Dr. Sunita Deshmukh (Officer)',
        'phone': '+91 98765 43211',
        'location_id': 'blk-mh-amr-ach',
    },
    {
        'email': 'admin.test@gmail.com',
        'role': 'admin',
        'name': 'System Administrator (Admin)',
        'phone': '+91 98765 43212',
        'location_id': 'blk-mh-amr-ach',
    }
]

for u in test_users:
    cur.execute("SELECT id FROM auth.users WHERE email = %s", (u['email'],))
    row = cur.fetchone()
    if row:
        user_id = row[0]
        cur.execute("""
            UPDATE auth.users
            SET encrypted_password = %s,
                email_confirmed_at = CURRENT_TIMESTAMP,
                raw_user_meta_data = %s,
                raw_app_meta_data = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            PWD_HASH,
            json.dumps({'sub': str(user_id), 'role': u['role'], 'email': u['email'], 'full_name': u['name']}),
            json.dumps({'provider': 'email', 'providers': ['email']}),
            user_id
        ))
    else:
        user_id = uuid.uuid4()
        cur.execute("""
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                %s, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                %s, %s, CURRENT_TIMESTAMP,
                %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """, (
            user_id,
            u['email'],
            PWD_HASH,
            json.dumps({'provider': 'email', 'providers': ['email']}),
            json.dumps({'sub': str(user_id), 'role': u['role'], 'email': u['email'], 'full_name': u['name']})
        ))

    # Always ensure valid identity record
    cur.execute("DELETE FROM auth.identities WHERE user_id = %s", (user_id,))
    cur.execute("""
        INSERT INTO auth.identities (
            id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, 'email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    """, (
        uuid.uuid4(),
        str(user_id),
        user_id,
        json.dumps({'sub': str(user_id), 'email': u['email'], 'role': u['role'], 'full_name': u['name']})
    ))

    # Profiles table
    cur.execute("""
        INSERT INTO public.profiles (user_id, full_name, phone, role, location_id)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            location_id = EXCLUDED.location_id,
            updated_at = CURRENT_TIMESTAMP;
    """, (
        user_id,
        u['name'],
        u['phone'],
        u['role'],
        u['location_id']
    ))

conn.commit()
conn.close()
print("Test accounts seeded successfully in PostgreSQL.")

# Now verify with Supabase Auth API
env = dotenv_values('web/.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

for u in test_users:
    login_payload = json.dumps({
        'email': u['email'],
        'password': 'Password123!'
    }).encode('utf-8')
    login_req = urllib.request.Request(
        f"{supabase_url}/auth/v1/token?grant_type=password",
        data=login_payload,
        headers={'apikey': supabase_key, 'Content-Type': 'application/json'}
    )
    try:
        login_resp = urllib.request.urlopen(login_req)
        login_data = json.loads(login_resp.read().decode())
        token = login_data['access_token']
        print(f"Verified Supabase Auth for {u['email']} (role: {u['role']}) -> Token length: {len(token)}")
    except urllib.error.HTTPError as e:
        print(f"Verification FAILED for {u['email']}:", e.code, e.read().decode())
