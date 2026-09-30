import { create } from 'zustand';
import { UserRole } from '../../shared/types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  locationId?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  signIn: (email: string, password: string, requestedRole?: UserRole) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    locationId?: string;
  }) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

function setSessionCookies(data: { role: string; token: string; email: string; refreshToken?: string }) {
  if (typeof document !== 'undefined') {
    const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
    // 1. Direct access token for Edge middleware
    document.cookie = `monsoon_access_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax${isSecure}`;
    
    // 2. Refresh token cookie
    if (data.refreshToken) {
      document.cookie = `monsoon_refresh_token=${encodeURIComponent(data.refreshToken)}; path=/; max-age=2592000; SameSite=Lax${isSecure}`;
    }
    
    // 3. Structured session cookie for backwards compatibility
    document.cookie = `monsoon_session=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=604800; SameSite=Lax${isSecure}`;
  }
}

function clearSessionCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'monsoon_access_token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'monsoon_refresh_token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'monsoon_session=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
  }
}

// Track whether onAuthStateChange listener is registered
let authListenerRegistered = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const client = supabase;
      if (isSupabaseConfigured && client) {
        // Register listener once
        if (!authListenerRegistered) {
          authListenerRegistered = true;
          client.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (session?.user) {
                let role: UserRole = 'farmer';
                let fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

                try {
                  const { data: profile } = await client
                    .from('profiles')
                    .select('role, full_name, phone, location_id')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                  if (profile?.role) {
                    const r = String(profile.role).toLowerCase();
                    if (r === 'admin' || r === 'officer' || r === 'farmer') role = r as UserRole;
                  } else if (session.user.user_metadata?.role) {
                    const r = String(session.user.user_metadata.role).toLowerCase();
                    if (r === 'admin' || r === 'officer' || r === 'farmer') role = r as UserRole;
                  }
                  if (profile?.full_name) fullName = profile.full_name;
                } catch {}

                const authUser: AuthUser = {
                  id: session.user.id,
                  email: session.user.email || '',
                  fullName,
                  role,
                  phone: session.user.user_metadata?.phone,
                  locationId: session.user.user_metadata?.location_id,
                };

                setSessionCookies({
                  role: authUser.role,
                  token: session.access_token,
                  email: authUser.email,
                  refreshToken: session.refresh_token,
                });

                set({ user: authUser, isAuthenticated: true, isLoading: false });
              }
            } else if (event === 'SIGNED_OUT') {
              clearSessionCookies();
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          });
        }

        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          let role: UserRole = 'farmer';
          let fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

          // Query authoritative profile from PostgreSQL
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('role, full_name, phone, location_id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (profile?.role) {
              const r = String(profile.role).toLowerCase();
              if (r === 'admin' || r === 'officer' || r === 'farmer') role = r as UserRole;
            } else if (session.user.user_metadata?.role) {
              const r = String(session.user.user_metadata.role).toLowerCase();
              if (r === 'admin' || r === 'officer' || r === 'farmer') role = r as UserRole;
            }
            if (profile?.full_name) fullName = profile.full_name;
          } catch {}

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            fullName,
            role,
            phone: session.user.user_metadata?.phone,
            locationId: session.user.user_metadata?.location_id,
          };

          setSessionCookies({
            role: authUser.role,
            token: session.access_token,
            email: authUser.email,
            refreshToken: session.refresh_token,
          });

          set({ user: authUser, isAuthenticated: true, isLoading: false });
          return;
        }
      }

      // No active remote Supabase session
      clearSessionCookies();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (e: any) {
      console.warn('Session restoration notice:', e.message);
      clearSessionCookies();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email: string, password: string, requestedRole?: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      if (!email || !password || password.length < 6) {
        const msg = 'Please enter a valid email address and password (minimum 6 characters).';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }

      const client = supabase;
      if (isSupabaseConfigured && client) {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        if (data.user && data.session) {
          let role: UserRole = 'farmer';
          let fullName = data.user.user_metadata?.full_name || email.split('@')[0];

          // Retrieve authoritative role from PostgreSQL profiles
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('role, full_name, phone, location_id')
              .eq('user_id', data.user.id)
              .maybeSingle();

            if (profile?.role) {
              const r = String(profile.role).toLowerCase();
              if (r === 'admin' || r === 'officer' || r === 'farmer') role = r as UserRole;
            } else if (data.user.user_metadata?.role) {
              const r = String(data.user.user_metadata.role).toLowerCase();
              if (r === 'admin' || r === 'officer' || r === 'farmer') role = r as UserRole;
            }
            if (profile?.full_name) fullName = profile.full_name;
          } catch {}

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName,
            role,
            phone: data.user.user_metadata?.phone,
            locationId: data.user.user_metadata?.location_id,
          };

          setSessionCookies({
            role: authUser.role,
            token: data.session.access_token,
            email: authUser.email,
            refreshToken: data.session.refresh_token,
          });

          set({ user: authUser, isAuthenticated: true, isLoading: false, error: null });
          return { success: true, user: authUser };
        }
      }

      const msg = 'Supabase authentication service is not responding. Please check configuration.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    } catch (err: any) {
      const msg = err.message || 'Authentication error';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signUp: async ({ email, password, fullName, role, phone, locationId }) => {
    set({ isLoading: true, error: null });
    try {
      if (!email || !password || password.length < 6) {
        const msg = 'Password must be at least 6 characters.';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }

      const client = supabase;
      if (isSupabaseConfigured && client) {
        const normalizedRole = role.toLowerCase() as UserRole;
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: normalizedRole,
              phone: phone,
              location_id: locationId,
            },
          },
        });

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Attempt upserting profile in PostgreSQL
          try {
            await client.from('profiles').upsert([
              {
                user_id: data.user.id,
                full_name: fullName,
                role: normalizedRole,
                phone,
                location_id: locationId,
              },
            ], { onConflict: 'user_id' });
          } catch {}

          const authUser: AuthUser = {
            id: data.user.id,
            email,
            fullName,
            role: normalizedRole,
            phone,
            locationId,
          };

          if (data.session?.access_token) {
            setSessionCookies({
              role: authUser.role,
              token: data.session.access_token,
              email: authUser.email,
              refreshToken: data.session.refresh_token,
            });
            set({ user: authUser, isAuthenticated: true, isLoading: false, error: null });
            return { success: true, user: authUser };
          } else {
            set({ isLoading: false, error: null });
            return { success: true, user: authUser };
          }
        }
      }

      const msg = 'Supabase registration service is not configured.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    } catch (err: any) {
      const msg = err.message || 'Registration error';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    try {
      const client = supabase;
      if (isSupabaseConfigured && client) {
        await client.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out notice:', e);
    } finally {
      clearSessionCookies();
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password reset link sent to your registered email.' };
    }
    return {
      success: false,
      message: 'Supabase email service is not configured.',
    };
  },
}));
