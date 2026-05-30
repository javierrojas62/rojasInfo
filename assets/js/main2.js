(() => {
    'use strict';

    // ─── NAVBAR ───────────────────────────────────────────

    const navHeader  = document.getElementById('nav-header');
    const navToggle  = document.getElementById('nav-toggle');
    const navMenu    = document.getElementById('nav-menu');
    const navLinks   = document.querySelectorAll('.nav-link');

    // Scroll state
    let lastY = 0;
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                navHeader.classList.toggle('scrolled', y > 40);
                lastY = y;
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile nav
    function closeNav() {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(link => link.addEventListener('click', closeNav));

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            closeNav();
        }
    });

    // Keyboard: Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) closeNav();
    });

    // ─── ACTIVE LINK ──────────────────────────────────────

    const sections = document.querySelectorAll('section[id], div[id]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === `#${id}`
                    );
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));

    // ─── REVEAL ON SCROLL ─────────────────────────────────

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // ─── COUNTERS ─────────────────────────────────────────

    function animateCounter(el) {
        const target  = parseInt(el.dataset.target, 10);
        const suffix  = el.dataset.suffix || '';
        const duration = 1200;
        const step     = Math.max(1, Math.floor(target / (duration / 20)));

        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current + (current >= target ? suffix : '');
        }, 20);
    }

    const counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

    // ─── WHATSAPP FLOAT ───────────────────────────────────

    const waFloat = document.getElementById('wa-float');

    const waObs = new IntersectionObserver((entries) => {
        // Show float once hero is out of view
        waFloat.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0.1 });

    const heroSection = document.getElementById('hero');
    if (heroSection) waObs.observe(heroSection);

    // ─── SMOOTH SCROLL ────────────────────────────────────

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ─── CURSOR FOLLOW ON CARDS (subtle glow) ─────────────

    document.querySelectorAll('.svc-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
            const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
            card.style.setProperty('--mx', `${x}%`);
            card.style.setProperty('--my', `${y}%`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.removeProperty('--mx');
            card.style.removeProperty('--my');
        });
    });

})();
