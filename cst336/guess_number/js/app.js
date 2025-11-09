(() => {
  /* Element references: 
  source: https://www.w3schools.com/JsrEF/met_document_getelementbyid.asp */
  const input = document.getElementById("playerGuess");
  const guessBtn = document.getElementById("guessBtn");
  const resetBtn = document.getElementById("resetBtn");
  const errorEl = document.getElementById("error");
  const messageEl = document.getElementById("message");
  const guessesEl = document.getElementById("guesses");
  const attemptsEl = document.getElementById("attempts");
  const winsEl = document.getElementById("wins");
  const lossesEl = document.getElementById("losses");
  const insertCoinEl = document.querySelector(".insert-coin");

  /* Game state variables */
  let target = rand1to99();  // random 1 - 99
  let attempts = 0;          // attempts
  let wins = 0;              // total wins
  let losses = 0;            // total losses
  let finished = false;      // flag to disable guessing
  let coinInserted = false;  // coin animation fades once

  /* 8bit sound effects:
  source: https://github.com/learosema/retro-sound */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  /* Short 8bit sound */
  function playBeep({ freq = 440, duration = 0.12, type = "square", volume = 0.2, when = 0 }) {
    const t0 = audioCtx.currentTime + when;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    // Clickless envelope
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }
  
  /* Slide sound for loss */
  function playSlide({ start = 600, end = 200, duration = 0.4, type = "square", volume = 0.2, when = 0 }) {
    const t0 = audioCtx.currentTime + when;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(start, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), t0 + duration);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  /* Win audio */
  function playWinChime() {
    const base = 523.25; // C5
    const notes = [base, base * 1.25, base * 1.5, base * 2];
    notes.forEach((f, i) =>
      playBeep({ freq: f, duration: 0.12, type: "square", volume: 0.25, when: i * 0.12 })
    );
  }

  /* Lose audio */
  function playLoseBuzz() {
    playSlide({ start: 500, end: 110, duration: 0.45, type: "square", volume: 0.25, when: 0 });
    playBeep({ freq: 90, duration: 0.18, type: "square", volume: 0.3, when: 0.46 });
  }

  /* Resume suspended audio (reset) */
  function ensureAudio() {
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

 /* Insert Coin animation */

  /* Make visible and blink */
  function showInsertCoin() {
    if (!insertCoinEl) return;
    insertCoinEl.classList.remove("fade-out", "restarting");
    insertCoinEl.style.opacity = "1";
    insertCoinEl.style.visibility = "visible";
    void insertCoinEl.offsetWidth; // restart blink animation
    coinInserted = false;
  }

  /* Fade on game start*/
  function fadeInsertCoinOnce() {
    if (!insertCoinEl || coinInserted) return;
    insertCoinEl.classList.add("fade-out");
    coinInserted = true;
  }

  /* Helper functions */
  
  // Returns random int 1-99
  function rand1to99() {
    return Math.floor(Math.random() * 99) + 1;
  }

  // Sets / clears the error text
  function setError(msg = "") {
    errorEl.textContent = msg;
  }

  // Sets the main game message
  function setMessage(msg = "", accent = true) {
    messageEl.textContent = msg;
    messageEl.style.color = accent ? "var(--accent2)" : "var(--text)";
  }

  // Add guess to the list
  function appendGuess(n) {
    if (guessesEl.textContent.trim() === "—") {
      guessesEl.textContent = `${n}`;
    } else {
      guessesEl.textContent += `, ${n}`;
    }
  }

  // Disable guessing after game end, show INSERT COIN
  function disableGuessing() {
    finished = true;
    guessBtn.classList.add("disabled");
    input.setAttribute("disabled", "true");
    resetBtn.hidden = false; // show Reset when game ends
    input.blur();

    // Insert coin reappears at end of game
    showInsertCoin();
  }

  // Enable controls for a new round
  function enableGuessing() {
    finished = false;
    guessBtn.classList.remove("disabled");
    input.removeAttribute("disabled");
    resetBtn.hidden = true; // hide Reset until game end
    input.focus();
  }

  // Clear UI for new game
  function resetGame() {
    attempts = 0;
    attemptsEl.textContent = attempts;
    setError("");
    setMessage("New round started! Guess a number between 1 and 99.");
    guessesEl.textContent = "—";
    target = rand1to99();
    enableGuessing();
    input.value = "";

    // Show insert coin animation
    showInsertCoin();
  }

  /* Check that user provided a valid input number */
  function validate(raw) {
    const v = raw.trim();
    if (v === "") return { ok: false, msg: "Please enter a number." };
    const n = Number(v);
    if (!Number.isInteger(n)) return { ok: false, msg: "Please enter a whole number." };
    if (n > 99) return { ok: false, msg: "Number must be 99 or lower." };
    if (n < 1) return { ok: false, msg: "Number must 1 or higher." };
    return { ok: true, value: n };
  }

  /* Main game logic */
  function handleGuess() {
    if (finished) return;

    setError("");
    const check = validate(input.value);
    if (!check.ok) {
      setError(check.msg);
      return;
    }

    // Fade insert coin on game start
    fadeInsertCoinOnce();

    const guess = check.value;

    // Count guesses
    attempts += 1;
    attemptsEl.textContent = attempts;
    appendGuess(guess);

    /* Win */
    if (guess === target) {
      setMessage(`Correct! You got it in ${attempts} ${attempts === 1 ? "try" : "tries"}.`);
      wins += 1;
      winsEl.textContent = wins;
      playWinChime();
      disableGuessing();
      return;
    }

    /* Loss */
    if (attempts >= 7) {
      setMessage(`You lost. The number was ${target}.`, false);
      losses += 1;
      lossesEl.textContent = losses;
      playLoseBuzz();
      disableGuessing();
      return;
    }

    /* Game in progress*/
    setMessage(guess < target ? "Too low — try a higher number." : "Too high — try a lower number.");
    input.select();
  }

  /* Event listeners */
  // Resume audio
  guessBtn.addEventListener("click", ensureAudio);
  input.addEventListener("keydown", ensureAudio);
  resetBtn.addEventListener("click", ensureAudio);
  // Game actions
  guessBtn.addEventListener("click", handleGuess);
  resetBtn.addEventListener("click", resetGame);
  // Press Enter for a guess
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  });

  /* Page state */
  setMessage("Guess a number between 1 and 99.");
  resetBtn.hidden = true;
  input.focus();
  showInsertCoin();
})();
