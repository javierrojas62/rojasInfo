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

    // ─── RED NEURONAL — fondo animado (canvas) ────────────

    (() => {
        const canvas = document.getElementById('neural-canvas');
        if (!canvas) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ctx = canvas.getContext('2d', { alpha: true });

        let w, h, dpr, nodes = [], raf = null, running = true;
        const mouse = { x: -9999, y: -9999 };

        const COLORS = ['34,211,238', '129,140,248', '232,121,249']; // cian, índigo, magenta
        const LINK_DIST = 150;

        function nodeCount() {
            // Densidad según superficie, acotada para rendimiento
            return Math.min(90, Math.max(28, Math.round((w * h) / 22000)));
        }

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth = window.innerWidth;
            h = canvas.clientHeight = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            spawn();
        }

        function spawn() {
            const count = nodeCount();
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                r: Math.random() * 1.6 + 0.6,
                c: COLORS[(Math.random() * COLORS.length) | 0]
            }));
        }

        function step() {
            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;

                // Enlaces entre nodos cercanos
                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const dx = n.x - m.x, dy = n.y - m.y;
                    const d = Math.hypot(dx, dy);
                    if (d < LINK_DIST) {
                        const a = (1 - d / LINK_DIST) * 0.18;
                        ctx.strokeStyle = `rgba(${n.c},${a})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(m.x, m.y);
                        ctx.stroke();
                    }
                }

                // Enlace hacia el cursor (interacción sutil)
                const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
                const md = Math.hypot(mdx, mdy);
                if (md < 180) {
                    const a = (1 - md / 180) * 0.32;
                    ctx.strokeStyle = `rgba(${n.c},${a})`;
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // Nodo
                ctx.fillStyle = `rgba(${n.c},0.85)`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }

            if (running) raf = requestAnimationFrame(step);
        }

        function start() { if (!running) { running = true; raf = requestAnimationFrame(step); } }
        function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

        if (reduceMotion) {
            // Cuadro estático único, sin bucle
            resize(); running = false; step();
            return;
        }

        window.addEventListener('resize', () => { resize(); }, { passive: true });
        window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        window.addEventListener('pointerout', () => { mouse.x = -9999; mouse.y = -9999; });
        document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

        resize();
        raf = requestAnimationFrame(step);
    })();

})();
