// Recipe Detail Modal Component (FOODEAT style)

import { store } from "../store.js";
import { formatQuantity, scaleQuantity, escapeHtml, ICONS, getGourmetFoodImage, isIngredientMatch } from "../utils.js";
import { renderRecipeChatbot } from "./recipe-chatbot.js?v=1.5";

// Database of common ingredient substitutions
const INGREDIENT_SUBSTITUTIONS = {
  "buttermilk": "1 cup milk + 1 tbsp lemon juice or white vinegar (let sit for 5 minutes).",
  "soy sauce": "Tamari (gluten-free), coconut aminos (soy-free), or Worcestershire sauce.",
  "white vinegar": "Apple cider vinegar, rice vinegar, lemon juice, or white wine vinegar.",
  "cane vinegar": "White vinegar, apple cider vinegar, or lemon juice.",
  "vinegar": "Apple cider vinegar, rice vinegar, lemon juice, or white wine vinegar.",
  "chicken broth": "Vegetable broth, water with a bouillon cube, or dry white wine.",
  "chicken stock": "Vegetable broth, water with a bouillon cube, or dry white wine.",
  "broth": "Vegetable broth, water with a bouillon cube, or dry white wine.",
  "butter": "Margarine, coconut oil (1:1), olive oil (3/4:1), or applesauce (for baking).",
  "heavy cream": "Whole milk + melted butter (3:1 ratio), half-and-half, or coconut cream.",
  "brown sugar": "White sugar + 1 tbsp molasses or maple syrup, or coconut sugar.",
  "parmesan cheese": "Pecorino Romano, Asiago, or nutritional yeast (vegan option).",
  "parmesan": "Pecorino Romano, Asiago, or nutritional yeast (vegan option).",
  "olive oil": "Avocado oil, canola oil, sunflower oil, or melted butter.",
  "cooking oil": "Avocado oil, canola oil, sunflower oil, or melted butter.",
  "chicken drumsticks and thighs": "Tofu chunks, pork chops, or beef slices (adjust cooking time).",
  "chicken breasts": "Tofu chunks, pork chops, or beef slices (adjust cooking time).",
  "chicken": "Tofu chunks, pork chops, or beef slices (adjust cooking time).",
  "all-purpose flour": "Gluten-free 1:1 baking flour, oat flour, or whole wheat flour.",
  "mayonnaise": "Greek yogurt (healthy/protein substitute), sour cream, or mashed avocado.",
  "milk": "Almond milk, soy milk, oat milk, or coconut milk."
};

/**
 * Searches ingredient text and wraps matching keywords with substitution trigger classes.
 */
function formatIngredientName(name) {
  const nameLower = name.toLowerCase().trim();
  const keys = Object.keys(INGREDIENT_SUBSTITUTIONS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (nameLower.includes(key)) {
      const regex = new RegExp(`(${key})`, 'i');
      return escapeHtml(name).replace(regex, `<span class="ingredient-sub-trigger" data-ing-key="${key}" title="Click to view substitutions">$1</span>`);
    }
  }
  return escapeHtml(name);
}

/**
 * Parses instructions step text and turns minutes/time spans into clickable timer badges.
 */
function formatStepTextWithTimers(text) {
  const regex = /(\d+)(?:-(\d+))?\s*(?:minutes|minute|min)/gi;
  return text.replace(regex, (match, p1, p2) => {
    const mins = p2 ? parseInt(p2, 10) : parseInt(p1, 10);
    return `<button class="step-timer-badge" data-minutes="${mins}" title="Start ${mins}-minute timer">${ICONS.clock} <span>${match}</span></button>`;
  });
}

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
      isMatched = state.selectedIngredients.some(sel => 
        isIngredientMatch(ing.name, sel)
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
          <strong>${displayQty}</strong> ${formatIngredientName(ing.name)}
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

  // Build step-by-step instructions with interactive timers
  const instructionsHtml = recipe.instructions.map(inst => {
    const formattedText = formatStepTextWithTimers(escapeHtml(inst.text));
    return `
      <div class="instruction-step" data-step="${inst.step}">
        <button class="step-number-badge" aria-label="Mark step ${inst.step} completed">${inst.step}</button>
        <div class="step-details">
          <p class="step-text">${formattedText}</p>
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
    `;
  }).join("");

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

  const isAudioPlaying = state.ambientAudioPlaying || false;

  return `
    <div class="recipe-modal-hero">
      ${imageHtml}
      
      <!-- Ambient Audio Toggle -->
      <button class="ambient-audio-toggle ${isAudioPlaying ? 'playing' : ''}" id="ambient-audio-toggle" aria-label="Toggle Ambient Audio">
        <div class="audio-pulse-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="audio-toggle-text">${isAudioPlaying ? 'Stop Kitchen Sounds' : 'Play Kitchen Sounds'}</span>
      </button>

      <!-- Share Story Button -->
      <button class="btn-story-share" id="btn-story-share" title="Share Instagram Story" aria-label="Share Story">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
      </button>

      <!-- Add to Meal Planner Button -->
      <button class="btn-recipe-planner" id="btn-recipe-planner" title="Add to Meal Planner" aria-label="Add to Meal Planner">
        ${ICONS.calendar}
      </button>

      <!-- Edit Recipe Button -->
      <button class="btn-recipe-edit" id="btn-recipe-edit" title="Edit Recipe" aria-label="Edit Recipe">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>

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

      ${recipe.sourceUrl ? `
        <div class="recipe-source-reference">
          <span style="display: inline-flex; align-items: center; color: var(--accent-primary);">${ICONS.externalLink || ''}</span>
          <span>Recipe Reference: <a href="${escapeHtml(recipe.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(recipe.sourceName || 'Original Source')}</a></span>
        </div>
      ` : ''}

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

        <!-- Servings Scale + Range Slider -->
        <div class="servings-scaler-wrapper" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 140px;">
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
          <div class="servings-slider-container" style="width: 100%;">
            <input type="range" class="servings-slider" min="1" max="12" value="${currentServings}" data-recipe-id="${recipe.id}">
          </div>
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
          <div class="procedures-header-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 8px; margin-bottom: 20px;">
            <h3 class="column-title" style="margin-bottom: 0; border-bottom: none; padding-bottom: 0;">Procedures</h3>
            <button class="btn-card-secondary btn-start-cook-mode" data-id="${recipe.id}" style="padding: 6px 14px; font-size: 0.8rem; display: flex; align-items: center; gap: 6px; border-radius: var(--radius-full); cursor: pointer;">
              <span class="btn-action-icon">${ICONS.wand}</span>
              <span>Cook Mode</span>
            </button>
          </div>
          <div class="instructions-list">
            ${instructionsHtml}
          </div>
        </div>

      </div>
      ${renderRecipeChatbot(recipe)}
    </div>
  `;
}

/**
 * Handles clicks within the detailed recipe modal using event delegation.
 */
export function handleDetailModalClick(event, recipe, state) {
  const target = event.target;
  
  // 1. Servings Change via buttons
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
  if (stepText && !target.closest(".step-timer-badge")) { // Don't trigger toggle if clicking timer button
    const stepRow = stepText.closest(".instruction-step");
    stepRow.classList.toggle("completed");
    return;
  }
}

export function renderRecipeEditForm(recipe) {
  if (!recipe) return "";

  const categories = ["Mains", "Salad", "Baking", "Seafood", "Soup", "Breakfast", "Flatbread", "Pasta", "Chicken"];
  const categoryOptions = categories.map(cat => 
    `<option value="${cat}" ${recipe.category === cat ? 'selected' : ''}>${cat}</option>`
  ).join("");

  const difficulties = ["Easy", "Medium", "Hard"];
  const difficultyOptions = difficulties.map(diff => 
    `<option value="${diff}" ${recipe.difficulty === diff ? 'selected' : ''}>${diff}</option>`
  ).join("");

  const ingredientsHtml = recipe.ingredients.map((ing, idx) => `
    <div class="edit-ing-row" data-index="${idx}">
      <input type="number" step="any" class="edit-ing-qty" value="${ing.quantity || 1}" placeholder="Qty" style="width: 70px;">
      <input type="text" class="edit-ing-unit" value="${escapeHtml(ing.unit || '')}" placeholder="Unit" style="width: 70px;">
      <input type="text" class="edit-ing-name" value="${escapeHtml(ing.name || '')}" placeholder="Ingredient Name" style="flex: 1;">
      <select class="edit-ing-cat" style="width: 100px;">
        <option value="Pantry" ${ing.category === 'Pantry' ? 'selected' : ''}>Pantry</option>
        <option value="Produce" ${ing.category === 'Produce' ? 'selected' : ''}>Produce</option>
        <option value="Dairy" ${ing.category === 'Dairy' ? 'selected' : ''}>Dairy</option>
        <option value="Meat" ${ing.category === 'Meat' ? 'selected' : ''}>Meat</option>
        <option value="Seafood" ${ing.category === 'Seafood' ? 'selected' : ''}>Seafood</option>
      </select>
      <button type="button" class="btn-remove-edit-ing" title="Remove Ingredient" aria-label="Remove Ingredient">
        ${ICONS.trash}
      </button>
    </div>
  `).join("");

  const gearIcons = ["pot", "pan", "bowl", "sheet", "paper", "knife", "spoon", "tongs", "cutter", "rollingPin", "spatula", "scoop", "rack", "board", "brush", "cooking"];
  const equipmentHtml = recipe.equipment.map((eq, idx) => {
    const iconOptions = gearIcons.map(iconName => 
      `<option value="${iconName}" ${eq.icon === iconName ? 'selected' : ''}>${iconName}</option>`
    ).join("");
    return `
      <div class="edit-gear-row" data-index="${idx}">
        <input type="text" class="edit-gear-name" value="${escapeHtml(eq.name || '')}" placeholder="Gear Name" style="flex: 1;">
        <select class="edit-gear-icon" style="width: 100px;">
          ${iconOptions}
        </select>
        <button type="button" class="btn-remove-edit-gear" title="Remove Gear" aria-label="Remove Gear">
          ${ICONS.trash}
        </button>
      </div>
    `;
  }).join("");

  const instructionsHtml = recipe.instructions.map((inst, idx) => `
    <div class="edit-step-row" data-index="${idx}">
      <div class="edit-step-header">
        <span class="edit-step-number">Step ${idx + 1}</span>
        <button type="button" class="btn-remove-edit-step" title="Remove Step" aria-label="Remove Step">
          ${ICONS.trash}
        </button>
      </div>
      <textarea class="edit-step-text" placeholder="Instructions step description..." rows="2" style="width: 100%; margin-bottom: 8px;">${escapeHtml(inst.text || '')}</textarea>
      <input type="text" class="edit-step-tip" value="${escapeHtml(inst.tip || '')}" placeholder="Chef's Tip (Optional)" style="width: 100%;">
    </div>
  `).join("");

  return `
    <div class="recipe-modal-hero edit-mode-hero">
      <div class="edit-hero-overlay">
        <h2 style="color: white; margin: 0; font-family: 'Playfair Display', serif;">Edit Recipe Details</h2>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 0.9rem;">Modify ingredients, procedures, and core details</p>
      </div>
    </div>
    
    <div class="modal-recipe-body edit-mode-body">
      <form id="recipe-edit-form" data-recipe-id="${recipe.id}">
        
        <!-- Core info section -->
        <div class="edit-section-card">
          <h3 class="edit-section-title">Core Information</h3>
          <div class="edit-form-grid">
            <div class="edit-field" style="grid-column: span 2;">
              <label>Recipe Title</label>
              <input type="text" id="edit-title" value="${escapeHtml(recipe.title)}" required style="width: 100%; box-sizing: border-box;">
            </div>
            
            <div class="edit-field">
              <label>Category</label>
              <select id="edit-category" style="width: 100%;">
                ${categoryOptions}
              </select>
            </div>

            <div class="edit-field">
              <label>Difficulty</label>
              <select id="edit-difficulty" style="width: 100%;">
                ${difficultyOptions}
              </select>
            </div>

            <div class="edit-field" style="grid-column: span 2;">
              <label>Photo URL</label>
              <input type="text" id="edit-image" value="${escapeHtml(recipe.image || '')}" placeholder="https://unsplash.com/photo-..." style="width: 100%; box-sizing: border-box;">
            </div>

            <div class="edit-field" style="grid-column: span 2;">
              <label>Description</label>
              <textarea id="edit-description" rows="3" required style="width: 100%; box-sizing: border-box;">${escapeHtml(recipe.description)}</textarea>
            </div>

            <div class="edit-field">
              <label>Prep Time (minutes)</label>
              <input type="number" id="edit-prep-time" value="${recipe.prepTime}" min="0" required style="width: 100%;">
            </div>

            <div class="edit-field">
              <label>Cook Time (minutes)</label>
              <input type="number" id="edit-cook-time" value="${recipe.cookTime}" min="0" required style="width: 100%;">
            </div>

            <div class="edit-field" style="grid-column: span 2;">
              <label>Servings (default)</label>
              <input type="number" id="edit-servings" value="${recipe.servings}" min="1" required style="width: 100%; box-sizing: border-box;">
            </div>
          </div>
        </div>

        <!-- Ingredients Section -->
        <div class="edit-section-card">
          <div class="edit-section-header">
            <h3 class="edit-section-title" style="margin: 0; border: none;">Ingredients</h3>
            <button type="button" class="btn-edit-add-more" id="btn-add-edit-ing">
              ${ICONS.plus} Add Ingredient
            </button>
          </div>
          <div class="edit-items-list" id="edit-ingredients-list">
            ${ingredientsHtml}
          </div>
        </div>

        <!-- Kitchen Gear Section -->
        <div class="edit-section-card">
          <div class="edit-section-header">
            <h3 class="edit-section-title" style="margin: 0; border: none;">Kitchen Gear Needed</h3>
            <button type="button" class="btn-edit-add-more" id="btn-add-edit-gear">
              ${ICONS.plus} Add Gear
            </button>
          </div>
          <div class="edit-items-list" id="edit-gear-list">
            ${equipmentHtml}
          </div>
        </div>

        <!-- Procedures Section -->
        <div class="edit-section-card">
          <div class="edit-section-header">
            <h3 class="edit-section-title" style="margin: 0; border: none;">Procedures</h3>
            <button type="button" class="btn-edit-add-more" id="btn-add-edit-step">
              ${ICONS.plus} Add Step
            </button>
          </div>
          <div class="edit-items-list" id="edit-steps-list">
            ${instructionsHtml}
          </div>
        </div>

        <!-- Form Actions -->
        <div class="edit-form-actions">
          <button type="button" id="btn-edit-cancel" class="btn-edit-secondary">Cancel</button>
          <button type="submit" id="btn-edit-save" class="btn-edit-primary">Save Changes</button>
        </div>

      </form>
    </div>
  `;
}

// Export ingredient substitutions list so it can be used for tooltips elsewhere
export { INGREDIENT_SUBSTITUTIONS };
