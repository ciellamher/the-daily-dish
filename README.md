# The Daily Dish

Welcome to **The Daily Dish**, a premium, client-side digital recipe box, weekly planner, and smart shopping companion designed for chefs who value verified, real-world culinary references.

Unlike typical recipe generators that fabricate instructions and proportions, **The Daily Dish is data-driven**. It prioritizes sourcing verified recipes from authoritative culinary sites on the web. It uses APIs, HTML scraping proxies, and query mapping to deliver cooking steps with authentic, real-world source references.

---

## Key Features

### 1. Data-Driven Recipe Generator & Web Crawler
* **Verified Sourcing First**: When you generate a recipe, the engine first searches **TheMealDB API** or executes a headless static HTML scrape via a DuckDuckGo search crawler to find official recipes on the web.
* **Yes/No Confirmation Flow**: Found recipes are presented in a confirmation modal displaying the recipe title and source domain, allowing you to preview and verify before adding it to your box.
* **Plausible Website Fallbacks**: If the system generates a local fallback template, it automatically maps the query keywords to construct a plausible, authentic recipe URL from top culinary authorities:
  * **Filipino Culinary Authority**: Maps to [Panlasang Pinoy](https://panlasangpinoy.com/) (e.g., for adobo, sinigang, or kaldereta).
  * **Baking & Pastry Authority**: Maps to [Sally's Baking Addiction](https://sallysbakingaddiction.com/) (e.g., for cupcakes, cakes, or cookies).
  * **Western & Global Authority**: Maps to [Serious Eats](https://www.seriouseats.com/) (e.g., for steaks, pasta, or pizzas).
* **Reference Links**: Every single card in your recipe box is backed by a clickable external reference badge so you can check the original website.

### 2. Multi-Proxy Link Importer
* Paste any recipe link from the web to import it directly into your Cookbook.
* Uses a multi-proxy fallback (`cors.lol` and `allorigins.win`) to bypass CORS and Cloudflare restrictions.
* Extracts structured metadata via `application/ld+json` Recipe schemas or falls back to scraping OpenGraph meta tags.

### 3. Smart Fridge Mode (Search by Ingredients)
* Open the **Fridge Drawer** to toggle ingredients you currently have.
* The grid updates dynamically with visual status badges:
  * **Perfect Match**: You have all required ingredients.
  * **Partial Match**: You have most ingredients.
  * **Missing Ingredients**: Easily view what you are missing and add them to your shopping list with a single click.

### 4. Interactive Fullscreen Cook Mode
* Focus entirely on cooking with a distraction-free guided layout.
* Step-by-step progress tracking (click steps to check them off).
* **Clickable Time Phrases**: Any time duration mentioned in the instructions (e.g., "bake for 15 minutes") automatically transforms into a functional timer badge with a real-time countdown tracker.

### 5. Weekly Meal Planner
* Schedule breakfast, lunch, and dinner recipes onto an interactive weekly calendar grid.
* Quick day-navigation tabs and easy cleanups.

### 6. Smart Shopping List
* Automatically compiles and aggregates ingredients from all planned meals.
* Parses fractional numbers and scaling units, allowing you to scale servings dynamically.

### 7. Immersive Audio Environment
* Turn on **Ambient Kitchen Sounds** to play synthesized background vinyl crackles, soft pops, and warm lo-fi chords.
* Powered 100% locally via the browser's **Web Audio API** (zero network dependency).

### 8. Chef Social Share
* Tap the **Instagram Share** button to generate a stylized, high-fidelity recipe card overlay ready to capture and post on social media.

### 9. User Authentication & Profiles
* Complete login and registration system with secure password validation (checks for length, generic sequences, and username similarities).
* Profile customizer to set your bio, details, and profile picture.
* **Administrator Portal**: Admin accounts can manage active chefs, view platform statistics, reset passwords, or delete chef profiles.

---

## Technology Stack

* **Frontend**: Plain HTML5, Vanilla CSS3 (custom CSS variables, glassmorphic styling, animations).
* **JavaScript**: Modern ES6 Modules.
* **State Management**: Reactive Vanilla JS Store pattern (`js/store.js`).
* **Audio Synthesis**: Web Audio API.
* **Proxies & External Data**: CORS Lol Proxy, AllOrigins API, TheMealDB API.

---

## Getting Started

1. Clone or download the repository to your local machine.
2. Spin up a local static server inside the directory (to allow ES module imports):
   ```bash
   python3 -m http.server 8085
   ```
3. Open your browser and navigate to **[http://localhost:8085/](http://localhost:8085/)**.

### Default Administrator Credentials
* **Username**: `admin`
* **Password**: `admin`
