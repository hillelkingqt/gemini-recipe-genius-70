
import { Recipe } from "../types/Recipe";

export const exportToPdf = (recipe: Recipe) => {
  // In a real implementation, we would use jspdf or similar library
  // Since we can't add additional dependencies, we'll create a print view instead
  
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to export recipes as PDF');
    return;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${recipe.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
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
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
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
        
        <h2>Ingredients</h2>
        <ul>
          ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
        </ol>
        
        <div class="footer">
          <p>Created: ${recipe.createdAt.toLocaleString()}</p>
        </div>
        
        <div class="print-button">
          <button onclick="window.print()">Print Recipe</button>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
