// Loader 
$("#loader-container").addClass('visible');

$("body").css("overflow", "hidden");

$(window).on('load', function() {
    $("#loader-container").removeClass('visible');
    $("body").css("overflow", "auto");
});

// Navbar dynamic
let lastScrollTop = 0;

$(window).scroll(function() {
    const currentScrollTop = $(this).scrollTop();
    const navbar = $(".navbar");

    if (currentScrollTop > lastScrollTop) {
        navbar.removeClass("slide-down").addClass("slide-up");
    } else {
        navbar.removeClass("slide-up").addClass("slide-down");
    }

    lastScrollTop = currentScrollTop;
});

// Show More
$('#toggle-skills').on('click', function(e) {
    e.preventDefault(); 
    $('.more-skills').toggleClass('show'); 
    $('.mobile-skills').toggleClass('show'); 
    $('#toggle-skills i').toggleClass('bi-chevron-down bi-chevron-up'); 
});

// Skills SLider
let currentSlide = 0;
const totalSlides = document.querySelectorAll('.slide').length;

function slideSkills(direction) {
    if (direction === 'next') {
        currentSlide = (currentSlide + 1) % totalSlides;
    } else {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }

    const slideWidth = document.querySelector('.slide').offsetWidth;
    const translateX = -currentSlide * slideWidth;

    document.querySelector('.slider').style.transform = `translateX(${translateX}px)`;
}

// Auto Typed Text
var typed = new Typed(".auto-type", {
    strings: ["Web Developer", "Determined learner", "Software Engineer", "Loving You ❤"],
    typeSpeed: 100,
    backSpeed: 100,
    loop: true
});

// Tabs
const tabs = document.querySelectorAll('.tabs');
const tabButtons = document.querySelectorAll('.tab-button');

function showTab(index) {
    tabs.forEach((tab, i) => {
        tab.classList.remove('active-tab');
        if (i === index) {
            tab.classList.add('active-tab');
        }
    });
}

tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        showTab(index);
    });
});

// CV Button
document.addEventListener('DOMContentLoaded', function () {
    const btnCv = document.getElementById('btn-cv');

    btnCv.addEventListener('click', function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'CV is not available 😢',
            customClass: {
                popup: 'dark-sweet',
                header: 'dark-sweet',
                title: 'dark-sweet',
                content: 'dark-sweet',
                actions: 'dark-sweet',
                confirmButton: 'dark-sweet',
            },
            buttonStyling: false,
        });
    });
});

// Calculate Age
function calculateAge(birthDate) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();

    if (
        today.getMonth() < birthDateObj.getMonth() ||
        (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())
    ) {
        age--;
    }

    return age;
}

const birthDate = '2005-07-09'; // yyyy-mm-dd format
const ageElement = document.getElementById('age');
const age = calculateAge(birthDate);
ageElement.textContent = age;

const fadeLeftElements = document.querySelectorAll('.fade-left');
const fadeRightElements = document.querySelectorAll('.fade-right');
const fadeUpElements = document.querySelectorAll('.fade-up');
const fadeDownElements = document.querySelectorAll('.fade-down');

// Fade Animations
const fadeLeftObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-left-show');
        } else {
            entry.target.classList.remove('fade-left-show');
        }
    });
}, { threshold: 0.2 });

const fadeRightObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-right-show');
        } else {
            entry.target.classList.remove('fade-right-show');
        }
    });
}, { threshold: 0.2 });

const fadeUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-show');
        } else {
            entry.target.classList.remove('fade-up-show');
        }
    });
}, { threshold: 0.2 });

const fadeDownObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-down-show');
        } else {
            entry.target.classList.remove('fade-down-show');
        }
    });
}, { threshold: 0.2 });

fadeLeftElements.forEach(element => {
    fadeLeftObserver.observe(element);
});

fadeRightElements.forEach(element => {
    fadeRightObserver.observe(element);
});

fadeUpElements.forEach(element => {
    fadeUpObserver.observe(element);
});

fadeDownElements.forEach(element => {
    fadeDownObserver.observe(element);
});
