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

    // 🔥 FIX: Initialize SPA based on URL hash or default to 'home'
    // Read the hash (e.g., '#team') and strip the '#'
    const initialPageId = window.location.hash.substring(1) || 'home'; 
    switchPage(initialPageId);
    
    // Add event listener to handle browser back/forward buttons
    window.addEventListener('hashchange', () => {
        const hashPageId = window.location.hash.substring(1);
        if (hashPageId) {
            switchPage(hashPageId, false); // Switch without updating history again
        }
    });
});

/**
 * Simple Single Page App (SPA) Router logic
 * Hides all page views and shows the selected one.
 * @param {string} pageId - The ID of the page view to activate.
 * @param {boolean} updateHistory - Whether to update the URL hash (default true).
 */
function switchPage(pageId, updateHistory = true) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => page.classList.remove('active'));

    const selectedPage = document.getElementById(pageId);
    if(selectedPage) {
        selectedPage.classList.add('active');
        window.scrollTo(0, 0); 
    } else {
        // Handle undefined page (e.g., if user types a wrong hash in URL)
        pageId = 'home';
        document.getElementById('home').classList.add('active');
    }

    // Update URL hash without causing a page reload, so the state persists on refresh
    if (updateHistory) {
        window.location.hash = pageId;
    }
    
    // Global Cleanup of ALL .nav-link elements (A and SPAN tags)
    document.querySelectorAll('.main-nav .nav-link').forEach(link => link.classList.remove('active'));
    
    // 1. Find the currently clicked link (A tag)
    const activeLink = document.querySelector(`.nav-list a[data-page="${pageId}"]`);
    
    if(activeLink) {
        // 2. Activate the link itself (e.g., 'Overview')
        activeLink.classList.add('active');
        
        // 3. Handle dropdowns: If the active link is inside a dropdown, activate the parent span
        const parentSpan = activeLink.closest('.dropdown-menu')?.closest('.nav-item')?.querySelector('.nav-link');
        
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