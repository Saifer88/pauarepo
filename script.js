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

// ===== REVIEWS BUBBLES FROM JSON =====
function abbreviateName(fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length <= 1) return fullName;
    const first = parts[0];
    const lastInitials = parts.slice(1).map(p => p[0].toUpperCase() + '.').join(' ');
    return `${first} ${lastInitials}`;
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function loadReviews() {
    try {
        const response = await fetch('reviews.json');
        const reviews = await response.json();
        const container = document.getElementById('reviewsBubbles');
        if (!container) return;

        const validReviews = shuffle(reviews.filter(r => r.comment.length > 10));
        const total = validReviews.length;

        // Position bubbles in a circular layout
        const containerRect = container.getBoundingClientRect();
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        const isMobile = window.innerWidth <= 767;
        const isTablet = window.innerWidth <= 991;
        const radiusX = isMobile ? Math.min(centerX - 40, 150) : isTablet ? Math.min(centerX - 40, 280) : Math.min(centerX - 60, 420);
        const radiusY = isMobile ? Math.min(centerY - 40, 190) : isTablet ? Math.min(centerY - 40, 230) : Math.min(centerY - 60, 320);

        validReviews.forEach((review, i) => {
            const name = abbreviateName(review.author);
            const bubble = document.createElement('div');
            bubble.className = 'review-bubble';

            // Calculate position on ellipse
            const angle = (2 * Math.PI * i) / total - Math.PI / 2;
            const bubbleOffset = isMobile ? 40 : 50;
            const x = centerX + radiusX * Math.cos(angle) - bubbleOffset;
            const y = centerY + radiusY * Math.sin(angle) - bubbleOffset;

            bubble.style.left = `${x}px`;
            bubble.style.top = `${y}px`;

            bubble.innerHTML = `
                <p class="bubble-text">"${review.comment}"</p>
                <p class="bubble-author">— ${name}</p>
            `;
            container.appendChild(bubble);
        });

        // Highlight animation in random order
        const bubbles = Array.from(container.querySelectorAll('.review-bubble'));
        let highlightOrder = shuffle([...Array(bubbles.length).keys()]);
        let currentIdx = 0;

        function highlightBubble(index) {
            bubbles.forEach(b => {
                b.classList.remove('active');
                b.classList.remove('text-visible');
            });
            bubbles[index].classList.add('active');
            // Show text after move/resize transition completes
            setTimeout(() => {
                bubbles[index].classList.add('text-visible');
            }, 600);
        }

        function autoHighlight() {
            highlightBubble(highlightOrder[currentIdx]);
            currentIdx = (currentIdx + 1) % highlightOrder.length;
            if (currentIdx === 0) highlightOrder = shuffle([...Array(bubbles.length).keys()]);
        }

        autoHighlight();
        setInterval(autoHighlight, 5000);

        // Reposition on resize
        function repositionBubbles() {
            const cX = container.offsetWidth / 2;
            const cY = container.offsetHeight / 2;
            const mob = window.innerWidth <= 767;
            const tab = window.innerWidth <= 991;
            const rX = mob ? Math.min(cX - 40, 150) : tab ? Math.min(cX - 40, 280) : Math.min(cX - 60, 420);
            const rY = mob ? Math.min(cY - 40, 190) : tab ? Math.min(cY - 40, 230) : Math.min(cY - 60, 320);

            bubbles.forEach((bubble, i) => {
                const angle = (2 * Math.PI * i) / total - Math.PI / 2;
                const offset = mob ? 40 : 50;
                const x = cX + rX * Math.cos(angle) - offset;
                const y = cY + rY * Math.sin(angle) - offset;
                bubble.style.left = `${x}px`;
                bubble.style.top = `${y}px`;
            });
        }

        window.addEventListener('resize', repositionBubbles);
    } catch (err) {
        console.error('Error loading reviews:', err);
    }
}

loadReviews();

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
        const packagesSection = document.getElementById('pacchetti');

        // Scroll to packages section
        const offset = 80;
        const top = packagesSection.getBoundingClientRect().top + window.pageYOffset - offset;
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
