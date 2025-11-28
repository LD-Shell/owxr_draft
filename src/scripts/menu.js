
// MOBILE MENU TOGGLE
const mobileToggle = document.getElementById('mobileToggle');
const navList = document.getElementById('navList');

if (mobileToggle && navList) {
    mobileToggle.addEventListener('click', () => {
        navList.classList.toggle('show');
    });
}

// NETLIFY IDENTITY REDIRECT (For Admin Access)
if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
        if (!user) {
            window.netlifyIdentity.on("login", () => {
                document.location.href = "/admin/";
            });
        }
    });
}
