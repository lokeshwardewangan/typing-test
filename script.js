const typingTextElement = document.getElementById("typing_text");
const typingWrapperElement = document.querySelector(".typing_wrapper");
const resultWrapperElement = document.querySelector(".result_wrapper");
const retryButtonElement = document.querySelector("#again_test_button");
const timerSecondsElement = document.querySelector("#timer_wrapper .second");
const timerWrapperElement = document.getElementById("timer_wrapper");
const timerRingProgress = document.querySelector(".timer_ring_progress");
const hiddenInputElement = document.querySelector(".hidden_input");

// phones dont have a real keyboard, so we open a hidden input to type into
const isTouchDevice =
  window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
if (isTouchDevice) {
  document.body.classList.add("is-touch");
}

const typingTextContent = typingTextElement.innerText;

const TEST_DURATION = 30; // seconds
const LETTERS_PER_WORD = 5;
// circle radius in the svg is 44, so this is its full circumference
const TIMER_RING_LENGTH = 2 * Math.PI * 44;

let typedContent = "";
let typedLettersHtml = document.createElement("p");

const typingCursorElement = document.createElement("p");
typingCursorElement.className = "cursor";

typingTextElement.insertBefore(typingCursorElement, typingTextElement.firstChild);

let secondsLeft = TEST_DURATION;
// set the dash length once, then draw the full ring at start
timerRingProgress.style.strokeDasharray = TIMER_RING_LENGTH;
updateTimer();

let correctLetters = 0;
let wrongLetters = 0;

let isTypingDisabled = false;
let isTestStart = false;
let timerInterval = null;

// the actual typing logic. takes one character (from desktop keydown OR the
// mobile hidden input) and figures out right/wrong + redraws the text
function processKey(key) {
  if (isTypingDisabled) return;
  // only want normal chars here letters space and dot
  // weird thing -> e.key for backspace shift etc is the full word like "Backspace"
  // and it still passes the a-z check coz it only looks at first letter and B is in A-Z
  // so just check length is 1 first to skip all that junk
  if (
    key.length === 1 &&
    ((key >= "a" && key <= "z") ||
      (key >= "A" && key <= "Z") ||
      key == " " ||
      key == ".")
  ) {
    // already typed the full text so dont add more
    if (typedContent.length >= typingTextContent.length) return;

    typedContent += key;
    const typedLength = typedContent.length;

    // first key -> start the timer
    if (!isTestStart) {
      isTestStart = true;
      startTimer();
    }

    const expectedLetter = typingTextContent[typedLength - 1];
    const isTypedLetterCorrect = key === expectedLetter;
    if (isTypedLetterCorrect) {
      correctLetters++;
    } else {
      wrongLetters++;
    }

    // keep adding each letter to one html string
    // every letter is a <p> with right or wrong class so css can color it
    const letterElement = document.createElement("p");
    letterElement.className = isTypedLetterCorrect ? "right" : "wrong";
    letterElement.textContent = expectedLetter;
    typedLettersHtml.innerHTML += letterElement.outerHTML;

    const remainingText = typingTextContent.slice(typedLength);

    // im just redrawing the whole thing every key instead of touching single letters
    // typed letters + cursor + the text thats left. easier for me to handle
    typingTextElement.innerHTML =
      typedLettersHtml.innerHTML +
      typingCursorElement.outerHTML +
      remainingText;

    // done typing before time is over so just end it
    if (typedContent.length === typingTextContent.length) {
      clearInterval(timerInterval);
      endTest();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // desktop path: physical keyboard.
  // if the hidden input is focused (mobile) we let the input handle it instead,
  // otherwise we'd count the same key twice
  document.addEventListener("keydown", (e) => {
    if (document.activeElement === hiddenInputElement) return;
    processKey(e.key);
  });

  // mobile path: tapping the typing area opens the keyboard
  typingWrapperElement.addEventListener("click", () => {
    if (!isTypingDisabled) hiddenInputElement.focus();
  });

  // each character typed into the hidden input comes through here
  hiddenInputElement.addEventListener("beforeinput", (e) => {
    if (e.data) {
      for (const char of e.data) {
        processKey(char);
      }
    }
    // keep the input empty, we track everything in typedContent ourselves
    e.preventDefault();
  });

  // used to hide the "tap to type" hint while the keyboard is open
  hiddenInputElement.addEventListener("focus", () => {
    document.body.classList.add("input-focused");
  });
  hiddenInputElement.addEventListener("blur", () => {
    document.body.classList.remove("input-focused");
  });

  retryButtonElement.addEventListener("click", () => {
    setTypingDisabled(false);
    resetTest();
    resultWrapperElement.classList.remove("show");
    // keep the keyboard up on mobile so they can go again right away
    if (isTouchDevice) hiddenInputElement.focus();
  });
});

function resetTest() {
  // put everything back to start
  clearInterval(timerInterval);
  typedContent = "";
  typedLettersHtml = document.createElement("p");
  correctLetters = 0;
  wrongLetters = 0;
  secondsLeft = TEST_DURATION;
  isTestStart = false;

  // show the timer again (full ring) and the full text with cursor at the start
  updateTimer();
  typingTextElement.innerHTML =
    typingCursorElement.outerHTML + typingTextContent;
}

// updates the number in the middle + how much of the ring is filled
// also flips the "low" class so the ring/number go red near the end
function updateTimer() {
  const safeSeconds = Math.max(secondsLeft, 0);
  timerSecondsElement.innerHTML = `${safeSeconds}`;
  const fractionLeft = safeSeconds / TEST_DURATION;
  timerRingProgress.style.strokeDashoffset = TIMER_RING_LENGTH * (1 - fractionLeft);
  timerWrapperElement.classList.toggle("low", secondsLeft <= 5);
}

function setCursorVisible(isVisible) {
  const display = isVisible ? "inline-block" : "none";
  // tricky one. the cursor on screen is not this element
  // its a copy made from outerHTML when i redraw the text
  // so changing this alone does nothing. i change both this one
  // and the real one sitting in the dom right now
  typingCursorElement.style.display = display;
  const renderedCursor = typingTextElement.querySelector(".cursor");
  if (renderedCursor) {
    renderedCursor.style.display = display;
  }
}

function setTypingDisabled(isDisabled) {
  isTypingDisabled = isDisabled;
  setCursorVisible(!isDisabled);
  typingWrapperElement.style.opacity = isDisabled ? "0.5" : 1;
  typingWrapperElement.style.pointerEvents = isDisabled ? "none" : "auto";
  typingWrapperElement.style.userSelect = isDisabled ? "none" : "auto";
}

function endTest() {
  setTypingDisabled(true);

  // wpm is words per min. 1 word = 5 chars
  // we only type for 30s so multiply to make it a full minute
  const typedWords = correctLetters / LETTERS_PER_WORD;
  const wpm = Math.round(typedWords * (60 / TEST_DURATION));

  document.querySelector(".total_time").innerHTML = `${TEST_DURATION}s`;
  document.querySelector(".wpm").innerHTML = `${wpm}`;
  document.querySelector(".noOfRightWord").innerHTML = `${correctLetters}`;
  document.querySelector(".noOfWrongWord").innerHTML = `${wrongLetters}`;

  // now show the result box
  resultWrapperElement.classList.add("show");
}

function startTimer() {
  // clear the old timer first so we dont end up with 2 running
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    updateTimer();
    secondsLeft--;
    if (secondsLeft < 0) {
      clearInterval(timerInterval);
      endTest();
    }
  }, 1000);
}
