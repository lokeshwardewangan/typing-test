# Typing Test

A small typing speed test i built with just plain html, css and js. No react, no library, nothing. Wanted to see if i could figure out the logic on my own first before looking anything up.

These are basically my own rough notes on how i thought about it and built it.

---

## The Idea

Show some paragraph on screen, user types it, and i tell them how fast they typed (wpm) + how many they got right and wrong. Simple typing test like the ones online.

---

## How I Thought It Would Work (Before Writing Code)

The main thing stuck in my head was this:

> at any moment the line on screen = the letters i already typed + a cursor + the text thats still left

So every time someone presses a key i just push that letter into the "typed" part, and whatever is left of the original text goes after the cursor. Keep doing that till the text is done. Thats the whole trick really.

So i kept 3 pieces in my head:

- `typedContent` -> the string of what they typed so far
- the typed letters as html (each letter colored green/red)
- `remainingText` -> the part of the paragraph not typed yet

And on each key i rebuild the whole line = typed letters html + cursor + remaining. I didnt wanna mess with updating single letter nodes, felt easier to just redraw the whole thing every key.

---

## Breaking It Down

1. Put the paragraph in the page and stick a cursor at the start
2. Listen for keydown
3. Take the pressed key, check if it matches the letter that was supposed to come there
4. Color it green if right, red if wrong, add it to the typed part
5. Move the cursor forward (which just happens coz i redraw)
6. Start a 30s timer on the first key
7. When time is up (or text is done) show the result

---

## Stuff That Broke / Things I Figured Out The Hard Way

A few things i didnt expect:

**Backspace and other keys were messing the text.**
I had an a-z / A-Z check but stuff like backspace, shift, alt still got through. Turns out `e.key` for those is the full word like "Backspace" and that passes the a-z check coz it only looks at the first letter (B is between A and Z). Fixed it by checking the key is only 1 char long first.

**Cursor wasnt hiding on the result screen.**
I was setting display none on my cursor element but nothing happened. Took me a bit to get that the cursor on screen is not my element, its a copy that got made when i redraw the line with innerHTML. So i had to grab the real one in the dom and hide that too.

**Try again button wasnt really restarting.**
First time it didnt reset the typed text, counters, timer etc so the second test was broken. Made a reset function that clears everything back to start.

---

## How WPM Is Counted

Took 1 word = 5 characters (thats the normal way). So words = correct letters / 5. But the test is only 30 seconds, so i multiply to scale it up to a full minute. Thats the wpm.

---

## Things I Still Wanna Add Later

- Backspace to actually delete the last letter (right now its just ignored)
- Let user pick the time (15 / 30 / 60s)
- Different paragraphs instead of the same one
- Accuracy %

---

## Run It

Just open `index.html` in a browser. Nothing to install.
