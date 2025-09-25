//import { convertPLNToEUR } from "./converter.js";
/*
// Recursive async walk
async function walk(node) {
  // Skip already processed nodes
  if (node._converted) return;

  switch (node.nodeType) {
    case 1: // Element
      if (
        node.tagName === "INPUT" ||
        node.TAGNAME === "TEXTAREA" ||
        node.isContentEditable
      ) return;

      for (let child of Array.from(node.childNodes)) {
        await walk(child);
      }
      break;

    case 3: // Text node
      try {
        const convertedText = await convertPLNToEUR(node.nodeValue);

        if (convertedText === node.nodeValue) return; // nothing changed

        // Create fragment with highlights
        const fragment = document.createDocumentFragment();
        const parts = convertedText.split(/(\(~[\d.,]+\sEUR\))/g);

        parts.forEach(part => {
          if (/^\(~[\d.,]+\sEUR\)$/.test(part)) {
            const span = document.createElement("span");
            span.className = "converted-eur";
            span.textContent = part;
            span._converted = true; // mark processed
            fragment.appendChild(span);
          } else {
            const textNode = document.createTextNode(part);
            textNode._converted = true; // mark processed
            fragment.appendChild(textNode);
          }
        });

        node.replaceWith(fragment);
      } catch (err) {
        console.error("Failed to convert text:", err);
      }
      break;
  }
}

// Initial walk for already existing nodes
walk(document.body);

// Observe the body for dynamically added content
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      walk(node);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
*/



// Helper: parse PLN amounts in text
function findPLNAmounts(text) {
  const regex = /(\d{1,3}(?:[ \u00A0]?\d{3})*(?:[.,]\d+)?)(?:\s*(PLN|zł))/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ full: match[0], amount: match[1], index: match.index });
  }
  return matches;
}

// Overlay EUR next to a text node
async function overlayEUR(node) {
  const parent = node.parentElement;
  if (!parent || parent.dataset.converted) return;

  const text = node.textContent || node.nodeValue;
  const matches = findPLNAmounts(text);
  if (matches.length === 0) return;

  let lastIndex = 0;
  const frag = document.createDocumentFragment();

  for (const m of matches) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    frag.appendChild(document.createTextNode(m.full));

    const num = parseFloat(m.amount.replace(/[ \u00A0.]/g, '').replace(',', '.'));
    if (!isNaN(num)) {
      const rate = await getExchangeRate();
      const eur = (num * rate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const span = document.createElement('span');
      span.className = 'converted-eur-overlay';
      span.textContent = `(~${eur} EUR)`;
      frag.appendChild(span);
    }

    lastIndex = m.index + m.full.length;
  }

  frag.appendChild(document.createTextNode(text.slice(lastIndex)));

  node.replaceWith(frag);
  parent.dataset.converted = "true"; // mark parent as processed
}

// Walk all text nodes under a root
function walkTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    overlayEUR(node);
  }
}

// Debounced function for dynamic content
const processBody = debounce(() => walkTextNodes(document.body), 200);
processBody();

// Observe dynamic content safely
const observer = new MutationObserver(processBody);
observer.observe(document.body, { childList: true, subtree: true });

// Debounce helper
function debounce(fn, delay = 200) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}