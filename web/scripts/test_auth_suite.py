import urllib.request
import urllib.parse
import urllib.error
import http.client
import json
import os
from dotenv import dotenv_values

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Do not follow redirects so we can inspect status codes and Location headers
        return None

opener = urllib.request.build_opener(NoRedirectHandler)

env = dotenv_values('web/.env.local')
supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
BASE_URL = 'http://localhost:3001'

def get_supabase_token(email, password):
    payload = json.dumps({'email': email, 'password': password}).encode('utf-8')
    req = urllib.request.Request(
        f"{supabase_url}/auth/v1/token?grant_type=password",
        data=payload,
        headers={'apikey': supabase_key, 'Content-Type': 'application/json'}
    )
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    return data['access_token'], data['user']['user_metadata'].get('role')

def request_route(path, cookie=None):
    headers = {}
    if cookie:
        headers['Cookie'] = cookie
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers)
    try:
        resp = opener.open(req)
        return resp.status, resp.headers.get('Location'), resp.read(200)
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Location'), e.read(200)

print("=" * 70)
print("MONSOON-SENSE AUTHENTICATION & ROUTE PROTECTION VERIFICATION SUITE")
print("=" * 70)

# PUBLIC ROUTES CHECK
print("\n--- 1. VERIFYING PUBLIC ROUTES ---")
for pub_path in ['/', '/about', '/how-it-works', '/login', '/signup']:
    status, loc, _ = request_route(pub_path)
    print(f"Public route {pub_path:15}: Status={status} (Expected: 200)")
    assert status == 200, f"Public route {pub_path} failed with status {status}"

# TEST A: Logged out -> /dashboard -> must redirect to /login
print("\n--- 2. TEST A: Logged out -> /dashboard ---")
status, loc, _ = request_route('/dashboard')
print(f"Logged out -> /dashboard: Status={status}, Location={loc}")
assert status in (307, 308) and '/login' in str(loc), f"Failed Test A: Expected redirect to /login, got {status} {loc}"
print("=> TEST A PASSED: Correctly redirected to /login")

# TEST B: Logged out -> /forecast -> must redirect to /login
print("\n--- 3. TEST B: Logged out -> /forecast ---")
status, loc, _ = request_route('/forecast')
print(f"Logged out -> /forecast: Status={status}, Location={loc}")
assert status in (307, 308) and '/login' in str(loc), f"Failed Test B: Expected redirect to /login, got {status} {loc}"
print("=> TEST B PASSED: Correctly redirected to /login")

# OTHER PROTECTED ROUTES (Logged out)
print("\n--- 4. OTHER PROTECTED ROUTES (Logged out) ---")
for prot_path in ['/risk-map', '/climate-signals', '/advisories', '/history', '/alerts', '/settings', '/officer', '/admin']:
    status, loc, _ = request_route(prot_path)
    print(f"Logged out -> {prot_path:17}: Status={status}, Redirect Location={loc}")
    assert status in (307, 308) and '/login' in str(loc), f"Failed on {prot_path}: {status} {loc}"
print("=> ALL PROTECTED ROUTES CORRECTLY REDIRECT UNAUTHENTICATED USERS TO /login")

# OBTAIN AUTHENTIC TOKENS FROM SUPABASE
print("\n--- 5. OBTAINING AUTHENTIC SUPABASE USER SESSIONS ---")
farmer_token, farmer_role = get_supabase_token('farmer.test@gmail.com', 'Password123!')
print(f"FARMER authenticated via Supabase: role={farmer_role}, token prefix={farmer_token[:15]}...")

officer_token, officer_role = get_supabase_token('officer.test@gmail.com', 'Password123!')
print(f"OFFICER authenticated via Supabase: role={officer_role}, token prefix={officer_token[:15]}...")

admin_token, admin_role = get_supabase_token('admin.test@gmail.com', 'Password123!')
print(f"ADMIN authenticated via Supabase: role={admin_role}, token prefix={admin_token[:15]}...")

farmer_cookie = f"monsoon_access_token={farmer_token}"
officer_cookie = f"monsoon_access_token={officer_token}"
admin_cookie = f"monsoon_access_token={admin_token}"

# TEST C: Logged in FARMER -> /dashboard -> allowed
print("\n--- 6. TEST C: Logged in FARMER -> /dashboard ---")
status, loc, _ = request_route('/dashboard', cookie=farmer_cookie)
print(f"FARMER -> /dashboard: Status={status} (Expected: 200)")
assert status == 200, f"Failed Test C: Expected 200 OK, got {status}"
print("=> TEST C PASSED: FARMER granted access to /dashboard")

# TEST D: FARMER -> /officer -> denied/redirected
print("\n--- 7. TEST D: FARMER -> /officer ---")
status, loc, _ = request_route('/officer', cookie=farmer_cookie)
print(f"FARMER -> /officer: Status={status}, Location={loc}")
assert status in (307, 308) and 'officer_required' in str(loc), f"Failed Test D: Expected redirect to /dashboard?error=officer_required, got {status} {loc}"
print("=> TEST D PASSED: FARMER denied and redirected from /officer")

# TEST E: FARMER -> /admin -> denied/redirected
print("\n--- 8. TEST E: FARMER -> /admin ---")
status, loc, _ = request_route('/admin', cookie=farmer_cookie)
print(f"FARMER -> /admin: Status={status}, Location={loc}")
assert status in (307, 308) and 'admin_required' in str(loc), f"Failed Test E: Expected redirect to /dashboard?error=admin_required, got {status} {loc}"
print("=> TEST E PASSED: FARMER denied and redirected from /admin")

# OFFICER PERMISSIONS TEST
print("\n--- 9. OFFICER PERMISSION CHECKS ---")
status, loc, _ = request_route('/officer', cookie=officer_cookie)
print(f"OFFICER -> /officer: Status={status} (Expected: 200)")
assert status == 200, f"OFFICER failed to access /officer: {status}"

status, loc, _ = request_route('/admin', cookie=officer_cookie)
print(f"OFFICER -> /admin: Status={status}, Location={loc} (Expected: redirected to dashboard)")
assert status in (307, 308) and 'admin_required' in str(loc), f"OFFICER was not blocked from /admin: {status} {loc}"
print("=> OFFICER PERMISSION CHECKS PASSED (/officer allowed, /admin denied)")

# TEST F: ADMIN -> /admin -> allowed
print("\n--- 10. TEST F: ADMIN -> /admin ---")
status, loc, _ = request_route('/admin', cookie=admin_cookie)
print(f"ADMIN -> /admin: Status={status} (Expected: 200)")
assert status == 200, f"Failed Test F: Expected 200 OK, got {status}"

status, loc, _ = request_route('/officer', cookie=admin_cookie)
print(f"ADMIN -> /officer: Status={status} (Expected: 200)")
assert status == 200, f"ADMIN failed to access /officer: {status}"
print("=> TEST F PASSED: ADMIN granted access to both /admin and /officer")

# TEST G: Logout -> previously protected route -> no access
print("\n--- 11. TEST G: Logout / Revocation -> Protected route ---")
# Simulate logout by clearing cookie or sending empty/invalid cookie
empty_cookie = "monsoon_access_token=; monsoon_session="
status, loc, _ = request_route('/dashboard', cookie=empty_cookie)
print(f"Cleared session -> /dashboard: Status={status}, Location={loc}")
assert status in (307, 308) and '/login' in str(loc), f"Failed Test G: Expected redirect to /login, got {status} {loc}"

# Also test forged / malicious token
forged_cookie = "monsoon_access_token=forged.tampered.token123"
status, loc, _ = request_route('/admin', cookie=forged_cookie)
print(f"Forged token -> /admin: Status={status}, Location={loc}")
assert status in (307, 308) and '/login' in str(loc), f"Failed Test G: Forged token was not rejected!"
print("=> TEST G PASSED: Logged out and forged sessions strictly blocked")

# TEST H: Refresh while logged in -> session remains valid
print("\n--- 12. TEST H: Refresh while logged in ---")
for i in range(1, 4):
    status, loc, _ = request_route('/dashboard', cookie=farmer_cookie)
    print(f"Refresh #{i} -> /dashboard: Status={status} (Expected: 200)")
    assert status == 200, f"Failed Test H on refresh #{i}: {status}"
print("=> TEST H PASSED: Session remains valid across repeated refreshes")

# AUTHENTICATED USER VISITING /login OR /signup -> REDIRECT TO /dashboard
print("\n--- 13. AUTHENTICATED USER VISITING /login OR /signup ---")
status, loc, _ = request_route('/login', cookie=farmer_cookie)
print(f"Logged in FARMER -> /login: Status={status}, Location={loc}")
assert status in (307, 308) and '/dashboard' in str(loc), f"Failed: Expected redirect to /dashboard, got {status} {loc}"

status, loc, _ = request_route('/signup', cookie=farmer_cookie)
print(f"Logged in FARMER -> /signup: Status={status}, Location={loc}")
assert status in (307, 308) and '/dashboard' in str(loc), f"Failed: Expected redirect to /dashboard, got {status} {loc}"
print("=> AUTHENTICATED USER REDIRECTED TO /dashboard FROM /login AND /signup")

print("\n" + "=" * 70)
print("ALL 8 VERIFICATION REQUIREMENTS (A through H) PASSED FLAWLESSLY!")
print("=" * 70)
