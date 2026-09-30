import json
import urllib.request
import urllib.error
from dotenv import dotenv_values

env = dotenv_values('web/.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

users = [
    {
        'email': 'farmer.test@gmail.com',
        'password': 'Password123!',
        'role': 'farmer',
        'fullName': 'Rameshwar Patil (Farmer)',
    },
    {
        'email': 'officer.test@gmail.com',
        'password': 'Password123!',
        'role': 'officer',
        'fullName': 'Dr. Sunita Deshmukh (Officer)',
    },
    {
        'email': 'admin.test@gmail.com',
        'password': 'Password123!',
        'role': 'admin',
        'fullName': 'System Administrator (Admin)',
    }
]

for u in users:
    # 1. Attempt signup
    payload = json.dumps({
        'email': u['email'],
        'password': u['password'],
        'data': {
            'role': u['role'],
            'full_name': u['fullName']
        }
    }).encode('utf-8')

    req = urllib.request.Request(
        f"{supabase_url}/auth/v1/signup",
        data=payload,
        headers={'apikey': supabase_key, 'Content-Type': 'application/json'}
    )
    try:
        resp = urllib.request.urlopen(req)
        print(f"Created {u['email']} successfully.")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "already registered" in body:
            print(f"User {u['email']} already registered.")
        else:
            print(f"Signup error for {u['email']}:", e.code, body)

    # 2. Test sign in
    login_payload = json.dumps({
        'email': u['email'],
        'password': u['password']
    }).encode('utf-8')
    login_req = urllib.request.Request(
        f"{supabase_url}/auth/v1/token?grant_type=password",
        data=login_payload,
        headers={'apikey': supabase_key, 'Content-Type': 'application/json'}
    )
    try:
        login_resp = urllib.request.urlopen(login_req)
        login_data = json.loads(login_resp.read().decode())
        print(f"Login OK: {u['email']} -> token issued, user role={login_data['user']['user_metadata'].get('role')}")
    except urllib.error.HTTPError as e:
        print(f"Login FAILED for {u['email']}:", e.code, e.read().decode())
