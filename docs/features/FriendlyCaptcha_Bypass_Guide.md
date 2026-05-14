# FriendlyCaptcha Bypass in Cypress — Complete Guide

**Project:** DocuHub Self-Registration Test Suite  
**Captcha type:** FriendlyCaptcha v1 (proof-of-work)  
**Resolved by:** Step-by-step debugging across multiple test runs

---

## Table of Contents

1. [Problem Overview](#1-problem-overview)
2. [Issues Encountered & How Each Was Resolved](#2-issues-encountered--how-each-was-resolved)
3. [Final Working Implementation](#3-final-working-implementation)
4. [Step-by-Step Setup for a New Project](#4-step-by-step-setup-for-a-new-project)
5. [Best Practices](#5-best-practices)

---

## 1. Problem Overview

FriendlyCaptcha is an anti-bot captcha that works differently from reCAPTCHA:

- **No image puzzles or user interaction needed** — it runs a proof-of-work (PoW) computation in a background web worker
- **Two layers of protection:**
  1. **Browser fingerprinting** — checks `navigator.webdriver`, Chrome automation flags, etc.
  2. **Proof-of-work puzzle** — fetches a puzzle from the API and must compute a SHA-256 hash with N leading zero bits

Cypress is detected by both layers out of the box, causing:

- "Browser check failed, try a different browser" (fingerprinting layer)
- Task timeout or impossible difficulty (PoW layer)

---

## 2. Issues Encountered & How Each Was Resolved

---

### Issue 1 — "Browser check failed, try a different browser"

**Symptom:**  
The FriendlyCaptcha widget showed `"Verification failed – Browser check failed"` immediately on page load, before any puzzle was even attempted. The Register button stayed disabled.

**Root cause:**  
FriendlyCaptcha v2 checks `navigator.webdriver === true`. Cypress always sets this flag, making the browser identifiable as automated.

**Fix applied (two layers):**

**Layer 1 — Chrome launch flag** (`cypress.config.js` inside `setupNodeEvents`):

```js
on('before:browser:launch', (browser, launchOptions) => {
  if (browser.name === 'chrome' || browser.name === 'chromium') {
    launchOptions.args.push('--disable-blink-features=AutomationControlled');
    launchOptions.args = launchOptions.args.filter(
      (arg) => arg !== '--enable-automation',
    );
  }
  return launchOptions;
});
```

**Layer 2 — Override `navigator.webdriver` per visit** (`cy.visit()` in `beforeEach`):

```js
cy.visit(registerUrl, {
  failOnStatusCode: false,
  onBeforeLoad(win) {
    Object.defineProperty(win.navigator, 'webdriver', {
      get: () => undefined,
    });
  },
});
```

**Result:** Widget loaded successfully, showed "I am human" state.

---

### Issue 2 — Task timed out after 60 seconds

**Symptom:**

```
CypressError: cy.task('solveFriendlyCaptcha') timed out after waiting 60000ms
```

**Root cause (first attempt):**  
The original AI-suggested implementation used `fetch()` globally and hardcoded the sitekey `FCMURNNP42EE0QOF`. The sitekey belonged to a different environment (`documenthub.edeja.com`), while the test ran on `e-gehaltszettel-t.post-business-solutions.at`. The API returned a corrupted puzzle.

**Fix:**  
Replaced `fetch()` with the Node.js built-in `https` module (works in all Node versions), added a 15-second request timeout, and added error handling so failures surface immediately instead of hanging:

```js
const puzzleData = await new Promise((resolve, reject) => {
  const req = https.get(url, (res) => {
    let raw = '';
    res.on('data', (chunk) => (raw += chunk));
    res.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
  });
  req.on('error', reject);
  req.setTimeout(15000, () => {
    req.destroy();
    reject(new Error('Timed out'));
  });
});
```

---

### Issue 3 — "Difficulty 106 is too high"

**Symptom:**

```
solveFriendlyCaptcha failed: Difficulty 106 is too high – puzzle likely invalid
```

**Root cause:**  
The puzzle buffer byte layout was misread. The original code assumed `puzzleBuffer[0]` = difficulty. In FriendlyCaptcha v1 the actual layout is:

| Byte(s)           | Meaning                                               |
| ----------------- | ----------------------------------------------------- |
| `buffer[0]`       | `n` — number of sub-puzzles to solve                  |
| `buffer[1]`       | `threshold` — leading zero bits required per solution |
| `buffer.slice(2)` | `puzzleHash` — the seed for SHA-256 computation       |

`buffer[0]` = **106** (number of sub-puzzles), NOT difficulty.  
`buffer[1]` = **5** (actual difficulty = only 5 bits needed).

106 sub-puzzles × 2⁵ average operations each = ~3,400 total hashes — near-instant.

**Fix:** Rewrote the solver to read the correct bytes and solve **all n sub-puzzles**, returning a concatenated solution:

```js
const n = buffer[0]; // number of sub-puzzles
const threshold = buffer[1]; // bits of leading zeros required
const puzzleHash = buffer.slice(2); // seed

const nonces = [];
for (let i = 0; i < n; i++) {
  const indexBuf = Buffer.from([i]);
  let nonce = 0;
  while (true) {
    const nonceBuf = Buffer.alloc(8);
    nonceBuf.writeBigUInt64LE(BigInt(nonce));
    const hash = crypto
      .createHash('sha256')
      .update(Buffer.concat([puzzleHash, indexBuf, nonceBuf]))
      .digest();
    if (countLeadingZeros(hash) >= threshold) {
      nonces.push(nonceBuf);
      break;
    }
    nonce++;
  }
}
return `${accountId}.${Buffer.concat(nonces).toString('base64')}`;
```

---

### Issue 4 — Wrong sitekey hardcoded in command

**Symptom:**  
Task was called with a hardcoded sitekey `FCMURNNP42EE0QOF` — valid only for one environment. When run against another environment it fetched a wrong/corrupted puzzle.

**Fix:**  
Read the sitekey directly from the widget's `data-sitekey` attribute on the current page — automatically correct for any environment:

```js
cy.get('.frc-captcha[data-sitekey], [data-sitekey]')
  .first()
  .invoke('attr', 'data-sitekey')
  .then((sitekey) => {
    cy.task('solveFriendlyCaptcha', sitekey, { timeout: 60000 })
      ...
  });
```

---

### Issue 5 — `cy.trigger()` failed because element is not visible

**Symptom:**

```
cy.trigger() failed because this element is not visible:
<input name="frc-captcha-solution" type="hidden" ... display: none>
```

**Root cause:**  
`input[name="frc-captcha-solution"]` is a `type="hidden"` field with `display: none`. Cypress refuses to fire `.trigger()` on hidden elements by default.

**Fix:**  
Add `{ force: true }` to both `.trigger()` calls:

```js
cy.get('input[name="frc-captcha-solution"]')
  .invoke('val', solution)
  .trigger('input', { force: true })
  .trigger('change', { force: true });
```

> **Why keep the triggers?** `.invoke('val', solution)` sets the raw DOM value but bypasses React's state. The `.trigger()` calls fire synthetic events that notify React the value changed — without them, the form stays invalid and the Register button stays disabled.

---

### Issue 6 — `.frc-button` not found in DOM

**Symptom:**

```
Expected to find element: .frc-button, but never found it
```

**Root cause:**  
After our Chrome flag fix, FriendlyCaptcha auto-verifies on page load (widget shows "I am human"). By the time the command runs, the `.frc-button` and `.frc-text` elements have already been removed from the DOM — they only exist in the widget's unverified state.

**Fix:**  
Make DOM-patching steps conditional — skip them if the elements are already gone:

```js
cy.get('body').then(($body) => {
  if ($body.find('.frc-button').length > 0) {
    cy.get('.frc-button').invoke('attr', 'disabled', 'true');
  }
  if ($body.find('.frc-text').length > 0) {
    cy.get('.frc-text').invoke('text', 'Anti-Robot Verification passed');
  }
});
```

---

### Issue 7 — "Group already exists" (HTTP 400 on registration)

**Symptom:**

```
expected 400 to be one of [200, 201, 202]
Page shows: "Group already exists"
```

**Root cause:**  
Company name was hardcoded as `'Test AG'` — already registered from a previous test run. Username used a timestamp but company name did not.

**Fix:**  
Append the same timestamp to the company name:

```js
const ts = Date.now();
const data = {
  companyName: `Test AG ${ts}`,   // unique per run
  username: `cypressuser${ts}`,   // already unique
  email: `cypress+${ts}@example.com`,
  ...
};
```

---

## 3. Final Working Implementation

### `cypress.config.js` — inside `setupNodeEvents`

```js
// ── 1. Hide automation flags from Chrome ─────────────────────────────────────
on('before:browser:launch', (browser, launchOptions) => {
  if (browser.name === 'chrome' || browser.name === 'chromium') {
    launchOptions.args.push('--disable-blink-features=AutomationControlled');
    launchOptions.args = launchOptions.args.filter(
      (arg) => arg !== '--enable-automation',
    );
  }
  return launchOptions;
});

// ── 2. FriendlyCaptcha proof-of-work solver task ──────────────────────────────
on('task', {
  async solveFriendlyCaptcha(sitekey) {
    try {
      const https = require('https');
      const crypto = require('crypto');

      const puzzleData = await new Promise((resolve, reject) => {
        const url = `https://api.friendlycaptcha.com/api/v1/puzzle?sitekey=${sitekey}`;
        const req = https.get(url, (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(new Error(`API parse error: ${raw}`));
            }
          });
        });
        req.on('error', (e) =>
          reject(new Error(`API request error: ${e.message}`)),
        );
        req.setTimeout(15000, () => {
          req.destroy();
          reject(new Error('API request timed out after 15s'));
        });
      });

      if (!puzzleData.data || !puzzleData.data.puzzle) {
        throw new Error(
          `Unexpected API response: ${JSON.stringify(puzzleData)}`,
        );
      }

      const [accountId, puzzleBase64] = puzzleData.data.puzzle.split('.');
      const buffer = Buffer.from(puzzleBase64, 'base64');

      const n = buffer[0]; // number of sub-puzzles
      const threshold = buffer[1]; // leading zero bits required
      const puzzleHash = buffer.slice(2); // hash seed

      console.log(
        `FriendlyCaptcha: n=${n} sub-puzzles, threshold=${threshold} bits`,
      );

      function countLeadingZeros(buf) {
        let zeroBits = 0;
        for (const byte of buf) {
          if (byte === 0) {
            zeroBits += 8;
          } else {
            zeroBits += Math.clz32(byte) - 24;
            break;
          }
        }
        return zeroBits;
      }

      const nonces = [];
      for (let i = 0; i < n; i++) {
        const indexBuf = Buffer.from([i]);
        let nonce = 0;
        while (true) {
          const nonceBuf = Buffer.alloc(8);
          nonceBuf.writeBigUInt64LE(BigInt(nonce));
          const hash = crypto
            .createHash('sha256')
            .update(Buffer.concat([puzzleHash, indexBuf, nonceBuf]))
            .digest();
          if (countLeadingZeros(hash) >= threshold) {
            nonces.push(nonceBuf);
            break;
          }
          nonce++;
        }
      }

      console.log(
        `FriendlyCaptcha solved: ${n} puzzles × threshold ${threshold}`,
      );
      return `${accountId}.${Buffer.concat(nonces).toString('base64')}`;
    } catch (err) {
      throw new Error(`solveFriendlyCaptcha failed: ${err.message}`);
    }
  },
});
```

---

### `cypress/support/commands.js`

```js
Cypress.Commands.add('solveFriendlyCaptcha', () => {
  // Read the correct sitekey directly from the page widget
  cy.get('.frc-captcha[data-sitekey], [data-sitekey]')
    .first()
    .invoke('attr', 'data-sitekey')
    .then((sitekey) => {
      cy.log(`FriendlyCaptcha sitekey from page: ${sitekey}`);
      cy.task('solveFriendlyCaptcha', sitekey, { timeout: 60000 }).then(
        (solution) => {
          // Inject solution into hidden input and fire React events
          cy.get('input[name="frc-captcha-solution"]')
            .invoke('val', solution)
            .trigger('input', { force: true })
            .trigger('change', { force: true });

          // Patch widget DOM state only if elements still exist
          cy.get('.frc-captcha').invoke('attr', 'data-solution', solution);
          cy.get('body').then(($body) => {
            if ($body.find('.frc-button').length > 0) {
              cy.get('.frc-button').invoke('attr', 'disabled', 'true');
            }
            if ($body.find('.frc-text').length > 0) {
              cy.get('.frc-text').invoke(
                'text',
                'Anti-Robot Verification passed',
              );
            }
          });
        },
      );
    });
});
```

---

### `cy.visit()` in `beforeEach`

```js
cy.visit(registerUrl, {
  failOnStatusCode: false,
  onBeforeLoad(win) {
    Object.defineProperty(win.navigator, 'webdriver', {
      get: () => undefined,
    });
  },
});
```

---

## 4. Step-by-Step Setup for a New Project

1. **Add Chrome launch flags** to `cypress.config.js` inside `setupNodeEvents`:
   - Strip `--enable-automation`
   - Add `--disable-blink-features=AutomationControlled`

2. **Add the `solveFriendlyCaptcha` task** to the `on('task', {...})` block in `setupNodeEvents` (full code in section 3 above).

3. **Add `solveFriendlyCaptcha` custom command** to `cypress/support/commands.js` (full code in section 3 above).

4. **Add `onBeforeLoad` to `cy.visit()`** on any page that has a FriendlyCaptcha widget to override `navigator.webdriver`.

5. **In your test**, call `cy.solveFriendlyCaptcha()` before clicking the submit button:

   ```js
   fillForm();
   acceptTerms();
   cy.solveFriendlyCaptcha();
   cy.get('button[type="submit"]').click();
   ```

6. **Make test data unique** — any field the server validates for uniqueness (company name, username, email) must include a timestamp or random value.

---

## 5. Best Practices

| Practice                                                         | Reason                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Always read sitekey from the page** (`data-sitekey` attribute) | Never hardcode — different environments have different sitekeys                 |
| **Use `https` module, not `fetch()`**                            | `fetch` is global only in Node 18+; `https` works everywhere                    |
| **Use `{ force: true }` on hidden inputs**                       | Cypress blocks `.trigger()` on `display:none` elements by default               |
| **Make DOM patching conditional**                                | Widget DOM elements are removed after verification; don't assume they exist     |
| **Override `navigator.webdriver` in `onBeforeLoad`**             | Must happen before any page script runs — `cy.window()` after load is too late  |
| **Add both Chrome flag AND `onBeforeLoad`**                      | Two independent fingerprinting checks — one fix may miss the other              |
| **Use `Date.now()` in all unique fields**                        | Company name, username, email — all must be unique per test run                 |
| **Set task timeout to 60000ms**                                  | PoW computation can take a few seconds; default 10s timeout will fail           |
| **Log n and threshold in the task**                              | If something goes wrong you immediately know if the API returned a valid puzzle |
| **Wrap task in try/catch**                                       | Without it, errors cause a 60s timeout with no useful message                   |
