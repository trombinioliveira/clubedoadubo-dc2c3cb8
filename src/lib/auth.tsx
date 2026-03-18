import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Use `any` to work around type drift between installed @supabase/supabase-js types
const auth = supabase.auth as any;

type User = any;
type Session = any;

type AppRole = 'admin' | 'staff' | 'client';

// Flag to track password recovery flow globally
let _isPasswordRecovery = false;
export function getIsPasswordRecovery() { return _isPasswordRecovery; }
export function clearPasswordRecovery() { _isPasswordRecovery = false; sessionStorage.removeItem('password_recovery'); }

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
  // Profile fields
  gender: string | null;
  cpf: string | null;
  birth_date: string | null;
  whatsapp: string | null;
  pix_key: string | null;
  email_verified_at: string | null;
  whatsapp_verified_at: string | null;
  profile_completed_at: string | null;
  profile_deadline: string | null;
  commission_preference: string | null;
  internal_balance: number | null;
  fertilizer_credits: number | null;
  // Auth tracking fields
  auth_provider: string | null;
  last_login_at: string | null;
  whatsapp_connected: boolean | null;
  account_status: string | null;
  has_viewed_fifo: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (!error && data) {
      setRoles(data.map(r => r.role as AppRole));
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await fetchRoles(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = auth.onAuthStateChange(
      (event, session) => {
        // Intercept PASSWORD_RECOVERY: force redirect to reset password page
        if (event === 'PASSWORD_RECOVERY') {
          _isPasswordRecovery = true;
          sessionStorage.setItem('password_recovery', '1');
          // Force navigate regardless of current page
          if (window.location.pathname !== '/redefinir-senha') {
            window.location.replace('/redefinir-senha');
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRoles(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signInWithPassword({
      email,
      password
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const isAdmin = roles.includes('admin');
  const isStaff = roles.includes('staff');
  const isClient = roles.includes('client');

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      roles,
      isLoading,
      isAdmin,
      isStaff,
      isClient,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Durante hot-reload, o contexto pode temporariamente não estar disponível
    // Retornar valores padrão para evitar crash
    console.warn('useAuth called outside AuthProvider - returning defaults');
    return {
      user: null,
      session: null,
      profile: null,
      roles: [] as AppRole[],
      isLoading: true,
      isAdmin: false,
      isStaff: false,
      isClient: false,
      signUp: async () => ({ error: new Error('Auth not initialized') }),
      signIn: async () => ({ error: new Error('Auth not initialized') }),
      signOut: async () => {},
      refreshProfile: async () => {}
    };
  }
  return context;
}
