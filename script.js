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
        const container = document.getElementById('reviewsMasonry');
        if (!container) return;

        const validReviews = shuffle(reviews.filter(r => r.comment.length > 10));
        const isMobile = window.innerWidth <= 767;
        const batchSize = 5;

        validReviews.forEach((review, index) => {
            const name = abbreviateName(review.author);
            const initials = review.author.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
            const card = document.createElement('div');
            card.className = 'review-card';
            if (isMobile && index >= batchSize) {
                card.classList.add('review-hidden');
                card.dataset.batch = Math.floor(index / batchSize);
            }
            card.innerHTML = `
                <p class="review-text">"${review.comment}"</p>
                <div class="review-author">
                    <span class="review-avatar">${initials}</span>
                    <span>${name}</span>
                </div>
            `;
            container.appendChild(card);
        });

        // Add "show more" link on mobile
        if (isMobile && validReviews.length > batchSize) {
            const totalBatches = Math.ceil(validReviews.length / batchSize);
            let currentBatch = 1;

            const link = document.createElement('a');
            link.href = '#';
            link.className = 'reviews-show-more';
            link.textContent = 'Mostra altre';
            container.after(link);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const cards = container.querySelectorAll(`.review-card[data-batch="${currentBatch}"]`);
                cards.forEach(card => card.classList.remove('review-hidden'));
                currentBatch++;
                if (currentBatch >= totalBatches) {
                    link.remove();
                }
            });
        }
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
