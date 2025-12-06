/* src/js/contentLoader.js */

const converter = new showdown.Converter();
converter.setFlavor('github');

// --- UTILITY ---
async function fetchData(fileName) {
    try {
        const response = await fetch(`content/${fileName}.json`); 
        if (!response.ok) return (fileName === 'globals' || fileName === 'pages') ? {} : [];
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${fileName}:`, error);
        return (fileName === 'globals' || fileName === 'pages') ? {} : [];
    }
}

// =======================================================
// RENDERER: EVENTS (With Interactive Calendar)
// =======================================================
async function loadEventsContent() {
    // UPDATED: Unwrap 'events_list'
    const rawEvents = await fetchData('events');
    const eventsData = rawEvents.events_list || [];
    
    window.eventsStore = eventsData; // Cache for detail view

    // 1. Render Calendar Widget
    renderCalendar(eventsData);

    // 2. Render List View (Sorted by Date: Upcoming first)
    const eventsGrid = document.getElementById('events-grid');
    
    // Sort: Earliest date first
    const sortedEvents = eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (eventsGrid) {
        if (sortedEvents.length === 0) {
            eventsGrid.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: #777;">No upcoming events scheduled.</p>`;
        } else {
            eventsGrid.innerHTML = sortedEvents.map(item => createCardHtml(item, 'events')).join('');
        }
    }
}

/**
 * Generates a CSS Grid Calendar for the current month
 */
function renderCalendar(events) {
    const container = document.getElementById('events-calendar-container');
    if (!container) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let html = `
        <div class="calendar-header">
            <h3><i class="far fa-calendar-alt" style="color:var(--uh-red); margin-right:10px;"></i> ${monthNames[currentMonth]} ${currentYear}</h3>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-name">Sun</div>
            <div class="calendar-day-name">Mon</div>
            <div class="calendar-day-name">Tue</div>
            <div class="calendar-day-name">Wed</div>
            <div class="calendar-day-name">Thu</div>
            <div class="calendar-day-name">Fri</div>
            <div class="calendar-day-name">Sat</div>
    `;

    // Empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    // Days 1 to 31
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = events.filter(e => {
            const eDate = new Date(e.date);
            return eDate.getDate() === day && 
                   eDate.getMonth() === currentMonth && 
                   eDate.getFullYear() === currentYear;
        });

        const hasEvent = dayEvents.length > 0;
        let tooltip = '';

        if (hasEvent) {
            const eventItem = dayEvents[0]; 
            tooltip = `
                <div class="event-tooltip">
                    <h5>${eventItem.title}</h5>
                    <span class="tooltip-meta"><i class="far fa-clock"></i> ${eventItem.time || 'All Day'}</span>
                    <span class="tooltip-meta"><i class="fas fa-map-marker-alt"></i> ${eventItem.location || 'TBA'}</span>
                    <div style="margin-top:5px; font-size:0.7rem; color:#aaa;">Click for details</div>
                </div>
            `;
        }

        html += `
            <div class="calendar-day ${hasEvent ? 'has-event' : ''}" 
                 ${hasEvent ? `onclick="openDetailView(event, '${dayEvents[0].id}', 'events')"` : ''}>
                <span style="position:relative; z-index:2;">${day}</span>
                ${tooltip}
            </div>
        `;
    }

    html += `</div>`; 
    container.innerHTML = html;
}

// =======================================================
// RENDERERS: NEWS & OUTREACH
// =======================================================

async function loadNewsContent() {
    // UPDATED: Unwrap 'articles'
    const rawNews = await fetchData('news');
    const newsData = rawNews.articles || [];
    
    window.newsStore = newsData;

    const newsGrid = document.getElementById('news-grid');
    // Sort Descending (Newest first)
    const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (newsGrid) {
        newsGrid.innerHTML = sortedNews.map(item => createCardHtml(item, 'news')).join('');
    }
}

async function loadOutreachContent() {
    // UPDATED: Unwrap 'programs'
    const rawOutreach = await fetchData('outreach');
    const outreachData = rawOutreach.programs || [];
    
    window.outreachStore = outreachData;

    const outreachGrid = document.getElementById('outreach-grid');
    // Sort Descending
    const sortedOutreach = outreachData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (outreachGrid) {
        outreachGrid.innerHTML = sortedOutreach.map(item => createCardHtml(item, 'outreach')).join('');
    }
}

/**
 * Unified Card HTML Generator
 */
function createCardHtml(item, type) {
    let metaIcon = 'calendar-alt';
    let btnText = 'Read Story';
    let metaText = new Date(item.date).toLocaleDateString();

    if (type === 'outreach') {
        metaIcon = 'heart';
        btnText = 'View Report';
        if(item.tags && item.tags.length > 0) metaText = item.tags[0]; 
    } else if (type === 'events') {
        metaIcon = 'clock';
        btnText = 'Event Details';
        if (item.time) metaText += ` | ${item.time}`;
    }

    let categoryLabel = item.category || 'Update';
    if (item.tags && item.tags.length > 0 && !item.category) categoryLabel = item.tags[0];

    return `
        <div class="news-card">
            <div class="news-img-wrapper">
                <img src="${item.image || 'public/images/default-placeholder.jpg'}" alt="${item.title}" loading="lazy">
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <i class="far fa-${metaIcon}"></i> ${metaText}
                    <span style="margin:0 5px; opacity:0.5;">|</span> ${categoryLabel}
                </div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-excerpt">${item.preview}</p>
                <a href="#" class="news-link" onclick="openDetailView(event, '${item.id}', '${type}')">
                    ${btnText} <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

// =======================================================
// SHARED DETAIL VIEWER (Smart Layout)
// =======================================================
function openDetailView(e, itemId, type) {
    if (e) e.preventDefault();

    let dataStore;
    if (type === 'news') dataStore = window.newsStore;
    else if (type === 'outreach') dataStore = window.outreachStore;
    else if (type === 'events') dataStore = window.eventsStore;

    const item = dataStore ? dataStore.find(n => n.id === itemId || n.id == itemId) : null;
    if (!item) {
        console.warn(`Item ${itemId} not found in ${type} store.`);
        return;
    }

    const containerId = `${type}-detail-content`;
    const detailContainer = document.getElementById(containerId);
    if (!detailContainer) return;

    let contentHtml = '';
    let heroImage = item.image;
    let fullTitle = item.title;
    
    let category = type.charAt(0).toUpperCase() + type.slice(1); 
    if (item.category) category = item.category;

    if (typeof item.body === 'object' && item.body !== null) {
        const b = item.body;
        fullTitle = b.full_title || item.title;
        heroImage = b.main_image || item.image;
        if(b.category) category = b.category;

        if (b.lead_text) contentHtml += `<p class="article-lead">${b.lead_text}</p>`;

        if (b.content_blocks && Array.isArray(b.content_blocks)) {
            contentHtml += b.content_blocks.map(block => {
                if (block.type === 'quote') {
                    return `
                        <div class="article-quote">
                            <p>"${block.content}"</p>
                            ${block.author ? `<span>— ${block.author}</span>` : ''}
                        </div>`;
                } else if (block.type === 'highlight_box') {
                    return `
                        <div class="highlight-box">
                            <h3><i class="fas fa-info-circle"></i> ${block.title || 'Key Details'}</h3>
                            <ul>
                                ${block.items.map(li => `<li>${li}</li>`).join('')}
                            </ul>
                        </div>`;
                } else if (block.type === 'text') {
                    return `<div class="article-text">${converter.makeHtml(block.content || '')}</div>`;
                }
                return '';
            }).join('');
        }
    } else {
        contentHtml = converter.makeHtml(item.body || '');
    }

    let extraMetaHtml = '';
    if (type === 'events') {
        extraMetaHtml = `
            <div style="background: var(--uh-light-gray); padding: 15px; border-radius: 4px; margin-top: 20px; display: flex; flex-wrap: wrap; gap: 20px; border-left: 4px solid var(--uh-red);">
                <div><strong><i class="far fa-clock text-uh-red"></i> Time:</strong> ${item.time || 'TBA'}</div>
                <div><strong><i class="fas fa-map-marker-alt text-uh-red"></i> Location:</strong> ${item.location || 'TBA'}</div>
            </div>
        `;
    }

    detailContainer.innerHTML = `
        <article class="article-container">
            <div class="article-hero">
                 <img src="${heroImage}" alt="${fullTitle}">
                 <span class="article-category-badge">${category}</span>
            </div>

            <header class="article-header">
                <div class="article-meta-row">
                    <span><i class="far fa-calendar-alt"></i> ${new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 class="article-title text-uh-red">${fullTitle}</h1>
                ${extraMetaHtml}
            </header>
            
            <div class="article-body">
                ${contentHtml}
            </div>

            <div class="article-footer">
                 <a href="#" onclick="switchPage('${type}')" class="btn">Back to ${type.charAt(0).toUpperCase() + type.slice(1)}</a>
            </div>
        </article>
    `;

    switchPage(type + '-detail');
    window.scrollTo(0,0);
}
window.openDetailView = openDetailView;

// =======================================================
// STANDARD PAGE LOADERS
// =======================================================

async function loadHomePageContent() {
    const pageData = await fetchData('pages');
    const home = pageData.home || {};
    
    // Hero
    const heroContent = document.getElementById('hero-content');
    if (heroContent && home.hero_title) {
        heroContent.innerHTML = `
            <h2>${home.hero_title}</h2>
            <p>${home.hero_text}</p>
            <button class="btn" style="background: white; color: var(--uh-red); border-color: white;" onclick="switchPage('research')">Explore Our Research</button>
        `;
    }

    // Slides
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
        
        if (typeof initializeSlider === 'function') initializeSlider();
    }

    // Director
    const directorSection = document.getElementById('director-message-section');
    if (directorSection && home.director) {
        directorSection.innerHTML = `
            <div><img src="${home.director.photo}" alt="${home.director.name}" class="director-img" loading="lazy"></div>
            <div>
                <h3 class="text-uh-red">Director's Message</h3>
                <p class="mission-text" style="margin: 20px 0;">${home.director.message}</p>
                <img src="${home.director.signature}" alt="Signature" style="height: 50px; opacity: 0.7;" loading="lazy">
                <p><strong>${home.director.name}</strong><br>${home.director.role}</p>
            </div>
        `;
    }

    // --- UPCOMING EVENTS ON HOME PAGE (UPDATED) ---
    // UPDATED: Unwrap 'events_list' to populate home page preview
    const rawEvents = await fetchData('events');
    const eventsData = rawEvents.events_list || [];
    
    const eventPreview = document.getElementById('event-preview-grid');
    
    if (eventPreview) {
        // Filter: Future dates only
        const today = new Date();
        today.setHours(0,0,0,0); // reset time to start of day

        const futureEvents = eventsData
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ascending (soonest first)
            .slice(0, 3); // Top 3

        if (futureEvents.length === 0) {
             eventPreview.innerHTML = `<p class="text-center" style="grid-column: 1/-1; opacity: 0.7;">No upcoming events scheduled at this time.</p>`;
        } else {
            eventPreview.innerHTML = futureEvents.map(item => `
                <div class="aim-card">
                    <div style="background: var(--uh-red); color: white; display: inline-block; padding: 5px 15px; font-weight: bold; margin-bottom: 10px;">
                        ${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}).toUpperCase()}
                    </div>
                    <h4>${item.title}</h4>
                    <p>${item.preview}</p>
                    <div style="font-size:0.85rem; color:var(--uh-slate); margin-bottom:10px;">
                        <i class="far fa-clock"></i> ${item.time || 'TBA'}
                    </div>
                    <a href="#" onclick="switchPage('events')" class="text-uh-red" style="font-weight:700; font-size:0.9rem;">View Calendar &rarr;</a>
                </div>
            `).join('');
        }
    }
}

async function loadImpactStats() {
    const globals = await fetchData('globals'); 
    const stats = globals.impact_stats || [];
    const container = document.getElementById('impact-stats-grid');
    if (container) {
        container.innerHTML = stats.map(stat => `
            <div>
                <h2 style="font-size: 3rem; color: ${stat.color || '#F4D03F'};">${stat.value}</h2>
                <p>${stat.label}</p>
            </div>
        `).join('');
    }
}

async function loadTeamContent() {
    // UPDATED: Unwrap 'members'
    const rawTeam = await fetchData('team');
    const teamData = rawTeam.members || [];

    const pis = teamData.filter(m => m.is_pi);
    const groupMembers = teamData.filter(m => !m.is_pi);

    const renderMembers = (members, isPI) => members.map(member => `
        <div class="profile-card">
            ${member.image ? `<div class="profile-img-container"><img src="${member.image}" alt="${member.name}" class="profile-img" loading="lazy"></div>` : ''}
            <div class="profile-info">
                <h4 class="profile-name">${member.name}</h4>
                
                ${isPI && member.title_detail ? `<div class="profile-role" style="font-weight: 700;">${member.role}</div><p style="font-size: 0.9rem; color: var(--uh-slate); margin-top: 5px; margin-bottom: 10px; line-height: 1.3;">${member.title_detail.replace(/\n/g, '<br>')}</p>` : ''}
                
                ${!isPI ? `
                    <div class="profile-role" style="font-weight: 700; margin-bottom: 0;">${member.role}</div>
                    ${member.advisor ? `<p style="font-size: 0.8rem; color: var(--uh-red); font-weight: 600; margin-bottom: 5px;">Advisor: ${member.advisor}</p>` : ''}
                    <p style="font-size: 0.8rem; color: var(--uh-slate); margin-top: 5px; line-height: 1.3;">${member.department || ''}<br>${member.university || ''}</p>
                ` : ''}
                
                <p style="font-size: ${isPI ? '0.9rem' : '0.85rem'}; margin-top: ${isPI ? '10px' : '10px'};">${member.bio || ''}</p>
                
                ${member.tags && member.tags.length > 0 ? `<div class="profile-tags">${member.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                
                ${member.email || member.scholar ? `<div style="margin-top: 15px;">${member.email ? `<a href="mailto:${member.email}"><i class="fas fa-envelope text-uh-red"></i></a>` : ''} ${member.scholar ? `<a href="${member.scholar}" target="_blank" style="margin-left: 10px;"><i class="fab fa-google-scholar text-uh-red"></i></a>` : ''}</div>` : ''}
            </div>
        </div>
    `).join('');

    const piGrid = document.getElementById('team-pis');
    if (piGrid) piGrid.innerHTML = renderMembers(pis, true);

    const groupGrid = document.getElementById('team-group');
    if (groupGrid) groupGrid.innerHTML = renderMembers(groupMembers, false);
}

async function loadOutputsContent() {
    // UPDATED: Unwrap 'papers'
    const rawPubs = await fetchData('publications');
    const publications = rawPubs.papers || [];
    
    const globals = await fetchData('globals'); 
    
    // Publications
    const pubList = document.getElementById('publications-list');
    if (pubList) {
        pubList.innerHTML = publications.sort((a, b) => new Date(b.date) - new Date(a.date)).map(pub => `
            <div class="pub-item">
                <div class="pub-year">${pub.year}</div>
                <div class="pub-details">
                    <h4>${pub.title} ${pub.featured ? `<span class="tag" style="background: var(--uh-red); color: white;">Featured</span>` : ''}</h4>
                    <p class="pub-journal">${pub.journal} <a href="${pub.link || '#'}" target="_blank" class="text-uh-red">VIEW</a></p>
                    <p style="font-size: 0.85rem;">Authors: ${pub.authors}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Patents
    const patentList = document.getElementById('patents-list');
    if (patentList && globals.patents) {
         patentList.innerHTML = globals.patents.map(patent => {
             const parts = patent.split(':');
             return `<li style="margin-bottom: 10px;"><strong>${parts[0]}</strong>: ${parts.slice(1).join(':').trim()}</li>`;
         }).join('');
    }

    // UPDATED: Unwrap 'talks'
    const rawPres = await fetchData('presentations'); 
    const presentations = rawPres.talks || [];

    const presList = document.getElementById('presentations-list');
    if (presList) {
        if (presentations.length > 0) {
            presList.innerHTML = presentations.sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => `
                <div class="pub-item">
                    <div class="pub-year">${new Date(item.date).getFullYear()}</div>
                    <div class="pub-details">
                        <h4>${item.title}</h4>
                        <p class="pub-journal" style="color: var(--uh-slate);"><strong>${item.conference}</strong> | ${item.location}</p>
                        <p style="font-size: 0.85rem; margin-top: 4px;">Presenter: ${item.presenter || 'Group Member'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            presList.innerHTML = `<p>No presentations currently listed.</p>`;
        }
    }
}

async function loadResearchContent() {
    const pageData = await fetchData('pages');
    const aims = pageData.research_aims || [];
    const container = document.getElementById('research-aims-container');
    
    if (container) {
        container.innerHTML = aims.map(aim => `
            <div class="aim-card">
                <span class="aim-number">${aim.number}</span>
                <h3>${aim.title}</h3>
                
                <div class="aim-description">
                    ${converter.makeHtml(aim.description)}
                </div>

                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                    ${aim.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                </div>
            </div>
        `).join('');
    }
}

async function loadAdvisoryContent() {
    const globals = await fetchData('globals'); 
    const board = globals.advisory_board || [];
    const container = document.getElementById('advisory-board-grid');
    if (container) {
        container.innerHTML = board.map(member => `
            <div class="profile-card text-center">
                <div class="profile-img-container"><img src="${member.image}" alt="${member.name}" class="profile-img" loading="lazy"></div>
                <div class="profile-info">
                    <h4 class="profile-name">${member.name}</h4>
                    <p class="profile-role" style="font-weight: 400; font-size: 0.95rem;">${member.role}</p>
                </div>
            </div>
        `).join('');
    }
}

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
         aboutContactPreview.innerHTML = `<p style="font-size: 0.9rem;">${contact.address_line1}<br>${contact.address_line2}<br>${contact.address_line3}<br>${contact.address_line4}</p>`;
    }
}

// MAIN ROUTER
function loadContent(pageId) {
    if (typeof loadImpactStats === 'function') loadImpactStats();
    if (typeof loadContactContent === 'function') loadContactContent(); 

    if (pageId === 'home') loadHomePageContent();
    else if (pageId === 'team') loadTeamContent();
    else if (pageId === 'outputs') loadOutputsContent(); 
    else if (pageId === 'research') loadResearchContent();
    else if (pageId === 'advisory') loadAdvisoryContent();
    else if (pageId === 'news') loadNewsContent();
    else if (pageId === 'outreach') loadOutreachContent();
    else if (pageId === 'events') loadEventsContent(); 
}
window.loadContent = loadContent;