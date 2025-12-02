// src/js/app.js

// Netlify Identity Login Check and Redirect
document.addEventListener('DOMContentLoaded', () => {
    if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
            if (!user) {
                window.netlifyIdentity.on("login", () => {
                    document.location.href = "/admin/";
                });
            }
        });
    }
    // Initialize the SPA to the home page on load
    switchPage('home');
});

/**
 * Simple Single Page App (SPA) Router logic
 * Hides all page views and shows the selected one.
 * @param {string} pageId - The ID of the page view to activate.
 */
function switchPage(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => page.classList.remove('active'));

    const selectedPage = document.getElementById(pageId);
    if(selectedPage) {
        selectedPage.classList.add('active');
        window.scrollTo(0, 0); 
    }
    
    // 🔥 FIX: Global Cleanup of ALL .nav-link elements (A and SPAN tags)
    // We target all elements with the class 'nav-link' within the main nav.
    document.querySelectorAll('.main-nav .nav-link').forEach(link => link.classList.remove('active'));
    
    // 1. Find the currently clicked link (A tag)
    const activeLink = document.querySelector(`.nav-list a[data-page="${pageId}"]`);
    
    if(activeLink) {
        // 2. Activate the link itself (e.g., 'Overview')
        activeLink.classList.add('active');
        
        // 3. Handle dropdowns: If the active link is inside a dropdown, activate the parent span
        const parentSpan = activeLink.closest('.dropdown-menu')?.closest('.nav-item')?.querySelector('.nav-link');
        
        // The selector should look for the immediate parent nav-link, which is the SPAN toggle
        if (parentSpan) {
            parentSpan.classList.add('active'); // Activate the parent toggle (e.g., 'About Us')
        }
    }


    // Attempt to load dynamic content for the page
    loadContent(pageId);
}

/**
 * Toggles the mobile menu visibility.
 */
function toggleMobileMenu() {
    const nav = document.getElementById('navList');
    nav.classList.toggle('show');
}