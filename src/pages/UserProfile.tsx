
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCog, Save, Plus, X, User } from 'lucide-react';

const formatUsername = (email: string) => {
  return email.split('@')[0];
};

const UserProfilePage: React.FC = () => {
  const { user, profile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<Partial<UserProfile>>({
    username: '',
    dietaryRestrictions: [],
    allergies: [],
    favoriteIngredients: [],
    dislikedIngredients: [],
    preferredCuisines: [],
    cookingSkillLevel: 'intermediate',
    healthGoals: [],
    profileNotes: '',
  });
  
  const [newItem, setNewItem] = useState({
    dietaryRestrictions: '',
    allergies: '',
    favoriteIngredients: '',
    dislikedIngredients: '',
    preferredCuisines: '',
    healthGoals: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setFormState({
        username: profile.username || formatUsername(user?.email || ''),
        dietaryRestrictions: profile.dietaryRestrictions || [],
        allergies: profile.allergies || [],
        favoriteIngredients: profile.favoriteIngredients || [],
        dislikedIngredients: profile.dislikedIngredients || [],
        preferredCuisines: profile.preferredCuisines || [],
        cookingSkillLevel: profile.cookingSkillLevel || 'intermediate',
        healthGoals: profile.healthGoals || [],
        profileNotes: profile.profileNotes || '',
      });
    } else if (user) {
      setFormState({
        username: formatUsername(user.email || ''),
        dietaryRestrictions: [],
        allergies: [],
        favoriteIngredients: [],
        dislikedIngredients: [],
        preferredCuisines: [],
        cookingSkillLevel: 'intermediate',
        healthGoals: [],
        profileNotes: '',
      });
    }
  }, [profile, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string, field: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddItem = (field: keyof typeof newItem) => {
    if (!newItem[field].trim()) return;
    
    setFormState(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[] || []), newItem[field]]
    }));
    
    setNewItem(prev => ({ ...prev, [field]: '' }));
  };
  
  const handleRemoveItem = (field: string, index: number) => {
    setFormState(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await updateUserProfile({
        ...formState,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile preferences have been saved successfully.'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view and edit your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <UserCog className="h-8 w-8 mr-3 text-recipe-green" />
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-recipe-green/10 to-recipe-cream/20 dark:from-recipe-green/20 dark:to-transparent">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4 border-2 border-recipe-green shadow-md">
                <AvatarImage src={profile?.avatarUrl || ''} />
                <AvatarFallback className="bg-recipe-green text-white text-xl">
                  {(profile?.username || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile?.username || formatUsername(user.email || '')}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <Separator />
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        Username
                      </label>
                      <Input
                        id="username"
                        name="username"
                        value={formState.username || ''}
                        onChange={handleInputChange}
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Cooking Preferences</h3>
                <Separator />
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="cookingSkillLevel" className="text-sm font-medium">
                        Cooking Skill Level
                      </label>
                      <Select
                        value={formState.cookingSkillLevel}
                        onValueChange={(value) => handleSelectChange(value, 'cookingSkillLevel')}
                      >
                        <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50">
                          <SelectValue placeholder="Select your cooking skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Dietary Restrictions
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formState.dietaryRestrictions?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('dietaryRestrictions', index)}
                            className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newItem.dietaryRestrictions}
                        onChange={(e) => setNewItem({ ...newItem, dietaryRestrictions: e.target.value })}
                        placeholder="E.g., Vegetarian, Vegan, Keto..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                      <Button 
                        type="button" 
                        onClick={() => handleAddItem('dietaryRestrictions')}
                        className="bg-recipe-green hover:bg-recipe-green/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Allergies
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formState.allergies?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('allergies', index)}
                            className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newItem.allergies}
                        onChange={(e) => setNewItem({ ...newItem, allergies: e.target.value })}
                        placeholder="E.g., Peanuts, Shellfish, Gluten..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                      <Button 
                        type="button" 
                        onClick={() => handleAddItem('allergies')}
                        className="bg-recipe-green hover:bg-recipe-green/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Favorite Ingredients
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formState.favoriteIngredients?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('favoriteIngredients', index)}
                            className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newItem.favoriteIngredients}
                        onChange={(e) => setNewItem({ ...newItem, favoriteIngredients: e.target.value })}
                        placeholder="E.g., Garlic, Olive Oil, Tomatoes..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                      <Button 
                        type="button" 
                        onClick={() => handleAddItem('favoriteIngredients')}
                        className="bg-recipe-green hover:bg-recipe-green/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Disliked Ingredients
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formState.dislikedIngredients?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('dislikedIngredients', index)}
                            className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newItem.dislikedIngredients}
                        onChange={(e) => setNewItem({ ...newItem, dislikedIngredients: e.target.value })}
                        placeholder="E.g., Cilantro, Blue Cheese, Olives..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                      <Button 
                        type="button" 
                        onClick={() => handleAddItem('dislikedIngredients')}
                        className="bg-recipe-green hover:bg-recipe-green/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Preferred Cuisines
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formState.preferredCuisines?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('preferredCuisines', index)}
                            className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newItem.preferredCuisines}
                        onChange={(e) => setNewItem({ ...newItem, preferredCuisines: e.target.value })}
                        placeholder="E.g., Italian, Thai, Mexican..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                      <Button 
                        type="button" 
                        onClick={() => handleAddItem('preferredCuisines')}
                        className="bg-recipe-green hover:bg-recipe-green/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Health Goals
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formState.healthGoals?.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('healthGoals', index)}
                            className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newItem.healthGoals}
                        onChange={(e) => setNewItem({ ...newItem, healthGoals: e.target.value })}
                        placeholder="E.g., Weight Loss, Muscle Building, Heart Health..."
                        className="transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                      />
                      <Button 
                        type="button" 
                        onClick={() => handleAddItem('healthGoals')}
                        className="bg-recipe-green hover:bg-recipe-green/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="profileNotes" className="text-sm font-medium">
                      Additional Notes
                    </label>
                    <Textarea
                      id="profileNotes"
                      name="profileNotes"
                      value={formState.profileNotes || ''}
                      onChange={handleInputChange}
                      placeholder="Any other preferences or notes you'd like the AI to consider..."
                      className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/20 flex justify-end space-x-2 pt-6">
              <Button
                type="submit"
                className="bg-recipe-green hover:bg-recipe-green/90 transition-all"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
