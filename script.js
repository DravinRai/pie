/* ═══════════════════════════════════════════════════
   PIE LANDING PAGE — ANIMATION ENGINE
   GSAP ScrollTrigger + Lenis + Canvas Particles
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Register GSAP plugins ──────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // ── Lenis Smooth Scroll ────────────────────────
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ── Navbar scroll effect ───────────────────────
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    // ── Canvas Particle System (Hero) ──────────────
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 80;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.hue = Math.random() > 0.7 ? 30 : 0; // orange or white
                this.saturation = this.hue > 0 ? '80%' : '0%';
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.pulse += this.pulseSpeed;
                const pulseFactor = Math.sin(this.pulse) * 0.3 + 0.7;
                this.currentOpacity = this.opacity * pulseFactor;
                if (this.x < -10 || this.x > canvas.width + 10 ||
                    this.y < -10 || this.y > canvas.height + 10) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}, 85%, ${this.currentOpacity})`;
                ctx.fill();
                // Glow
                if (this.size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}, 85%, ${this.currentOpacity * 0.1})`;
                    ctx.fill();
                }
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ── Hero Mouse Parallax (Lerp) ─────────────────
    const hero = document.querySelector('.hero');
    const parallaxLayers = document.querySelectorAll('[data-parallax]');
    let lx = 0, ly = 0, tx = 0, ty = 0;

    if (hero && parallaxLayers.length) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            tx = (e.clientX - rect.left - rect.width / 2) / rect.width;
            ty = (e.clientY - rect.top - rect.height / 2) / rect.height;
        });

        hero.addEventListener('mouseleave', () => {
            tx = 0;
            ty = 0;
        });

        (function parallaxRaf() {
            lx += (tx - lx) * 0.06;
            ly += (ty - ly) * 0.06;

            parallaxLayers.forEach(el => {
                const depth = parseFloat(el.dataset.parallax) || 20;
                const moveX = lx * depth;
                const moveY = ly * depth;
                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            requestAnimationFrame(parallaxRaf);
        })();
    }

    // ── Hero Entrance Animation ────────────────────
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        .to('.hero-phone-wrapper', {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: 'power3.out'
        })
        .to('.hero-badge', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.6')
        .to('.hero h1', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.4')
        .to('.hero-description', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4')
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.3')
        .to('.hero-float', {
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out'
        }, '-=0.4');

    // ── Feature Card Spotlight Effect ──────────────
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mx = ((e.clientX - rect.left) / rect.width) * 100;
            const my = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', mx + '%');
            card.style.setProperty('--my', my + '%');
        });
    });

    // ── ScrollTrigger: Feature Cards ───────────────
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // ── ScrollTrigger: Screenshots ─────────────────
    gsap.utils.toArray('.screenshot-card').forEach((card, i) => {
        gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            onComplete: () => card.classList.add('revealed')
        });
    });

    // ── ScrollTrigger: Stats Counter ───────────────
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Animate stat numbers
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const target = parseInt(entry.target.dataset.target);
                const suffix = entry.target.dataset.suffix || '';
                const duration = 2000;
                const start = performance.now();
                
                function updateCount(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);
                    entry.target.textContent = current + suffix;
                    if (progress < 1) requestAnimationFrame(updateCount);
                }
                requestAnimationFrame(updateCount);
            }
        });
    }, { threshold: 0.3 });

    statNumbers.forEach(n => countObserver.observe(n));

    // ── ScrollTrigger: Platform Cards ──────────────
    gsap.utils.toArray('.platform-card').forEach((card, i) => {
        gsap.to(card, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // ── ScrollTrigger: General Reveals ──────────────
    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // ── Scrollspy (Side Nav + Top Nav) ─────────────
    const sections = document.querySelectorAll('section[data-section]');
    const sideNavLinks = document.querySelectorAll('.side-nav a');

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                
                // Update side nav
                sideNavLinks.forEach(a => a.classList.remove('active'));
                const activeLink = document.querySelector(`.side-nav a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, {
        rootMargin: '-35% 0px -60% 0px'
    });

    sections.forEach(s => spyObserver.observe(s));

    // ── CTA Section Reveal ─────────────────────────
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        gsap.fromTo(ctaSection.querySelector('h2'), 
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                scrollTrigger: {
                    trigger: ctaSection,
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    console.log('🥧 Pie Landing — Cinematic Engine Loaded');
});
