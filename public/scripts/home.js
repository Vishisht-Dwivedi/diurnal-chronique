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
        element.parentElement.scrollBy(0, 100);
    })
});
const scrollUp = document.querySelectorAll('.su');
scrollUp.forEach(element => {
    element.addEventListener('click', () => {
        element.parentElement.scrollBy(0, -200);
    })
});
const scrollDivs = document.querySelectorAll('.scrollable');

scrollDivs.forEach(element => {
    element.addEventListener('scroll', () => {
        const su = element.querySelector('.su');
        const sd = element.querySelector('.sd');
        const div = element;
        console.log(div.scrollHeight-(div.clientHeight+div.scrollTop));
        if (div.scrollTop > 0) {
            su.style.display = 'block';
            if (((div.scrollHeight-(div.clientHeight+div.scrollTop)) <=15)) {
                sd.style.display = 'none';
            } else {
                sd.style.display = 'block';
            }
        } else if (div.scrollTop === 0) {
            su.style.display = 'none';
        } 
    })
}); 
//On load events
window.addEventListener("load",()=>{
    const artPiece = document.querySelector(".art-piece img");
    const artDetails = document.querySelector(".art-details");
    artDetails.style.height = (artPiece.offsetHeight+20)+"px";

    scrollDivs.forEach(element=>{
        const sd = element.children[element.children.length-1];
        if(element.offsetHeight >= element.scrollHeight){
            sd.style.display = 'none';
        }
    });
});
