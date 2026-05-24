// AI Recipe Generator Component (Client-side Simulation)

import { store } from "../store.js";
import { getGourmetFoodImage } from "../utils.js";

// Rich recipes templates for popular keyword matches
const PREDEFINED_AI_TEMPLATES = {
  pizza: {
    title: "Classic Pepperoni Pizza",
    description: "A homemade thin-crust pizza topped with rich tomato sauce, melted mozzarella cheese, and crispy pepperoni slices.",
    prepTime: 20,
    cookTime: 12,
    servings: 2,
    difficulty: "Medium",
    category: "Baking",
    tags: ["Pizza", "Baking", "Comfort Food"],
    equipment: [
      { name: "Pizza Stone or Baking Sheet", icon: "sheet" },
      { name: "Rolling Pin", icon: "rollingPin" },
      { name: "Pizza Cutter", icon: "cutter" }
    ],
    ingredients: [
      { name: "pizza dough (store-bought or homemade)", quantity: 1, unit: "pc", category: "Pantry" },
      { name: "pizza sauce or marinara", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "shredded mozzarella cheese", quantity: 1.5, unit: "cups", category: "Dairy" },
      { name: "pepperoni slices", quantity: 20, unit: "pcs", category: "Meat" },
      { name: "olive oil (for crust)", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "dried oregano", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Preheat your oven to 450°F (230°C). If using a pizza stone, place it in the oven while preheating.", tip: "A hot baking surface is crucial for a crispy bottom crust." },
      { step: 2, text: "Roll out the pizza dough on a lightly floured surface into a 12-inch circle. Transfer to parchment paper or a cornmeal-dusted pizza peel.", tip: "If the dough keeps shrinking back, let it rest at room temp for 10 minutes." },
      { step: 3, text: "Spread the pizza sauce evenly over the dough, leaving a 1/2-inch border around the edges.", tip: "Don't use too much sauce or the pizza will become soggy!" },
      { step: 4, text: "Sprinkle the shredded mozzarella cheese evenly over the sauce, then arrange the pepperoni slices on top.", tip: "Add a pinch of red pepper flakes here if you like heat." },
      { step: 5, text: "Brush the outer crust lightly with olive oil. Bake for 10-12 minutes until the cheese is melted and bubbly and the crust is golden brown.", tip: "Watch closely in the last few minutes - ovens can vary!" },
      { step: 6, text: "Remove from the oven, sprinkle with dried oregano, slice with a pizza cutter, and serve hot.", tip: "Let it cool for 2 minutes before slicing so the cheese doesn't slide off." }
    ]
  },
  burger: {
    title: "The Ultimate Classic Cheeseburger",
    description: "Juicy pan-seared beef patties with melted cheddar cheese, crisp lettuce, tomato, pickles, and a secret burger sauce on toasted brioche buns.",
    prepTime: 10,
    cookTime: 8,
    servings: 2,
    difficulty: "Easy",
    category: "Mains",
    tags: ["Burgers", "Quick", "Comfort Food"],
    equipment: [
      { name: "Cast Iron Skillet", icon: "pan" },
      { name: "Spatula", icon: "spatula" },
      { name: "Small Bowl", icon: "bowl" }
    ],
    ingredients: [
      { name: "ground beef (80/20 lean-to-fat)", quantity: 350, unit: "g", category: "Meat" },
      { name: "cheddar cheese slices", quantity: 2, unit: "pcs", category: "Dairy" },
      { name: "brioche burger buns, split", quantity: 2, unit: "pcs", category: "Pantry" },
      { name: "butter (for toasting buns)", quantity: 1, unit: "tbsp", category: "Dairy" },
      { name: "tomato, sliced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "lettuce leaves", quantity: 2, unit: "pcs", category: "Produce" },
      { name: "dill pickle slices", quantity: 6, unit: "pcs", category: "Produce" },
      { name: "mayonnaise", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "ketchup", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "yellow mustard", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "salt and pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a small bowl, mix mayonnaise, ketchup, and yellow mustard to create the secret burger sauce. Set aside.", tip: "Add a splash of pickle juice to the sauce for extra tang." },
      { step: 2, text: "Divide the ground beef and shape into 2 round patties, about 3/4-inch thick. Press your thumb in the center to make a indentation.", tip: "Indenting the center stops the burger from puffing up into a dome while cooking." },
      { step: 3, text: "Spread butter on the cut sides of the brioche buns. Heat a skillet over medium heat and toast the buns until golden. Remove buns.", tip: "Toasting creates a barrier so the bun doesn't get soggy from the burger juices." },
      { step: 4, text: "Turn heat up to high. Season both sides of the beef patties generously with salt and pepper. Sear for 3-4 minutes on the first side.", tip: "Don't press down on the burgers with the spatula - you'll squeeze out all the juice!" },
      { step: 5, text: "Flip the patties. Immediately place a cheddar slice on top of each. Cook for 2-3 minutes. Cover the skillet for the last 30 seconds to melt the cheese.", tip: "Pouring a teaspoon of water in the skillet and covering creates steam that melts the cheese instantly." },
      { step: 6, text: "Spread secret sauce on both buns. Assemble with lettuce, tomato, burger patty with cheese, pickles, and serve warm.", tip: "Serve alongside crispy french fries or onion rings." }
    ]
  },
  curry: {
    title: "Creamy Coconut Chicken Curry",
    description: "Tender chicken pieces simmered in an aromatic, rich yellow coconut curry sauce with bell peppers and onions.",
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    category: "Mains",
    tags: ["Curry", "Warm", "Spicy"],
    equipment: [
      { name: "Large Pot or Dutch Oven", icon: "pot" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Wooden Spoon", icon: "spoon" }
    ],
    ingredients: [
      { name: "boneless chicken breasts, cubed", quantity: 500, unit: "g", category: "Meat" },
      { name: "coconut milk, canned", quantity: 400, unit: "ml", category: "Pantry" },
      { name: "yellow curry powder", quantity: 1.5, unit: "tbsp", category: "Pantry" },
      { name: "onion, chopped", quantity: 1, unit: "pc", category: "Produce" },
      { name: "red bell pepper, sliced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "fresh ginger, grated", quantity: 1, unit: "tbsp", category: "Produce" },
      { name: "olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "chicken broth", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "salt and pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Heat olive oil in a large pot over medium heat. Add chopped onion and bell pepper; cook for 4-5 minutes until softened.", tip: "Stir occasionally so the onions don't brown too quickly." },
      { step: 2, text: "Stir in the minced garlic, grated ginger, and curry powder. Cook for 1 minute until highly fragrant.", tip: "Blooming the spices in oil releases their fat-soluble aromatic oils." },
      { step: 3, text: "Add the cubed chicken breasts, season with salt and pepper, and cook for 5 minutes, browning the chicken slightly on all sides.", tip: "The chicken doesn't need to cook all the way through yet; it will finish in the sauce." },
      { step: 4, text: "Pour in the coconut milk and chicken broth. Stir well to scrape up any browned bits from the bottom of the pot.", tip: "Use full-fat coconut milk for the richest, creamiest sauce." },
      { step: 5, text: "Bring to a boil, then reduce heat to low and simmer uncovered for 10-12 minutes until the chicken is cooked through and sauce is thickened.", tip: "Simmering without a lid lets the excess liquid evaporate, thickening the curry naturally." },
      { step: 6, text: "Taste and add a splash of lime juice or fish sauce if desired. Serve hot over jasmine rice.", tip: "Top with fresh cilantro leaves for a bright finishing touch." }
    ]
  },
  taco: {
    title: "Street-Style Beef Tacos",
    description: "Savory seasoned ground beef served in warm corn tortillas, topped with finely diced onions, fresh cilantro, and lime wedges.",
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    difficulty: "Easy",
    category: "Mains",
    tags: ["Tacos", "Quick", "Mexican"],
    equipment: [
      { name: "Large Skillet", icon: "pan" },
      { name: "Chef's Knife", icon: "knife" }
    ],
    ingredients: [
      { name: "lean ground beef", quantity: 500, unit: "g", category: "Meat" },
      { name: "chili powder", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "ground cumin", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "onion, finely diced", quantity: 0.5, unit: "cup", category: "Produce" },
      { name: "fresh cilantro, chopped", quantity: 0.25, unit: "cup", category: "Produce" },
      { name: "corn tortillas", quantity: 8, unit: "pcs", category: "Pantry" },
      { name: "lime, cut into wedges", quantity: 1, unit: "pc", category: "Produce" },
      { name: "olive oil", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "salt and pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a skillet, heat 1 teaspoon of olive oil over medium-high heat. Add ground beef and cook for 6-8 minutes, breaking it apart with a spoon, until fully browned. Drain excess grease.", tip: "Draining the fat keeps the tacos light and prevents soggy tortillas." },
      { step: 2, text: "Stir in the chili powder, cumin, salt, pepper, and 3 tablespoons of water. Simmer on low for 2-3 minutes until water is absorbed.", tip: "Adding a little water helps coat the beef evenly in the seasonings." },
      { step: 3, text: "While beef is simmering, warm the corn tortillas in a dry skillet over medium heat for 30 seconds per side until pliable.", tip: "Keep warmed tortillas wrapped in a clean kitchen towel so they stay soft and warm." },
      { step: 4, text: "Spoon the seasoned beef onto double-layered corn tortillas (street style).", tip: "Two tortillas prevent tearing from meat juices." },
      { step: 5, text: "Top with a sprinkle of finely diced raw onion and fresh chopped cilantro.", tip: "The raw onion adds a crunchy, sharp bite that balances the rich meat." },
      { step: 6, text: "Serve warm with lime wedges on the side to squeeze over the tacos.", tip: "Pair with your favorite hot sauce or guacamole!" }
    ]
  },
  pancake: {
    title: "Golden Buttermilk Pancakes",
    description: "Light, fluffy, and golden pancakes served with a pat of butter and warm maple syrup.",
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    difficulty: "Easy",
    category: "Breakfast",
    tags: ["Breakfast", "Sweet", "Quick"],
    equipment: [
      { name: "Non-stick Griddle or Skillet", icon: "pan" },
      { name: "Mixing Bowls", icon: "bowl" },
      { name: "Whisk", icon: "bowl" },
      { name: "Spatula", icon: "spoon" }
    ],
    ingredients: [
      { name: "all-purpose flour", quantity: 1.5, unit: "cups", category: "Pantry" },
      { name: "baking powder", quantity: 3, unit: "tsp", category: "Pantry" },
      { name: "granulated sugar", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "buttermilk (or regular milk)", quantity: 1.25, unit: "cups", category: "Dairy" },
      { name: "egg", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "unsalted butter, melted", quantity: 3, unit: "tbsp", category: "Dairy" },
      { name: "salt", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "maple syrup (for serving)", quantity: 0.25, unit: "cup", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a large bowl, whisk together the flour, baking powder, sugar, and salt.", tip: "Sifting the flour makes the pancakes lighter!" },
      { step: 2, text: "In a separate bowl, whisk buttermilk, egg, and melted butter together.", tip: "Make sure melted butter isn't hot, or it will cook the egg." },
      { step: 3, text: "Pour the wet ingredients into the dry. Stir gently with a spoon just until combined. Batter should be thick and lumpy.", tip: "Do not overmix! An overmixed batter develops gluten, making the pancakes chewy instead of fluffy." },
      { step: 4, text: "Preheat a non-stick skillet over medium heat. Melt a tiny pat of butter on the surface.", tip: "If the butter burns, the skillet is too hot!" },
      { step: 5, text: "Pour 1/4 cup of batter per pancake. Cook for 2-3 minutes until bubbles form on the surface and the edges look set. Flip and cook for 1-2 minutes until golden on the other side.", tip: "Flip when bubbles pop and leave open holes - that's the sign they're ready." },
      { step: 6, text: "Stack on plates, top with butter and maple syrup, and serve warm.", tip: "Add fresh blueberries or chocolate chips to the batter in the pan before flipping!" }
    ]
  }
};

/**
 * Intelligent Fallback generator that builds a recipe on the fly based on search keywords.
 */
function generateDynamicFallback(query) {
  const cleanQuery = query.trim().replace(/[^\w\s-]/g, "");
  
  // Title formatting: capitalize first letters
  const title = cleanQuery
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const lowerQuery = cleanQuery.toLowerCase();
  
  // Guess category
  let category = "Gourmet";
  if (lowerQuery.includes("salad")) category = "Salads";
  else if (lowerQuery.includes("soup") || lowerQuery.includes("stew")) category = "Soups";
  else if (lowerQuery.includes("pasta") || lowerQuery.includes("spaghetti") || lowerQuery.includes("noodles")) category = "Pasta";
  else if (lowerQuery.includes("cake") || lowerQuery.includes("cookie") || lowerQuery.includes("bake") || lowerQuery.includes("bread")) category = "Baking";
  else if (lowerQuery.includes("breakfast") || lowerQuery.includes("egg") || lowerQuery.includes("toast")) category = "Breakfast";
  else if (lowerQuery.includes("drink") || lowerQuery.includes("smoothie") || lowerQuery.includes("shake")) category = "Beverages";

  // Estimates based on category
  let prepTime = 10;
  let cookTime = 15;
  let difficulty = "Easy";
  
  if (category === "Salads" || category === "Breakfast") {
    cookTime = 5;
  } else if (category === "Baking") {
    prepTime = 15;
    cookTime = 25;
  } else if (lowerQuery.includes("steak") || lowerQuery.includes("chicken") || lowerQuery.includes("rice")) {
    cookTime = 20;
  }
  
  if (lowerQuery.includes("beef") || lowerQuery.includes("roast") || lowerQuery.includes("curry")) {
    difficulty = "Medium";
  }

  // Compile ingredients based on keywords
  const ingredients = [
    { name: "salt", quantity: 1, unit: "tsp", category: "Pantry" },
    { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
  ];

  // Add cooking fats
  if (category === "Baking") {
    ingredients.unshift({ name: "butter, softened", quantity: 0.5, unit: "cup", category: "Dairy" });
  } else {
    ingredients.unshift({ name: "olive oil", quantity: 2, unit: "tbsp", category: "Pantry" });
    ingredients.unshift({ name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" });
  }

  // Detect and inject proteins
  let primaryProtein = "";
  if (lowerQuery.includes("chicken")) {
    primaryProtein = "chicken";
    ingredients.push({ name: "boneless chicken breasts, diced", quantity: 500, unit: "g", category: "Meat" });
  } else if (lowerQuery.includes("beef") || lowerQuery.includes("steak")) {
    primaryProtein = "beef";
    ingredients.push({ name: "sirloin beef or ground beef", quantity: 450, unit: "g", category: "Meat" });
  } else if (lowerQuery.includes("shrimp") || lowerQuery.includes("seafood")) {
    primaryProtein = "shrimp";
    ingredients.push({ name: "raw shrimp, peeled and deveined", quantity: 350, unit: "g", category: "Seafood" });
  } else if (lowerQuery.includes("tofu")) {
    primaryProtein = "tofu";
    ingredients.push({ name: "firm tofu, drained and cubed", quantity: 400, unit: "g", category: "Produce" });
  } else if (lowerQuery.includes("pork") || lowerQuery.includes("bacon")) {
    primaryProtein = "pork";
    ingredients.push({ name: "pork chops or thick-cut bacon", quantity: 300, unit: "g", category: "Meat" });
  }

  // Detect and inject base carbohydrate
  if (category === "Pasta") {
    ingredients.push({ name: "tagliatelle or penne pasta", quantity: 350, unit: "g", category: "Pantry" });
    ingredients.push({ name: "grated parmesan cheese", quantity: 0.5, unit: "cup", category: "Dairy" });
  } else if (lowerQuery.includes("rice")) {
    ingredients.push({ name: "long-grain white rice or jasmine rice", quantity: 1.5, unit: "cups", category: "Pantry" });
  } else if (lowerQuery.includes("toast") || lowerQuery.includes("sandwich")) {
    ingredients.push({ name: "crusty artisan bread slices", quantity: 4, unit: "pcs", category: "Pantry" });
  } else if (category === "Baking") {
    ingredients.push({ name: "all-purpose flour", quantity: 2, unit: "cups", category: "Pantry" });
    ingredients.push({ name: "granulated sugar", quantity: 0.75, unit: "cup", category: "Pantry" });
    ingredients.push({ name: "eggs", quantity: 2, unit: "pcs", category: "Dairy" });
  }

  // Detect custom secondary ingredients in search query
  const keywords = ["avocado", "tomato", "basil", "pesto", "spinach", "lemon", "honey", "cheese", "cream", "mushroom", "onion", "bell pepper"];
  keywords.forEach(word => {
    if (lowerQuery.includes(word) && !ingredients.some(i => i.name.includes(word))) {
      let unit = "cup";
      let qty = 0.5;
      let cat = "Produce";
      
      if (word === "lemon") { unit = "pc"; qty = 1; }
      if (word === "honey") { unit = "tbsp"; qty = 2; cat = "Pantry"; }
      if (word === "pesto") { unit = "cup"; qty = 0.5; cat = "Pantry"; }
      if (word === "cheese" || word === "cream") { unit = "cup"; qty = 1; cat = "Dairy"; }
      
      ingredients.push({ name: `fresh ${word}`, quantity: qty, unit: unit, category: cat });
    }
  });

  // Base equipment list
  const equipment = [
    { name: "Chef's Knife", icon: "knife" },
    { name: "Cutting Board", icon: "board" }
  ];
  if (category === "Baking") {
    equipment.push({ name: "Mixing Bowl", icon: "bowl" });
    equipment.push({ name: "Baking Pan", icon: "sheet" });
  } else {
    equipment.push({ name: "Large Skillet or Pot", icon: "pan" });
    equipment.push({ name: "Cooking Spatula", icon: "spoon" });
  }

  // Compile instructions
  const instructions = [];
  let step = 1;
  
  instructions.push({
    step: step++,
    text: `Gather all ingredients. Prep your workspace, wash any fresh vegetables, and measure out your seasonings.`,
    tip: "Mise en place (having everything ready beforehand) makes cooking stress-free!"
  });

  if (category === "Baking") {
    instructions.push({
      step: step++,
      text: `In a large bowl, whisk together the dry ingredients (flour, sugar, seasonings). In another bowl, combine the wet ingredients (melted butter, eggs, liquids).`,
      tip: "Whisking dry ingredients first breaks up lumps and aerates the mixture."
    });
    instructions.push({
      step: step++,
      text: `Slowly fold the wet ingredients into the dry ingredients. Mix until just combined, taking care not to overmix. Fold in any secondary flavor items.`,
      tip: "Overmixing causes gluten formation, making your bake tough rather than soft."
    });
    instructions.push({
      step: step++,
      text: `Preheat your oven. Grease a baking pan or line it with parchment paper, then pour or scoop the batter into the pan.`,
      tip: "Parchment paper prevents sticking and makes cleaning a breeze."
    });
    instructions.push({
      step: step++,
      text: `Bake for ${cookTime} minutes, or until the center is cooked through and a toothpick inserted comes out clean. Let it cool on a cooling rack.`,
      tip: "Don't open the oven door too early, or the center might collapse!"
    });
  } else {
    // Cooking instructions
    if (primaryProtein) {
      instructions.push({
        step: step++,
        text: `Season your ${primaryProtein} with salt and pepper. Heat your skillet over medium-high heat with olive oil (or butter). Sear the protein until golden brown and cooked through. Set aside on a plate.`,
        tip: "Searing first seals in the moisture, keeping the meat juicy."
      });
    }
    
    // Cook aromatics/veg
    const veggiesList = ingredients.filter(i => i.category === "Produce" && i.name !== "garlic");
    const vegText = veggiesList.length > 0 ? veggiesList.map(v => v.name).join(", ") : "onions and aromatics";
    instructions.push({
      step: step++,
      text: `Turn skillet down to medium. Add minced garlic and any fresh vegetables (like ${vegText}). Sauté for 3-5 minutes until tender and fragrant.`,
      tip: "Lowering the heat ensures your garlic doesn't burn and turn bitter."
    });

    // Make sauce / combine
    if (category === "Pasta") {
      instructions.push({
        step: step++,
        text: `While cooking, boil your pasta in salted water until al dente. Reserve a splash of pasta water, then drain.`,
        tip: "Pasta water contains starch which acts as a thickening glue for sauces."
      });
      instructions.push({
        step: step++,
        text: `Return the cooked protein to the skillet. Toss in the cooked pasta, grated cheese, and fresh herbs. Drizzle extra olive oil or butter, tossing for 1-2 minutes until glossy.`,
        tip: "Toss vigorously over medium heat to integrate fats and starch."
      });
    } else {
      instructions.push({
        step: step++,
        text: `Return the cooked protein to the skillet with the sautéed ingredients. Drizzle any sauces or seasonings, and simmer for 2-3 minutes to blend the flavors.`,
        tip: "Scrape up any browned bits at the bottom of the skillet - they hold the best flavor."
      });
    }

    instructions.push({
      step: step++,
      text: `Divide into serving plates, garnish with fresh herbs, a squeeze of fresh lemon juice, or extra seasonings, and enjoy immediately!`,
      tip: "Adjust seasoning with a tiny pinch of salt or splash of oil right before serving."
    });
  }

  return {
    id: `generated-${Date.now()}`,
    title: title,
    description: `A delicious custom-crafted recipe for ${title}, generated instantly on the spot. Designed to be quick, simple, and perfect for beginners.`,
    prepTime,
    cookTime,
    servings: 2,
    difficulty,
    category,
    tags: ["Generated", "AI Chef", "On The Spot"],
    image: "", // Generates placeholder card icon
    equipment,
    ingredients,
    instructions
  };
}

/**
 * Orchestrates on-the-spot AI Recipe Generation.
 * Animates the generation loader steps, registers the recipe, and triggers the callback.
 */
export function generateRecipeOnSpot(query, onStepChange, onComplete) {
  // 1. Choose template or compile dynamic fallback
  const normalizedQuery = query.toLowerCase().trim();
  let recipe = null;

  // Exact or near matches for popular templates
  if (normalizedQuery.includes("pizza")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.pizza));
    recipe.id = `generated-${Date.now()}`;
  } else if (normalizedQuery.includes("burger") || normalizedQuery.includes("cheeseburger")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.burger));
    recipe.id = `generated-${Date.now()}`;
  } else if (normalizedQuery.includes("curry")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.curry));
    recipe.id = `generated-${Date.now()}`;
  } else if (normalizedQuery.includes("taco")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.taco));
    recipe.id = `generated-${Date.now()}`;
  } else if (normalizedQuery.includes("pancake") || normalizedQuery.includes("pancakes")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.pancake));
    recipe.id = `generated-${Date.now()}`;
  } else {
    // Generate intelligent dynamic fallback recipe on the fly!
    recipe = generateDynamicFallback(query);
  }

  // Dynamically assign a high-quality food image from Unsplash
  recipe.image = getGourmetFoodImage(recipe.title, recipe.category);


  // Simulated AI generation cycles
  onStepChange({ step: "connect", status: "Formulating gourmet flavor profiles...", progress: 20 });
  
  setTimeout(() => {
    onStepChange({ step: "extract", status: "Calculating ingredient proportions...", progress: 55 });
    
    setTimeout(() => {
      onStepChange({ step: "structure", status: "Structuring step-by-step procedure & chef tips...", progress: 85 });
      
      setTimeout(() => {
        onStepChange({ step: "save", status: "Finalizing plate presentations...", progress: 100 });
        
        setTimeout(() => {
          // Store the generated recipe in local database
          store.addRecipe(recipe);
          onComplete(recipe);
        }, 100);
      }, 150);
    }, 150);
  }, 150);
}
