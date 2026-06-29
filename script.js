// ===== PRELOADER =====
const preloaderStart = Date.now();
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const elapsed = Date.now() - preloaderStart;
    const minDisplay = 500;
    const remaining = Math.max(0, minDisplay - elapsed);

    setTimeout(() => {
        preloader.classList.add('hidden');
    }, remaining);
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        const navCollapse = document.querySelector('.navbar-collapse');
        if (navCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) bsCollapse.hide();
        }
    });
});

// ===== GALLERY LIGHTBOX =====
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');

document.querySelectorAll('.gallery-slide').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const imgSrc = item.getAttribute('href');
        lightboxImage.src = imgSrc;
        const modal = new bootstrap.Modal(lightboxModal);
        modal.show();
    });
});

// ===== STRUTTURA GALLERY =====
const strutturaMain = document.getElementById('strutturaMain');
if (strutturaMain) {
    document.querySelectorAll('.struttura-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const src = thumb.dataset.src;
            strutturaMain.src = src;
            document.querySelectorAll('.struttura-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}

// ===== REVIEWS MOBILE SHOW MORE =====
function initReviewsShowMore() {
    const container = document.getElementById('reviewsMasonry');
    if (!container || window.innerWidth > 767) return;

    const cards = Array.from(container.querySelectorAll('.review-card'));
    const batchSize = 5;

    if (cards.length <= batchSize) return;

    // Hide cards beyond the first batch
    cards.forEach((card, index) => {
        if (index >= batchSize) {
            card.classList.add('review-hidden');
            card.dataset.batch = Math.floor(index / batchSize);
        }
    });

    // Add "Mostra altre" link
    const totalBatches = Math.ceil(cards.length / batchSize);
    let currentBatch = 1;

    const link = document.createElement('a');
    link.href = '#';
    link.className = 'reviews-show-more';
    link.textContent = 'Mostra altre';
    container.appendChild(link);

    link.addEventListener('click', (e) => {
        e.preventDefault();
        const batch = container.querySelectorAll(`.review-card[data-batch="${currentBatch}"]`);
        batch.forEach(card => card.classList.remove('review-hidden'));
        currentBatch++;
        if (currentBatch >= totalBatches) {
            link.remove();
        }
    });
}

initReviewsShowMore();

// ===== SCROLL REVEAL ANIMATION =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .method-step, .card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// ===== SERVICE CARDS → PACKAGES HIGHLIGHT =====
document.querySelectorAll('.service-link').forEach(card => {
    card.addEventListener('click', () => {
        const highlightIds = card.dataset.highlight.split(',');
        const packagesRow = document.querySelector('#shop .row');

        // Center the cards row in the viewport
        const rowRect = packagesRow.getBoundingClientRect();
        const rowCenter = rowRect.top + window.pageYOffset + rowRect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const top = rowCenter - viewportCenter;
        window.scrollTo({ top, behavior: 'smooth' });

        // Wait for scroll to complete, then highlight
        setTimeout(() => {
            highlightIds.forEach(id => {
                const target = document.querySelector(`[data-package="${id.trim()}"]`);
                if (target) {
                    target.classList.remove('highlight-pulse');
                    // Force reflow to restart animation
                    void target.offsetWidth;
                    target.classList.add('highlight-pulse');
                    target.addEventListener('animationend', () => {
                        target.classList.remove('highlight-pulse');
                    }, { once: true });
                }
            });
        }, 600);
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});

// ===== COOKIE BANNER =====
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');

if (cookieBanner) {
    // Check if consent was already given
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
        cookieBanner.classList.add('hidden');
    }

    cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        cookieBanner.classList.add('hidden');
    });

    cookieReject.addEventListener('click', () => {
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

        if (!name) {
            alert('Per favore inserisci il tuo nome.');
            return;
        }

        let text = `Buongiorno Dott.ssa Mincuzzi! La contatto dal suo sito web.\n\n`;
        text += `Sono: ${name}\n`;
        if (service) text += `Servizio di interesse: ${service}\n`;
        if (message) text += `\nMessaggio:\n${message}`;

        const encoded = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/393452541794?text=${encoded}`;

        window.open(whatsappUrl, '_blank');
    });
}
