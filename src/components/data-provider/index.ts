export interface WordEntries {
  [key: string]: {
    kana: string
    romaji?: string
    kanji?: string
  }
}

const FILES = ['genki-1', 'genki-2', 'genki-3', 'genki-4', 'genki-5', 'genki-6',
  'genki-7', 'genki-8', 'genki-9', 'genki-10', 'genki-11', 'genki-12'];

const getSettings = (): Promise<{ [key: string]: any }> => new Promise(
  (resolve) => {
    chrome.storage.sync.get(FILES, resolve);
  },
);

const getData = async () : Promise<WordEntries> => {
  let data = {};
  const settings = await getSettings();
  const requestedFiles = FILES.filter((file) => settings[file]);

  const appendData = async (file: string) => {
    const response = await fetch(chrome.runtime.getURL(`${file}.json`));
    const newData = await response.json();
    data = { ...data, ...newData };
  };

  await Promise.all(requestedFiles.map((file) => appendData(file)));

  return data;
};

export default getData;
