import getSettings from './components/settings';
import './popup.scss';

const settingsElement = document.getElementById('settings');

const updateViewSettings = async () => {
  const settings = await getSettings();
  Array.from(document.getElementsByTagName('input')).forEach((input) => {
    if (settings[input.name] === true) {
      input.setAttribute('checked', 'checked');
    }
  });
};

settingsElement?.addEventListener('change', (e) => {
  const { name, checked, type } = e.target as HTMLInputElement;
  if (type === 'checkbox') {
    const newSetting: { [key: string]: any; } = {};
    newSetting[name] = !!checked;
    chrome.storage.sync.set(newSetting);
  }
});

updateViewSettings();
