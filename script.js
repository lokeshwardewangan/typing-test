const typingTextElement = document.getElementById("typing_text");
const typingWrapperElement = document.querySelector(".typing_wrapper");
const resultWrapperElement = document.querySelector(".result_wrapper");
const retryButtonElement = document.querySelector("#again_test_button");
const timerSecondsElement = document.querySelector("#timer_wrapper .second");

const typingTextContent = typingTextElement.innerText;

const TEST_DURATION = 30; // seconds
const LETTERS_PER_WORD = 5;

let typedContent = "";
let typedLettersHtml = document.createElement("p");

const typingCursorElement = document.createElement("p");
typingCursorElement.className = "cursor";

typingTextElement.insertBefore(typingCursorElement, typingTextElement.firstChild);

let secondsLeft = TEST_DURATION;
timerSecondsElement.innerHTML = `${secondsLeft}s`;

let correctLetters = 0;
let wrongLetters = 0;

let isTypingDisabled = false;
let isTestStart = false;
let timerInterval = null;

// runs everytime u press a key
// figures out right or wrong and redraws the text
function handleUserType(e) {
  const key = e.key;
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
  document.addEventListener("keydown", (e) => {
    if (!isTypingDisabled) {
      handleUserType(e);
    }
  });

  retryButtonElement.addEventListener("click", () => {
    setTypingDisabled(false);
    resetTest();
    resultWrapperElement.classList.remove("show");
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

  // show the timer again and the full text with cursor at the start
  timerSecondsElement.innerHTML = `${secondsLeft}s`;
  typingTextElement.innerHTML =
    typingCursorElement.outerHTML + typingTextContent;
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
    timerSecondsElement.innerHTML = `${secondsLeft}s`;
    secondsLeft--;
    if (secondsLeft < 0) {
      clearInterval(timerInterval);
      endTest();
    }
  }, 1000);
}
