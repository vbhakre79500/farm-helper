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

  signIn: (
    email: string,
    password: string,
    requestedRole?: UserRole
  ) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;

  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    locationId?: string;
  }) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;

  signOut: () => Promise<void>;

  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;

  restoreSession: () => Promise<void>;
  clearError: () => void;
}

function setSessionCookies(data: {
  role: string;
  token: string;
  email: string;
  refreshToken?: string;
}) {
  if (typeof document !== 'undefined') {
    const isSecure =
      window.location.protocol === 'https:' ? '; Secure' : '';

    document.cookie =
      `monsoon_access_token=${encodeURIComponent(data.token)}` +
      `; path=/; max-age=604800; SameSite=Lax${isSecure}`;

    if (data.refreshToken) {
      document.cookie =
        `monsoon_refresh_token=${encodeURIComponent(data.refreshToken)}` +
        `; path=/; max-age=2592000; SameSite=Lax${isSecure}`;
    }

    document.cookie =
      `monsoon_session=${encodeURIComponent(JSON.stringify(data))}` +
      `; path=/; max-age=604800; SameSite=Lax${isSecure}`;
  }
}

function clearSessionCookies() {
  if (typeof document !== 'undefined') {
    document.cookie =
      'monsoon_access_token=; path=/; max-age=0; SameSite=Lax';

    document.cookie =
      'monsoon_refresh_token=; path=/; max-age=0; SameSite=Lax';

    document.cookie =
      'monsoon_session=; path=/; max-age=0; SameSite=Lax';

    document.cookie =
      'sb-access-token=; path=/; max-age=0; SameSite=Lax';
  }
}

function normalizeRole(value: unknown): UserRole {
  const role = String(value || '').toLowerCase();

  if (role === 'admin') return 'admin';
  if (role === 'officer') return 'officer';

  return 'farmer';
}

function buildAuthUser(
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  },
  roleOverride?: UserRole
): AuthUser {
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email || '',
    fullName:
      String(metadata.full_name || '') ||
      user.email?.split('@')[0] ||
      'User',
    role: roleOverride || normalizeRole(metadata.role),
    phone: metadata.phone ? String(metadata.phone) : undefined,
    locationId: metadata.location_id
      ? String(metadata.location_id)
      : undefined,
  };
}

let authListenerRegistered = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => {
    set({ error: null });
  },

  restoreSession: async () => {
    set({ isLoading: true });

    try {
      const client = supabase;

      if (!isSupabaseConfigured || !client) {
        clearSessionCookies();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        return;
      }

      /*
       * IMPORTANT:
       * Do NOT perform database queries inside onAuthStateChange.
       * Supabase Auth uses an internal lock and awaiting another
       * Supabase operation here can cause authentication to hang.
       */
      if (!authListenerRegistered) {
        authListenerRegistered = true;

        client.auth.onAuthStateChange((event, session) => {
          if (
            (event === 'SIGNED_IN' ||
              event === 'TOKEN_REFRESHED' ||
              event === 'INITIAL_SESSION') &&
            session?.user
          ) {
            const authUser = buildAuthUser(session.user);

            setSessionCookies({
              role: authUser.role,
              token: session.access_token,
              email: authUser.email,
              refreshToken: session.refresh_token,
            });

            set({
              user: authUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }

          if (event === 'SIGNED_OUT') {
            clearSessionCookies();

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        });
      }

      const {
        data: { session },
        error,
      } = await client.auth.getSession();

      if (error) {
        throw error;
      }

      if (!session?.user) {
        clearSessionCookies();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        return;
      }

      /*
       * Get the user immediately from Supabase Auth metadata.
       * Do not block session restoration on the profiles table.
       */
      const authUser = buildAuthUser(session.user);

      setSessionCookies({
        role: authUser.role,
        token: session.access_token,
        email: authUser.email,
        refreshToken: session.refresh_token,
      });

      set({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.warn('Session restoration notice:', error);

      clearSessionCookies();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  signIn: async (
    email: string,
    password: string,
    requestedRole?: UserRole
  ) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (
        !normalizedEmail ||
        !normalizedEmail.includes('@') ||
        !password ||
        password.length < 6
      ) {
        const msg =
          'Please enter a valid email address and password (minimum 6 characters).';

        set({
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      const client = supabase;

      if (!isSupabaseConfigured || !client) {
        const msg =
          'Supabase authentication is not configured.';

        set({
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      const {
        data,
        error,
      } = await client.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        set({
          isLoading: false,
          error: error.message,
        });

        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user || !data.session) {
        const msg = 'Authentication failed. No active session was returned.';

        set({
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      let authUser = buildAuthUser(
        data.user,
        normalizeRole(data.user.user_metadata?.role)
      );

      if (
        requestedRole &&
        requestedRole !== authUser.role
      ) {
        await client.auth.signOut();
        clearSessionCookies();

        const msg =
          `This account is registered as ${authUser.role}, not ${requestedRole}.`;

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      setSessionCookies({
        role: authUser.role,
        token: data.session.access_token,
        email: authUser.email,
        refreshToken: data.session.refresh_token,
      });

      set({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      void (async () => {
        try {
          const { data: profile } = await client
            .from('profiles')
            .select(
              'role, full_name, phone, location_id'
            )
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!profile) return;

          const profileRole = normalizeRole(profile.role);

          authUser = {
            ...authUser,
            role: profileRole,
            fullName:
              profile.full_name || authUser.fullName,
            phone:
              profile.phone || authUser.phone,
            locationId:
              profile.location_id || authUser.locationId,
          };

          setSessionCookies({
            role: authUser.role,
            token: data.session!.access_token,
            email: authUser.email,
            refreshToken: data.session!.refresh_token,
          });

          set({
            user: authUser,
          });
        } catch (profileError) {
          console.warn(
            'Profile lookup skipped:',
            profileError
          );
        }
      })();

      return {
        success: true,
        user: authUser,
      };
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Authentication error';

      set({
        isLoading: false,
        error: msg,
      });

      return {
        success: false,
        error: msg,
      };
    }
  },

  signUp: async ({
    email,
    password,
    fullName,
    role,
    phone,
    locationId,
  }) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = normalizeRole(role);

      if (
        !normalizedEmail ||
        !normalizedEmail.includes('@') ||
        !password ||
        password.length < 6
      ) {
        const msg =
          'Please enter a valid email address and a password with at least 6 characters.';

        set({
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      const client = supabase;

      if (!isSupabaseConfigured || !client) {
        const msg =
          'Supabase registration is not configured.';

        set({
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      const {
        data,
        error,
      } = await client.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: normalizedRole,
            phone,
            location_id: locationId,
          },
        },
      });

      if (error) {
        set({
          isLoading: false,
          error: error.message,
        });

        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user) {
        const msg =
          'Registration failed. No user was returned.';

        set({
          isLoading: false,
          error: msg,
        });

        return {
          success: false,
          error: msg,
        };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: normalizedEmail,
        fullName,
        role: normalizedRole,
        phone,
        locationId,
      };

      /*
       * Create profile after Auth registration.
       * Failure here does not invalidate the Auth account.
       */
      try {
        await client.from('profiles').upsert(
          [
            {
              user_id: data.user.id,
              full_name: fullName,
              role: normalizedRole,
              phone,
              location_id: locationId,
            },
          ],
          {
            onConflict: 'user_id',
          }
        );
      } catch (profileError) {
        console.warn(
          'Profile creation notice:',
          profileError
        );
      }

      if (data.session?.access_token) {
        setSessionCookies({
          role: authUser.role,
          token: data.session.access_token,
          email: authUser.email,
          refreshToken: data.session.refresh_token,
        });

        set({
          user: authUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          user: authUser,
        };
      }

      /*
       * Email confirmation may be enabled in Supabase.
       */
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        user: authUser,
      };
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Registration error';

      set({
        isLoading: false,
        error: msg,
      });

      return {
        success: false,
        error: msg,
      };
    }
  },

  signOut: async () => {
    try {
      const client = supabase;

      if (isSupabaseConfigured && client) {
        await client.auth.signOut();
      }
    } catch (error) {
      console.warn('Sign out notice:', error);
    } finally {
      clearSessionCookies();

      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const client = supabase;

      if (!isSupabaseConfigured || !client) {
        return {
          success: false,
          message:
            'Supabase email service is not configured.',
        };
      }

      const { error } =
        await client.auth.resetPasswordForEmail(
          email.trim().toLowerCase()
        );

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message:
          'Password reset link sent to your registered email.',
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Password reset failed.',
      };
    }
  },
}));