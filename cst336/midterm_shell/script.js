/* Shell for Midterm */

// Constants
/* copy URLs */
const RANDOM_ITEM_URL = "";        /* from prompt */
const TRANSLATE_URL_BASE = "";     /* translate.php */
const MULTI_ITEMS_URL_BASE = "";   /* getItems.php?n= */
const BACKGROUND_URL = "";         /* pixabay*/

/* use specific codes if given (ex. EN, ES, FR) & map to any required data */
const LANG_CODES = ["EN", "ES", "SP", "FR"];

const FLAG_FILES = {
  /* map to filenames */
  EN: "english_flag.png",
  ES: "esperanto_flag.png",
  SP: "spanish_flag.png",
  FR: "french_flag.png"
};

// Global
/* fill w/ API returns (ex. id, text, name), inspect JSON & assign inside loadRandomItem() */
let currentItemId = null;
let currentMainText = "";
let currentSubText = "";
let currentInfoTitle = "";
let currentInfoBody = "";
let currentInfoImg = "";


// Random on page load
/* Random ___ displayed every page reload */
async function loadRandomItem() {
  try {
    const response = await fetch(RANDOM_ITEM_URL);
    const data = await response.json();
    console.log("Random item:", data);

    /* Inspect 'data' in console & map fields to globals & DOM elements
     * ex.
     * currentItemId = data.quoteId;
     * currentMainText = data.quoteText;
     * currentSubText = data.firstName + " " + data.lastName;
     * currentInfoTitle = currentSubText;
     * currentInfoBody = data.bio;
     * currentInfoImg = data.picture;
     */

    // Update DOM
    document.getElementById("mainText").textContent = currentMainText;
    document.getElementById("mainSubtext").textContent = currentSubText;

    // Hide extra info
    document.getElementById("extraInfo").style.display = "none";
  } catch (err) {
    console.error("Error loading random item", err);
    document.getElementById("mainText").textContent =
      "Error loading data. See console.";
  }
}


// Extra info
/* upon button click display ___ w data from API (2 column) */
function showExtraInfo() {
  // Fill text
  document.getElementById("infoTitle").textContent = currentInfoTitle;
  document.getElementById("infoBody").textContent = currentInfoBody;

  // Fill image
  const img = document.getElementById("infoImg");
  img.src = currentInfoImg;

  // Show container
  const box = document.getElementById("extraInfo");
  box.style.display = "flex";
}

// Random order radio buttons
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderLanguageRadios() {
  const container = document.getElementById("languageChoices");
  container.innerHTML = "";

  const codesCopy = LANG_CODES.slice();
  shuffle(codesCopy);

  codesCopy.forEach((code, index) => {
    const label = document.createElement("label");
    const id = "lang-" + code;

    /* Convert codes to readable (ex. EN to English) */
    let labelText = code;

    label.innerHTML = `
      <input type="radio" name="lang" id="${id}" value="${code}"
        ${index === 0 ? "checked" : ""}>
      ${labelText}
    `;
    container.appendChild(label);
  });
}

function getSelectedLanguageCode() {
  const selected = document.querySelector("input[name='lang']:checked");
  return selected ? selected.value : null;
}


// Translate / Flag

/* On click, translate w API  & display corresponding image */

async function translateItem() {
  if (!currentItemId) {
    alert("Item not loaded yet.");
    return;
  }

  const langCode = getSelectedLanguageCode();
  if (!langCode) {
    alert("Please select a language.");
    return;
  }

  // Show image
  const flagImg = document.getElementById("flagImg");
  flagImg.style.display = "block";
  flagImg.src = "img/" + FLAG_FILES[langCode];  /* match filenames to given */

  // Build URL
  const url = `${TRANSLATE_URL_BASE}?lang=${langCode}&id=${currentItemId}`;
  /* adjust parameter name to match (ex. id / quoteId / itemId) */

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Translation:", data);

    /* Inspect JSON & map translated text */
    const translatedText = data.quoteText || data.text || "";
    document.getElementById("mainText").textContent = translatedText || currentMainText;
  } catch (err) {
    console.error("Error translating item", err);
    alert("Error translating (see console).");
  }
}

// Get N items & validate

/* Validate that user enters correct number
 * w API (ex. getItems.php?n=3) get specified number of items & display w info
 */
async function getItems() {
  const numInput = document.getElementById("numItems");
  const errorMsg = document.getElementById("errorMsg");
  const listDiv = document.getElementById("itemsList");

  const value = numInput.value.trim();
  const n = parseInt(value, 10);

  // Validate
  if (!value || isNaN(n) || n < 1 || n > 5) {
    errorMsg.textContent = "Please enter a number between 1 and 5.";
    listDiv.innerHTML = "";
    return;
  }

  errorMsg.textContent = "";

  // Build URL w n parameter
  const url = `${MULTI_ITEMS_URL_BASE}?n=${n}`; /* adjust parameter */

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Multiple items:", data);

    listDiv.innerHTML = "";

    /* Map text + secondary info (ex. quoteText + author name) */
    data.forEach(item => {
      const row = document.createElement("div");
      row.classList.add("item-row");

      // adjust by checking JSON (ex. const text = item.quoteText)
      const text = "";
      const who = "";

      row.innerHTML = `"${text}" <span class="author">– ${who}</span>`;
      listDiv.appendChild(row);
    });
  } catch (err) {
    console.error("Error getting items", err);
    errorMsg.textContent = "Error retrieving items. See console.";
  }
}


// Random background image
async function setRandomBackground() {
  try {
    const response = await fetch(BACKGROUND_URL);
    const data = await response.json();
    console.log("Background data:", data);

    const imgUrl = "";  /* assign from data */
    document.body.style.backgroundImage = `url(${imgUrl})`;
  } catch (err) {
    console.error("Error setting background", err);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  /* Hide flag and extra info */
  document.getElementById("flagImg").style.display = "none";
  document.getElementById("extraInfo").style.display = "none";

  /* Random order radios */
  renderLanguageRadios();

  /* Random item + random background */
  loadRandomItem();
  setRandomBackground();

  /* Show extra info */
  document
    .getElementById("btnShowInfo")
    .addEventListener("click", showExtraInfo);

  /* Translate + flag */
  document
    .getElementById("btnTranslate")
    .addEventListener("click", translateItem);

  /* Get items list */
  document
    .getElementById("btnGetItems")
    .addEventListener("click", getItems);
});
