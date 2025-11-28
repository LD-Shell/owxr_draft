
// KEN BURNS HERO SLIDER LOGIC
let slideIndex = 0;
let sliderInterval;
let slides = [];
let dots = [];

function showSlide(n) {
    if (!slides.length) return;
    
    // Wrap around logic
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    // Reset classes
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Set Active
    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
}

function resetTimer() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 6000); // 6 Seconds
}

// Setup Event Listeners
function initSlider() {
    slides = document.querySelectorAll('.hero-slide');
    dots = document.querySelectorAll('.indicator');
    
    if(slides.length === 0) return; // Exit if not on home page

    // Arrow Buttons
    document.getElementById('nextBtn')?.addEventListener('click', () => {
        slideIndex++;
        showSlide(slideIndex);
        resetTimer();
    });

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        slideIndex--;
        showSlide(slideIndex);
        resetTimer();
    });

    // Dots
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            slideIndex = idx;
            showSlide(slideIndex);
            resetTimer();
        });
    });

    // Start
    showSlide(0);
    resetTimer();
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', initSlider);
