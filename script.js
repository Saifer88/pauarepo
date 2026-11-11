// ===== PRELOADER =====
const preloaderStart = Date.now();
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    const remaining = Math.max(0, 300 - (Date.now() - preloaderStart));
    setTimeout(() => {
        preloader.classList.add('hidden');
        // Avvia l'entrata stagger dell'hero quando il preloader esce
        document.body.classList.add('hero-ready');
        setTimeout(() => preloader.remove(), 500);
    }, remaining);
});

// Fallback: se il preloader manca (es. già rimosso), mostra comunque l'hero
if (!document.getElementById('preloader')) {
    document.body.classList.add('hero-ready');
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

    // Menu mobile aperto: navbar bianca anche a scroll 0
    const navCollapseEl = document.getElementById('navbarNav');
    navCollapseEl?.addEventListener('show.bs.collapse', () => navbar.classList.add('menu-open'));
    navCollapseEl?.addEventListener('hidden.bs.collapse', () => navbar.classList.remove('menu-open'));

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
const transformGrid = document.getElementById('transformGrid');

if (transformGrid && lightboxModal && lightboxImage) {
    transformGrid.addEventListener('click', (e) => {
        const link = e.target.closest('.transform-media');
        if (!link || typeof bootstrap === 'undefined') return;
        e.preventDefault();
        lightboxImage.src = link.getAttribute('href');
        lightboxImage.alt = link.querySelector('img')?.alt || 'Immagine ingrandita';
        bootstrap.Modal.getOrCreateInstance(lightboxModal).show();
    });
}

// ===== DISTURBI SPECIFICI → FORM PRECOMPILATO =====
document.querySelectorAll('[data-condition]:not(.condition-start)').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const condition = trigger.dataset.condition;
        const message = document.getElementById('message');
        const contact = document.getElementById('contatti');

        const serviceRadio = document.querySelector('input[name="service"][value="Percorso per disturbi specifici"]');
        if (serviceRadio) serviceRadio.checked = true;
        if (message && condition) {
            message.value = `Vorrei iniziare un percorso per ${condition}.`;
        }

        if (contact) {
            const top = contact.getBoundingClientRect().top + window.pageYOffset - 90;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        // Focus dopo lo scroll, senza un secondo salto della pagina
        setTimeout(() => document.getElementById('name')?.focus({ preventScroll: true }), 600);
    });
});

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

document.querySelectorAll('.service-card, .duo, .card').forEach(el => {
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
        document.body.classList.add('cookie-dismissed');
    }
    const dismissCookie = (value) => {
        localStorage.setItem('cookie_consent', value);
        cookieBanner.classList.add('hidden');
        document.body.classList.add('cookie-dismissed');
    };
    document.getElementById('cookieAccept')?.addEventListener('click', () => dismissCookie('accepted'));
    document.getElementById('cookieReject')?.addEventListener('click', () => dismissCookie('rejected'));
}

// ===== FAQ A FISARMONICA SU MOBILE =====
// Senza JS o su desktop le risposte restano tutte visibili (nel DOM sempre).
(function initFaqAccordion() {
    const faq = document.getElementById('faq');
    const items = faq ? Array.from(faq.querySelectorAll('.faq-numbered')) : [];
    if (!items.length) return;

    const mq = window.matchMedia('(max-width: 767px)');

    const enable = () => items.forEach((item, i) => {
        const heading = item.querySelector('h6');
        const answer = item.querySelector('p');
        if (!heading || !answer || heading.querySelector('.faq-toggle')) return;

        const label = heading.textContent.trim();
        heading.dataset.label = label;
        answer.id = `faq-answer-${i + 1}`;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'faq-toggle';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', answer.id);
        const text = document.createElement('span');
        text.textContent = label;
        const icon = document.createElement('i');
        icon.className = 'bi bi-chevron-down';
        icon.setAttribute('aria-hidden', 'true');
        button.append(text, icon);

        heading.textContent = '';
        heading.append(button);
        item.classList.add('faq-collapsible');
    });

    const disable = () => items.forEach(item => {
        const heading = item.querySelector('h6');
        if (heading?.querySelector('.faq-toggle')) heading.textContent = heading.dataset.label || '';
        item.querySelector('p')?.removeAttribute('id');
        item.classList.remove('faq-collapsible', 'is-open');
    });

    const sync = () => (mq.matches ? enable() : disable());
    sync();
    mq.addEventListener('change', sync);

    faq.addEventListener('click', (e) => {
        const button = e.target.closest('.faq-toggle');
        if (!button) return;
        const item = button.closest('.faq-numbered');
        const open = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(open));
    });
})();

// ===== WHATSAPP FORM =====
const whatsappForm = document.getElementById('whatsappForm');
if (whatsappForm) {
    const nameField = document.getElementById('name');
    const nameError = document.getElementById('nameError');

    const setNameError = (show) => {
        if (nameError) nameError.hidden = !show;
        nameField.classList.toggle('is-invalid', show);
        nameField.setAttribute('aria-invalid', show ? 'true' : 'false');
    };

    // Nasconde l'errore appena l'utente inizia a correggere
    nameField?.addEventListener('input', () => {
        if (nameField.value.trim()) setNameError(false);
    });

    whatsappForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameField.value.trim();
        const service = whatsappForm.querySelector('input[name="service"]:checked')?.value || '';
        const message = document.getElementById('message').value.trim();

        if (!name) {
            setNameError(true);
            nameField.focus();
            return;
        }
        setNameError(false);

        let text = `Buongiorno Dott.ssa Mincuzzi! La contatto dal suo sito web.\n\nSono: ${name}\n`;
        if (service) text += `Servizio di interesse: ${service}\n`;
        if (message) text += `\nMessaggio:\n${message}`;

        window.open(`https://wa.me/393452541794?text=${encodeURIComponent(text)}`, '_blank');
    });
}

// =====================================================================
// ANIMAZIONI SPINTE (Emil Kowalski) — tutte guardate da reduced-motion
// =====================================================================
(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // --- 1) Barra avanzamento scroll ---
    const progressBar = document.querySelector('#scrollProgress .scroll-progress-bar');
    if (progressBar) {
        let ticking = false;
        const updateProgress = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            const ratio = max > 0 ? h.scrollTop / max : 0;
            progressBar.style.transform = `scaleX(${ratio})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
        }, { passive: true });
        updateProgress();
    }

    // --- 1b) Parallax hero (solo translateY via variabile, scale resta al Ken Burns) ---
    const heroImg = document.querySelector('.hero-media img');
    const heroSection = document.querySelector('.hero-section');
    if (heroImg && heroSection && !reduce) {
        let hticking = false;
        const updateParallax = () => {
            const rect = heroSection.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const shift = Math.round(window.scrollY * 0.18); // max ~18%
                heroImg.style.setProperty('--hero-parallax', `${shift}px`);
            }
            hticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!hticking) { hticking = true; requestAnimationFrame(updateParallax); }
        }, { passive: true });
        updateParallax();
    }

    // --- 4) Titoli a parole sfalsate ---
    // Split non distruttivo: avvolge ogni parola in uno <span>, poi anima su view.
    const splitTargets = document.querySelectorAll('[data-split]');
    if (splitTargets.length && !reduce) {
        const splitObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                splitObserver.unobserve(el);
                el.classList.add('js-split');
                // Avvolge solo i nodi di testo, preserva <br> e <span> esistenti (SEO-safe)
                el.querySelectorAll('*:not(.split-word)').forEach(() => {});
                const wrapTextNodes = (node) => {
                    node.childNodes.forEach(child => {
                        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                            const frag = document.createDocumentFragment();
                            child.textContent.split(/(\s+)/).forEach(part => {
                                if (/^\s+$/.test(part)) {
                                    frag.appendChild(document.createTextNode(part));
                                } else if (part) {
                                    const s = document.createElement('span');
                                    s.className = 'split-word';
                                    s.textContent = part;
                                    frag.appendChild(s);
                                }
                            });
                            child.replaceWith(frag);
                        } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('split-word')) {
                            wrapTextNodes(child);
                        }
                    });
                };
                wrapTextNodes(el);
                el.querySelectorAll('.split-word').forEach((w, i) => {
                    w.style.animationDelay = `${i * 55}ms`;
                });
            });
        }, { threshold: 0.3 });
        splitTargets.forEach(el => splitObserver.observe(el));
    }

    // --- 6) Pricing card tilt 3D verso il cursore ---
    const cards = document.querySelectorAll('.pricing-card');
    if (cards.length && finePointer && !reduce) {
        cards.forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                const rotY = px * 7;   // max 7deg
                const rotX = -py * 7;
                card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
                card.classList.add('tilt-active');
            });
            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
                card.classList.remove('tilt-active');
            });
        });
    }

    // --- 2) Count-up numeri hero ---
    // Markup contiene già il valore finale (SEO/no-JS). Con motion attivo
    // conta da 0 al target e riaggiunge il suffisso (/5, %).
    const heroStats = document.querySelectorAll('[data-count-to]');
    if (heroStats.length && !reduce) {
        const runCount = (el) => {
            const target = parseFloat(el.dataset.countTo);
            const suffix = el.dataset.countSuffix || '';
            const decimals = parseInt(el.dataset.countDecimals || '0', 10);
            // Soglia opzionale: i decimali compaiono solo sopra questo valore
            const decimalAfter = el.dataset.countDecimalAfter !== undefined
                ? parseFloat(el.dataset.countDecimalAfter) : null;
            const duration = 2600;
            const start = performance.now();
            const easeOut = (t) => 1 - Math.pow(1 - t, 3); // rallenta verso la fine
            const fmt = (n, done) => {
                // Al valore finale: sempre intero (nessun decimale)
                if (done) return Math.round(n) + suffix;
                // Con soglia: decimali solo oltre la soglia, interi prima
                if (decimalAfter !== null) {
                    return (n > decimalAfter
                        ? n.toFixed(decimals).replace('.', ',')
                        : String(Math.floor(n))) + suffix;
                }
                return n.toFixed(decimals).replace('.', ',') + suffix;
            };
            const step = (now) => {
                const t = Math.min((now - start) / duration, 1);
                if (t < 1) {
                    el.textContent = fmt(target * easeOut(t), false);
                    requestAnimationFrame(step);
                } else {
                    el.textContent = fmt(target, true);
                }
            };
            el.textContent = fmt(0, false);
            requestAnimationFrame(step);
        };
        // Avvio una sola volta: guardia contro doppio trigger
        // (MutationObserver su hero-ready + fallback timeout).
        let started = false;
        const startHeroCount = () => {
            if (started) return;
            started = true;
            heroStats.forEach(runCount);
        };
        // La hero è in cima: avvia quando il preloader esce (classe hero-ready),
        // con fallback se la classe c'è già o il preloader manca.
        if (document.body.classList.contains('hero-ready')) {
            setTimeout(startHeroCount, 300);
        } else {
            const obs = new MutationObserver(() => {
                if (document.body.classList.contains('hero-ready')) {
                    obs.disconnect();
                    setTimeout(startHeroCount, 300);
                }
            });
            obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
            // Fallback di sicurezza: se dopo 2.5s nulla, parte comunque
            setTimeout(() => { obs.disconnect(); startHeroCount(); }, 2500);
        }
    }

})();

// ===== DISTURBI SPECIFICI: SCHEDA DETTAGLIO (contenuto nell'HTML, JS alterna solo la visibilità) =====
// Desktop: elenco a sinistra e scheda a destra. Mobile/tablet: accordion, la scheda si apre sotto la card scelta.
(() => {
    const stage = document.getElementById('conditionsStage');
    if (!stage) return;

    const grid = stage.querySelector('.conditions-grid');
    const detailsWrap = stage.querySelector('.condition-details');
    const cards = Array.from(grid.querySelectorAll('.condition-feature'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMQ = window.matchMedia('(max-width: 991px)');
    const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
    const bySlug = new Map();
    cards.forEach(card => {
        const button = card.querySelector('.condition-start');
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        if (panel) bySlug.set(button.dataset.slug, { card, button, panel });
    });
    let active = null;

    // ---------- Desktop: FLIP, le card scivolano nella nuova posizione ----------
    const flip = (change) => {
        if (reduceMotion.matches) { change(); return; }
        const first = cards.map(c => c.getBoundingClientRect());
        change();
        cards.forEach((c, i) => {
            const last = c.getBoundingClientRect();
            const dx = first[i].left - last.left;
            const dy = first[i].top - last.top;
            if (!dx && !dy) return;
            c.animate(
                [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
                { duration: 320, easing: EASE }
            );
        });
    };

    // ---------- Mobile: la scheda si espande/collassa in altezza ----------
    const expandPanel = (panel) => {
        panel.hidden = false;
        if (reduceMotion.matches) return;
        const h = panel.offsetHeight;
        panel.animate(
            [{ height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }],
            { duration: 300, delay: 60, easing: EASE, fill: 'backwards' }
        );
    };

    const collapsePanel = (panel) => {
        let anim = null;
        const done = () => {
            panel.hidden = true;
            anim?.cancel();
            detailsWrap?.appendChild(panel);
        };
        if (reduceMotion.matches || panel.hidden) { done(); return; }
        const h = panel.offsetHeight;
        anim = panel.animate(
            [{ height: `${h}px`, opacity: 1 }, { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }],
            { duration: 240, easing: EASE, fill: 'forwards' }
        );
        anim.finished.then(done, () => {});
    };

    // Mantiene ferma la card toccata mentre le altre cambiano altezza (Safari non ha il scroll anchoring)
    const holdPosition = (card, duration = 360) => {
        const startTop = card.getBoundingClientRect().top;
        const t0 = performance.now();
        const tick = (now) => {
            const delta = card.getBoundingClientRect().top - startTop;
            if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: 'instant' });
            if (now - t0 < duration) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const scrollToCard = (card) => {
        const top = card.getBoundingClientRect().top;
        if (top < 72 || top > 200) {
            window.scrollTo({ top: top + window.pageYOffset - 96, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    };

    const setActive = (slug, { togglePanels = true } = {}) => {
        bySlug.forEach((item, key) => {
            const on = key === slug;
            item.card.classList.toggle('is-active', on);
            item.button.setAttribute('aria-expanded', String(on));
            if (togglePanels) item.panel.hidden = !on;
            item.panel.classList.remove('is-swapping');
        });
        active = slug;
    };

    const setHash = (slug) => {
        const url = slug ? `#${slug}` : location.pathname + location.search;
        history.replaceState(null, '', url);
    };

    const open = (slug, { updateHash = true, focus = true, scroll = true } = {}) => {
        const item = bySlug.get(slug);
        if (!item || slug === active) return;
        const alreadyOpen = stage.classList.contains('is-open');
        const previous = active ? bySlug.get(active) : null;

        if (mobileMQ.matches) {
            if (previous) collapsePanel(previous.panel);
            item.card.after(item.panel);
            holdPosition(item.card);
            stage.classList.add('is-open');
            setActive(slug, { togglePanels: false });
            expandPanel(item.panel);
            if (scroll) setTimeout(() => scrollToCard(item.card), 380);
        } else if (alreadyOpen) {
            setActive(slug);
            item.panel.classList.add('is-swapping');
            if (scroll) scrollToStage();
        } else {
            flip(() => {
                stage.classList.add('is-open');
                setActive(slug);
            });
            if (scroll) scrollToStage();
        }
        if (updateHash) setHash(slug);
        if (focus) item.panel.querySelector('.condition-detail-title').focus({ preventScroll: true });
    };

    function scrollToStage() {
        const top = stage.getBoundingClientRect().top;
        if (top < 70 || top > window.innerHeight * 0.4) {
            window.scrollTo({ top: top + window.pageYOffset - 112, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    }

    const close = ({ updateHash = true, restoreFocus = true } = {}) => {
        if (!stage.classList.contains('is-open')) return;
        const previous = bySlug.get(active);

        if (mobileMQ.matches) {
            holdPosition(previous.card);
            stage.classList.remove('is-open');
            setActive(null, { togglePanels: false });
            collapsePanel(previous.panel);
        } else {
            flip(() => {
                stage.classList.remove('is-open');
                setActive(null);
            });
        }
        if (updateHash) setHash(null);
        if (restoreFocus) previous?.button.focus({ preventScroll: true });
    };

    // Cambio di breakpoint con una scheda aperta: ripristina lo stato senza animazioni
    mobileMQ.addEventListener('change', () => {
        if (!stage.classList.contains('is-open')) return;
        stage.classList.remove('is-open');
        setActive(null);
        bySlug.forEach(({ panel }) => { panel.getAnimations().forEach(a => a.cancel()); panel.hidden = true; detailsWrap?.appendChild(panel); });
        setHash(null);
    });

    bySlug.forEach((item, slug) => {
        item.button.addEventListener('click', () => open(slug));
        item.panel.querySelector('.condition-detail-close').addEventListener('click', () => close());
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    // Link diretti: /#lipedema apre la scheda corrispondente
    const fromHash = (initial) => {
        const slug = decodeURIComponent(location.hash.slice(1));
        if (bySlug.has(slug)) {
            open(slug, { updateHash: false, focus: !initial, scroll: true });
        } else if (!initial && !slug) {
            close({ updateHash: false, restoreFocus: false });
        }
    };
    window.addEventListener('hashchange', () => fromHash(false));
    if (location.hash) window.addEventListener('load', () => fromHash(true));
})();
