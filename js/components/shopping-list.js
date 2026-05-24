// Shopping List Component (HTML generation and export helpers)

import { store } from "../store.js";
import { formatQuantity, escapeHtml, downloadTextFile, copyToClipboard, ICONS } from "../utils.js";

/**
 * Renders the shopping list items categorized and returns the HTML.
 */
export function renderShoppingList(shoppingList) {
  const container = document.getElementById("shopping-list-items-container");
  const emptyState = document.getElementById("shopping-list-empty");

  if (!shoppingList || shoppingList.length === 0) {
    container.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  container.classList.remove("hidden");
  emptyState.classList.add("hidden");

  // Group items by category
  const categories = {};
  
  shoppingList.forEach(item => {
    // Determine category: default to 'Other' or use item sources to guess
    let category = "Other Stuff";
    
    // We can lookup matching ingredients in the database to get a category, 
    // or just group custom items under "Manual Additions".
    if (item.sources && item.sources.includes("Manual Input")) {
      category = "Pantry & Staples";
    } else {
      // Find category from database
      const dbMatch = store.state.recipes
        .flatMap(r => r.ingredients)
        .find(ing => ing.name.toLowerCase().trim() === item.name.toLowerCase().trim());
      
      if (dbMatch && dbMatch.category) {
        category = dbMatch.category;
      }
    }

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(item);
  });

  // Generate HTML
  let html = "";
  
  // Sort categories alphabetically, except "Other Stuff" goes last
  const sortedCategories = Object.keys(categories).sort((a, b) => {
    if (a.toLowerCase().includes("other") || a.toLowerCase().includes("manual")) return 1;
    if (b.toLowerCase().includes("other") || b.toLowerCase().includes("manual")) return -1;
    return a.localeCompare(b);
  });

  sortedCategories.forEach(category => {
    html += `
      <div class="category-group">
        <h4 class="category-header">${escapeHtml(category)}</h4>
        <div class="category-items-container" style="display: flex; flex-direction: column; gap: 8px;">
    `;

    categories[category].forEach(item => {
      const qtyStr = formatQuantity(item.quantity);
      const unitStr = item.unit && item.unit !== "pcs" && item.unit !== "pc" ? ` ${item.unit}` : "";
      const displayQty = qtyStr ? `${qtyStr}${unitStr} ` : "";
      
      // Clean up item sources list
      const uniqueSources = Array.from(new Set(item.sources || []));
      const sourceStr = uniqueSources.length > 0 ? `for ${uniqueSources.join(", ")}` : "";

      html += `
        <div class="shopping-item-row ${item.checked ? "checked" : ""}" data-item-id="${item.id}">
          <div class="shopping-item-left">
            <input type="checkbox" class="shopping-item-checkbox" ${item.checked ? "checked" : ""} data-id="${item.id}">
            <div class="shopping-item-info">
              <span class="shopping-item-name"><strong>${displayQty}</strong>${escapeHtml(item.name)}</span>
              ${sourceStr ? `<span class="shopping-item-source">${escapeHtml(sourceStr)}</span>` : ""}
            </div>
          </div>
          <button class="shopping-item-delete" data-id="${item.id}" aria-label="Delete Item">${ICONS.trash}</button>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Generates a clean text/markdown representation of the shopping list.
 */
export function generateExportText(shoppingList) {
  if (!shoppingList || shoppingList.length === 0) return "";

  const categories = {};
  shoppingList.forEach(item => {
    let category = "Other Stuff";
    if (item.sources && item.sources.includes("Manual Input")) {
      category = "Pantry & Staples";
    } else {
      const dbMatch = store.state.recipes
        .flatMap(r => r.ingredients)
        .find(ing => ing.name.toLowerCase().trim() === item.name.toLowerCase().trim());
      if (dbMatch && dbMatch.category) {
        category = dbMatch.category;
      }
    }
    if (!categories[category]) categories[category] = [];
    categories[category].push(item);
  });

  let text = `# The Daily Dish | My Grocery Shopping List\n`;
  text += `Generated: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

  Object.keys(categories).sort().forEach(category => {
    text += `## ${category.toUpperCase()}\n`;
    categories[category].forEach(item => {
      const checkbox = item.checked ? "[x]" : "[ ]";
      const qtyStr = formatQuantity(item.quantity);
      const unitStr = item.unit && item.unit !== "pcs" && item.unit !== "pc" ? ` ${item.unit}` : "";
      const displayQty = qtyStr ? `${qtyStr}${unitStr} ` : "";
      const uniqueSources = Array.from(new Set(item.sources || []));
      const sourceStr = uniqueSources.length > 0 ? ` (for ${uniqueSources.join(", ")})` : "";
      
      text += `${checkbox} ${displayQty}${item.name}${sourceStr}\n`;
    });
    text += `\n`;
  });

  text += `Enjoy your cooking session!`;
  return text;
}

/**
 * Handles exporting and saving the list.
 */
export function exportShoppingList(shoppingList) {
  const exportText = generateExportText(shoppingList);
  if (!exportText) return;

  // 1. Download file
  downloadTextFile("gourmet_grocery_list.txt", exportText);

  // 2. Copy to clipboard
  copyToClipboard(exportText)
    .then(() => {
      // Return a status indicating clipboard success for UX toast
      console.log("Grocery list copied to clipboard");
    })
    .catch(err => {
      console.error("Failed to copy to clipboard", err);
    });
}
