import './main.scss';
import installTooltip from './components/tooltip';
import getData, { WordEntries } from './components/data-provider';

const MUTATION_CONFIG = { childList: true, subtree: true };
const UOMO_ELEMENT = 'SPAN';
const UOMO_CLASS = 'oumu-word';
const DEBOUNCE_TIME = 100;
const ELEMENT_SELECTOR = 'p, span, a, h1, h2, h3, h4, h5, li, .thumbcaption';
const NODE_BLACKLIST = '.DraftEditor-root, [contenteditable="true"]';

interface processingResult {
  isWithReplacements: boolean
  fragment: DocumentFragment
}

let WORDS : WordEntries = {};

const prepareTextFragmentFromTextNode = (node: Node): processingResult => {
  if (!node.textContent) {
    return {
      isWithReplacements: false,
      fragment: document.createDocumentFragment(),
    };
  }
  const pieces = node.textContent.split(' ');
  const fragment = document.createDocumentFragment();

  let textBuffer = '';

  let isWithReplacements = false;

  pieces.forEach((piece, index) => {
    const letters = piece.match(/[a-zA-Z]+/);
    if (letters && letters[0].toLowerCase() in WORDS) {
      isWithReplacements = true;
      if (textBuffer) {
        fragment.append(textBuffer);
        textBuffer = '';
      }
      const word = letters[0].toLowerCase();
      const wordIndex = letters.index || 0;
      if (wordIndex > 0) {
        fragment.append(` ${piece.slice(0, wordIndex)}`);
      }
      const span = document.createElement(UOMO_ELEMENT);
      const { kanji, kana, romaji } = WORDS[word];
      span.dataset.english = word;
      span.dataset.kana = kana;
      if (kanji) {
        span.dataset.kanji = kanji;
      }
      if (romaji) {
        span.dataset.romaji = romaji;
      }
      if (wordIndex === 0) {
        fragment.append(' ');
      }
      const phrase = kanji || kana;
      span.innerText = phrase;
      span.dataset.oumuProcessed = '';
      span.classList.add(UOMO_CLASS);
      fragment.append(span);
      if (piece.length > word.length + wordIndex) {
        fragment.append(piece.slice(wordIndex + word.length));
      }
    } else {
      textBuffer += `${index > 0 ? ' ' : ''}${piece}`;
    }
  });
  if (textBuffer) {
    fragment.append(textBuffer);
  }
  return { isWithReplacements, fragment };
};

const getIsEnabled = () => new Promise((resolve) => {
  chrome.storage.sync.get({ enabled: true }, (settings) => resolve(settings.enabled));
});

window.addEventListener('load', async () => {
  const enabled = await getIsEnabled();
  if (enabled === false) {
    return;
  }

  installTooltip();

  WORDS = await getData();

  let debounceTimeout: number;
  let observer: IntersectionObserver;

  let nodeBlacklist : HTMLElement[] = [];

  const updateBlacklist = () => {
    nodeBlacklist = Array.from(document.querySelectorAll(NODE_BLACKLIST));
  };

  updateBlacklist();

  const updateObservedElements = () => {
    [...document.querySelectorAll(ELEMENT_SELECTOR)]
      .filter((elem) => elem instanceof HTMLElement
          && elem.dataset.oumuProcessed !== '')
      .forEach((p) => observer.observe(p));
  };

  const mutObserver = new MutationObserver(() => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      updateObservedElements();
      updateBlacklist();
    }, DEBOUNCE_TIME);
  });

  observer = new IntersectionObserver((entries, intersectionObserver) => {
    mutObserver.disconnect();
    entries.filter(({ isIntersecting }) => isIntersecting).forEach(({ target }) => {
      if (target instanceof HTMLElement) {
        // If target is contained by a blacklisted element, return
        if (nodeBlacklist.some((node) => node.contains(target))) {
          return;
        }
        let textNodesUpdated = false;

        intersectionObserver.unobserve(target);

        const fragment = document.createDocumentFragment();
        // eslint-disable-next-line no-undef
        const nodeArray: (DocumentFragment | ChildNode)[] = [];

        [...target.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const {
              fragment: newFragment,
              isWithReplacements,
            } = prepareTextFragmentFromTextNode(node);
            if (isWithReplacements) {
              textNodesUpdated = true;
            }
            nodeArray.push(newFragment);
          } else {
            nodeArray.push(node);
          }
        });

        // eslint-disable-next-line no-param-reassign
        target.dataset.oumuProcessed = '';

        // Only replace children if necessary so we don't break much
        if (textNodesUpdated) {
          nodeArray.forEach((node) => fragment.append(node));
          // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/985
          (target as any).replaceChildren(fragment);
        }
      }
    });
    mutObserver.observe(document.body, MUTATION_CONFIG);
  }, { threshold: 0.1 });

  mutObserver.observe(document.body, MUTATION_CONFIG);

  document.querySelectorAll(ELEMENT_SELECTOR).forEach((p) => observer.observe(p));
});
