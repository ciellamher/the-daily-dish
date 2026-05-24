// Recipe Card Component (HTML generation - FOODEAT style)

import { escapeHtml, ICONS, getGourmetFoodImage } from "../utils.js";

/**
 * Returns the HTML string representation of a recipe card styled like the FOODEAT menu.
 */
export function renderRecipeCard(recipe) {
  const { id, title, description, image, prepTime, cookTime, difficulty, category, tags, matchStats } = recipe;
  
  // Robust image sourcing: If image is empty or invalid, pull dynamically from Unsplash helper
  const resolvedImage = image ? image : getGourmetFoodImage(title, category);

  // Generate a mock rating (8.0 - 9.9) based on the title's character codes
  let rating = 8.5;
  if (title) {
    let charSum = 0;
    for (let i = 0; i < title.length; i++) charSum += title.charCodeAt(i);
    rating = (8.0 + (charSum % 20) / 10).toFixed(1);
  }

  // Determine matching tag status
  let matchBadgeHtml = "";
  if (matchStats) {
    const { missingCount, matchPercentage } = matchStats;
    if (missingCount === 0) {
      matchBadgeHtml = `<span class="card-match-badge match-perfect">Ready to Cook</span>`;
    } else if (missingCount <= 2) {
      matchBadgeHtml = `<span class="card-match-badge match-partial">Need ${missingCount} items</span>`;
    } else {
      matchBadgeHtml = `<span class="card-match-badge match-low">${Math.round(matchPercentage * 100)}% Match</span>`;
    }
  }

  // Cover image: circle bowl wrapper
  const imageHtml = `
    <div class="card-circle-plate-wrapper">
      <img src="${escapeHtml(resolvedImage)}" alt="${escapeHtml(title)}" class="card-circle-plate-img" loading="lazy">
    </div>
  `;

  // Draw terracotta rating stars based on rating
  // 9.0+ gets 5 stars, 8.5-8.9 gets 4 stars, below gets 3 stars
  const starsCount = rating >= 9.0 ? 5 : rating >= 8.5 ? 4 : 3;
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= starsCount) {
      starsHtml += `<span class="star-svg-filled">${ICONS.starFilled}</span>`;
    } else {
      starsHtml += `<span class="star-svg-empty">${ICONS.star}</span>`;
    }
  }

  // Generate a mock price ($10 - $22) based on prepTime and difficulty
  const mockPrice = 10 + ((prepTime + cookTime) % 13);

  const totalTime = prepTime + cookTime;

  return `
    <div class="recipe-card" data-recipe-id="${id}">
      <div class="card-image-wrapper">
        ${imageHtml}
        <span class="card-category-badge">${escapeHtml(category)}</span>
        ${matchBadgeHtml}
      </div>
      <div class="card-body">
        
        <!-- Title & Rating Inline Row -->
        <div class="card-title-row">
          <h4 class="card-title">${escapeHtml(title)}</h4>
          <span class="card-rating-badge">${rating}</span>
        </div>

        <p class="card-desc">${escapeHtml(description)}</p>
        
        <!-- Stars & Price Row (Mockup style) -->
        <div class="card-stars-price-row">
          <div class="card-stars-container">
            ${starsHtml}
          </div>
          <span class="card-price-label">$${mockPrice}</span>
        </div>

        <div class="card-meta">
          <span class="card-meta-item">
            <span class="meta-icon">${ICONS.clock}</span>
            <span>${totalTime}m</span>
          </span>
          <span class="card-meta-item">
            <span class="meta-icon">${ICONS.fire}</span>
            <span>${escapeHtml(difficulty)}</span>
          </span>
        </div>

        <div class="card-actions">
          <button class="btn-card-primary btn-view-details" data-id="${id}">View Details</button>
          <button class="btn-card-secondary btn-quick-add-grocery" data-id="${id}">
            <span class="btn-action-icon">${ICONS.cart}</span>
            <span>Add List</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
