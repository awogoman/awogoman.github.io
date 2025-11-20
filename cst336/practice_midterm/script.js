// Globals
let currentQuoteId = null;
let currentAuthorBio = "";
let currentAuthorPic = "";
let currentAuthorName = "";

// Random quote
async function loadRandomQuote() {
  const url = "https://csumb.space/api/famousQuotes/getRandomQuote.php";

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Setting global variables
    currentQuoteId = data.quoteId;
    currentAuthorBio = data.bio;
    currentAuthorPic = data.picture;
    currentAuthorName = data.firstName + " " + data.lastName;

    // Display quote / author
    document.getElementById("quoteText").textContent = data.quoteText;
    document.getElementById("quoteAuthor").textContent = "-" + currentAuthorName;

    // Hide author info
    document.getElementById("authorInfo").classList.add("hidden");

  } catch (err) {
    console.error("Error loading quote", err);
  }
}

// Author info
function showAuthorInfo() {
  document.getElementById("authorName").textContent = currentAuthorName;
  document.getElementById("authorBio").textContent = currentAuthorBio;

  const img = document.getElementById("authorImg");
  img.src = currentAuthorPic;

  document.getElementById("authorInfo").classList.remove("hidden");
}

// Languages
const LANGUAGES = ["EN", "ES", "SP", "FR"];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderLanguageRadios() {
  const container = document.getElementById("languageChoices");
  container.innerHTML = "";

  const langs = LANGUAGES.slice();
  shuffle(langs);

  langs.forEach((code, index) => {
    const label = document.createElement("label");
    const id = "lang-" + code;

    label.innerHTML = `
      <input type="radio" name="lang" id="${id}" value="${code}" ${index === 0 ? "checked" : ""}>
      ${code === "EN" ? "English" :
         code === "ES" ? "Esperanto" :
         code === "SP" ? "Spanish" :
         "French"}
    `;

    container.appendChild(label);
  });
}

// Translate
async function translateQuote() {
  const selected = document.querySelector("input[name='lang']:checked").value;

  // Flags
  document.getElementById("flagImg").classList.remove("hidden");
  document.getElementById("flagImg").src = `img/flag_${selected.toLowerCase()}.png`;

  const url = `https://csumb.space/api/famousQuotes/translateQuote.php?lang=${selected}&quoteId=${currentQuoteId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    document.getElementById("quoteText").textContent = data.quoteText;

  } catch (err) {
    console.error("Error translating quote", err);
  }
}

// Get 1-5 quotes
async function getQuotes() {
  const n = document.getElementById("numQuotes").value;
  const errorMsg = document.getElementById("errorMsg");
  const list = document.getElementById("quotesList");

  // check input number
  if (n < 1 || n > 5 || isNaN(n)) {
    errorMsg.textContent = "Please enter a number between 1 and 5.";
    list.innerHTML = "";
    return;
  }

  errorMsg.textContent = "";

  const url = `https://csumb.space/api/famousQuotes/getQuotes.php?n=${n}`;

  try {
    const response = await fetch(url);
    const data = await response.json(); // array of quotes

    list.innerHTML = "";

    data.forEach(q => {
      const author = q.firstName + " " + q.lastName;
      const div = document.createElement("div");
      div.classList.add("quote-item");
      div.innerHTML = `"${q.quoteText}" <span class="author">– ${author}</span>`;
      list.appendChild(div);
    });

  } catch (err) {
    console.error("Error getting quotes", err);
  }
}

// Random background
async function setRandomBackground() {
  const url = "https://pixabay.com/api/?key=5589438-47a0bca778bf23fc2e8c5bf3e&per_page=50&orientation=horizontal&q=flowers";

  try {
    const response = await fetch(url);
    const data = await response.json();
    const idx = Math.floor(Math.random() * data.hits.length);
    document.body.style.backgroundImage = `url(${data.hits[idx].largeImageURL})`;

  } catch (err) {
    console.error("Error loading background", err);
  }
}

// Setup
document.addEventListener("DOMContentLoaded", () => {
  renderLanguageRadios();
  loadRandomQuote();
  setRandomBackground();

  document.getElementById("btnAuthorInfo").addEventListener("click", showAuthorInfo);
  document.getElementById("btnTranslate").addEventListener("click", translateQuote);
  document.getElementById("btnGetQuotes").addEventListener("click", getQuotes);
});
