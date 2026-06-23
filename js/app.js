// Main Application Orchestrator for The Daily Dish

import { store } from "./store.js";
import { renderRecipeCard } from "./components/recipe-card.js";
import { renderRecipeDetail, handleDetailModalClick, INGREDIENT_SUBSTITUTIONS, renderRecipeEditForm } from "./components/recipe-detail.js";
import { renderShoppingList, exportShoppingList } from "./components/shopping-list.js";
import { simulateRecipeImport, parseSchemaIngredients } from "./components/importer.js?v=1.5";
import { generateRecipeOnSpot } from "./components/generator.js?v=1.5";
import { escapeHtml, ICONS, startAmbientAudio, stopAmbientAudio } from "./utils.js";
import { initRecipeChatbot } from "./components/recipe-chatbot.js?v=1.5";

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
  searchLinkImportBtn: document.getElementById("search-link-import-btn"),
  
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
  importerGeminiKeyConfigBtn: document.getElementById("btn-importer-config-key"),
  tiktokKeyFormGroup: document.getElementById("tiktok-key-form-group"),
  importerGeminiKeyInput: document.getElementById("importer-gemini-key-input"),
  btnSaveKeyAnalyze: document.getElementById("btn-save-key-analyze"),
  
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
  generatorConfirmationState: document.getElementById("generator-confirmation-state"),
  generatorConfirmTitlePreview: document.getElementById("generator-confirm-title-preview"),
  generatorConfirmDomainPreview: document.getElementById("generator-confirm-domain-preview"),
  btnGeneratorConfirmYes: document.getElementById("btn-generator-confirm-yes"),
  btnGeneratorConfirmNo: document.getElementById("btn-generator-confirm-no"),
  
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
  loginEmailGroup: document.getElementById("login-email-group"),
  loginEmailInput: document.getElementById("login-email-input"),
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
  plannerCustomName: document.getElementById("planner-custom-name"),
  btnPlannerToggleWeek: document.getElementById("btn-planner-toggle-week"),
  btnPlannerToggleMonth: document.getElementById("btn-planner-toggle-month"),
  btnPlannerPrev: document.getElementById("btn-planner-prev"),
  btnPlannerNext: document.getElementById("btn-planner-next"),
  plannerRangeLabel: document.getElementById("planner-range-label"),
  mealPlannerMonthView: document.getElementById("meal-planner-month-view"),
  monthGridHeader: document.getElementById("month-grid-header"),
  monthGridBody: document.getElementById("month-grid-body"),

  // Edit Profile
  btnDropdownEditProfile: document.getElementById("btn-dropdown-edit-profile"),
  editProfileModal: document.getElementById("edit-profile-modal"),
  editProfileCloseBtn: document.getElementById("edit-profile-close-btn"),
  editProfileForm: document.getElementById("edit-profile-form"),
  editProfileUsernameInput: document.getElementById("edit-profile-username-input"),
  editProfileBioInput: document.getElementById("edit-profile-bio-input"),
  editProfilePicInput: document.getElementById("edit-profile-pic-input"),
  editProfileCurrentPassword: document.getElementById("edit-profile-current-password"),
  editProfileErrorMsg: document.getElementById("edit-profile-error-msg"),
  editProfileSuccessMsg: document.getElementById("edit-profile-success-msg"),

  // Settings
  btnDropdownSettings: document.getElementById("btn-dropdown-settings"),
  settingsModal: document.getElementById("settings-modal"),
  settingsCloseBtn: document.getElementById("settings-close-btn"),
  settingsForm: document.getElementById("settings-form"),
  settingsWeekStartSelect: document.getElementById("settings-week-start"),
  settingsGeminiKeyInput: document.getElementById("settings-gemini-key"),
  settingsCurrentPasswordInput: document.getElementById("settings-current-password"),
  settingsNewPasswordInput: document.getElementById("settings-new-password"),
  settingsConfirmPasswordInput: document.getElementById("settings-confirm-password"),
  settingsErrorMsg: document.getElementById("settings-error-msg"),
  settingsSuccessMsg: document.getElementById("settings-success-msg"),

  // Admin Panel
  btnDropdownAdmin: document.getElementById("btn-dropdown-admin"),
  adminUsersList: document.getElementById("admin-users-list"),
  adminTotalUsers: document.getElementById("admin-total-users"),
  adminTotalRecipes: document.getElementById("admin-total-recipes"),
  adminTotalMeals: document.getElementById("admin-total-meals"),
  adminTotalIngredients: document.getElementById("admin-total-ingredients"),
  adminCategoriesBreakdown: document.getElementById("admin-categories-breakdown"),
  adminDifficultyBreakdown: document.getElementById("admin-difficulty-breakdown"),
  adminTopChefsList: document.getElementById("admin-top-chefs-list"),
  adminPanelErrorMsg: document.getElementById("admin-panel-error-msg"),
  adminPanelSuccessMsg: document.getElementById("admin-panel-success-msg"),

  // Password Recovery
  linkForgotPassword: document.getElementById("link-forgot-password"),
  loginResetSection: document.getElementById("login-reset-section"),
  loginResetForm: document.getElementById("login-reset-form"),
  loginResetUsername: document.getElementById("login-reset-username"),
  loginResetPassword: document.getElementById("login-reset-password"),
  btnLoginResetCancel: document.getElementById("btn-login-reset-cancel"),

  // Today Button
  btnPlannerToday: document.getElementById("btn-planner-today"),

  // Write Custom Recipe
  btnTabWrite: document.getElementById("btn-tab-write"),
  fabBtnCustom: document.getElementById("fab-btn-custom"),
  customRecipeModal: document.getElementById("custom-recipe-modal"),
  customRecipeCloseBtn: document.getElementById("custom-recipe-close-btn"),
  customRecipeForm: document.getElementById("custom-recipe-form"),
  customTitle: document.getElementById("custom-title"),
  customDesc: document.getElementById("custom-desc"),
  customPrep: document.getElementById("custom-prep"),
  customCook: document.getElementById("custom-cook"),
  customServings: document.getElementById("custom-servings"),
  customDifficulty: document.getElementById("custom-difficulty"),
  customCategory: document.getElementById("custom-category"),
  customImage: document.getElementById("custom-image"),
  customIngredients: document.getElementById("custom-ingredients"),
  customInstructions: document.getElementById("custom-instructions"),

  // Image Upload / Photo Scanner
  searchUploadBtn: document.getElementById("search-upload-btn"),
  imageUploadModal: document.getElementById("image-upload-modal"),
  imageUploadCloseBtn: document.getElementById("image-upload-close-btn"),
  imageUploadDropzone: document.getElementById("image-upload-dropzone"),
  imageUploadInput: document.getElementById("image-upload-input"),
  imageAnalysisArea: document.getElementById("image-analysis-area"),
  imageAnalysisPreview: document.getElementById("image-analysis-preview"),
  imageScanLaser: document.getElementById("image-scan-laser"),
  imageUploadStatusCard: document.getElementById("image-upload-status-card"),
  imageUploadStatusText: document.getElementById("image-upload-status-text"),
  btnStartAnalysis: document.getElementById("btn-start-analysis"),
  imageUploadSpinner: document.getElementById("image-upload-spinner"),
  imageUploadPromptCard: document.getElementById("image-upload-prompt-card"),
  imageUploadPromptText: document.getElementById("image-upload-prompt-text"),
  imageUploadDetectedName: document.getElementById("image-upload-detected-name"),
  btnProceedRecipe: document.getElementById("btn-proceed-recipe"),
  btnCancelProceed: document.getElementById("btn-cancel-proceed")
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

  /* --- 4b. Direct search link import button click --- */
  if (elements.searchLinkImportBtn) {
    elements.searchLinkImportBtn.addEventListener("click", () => {
      openModal(elements.importerModal);
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
    if (e.target === elements.editProfileModal) {
      closeModal(elements.editProfileModal);
      elements.editProfileForm.reset();
    }
    if (e.target === elements.customRecipeModal) {
      closeModal(elements.customRecipeModal);
      elements.customRecipeForm.reset();
    }
    if (e.target === elements.imageUploadModal) {
      closeModal(elements.imageUploadModal);
      resetImageUploadModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(elements.recipeDetailModal);
      closeModal(elements.importerModal);
      closeModal(elements.generatorModal);
      closeModal(elements.loginModal);
      closeModal(elements.mealPlannerAddModal);
      closeModal(elements.editProfileModal);
      closeModal(elements.customRecipeModal);
      closeModal(elements.imageUploadModal);
      resetImageUploadModal();
      if (elements.plannerAddForm) elements.plannerAddForm.reset();
      if (elements.editProfileForm) elements.editProfileForm.reset();
      if (elements.customRecipeForm) elements.customRecipeForm.reset();
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

  if (elements.importerGeminiKeyConfigBtn) {
    elements.importerGeminiKeyConfigBtn.addEventListener("click", () => {
      if (elements.tiktokKeyFormGroup) {
        elements.tiktokKeyFormGroup.classList.toggle("hidden");
        if (!elements.tiktokKeyFormGroup.classList.contains("hidden") && elements.importerGeminiKeyInput) {
          elements.importerGeminiKeyInput.value = localStorage.getItem("cookbook_gemini_api_key") || "";
          elements.importerGeminiKeyInput.focus();
        }
      }
    });
  }

  if (elements.btnSaveKeyAnalyze) {
    elements.btnSaveKeyAnalyze.addEventListener("click", () => {
      if (elements.importerGeminiKeyInput) {
        const key = elements.importerGeminiKeyInput.value.trim();
        if (!key) {
          alert("Please enter a valid Gemini API Key.");
          return;
        }
        localStorage.setItem("cookbook_gemini_api_key", key);
        if (elements.tiktokKeyFormGroup) {
          elements.tiktokKeyFormGroup.classList.add("hidden");
        }
        handleRecipeImport();
      }
    });
  }

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

  // Yes - confirm auto-searched recipe
  elements.btnGeneratorConfirmYes.addEventListener("click", () => {
    if (pendingGeneratedRecipe) {
      store.addRecipe(pendingGeneratedRecipe);
      
      elements.generatorConfirmationState.classList.add("hidden");
      elements.generatorSuccessState.classList.remove("hidden");
      elements.generatedRecipeTitlePreview.innerText = pendingGeneratedRecipe.title;
      
      pendingGeneratedRecipe = null;
      
      // Force scroll to grid result so they can see the generated card easily when closed
      const targetGrid = document.getElementById("recipes-list-anchor");
      if (targetGrid) {
        targetGrid.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // No - reject auto-searched recipe and show custom URL paste
  elements.btnGeneratorConfirmNo.addEventListener("click", () => {
    elements.generatorConfirmationState.classList.add("hidden");
    if (elements.generatorFailureState) {
      elements.generatorFailureState.classList.remove("hidden");
      elements.generatorFailureMessage.innerText = "No problem! You can paste a direct recipe link below to import it into your Cookbook.";
    }
    pendingGeneratedRecipe = null;
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
        const email = elements.loginEmailInput ? elements.loginEmailInput.value.trim() : "";
        result = store.registerUser(username, password, email);
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

  /* --- 15.5. Edit Profile Events --- */
  if (elements.btnDropdownEditProfile) {
    elements.btnDropdownEditProfile.addEventListener("click", () => {
      elements.profileDropdown.classList.add("hidden");
      
      if (elements.editProfileErrorMsg) {
        elements.editProfileErrorMsg.classList.add("hidden");
        elements.editProfileErrorMsg.innerText = "";
      }
      if (elements.editProfileSuccessMsg) {
        elements.editProfileSuccessMsg.classList.add("hidden");
        elements.editProfileSuccessMsg.innerText = "";
      }
      
      const profile = store.getCurrentUserProfile();
      if (profile) {
        if (elements.editProfileUsernameInput) elements.editProfileUsernameInput.value = profile.username;
        if (elements.editProfileBioInput) elements.editProfileBioInput.value = profile.bio || "";
        if (elements.editProfilePicInput) elements.editProfilePicInput.value = profile.profilePic || "";
        
        document.querySelectorAll(".preset-avatar-btn").forEach(b => {
          if (b.getAttribute("data-url") === profile.profilePic) {
            b.classList.add("selected");
          } else {
            b.classList.remove("selected");
          }
        });
      }
      
      openModal(elements.editProfileModal);
    });
  }

  // Preset avatar click handler
  document.querySelectorAll(".preset-avatar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".preset-avatar-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      const url = btn.getAttribute("data-url");
      if (elements.editProfilePicInput) {
        elements.editProfilePicInput.value = url;
      }
    });
  });

  if (elements.editProfileCloseBtn) {
    elements.editProfileCloseBtn.addEventListener("click", () => {
      closeModal(elements.editProfileModal);
      elements.editProfileForm.reset();
    });
  }

  if (elements.editProfileForm) {
    elements.editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newUsername = elements.editProfileUsernameInput.value.trim();
      const bio = elements.editProfileBioInput.value.trim();
      const profilePic = elements.editProfilePicInput.value.trim();
      const currentPassword = elements.editProfileCurrentPassword.value;

      if (!newUsername || !currentPassword) return;

      const result = store.updateProfileDetails(newUsername, bio, profilePic, currentPassword);

      if (result.success) {
        if (elements.editProfileErrorMsg) elements.editProfileErrorMsg.classList.add("hidden");
        if (elements.editProfileSuccessMsg) {
          elements.editProfileSuccessMsg.innerText = "Chef profile updated successfully!";
          elements.editProfileSuccessMsg.classList.remove("hidden");
        }
        setTimeout(() => {
          closeModal(elements.editProfileModal);
          elements.editProfileForm.reset();
        }, 1500);
      } else {
        if (elements.editProfileSuccessMsg) elements.editProfileSuccessMsg.classList.add("hidden");
        if (elements.editProfileErrorMsg) {
          elements.editProfileErrorMsg.innerText = result.error;
          elements.editProfileErrorMsg.classList.remove("hidden");
        }
      }
    });
  }

  /* --- 15.6. Write Custom Recipe Events --- */
  if (elements.btnTabWrite) {
    elements.btnTabWrite.addEventListener("click", () => {
      openModal(elements.customRecipeModal);
    });
  }

  if (elements.fabBtnCustom) {
    elements.fabBtnCustom.addEventListener("click", () => {
      elements.fabContainer.classList.remove("active");
      openModal(elements.customRecipeModal);
    });
  }

  if (elements.customRecipeCloseBtn) {
    elements.customRecipeCloseBtn.addEventListener("click", () => {
      closeModal(elements.customRecipeModal);
      elements.customRecipeForm.reset();
    });
  }

  if (elements.customRecipeForm) {
    elements.customRecipeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const title = elements.customTitle.value.trim();
      const description = elements.customDesc.value.trim();
      const prepTime = parseInt(elements.customPrep.value, 10) || 15;
      const cookTime = parseInt(elements.customCook.value, 10) || 20;
      const servings = parseInt(elements.customServings.value, 10) || 4;
      const difficulty = elements.customDifficulty.value;
      const category = elements.customCategory.value;
      const image = elements.customImage.value.trim();
      
      const rawIngredients = elements.customIngredients.value.split("\n").map(l => l.trim()).filter(Boolean);
      const parsedIngredients = parseSchemaIngredients(rawIngredients);
      
      const rawInstructions = elements.customInstructions.value.split("\n").map(l => l.trim()).filter(Boolean);
      const parsedInstructions = rawInstructions.map((text, idx) => ({
        step: idx + 1,
        text: text,
        tip: ""
      }));

      const newRecipe = {
        id: `custom-${Date.now()}`,
        title,
        description,
        prepTime,
        cookTime,
        servings,
        difficulty,
        category,
        tags: ["Custom", category].filter(Boolean),
        image: image || null,
        equipment: [],
        ingredients: parsedIngredients,
        instructions: parsedInstructions
      };

      const success = store.addRecipe(newRecipe);
      if (success) {
        closeModal(elements.customRecipeModal);
        elements.customRecipeForm.reset();
        store.setActiveTab("my-recipes");
        
        // Force scroll to grid
        const targetGrid = document.getElementById("recipes-list-anchor");
        if (targetGrid) {
          targetGrid.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  /* --- 15.7. Image Upload / Photo Recognition Events --- */
  let recognizedDishName = "";

  function resetImageUploadModal() {
    elements.imageAnalysisArea.classList.add("hidden");
    elements.imageAnalysisPreview.src = "";
    elements.imageScanLaser.classList.add("hidden");
    elements.imageUploadStatusCard.classList.add("hidden");
    elements.imageUploadStatusText.innerText = "";
    elements.btnStartAnalysis.classList.add("hidden");
    if (elements.imageUploadSpinner) {
      elements.imageUploadSpinner.style.display = ""; // restore default display
    }
    if (elements.imageUploadPromptCard) {
      elements.imageUploadPromptCard.classList.add("hidden");
    }
    recognizedDishName = "";
  }

  // Copy-paste event handler for photo scanner
  window.addEventListener("paste", (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        
        // Reset and show modal
        resetImageUploadModal();
        openModal(elements.imageUploadModal);
        
        handleSelectedFile(file);
        break;
      }
    }
  });

  if (elements.searchUploadBtn) {
    elements.searchUploadBtn.addEventListener("click", () => {
      resetImageUploadModal();
      openModal(elements.imageUploadModal);
    });
  }

  if (elements.imageUploadCloseBtn) {
    elements.imageUploadCloseBtn.addEventListener("click", () => {
      closeModal(elements.imageUploadModal);
      resetImageUploadModal();
    });
  }

  // Dropzone click triggers input click
  if (elements.imageUploadDropzone) {
    elements.imageUploadDropzone.addEventListener("click", () => {
      elements.imageUploadInput.click();
    });
    
    // Drag & drop handlers
    elements.imageUploadDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      elements.imageUploadDropzone.style.borderColor = "var(--accent-primary)";
    });
    
    elements.imageUploadDropzone.addEventListener("dragleave", () => {
      elements.imageUploadDropzone.style.borderColor = "var(--border-color)";
    });
    
    elements.imageUploadDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      elements.imageUploadDropzone.style.borderColor = "var(--border-color)";
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (elements.imageUploadInput) {
    elements.imageUploadInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  function cleanDetectedDishName(name) {
    if (!name) return "";
    const clean = name.toLowerCase().trim();
    const genericNames = ["image", "screenshot", "clipboard", "file", "download", "pasted", "upload", "pic", "photo", "captured"];
    if (genericNames.some(g => clean.includes(g)) || clean.length <= 2) {
      return ""; // clear generic names so they can enter custom name
    }
    // Capitalize first letter of words
    return name.replace(/\b\w/g, c => c.toUpperCase());
  }

  // Handle selected file details
  function handleSelectedFile(file) {
    // Reset scanner UI state
    elements.imageScanLaser.classList.add("hidden");
    elements.imageUploadStatusCard.classList.add("hidden");
    elements.imageUploadStatusText.innerText = "";
    if (elements.imageUploadSpinner) {
      elements.imageUploadSpinner.style.display = "";
    }
    if (elements.imageUploadPromptCard) {
      elements.imageUploadPromptCard.classList.add("hidden");
    }

    // Show image preview
    const reader = new FileReader();
    reader.onload = (event) => {
      elements.imageAnalysisPreview.src = event.target.result;
      elements.imageAnalysisArea.classList.remove("hidden");
      elements.btnStartAnalysis.classList.remove("hidden");
    };
    reader.readAsDataURL(file);

    // Guess recipe from file name
    const fileName = file.name.toLowerCase();
    if (fileName.includes("cupcake")) {
      recognizedDishName = "Cupcake";
    } else if (fileName.includes("burger") || fileName.includes("hamburger")) {
      recognizedDishName = "Cheeseburger";
    } else if (fileName.includes("pizza")) {
      recognizedDishName = "Pepperoni Pizza";
    } else if (fileName.includes("salmon")) {
      recognizedDishName = "Salmon";
    } else if (fileName.includes("curry")) {
      recognizedDishName = "Spicy Seafood Curry";
    } else if (fileName.includes("steak")) {
      recognizedDishName = "Steak";
    } else if (fileName.includes("salad")) {
      recognizedDishName = "Salad";
    } else if (fileName.includes("soup")) {
      recognizedDishName = "Soup";
    } else if (fileName.includes("spaghetti") || fileName.includes("pasta")) {
      recognizedDishName = "Spaghetti";
    } else {
      // fallback guess by removing extension
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
      recognizedDishName = baseName;
    }

    // Clean name to make sure we don't display generic names like 'image' or 'screenshot'
    recognizedDishName = cleanDetectedDishName(recognizedDishName);
  }

  // Handle sample photo selections
  document.querySelectorAll(".btn-sample-photo").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Reset scanner UI state
      elements.imageScanLaser.classList.add("hidden");
      elements.imageUploadStatusCard.classList.add("hidden");
      elements.imageUploadStatusText.innerText = "";
      if (elements.imageUploadSpinner) {
        elements.imageUploadSpinner.style.display = "";
      }
      if (elements.imageUploadPromptCard) {
        elements.imageUploadPromptCard.classList.add("hidden");
      }

      const dish = btn.getAttribute("data-dish");
      let title = "Cupcake";
      if (dish === "cheeseburger") title = "Cheeseburger";
      else if (dish === "pizza") title = "Pepperoni Pizza";
      else if (dish === "salmon") title = "Salmon";

      recognizedDishName = title;

      // Show mock picture preview (using database or visual illustration)
      elements.imageAnalysisPreview.src = store.state.recipes.find(r => r.title.toLowerCase().includes(dish))?.image || "assets/images/gourmet_plate.png";
      elements.imageAnalysisArea.classList.remove("hidden");
      elements.btnStartAnalysis.classList.remove("hidden");
    });
  });

  // Handle scanner trigger
  if (elements.btnStartAnalysis) {
    elements.btnStartAnalysis.addEventListener("click", () => {
      elements.btnStartAnalysis.classList.add("hidden");
      elements.imageScanLaser.classList.remove("hidden");
      elements.imageUploadStatusCard.classList.remove("hidden");
      if (elements.imageUploadSpinner) {
        elements.imageUploadSpinner.style.display = "";
      }
      
      const finalName = cleanDetectedDishName(recognizedDishName);
      const statuses = [
        { text: "Scanning photo textures and colors...", time: 0 },
        { text: "Comparing visual signature with culinary database...", time: 1500 },
        { text: finalName ? `Dish Identified: "${finalName}"!` : "Dish Identified! Please verify name below...", time: 3000 }
      ];

      statuses.forEach(stage => {
        setTimeout(() => {
          elements.imageUploadStatusText.innerText = stage.text;
        }, stage.time);
      });

      // Complete simulation and trigger recipe opening/generation confirmation
      setTimeout(() => {
        elements.imageScanLaser.classList.add("hidden");
        if (elements.imageUploadSpinner) {
          elements.imageUploadSpinner.style.display = "none";
        }
        
        // Update prompt text and detected name input field
        const finalNameClean = cleanDetectedDishName(recognizedDishName);
        if (elements.imageUploadDetectedName) {
          elements.imageUploadDetectedName.value = finalNameClean;
        }

        if (elements.imageUploadPromptText) {
          if (finalNameClean) {
            elements.imageUploadPromptText.innerText = `Would you like to proceed to generate or view the recipe for "${finalNameClean}"?`;
          } else {
            elements.imageUploadPromptText.innerText = `We couldn't verify the dish name from the photo name. Please confirm/edit the dish name above to proceed!`;
          }
        }
        
        // Show the prompt card
        if (elements.imageUploadPromptCard) {
          elements.imageUploadPromptCard.classList.remove("hidden");
        }
      }, 3000);
    });
  }

  // Handle proceed and cancel in the prompt card
  if (elements.btnProceedRecipe) {
    elements.btnProceedRecipe.addEventListener("click", () => {
      const finalName = elements.imageUploadDetectedName.value.trim();
      if (!finalName) {
        alert("Please enter a valid dish name to generate the recipe.");
        elements.imageUploadDetectedName.focus();
        return;
      }
      
      recognizedDishName = finalName;
      
      closeModal(elements.imageUploadModal);
      resetImageUploadModal();

      // Search first! Check if we have this recipe in default or myRecipes
      const queryClean = recognizedDishName.toLowerCase().trim();
      const existingRecipe = store.state.recipes.find(r => 
        r.title.toLowerCase().includes(queryClean) || 
        queryClean.includes(r.title.toLowerCase())
      );

      if (existingRecipe) {
        // Open recipe details modal
        store.setSelectedRecipe(existingRecipe.id);
        openModal(elements.recipeDetailModal);
      } else {
        // Open AI generator modal with the dish name
        triggerAiRecipeGeneration(recognizedDishName);
      }
    });
  }

  if (elements.btnCancelProceed) {
    elements.btnCancelProceed.addEventListener("click", () => {
      // Hide the status card and prompt card, show the button to re-analyze
      elements.imageUploadStatusCard.classList.add("hidden");
      if (elements.imageUploadPromptCard) {
        elements.imageUploadPromptCard.classList.add("hidden");
      }
      elements.btnStartAnalysis.classList.remove("hidden");
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

  if (elements.mealPlannerMonthView) {
    elements.mealPlannerMonthView.addEventListener("click", (e) => {
      // Handle delete click
      const removeBtn = e.target.closest(".month-meal-delete");
      if (removeBtn) {
        const day = removeBtn.getAttribute("data-day");
        const slot = removeBtn.getAttribute("data-slot");
        if (day && slot) {
          store.removeMealFromPlan(day, slot);
        }
        return;
      }
      
      // Handle click to add meal
      const addBtn = e.target.closest(".btn-add-slot-meal");
      if (addBtn) {
        const day = addBtn.getAttribute("data-day");
        const slot = addBtn.getAttribute("data-slot");
        if (day && slot) {
          openMealPlannerModal(null, day, slot);
        }
        return;
      }

      // Handle clicking meal item to show recipe detail modal
      const item = e.target.closest(".month-meal-item");
      if (item && !e.target.closest("button")) {
        const id = item.getAttribute("data-id");
        if (id && !id.startsWith("custom_")) {
          store.setSelectedRecipe(id);
          openModal(elements.recipeDetailModal);
        }
      }
    });
  }

  if (elements.btnPlannerToggleWeek) {
    elements.btnPlannerToggleWeek.addEventListener("click", () => {
      store.setPlannerViewMode("week");
    });
  }
  if (elements.btnPlannerToggleMonth) {
    elements.btnPlannerToggleMonth.addEventListener("click", () => {
      store.setPlannerViewMode("month");
    });
  }

  if (elements.btnPlannerPrev) {
    elements.btnPlannerPrev.addEventListener("click", () => {
      if (store.state.plannerViewMode === "week") {
        store.setWeeklyOffset(store.state.weeklyOffset - 1);
      } else {
        store.setMonthlyOffset(store.state.monthlyOffset - 1);
      }
    });
  }
  if (elements.btnPlannerNext) {
    elements.btnPlannerNext.addEventListener("click", () => {
      if (store.state.plannerViewMode === "week") {
        store.setWeeklyOffset(store.state.weeklyOffset + 1);
      } else {
        store.setMonthlyOffset(store.state.monthlyOffset + 1);
      }
    });
  }

  if (elements.btnDropdownSettings) {
    elements.btnDropdownSettings.addEventListener("click", () => {
      elements.profileDropdown.classList.add("hidden");
      
      const weekStart = store.getCurrentUserWeekStartDay();
      if (elements.settingsWeekStartSelect) {
        elements.settingsWeekStartSelect.value = weekStart;
      }
      
      if (elements.settingsErrorMsg) elements.settingsErrorMsg.classList.add("hidden");
      if (elements.settingsSuccessMsg) elements.settingsSuccessMsg.classList.add("hidden");
      if (elements.settingsForm) {
        elements.settingsForm.reset();
        elements.settingsWeekStartSelect.value = weekStart;
        if (elements.settingsGeminiKeyInput) {
          elements.settingsGeminiKeyInput.value = localStorage.getItem("cookbook_gemini_api_key") || "";
        }
      }

      openModal(elements.settingsModal);
    });
  }
  
  if (elements.settingsCloseBtn) {
    elements.settingsCloseBtn.addEventListener("click", () => {
      closeModal(elements.settingsModal);
      if (elements.settingsForm) elements.settingsForm.reset();
    });
  }

  if (elements.settingsForm) {
    elements.settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const weekStart = elements.settingsWeekStartSelect.value;
      const currentPassword = elements.settingsCurrentPasswordInput.value;
      const newPassword = elements.settingsNewPasswordInput.value;
      const confirmPassword = elements.settingsConfirmPasswordInput.value;

      store.updateWeekStartDay(weekStart);

      if (elements.settingsGeminiKeyInput) {
        const geminiKey = elements.settingsGeminiKeyInput.value.trim();
        localStorage.setItem("cookbook_gemini_api_key", geminiKey);
      }

      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          showSettingsError("To change password, please fill in all password fields.");
          return;
        }
        if (newPassword !== confirmPassword) {
          showSettingsError("New passwords do not match.");
          return;
        }
        
        const result = store.changePassword(currentPassword, newPassword);
        if (!result.success) {
          showSettingsError(result.error);
          return;
        }
      }

      if (elements.settingsErrorMsg) elements.settingsErrorMsg.classList.add("hidden");
      if (elements.settingsSuccessMsg) {
        elements.settingsSuccessMsg.innerText = "Settings updated successfully!";
        elements.settingsSuccessMsg.classList.remove("hidden");
      }
      setTimeout(() => {
        closeModal(elements.settingsModal);
        if (elements.settingsForm) elements.settingsForm.reset();
      }, 1500);
    });
  }

  function showSettingsError(msg) {
    if (elements.settingsSuccessMsg) elements.settingsSuccessMsg.classList.add("hidden");
    if (elements.settingsErrorMsg) {
      elements.settingsErrorMsg.innerText = msg;
      elements.settingsErrorMsg.classList.remove("hidden");
    }
  }

  if (elements.btnClearPlanner) {
    elements.btnClearPlanner.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear this view's meal plan?")) {
        const weekStartDay = store.getCurrentUserWeekStartDay();
        let dateStrings = [];
        if (store.state.plannerViewMode === "week") {
          const offset = store.state.weeklyOffset || 0;
          dateStrings = getWeekDates(weekStartDay, offset).map(d => d.dateStr);
        } else {
          const offset = store.state.monthlyOffset || 0;
          dateStrings = getMonthDates(weekStartDay, offset).dates.map(d => d.dateStr);
        }
        store.clearWeeklyMealPlan(dateStrings);
      }
    });
  }

  if (elements.btnPlannerToGrocery) {
    elements.btnPlannerToGrocery.addEventListener("click", () => {
      let addedAny = false;
      const weekStartDay = store.getCurrentUserWeekStartDay();
      const slots = ["breakfast", "lunch", "dinner"];
      let dateItems = [];
      
      if (store.state.plannerViewMode === "week") {
        const offset = store.state.weeklyOffset || 0;
        dateItems = getWeekDates(weekStartDay, offset).map(d => ({ dateStr: d.dateStr, label: `${d.dayName} ${d.label}` }));
      } else {
        const offset = store.state.monthlyOffset || 0;
        dateItems = getMonthDates(weekStartDay, offset).dates.map(d => ({ dateStr: d.dateStr, label: d.dateStr }));
      }

      dateItems.forEach(item => {
        const plannedMeals = store.state.mealPlan[item.dateStr];
        if (plannedMeals) {
          slots.forEach(slot => {
            const meal = plannedMeals[slot];
            if (meal && meal.ingredients) {
              store.addMultipleIngredientsToShoppingList(meal.ingredients, `${meal.title} (${item.label} ${slot})`);
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
  if (elements.btnPlannerToday) {
    elements.btnPlannerToday.addEventListener("click", () => {
      store.setWeeklyOffset(0);
      store.setMonthlyOffset(0);
    });
  }

  /* --- Password Recovery Events --- */
  if (elements.linkForgotPassword) {
    elements.linkForgotPassword.addEventListener("click", (e) => {
      e.preventDefault();
      if (elements.loginResetSection) {
        elements.loginResetSection.classList.remove("hidden");
        if (elements.loginResetUsername) {
          if (elements.loginUsernameInput && elements.loginUsernameInput.value) {
            elements.loginResetUsername.value = elements.loginUsernameInput.value;
          }
          elements.loginResetUsername.focus();
        }
      }
    });
  }

  if (elements.btnLoginResetCancel) {
    elements.btnLoginResetCancel.addEventListener("click", () => {
      if (elements.loginResetSection) {
        elements.loginResetSection.classList.add("hidden");
      }
      if (elements.loginResetForm) {
        elements.loginResetForm.reset();
      }
    });
  }

  if (elements.loginResetForm) {
    elements.loginResetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = elements.loginResetUsername.value.trim();
      const newPassword = elements.loginResetPassword.value;
      if (!username || !newPassword) return;

      const result = store.resetUserPassword(username, newPassword);
      if (result.success) {
        alert("Password reset successfully! You can now log in.");
        if (elements.loginResetSection) {
          elements.loginResetSection.classList.add("hidden");
        }
        elements.loginResetForm.reset();
        if (elements.loginUsernameInput) {
          elements.loginUsernameInput.value = username;
        }
        if (elements.loginPasswordInput) {
          elements.loginPasswordInput.value = "";
          elements.loginPasswordInput.focus();
        }
        if (elements.loginErrorMsg) {
          elements.loginErrorMsg.classList.add("hidden");
          elements.loginErrorMsg.innerText = "";
        }
      } else {
        if (elements.loginErrorMsg) {
          elements.loginErrorMsg.innerText = result.error;
          elements.loginErrorMsg.classList.remove("hidden");
        } else {
          alert(result.error);
        }
      }
    });
  }

  /* --- Admin Panel Events --- */
  function getSavedRecipeCount(username) {
    try {
      const stored = localStorage.getItem(`cookbook_my_recipes_${username.toLowerCase().trim()}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch (e) {
      console.error("Failed to parse recipes count for " + username, e);
    }
    return 0;
  }

  function showAdminMsg(msg, type) {
    if (type === "success") {
      if (elements.adminPanelErrorMsg) elements.adminPanelErrorMsg.classList.add("hidden");
      if (elements.adminPanelSuccessMsg) {
        elements.adminPanelSuccessMsg.innerText = msg;
        elements.adminPanelSuccessMsg.classList.remove("hidden");
      }
    } else {
      if (elements.adminPanelSuccessMsg) elements.adminPanelSuccessMsg.classList.add("hidden");
      if (elements.adminPanelErrorMsg) {
        elements.adminPanelErrorMsg.innerText = msg;
        elements.adminPanelErrorMsg.classList.remove("hidden");
      }
    }
    
    setTimeout(() => {
      if (elements.adminPanelSuccessMsg) elements.adminPanelSuccessMsg.classList.add("hidden");
      if (elements.adminPanelErrorMsg) {
        elements.adminPanelErrorMsg.classList.add("hidden");
      }
    }, 4000);
  }

  function renderAdminUsers() {
    if (!elements.adminUsersList) return;
    const users = store.loadUsers();

    let totalRecipes = 0;
    let totalMealsPlanned = 0;
    let totalPantryIngredients = 0;

    // Category breakdown counters
    const categories = { Mains: 0, Salad: 0, Baking: 0, Soup: 0, Breakfast: 0 };
    
    // Difficulty breakdown counters
    const difficulties = { Easy: 0, Medium: 0, Hard: 0 };

    // Compile list of top chefs (sorted by saved recipes)
    const chefRanks = [];

    users.forEach(user => {
      const username = user.username.toLowerCase().trim();
      
      // Saved recipe count and details
      let userRecipeCount = 0;
      try {
        const storedRecipes = localStorage.getItem(`cookbook_my_recipes_${username}`);
        if (storedRecipes) {
          const parsed = JSON.parse(storedRecipes);
          if (Array.isArray(parsed)) {
            userRecipeCount = parsed.length;
            totalRecipes += userRecipeCount;
            parsed.forEach(r => {
              // Category matching
              const cat = r.category || "Mains";
              if (categories[cat] !== undefined) {
                categories[cat]++;
              } else {
                let matched = false;
                for (const key in categories) {
                  if (cat.toLowerCase().includes(key.toLowerCase())) {
                    categories[key]++;
                    matched = true;
                    break;
                  }
                }
                if (!matched) categories.Mains++;
              }

              // Difficulty matching
              const diff = r.difficulty || "Medium";
              if (difficulties[diff] !== undefined) {
                difficulties[diff]++;
              } else {
                let matched = false;
                for (const key in difficulties) {
                  if (diff.toLowerCase().includes(key.toLowerCase())) {
                    difficulties[key]++;
                    matched = true;
                    break;
                  }
                }
                if (!matched) difficulties.Medium++;
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to parse recipes for " + user.username, e);
      }

      chefRanks.push({
        username: user.username,
        recipeCount: userRecipeCount,
        profilePic: user.profilePic
      });

      // Meal plans
      try {
        const storedPlan = localStorage.getItem(`cookbook_meal_plan_${username}`);
        if (storedPlan) {
          const parsed = JSON.parse(storedPlan);
          if (parsed && typeof parsed === "object") {
            for (const date in parsed) {
              const dayPlan = parsed[date];
              if (dayPlan) {
                if (dayPlan.breakfast) totalMealsPlanned++;
                if (dayPlan.lunch) totalMealsPlanned++;
                if (dayPlan.dinner) totalMealsPlanned++;
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse meal plan for " + user.username, e);
      }

      // Fridge ingredients
      try {
        const storedIngredients = localStorage.getItem(`cookbook_fridge_ingredients_${username}`);
        if (storedIngredients) {
          const parsed = JSON.parse(storedIngredients);
          if (Array.isArray(parsed)) {
            totalPantryIngredients += parsed.length;
          }
        }
      } catch (e) {
        console.error("Failed to parse fridge ingredients for " + user.username, e);
      }
    });

    // Update simple statistics elements
    if (elements.adminTotalUsers) elements.adminTotalUsers.innerText = users.length;
    if (elements.adminTotalRecipes) elements.adminTotalRecipes.innerText = totalRecipes;
    if (elements.adminTotalMeals) elements.adminTotalMeals.innerText = totalMealsPlanned;
    if (elements.adminTotalIngredients) elements.adminTotalIngredients.innerText = totalPantryIngredients;

    // Render Categories Breakdown progress bars
    if (elements.adminCategoriesBreakdown) {
      elements.adminCategoriesBreakdown.innerHTML = Object.entries(categories).map(([cat, count]) => {
        const percent = totalRecipes > 0 ? Math.round((count / totalRecipes) * 100) : 0;
        return `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; color: var(--text-secondary);">
              <span style="font-weight: 600;">${escapeHtml(cat)}</span>
              <span style="font-weight: 700; color: var(--accent-primary);">${count} (${percent}%)</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--border-color);">
              <div style="width: ${percent}%; height: 100%; background: var(--accent-primary); border-radius: var(--radius-full);"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Render Difficulty Breakdown badges
    if (elements.adminDifficultyBreakdown) {
      elements.adminDifficultyBreakdown.innerHTML = Object.entries(difficulties).map(([diff, count]) => {
        let badgeColor = "var(--accent-primary)";
        if (diff === "Easy") badgeColor = "var(--color-success)";
        else if (diff === "Hard") badgeColor = "var(--color-danger)";
        return `
          <div style="flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px; text-align: center;">
            <p style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">${escapeHtml(diff)}</p>
            <h5 style="font-size: 1.1rem; font-weight: 800; color: ${badgeColor}; margin: 0;">${count}</h5>
          </div>
        `;
      }).join("");
    }

    // Render Top Chef Profiles
    if (elements.adminTopChefsList) {
      // Sort by recipe count desc
      chefRanks.sort((a, b) => b.recipeCount - a.recipeCount);
      const topChefs = chefRanks.slice(0, 3); // top 3
      elements.adminTopChefsList.innerHTML = topChefs.map((chef, idx) => {
        const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23FFD166'/><circle cx='50' cy='58' r='30' fill='%23FFE3A8'/><path d='M25 40 L25 15 L45 30 Z' fill='%23FFE3A8'/><path d='M75 40 L75 15 L55 30 Z' fill='%23FFE3A8'/><circle cx='40' cy='48' r='4' fill='%233D2723'/><circle cx='60' cy='48' r='4' fill='%233D2723'/><path d='M45 60 Q50 63 55 60' stroke='%233D2723' stroke-width='3' fill='none'/><path d='M50 55 L50 58' stroke='%233D2723' stroke-width='2'/><path d='M35 15 Q50 5 65 15 L50 25 Z' fill='%23FFFFFF' stroke='%233D2723' stroke-width='2'/></svg>";
        const avatarSrc = chef.profilePic || defaultAvatar;
        let rankMedal = "🥇";
        if (idx === 1) rankMedal = "🥈";
        else if (idx === 2) rankMedal = "🥉";
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.1rem;">${rankMedal}</span>
              <img src="${escapeHtml(avatarSrc)}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" alt="${escapeHtml(chef.username)}">
              <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${escapeHtml(chef.username)}</span>
            </div>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-primary);">${chef.recipeCount} saved</span>
          </div>
        `;
      }).join("");
    }

    elements.adminUsersList.innerHTML = users.map(user => {
      const isSystemAdmin = user.username.toLowerCase() === "admin";
      const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23FFD166'/><circle cx='50' cy='58' r='30' fill='%23FFE3A8'/><path d='M25 40 L25 15 L45 30 Z' fill='%23FFE3A8'/><path d='M75 40 L75 15 L55 30 Z' fill='%23FFE3A8'/><circle cx='40' cy='48' r='4' fill='%233D2723'/><circle cx='60' cy='48' r='4' fill='%233D2723'/><path d='M45 60 Q50 63 55 60' stroke='%233D2723' stroke-width='3' fill='none'/><path d='M50 55 L50 58' stroke='%233D2723' stroke-width='2'/><path d='M35 15 Q50 5 65 15 L50 25 Z' fill='%23FFFFFF' stroke='%233D2723' stroke-width='2'/></svg>";
      const avatarSrc = user.profilePic || defaultAvatar;
      const recipeCount = getSavedRecipeCount(user.username);
      const emailText = user.email ? escapeHtml(user.email) : `<span style='color: var(--text-muted); font-style: italic;'>${user.username.toLowerCase()}@dailydish.com</span>`;
      const bioText = user.bio ? escapeHtml(user.bio) : "<span style='color: var(--text-muted); font-style: italic;'>No bio written yet.</span>";
      
      return `
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
          <td style="padding: 12px 16px; display: flex; align-items: center; gap: 10px;">
            <img src="${escapeHtml(avatarSrc)}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" alt="${escapeHtml(user.username)}'s Avatar">
            <span style="font-weight: 600;">${escapeHtml(user.username)}</span>
          </td>
          <td style="padding: 12px 16px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(user.email || (user.username.toLowerCase() + '@dailydish.com'))}">
            ${emailText}
          </td>
          <td style="padding: 12px 16px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(user.bio || '')}">
            ${bioText}
          </td>
          <td style="padding: 12px 16px; text-align: center; font-weight: 600;">
            ${recipeCount}
          </td>
          <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
            <button class="btn-card-secondary btn-admin-reset" data-username="${escapeHtml(user.username)}" style="padding: 6px 10px; font-size: 0.75rem; border-radius: var(--radius-md); margin-right: 6px; cursor: pointer;">
              Reset PW
            </button>
            ${isSystemAdmin ? `
              <button disabled style="padding: 6px 10px; font-size: 0.75rem; border-radius: var(--radius-md); opacity: 0.4; cursor: not-allowed; border: 1px solid var(--border-color); background: transparent; color: var(--text-muted);">
                System
              </button>
            ` : `
              <button class="view-imported-btn btn-admin-delete" data-username="${escapeHtml(user.username)}" style="padding: 6px 10px; font-size: 0.75rem; border-radius: var(--radius-md); background-color: var(--color-danger); border-color: var(--color-danger); color: white; cursor: pointer;">
                Delete
              </button>
            `}
          </td>
        </tr>
      `;
    }).join("");
    
    // Attach event listeners to reset buttons
    elements.adminUsersList.querySelectorAll(".btn-admin-reset").forEach(btn => {
      btn.addEventListener("click", () => {
        const username = btn.getAttribute("data-username");
        const newPassword = prompt(`Enter new password for chef "${username}":`);
        if (newPassword === null) return; // User cancelled
        
        const res = store.resetUserPassword(username, newPassword.trim());
        if (res.success) {
          showAdminMsg(`Password for chef "${username}" reset successfully.`, "success");
          renderAdminUsers();
        } else {
          showAdminMsg(res.error, "error");
        }
      });
    });

    // Attach event listeners to delete buttons
    elements.adminUsersList.querySelectorAll(".btn-admin-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const username = btn.getAttribute("data-username");
        if (confirm(`Are you sure you want to delete chef "${username}"? All their saved recipes and settings will be permanently lost!`)) {
          const res = store.deleteUser(username);
          if (res.success) {
            showAdminMsg(`Chef "${username}" deleted successfully.`, "success");
            renderAdminUsers();
          } else {
            showAdminMsg(res.error, "error");
          }
        }
      });
    });
  }

  if (elements.btnDropdownAdmin) {
    elements.btnDropdownAdmin.addEventListener("click", () => {
      if (elements.profileDropdown) {
        elements.profileDropdown.classList.add("hidden");
      }
      if (elements.adminPanelSuccessMsg) elements.adminPanelSuccessMsg.classList.add("hidden");
      if (elements.adminPanelErrorMsg) elements.adminPanelErrorMsg.classList.add("hidden");
      renderAdminUsers();
      const adminView = document.getElementById("admin-dashboard-view");
      if (adminView) adminView.scrollIntoView({ behavior: "smooth" });
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
    if (elements.loginEmailGroup) elements.loginEmailGroup.classList.add("hidden");
    if (elements.loginEmailInput) elements.loginEmailInput.removeAttribute("required");
    const promptEl = document.getElementById("login-toggle-prompt");
    if (promptEl) {
      promptEl.innerHTML = `Don't have a chef profile? <a href="#" id="link-toggle-register" style="font-weight:700; color: var(--accent-primary);">Sign Up</a>`;
    }
  } else {
    if (elements.loginModalTitle) elements.loginModalTitle.innerText = "Register Chef Profile";
    if (elements.loginModalSubtitle) elements.loginModalSubtitle.innerText = "Create a new chef profile to save recipes and plan your meals.";
    if (elements.btnLoginSubmit) elements.btnLoginSubmit.innerText = "Sign Up / Register";
    if (elements.loginEmailGroup) elements.loginEmailGroup.classList.remove("hidden");
    if (elements.loginEmailInput) elements.loginEmailInput.setAttribute("required", "required");
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

function getWeekDates(weekStartDay = "Sunday", offset = 0) {
  const today = new Date();
  
  // Apply week offset
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + offset * 7);
  
  const currentDay = baseDate.getDay(); // 0 is Sunday, 1 is Monday...
  
  const startDate = new Date(baseDate);
  if (weekStartDay === "Sunday") {
    // Distance to Sunday. Sunday is 0.
    const distanceToSunday = -currentDay;
    startDate.setDate(baseDate.getDate() + distanceToSunday);
  } else {
    // Distance to Monday. Monday is 1, Sunday is 0.
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    startDate.setDate(baseDate.getDate() + distanceToMonday);
  }
  
  // Array of days based on start preference
  const days = weekStartDay === "Sunday"
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
  const weekDates = [];
  days.forEach((dayName, index) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + index);
    
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const dateNum = d.getDate();
    const isToday = d.toDateString() === today.toDateString();
    
    const y = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${mStr}-${dStr}`;
    
    weekDates.push({
      dayName: dayName,
      dateStr: dateStr,
      label: `${month} ${dateNum}`,
      isToday: isToday,
      dateObj: d
    });
  });
  
  return weekDates;
}

function getMonthDates(weekStartDay = "Sunday", offset = 0) {
  const today = new Date();
  
  // Calculate base month
  const baseDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  
  const monthName = baseDate.toLocaleDateString("en-US", { month: "long" });
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = firstDay.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Find how many days we need to backfill from the previous month
  let backfillDays = 0;
  if (weekStartDay === "Sunday") {
    backfillDays = firstDayIndex;
  } else {
    // Week starts on Monday
    backfillDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  }
  
  // Start date of our calendar grid
  const gridStartDate = new Date(firstDay);
  gridStartDate.setDate(firstDay.getDate() - backfillDays);
  
  // Render a standard 6-week grid (42 days)
  const gridDates = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStartDate);
    d.setDate(gridStartDate.getDate() + i);
    
    const isCurrentMonth = d.getMonth() === month;
    const isToday = d.toDateString() === today.toDateString();
    
    const y = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${mStr}-${dStr}`;
    
    gridDates.push({
      dateStr: dateStr,
      dateNum: d.getDate(),
      isCurrentMonth: isCurrentMonth,
      isToday: isToday,
      dateObj: d
    });
  }
  
  return {
    year: year,
    monthName: monthName,
    dates: gridDates
  };
}

function openMealPlannerModal(recipeId = null, preSelectedDay = null, preSelectedSlot = null) {
  const allRecipes = store.state.recipes;
  const weekStartDay = store.getCurrentUserWeekStartDay();
  
  let datesToUse = [];
  if (store.state.plannerViewMode === "month") {
    const monthOffset = store.state.monthlyOffset || 0;
    const monthData = getMonthDates(weekStartDay, monthOffset);
    datesToUse = monthData.dates;
  } else {
    const weekOffset = store.state.weeklyOffset || 0;
    datesToUse = getWeekDates(weekStartDay, weekOffset);
  }

  if (elements.plannerDaySelect) {
    let optionsHtml = datesToUse.map(dayInfo => {
      const dObj = dayInfo.dateObj || new Date(dayInfo.dateStr + "T00:00:00");
      const dayName = dObj.toLocaleDateString("en-US", { weekday: "long" });
      const label = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `<option value="${dayInfo.dateStr}">${dayName} (${label})</option>`;
    }).join("");
    
    if (preSelectedDay && !datesToUse.some(d => d.dateStr === preSelectedDay)) {
      const dObj = new Date(preSelectedDay + "T00:00:00");
      if (!isNaN(dObj.getTime())) {
        const dayName = dObj.toLocaleDateString("en-US", { weekday: "long" });
        const label = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        optionsHtml += `<option value="${preSelectedDay}">${dayName} (${label})</option>`;
      }
    }
    elements.plannerDaySelect.innerHTML = optionsHtml;
  }

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

    // Enable selected Day and Slot
    if (elements.plannerDaySelect) {
      if (preSelectedDay) elements.plannerDaySelect.value = preSelectedDay;
      elements.plannerDaySelect.disabled = false;
    }
    if (elements.plannerSlotSelect) {
      if (preSelectedSlot) elements.plannerSlotSelect.value = preSelectedSlot;
      elements.plannerSlotSelect.disabled = false;
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

  // Check for TikTok URL and missing API key
  const isTikTok = url.toLowerCase().includes("tiktok.com");
  if (isTikTok) {
    const apiKey = localStorage.getItem("cookbook_gemini_api_key") || "";
    if (!apiKey) {
      if (elements.tiktokKeyFormGroup) {
        elements.tiktokKeyFormGroup.classList.remove("hidden");
        if (elements.importerGeminiKeyInput) {
          elements.importerGeminiKeyInput.value = "";
          elements.importerGeminiKeyInput.focus();
        }
      }
      return;
    }
  }

  // Ensure key form group is hidden if proceeding
  if (elements.tiktokKeyFormGroup) {
    elements.tiktokKeyFormGroup.classList.add("hidden");
  }

  // UI state transition
  elements.importUrlInput.disabled = true;
  elements.btnSubmitImport.disabled = true;
  
  if (isTikTok) {
    elements.importerLoadingState.classList.add("tiktok-mode");
  } else {
    elements.importerLoadingState.classList.remove("tiktok-mode");
  }
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
    },
    false,
    // Error callback
    (errorMsg) => {
      elements.importUrlInput.disabled = false;
      elements.btnSubmitImport.disabled = false;
      elements.importerLoadingState.classList.add("hidden");
      elements.importerLoadingState.classList.remove("tiktok-mode");
      
      if (errorMsg === "API Key missing") {
        if (elements.tiktokKeyFormGroup) {
          elements.tiktokKeyFormGroup.classList.remove("hidden");
          if (elements.importerGeminiKeyInput) {
            elements.importerGeminiKeyInput.focus();
          }
        }
      } else {
        alert(`Failed to import recipe: ${errorMsg}`);
      }
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
  elements.importerLoadingState.classList.remove("tiktok-mode");
  elements.importerSuccessState.classList.add("hidden");
  if (elements.tiktokKeyFormGroup) {
    elements.tiktokKeyFormGroup.classList.add("hidden");
  }
  if (elements.importerGeminiKeyInput) {
    elements.importerGeminiKeyInput.value = "";
  }
  resetImportStepsUI();
}

/* ==========================================================================
   UI RENDERING SYSTEM (Clean SVGs instead of emojis)
   ========================================================================== */

function renderUI(state) {
  // -1. Render User Authentication state
  if (state.currentUser) {
    const profile = store.getCurrentUserProfile();
    if (elements.headerUserAvatar) {
      if (profile && profile.profilePic) {
        elements.headerUserAvatar.innerHTML = `<img src="${escapeHtml(profile.profilePic)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        elements.headerUserAvatar.innerText = state.currentUser.username[0].toUpperCase();
      }
    }
    if (elements.headerUserName) elements.headerUserName.innerText = state.currentUser.username;
    if (elements.dropdownUsername) {
      const bioText = profile && profile.bio ? `<p class="dropdown-bio" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; font-style: italic; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(profile.bio)}</p>` : "";
      elements.dropdownUsername.innerHTML = `${escapeHtml(state.currentUser.username)}${bioText}`;
    }
    if (elements.btnDropdownLogin) elements.btnDropdownLogin.classList.add("hidden");
    if (elements.btnDropdownLogout) elements.btnDropdownLogout.classList.remove("hidden");

    // Hide edit profile and settings for admin user
    const isAdmin = state.currentUser.username.toLowerCase() === "admin";
    if (elements.btnDropdownEditProfile) {
      if (isAdmin) elements.btnDropdownEditProfile.classList.add("hidden");
      else elements.btnDropdownEditProfile.classList.remove("hidden");
    }
    if (elements.btnDropdownSettings) {
      if (isAdmin) elements.btnDropdownSettings.classList.add("hidden");
      else elements.btnDropdownSettings.classList.remove("hidden");
    }
    
    if (elements.btnDropdownAdmin) {
      if (isAdmin) {
        elements.btnDropdownAdmin.classList.remove("hidden");
      } else {
        elements.btnDropdownAdmin.classList.add("hidden");
      }
    }
  } else {
    if (elements.headerUserAvatar) elements.headerUserAvatar.innerText = "G";
    if (elements.headerUserName) elements.headerUserName.innerText = "Login";
    if (elements.dropdownUsername) elements.dropdownUsername.innerText = "Guest Chef";
    if (elements.btnDropdownLogin) elements.btnDropdownLogin.classList.remove("hidden");
    if (elements.btnDropdownLogout) elements.btnDropdownLogout.classList.add("hidden");
    if (elements.btnDropdownEditProfile) elements.btnDropdownEditProfile.classList.add("hidden");
    if (elements.btnDropdownSettings) elements.btnDropdownSettings.classList.add("hidden");
    if (elements.btnDropdownAdmin) elements.btnDropdownAdmin.classList.add("hidden");
  }

  // Handle Admin Dashboard Visibility
  const isAdminLoggedIn = state.currentUser && state.currentUser.username.toLowerCase() === "admin";
  const adminDashboardView = document.getElementById("admin-dashboard-view");
  const navLinks = document.querySelector(".nav-links");
  const fabBtn = document.getElementById("fab-main-btn");
  const listAnchor = document.getElementById("recipes-list-anchor");
  const mealPlannerView = document.getElementById("meal-planner-view");

  if (isAdminLoggedIn) {
    // Hide standard user-facing features
    if (navLinks) navLinks.classList.add("hidden");
    if (elements.btnToggleCart) elements.btnToggleCart.classList.add("hidden");
    if (fabBtn) fabBtn.classList.add("hidden");
    if (elements.heroBanner) elements.heroBanner.classList.add("hidden");
    if (elements.heroSection) elements.heroSection.classList.add("hidden");
    if (listAnchor) listAnchor.classList.add("hidden");
    if (mealPlannerView) mealPlannerView.classList.add("hidden");
    if (elements.moodBoardsPanel) elements.moodBoardsPanel.classList.add("hidden");
    
    // Close sidebar drawer if open
    const drawer = document.getElementById("shopping-list-drawer");
    if (drawer) drawer.classList.remove("active");

    // Show Admin Dashboard view
    if (adminDashboardView) {
      adminDashboardView.classList.remove("hidden");
      renderAdminUsers();
    }
    return;
  } else {
    // Show standard user-facing features
    if (navLinks) navLinks.classList.remove("hidden");
    if (elements.btnToggleCart) elements.btnToggleCart.classList.remove("hidden");
    if (fabBtn) fabBtn.classList.remove("hidden");
    
    // Hide Admin Dashboard view
    if (adminDashboardView) adminDashboardView.classList.add("hidden");

    // 0. Toggle active tab visual styling and sections
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
    const monthViewEl = document.getElementById("meal-planner-month-view");
    const rangeLabelEl = document.getElementById("planner-range-label");
    const toggleWeekBtn = document.getElementById("btn-planner-toggle-week");
    const toggleMonthBtn = document.getElementById("btn-planner-toggle-month");

    const weekStartDay = store.getCurrentUserWeekStartDay();
    const slots = ["breakfast", "lunch", "dinner"];

    if (state.plannerViewMode === "week") {
      if (calendarEl) calendarEl.classList.remove("hidden");
      if (monthViewEl) monthViewEl.classList.add("hidden");
      if (toggleWeekBtn) {
        toggleWeekBtn.classList.add("active");
        toggleWeekBtn.style.background = "var(--accent-primary)";
        toggleWeekBtn.style.color = "white";
      }
      if (toggleMonthBtn) {
        toggleMonthBtn.classList.remove("active");
        toggleMonthBtn.style.background = "transparent";
        toggleMonthBtn.style.color = "var(--text-secondary)";
      }

      const offset = state.weeklyOffset || 0;
      const weekDates = getWeekDates(weekStartDay, offset);

      if (rangeLabelEl && weekDates.length > 0) {
        const firstDate = weekDates[0];
        const lastDate = weekDates[weekDates.length - 1];
        rangeLabelEl.innerText = `${firstDate.label} – ${lastDate.label}, ${firstDate.dateObj.getFullYear()}`;
      }

      if (calendarEl) {
        calendarEl.innerHTML = weekDates.map(dayInfo => {
          const dateStr = dayInfo.dateStr;
          const plannedMeals = state.mealPlan[dateStr] || { breakfast: null, lunch: null, dinner: null };

          const slotsHtml = slots.map(slot => {
            const meal = plannedMeals[slot];
            if (meal) {
              const metaText = meal.isCustom 
                ? `<span class="meal-recipe-meta" style="color: var(--accent-primary); font-weight: 700;">Custom Meal</span>`
                : `<span class="meal-recipe-meta">${meal.prepTime + meal.cookTime} mins | ${meal.difficulty}</span>`;
                
              return `
                <div class="planner-meal-slot">
                  <span class="meal-slot-label">${slot}</span>
                  <div class="meal-slot-card filled" data-id="${meal.id}" data-day="${dateStr}" data-slot="${slot}">
                    <button class="btn-remove-meal" data-day="${dateStr}" data-slot="${slot}" title="Remove from plan">&times;</button>
                    <h5 class="meal-recipe-title">${escapeHtml(meal.title)}</h5>
                    ${metaText}
                  </div>
                </div>
              `;
            } else {
              return `
                <div class="planner-meal-slot">
                  <span class="meal-slot-label">${slot}</span>
                  <button class="meal-slot-card empty btn-add-slot-meal" data-day="${dateStr}" data-slot="${slot}" title="Add meal to ${dayInfo.dayName} ${slot}">
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
                ${dayInfo.dayName}
                <span class="day-date-label">${dayInfo.label}</span>
                ${todayBadge}
              </h4>
              ${slotsHtml}
            </div>
          `;
        }).join("");
      }
    } else {
      // MONTH VIEW
      if (calendarEl) calendarEl.classList.add("hidden");
      if (monthViewEl) monthViewEl.classList.remove("hidden");
      if (toggleWeekBtn) {
        toggleWeekBtn.classList.remove("active");
        toggleWeekBtn.style.background = "transparent";
        toggleWeekBtn.style.color = "var(--text-secondary)";
      }
      if (toggleMonthBtn) {
        toggleMonthBtn.classList.add("active");
        toggleMonthBtn.style.background = "var(--accent-primary)";
        toggleMonthBtn.style.color = "white";
      }

      const offset = state.monthlyOffset || 0;
      const monthData = getMonthDates(weekStartDay, offset);

      if (rangeLabelEl) {
        rangeLabelEl.innerText = `${monthData.monthName} ${monthData.year}`;
      }

      const headerEl = document.getElementById("month-grid-header");
      const bodyEl = document.getElementById("month-grid-body");

      if (headerEl) {
        const days = weekStartDay === "Sunday"
          ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        headerEl.innerHTML = days.map(d => `<div>${d}</div>`).join("");
      }

      if (bodyEl) {
        bodyEl.innerHTML = monthData.dates.map(dateInfo => {
          const dateStr = dateInfo.dateStr;
          const plannedMeals = state.mealPlan[dateStr] || { breakfast: null, lunch: null, dinner: null };
          
          let mealsHtml = "";
          slots.forEach(slot => {
            const meal = plannedMeals[slot];
            if (meal) {
              mealsHtml += `
                <div class="month-meal-item ${slot}" title="${slot.toUpperCase()}: ${escapeHtml(meal.title)}" data-id="${meal.id}" data-day="${dateStr}" data-slot="${slot}">
                  <span class="month-meal-text"><strong>${slot[0].toUpperCase()}:</strong> ${escapeHtml(meal.title)}</span>
                  <button class="month-meal-delete" data-day="${dateStr}" data-slot="${slot}" title="Remove from plan">&times;</button>
                </div>
              `;
            }
          });

          const cellClass = [
            "month-grid-cell",
            dateInfo.isCurrentMonth ? "" : "other-month",
            dateInfo.isToday ? "today-cell" : ""
          ].filter(Boolean).join(" ");

          return `
            <div class="${cellClass}">
              <span class="month-date-number">${dateInfo.dateNum}</span>
              <div class="month-meal-list">
                ${mealsHtml}
              </div>
              <button class="btn-month-add-meal btn-add-slot-meal" data-day="${dateStr}" data-slot="breakfast">+ Plan Meal</button>
            </div>
          `;
        }).join("");
      }
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
      initRecipeChatbot(activeRecipe);
    }
  }
}

/* ==========================================================================
   AI GENERATOR PROCESS LOGIC
   ========================================================================== */

let pendingGeneratedRecipe = null;

function triggerAiRecipeGeneration(query) {
  if (!query || !query.trim()) return;

  // Show generator modal
  openModal(elements.generatorModal);
  elements.generatorLoadingState.classList.remove("hidden");
  elements.generatorSuccessState.classList.add("hidden");
  if (elements.generatorConfirmationState) {
    elements.generatorConfirmationState.classList.add("hidden");
  }
  if (elements.generatorFailureState) {
    elements.generatorFailureState.classList.add("hidden");
  }
  
  resetGeneratorStepsUI();
  pendingGeneratedRecipe = null;

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
        if (elements.generatorConfirmationState) {
          elements.generatorConfirmationState.classList.add("hidden");
        }
        if (elements.generatorFailureState) {
          elements.generatorFailureState.classList.remove("hidden");
          elements.generatorFailureMessage.innerText = `We couldn't find a verified recipe for "${query}" online.`;
          elements.btnSearchExternalLink.href = `https://www.google.com/search?q=${encodeURIComponent(query)}+recipe`;
        }
        return;
      }

      elements.generatorLoadingState.classList.add("hidden");

      if (generatedRecipe.isConfirmationPending) {
        pendingGeneratedRecipe = generatedRecipe.recipe;
        elements.generatorSuccessState.classList.add("hidden");
        if (elements.generatorConfirmationState) {
          elements.generatorConfirmationState.classList.remove("hidden");
          elements.generatorConfirmTitlePreview.innerText = generatedRecipe.recipe.title;
          elements.generatorConfirmDomainPreview.innerText = generatedRecipe.recipe.sourceName || generatedRecipe.recipe.sourceUrl;
        }
      } else {
        elements.generatorSuccessState.classList.remove("hidden");
        if (elements.generatorConfirmationState) {
          elements.generatorConfirmationState.classList.add("hidden");
        }
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
  if (elements.generatorConfirmationState) {
    elements.generatorConfirmationState.classList.add("hidden");
  }
  if (elements.generatorFailureState) {
    elements.generatorFailureState.classList.add("hidden");
  }
  if (elements.generatorFailureImportUrl) {
    elements.generatorFailureImportUrl.value = "";
  }
  pendingGeneratedRecipe = null;
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
        initRecipeChatbot(activeRecipe);
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
      initRecipeChatbot(updatedRecipe);
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
