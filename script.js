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
        const radiusX = Math.min(centerX - 60, 420);
        const radiusY = Math.min(centerY - 60, 320);

        validReviews.forEach((review, i) => {
            const name = abbreviateName(review.author);
            const bubble = document.createElement('div');
            bubble.className = 'review-bubble';

            // Calculate position on ellipse
            const angle = (2 * Math.PI * i) / total - Math.PI / 2;
            const x = centerX + radiusX * Math.cos(angle) - 50;
            const y = centerY + radiusY * Math.sin(angle) - 50;

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
        let userHovering = false;

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
            if (userHovering) return;
            highlightBubble(highlightOrder[currentIdx]);
            currentIdx = (currentIdx + 1) % highlightOrder.length;
            if (currentIdx === 0) highlightOrder = shuffle([...Array(bubbles.length).keys()]);
        }

        autoHighlight();
        setInterval(autoHighlight, 8000);

        // Hover interaction
        bubbles.forEach((bubble) => {
            bubble.addEventListener('mouseenter', () => {
                userHovering = true;
                bubbles.forEach(b => {
                    b.classList.remove('active');
                    b.classList.remove('text-visible');
                });
                bubble.classList.add('active');
                setTimeout(() => {
                    bubble.classList.add('text-visible');
                }, 600);
            });

            bubble.addEventListener('mouseleave', () => {
                userHovering = false;
            });
        });

        // Reposition on resize
        function repositionBubbles() {
            const cX = container.offsetWidth / 2;
            const cY = container.offsetHeight / 2;
            const rX = Math.min(cX - 60, 420);
            const rY = Math.min(cY - 60, 320);

            bubbles.forEach((bubble, i) => {
                const angle = (2 * Math.PI * i) / total - Math.PI / 2;
                const x = cX + rX * Math.cos(angle) - 50;
                const y = cY + rY * Math.sin(angle) - 50;
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
