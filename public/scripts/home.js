console.log('connected');
// For the Heading
let fontChangeTxt = document.querySelector('#hlfontchange').innerText;
const changedText = [];
for (let e of fontChangeTxt) {
    const arr = `'!@#$%^&*()_,-[]:.?;"`;
    if (arr.indexOf(e) !== -1) {
        changedText.push(`<span style='font-family:oldnewspaper;'>${e}</span>`);
    } else {
        changedText.push(e);
    }
};
document.querySelector('#hlfontchange').innerHTML = changedText.join('');

//scroll buttons
const scrollDown = document.querySelectorAll('.sd');
scrollDown.forEach(element => {
    element.addEventListener('click', () => {
        element.parentElement.scrollBy(0, 200);
    })
});
const scrollUp = document.querySelectorAll('.su');
scrollUp.forEach(element => {
    element.addEventListener('click', () => {
        element.parentElement.scrollBy(0, -200);
    })
});
const heroLeft = document.querySelectorAll('.scrollable');

heroLeft.forEach(element => {
    element.addEventListener('scroll', () => {
        const su = element.querySelector('.su');
        const sd = element.querySelector('.sd');
        const div = element;
        if (div.scrollTop > 50) {
            su.style.display = 'block';
            if ((div.scrollTop - (div.scrollHeight - div.offsetHeight)) > 0) {
                sd.style.display = 'none';
            } else {
                sd.style.display = 'block';
            }
        } else if (div.scrollTop === 0) {
            su.style.display = 'none';
        }
    })
}); 
