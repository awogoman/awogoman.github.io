// HW 3: Fetch & Web APIs

// API key
const API_KEY = "al807579550";

// References to DOM elements
const form = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const messageEl = document.getElementById("message");

const resultsSection = document.getElementById("results");
const nameCard = document.getElementById("nameCard");
const resultName = document.getElementById("resultName");
const resultGender = document.getElementById("resultGender");
const resultUsages = document.getElementById("resultUsages");

/* Show a status or error message */
function showMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.classList.remove("error", "info");
  messageEl.classList.add(type);
}

/* Map gender codes to text + CSS */
function getGenderInfo(code) {
  let text = "Unknown";
  let cssClass = "gender-u";

  if (code === "m") {
    text = "Masculine";
    cssClass = "gender-m";
  } else if (code === "f") {
    text = "Feminine";
    cssClass = "gender-f";
  } else if (code === "mf") {
    text = "Unisex";
    cssClass = "gender-u";
  }

  return { text, cssClass };
}

/* Form submit handler: validate input, lookup API, display results */
form.addEventListener("submit", function (event) {
  event.preventDefault();
  // reset animation
  nameCard.classList.remove("reveal");

  const rawName = nameInput.value.trim();
  const namePattern = /^[A-Za-z\s'-]+$/;

  if (rawName.length === 0) {
    showMessage("Please enter a name before submitting.", "error");
    resultsSection.classList.add("hidden");
    return;
  }

  if (!namePattern.test(rawName)) {
    showMessage(
      "Name can only contain letters, spaces, hyphens, and apostrophes.",
      "error"
    );
    resultsSection.classList.add("hidden");
    return;
  }

  //debugging
  if (!API_KEY || API_KEY === "PUT_YOUR_API_KEY_HERE") {
    showMessage("Put API key into script.js.", "error");
    resultsSection.classList.add("hidden");
    return;
  }

  showMessage("Looking up name...", "info");

  const encodedName = encodeURIComponent(rawName);
  const url =
    `https://www.behindthename.com/api/lookup.xml?name=${encodedName}&key=${API_KEY}`;

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response: " + response.status);
      }
      return response.text();
    })
    .then(function (xmlText) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
        throw new Error("Error parsing XML from API.");
      }

      const nameDetail = xmlDoc.querySelector("name_detail");
      if (!nameDetail) {
        showMessage("No information found for that name. Try another one.", "error");
        resultsSection.classList.add("hidden");
        return;
      }

      const nameNode = nameDetail.querySelector("name");
      const genderNode = nameDetail.querySelector("gender");
      const usageNodes = nameDetail.querySelectorAll("usage usage_full");

      const nameText = nameNode ? nameNode.textContent : rawName;
      const genderCode = genderNode ? genderNode.textContent : "";
      const usageList = [];

      usageNodes.forEach(function (node) {
        if (node.textContent) {
          usageList.push(node.textContent);
        }
      });

      const genderInfo = getGenderInfo(genderCode);

      resultName.textContent = nameText;
      resultGender.textContent = genderInfo.text;
      resultUsages.textContent =
        usageList.length > 0
          ? usageList.join(", ")
          : "Usage information not available.";

      // Gender classes
      nameCard.classList.remove("gender-m", "gender-f", "gender-u");
      nameCard.classList.add(genderInfo.cssClass);

      resultsSection.classList.remove("hidden");
      // Reveal animation
      nameCard.classList.add("reveal");
      showMessage("Name found! See the details below.", "info");
    })
    .catch(function (error) {
      console.error(error);
      showMessage("There was a problem contacting the API. Please try again later.", "error");
      resultsSection.classList.add("hidden");
    });
});

/* Random name generator */
const randomBtn = document.getElementById("randomBtn");

randomBtn.addEventListener("click", function () {
  // reset animation
  nameCard.classList.remove("reveal");
  showMessage("Generating a random name...", "info");
  resultsSection.classList.add("hidden");

  const url = `https://www.behindthename.com/api/random.xml?key=${API_KEY}&number=1`;

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.status);
      }
      return response.text();
    })
    .then(function (xmlText) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      const nameNode = xmlDoc.querySelector("name");
      const genderNode = xmlDoc.querySelector("gender");

      if (!nameNode) {
        showMessage("Could not generate a random name. Try again!", "error");
        return;
      }

      const name = nameNode.textContent;
      const genderCode = genderNode ? genderNode.textContent : "";
      const genderInfo = getGenderInfo(genderCode);

      resultName.textContent = name;
      resultGender.textContent = genderInfo.text;
      resultUsages.textContent =
        "Random name — usage info not included in this API.";

      nameCard.classList.remove("gender-m", "gender-f", "gender-u");
      nameCard.classList.add(genderInfo.cssClass);

      resultsSection.classList.remove("hidden");
      nameCard.classList.add("reveal");
      showMessage("Random name generated!", "info");
    })
    .catch(function (error) {
      console.error(error);
      showMessage("There was an issue fetching a random name.", "error");
    });
});
