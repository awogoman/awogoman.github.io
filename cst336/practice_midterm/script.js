// Constants
// Random quote
const RANDOM_QUOTE_URL =
  "https://csumb.space/api/famousQuotes/getRandomQuote.php";
// Translation API
const TRANSLATE_URL_BASE =
  "https://csumb.space/api/famousQuotes/translateQuote.php";
// N random quotes
const MULTI_QUOTES_URL_BASE =
  "https://csumb.space/api/famousQuotes/getQuotes.php";
// Background image
const PIXABAY_URL =
  "https://pixabay.com/api/?key=5589438-47a0bca778bf23fc2e8c5bf3e&per_page=50&orientation=horizontal&q=flowers";

// Globals
let currentQuoteId = null;
let currentQuoteText = "";
let currentAuthorName = "";
let currentAuthorBio = "";
let currentAuthorImage = "";

// Languages / 2-letter codes
const LANGUAGES = [
  { code: "EN", label: "English", flag: "flag_en.png" },
  { code: "ES", label: "Esperanto", flag: "flag_esperanto.png" },
  { code: "SP", label: "Spanish", flag: "flag_spanish.png" },
  { code: "FR", label: "French", flag: "flag_france.png" }
];

// Helpers
// Random radio buttons
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Get random quote
function firstQuoteObject(data) {
  if (Array.isArray(data) && data.length > 0) return data[0];
  if (data && Array.isArray(data.quotes) && data.quotes.length > 0) {
    return data.quotes[0];
  }
  return data;
}

// Get array of quotes
function quoteArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.quotes)) return data.quotes;
  return [];
}

// Random quote on load
async function loadRandomQuote() {
  try {
    const response = await fetch(RANDOM_QUOTE_URL);
    const data = await response.json();
    console.log("Random quote API:", data);

    const q = firstQuoteObject(data);

    currentQuoteId = q.quoteId;
    currentQuoteText = q.quote;
    currentAuthorName = q.author;
    currentAuthorBio = q.bio;
    currentAuthorImage = q.pic;

    document.getElementById("quoteText").textContent =
      currentQuoteText || "No quote text found.";
    document.getElementById("quoteAuthor").textContent =
      currentAuthorName ? "-" + currentAuthorName : "";

    // Hide author info
    document.getElementById("authorInfo").classList.add("hidden");

  } catch (err) {
    console.error("Error loading random quote:", err);
    document.getElementById("quoteText").textContent =
      "Error loading quote. Check the console.";
  }
}

// Author info button
function showAuthorInfo() {
  const infoDiv = document.getElementById("authorInfo");

  document.getElementById("authorName").textContent =
    currentAuthorName || "Unknown author";

  document.getElementById("authorBio").textContent =
    currentAuthorBio || "No bio available from the API.";

  const img = document.getElementById("authorImg");
  if (currentAuthorImage) {
    img.src = currentAuthorImage;
  } else {
    // blank placeholder photo
    img.src = "img/author_placeholder.jpg";
  }

  infoDiv.classList.remove("hidden");
}


// Random radio buttons
function renderLanguageRadios() {
  const container = document.getElementById("languageChoices");
  container.innerHTML = "";

  const shuffled = LANGUAGES.slice();
  shuffle(shuffled);

  shuffled.forEach((lang, index) => {
    const id = `lang-${lang.code}`;

    const label = document.createElement("label");
    label.htmlFor = id;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "lang";
    radio.value = lang.code;
    radio.id = id;

    // Default
    if (index === 0) radio.checked = true;

    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + lang.label));

    container.appendChild(label);
  });
}

function getSelectedLanguage() {
  const radios = document.querySelectorAll('input[name="lang"]');
  for (const r of radios) {
    if (r.checked) {
      return LANGUAGES.find((l) => l.code === r.value);
    }
  }
  return null;
}


// Translate button / flag
async function translateQuote() {
  if (!currentQuoteId) {
    alert("Quote not loaded yet.");
    return;
  }

  const lang = getSelectedLanguage();
  if (!lang) {
    alert("Please select a language.");
    return;
  }

  // Flag
  const flagImg = document.getElementById("flagImg");
  flagImg.classList.remove("hidden");
  flagImg.src = "img/" + lang.flag; // you can create these images

  // Call API
  const url =
    `${TRANSLATE_URL_BASE}?lang=${lang.code}&quoteId=${currentQuoteId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Translate API:", data);

    const translated = data.quote || data.translatedQuote || data.text || "";

    if (translated) {
      currentQuoteText = translated;
      document.getElementById("quoteText").textContent = translated;
    } else {
      alert("Could not find translated quote text in the response.");
    }
  } catch (err) {
    console.error("Error translating quote:", err);
    alert("Error translating quote. Check the console.");
  }
}

// Get 1-5 quotes
async function getQuotes() {
  const numInput = document.getElementById("numQuotes");
  const errorMsg = document.getElementById("errorMsg");
  const listDiv = document.getElementById("quotesList");

  const value = numInput.value.trim();
  const n = parseInt(value, 10);

  // 1-5 only
  if (!value || isNaN(n) || n < 1 || n > 5) {
    errorMsg.textContent = "Please enter a number between 1 and 5.";
    listDiv.innerHTML = "";
    return;
  }

  errorMsg.textContent = "";

  // Call API
  const url = `${MULTI_QUOTES_URL_BASE}?n=${n}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("GetQuotes API:", data);

    const arr = quoteArray(data);
    listDiv.innerHTML = "";

    arr.forEach((qObj) => {
      const quoteText = qObj.quote || qObj.text || "";
      const authorName = qObj.author || qObj.authorName || "Unknown";

      const div = document.createElement("div");
      div.className = "quote-item";
      div.innerHTML =
        `"${quoteText}" <span class="author">– ${authorName}</span>`;
      listDiv.appendChild(div);
    });

    if (arr.length === 0) {
      listDiv.textContent = "No quotes returned from the API.";
    }
  } catch (err) {
    console.error("Error getting quotes:", err);
    errorMsg.textContent = "Error retrieving quotes. Check the console.";
  }
}

// Random background
async function setRandomBackground() {
  try {
    const response = await fetch(PIXABAY_URL);
    const data = await response.json();
    console.log("Pixabay API:", data);

    if (data.hits && data.hits.length > 0) {
      const idx = Math.floor(Math.random() * data.hits.length);
      const imgUrl =
        data.hits[idx].largeImageURL || data.hits[idx].webformatURL;

      document.body.style.backgroundImage = `url(${imgUrl})`;
    }
  } catch (err) {
    console.error("Error setting background image:", err);
  }
}

// Setup
document.addEventListener("DOMContentLoaded", () => {
  renderLanguageRadios();
  loadRandomQuote();
  setRandomBackground();

  document
    .getElementById("btnAuthorInfo")
    .addEventListener("click", showAuthorInfo);

  document
    .getElementById("btnTranslate")
    .addEventListener("click", translateQuote);

  document
    .getElementById("btnGetQuotes")
    .addEventListener("click", getQuotes);
});
