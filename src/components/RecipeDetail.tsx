
import React from 'react';
import { Recipe } from '@/types/Recipe';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { exportToPdf } from '@/utils/pdfExport';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RecipeDetailProps {
  recipe: Recipe;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe }) => {
  const navigate = useNavigate();
  const isRTL = recipe.isRTL || false;
  const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
  const instructionsLabel = recipe.instructionsLabel || 'Instructions';
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPdf = () => {
    exportToPdf(recipe);
  };
  
  return (
    <motion.div 
      className={`max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md recipe-section ${isRTL ? 'rtl text-right' : 'ltr text-left'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-6 print:hidden`}>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-recipe-green"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          Back
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="text-recipe-green border-recipe-green hover:bg-recipe-green/10"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportPdf}
            className="text-recipe-orange border-recipe-orange hover:bg-recipe-orange/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-recipe-green text-center mb-8 pb-2 border-b-2 border-recipe-lightGreen">
        {recipe.name}
      </h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-recipe-orange mb-4">
          {ingredientsLabel}
        </h2>
        <ul className={`${isRTL ? 'list-disc pr-6' : 'list-disc pl-6'} space-y-2`}>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-lg">{ingredient}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold text-recipe-orange mb-4">
          {instructionsLabel}
        </h2>
        <ol className={`${isRTL ? 'list-decimal pr-6' : 'list-decimal pl-6'} space-y-4`}>
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="text-lg">{instruction}</li>
          ))}
        </ol>
      </div>
      
      <div className={`mt-8 text-sm text-gray-500 ${isRTL ? 'text-left' : 'text-right'}`}>
        Created: {new Date(recipe.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default RecipeDetail;
