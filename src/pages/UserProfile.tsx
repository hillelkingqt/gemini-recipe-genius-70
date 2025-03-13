
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  User, Heart, AlertTriangle, Salad, Globe, Star, BookText, ChefHat, Loader2,
  Save, Check, X, PlusCircle, MinusCircle
} from 'lucide-react';

const UserProfile = () => {
  const { user, profile, getProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([]);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [cookingSkillLevel, setCookingSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [profileNotes, setProfileNotes] = useState('');
  
  // New item inputs
  const [newRestriction, setNewRestriction] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newFavorite, setNewFavorite] = useState('');
  const [newDisliked, setNewDisliked] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [newHealthGoal, setNewHealthGoal] = useState('');
  
  // Available options for checkboxes
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'keto', label: 'Keto' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'low-carb', label: 'Low Carb' },
  ];
  
  const allergiesOptions = [
    { id: 'nuts', label: 'Nuts' },
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'soy', label: 'Soy' },
    { id: 'wheat', label: 'Wheat' },
  ];
  
  const cuisineOptions = [
    { id: 'italian', label: 'Italian' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'indian', label: 'Indian' },
    { id: 'thai', label: 'Thai' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'french', label: 'French' },
    { id: 'chinese', label: 'Chinese' },
    { id: 'middle-eastern', label: 'Middle Eastern' },
  ];
  
  const healthGoalOptions = [
    { id: 'weight-loss', label: 'Weight Loss' },
    { id: 'muscle-gain', label: 'Muscle Gain' },
    { id: 'more-protein', label: 'More Protein' },
    { id: 'less-sugar', label: 'Less Sugar' },
    { id: 'less-sodium', label: 'Less Sodium' },
    { id: 'more-vegetables', label: 'More Vegetables' },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        await getProfile();
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Unable to load your profile. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && !profile) {
      loadProfile();
    }
  }, [user, profile, getProfile]);
  
  useEffect(() => {
    if (profile) {
      setDietaryRestrictions(profile.dietaryRestrictions || []);
      setAllergies(profile.allergies || []);
      setFavoriteIngredients(profile.favoriteIngredients || []);
      setDislikedIngredients(profile.dislikedIngredients || []);
      setPreferredCuisines(profile.preferredCuisines || []);
      setCookingSkillLevel(profile.cookingSkillLevel || 'intermediate');
      setHealthGoals(profile.healthGoals || []);
      setProfileNotes(profile.profileNotes || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          dietaryRestrictions,
          allergies,
          favoriteIngredients,
          dislikedIngredients,
          preferredCuisines,
          cookingSkillLevel,
          healthGoals,
          profileNotes,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await getProfile();
      
      toast({
        title: 'Profile Updated',
        description: 'Your preferences have been saved successfully!',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Save Failed',
        description: 'Unable to save your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper functions to add and remove items from arrays
  const addItem = (item: string, array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!item.trim()) return;
    if (!array.includes(item.trim())) {
      setter([...array, item.trim()]);
      inputSetter('');
    }
  };
  
  const removeItem = (item: string, array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(array.filter(i => i !== item));
  };
  
  // Toggle item in an array (for checkboxes)
  const toggleItem = (item: string, array: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-recipe-green mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <User className="mr-2 h-8 w-8 text-recipe-green" />
          Profile & Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Customize your recipe preferences to get personalized recommendations
        </p>
      </motion.div>
      
      <Tabs defaultValue="dietary" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="dietary" className="flex items-center">
            <Salad className="h-4 w-4 mr-2" />
            <span>Dietary</span>
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            <span>Ingredients</span>
          </TabsTrigger>
          <TabsTrigger value="cuisines" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            <span>Cuisines</span>
          </TabsTrigger>
          <TabsTrigger value="cooking" className="flex items-center">
            <ChefHat className="h-4 w-4 mr-2" />
            <span>Cooking</span>
          </TabsTrigger>
        </TabsList>
      
        {/* Dietary Restrictions & Allergies */}
        <TabsContent value="dietary" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Salad className="h-5 w-5 mr-2 text-recipe-green" />
                  Dietary Restrictions
                </CardTitle>
                <CardDescription>
                  Select any dietary restrictions you follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {dietaryOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`dietary-${option.id}`}
                        checked={dietaryRestrictions.includes(option.id)}
                        onCheckedChange={() => toggleItem(option.id, dietaryRestrictions, setDietaryRestrictions)}
                      />
                      <Label htmlFor={`dietary-${option.id}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="custom-restriction">Add Custom Restriction</Label>
                  <div className="flex mt-2">
                    <Input 
                      id="custom-restriction"
                      value={newRestriction}
                      onChange={(e) => setNewRestriction(e.target.value)}
                      placeholder="e.g., No processed food"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      onClick={() => addItem(newRestriction, dietaryRestrictions, setDietaryRestrictions, setNewRestriction)}
                      disabled={!newRestriction.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {dietaryRestrictions.filter(item => !dietaryOptions.some(option => option.id === item)).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dietaryRestrictions
                      .filter(item => !dietaryOptions.some(option => option.id === item))
                      .map(item => (
                        <div 
                          key={item} 
                          className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 flex items-center text-sm"
                        >
                          {item}
                          <button 
                            onClick={() => removeItem(item, dietaryRestrictions, setDietaryRestrictions)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Allergies & Intolerances
                </CardTitle>
                <CardDescription>
                  Select any allergies or food intolerances you have
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {allergiesOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`allergy-${option.id}`}
                        checked={allergies.includes(option.id)}
                        onCheckedChange={() => toggleItem(option.id, allergies, setAllergies)}
                      />
                      <Label htmlFor={`allergy-${option.id}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="custom-allergy">Add Custom Allergy</Label>
                  <div className="flex mt-2">
                    <Input 
                      id="custom-allergy"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="e.g., Sesame"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      onClick={() => addItem(newAllergy, allergies, setAllergies, setNewAllergy)}
                      disabled={!newAllergy.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {allergies.filter(item => !allergiesOptions.some(option => option.id === item)).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {allergies
                      .filter(item => !allergiesOptions.some(option => option.id === item))
                      .map(item => (
                        <div 
                          key={item} 
                          className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 flex items-center text-sm"
                        >
                          {item}
                          <button 
                            onClick={() => removeItem(item, allergies, setAllergies)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Ingredients Preferences */}
        <TabsContent value="ingredients" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-recipe-green" />
                  Favorite Ingredients
                </CardTitle>
                <CardDescription>
                  Add ingredients you love to use in your recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {favoriteIngredients.length > 0 ? (
                    favoriteIngredients.map(item => (
                      <div 
                        key={item} 
                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full px-3 py-1 flex items-center text-sm"
                      >
                        {item}
                        <button 
                          onClick={() => removeItem(item, favoriteIngredients, setFavoriteIngredients)}
                          className="ml-2 text-green-600 hover:text-red-500 dark:text-green-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">No favorite ingredients added yet</p>
                  )}
                </div>
                
                <div className="flex mt-2">
                  <Input 
                    value={newFavorite}
                    onChange={(e) => setNewFavorite(e.target.value)}
                    placeholder="e.g., Garlic"
                    className="flex-1 mr-2"
                  />
                  <Button 
                    onClick={() => addItem(newFavorite, favoriteIngredients, setFavoriteIngredients, setNewFavorite)}
                    disabled={!newFavorite.trim()}
                    className="bg-recipe-green hover:bg-recipe-green/90"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <X className="h-5 w-5 mr-2 text-red-500" />
                  Disliked Ingredients
                </CardTitle>
                <CardDescription>
                  Add ingredients you prefer to avoid in your recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dislikedIngredients.length > 0 ? (
                    dislikedIngredients.map(item => (
                      <div 
                        key={item} 
                        className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full px-3 py-1 flex items-center text-sm"
                      >
                        {item}
                        <button 
                          onClick={() => removeItem(item, dislikedIngredients, setDislikedIngredients)}
                          className="ml-2 text-red-600 hover:text-red-800 dark:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">No disliked ingredients added yet</p>
                  )}
                </div>
                
                <div className="flex mt-2">
                  <Input 
                    value={newDisliked}
                    onChange={(e) => setNewDisliked(e.target.value)}
                    placeholder="e.g., Cilantro"
                    className="flex-1 mr-2"
                  />
                  <Button 
                    onClick={() => addItem(newDisliked, dislikedIngredients, setDislikedIngredients, setNewDisliked)}
                    disabled={!newDisliked.trim()}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Cuisine Preferences */}
        <TabsContent value="cuisines" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-recipe-green" />
                  Preferred Cuisines
                </CardTitle>
                <CardDescription>
                  Select cuisines you enjoy the most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {cuisineOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cuisine-${option.id}`}
                        checked={preferredCuisines.includes(option.id)}
                        onCheckedChange={() => toggleItem(option.id, preferredCuisines, setPreferredCuisines)}
                      />
                      <Label htmlFor={`cuisine-${option.id}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="custom-cuisine">Add Other Cuisine</Label>
                  <div className="flex mt-2">
                    <Input 
                      id="custom-cuisine"
                      value={newCuisine}
                      onChange={(e) => setNewCuisine(e.target.value)}
                      placeholder="e.g., Korean"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      onClick={() => addItem(newCuisine, preferredCuisines, setPreferredCuisines, setNewCuisine)}
                      disabled={!newCuisine.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {preferredCuisines.filter(item => !cuisineOptions.some(option => option.id === item)).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {preferredCuisines
                      .filter(item => !cuisineOptions.some(option => option.id === item))
                      .map(item => (
                        <div 
                          key={item} 
                          className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 flex items-center text-sm"
                        >
                          {item}
                          <button 
                            onClick={() => removeItem(item, preferredCuisines, setPreferredCuisines)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Cooking Preferences */}
        <TabsContent value="cooking" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="h-5 w-5 mr-2 text-recipe-green" />
                  Cooking Experience
                </CardTitle>
                <CardDescription>
                  Select your cooking skill level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`p-4 rounded-lg border-2 ${
                        cookingSkillLevel === 'beginner' 
                          ? 'border-recipe-green bg-recipe-green/10 dark:bg-recipe-green/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      } cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-center`}
                      onClick={() => setCookingSkillLevel('beginner')}
                    >
                      <div className="text-3xl mb-2">👶</div>
                      <div className="font-medium">Beginner</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Simple recipes</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`p-4 rounded-lg border-2 ${
                        cookingSkillLevel === 'intermediate' 
                          ? 'border-recipe-green bg-recipe-green/10 dark:bg-recipe-green/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      } cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-center`}
                      onClick={() => setCookingSkillLevel('intermediate')}
                    >
                      <div className="text-3xl mb-2">👨‍🍳</div>
                      <div className="font-medium">Intermediate</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Moderate recipes</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`p-4 rounded-lg border-2 ${
                        cookingSkillLevel === 'advanced' 
                          ? 'border-recipe-green bg-recipe-green/10 dark:bg-recipe-green/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      } cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-center`}
                      onClick={() => setCookingSkillLevel('advanced')}
                    >
                      <div className="text-3xl mb-2">🌟</div>
                      <div className="font-medium">Advanced</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Complex recipes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-recipe-green" />
                  Health Goals
                </CardTitle>
                <CardDescription>
                  Select your health and nutrition goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {healthGoalOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`goal-${option.id}`}
                        checked={healthGoals.includes(option.id)}
                        onCheckedChange={() => toggleItem(option.id, healthGoals, setHealthGoals)}
                      />
                      <Label htmlFor={`goal-${option.id}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="custom-goal">Add Other Health Goal</Label>
                  <div className="flex mt-2">
                    <Input 
                      id="custom-goal"
                      value={newHealthGoal}
                      onChange={(e) => setNewHealthGoal(e.target.value)}
                      placeholder="e.g., Heart healthy"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      onClick={() => addItem(newHealthGoal, healthGoals, setHealthGoals, setNewHealthGoal)}
                      disabled={!newHealthGoal.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                
                {healthGoals.filter(item => !healthGoalOptions.some(option => option.id === item)).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {healthGoals
                      .filter(item => !healthGoalOptions.some(option => option.id === item))
                      .map(item => (
                        <div 
                          key={item} 
                          className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 flex items-center text-sm"
                        >
                          {item}
                          <button 
                            onClick={() => removeItem(item, healthGoals, setHealthGoals)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookText className="h-5 w-5 mr-2 text-recipe-green" />
                  Additional Notes
                </CardTitle>
                <CardDescription>
                  Add any other preferences or notes about your cooking style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={profileNotes}
                  onChange={(e) => setProfileNotes(e.target.value)}
                  placeholder="e.g., I prefer quick weeknight meals, I like spicy food, etc."
                  rows={4}
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSaveProfile} 
          disabled={isSaving}
          className="w-full md:w-auto bg-recipe-green hover:bg-recipe-green/90"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
