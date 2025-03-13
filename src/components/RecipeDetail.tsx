import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types/Recipe';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download, Heart, Star, Clock, Tag, FileText, ShoppingBag, Edit, Save, AlarmClock, PlayCircle, Send } from 'lucide-react';
import { exportToPdf } from '@/utils/pdfExport';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';



interface RecipeDetailProps {
    recipe: Recipe;
    onToggleFavorite?: (id: string) => void;
    onRate?: (id: string, rating: number) => Promise<void>;
    onFavoriteToggle?: (id: string) => Promise<void>;
    onUpdateNotes?: (id: string, notes: string) => void;
    onCloseDetail?: () => void;

    // נוסיף עכשיו:
    onDelete?: (id: string) => Promise<void>;
    onUpdate?: (id: string, updates: Partial<Recipe>) => Promise<void>;
    onPublish?: (id: string) => Promise<void>;
    onUnpublish?: (id: string) => Promise<void>;
}




const RecipeDetail: React.FC<RecipeDetailProps> = ({
    recipe,
    onFavoriteToggle,
    onRate,
    onUpdateNotes,
    onCloseDetail,
    onDelete,
    onUpdate,
    onPublish,
    onUnpublish
}) => {

  const navigate = useNavigate();
  const isRTL = recipe.isRTL || false;
  const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
  const instructionsLabel = recipe.instructionsLabel || 'Instructions';
  
  const [notes, setNotes] = useState(recipe.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ minutes: number, seconds: number, label: string } | null>(null);
    useEffect(() => {
        if (!activeTimer) return;
        const interval = setInterval(() => {
            setActiveTimer(prevTimer => {
                if (!prevTimer) return null;
                const { minutes, seconds, label } = prevTimer;
                if (minutes === 0 && seconds === 0) {
                    clearInterval(interval);
                    return null; // הטיימר נגמר
                } else if (seconds === 0) {
                    return { minutes: minutes - 1, seconds: 59, label };
                } else {
                    return { minutes, seconds: seconds - 1, label };
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTimer]);

  const [customMinutes, setCustomMinutes] = useState('5');
  const [timerRunning, setTimerRunning] = useState(false);
  const [isInCookMode, setIsInCookMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPdf = () => {
    const win = window.open('', '_blank');
    if (win) {
      const docLang = isRTL ? 'he' : 'en';
      const docDir = isRTL ? 'rtl' : 'ltr';
      
      win.document.write(`
        <!DOCTYPE html>
        <html lang="${docLang}" dir="${docDir}">
        <head>
          <meta charset="UTF-8">
          <title>${recipe.name}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
              direction: ${docDir};
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #2E7D32;
              text-align: center;
              font-size: 28px;
              margin-bottom: 20px;
              border-bottom: 2px solid #2E7D32;
              padding-bottom: 10px;
            }
            h2 {
              color: #F57C00;
              font-size: 20px;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            ul, ol {
              padding-${isRTL ? 'right' : 'left'}: 20px;
              list-style-position: ${isRTL ? 'inside' : 'outside'};
            }
            li {
              margin-bottom: 8px;
              text-align: ${isRTL ? 'right' : 'left'};
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              color: #777;
            }
            .print-button {
              text-align: center;
              margin-top: 20px;
            }
            button {
              background-color: #2E7D32;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              border-radius: 4px;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${recipe.name}</h1>
            
            <h2>${ingredientsLabel}</h2>
            <ul>
              ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            
            <h2>${instructionsLabel}</h2>
            <ol>
              ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
            
            <div class="footer">
              <p>${isRTL ? 'נוצר:' : 'Created:'} ${new Date(recipe.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="print-button">
              <button onclick="window.print()">${isRTL ? 'הדפס מתכון' : 'Print Recipe'}</button>
            </div>
          </div>
        </body>
        </html>
      `);
      win.document.close();
    } else {
      toast({
        title: isRTL ? "לא ניתן לפתוח חלון חדש" : "Could not open new window",
        description: isRTL ? "אנא אפשר חלונות קופצים בדפדפן שלך" : "Please allow pop-ups in your browser",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(recipe.id, notes);
    }
    setIsEditingNotes(false);
  };
  
    const [favorite, setFavorite] = useState(recipe.isFavorite || false);

    const handleToggleFavorite = () => {
        const next = !favorite;
        setFavorite(next); // עדכון מיידי בממשק

        if (onFavoriteToggle) {
            onFavoriteToggle(recipe.id).catch(() => {
                setFavorite(!next); // חזרה אם הבקשה נכשלה
                toast.error("Failed to update favorite");
            });
        }
    };


    const [currentRating, setCurrentRating] = useState(recipe.rating || 0);

  
    const handleRate = (rating: number) => {
        setCurrentRating(rating); // מיידי

        onRate?.(recipe.id, rating)
            .then(() => {
                toast({
                    title: "Recipe Rated",
                    description: "Your rating has been saved",
                    variant: "default"
                });
            })
            .catch(() => {
                toast({
                    title: "Error",
                    description: "Failed to save rating",
                    variant: "destructive"
                });
                // 👇 זה שגוי אם recipe.rating לא עודכן מהשרת – הוא לא מחזיר את הדירוג החדש
                // לכן אפשר או:
                // א. לוותר על זה
                // ב. או לעדכן אותו מ־recipes

                // אופציה א – פשוט תוריד את השורה:
                // setCurrentRating(recipe.rating);
            });
    };


  
  const generateShoppingList = () => {
    const list = recipe.ingredients.map(ingredient => `- ${ingredient}`).join('\n');
    const blob = new Blob([`${isRTL ? 'רשימת קניות עבור' : 'Shopping List for'} ${recipe.name}\n\n${list}`], { type: 'text/plain' });
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
    
    toast({
      title: isRTL ? "טיימר הופעל" : "Timer started",
      description: isRTL ? `${label} - ${minutes} דקות` : `${label} - ${minutes} minutes`,
      duration: 3000,
    });
  };
  
  const startCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      startTimer(mins, `${isRTL ? 'טיימר מותאם אישית' : 'Custom timer'} (${mins} ${isRTL ? 'דקות' : 'min'})`);
    }
  };
  
  const getDifficultyColor = (level?: string) => {
    switch(level) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const handleStartCooking = () => {
    setIsInCookMode(true);
    setCurrentStepIndex(0);
    
    toast({
      title: isRTL ? "מתחילים לבשל!" : "Let's start cooking!",
      description: isRTL ? `${recipe.name} - הוראות שלב אחר שלב` : `${recipe.name} - step by step instructions`,
      duration: 3000,
    });
    
    // Check if first step has a timer
    const firstStepTimer = recipe.timeMarkers?.find(marker => marker.step === 0);
    if (firstStepTimer) {
      toast({
        title: isRTL ? "שים לב לזמן" : "Time note",
        description: isRTL 
          ? `שלב זה דורש ${firstStepTimer.duration} דקות ${firstStepTimer.description}`
          : `This step requires ${firstStepTimer.duration} minutes for ${firstStepTimer.description}`,
        duration: 5000,
      });
    }
  };
  
  const handleNextStep = () => {
    if (currentStepIndex < recipe.instructions.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      
      // Check if next step has a timer
      const nextStepTimer = recipe.timeMarkers?.find(marker => marker.step === currentStepIndex + 1);
      if (nextStepTimer) {
        toast({
          title: isRTL ? "שים לב לזמן" : "Time note",
          description: isRTL 
            ? `שלב זה דורש ${nextStepTimer.duration} דקות ${nextStepTimer.description}`
            : `This step requires ${nextStepTimer.duration} minutes for ${nextStepTimer.description}`,
          action: <Button 
            size="sm" 
            className="bg-recipe-green text-white"
            onClick={() => startTimer(nextStepTimer.duration, nextStepTimer.description)}
          >
            {isRTL ? "הפעל טיימר" : "Start Timer"}
          </Button>,
          duration: 10000,
        });
      }
    } else {
      // Last step
      toast({
        title: isRTL ? "כל הכבוד!" : "Great job!",
        description: isRTL ? "סיימת להכין את המתכון!" : "You've completed the recipe!",
        duration: 5000,
      });
      setIsInCookMode(false);
    }
  };


  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const handleExitCookMode = () => {
    setIsInCookMode(false);
  };
  
    const handleGoToRecipes = () => {
        if (onCloseDetail) {
            onCloseDetail(); // מנקים את ה־state אצל ההורה
        }
        navigate('/recipes');
    };


  
  return (
    <motion.div 
      dir={isRTL ? "rtl" : "ltr"}
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg recipe-section break-words ${isRTL ? 'rtl' : 'ltr'} dark:text-gray-100`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {isInCookMode ? (
        <div className="cooking-mode dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={handleExitCookMode} className="dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
              {isRTL ? "יציאה ממצב בישול" : "Exit Cooking Mode"}
            </Button>
            <div className="text-center flex-grow">
              <h2 className="text-lg font-medium text-recipe-green dark:text-green-400">
                {isRTL ? "מצב בישול" : "Cooking Mode"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL 
                  ? `שלב ${currentStepIndex + 1} מתוך ${recipe.instructions.length}` 
                  : `Step ${currentStepIndex + 1} of ${recipe.instructions.length}`}
              </p>
            </div>
            <div className="w-10"></div> {/* Placeholder for flex balance */}
          </div>
          
          <motion.div
            key={`step-${currentStepIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-recipe-green/5 dark:bg-recipe-green/10 rounded-lg p-8 mb-6 min-h-[200px] flex flex-col justify-center"
          >
            <h3 className="text-xl font-semibold mb-4 text-recipe-green dark:text-green-400">
              {isRTL ? `צעד ${currentStepIndex + 1}:` : `Step ${currentStepIndex + 1}:`}
            </h3>
            <p className="text-lg leading-relaxed dark:text-gray-200">
              {recipe.instructions[currentStepIndex]}
            </p>
            
            {recipe.timeMarkers?.find(marker => marker.step === currentStepIndex) && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex items-center gap-2">
                <AlarmClock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <span className="font-medium dark:text-blue-300">
                  {isRTL ? "שים לב לזמן: " : "Time needed: "} 
                  {recipe.timeMarkers.find(marker => marker.step === currentStepIndex)?.duration} 
                  {isRTL ? " דקות" : " minutes"}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto dark:text-blue-300 dark:border-blue-700"
                  onClick={() => startTimer(
                    recipe.timeMarkers!.find(marker => marker.step === currentStepIndex)!.duration,
                    recipe.timeMarkers!.find(marker => marker.step === currentStepIndex)!.description
                  )}
                >
                  {isRTL ? "הפעל טיימר" : "Start Timer"}
                </Button>
              </div>
            )}
          </motion.div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 dark:disabled:text-gray-500"
            >
              {isRTL ? "הקודם" : "Previous"}
            </Button>
            
            <Button 
              onClick={handleNextStep}
              className="bg-recipe-green hover:bg-recipe-green/90 dark:bg-green-600 dark:hover:bg-green-700"
            >
              {currentStepIndex < recipe.instructions.length - 1 
                ? (isRTL ? "הבא" : "Next") 
                : (isRTL ? "סיים" : "Finish")}
            </Button>
          </div>
          
          {/* Active timer notification */}
          {activeTimer && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6 flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlarmClock className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                              <span className="font-medium dark:text-blue-300">
                                  {` ${activeTimer.label}: `}
                              </span>
                <span className="ml-2 text-lg font-bold dark:text-blue-200">
                  {String(activeTimer.minutes).padStart(2, '0')}:{String(activeTimer.seconds).padStart(2, '0')}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTimer(null)}
                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
              >
                {isRTL ? 'בטל' : 'Cancel'}
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        <>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-6 print:hidden`}>
                          <Button
                              variant="ghost"
                              onClick={handleGoToRecipes}
                              className="dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {isRTL ? 'חזרה לכל המתכונים' : 'Back to All Recipes'}
                          </Button>

            
                          <div
                              className={`flex flex-nowrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'
                                  }`}
                          >
                              <Button
                                  variant="outline"
                                  onClick={handleExportPdf}
                                  className="text-recipe-orange border-recipe-orange hover:bg-recipe-orange/10 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/30"
                              >
                                  <Download className="h-4 w-4 mr-2" />
                                  {isRTL ? 'פתח בחלון חדש' : 'Open in New Window'}
                              </Button>

                              {onPublish && (
                                  <Button
                                      variant="outline"
                                      onClick={() => onPublish(recipe.id)}
                                      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                                  >
                                      <Send className="h-4 w-4 mr-2" />
                                      {isRTL ? 'פרסם' : 'Publish'}
                                  </Button>
                              )}

                              <Button
                                  variant="outline"
                                  onClick={generateShoppingList}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/30"
                              >
                                  <ShoppingBag className="h-4 w-4 mr-2" />
                                  {isRTL ? 'רשימת קניות' : 'Shopping List'}
                              </Button>

                              <Button
                                  variant="outline"
                                  onClick={handleStartCooking}
                                  className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/30 animate-pulse"
                              >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  {isRTL ? 'התחל לבשל' : 'Start Cooking'}
                              </Button>
                          </div>

          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-3xl font-bold text-recipe-green dark:text-green-400 ${isRTL ? 'text-right mr-2' : 'text-left ml-2'}`}>
              {recipe.name}
            </h1>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none dark:text-gray-500 dark:hover:text-red-400"
                aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                                  <Heart className={`h-6 w-6 ${favorite ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''}`} />
              </motion.button>
              
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="focus:outline-none"
                  >
                        <Star
                            className={`h-6 w-6 ${currentRating >= star ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300' : 'text-gray-300 dark:text-gray-600'}`}
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
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1 px-3 py-1">
                <Clock className="h-3 w-3" />
                {recipe.estimatedTime}
              </Badge>
            )}
            
            {recipe.calories && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 flex items-center gap-1 px-3 py-1">
                <FileText className="h-3 w-3" />
                {recipe.calories}
              </Badge>
            )}
            
            {recipe.tags && recipe.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-1 px-3 py-1">
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
              className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlarmClock className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                                  <span className="font-medium dark:text-blue-300">
                                      {`${activeTimer.label}: `}
                                  </span>
                <span className="ml-2 text-lg font-bold dark:text-blue-200">
                  {String(activeTimer.minutes).padStart(2, '0')}:{String(activeTimer.seconds).padStart(2, '0')}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTimer(null)}
                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
              >
                {isRTL ? 'בטל' : 'Cancel'}
              </Button>
            </motion.div>
          )}
          
          <Tabs defaultValue="recipe" className="mt-6">
            <TabsList className="mb-4 dark:bg-gray-700">
              <TabsTrigger value="recipe" className="dark:data-[state=active]:bg-gray-800 dark:text-gray-300 dark:data-[state=active]:text-white">
                {isRTL ? 'מתכון' : 'Recipe'}
              </TabsTrigger>
              <TabsTrigger value="notes" className="dark:data-[state=active]:bg-gray-800 dark:text-gray-300 dark:data-[state=active]:text-white">
                {isRTL ? 'הערות' : 'Notes'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recipe" className="space-y-8">
              <div className="mb-8">
                <h2
                    className={
                        `text-2xl font-semibold text-recipe-orange dark:text-orange-400 mb-4 ` +
                        (isRTL ? 'text-right' : 'text-left')
                    }
                >
                    {ingredientsLabel}
                </h2>

                <ul
                    className={
                        isRTL
                            ? "list-disc list-inside space-y-2 pr-5 dark:text-gray-200"
                            : "list-disc list-outside space-y-2 pl-5 dark:text-gray-200"
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
                        `text-2xl font-semibold text-recipe-orange dark:text-orange-400 mb-4 ` +
                        (isRTL ? 'text-right' : 'text-left')
                    }
                >
                    {instructionsLabel}
                </h2>

                <ol className={`${isRTL ? 'list-decimal pr-5' : 'list-decimal pl-5'} space-y-4 dark:text-gray-200`}>
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-lg relative group">
                      <div className="flex items-start">
                        <div className="flex-grow">{instruction}</div>
                        {instruction.toLowerCase().includes('minute') && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-gray-300">
                                <AlarmClock className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="dark:bg-gray-800 dark:text-gray-100">
                              <DialogHeader>
                                <DialogTitle>{isRTL ? 'הגדר טיימר לצעד זה' : 'Set Timer for this Step'}</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="mb-4 dark:text-gray-300">{instruction}</p>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    onClick={() => {
                                      // Extract number from instruction text (e.g., "5 minutes" -> 5)
                                      const match = instruction.match(/(\d+)(?=\s*(?:minute|min))/i);
                                      const minutes = match ? parseInt(match[1]) : 5;
                                      startTimer(minutes, `Step ${index + 1}`);
                                    }}
                                    className="dark:bg-green-600 dark:hover:bg-green-700"
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 min-h-[200px]">
                {isEditingNotes ? (
                  <div className="space-y-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[150px] bg-white dark:bg-gray-700 border-yellow-200 dark:border-yellow-900 dark:text-gray-200"
                      placeholder={isRTL ? "הערות אישיות שלך למתכון..." : "Your personal notes about this recipe..."}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                    <div className={`flex ${isRTL ? "justify-start" : "justify-end"} space-x-2`}>
                      <Button onClick={() => setIsEditingNotes(false)} variant="outline" 
                          className="dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
                        {isRTL ? "ביטול" : "Cancel"}
                      </Button>
                      <Button onClick={handleSaveNotes} className="bg-recipe-green hover:bg-recipe-green/90 dark:bg-green-600 dark:hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        {isRTL ? "שמור הערות" : "Save Notes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-semibold dark:text-yellow-400 ${isRTL ? "text-right" : "text-left"}`}>
                        {isRTL ? "הערות אישיות" : "Personal Notes"}
                      </h3>
                      <Button 
                        onClick={() => setIsEditingNotes(true)} 
                        variant="ghost" 
                        size="sm"
                        className="text-recipe-green dark:text-green-400 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isRTL ? "ערוך" : "Edit"}
                      </Button>
                    </div>
                    {notes ? (
                      <p className={`dark:text-gray-300 ${isRTL ? "text-right" : "text-left"}`}>{notes}</p>
                    ) : (
                      <p className={`text-gray-500 dark:text-gray-400 italic ${isRTL ? "text-right" : "text-left"}`}>
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
          
          <div className={`mt-8 text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'text-left' : 'text-right'}`}>
            {isRTL ? 'נוצר:' : 'Created:'} {new Date(recipe.createdAt).toLocaleDateString()}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default RecipeDetail;
