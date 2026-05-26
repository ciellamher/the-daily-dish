// State Management Store for Cookbook

import { RECIPES as INITIAL_RECIPES } from "./database.js";
import { isIngredientMatch } from "./utils.js";

// Seed-based week selection helpers
function getWeekSeed() {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
  return now.getFullYear() * 100 + weekNumber;
}

function getWeeklyDefaultRecipes(allRecipes, seed) {
  const pool = [...allRecipes];
  const selected = [];
  let tempSeed = seed;
  for (let i = 0; i < 7; i++) {
    tempSeed = (tempSeed * 1664525 + 1013904223) % 4294967296;
    if (pool.length === 0) break;
    const index = tempSeed % pool.length;
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}

class Store {
  constructor() {
    this.listeners = [];
    
    this.state = {
      myRecipes: this.loadMyRecipes(),
      deletedDefaultIds: this.loadDeletedDefaultIds(),
      activeTab: "home", // "home" or "my-recipes"
      weeklySeed: getWeekSeed(),
      defaultRecipes: [], // Populated in updateCombinedRecipes
      recipes: [],        // Populated in updateCombinedRecipes
      selectedRecipeId: null,
      customServings: {}, // Map of recipeId -> current serving size
      searchQuery: "",
      searchMode: "ingredients", // 'name' or 'ingredients'
      selectedIngredients: this.loadSelectedIngredients(),
      shoppingList: this.loadShoppingList(),
      activeSteps: {}, // Map of recipeId -> active step index
      ambientAudioPlaying: false,
      activeBoard: "All"
    };

    this.updateCombinedRecipes();
  }

  // Pub-Sub Mechanism
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }

  // Loaders
  loadMyRecipes() {
    try {
      const stored = localStorage.getItem("cookbook_my_recipes");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored myRecipes", e);
    }
    return [];
  }

  loadDeletedDefaultIds() {
    try {
      const stored = localStorage.getItem("cookbook_deleted_defaults");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored deleted defaults", e);
    }
    return [];
  }

  loadSelectedIngredients() {
    try {
      const stored = localStorage.getItem("cookbook_fridge_ingredients");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored ingredients", e);
    }
    return [];
  }

  loadShoppingList() {
    try {
      const stored = localStorage.getItem("cookbook_shopping_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored shopping list", e);
    }
    return [];
  }

  // Persisters
  saveMyRecipes() {
    localStorage.setItem("cookbook_my_recipes", JSON.stringify(this.state.myRecipes));
  }

  saveDeletedDefaultIds() {
    localStorage.setItem("cookbook_deleted_defaults", JSON.stringify(this.state.deletedDefaultIds));
  }

  saveSelectedIngredients() {
    localStorage.setItem("cookbook_fridge_ingredients", JSON.stringify(this.state.selectedIngredients));
  }

  saveShoppingList() {
    localStorage.setItem("cookbook_shopping_list", JSON.stringify(this.state.shoppingList));
  }

  updateCombinedRecipes() {
    // 1. Get weekly defaults
    const rawDefaults = getWeeklyDefaultRecipes(INITIAL_RECIPES, this.state.weeklySeed);
    
    // 2. Filter out deleted defaults
    this.state.defaultRecipes = rawDefaults.filter(
      r => !this.state.deletedDefaultIds.includes(r.id)
    );
    
    // 3. Combine defaults and myRecipes to avoid breaking lookups
    const map = new Map();
    this.state.defaultRecipes.forEach(r => map.set(r.id, r));
    this.state.myRecipes.forEach(r => map.set(r.id, r));
    this.state.recipes = Array.from(map.values());
  }

  // Actions
  addRecipe(recipe) {
    // Generated recipes go directly into My Recipes
    this.state.myRecipes.unshift(recipe);
    this.saveMyRecipes();
    this.updateCombinedRecipes();
    this.notify();
  }

  updateRecipe(recipeId, updatedRecipe) {
    // 1. Check if it's already in myRecipes
    const myIndex = this.state.myRecipes.findIndex(r => r.id === recipeId);
    if (myIndex !== -1) {
      this.state.myRecipes[myIndex] = { ...updatedRecipe, id: recipeId };
    } else {
      // 2. If it's a default recipe, copy it to myRecipes so the user's edits are saved
      this.state.myRecipes.unshift({ ...updatedRecipe, id: recipeId });
    }
    this.saveMyRecipes();
    this.updateCombinedRecipes();
    this.notify();
  }

  deleteRecipe(recipeId) {
    if (this.state.activeTab === "my-recipes") {
      this.removeRecipeFromMyRecipes(recipeId);
    } else {
      // Deleting from defaults on Home page
      this.state.deletedDefaultIds.push(recipeId);
      this.saveDeletedDefaultIds();
      this.updateCombinedRecipes();
      this.notify();
    }
  }

  saveRecipeToMyRecipes(recipeId) {
    const recipe = this.state.recipes.find(r => r.id === recipeId);
    if (recipe && !this.state.myRecipes.some(r => r.id === recipeId)) {
      this.state.myRecipes.unshift(recipe);
      this.saveMyRecipes();
      this.updateCombinedRecipes();
      this.notify();
    }
  }

  removeRecipeFromMyRecipes(recipeId) {
    this.state.myRecipes = this.state.myRecipes.filter(r => r.id !== recipeId);
    this.saveMyRecipes();
    this.updateCombinedRecipes();
    this.notify();
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
    // Reset active board to All when changing tabs
    this.state.activeBoard = "All";
    this.notify();
  }

  setAmbientAudioPlaying(isPlaying) {
    this.state.ambientAudioPlaying = isPlaying;
    this.notify();
  }

  setActiveBoard(board) {
    this.state.activeBoard = board;
    this.notify();
  }

  setSelectedRecipe(recipeId) {
    this.state.selectedRecipeId = recipeId;
    this.notify();
  }

  setServings(recipeId, servings) {
    this.state.customServings[recipeId] = Math.max(1, servings);
    this.notify();
  }

  getServings(recipe) {
    if (!recipe) return 1;
    return this.state.customServings[recipe.id] || recipe.servings;
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notify();
  }

  setSearchMode(mode) {
    this.state.searchMode = mode; // 'name' or 'ingredients'
    this.notify();
  }

  // Fridge Ingredient Actions
  toggleFridgeIngredient(ingredient) {
    const normalized = ingredient.toLowerCase().trim();
    if (this.state.selectedIngredients.includes(normalized)) {
      this.state.selectedIngredients = this.state.selectedIngredients.filter(
        i => i !== normalized
      );
    } else {
      this.state.selectedIngredients.push(normalized);
    }
    this.saveSelectedIngredients();
    this.notify();
  }

  clearFridgeIngredients() {
    this.state.selectedIngredients = [];
    this.saveSelectedIngredients();
    this.notify();
  }

  // Shopping List Actions
  addIngredientToShoppingList(name, quantity, unit, recipeTitle = "") {
    const existing = this.state.shoppingList.find(
      item => item.name.toLowerCase().trim() === name.toLowerCase().trim() && item.unit === unit
    );

    if (existing) {
      if (quantity && existing.quantity) {
        existing.quantity += quantity;
      }
      if (!existing.sources.includes(recipeTitle) && recipeTitle) {
        existing.sources.push(recipeTitle);
      }
    } else {
      this.state.shoppingList.push({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: name,
        quantity: quantity,
        unit: unit,
        checked: false,
        sources: recipeTitle ? [recipeTitle] : ["Manual Input"]
      });
    }
    
    this.saveShoppingList();
    this.notify();
  }

  addMultipleIngredientsToShoppingList(ingredients, recipeTitle = "") {
    ingredients.forEach(ing => {
      this.addIngredientToShoppingList(ing.name, ing.quantity, ing.unit, recipeTitle);
    });
  }

  toggleShoppingItem(itemId) {
    const item = this.state.shoppingList.find(i => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      this.saveShoppingList();
      this.notify();
    }
  }

  removeShoppingItem(itemId) {
    this.state.shoppingList = this.state.shoppingList.filter(i => i.id !== itemId);
    this.saveShoppingList();
    this.notify();
  }

  clearCheckedShoppingItems() {
    this.state.shoppingList = this.state.shoppingList.filter(i => !i.checked);
    this.saveShoppingList();
    this.notify();
  }

  clearShoppingList() {
    this.state.shoppingList = [];
    this.saveShoppingList();
    this.notify();
  }

  // Step Progress Actions
  setStepProgress(recipeId, stepIndex) {
    this.state.activeSteps[recipeId] = stepIndex;
    this.notify();
  }

  getStepProgress(recipeId) {
    return this.state.activeSteps[recipeId] !== undefined ? this.state.activeSteps[recipeId] : 0;
  }

  // Getters & Matching Algorithm
  getFilteredRecipes() {
    const { activeTab, defaultRecipes, myRecipes, searchQuery, searchMode, selectedIngredients, activeBoard } = this.state;
    
    // Filter by name query if present
    let filtered = activeTab === "my-recipes" ? myRecipes : defaultRecipes;

    // Filter by Board category in My Recipes tab
    if (activeTab === "my-recipes" && activeBoard && activeBoard !== "All") {
      filtered = filtered.filter(r => r.category.toLowerCase() === activeBoard.toLowerCase());
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => 
        r && (
          (r.title || "").toLowerCase().includes(q) || 
          (r.description || "").toLowerCase().includes(q) ||
          (r.tags || []).some(t => t && t.toLowerCase().includes(q))
        )
      );
    }
    
    // If ingredients matching mode is active and we have selected ingredients
    if (searchMode === "ingredients" && selectedIngredients.length > 0) {
      return filtered.map(recipe => {
        if (!recipe || !recipe.ingredients) return { ...recipe, matchStats: null };
        
        // Calculate matching stats
        const matched = [];
        const missing = [];
        
        recipe.ingredients.forEach(ing => {
          if (!ing || !ing.name) return;
          const isMatched = selectedIngredients.some(sel => 
            isIngredientMatch(ing.name, sel)
          );
          
          if (isMatched) {
            matched.push(ing);
          } else {
            missing.push(ing);
          }
        });
        
        const matchPercentage = recipe.ingredients.length > 0
          ? matched.length / recipe.ingredients.length
          : 0;

        return {
          ...recipe,
          matchStats: {
            matchedCount: matched.length,
            missingCount: missing.length,
            matchPercentage,
            matchedIngredients: matched,
            missingIngredients: missing
          }
        };
      })
      .filter(r => r.matchStats && r.matchStats.matchedCount > 0) // Only keep recipes that have at least one matching ingredient
      .sort((a, b) => {
        if (!a.matchStats || !b.matchStats) return 0;
        // Sort perfect matches (missing count = 0) first, then by match percentage
        if (a.matchStats.missingCount === 0 && b.matchStats.missingCount > 0) return -1;
        if (b.matchStats.missingCount === 0 && a.matchStats.missingCount > 0) return 1;
        return b.matchStats.matchPercentage - a.matchStats.matchPercentage;
      });
    }

    // Default sorting / structure for non-matching mode
    return filtered.map(recipe => ({
      ...recipe,
      matchStats: null
    }));
  }

  // Get a unique list of all ingredients across all recipes for the autocomplete/fridge checklist
  getAllUniqueIngredients() {
    const list = new Set();
    this.state.recipes.forEach(r => {
      if (r && r.ingredients) {
        r.ingredients.forEach(i => {
          if (i && i.name) {
            // Clean up ingredient names slightly for tag purposes (e.g. remove "peeled and deveined")
            let name = i.name.split(",")[0].trim().toLowerCase();
            // Remove trailing or leading details
            name = name.replace(/\(.*\)/, "").trim();
            if (name && name.length > 2 && name.length < 30) {
              list.add(name);
            }
          }
        });
      }
    });
    // Add some common pantry staples if they aren't there
    const staples = ["salt", "black pepper", "olive oil", "garlic", "butter", "onion", "eggs", "flour", "sugar"];
    staples.forEach(s => list.add(s));
    
    return Array.from(list).sort();
  }
}

export const store = new Store();
