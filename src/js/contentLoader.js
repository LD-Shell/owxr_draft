// src/js/contentLoader.js

// Initialize the Markdown converter
const converter = new showdown.Converter();
converter.setFlavor('github');

/**
 * Utility to safely fetch JSON data.
 */
async function fetchData(fileName) {
    try {
        const response = await fetch(`content/${fileName}.json`); 
        if (!response.ok) {
            console.error(`Error loading content for ${fileName}. Status: ${response.status}`);
            return (fileName === 'globals' || fileName === 'pages') ? {} : [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : (fileName === 'globals' || fileName === 'pages') ? data : [];
    } catch (error) {
        console.error(`Failed to fetch ${fileName} data:`, error);
        return (fileName === 'globals' || fileName === 'pages') ? {} : [];
    }
}

// =======================================================
// RENDERERS
// =======================================================

/**
 * Renders the Home page sections.
 */
async function loadHomePageContent() {
    const pageData = await fetchData('pages');
    const home = pageData.home || {};
    
    // Hero Content
    const heroContent = document.getElementById('hero-content');
    if (heroContent && home.hero_title) {
        heroContent.innerHTML = `
            <h2>${home.hero_title}</h2>
            <p>${home.hero_text}</p>
            <button class="btn" style="background: white; color: var(--uh-red); border-color: white;" onclick="switchPage('research')">Explore Our Research</button>
        `;
    }

    // Hero Slides
    const sliderContainer = document.getElementById('hero-slider-container');
    const indicatorContainer = document.getElementById('slider-indicators');
    if (sliderContainer && indicatorContainer && home.slides) {
        sliderContainer.innerHTML = home.slides.map((slide, index) => `
            <div class="hero-slide ${index === 0 ? 'active' : ''}">
                <img src="${slide.image}" alt="${slide.alt}" loading="lazy">
            </div>
        `).join('');

        indicatorContainer.innerHTML = home.slides.map((slide, index) => `
            <div class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
        `).join('');
        
        if (typeof initializeSlider === 'function') {
            initializeSlider();
        }
    }

    // Director's Message
    const directorSection = document.getElementById('director-message-section');
    if (directorSection && home.director) {
        directorSection.innerHTML = `
            <div>
                <img src="${home.director.photo}" alt="${home.director.name}" class="director-img" loading="lazy">
            </div>
            <div>
                <h3 class="text-uh-red">Director's Message</h3>
                <p class="mission-text" style="margin: 20px 0;">${home.director.message}</p>
                <img src="${home.director.signature}" alt="Signature" style="height: 50px; opacity: 0.7;" loading="lazy">
                <p><strong>${home.director.name}</strong><br>${home.director.role}</p>
            </div>
        `;
    }

    // Upcoming Events Preview
    const newsData = await fetchData('news');
    const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const eventPreview = document.getElementById('event-preview-grid');
    if (eventPreview) {
        const previewItems = sortedNews.slice(0, 3);
        eventPreview.innerHTML = previewItems.map(item => `
            <div class="aim-card">
                <div style="background: var(--uh-red); color: white; display: inline-block; padding: 5px 15px; font-weight: bold; margin-bottom: 10px;">${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}).toUpperCase()}</div>
                <h4>${item.title}</h4>
                <p>${item.preview}</p>
                <a href="#" onclick="switchPage('news')">View All</a>
            </div>
        `).join('');
    }
}

/**
 * Renders Impact Stats.
 */
async function loadImpactStats() {
    const globals = await fetchData('globals'); 
    const stats = globals.impact_stats || [];
    const container = document.getElementById('impact-stats-grid');
    
    if (container) {
        if (stats.length === 0) {
            container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1;">Error: Could not load impact metrics from globals.json.</p>`;
            return;
        }

        container.innerHTML = stats.map(stat => `
            <div>
                <h2 style="font-size: 3rem; color: ${stat.color || '#F4D03F'};">${stat.value}</h2>
                <p>${stat.label}</p>
            </div>
        `).join('');
    }
}


/**
 * Renders Team Grid into PIs and Postdocs/Students buckets.
 */
async function loadTeamContent() {
    const teamData = await fetchData('team');
    
    // Filter into two groups: PIs vs Everyone Else
    const pis = teamData.filter(m => m.is_pi);
    const groupMembers = teamData.filter(m => !m.is_pi);

    const renderMembers = (members, isPI) => members.map(member => `
        <div class="profile-card">
            ${member.image ? `<div class="profile-img-container"><img src="${member.image}" alt="${member.name}" class="profile-img" loading="lazy"></div>` : ''}
            <div class="profile-info">
                <h4 class="profile-name">${member.name}</h4>
                
                ${isPI && member.title_detail ? 
                    `<div class="profile-role" style="font-weight: 700;">${member.role}</div>
                    <p style="font-size: 0.9rem; color: var(--uh-slate); margin-top: 5px; margin-bottom: 10px; line-height: 1.3;">
                        ${member.title_detail.replace(/\n/g, '<br>')}
                    </p>` : ''
                }
                
                ${!isPI ? 
                    `<div class="profile-role" style="font-weight: 700; margin-bottom: 0;">${member.role}</div>
                    <p style="font-size: 0.8rem; color: var(--uh-slate); margin-top: 5px; line-height: 1.3;">
                        ${member.department || ''}<br>
                        ${member.university || ''}
                    </p>` : ''
                }

                <p style="font-size: ${isPI ? '0.9rem' : '0.85rem'}; margin-top: ${isPI ? '10px' : '15px'};">
                    ${member.bio}
                </p>
                
                ${member.tags && member.tags.length > 0 ? `<div class="profile-tags">${member.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                
                ${member.email || member.scholar ? `
                    <div style="margin-top: 15px;">
                        ${member.email ? `<a href="mailto:${member.email}"><i class="fas fa-envelope text-uh-red"></i></a>` : ''}  
                        ${member.scholar ? `<a href="${member.scholar}" target="_blank" style="margin-left: 10px;"><i class="fab fa-google-scholar text-uh-red"></i></a>` : ''}
                    </div>` : ''}
            </div>
        </div>
    `).join('');

    // Render PIs
    const piGrid = document.getElementById('team-pis');
    if (piGrid) { piGrid.innerHTML = renderMembers(pis, true); }

    // Render Postdocs & Students
    const groupGrid = document.getElementById('team-group');
    if (groupGrid) { groupGrid.innerHTML = renderMembers(groupMembers, false); }
}

/**
 * Renders Publications and Patents.
 */
/**
 * Renders Publications, Patents, AND Presentations.
 */
async function loadOutputsContent() {
    // 1. Load Publications
    const publications = await fetchData('publications');
    const globals = await fetchData('globals'); 

    const pubList = document.getElementById('publications-list');
    if (pubList) {
        const sortedPublications = publications.sort((a, b) => new Date(b.date) - new Date(a.date));
        pubList.innerHTML = sortedPublications.map(pub => `
            <div class="pub-item">
                <div class="pub-year">${pub.year}</div>
                <div class="pub-details">
                    <h4>${pub.title} ${pub.featured ? `<span class="tag" style="background: var(--uh-red); color: white;">Featured</span>` : ''}</h4>
                    <p class="pub-journal">${pub.journal} 
                        <a href="${pub.link || '#'}" target="_blank" class="text-uh-red">VIEW</a>
                    </p>
                    <p style="font-size: 0.85rem;">Authors: ${pub.authors}</p>
                </div>
            </div>
        `).join('');
    }
    
    // 2. Load Patents
    const patentList = document.getElementById('patents-list');
    if (patentList && globals.patents) {
         patentList.innerHTML = globals.patents.map(patent => {
             const parts = patent.split(':');
             return `<li style="margin-bottom: 10px;"><strong>${parts[0]}</strong>: ${parts.slice(1).join(':').trim()}</li>`;
         }).join('');
    }

    // 3. Load Conference Presentations
    const presentations = await fetchData('presentations'); 
    const presList = document.getElementById('presentations-list');

    if (presList) {
        if (presentations.length > 0) {
            // Sort by date
            const sortedPres = presentations.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Reusing 'pub-item' class for consistent styling
            presList.innerHTML = sortedPres.map(item => `
                <div class="pub-item">
                    <div class="pub-year">${new Date(item.date).getFullYear()}</div>
                    <div class="pub-details">
                        <h4>${item.title}</h4>
                        <p class="pub-journal" style="color: var(--uh-slate);">
                            <strong>${item.conference}</strong> | ${item.location}
                        </p>
                        <p style="font-size: 0.85rem; margin-top: 4px;">Presenter: ${item.presenter || 'Group Member'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            presList.innerHTML = `<p>No presentations currently listed.</p>`;
        }
    }
}

/**
 * Renders Advisory Board.
 */
async function loadAdvisoryContent() {
    const globals = await fetchData('globals'); 
    const board = globals.advisory_board || [];
    const container = document.getElementById('advisory-board-grid');

    if (container) {
        if (board.length === 0) {
            container.innerHTML = `<p style="text-align: center; grid-column: 1 / -1;">Advisory board list is currently empty.</p>`;
            return;
        }
        
        container.innerHTML = board.map(member => `
            <div class="profile-card text-center">
                <div class="profile-img-container">
                    <img src="${member.image}" alt="${member.name}" class="profile-img" loading="lazy">
                </div>
                <div class="profile-info">
                    <h4 class="profile-name">${member.name}</h4>
                    <p class="profile-role" style="font-weight: 400; font-size: 0.95rem;">${member.role}</p>
                </div>
            </div>
        `).join('');
    }
}


/**
 * Renders Contact Page.
 */
async function loadContactContent() {
    const globals = await fetchData('globals'); 
    const contact = globals.contact || {};
    const container = document.getElementById('contact-info-grid');
    const aboutContactPreview = document.getElementById('about-contact-preview');

    if (container) {
        container.innerHTML = `
            <div>
                <h4>Mailing Address</h4>
                <p>${contact.address_line1}<br>${contact.address_line2}<br>${contact.address_line3}<br>${contact.address_line4}</p>
                <h4 style="margin-top: 20px;">Email</h4>
                <p>${contact.email}</p>
                <h4 style="margin-top: 20px;">Phone</h4>
                <p>${contact.phone}</p>
            </div>
            <div style="background: #eee; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden;">
                <iframe src="${contact.map_embed_url}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        `;
    }

    if (aboutContactPreview) {
         aboutContactPreview.innerHTML = `
             <p style="font-size: 0.9rem;">${contact.address_line1}<br>${contact.address_line2}<br>${contact.address_line3}<br>${contact.address_line4}</p>
         `;
    }
}

/**
 * Renders Research Aims.
 */
async function loadResearchContent() {
     const pageData = await fetchData('pages');
     const aims = pageData.research_aims || [];
     const container = document.getElementById('research-aims-container');

     if (container) {
         if (aims.length === 0) {
            container.innerHTML = `<p style="text-align: center;">No research aims defined yet. Please add content in the CMS.</p>`;
            return;
         }
         container.innerHTML = aims.map(aim => `
            <div class="aim-card">
                <span class="aim-number">${aim.number}</span>
                <h3>${aim.title}</h3>
                <p>${converter.makeHtml(aim.description)}</p>
                <div style="margin-top: 15px;">
                    ${aim.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                </div>
            </div>
         `).join('');
     }
}

/**
 * Renders News Grid.
 */
async function loadNewsContent() {
    const newsData = await fetchData('news');
    const newsGrid = document.getElementById('news-grid');
    
    // Sort news by date
    const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (newsGrid) {
        newsGrid.innerHTML = sortedNews.map(item => `
            <div class="profile-card">
                <img src="${item.image}" style="height: 200px; width: 100%; object-fit: cover;" loading="lazy">
                <div class="profile-info">
                    <p class="text-uh-red" style="font-weight: bold; font-size: 0.8rem;">${new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}).toUpperCase()}</p>
                    <h4>${item.title}</h4>
                    <p>${item.preview}</p>
                    <a href="#" onclick="showNewsDetail(event, '${item.id}')" style="color: var(--uh-red); font-weight: bold; margin-top: 10px; display: block;">Read More</a>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Shows News Detail View.
 */
async function showNewsDetail(e, itemId) {
    if (e) e.preventDefault();
    
    const newsData = await fetchData('news');
    const item = newsData.find(n => n.id === itemId);
    
    if (item && item.body) {
        const detailContainer = document.getElementById('news-detail-content');
        detailContainer.innerHTML = `
            <h1 class="text-uh-red">${item.title}</h1>
            <p class="text-muted" style="margin-bottom: 20px;">${new Date(item.date).toLocaleDateString()} | ${item.tags ? item.tags.join(', ') : 'News'}</p>
            <img src="${item.image}" style="width: 100%; height: 400px; object-fit: cover; margin-bottom: 30px; border-radius: 4px;" loading="lazy">
            <div style="max-width: 800px;">
                ${converter.makeHtml(item.body)}
            </div>
        `;
        switchPage('news-detail');
    }
}
window.showNewsDetail = showNewsDetail; 

/**
 * Renders Outreach Grid.
 */
async function loadOutreachContent() {
    const outreachData = await fetchData('outreach'); 
    const outreachGrid = document.getElementById('outreach-grid');
    
    // Sort outreach by date
    const sortedOutreach = outreachData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (outreachGrid) {
        outreachGrid.innerHTML = sortedOutreach.map(item => `
            <div class="profile-card">
                <img src="${item.image}" style="height: 200px; width: 100%; object-fit: cover;" loading="lazy">
                <div class="profile-info">
                    <p class="text-uh-red" style="font-weight: bold; font-size: 0.8rem;">${new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}).toUpperCase()}</p>
                    <h4>${item.title}</h4>
                    <p>${item.preview}</p>
                    <a href="#" onclick="showOutreachDetail(event, '${item.id}')" style="color: var(--uh-red); font-weight: bold; margin-top: 10px; display: block;">Read Story</a>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Shows Outreach Detail View.
 */
async function showOutreachDetail(e, itemId) {
    if (e) e.preventDefault();

    const outreachData = await fetchData('outreach');
    const item = outreachData.find(n => n.id === itemId);
    
    if (item && item.body) {
        const detailContainer = document.getElementById('outreach-detail-content');
        detailContainer.innerHTML = `
            <h1 class="text-uh-red">${item.title}</h1>
            <p class="text-muted" style="margin-bottom: 20px;">${new Date(item.date).toLocaleDateString()} | ${item.tags ? item.tags.join(', ') : 'Outreach Program'}</p>
            <img src="${item.image}" style="width: 100%; height: 400px; object-fit: cover; margin-bottom: 30px; border-radius: 4px;" loading="lazy">
            <div style="max-width: 800px;">
                ${converter.makeHtml(item.body)}
            </div>
        `;
        switchPage('outreach-detail');
    } else {
        console.error("Outreach item or body content not found for ID:", itemId);
    }
}
window.showOutreachDetail = showOutreachDetail; 


// =======================================================
// MAIN LOADER SWITCH
// =======================================================

/**
 * Main content loading switch.
 */
function loadContent(pageId) {
    // Load global dependencies
    loadImpactStats();
    loadContactContent(); 

    if (pageId === 'home') {
        loadHomePageContent();
    } else if (pageId === 'team') {
        loadTeamContent();
    } else if (pageId === 'outputs') {
        loadOutputsContent(); 
    } else if (pageId === 'news') {
        loadNewsContent();
    } else if (pageId === 'research') {
        loadResearchContent();
    } else if (pageId === 'advisory') {
        loadAdvisoryContent();
    } else if (pageId === 'outreach') {
        loadOutreachContent();
    }
}
window.loadContent = loadContent;