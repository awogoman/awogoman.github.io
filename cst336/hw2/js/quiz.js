/* US Geography Quiz */

/* Inline SVGs */
const IMG_OK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%2328a745"/><path d="M6 12l3.5 3.5L18 7" stroke="white" stroke-width="3" fill="none"/></svg>';
const IMG_X  = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23dc3545"/><path d="M7 7l10 10M17 7L7 17" stroke="white" stroke-width="3"/></svg>';

/* Helper to place image in span#markImgN */
function setMark(id, ok){
  document.getElementById(id).innerHTML = `<img alt="${ok?'Correct':'Incorrect'}" src="${ok?IMG_OK:IMG_X}">`;
}

/* Build randomized radios*/
const q4Choices = [
  {id:'ri', label:'Rhode Island', correct:true},
  {id:'de', label:'Delaware'},
  {id:'ct', label:'Connecticut'},
  {id:'nj', label:'New Jersey'}
];
const q4Wrap = document.getElementById('q4Choices');
_.shuffle(q4Choices).forEach(c=>{
  const rid = `q4_${c.id}`;
  const div = document.createElement('div');
  div.className = 'form-check';
  div.innerHTML = `
    <input class="form-check-input" type="radio" name="q4" id="${rid}" value="${c.label}">
    <label class="form-check-label" for="${rid}">${c.label}</label>`;
  q4Wrap.appendChild(div);
});

/* Live output for slider */
const q6 = document.getElementById('q6');
const q6Out = document.getElementById('q6Out');
q6.addEventListener('input', ()=> q6Out.textContent = q6.value);

/* Show attempts already stored*/
window.addEventListener('DOMContentLoaded', ()=>{
  const attempts = Number(localStorage.getItem('quizAttempts')||0);
  document.getElementById('attemptsBanner').textContent = `Total times you've taken this quiz: ${attempts}`;
});

/* Grade button */
document.getElementById('submitBtn').addEventListener('click', grade);

function grade(){
  /* Running score */
  let score = 0;
  let missing = []; /* list of unanswered Qs */

  /* Q1: Sacramento */
  const q1 = (document.getElementById('q1').value || '').trim().toLowerCase();
  const q1ok = q1 === 'sacramento';
  setMark('markImg1', q1ok);
  document.getElementById('q1Feedback').textContent = q1ok ? 'Correct: Sacramento.' : 'Hint: It is not Los Angeles.';
  if(q1ok) score += 10; else if(!q1) missing.push('Q1');

  /* Q2: Rio Grande */
  const q2 = document.getElementById('q2').value;
  const q2ok = q2 === 'Rio Grande';
  setMark('markImg2', q2ok);
  document.getElementById('q2Feedback').textContent = q2ok ? 'Correct: The Rio Grande.' : 'The correct river is the Rio Grande.';
  if(q2ok) score += 10; else if(!q2) missing.push('Q2');

  /* Q3: Rushmore = Washington, Jefferson, T. Roosevelt, Lincoln */
  const must = ['Washington','Jefferson','Roosevelt','Lincoln'];
  const decoys = ['Jackson','Franklin'];
  const chosen = must.concat(decoys).filter(id=>document.getElementById(id).checked);
  const hasAll = must.every(id=>document.getElementById(id).checked);
  const noneWrong = decoys.every(id=>!document.getElementById(id).checked);
  const q3ok = hasAll && noneWrong;
  setMark('markImg3', q3ok);
  document.getElementById('q3Feedback').textContent = q3ok ? 'Correct presidents selected.' : 'Pick Washington, Jefferson, T. Roosevelt, Lincoln.';
  if(q3ok) score += 10; else if(chosen.length===0) missing.push('Q3');

  /* Q4: Smallest state = Rhode Island */
  const q4sel = document.querySelector('input[name="q4"]:checked');
  const q4ok = q4sel && q4sel.nextElementSibling.textContent === 'Rhode Island';
  setMark('markImg4', !!q4ok);
  document.getElementById('q4Feedback').textContent = q4ok ? 'Correct: Rhode Island.' : 'Smallest by area is Rhode Island.';
  if(q4ok) score += 10; else if(!q4sel) missing.push('Q4');

  /* Q5: Land borders with Canada = 11 */
  const q5v = document.getElementById('q5').value;
  const q5ok = Number(q5v) === 11;
  setMark('markImg5', q5ok);
  document.getElementById('q5Feedback').textContent = q5ok ? 'Correct: 11 states.' : 'Answer is 11.';
  if(q5ok) score += 10; else if(q5v==='') missing.push('Q5');

  /* Q6: Phoenix latitude ~33.5°N (±2 accepted) */
  const q6num = Number(document.getElementById('q6').value);
  const q6ok = Math.abs(q6num - 33.5) <= 2;
  setMark('markImg6', q6ok);
  document.getElementById('q6Feedback').textContent = q6ok ? 'Close enough to ~33.5°N!' : 'Phoenix is about 33.5°N.';
  if(q6ok) score += 10;

  /* Q7: TX */
  const q7 = (document.getElementById('q7').value || '').trim().toUpperCase();
  const q7ok = q7 === 'TX';
  setMark('markImg7', q7ok);
  document.getElementById('q7Feedback').textContent = q7ok ? 'Correct: TX.' : 'USPS code is TX.';
  if(q7ok) score += 10; else if(!q7) missing.push('Q7');

  /* Q8: Multi-select “New” states: NY, NJ, NM, NH */
  const q8 = Array.from(document.getElementById('q8').selectedOptions).map(o=>o.value);
  const correctNew = ['New York','New Jersey','New Mexico','New Hampshire'];
  const q8ok = correctNew.every(v=>q8.includes(v)) && q8.length===4;
  setMark('markImg8', q8ok);
  document.getElementById('q8Feedback').textContent = q8ok ? 'Correct, all four “New–” states selected.' : 'Pick New York, New Jersey, New Mexico, New Hampshire.';
  if(q8ok) score += 10; else if(q8.length===0) missing.push('Q8');

  /* Q9: True (Aleutians cross the 180th meridian) */
  const q9sel = document.querySelector('input[name="q9"]:checked');
  const q9ok = q9sel && q9sel.value === 'True';
  setMark('markImg9', !!q9ok);
  document.getElementById('q9Feedback').textContent = q9ok ? 'True! Alaska reaches east of 180°.' : 'It’s true: the Aleutians cross 180°.';
  if(q9ok) score += 10; else if(!q9sel) missing.push('Q9');

  /* Q10: Cheyenne */
  const q10 = (document.getElementById('q10').value || '').trim().toLowerCase();
  const q10ok = q10 === 'cheyenne';
  setMark('markImg10', q10ok);
  document.getElementById('q10Feedback').textContent = q10ok ? 'Correct: Cheyenne.' : 'Capital of Wyoming is Cheyenne.';
  if(q10ok) score += 10; else if(!q10) missing.push('Q10');

  /* Totals, attempts, and messages */
  const scorePct = score; // 10 questions × 10 pts each
  const scoreBanner = document.getElementById('scoreBanner');
  scoreBanner.classList.remove('d-none','alert-success','alert-danger');
  scoreBanner.classList.add(scorePct >= 80 ? 'alert-success' : 'alert-danger');
  scoreBanner.textContent = scorePct >= 80
    ? `Yeehaw! You scored ${scorePct}/100.`
    : `You scored ${scorePct}/100. Keep ridin' and try again!`;

  /* Web Storage */
  const prev = Number(localStorage.getItem('quizAttempts') || 0);
  const now  = prev + 1;
  localStorage.setItem('quizAttempts', String(now));
  document.getElementById('attemptsBanner').textContent = `Total times you've taken this quiz: ${now}`;

  /* Any unanswered required items */
  const v = document.getElementById('validationFdbk');
  v.textContent = missing.length ? `Unanswered: ${missing.join(', ')}.` : '';

  /* Totals shown */
  document.getElementById('totalScore').textContent = `Total Score: ${scorePct}/100`;
  document.getElementById('totalAttempts').textContent = `Attempts (from Web Storage): ${now}`;
}
