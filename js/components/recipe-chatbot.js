import { escapeHtml, ICONS } from "../utils.js";
import { INGREDIENT_SUBSTITUTIONS } from "./recipe-detail.js";

/**
 * Returns the HTML string for the chatbot toggle button and drawer panel.
 */
export function renderRecipeChatbot(recipe) {
  if (!recipe) return "";

  return `
    <div class="recipe-chatbot-container">
      <!-- Chat Toggle Button -->
      <button id="btn-recipe-chat-toggle" class="recipe-chat-toggle-btn" title="Ask Chef AI Assistant" aria-label="Toggle Chef AI">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Ask Chef AI</span>
      </button>

      <!-- Chat Drawer Panel -->
      <div id="recipe-chat-panel" class="recipe-chat-panel hidden">
        <div class="recipe-chat-header">
          <div class="recipe-chat-chef-profile">
            <span class="recipe-chat-avatar" role="img" aria-label="Chef avatar">👨‍🍳</span>
            <div>
              <h4>Chef Pierre</h4>
              <span class="recipe-chat-status">Online • Culinary AI Assistant</span>
            </div>
          </div>
          <button id="btn-recipe-chat-close" class="recipe-chat-close-btn" aria-label="Close Chat">&times;</button>
        </div>
        
        <div id="recipe-chat-messages" class="recipe-chat-messages">
          <div class="recipe-chat-msg chef">
            <div class="msg-bubble">
              Bonjour! I am Chef Pierre. Ask me anything about preparing this <strong>${escapeHtml(recipe.title)}</strong> recipe, such as ingredient substitutions, cooking times, or kitchen gear!
            </div>
          </div>
        </div>

        <!-- Suggestion Chips -->
        <div class="recipe-chat-suggestions">
          <button type="button" class="chat-suggestion-chip" data-query="Suggest substitutions">🔄 Substitutions</button>
          <button type="button" class="chat-suggestion-chip" data-query="What kitchen gear is needed?">🍳 Gear Needed</button>
          <button type="button" class="chat-suggestion-chip" data-query="How to store leftovers?">🍱 Storage Info</button>
          <button type="button" class="chat-suggestion-chip" data-query="How to make it spicy?">🌶️ Make it Spicy</button>
        </div>

        <form id="recipe-chat-form" class="recipe-chat-form">
          <input type="text" id="recipe-chat-input" placeholder="Type a cooking question..." required autocomplete="off">
          <button type="submit" id="btn-recipe-chat-send" title="Send Question" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;
}

/**
 * Parses user input to generate context-aware recipe assistant answers.
 */
export function getChatbotResponse(query, recipe) {
  const lowerQuery = query.toLowerCase().trim();
  
  // 1. Greetings & Info
  if (lowerQuery.includes("hi") || lowerQuery.includes("hello") || lowerQuery.includes("hey") || lowerQuery.includes("chef") || lowerQuery.includes("pierre") || lowerQuery.includes("help") || lowerQuery.includes("who are you") || lowerQuery.includes("name")) {
    return `Hello! I'm Chef Pierre, your kitchen assistant. Ask me questions about <strong>${escapeHtml(recipe.title)}</strong>, like how to substitute ingredients, what equipment to use, storage instructions, or how to tweak the flavor profiles. How can I help you cook today?`;
  }
  
  // 2. Ingredient Substitutions
  if (lowerQuery.includes("substitut") || lowerQuery.includes("replace") || lowerQuery.includes("swap") || lowerQuery.includes("instead of") || lowerQuery.includes("alternative") || lowerQuery.includes("use instead")) {
    // Check if user specifies a particular ingredient in the recipe
    let matchedIngredient = null;
    let matchedKey = null;
    
    // Sort keys from INGREDIENT_SUBSTITUTIONS by length descending
    const subKeys = Object.keys(INGREDIENT_SUBSTITUTIONS).sort((a, b) => b.length - a.length);
    for (const key of subKeys) {
      if (lowerQuery.includes(key)) {
        // And if the recipe has an ingredient containing this key
        const hasIng = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(key));
        if (hasIng) {
          matchedIngredient = key;
          matchedKey = key;
          break;
        }
      }
    }

    // Fallback: check if the query mentions any part of the recipe ingredient name directly
    if (!matchedIngredient) {
      for (const ing of recipe.ingredients) {
        // Clean up common adjectives/units
        const cleanName = ing.name.toLowerCase().replace(/cloves|minced|peeled|deveined|large|unsalted|fresh|grated|chopped|sliced|halved|crumbled|thick|piece|pcs/g, "").trim();
        const words = cleanName.split(/[\s,]+/).filter(w => w.length >= 3);
        for (const word of words) {
          if (lowerQuery.includes(word)) {
            matchedIngredient = word;
            // Try to find a substitution key that is a substring of the ingredient name
            for (const key of subKeys) {
              if (ing.name.toLowerCase().includes(key)) {
                matchedKey = key;
                break;
              }
            }
            break;
          }
        }
        if (matchedIngredient) break;
      }
    }
    
    if (matchedIngredient) {
      // Find matches in local database
      const subText = matchedKey ? INGREDIENT_SUBSTITUTIONS[matchedKey] : null;
      if (subText) {
        return `Ah, yes! For <strong>${escapeHtml(matchedIngredient)}</strong>, a common culinary substitute is: <em>${subText}</em>. Let me know if you need alternatives for other ingredients!`;
      }
      return `For <strong>${escapeHtml(matchedIngredient)}</strong>, if you don't have it on hand, you can generally use a similar item from the same food group as an alternative, or skip/reduce it if it is a secondary seasoning. What other substitute suggestions can I help you find?`;
    }
    
    // Generic substitution response showing what's in the recipe
    const commonSubs = recipe.ingredients
      .slice(0, 3)
      .map(ing => {
        const keys = Object.keys(INGREDIENT_SUBSTITUTIONS);
        let sub = "a similar item as an alternative";
        for (const key of keys) {
          if (ing.name.toLowerCase().includes(key)) {
            sub = INGREDIENT_SUBSTITUTIONS[key];
            break;
          }
        }
        return `• <strong>${escapeHtml(ing.name)}</strong>: ${sub}`;
      })
      .join("<br>");
      
    return `Here are some ingredient substitution suggestions for <strong>${escapeHtml(recipe.title)}</strong>:<br>${commonSubs}`;
  }

  // 3. Kitchen Gear / Equipment
  if (lowerQuery.includes("gear") || lowerQuery.includes("equipment") || lowerQuery.includes("tool") || lowerQuery.includes("tools") || lowerQuery.includes("pan") || lowerQuery.includes("pot") || lowerQuery.includes("knife") || lowerQuery.includes("board")) {
    if (recipe.equipment && recipe.equipment.length > 0) {
      const gearNames = recipe.equipment.map(e => `• ${escapeHtml(e.name)}`).join("<br>");
      return `To prepare this dish, you will need the following kitchen gear:<br>${gearNames}<br>Make sure your workspace is clean and setup before beginning!`;
    }
    return `This recipe doesn't list specific equipment, but standard prep gear (like a chef's knife, cutting board, and appropriate pots/pans) will be needed.`;
  }

  // 4. Timing & Duration
  if (lowerQuery.includes("long") || lowerQuery.includes("time") || lowerQuery.includes("minutes") || lowerQuery.includes("hours") || lowerQuery.includes("duration") || lowerQuery.includes("prep") || lowerQuery.includes("cook")) {
    const total = recipe.prepTime + recipe.cookTime;
    return `For <strong>${escapeHtml(recipe.title)}</strong>:<br>• <strong>Prep Time</strong>: ${recipe.prepTime} minutes<br>• <strong>Cook Time</strong>: ${recipe.cookTime} minutes<br>• <strong>Total Time</strong>: ${total} minutes. Plan ahead so you have ample time!`;
  }

  // 5. Difficulty
  if (lowerQuery.includes("difficult") || lowerQuery.includes("easy") || lowerQuery.includes("hard") || lowerQuery.includes("level") || lowerQuery.includes("skill") || lowerQuery.includes("complexity")) {
    return `The difficulty level for <strong>${escapeHtml(recipe.title)}</strong> is rated as <strong>${escapeHtml(recipe.difficulty)}</strong>. ${recipe.difficulty === "Easy" ? "It is very straightforward and perfect for beginners!" : "It requires some care, making it a fun culinary task!"}`;
  }

  // 6. Servings / Portion scaling
  if (lowerQuery.includes("servings") || lowerQuery.includes("yield") || lowerQuery.includes("serves") || lowerQuery.includes("people") || lowerQuery.includes("portion") || lowerQuery.includes("scale")) {
    return `This recipe is configured for <strong>${recipe.servings} servings</strong> by default. You can adjust the portion scaler slider on the details page to automatically recalculate the exact ingredient amounts!`;
  }

  // 7. Leftovers & Storage
  if (lowerQuery.includes("store") || lowerQuery.includes("leftover") || lowerQuery.includes("leftovers") || lowerQuery.includes("fridge") || lowerQuery.includes("keep") || lowerQuery.includes("freeze") || lowerQuery.includes("reheat")) {
    return `To store leftovers of <strong>${escapeHtml(recipe.title)}</strong>, cool to room temperature, place in airtight containers, and store in the refrigerator for up to 3 to 4 days. Reheat gently in a skillet or oven for the best texture, or microwave for a quick meal.`;
  }

  // 8. Calories, Nutrition & Health
  if (lowerQuery.includes("calorie") || lowerQuery.includes("calories") || lowerQuery.includes("nutrition") || lowerQuery.includes("healthy") || lowerQuery.includes("diet") || lowerQuery.includes("fat") || lowerQuery.includes("protein") || lowerQuery.includes("carb")) {
    return `This recipe is a wholesome, gourmet option. For an automatic nutritional analysis containing calorie estimations and macronutrient counts, simply click the <strong>Analyze Recipe</strong> button in the recipe card details panel.`;
  }

  // 9. Spiciness & Adjusting Flavors
  if (lowerQuery.includes("spicy") || lowerQuery.includes("hot") || lowerQuery.includes("chili") || lowerQuery.includes("sweet") || lowerQuery.includes("salt") || lowerQuery.includes("flavor") || lowerQuery.includes("taste") || lowerQuery.includes("tweak")) {
    if (lowerQuery.includes("spicy") || lowerQuery.includes("hot") || lowerQuery.includes("chili")) {
      return `To give this <strong>${escapeHtml(recipe.title)}</strong> a spicy kick, add 1/2 teaspoon of crushed red pepper flakes, sliced fresh birds eye chili, or a pinch of cayenne pepper during cooking.`;
    }
    return `To balance the flavors of this dish, season with salt and pepper incrementally as you cook. A tiny squeeze of lemon juice at the end can brighten up the flavors, while a pinch of sugar can balance excessive acidity!`;
  }

  // 10. Cooking Steps
  if (lowerQuery.includes("step") || lowerQuery.includes("instruction") || lowerQuery.includes("procedure") || lowerQuery.includes("how to cook") || lowerQuery.includes("method")) {
    if (recipe.instructions && recipe.instructions.length > 0) {
      const summary = recipe.instructions.slice(0, 3).map(i => `Step ${i.step}: ${escapeHtml(i.text.slice(0, 60))}...`).join("<br>");
      return `Here is a summary of the first few cooking procedures:<br>${summary}<br>Follow along step-by-step on the right side of the recipe page!`;
    }
    return `Refer to the detailed step-by-step procedure list on the right side of the page to cook this dish.`;
  }

  // 11. Custom/Default Responses
  return `Splendid query! For preparing <strong>${escapeHtml(recipe.title)}</strong>, I highly recommend reading through all steps first. Let me know if you need details on ingredient substitutions, timing, storage, or kitchen gear!`;
}

/**
 * Initializes listeners for chatbot UI interaction.
 */
export function initRecipeChatbot(recipe) {
  const toggleBtn = document.getElementById("btn-recipe-chat-toggle");
  const closeBtn = document.getElementById("btn-recipe-chat-close");
  const chatPanel = document.getElementById("recipe-chat-panel");
  const chatForm = document.getElementById("recipe-chat-form");
  const chatInput = document.getElementById("recipe-chat-input");
  const messagesContainer = document.getElementById("recipe-chat-messages");
  const suggestionChips = document.querySelectorAll(".chat-suggestion-chip");

  if (!toggleBtn || !chatPanel) return;

  // Toggle open
  toggleBtn.addEventListener("click", () => {
    chatPanel.classList.toggle("hidden");
    if (!chatPanel.classList.contains("hidden")) {
      chatInput.focus();
      scrollToBottom();
    }
  });

  // Toggle close
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      chatPanel.classList.add("hidden");
    });
  }

  // Send message helper
  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `recipe-chat-msg ${sender}`;
    msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendTypingIndicator() {
    const indicatorDiv = document.createElement("div");
    indicatorDiv.id = "recipe-chat-typing";
    indicatorDiv.className = "recipe-chat-msg chef";
    indicatorDiv.innerHTML = `
      <div class="msg-bubble" style="padding: 8px 14px;">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(indicatorDiv);
    scrollToBottom();
    return indicatorDiv;
  }

  function handleUserQuery(queryText) {
    if (!queryText.trim()) return;
    
    // User message
    appendMessage("user", escapeHtml(queryText));
    
    // Typing indicator
    const indicator = appendTypingIndicator();
    
    // Response delay simulation
    setTimeout(() => {
      // Remove indicator
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
      
      // Get reply and append
      const reply = getChatbotResponse(queryText, recipe);
      appendMessage("chef", reply);
    }, 700 + Math.random() * 400);
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Bind Form submit
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value;
      chatInput.value = "";
      handleUserQuery(text);
    });
  }

  // Bind suggestion chips
  suggestionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query") || chip.innerText;
      handleUserQuery(query);
    });
  });
}
