// Memory mode specific utilities
class MemoryUtils {
  static normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  static randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  static toBlankLine(text) {
    return text
      .replace(/\r/g, "")
      .split("")
      .map(ch => {
        if (ch === "\n") return "\n";
        if (/\s/.test(ch)) return "　";
        return "＿";
      })
      .join("");
  }

  static measurePlaceholderHeight(placeholderText, targetElement) {
    const probe = document.createElement("div");
    const style = window.getComputedStyle(targetElement);
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.left = "-9999px";
    probe.style.top = "-9999px";
    probe.style.whiteSpace = "pre-wrap";
    probe.style.wordBreak = "break-word";
    probe.style.font = style.font;
    probe.style.lineHeight = style.lineHeight;
    probe.style.width = `${targetElement.clientWidth || 640}px`;
    probe.textContent = placeholderText || "";
    document.body.appendChild(probe);
    const height = Math.ceil(probe.getBoundingClientRect().height);
    probe.remove();
    return height;
  }

  static escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  static charsEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (/\s/.test(a) && /\s/.test(b)) return true;
    return a.toLowerCase() === b.toLowerCase();
  }

  static isIgnoredPunctuation(ch) {
    if (!ch) return false;
    if (/\s/.test(ch)) return false;
    return !/[a-z0-9\u4e00-\u9fa5]/i.test(ch);
  }

  static toComparableChars(text) {
    return String(text || "")
      .replace(/\r/g, "")
      .split("")
      .filter(ch => !this.isIgnoredPunctuation(ch));
  }

  static scoreAgainstExpected(user, expected) {
    const userChars = this.toComparableChars(user);
    const expectedChars = this.toComparableChars(expected);
    const maxLen = Math.max(userChars.length, expectedChars.length);
    if (maxLen === 0) return -1;
    
    let matches = 0;
    for (let i = 0; i < maxLen; i += 1) {
      const u = userChars[i] || "";
      const e = expectedChars[i] || "";
      if (this.charsEqual(u, e)) matches += 1;
    }
    return matches / maxLen;
  }

  static bestExpectedForUser(user, candidates) {
    let best = candidates[0] || "";
    let bestScore = -1;
    for (const candidate of candidates) {
      const score = this.scoreAgainstExpected(user, candidate);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  }

  static stripLeadingPromptText(userText, promptText) {
    const user = String(userText || "");
    const prompt = String(promptText || "");
    if (!prompt) return user;
    if (user.startsWith(prompt)) return user.slice(prompt.length);
    return user;
  }

  static renderComparedInput(user, expected) {
    const rawUser = String(user || "").replace(/\r/g, "");
    const rawExpected = String(expected || "").replace(/\r/g, "");
    const userChars = rawUser.split("").filter(ch => !this.isIgnoredPunctuation(ch));
    const expectedChars = rawExpected.split("").filter(ch => !this.isIgnoredPunctuation(ch));
    const m = userChars.length;
    const n = expectedChars.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i -= 1) {
      for (let j = n - 1; j >= 0; j -= 1) {
        if (this.charsEqual(userChars[i], expectedChars[j])) {
          dp[i][j] = dp[i + 1][j + 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    function renderChar(ch, cls) {
      if (ch === "\n") return "<br>";
      if (cls === "char-neutral") return MemoryUtils.escapeHtml(ch);
      return `<span class="${cls}">${MemoryUtils.escapeHtml(ch)}</span>`;
    }

    const ops = [];
    let i = 0;
    let j = 0;

    while (i < m && j < n) {
      if (this.charsEqual(userChars[i], expectedChars[j])) {
        ops.push({ type: "ok", userChar: userChars[i], expectedChar: expectedChars[j] });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: "extra", userChar: userChars[i] });
        i += 1;
      } else {
        ops.push({ type: "missing", expectedChar: expectedChars[j] });
        j += 1;
      }
    }

    while (i < m) {
      ops.push({ type: "extra", userChar: userChars[i] });
      i += 1;
    }
    while (j < n) {
      ops.push({ type: "missing", expectedChar: expectedChars[j] });
      j += 1;
    }

    let html = "";
    let opIndex = 0;
    for (const expectedChar of rawExpected.split("")) {
      if (this.isIgnoredPunctuation(expectedChar)) {
        html += renderChar(expectedChar, "char-neutral");
        continue;
      }

      while (opIndex < ops.length && ops[opIndex].type === "extra") {
        html += renderChar(ops[opIndex].userChar, "char-extra");
        opIndex += 1;
      }

      const op = ops[opIndex];
      if (!op) {
        html += renderChar(expectedChar, "char-missing");
        continue;
      }

      if (op.type === "ok") {
        html += renderChar(op.userChar, "char-ok");
        opIndex += 1;
      } else if (op.type === "missing") {
        html += renderChar(op.expectedChar, "char-missing");
        opIndex += 1;
      } else {
        html += renderChar(expectedChar, "char-missing");
      }
    }

    while (opIndex < ops.length) {
      const op = ops[opIndex];
      if (op.type === "extra") {
        html += renderChar(op.userChar, "char-extra");
      }
      opIndex += 1;
    }

    return html;
  }

  // Caret position utilities
  static getCaretOffsetWithin(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer)) return 0;
    const preRange = range.cloneRange();
    preRange.selectNodeContents(element);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  }

  static setCaretOffsetWithin(element, offset) {
    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let remaining = Math.max(0, offset);
    let node = walker.nextNode();
    let targetNode = null;
    let targetOffset = 0;

    while (node) {
      const len = node.textContent.length;
      if (remaining <= len) {
        targetNode = node;
        targetOffset = remaining;
        break;
      }
      remaining -= len;
      node = walker.nextNode();
    }

    if (!targetNode) {
      targetNode = element;
      targetOffset = element.childNodes.length;
    }

    const range = document.createRange();
    try {
      range.setStart(targetNode, targetOffset);
    } catch {
      range.selectNodeContents(element);
      range.collapse(false);
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Export for use in other modules
window.MemoryUtils = MemoryUtils;