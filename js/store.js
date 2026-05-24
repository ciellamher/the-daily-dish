// State Management Store for Cookbook

import { RECIPES as INITIAL_RECIPES } from "./database.js";

class Store {
  constructor() {
    this.listeners = [];
    
    // Load initial data or load from LocalStorage
    this.state = {
      recipes: this.loadRecipes(),
      selectedRecipeId: null,
      customServings: {}, // Map of recipeId -> current serving size
      searchQuery: "",
      searchMode: "ingredients", // 'name' or 'ingredients'
      selectedIngredients: this.loadSelectedIngredients(),
      shoppingList: this.loadShoppingList(),
      activeSteps: {} // Map of recipeId -> active step index (for beginner guide step progress)
    };
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
  loadRecipes() {
    try {
      const stored = localStorage.getItem("cookbook_recipes");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored recipes, resetting", e);
    }
    return INITIAL_RECIPES;
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
  saveRecipes() {
    localStorage.setItem("cookbook_recipes", JSON.stringify(this.state.recipes));
  }

  saveSelectedIngredients() {
    localStorage.setItem("cookbook_fridge_ingredients", JSON.stringify(this.state.selectedIngredients));
  }

  saveShoppingList() {
    localStorage.setItem("cookbook_shopping_list", JSON.stringify(this.state.shoppingList));
  }

  // Actions
  addRecipe(recipe) {
    this.state.recipes.unshift(recipe);
    this.saveRecipes();
    this.notify();
  }

  deleteRecipe(recipeId) {
    this.state.recipes = this.state.recipes.filter(r => r.id !== recipeId);
    this.saveRecipes();
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
    const { recipes, searchQuery, searchMode, selectedIngredients } = this.state;
    
    // Filter by name query if present
    let filtered = recipes || [];
    
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
        const recipeIngredients = recipe.ingredients
          .filter(i => i && i.name)
          .map(i => i.name.toLowerCase());
        
        // Find which selected ingredients are in the recipe
        const matched = [];
        const missing = [];
        
        recipe.ingredients.forEach(ing => {
          if (!ing || !ing.name) return;
          const ingName = ing.name.toLowerCase();
          // Check if any selected ingredient is a substring of the recipe ingredient, or vice versa
          const isMatched = selectedIngredients.some(sel => 
            ingName.includes(sel) || sel.includes(ingName)
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
      }).sort((a, b) => {
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
