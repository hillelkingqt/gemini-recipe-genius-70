
import { Recipe } from "../types/Recipe";

export const exportToPdf = (recipe: Recipe) => {
  // In a real implementation, we would use jspdf or similar library
  // Since we can't add additional dependencies, we'll create a print view instead
  
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to export recipes as PDF');
    return;
  }
  
  const isRTL = recipe.isRTL || false;
  const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
  const instructionsLabel = recipe.instructionsLabel || 'Instructions';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${isRTL ? 'he' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
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
          direction: ${isRTL ? 'rtl' : 'ltr'};
          text-align: ${isRTL ? 'right' : 'left'};
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
  `;
  
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
