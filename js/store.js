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

function formatDateIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class Store {
  constructor() {
    this.listeners = [];
    
    this.state = {
      currentUser: this.loadCurrentUser(),
      activeTab: "home", // "home" or "my-recipes", or "meal-planner"
      weeklySeed: getWeekSeed(),
      defaultRecipes: [], // Populated in updateCombinedRecipes
      recipes: [],        // Populated in updateCombinedRecipes
      selectedRecipeId: null,
      customServings: {}, // Map of recipeId -> current serving size
      searchQuery: "",
      searchMode: "name", // 'name' or 'ingredients'
      activeSteps: {}, // Map of recipeId -> active step index
      ambientAudioPlaying: false,
      activeBoard: "All",
      weeklyOffset: 0,
      monthlyOffset: 0,
      plannerViewMode: "week"
    };

    // Scoped loaders
    this.state.myRecipes = this.loadMyRecipes();
    this.state.deletedDefaultIds = this.loadDeletedDefaultIds();
    this.state.selectedIngredients = this.loadSelectedIngredients();
    this.state.shoppingList = this.loadShoppingList();
    this.state.mealPlan = this.loadMealPlan();

    // Seed admin account if it does not exist
    const users = this.loadUsers();
    const adminIdx = users.findIndex(u => u.username.toLowerCase() === "admin");
    if (adminIdx === -1) {
      users.push({
        username: "admin",
        password: "admin",
        email: "admin@dailydish.com",
        bio: "Platform Administrator",
        profilePic: "",
        settings: { weekStartDay: "Sunday" }
      });
      this.saveUsers(users);
    } else if (!users[adminIdx].email) {
      users[adminIdx].email = "admin@dailydish.com";
      this.saveUsers(users);
    }

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

  // User-scoped suffix helper
  getUserSuffix() {
    return this.state && this.state.currentUser ? `_${this.state.currentUser.username.toLowerCase().trim()}` : "";
  }

  // Auth Loaders
  loadCurrentUser() {
    try {
      const stored = localStorage.getItem("cookbook_current_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }
    return null;
  }

  saveCurrentUser(user) {
    if (user) {
      localStorage.setItem("cookbook_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cookbook_current_user");
    }
  }

  // Loaders
  loadMyRecipes() {
    try {
      const suffix = this.getUserSuffix();
      const stored = localStorage.getItem(`cookbook_my_recipes${suffix}`);
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
      const suffix = this.getUserSuffix();
      const stored = localStorage.getItem(`cookbook_deleted_defaults${suffix}`);
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
      const suffix = this.getUserSuffix();
      const stored = localStorage.getItem(`cookbook_fridge_ingredients${suffix}`);
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
      const suffix = this.getUserSuffix();
      const stored = localStorage.getItem(`cookbook_shopping_list${suffix}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored shopping list", e);
    }
    return [];
  }

  loadMealPlan() {
    try {
      const suffix = this.getUserSuffix();
      const stored = localStorage.getItem(`cookbook_meal_plan${suffix}`);
      if (stored) {
        let parsed = JSON.parse(stored);
        
        // Migrate old day-name based entries (Monday, Tuesday, etc.) to date strings
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const hasOldKeys = dayNames.some(day => day in parsed);
        
        if (hasOldKeys) {
          const today = new Date();
          const currentDay = today.getDay();
          const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
          const monday = new Date(today);
          monday.setDate(today.getDate() + distanceToMonday);
          
          const migrated = {};
          dayNames.forEach((dayName, index) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + index);
            const dateStr = formatDateIso(d);
            if (parsed[dayName]) {
              migrated[dateStr] = parsed[dayName];
            }
          });
          
          // Copy over any existing date-based keys that might be there
          for (const key in parsed) {
            if (!dayNames.includes(key)) {
              migrated[key] = parsed[key];
            }
          }
          parsed = migrated;
          localStorage.setItem(`cookbook_meal_plan${suffix}`, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored mealPlan", e);
    }
    return {};
  }

  // Persisters
  saveMyRecipes() {
    const suffix = this.getUserSuffix();
    localStorage.setItem(`cookbook_my_recipes${suffix}`, JSON.stringify(this.state.myRecipes));
  }

  saveDeletedDefaultIds() {
    const suffix = this.getUserSuffix();
    localStorage.setItem(`cookbook_deleted_defaults${suffix}`, JSON.stringify(this.state.deletedDefaultIds));
  }

  saveSelectedIngredients() {
    const suffix = this.getUserSuffix();
    localStorage.setItem(`cookbook_fridge_ingredients${suffix}`, JSON.stringify(this.state.selectedIngredients));
  }

  saveShoppingList() {
    const suffix = this.getUserSuffix();
    localStorage.setItem(`cookbook_shopping_list${suffix}`, JSON.stringify(this.state.shoppingList));
  }

  saveMealPlan() {
    const suffix = this.getUserSuffix();
    localStorage.setItem(`cookbook_meal_plan${suffix}`, JSON.stringify(this.state.mealPlan));
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
    // Check if recipe is already in myRecipes (by title or source URL)
    const isDuplicate = this.state.myRecipes.some(
      r => r.title.toLowerCase().trim() === recipe.title.toLowerCase().trim() ||
           (r.sourceUrl && recipe.sourceUrl && r.sourceUrl.trim() === recipe.sourceUrl.trim())
    );
    if (isDuplicate) {
      alert(`"${recipe.title}" is already in your Saved Recipes list!`);
      return false;
    }
    // Generated recipes go directly into My Recipes
    this.state.myRecipes.unshift(recipe);
    this.saveMyRecipes();
    this.updateCombinedRecipes();
    this.notify();
    return true;
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
      const isDuplicate = this.state.myRecipes.some(
        r => r.title.toLowerCase().trim() === recipe.title.toLowerCase().trim()
      );
      if (isDuplicate) {
        alert(`"${recipe.title}" is already in your Saved Recipes list!`);
        return;
      }
      this.state.myRecipes.unshift(recipe);
      this.saveMyRecipes();
      this.updateCombinedRecipes();
      this.notify();
    }
  }

  loadUsers() {
    try {
      const stored = localStorage.getItem("cookbook_users");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored users", e);
    }
    return [];
  }

  saveUsers(users) {
    localStorage.setItem("cookbook_users", JSON.stringify(users));
  }

  authenticateUser(username, password) {
    if (!username || !username.trim() || !password) {
      return { success: false, error: "Please enter both username and password." };
    }
    
    const uName = username.trim();
    const users = this.loadUsers();
    const user = users.find(u => u.username.toLowerCase() === uName.toLowerCase());
    
    if (!user) {
      return { 
        success: false, 
        error: "Chef account not found. Toggle 'Sign Up' below to register this username!" 
      };
    }
    
    if (user.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
    
    // Log in
    this.state.currentUser = { username: user.username };
    this.saveCurrentUser(this.state.currentUser);
    this.loadUserData();
    return { success: true };
  }

  registerUser(username, password, email) {
    if (!username || !username.trim() || !password) {
      return { success: false, error: "Please enter both username and password." };
    }
    if (username.trim().length < 3) {
      return { success: false, error: "Username must be at least 3 characters long." };
    }
    if (password.length < 4) {
      return { success: false, error: "Password must be at least 4 characters long." };
    }
    
    const uName = username.trim();
    const users = this.loadUsers();
    const exists = users.some(u => u.username.toLowerCase() === uName.toLowerCase());
    
    if (exists) {
      return { success: false, error: "Username is already taken. Please choose another." };
    }
    
    const userEmail = email && email.trim() ? email.trim() : `${uName.toLowerCase()}@dailydish.com`;
    
    // Create user
    users.push({ 
      username: uName, 
      password, 
      email: userEmail,
      bio: "", 
      profilePic: "", 
      settings: { weekStartDay: "Sunday" } 
    });
    this.saveUsers(users);
    
    // Log in
    this.state.currentUser = { username: uName };
    this.saveCurrentUser(this.state.currentUser);
    this.loadUserData();
    return { success: true };
  }

  loadUserData() {
    this.state.myRecipes = this.loadMyRecipes();
    this.state.deletedDefaultIds = this.loadDeletedDefaultIds();
    this.state.selectedIngredients = this.loadSelectedIngredients();
    this.state.shoppingList = this.loadShoppingList();
    this.state.mealPlan = this.loadMealPlan();
    this.state.weeklyOffset = 0;
    this.state.monthlyOffset = 0;
    this.state.plannerViewMode = "week";
    this.updateCombinedRecipes();
    this.notify();
  }

  loginUser(username) {
    if (!username || !username.trim()) return false;
    const uName = username.trim();
    this.state.currentUser = { username: uName };
    this.saveCurrentUser(this.state.currentUser);
    this.loadUserData();
    return true;
  }

  logoutUser() {
    this.state.currentUser = null;
    this.saveCurrentUser(null);
    this.loadUserData();
  }

  getCurrentUserProfile() {
    if (!this.state.currentUser) return null;
    const users = this.loadUsers();
    return users.find(u => u.username.toLowerCase() === this.state.currentUser.username.toLowerCase()) || null;
  }

  getCurrentUserWeekStartDay() {
    if (!this.state.currentUser) return "Sunday";
    const profile = this.getCurrentUserProfile();
    if (profile && profile.settings && profile.settings.weekStartDay) {
      return profile.settings.weekStartDay;
    }
    return "Sunday";
  }

  updateWeekStartDay(day) {
    if (!this.state.currentUser) return;
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === this.state.currentUser.username.toLowerCase());
    if (idx !== -1) {
      if (!users[idx].settings) users[idx].settings = {};
      users[idx].settings.weekStartDay = day;
      this.saveUsers(users);
      this.notify();
    }
  }

  changePassword(currentPassword, newPassword) {
    if (!this.state.currentUser) return { success: false, error: "Not logged in" };
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === this.state.currentUser.username.toLowerCase());
    if (idx === -1) return { success: false, error: "User profile not found." };
    
    const user = users[idx];
    if (user.password !== currentPassword) {
      return { success: false, error: "Incorrect current password" };
    }
    if (newPassword.length < 4) {
      return { success: false, error: "New password must be at least 4 characters long" };
    }
    
    users[idx].password = newPassword;
    this.saveUsers(users);
    return { success: true };
  }

  resetUserPassword(username, newPassword) {
    if (!username || !newPassword || newPassword.length < 4) {
      return { success: false, error: "Password must be at least 4 characters long" };
    }
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (idx === -1) {
      return { success: false, error: "Chef account not found." };
    }
    users[idx].password = newPassword;
    this.saveUsers(users);
    return { success: true };
  }

  deleteUser(username) {
    if (username.toLowerCase().trim() === "admin") {
      return { success: false, error: "Cannot delete the administrator account." };
    }
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (idx === -1) {
      return { success: false, error: "User not found." };
    }
    
    // Remove from registry
    users.splice(idx, 1);
    this.saveUsers(users);
    
    // Clear user data in localStorage
    const suffix = `_${username.toLowerCase().trim()}`;
    const keysToRemove = [
      "cookbook_my_recipes",
      "cookbook_deleted_defaults",
      "cookbook_selected_ingredients",
      "cookbook_shopping_list",
      "cookbook_meal_plan"
    ];
    keysToRemove.forEach(key => {
      localStorage.removeItem(`${key}${suffix}`);
    });
    
    this.notify();
    return { success: true };
  }

  updateProfileDetails(newUsername, bio, profilePic, currentPassword) {
    if (!this.state.currentUser) return { success: false, error: "Not logged in" };
    
    const oldUsername = this.state.currentUser.username;
    const cleanNewUsername = newUsername.trim();
    
    if (!cleanNewUsername) return { success: false, error: "Username cannot be empty" };
    if (cleanNewUsername.length < 3) return { success: false, error: "Username must be at least 3 characters long" };
    
    const users = this.loadUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === oldUsername.toLowerCase());
    if (userIndex === -1) return { success: false, error: "User profile not found in database." };
    
    const user = users[userIndex];
    if (user.password !== currentPassword) {
      return { success: false, error: "Incorrect password verification" };
    }
    
    // Check if new username is already taken by someone else
    if (cleanNewUsername.toLowerCase() !== oldUsername.toLowerCase()) {
      const exists = users.some(u => u.username.toLowerCase() === cleanNewUsername.toLowerCase());
      if (exists) {
        return { success: false, error: "Username is already taken by another chef" };
      }
    }
    
    // If username changes, we migrate the keys
    if (cleanNewUsername.toLowerCase() !== oldUsername.toLowerCase()) {
      const oldSuffix = `_${oldUsername.toLowerCase().trim()}`;
      const newSuffix = `_${cleanNewUsername.toLowerCase().trim()}`;
      
      const keysToMigrate = [
        "cookbook_my_recipes",
        "cookbook_deleted_defaults",
        "cookbook_selected_ingredients",
        "cookbook_shopping_list",
        "cookbook_meal_plan"
      ];
      
      keysToMigrate.forEach(key => {
        const val = localStorage.getItem(`${key}${oldSuffix}`);
        if (val !== null) {
          localStorage.setItem(`${key}${newSuffix}`, val);
          localStorage.removeItem(`${key}${oldSuffix}`);
        }
      });
    }
    
    // Update user record
    users[userIndex].username = cleanNewUsername;
    users[userIndex].bio = bio || "";
    users[userIndex].profilePic = profilePic || "";
    this.saveUsers(users);
    
    // Update current user session
    this.state.currentUser = { username: cleanNewUsername };
    this.saveCurrentUser(this.state.currentUser);
    this.loadUserData();
    
    return { success: true };
  }

  setWeeklyOffset(offset) {
    this.state.weeklyOffset = offset;
    this.notify();
  }

  setMonthlyOffset(offset) {
    this.state.monthlyOffset = offset;
    this.notify();
  }

  setPlannerViewMode(mode) {
    this.state.plannerViewMode = mode;
    this.notify();
  }

  addMealToPlan(dateStr, slot, recipeId, customTitle = "") {
    if (!this.state.mealPlan[dateStr]) {
      this.state.mealPlan[dateStr] = { breakfast: null, lunch: null, dinner: null };
    }
    
    if (recipeId === "custom" && customTitle.trim()) {
      this.state.mealPlan[dateStr][slot] = {
        id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        title: customTitle.trim(),
        category: "Custom",
        image: null,
        prepTime: 5,
        cookTime: 5,
        difficulty: "Easy",
        ingredients: [],
        isCustom: true
      };
      this.saveMealPlan();
      this.notify();
    } else {
      const recipe = this.state.recipes.find(r => r.id === recipeId);
      if (recipe) {
        this.state.mealPlan[dateStr][slot] = {
          id: recipe.id,
          title: recipe.title,
          category: recipe.category,
          image: recipe.image,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients
        };
        this.saveMealPlan();
        this.notify();
      }
    }
  }

  removeMealFromPlan(dateStr, slot) {
    if (this.state.mealPlan[dateStr]) {
      this.state.mealPlan[dateStr][slot] = null;
      if (!this.state.mealPlan[dateStr].breakfast && 
          !this.state.mealPlan[dateStr].lunch && 
          !this.state.mealPlan[dateStr].dinner) {
        delete this.state.mealPlan[dateStr];
      }
      this.saveMealPlan();
      this.notify();
    }
  }

  clearMealPlan() {
    this.state.mealPlan = {};
    this.saveMealPlan();
    this.notify();
  }

  clearWeeklyMealPlan(dateStrings) {
    dateStrings.forEach(dateStr => {
      if (this.state.mealPlan[dateStr]) {
        delete this.state.mealPlan[dateStr];
      }
    });
    this.saveMealPlan();
    this.notify();
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
