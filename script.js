const typingTextElement = document.getElementById("typing_text");
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

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (e) => {
    // if valid keys then only execute
    const key = e.key;
    if ((key >= "a" && key <= "z") || (key >= "A" && key <= "Z") || (key == " ")) {
      // create one variable which store howmuch we typed typedContent
      typedContent += e.key;
      console.log(typedContent);
      let isLetterTrue = typingTextContent.includes(typedContent);
      let lengthTypedContent = typedContent.length;
      // one more variable which store with elements typedContentElements

      // take that letter and with its right or wrong // typedLetter , isTypedLetterTrue
      let typedLetter = e.key;
      let originalLetter = typingTextContent[lengthTypedContent - 1];
      let isTypedLetterTrue = typedLetter === originalLetter;
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
  });
});
