document.addEventListener('DOMContentLoaded', () => {

    // ─── THREE.JS NEURAL NETWORK ───

    function initNeuralNetwork() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        canvas.appendChild(renderer.domElement);

        const isMobile = window.innerWidth < 768;
        const NODES = isMobile ? 100 : 280;
        const SPREAD = isMobile ? 16 : 22;
        const CONNECT_DIST = isMobile ? 4.5 : 5.5;

        const positions = new Float32Array(NODES * 3);
        const velocities = [];

        for (let i = 0; i < NODES; i++) {
            positions[i * 3] = (Math.random() - 0.5) * SPREAD;
            positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.7;
            positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.6 - 4;
            velocities.push({
                x: (Math.random() - 0.5) * 0.004,
                y: (Math.random() - 0.5) * 0.003,
                z: (Math.random() - 0.5) * 0.002,
            });
        }

        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const nodeMat = new THREE.PointsMaterial({
            size: isMobile ? 0.06 : 0.045,
            color: 0x00d4ff,
            transparent: true,
            opacity: isMobile ? 0.3 : 0.28,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false,
        });

        const nodes = new THREE.Points(nodeGeo, nodeMat);

        const pairs = [];
        const distSq = CONNECT_DIST * CONNECT_DIST;
        for (let i = 0; i < NODES; i++) {
            for (let j = i + 1; j < NODES; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                if (dx * dx + dy * dy + dz * dz < distSq) {
                    if (Math.random() < 0.12) pairs.push(i, j);
                }
            }
        }

        const edgePositions = new Float32Array(pairs.length * 3);
        const edgeGeo = new THREE.BufferGeometry();
        edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));

        const edgeMat = new THREE.LineBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: isMobile ? 0.06 : 0.05,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const edges = new THREE.LineSegments(edgeGeo, edgeMat);

        const group = new THREE.Group();
        group.add(nodes);
        group.add(edges);
        scene.add(group);

        camera.position.z = 14;

        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);

            const pos = nodeGeo.attributes.position.array;

            for (let i = 0; i < NODES; i++) {
                pos[i * 3] += velocities[i].x;
                pos[i * 3 + 1] += velocities[i].y;
                pos[i * 3 + 2] += velocities[i].z;

                if (Math.abs(pos[i * 3]) > SPREAD / 2) velocities[i].x *= -1;
                if (Math.abs(pos[i * 3 + 1]) > SPREAD / 2 * 0.7) velocities[i].y *= -1;
                if (Math.abs(pos[i * 3 + 2]) > SPREAD / 2 * 0.6) velocities[i].z *= -1;
            }

            nodeGeo.attributes.position.needsUpdate = true;

            for (let i = 0; i < pairs.length; i++) {
                const idx = pairs[i];
                edgePositions[i * 3] = pos[idx * 3];
                edgePositions[i * 3 + 1] = pos[idx * 3 + 1];
                edgePositions[i * 3 + 2] = pos[idx * 3 + 2];
            }
            edgeGeo.attributes.position.needsUpdate = true;

            group.rotation.y += 0.001 + mouseX * 0.0002;
            group.rotation.x += mouseY * 0.00015;

            renderer.render(scene, camera);
        }

        animate();

        function resize() {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }

        window.addEventListener('resize', resize);
    }

    initNeuralNetwork();

    // ─── NAVBAR SCROLL ───

    const navbar = document.getElementById('navbar');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.pageYOffset > 60);
                ticking = false;
            });
            ticking = true;
        }
    });

    // ─── MOBILE NAV ───

    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ─── ACTIVE LINK ───

    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollY = window.pageYOffset + 110;
        sections.forEach(s => {
            const top = s.offsetTop;
            const id = s.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link && scrollY >= top && scrollY < top + s.offsetHeight) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // ─── REVEAL ───

    function initReveal() {
        const el = document.querySelectorAll('.card, .about-grid, .about-stats, .section-header, .cta-inner');
        const cards = document.querySelectorAll('.card');

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        el.forEach((e, i) => {
            e.classList.add('reveal');
            if (e.classList.contains('card')) {
                const cardIdx = [...cards].indexOf(e);
                if (cardIdx >= 0) e.classList.add('reveal-d' + Math.min(cardIdx + 1, 5));
            } else if (i < 4) {
                e.classList.add('reveal-d' + (i + 1));
            }
            obs.observe(e);
        });
    }

    initReveal();

    // ─── COUNTERS ───

    function initCounters() {
        const nums = document.querySelectorAll('.stat-number');
        if (!nums.length) return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const el = e.target;
                    const target = parseInt(el.dataset.target);
                    const suffix = el.dataset.suffix || '';
                    let current = 0;
                    const step = Math.max(1, Math.floor(target / 50));
                    const t = setInterval(() => {
                        current += step;
                        if (current >= target) { current = target; clearInterval(t); }
                        el.textContent = current + (current >= target ? suffix : '');
                    }, 25);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        nums.forEach(n => obs.observe(n));
    }

    initCounters();

    // ─── WHATSAPP FLOAT ───

    const wa = document.querySelector('.whatsapp-float');

    window.addEventListener('scroll', () => {
        wa.classList.toggle('visible', window.pageYOffset > 300);
    });

    // ─── SMOOTH SCROLL ───

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
