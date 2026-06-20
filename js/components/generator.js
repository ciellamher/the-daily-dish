// AI Recipe Generator Component (Client-side Simulation)

import { store } from "../store.js";
import { getGourmetFoodImage, extractEquipment, fetchHtmlThroughProxy } from "../utils.js";
import { simulateRecipeImport } from "./importer.js?v=1.5";

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
  },
  fries: {
    title: "Crispy Garlic Herb French Fries",
    description: "Golden brown, oven-baked french fries tossed in aromatic garlic butter, fresh parsley, and grated parmesan cheese.",
    prepTime: 15,
    cookTime: 25,
    servings: 3,
    difficulty: "Easy",
    category: "Sides",
    tags: ["Fries", "Baking", "Snacks"],
    equipment: [
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" },
      { name: "Mixing Bowl", icon: "bowl" },
      { name: "Baking Sheet", icon: "sheet" }
    ],
    ingredients: [
      { name: "large russet potatoes", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "olive oil", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "garlic powder", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "kosher salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "fresh flat-leaf parsley, chopped", quantity: 2, unit: "tbsp", category: "Produce" },
      { name: "parmesan cheese, grated", quantity: 0.25, unit: "cup", category: "Dairy" }
    ],
    instructions: [
      { step: 1, text: "Preheat oven to 425°F (220°C) and grease a large baking sheet with olive oil.", tip: "A hot, well-oiled baking sheet is crucial to prevent the fries from sticking!" },
      { step: 2, text: "Scrub the potatoes clean. Cut them lengthwise into 1/4-inch slices, then cut those slices into matchstick fries. Soak them in cold water for 30 minutes.", tip: "Soaking removes excess potato starch, which is the secret to achieving maximum crispiness in the oven." },
      { step: 3, text: "Drain the potatoes and thoroughly pat them dry with paper towels or a clean kitchen cloth.", tip: "Water is the enemy of crispiness. If the potatoes are wet, they will steam instead of baking." },
      { step: 4, text: "Toss the dried potatoes in a large bowl with olive oil, garlic powder, salt, and black pepper until evenly coated.", tip: "Ensure every single fry has a thin coating of oil and seasonings." },
      { step: 5, text: "Spread the fries in a single layer on the prepared baking sheet. Bake for 20-25 minutes, flipping them halfway through, until crispy and golden brown.", tip: "Avoid overcrowding the sheet. If the fries are piled on top of each other, they won't get crispy." },
      { step: 6, text: "Transfer hot fries to a bowl. Toss with chopped fresh parsley and grated parmesan cheese. Serve immediately.", tip: "The cheese will melt slightly onto the fries if tossed while they are piping hot!" }
    ]
  },
  steak: {
    title: "Garlic Butter Pan-Seared Ribeye",
    description: "A perfectly seared, juicy ribeye steak basted with foaming garlic butter, fresh rosemary, and thyme in a cast-iron skillet.",
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: "Medium",
    category: "Mains",
    tags: ["Steak", "Meat", "Dinner"],
    equipment: [
      { name: "Cast Iron Skillet", icon: "pan" },
      { name: "Tongs", icon: "tongs" },
      { name: "Meat Thermometer", icon: "knife" },
      { name: "Cutting Board", icon: "board" }
    ],
    ingredients: [
      { name: "ribeye steaks, thick-cut", quantity: 2, unit: "pcs", category: "Meat" },
      { name: "olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "unsalted butter", quantity: 3, unit: "tbsp", category: "Dairy" },
      { name: "garlic cloves, smashed", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "fresh rosemary sprigs", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "fresh thyme sprigs", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "kosher salt", quantity: 1.5, unit: "tsp", category: "Pantry" },
      { name: "coarse black pepper", quantity: 1, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Remove the steaks from the refrigerator 30 minutes before cooking to bring them to room temperature.", tip: "Cooking cold steaks will result in an uneven cook - cold inside, overcooked outside." },
      { step: 2, text: "Pat the steaks completely dry with paper towels and season generously on all sides with kosher salt and coarse black pepper.", tip: "Don't be shy with the salt; thick steaks need plenty of seasoning to flavor the meat." },
      { step: 3, text: "Heat olive oil in a heavy cast iron skillet over high heat until it just begins to smoke. Place the steaks in the skillet.", tip: "A cast iron skillet holds heat better than other pans, creating a greater dark crust." },
      { step: 4, text: "Sear the steaks for 2-3 minutes without moving them to develop a deep golden crust, then flip and sear the other side for 2 minutes.", tip: "Flip the steaks only once for a consistent, beautiful crust." },
      { step: 5, text: "Reduce heat to medium. Add butter, smashed garlic, rosemary, and thyme to the skillet. Tilt the pan and spoon the foaming butter over the steaks continuously for 2 minutes.", tip: "Basting cooks the steaks more evenly and infuses them with rich herb and garlic flavors." },
      { step: 6, text: "Transfer the steaks to a warm plate or cutting board and let them rest for 5-7 minutes before slicing.", tip: "Resting allows the juices to redistribute back through the meat instead of spilling out onto the board." }
    ]
  },
  spaghetti: {
    title: "Classic Spaghetti Bolognese",
    description: "A rich, slow-simmered beef ragu sauce seasoned with Italian herbs, served over a bed of al dente spaghetti pasta.",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "Medium",
    category: "Pasta",
    tags: ["Pasta", "Italian", "Comfort Food"],
    equipment: [
      { name: "Large Skillet or Dutch Oven", icon: "pan" },
      { name: "Large Pasta Pot", icon: "pot" },
      { name: "Wooden Spoon", icon: "spoon" },
      { name: "Colander", icon: "pot" }
    ],
    ingredients: [
      { name: "spaghetti pasta", quantity: 400, unit: "g", category: "Pantry" },
      { name: "lean ground beef", quantity: 500, unit: "g", category: "Meat" },
      { name: "yellow onion, finely chopped", quantity: 1, unit: "pc", category: "Produce" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "canned crushed tomatoes", quantity: 800, unit: "g", category: "Pantry" },
      { name: "tomato paste", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "olive oil", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "Italian seasoning", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "kosher salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "parmesan cheese, grated", quantity: 0.5, unit: "cup", category: "Dairy" }
    ],
    instructions: [
      { step: 1, text: "Heat olive oil in a large skillet or Dutch oven over medium heat. Sauté the chopped onion and minced garlic for 3-4 minutes until translucent and aromatic.", tip: "Cook the onions slowly so they release their natural sweetness." },
      { step: 2, text: "Add ground beef to the skillet. Cook for 6-8 minutes, breaking it up with a wooden spoon, until browned. Drain any excess fat from the pan.", tip: "Draining fat keeps the sauce rich and meaty without feeling greasy." },
      { step: 3, text: "Stir in the tomato paste, coating the meat, and cook for 1 minute. Add the crushed tomatoes, Italian seasoning, salt, and black pepper. Stir well.", tip: "Cooking the tomato paste for a minute caramelizes the sugars and deepens the flavor." },
      { step: 4, text: "Reduce heat to low, cover, and simmer the sauce gently for 25-30 minutes, stirring occasionally.", tip: "A slow simmer breaks down the tomatoes and allows the meat to become tender." },
      { step: 5, text: "While the sauce simmers, boil spaghetti in a large pot of salted water according to package instructions until al dente. Drain, reserving 1/2 cup of pasta water.", tip: "Do not rinse the pasta! The starch on the noodles helps the sauce cling to them." },
      { step: 6, text: "Toss the spaghetti with the meat sauce, adding pasta water to loosen if needed. Serve hot topped with freshly grated parmesan cheese.", tip: "Tossing the pasta in the sauce before plating ensures every noodle is coated." }
    ]
  },
  cake: {
    title: "Warm Chocolate Lava Cake",
    description: "Decadent individual chocolate cakes with firm, cakey borders and a warm, molten liquid chocolate center.",
    prepTime: 15,
    cookTime: 12,
    servings: 2,
    difficulty: "Medium",
    category: "Baking",
    tags: ["Chocolate", "Dessert", "Baking"],
    equipment: [
      { name: "Ramekins (6 oz)", icon: "bowl" },
      { name: "Mixing Bowls", icon: "bowl" },
      { name: "Whisk", icon: "bowl" },
      { name: "Baking Sheet", icon: "sheet" }
    ],
    ingredients: [
      { name: "high-quality dark chocolate chips", quantity: 100, unit: "g", category: "Pantry" },
      { name: "unsalted butter", quantity: 4, unit: "tbsp", category: "Dairy" },
      { name: "powdered sugar", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "large egg", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "large egg yolk", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "all-purpose flour", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "vanilla extract", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "fine sea salt", quantity: 0.12, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Preheat your oven to 425°F (220°C). Generously butter two 6-ounce ramekins and dust them lightly with cocoa powder or flour.", tip: "Properly prepping the ramekins ensures the cakes slide out easily without tearing the delicate outer walls." },
      { step: 2, text: "In a microwave-safe bowl, melt the dark chocolate and butter together in 30-second increments, stirring in between until completely smooth.", tip: "Chocolate burns easily - melt slowly and stir often." },
      { step: 3, text: "Whisk the powdered sugar, whole egg, egg yolk, vanilla extract, and salt into the melted chocolate mixture until fully incorporated and glossy.", tip: "The extra egg yolk adds richness and helps create the gooey molten center." },
      { step: 4, text: "Gently fold in the flour with a spatula or wooden spoon just until the flour disappears. Do not overmix.", tip: "Overmixing will develop gluten, turning your soft cake chewy." },
      { step: 5, text: "Divide the batter evenly between the prepared ramekins. Place ramekins on a baking sheet and bake for 11-13 minutes.", tip: "The edges should be firm and set, but the center circle should still jiggle slightly when shaken." },
      { step: 6, text: "Let cool for 1 minute. Place a plate over a ramekin and invert it carefully. Lift the ramekin, dust the cake with powdered sugar, and serve warm.", tip: "The cake is best enjoyed immediately while the center is still warm and liquid!" }
    ]
  },
  cupcake: {
    title: "Classic Vanilla Cupcakes",
    description: "Fluffy and moist vanilla cupcakes topped with a rich, silky vanilla buttercream frosting and colorful sprinkles.",
    prepTime: 20,
    cookTime: 18,
    servings: 12,
    difficulty: "Medium",
    category: "Baking",
    tags: ["Cupcake", "Dessert", "Baking"],
    equipment: [
      { name: "12-cup muffin pan", icon: "sheet" },
      { name: "Paper cupcake liners", icon: "paper" },
      { name: "Hand or stand mixer", icon: "bowl" },
      { name: "Piping bag and tip", icon: "spoon" },
      { name: "Wire cooling rack", icon: "rack" }
    ],
    ingredients: [
      { name: "all-purpose flour", quantity: 1.5, unit: "cups", category: "Pantry" },
      { name: "baking powder", quantity: 1.5, unit: "tsp", category: "Pantry" },
      { name: "fine salt", quantity: 0.25, unit: "tsp", category: "Pantry" },
      { name: "unsalted butter, softened", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "granulated white sugar", quantity: 0.75, unit: "cup", category: "Pantry" },
      { name: "large egg", quantity: 2, unit: "pcs", category: "Dairy" },
      { name: "pure vanilla extract", quantity: 2, unit: "tsp", category: "Pantry" },
      { name: "whole milk", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "powdered sugar", quantity: 2.5, unit: "cups", category: "Pantry" },
      { name: "unsalted butter, softened (for frosting)", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "heavy cream (for frosting)", quantity: 2, unit: "tbsp", category: "Dairy" }
    ],
    instructions: [
      { step: 1, text: "Preheat your oven to 350°F (177°C) and line a 12-cup muffin pan with paper cupcake liners.", tip: "Liners keep the cupcakes from sticking and help them bake evenly." },
      { step: 2, text: "In a medium bowl, whisk together the flour, baking powder, and salt. Set aside.", tip: "Whisking dry ingredients aerates them, making the cupcakes fluffier." },
      { step: 3, text: "In a large bowl, beat the softened butter and granulated sugar together on high speed for 2 minutes until light and fluffy.", tip: "Creaming butter and sugar creates tiny air pockets that rise during baking." },
      { step: 4, text: "Add the eggs one at a time, beating well after each addition, then stir in the vanilla extract.", tip: "Egg proteins lock in the structure. Make sure eggs are room temperature so the batter doesn't curdle." },
      { step: 5, text: "Add dry ingredients and milk alternately in 3 batches, mixing on low speed just until combined.", tip: "Alternating dry and wet ingredients prevents overmixing and ensures a smooth batter." },
      { step: 6, text: "Divide batter evenly among liners. Bake for 18-20 minutes until a toothpick inserted in the center comes out clean. Cool completely.", tip: "Cupcakes must be 100% cool before frosting, or the buttercream will melt off!" },
      { step: 7, text: "To make the frosting, beat the butter for 2 minutes until creamy. Add powdered sugar, cream, and vanilla. Beat on high for 3 minutes, then pipe onto cupcakes.", tip: "Beat the frosting until it is light and airy. Garnish with sprinkles immediately after piping so they stick." }
    ]
  },
  soup: {
    title: "Cozy Chicken Noodle Soup",
    description: "A comforting bowl of soup loaded with tender shredded chicken, egg noodles, sliced carrots, celery, and onions simmered in a savory broth.",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "Easy",
    category: "Soup",
    tags: ["Soup", "Comfort Food", "Healthy"],
    equipment: [
      { name: "Large Soup Pot", icon: "pot" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" },
      { name: "Ladle", icon: "pot" }
    ],
    ingredients: [
      { name: "cooked shredded chicken breast", quantity: 2, unit: "cups", category: "Meat" },
      { name: "chicken broth", quantity: 6, unit: "cups", category: "Pantry" },
      { name: "dried wide egg noodles", quantity: 2, unit: "cups", category: "Pantry" },
      { name: "olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "yellow onion, chopped", quantity: 1, unit: "pc", category: "Produce" },
      { name: "carrots, sliced", quantity: 2, unit: "pcs", category: "Produce" },
      { name: "celery ribs, sliced", quantity: 2, unit: "pcs", category: "Produce" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "dried thyme", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "kosher salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "fresh flat-leaf parsley, chopped", quantity: 2, unit: "tbsp", category: "Produce" }
    ],
    instructions: [
      { step: 1, text: "Heat olive oil in a large soup pot over medium heat. Sauté the chopped onion, carrots, and celery for 5-6 minutes until vegetables begin to soften.", tip: "Sweating the mirepoix (onions, carrots, celery) forms the flavor foundation of the soup." },
      { step: 2, text: "Add minced garlic and dried thyme; cook for 1 minute until highly fragrant.", tip: "Cooking the garlic briefly before adding liquids prevents it from tasting boiled." },
      { step: 3, text: "Pour in the chicken broth, kosher salt, and black pepper. Bring to a boil, then reduce heat to low and simmer uncovered for 10 minutes.", tip: "Simmering lets the vegetable flavors infuse into the broth." },
      { step: 4, text: "Stir in the wide egg noodles and cook for 6-8 minutes until tender.", tip: "Check package instructions for the noodles to avoid overcooking them into mush." },
      { step: 5, text: "Stir in the shredded chicken and simmer for 2 minutes until chicken is hot and heated through.", tip: "Using pre-cooked rotisserie chicken is a great time-saving trick!" },
      { step: 6, text: "Remove the pot from the heat, stir in the chopped fresh parsley, ladle into deep bowls, and serve warm.", tip: "Serve with crusty bread or crackers for the perfect comfort meal." }
    ]
  },
  adobo: {
    title: "Filipino Chicken Adobo",
    image: "https://panlasangpinoy.com/wp-content/uploads/2026/05/Chicken-Adobo-in-a-Bowl.jpg",
    description: "The quintessential Filipino comfort food: tender chicken pieces simmered in a savory, tangy sauce of soy sauce, vinegar, garlic, bay leaves, and black peppercorns.",
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    difficulty: "Easy",
    category: "Mains",
    tags: ["Filipino", "Chicken", "Comfort Food", "Tangy"],
    equipment: [
      { name: "Large Pot or Dutch Oven", icon: "pot" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Mixing Bowl", icon: "bowl" }
    ],
    ingredients: [
      { name: "chicken drumsticks and thighs", quantity: 1, unit: "kg", category: "Meat" },
      { name: "soy sauce", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "white vinegar or cane vinegar", quantity: 0.33, unit: "cup", category: "Pantry" },
      { name: "garlic cloves, crushed", quantity: 8, unit: "pcs", category: "Produce" },
      { name: "dried bay leaves", quantity: 3, unit: "pcs", category: "Pantry" },
      { name: "whole black peppercorns", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "cooking oil", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "water", quantity: 1, unit: "cup", category: "Pantry" },
      { name: "brown sugar", quantity: 1, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a mixing bowl, combine chicken, soy sauce, half of the crushed garlic, and black peppercorns. Marinate for 30 minutes.", tip: "Marinating overnight yields the deepest flavor profile." },
      { step: 2, text: "Heat cooking oil in a large pot over medium-high heat. Sauté the remaining garlic until fragrant and light golden brown.", tip: "Watch closely so the garlic does not burn." },
      { step: 3, text: "Remove chicken pieces from marinade (save the marinade) and sear in the pot for 3-4 minutes per side until browned.", tip: "Searing locks in the juices and creates a beautiful caramelized skin." },
      { step: 4, text: "Pour in the reserved marinade, water, and add dried bay leaves. Bring to a boil, then cover and simmer on low for 20 minutes.", tip: "Ensure the chicken is submerged in the braising liquid." },
      { step: 5, text: "Add vinegar and simmer uncovered for 10 minutes without stirring, allowing the harsh acid taste to cook off.", tip: "Resisting the urge to stir helps the vinegar mellow out naturally." },
      { step: 6, text: "Stir in brown sugar and simmer for another 5 minutes until the sauce reduces and thickens. Serve hot over steamed white rice.", tip: "Adobo tastes even better the next day as the chicken absorbs more sauce!" }
    ]
  },
  poached_egg: {
    title: "Perfect Poached Egg",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=80",
    description: "A masterclass in egg cookery: a single fresh egg gently poached in simmering water until the whites are delicately set and the yolk is warm, rich, and molten.",
    prepTime: 5,
    cookTime: 4,
    servings: 1,
    difficulty: "Medium",
    category: "Breakfast",
    tags: ["Eggs", "Breakfast", "Quick", "Technique"],
    equipment: [
      { name: "Small Saucepan", icon: "pot" },
      { name: "Slotted Spoon", icon: "spoon" },
      { name: "Small Ramekin or Bowl", icon: "bowl" }
    ],
    ingredients: [
      { name: "fresh large egg", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "water (for poaching)", quantity: 4, unit: "cups", category: "Pantry" },
      { name: "white vinegar", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "salt and black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Crack the fresh egg into a small bowl or ramekin. This makes it easier to slide it gently into the water.", tip: "Using farm-fresh eggs is key; older eggs have thinner whites that will disperse in the water." },
      { step: 2, text: "Bring water in a saucepan to a gentle simmer (about 180°F to 190°F). The water should have tiny bubbles on the bottom, not a rolling boil.", tip: "A rapid boil will tear the delicate egg white apart." },
      { step: 3, text: "Stir in white vinegar. The acid helps the egg white coagulate faster, wrapping itself around the yolk.", tip: "Don't worry, the egg won't taste like vinegar in such a diluted amount." },
      { step: 4, text: "Use a spoon to swirl the water in a circular motion to create a gentle whirlpool in the center of the pot.", tip: "The whirlpool helps center the white around the yolk as it cooks." },
      { step: 5, text: "Gently slide the cracked egg from the bowl directly into the center of the whirlpool. Cook for 3 to 4 minutes.", tip: "Do not touch the egg while it cooks; let the water currents do the work." },
      { step: 6, text: "Retrieve with a slotted spoon. Drain on a paper towel, season with salt and pepper, and serve immediately.", tip: "Perfect when served on toasted sourdough bread or alongside avocado." }
    ]
  },
  sinigang: {
    title: "Filipino Pork Sinigang",
    image: "https://panlasangpinoy.com/wp-content/uploads/2018/11/Pork-Sinigang.jpg",
    description: "An authentic, comforting Filipino sour soup featuring tender pork ribs simmered in a tangy tamarind broth with eggplant, radish, okra, and green beans.",
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    difficulty: "Medium",
    category: "Soup",
    tags: ["Filipino", "Soup", "Pork", "Sour", "Comfort Food"],
    equipment: [
      { name: "Large Soup Pot", icon: "pot" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" },
      { name: "Soup Ladle", icon: "pot" }
    ],
    ingredients: [
      { name: "pork ribs or pork belly, cut into chunks", quantity: 750, unit: "g", category: "Meat" },
      { name: "tamarind soup base mix (Sinigang mix)", quantity: 1, unit: "pack", category: "Pantry" },
      { name: "roma tomatoes, quartered", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "yellow onion, quartered", quantity: 1, unit: "pc", category: "Produce" },
      { name: "daikon radish, sliced into rounds", quantity: 1, unit: "pc", category: "Produce" },
      { name: "okra, ends trimmed", quantity: 6, unit: "pcs", category: "Produce" },
      { name: "eggplant, sliced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "string beans (sitaw), cut into 2-inch lengths", quantity: 1, unit: "cup", category: "Produce" },
      { name: "water spinach (kang kong) or baby spinach", quantity: 2, unit: "cups", category: "Produce" },
      { name: "long green chili peppers (siling haba)", quantity: 2, unit: "pcs", category: "Produce" },
      { name: "fish sauce (patis)", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "water", quantity: 6, unit: "cups", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a large soup pot, combine pork ribs, onions, tomatoes, and water. Bring to a boil, then lower heat to simmer for 35-40 minutes.", tip: "Skim off any foam or scum that rises to the top to keep the broth clear." },
      { step: 2, text: "Stir in the tamarind soup base mix and fish sauce to taste. Simmer for 3 minutes to dissolve completely.", tip: "Adjust fish sauce and sour mix according to your preference for tanginess." },
      { step: 3, text: "Add the sliced daikon radish and siling haba green chilies. Simmer for 5 minutes.", tip: "Siling haba adds a mild heat and signature aroma without making it overly spicy." },
      { step: 4, text: "Add okra, eggplant, and string beans. Simmer for another 5 minutes until all vegetables are tender-crisp.", tip: "Adding veggies in stages prevents the softer ones from becoming mushy." },
      { step: 5, text: "Stir in the water spinach (kang kong) or baby spinach leaves. Turn off the heat and cover the pot.", tip: "Let the residual heat wilt the greens for 2 minutes to keep them vibrant green." },
      { step: 6, text: "Ladle the steaming sour soup and pork into bowls. Serve hot with white steamed rice.", tip: "Pork Sinigang goes beautifully with a side dip of fish sauce and crushed red chili!" }
    ]
  }
};

/**
 * Helper to get a plausible recipe link on a real cooking website based on query/category.
 */
function getPlausibleRecipeLink(query, category) {
  const clean = query.trim().replace(/[^\w\s-]/g, "");
  const kebab = clean.toLowerCase().replace(/\s+/g, "-");
  
  const filipinoKeywords = [
    "adobo", "sinigang", "kaldereta", "caldereta", "tinola", "pinakbet", "sisig", 
    "bicol express", "kare-kare", "kare kare", "pancit", "lumpia", "filipino", 
    "pinoy", "lechon", "tocino", "longganisa", "tapa", "biko", "cassava", 
    "afritada", "mechado", "menudo", "bulalo", "dinuguan", "laing", "bilo-bilo",
    "sopas", "arroz caldo", "champorado"
  ];
  
  const isFilipino = filipinoKeywords.some(keyword => clean.toLowerCase().includes(keyword));
  
  if (isFilipino) {
    return {
      url: `https://panlasangpinoy.com/${kebab}/`,
      name: "Panlasang Pinoy"
    };
  }
  
  const bakingKeywords = [
    "cupcake", "cake", "cookie", "cookies", "brownie", "brownies", "muffin", 
    "muffins", "pie", "pies", "bread", "tart", "tarts", "frosting", "glaze", 
    "baking", "bake", "cheesecake", "doughnut", "donut"
  ];
  
  const isBaking = bakingKeywords.some(keyword => clean.toLowerCase().includes(keyword));
  
  if (isBaking || category === "Baking") {
    return {
      url: `https://sallysbakingaddiction.com/${kebab}/`,
      name: "Sally's Baking Addiction"
    };
  }
  
  // General western/global fallback: Serious Eats
  return {
    url: `https://www.seriouseats.com/${kebab}-recipe`,
    name: "Serious Eats"
  };
}

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
  
  let category = "Gourmet";
  let prepTime = 10;
  let cookTime = 15;
  let difficulty = "Easy";
  let ingredients = [];
  let equipment = [];
  let instructions = [];

  // Match keyword-specific recipes
  if (lowerQuery.includes("fried rice") || (lowerQuery.includes("rice") && (lowerQuery.includes("fried") || lowerQuery.includes("stir")))) {
    category = "Mains";
    prepTime = 10;
    cookTime = 10;
    difficulty = "Easy";
    equipment = [
      { name: "Wok or Large Skillet", icon: "pan" },
      { name: "Cooking Spatula", icon: "spoon" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" }
    ];
    ingredients = [
      { name: "cooked jasmine rice (preferably day-old)", quantity: 3, unit: "cups", category: "Pantry" },
      { name: "eggs, beaten", quantity: 2, unit: "pcs", category: "Dairy" },
      { name: "frozen peas and carrots mix", quantity: 1, unit: "cup", category: "Produce" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "soy sauce", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "sesame oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "green onions, chopped", quantity: 0.25, unit: "cup", category: "Produce" },
      { name: "vegetable oil or butter", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "salt", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ];
    instructions = [
      { step: 1, text: "Heat 1 tablespoon of vegetable oil or butter in a wok or large skillet over medium-high heat. Add the minced garlic and frozen peas and carrots, sautéing for 3 minutes until tender.", tip: "Using day-old cold rice is the key secret - fresh warm rice will turn sticky and mushy!" },
      { step: 2, text: "Push the sautéed vegetables to one side of the wok. Pour the beaten eggs into the empty side and scramble them with your spatula until cooked through.", tip: "Scrambling the eggs in the same pan saves cleanup and distributes flavor." },
      { step: 3, text: "Add the cold cooked rice to the wok, using your spatula to break up any clumps.", tip: "Press the rice flat against the bottom of the hot pan to fry it properly." },
      { step: 4, text: "Drizzle the soy sauce and sesame oil over the rice, stirring and tossing everything vigorously for 3-4 minutes to fry the rice evenly.", tip: "High heat and rapid tossing give fried rice its characteristic smoky, seared wok flavor." },
      { step: 5, text: "Season with salt and black pepper to taste, then stir in the chopped green onions, cooking for 1 more minute.", tip: "Green onions add a fresh onion bite - save some for raw garnish at the end." },
      { step: 6, text: "Remove from heat, transfer to serving bowls, and serve immediately.", tip: "Add cooked chicken, shrimp, or cubed bacon during step 1 if you want protein!" }
    ];
  } else if (lowerQuery.includes("salmon") || lowerQuery.includes("fish") || lowerQuery.includes("tuna")) {
    category = "Seafood";
    prepTime = 10;
    cookTime = 10;
    difficulty = "Medium";
    equipment = [
      { name: "Non-stick Skillet", icon: "pan" },
      { name: "Fish Spatula", icon: "spoon" },
      { name: "Spoon", icon: "spoon" },
      { name: "Chef's Knife", icon: "knife" }
    ];
    ingredients = [
      { name: "fresh fish fillets (like salmon or white fish)", quantity: 2, unit: "pcs", category: "Seafood" },
      { name: "olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "unsalted butter", quantity: 2, unit: "tbsp", category: "Dairy" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "lemon, juiced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "fresh parsley or dill, chopped", quantity: 1, unit: "tbsp", category: "Produce" },
      { name: "salt", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ];
    instructions = [
      { step: 1, text: "Pat the fish fillets completely dry with paper towels and season both sides with salt and black pepper.", tip: "Dry skin is the secret to getting a crispy, golden sear!" },
      { step: 2, text: "Heat olive oil in a skillet over medium-high heat. Place the fillets in the skillet skin-side down.", tip: "Searing skin-side down first keeps the fillet intact and prevents breaking." },
      { step: 3, text: "Sear for 4-5 minutes until the skin is golden and crispy. Gently flip the fillets using a fish spatula and sear the other side for 3 minutes.", tip: "Limit flipping to once to keep the fish structure perfect." },
      { step: 4, text: "Reduce heat to medium-low. Add butter, minced garlic, and lemon juice around the fish in the skillet.", tip: "Let the butter melt and foam with the garlic for maximum aroma." },
      { step: 5, text: "Tilt the skillet slightly and use a spoon to repeatedly baste the melted garlic lemon butter over the fish fillets for 2 minutes.", tip: "Basting keeps the fish succulent and infuses it with citrus-garlic richness." },
      { step: 6, text: "Remove from heat, transfer to plates, garnish with fresh dill or parsley, and serve hot.", tip: "Serve alongside steamed green vegetables or garlic rice." }
    ];
  } else if (lowerQuery.includes("salad") || lowerQuery.includes("caesar") || lowerQuery.includes("greens")) {
    category = "Salad";
    prepTime = 10;
    cookTime = 0;
    difficulty = "Easy";
    equipment = [
      { name: "Large Salad Bowl", icon: "bowl" },
      { name: "Salad Tongs", icon: "tongs" },
      { name: "Small Bowl or Jar (for dressing)", icon: "bowl" },
      { name: "Chef's Knife", icon: "knife" }
    ];
    ingredients = [
      { name: "mixed salad greens (romaine, spinach, or arugula)", quantity: 4, unit: "cups", category: "Produce" },
      { name: "cherry tomatoes, halved", quantity: 1, unit: "cup", category: "Produce" },
      { name: "cucumber, sliced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "croutons", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "extra virgin olive oil", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "fresh lemon juice or vinegar", quantity: 1, unit: "tbsp", category: "Produce" },
      { name: "honey or maple syrup", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "parmesan cheese, grated", quantity: 0.25, unit: "cup", category: "Dairy" },
      { name: "salt", quantity: 0.25, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ];
    instructions = [
      { step: 1, text: "Wash the salad greens thoroughly and dry them completely using a salad spinner or clean towels.", tip: "If the greens are wet, the oil-based dressing will slide right off them." },
      { step: 2, text: "In a small bowl or jar, combine the extra virgin olive oil, lemon juice, honey, salt, and black pepper. Whisk or shake vigorously until emulsified.", tip: "Whisking thoroughly blends the acid and oil into a cohesive, creamy vinaigrette." },
      { step: 3, text: "Chop the cucumber and slice the cherry tomatoes in half.", tip: "Cutting cherry tomatoes allows their juices to mix with the dressing for extra depth." },
      { step: 4, text: "Place the dried salad greens, tomatoes, and cucumber in a large salad bowl.", tip: "A wooden or glass bowl presents salads beautifully." },
      { step: 5, text: "Drizzle the vinaigrette over the salad and toss gently with salad tongs until all leaves are lightly coated.", tip: "Only dress right before serving to prevent the greens from wilting." },
      { step: 6, text: "Top with croutons and a generous sprinkle of grated parmesan cheese, and serve cold.", tip: "Add sliced grilled chicken or salmon to turn this into a high-protein meal!" }
    ];
  } else if (lowerQuery.includes("cookie") || lowerQuery.includes("cookies") || lowerQuery.includes("chocolate chip")) {
    category = "Baking";
    prepTime = 15;
    cookTime = 10;
    difficulty = "Easy";
    equipment = [
      { name: "Large Mixing Bowl", icon: "bowl" },
      { name: "Baking Sheet", icon: "sheet" },
      { name: "Parchment Paper", icon: "paper" },
      { name: "Whisk", icon: "bowl" },
      { name: "Spatula", icon: "spoon" }
    ];
    ingredients = [
      { name: "all-purpose flour", quantity: 1.5, unit: "cups", category: "Pantry" },
      { name: "baking soda", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "unsalted butter, softened", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "brown sugar, packed", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "granulated sugar", quantity: 0.25, unit: "cup", category: "Pantry" },
      { name: "large egg", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "vanilla extract", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "chocolate chips", quantity: 1, unit: "cup", category: "Pantry" },
      { name: "salt", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ];
    instructions = [
      { step: 1, text: "Preheat your oven to 350°F (175°C) and line a large baking sheet with parchment paper.", tip: "Parchment paper prevents sticking and guarantees a clean, golden bottom crust." },
      { step: 2, text: "In a medium bowl, whisk together the flour, baking soda, and salt. Set aside.", tip: "Whisking breaks up dry clumps and distributes the leavening agent." },
      { step: 3, text: "In a large bowl, beat the softened butter, brown sugar, and granulated sugar together until creamy and light. Beat in the egg and vanilla extract.", tip: "Beating sugar and fat incorporates air, which helps the cookies rise." },
      { step: 4, text: "Slowly add the dry flour mixture into the wet ingredients, stirring gently with a spatula just until combined.", tip: "Do not overmix! Stirring too much creates gluten, making the cookies tough." },
      { step: 5, text: "Gently fold in the chocolate chips. Scoop 2-tablespoon portions of dough onto the baking sheet, spacing them 2 inches apart.", tip: "Spacing prevents the cookies from merging into one giant sheet while baking." },
      { step: 6, text: "Bake for 9-11 minutes until the edges are golden. Let cool on the baking sheet for 5 minutes before transferring to a wire rack.", tip: "Cookies are very soft when hot; letting them rest on the sheet allows them to firm up." }
    ];
  } else if (lowerQuery.includes("chicken") || lowerQuery.includes("breast")) {
    category = "Chicken";
    prepTime = 10;
    cookTime = 15;
    difficulty = "Easy";
    equipment = [
      { name: "Large Skillet", icon: "pan" },
      { name: "Tongs", icon: "tongs" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" }
    ];
    ingredients = [
      { name: "boneless, skinless chicken breasts", quantity: 2, unit: "pcs", category: "Meat" },
      { name: "olive oil", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "garlic powder", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "smoked paprika", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "dried oregano", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "salt", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" },
      { name: "lemon wedges", quantity: 2, unit: "pcs", category: "Produce" }
    ];
    instructions = [
      { step: 1, text: "Butterfly the chicken breasts by slicing them horizontally to create 4 thinner cutlets. Pat them dry with paper towels.", tip: "Thinner cutlets cook much faster and more evenly than thick whole chicken breasts." },
      { step: 2, text: "In a small bowl, mix garlic powder, paprika, dried oregano, salt, and black pepper. Season the chicken cutlets generously on both sides.", tip: "Patting the spice mixture onto the meat ensures it adheres during searing." },
      { step: 3, text: "Heat olive oil in a large skillet over medium-high heat. Once hot, place the chicken in the skillet.", tip: "Wait until the oil shimmers before adding chicken to get a nice brown sear." },
      { step: 4, text: "Cook for 5-6 minutes without moving to develop a deep golden brown crust.", tip: "Moving the chicken disrupts the searing process." },
      { step: 5, text: "Flip the chicken using tongs. Cook the other side for 4-5 minutes, or until the internal temperature reaches 165°F (74°C).", tip: "Use a meat thermometer in the thickest part of the cutlet to ensure it is cooked safely but remains juicy." },
      { step: 6, text: "Transfer chicken to a plate, cover loosely with foil, and let rest for 3 minutes before slicing. Serve with lemon wedges.", tip: "Resting locks the juices in. Slicing immediately will cause the juices to drain out, drying the chicken." }
    ];
  } else if (lowerQuery.includes("pasta") || lowerQuery.includes("spaghetti") || lowerQuery.includes("noodle") || lowerQuery.includes("macaroni")) {
    category = "Pasta";
    prepTime = 10;
    cookTime = 10;
    difficulty = "Easy";
    equipment = [
      { name: "Large Pasta Pot", icon: "pot" },
      { name: "Large Skillet", icon: "pan" },
      { name: "Colander", icon: "pot" },
      { name: "Chef's Knife", icon: "knife" }
    ];
    ingredients = [
      { name: "pasta of choice", quantity: 300, unit: "g", category: "Pantry" },
      { name: "olive oil", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "garlic cloves, minced", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "cherry tomatoes, halved", quantity: 1, unit: "cup", category: "Produce" },
      { name: "fresh baby spinach", quantity: 2, unit: "cups", category: "Produce" },
      { name: "grated parmesan cheese", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "salt", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ];
    instructions = [
      { step: 1, text: "Bring a large pot of salted water to a boil. Cook pasta according to package instructions until al dente.", tip: "Salting the water flavors the pasta from the inside out." },
      { step: 2, text: "While the pasta cooks, heat olive oil in a large skillet over medium heat. Sauté minced garlic for 1 minute until fragrant.", tip: "Keep the heat moderate so the garlic doesn't burn." },
      { step: 3, text: "Add the halved cherry tomatoes, salt, and black pepper. Cook for 4-5 minutes, stirring occasionally, until tomatoes begin to burst and release their juices.", tip: "Press down slightly on some tomatoes with a spoon to speed up sauce formation." },
      { step: 4, text: "Drain the pasta, reserving 1/2 cup of the warm pasta water.", tip: "Starchy pasta water is the secret to emulsifying skillet sauces." },
      { step: 5, text: "Toss the pasta and fresh baby spinach directly into the skillet with the tomatoes. Toss for 1-2 minutes until spinach is wilted, adding splashes of pasta water as needed.", tip: "Tossing binds the pasta and sauce into a cohesive dish." },
      { step: 6, text: "Remove from heat, stir in the grated parmesan cheese, and serve hot.", tip: "Drizzle with a little extra virgin olive oil right before serving." }
    ];
  } else {
    // Default fallback: Gourmet Garlic Herb Stir Fry Sauté
    category = "Mains";
    prepTime = 10;
    cookTime = 12;
    difficulty = "Easy";
    equipment = [
      { name: "Large Skillet", icon: "pan" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" },
      { name: "Cooking Spatula", icon: "spoon" }
    ];
    ingredients = [
      { name: "mixed fresh vegetables (bell peppers, onions, broccoli)", quantity: 3, unit: "cups", category: "Produce" },
      { name: "olive oil or butter", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "soy sauce or seasoning sauce", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "sesame seeds (for garnish)", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "salt", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ];
    instructions = [
      { step: 1, text: "Wash all vegetables. Slice the bell peppers, onions, and broccoli into uniform, bite-sized pieces.", tip: "Uniform cuts ensure everything cooks at the exact same rate." },
      { step: 2, text: "Heat olive oil or butter in a large skillet over medium-high heat until hot.", tip: "A hot skillet is necessary to sear the vegetables instead of steaming them." },
      { step: 3, text: "Add the sliced onions and broccoli to the skillet, cooking for 3 minutes, stirring occasionally.", tip: "Add hard vegetables first since they take longer to cook." },
      { step: 4, text: "Add the bell peppers and minced garlic. Sauté for another 3 minutes until vegetables are tender-crisp.", tip: "Adding garlic later prevents it from burning and becoming bitter." },
      { step: 5, text: "Drizzle the soy sauce over the vegetables. Season with salt and black pepper to taste, tossing to combine for 1 minute.", tip: "Let the sauce caramelize slightly on the hot pan." },
      { step: 6, text: "Transfer to a serving plate, garnish with sesame seeds, and serve hot.", tip: "Add cubed tofu, chicken, or beef in step 2 to make it a full meal!" }
    ];
  }

  const linkInfo = getPlausibleRecipeLink(query, category);

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
    sourceUrl: linkInfo.url,
    sourceName: linkInfo.name,
    equipment: extractEquipment(title, ingredients, instructions),
    ingredients,
    instructions
  };
}

export function generateRecipeOnSpot(query, onStepChange, onComplete) {
  const normalizedQuery = query.toLowerCase().trim();
  let recipe = null;

  // Exact or near matches for popular templates
  if (normalizedQuery.includes("pizza")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.pizza));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/easy-pan-pizza-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("burger") || normalizedQuery.includes("cheeseburger")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.burger));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/the-burger-lab-the-ingredients-for-the-perfect-cheeseburger";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("curry")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.curry));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.bonappetit.com/recipe/easy-chicken-curry";
    recipe.sourceName = "Bon Appétit";
  } else if (normalizedQuery.includes("taco") || normalizedQuery.includes("tacos")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.taco));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/easy-ground-beef-tacos-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("pancake") || normalizedQuery.includes("pancakes")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.pancake));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/light-and-fluffy-pancakes-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("fries") || normalizedQuery.includes("french fries") || normalizedQuery.includes("potato")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.fries));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/perfect-french-fries-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("steak") || normalizedQuery.includes("ribeye") || normalizedQuery.includes("beef steak")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.steak));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/perfect-pan-seared-steaks-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("spaghetti") || normalizedQuery.includes("bolognese") || normalizedQuery.includes("ragu")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.spaghetti));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/easy-bolognese-sauce-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("cupcake") || normalizedQuery.includes("cupcakes")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.cupcake));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://sallysbakingaddiction.com/simply-perfect-vanilla-cupcakes/";
    recipe.sourceName = "Sally's Baking Addiction";
  } else if (normalizedQuery === "cake" || normalizedQuery.includes("chocolate cake") || normalizedQuery.includes("lava cake") || normalizedQuery.includes("brownie")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.cake));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://sallysbakingaddiction.com/chocolate-lava-cakes/";
    recipe.sourceName = "Sally's Baking Addiction";
  } else if (normalizedQuery === "soup" || normalizedQuery === "chicken soup" || normalizedQuery.includes("chicken noodle soup") || normalizedQuery === "broth") {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.soup));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/easy-chicken-noodle-soup-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("adobo")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.adobo));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://panlasangpinoy.com/filipino-chicken-adobo-recipe/";
    recipe.sourceName = "Panlasang Pinoy";
  } else if (normalizedQuery.includes("poached egg") || normalizedQuery.includes("poached eggs")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.poached_egg));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://www.seriouseats.com/foolproof-poached-eggs-food-lab-recipe";
    recipe.sourceName = "Serious Eats";
  } else if (normalizedQuery.includes("sinigang")) {
    recipe = JSON.parse(JSON.stringify(PREDEFINED_AI_TEMPLATES.sinigang));
    recipe.id = `generated-${Date.now()}`;
    recipe.sourceUrl = "https://panlasangpinoy.com/pork-sinigang-na-baboy-recipe/";
    recipe.sourceName = "Panlasang Pinoy";
  }

  if (recipe) {
    recipe.image = recipe.image || getGourmetFoodImage(recipe.title, recipe.category);
    onStepChange({ step: "connect", status: "Formulating gourmet flavor profiles...", progress: 20 });
    
    setTimeout(() => {
      onStepChange({ step: "extract", status: "Calculating ingredient proportions...", progress: 55 });
      
      setTimeout(() => {
        onStepChange({ step: "structure", status: "Structuring step-by-step procedure & chef tips...", progress: 85 });
        
        setTimeout(() => {
          onStepChange({ step: "save", status: "Finalizing plate presentations...", progress: 100 });
          
          setTimeout(() => {
            store.addRecipe(recipe);
            onComplete(recipe);
          }, 100);
        }, 150);
      }, 150);
    }, 150);
  } else {
    // Search online database (TheMealDB API)
    onStepChange({ step: "connect", status: "Searching online databases for verified recipes...", progress: 30 });
    
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.meals && data.meals.length > 0) {
          const meal = data.meals[0];
          const parsedRecipe = parseMealDBMeal(meal);
          
          onStepChange({ step: "extract", status: "Verifying ingredients and proportions...", progress: 65 });
          
          setTimeout(() => {
            onStepChange({ step: "structure", status: "Formulating cooking instructions...", progress: 90 });
            
            setTimeout(() => {
              onStepChange({ step: "save", status: "Saving to your Recipe Box...", progress: 100 });
              
              setTimeout(() => {
                store.addRecipe(parsedRecipe);
                onComplete(parsedRecipe);
              }, 100);
            }, 150);
          }, 150);
        } else {
          // Fallback to web search
          searchAndScrapeOnline(query, onStepChange, onComplete);
        }
      })
      .catch(err => {
        console.error("Meal search API failed, falling back to web search...", err);
        searchAndScrapeOnline(query, onStepChange, onComplete);
      });
  }
}

/**
 * Searches the web via a DuckDuckGo static HTML scrape, extracts the first link,
 * and automatically tries to scrape and import it, falling back to a dynamic template.
 */
function searchAndScrapeOnline(query, onStepChange, onComplete) {
  onStepChange({ step: "connect", status: "Searching the web for organic recipes...", progress: 40 });
  
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' recipe')}`;
  
  fetchHtmlThroughProxy(searchUrl)
    .then(html => {
      let firstLink = null;
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const links = doc.querySelectorAll(".result__a");
        for (const link of links) {
          let href = link.getAttribute("href");
          if (href) {
            if (href.includes("uddg=")) {
              const match = href.match(/uddg=([^&]+)/);
              if (match) {
                href = decodeURIComponent(match[1]);
              }
            }
            if (href.startsWith("//")) {
              href = "https:" + href;
            }
            if (href.startsWith("http") && !href.includes("duckduckgo.com")) {
              firstLink = href;
              break;
            }
          }
        }
      }
      
      if (firstLink) {
        onStepChange({ step: "extract", status: "Found recipe online! Scraping content...", progress: 60 });
        
        simulateRecipeImport(
          firstLink,
          onStepChange,
          (scrapedRecipe) => {
            if (scrapedRecipe) {
              onComplete({ isConfirmationPending: true, recipe: scrapedRecipe });
            } else {
              // Failed to extract anything, generate fallback locally
              generateAndSaveDynamicRecipe(query, onStepChange, onComplete);
            }
          },
          true // skipSave
        );
      } else {
        generateAndSaveDynamicRecipe(query, onStepChange, onComplete);
      }
    })
    .catch(err => {
      console.warn("Search engine query failed, generating local fallback...", err);
      generateAndSaveDynamicRecipe(query, onStepChange, onComplete);
    });
}

/**
 * Helper to generate a dynamic recipe on the fly and save it directly.
 */
function generateAndSaveDynamicRecipe(query, onStepChange, onComplete) {
  onStepChange({ step: "structure", status: "Formulating customized recipe template...", progress: 80 });
  const fallbackRecipe = generateDynamicFallback(query);
  
  setTimeout(() => {
    onStepChange({ step: "save", status: "Saving custom recipe...", progress: 100 });
    setTimeout(() => {
      store.addRecipe(fallbackRecipe);
      onComplete(fallbackRecipe);
    }, 100);
  }, 200);
}

/**
 * Formats dynamic online recipe database query results into structural items
 */
function parseMealDBMeal(meal) {
  const title = meal.strMeal;
  const category = mapMealDBCategory(meal.strCategory);
  
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
      } else if (cleanName.includes("onion") || cleanName.includes("garlic") || cleanName.includes("tomato") || cleanName.includes("lemon") || cleanName.includes("herb") || cleanName.includes("pepper") || cleanName.includes("spinach") || cleanName.includes("cilantro")) {
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
    sourceUrl,
    sourceName,
    equipment: extractEquipment(title, ingredients, instructions),
    ingredients,
    instructions
  };
}

function mapMealDBCategory(cat) {
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
