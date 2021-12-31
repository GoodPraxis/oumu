trs = document.querySelectorAll('tr');
c = ''
trs.forEach((elem) => {
  const [kana, kanji, romaji, english] = [...elem.children];
  c += `"${english.innerText}": {
    "kana": "${kana.innerText}",
    "romaji": "${romaji.innerText}"
    ${kanji.innerText ? `,"kanji" : "${kanji.innerText}"` : ''}
  },`
});
