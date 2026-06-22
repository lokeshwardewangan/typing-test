const typingTextElement = document.getElementById("typing_text");
const typingWrapperElement = document.querySelector(".typing_wrapper");
const resultWrapperElement = document.querySelector(".result_wrapper");
const againTestStartButtonElement =
  document.querySelector("#again_test_button");
const timerWrapperSecondElement = document.querySelector(
  "#timer_wrapper .second",
);
const typingTextContent = typingTextElement.innerText;
console.log(typingTextContent);

let typedContent = "";
let typedContentElements = document.createElement("p");

const typingCursorElement = document.createElement("p");
typingCursorElement.className = "cursor";
// typingCursorElement.textContent = "a"

typingTextElement.insertBefore(
  typingCursorElement,
  typingTextElement.firstChild,
);

let originalTimer = 30;
let timer = originalTimer;

let wpm = 60;
timerWrapperSecondElement.innerHTML = `${timer}s`;

let totalLettersInTypingText = typingTextContent.length;
let noOfWrongLettersTyped = 0;
let noOfRightLettersTyped = 0;

let isDisableUserType = false;

function handleUserType(e) {
  // if valid keys then only execute
  const key = e.key;
  if (
    (key >= "a" && key <= "z") ||
    (key >= "A" && key <= "Z") ||
    key == " " ||
    key == "."
  ) {
    // create one variable which store howmuch we typed typedContent
    typedContent += e.key;
    console.log(typedContent);
    let isLetterTrue = typingTextContent.includes(typedContent);

    let lengthTypedContent = typedContent.length;
    if (lengthTypedContent == 1) {
      isTestStart = true;
      handleTimer(isTestStart);
    }
    // one more variable which store with elements typedContentElements

    // take that letter and with its right or wrong // typedLetter , isTypedLetterTrue
    let typedLetter = e.key;
    let originalLetter = typingTextContent[lengthTypedContent - 1];
    let isTypedLetterTrue = typedLetter === originalLetter;
    if (isTypedLetterTrue) {
      noOfRightLettersTyped++;
      console.log("true");
    } else {
      noOfWrongLettersTyped++;
      console.log("false");
    }
    // create one elementt and insert content that letter and
    let typedElement = document.createElement("p");
    typedElement.className = isTypedLetterTrue ? "right" : "wrong";
    typedElement.textContent = originalLetter;
    // push element in typedContentElements
    typedContentElements.innerHTML += typedElement.outerHTML;
    console.log(typedContentElements.innerHTML);

    // add cursor in last once

    // calculate remaining texts which is not typed
    let remainingText = typingTextContent.slice(
      lengthTypedContent,
      typingTextContent.length,
    );
    // append that typedContentElement in that mainelement as first child and then main content remaining

    // update actual dom
    typingTextElement.innerHTML =
      typedContentElements.innerHTML +
      typingCursorElement.outerHTML +
      remainingText;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  calculateResult();
  document.addEventListener("keydown", (e) => {
    if (!isDisableUserType) {
      handleUserType(e);
    }
  });

  againTestStartButtonElement.addEventListener("click", () => {
    updateUserTypeWrapperDisable(false);
    document.querySelector(".result_wrapper").classList.remove("show");
  });
});

function handleShowTypingCursor(isShow) {
  typingCursorElement.style.display = isShow ? "inline-block" : "none";
}

function updateUserTypeWrapperDisable(isDisable) {
  isDisableUserType = isDisable ? true : false;
  handleShowTypingCursor(isDisable ? false : true);
  typingWrapperElement.style.opacity = isDisable ? "0.5" : 1;
  typingWrapperElement.style.pointerEvents = isDisable ? "none" : "auto";
}




function calculateResult() {
  updateUserTypeWrapperDisable(true);

  // lets take word = 5 letter
  let noOfWordsTyped = noOfRightLettersTyped / 5;

  let oneMinuteTotalWordsTyped = noOfWordsTyped * 2;

  document.querySelector(".total_time").innerHTML = `${originalTimer}s`;
  document.querySelector(".wpm").innerHTML =
    `${Math.round(oneMinuteTotalWordsTyped)}`;
  document.querySelector(".noOfRightWord").innerHTML =
    `${noOfRightLettersTyped}`;
  document.querySelector(".noOfWrongWord").innerHTML =
    `${noOfWrongLettersTyped}`;

  // reveal the result panel only once we actually have a result
  document.querySelector(".result_wrapper").classList.add("show");
}

function handleTimer(isTestStart) {
  if (!isTestStart) return;
  const intervalValid = setInterval(() => {
    timerWrapperSecondElement.innerHTML = `${timer}s`;
    timer--;
    if (timer < 0) {
      calculateResult();

      clearInterval(intervalValid);
      console.log("time is up");
    }
  }, 1000);
}
