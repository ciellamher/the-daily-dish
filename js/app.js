// Main Application Orchestrator for The Daily Dish

import { store } from "./store.js";
import { renderRecipeCard } from "./components/recipe-card.js";
import { renderRecipeDetail, handleDetailModalClick } from "./components/recipe-detail.js";
import { renderShoppingList, exportShoppingList } from "./components/shopping-list.js";
import { simulateRecipeImport } from "./components/importer.js";
import { generateRecipeOnSpot } from "./components/generator.js";
import { escapeHtml, ICONS } from "./utils.js";

// DOM Selector Elements
const elements = {
  // Search & Navigation
  recipeSearchInput: document.getElementById("recipe-search-input"),
  searchClearBtn: document.getElementById("search-clear-btn"),
  tabModeIngredients: document.getElementById("tab-mode-ingredients"),
  tabModeName: document.getElementById("tab-mode-name"),
  suggestionsDropdown: document.getElementById("ingredient-suggestions"),
  
  // Custom Navigation elements
  btnShowHome: document.getElementById("btn-show-home"),
  logoHomeTrigger: document.getElementById("logo-home-trigger"),
  btnHeroMenu: document.getElementById("btn-hero-menu"),
  btnHeroGenerate: document.getElementById("btn-hero-generate"),
  searchGenerateBtn: document.getElementById("search-generate-btn"),
  
  // Fridge Panel
  fridgePickerPanel: document.getElementById("fridge-picker-panel"),
  staplesChipsContainer: document.getElementById("staples-chips-container"),
  fridgeStatusBar: document.getElementById("fridge-status-bar"),
  fridgeCount: document.getElementById("fridge-count"),
  btnClearFridge: document.getElementById("btn-clear-fridge"),
  activeIngredientsContainer: document.getElementById("active-ingredients-container"),
  
  // Grid Results
  recipesGrid: document.getElementById("recipes-grid"),
  resultsCount: document.getElementById("results-count"),
  resultsFilterInfo: document.getElementById("results-filter-info"),
  
  // Modals & Triggers
  btnShowImport: document.getElementById("btn-show-import"),
  btnShowMyRecipes: document.getElementById("btn-show-my-recipes"),
  heroBanner: document.querySelector(".hero-banner"),
  heroSection: document.getElementById("search-section-anchor"),
  resultsHeading: document.querySelector(".results-heading"),
  
  // Recipe Detail Modal
  recipeDetailModal: document.getElementById("recipe-detail-modal"),
  modalCloseBtn: document.getElementById("modal-close-btn"),
  modalRecipeContent: document.getElementById("modal-recipe-content"),
  
  // Importer Modal
  importerModal: document.getElementById("importer-modal"),
  importerCloseBtn: document.getElementById("importer-close-btn"),
  importUrlInput: document.getElementById("import-url-input"),
  btnSubmitImport: document.getElementById("btn-submit-import"),
  importerLoadingState: document.getElementById("importer-loading-state"),
  importerLoaderStatus: document.getElementById("importer-loader-status"),
  importerProgressFill: document.getElementById("importer-progress-fill"),
  importerSuccessState: document.getElementById("importer-success-state"),
  importedRecipeTitlePreview: document.getElementById("imported-recipe-title-preview"),
  btnViewImported: document.getElementById("btn-view-imported"),
  
  // Shopping Cart Drawer
  shoppingListDrawer: document.getElementById("shopping-list-drawer"),
  btnToggleCart: document.getElementById("btn-toggle-cart"),
  btnCloseCart: document.getElementById("btn-close-cart"),
  shoppingDrawerOverlay: document.getElementById("shopping-drawer-overlay"),
  cartBadgeCount: document.getElementById("cart-badge-count"),
  addCustomItemForm: document.getElementById("add-custom-item-form"),
  customItemName: document.getElementById("custom-item-name"),
  btnExportList: document.getElementById("btn-export-list"),
  btnClearChecked: document.getElementById("btn-clear-checked"),
  btnClearAll: document.getElementById("btn-clear-all"),
  
  // AI Generator Modal
  generatorModal: document.getElementById("generator-modal"),
  generatorCloseBtn: document.getElementById("generator-close-btn"),
  generatorLoadingState: document.getElementById("generator-loading-state"),
  generatorLoaderStatus: document.getElementById("generator-loader-status"),
  generatorProgressFill: document.getElementById("generator-progress-fill"),
  generatorSuccessState: document.getElementById("generator-success-state"),
  generatedRecipeTitlePreview: document.getElementById("generated-recipe-title-preview"),
  btnViewGenerated: document.getElementById("btn-view-generated"),
  
  // Floating Action Button
  fabContainer: document.getElementById("fab-container"),
  fabMainBtn: document.getElementById("fab-main-btn"),
  fabBtnGenerate: document.getElementById("fab-btn-generate"),
  fabBtnImport: document.getElementById("fab-btn-import")
};

// Global Staple Ingredients for Fridge Picker Quick-Add
const QUICK_ADD_STAPLES = [
  "garlic", "onion", "butter", "olive oil", "pasta", "chicken", "shrimp", 
  "spinach", "eggs", "flour", "avocado", "chocolate chips", "tomato"
];

// Local state for suggestion dropdown tracking
let highlightedSuggestionIndex = -1;

/* ==========================================================================
   INITIALIZATION & EVENT BINDINGS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initStaplesPicker();
  bindGlobalEvents();
  
  // Subscribe UI render to store updates
  store.subscribe(renderUI);
  
  // Initial render
  renderUI(store.state);
});

// Build quick-add staple chips in DOM (removes plus emoji in favor of text/clean styling)
function initStaplesPicker() {
  elements.staplesChipsContainer.innerHTML = QUICK_ADD_STAPLES.map(staple => `
    <button class="chip btn-staple-chip" data-ingredient="${staple}">
      <span>+</span>
      <span>${escapeHtml(staple)}</span>
    </button>
  `).join("");
}

function bindGlobalEvents() {
  /* --- 1. Home and Logo Reset Navigation --- */
  const handleHomeReset = (e) => {
    e.preventDefault();
    elements.recipeSearchInput.value = "";
    store.setSearchQuery("");
    store.clearFridgeIngredients();
    elements.searchClearBtn.classList.add("hidden");
    closeSuggestions();
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Reset active nav state
    store.setActiveTab("home");
  };

  if (elements.btnShowHome) elements.btnShowHome.addEventListener("click", handleHomeReset);
  if (elements.logoHomeTrigger) elements.logoHomeTrigger.addEventListener("click", handleHomeReset);

  /* --- 2. Hero Banner smooth scroll scroll bindings --- */
  if (elements.btnHeroMenu) {
    elements.btnHeroMenu.addEventListener("click", () => {
      store.setActiveTab("home");
      setTimeout(() => {
        const target = document.getElementById("search-section-anchor");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });
  }

  if (elements.btnHeroGenerate) {
    elements.btnHeroGenerate.addEventListener("click", () => {
      store.setActiveTab("home");
      setTimeout(() => {
        const target = document.getElementById("search-section-anchor");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => {
            elements.recipeSearchInput.focus();
          }, 600);
        }
      }, 50);
    });
  }

  /* --- 4. Direct search generation button click --- */
  if (elements.searchGenerateBtn) {
    elements.searchGenerateBtn.addEventListener("click", () => {
      const query = elements.recipeSearchInput.value.trim();
      if (query) {
        triggerAiRecipeGeneration(query);
      } else {
        alert("The Daily Dish needs you to type a dish name first! Try 'Pizza' or 'French Fries'.");
        elements.recipeSearchInput.focus();
      }
    });
  }

  /* --- 5. Search Bar & Suggestions --- */
  elements.recipeSearchInput.addEventListener("input", handleSearchInput);
  elements.recipeSearchInput.addEventListener("keydown", handleSearchKeydown);
  elements.searchClearBtn.addEventListener("click", () => {
    elements.recipeSearchInput.value = "";
    store.setSearchQuery("");
    elements.searchClearBtn.classList.add("hidden");
    closeSuggestions();
  });
  
  // Hide dropdown on clicking outside
  document.addEventListener("click", (e) => {
    if (!elements.recipeSearchInput.contains(e.target) && !elements.suggestionsDropdown.contains(e.target)) {
      closeSuggestions();
    }
  });

  /* --- 6. Search Mode Tabs --- */
  elements.tabModeIngredients.addEventListener("click", () => {
    store.setSearchMode("ingredients");
    elements.tabModeIngredients.classList.add("active");
    elements.tabModeName.classList.remove("active");
    elements.fridgePickerPanel.classList.remove("hidden");
    elements.recipeSearchInput.placeholder = "Type ingredients you have (e.g. eggs, tomato)...";
  });

  elements.tabModeName.addEventListener("click", () => {
    store.setSearchMode("name");
    elements.tabModeName.classList.add("active");
    elements.tabModeIngredients.classList.remove("active");
    elements.fridgePickerPanel.classList.add("hidden");
    elements.recipeSearchInput.placeholder = "Search for dishes (e.g. Pasta, Cheeseburger, Salad)...";
  });

  /* --- 7. Fridge Ingredient Triggers --- */
  elements.staplesChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".btn-staple-chip");
    if (chip) {
      const ing = chip.getAttribute("data-ingredient");
      store.toggleFridgeIngredient(ing);
    }
  });

  elements.activeIngredientsContainer.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".active-chip-remove");
    if (removeBtn) {
      const ing = removeBtn.getAttribute("data-ingredient");
      store.toggleFridgeIngredient(ing);
    }
  });

  elements.btnClearFridge.addEventListener("click", () => {
    store.clearFridgeIngredients();
  });

  /* --- 8. Modals and Slide Drawer UI Triggers --- */
  
  // Shopping list drawer
  elements.btnToggleCart.addEventListener("click", () => {
    elements.shoppingListDrawer.classList.add("active");
  });
  elements.btnCloseCart.addEventListener("click", () => {
    elements.shoppingListDrawer.classList.remove("active");
  });
  elements.shoppingDrawerOverlay.addEventListener("click", () => {
    elements.shoppingListDrawer.classList.remove("active");
  });

  // Importer trigger
  elements.btnShowImport.addEventListener("click", () => {
    openModal(elements.importerModal);
  });
  elements.importerCloseBtn.addEventListener("click", () => {
    closeModal(elements.importerModal);
    resetImporterState();
  });

  // My Recipes navigation trigger
  if (elements.btnShowMyRecipes) {
    elements.btnShowMyRecipes.addEventListener("click", (e) => {
      e.preventDefault();
      store.setActiveTab("my-recipes");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Recipe details close
  elements.modalCloseBtn.addEventListener("click", () => {
    closeModal(elements.recipeDetailModal);
    store.setSelectedRecipe(null);
  });

  // Close modals on overlay clicks or ESC key
  window.addEventListener("click", (e) => {
    if (e.target === elements.recipeDetailModal) {
      closeModal(elements.recipeDetailModal);
      store.setSelectedRecipe(null);
    }
    if (e.target === elements.importerModal) {
      closeModal(elements.importerModal);
      resetImporterState();
    }
    if (e.target === elements.generatorModal) {
      closeModal(elements.generatorModal);
      resetGeneratorState();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(elements.recipeDetailModal);
      closeModal(elements.importerModal);
      closeModal(elements.generatorModal);
      elements.shoppingListDrawer.classList.remove("active");
      store.setSelectedRecipe(null);
      closeSuggestions();
    }
  });

  /* --- 9. Recipe Grid Events (Delegated) --- */
  elements.recipesGrid.addEventListener("click", (e) => {
    // 0. Floating Save/Delete Actions
    const saveBtn = e.target.closest(".btn-save-recipe");
    if (saveBtn) {
      const id = saveBtn.getAttribute("data-id");
      const isSaved = store.state.myRecipes.some(r => r.id === id);
      if (isSaved) {
        store.removeRecipeFromMyRecipes(id);
      } else {
        store.saveRecipeToMyRecipes(id);
      }
      return;
    }

    const delBtn = e.target.closest(".btn-delete-default, .btn-delete-saved");
    if (delBtn) {
      const id = delBtn.getAttribute("data-id");
      store.deleteRecipe(id);
      return;
    }

    // A. View Details
    const viewBtn = e.target.closest(".btn-view-details");
    if (viewBtn) {
      const id = viewBtn.getAttribute("data-id");
      store.setSelectedRecipe(id);
      openModal(elements.recipeDetailModal);
      return;
    }
    
    // B. Quick Add to Shopping List
    const addBtn = e.target.closest(".btn-quick-add-grocery");
    if (addBtn) {
      const id = addBtn.getAttribute("data-id");
      const recipe = store.state.recipes.find(r => r.id === id);
      if (recipe) {
        store.addMultipleIngredientsToShoppingList(recipe.ingredients, recipe.title);
        
        // Visual Bouncy Feedback on Badge
        elements.cartBadgeCount.classList.add("pulse-badge");
        setTimeout(() => elements.cartBadgeCount.classList.remove("pulse-badge"), 500);

        // Visual feedback on card button
        const originalHtml = addBtn.innerHTML;
        addBtn.innerHTML = "Added!";
        addBtn.style.backgroundColor = "var(--color-success)";
        addBtn.style.color = "var(--bg-primary)";
        addBtn.style.borderColor = "var(--color-success)";
        setTimeout(() => {
          addBtn.innerHTML = originalHtml;
          addBtn.style.backgroundColor = "";
          addBtn.style.color = "";
          addBtn.style.borderColor = "";
        }, 1200);
      }
      return;
    }

    // C. Click on card anywhere (except button actions) should also open details
    const card = e.target.closest(".recipe-card");
    if (card && !e.target.closest("button")) {
      const id = card.getAttribute("data-recipe-id");
      store.setSelectedRecipe(id);
      openModal(elements.recipeDetailModal);
      return;
    }

    // D. On-the-spot AI generation trigger
    const genTrigger = e.target.closest(".action-generate-spot");
    if (genTrigger) {
      const q = genTrigger.getAttribute("data-query");
      triggerAiRecipeGeneration(q);
      return;
    }
  });

  /* --- 10. Recipe Detail Modal Event Delegation --- */
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const selectedRecipe = store.state.recipes.find(r => r.id === store.state.selectedRecipeId);
    if (selectedRecipe) {
      handleDetailModalClick(e, selectedRecipe, store.state);
    }
  });

  /* --- 11. Shopping List Actions --- */
  
  // Checkbox toggle (delegated)
  document.getElementById("shopping-list-items-container").addEventListener("change", (e) => {
    const checkbox = e.target.closest(".shopping-item-checkbox");
    if (checkbox) {
      const itemId = checkbox.getAttribute("data-id");
      store.toggleShoppingItem(itemId);
    }
  });

  // Delete item (delegated)
  document.getElementById("shopping-list-items-container").addEventListener("click", (e) => {
    const delBtn = e.target.closest(".shopping-item-delete");
    if (delBtn) {
      const itemId = delBtn.getAttribute("data-id");
      store.removeShoppingItem(itemId);
    }
  });

  // Form custom add
  elements.addCustomItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = elements.customItemName.value.trim();
    if (name) {
      store.addIngredientToShoppingList(name, 1, "pc", "Manual Input");
      elements.customItemName.value = "";
      elements.customItemName.focus();
    }
  });

  // Clear options
  elements.btnClearChecked.addEventListener("click", () => {
    store.clearCheckedShoppingItems();
  });
  elements.btnClearAll.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your shopping list?")) {
      store.clearShoppingList();
    }
  });

  // Export List
  elements.btnExportList.addEventListener("click", () => {
    exportShoppingList(store.state.shoppingList);
    
    // Show copy notification/toast
    const originalHtml = elements.btnExportList.innerHTML;
    elements.btnExportList.innerHTML = "Exported!";
    elements.btnExportList.style.backgroundColor = "var(--color-success)";
    elements.btnExportList.style.color = "var(--bg-primary)";
    setTimeout(() => {
      elements.btnExportList.innerHTML = originalHtml;
      elements.btnExportList.style.backgroundColor = "";
      elements.btnExportList.style.color = "";
    }, 2000);
  });

  /* --- 12. URL Importer --- */
  elements.btnSubmitImport.addEventListener("click", handleRecipeImport);
  elements.btnViewImported.addEventListener("click", () => {
    if (store.state.myRecipes.length > 0) {
      const latestRecipeId = store.state.myRecipes[0].id;
      store.setActiveTab("my-recipes");
      store.setSelectedRecipe(latestRecipeId);
      closeModal(elements.importerModal);
      resetImporterState();
      openModal(elements.recipeDetailModal);
    }
  });

  /* --- 13. AI Recipe Generator --- */
  elements.generatorCloseBtn.addEventListener("click", () => {
    closeModal(elements.generatorModal);
    resetGeneratorState();
  });
  elements.btnViewGenerated.addEventListener("click", () => {
    if (store.state.myRecipes.length > 0) {
      const latestRecipeId = store.state.myRecipes[0].id;
      store.setActiveTab("my-recipes");
      store.setSelectedRecipe(latestRecipeId);
      closeModal(elements.generatorModal);
      resetGeneratorState();
      openModal(elements.recipeDetailModal);
    }
  });

  /* --- 14. Floating Action Button Speed Dial --- */
  if (elements.fabMainBtn) {
    elements.fabMainBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      elements.fabContainer.classList.toggle("active");
    });
  }

  // Close speed dial if clicking anywhere else
  document.addEventListener("click", (e) => {
    if (elements.fabContainer && !elements.fabContainer.contains(e.target)) {
      elements.fabContainer.classList.remove("active");
    }
  });

  if (elements.fabBtnGenerate) {
    elements.fabBtnGenerate.addEventListener("click", () => {
      elements.fabContainer.classList.remove("active");
      const query = prompt("What dish would you like The Daily Dish to generate? (e.g. Garlic Butter Chicken, Tacos, Chocolate Lava Cake)");
      if (query && query.trim()) {
        triggerAiRecipeGeneration(query);
      }
    });
  }

  if (elements.fabBtnImport) {
    elements.fabBtnImport.addEventListener("click", () => {
      elements.fabContainer.classList.remove("active");
      openModal(elements.importerModal);
    });
  }
}

/* ==========================================================================
   DOM UTILITIES
   ========================================================================== */

function openModal(modalEl) {
  modalEl.classList.add("active");
  document.body.style.overflow = "hidden"; // lock page scroll
}

function closeModal(modalEl) {
  modalEl.classList.remove("active");
  document.body.style.overflow = "";
}

/* ==========================================================================
   SEARCH & AUTOCOMPLETE LOGIC (Clean SVGs instead of emojis)
   ========================================================================== */

function handleSearchInput(e) {
  const value = e.target.value;
  store.setSearchQuery(value);
  
  if (value.trim()) {
    elements.searchClearBtn.classList.remove("hidden");
  } else {
    elements.searchClearBtn.classList.add("hidden");
  }

  // Handle ingredient matching autocompletes
  if (value.trim()) {
    showIngredientSuggestions(value);
  } else {
    closeSuggestions();
  }
}

function showIngredientSuggestions(query) {
  const q = query.toLowerCase().trim();
  const allIngs = store.getAllUniqueIngredients();
  
  let dropdownHtml = "";
  
  if (store.state.searchMode === "ingredients") {
    // Filter out ingredients already in the fridge list
    const filtered = allIngs.filter(ing => 
      ing.includes(q) && !store.state.selectedIngredients.includes(ing)
    );

    dropdownHtml = filtered.slice(0, 5).map((ing, idx) => `
      <button class="suggestion-item" data-index="${idx}" data-ingredient="${ing}">
        <span class="suggestion-icon-svg">${ICONS.fridge}</span>
        <span>${escapeHtml(ing)}</span>
      </button>
    `).join("");

    // Append the "Generate on the spot" item at the end of suggestions
    dropdownHtml += `
      <button class="suggestion-item action-generate-spot" data-query="${escapeHtml(query)}" style="border-top: 1px dashed var(--border-color); color: var(--accent-primary); font-weight: 600;">
        <span class="suggestion-icon-svg" style="color: var(--accent-primary);">${ICONS.wand}</span>
        <span>Generate custom "${escapeHtml(query)}" recipe instantly!</span>
      </button>
    `;
  } else {
    // In Name Search Mode, just show the Generate button
    dropdownHtml = `
      <button class="suggestion-item action-generate-spot" data-query="${escapeHtml(query)}" style="color: var(--accent-primary); font-weight: 600;">
        <span class="suggestion-icon-svg" style="color: var(--accent-primary);">${ICONS.wand}</span>
        <span>Generate custom "${escapeHtml(query)}" recipe instantly!</span>
      </button>
    `;
  }

  elements.suggestionsDropdown.innerHTML = dropdownHtml;
  elements.suggestionsDropdown.classList.remove("hidden");

  // Wire up suggestion item clicks
  const items = elements.suggestionsDropdown.querySelectorAll(".suggestion-item");
  items.forEach(item => {
    item.addEventListener("click", () => {
      if (item.classList.contains("action-generate-spot")) {
        const qVal = item.getAttribute("data-query");
        triggerAiRecipeGeneration(qVal);
        elements.recipeSearchInput.value = "";
        store.setSearchQuery("");
        elements.searchClearBtn.classList.add("hidden");
        closeSuggestions();
        return;
      }
      
      const ing = item.getAttribute("data-ingredient");
      store.toggleFridgeIngredient(ing);
      elements.recipeSearchInput.value = "";
      store.setSearchQuery("");
      elements.searchClearBtn.classList.add("hidden");
      closeSuggestions();
    });
  });
}

function closeSuggestions() {
  elements.suggestionsDropdown.classList.add("hidden");
  elements.suggestionsDropdown.innerHTML = "";
  highlightedSuggestionIndex = -1;
}

function handleSearchKeydown(e) {
  const items = elements.suggestionsDropdown.querySelectorAll(".suggestion-item");
  
  // Arrow Down
  if (e.key === "ArrowDown" && items.length > 0) {
    e.preventDefault();
    highlightedSuggestionIndex = (highlightedSuggestionIndex + 1) % items.length;
    updateSuggestionHighlight(items);
  }
  // Arrow Up
  else if (e.key === "ArrowUp" && items.length > 0) {
    e.preventDefault();
    highlightedSuggestionIndex = (highlightedSuggestionIndex - 1 + items.length) % items.length;
    updateSuggestionHighlight(items);
  }
  // Enter
  else if (e.key === "Enter") {
    // If suggestion selected, add that
    if (highlightedSuggestionIndex >= 0 && items[highlightedSuggestionIndex]) {
      e.preventDefault();
      items[highlightedSuggestionIndex].click();
    } 
    // Otherwise, if fridge search mode, add the raw typed value as a chip
    else if (store.state.searchMode === "ingredients" && elements.recipeSearchInput.value.trim()) {
      e.preventDefault();
      const val = elements.recipeSearchInput.value.trim().toLowerCase();
      store.toggleFridgeIngredient(val);
      elements.recipeSearchInput.value = "";
      store.setSearchQuery("");
      elements.searchClearBtn.classList.add("hidden");
      closeSuggestions();
    }
  }
}

function updateSuggestionHighlight(items) {
  items.forEach((item, idx) => {
    if (idx === highlightedSuggestionIndex) {
      item.classList.add("highlighted");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("highlighted");
    }
  });
}

/* ==========================================================================
   IMPORTER PROCESS LOGIC
   ========================================================================== */

function handleRecipeImport() {
  const url = elements.importUrlInput.value.trim();
  
  if (!url || !url.startsWith("http")) {
    alert("Please enter a valid recipe URL.");
    return;
  }

  // UI state transition
  elements.importUrlInput.disabled = true;
  elements.btnSubmitImport.disabled = true;
  elements.importerLoadingState.classList.remove("hidden");
  
  // Clear step highlighting
  resetImportStepsUI();

  simulateRecipeImport(
    url,
    // Step update callback
    (update) => {
      elements.importerLoaderStatus.innerText = update.status;
      elements.importerProgressFill.style.width = `${update.progress}%`;
      
      const stepEl = document.getElementById(`step-${update.step}`);
      if (stepEl) {
        stepEl.classList.add("active");
      }
      
      // Mark preceding steps done
      if (update.step === "extract") {
        document.getElementById("step-connect").classList.remove("active");
        document.getElementById("step-connect").classList.add("done");
      } else if (update.step === "structure") {
        document.getElementById("step-extract").classList.remove("active");
        document.getElementById("step-extract").classList.add("done");
      } else if (update.step === "save") {
        document.getElementById("step-structure").classList.remove("active");
        document.getElementById("step-structure").classList.add("done");
      }
    },
    // Complete callback
    (importedRecipe) => {
      // Show success screen
      elements.importerLoadingState.classList.add("hidden");
      elements.importerSuccessState.classList.remove("hidden");
      elements.importedRecipeTitlePreview.innerText = importedRecipe.title;
    }
  );
}

function resetImportStepsUI() {
  const steps = ["connect", "extract", "structure"];
  steps.forEach(st => {
    const el = document.getElementById(`step-${st}`);
    if (el) {
      el.className = "loader-step";
    }
  });
  elements.importerProgressFill.style.width = "0%";
}

function resetImporterState() {
  elements.importUrlInput.value = "";
  elements.importUrlInput.disabled = false;
  elements.btnSubmitImport.disabled = false;
  elements.importerLoadingState.classList.add("hidden");
  elements.importerSuccessState.classList.add("hidden");
  resetImportStepsUI();
}

/* ==========================================================================
   UI RENDERING SYSTEM (Clean SVGs instead of emojis)
   ========================================================================== */

function renderUI(state) {
  // 0. Toggle active tab visual styling and sections
  if (state.activeTab === "home") {
    if (elements.btnShowHome) elements.btnShowHome.classList.add("active");
    if (elements.btnShowMyRecipes) elements.btnShowMyRecipes.classList.remove("active");
    if (elements.heroBanner) elements.heroBanner.classList.remove("hidden");
    if (elements.heroSection) elements.heroSection.classList.remove("hidden");
    if (elements.resultsHeading) elements.resultsHeading.innerHTML = "Weekly Default Recipes";
  } else if (state.activeTab === "my-recipes") {
    if (elements.btnShowHome) elements.btnShowHome.classList.remove("active");
    if (elements.btnShowMyRecipes) elements.btnShowMyRecipes.classList.add("active");
    if (elements.heroBanner) elements.heroBanner.classList.add("hidden");
    if (elements.heroSection) elements.heroSection.classList.add("hidden");
    if (elements.resultsHeading) elements.resultsHeading.innerHTML = "My Saved Recipes";
  }

  // 1. Render active fridge ingredient chips
  const fridgeContainer = elements.activeIngredientsContainer;
  const statusPanel = elements.fridgeStatusBar;
  
  if (state.selectedIngredients.length > 0) {
    statusPanel.classList.remove("hidden");
    elements.fridgeCount.innerText = state.selectedIngredients.length;
    
    fridgeContainer.innerHTML = state.selectedIngredients.map(ing => `
      <div class="active-chip">
        <span class="chip-icon-svg">${ICONS.fridge}</span>
        <span>${escapeHtml(ing)}</span>
        <button class="active-chip-remove" data-ingredient="${ing}" aria-label="Remove ${ing}">
          ${ICONS.close}
        </button>
      </div>
    `).join("");
  } else {
    statusPanel.classList.add("hidden");
    fridgeContainer.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; width: 100%; text-align: center; margin: 10px 0;">
        Your fridge is currently empty. Add ingredients above to see matching meals!
      </p>
    `;
  }

  // Update quick add chips active states
  const stapleChips = elements.staplesChipsContainer.querySelectorAll(".chip");
  stapleChips.forEach(chip => {
    const ing = chip.getAttribute("data-ingredient");
    if (state.selectedIngredients.includes(ing)) {
      chip.classList.add("active");
      chip.innerHTML = `
        <span class="chip-status-check">${ICONS.check}</span>
        <span>${escapeHtml(ing)}</span>
      `;
    } else {
      chip.classList.remove("active");
      chip.innerHTML = `
        <span>+</span>
        <span>${escapeHtml(ing)}</span>
      `;
    }
  });

  // 2. Render matching/filtered recipes grid
  const filteredRecipes = store.getFilteredRecipes();
  if (elements.resultsCount) {
    elements.resultsCount.innerText = filteredRecipes.length;
  }

  if (state.searchMode === "ingredients" && state.selectedIngredients.length > 0) {
    elements.resultsFilterInfo.innerHTML = `Matching recipes for ingredient tags: <span>${escapeHtml(state.selectedIngredients.join(", "))}</span>`;
  } else if (state.searchQuery.trim()) {
    elements.resultsFilterInfo.innerHTML = `Search results for query: <span>"${escapeHtml(state.searchQuery)}"</span>`;
  } else {
    elements.resultsFilterInfo.innerHTML = state.activeTab === "my-recipes" ? `Browse your saved and generated collection` : `Browse this week's handpicked default recipes`;
  }

  if (filteredRecipes.length === 0) {
    if (state.activeTab === "my-recipes") {
      elements.recipesGrid.innerHTML = `
        <div class="recipes-empty-state">
          <span class="empty-icon">${ICONS.cooking}</span>
          <h4>Your cookbook is empty</h4>
          <p>You haven't saved any recipes yet! Go back to Home and save some default recipes, or generate new ones using AI.</p>
        </div>
      `;
    } else {
      const queryStr = state.searchQuery.trim() ? state.searchQuery : state.selectedIngredients.join(", ");
      const hasQuery = queryStr.length > 0;
      elements.recipesGrid.innerHTML = `
        <div class="recipes-empty-state">
          <span class="empty-icon">${ICONS.cooking}</span>
          <h4>No recipes match your search</h4>
          <p>Try adding simpler ingredients or typing another dish name.</p>
          ${hasQuery ? `
            <button class="btn-card-secondary action-generate-spot" data-query="${escapeHtml(queryStr)}" style="margin-top: 20px; width: auto; padding: 12px 24px; font-size: 0.95rem; border-color: var(--accent-primary); color: var(--accent-primary); background: rgba(255, 126, 103, 0.05); border-radius: var(--radius-md); font-weight: 600;">
              <span class="btn-action-icon-svg" style="margin-right: 6px;">${ICONS.wand}</span>
              <span>Generate custom "${escapeHtml(queryStr)}" recipe on the spot!</span>
            </button>
          ` : ""}
        </div>
      `;
    }
  } else {
    elements.recipesGrid.innerHTML = filteredRecipes.map(recipe => 
      renderRecipeCard(recipe, state.myRecipes.some(mr => mr.id === recipe.id), state.activeTab)
    ).join("");
  }

  // 3. Render Shopping Cart Drawer & Badge Count
  renderShoppingList(state.shoppingList);
  
  const totalCartQty = state.shoppingList.reduce((acc, curr) => acc + (curr.checked ? 0 : 1), 0);
  elements.cartBadgeCount.innerText = totalCartQty;
  if (totalCartQty > 0) {
    elements.cartBadgeCount.classList.remove("hidden");
  } else {
    elements.cartBadgeCount.classList.add("hidden");
  }

  // 4. Render Details Modal if open (reactive to serving changes, etc.)
  if (state.selectedRecipeId) {
    const activeRecipe = state.recipes.find(r => r.id === state.selectedRecipeId);
    if (activeRecipe) {
      elements.modalRecipeContent.innerHTML = renderRecipeDetail(activeRecipe, state);
    }
  }
}

/* ==========================================================================
   AI GENERATOR PROCESS LOGIC
   ========================================================================== */

function triggerAiRecipeGeneration(query) {
  if (!query || !query.trim()) return;

  // Show generator modal
  openModal(elements.generatorModal);
  elements.generatorLoadingState.classList.remove("hidden");
  elements.generatorSuccessState.classList.add("hidden");
  
  resetGeneratorStepsUI();

  generateRecipeOnSpot(
    query,
    // Step update callback
    (update) => {
      elements.generatorLoaderStatus.innerText = update.status;
      elements.generatorProgressFill.style.width = `${update.progress}%`;
      
      const stepEl = document.getElementById(`gen-step-${update.step}`);
      if (stepEl) {
        stepEl.classList.add("active");
      }
      
      // Mark preceding steps done
      if (update.step === "extract") {
        document.getElementById("gen-step-connect").classList.remove("active");
        document.getElementById("gen-step-connect").classList.add("done");
      } else if (update.step === "structure") {
        document.getElementById("gen-step-extract").classList.remove("active");
        document.getElementById("gen-step-extract").classList.add("done");
      } else if (update.step === "save") {
        document.getElementById("gen-step-structure").classList.remove("active");
        document.getElementById("gen-step-structure").classList.add("done");
      }
    },
    // Complete callback
    (generatedRecipe) => {
      elements.generatorLoadingState.classList.add("hidden");
      elements.generatorSuccessState.classList.remove("hidden");
      elements.generatedRecipeTitlePreview.innerText = generatedRecipe.title;
      
      // Force scroll to grid result so they can see the generated card easily when closed
      const targetGrid = document.getElementById("recipes-list-anchor");
      if (targetGrid) {
        targetGrid.scrollIntoView({ behavior: "smooth" });
      }
    }
  );
}

function resetGeneratorStepsUI() {
  const steps = ["connect", "extract", "structure"];
  steps.forEach(st => {
    const el = document.getElementById(`gen-step-${st}`);
    if (el) {
      el.className = "loader-step";
    }
  });
  elements.generatorProgressFill.style.width = "0%";
}

function resetGeneratorState() {
  elements.generatorLoadingState.classList.add("hidden");
  elements.generatorSuccessState.classList.add("hidden");
  resetGeneratorStepsUI();
}
