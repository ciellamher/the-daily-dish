// Main Application Orchestrator for The Daily Dish

import { store } from "./store.js";
import { renderRecipeCard } from "./components/recipe-card.js";
import { renderRecipeDetail, handleDetailModalClick, INGREDIENT_SUBSTITUTIONS, renderRecipeEditForm } from "./components/recipe-detail.js";
import { renderShoppingList, exportShoppingList } from "./components/shopping-list.js";
import { simulateRecipeImport } from "./components/importer.js";
import { generateRecipeOnSpot } from "./components/generator.js";
import { escapeHtml, ICONS, startAmbientAudio, stopAmbientAudio } from "./utils.js";

// DOM Selector Elements
const elements = {
  // Search & Navigation
  recipeSearchInput: document.getElementById("recipe-search-input"),
  searchClearBtn: document.getElementById("search-clear-btn"),
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
  generatorFailureState: document.getElementById("generator-failure-state"),
  generatorFailureMessage: document.getElementById("generator-failure-message"),
  btnSearchExternalLink: document.getElementById("btn-search-external-link"),
  generatorFailureImportUrl: document.getElementById("generator-failure-import-url"),
  btnGeneratorFailureImport: document.getElementById("btn-generator-failure-import"),
  
  // Floating Action Button
  fabContainer: document.getElementById("fab-container"),
  fabMainBtn: document.getElementById("fab-main-btn"),
  fabBtnGenerate: document.getElementById("fab-btn-generate"),
  fabBtnImport: document.getElementById("fab-btn-import"),
  
  // Theme Mood Select & Boards Panel
  themeMoodSelect: document.getElementById("theme-mood-select"),
  moodBoardsPanel: document.getElementById("mood-boards-panel"),
  boardsChipsContainer: document.getElementById("boards-chips-container"),
  
  // Cook Mode Overlay
  cookModeOverlay: document.getElementById("cook-mode-overlay"),
  cookModeRecipeTitle: document.getElementById("cook-mode-recipe-title"),
  cookModeStepIndicator: document.getElementById("cook-mode-step-indicator"),
  cookModeProgressFill: document.getElementById("cook-mode-progress-fill"),
  cookModeStepText: document.getElementById("cook-mode-step-text"),
  cookModeTipBox: document.getElementById("cook-mode-tip-box"),
  cookModeTipText: document.getElementById("cook-mode-tip-text"),
  btnCookPrev: document.getElementById("btn-cook-prev"),
  btnCookNext: document.getElementById("btn-cook-next"),
  btnCloseCookMode: document.getElementById("btn-close-cook-mode"),
  wakeLockStatus: document.getElementById("wake-lock-status"),
  
  // Floating Countdown Timer Bar
  floatingTimerBar: document.getElementById("floating-timer-bar"),
  timerBarDisplay: document.getElementById("timer-bar-display"),
  timerBarLabel: document.getElementById("timer-bar-label"),
  btnTimerToggle: document.getElementById("btn-timer-toggle"),
  btnTimerReset: document.getElementById("btn-timer-reset"),
  btnTimerClose: document.getElementById("btn-timer-close"),
  
  // Story Exporter
  storyExporterModal: document.getElementById("story-exporter-modal"),
  storyCloseBtn: document.getElementById("story-close-btn"),
  storyCanvas: document.getElementById("story-canvas"),
  btnDownloadStory: document.getElementById("btn-download-story"),
  btnCopyStoryTip: document.getElementById("btn-copy-story-tip"),
  
  // User Authentication
  btnUserProfile: document.getElementById("btn-user-profile"),
  headerUserAvatar: document.getElementById("header-user-avatar"),
  headerUserName: document.getElementById("header-user-name"),
  profileDropdown: document.getElementById("profile-dropdown"),
  dropdownUsername: document.getElementById("dropdown-username"),
  btnDropdownLogin: document.getElementById("btn-dropdown-login"),
  btnDropdownLogout: document.getElementById("btn-dropdown-logout"),
  
  // Login Modal
  loginModal: document.getElementById("login-modal"),
  loginCloseBtn: document.getElementById("login-close-btn"),
  loginForm: document.getElementById("login-form"),
  loginUsernameInput: document.getElementById("login-username-input"),
  loginPasswordInput: document.getElementById("login-password-input"),
  linkToggleRegister: document.getElementById("link-toggle-register"),
  loginModalTitle: document.getElementById("login-modal-title"),
  loginModalSubtitle: document.getElementById("login-modal-subtitle"),
  loginPasswordLabel: document.getElementById("login-password-label"),
  btnLoginSubmit: document.getElementById("btn-login-submit"),
  loginErrorMsg: document.getElementById("login-error-msg"),
  btnOauthGoogle: document.getElementById("btn-oauth-google"),
  btnOauthApple: document.getElementById("btn-oauth-apple"),
  
  // Saved Recipes Tab
  btnTabImport: document.getElementById("btn-tab-import"),

  // Weekly Meal Planner
  btnShowPlanner: document.getElementById("btn-show-planner"),
  btnClearPlanner: document.getElementById("btn-clear-planner"),
  btnPlannerToGrocery: document.getElementById("btn-planner-to-grocery"),
  mealPlannerCalendar: document.getElementById("meal-planner-calendar"),
  mealPlannerAddModal: document.getElementById("meal-planner-add-modal"),
  plannerAddCloseBtn: document.getElementById("planner-add-close-btn"),
  plannerAddForm: document.getElementById("planner-add-form"),
  plannerAddRecipeId: document.getElementById("planner-add-recipe-id"),
  plannerRecipeTitle: document.getElementById("planner-recipe-title"),
  plannerDaySelect: document.getElementById("planner-day-select"),
  plannerSlotSelect: document.getElementById("planner-slot-select"),
  plannerRecipeSelect: document.getElementById("planner-recipe-select"),
  plannerCustomInputGroup: document.getElementById("planner-custom-input-group"),
  plannerCustomName: document.getElementById("planner-custom-name")
};

// Global Staple Ingredients for Fridge Picker Quick-Add
const QUICK_ADD_STAPLES = [
  "garlic", "onion", "butter", "olive oil", "pasta", "chicken", "shrimp", 
  "spinach", "eggs", "flour", "avocado", "chocolate chips", "tomato"
];

// Local state for suggestion dropdown tracking
let highlightedSuggestionIndex = -1;
let authModalMode = "login"; // "login" or "register"

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

  // Prompt login immediately if user is not logged in
  if (!store.state.currentUser) {
    setAuthModalMode("login");
    openModal(elements.loginModal);
  }
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
  if (elements.btnShowImport) {
    elements.btnShowImport.addEventListener("click", () => {
      openModal(elements.importerModal);
    });
  }
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
    if (e.target === elements.loginModal) {
      closeModal(elements.loginModal);
      elements.loginForm.reset();
    }
    if (e.target === elements.mealPlannerAddModal) {
      closeModal(elements.mealPlannerAddModal);
      elements.plannerAddForm.reset();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(elements.recipeDetailModal);
      closeModal(elements.importerModal);
      closeModal(elements.generatorModal);
      closeModal(elements.loginModal);
      closeModal(elements.mealPlannerAddModal);
      if (elements.plannerAddForm) elements.plannerAddForm.reset();
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
      const plannerBtn = e.target.closest(".btn-recipe-planner");
      if (plannerBtn) {
        elements.plannerAddRecipeId.value = selectedRecipe.id;
        elements.plannerRecipeTitle.innerText = selectedRecipe.title;
        openModal(elements.mealPlannerAddModal);
        return;
      }
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
  if (elements.btnGeneratorFailureImport) {
    elements.btnGeneratorFailureImport.addEventListener("click", () => {
      const url = elements.generatorFailureImportUrl.value.trim();
      if (!url || !url.startsWith("http")) {
        alert("Please enter a valid recipe URL.");
        return;
      }

      elements.generatorFailureState.classList.add("hidden");
      elements.generatorLoadingState.classList.remove("hidden");
      
      resetGeneratorStepsUI();
      
      simulateRecipeImport(
        url,
        (update) => {
          elements.generatorLoaderStatus.innerText = update.status;
          elements.generatorProgressFill.style.width = `${update.progress}%`;
          
          const stepEl = document.getElementById(`gen-step-${update.step}`);
          if (stepEl) {
            stepEl.classList.add("active");
          }
          
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
        (importedRecipe) => {
          elements.generatorLoadingState.classList.add("hidden");
          elements.generatorSuccessState.classList.remove("hidden");
          elements.generatedRecipeTitlePreview.innerText = importedRecipe.title;
          elements.generatorFailureImportUrl.value = "";
        }
      );
    });
  }

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

  if (elements.btnTabImport) {
    elements.btnTabImport.addEventListener("click", () => {
      openModal(elements.importerModal);
    });
  }

  /* --- 15. User Authentication Events --- */
  if (elements.btnUserProfile) {
    elements.btnUserProfile.addEventListener("click", (e) => {
      e.stopPropagation();
      elements.profileDropdown.classList.toggle("hidden");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (elements.profileDropdown && !elements.profileDropdown.contains(e.target) && !elements.btnUserProfile.contains(e.target)) {
      elements.profileDropdown.classList.add("hidden");
    }
  });

  if (elements.btnDropdownLogin) {
    elements.btnDropdownLogin.addEventListener("click", () => {
      elements.profileDropdown.classList.add("hidden");
      setAuthModalMode("login");
      openModal(elements.loginModal);
      elements.loginUsernameInput.focus();
    });
  }

  if (elements.loginCloseBtn) {
    elements.loginCloseBtn.addEventListener("click", () => {
      closeModal(elements.loginModal);
      elements.loginForm.reset();
      if (elements.loginErrorMsg) {
        elements.loginErrorMsg.classList.add("hidden");
        elements.loginErrorMsg.innerText = "";
      }
    });
  }

  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = elements.loginUsernameInput.value.trim();
      const password = elements.loginPasswordInput.value;

      if (!username || !password) return;

      let result;
      if (authModalMode === "login") {
        result = store.authenticateUser(username, password);
      } else {
        result = store.registerUser(username, password);
      }

      if (result.success) {
        closeModal(elements.loginModal);
        elements.loginForm.reset();
        if (elements.loginErrorMsg) {
          elements.loginErrorMsg.classList.add("hidden");
          elements.loginErrorMsg.innerText = "";
        }
      } else {
        if (elements.loginErrorMsg) {
          elements.loginErrorMsg.innerText = result.error;
          elements.loginErrorMsg.classList.remove("hidden");
        }
      }
    });
  }

  const handleOauthClick = (provider) => {
    if (elements.loginErrorMsg) {
      elements.loginErrorMsg.classList.add("hidden");
    }
    const btn = provider === "google" ? elements.btnOauthGoogle : elements.btnOauthApple;
    if (btn) {
      const originalText = btn.innerText;
      btn.disabled = true;
      btn.innerText = "Connecting...";
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = originalText;
        const mockName = provider === "google" ? "Google Chef" : "Apple Chef";
        store.loginUser(mockName);
        closeModal(elements.loginModal);
        elements.loginForm.reset();
      }, 1200);
    }
  };

  if (elements.btnOauthGoogle) {
    elements.btnOauthGoogle.addEventListener("click", () => handleOauthClick("google"));
  }

  if (elements.btnOauthApple) {
    elements.btnOauthApple.addEventListener("click", () => handleOauthClick("apple"));
  }

  if (elements.btnDropdownLogout) {
    elements.btnDropdownLogout.addEventListener("click", () => {
      elements.profileDropdown.classList.add("hidden");
      if (confirm("Are you sure you want to log out?")) {
        store.logoutUser();
      }
    });
  }

  /* --- 16. Weekly Meal Planner Events --- */
  if (elements.btnShowPlanner) {
    elements.btnShowPlanner.addEventListener("click", (e) => {
      e.preventDefault();
      store.setActiveTab("meal-planner");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (elements.plannerAddCloseBtn) {
    elements.plannerAddCloseBtn.addEventListener("click", () => {
      closeModal(elements.mealPlannerAddModal);
      elements.plannerAddForm.reset();
      if (elements.plannerCustomInputGroup) elements.plannerCustomInputGroup.classList.add("hidden");
    });
  }

  if (elements.plannerRecipeSelect) {
    elements.plannerRecipeSelect.addEventListener("change", (e) => {
      if (e.target.value === "custom") {
        if (elements.plannerCustomInputGroup) elements.plannerCustomInputGroup.classList.remove("hidden");
        if (elements.plannerCustomName) {
          elements.plannerCustomName.required = true;
          elements.plannerCustomName.focus();
        }
      } else {
        if (elements.plannerCustomInputGroup) elements.plannerCustomInputGroup.classList.add("hidden");
        if (elements.plannerCustomName) {
          elements.plannerCustomName.required = false;
          elements.plannerCustomName.value = "";
        }
      }
    });
  }

  if (elements.plannerAddForm) {
    elements.plannerAddForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const recipeId = elements.plannerAddRecipeId.value;
      
      // Temporarily enable elements to make sure value is read (though JS reads it anyway)
      if (elements.plannerDaySelect) elements.plannerDaySelect.disabled = false;
      if (elements.plannerSlotSelect) elements.plannerSlotSelect.disabled = false;
      
      const day = elements.plannerDaySelect.value;
      const slot = elements.plannerSlotSelect.value;
      
      if (recipeId) {
        // Adding from recipe details view
        if (day && slot) {
          store.addMealToPlan(day, slot, recipeId);
        }
      } else {
        // Adding from calendar slot view
        const selectVal = elements.plannerRecipeSelect.value;
        if (selectVal === "custom") {
          const customName = elements.plannerCustomName.value.trim();
          if (customName && day && slot) {
            store.addMealToPlan(day, slot, "custom", customName);
          }
        } else if (selectVal && day && slot) {
          store.addMealToPlan(day, slot, selectVal);
        }
      }
      
      closeModal(elements.mealPlannerAddModal);
      elements.plannerAddForm.reset();
      if (elements.plannerCustomInputGroup) elements.plannerCustomInputGroup.classList.add("hidden");
    });
  }

  if (elements.mealPlannerCalendar) {
    elements.mealPlannerCalendar.addEventListener("click", (e) => {
      // Handle meal deletion
      const removeBtn = e.target.closest(".btn-remove-meal");
      if (removeBtn) {
        const day = removeBtn.getAttribute("data-day");
        const slot = removeBtn.getAttribute("data-slot");
        if (day && slot) {
          store.removeMealFromPlan(day, slot);
        }
        return;
      }

      // Handle clicking empty slot to add meal
      const addBtn = e.target.closest(".btn-add-slot-meal");
      if (addBtn) {
        const day = addBtn.getAttribute("data-day");
        const slot = addBtn.getAttribute("data-slot");
        if (day && slot) {
          openMealPlannerModal(null, day, slot);
        }
        return;
      }
      
      // Handle clicking planned meal card to open recipe detail modal
      const card = e.target.closest(".meal-slot-card.filled");
      if (card && !e.target.closest("button")) {
        const id = card.getAttribute("data-id");
        if (id && !id.startsWith("custom_")) {
          store.setSelectedRecipe(id);
          openModal(elements.recipeDetailModal);
        }
      }
    });
  }

  if (elements.btnClearPlanner) {
    elements.btnClearPlanner.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your weekly meal plan?")) {
        store.clearMealPlan();
      }
    });
  }

  if (elements.btnPlannerToGrocery) {
    elements.btnPlannerToGrocery.addEventListener("click", () => {
      let addedAny = false;
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const slots = ["breakfast", "lunch", "dinner"];
      
      days.forEach(day => {
        const plannedMeals = store.state.mealPlan[day];
        if (plannedMeals) {
          slots.forEach(slot => {
            const meal = plannedMeals[slot];
            if (meal && meal.ingredients) {
              store.addMultipleIngredientsToShoppingList(meal.ingredients, `${meal.title} (${day} ${slot})`);
              addedAny = true;
            }
          });
        }
      });
      
      if (addedAny) {
        // Visual Bouncy Feedback on Cart Badge
        elements.cartBadgeCount.classList.add("pulse-badge");
        setTimeout(() => elements.cartBadgeCount.classList.remove("pulse-badge"), 500);

        // Show quick success visual feedback on the button
        const originalHtml = elements.btnPlannerToGrocery.innerHTML;
        elements.btnPlannerToGrocery.innerHTML = "Ingredients Added!";
        elements.btnPlannerToGrocery.style.backgroundColor = "var(--color-success)";
        elements.btnPlannerToGrocery.style.color = "var(--bg-primary)";
        setTimeout(() => {
          elements.btnPlannerToGrocery.innerHTML = originalHtml;
          elements.btnPlannerToGrocery.style.backgroundColor = "";
          elements.btnPlannerToGrocery.style.color = "";
        }, 1500);
      } else {
        alert("Your weekly meal plan is currently empty! Add recipes to it first.");
      }
    });
  }

  // Bind new interactive premium features (Audio, Timers, Story Exporter, Cook Mode, Slider)
  bindPremiumFeatures();
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

function setAuthModalMode(mode) {
  authModalMode = mode;
  if (!elements.loginModal) return;

  // Clear errors
  if (elements.loginErrorMsg) {
    elements.loginErrorMsg.classList.add("hidden");
    elements.loginErrorMsg.innerText = "";
  }

  if (mode === "login") {
    if (elements.loginModalTitle) elements.loginModalTitle.innerText = "Welcome Back";
    if (elements.loginModalSubtitle) elements.loginModalSubtitle.innerText = "Login to sync your custom recipes, shopping lists, and meal plans.";
    if (elements.btnLoginSubmit) elements.btnLoginSubmit.innerText = "Log In";
    const promptEl = document.getElementById("login-toggle-prompt");
    if (promptEl) {
      promptEl.innerHTML = `Don't have a chef profile? <a href="#" id="link-toggle-register" style="font-weight:700; color: var(--accent-primary);">Sign Up</a>`;
    }
  } else {
    if (elements.loginModalTitle) elements.loginModalTitle.innerText = "Register Chef Profile";
    if (elements.loginModalSubtitle) elements.loginModalSubtitle.innerText = "Create a new chef profile to save recipes and plan your meals.";
    if (elements.btnLoginSubmit) elements.btnLoginSubmit.innerText = "Sign Up / Register";
    const promptEl = document.getElementById("login-toggle-prompt");
    if (promptEl) {
      promptEl.innerHTML = `Already have a chef profile? <a href="#" id="link-toggle-register" style="font-weight:700; color: var(--accent-primary);">Log In</a>`;
    }
  }

  // Bind the toggle link click event dynamically
  const toggleLink = document.getElementById("link-toggle-register");
  if (toggleLink) {
    toggleLink.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthModalMode(authModalMode === "login" ? "register" : "login");
    });
  }
}

function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Calculate difference to Monday. Monday is day 1, Sunday is day 7 or 0.
  // If it's Sunday (0), distance to Monday is -6. Otherwise, 1 - currentDay.
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekDates = {};
  
  days.forEach((dayName, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const dateNum = d.getDate();
    const isToday = d.toDateString() === today.toDateString();
    
    weekDates[dayName] = {
      label: `${month} ${dateNum}`,
      isToday: isToday
    };
  });
  
  return weekDates;
}

function openMealPlannerModal(recipeId = null, preSelectedDay = null, preSelectedSlot = null) {
  const allRecipes = store.state.recipes;

  if (recipeId) {
    // Adding from Recipe Detail modal
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    if (elements.plannerAddRecipeId) elements.plannerAddRecipeId.value = recipe.id;
    if (elements.plannerAddInstructions) {
      elements.plannerAddInstructions.innerHTML = `Select the day and time slot to add <strong>${escapeHtml(recipe.title)}</strong> to your plan.`;
    }

    // Hide dropdown select, hide custom input
    if (elements.plannerRecipeSelect) elements.plannerRecipeSelect.parentElement.classList.add("hidden");
    if (elements.plannerCustomInputGroup) elements.plannerCustomInputGroup.classList.add("hidden");

    // Enable day/slot
    if (elements.plannerDaySelect) {
      elements.plannerDaySelect.disabled = false;
      if (preSelectedDay) elements.plannerDaySelect.value = preSelectedDay;
    }
    if (elements.plannerSlotSelect) {
      elements.plannerSlotSelect.disabled = false;
      if (preSelectedSlot) elements.plannerSlotSelect.value = preSelectedSlot;
    }
  } else {
    // Adding from Calendar cell directly
    if (elements.plannerAddRecipeId) elements.plannerAddRecipeId.value = "";
    if (elements.plannerAddInstructions) {
      elements.plannerAddInstructions.innerHTML = "Select a recipe or input a custom meal name to add to your plan.";
    }

    // Show dropdown select
    if (elements.plannerRecipeSelect) {
      elements.plannerRecipeSelect.parentElement.classList.remove("hidden");
      
      let optionsHtml = `
        <option value="" disabled selected>-- Select a Recipe --</option>
        <option value="custom">* Type Custom Meal Name...</option>
      `;

      optionsHtml += allRecipes.map(r => `
        <option value="${r.id}">${escapeHtml(r.title)} (${escapeHtml(r.category)})</option>
      `).join("");

      elements.plannerRecipeSelect.innerHTML = optionsHtml;
    }

    if (elements.plannerCustomInputGroup) elements.plannerCustomInputGroup.classList.add("hidden");
    if (elements.plannerCustomName) elements.plannerCustomName.value = "";

    // Lock selected Day and Slot
    if (elements.plannerDaySelect) {
      if (preSelectedDay) elements.plannerDaySelect.value = preSelectedDay;
      elements.plannerDaySelect.disabled = true;
    }
    if (elements.plannerSlotSelect) {
      if (preSelectedSlot) elements.plannerSlotSelect.value = preSelectedSlot;
      elements.plannerSlotSelect.disabled = true;
    }
  }

  openModal(elements.mealPlannerAddModal);
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
  // -1. Render User Authentication state
  if (state.currentUser) {
    if (elements.headerUserAvatar) elements.headerUserAvatar.innerText = state.currentUser.username[0].toUpperCase();
    if (elements.headerUserName) elements.headerUserName.innerText = state.currentUser.username;
    if (elements.dropdownUsername) elements.dropdownUsername.innerText = state.currentUser.username;
    if (elements.btnDropdownLogin) elements.btnDropdownLogin.classList.add("hidden");
    if (elements.btnDropdownLogout) elements.btnDropdownLogout.classList.remove("hidden");
  } else {
    if (elements.headerUserAvatar) elements.headerUserAvatar.innerText = "G";
    if (elements.headerUserName) elements.headerUserName.innerText = "Login";
    if (elements.dropdownUsername) elements.dropdownUsername.innerText = "Guest Chef";
    if (elements.btnDropdownLogin) elements.btnDropdownLogin.classList.remove("hidden");
    if (elements.btnDropdownLogout) elements.btnDropdownLogout.classList.add("hidden");
  }

  // 0. Toggle active tab visual styling and sections
  const listAnchor = document.getElementById("recipes-list-anchor");
  const mealPlannerView = document.getElementById("meal-planner-view");

  if (state.activeTab === "home") {
    if (elements.btnShowHome) elements.btnShowHome.classList.add("active");
    if (elements.btnShowMyRecipes) elements.btnShowMyRecipes.classList.remove("active");
    if (elements.btnShowPlanner) elements.btnShowPlanner.classList.remove("active");
    if (elements.heroBanner) elements.heroBanner.classList.remove("hidden");
    if (elements.heroSection) elements.heroSection.classList.remove("hidden");
    if (listAnchor) listAnchor.classList.remove("hidden");
    if (mealPlannerView) mealPlannerView.classList.add("hidden");
    if (elements.resultsHeading) elements.resultsHeading.innerHTML = "Top List &ndash; Our mainstay menu";
  } else if (state.activeTab === "my-recipes") {
    if (elements.btnShowHome) elements.btnShowHome.classList.remove("active");
    if (elements.btnShowMyRecipes) elements.btnShowMyRecipes.classList.add("active");
    if (elements.btnShowPlanner) elements.btnShowPlanner.classList.remove("active");
    if (elements.heroBanner) elements.heroBanner.classList.add("hidden");
    if (elements.heroSection) elements.heroSection.classList.add("hidden");
    if (listAnchor) listAnchor.classList.remove("hidden");
    if (mealPlannerView) mealPlannerView.classList.add("hidden");
    if (elements.resultsHeading) elements.resultsHeading.innerHTML = "My Saved Recipes";
  } else if (state.activeTab === "meal-planner") {
    if (elements.btnShowHome) elements.btnShowHome.classList.remove("active");
    if (elements.btnShowMyRecipes) elements.btnShowMyRecipes.classList.remove("active");
    if (elements.btnShowPlanner) elements.btnShowPlanner.classList.add("active");
    if (elements.heroBanner) elements.heroBanner.classList.add("hidden");
    if (elements.heroSection) elements.heroSection.classList.add("hidden");
    if (listAnchor) listAnchor.classList.add("hidden");
    if (mealPlannerView) mealPlannerView.classList.remove("hidden");
  }

  // Visual Recipe Box / Mood Boards Filter rendering
  const moodBoardsPanel = elements.moodBoardsPanel;
  if (moodBoardsPanel) {
    if (state.activeTab === "my-recipes") {
      moodBoardsPanel.classList.remove("hidden");
      const categories = ["All", "Mains", "Salad", "Baking", "Soup", "Breakfast"];
      elements.boardsChipsContainer.innerHTML = categories.map(cat => {
        const isActive = state.activeBoard === cat;
        return `<button class="board-chip ${isActive ? 'active' : ''}" data-board="${cat}">${escapeHtml(cat)}</button>`;
      }).join("");
    } else {
      moodBoardsPanel.classList.add("hidden");
    }
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
    elements.recipesGrid.className = "recipes-grid";
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
    if (state.activeTab === "home") {
      elements.recipesGrid.className = "carousel-wrapper";
      elements.recipesGrid.innerHTML = `
        <button class="carousel-nav-btn prev" id="carousel-prev" aria-label="Previous Recipes">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="carousel-track-container">
          <div class="carousel-track" id="carousel-track">
            ${filteredRecipes.map(recipe => 
              renderRecipeCard(recipe, state.myRecipes.some(mr => mr.id === recipe.id), state.activeTab)
            ).join("")}
          </div>
        </div>
        <button class="carousel-nav-btn next" id="carousel-next" aria-label="Next Recipes">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      `;
      bindCarouselEvents();
    } else {
      elements.recipesGrid.className = "recipes-grid";
      elements.recipesGrid.innerHTML = filteredRecipes.map(recipe => 
        renderRecipeCard(recipe, state.myRecipes.some(mr => mr.id === recipe.id), state.activeTab)
      ).join("");
    }
  }

  // 3. Render Shopping Cart Drawer & Badge Count
  renderShoppingList(state.shoppingList);
  
  // 3.5. Render Meal Planner Calendar
  if (state.activeTab === "meal-planner") {
    const calendarEl = document.getElementById("meal-planner-calendar");
    if (calendarEl) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const slots = ["breakfast", "lunch", "dinner"];
      const weekDates = getWeekDates();
      
      calendarEl.innerHTML = days.map(day => {
        const plannedMeals = state.mealPlan[day] || { breakfast: null, lunch: null, dinner: null };
        const dayInfo = weekDates[day] || { label: "", isToday: false };
        
        const slotsHtml = slots.map(slot => {
          const meal = plannedMeals[slot];
          if (meal) {
            const metaText = meal.isCustom 
              ? `<span class="meal-recipe-meta" style="color: var(--accent-primary); font-weight: 700;">Custom Meal</span>`
              : `<span class="meal-recipe-meta">${meal.prepTime + meal.cookTime} mins | ${meal.difficulty}</span>`;
              
            return `
              <div class="planner-meal-slot">
                <span class="meal-slot-label">${slot}</span>
                <div class="meal-slot-card filled" data-id="${meal.id}" data-day="${day}" data-slot="${slot}">
                  <button class="btn-remove-meal" data-day="${day}" data-slot="${slot}" title="Remove from plan">&times;</button>
                  <h5 class="meal-recipe-title">${escapeHtml(meal.title)}</h5>
                  ${metaText}
                </div>
              </div>
            `;
          } else {
            return `
              <div class="planner-meal-slot">
                <span class="meal-slot-label">${slot}</span>
                <button class="meal-slot-card empty btn-add-slot-meal" data-day="${day}" data-slot="${slot}" title="Add meal to ${day} ${slot}">
                  <span class="meal-slot-empty">+ Plan ${slot}</span>
                </button>
              </div>
            `;
          }
        }).join("");

        const todayClass = dayInfo.isToday ? "today-column" : "";
        const todayBadge = dayInfo.isToday ? `<span class="today-badge">Today</span>` : "";

        return `
          <div class="planner-day-column ${todayClass}">
            <h4 class="day-name-heading">
              ${day}
              <span class="day-date-label">${dayInfo.label}</span>
              ${todayBadge}
            </h4>
            ${slotsHtml}
          </div>
        `;
      }).join("");
    }
  }
  
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
  if (elements.generatorFailureState) {
    elements.generatorFailureState.classList.add("hidden");
  }
  
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
      if (!generatedRecipe) {
        elements.generatorLoadingState.classList.add("hidden");
        elements.generatorSuccessState.classList.add("hidden");
        if (elements.generatorFailureState) {
          elements.generatorFailureState.classList.remove("hidden");
          elements.generatorFailureMessage.innerText = `We couldn't find a verified recipe for "${query}" online.`;
          elements.btnSearchExternalLink.href = `https://www.google.com/search?q=${encodeURIComponent(query)}+recipe`;
        }
        return;
      }
      elements.generatorLoadingState.classList.add("hidden");
      elements.generatorSuccessState.classList.remove("hidden");
      if (elements.generatorFailureState) {
        elements.generatorFailureState.classList.add("hidden");
      }
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
  if (elements.generatorFailureState) {
    elements.generatorFailureState.classList.add("hidden");
  }
  if (elements.generatorFailureImportUrl) {
    elements.generatorFailureImportUrl.value = "";
  }
  resetGeneratorStepsUI();
}

/* ==========================================================================
   CAROUSEL/SLIDING VIEW EVENT BINDINGS
   ========================================================================== */

function bindCarouselEvents() {
  const track = document.getElementById("carousel-track");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  
  if (!track || !prevBtn || !nextBtn) return;
  
  const updateButtons = () => {
    // Disable prev button if scrolled to the left
    if (track.scrollLeft <= 5) {
      prevBtn.classList.add("disabled");
    } else {
      prevBtn.classList.remove("disabled");
    }
    
    // Disable next button if scrolled to the right end
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 5) {
      nextBtn.classList.add("disabled");
    } else {
      nextBtn.classList.remove("disabled");
    }
  };
  
  prevBtn.addEventListener("click", () => {
    const cardWidth = track.querySelector(".recipe-card")?.clientWidth || 320;
    track.scrollBy({ left: -(cardWidth + 30), behavior: "smooth" });
    setTimeout(updateButtons, 350);
  });
  
  nextBtn.addEventListener("click", () => {
    const cardWidth = track.querySelector(".recipe-card")?.clientWidth || 320;
    track.scrollBy({ left: cardWidth + 30, behavior: "smooth" });
    setTimeout(updateButtons, 350);
  });
  
  track.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);
  
  // Initial check
  updateButtons();
}

// ==========================================================================
// PREMIUM INTERACTIVE WIDGETS LOGIC
// ==========================================================================

// Local variables for Cook Mode & Timers
let cookModeActiveRecipe = null;
let cookModeCurrentStep = 0;
let wakeLockNode = null;
let timerInterval = null;
let timerSeconds = 0;
let timerOriginalSeconds = 0;
let timerIsPaused = false;

function bindPremiumFeatures() {
  // 1. Mood Theme Selector
  if (elements.themeMoodSelect) {
    const savedMood = localStorage.getItem("cookbook_theme_mood") || "cozy-cream";
    document.body.className = "theme-" + savedMood;
    elements.themeMoodSelect.value = savedMood;
    
    elements.themeMoodSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      document.body.className = "theme-" + selected;
      localStorage.setItem("cookbook_theme_mood", selected);
    });
  }

  // 2. Yield Slider Input delegation inside modal
  elements.modalRecipeContent.addEventListener("input", (e) => {
    const slider = e.target.closest(".servings-slider");
    if (slider) {
      const val = parseInt(slider.value, 10);
      const recipeId = slider.getAttribute("data-recipe-id");
      store.setServings(recipeId, val);
      // Immediately reflect servings number on standard display
      const servingsDisplay = elements.modalRecipeContent.querySelector(".servings-display");
      if (servingsDisplay) servingsDisplay.innerText = val;
    }
  });

  // 3. Ambient Audio Toggle delegation
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const audioBtn = e.target.closest("#ambient-audio-toggle");
    if (audioBtn) {
      const isPlaying = store.state.ambientAudioPlaying;
      if (isPlaying) {
        stopAmbientAudio();
        store.setAmbientAudioPlaying(false);
      } else {
        startAmbientAudio();
        store.setAmbientAudioPlaying(true);
      }
    }
  });

  // 4. Ingredient Substitutions Popover delegation
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const trigger = e.target.closest(".ingredient-sub-trigger");
    if (trigger) {
      e.stopPropagation();
      dismissSubPopover();
      
      const key = trigger.getAttribute("data-ing-key");
      const subText = INGREDIENT_SUBSTITUTIONS[key];
      if (!subText) return;
      
      // Create popover element
      const popover = document.createElement("div");
      popover.className = "substitute-popover";
      popover.id = "active-sub-popover";
      popover.innerHTML = `
        <div class="popover-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon" style="width:12px;height:12px;color:var(--accent-primary);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <span>Substitutions</span>
        </div>
        <div class="popover-body">${escapeHtml(subText)}</div>
      `;
      
      document.body.appendChild(popover);
      
      // Position popover relative to trigger
      const rect = trigger.getBoundingClientRect();
      
      // Position below the element, centered
      popover.style.left = `${window.scrollX + rect.left + rect.width/2 - 125}px`;
      popover.style.top = `${window.scrollY + rect.bottom + 8}px`;
    }
  });

  // Close Popovers on clicking anywhere else
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".substitute-popover") && !e.target.closest(".ingredient-sub-trigger")) {
      dismissSubPopover();
    }
  });

  // 5. Cook Mode activation
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const startCookBtn = e.target.closest(".btn-start-cook-mode");
    if (startCookBtn) {
      const activeRecipe = store.state.recipes.find(r => r.id === store.state.selectedRecipeId);
      if (activeRecipe) {
        startCookMode(activeRecipe);
      }
    }
  });

  // Cook Mode controls
  if (elements.btnCloseCookMode) {
    elements.btnCloseCookMode.addEventListener("click", stopCookMode);
  }
  if (elements.btnCookPrev) {
    elements.btnCookPrev.addEventListener("click", () => navigateCookStep(-1));
  }
  if (elements.btnCookNext) {
    elements.btnCookNext.addEventListener("click", () => navigateCookStep(1));
  }

  // 6. Inline Instruction Timers delegation
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const timerBadge = e.target.closest(".step-timer-badge");
    if (timerBadge) {
      const mins = parseInt(timerBadge.getAttribute("data-minutes"), 10);
      startKitchenTimer(mins);
    }
  });

  // Timer Bar controls
  if (elements.btnTimerToggle) {
    elements.btnTimerToggle.addEventListener("click", toggleKitchenTimer);
  }
  if (elements.btnTimerReset) {
    elements.btnTimerReset.addEventListener("click", resetKitchenTimer);
  }
  if (elements.btnTimerClose) {
    elements.btnTimerClose.addEventListener("click", closeKitchenTimer);
  }

  // 7. Story Share Exporter
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const shareBtn = e.target.closest("#btn-story-share");
    if (shareBtn) {
      const activeRecipe = store.state.recipes.find(r => r.id === store.state.selectedRecipeId);
      if (activeRecipe) {
        openStoryExporter(activeRecipe);
      }
    }
  });
  if (elements.storyCloseBtn) {
    elements.storyCloseBtn.addEventListener("click", () => closeModal(elements.storyExporterModal));
  }
  if (elements.btnCopyStoryTip) {
    elements.btnCopyStoryTip.addEventListener("click", () => {
      const btn = elements.btnCopyStoryTip;
      const originalText = btn.innerText;
      btn.innerText = "Copied!";
      setTimeout(() => btn.innerText = originalText, 1500);
    });
  }

  // 9. Enter Edit Mode click delegation
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const editBtn = e.target.closest("#btn-recipe-edit");
    if (editBtn) {
      const activeRecipe = store.state.recipes.find(r => r.id === store.state.selectedRecipeId);
      if (activeRecipe) {
        // Render edit form inside modal content
        elements.modalRecipeContent.innerHTML = renderRecipeEditForm(activeRecipe);
      }
    }
  });

  // 10. Cancel Edit Mode
  elements.modalRecipeContent.addEventListener("click", (e) => {
    const cancelBtn = e.target.closest("#btn-edit-cancel");
    if (cancelBtn) {
      e.preventDefault();
      const activeRecipe = store.state.recipes.find(r => r.id === store.state.selectedRecipeId);
      if (activeRecipe) {
        elements.modalRecipeContent.innerHTML = renderRecipeDetail(activeRecipe, store.state);
      }
    }
  });

  // 11. Add/Remove items inside Edit Form (delegation)
  elements.modalRecipeContent.addEventListener("click", (e) => {
    // Add Ingredient
    if (e.target.closest("#btn-add-edit-ing")) {
      e.preventDefault();
      const list = document.getElementById("edit-ingredients-list");
      if (list) {
        const nextIndex = list.children.length;
        const row = document.createElement("div");
        row.className = "edit-ing-row";
        row.setAttribute("data-index", nextIndex);
        row.innerHTML = `
          <input type="number" step="any" class="edit-ing-qty" value="1" placeholder="Qty" style="width: 70px;">
          <input type="text" class="edit-ing-unit" value="pc" placeholder="Unit" style="width: 70px;">
          <input type="text" class="edit-ing-name" value="" placeholder="Ingredient Name" style="flex: 1;">
          <select class="edit-ing-cat" style="width: 100px;">
            <option value="Pantry">Pantry</option>
            <option value="Produce">Produce</option>
            <option value="Dairy">Dairy</option>
            <option value="Meat">Meat</option>
            <option value="Seafood">Seafood</option>
          </select>
          <button type="button" class="btn-remove-edit-ing" title="Remove Ingredient" aria-label="Remove Ingredient">
            ${ICONS.trash}
          </button>
        `;
        list.appendChild(row);
      }
    }

    // Remove Ingredient
    const removeIngBtn = e.target.closest(".btn-remove-edit-ing");
    if (removeIngBtn) {
      e.preventDefault();
      removeIngBtn.closest(".edit-ing-row").remove();
      // Re-index remaining rows
      const list = document.getElementById("edit-ingredients-list");
      if (list) {
        Array.from(list.children).forEach((row, idx) => row.setAttribute("data-index", idx));
      }
    }

    // Add Gear
    if (e.target.closest("#btn-add-edit-gear")) {
      e.preventDefault();
      const list = document.getElementById("edit-gear-list");
      if (list) {
        const nextIndex = list.children.length;
        const gearIcons = ["pot", "pan", "bowl", "sheet", "paper", "knife", "spoon", "tongs", "cutter", "rollingPin", "spatula", "scoop", "rack", "board", "brush", "cooking"];
        const iconOptions = gearIcons.map(iconName => `<option value="${iconName}">${iconName}</option>`).join("");
        const row = document.createElement("div");
        row.className = "edit-gear-row";
        row.setAttribute("data-index", nextIndex);
        row.innerHTML = `
          <input type="text" class="edit-gear-name" value="" placeholder="Gear Name" style="flex: 1;">
          <select class="edit-gear-icon" style="width: 100px;">
            ${iconOptions}
          </select>
          <button type="button" class="btn-remove-edit-gear" title="Remove Gear" aria-label="Remove Gear">
            ${ICONS.trash}
          </button>
        `;
        list.appendChild(row);
      }
    }

    // Remove Gear
    const removeGearBtn = e.target.closest(".btn-remove-edit-gear");
    if (removeGearBtn) {
      e.preventDefault();
      removeGearBtn.closest(".edit-gear-row").remove();
      const list = document.getElementById("edit-gear-list");
      if (list) {
        Array.from(list.children).forEach((row, idx) => row.setAttribute("data-index", idx));
      }
    }

    // Add Step
    if (e.target.closest("#btn-add-edit-step")) {
      e.preventDefault();
      const list = document.getElementById("edit-steps-list");
      if (list) {
        const nextIndex = list.children.length;
        const row = document.createElement("div");
        row.className = "edit-step-row";
        row.setAttribute("data-index", nextIndex);
        row.innerHTML = `
          <div class="edit-step-header">
            <span class="edit-step-number">Step ${nextIndex + 1}</span>
            <button type="button" class="btn-remove-edit-step" title="Remove Step" aria-label="Remove Step">
              ${ICONS.trash}
            </button>
          </div>
          <textarea class="edit-step-text" placeholder="Instructions step description..." rows="2" style="width: 100%; margin-bottom: 8px;"></textarea>
          <input type="text" class="edit-step-tip" value="" placeholder="Chef's Tip (Optional)" style="width: 100%;">
        `;
        list.appendChild(row);
      }
    }

    // Remove Step
    const removeStepBtn = e.target.closest(".btn-remove-edit-step");
    if (removeStepBtn) {
      e.preventDefault();
      removeStepBtn.closest(".edit-step-row").remove();
      const list = document.getElementById("edit-steps-list");
      if (list) {
        Array.from(list.children).forEach((row, idx) => {
          row.setAttribute("data-index", idx);
          row.querySelector(".edit-step-number").innerText = `Step ${idx + 1}`;
        });
      }
    }
  });

  // 12. Save Edit Form submit handler
  elements.modalRecipeContent.addEventListener("submit", (e) => {
    const form = e.target.closest("#recipe-edit-form");
    if (form) {
      e.preventDefault();
      const recipeId = form.getAttribute("data-recipe-id");
      
      // Parse core fields
      const title = document.getElementById("edit-title").value.trim();
      const category = document.getElementById("edit-category").value;
      const image = document.getElementById("edit-image").value.trim();
      const description = document.getElementById("edit-description").value.trim();
      const prepTime = parseInt(document.getElementById("edit-prep-time").value, 10) || 0;
      const cookTime = parseInt(document.getElementById("edit-cook-time").value, 10) || 0;
      const servings = parseInt(document.getElementById("edit-servings").value, 10) || 1;
      const difficulty = document.getElementById("edit-difficulty").value;

      // Parse ingredients
      const ingredients = [];
      const ingRows = form.querySelectorAll(".edit-ing-row");
      ingRows.forEach(row => {
        const qty = parseFloat(row.querySelector(".edit-ing-qty").value) || 0;
        const unit = row.querySelector(".edit-ing-unit").value.trim();
        const name = row.querySelector(".edit-ing-name").value.trim();
        const cat = row.querySelector(".edit-ing-cat").value;
        if (name) {
          ingredients.push({ quantity: qty, unit, name, category: cat });
        }
      });

      // Parse gear
      const equipment = [];
      const seenGear = new Set();
      const gearRows = form.querySelectorAll(".edit-gear-row");
      gearRows.forEach(row => {
        const name = row.querySelector(".edit-gear-name").value.trim();
        const icon = row.querySelector(".edit-gear-icon").value;
        if (name) {
          const lowerName = name.toLowerCase();
          if (!seenGear.has(lowerName)) {
            seenGear.add(lowerName);
            equipment.push({ name, icon });
          }
        }
      });

      // Parse steps
      const instructions = [];
      const stepRows = form.querySelectorAll(".edit-step-row");
      stepRows.forEach((row, idx) => {
        const text = row.querySelector(".edit-step-text").value.trim();
        const tip = row.querySelector(".edit-step-tip").value.trim();
        if (text) {
          instructions.push({ step: idx + 1, text, tip: tip || null });
        }
      });

      // Retrieve source settings from existing recipe copy
      const oldRecipe = store.state.recipes.find(r => r.id === recipeId);
      const tags = oldRecipe ? oldRecipe.tags : ["Imported"];
      const sourceUrl = oldRecipe ? oldRecipe.sourceUrl : null;
      const sourceName = oldRecipe ? oldRecipe.sourceName : null;

      const updatedRecipe = {
        id: recipeId,
        title,
        category,
        image,
        description,
        prepTime,
        cookTime,
        servings,
        difficulty,
        tags,
        sourceUrl,
        sourceName,
        ingredients,
        equipment,
        instructions
      };

      // Update in store
      store.updateRecipe(recipeId, updatedRecipe);

      // Render updated details view
      elements.modalRecipeContent.innerHTML = renderRecipeDetail(updatedRecipe, store.state);
    }
  });

  // 8. Mood Board filters
  elements.boardsChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".board-chip");
    if (chip) {
      const board = chip.getAttribute("data-board");
      store.setActiveBoard(board);
    }
  });
}

function dismissSubPopover() {
  const existing = document.getElementById("active-sub-popover");
  if (existing) existing.remove();
}

// ==========================================================================
// COOK MODE VIEW ENGINE
// ==========================================================================
async function startCookMode(recipe) {
  cookModeActiveRecipe = recipe;
  cookModeCurrentStep = 0;
  
  elements.cookModeRecipeTitle.innerText = recipe.title;
  updateCookModeStepUI();
  
  openModal(elements.cookModeOverlay);
  
  // Request screen wake lock to prevent dimming
  try {
    if ('wakeLock' in navigator) {
      wakeLockNode = await navigator.wakeLock.request('screen');
      elements.wakeLockStatus.classList.add("active");
      elements.wakeLockStatus.querySelector(".wake-lock-text").innerText = "Keep Awake Active";
    }
  } catch (err) {
    console.warn("Wake lock failed:", err);
  }
}

function stopCookMode() {
  closeModal(elements.cookModeOverlay);
  cookModeActiveRecipe = null;
  
  // Release wake lock
  if (wakeLockNode) {
    wakeLockNode.release().then(() => {
      wakeLockNode = null;
      elements.wakeLockStatus.classList.remove("active");
      elements.wakeLockStatus.querySelector(".wake-lock-text").innerText = "Keep Awake";
    });
  }
}

function navigateCookStep(direction) {
  if (!cookModeActiveRecipe) return;
  const newStep = cookModeCurrentStep + direction;
  if (newStep >= 0 && newStep < cookModeActiveRecipe.instructions.length) {
    cookModeCurrentStep = newStep;
    updateCookModeStepUI();
  }
}

function updateCookModeStepUI() {
  const steps = cookModeActiveRecipe.instructions;
  const step = steps[cookModeCurrentStep];
  
  elements.cookModeStepIndicator.innerText = `Step ${step.step} of ${steps.length}`;
  
  // Progress bar
  const percent = ((cookModeCurrentStep + 1) / steps.length) * 100;
  elements.cookModeProgressFill.style.width = `${percent}%`;
  
  // Large text (parse timers inside as well!)
  const formattedText = formatStepTextWithTimersForCookMode(escapeHtml(step.text));
  elements.cookModeStepText.innerHTML = formattedText;
  
  // Tip box
  if (step.tip) {
    elements.cookModeTipText.innerText = step.tip;
    elements.cookModeTipBox.classList.remove("hidden");
  } else {
    elements.cookModeTipBox.classList.add("hidden");
  }
  
  // Enable/Disable buttons
  elements.btnCookPrev.disabled = cookModeCurrentStep === 0;
  
  if (cookModeCurrentStep === steps.length - 1) {
    elements.btnCookNext.querySelector("span").innerText = "Finish Cooking";
  } else {
    elements.btnCookNext.querySelector("span").innerText = "Next Step";
  }
  
  // If next is clicked on the final step, close cook mode
  elements.btnCookNext.onclick = () => {
    if (cookModeCurrentStep === steps.length - 1) {
      stopCookMode();
    } else {
      navigateCookStep(1);
    }
  };
}

function formatStepTextWithTimersForCookMode(text) {
  const regex = /(\d+)(?:-(\d+))?\s*(?:minutes|minute|min)/gi;
  return text.replace(regex, (match, p1, p2) => {
    const mins = p2 ? parseInt(p2, 10) : parseInt(p1, 10);
    return `<button class="step-timer-badge cook-mode-timer-badge" data-minutes="${mins}">${ICONS.clock} <span>${match}</span></button>`;
  });
}

// Handle cook mode timer badges (via click listener on cook mode content)
document.addEventListener("click", (e) => {
  const badge = e.target.closest(".cook-mode-timer-badge");
  if (badge) {
    const mins = parseInt(badge.getAttribute("data-minutes"), 10);
    startKitchenTimer(mins);
  }
});


// ==========================================================================
// FLOATING KITCHEN COUNTDOWN TIMER
// ==========================================================================
function startKitchenTimer(minutes) {
  clearInterval(timerInterval);
  timerSeconds = minutes * 60;
  timerOriginalSeconds = timerSeconds;
  timerIsPaused = false;
  
  elements.floatingTimerBar.classList.remove("hidden");
  elements.floatingTimerBar.classList.remove("alarm");
  elements.btnTimerToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
  
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    if (!timerIsPaused) {
      timerSeconds--;
      updateTimerDisplay();
      
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        triggerTimerAlarm();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  elements.timerBarDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleKitchenTimer() {
  timerIsPaused = !timerIsPaused;
  const toggleBtn = elements.btnTimerToggle;
  if (timerIsPaused) {
    toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    toggleBtn.title = "Resume Timer";
  } else {
    toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    toggleBtn.title = "Pause Timer";
  }
}

function resetKitchenTimer() {
  timerSeconds = timerOriginalSeconds;
  timerIsPaused = false;
  elements.floatingTimerBar.classList.remove("alarm");
  updateTimerDisplay();
  startKitchenTimer(timerOriginalSeconds / 60);
}

function closeKitchenTimer() {
  clearInterval(timerInterval);
  elements.floatingTimerBar.classList.add("hidden");
  elements.floatingTimerBar.classList.remove("alarm");
}

function triggerTimerAlarm() {
  elements.floatingTimerBar.classList.add("alarm");
  elements.timerBarDisplay.innerText = "Time's Up!";
  
  // Play Web Audio sound
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn("Alarm audio failed", e);
  }
}

// ==========================================================================
// INSTAGRAM STORY CARD EXPORTER (HTML5 Canvas + CORS Safety)
// ==========================================================================
function openStoryExporter(recipe) {
  openModal(elements.storyExporterModal);
  
  const canvas = elements.storyCanvas;
  const ctx = canvas.getContext("2d");
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. Draw Background Gradient matching selected mood
  const savedMood = localStorage.getItem("cookbook_theme_mood") || "cozy-cream";
  let colorStart = "#FAF5ED";
  let colorEnd = "#FFFDF9";
  let accentColor = "#E76F51";
  let textColor = "#3E2723";
  let tagColor = "#F3EBE0";
  
  if (savedMood === "spring-lavender") {
    colorStart = "#F3EEF5";
    colorEnd = "#FAF8FC";
    accentColor = "#8A70A4";
    textColor = "#3B2E42";
    tagColor = "#E8E0EC";
  } else if (savedMood === "fresh-sage") {
    colorStart = "#F0F4F1";
    colorEnd = "#F7FAF8";
    accentColor = "#528265";
    textColor = "#2A382E";
    tagColor = "#E1EBE4";
  } else if (savedMood === "sunset-terracotta") {
    colorStart = "#FAF2EC";
    colorEnd = "#FFFBF7";
    accentColor = "#D07B3A";
    textColor = "#4A2B15";
    tagColor = "#F3E4D8";
  }

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw Decorative elements
  ctx.fillStyle = accentColor;
  ctx.font = "800 48px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("THE DAILY DISH", canvas.width / 2, 140);
  
  ctx.fillStyle = textColor;
  ctx.font = "600 24px Outfit, sans-serif";
  ctx.fillText("AI Generated Cookbook & Meal Planner", canvas.width / 2, 190);
  
  // Divider
  ctx.strokeStyle = "rgba(62, 39, 35, 0.08)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 240);
  ctx.lineTo(canvas.width - 150, 240);
  ctx.stroke();

  // 3. Load photo
  const resolvedImage = recipe.image ? recipe.image : getGourmetFoodImage(recipe.title, recipe.category);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = resolvedImage;
  
  img.onload = () => {
    drawPlateAndInfo();
  };
  
  img.onerror = () => {
    drawPlateAndInfo(true);
  };

  function drawPlateAndInfo(useFallback = false) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 150;
    const r = 260;
    
    // Shadow
    ctx.shadowColor = "rgba(62, 39, 35, 0.12)";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 25;
    
    // Plate
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.strokeStyle = "rgba(62, 39, 35, 0.06)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    
    if (!useFallback) {
      const imgRatio = img.width / img.height;
      let dx = cx - r;
      let dy = cy - r;
      let dWidth = r * 2;
      let dHeight = r * 2;
      
      if (imgRatio > 1) {
        const w = (r * 2) * imgRatio;
        dx = cx - w / 2;
        dWidth = w;
      } else {
        const h = (r * 2) / imgRatio;
        dy = cy - h / 2;
        dHeight = h;
      }
      ctx.drawImage(img, dx, dy, dWidth, dHeight);
    } else {
      ctx.fillStyle = tagColor;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = accentColor;
      ctx.font = "800 64px serif";
      ctx.fillText("🍽️", cx, cy + 20);
    }
    
    const innerGrad = ctx.createRadialGradient(cx, cy, r - 50, cx, cy, r);
    innerGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    innerGrad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Text content
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + r + 80, 200, 44, 22);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px Outfit, sans-serif";
    ctx.fillText(recipe.category.toUpperCase(), cx, cy + r + 110);
    
    ctx.fillStyle = textColor;
    ctx.font = "800 64px Georgia, serif";
    
    const words = recipe.title.split(" ");
    let line = "";
    let lines = [];
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 200 && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    
    let titleY = cy + r + 200;
    lines.forEach(l => {
      ctx.fillText(l, cx, titleY);
      titleY += 75;
    });
    
    const totalTime = recipe.prepTime + recipe.cookTime;
    ctx.fillStyle = textColor;
    ctx.font = "700 32px Outfit, sans-serif";
    ctx.fillText(`${totalTime} min  |  ${recipe.difficulty}  |  ${recipe.servings} Servings`, cx, titleY + 30);
    
    ctx.strokeStyle = "rgba(62, 39, 35, 0.08)";
    ctx.beginPath();
    ctx.moveTo(250, canvas.height - 180);
    ctx.lineTo(canvas.width - 250, canvas.height - 180);
    ctx.stroke();
    
    ctx.fillStyle = textColor;
    ctx.font = "600 24px Outfit, sans-serif";
    ctx.fillText("Scan or click to cook this dish!", cx, canvas.height - 130);
    
    try {
      const dataUrl = canvas.toDataURL("image/png");
      elements.btnDownloadStory.href = dataUrl;
      elements.btnDownloadStory.download = `${recipe.title.toLowerCase().replace(/\s+/g, '-')}-story-card.png`;
    } catch (e) {
      console.warn("Canvas toDataURL failed", e);
    }
  }
}
