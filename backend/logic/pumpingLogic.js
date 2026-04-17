// backend/logic/pumpingLogic.js

/**
 * Checks if a described language is regular or not using basic heuristic parsing
 * for demonstration of Pumping Lemma.
 * @param {string} desc Language description (e.g. "a^n b^n")
 */
function checkPumpingLemma(desc) {
  // Normalize
  const text = desc.toLowerCase().replace(/\s+/g, '');
  
  // Checking for common non-regular patterns
  // 1. a^n b^n
  if (/a\^nb\^n/.test(text) || /0\^n1\^n/.test(text)) {
    return generateContradiction(text, 'a', 'b');
  }
  
  // 2. a^n b^n c^n
  if (/a\^nb\^nc\^n/.test(text)) {
    return generateContradiction3(text, 'a', 'b', 'c');
  }

  // 3. ww or ww^r (palindromes)
  if (text.includes('ww') || text.includes('palindrome')) {
    return generatePalindromeContradiction(text);
  }

  // If it's something like a^* b^*, it is regular.
  if (/a\^\*b\^\*/.test(text) || !text.includes('^n')) {
    return {
      isRegular: true,
      message: `The language "${desc}" appears to be Regular.`,
      regex: text.replace(/\^/g, '') // approximation
    };
  }

  // Default fallback
  return {
    isRegular: false,
    message: `Attempting to analyze ${desc}...`,
    steps: [
      `1. Assume L is regular.`,
      `2. By pumping lemma, there exists a pumping length p.`,
      `3. Choose a valid string s in L of length >= p.`,
      `4. Since s = xyz, pumping y (xy^2z) will violate the constraints of L.`,
      `5. Therefore, L is not regular.`
    ]
  };
}

function generateContradiction(text, c1, c2) {
  return {
    isRegular: false,
    message: `The language L = { ${text} | n >= 0 } is Non-Regular.`,
    steps: [
      `**Step 1:** Assume for the sake of contradiction that L is Regular. Minimum pumping length is $p$.`,
      `**Step 2:** Choose the string $s = ${c1}^p ${c2}^p$. Clearly $s \\in L$ and $|s| = 2p \\ge p$.`,
      `**Step 3:** By the Pumping Lemma, $s$ can be divided into $x, y, z$ such that $s = xyz$, $|y| > 0$, $|xy| \\le p$.`,
      `**Step 4:** Since $|xy| \\le p$, the substring $y$ consists entirely of '${c1}'s. So $y = ${c1}^k$ for some $k > 0$.`,
      `**Step 5:** Pump $y$: let $i = 2$. The pumped string is $x y^2 z = ${c1}^{p+k} ${c2}^p$.`,
      `**Conclusion:** Since $p+k \\neq p$, the pumped string is NOT in L. This contradicts the Pumping Lemma. Hence, L is not regular.`
    ]
  };
}

function generateContradiction3(text, c1, c2, c3) {
  return {
    isRegular: false,
    message: `The language L = { ${text} | n >= 0 } is Non-Regular.`,
    steps: [
      `**Step 1:** Assume L is Regular. Let $p$ be the pumping length.`,
      `**Step 2:** Choose $s = ${c1}^p ${c2}^p ${c3}^p$.`,
      `**Step 3:** Divide $s = xyz$ where $|xy| \\le p$ and $|y| > 0$.`,
      `**Step 4:** Because $|xy| \\le p$, $y$ consists solely of '${c1}'s.`,
      `**Step 5:** Pumping $y$ (e.g. $i=2$) results in more '${c1}'s than '${c2}'s and '${c3}'s.`,
      `**Conclusion:** The pumped string is not in L. Contradiction. L is not regular.`
    ]
  };
}

function generatePalindromeContradiction(text) {
  return {
    isRegular: false,
    message: `The language of Palindromes (e.g. $ww^R$) is Non-Regular.`,
    steps: [
      `**Step 1:** Assume L is Regular with pumping length $p$.`,
      `**Step 2:** Choose $s = 0^p 1 0^p$.`,
      `**Step 3:** Divide $s = xyz$ where $|xy| \\le p$ and $|y| > 0$.`,
      `**Step 4:** $y$ consists entirely of leading '0's.`,
      `**Step 5:** Pumping $y$ breaks the symmetry (left side gets more '0's).`,
      `**Conclusion:** The resulting string is not a palindrome. L is not regular.`
    ]
  };
}

module.exports = {
  checkPumpingLemma
};
