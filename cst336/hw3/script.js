// HW 3: Fetch & Web APIs
// Source: Behind the Name "lookup" API

// API from BehindTheName.com
const API_KEY = "al807579550";

// References for DOM elements
const form = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const messageEl = document.getElementById("message");

const resultsSection = document.getElementById("results");
const nameCard = document.getElementById("nameCard");
const resultName = document.getElementById("resultName");
const resultGender = document.getElementById("resultGender");
const resultUsages = document.getElementById("resultUsages");

/* Helper to show status / error message */
function showMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.classList.remove("error", "info");
  messageEl.classList.add(type);
}

/* Helper to map gender codes to text / pick correct CSS color */
function getGenderInfo(code) {
  let text = "Unknown";
  let cssClass = "gender-u"; // unisex as default

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

/* Main form handler: validate, call the API, and display results */
  form.addEventListener("submit", function (event) {
  event.preventDefault(); // prevent reload
  nameCard.classList.remove("reveal");

  // Get user input
  const rawName = nameInput.value.trim();

  // JS validation
  const namePattern = /^[A-Za-z\s'-]+$/;

  if (rawName.length === 0) {
    showMessage("Please enter a name before submitting.", "error");
    resultsSection.classList.add("hidden");
    return;
  }

  if (!namePattern.test(rawName)) {
    showMessage("Name can only contain letters, spaces, hyphens, and apostrophes.", "error");
    resultsSection.classList.add("hidden");
    return;
  }

  // Call API, remove after debugging
  if (API_KEY === "PUT_YOUR_API_KEY_HERE") {
    // Debugging API key
    showMessage("Put API key into script.js.", "error");
    resultsSection.classList.add("hidden");
    return;
  }

  showMessage("Looking up that name...", "info");

  const encodedName = encodeURIComponent(rawName);
  const url =
    `https://www.behindthename.com/api/lookup.xml?name=${encodedName}&key=${API_KEY}`;

  // Fetch the XML
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.status);
      }
      return response.text();
    })
    .then(function (xmlText) {
      // Parse the XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
        throw new Error("Error parsing XML from API.");
      }

      // Find first <name_detail> element
      const nameDetail = xmlDoc.querySelector("name_detail");

      if (!nameDetail) {
        // If there is no name_detail
        showMessage("No information found for that name. Try another one.", "error");
        resultsSection.classList.add("hidden");
        return;
      }

      // Extract <name>, <gender>, and each <usage_full> inside <usage>
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

      // Random name generator
      const randomBtn = document.getElementById("randomBtn");
      randomBtn.addEventListener("click", function () {
        // Clear any previous animation
        nameCard.classList.remove("reveal");
        showMessage("Generating a random name...", "info");
        resultsSection.classList.add("hidden");

        const url = `https://www.behindthename.com/api/random.xml?key=${API_KEY}&number=1`;

        fetch(url)
          .then(response => response.text())
          .then(xmlText => {
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

            // UI
            resultName.textContent = name;
            resultGender.textContent = genderInfo.text;
            resultUsages.textContent = "Random name — usage info not included in this API";

            nameCard.classList.remove("gender-m", "gender-f", "gender-u");
            nameCard.classList.add(genderInfo.cssClass);

            resultsSection.classList.remove("hidden");
            nameCard.classList.add("reveal");
            showMessage("Random name generated!", "info");
          })
          .catch(err => {
            console.error(err);
            showMessage("There was an issue fetching a random name.", "error");
          });
      });
      
      // Get gender & CSS class
      const genderInfo = getGenderInfo(genderCode);

      // Update card UI
      resultName.textContent = nameText;
      resultGender.textContent = genderInfo.text;

      if (usageList.length > 0) {
        resultUsages.textContent = usageList.join(", ");
      } else {
        resultUsages.textContent = "Usage information not available.";
      }

      // Reset previous gender, add new one
      nameCard.classList.remove("gender-m", "gender-f", "gender-u");
      nameCard.classList.add(genderInfo.cssClass);

      // Show the results section
      resultsSection.classList.remove("hidden");
      nameCard.classList.add("reveal");
      showMessage("Name found! See the details below.", "info");
    })
    .catch(function (error) {
      // Handle any network or parsing errors
      console.error(error);
      showMessage("There was a problem contacting the API. Please try again later.", "error");
      resultsSection.classList.add("hidden");
    });
});
