# SCORING_OPTIMIZATION.md — PromptWars Parameter Checklist

After the working build is verified, go through every parameter below
in order. Do not skip any. Fix issues before the next parameter.

---

## Scoring Parameters (priority order)

### HIGH IMPACT — Do these first

#### 1. Code Quality
Clean, readable, well-structured code.

Checklist:
- [ ] No dead code, commented-out blocks, or unused variables
- [ ] Functions are small and do one thing each
- [ ] Consistent naming: camelCase for JS, kebab-case for CSS classes
- [ ] No inline styles mixed randomly with CSS classes — pick one system
- [ ] HTML is semantic: use <main>, <section>, <button>, <label> correctly
- [ ] No console.log() left in final code
- [ ] CSS is organized: reset → variables → layout → components → states
- [ ] No duplicate CSS rules
- [ ] Code reads top to bottom logically — no random function placement

#### 2. Problem Statement Alignment
Targets the core challenge, user needs, and objectives exactly.

Checklist:
- [ ] App does exactly what the challenge asks — re-read the challenge statement
- [ ] The user journey matches what was described in the problem
- [ ] No features that were not asked for and distract from the core
- [ ] App title and copy reflect the challenge language
- [ ] The AI output directly solves the stated problem (not a generic chatbot)

---

### MEDIUM IMPACT — Do these second

#### 3. Security
Safe practices, avoids common vulnerabilities.

Checklist:
- [ ] API key is NOT hardcoded in the HTML — use an input field or env variable
- [ ] All user input is sanitized before rendering to DOM
  — use textContent not innerHTML when inserting user data
- [ ] No use of eval()
- [ ] No sensitive data logged to console
- [ ] If using fetch: handle errors, don't expose raw error stack to UI
- [ ] Content-Security-Policy meta tag added to <head>:
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://api.anthropic.com; script-src 'self' 'unsafe-inline';">

#### 4. Efficiency
Optimal use of time and memory.

Checklist:
- [ ] API call is made only once per submit (no duplicate calls)
- [ ] No unnecessary re-renders or DOM thrashing
- [ ] Event listeners are added once, not inside loops
- [ ] Large DOM updates use DocumentFragment or batch operations
- [ ] No setTimeout/setInterval left running after use
- [ ] Images (if any) are optimized and not oversized
- [ ] CSS animations use transform/opacity only (GPU-friendly)

---

### LOW IMPACT — Do these last (tiebreakers)

#### 5. Testing
Easily testable and maintainable code.

Checklist:
- [ ] Core functions are pure (input → output, no hidden side effects)
- [ ] API call logic is in its own named function (not anonymous inline)
- [ ] Error states are handled and visible in the UI
- [ ] Edge cases handled:
  - Empty input submitted
  - API returns malformed JSON
  - API call fails / network error
  - User submits twice rapidly (debounce or disable button)
- [ ] Each major function has a single clear responsibility

#### 6. Accessibility
Usable for diverse users and environments.

Checklist:
- [ ] All images have alt text
- [ ] Form inputs have <label> elements linked with for/id
- [ ] Submit button is a real <button> not a <div>
- [ ] Color contrast passes: text on background is readable
- [ ] Keyboard navigable: Tab moves through all interactive elements
- [ ] Focus states visible on all inputs and buttons
- [ ] Loading state announced to screen readers:
  aria-live="polite" on the results container
- [ ] Checkboxes are real <input type="checkbox"> with labels
- [ ] No content relies on color alone to convey meaning

---

## Final Verification (before submission)

- [ ] App loads from scratch with no console errors
- [ ] Happy path works end-to-end: type → submit → get list → check tasks
- [ ] Deployed link is live and working (DQ risk if link is broken)
- [ ] Re-read the challenge statement one final time — does the app answer it?
- [ ] Code is clean enough that a stranger could read it in 2 minutes

---

## Submission Rules (from the event slides)
- Up to 3 submissions allowed — only the LAST submission counts as final score
- Submit your best version last — do not submit a broken state as your final
- If submission fails due to connectivity: you get 1 retry
- Warm-up scores do NOT count toward leaderboard
- Even Top 10 gets DQ'd if deployed link is broken — deploy must work