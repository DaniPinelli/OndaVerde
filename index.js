
setTimeout(() => {
    const whatsapp = document.getElementById('whatsapp');

    whatsapp.style.display = 'flex';

}, 4000);

window.onload = (() => {

    window.addEventListener('scroll', () => {

        let arrow = document.getElementById('arrow');

        if (window.scrollY > 1000) {
            arrow.classList.remove("title-hidden");
        } else {
            arrow.classList.add("title-hidden");
        }
    });

});
