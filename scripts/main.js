/**
 * Coaching with Michelle - Main Scripts
 * Handles sticky header, hamburger nav, dropdowns, scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.main-header');
    const mainNav = document.querySelector('.main-nav');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── 1. Sticky Header ──────────────────────────────────────────────
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('sticky', window.scrollY > 50);
        }, { passive: true });
    }

    // ── 2. Hamburger Button (use existing HTML element or inject) ─────
    if (header && mainNav) {
        // Use the hamburger already in HTML if present; otherwise inject one
        let btn = header.querySelector('.hamburger');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'hamburger';
            btn.setAttribute('aria-label', 'Toggle navigation menu');
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '<span></span><span></span><span></span>';
            header.insertBefore(btn, mainNav);
        }

        // ── 3. Hamburger toggle ───────────────────────────────────────
        btn.addEventListener('click', () => {
            const isOpen = btn.classList.toggle('open');
            mainNav.classList.toggle('nav-open', isOpen);
            btn.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close nav when any non-dropdown link is clicked
        mainNav.querySelectorAll('a').forEach(link => {
            if (!link.closest('.has-dropdown') || link.closest('.dropdown-content')) {
                link.addEventListener('click', () => {
                    btn.classList.remove('open');
                    mainNav.classList.remove('nav-open');
                    btn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            }
        });

        // Close nav on outside click
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target)) {
                btn.classList.remove('open');
                mainNav.classList.remove('nav-open');
                btn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // ── 4. Dropdown Navigation ────────────────────────────────────────
    document.querySelectorAll('.has-dropdown').forEach(item => {
        const panel = item.querySelector('.dropdown-content');
        const trigger = item.querySelector('a');
        if (!panel) return;

        const isMobile = () => window.innerWidth <= 900;
        let closeTimer = null;

        // Desktop: hover
        const openDesktop = () => {
            if (isMobile()) return;
            clearTimeout(closeTimer);
            panel.style.visibility = 'visible';
            panel.style.opacity = '1';
            panel.style.pointerEvents = 'auto';
        };
        const closeDesktop = () => {
            if (isMobile()) return;
            closeTimer = setTimeout(() => {
                panel.style.visibility = 'hidden';
                panel.style.opacity = '0';
                panel.style.pointerEvents = 'none';
            }, 300);
        };

        item.addEventListener('mouseenter', openDesktop);
        item.addEventListener('mouseleave', closeDesktop);
        panel.addEventListener('mouseenter', openDesktop);
        panel.addEventListener('mouseleave', closeDesktop);

        // Mobile: tap trigger link to expand dropdown inline
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                if (!isMobile()) return;
                e.preventDefault();
                panel.classList.toggle('mobile-open');
            });
        }
    });

    // ── 5. Scroll Reveal Animations ───────────────────────────────────
    const interactivePanels = [
        '.hero-glass-card',
        '.ecosystem-card',
        '.newsletter-container',
        '.book-form-wrap',
        '.book-testimonial',
        '.faq-item',
        '.mission-quote',
        '.value-card',
        '.feature-card',
        '.product-card',
        '.guide-step',
        '.week-card',
        '.price-card',
        '.invitation-card',
        '.vip-tier-card',
        '.profound-card',
        '.legal-toc',
        '.legal-section',
        '.legal-contact-box',
        '.event-card',
        '.register-card',
        '.expect-item',
        '.program-card',
        '.checkout-gate-card'
    ];
    const interactiveMedia = [
        '.bio-photo-wrap',
        '.ecosystem-image-wrap',
        '.footer-banner-image',
        '.hero-image'
    ];
    const interactiveInline = [
        '.payment-option label',
        '.support-item',
        '.legal-toc a',
        '.expect-list li',
        '.trust-item'
    ];

    const applyClassToSelectors = (selectors, className) => {
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.classList.add(className);
            });
        });
    };

    applyClassToSelectors(interactivePanels, 'interactive-panel');
    applyClassToSelectors(interactiveMedia, 'interactive-media');
    applyClassToSelectors(interactiveInline, 'interactive-inline');

    const revealSelectors = [
        '.page-hero > .container > *',
        '.hero-content > *',
        '.support-item',
        '.hero-glass-card',
        '.ecosystem-card',
        '.ecosystem-step',
        '.product-card',
        '.value-card',
        '.guide-step',
        '.feature-card',
        '.bio-photo-wrap',
        '.bio-text > *',
        '.newsletter-container > *',
        '.book-info > *',
        '.book-form-wrap',
        '.expect-list li',
        '.trust-item',
        '.week-card',
        '.price-card',
        '.faq-item',
        '.invitation-card',
        '.vip-tier-card',
        '.mission-quote',
        '.cta-banner > *',
        '.event-card',
        '.register-card',
        '.expect-item',
        '.legal-toc',
        '.legal-section',
        '.program-card',
        '.checkout-gate-card'
    ];

    const revealElements = new Set();
    revealSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => revealElements.add(element));
    });

    if (prefersReducedMotion) {
        revealElements.forEach(element => element.classList.add('revealed'));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-on-scroll', 'revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        );

        revealElements.forEach((element, index) => {
            element.classList.add('reveal-on-scroll');
            element.style.transitionDelay = `${Math.min(index % 6, 5) * 0.06}s`;
            revealObserver.observe(element);
        });
    }

    // ── 6. Smooth Scrolling ───────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── 7. Newsletter Form ────────────────────────────────────────────
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            const button = newsletterForm.querySelector('button');
            if (input && input.value && button) {
                const originalText = button.innerHTML;
                button.innerHTML = 'Subscribed!';
                button.style.backgroundColor = 'var(--primary)';
                input.value = '';
                input.disabled = true;
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                    input.disabled = false;
                }, 3000);
            }
        });
    }
});
