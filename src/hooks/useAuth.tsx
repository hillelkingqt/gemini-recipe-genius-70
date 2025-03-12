
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from './use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session:", session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            console.log("User profile loaded:", data);
            setProfile(data);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile on auth change:", error);
          } else {
            console.log("User profile updated:", data);
            setProfile(data);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign in:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Supabase sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful:", data);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Detailed sign in error:', error);
      
      // Provide more specific error messages
      let errorMessage = "An error occurred during sign in";
      
      if (error?.message === "Email not confirmed") {
        errorMessage = "Please confirm your email address before signing in";
      } else if (error?.message === "Invalid login credentials") {
        errorMessage = "Incorrect email or password";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign up:", email, username);
      
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
        console.error("Supabase sign up error:", error);
        throw error;
      }
      
      console.log("Sign up result:", data);
      
      if (data.user) {
        // Check if email confirmation is needed
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error("Email already registered");
        }
        
        if (data.user.confirmation_sent_at) {
          toast({
            title: "Account created",
            description: "Your account has been created. Please check your email to confirm your registration.",
          });
        } else {
          toast({
            title: "Account created",
            description: "Your account has been successfully created. You can now sign in.",
          });
        }
      }
    } catch (error: any) {
      console.error('Detailed sign up error:', error);
      
      // Provide more specific error messages
      let errorMessage = "An error occurred during registration";
      
      if (error?.message?.includes("already registered")) {
        errorMessage = "This email is already registered";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error?.message || "An error occurred during sign out",
        variant: "destructive",
      });
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile,
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      getProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
