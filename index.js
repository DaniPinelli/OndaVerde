
setTimeout(() => {
    const whatsapp = document.getElementById('whatsapp');

    whatsapp.style.display = 'flex';

}, 4000);


window.onload = (() => {

    window.addEventListener('scroll', () => {

        let navbar = document.getElementById('navbar');

        if (window.scrollY > 800) {
            navbar.classList.add("fixed-bottom");
        } else {
            navbar.classList.remove("fixed-bottom");
        }
    });

});