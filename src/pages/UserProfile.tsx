
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChefHat, User, Utensils, Save, PlusCircle, X, AlertCircle, Tag, Heart, User2, Edit, LogOut, Leaf, Banana } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from 'framer-motion';
import { UserProfile as ProfileType } from '@/types/Recipe';

const UserProfile: React.FC = () => {
  const { user, profile, updateUserProfile, signOut } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<Partial<ProfileType>>({});
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newFavoriteIngredient, setNewFavoriteIngredient] = useState('');
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  const [newPreferredCuisine, setNewPreferredCuisine] = useState('');
  const [newHealthGoal, setNewHealthGoal] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (profile) {
      setFormValues({
        username: profile.username,
        dietaryRestrictions: [...(profile.dietaryRestrictions || [])],
        allergies: [...(profile.allergies || [])],
        favoriteIngredients: [...(profile.favoriteIngredients || [])],
        dislikedIngredients: [...(profile.dislikedIngredients || [])],
        preferredCuisines: [...(profile.preferredCuisines || [])],
        cookingSkillLevel: profile.cookingSkillLevel,
        healthGoals: [...(profile.healthGoals || [])],
        profileNotes: profile.profileNotes,
        mentionInTitle: profile.mentionInTitle
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileType, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: keyof ProfileType, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;
    
    setFormValues(prev => {
      const currentArray = prev[field] as string[] || [];
      if (!currentArray.includes(value)) {
        return { ...prev, [field]: [...currentArray, value.trim()] };
      }
      return prev;
    });
    
    setter('');
  };

  const removeItem = (field: keyof ProfileType, index: number) => {
    setFormValues(prev => {
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile(formValues);
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormValues({
        username: profile.username,
        dietaryRestrictions: [...(profile.dietaryRestrictions || [])],
        allergies: [...(profile.allergies || [])],
        favoriteIngredients: [...(profile.favoriteIngredients || [])],
        dislikedIngredients: [...(profile.dislikedIngredients || [])],
        preferredCuisines: [...(profile.preferredCuisines || [])],
        cookingSkillLevel: profile.cookingSkillLevel,
        healthGoals: [...(profile.healthGoals || [])],
        profileNotes: profile.profileNotes,
        mentionInTitle: profile.mentionInTitle
      });
    }
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out. Please try again."
      });
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-recipe-green" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-5xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <User2 className="mr-2 h-6 w-6 text-recipe-green" />
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-recipe-green hover:bg-recipe-green/90">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-recipe-green" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {editMode ? (
                <Input
                  id="username"
                  value={formValues.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                />
              ) : (
                <div className="text-lg font-medium">{profile.username}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="text-gray-600 dark:text-gray-400">{user.email}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cookingSkillLevel">Cooking Skill Level</Label>
              {editMode ? (
                <Select
                  value={formValues.cookingSkillLevel || 'intermediate'}
                  onValueChange={(value) => handleInputChange('cookingSkillLevel', value as 'beginner' | 'intermediate' | 'advanced')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your cooking level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="capitalize text-gray-600 dark:text-gray-400">
                  {profile.cookingSkillLevel || 'Intermediate'}
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Button
                variant="outline" 
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              
              {showLogoutConfirm && (
                <motion.div 
                  className="mt-2 p-3 bg-destructive/10 rounded-md"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm mb-2 text-destructive">Are you sure you want to log out?</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={handleLogout}>Yes, logout</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-recipe-green" />
              Dietary Preferences
            </CardTitle>
            <CardDescription>
              These preferences will be used by the AI to suggest recipes tailored to your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="mentionInTitle" className="font-medium">
                  Show preferences in recipe titles
                </Label>
                {editMode ? (
                  <Switch
                    id="mentionInTitle"
                    checked={formValues.mentionInTitle}
                    onCheckedChange={(checked) => handleInputChange('mentionInTitle', checked)}
                  />
                ) : (
                  <Badge variant={profile.mentionInTitle ? "default" : "outline"}>
                    {profile.mentionInTitle ? "Enabled" : "Disabled"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                When disabled, AI will still respect your preferences but won't include them in recipe titles (e.g. "Pizza" instead of "Vegetarian Pizza without Garlic")
              </p>
            </div>
            
            <Separator />

            <div className="space-y-3">
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2">
                {(formValues.dietaryRestrictions || []).map((item, index) => (
                  <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-recipe-green/20 text-recipe-green border-recipe-green/30">
                    {item}
                    {editMode && (
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-recipe-red" 
                        onClick={() => removeItem('dietaryRestrictions', index)} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newDietaryRestriction}
                    onChange={(e) => setNewDietaryRestriction(e.target.value)}
                    placeholder="E.g., Vegetarian, Vegan, Keto"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('dietaryRestrictions', newDietaryRestriction, setNewDietaryRestriction);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('dietaryRestrictions', newDietaryRestriction, setNewDietaryRestriction)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Allergies</Label>
              <div className="flex flex-wrap gap-2">
                {(formValues.allergies || []).map((item, index) => (
                  <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-recipe-red/20 text-recipe-red border-recipe-red/30">
                    {item}
                    {editMode && (
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-recipe-red" 
                        onClick={() => removeItem('allergies', index)} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="E.g., Nuts, Shellfish, Dairy"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('allergies', newAllergy, setNewAllergy);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Favorite Ingredients</Label>
              <div className="flex flex-wrap gap-2">
                {(formValues.favoriteIngredients || []).map((item, index) => (
                  <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-recipe-orange/20 text-recipe-orange border-recipe-orange/30">
                    {item}
                    {editMode && (
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-recipe-red" 
                        onClick={() => removeItem('favoriteIngredients', index)} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newFavoriteIngredient}
                    onChange={(e) => setNewFavoriteIngredient(e.target.value)}
                    placeholder="E.g., Avocado, Chickpeas, Garlic"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('favoriteIngredients', newFavoriteIngredient, setNewFavoriteIngredient);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('favoriteIngredients', newFavoriteIngredient, setNewFavoriteIngredient)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Disliked Ingredients</Label>
              <div className="flex flex-wrap gap-2">
                {(formValues.dislikedIngredients || []).map((item, index) => (
                  <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                    {item}
                    {editMode && (
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-recipe-red" 
                        onClick={() => removeItem('dislikedIngredients', index)} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newDislikedIngredient}
                    onChange={(e) => setNewDislikedIngredient(e.target.value)}
                    placeholder="E.g., Cilantro, Bell Peppers, Olives"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('dislikedIngredients', newDislikedIngredient, setNewDislikedIngredient);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('dislikedIngredients', newDislikedIngredient, setNewDislikedIngredient)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Preferred Cuisines</Label>
              <div className="flex flex-wrap gap-2">
                {(formValues.preferredCuisines || []).map((item, index) => (
                  <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-recipe-purple/20 text-recipe-purple border-recipe-purple/30">
                    {item}
                    {editMode && (
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-recipe-red" 
                        onClick={() => removeItem('preferredCuisines', index)} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newPreferredCuisine}
                    onChange={(e) => setNewPreferredCuisine(e.target.value)}
                    placeholder="E.g., Italian, Thai, Mexican"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('preferredCuisines', newPreferredCuisine, setNewPreferredCuisine);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('preferredCuisines', newPreferredCuisine, setNewPreferredCuisine)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Health Goals</Label>
              <div className="flex flex-wrap gap-2">
                {(formValues.healthGoals || []).map((item, index) => (
                  <Badge key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {item}
                    {editMode && (
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-recipe-red" 
                        onClick={() => removeItem('healthGoals', index)} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newHealthGoal}
                    onChange={(e) => setNewHealthGoal(e.target.value)}
                    placeholder="E.g., Weight Loss, Muscle Gain, Low Carb"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('healthGoals', newHealthGoal, setNewHealthGoal);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('healthGoals', newHealthGoal, setNewHealthGoal)}
                    variant="outline"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="profileNotes">Additional Notes</Label>
              {editMode ? (
                <Textarea
                  id="profileNotes"
                  value={formValues.profileNotes || ''}
                  onChange={(e) => handleInputChange('profileNotes', e.target.value)}
                  placeholder="Add any additional information about your preferences or restrictions"
                  rows={4}
                />
              ) : (
                <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {profile.profileNotes || 'No additional notes provided.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UserProfile;
