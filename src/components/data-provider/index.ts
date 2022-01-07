export interface WordEntries {
  [key: string]: {
    kana: string
    romaji?: string
    kanji?: string
  }
}

const FILES = {
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

const getSettings = (): Promise<{ [key: string]: any }> => new Promise(
  (resolve) => {
    chrome.storage.sync.get(FILES, resolve);
  },
);

const getData = async () : Promise<WordEntries> => {
  let data = {};
  const settings = await getSettings();
  const requestedFiles = Object.keys(FILES).filter((file) => settings[file]);

  const appendData = async (file: string) => {
    const response = await fetch(chrome.runtime.getURL(`${file}.json`));
    const newData = await response.json();
    data = { ...data, ...newData };
  };

  await Promise.all(requestedFiles.map((file) => appendData(file)));

  return data;
};

export default getData;
