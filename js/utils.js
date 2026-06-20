// Utilities for Cookbook Web Application

/**
 * Scales an ingredient quantity based on the ratio between target and base servings.
 */
export function scaleQuantity(quantity, baseServings, targetServings) {
  if (!quantity) return 0;
  return (quantity * targetServings) / baseServings;
}

/**
 * Accurately determines if a recipe ingredient matches a selected fridge ingredient.
 * Handles singular/plural matches and avoids false positives like "egg" in "eggplant".
 */
export function isIngredientMatch(ingName, selectedIng) {
  if (!ingName || !selectedIng) return false;
  
  const cleanIng = ingName.toLowerCase().trim();
  const cleanSel = selectedIng.toLowerCase().trim();
  
  // 1. Direct substring match if it's a multi-word phrase (like "olive oil")
  if (cleanSel.includes(" ") && cleanIng.includes(cleanSel)) {
    return true;
  }
  
  // 2. Word boundary check
  const singularSel = cleanSel.replace(/ies$/, "berry").replace(/es$/, "").replace(/s$/, "");
  const escapedSel = singularSel.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  
  const pattern = new RegExp(`\\b${escapedSel}(s|es|ies)?\\b`, 'i');
  if (pattern.test(cleanIng)) {
    return true;
  }
  
  // 3. Fallback check with explicit false-positive guards
  if (cleanIng.includes(cleanSel)) {
    // Avoid false positive: egg matching eggplant
    if (cleanSel === "egg" && cleanIng.includes("eggplant")) {
      return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Formats a decimal quantity into a readable kitchen fraction (e.g. 1 1/2, 1/3, 0.75).
 */
export function formatQuantity(qty) {
  if (qty === null || qty === undefined || qty === 0 || isNaN(qty)) return "";
  
  // Round to nearest hundredth to resolve floating point issues
  const value = Math.round(qty * 100) / 100;
  const integer = Math.floor(value);
  const decimal = Math.round((value - integer) * 100) / 100;
  
  let fraction = "";
  
  if (decimal === 0) {
    return integer.toString();
  }
  
  // Match common baking fractions
  if (Math.abs(decimal - 0.25) <= 0.04) {
    fraction = "1/4";
  } else if (Math.abs(decimal - 0.33) <= 0.04 || Math.abs(decimal - 0.3) <= 0.04) {
    fraction = "1/3";
  } else if (Math.abs(decimal - 0.5) <= 0.04) {
    fraction = "1/2";
  } else if (Math.abs(decimal - 0.67) <= 0.04 || Math.abs(decimal - 0.66) <= 0.04) {
    fraction = "2/3";
  } else if (Math.abs(decimal - 0.75) <= 0.04) {
    fraction = "3/4";
  } else {
    // If it doesn't match a clean kitchen fraction, show 1 decimal place
    const roundedValue = Math.round(value * 10) / 10;
    return roundedValue.toString();
  }
  
  if (integer > 0) {
    return `${integer} ${fraction}`;
  }
  return fraction;
}

/**
 * Downloads a string content as a text file.
 */
export function downloadTextFile(filename, text) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Copies a given text to the user's clipboard.
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) resolve();
      else reject(new Error("Copy command failed"));
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

/**
 * Escape HTML utility to prevent injection when rendering text
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  if (typeof str !== "string") return String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Returns a high-quality Unsplash food image URL based on dish keywords.
 */
export function getGourmetFoodImage(query, category) {
  const q = (query || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  
  if (q.includes("burger") || q.includes("sandwich")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("pizza") || q.includes("flatbread")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("curry") || q.includes("indian")) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("taco") || q.includes("mexican") || q.includes("fajita")) {
    return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("pancake") || q.includes("waffle") || q.includes("crepe")) {
    return "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("steak") || q.includes("beef") || q.includes("meat")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("salmon") || q.includes("fish") || q.includes("seafood") || cat.includes("seafood")) {
    return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("pasta") || q.includes("spaghetti") || q.includes("noodle") || cat.includes("pasta")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("salad") || cat.includes("salad") || cat.includes("salads")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("soup") || cat.includes("soup") || cat.includes("soups") || q.includes("stew")) {
    return "https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("sushi") || q.includes("japanese")) {
    return "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("cupcake")) {
    if (q.includes("vanilla")) {
      return "https://images.unsplash.com/photo-1486428128344-5413e434ad35?w=600&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("cake") || q.includes("cookie") || q.includes("brownie") || q.includes("sweet") || cat.includes("baking")) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("toast") || q.includes("egg") || cat.includes("breakfast")) {
    return "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("french fries") || q.includes("fries") || q.includes("potato")) {
    return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("noodle") || q.includes("ramen") || q.includes("laksa") || q.includes("soup")) {
    return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("shrimp") || q.includes("prawn")) {
    return "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80";
  }
  if (q.includes("rice") || q.includes("fried rice") || q.includes("paella")) {
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80";
  }
  
  // Default fallback
  return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80";
}

/**
 * Clean SVG icons dictionary to avoid using raw emojis.
 */
export const ICONS = {
  cooking: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M3 10h18v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9z"></path><path d="M6 6h12v4H6V6z"></path><path d="M12 2v4"></path><path d="M1 12h2"></path><path d="M21 12h2"></path></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  cart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  starFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon star-icon-filled"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  minus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  link: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  wand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><line x1="18" y1="2" x2="22" y2="6"></line><path d="m2 22 10-10"></path><path d="M12 2v2"></path><path d="M20 12h2"></path><path d="m19 19-2.5-2.5"></path><path d="m7.5 7.5L5 5"></path><path d="m18 8 3-3"></path><path d="m19 16-1.5-1.5"></path><path d="m8 18-3 3"></path></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  fridge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="5" y1="10" x2="19" y2="10"></line><line x1="9" y1="5" x2="9" y2="7"></line><line x1="9" y1="14" x2="9" y2="18"></line></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  export: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>`,
  broom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="m3 21 18-18"></path><path d="m11 17 4-4"></path><path d="M19 13.5c-1-1-3-.5-4 1.5s-2.5 3-1.5 4c1 1 3 .5 4-1.5s2.5-3 1.5-4z"></path></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  catering: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M12 2a15.3 15.3 0 0 1 4 10H8a15.3 15.3 0 0 1 4-10z"></path><path d="M21 12H3a2 2 0 0 0-2 2v2h22v-2a2 2 0 0 0-2-2z"></path><rect x="4" y="16" width="16" height="4" rx="1"></rect></svg>`,
  membership: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
  delivery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  
  // Kitchen Equipment SVGs
  pot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M3 10h18v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9z"></path><path d="M6 6h12v4H6V6z"></path><path d="M12 2v4"></path><path d="M1 12h2"></path><path d="M21 12h2"></path></svg>`,
  pan: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M2 13a8 8 0 1 0 14.86-4H22v2h-4.86A8 8 0 0 0 2 13z"></path></svg>`,
  knife: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="m18 2 4 4L8 22H4v-4L18 2z"></path><line x1="14" y1="6" x2="18" y2="10"></line></svg>`,
  tongs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M5 2c0 8 3 14 7 20m7-20c0 8-3 14-7 20M8 5h8"></path></svg>`,
  board: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="3" y="6" width="18" height="12" rx="1.5"></rect><line x1="6" y1="12" x2="8" y2="12"></line></svg>`,
  bowl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M2 10a10 10 0 0 0 20 0H2zm4 10v2m12-2v2m-6-2v2"></path></svg>`,
  sheet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><rect x="4" y="6" width="16" height="12" rx="1" ry="1"></rect></svg>`,
  paper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  scoop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="12" cy="9" r="5"></circle><path d="M12 14v8M9 22h6"></path></svg>`,
  rack: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="2" y="2" width="20" height="20" rx="2"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="12" y1="2" x2="12" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="7" x2="22" y2="7"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="17" x2="22" y2="17"></line></svg>`,
  toaster: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path><line x1="21" y1="14" x2="23" y2="14"></line></svg>`,
  fork: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M12 2v20M8 2v6c0 1.5 1 2 4 2s4-.5 4-2V2M8 2h8"></path></svg>`,
  blender: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"></path><line x1="12" y1="17" x2="12" y2="22"></line><circle cx="12" cy="9" r="1"></circle></svg>`,
  brush: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M18 21a3 3 0 0 0 3-3V8h-6v10a3 3 0 0 0 3 3z"></path><path d="M15 8V5a3 3 0 0 0-6 0v3h6z"></path><path d="M9 8H3v10a3 3 0 0 0 3 3h3V8z"></path></svg>`,
  cutter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="12" cy="7" r="5"></circle><path d="M12 12v10h-2"></path></svg>`,
  rollingPin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><rect x="5" y="10" width="14" height="4" rx="1"></rect><line x1="1" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="23" y2="12"></line></svg>`,
  spatula: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M6 2h6v12H6z"></path><path d="M9 14v8"></path></svg>`,
  spoon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M12 2a4 4 0 0 0-4 4c0 3 2.5 4 4 6h-1v10h2V12h-1c1.5-2 4-3 4-6a4 4 0 0 0-4-4z"></path></svg>`
};



// ==========================================================================
// Ambient Lo-fi Audio Synthesizer (Pure Web Audio API, Zero Network Loading)
// ==========================================================================
let audioCtx = null;
let synthNode = null;
let crackleNode = null;
let crackleNodePops = null;
let chordIndex = 0;
let chordInterval = null;

// Warm soft chords: Cmaj9, Fmaj9, Am9, G6/9
const CHORDS = [
  [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
  [87.31, 130.81, 174.61, 220.00, 261.63, 329.63], // Fmaj9
  [110.00, 164.81, 220.00, 261.63, 329.63, 392.00], // Am9
  [98.00, 146.83, 196.00, 246.94, 293.66, 392.00]  // G6/9
];

function initAmbientSynth() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
}

export function startAmbientAudio() {
  initAmbientSynth();
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  // 1. Create crackle (vinyl background noise)
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1000;
  noiseFilter.Q.value = 0.5;
  
  const noiseVolume = audioCtx.createGain();
  noiseVolume.gain.value = 0.015; // Very soft vinyl sound
  
  whiteNoise.connect(noiseFilter);
  noiseFilter.connect(noiseVolume);
  noiseVolume.connect(audioCtx.destination);
  whiteNoise.start();
  crackleNode = whiteNoise;
  
  // 2. Create random vinyl crackle pops
  const popBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const popOutput = popBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    if (Math.random() < 0.0001) { // Random impulses
      popOutput[i] = Math.random() * 0.4 - 0.2;
    } else {
      popOutput[i] = 0;
    }
  }
  
  const cracklePops = audioCtx.createBufferSource();
  cracklePops.buffer = popBuffer;
  cracklePops.loop = true;
  
  const popVolume = audioCtx.createGain();
  popVolume.gain.value = 0.05;
  
  cracklePops.connect(popVolume);
  popVolume.connect(audioCtx.destination);
  cracklePops.start();
  crackleNodePops = cracklePops;
  
  // 3. Play warm triangle wave pads
  let activeOscillators = [];
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.035; // Soft ambient volume
  masterGain.connect(audioCtx.destination);
  
  function playChord(frequencies) {
    const now = audioCtx.currentTime;
    // Fade out previous oscillators
    activeOscillators.forEach(osc => {
      osc.gainNode.gain.setValueAtTime(osc.gainNode.gain.value, now);
      osc.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      setTimeout(() => {
        try { osc.stop(); } catch(e) {}
      }, 1600);
    });
    activeOscillators = [];
    
    // Create new oscillators for this chord
    frequencies.forEach(freq => {
      const osc = audioCtx.createOscillator();
      osc.type = "triangle"; // Soft warm tone
      osc.frequency.setValueAtTime(freq, now);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 1.2); // Slow attack
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 750; // Lowpass filter to make it cozy
      
      osc.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(masterGain);
      
      osc.start(now);
      activeOscillators.push({
        osc,
        gainNode,
        stop: () => osc.stop()
      });
    });
  }
  
  // Cycle chords every 6 seconds
  playChord(CHORDS[chordIndex]);
  chordInterval = setInterval(() => {
    chordIndex = (chordIndex + 1) % CHORDS.length;
    playChord(CHORDS[chordIndex]);
  }, 6000);
  
  synthNode = {
    stop: () => {
      clearInterval(chordInterval);
      activeOscillators.forEach(osc => osc.stop());
      whiteNoise.stop();
      cracklePops.stop();
      masterGain.disconnect();
    }
  };
}

export function stopAmbientAudio() {
  if (synthNode) {
    synthNode.stop();
    synthNode = null;
  }
  if (audioCtx) {
    audioCtx.suspend();
  }
}

/**
 * Scans title, ingredients, and instructions to accurately determine required kitchen gear.
 */
export function extractEquipment(title, ingredients, instructions) {
  const textToScan = [
    title || "",
    ...(ingredients || []).map(i => i.name || ""),
    ...(instructions || []).map(i => i.text || "")
  ].join(" ").toLowerCase();

  const gearMap = [
    { key: "pot", names: ["pot", "saucepan", "dutch oven", "slow cooker", "boil", "soup", "simmer", "casserole", "boiling"], defaultName: "Pot" },
    { key: "pan", names: ["pan", "skillet", "griddle", "wok", "fry", "sear", "sauté", "cook in skillet", "cast iron"], defaultName: "Skillet" },
    { key: "knife", names: ["knife", "slice", "chop", "dice", "mince", "cut", "peel", "butterfly"], defaultName: "Chef's Knife" },
    { key: "board", names: ["board", "cutting board"], defaultName: "Cutting Board" },
    { key: "bowl", names: ["bowl", "mixing bowl", "ramekin", "ramekins"], defaultName: "Mixing Bowl" },
    { key: "sheet", names: ["sheet", "baking sheet", "baking pan", "baking dish", "oven", "bake", "preheat"], defaultName: "Baking Sheet" },
    { key: "paper", names: ["parchment", "foil", "paper towel"], defaultName: "Parchment Paper" },
    { key: "tongs", names: ["tongs"], defaultName: "Tongs" },
    { key: "spoon", names: ["spoon", "spatula", "whisk", "ladle", "stir"], defaultName: "Cooking Spoon" },
    { key: "brush", names: ["brush", "pastry brush"], defaultName: "Pastry Brush" },
    { key: "cutter", names: ["cutter", "pizza cutter"], defaultName: "Pizza Cutter" },
    { key: "rollingPin", names: ["rolling pin"], defaultName: "Rolling Pin" },
    { key: "blender", names: ["blender", "food processor", "purée"], defaultName: "Blender" },
    { key: "rack", names: ["rack", "wire rack", "cooling rack"], defaultName: "Cooling Rack" },
    { key: "toaster", names: ["toast", "toaster"], defaultName: "Toaster" }
  ];

  const foundKeys = new Set();
  const equipmentList = [];

  for (const gear of gearMap) {
    if (gear.names.some(keyword => textToScan.includes(keyword))) {
      foundKeys.add(gear.key);
      equipmentList.push({ name: gear.defaultName, icon: gear.key });
    }
  }

  // If nothing was found, add a few default items
  if (equipmentList.length === 0) {
    equipmentList.push({ name: "Chef's Knife", icon: "knife" });
    equipmentList.push({ name: "Cooking Spoon", icon: "spoon" });
    equipmentList.push({ name: "Pot or Pan", icon: "pot" });
  }

  return equipmentList;
}

/**
 * Fetches HTML from a URL bypassing CORS using public proxy fallback logic.
 * Tries cors.lol first (which works on duckduckgo), and falls back to allorigins.win.
 */
export function fetchHtmlThroughProxy(url) {
  return fetch(`https://api.cors.lol/?url=${encodeURIComponent(url)}`)
    .then(res => {
      if (!res.ok) throw new Error("cors.lol failed with status " + res.status);
      return res.text();
    })
    .catch(err => {
      console.warn("cors.lol proxy failed, trying AllOrigins fallback...", err);
      return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        .then(res => {
          if (!res.ok) throw new Error("AllOrigins failed with status " + res.status);
          return res.json();
        })
        .then(json => {
          if (!json || !json.contents) throw new Error("Invalid response from AllOrigins");
          return json.contents;
        });
    });
}


