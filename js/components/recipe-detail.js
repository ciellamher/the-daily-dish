// Recipe Detail Modal Component (FOODEAT style)

import { store } from "../store.js";
import { formatQuantity, scaleQuantity, escapeHtml, ICONS, getGourmetFoodImage } from "../utils.js";

/**
 * Renders the detailed contents of a recipe into the modal container.
 */
export function renderRecipeDetail(recipe, state) {
  if (!recipe) return "";

  const currentServings = store.getServings(recipe);
  const scaleRatio = currentServings / recipe.servings;
  
  // Calculate ingredients matching states (matched vs missing)
  const isMatchingMode = state.searchMode === "ingredients" && state.selectedIngredients.length > 0;
  
  // Build ingredients list HTML
  const scaledIngredients = recipe.ingredients.map(ing => {
    const scaledQty = scaleQuantity(ing.quantity, recipe.servings, currentServings);
    
    // Check if ingredient is matched
    let isMatched = false;
    if (isMatchingMode) {
      const ingName = ing.name.toLowerCase();
      isMatched = state.selectedIngredients.some(sel => 
        ingName.includes(sel) || sel.includes(ingName)
      );
    }
    
    return {
      ...ing,
      scaledQuantity: scaledQty,
      isMatched
    };
  });

  const missingIngredients = scaledIngredients.filter(ing => isMatchingMode && !ing.isMatched);

  const ingredientsHtml = scaledIngredients.map((ing, idx) => {
    const qtyStr = formatQuantity(ing.scaledQuantity);
    const unitStr = ing.unit ? ` ${ing.unit}` : "";
    const displayQty = qtyStr ? `${qtyStr}${unitStr}` : "";
    
    let itemClass = "ingredient-text";
    let badgeHtml = "";
    
    if (isMatchingMode) {
      if (ing.isMatched) {
        itemClass += " ingredient-matched";
      } else {
        itemClass += " ingredient-missing";
        badgeHtml = `<span class="ingredient-missing-badge">Missing</span>`;
      }
    }

    return `
      <label class="ingredient-item">
        <input type="checkbox" class="ingredient-checkbox" data-index="${idx}">
        <span class="${itemClass}">
          <strong>${displayQty}</strong> ${escapeHtml(ing.name)}
          ${badgeHtml}
        </span>
      </label>
    `;
  }).join("");

  // Build equipment section: dynamic icon lookup in ICONS
  const equipmentHtml = recipe.equipment.map(eq => {
    const eqIconSvg = ICONS[eq.icon] || ICONS.cooking;
    return `
      <div class="equipment-item">
        <span class="equipment-icon-svg">${eqIconSvg}</span>
        <span>${escapeHtml(eq.name)}</span>
      </div>
    `;
  }).join("");

  // Build step-by-step instructions
  const instructionsHtml = recipe.instructions.map(inst => `
    <div class="instruction-step" data-step="${inst.step}">
      <button class="step-number-badge" aria-label="Mark step ${inst.step} completed">${inst.step}</button>
      <div class="step-details">
        <p class="step-text">${escapeHtml(inst.text)}</p>
        ${inst.tip ? `
          <div class="chef-tip-box">
            <div class="chef-tip-title">
              <span class="tip-icon-svg">${ICONS.info}</span>
              <span>Chef's Tip</span>
            </div>
            <p>${escapeHtml(inst.tip)}</p>
          </div>
        ` : ""}
      </div>
    </div>
  `).join("");

  // Image or Dynamic Unsplash Fallback
  const resolvedImage = recipe.image ? recipe.image : getGourmetFoodImage(recipe.title, recipe.category);
  const imageHtml = `<img src="${escapeHtml(resolvedImage)}" alt="${escapeHtml(recipe.title)}">`;

  // Draw star rating (mocked from title hash)
  let rating = 8.5;
  if (recipe.title) {
    let charSum = 0;
    for (let i = 0; i < recipe.title.length; i++) charSum += recipe.title.charCodeAt(i);
    rating = (8.0 + (charSum % 20) / 10).toFixed(1);
  }
  const starsCount = rating >= 9.0 ? 5 : rating >= 8.5 ? 4 : 3;
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= starsCount) {
      starsHtml += `<span class="star-svg-filled">${ICONS.starFilled}</span>`;
    } else {
      starsHtml += `<span class="star-svg-empty">${ICONS.star}</span>`;
    }
  }

  return `
    <div class="recipe-modal-hero">
      ${imageHtml}
      <div class="recipe-modal-overlay-info">
        <span class="modal-recipe-category">${escapeHtml(recipe.category)}</span>
        <h2 class="modal-recipe-title">${escapeHtml(recipe.title)}</h2>
        <div class="modal-recipe-rating-row">
          <div class="modal-stars-container">${starsHtml}</div>
          <span class="modal-rating-badge">${rating}</span>
        </div>
      </div>
    </div>

    <div class="modal-recipe-body">
      <p class="modal-recipe-desc">${escapeHtml(recipe.description)}</p>

      <!-- Stats Bar & Servings Adjuster -->
      <div class="recipe-metadata-bar">
        <div class="meta-stats">
          <div class="meta-stat-item">
            <span class="meta-stat-icon">${ICONS.clock}</span>
            <span class="meta-stat-label">Prep Time</span>
            <span class="meta-stat-value">${recipe.prepTime} min</span>
          </div>
          <div class="meta-stat-item">
            <span class="meta-stat-icon">${ICONS.pot}</span>
            <span class="meta-stat-label">Cook Time</span>
            <span class="meta-stat-value">${recipe.cookTime} min</span>
          </div>
          <div class="meta-stat-item">
            <span class="meta-stat-icon">${ICONS.fire}</span>
            <span class="meta-stat-label">Difficulty</span>
            <span class="meta-stat-value">${escapeHtml(recipe.difficulty)}</span>
          </div>
        </div>

        <div class="servings-scaler">
          <span class="servings-scaler-label">Servings:</span>
          <button class="servings-btn servings-btn-minus" aria-label="Decrease Servings" data-recipe-id="${recipe.id}">
            ${ICONS.minus}
          </button>
          <span class="servings-display">${currentServings}</span>
          <button class="servings-btn servings-btn-plus" aria-label="Increase Servings" data-recipe-id="${recipe.id}">
            ${ICONS.plus}
          </button>
        </div>
      </div>

      <!-- Main Layout Details Split -->
      <div class="recipe-content-grid">
        
        <!-- Left Side: Ingredients & Tools -->
        <div class="ingredients-column">
          <h3 class="column-title">Ingredients</h3>
          
          <div class="ingredients-actions">
            ${isMatchingMode && missingIngredients.length > 0 ? `
              <button class="btn-add-grocery primary btn-add-missing-grocery" data-recipe-id="${recipe.id}">
                <span class="btn-icon-svg">${ICONS.cart}</span>
                <span>Add Missing (${missingIngredients.length})</span>
              </button>
              <button class="btn-add-grocery secondary btn-add-all-grocery" data-recipe-id="${recipe.id}">
                <span>Add All</span>
              </button>
            ` : `
              <button class="btn-add-grocery primary btn-add-all-grocery" data-recipe-id="${recipe.id}">
                <span class="btn-icon-svg">${ICONS.cart}</span>
                <span>Add All to List</span>
              </button>
            `}
          </div>

          <div class="ingredients-list">
            ${ingredientsHtml}
          </div>

          <!-- Tools Section -->
          <div class="equipment-section">
            <h3 class="column-title" style="font-size: 1.15rem; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 12px;">Kitchen Gear Needed</h3>
            <div class="equipment-grid">
              ${equipmentHtml}
            </div>
          </div>
        </div>

        <!-- Right Side: Step-by-Step Guided Procedure -->
        <div class="instructions-column">
          <h3 class="column-title">Procedures</h3>
          <div class="instructions-list">
            ${instructionsHtml}
          </div>
        </div>

      </div>
    </div>
  `;
}

/**
 * Handles clicks within the detailed recipe modal using event delegation.
 */
export function handleDetailModalClick(event, recipe, state) {
  const target = event.target;
  
  // 1. Servings Change
  if (target.closest(".servings-btn-minus")) {
    const currentServings = store.getServings(recipe);
    store.setServings(recipe.id, currentServings - 1);
    return;
  }
  if (target.closest(".servings-btn-plus")) {
    const currentServings = store.getServings(recipe);
    store.setServings(recipe.id, currentServings + 1);
    return;
  }

  // 2. Add All to Shopping List
  if (target.closest(".btn-add-all-grocery")) {
    const currentServings = store.getServings(recipe);
    const scaledIngredients = recipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: scaleQuantity(ing.quantity, recipe.servings, currentServings),
      unit: ing.unit
    }));
    store.addMultipleIngredientsToShoppingList(scaledIngredients, recipe.title);
    
    // Show quick visual feedback on button
    const btn = target.closest(".btn-add-all-grocery");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Added!";
    btn.style.backgroundColor = "var(--color-success)";
    btn.style.color = "var(--bg-primary)";
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = "";
      btn.style.color = "";
    }, 1500);
    return;
  }

  // 3. Add Missing to Shopping List
  if (target.closest(".btn-add-missing-grocery")) {
    const currentServings = store.getServings(recipe);
    const scaledIngredients = recipe.ingredients.map(ing => {
      const scaledQty = scaleQuantity(ing.quantity, recipe.servings, currentServings);
      
      const ingName = ing.name.toLowerCase();
      const isMatched = state.selectedIngredients.some(sel => 
        ingName.includes(sel) || sel.includes(ingName)
      );
      
      return { ...ing, quantity: scaledQty, isMatched };
    });

    const missingIngredients = scaledIngredients.filter(ing => !ing.isMatched);
    store.addMultipleIngredientsToShoppingList(missingIngredients, recipe.title);

    // Show visual feedback
    const btn = target.closest(".btn-add-missing-grocery");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Added!";
    btn.style.backgroundColor = "var(--color-success)";
    btn.style.color = "var(--bg-primary)";
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = "";
      btn.style.color = "";
    }, 1500);
    return;
  }

  // 4. Mark Procedure Step Completed
  const stepBadge = target.closest(".step-number-badge");
  if (stepBadge) {
    const stepRow = stepBadge.closest(".instruction-step");
    stepRow.classList.toggle("completed");
    return;
  }

  // 5. Click on instruction text toggles completion as well
  const stepText = target.closest(".step-text");
  if (stepText) {
    const stepRow = stepText.closest(".instruction-step");
    stepRow.classList.toggle("completed");
    return;
  }
}
