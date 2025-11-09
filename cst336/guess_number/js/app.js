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
  function playBeep({ freq = 440, duration = 0.12, type = "square", volume = 0.2, when = 0 }) {
    const t0 = audioCtx.currentTime + when;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    // Volume fade-in/out
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.01);
  }
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

  /* Sound for correct guess */
  function playWinChime() {
    const base = 523.25; // C5
    const notes = [base, base * 1.25, base * 1.5, base * 2];
    notes.forEach((f, i) =>
      playBeep({ freq: f, duration: 0.12, type: "square", volume: 0.25, when: i * 0.12 })
    );
  }

  /* Sound for loss */
  function playLoseBuzz() {
    playSlide({ start: 500, end: 110, duration: 0.45, type: "square", volume: 0.25, when: 0 });
    playBeep({ freq: 90, duration: 0.18, type: "square", volume: 0.3, when: 0.46 });
  }

  /* Resumes the audio context when a button is pressed
  */
  function ensureAudio() {
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  /* Helper functions */
  /* Returns a random int 1-99 inclusive */
  function rand1to99() {
    return Math.floor(Math.random() * 99) + 1;
  }

  /* Sets / clears error text */
  function setError(msg = "") {
    errorEl.textContent = msg;
  }

  /* Sets main game message */
  function setMessage(msg = "", accent = true) {
    messageEl.textContent = msg;
    messageEl.style.color = accent ? "var(--accent2)" : "var(--text)";
  }

  /* Add each guess to list of previous guesses */
  function appendGuess(n) {
    if (guessesEl.textContent.trim() === "—") {
      guessesEl.textContent = `${n}`;
    } else {
      guessesEl.textContent += `, ${n}`;
    }
  }

  /* Disables guessing controls after game ends */
  function disableGuessing() {
    finished = true;
    guessBtn.classList.add("disabled");
    input.setAttribute("disabled", "true");
    resetBtn.hidden = false; // show Reset
    input.blur();
  }

  /* Enables controls for a new game */
  function enableGuessing() {
    finished = false;
    guessBtn.classList.remove("disabled");
    input.removeAttribute("disabled");
    resetBtn.hidden = true;
    input.focus();
  }

  /* Resets for a new round */
  function resetGame() {
  attempts = 0;
  attemptsEl.textContent = attempts;
  setError("");
  setMessage("New round started! Guess a number between 1 and 99.");
  guessesEl.textContent = "—";
  target = rand1to99();
  enableGuessing();
  input.value = "";

  /* Insert coin reappear */
  if (insertCoinEl) {
    insertCoinEl.classList.remove("fade-out"); // remove fade
    coinInserted = false;                      // set flag
  }
}
  
  /*  Checks player input and returns either a number or an error message. */
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

    const guess = check.value;

    /* Increment attempts and show them in a list */
    attempts += 1;
    attemptsEl.textContent = attempts;
    appendGuess(guess);

    /* Player wins */
    if (guess === target) {
      setMessage(`Correct! You got it in ${attempts} ${attempts === 1 ? "try" : "tries"}.`);
      wins += 1;
      winsEl.textContent = wins;
      playWinChime();
      disableGuessing();
      return;
    }

    /* Player loses */
    if (attempts >= 7) {
      setMessage(`You lost. The number was ${target}.`, false);
      losses += 1;
      lossesEl.textContent = losses;
      playLoseBuzz();
      disableGuessing();
      return;
    }

    /* Game ongoing */
    setMessage(guess < target ? "Too low — try a higher number." : "Too high — try a lower number.");
    input.select();
  }

  /* Event listeners */
  guessBtn.addEventListener("click", ensureAudio);
  resetBtn.addEventListener("click", ensureAudio);
  input.addEventListener("keydown", ensureAudio);

  /* Coin animation fades */
  function fadeInsertCoin() {
    if (!coinInserted && insertCoinEl) {
      insertCoinEl.classList.add("fade-out");
      coinInserted = true;
    }
  }
  
  guessBtn.addEventListener("click", fadeInsertCoin);
  resetBtn.addEventListener("click", fadeInsertCoin);
  input.addEventListener("keydown", fadeInsertCoin);
  window.addEventListener("click", fadeInsertCoin); // any click counts as coin insert


  guessBtn.addEventListener("click", handleGuess);
  resetBtn.addEventListener("click", resetGame);

  // Pressing 'Enter' triggers a guess
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGuess();
  });

  /* Page state */
  setMessage("Guess a number between 1 and 99.");
  resetBtn.hidden = true;
  input.focus();

  /* Insert Coin sound */
  window.addEventListener("load", () => {
    // timeout for browser, enable audio context
    setTimeout(() => {
      if (audioCtx.state === "running") {
        playBeep({ freq: 440, duration: 0.1, volume: 0.3 });
        playBeep({ freq: 660, duration: 0.12, volume: 0.25, when: 0.1 });
        playBeep({ freq: 880, duration: 0.15, volume: 0.2, when: 0.25 });
      }
    }, 700);
  });

})();
