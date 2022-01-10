import './tooltip.scss';

const TOOLTIP_ELEMENT_NAME = 'DIV';
const CLASS_MAIN = 'oumu-tooltip';
const CLASS_IS_VISIBLE = 'is-visible';
const CLASS_WORD = 'oumu-word';

const tooltipContainer = document.createElement(TOOLTIP_ELEMENT_NAME);
const tooltipWord = document.createElement(TOOLTIP_ELEMENT_NAME);
const tooltipDescription = document.createElement(TOOLTIP_ELEMENT_NAME);

// A single DOM element is created and reused to privde tooltip functionality
const setupContainer = () => {
  tooltipContainer.classList.add(CLASS_MAIN);
  tooltipWord.classList.add(`${CLASS_MAIN}-word`);
  tooltipDescription.classList.add(`${CLASS_MAIN}-description`);
  tooltipContainer.append(tooltipWord);
  tooltipContainer.append(tooltipDescription);
  document.body.append(tooltipContainer);
};

const showTooltip = (word: string, description: string, element: HTMLElement) => {
  tooltipWord.innerText = word;
  tooltipDescription.innerText = description;
  tooltipContainer.classList.add(CLASS_IS_VISIBLE);
  const rect = element.getBoundingClientRect();
  const selfRect = tooltipContainer.getBoundingClientRect();
  tooltipContainer.style.top = `${rect.top - selfRect.height}px`;
  tooltipContainer.style.left = `${rect.left}px`;
};

const hideTooltip = () => {
  tooltipContainer.classList.remove(CLASS_IS_VISIBLE);
};

const onMouseOver = (event: Event) => {
  if (event && event.target) {
    const target = event.target as HTMLElement;
    if (target.classList.contains(CLASS_WORD)) {
      const {
        english, kanji, kana, romaji,
      } = target.dataset;
      showTooltip(
        english || '',
        `${kanji ? kana : ''}${romaji ? ` (${romaji})` : ''}`,
        target,
      );
    } else {
      hideTooltip();
    }
  }
};

const setupEventListeners = () => {
  document.body.addEventListener('mouseover', onMouseOver);
};

const installTooltip = () => {
  setupContainer();
  setupEventListeners();
};

export default installTooltip;
