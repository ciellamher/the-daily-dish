// URL Recipe Importer Logic & Scraper Simulator

import { store } from "../store.js";
import { getGourmetFoodImage } from "../utils.js";

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
 * Simulates importing a recipe from a URL.
 * Takes the URL, triggers a multi-step callback, saves the recipe to store, and returns the imported recipe.
 */
export function simulateRecipeImport(url, onStepChange, onComplete) {
  const lowercaseUrl = url.toLowerCase();
  
  // Decide which recipe to mock based on URL keywords
  let selectedRecipeKey = "default";
  if (lowercaseUrl.includes("carbonara") || lowercaseUrl.includes("pasta") || lowercaseUrl.includes("spaghetti")) {
    selectedRecipeKey = "carbonara";
  } else if (lowercaseUrl.includes("salmon") || lowercaseUrl.includes("fish") || lowercaseUrl.includes("seafood")) {
    selectedRecipeKey = "salmon";
  } else if (lowercaseUrl.includes("brownie") || lowercaseUrl.includes("chocolate") || lowercaseUrl.includes("cookie") || lowercaseUrl.includes("sweet")) {
    selectedRecipeKey = "brownie";
  }

  // Deep copy the template
  const recipeTemplate = MOCK_IMPORTED_RECIPES[selectedRecipeKey];
  const importedRecipe = JSON.parse(JSON.stringify(recipeTemplate));
  
  // Customize the ID based on timestamp
  importedRecipe.id = `imported-${Date.now()}`;
  // Add metadata
  importedRecipe.image = getGourmetFoodImage(importedRecipe.title, importedRecipe.category);
  importedRecipe.tags.push("Imported");
  importedRecipe.description = `[Imported from ${extractDomain(url)}] ${importedRecipe.description}`;

  // Run the multi-step simulator
  let progress = 0;
  
  // Step 1: Connecting
  onStepChange({ step: "connect", status: "Connecting to server...", progress: 20 });
  
  setTimeout(() => {
    // Step 2: Extracting
    onStepChange({ step: "extract", status: "Downloading HTML & finding recipe cards...", progress: 55 });
    
    setTimeout(() => {
      // Step 3: Structuring
      onStepChange({ step: "structure", status: "AI Extracting ingredients list and preparation procedures...", progress: 85 });
      
      setTimeout(() => {
        // Step 4: Saving
        onStepChange({ step: "save", status: "Formatting quantities and baking instructions...", progress: 100 });
        
        setTimeout(() => {
          // Add to store database
          store.addRecipe(importedRecipe);
          
          // Complete
          onComplete(importedRecipe);
        }, 600);
      }, 1000);
    }, 1000);
  }, 1000);
}

/**
 * Extracts domain name from a URL.
 */
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    return "external website";
  }
}
