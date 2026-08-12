/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// Dependency-free smooth scrolling for in-page navigation.
function scrollToTarget(target) {
    var startY = window.pageYOffset || document.documentElement.scrollTop;
    var targetY = startY + target.getBoundingClientRect().top;
    var duration = 1000;
    var startTime;

    function easeInOutCubic(progress) {
        return progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }

    function animate(timestamp) {
        startTime = startTime || timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);

        window.scrollTo(0, startY + (targetY - startY) * easeInOutCubic(progress));

        if (progress < 1) {
            window.requestAnimationFrame(animate);
        }
    }

    window.requestAnimationFrame(animate);
}

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
        scrollToTarget(target);
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
