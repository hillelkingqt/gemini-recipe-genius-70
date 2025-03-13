
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/Recipe';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean; // Add isLoading for compatibility
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  getProfile: () => Promise<void>;
  failedLoginAttempts: number;
  setFailedLoginAttempts: React.Dispatch<React.SetStateAction<number>>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  isLoading: true, // Add isLoading default value
  updateProfile: async () => {},
  getProfile: async () => {},
  failedLoginAttempts: 0,
  setFailedLoginAttempts: () => {},
  resetPassword: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Get session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        getProfileData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        getProfileData(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getProfileData = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert the profile data to match our UserProfile type
        const userProfile: UserProfile = {
          id: data.id,
          username: data.username || '',
          avatarUrl: data.avatar_url || '',
          dietaryRestrictions: data.dietary_restrictions || [],
          allergies: data.allergies || [],
          favoriteIngredients: data.favorite_ingredients || [],
          dislikedIngredients: data.disliked_ingredients || [],
          preferredCuisines: data.preferred_cuisines || [],
          cookingSkillLevel: (data.cooking_skill_level as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
          healthGoals: data.health_goals || [],
          profileNotes: data.profile_notes || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      toast({
        variant: "destructive",
        title: "Profile Error",
        description: "Failed to fetch user profile data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await getProfileData(user);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      
      // Convert our UserProfile structure to match database column names
      const dbUpdates = {
        ...updates.username && { username: updates.username },
        ...updates.avatarUrl && { avatar_url: updates.avatarUrl },
        ...updates.dietaryRestrictions && { dietary_restrictions: updates.dietaryRestrictions },
        ...updates.allergies && { allergies: updates.allergies },
        ...updates.favoriteIngredients && { favorite_ingredients: updates.favoriteIngredients },
        ...updates.dislikedIngredients && { disliked_ingredients: updates.dislikedIngredients },
        ...updates.preferredCuisines && { preferred_cuisines: updates.preferredCuisines },
        ...updates.cookingSkillLevel && { cooking_skill_level: updates.cookingSkillLevel },
        ...updates.healthGoals && { health_goals: updates.healthGoals },
        ...updates.profileNotes && { profile_notes: updates.profileNotes },
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await getProfileData(user);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        variant: "destructive",
        title: "Update Error",
        description: "Failed to update profile.",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setFailedLoginAttempts(prev => prev + 1);
        throw error;
      }
      
      // Reset failed attempts on successful login
      setFailedLoginAttempts(0);
      
      toast({
        title: "Welcome Back!",
        description: "You've successfully signed in.",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      
      let errorMessage = "Failed to sign in.";
      if (error instanceof AuthError) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account Created",
        description: "Your account has been successfully created. Please check your email for verification.",
      });
    } catch (error) {
      console.error('Error signing up:', error);
      
      let errorMessage = "Failed to create account.";
      if (error instanceof AuthError) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear user and profile state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      
    } catch (error) {
      console.error('Error signing out:', error);
      
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "There was an issue signing you out.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password.",
      });
      
    } catch (error) {
      console.error('Error resetting password:', error);
      
      let errorMessage = "Failed to send password reset email.";
      if (error instanceof AuthError) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Reset Error",
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isLoading: loading, // Add isLoading as an alias to loading
    updateProfile,
    getProfile,
    failedLoginAttempts,
    setFailedLoginAttempts,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
