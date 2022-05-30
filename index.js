
setTimeout(() => {
    const whatsapp = document.getElementById('whatsapp');

    whatsapp.style.display = 'flex';

}, 4000);


window.onload = (() => {

    window.addEventListener('scroll', () => {

        let navbar = document.getElementById('navbar');

        if (window.scrollY > 600) {
            navbar.classList.add("fixed-bottom");
        } else {
            navbar.classList.remove("fixed-bottom");
        }
    });

    $(function () {
        var navMain = $(".navbar-collapse"); // avoid dependency on #id
        // "a:not([data-toggle])" - to avoid issues caused
        // when you have dropdown inside navbar
        navMain.on("click", "a:not([data-toggle])", null, function () {
            navMain.collapse('hide');
        });
    });

});





