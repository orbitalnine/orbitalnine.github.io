/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// Native smooth scrolling for in-page navigation.
document.querySelectorAll('a.page-scroll').forEach(function (link) {
    link.addEventListener('click', function (event) {
        var selector = link.getAttribute('href');

        if (!selector || selector.charAt(0) !== '#') {
            return;
        }

        var target = document.querySelector(selector);
        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});
