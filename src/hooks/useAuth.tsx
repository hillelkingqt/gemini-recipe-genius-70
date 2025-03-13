
import { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/Recipe';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  resetPassword: (email: string) => Promise<void>;
  failedLoginAttempts: number;
  setFailedLoginAttempts: (count: number) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  getProfile: async () => {},
  updateProfile: async () => {},
  isLoading: true,
  resetPassword: async () => {},
  failedLoginAttempts: 0,
  setFailedLoginAttempts: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        try {
          await getProfileData(data.session.user.id);
        } catch (error) {
          console.error('Error getting profile data:', error);
        }
      }
      
      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        try {
          await getProfileData(session.user.id);
        } catch (error) {
          console.error('Error getting profile data:', error);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as unknown as UserProfile);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        setFailedLoginAttempts(prev => prev + 1);
        
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        
        throw error;
      }

      setUser(data.user);
      setSession(data.session);
      setFailedLoginAttempts(0);
      
      if (data.user) {
        await getProfileData(data.user.id);
      }
      
      navigate('/');
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error) {
      console.error('Error in signin:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        console.error('Error signing up:', error);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Account created!',
        description: 'Please check your email to confirm your registration.',
      });
      
      return data;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setProfile(null);
      
      navigate('/auth');
      
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Error in signout:', error);
      throw error;
    }
  };

  const getProfile = async () => {
    if (!user) return;
    
    try {
      await getProfileData(user.id);
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Error resetting password:', error);
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for instructions to reset your password.',
      });
    } catch (error) {
      console.error('Error in reset password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        signIn,
        signUp,
        signOut,
        getProfile,
        updateProfile,
        isLoading,
        resetPassword,
        failedLoginAttempts,
        setFailedLoginAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
