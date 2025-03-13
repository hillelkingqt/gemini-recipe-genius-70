
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/Recipe';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isPasswordResetAttempt: boolean;
  setIsPasswordResetAttempt: (value: boolean) => void;
  loginAttempts: number;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  isPasswordResetAttempt: false,
  setIsPasswordResetAttempt: () => {},
  loginAttempts: 0,
  incrementLoginAttempts: () => {},
  resetLoginAttempts: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordResetAttempt, setIsPasswordResetAttempt] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user profile
          if (session.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Session fetching error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.info('Supabase auth event:', event, newSession);
        console.info('Auth state changed:', event);
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setProfile({
          id: data.id,
          username: data.username || '',
          avatarUrl: data.avatar_url,
          dietaryRestrictions: data.dietary_restrictions,
          allergies: data.allergies,
          favoriteIngredients: data.favorite_ingredients,
          dislikedIngredients: data.disliked_ingredients,
          preferredCuisines: data.preferred_cuisines,
          cookingSkillLevel: data.cooking_skill_level,
          healthGoals: data.health_goals,
          profileNotes: data.profile_notes,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (error) {
      console.error('Profile fetching error:', error);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        incrementLoginAttempts();
        console.error('Sign in error:', error);
        throw error;
      }
      
      // Reset login attempts on successful login
      resetLoginAttempts();
      return data;
    } catch (error) {
      console.error('Sign in process error:', error);
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
        console.error('Sign up error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Sign up process error:', error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign out process error:', error);
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Password reset process error:', error);
      throw error;
    }
  };
  
  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      // Convert our UserProfile type fields to the database column names
      const dbData: any = {};
      
      if (profileData.username !== undefined) dbData.username = profileData.username;
      if (profileData.avatarUrl !== undefined) dbData.avatar_url = profileData.avatarUrl;
      if (profileData.dietaryRestrictions !== undefined) dbData.dietary_restrictions = profileData.dietaryRestrictions;
      if (profileData.allergies !== undefined) dbData.allergies = profileData.allergies;
      if (profileData.favoriteIngredients !== undefined) dbData.favorite_ingredients = profileData.favoriteIngredients;
      if (profileData.dislikedIngredients !== undefined) dbData.disliked_ingredients = profileData.dislikedIngredients;
      if (profileData.preferredCuisines !== undefined) dbData.preferred_cuisines = profileData.preferredCuisines;
      if (profileData.cookingSkillLevel !== undefined) dbData.cooking_skill_level = profileData.cookingSkillLevel;
      if (profileData.healthGoals !== undefined) dbData.health_goals = profileData.healthGoals;
      if (profileData.profileNotes !== undefined) dbData.profile_notes = profileData.profileNotes;
      
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Update local state
      setProfile(prev => {
        if (!prev) return profileData as UserProfile;
        return { ...prev, ...profileData };
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };
  
  const incrementLoginAttempts = () => {
    setLoginAttempts(prev => prev + 1);
  };
  
  const resetLoginAttempts = () => {
    setLoginAttempts(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUserProfile,
        isPasswordResetAttempt,
        setIsPasswordResetAttempt,
        loginAttempts,
        incrementLoginAttempts,
        resetLoginAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
