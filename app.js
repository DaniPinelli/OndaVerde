
setTimeout(() => {
    const whatsapp = document.getElementById('whatsapp');

    whatsapp.style.display = 'flex';

}, 4000);


window.onload = (() => {

   /* window.addEventListener('scroll', () => {

        let navbar = document.getElementById('navbar');

        if (window.scrollY > 600) {
            navbar.classList.add("fixed-bottom");
        } else {
            navbar.classList.remove("fixed-bottom");
        }
    });*/

    window.addEventListener('scroll', () => {
        let navbar = document.getElementById('navbar');
        let shouldAddClass = window.scrollY > 600;
        if (shouldAddClass && !navbar.classList.contains('fixed-bottom')) {
            navbar.classList.add('fixed-bottom');
        } else if (!shouldAddClass && navbar.classList.contains('fixed-bottom')) {
            navbar.classList.remove('fixed-bottom');
        }
    });

    $(function () {
        var navMain = $(".navbar-collapse");

        navMain.on("click", "a:not([data-toggle])", null, function () {
            navMain.collapse('hide');
        });
    });

});







