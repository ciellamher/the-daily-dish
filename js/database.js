// Gourmet Recipe Database for the Cookbook Web Application

export const RECIPES = [
  {
    id: "shrimp-pasta",
    title: "Garlic Butter Shrimp Pasta",
    description: "Juicy seared shrimp on top of glossy tagliatelle pasta, tossed in a silky garlic butter sauce and finished with fresh herbs and parmesan.",
    image: "assets/images/shrimp_pasta.png",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    category: "Pasta",
    tags: ["Quick", "Seafood", "Italian"],
    equipment: [
      { name: "Large Pot", icon: "pot" },
      { name: "Large Skillet", icon: "pan" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Tongs", icon: "tongs" }
    ],
    ingredients: [
      { name: "tagliatelle pasta", quantity: 400, unit: "g", category: "Pantry" },
      { name: "large shrimp, peeled and deveined", quantity: 500, unit: "g", category: "Seafood" },
      { name: "unsalted butter", quantity: 4, unit: "tbsp", category: "Dairy" },
      { name: "olive oil", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "garlic cloves, minced", quantity: 6, unit: "pcs", category: "Produce" },
      { name: "lemon, juiced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "parmesan cheese, freshly grated", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "fresh flat-leaf parsley, chopped", quantity: 0.25, unit: "cup", category: "Produce" },
      { name: "red pepper flakes", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Bring a large pot of salted water to a boil. Add the tagliatelle pasta and cook according to package instructions (about 8-10 minutes) until al dente. Reserve 1/2 cup of pasta water, then drain.", tip: "Salting the water generously is key to flavoring the pasta from the inside out!" },
      { step: 2, text: "While the pasta cooks, pat the shrimp dry with paper towels and season them on both sides with half of the salt, black pepper, and a pinch of red pepper flakes.", tip: "Drying the shrimp helps them sear beautifully rather than steaming." },
      { step: 3, text: "Heat 1 tablespoon of olive oil and 1 tablespoon of butter in a large skillet over medium-high heat. Add the shrimp in a single layer and sear for 1-2 minutes per side until pink and opaque. Transfer the shrimp to a plate and set aside.", tip: "Do not overcook! Shrimp cooks very quickly and can become rubbery if left too long." },
      { step: 4, text: "Turn the heat down to medium. Add the remaining olive oil, butter, and minced garlic to the skillet. Cook for 1 minute until highly fragrant, making sure the garlic doesn't burn.", tip: "If the skillet is too hot, temporarily pull it off the heat to avoid burning the garlic." },
      { step: 5, text: "Pour in the lemon juice and half of the reserved pasta water. Bring to a simmer, scraping up any browned bits from the bottom of the pan.", tip: "The pasta water contains starch which helps emulsify the butter into a glossy sauce." },
      { step: 6, text: "Return the shrimp to the skillet along with the cooked pasta, grated parmesan cheese, chopped parsley, and remaining red pepper flakes. Toss everything together for 1-2 minutes until the sauce coats the pasta evenly. Add more pasta water if the sauce feels too dry.", tip: "Toss vigorously! This binds the pasta starch, cheese, and fat into a cohesive sauce." },
      { step: 7, text: "Divide into bowls, top with extra parmesan and parsley, and serve immediately.", tip: "A squeeze of fresh lemon right at the end adds a bright pop of flavor." }
    ]
  },
  {
    id: "tuscan-chicken",
    title: "Creamy Tuscan Garlic Chicken",
    description: "Golden pan-seared chicken breasts smothered in a rich, velvety cream sauce with garlic, sun-dried tomatoes, and fresh baby spinach.",
    image: "assets/images/tuscan_chicken.png",
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    category: "Chicken",
    tags: ["Comfort Food", "Low Carb", "Dinner"],
    equipment: [
      { name: "Large Skillet", icon: "pan" },
      { name: "Tongs", icon: "tongs" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Cutting Board", icon: "board" }
    ],
    ingredients: [
      { name: "boneless, skinless chicken breasts", quantity: 4, unit: "pcs", category: "Meat" },
      { name: "olive oil", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "garlic cloves, minced", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "sun-dried tomatoes, drained and chopped", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "fresh baby spinach", quantity: 3, unit: "cups", category: "Produce" },
      { name: "heavy cream", quantity: 1, unit: "cup", category: "Dairy" },
      { name: "chicken broth", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "parmesan cheese, freshly grated", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "Italian seasoning", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Slice the chicken breasts in half horizontally (butterflied) to create 4 thinner cutlets. Pat them dry and season evenly on both sides with the salt, black pepper, and Italian seasoning.", tip: "Thinner cutlets cook much faster and more evenly than thick whole chicken breasts." },
      { step: 2, text: "Heat olive oil in a large skillet over medium-high heat. Add the chicken breasts and sear for 5 minutes per side, or until golden brown and cooked through (internal temp of 165°F / 74°C). Remove chicken from the pan and keep warm on a plate.", tip: "Resist the urge to move the chicken while searing to achieve a nice golden crust." },
      { step: 3, text: "Lower the skillet heat to medium. Add the minced garlic and chopped sun-dried tomatoes, and cook for 1 minute until fragrant.", tip: "Keep the pan drippings from the chicken - they are packed with rich flavor!" },
      { step: 4, text: "Pour in the chicken broth and heavy cream, bringing the mixture to a gentle simmer. Let it cook for 3 minutes to reduce and thicken slightly.", tip: "Use a wooden spoon to scrape up the browned bits at the bottom of the skillet." },
      { step: 5, text: "Stir in the grated parmesan cheese until fully melted and integrated. Add the baby spinach and cook for 2 minutes until it is wilted.", tip: "Add the spinach in batches if it doesn't all fit at once. It shrinks down dramatically!" },
      { step: 6, text: "Return the cooked chicken and any resting juices back to the skillet. Spoon the creamy sauce over the chicken and simmer for 1-2 minutes until everything is piping hot.", tip: "Serve this dish over pasta, rice, or alongside roasted vegetables." }
    ]
  },
  {
    id: "avocado-salad",
    title: "Summer Berry Avocado Salad",
    description: "A bright and refreshing salad combining fresh strawberries, blueberries, cream goat cheese, buttery avocado, and crunchy candied pecans.",
    image: "assets/images/avocado_salad.png",
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",
    category: "Salad",
    tags: ["Healthy", "Vegetarian", "No-Cook"],
    equipment: [
      { name: "Large Salad Bowl", icon: "bowl" },
      { name: "Whisk", icon: "bowl" },
      { name: "Paring Knife", icon: "knife" },
      { name: "Salad Tongs", icon: "tongs" }
    ],
    ingredients: [
      { name: "fresh baby spinach", quantity: 3, unit: "cups", category: "Produce" },
      { name: "fresh arugula", quantity: 2, unit: "cups", category: "Produce" },
      { name: "fresh strawberries, sliced", quantity: 1, unit: "cup", category: "Produce" },
      { name: "fresh blueberries", quantity: 0.5, unit: "cup", category: "Produce" },
      { name: "ripe avocado, sliced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "goat cheese, crumbled", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "candied pecans", quantity: 0.33, unit: "cup", category: "Pantry" },
      { name: "extra virgin olive oil", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "balsamic vinegar", quantity: 1.5, unit: "tbsp", category: "Pantry" },
      { name: "honey", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "dijon mustard", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "salt and pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a small bowl or jar, combine the olive oil, balsamic vinegar, honey, dijon mustard, salt, and pepper. Whisk vigorously or shake until emulsified.", tip: "Dijon mustard acts as an emulsifier to keep the oil and vinegar combined." },
      { step: 2, text: "Wash and dry the baby spinach and arugula. Toss them together in a large salad bowl.", tip: "Ensure greens are fully dry so the dressing clings to them instead of sliding off." },
      { step: 3, text: "Drizzle about half of the prepared balsamic dressing over the greens and toss gently to coat.", tip: "It is better to under-dress first and offer extra dressing at the table." },
      { step: 4, text: "Arrange the sliced strawberries, blueberries, and avocado slices beautifully on top of the greens.", tip: "For avocado slices, squeeze a tiny bit of lemon juice on them to prevent browning." },
      { step: 5, text: "Sprinkle the crumbled goat cheese and candied pecans evenly over the salad.", tip: "Add the goat cheese right at the end so it doesn't get smeared during tossing." },
      { step: 6, text: "Drizzle the remaining dressing on top and serve immediately as a fresh appetizer or side dish.", tip: "Pair with grilled chicken or salmon for a full high-protein meal!" }
    ]
  },
  {
    id: "chocolate-cookies",
    title: "Soft Chewy Chocolate Chip Cookies",
    description: "The ultimate bakery-style cookies: crispy golden edges, soft gooey centers, packed with pools of dark chocolate and finished with flaky sea salt.",
    image: "assets/images/chocolate_cookies.png",
    prepTime: 15,
    cookTime: 12,
    servings: 12,
    difficulty: "Medium",
    category: "Baking",
    tags: ["Sweet", "Baking", "Classic"],
    equipment: [
      { name: "Large Mixing Bowl", icon: "bowl" },
      { name: "Hand Mixer / Whisk", icon: "pan" },
      { name: "Baking Sheet", icon: "sheet" },
      { name: "Parchment Paper", icon: "paper" },
      { name: "Cookie Scoop", icon: "scoop" },
      { name: "Wire Cooling Rack", icon: "rack" }
    ],
    ingredients: [
      { name: "all-purpose flour", quantity: 2.25, unit: "cups", category: "Pantry" },
      { name: "baking soda", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "fine sea salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "unsalted butter, melted and cooled", quantity: 0.75, unit: "cup", category: "Dairy" },
      { name: "dark brown sugar, packed", quantity: 1, unit: "cup", category: "Pantry" },
      { name: "granulated sugar", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "large eggs (at room temp)", quantity: 2, unit: "pcs", category: "Dairy" },
      { name: "pure vanilla extract", quantity: 2, unit: "tsp", category: "Pantry" },
      { name: "dark chocolate chips or chunks", quantity: 1.5, unit: "cups", category: "Pantry" },
      { name: "flaky sea salt (for topping)", quantity: 1, unit: "pinch", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "In a medium bowl, whisk together the all-purpose flour, baking soda, and fine sea salt. Set aside.", tip: "Whisking dry ingredients breaks up lumps and distributes the baking soda evenly." },
      { step: 2, text: "In a large bowl, whisk together the cooled melted butter, brown sugar, and granulated sugar until fully combined and no sugar lumps remain.", tip: "Using melted butter instead of softened butter creates a denser, chewier cookie." },
      { step: 3, text: "Add the eggs one at a time to the butter mixture, whisking vigorously after each addition. Stir in the vanilla extract. The mixture should become smooth and slightly pale.", tip: "Whisking well at this stage forms a glossy skin on the baked cookies." },
      { step: 4, text: "Pour the dry ingredients into the wet mixture. Use a wooden spoon or rubber spatula to fold them together just until the flour disappears. Do not overmix.", tip: "Overmixing forms gluten, which can make the cookies tough instead of tender." },
      { step: 5, text: "Fold in the dark chocolate chips/chunks, reserving a few to press into the tops later. Cover the bowl and chill the dough in the fridge for at least 30 minutes.", tip: "Chilling the dough prevents cookies from spreading too flat and deepens the caramel flavors." },
      { step: 6, text: "Preheat oven to 350°F (175°C) and line two baking sheets with parchment paper. Scoop 3-tablespoon-sized mounds of dough onto the sheets, spacing them 2 inches apart.", tip: "A cookie scoop helps ensure all cookies are the exact same size so they bake evenly." },
      { step: 7, text: "Bake for 10-12 minutes until the edges are golden brown, but the centers still look soft and slightly underbaked.", tip: "Cookies will continue to bake on the hot sheet after being pulled from the oven." },
      { step: 8, text: "Immediately press a few extra chocolate chunks on top and sprinkle with a pinch of flaky sea salt. Let cool on the sheet for 5 minutes before transferring to a wire rack.", tip: "Flaky sea salt offsets the sweet chocolate and makes the flavors pop!" }
    ]
  },
  {
    id: "avocado-toast",
    title: "Gourmet Loaded Avocado Toast",
    description: "Crispy toasted sourdough bread loaded with mashed creamy avocado, cherry tomatoes, crumbled feta cheese, and microgreens.",
    image: "", // Use CSS background or icon
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    difficulty: "Easy",
    category: "Breakfast",
    tags: ["Quick", "Healthy", "Vegetarian"],
    equipment: [
      { name: "Toaster or Pan", icon: "toaster" },
      { name: "Fork", icon: "fork" },
      { name: "Chef's Knife", icon: "knife" }
    ],
    ingredients: [
      { name: "sourdough bread, thick slice", quantity: 1, unit: "pc", category: "Pantry" },
      { name: "ripe avocado", quantity: 1, unit: "pc", category: "Produce" },
      { name: "lemon juice", quantity: 1, unit: "tsp", category: "Produce" },
      { name: "cherry tomatoes, halved", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "feta cheese, crumbled", quantity: 2, unit: "tbsp", category: "Dairy" },
      { name: "red pepper flakes", quantity: 0.25, unit: "tsp", category: "Pantry" },
      { name: "olive oil, extra virgin", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "salt and black pepper", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Toast the slice of sourdough bread until golden brown and crispy.", tip: "A thicker slice of sourdough provides a sturdy base for heavy toppings." },
      { step: 2, text: "Cut the avocado in half, remove the pit, and scoop the flesh into a small bowl. Add the lemon juice, a pinch of salt, and black pepper. Mash with a fork until chunky-smooth.", tip: "Lemon juice adds brightness and stops the avocado from turning brown." },
      { step: 3, text: "Spread the mashed avocado generously over the toasted sourdough bread.", tip: "Spread it all the way to the crust edges!" },
      { step: 4, text: "Top with the halved cherry tomatoes and crumbled feta cheese. Sprinkle red pepper flakes and drizzle a tiny bit of olive oil over the top.", tip: "Add microgreens or a poached egg on top for an extra gourmet touch!" }
    ]
  },
  {
    id: "tomato-soup",
    title: "Roasted Tomato Basil Soup",
    description: "A comforting bowl of rich soup made from oven-roasted tomatoes, garlic, and onions, blended smooth with cream and fresh basil leaves.",
    image: "", // Use CSS background or icon
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    difficulty: "Easy",
    category: "Soup",
    tags: ["Comfort Food", "Vegetarian", "Warm"],
    equipment: [
      { name: "Baking Sheet", icon: "sheet" },
      { name: "Large Pot", icon: "pot" },
      { name: "Immersion Blender", icon: "blender" }
    ],
    ingredients: [
      { name: "roma tomatoes, halved", quantity: 10, unit: "pcs", category: "Produce" },
      { name: "olive oil", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "yellow onion, chopped", quantity: 1, unit: "pc", category: "Produce" },
      { name: "garlic cloves, peeled", quantity: 6, unit: "pcs", category: "Produce" },
      { name: "vegetable broth", quantity: 3, unit: "cups", category: "Pantry" },
      { name: "heavy cream", quantity: 0.5, unit: "cup", category: "Dairy" },
      { name: "fresh basil leaves", quantity: 0.5, unit: "cup", category: "Produce" },
      { name: "salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Preheat the oven to 400°F (200°C). Toss the halved roma tomatoes and whole garlic cloves with 2 tablespoons of olive oil, salt, and pepper. Roast on a baking sheet for 25 minutes.", tip: "Roasting caramelizes the tomato sugars and mellows the garlic." },
      { step: 2, text: "In a large pot, heat 1 tablespoon of olive oil over medium heat. Add the chopped yellow onion and sauté for 5 minutes until soft and translucent.", tip: "Lower the heat if the onions start to brown too quickly." },
      { step: 3, text: "Add the roasted tomatoes, garlic, and any pan juices into the pot. Pour in the vegetable broth and bring to a boil. Reduce heat and simmer uncovered for 10 minutes.", tip: "Simmering lets all the roasted aromatics blend together." },
      { step: 4, text: "Remove the pot from heat. Add the fresh basil leaves. Use an immersion blender to puree the soup until completely smooth and creamy.", tip: "Be careful! Hot soup can splash. If using a stand blender, blend in batches and remove the center cap to let steam escape." },
      { step: 5, text: "Stir in the heavy cream. Taste and adjust seasoning with extra salt and pepper. Return to low heat for 2 minutes to heat through.", tip: "Serve hot with a crispy grilled cheese sandwich for the ultimate pairing!" }
    ]
  },
  {
    id: "classic-burger",
    title: "Classic Beef Cheeseburger",
    description: "Juicy pan-seared ground beef patty topped with melted cheddar cheese, fresh lettuce, tomato slice, and house burger sauce in a brioche bun.",
    image: "",
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: "Easy",
    category: "Burgers",
    tags: ["Quick", "Comfort Food", "American"],
    equipment: [
      { name: "Cast Iron Skillet", icon: "pan" },
      { name: "Cooking Spatula", icon: "spatula" },
      { name: "Cutting Board", icon: "board" },
      { name: "Chef's Knife", icon: "knife" }
    ],
    ingredients: [
      { name: "ground beef (80/20 blend)", quantity: 340, unit: "g", category: "Meat" },
      { name: "cheddar cheese slices", quantity: 2, unit: "pcs", category: "Dairy" },
      { name: "brioche hamburger buns", quantity: 2, unit: "pcs", category: "Pantry" },
      { name: "tomato, sliced", quantity: 1, unit: "pc", category: "Produce" },
      { name: "butter lettuce leaves", quantity: 2, unit: "pcs", category: "Produce" },
      { name: "mayonnaise", quantity: 2, unit: "tbsp", category: "Pantry" },
      { name: "ketchup", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "sweet pickle relish", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "salt and pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Divide ground beef into two equal portions and shape into flat patties, slightly wider than the buns. Press a small indent in the center of each patty.", tip: "Patty indents prevent the burgers from bulging in the middle during cooking." },
      { step: 2, text: "Mix the mayonnaise, ketchup, and sweet pickle relish in a small bowl to make the house burger sauce. Set aside.", tip: "A dash of hot sauce or Worcestershire adds extra depth!" },
      { step: 3, text: "Heat a skillet over medium-high heat. Toast the split brioche buns face-down until golden, then set aside. Season patties generously with salt and pepper.", tip: "Toasting the buns creates a barrier that prevents them from getting soggy." },
      { step: 4, text: "Add patties to the hot skillet. Cook for 3-4 minutes until a deep brown crust forms. Flip, immediately top each with cheddar cheese, and cook for 3 minutes.", tip: "Covering the skillet with a lid helps melt the cheese quickly." },
      { step: 5, text: "Spread burger sauce on the bottom buns. Layer lettuce, cheese-topped patty, tomato slice, and top bun. Serve warm.", tip: "Let the patty rest for 1 minute before assembling so the juices stay locked in!" }
    ]
  },
  {
    id: "crispy-fries",
    title: "Crispy Garlic Herb French Fries",
    description: "Crispy baked potato fries tossed in extra virgin olive oil, minced garlic, fresh parsley, and freshly grated parmesan cheese.",
    image: "",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "Easy",
    category: "Sides",
    tags: ["Quick", "Snack", "Vegetarian"],
    equipment: [
      { name: "Baking Sheet", icon: "sheet" },
      { name: "Chef's Knife", icon: "knife" },
      { name: "Large Bowl", icon: "bowl" }
    ],
    ingredients: [
      { name: "russet potatoes, scrubbed", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "olive oil", quantity: 3, unit: "tbsp", category: "Pantry" },
      { name: "garlic powder", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs", category: "Produce" },
      { name: "fresh parsley, chopped", quantity: 2, unit: "tbsp", category: "Produce" },
      { name: "parmesan cheese, grated", quantity: 3, unit: "tbsp", category: "Dairy" },
      { name: "sea salt", quantity: 1, unit: "tsp", category: "Pantry" },
      { name: "black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Slice potatoes into 1/4-inch thick sticks. Soak in a large bowl of cold water for 30 minutes, then drain and pat completely dry with paper towels.", tip: "Soaking removes excess starch, making the fries much crispier when baked." },
      { step: 2, text: "Preheat oven to 425°F (220°C). Toss dried potatoes in olive oil, garlic powder, salt, and black pepper in a dry bowl.", tip: "Avoid adding minced garlic before baking as it will burn at high temperatures." },
      { step: 3, text: "Spread potatoes in a single layer on a lined baking sheet. Bake for 20-25 minutes, flipping halfway through, until golden brown and crispy.", tip: "Ensure the fries do not overlap on the sheet, or they will steam instead of baking." },
      { step: 4, text: "Immediately toss hot fries with minced garlic, parsley, and parmesan cheese in a bowl, then serve.", tip: "The residual heat of the fries will soften the raw garlic and melt the parmesan!" }
    ]
  },
  {
    id: "garlic-parm-pasta",
    title: "Creamy Garlic Parmesan Pasta",
    description: "Rich, velvety fettuccine pasta coated in a luxurious cream sauce made with fresh garlic, butter, heavy cream, and lots of grated parmesan.",
    image: "",
    prepTime: 5,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    category: "Pasta",
    tags: ["Vegetarian", "Quick", "Comfort Food"],
    equipment: [
      { name: "Large Pot", icon: "pot" },
      { name: "Large Skillet", icon: "pan" },
      { name: "Tongs", icon: "tongs" }
    ],
    ingredients: [
      { name: "fettuccine pasta", quantity: 400, unit: "g", category: "Pantry" },
      { name: "butter", quantity: 4, unit: "tbsp", category: "Dairy" },
      { name: "garlic cloves, minced", quantity: 4, unit: "pcs", category: "Produce" },
      { name: "heavy cream", quantity: 1.5, unit: "cups", category: "Dairy" },
      { name: "parmesan cheese, grated", quantity: 1, unit: "cup", category: "Dairy" },
      { name: "salt and black pepper", quantity: 0.5, unit: "tsp", category: "Pantry" },
      { name: "fresh parsley, chopped", quantity: 2, unit: "tbsp", category: "Produce" }
    ],
    instructions: [
      { step: 1, text: "Boil fettuccine pasta in salted water until al dente. Reserve 1/2 cup of pasta water, then drain.", tip: "Always salt your pasta boiling water generously!" },
      { step: 2, text: "Melt butter in a skillet over medium heat. Add garlic and cook for 1 minute until fragrant.", tip: "Do not let the garlic brown or it will turn bitter." },
      { step: 3, text: "Pour in the heavy cream and let simmer for 3 minutes to reduce slightly. Whisk in grated parmesan cheese until smooth.", tip: "Add the cheese in small handfuls, whisking constantly to prevent clumping." },
      { step: 4, text: "Add pasta and reserved water to skillet. Toss for 1-2 minutes until sauce coats noodles. Garnish with parsley and black pepper.", tip: "Pasta starch in the reserved water helps thin and emulsify the rich cream sauce." }
    ]
  },
  {
    id: "blueberry-pancakes",
    title: "Fluffy Blueberry Pancakes",
    description: "Light and airy homemade pancakes bursting with fresh blueberries, served with butter and warm maple syrup.",
    image: "",
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    difficulty: "Easy",
    category: "Breakfast",
    tags: ["Breakfast", "Classic", "Sweet"],
    equipment: [
      { name: "Large Bowl", icon: "bowl" },
      { name: "Whisk", icon: "pan" },
      { name: "Griddle or Skillet", icon: "pan" },
      { name: "Spatula", icon: "spatula" }
    ],
    ingredients: [
      { name: "all-purpose flour", quantity: 1.5, unit: "cups", category: "Pantry" },
      { name: "baking powder", quantity: 3.5, unit: "tsp", category: "Pantry" },
      { name: "sugar", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "salt", quantity: 0.25, unit: "tsp", category: "Pantry" },
      { name: "milk", quantity: 1.25, unit: "cups", category: "Dairy" },
      { name: "egg", quantity: 1, unit: "pc", category: "Dairy" },
      { name: "butter, melted", quantity: 3, unit: "tbsp", category: "Dairy" },
      { name: "fresh blueberries", quantity: 1, unit: "cup", category: "Produce" }
    ],
    instructions: [
      { step: 1, text: "In a large bowl, whisk together the flour, baking powder, sugar, and salt.", tip: "Sifting or whisking helps combine the dry leavening agents evenly." },
      { step: 2, text: "Make a well in the center and pour in the milk, egg, and melted butter. Whisk until smooth, but do not overmix.", tip: "A few small lumps in pancake batter are completely fine and help make them fluffier!" },
      { step: 3, text: "Heat a lightly oiled griddle or frying pan over medium-high heat. Pour or scoop batter onto the griddle, using approximately 1/4 cup for each pancake. Drop fresh blueberries onto the batter.", tip: "Dropping berries directly onto the cooking batter ensures even distribution." },
      { step: 4, text: "Cook until bubbles pop on the surface, then flip with a spatula and cook until browned on the other side. Serve hot.", tip: "Flip only once to keep the pancakes high and fluffy!" }
    ]
  },
  {
    id: "margherita-pizza",
    title: "Classic Margherita Pizza",
    description: "Traditional Italian thin-crust pizza topped with rich tomato sauce, fresh mozzarella cheese, ripe tomatoes, and fragrant basil leaves.",
    image: "",
    prepTime: 20,
    cookTime: 12,
    servings: 2,
    difficulty: "Medium",
    category: "Pizza",
    tags: ["Classic", "Italian", "Vegetarian"],
    equipment: [
      { name: "Pizza Stone or Sheet", icon: "sheet" },
      { name: "Pizza Cutter", icon: "cutter" },
      { name: "Large Bowl", icon: "bowl" }
    ],
    ingredients: [
      { name: "pizza dough", quantity: 1, unit: "pc", category: "Pantry" },
      { name: "canned crushed tomatoes", quantity: 0.5, unit: "cup", category: "Pantry" },
      { name: "fresh mozzarella cheese, sliced", quantity: 150, unit: "g", category: "Dairy" },
      { name: "fresh basil leaves", quantity: 8, unit: "pcs", category: "Produce" },
      { name: "extra virgin olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
      { name: "salt", quantity: 0.25, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      { step: 1, text: "Preheat your oven to 500°F (260°C). If using a pizza stone, place it in the oven while preheating.", tip: "A piping hot oven is essential for a crispy thin crust pizza." },
      { step: 2, text: "Stretch pizza dough on a floured surface to form a 12-inch circle. Place on parchment paper or a pizza peel.", tip: "Avoid using a rolling pin if you want a bubbly, airy crust border." },
      { step: 3, text: "Spread crushed tomatoes thinly over the dough. Season with a pinch of salt. Arrange mozzarella cheese slices on top.", tip: "Do not overload the pizza with sauce or cheese, or the crust will become soggy." },
      { step: 4, text: "Bake for 10-12 minutes until crust is dark golden and cheese is bubbly and browned in spots.", tip: "Watch it closely - it bakes very fast at high heat!" },
      { step: 5, text: "Remove from oven. Top immediately with fresh basil leaves and a drizzle of olive oil, slice, and serve.", tip: "Adding basil right after baking keeps it bright green and aromatic." }
    ]
  }
];
