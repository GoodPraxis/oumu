export const DEFAULT_SETTINGS = {
  enabled: true,
  'genki-1': true,
  'genki-2': true,
  'genki-3': true,
  'genki-4': true,
  'genki-5': false,
  'genki-6': false,
  'genki-7': false,
  'genki-8': false,
  'genki-9': false,
  'genki-10': false,
  'genki-11': false,
  'genki-12': false,
};

const getSettings = (): Promise<{ [key: string]: boolean }> => new Promise(
  (resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, resolve);
  },
);

export default getSettings;
