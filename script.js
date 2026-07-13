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

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

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

// ===== GALLERY: LIGHTBOX + DRAG + AUTO-SCROLL =====
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');
const galleryCarousel = document.querySelector('.gallery-carousel');
const galleryTrack = document.querySelector('.gallery-track');

if (galleryCarousel && galleryTrack) {
    // Clone slides for seamless infinite loop
    galleryTrack.innerHTML += galleryTrack.innerHTML;

    // Lightbox via event delegation (works on cloned slides too)
    galleryTrack.addEventListener('click', (e) => {
        const slide = e.target.closest('.gallery-slide');
        if (!slide) return;
        e.preventDefault();
        if (galleryCarousel.classList.contains('dragged')) return;
        lightboxImage.src = slide.getAttribute('href');
        new bootstrap.Modal(lightboxModal).show();
    });

    // Drag + auto-scroll state
    let scrollPos = 0;
    let isDragging = false;
    let dragMoved = false;
    let startX = 0;
    let dragStartScroll = 0;
    let autoSpeed = 0.5;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let inertiaActive = false;
    const halfWidth = galleryTrack.scrollWidth / 2;

    function wrapScroll() {
        if (scrollPos >= halfWidth) scrollPos -= halfWidth;
        if (scrollPos < 0) scrollPos += halfWidth;
    }

    // Animation loop
    (function tick() {
        if (!isDragging) {
            if (inertiaActive) {
                scrollPos += velocity;
                velocity *= 0.95;
                if (Math.abs(velocity) < 0.3) {
                    inertiaActive = false;
                    autoSpeed = 0.5;
                }
            } else {
                scrollPos += autoSpeed;
            }
            wrapScroll();
            galleryTrack.style.transform = `translateX(${-scrollPos}px)`;
        }
        requestAnimationFrame(tick);
    })();

    // Drag handlers
    function startDrag(x) {
        isDragging = true;
        dragMoved = false;
        inertiaActive = false;
        startX = x;
        lastX = x;
        lastTime = Date.now();
        dragStartScroll = scrollPos;
        galleryCarousel.classList.add('dragging');
    }

    function moveDrag(x) {
        if (!isDragging) return;
        const dx = x - startX;
        if (Math.abs(dx) > 5) dragMoved = true;
        const now = Date.now();
        const dt = now - lastTime;
        if (dt > 0) velocity = -(x - lastX) / dt * 16;
        lastX = x;
        lastTime = now;
        scrollPos = dragStartScroll - dx;
        wrapScroll();
        galleryTrack.style.transform = `translateX(${-scrollPos}px)`;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        galleryCarousel.classList.remove('dragging');
        if (dragMoved) {
            galleryCarousel.classList.add('dragged');
            setTimeout(() => galleryCarousel.classList.remove('dragged'), 100);
            inertiaActive = true;
            autoSpeed = 0;
        }
    }

    // Mouse events
    galleryCarousel.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.pageX); });
    document.addEventListener('mousemove', (e) => moveDrag(e.pageX));
    document.addEventListener('mouseup', endDrag);

    // Touch events
    galleryCarousel.addEventListener('touchstart', (e) => startDrag(e.touches[0].pageX), { passive: true });
    galleryCarousel.addEventListener('touchmove', (e) => moveDrag(e.touches[0].pageX), { passive: true });
    galleryCarousel.addEventListener('touchend', endDrag);

    // Pause on hover (desktop)
    galleryCarousel.addEventListener('mouseenter', () => { if (!inertiaActive) autoSpeed = 0; });
    galleryCarousel.addEventListener('mouseleave', () => { if (!inertiaActive) autoSpeed = 0.5; });
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

    function movePill(idx, animate = true) {
        if (window.innerWidth <= 385) { pill.style.display = 'none'; return; }
        pill.style.display = '';
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
        tabContent.style.height = Math.max(...panes.map(p => p.offsetHeight)) + 'px';
        panes.forEach((p, i) => {
            if (i !== currentIndex) { p.style.position = 'absolute'; p.style.opacity = '0'; p.style.transform = 'translateX(100%)'; }
            else { p.style.position = 'relative'; }
        });
        const heroImg = document.querySelector('.struttura-hero img');
        const mapIframe = document.getElementById('strutturaMapIframe');
        if (heroImg && mapIframe) mapIframe.style.height = heroImg.offsetHeight + 'px';
        movePill(currentIndex, false);
    }

    setFixedHeight();
    window.addEventListener('resize', setFixedHeight);
    document.querySelector('.struttura-hero img')?.addEventListener('load', setFixedHeight);

    tabs.forEach((tab, idx) => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            if (idx === currentIndex) return;
            const direction = idx > currentIndex ? 1 : -1;
            const currentPane = panes[currentIndex];
            const nextPane = panes[idx];

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

            setTimeout(() => {
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

// ===== REVIEWS: MOBILE SHOW MORE =====
(function initReviewsShowMore() {
    const container = document.getElementById('reviewsMasonry');
    if (!container || window.innerWidth > 767) return;

    const cards = Array.from(container.querySelectorAll('.review-card'));
    const batchSize = 5;
    if (cards.length <= batchSize) return;

    cards.forEach((card, i) => {
        if (i >= batchSize) { card.classList.add('review-hidden'); card.dataset.batch = Math.floor(i / batchSize); }
    });

    const totalBatches = Math.ceil(cards.length / batchSize);
    let currentBatch = 1;
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'reviews-show-more';
    link.textContent = 'Mostra altre';
    container.appendChild(link);

    link.addEventListener('click', (e) => {
        e.preventDefault();
        container.querySelectorAll(`.review-card[data-batch="${currentBatch}"]`).forEach(c => c.classList.remove('review-hidden'));
        currentBatch++;
        if (currentBatch >= totalBatches) link.remove();
    });
})();

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .method-step, .card, .disfunzioni-stagger').forEach(el => {
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
