
import React, { useState } from 'react';
import { Recipe } from '@/types/Recipe';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download, Heart, Star, Clock, Tag, Timer, FileText, ShoppingBag, Edit, Save, AlarmClock } from 'lucide-react';
import { exportToPdf } from '@/utils/pdfExport';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface RecipeDetailProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ 
  recipe,
  onToggleFavorite,
  onRate,
  onUpdateNotes
}) => {
  const navigate = useNavigate();
  const isRTL = recipe.isRTL || false;
  const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
  const instructionsLabel = recipe.instructionsLabel || 'Instructions';
  
  const [notes, setNotes] = useState(recipe.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ minutes: number, seconds: number, label: string } | null>(null);
  const [customMinutes, setCustomMinutes] = useState('5');
  const [timerRunning, setTimerRunning] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPdf = () => {
    exportToPdf(recipe);
  };
  
  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(recipe.id, notes);
    }
    setIsEditingNotes(false);
  };
  
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(recipe.id);
    }
  };
  
  const handleRate = (rating: number) => {
    if (onRate) {
      onRate(recipe.id, rating);
    }
  };
  
  const generateShoppingList = () => {
    const list = recipe.ingredients.map(ingredient => `- ${ingredient}`).join('\n');
    const blob = new Blob([`Shopping List for ${recipe.name}\n\n${list}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${recipe.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const startTimer = (minutes: number, label: string) => {
    setActiveTimer({ minutes, seconds: 0, label });
    setTimerRunning(true);
    setIsTimerOpen(false);
  };
  
  const startCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      startTimer(mins, `Custom timer (${mins} min)`);
    }
  };
  
  const getDifficultyColor = (level?: string) => {
    switch(level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <motion.div 
      dir={isRTL ? "rtl" : "ltr"}
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white rounded-lg shadow-lg recipe-section break-words ${isRTL ? 'rtl' : 'ltr'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-6 print:hidden`}>
<Button
  variant="ghost"
  onClick={() => navigate('/recipes')}
>
  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
  {isRTL ? 'חזרה לכל המתכונים' : 'Back to All Recipes'}
</Button>

        
        <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2`}>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="text-recipe-green border-recipe-green hover:bg-recipe-green/10"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isRTL ? 'הדפסה' : 'Print'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportPdf}
            className="text-recipe-orange border-recipe-orange hover:bg-recipe-orange/10"
          >
            <Download className="h-4 w-4 mr-2" />
            {isRTL ? 'ייצוא ל-PDF' : 'Export PDF'}
          </Button>
          
          <Button
            variant="outline"
            onClick={generateShoppingList}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isRTL ? 'רשימת קניות' : 'Shopping List'}
          </Button>
          
          <Dialog open={isTimerOpen} onOpenChange={setIsTimerOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Timer className="h-4 w-4 mr-2" />
                {isRTL ? 'טיימר' : 'Timer'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isRTL ? 'הגדר טיימר למתכון' : 'Set Recipe Timer'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => startTimer(5, '5 minutes')} variant="outline">5 {isRTL ? 'דקות' : 'minutes'}</Button>
                  <Button onClick={() => startTimer(10, '10 minutes')} variant="outline">10 {isRTL ? 'דקות' : 'minutes'}</Button>
                  <Button onClick={() => startTimer(15, '15 minutes')} variant="outline">15 {isRTL ? 'דקות' : 'minutes'}</Button>
                  <Button onClick={() => startTimer(30, '30 minutes')} variant="outline">30 {isRTL ? 'דקות' : 'minutes'}</Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder={isRTL ? 'דקות מותאמות אישית' : 'Custom minutes'}
                    min="1"
                    max="999"
                  />
                  <Button onClick={startCustomTimer}>{isRTL ? 'התחל' : 'Start'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className={`text-3xl font-bold text-recipe-green ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>
          {recipe.name}
        </h1>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
            aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-6 w-6 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </motion.button>
          
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="focus:outline-none"
              >
                <Star 
                  className={`h-6 w-6 ${recipe.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recipe metadata */}
      <div className={`flex flex-wrap gap-2 mb-6 ${isRTL ? 'justify-end' : 'justify-start'}`}>
        {recipe.difficulty && (
          <Badge variant="outline" className={`${getDifficultyColor(recipe.difficulty)} flex items-center gap-1 px-3 py-1`}>
            <FileText className="h-3 w-3" />
            {recipe.difficulty}
          </Badge>
        )}
        
        {recipe.estimatedTime && (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1 px-3 py-1">
            <Clock className="h-3 w-3" />
            {recipe.estimatedTime}
          </Badge>
        )}
        
        {recipe.calories && (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1 px-3 py-1">
            <FileText className="h-3 w-3" />
            {recipe.calories}
          </Badge>
        )}
        
        {recipe.tags && recipe.tags.map((tag, idx) => (
          <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-800 flex items-center gap-1 px-3 py-1">
            <Tag className="h-3 w-3" />
            {tag}
          </Badge>
        ))}
      </div>
      
      {/* Active timer notification */}
      {activeTimer && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center">
            <AlarmClock className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium">{activeTimer.label}: </span>
            <span className="ml-2 text-lg font-bold">
              {String(activeTimer.minutes).padStart(2, '0')}:{String(activeTimer.seconds).padStart(2, '0')}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTimer(null)}
            className="text-blue-600 border-blue-300"
          >
            {isRTL ? 'בטל' : 'Cancel'}
          </Button>
        </motion.div>
      )}
      
      <Tabs defaultValue="recipe" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="recipe">{isRTL ? 'מתכון' : 'Recipe'}</TabsTrigger>
          <TabsTrigger value="notes">{isRTL ? 'הערות' : 'Notes'}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recipe" className="space-y-8">
          <div className="mb-8">
                      <h2
                          className={
                              `text-2xl font-semibold text-recipe-orange mb-4 ` +
                              (isRTL ? 'text-right' : 'text-left')
                          }
                      >
                          {ingredientsLabel}
                      </h2>

                      <ul
                          className={
                              isRTL
                                  ? "list-disc pr-6 list-inside space-y-2"
                                  : "list-disc pl-6 list-outside space-y-2"
                          }
                      >
                          {recipe.ingredients.map((ingredient, index) => (
                              <li key={index} className="text-lg">{ingredient}</li>
                          ))}
                      </ul>

          </div>
          
          <div>
                      <h2
                          className={
                              `text-2xl font-semibold text-recipe-orange mb-4 ` +
                              (isRTL ? 'text-right' : 'text-left')
                          }
                      >
                          {instructionsLabel}
                      </h2>

            <ol className={`${isRTL ? 'list-decimal pr-6' : 'list-decimal pl-6'} space-y-4`}>
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-lg relative group">
                  <div className="flex items-start">
                    <div className="flex-grow">{instruction}</div>
                    {instruction.toLowerCase().includes('minute') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Timer className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{isRTL ? 'הגדר טיימר לצעד זה' : 'Set Timer for this Step'}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="mb-4">{instruction}</p>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                onClick={() => {
                                  // Extract number from instruction text (e.g., "5 minutes" -> 5)
                                  const match = instruction.match(/(\d+)(?=\s*(?:minute|min))/i);
                                  const minutes = match ? parseInt(match[1]) : 5;
                                  startTimer(minutes, `Step ${index + 1}`);
                                }}
                              >
                                {isRTL ? 'התחל טיימר' : 'Start Timer'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>
        
        <TabsContent value="notes">
          <div className="bg-yellow-50 rounded-lg p-6 min-h-[200px]">
            {isEditingNotes ? (
              <div className="space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[150px] bg-white border-yellow-200"
                  placeholder={isRTL ? "הערות אישיות שלך למתכון..." : "Your personal notes about this recipe..."}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div className={`flex ${isRTL ? "justify-start" : "justify-end"} space-x-2`}>
                  <Button onClick={() => setIsEditingNotes(false)} variant="outline">
                    {isRTL ? "ביטול" : "Cancel"}
                  </Button>
                  <Button onClick={handleSaveNotes} className="bg-recipe-green hover:bg-recipe-green/90">
                    <Save className="h-4 w-4 mr-2" />
                    {isRTL ? "שמור הערות" : "Save Notes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-semibold ${isRTL ? "text-right" : "text-left"}`}>
                    {isRTL ? "הערות אישיות" : "Personal Notes"}
                  </h3>
                  <Button 
                    onClick={() => setIsEditingNotes(true)} 
                    variant="ghost" 
                    size="sm"
                    className="text-recipe-green"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isRTL ? "ערוך" : "Edit"}
                  </Button>
                </div>
                {notes ? (
                  <p className={isRTL ? "text-right" : "text-left"}>{notes}</p>
                ) : (
                  <p className={`text-gray-500 italic ${isRTL ? "text-right" : "text-left"}`}>
                    {isRTL 
                      ? "אין הערות אישיות עדיין. לחץ על 'ערוך' כדי להוסיף הערות."
                      : "No personal notes yet. Click 'Edit' to add notes."}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className={`mt-8 text-sm text-gray-500 ${isRTL ? 'text-left' : 'text-right'}`}>
        {isRTL ? 'נוצר:' : 'Created:'} {new Date(recipe.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default RecipeDetail;
