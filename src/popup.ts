import './popup.scss';

const settings = document.getElementById('settings');

Array.from(document.getElementsByTagName('input')).forEach((input) => {
  chrome.storage.sync.get([input.name], (value) => {
    // eslint-disable-next-line no-param-reassign
    input.checked = value[input.name];
  });
});

settings?.addEventListener('change', (e) => {
  const { name, checked, type } = e.target as HTMLInputElement;
  if (type === 'checkbox') {
    const newSetting: { [key: string]: any; } = {};
    newSetting[name] = !!checked;
    chrome.storage.sync.set(newSetting);
  }
});
