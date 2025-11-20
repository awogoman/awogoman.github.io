// Global
let lastUsernameChecked = "";
let lastUsernameAvailable = false;

// Event Listeners
// Zip code
document.querySelector("#zip").addEventListener("change", displayCity);

// State
document.querySelector("#state").addEventListener("change", displayCounties);

// Username
document
  .querySelector("#username")
  .addEventListener("keyup", () => checkUsername(true));

// Password
document
  .querySelector("#password")
  .addEventListener("focus", showSuggestedPassword);

// Submit
document
  .querySelector("#signupForm")
  .addEventListener("submit", handleSubmit);

// Populate states
populateStates();

// Scroll animation
setupSectionObserver();


// Functions
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

    // Zip not found
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

// States
async function populateStates() {
  const stateSelect = document.querySelector("#state");
  const url = "https://csumb.space/api/allStatesAPI.php";

  try {
    const response = await fetch(url);
    const data = await response.json();
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
    const data = await response.json();

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
async function checkUsername(showMessages = true) {
  const usernameInput = document.querySelector("#username");
  const status = document.querySelector("#usernameStatus");
  const username = usernameInput.value.trim();

  if (username.length === 0) {
    lastUsernameChecked = "";
    lastUsernameAvailable = false;
    if (showMessages) {
      status.textContent = "";
      status.className = "form-text";
    }
    return false;
  }

  const url =
    `https://csumb.space/api/usernamesAPI.php?username=${username}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // debugging
    let available = false;
    if (typeof data === "boolean") {
      available = data;
    } else if ("available" in data) {
      available = !!data.available;
    } else if ("taken" in data) {
      available = !data.taken;
    } else if ("exists" in data) {
      available = !data.exists;
    } else {
      // default: assume not available
      available = false;
    }

    lastUsernameChecked = username;
    lastUsernameAvailable = available;

    if (showMessages) {
      if (available) {
        status.textContent = "Username is available";
        status.className = "form-text text-success";
      } else {
        status.textContent = "Username is already taken";
        status.className = "form-text text-danger";
      }
    }

    return available;
  } catch (err) {
    console.error(err);
    lastUsernameAvailable = false;
    if (showMessages) {
      status.textContent = "Error checking username";
      status.className = "form-text text-danger";
    }
    return false;
  }
}

// Suggested password
async function showSuggestedPassword() {
  const url =
    "https://csumb.space/api/suggestedPassword.php?length=8";
  const suggestedSpan = document.querySelector("#suggestedPwd");

  try {
    const response = await fetch(url);
    const data = await response.json();
    suggestedSpan.textContent = `Suggested password: ${data.suggestedPassword}`;
  } catch (err) {
    console.error(err);
    suggestedSpan.textContent = "Could not get suggested password.";
  }
}

// Submit
async function handleSubmit(e) {
  e.preventDefault();

  let isValid = true;

  const usernameInput = document.querySelector("#username");
  const usernameStatus = document.querySelector("#usernameStatus");
  const password = document.querySelector("#password").value;
  const passwordAgain = document.querySelector("#passwordAgain").value;
  const passwordError = document.querySelector("#passwordError");
  passwordError.textContent = "";

  // Username validation
  const username = usernameInput.value.trim();

  if (username.length === 0) {
    usernameStatus.textContent = "Username required";
    usernameStatus.className = "form-text text-danger";
    isValid = false;
  } else {
    // check the username w/ API
    const availableNow = await checkUsername(true);
    if (!availableNow) {
      isValid = false;
    }
  }

  // Password validation
  if (password.length < 6) {
    passwordError.textContent =
      "Password must be at least 6 characters.";
    isValid = false;
  } else if (password !== passwordAgain) {
    passwordError.textContent =
      "Passwords do not match.";
    isValid = false;
  }
  
  if (isValid) {
    e.target.submit();
  }
}

// Scroll animation
function setupSectionObserver() {
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
}
