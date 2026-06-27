// URL Recipe Importer Logic & Scraper Simulator

import { store } from "../store.js";
import { getGourmetFoodImage, extractEquipment, fetchHtmlThroughProxy, generateDynamicFallback, getGeminiEndpoint } from "../utils.js?v=2.4";

// Mock database of recipes to return based on URL keyword searches
const MOCK_IMPORTED_RECIPES = {
  carbonara: {
    title: "Classic Roman Spaghetti Carbonara",
    description: "An authentic Italian masterpiece made with crispy pancetta, creamy egg yolks, sharp Pecorino Romano, and freshly cracked black pepper.",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "Medium",
    category: "Pasta",
    tags: ["Classic", "Italian", "Pasta"],
    equipment: [
      { name: "Large Pasta Pot", icon: "pot" },
      { name: "Large Skillet", icon: "pan" },
      { name: "Mixing Bowl", icon: "bowl" },
      { name: "Whisk", icon: "bowl" }
    ],
    ingredients: [
      { name: "spaghetti pasta", quantity: 400, unit: "g", category: "Pantry" },
      { name: "guanciale or pancetta, diced", quantity: 150, unit: "g", category: "Meat" },
      { name: "large egg yolks", quantity: 4, unit: "pcs", category: "Dairy" },
      { name: "large whole egg", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "pecorino romano cheese, grated", quantity: 1, unit: "cup", category: "Dairy" },
      { name: "whole black peppercorns, crushed", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "kosher salt", quantity: 1, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Bring a large pot of salted water to a boil. Add spaghetti and cook until 2 minutes shy of al dente (about 8 minutes). Reserve 1 cup of pasta water, then drain.", tip: "The pasta water will finish cooking the noodles and emulsify the sauce!" },
      { step: 2, text: "While cooking, add diced guanciale to a cold skillet and place over medium heat. Cook until crispy and the fat renders out (about 6-8 minutes). Remove pan from heat.", tip: "Starting with a cold pan ensures fat renders out slowly, making the pork extra crispy." },
      { step: 3, text: "In a mixing bowl, whisk together egg yolks, whole egg, grated Pecorino Romano, and crushed black pepper until it forms a thick paste.", tip: "Whisking thoroughly prevents the eggs from scrambling when combined with hot pasta." },
      { step: 4, text: "Add the hot drained spaghetti directly to the skillet containing the guanciale and rendered fat. Toss well for 1 minute off the heat to cool the pan slightly.", tip: "If the pan is too hot when you add the eggs, they will scramble. Let it cool slightly!" },
      { step: 5, text: "Pour the egg and cheese mixture over the pasta. Quickly toss and stir, adding splashes of the warm reserved pasta water, until a creamy, glossy sauce coats the noodles.", tip: "Stir rapidly! The agitation combined with the warm starch water melts the cheese into a silk sauce." },
      { step: 6, text: "Plate immediately, topping with extra grated Pecorino Romano and coarse black pepper.", tip: "Carbonara is best eaten piping hot - serve it straight away!" }
    ]
  },
  salmon: {
    title: "Garlic Butter Honey Salmon",
    description: "Flaky, pan-seared salmon fillets glazed in a sweet, sticky garlic butter sauce and finished with fresh lemon.",
    prepTime: 5,
    cookTime: 10,
    servings: 4,
    difficulty: "Easy",
    category: "Seafood",
    tags: ["Quick", "Seafood", "Healthy"],
    equipment: [
      { name: "Large Skillet", icon: "pan" },
      { name: "Fish Spatula", icon: "spoon" },
      { name: "Spoon", icon: "spoon" }
    ],
    ingredients: [
      { name: "salmon fillets, skin-on", quantity: 4, unit: "pcs", category: "Seafood" },
      { name: "unsalted butter", quantity: 3, unit: "tbsp", category: "Dairy" },
      { name: "honey", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "lemon juice, fresh", quantity: 1, unit: "tbsp", category: "Produce" },
      { name: "garlic cloves, minced", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "soy sauce", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "salt and pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Season salmon fillets generously on both sides with salt, black pepper, and paprika if desired.", tip: "Pat salmon dry with a paper towel before seasoning to get a crisp sear." },
      { step: 2, text: "Heat olive oil in a large skillet over medium-high heat. Add salmon skin-side down and sear for 4-5 minutes until golden and crispy. Flip and sear for another 2-3 minutes.", tip: "Flip only once to avoid breaking the delicate fish fillets." },
      { step: 3, text: "Turn heat down to medium-low. Add butter, minced garlic, honey, lemon juice, and soy sauce to the skillet around the salmon.", tip: "Melt the butter first so the honey and soy sauce incorporate smoothly." },
      { step: 4, text: "Use a spoon to repeatedly baste the garlic honey butter glaze over the salmon fillets as the sauce simmers and thickens (about 2 minutes).", tip: "Basting keeps the fish moist and coats it with caramelized glaze." },
      { step: 5, text: "Garnish with lemon slices and chopped parsley, and serve immediately.", tip: "Pairs wonderfully with steamed asparagus and jasmine rice." }
    ]
  },
  brownie: {
    title: "Decadent Fudgy Chocolate Brownies",
    description: "Rich, dense, ultra-fudgy chocolate brownies with a signature shiny crinkle crust and melted chocolate pools inside.",
    prepTime: 15,
    cookTime: 25,
    servings: 12,
    difficulty: "Easy",
    category: "Baking",
    tags: ["Chocolate", "Dessert", "Baking"],
    equipment: [
      { name: "Baking Pan (8x8 inch)", icon: "sheet" },
      { name: "Mixing Bowls", icon: "bowl" },
      { name: "Whisk", icon: "bowl" },
      { name: "Parchment Paper", icon: "paper" }
    ],
    ingredients: [
      { name: "unsalted butter, melted", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "granulated white sugar", quantity: 1, unit: "cup", category: "Pantry" },
      { name: "large eggs", quantity: 2, unit: "pcs", category: "Dairy" },
      { name: "vanilla extract", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "unsweetened cocoa powder", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "all-purpose flour", quantity: 0.25, unit: "cup", category: "Pantry" },
      { name: "semi-sweet chocolate chips", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "fine salt", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Preheat oven to 350°F (175°C). Line an 8x8 inch baking pan with parchment paper, leaving an overhang on the sides.", tip: "Parchment overhang lets you lift the baked brownies out easily for slicing." },
      { step: 2, text: "In a large bowl, whisk melted butter and sugar vigorously for 1 minute. Add eggs and vanilla extract and beat for another 2 minutes until pale and slightly fluffy.", tip: "Whisking the sugar and eggs extensively is what forms the crinkly top crust!" },
      { step: 3, text: "Sift in the cocoa powder, flour, and salt. Fold gently with a spatula just until dry ingredients are combined.", tip: "Overmixing dry ingredients can make the brownies cakey instead of fudgy." },
      { step: 4, text: "Fold in the semi-sweet chocolate chips, reserving a few to sprinkle on top.", tip: "Chunks of chocolate chopped from a bar will melt even better than chips!" },
      { step: 5, text: "Spread batter evenly into the prepared pan. Bake for 22-25 minutes. A toothpick inserted should have a few moist crumbs, not dry, and not wet batter.", tip: "Do not overbake! Brownies continue cooking in the pan while cooling." },
      { step: 6, text: "Cool completely in the pan before lifting out and slicing into 12 squares.", tip: "Chill in the fridge for 30 minutes before cutting for perfect clean edges!" }
    ]
  },
  default: {
    title: "Gourmet Garden Pesto Flatbread",
    description: "Crispy hearth flatbread crust spread with aromatic basil pesto, topped with fresh mozzarella cheese, halved baby cherry tomatoes, and fresh baby arugula.",
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    difficulty: "Easy",
    category: "Flatbread",
    tags: ["Vegetarian", "Quick", "Dinner"],
    equipment: [
      { name: "Baking Sheet", icon: "sheet" },
      { name: "Pastry Brush", icon: "brush" },
      { name: "Pizza Cutter", icon: "cutter" }
    ],
    ingredients: [
      { name: "naan bread or flatbread crusts", quantity: 2, unit: "pcs", category: "Pantry" },
      { name: "basil pesto sauce", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "fresh mozzarella cheese, sliced", quantity: 1, unit: "cup", category: "Dairy" },
      { name: "cherry tomatoes, halved", quantity: 0.5, unit: "cup", category: "Produce" },
      { name: "olive oil, extra virgin", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "fresh baby arugula", quantity: 0.5, unit: "cup", category: "Produce" },
      { name: "balsamic glaze", quantity: 1, unit: "tbsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Preheat oven to 400°F (200°C). Line a large baking sheet with parchment paper.", tip: "Preheating the sheet in the oven first gives a crispier crust!" },
      { step: 2, text: "Place the flatbreads on the sheet. Brush the edges lightly with olive oil to get a golden brown crust.", tip: "Olive oil also adds a rich crispy bite." },
      { step: 3, text: "Spread the basil pesto evenly over the flatbreads, leaving a 1/2-inch border around the edge.", tip: "Store-bought or homemade pesto both work great here." },
      { step: 4, text: "Arrange sliced mozzarella and halved cherry tomatoes over the pesto layer.", tip: "Pat fresh mozzarella dry to prevent the flatbread from getting soggy." },
      { step: 5, text: "Bake for 10-12 minutes until the cheese is melted and bubbling, and the edges are golden brown.", tip: "Keep a close eye - flatbreads bake very quickly!" },
      { step: 6, text: "Top with fresh baby arugula, drizzle with sweet balsamic glaze, slice with pizza cutter, and serve immediately.", tip: "Add prosciutto or toasted pine nuts for extra flavor dimensions." }
    ]
  }
};

/**
 * Extracts and cleans the recipe/dish name from a title or URL.
 */
function getCleanDishName(title, url) {
  let name = (title || "").trim();
  const domain = extractDomain(url);
  const lowercaseName = name.toLowerCase();
  
  if (
    !name || 
    lowercaseName.includes("just a moment") || 
    lowercaseName.includes("cloudflare") || 
    lowercaseName.includes("security") || 
    lowercaseName.includes("attention required") ||
    lowercaseName.includes("enable javascript") ||
    lowercaseName.includes("simple page") ||
    lowercaseName === domain.toLowerCase() ||
    lowercaseName === `recipe from ${domain.toLowerCase()}`
  ) {
    // Extract from URL
    try {
      const parsed = new URL(url);
      const path = parsed.pathname;
      const lastSegment = path.split("/").filter(Boolean).pop() || "";
      const cleanSegment = lastSegment
        .replace(/[\-_]/g, " ")
        .replace(/\.html?$/i, "")
        .replace(/\d+/g, "")
        .trim();
      
      if (cleanSegment) {
        return cleanSegment.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
    } catch (e) {}
    return "Gourmet Dish";
  }
  return name;
}

/**
 * Simulates importing a recipe from a URL by fetching its HTML via a CORS proxy,
 * extracting Recipe schema metadata (JSON-LD), or falling back to search API / stubs.
 */
export function simulateRecipeImport(url, onStepChange, onComplete, skipSave = false, onError = null) {
  onStepChange({ step: "connect", status: "Connecting to recipe server...", progress: 15 });
  
  // Clean URL to ensure it starts with http
  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  // Intercept TikTok Video URLs for AI Culinary analysis
  if (targetUrl.toLowerCase().includes("tiktok.com")) {
    const apiKey = localStorage.getItem("cookbook_gemini_api_key") || "";
    if (!apiKey) {
      if (onError) {
        onError("API Key missing");
      } else {
        alert("Gemini API key is required to analyze TikTok recipes. Please configure it in Settings.");
      }
      return;
    }
    importTikTokRecipe(targetUrl, apiKey, onStepChange, onComplete, onError, skipSave);
    return;
  }
  
  // Use public CORS proxy fallback logic
  fetchHtmlThroughProxy(targetUrl)
    .then(html => {
      if (!html || html.trim().startsWith("Error") || html.length < 100) {
        throw new Error("Invalid or empty response from proxy");
      }
      onStepChange({ step: "extract", status: "Downloading HTML & searching metadata...", progress: 50 });
      
      const schemaRecipe = extractRecipeSchema(html);
      const meta = extractMetaFallbacks(html);
      
      let importedRecipe = null;
      
      if (schemaRecipe) {
        let title = schemaRecipe.name || meta.title || "Scraped Recipe";
        let desc = schemaRecipe.description || meta.description || `Sourced from online article.`;
        
        let imageUrl = extractImage(schemaRecipe.image);
        if (!imageUrl) imageUrl = meta.image || getGourmetFoodImage(title, schemaRecipe.recipeCategory || "Mains");
        
        let servings = 4;
        if (schemaRecipe.recipeYield) {
          const yieldStr = String(schemaRecipe.recipeYield);
          const yieldMatch = yieldStr.match(/\d+/);
          if (yieldMatch) servings = parseInt(yieldMatch[0], 10);
        }
        
        const prepTime = parseISO8601Duration(schemaRecipe.prepTime);
        const cookTime = parseISO8601Duration(schemaRecipe.cookTime);
        
        let category = "Mains";
        if (schemaRecipe.recipeCategory) {
          const catStr = String(schemaRecipe.recipeCategory).toLowerCase();
          if (catStr.includes("dessert") || catStr.includes("bake")) category = "Baking";
          else if (catStr.includes("pasta")) category = "Pasta";
          else if (catStr.includes("seafood")) category = "Seafood";
          else if (catStr.includes("salad") || catStr.includes("veg")) category = "Salad";
          else if (catStr.includes("breakfast")) category = "Breakfast";
          else if (catStr.includes("soup")) category = "Soup";
        }
        
        const parsedIngredients = parseSchemaIngredients(schemaRecipe.recipeIngredient);
        const parsedInstructions = parseSchemaInstructions(schemaRecipe.recipeInstructions);
        
        // Only accept the scraped recipe if we successfully got ingredients
        if (parsedIngredients && parsedIngredients.length > 0) {
          importedRecipe = {
            id: `imported-${Date.now()}`,
            title: decodeHTMLEntities(title),
            description: decodeHTMLEntities(desc),
            prepTime,
            cookTime,
            servings,
            difficulty: prepTime + cookTime > 45 ? "Medium" : "Easy",
            category,
            tags: ["Imported", category].filter(Boolean),
            image: imageUrl,
            sourceUrl: targetUrl,
            sourceName: extractDomain(targetUrl),
            equipment: extractEquipment(title, parsedIngredients, parsedInstructions),
            ingredients: parsedIngredients,
            instructions: parsedInstructions.length > 0 ? parsedInstructions : [
              { step: 1, text: "Click the reference link above to view full cooking procedures on the original website.", tip: "Detailed steps were not found in structured metadata." }
            ]
          };
        }
      }
      
      // Fallback 1: Keyword template match if schema fails
      if (!importedRecipe) {
        const apiKey = localStorage.getItem("cookbook_gemini_api_key") || "";
        if (apiKey) {
          importRecipeWithGemini(targetUrl, html, meta, apiKey, onStepChange, onComplete, onError, skipSave);
          return;
        }

        let matchedTemplate = null;
        const lowercaseUrl = targetUrl.toLowerCase();
        
        if (lowercaseUrl.includes("carbonara") || lowercaseUrl.includes("pasta")) {
          matchedTemplate = MOCK_IMPORTED_RECIPES.carbonara;
        } else if (lowercaseUrl.includes("salmon") || lowercaseUrl.includes("fish")) {
          matchedTemplate = MOCK_IMPORTED_RECIPES.salmon;
        } else if (lowercaseUrl.includes("brownie") || lowercaseUrl.includes("chocolate")) {
          matchedTemplate = MOCK_IMPORTED_RECIPES.brownie;
        }
        
        if (matchedTemplate) {
          importedRecipe = JSON.parse(JSON.stringify(matchedTemplate));
          importedRecipe.id = `imported-${Date.now()}`;
          importedRecipe.image = meta.image || getGourmetFoodImage(importedRecipe.title, importedRecipe.category);
          importedRecipe.sourceUrl = targetUrl;
          importedRecipe.sourceName = extractDomain(targetUrl);
        }
      }
      
      // Fallback 2: Query Online Database using clean URL words
      if (!importedRecipe) {
        const keyword = cleanPathQuery(targetUrl);
        onStepChange({ step: "structure", status: `Searching online databases for "${keyword}"...`, progress: 75 });
        
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(keyword)}`)
          .then(res => res.json())
          .then(dbData => {
            if (dbData && dbData.meals && dbData.meals.length > 0) {
              const meal = dbData.meals[0];
              const parsedRecipe = parseMealDBMealScraped(meal, targetUrl);
              
              onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
              setTimeout(() => {
                if (!skipSave) store.addRecipe(parsedRecipe);
                onComplete(parsedRecipe);
              }, 100);
            } else {
              const cleanTitle = getCleanDishName(meta.title, targetUrl);
              const fallbackRecipe = generateDynamicFallback(cleanTitle);
              fallbackRecipe.sourceUrl = targetUrl;
              fallbackRecipe.sourceName = extractDomain(targetUrl);
              fallbackRecipe.image = meta.image || getGourmetFoodImage(fallbackRecipe.title, fallbackRecipe.category);
              
              onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
              setTimeout(() => {
                if (!skipSave) store.addRecipe(fallbackRecipe);
                onComplete(fallbackRecipe);
              }, 100);
            }
          })
          .catch(() => {
            const cleanTitle = getCleanDishName(meta.title, targetUrl);
            const fallbackRecipe = generateDynamicFallback(cleanTitle);
            fallbackRecipe.sourceUrl = targetUrl;
            fallbackRecipe.sourceName = extractDomain(targetUrl);
            fallbackRecipe.image = meta.image || getGourmetFoodImage(fallbackRecipe.title, fallbackRecipe.category);
            
            onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
            setTimeout(() => {
              if (!skipSave) store.addRecipe(fallbackRecipe);
              onComplete(fallbackRecipe);
            }, 100);
          });
      } else {
        onStepChange({ step: "structure", status: "Formulating cooking instructions...", progress: 90 });
        setTimeout(() => {
          onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
          setTimeout(() => {
            if (!skipSave) store.addRecipe(importedRecipe);
            onComplete(importedRecipe);
          }, 100);
        }, 150);
      }
    })
    .catch(err => {
      console.error("Scraping failed, serving final metadata card", err);
      const domain = extractDomain(targetUrl);
      const fallbackMeta = {
        title: `Recipe from ${domain}`,
        description: `Imported recipe from ${targetUrl}`,
        image: getGourmetFoodImage(domain, "Mains")
      };
      
      const apiKey = localStorage.getItem("cookbook_gemini_api_key") || "";
      if (apiKey) {
        importRecipeWithGemini(targetUrl, "", fallbackMeta, apiKey, onStepChange, onComplete, onError, skipSave);
      } else {
        const cleanTitle = getCleanDishName(fallbackMeta.title, targetUrl);
        const fallbackRecipe = generateDynamicFallback(cleanTitle);
        fallbackRecipe.sourceUrl = targetUrl;
        fallbackRecipe.sourceName = domain;
        fallbackRecipe.image = fallbackMeta.image;
        
        onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
        setTimeout(() => {
          if (!skipSave) store.addRecipe(fallbackRecipe);
          onComplete(fallbackRecipe);
        }, 100);
      }
    });
}

function extractRecipeSchema(html) {
  try {
    const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        const recipe = findRecipeObject(json);
        if (recipe) return recipe;
      } catch (e) {
        // Skip invalid blocks
      }
    }
  } catch (e) {
    console.error("Failed to parse schema", e);
  }
  return null;
}

function findRecipeObject(obj) {
  if (!obj) return null;
  
  // If this object itself is a Recipe
  const type = obj["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
    return obj;
  }
  
  // If it's an array, search its elements
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
  } 
  // If it's an object, search all its properties
  else if (typeof obj === "object") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const found = findRecipeObject(obj[key]);
        if (found) return found;
      }
    }
  }
  
  return null;
}

function extractImage(imageField) {
  if (!imageField) return "";
  if (typeof imageField === "string") return imageField;
  if (Array.isArray(imageField)) {
    for (const img of imageField) {
      const res = extractImage(img);
      if (res) return res;
    }
  }
  if (typeof imageField === "object") {
    return imageField.url || imageField.contentUrl || "";
  }
  return "";
}

export function parseSchemaIngredients(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  
  const COMMON_UNITS = new Set([
    "cup", "cups", "c", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons",
    "oz", "ounce", "ounces", "g", "gram", "grams", "kg", "kilogram", "kilograms", "ml", "milliliter", "milliliters",
    "l", "liter", "liters", "pound", "pounds", "lb", "lbs", "pkg", "package", "packages", "can", "cans",
    "clove", "cloves", "slice", "slices", "piece", "pieces", "pinch", "pinches", "sprig", "sprigs", "head", "heads",
    "bunch", "bunches", "container", "containers", "bag", "bags", "bottle", "bottles", "jar", "jars"
  ]);

  return ingredients.map(ing => {
    if (!ing) return null;
    const ingStr = typeof ing === "string" ? ing : (ing.name || String(ing));
    const str = ingStr.replace(/<[^>]*>/g, "").trim();
    if (!str) return null;
    
    let quantity = 1;
    let unit = "pc";
    let name = str;
    
    // Extract leading number (integer, decimal, fraction, or mixed number)
    const numMatch = str.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/);
    if (numMatch) {
      const rawQty = numMatch[1].trim();
      
      // Parse the quantity value
      if (rawQty.includes("/")) {
        const parts = rawQty.split(/\s+/);
        if (parts.length > 1) {
          const whole = parseFloat(parts[0]);
          const fracParts = parts[1].split("/");
          quantity = whole + parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        } else {
          const fracParts = parts[0].split("/");
          quantity = parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        }
      } else {
        quantity = parseFloat(rawQty);
      }
      
      // The rest of the string after the number
      let rest = str.substring(numMatch[0].length).trim();
      
      // Remove leading "of" if it exists, e.g. "1/2 of an onion" -> "an onion"
      if (rest.toLowerCase().startsWith("of ")) {
        rest = rest.substring(3).trim();
      }
      
      // Get the first word of the rest string to see if it's a unit
      const restWords = rest.split(/\s+/);
      const firstWord = restWords[0].replace(/[^a-zA-Z]/g, ""); // clean word punctuation e.g. "cups." -> "cups"
      
      if (COMMON_UNITS.has(firstWord.toLowerCase())) {
        unit = firstWord;
        name = restWords.slice(1).join(" ");
        // If there was an "of" after unit, e.g. "1 cup of milk", remove the "of"
        if (name.toLowerCase().startsWith("of ")) {
          name = name.substring(3).trim();
        }
      } else {
        unit = "pc";
        name = rest;
      }
    }
    
    let category = "Pantry";
    const nameLower = name.toLowerCase();
    if (nameLower.includes("chicken") || nameLower.includes("beef") || nameLower.includes("pork") || nameLower.includes("turkey") || nameLower.includes("meat") || nameLower.includes("steak")) {
      category = "Meat";
    } else if (nameLower.includes("shrimp") || nameLower.includes("salmon") || nameLower.includes("fish") || nameLower.includes("seafood") || nameLower.includes("tuna")) {
      category = "Seafood";
    } else if (nameLower.includes("onion") || nameLower.includes("garlic") || nameLower.includes("tomato") || nameLower.includes("lemon") || nameLower.includes("spinach") || nameLower.includes("pepper") || nameLower.includes("ginger") || nameLower.includes("cilantro")) {
      category = "Produce";
    } else if (nameLower.includes("cheese") || nameLower.includes("butter") || nameLower.includes("milk") || nameLower.includes("cream") || nameLower.includes("yogurt") || nameLower.includes("mascarpone")) {
      category = "Dairy";
    }
    
    // Clean up double parentheticals and leading commas
    let cleanName = name
      .replace(/\(\((.*?)\)\)/g, "($1)")
      .replace(/\(\s*,\s*/g, "(")
      .replace(/\s+/g, " ")
      .trim();

    return {
      name: decodeHTMLEntities(cleanName).toLowerCase().trim(),
      quantity: isNaN(quantity) ? 1 : quantity,
      unit: unit.toLowerCase().trim() || "pc",
      category
    };
  }).filter(Boolean);
}

function parseSchemaInstructions(instructions) {
  if (!instructions) return [];
  
  const steps = [];
  
  function traverse(item) {
    if (!item) return;
    if (typeof item === "string") {
      steps.push(item);
    } else if (Array.isArray(item)) {
      item.forEach(traverse);
    } else if (typeof item === "object") {
      if (item["@type"] === "HowToStep" || item.text) {
        steps.push(item.text || item.name || "");
      } else if (item["@type"] === "HowToSection" || item.itemListElement) {
        traverse(item.itemListElement);
      } else if (item.name && !item.text) {
        steps.push(item.name);
      }
    }
  }
  
  traverse(instructions);
  
  return steps
    .map(text => text.replace(/<[^>]*>/g, "").trim())
    .filter(text => text.length > 5)
    .map((text, idx) => ({
      step: idx + 1,
      text: decodeHTMLEntities(text),
      tip: ""
    }));
}

function parseISO8601Duration(duration) {
  if (!duration) return 15;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (match) {
    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    return hours * 60 + minutes || 15;
  }
  return 15;
}

function extractMetaFallbacks(html) {
  const meta = { title: "", image: "", description: "" };
  
  // Extract <title>
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();
  
  // Helper to extract content from meta tags in any attribute order
  function getMetaTagContent(html, propertyOrName) {
    const regexes = [
      new RegExp(`<meta\\b[^>]*?(?:property|name)=["']${propertyOrName}["'][^>]*?content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta\\b[^>]*?content=["']([^"']+)["'][^>]*?(?:property|name)=["']${propertyOrName}["']`, "i")
    ];
    for (const regex of regexes) {
      const match = html.match(regex);
      if (match) return match[1].trim();
    }
    return "";
  }
  
  const ogTitle = getMetaTagContent(html, "og:title");
  if (ogTitle) meta.title = ogTitle;
  
  const ogImage = getMetaTagContent(html, "og:image");
  if (ogImage) meta.image = ogImage;
  
  const ogDesc = getMetaTagContent(html, "og:description");
  if (ogDesc) meta.description = ogDesc;
  
  const metaDesc = getMetaTagContent(html, "description");
  if (metaDesc && !meta.description) meta.description = metaDesc;
  
  if (meta.title) meta.title = decodeHTMLEntities(meta.title);
  if (meta.description) meta.description = decodeHTMLEntities(meta.description);
  
  return meta;
}

function decodeHTMLEntities(text) {
  if (!text) return "";
  if (typeof document !== "undefined") {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  }
  // Node fallback
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&nbsp;/g, " ");
}

function cleanPathQuery(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const lastSegment = path.split("/").filter(Boolean).pop() || "";
    
    const cleanSegment = lastSegment
      .replace(/[\-_]/g, " ")
      .replace(/\.html?$/i, "")
      .replace(/\d+/g, "")
      .trim();
      
    const commonWords = [
      "easy", "recipe", "cook", "quick", "healthy", "classic", 
      "homemade", "best", "authentic", "style", "step", "by"
    ];
    
    let words = cleanSegment.split(/\s+/);
    words = words.filter(w => !commonWords.includes(w.toLowerCase()) && w.length > 2);
    
    return words.slice(0, 3).join(" ") || "chicken";
  } catch(e) {
    return "chicken";
  }
}

function serveFinalMetaFallback(meta, url, onStepChange, onComplete, skipSave = false) {
  const title = decodeHTMLEntities(meta.title) || `Recipe from ${extractDomain(url)}`;
  const finalRecipe = {
    id: `imported-${Date.now()}`,
    title: title,
    description: decodeHTMLEntities(meta.description) || `Imported recipe from ${url}.`,
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    category: "Mains",
    tags: ["Imported"],
    image: meta.image || getGourmetFoodImage(title, "Mains"),
    sourceUrl: url,
    sourceName: extractDomain(url),
    equipment: extractEquipment(title, [], [{ text: "Click the reference link above to view full cooking procedures on the original website." }]),
    ingredients: [
      { name: "refer to original link for ingredients", quantity: 1, unit: "pc", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Click the reference link above to view full cooking procedures on the original website.", tip: "This page does not support direct extraction for this domain." }
    ]
  };
  onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
  setTimeout(() => {
    if (!skipSave) store.addRecipe(finalRecipe);
    onComplete(finalRecipe);
  }, 100);
}

function parseMealDBMealScraped(meal, url) {
  const title = meal.strMeal;
  const category = mapMealDBCategoryScraped(meal.strCategory);
  
  let rawInst = meal.strInstructions || "";
  let lines = rawInst.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 5);
  
  if (lines.length <= 1 && rawInst.includes(".")) {
    lines = rawInst.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 5);
  }
  
  const instructions = lines.map((line, idx) => {
    const cleanText = line.replace(/^\d+[\.\-\s]*/, "").trim();
    const text = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    
    let tip = "";
    if (text.toLowerCase().includes("heat")) {
      tip = "Maintain medium heat to ensure ingredients do not scorch.";
    } else if (text.toLowerCase().includes("bake") || text.toLowerCase().includes("oven")) {
      tip = "Make sure your oven is preheated fully before placing the dish inside.";
    } else if (text.toLowerCase().includes("salt") || text.toLowerCase().includes("season")) {
      tip = "Season incrementally and taste along the way.";
    }
    
    return {
      step: idx + 1,
      text: text.endsWith(".") ? text : text + ".",
      tip: tip || null
    };
  });
  
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      const cleanName = name.toLowerCase().trim();
      const cleanMeasure = measure ? measure.trim() : "";
      
      let quantity = 1;
      let unit = "pc";
      
      if (cleanMeasure) {
        const numMatch = cleanMeasure.match(/^(\d+(?:\/\d+)?|\d+\.\d+)?\s*(.*)$/);
        if (numMatch) {
          const rawQty = numMatch[1];
          if (rawQty) {
            if (rawQty.includes("/")) {
              const parts = rawQty.split("/");
              quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
            } else {
              quantity = parseFloat(rawQty);
            }
          }
          unit = numMatch[2].trim() || "pc";
        }
      }
      
      let ingCategory = "Pantry";
      if (cleanName.includes("chicken") || cleanName.includes("beef") || cleanName.includes("pork") || cleanName.includes("turkey") || cleanName.includes("bacon")) {
        ingCategory = "Meat";
      } else if (cleanName.includes("shrimp") || cleanName.includes("salmon") || cleanName.includes("fish") || cleanName.includes("tuna")) {
        ingCategory = "Seafood";
      } else if (cleanName.includes("onion") || cleanName.includes("garlic") || cleanName.includes("tomato") || cleanName.includes("lemon") || cleanName.includes("spinach") || cleanName.includes("pepper") || cleanName.includes("ginger") || cleanName.includes("cilantro")) {
        ingCategory = "Produce";
      } else if (cleanName.includes("cheese") || cleanName.includes("butter") || cleanName.includes("milk") || cleanName.includes("cream") || cleanName.includes("yogurt")) {
        ingCategory = "Dairy";
      }
      
      ingredients.push({
        name: cleanName,
        quantity: isNaN(quantity) ? 1 : quantity,
        unit: unit || "pc",
        category: ingCategory
      });
    }
  }

  const prepTime = 15;
  const cookTime = category === "Baking" ? 30 : category === "Seafood" ? 12 : 20;
  
  const sourceUrl = meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`;
  let sourceName = "TheMealDB";
  if (meal.strSource) {
    try {
      sourceName = new URL(meal.strSource).hostname.replace("www.", "");
    } catch(e) {}
  }
  
  return {
    id: `generated-${meal.idMeal}-${Date.now()}`,
    title: meal.strMeal,
    description: `An authentic recipe for ${meal.strMeal} sourced from ${sourceName} via TheMealDB API.`,
    prepTime,
    cookTime,
    servings: 4,
    difficulty: "Medium",
    category,
    tags: [meal.strArea, meal.strCategory].filter(Boolean),
    image: meal.strMealThumb,
    sourceUrl: url,
    sourceName: extractDomain(url),
    equipment: extractEquipment(title, ingredients, instructions),
    ingredients,
    instructions
  };
}

function mapMealDBCategoryScraped(cat) {
  if (!cat) return "Mains";
  const c = cat.toLowerCase();
  if (c.includes("beef") || c.includes("chicken") || c.includes("pork") || c.includes("lamb") || c.includes("goat") || c.includes("miscellaneous")) {
    return "Mains";
  }
  if (c.includes("dessert")) {
    return "Baking";
  }
  if (c.includes("pasta")) {
    return "Pasta";
  }
  if (c.includes("seafood")) {
    return "Seafood";
  }
  if (c.includes("side") || c.includes("vegetarian") || c.includes("vegan")) {
    return "Salad";
  }
  if (c.includes("breakfast") || c.includes("starter")) {
    return "Breakfast";
  }
  return "Mains";
}

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    return "external website";
  }
}

/**
 * Calls Google Gemini AI to analyze a TikTok video url / metadata and extract a structured recipe.
 */
export async function importTikTokRecipe(url, apiKey, onStepChange, onComplete, onError, skipSave = false) {
  onStepChange({ step: "connect", status: "Tuning into TikTok video...", progress: 15 });
  
  try {
    onStepChange({ step: "extract", status: "Extracting video metadata...", progress: 40 });
    let pageHtml = "";
    let extractedText = "";
    
    try {
      pageHtml = await fetchHtmlThroughProxy(url);
    } catch (e) {
      console.warn("Failed to fetch TikTok page HTML via proxy, proceeding with URL keywords", e);
    }
    
    if (pageHtml) {
      const titleMatch = pageHtml.match(/<title>([\s\S]*?)<\/title>/i);
      const ogDescMatch = pageHtml.match(/<meta\b[^>]*?(?:property|name)=["']og:description["'][^>]*?content=["']([^"']+)["']/i) ||
                          pageHtml.match(/<meta\b[^>]*?content=["']([^"']+)["'][^>]*?(?:property|name)=["']og:description["']/i);
      
      const title = titleMatch ? titleMatch[1] : "";
      const description = ogDescMatch ? ogDescMatch[1] : "";
      extractedText = `Title: ${title}\nDescription: ${description}`;
    }
    
    onStepChange({ step: "structure", status: "Running Gemini Culinary AI Analysis...", progress: 70 });
    
    const prompt = `
You are an expert Chef and Culinary AI. Analyze the following TikTok cooking video metadata or URL and generate a complete, structured recipe.

TikTok URL: ${url}
${extractedText ? `Scraped Web Details:\n${extractedText}\n` : ""}

Reconstruct the culinary recipe represented in this TikTok video.
If the scraped description contains details of ingredients or steps, structure them accurately.
If the details are brief, identify the dish being made (e.g. from the title or URL keywords) and generate a high-quality, verified version of that specific viral/popular TikTok dish (e.g. Baked Feta Pasta, Big Mac Tacos, Pesto Eggs, etc.) using your culinary knowledge.

Provide the response in the following strict JSON schema (no extra text, no markdown wrappers like \`\`\`json):
{
  "title": "A short descriptive recipe title (e.g., Viral Baked Feta Pasta)",
  "description": "A 1-2 sentence description explaining the dish and its TikTok origin",
  "prepTime": 10,
  "cookTime": 15,
  "servings": 4,
  "difficulty": "Easy",
  "category": "Pasta",
  "tags": ["TikTok", "Viral", "Easy"],
  "ingredients": [
    { "name": "pasta (e.g. penne)", "quantity": 400, "unit": "g", "category": "Pantry" }
  ],
  "instructions": [
    { "step": 1, "text": "Step description...", "tip": "Chef's tip for this step" }
  ]
}

Make sure categories for ingredients are one of: "Meat", "Seafood", "Produce", "Dairy", "Pantry".
Difficulty should be "Easy", "Medium", or "Hard".
Category should be one of "Pasta", "Seafood", "Baking", "Mains", "Salad", "Breakfast", "Soup".
Ensure all properties are completed.
`;

    const endpoint = getGeminiEndpoint();
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("Empty response returned from Gemini API");
    }
    
    let recipeData;
    try {
      recipeData = JSON.parse(generatedText.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON", generatedText, parseError);
      const cleanJson = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
      recipeData = JSON.parse(cleanJson);
    }
    
    recipeData.id = `imported-tiktok-${Date.now()}`;
    recipeData.sourceUrl = url;
    recipeData.sourceName = "TikTok";
    recipeData.image = getGourmetFoodImage(recipeData.title, recipeData.category);
    recipeData.equipment = extractEquipment(recipeData.title, recipeData.ingredients, recipeData.instructions);
    
    onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
    
    setTimeout(() => {
      if (!skipSave) {
        store.addRecipe(recipeData);
      }
      onComplete(recipeData);
    }, 100);
    
  } catch (error) {
    console.error("TikTok recipe import error:", error);
    if (onError) {
      onError(error.message || "An unknown error occurred during AI analysis.");
    }
  }
}

/**
 * Calls Google Gemini AI to extract/infer a structured recipe from standard webpage text snippet or URL.
 */
async function importRecipeWithGemini(url, html, meta, apiKey, onStepChange, onComplete, onError, skipSave = false) {
  onStepChange({ step: "structure", status: "Running Gemini Culinary AI extraction...", progress: 75 });
  
  try {
    const cleanedText = cleanHtmlToText(html);
    const domain = extractDomain(url);
    const cleanTitle = getCleanDishName(meta.title, url);
    
    const prompt = `
You are an expert Chef and Culinary AI. Extract a complete, structured recipe from the webpage content or URL.

Webpage URL: ${url}
Scraped Title: ${cleanTitle}
Scraped Description: ${meta.description || ""}

${cleanedText ? `Cleaned Webpage Text Snippet:\n${cleanedText}\n` : ""}

Reconstruct the culinary recipe represented on this page. 
If the webpage text snippet contains the ingredients and steps, extract them accurately.
If the webpage text snippet is incomplete or missing, infer the correct ingredients, steps, categories, and prep/cook times for the dish ("${cleanTitle}") using your culinary knowledge, ensuring it is authentic to this style of cooking.

Provide the response in the following strict JSON schema (no extra text, no markdown wrappers like \`\`\`json):
{
  "title": "Recipe Title",
  "description": "A 1-2 sentence description explaining the dish",
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "difficulty": "Easy",
  "category": "Mains",
  "tags": ["Imported"],
  "ingredients": [
    { "name": "ingredient name", "quantity": 1, "unit": "pc", "category": "Pantry" }
  ],
  "instructions": [
    { "step": 1, "text": "Step description...", "tip": "Chef's tip for this step" }
  ]
}

Make sure categories for ingredients are one of: "Meat", "Seafood", "Produce", "Dairy", "Pantry".
Difficulty should be "Easy", "Medium", or "Hard".
Category should be one of "Pasta", "Seafood", "Baking", "Mains", "Salad", "Breakfast", "Soup".
Ensure all properties are completed.
`;

    const endpoint = getGeminiEndpoint();
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("Empty response from Gemini API");
    }
    
    let recipeData;
    try {
      recipeData = JSON.parse(generatedText.trim());
    } catch (parseError) {
      const cleanJson = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
      recipeData = JSON.parse(cleanJson);
    }
    
    recipeData.id = `imported-gemini-${Date.now()}`;
    recipeData.sourceUrl = url;
    recipeData.sourceName = domain;
    recipeData.image = meta.image || getGourmetFoodImage(recipeData.title, recipeData.category);
    recipeData.equipment = extractEquipment(recipeData.title, recipeData.ingredients, recipeData.instructions);
    
    onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
    
    setTimeout(() => {
      if (!skipSave) {
        store.addRecipe(recipeData);
      }
      onComplete(recipeData);
    }, 100);
    
  } catch (error) {
    console.error("Gemini fallback extraction failed, serving fallback:", error);
    const domain = extractDomain(url);
    const cleanTitle = getCleanDishName(meta.title, url);
    const fallbackRecipe = generateDynamicFallback(cleanTitle);
    fallbackRecipe.sourceUrl = url;
    fallbackRecipe.sourceName = domain;
    fallbackRecipe.image = meta.image || getGourmetFoodImage(fallbackRecipe.title, fallbackRecipe.category);
    
    onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
    setTimeout(() => {
      if (!skipSave) {
        store.addRecipe(fallbackRecipe);
      }
      onComplete(fallbackRecipe);
    }, 100);
  }
}

function cleanHtmlToText(html) {
  if (!html) return "";
  let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  text = text.replace(/<[^>]*>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text.substring(0, 8000);
}
