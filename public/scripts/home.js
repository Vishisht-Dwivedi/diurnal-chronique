console.log('connected');
// For the Heading
let fontChangeTxt = document.querySelector('#hlfontchange').innerText;
const changedText = [];
for (let e of fontChangeTxt) {
    const arr = `'!@#$%^&*()_,-[]:.?"`;
    if (arr.indexOf(e) !== -1) {
        changedText.push(`<span style='font-family:oldnewspaper;'>${e}</span>`);
    } else {
        changedText.push(e);
    }
};
document.querySelector('#hlfontchange').innerHTML = changedText.join('');