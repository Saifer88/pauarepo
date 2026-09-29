// ===== PRELOADER =====
const preloaderStart = Date.now();
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    const remaining = Math.max(0, 300 - (Date.now() - preloaderStart));
    setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 500);
    }, remaining);
});

const serviceOrbit = document.querySelector('.service-orbit');
if (serviceOrbit) {
    const stage = serviceOrbit.querySelector('.service-orbit-stage');
    const cards = [...stage.querySelectorAll('.orbit-card')];
    let position = 0;
    let targetPosition = 0;
    let cardFocused = false;
    let visible = false;
    let timer;
    let frame;
    let stageWidth = stage.clientWidth;

    function renderOrbit() {
        cards.forEach((card, index) => {
            const angle = (index - position) * Math.PI / 2;
            const depth = (Math.cos(angle) + 1) / 2;
            const orbitOffset = stageWidth > 600 ? stageWidth * 0.12 : 0;
            const horizontal = Math.sin(angle) * stageWidth * 0.2 + orbitOffset;
            const vertical = Math.cos(angle) * 64;
            card.style.transform = `translate(-50%, -50%) translate(${horizontal}px, ${vertical}px) scale(${0.66 + depth * 0.34})`;
            card.style.opacity = String(0.3 + depth * 0.7);
            card.style.zIndex = String(Math.round(depth * 100));
        });
    }

    function selectCard(step) {
        cancelAnimationFrame(frame);
        const startPosition = position;
        targetPosition += step;
        const activeIndex = ((targetPosition % cards.length) + cards.length) % cards.length;
        cards.forEach((card, index) => {
            const active = index === activeIndex;
            card.dataset.active = String(active);
            card.inert = !active;
            card.setAttribute('aria-hidden', String(!active));
            const heading = card.querySelector('h2');
            heading.getAnimations().forEach(animation => animation.cancel());
            if (active && step !== 0) {
                heading.animate([
                    { opacity: 0, transform: 'translateY(12px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], { duration: 550, delay: 200, easing: 'ease-out', fill: 'backwards' });
            }
        });
        const started = performance.now();
        function animate(now) {
            const progress = Math.min((now - started) / 850, 1);
            const eased = progress * progress * (3 - 2 * progress);
            position = startPosition + (targetPosition - startPosition) * eased;
            renderOrbit();
            if (progress < 1) frame = requestAnimationFrame(animate);
        }
        frame = requestAnimationFrame(animate);
    }

    function syncPlayback() {
        clearInterval(timer);
        if (!cardFocused && visible) {
            timer = setInterval(() => selectCard(1), 3500);
        }
    }

    stage.addEventListener('focusin', () => {
        cardFocused = true;
        syncPlayback();
    });
    stage.addEventListener('focusout', event => {
        cardFocused = stage.contains(event.relatedTarget);
        syncPlayback();
    });
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncPlayback(); }, { threshold: 0.25 }).observe(serviceOrbit);
    new ResizeObserver(() => { stageWidth = stage.clientWidth; renderOrbit(); }).observe(stage);
    renderOrbit();
    serviceOrbit.classList.add('is-ready');
    syncPlayback();
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
if (navbar) {
    const navbarSurface = navbar.querySelector('.navbar-surface');
    let navbarUpdateFrame;

    const updateNavbar = () => {
        if (navbarUpdateFrame) return;

        navbarUpdateFrame = requestAnimationFrame(() => {
            const fadeProgress = Math.min(Math.max((window.scrollY - 20) / 120, 0), 1);
            if (navbarSurface) navbarSurface.style.opacity = String(fadeProgress);
            navbar.classList.toggle('scrolled', window.scrollY >= 80);
            navbarUpdateFrame = undefined;
        });
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    const navLinks = Array.from(navbar.querySelectorAll('[data-nav-sections]'));
    const sectionToLink = new Map();
    navLinks.forEach(link => {
        link.dataset.navSections.split(' ').forEach(id => sectionToLink.set(id, link));
    });

    const visibleSections = new Map();
    const updateActiveLink = () => {
        const activeEntry = Array.from(visibleSections.entries())
            .filter(([, isVisible]) => isVisible)
            .sort(([firstId], [secondId]) => {
                const firstTop = document.getElementById(firstId)?.getBoundingClientRect().top ?? Infinity;
                const secondTop = document.getElementById(secondId)?.getBoundingClientRect().top ?? Infinity;
                return Math.abs(firstTop - 120) - Math.abs(secondTop - 120);
            })[0];
        const activeLink = activeEntry ? sectionToLink.get(activeEntry[0]) : null;

        navLinks.forEach(link => {
            const isActive = link === activeLink;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => visibleSections.set(entry.target.id, entry.isIntersecting));
        updateActiveLink();
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

    sectionToLink.forEach((link, id) => {
        const section = document.getElementById(id);
        if (section) sectionObserver.observe(section);
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        const navCollapse = document.querySelector('.navbar-collapse');
        if (navCollapse?.classList.contains('show')) {
            bootstrap.Collapse.getInstance(navCollapse)?.hide();
        }
    });
});

// ===== GALLERY LIGHTBOX =====
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');
const galleryGrid = document.querySelector('.gallery-grid');

if (galleryGrid && lightboxModal && lightboxImage) {
    galleryGrid.addEventListener('click', (e) => {
        const slide = e.target.closest('.gallery-slide');
        if (!slide) return;
        e.preventDefault();
        lightboxImage.src = slide.getAttribute('href');
        lightboxImage.alt = slide.querySelector('img')?.alt || 'Immagine ingrandita';
        new bootstrap.Modal(lightboxModal).show();
    });

    const scrollGallery = (direction) => {
        galleryGrid.scrollBy({ left: direction * galleryGrid.clientWidth * 0.75, behavior: 'smooth' });
    };

    document.querySelector('.gallery-prev')?.addEventListener('click', () => scrollGallery(-1));
    document.querySelector('.gallery-next')?.addEventListener('click', () => scrollGallery(1));
}

// ===== STRUTTURA: THUMBNAIL GALLERY =====
const strutturaMain = document.getElementById('strutturaMain');
if (strutturaMain) {
    document.querySelectorAll('.struttura-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            strutturaMain.src = thumb.dataset.src;
            document.querySelectorAll('.struttura-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}

// ===== STRUTTURA: TABS SWIPE + FIXED HEIGHT =====
const strutturaTabEl = document.getElementById('strutturaTab');
if (strutturaTabEl) {
    const tabContent = document.getElementById('strutturaTabContent');
    const panes = Array.from(tabContent.querySelectorAll('.tab-pane'));
    const tabs = Array.from(strutturaTabEl.querySelectorAll('[role="tab"]'));
    const pill = document.getElementById('strutturaTabPill');
    let currentIndex = 0;
    let transitionTimer;

    function movePill(idx, animate = true) {
        const tab = tabs[idx];
        const tabRect = tab.getBoundingClientRect();
        const parentRect = strutturaTabEl.getBoundingClientRect();
        if (!animate) pill.style.transition = 'none';
        pill.style.width = tabRect.width + 'px';
        pill.style.transform = `translateX(${tabRect.left - parentRect.left - 5.6}px)`;
        if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
    }

    function setFixedHeight() {
        panes.forEach(p => { p.style.position = 'relative'; p.style.opacity = '1'; p.style.transform = 'none'; p.style.display = 'block'; });
        const heroImg = document.querySelector('.struttura-hero img');
        const mapIframe = document.getElementById('strutturaMapIframe');
        if (heroImg && mapIframe) mapIframe.style.height = heroImg.offsetHeight + 'px';
        tabContent.style.height = Math.max(...panes.map(p => p.offsetHeight)) + 'px';
        panes.forEach((p, i) => {
            if (i !== currentIndex) { p.style.position = 'absolute'; p.style.opacity = '0'; p.style.transform = 'translateX(100%)'; }
            else { p.style.position = 'relative'; }
        });
        movePill(currentIndex, false);
    }

    setFixedHeight();
    const paneResizeObserver = new ResizeObserver(() => {
        tabContent.style.height = Math.max(...panes.map(p => p.offsetHeight)) + 'px';
    });
    panes.forEach(pane => paneResizeObserver.observe(pane));
    window.addEventListener('resize', setFixedHeight);
    document.querySelector('.struttura-hero img')?.addEventListener('load', setFixedHeight);

    tabs.forEach((tab, idx) => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            if (idx === currentIndex) return;
            const direction = idx > currentIndex ? 1 : -1;
            const currentPane = panes[currentIndex];
            const nextPane = panes[idx];

            clearTimeout(transitionTimer);
            panes.forEach((pane, paneIndex) => {
                const isCurrent = paneIndex === currentIndex;
                pane.classList.toggle('active', isCurrent);
                pane.style.transition = 'none';
                pane.style.position = isCurrent ? 'relative' : 'absolute';
                pane.style.opacity = isCurrent ? '1' : '0';
                pane.style.transform = isCurrent ? 'translateX(0)' : 'translateX(100%)';
            });
            void currentPane.offsetWidth;
            panes.forEach(pane => { pane.style.transition = ''; });
            movePill(idx, true);

            currentPane.style.transform = `translateX(${-direction * 100}%)`;
            currentPane.style.opacity = '0';

            nextPane.style.transition = 'none';
            nextPane.style.transform = `translateX(${direction * 100}%)`;
            nextPane.style.opacity = '0';
            nextPane.style.position = 'absolute';
            void nextPane.offsetWidth;

            nextPane.style.transition = '';
            nextPane.style.transform = 'translateX(0)';
            nextPane.style.opacity = '1';

            transitionTimer = setTimeout(() => {
                currentPane.style.position = 'absolute';
                currentPane.classList.remove('active');
                nextPane.style.position = 'relative';
                nextPane.classList.add('active');
            }, 500);

            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tabs[idx].classList.add('active');
            tabs[idx].setAttribute('aria-selected', 'true');
            currentIndex = idx;
        });
    });
}

// ===== REVIEWS: SHOW MORE =====
(function initReviewsShowMore() {
    const container = document.getElementById('reviewsMasonry');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.review-card'));
    const featuredCards = cards.filter(card => card.hasAttribute('data-featured'));
    const initialCards = featuredCards.length ? featuredCards : cards.slice(0, 8);
    if (cards.length <= initialCards.length) return;

    const remainingCards = cards.filter(card => !initialCards.includes(card));
    [...initialCards, ...remainingCards].forEach(card => container.appendChild(card));

    remainingCards.forEach(card => card.classList.add('review-hidden'));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reviews-show-more';
    button.setAttribute('aria-expanded', 'false');
    button.textContent = `Leggi altre ${remainingCards.length} recensioni`;
    container.appendChild(button);

    button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        remainingCards.forEach(card => card.classList.toggle('review-hidden', expanded));
        button.setAttribute('aria-expanded', String(!expanded));
        button.textContent = expanded ? `Leggi altre ${remainingCards.length} recensioni` : 'Mostra meno recensioni';
    });
})();

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .method-step, .card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// ===== SERVICE CARDS → SHOP HIGHLIGHT =====
document.querySelectorAll('.service-link').forEach(card => {
    card.addEventListener('click', () => {
        const ids = card.dataset.highlight?.split(',');
        if (!ids) return;
        const row = document.querySelector('.pricing-section .row');
        if (!row) return;

        const top = row.getBoundingClientRect().top + window.pageYOffset + row.offsetHeight / 2 - window.innerHeight / 2;
        window.scrollTo({ top, behavior: 'smooth' });

        setTimeout(() => {
            ids.forEach(id => {
                const target = document.querySelector(`[data-package="${id.trim()}"]`);
                if (target) {
                    target.classList.remove('highlight-pulse');
                    void target.offsetWidth;
                    target.classList.add('highlight-pulse');
                    target.addEventListener('animationend', () => target.classList.remove('highlight-pulse'), { once: true });
                }
            });
        }, 600);
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
});

// ===== COOKIE BANNER =====
const cookieBanner = document.getElementById('cookieBanner');
if (cookieBanner) {
    if (localStorage.getItem('cookie_consent')) {
        cookieBanner.classList.add('hidden');
    }
    document.getElementById('cookieAccept')?.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        cookieBanner.classList.add('hidden');
    });
    document.getElementById('cookieReject')?.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'rejected');
        cookieBanner.classList.add('hidden');
    });
}

// ===== WHATSAPP FORM =====
const whatsappForm = document.getElementById('whatsappForm');
if (whatsappForm) {
    whatsappForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();

        if (!name) { alert('Per favore inserisci il tuo nome.'); return; }

        let text = `Buongiorno Dott.ssa Mincuzzi! La contatto dal suo sito web.\n\nSono: ${name}\n`;
        if (service) text += `Servizio di interesse: ${service}\n`;
        if (message) text += `\nMessaggio:\n${message}`;

        window.open(`https://wa.me/393452541794?text=${encodeURIComponent(text)}`, '_blank');
    });
}
