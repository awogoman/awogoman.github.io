// ====== GLOBAL STATE ======
let isUsernameAvailable = false;

// ====== EVENT LISTENERS ======

// Zip code
document.querySelector("#zip").addEventListener("change", displayCity);

// State
document.querySelector("#state").addEventListener("change", displayCounties);

// Username
document
  .querySelector("#username")
  .addEventListener("keyup", checkUsername);

// Password
document
  .querySelector("#password")
  .addEventListener("focus", showSuggestedPassword);

// Submit
document
  .querySelector("#signupForm")
  .addEventListener("submit", validateForm);

// Populate states
populateStates();

// ====== FUNCTIONS ======

// City / lat / long
async function displayCity() {
  const zipCode = document.querySelector("#zip").value.trim();
  const citySpan = document.querySelector("#city");
  const latSpan = document.querySelector("#latitude");
  const longSpan = document.querySelector("#longitude");
  const zipError = document.querySelector("#zipError");

  if (zipCode.length === 0) {
    citySpan.innerHTML = "";
    latSpan.innerHTML = "";
    longSpan.innerHTML = "";
    zipError.textContent = "";
    return;
  }

  const url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Zip not found, return false
    if (!data) {
      citySpan.innerHTML = "";
      latSpan.innerHTML = "";
      longSpan.innerHTML = "";
      zipError.textContent = "Zip code not found";
      return;
    }

    // Zip found 
    zipError.textContent = "";
    citySpan.innerHTML = data.city;
    latSpan.innerHTML = data.latitude;
    longSpan.innerHTML = data.longitude;
  } catch (err) {
    console.error(err);
    zipError.textContent = "Error getting city info.";
  }
}

// Populate states list
async function populateStates() {
  const stateSelect = document.querySelector("#state");
  const url = "https://csumb.space/api/allStatesAPI.php";

  try {
    const response = await fetch(url);
    const data = await response.json(); // {state, usps}
    stateSelect.innerHTML = `<option value="">Select One</option>`;

    for (let i = 0; i < data.length; i++) {
      const state = data[i];
      stateSelect.innerHTML += `<option value="${state.usps.toLowerCase()}">
        ${state.state}
      </option>`;
    }
  } catch (err) {
    console.error(err);
    stateSelect.innerHTML =
      `<option value="">Error loading states</option>`;
  }
}

// Counties
async function displayCounties() {
  const stateAbbrev = document.querySelector("#state").value;
  const countyList = document.querySelector("#county");

  if (!stateAbbrev) {
    countyList.innerHTML = `<option value="">Select County</option>`;
    return;
  }

  const url =
    `https://csumb.space/api/countyListAPI.php?state=${stateAbbrev}`;

  try {
    const response = await fetch(url);
    const data = await response.json(); // {county}

    // Reset menu
    countyList.innerHTML = `<option value="">Select County</option>`;

    for (let i = 0; i < data.length; i++) {
      countyList.innerHTML += `<option>${data[i].county}</option>`;
    }
  } catch (err) {
    console.error(err);
    countyList.innerHTML =
      `<option value="">Error loading counties</option>`;
  }
}

// Username availability
async function checkUsername() {
  const username = document.querySelector("#username").value.trim();
  const status = document.querySelector("#usernameStatus");

  if (username.length === 0) {
    status.textContent = "";
    status.className = "form-text";
    isUsernameAvailable = false;
    return;
  }

  const url =
    `https://csumb.space/api/usernamesAPI.php?username=${username}`;

  try {
    const response = await fetch(url);
    const data = await response.json(); // {available: true/false}

    if (data.available) {
      status.textContent = "Username is available";
      status.className = "form-text text-success";
      isUsernameAvailable = true;
    } else {
      status.textContent = "Username is already taken";
      status.className = "form-text text-danger";
      isUsernameAvailable = false;
    }
  } catch (err) {
    console.error(err);
    status.textContent = "Error checking username";
    status.className = "form-text text-danger";
    isUsernameAvailable = false;
  }
}

// Suggested password
async function showSuggestedPassword() {
  const url =
    "https://csumb.space/api/suggestedPassword.php?length=8";
  const suggestedSpan = document.querySelector("#suggestedPwd");

  try {
    const response = await fetch(url);
    const data = await response.json(); // {suggestedPassword: "...."}
    suggestedSpan.textContent = `Suggested password: ${data.suggestedPassword}`;
  } catch (err) {
    console.error(err);
    suggestedSpan.textContent = "Could not get suggested password.";
  }
}

// Validation
function validateForm(e) {
  let isValid = true;

  const password = document.querySelector("#password").value;
  const passwordAgain =
    document.querySelector("#passwordAgain").value;
  const passwordError =
    document.querySelector("#passwordError");
  const username = document.querySelector("#username").value.trim();
  const usernameStatus =
    document.querySelector("#usernameStatus");

  passwordError.textContent = "";

  // Username: not be blank / must be available
  if (username.length === 0) {
    usernameStatus.textContent = "Username required";
    usernameStatus.className = "form-text text-danger";
    isValid = false;
  } else if (!isUsernameAvailable) {
    // Taken or not checked
    usernameStatus.textContent =
      "Please choose an available username";
    usernameStatus.className = "form-text text-danger";
    isValid = false;
  }

  // Min 6 char password
  if (password.length < 6) {
    passwordError.textContent =
      "Password must be at least 6 characters.";
    isValid = false;
  }
  // Passwords must match
  else if (password !== passwordAgain) {
    passwordError.textContent =
      "Passwords do not match.";
    isValid = false;
  }

  // Not valid, no form submission
  if (!isValid) {
    e.preventDefault();
  }
  // If valid, form submission
}

// Scroll animation
const sections = document.querySelectorAll(".fade-section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

sections.forEach((section) => observer.observe(section));
