// API
const RANDOM_QUOTE_URL =
  "https://csumb.space/api/famousQuotes/getRandomQuote.php";

const TRANSLATE_URL_BASE =
  "https://csumb.space/api/famousQuotes/translateQuote.php";

const MULTI_QUOTES_URL_BASE =
  "https://csumb.space/api/famousQuotes/getQuotes.php";

// Pixabay
const PIXABAY_KEY = "5589438-47a0bca77b8f23fc2e8c5bf3e";
const PIXABAY_URL = `https://pixabay.com/api/?key=${PIXABAY_KEY}&per_page=50&orientation=horizontal&q=flowers`;

// Globals
let currentQuoteId = null;
let currentQuoteText = "";
let currentAuthorName = "";
let currentAuthorBio = "";
let currentAuthorImage = "";

// Languages: label, API code, flag
const LANGUAGES = [
  { code: "EN", label: "English", flag: "flag_en.png" },
  { code: "ES", label: "Esperanto", flag: "flag_esperanto.png" },
  { code: "SP", label: "Spanish", flag: "flag_spanish.png" },
  { code: "FR", label: "French", flag: "flag_france.png" }
];

// Helper method for randomizing radio buttons
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Random quote
async function loadRandomQuote() {
  try {
    const response = await fetch(RANDOM_QUOTE_URL);
    const data = await response.json();
    console.log("Random quote data:", data);

    currentQuoteText = data.quote;
    currentAuthorName = data.author;
    currentQuoteId = data.quoteId;
    currentAuthorBio = data.bio;
    currentAuthorImage = data.pic;

    document.getElementById("quoteText").textContent = currentQuoteText;
    document.getElementById("quoteAuthor").textContent = "-" + currentAuthorName;

    // Reset author info
    document.getElementById("authorInfo").classList.add("hidden");
  } catch (err) {
    console.error("Error loading random quote", err);
    document.getElementById("quoteText").textContent =
      "Error loading quote. Check the console.";
  }
}

// Show author info
function showAuthorInfo() {
  const infoDiv = document.getElementById("authorInfo");
  document.getElementById("authorName").textContent = currentAuthorName;
  document.getElementById("authorBio").textContent =
    currentAuthorBio || "No bio available from the API.";

  const img = document.getElementById("authorImg");
  if (currentAuthorImage) {
    img.src = currentAuthorImage;
  } else {
    // Default image if none given, debugging
    img.src = "img/author_placeholder.jpg";
  }
  infoDiv.classList.remove("hidden");
}

// Radio buttons in random order 
function renderLanguageRadios() {
  const container = document.getElementById("languageChoices");
  container.innerHTML = "";

  const copy = LANGUAGES.slice();
  shuffle(copy);

  copy.forEach((lang, index) => {
    const id = `lang-${lang.code}`;
    const label = document.createElement("label");
    label.htmlFor = id;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "lang";
    radio.value = lang.code;
    radio.id = id;

    if (index === 0) {
      radio.checked = true;
    }

    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + lang.label));

    container.appendChild(label);
  });
}

// Helper to get selected language
function getSelectedLanguage() {
  const radios = document.querySelectorAll('input[name="lang"]');
  for (const r of radios) {
    if (r.checked) {
      return LANGUAGES.find((l) => l.code === r.value);
    }
  }
  return null;
}

// Translate quote / show flag
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

  // Show flag
  const flagImg = document.getElementById("flagImg");
  flagImg.classList.remove("hidden");
  flagImg.src = "img/" + lang.flag;

  const url = `${TRANSLATE_URL_BASE}?lang=${lang.code}&quoteId=${currentQuoteId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Translation data:", data);

    const translated =
      data.translatedQuote || data.quote || data.translation || "";

    if (translated) {
      currentQuoteText = translated;
      document.getElementById("quoteText").textContent = translated;
    } else {
      alert("Could not find translated text in the response. Check console.");
    }
  } catch (err) {
    console.error("Error translating quote", err);
    alert("Error translating quote. See console.");
  }
}

// Display chosen number of quotes
async function getQuotes() {
  const numInput = document.getElementById("numQuotes");
  const errorMsg = document.getElementById("errorMsg");
  const listDiv = document.getElementById("quotesList");

  const value = numInput.value.trim();
  const n = parseInt(value, 10);

  // 1-5 only
  if (!value || isNaN(n) || n < 1 || n > 5) {
    errorMsg.textContent =
      "Please enter a number between 1 and 5.";
    listDiv.innerHTML = "";
    return;
  }

  errorMsg.textContent = "";

  const url = `${MULTI_QUOTES_URL_BASE}?n=${n}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Multiple quotes data:", data);

    listDiv.innerHTML = "";
    data.forEach((item) => {
      const div = document.createElement("div");
      div.className = "quote-item";
      const q = item.quote || item.text || "";
      const a = item.author || "Unknown";
      div.innerHTML = `"${q}" <span class="author">– ${a}</span>`;
      listDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Error getting multiple quotes", err);
    errorMsg.textContent = "Error retrieving quotes. Check console.";
  }
}

// Random background image from Pixabay
async function setRandomBackground() {
  try {
    const response = await fetch(PIXABAY_URL);
    const data = await response.json();
    console.log("Pixabay data:", data);

    if (data.hits && data.hits.length > 0) {
      const idx = Math.floor(Math.random() * data.hits.length);
      const imgUrl =
        data.hits[idx].largeImageURL || data.hits[idx].webformatURL;

      document.body.style.backgroundImage = `url(${imgUrl})`;
    }
  } catch (err) {
    console.error("Error loading Pixabay background", err);
  }
}

// Event listeners
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
