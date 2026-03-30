/* ═══════════════════════════════════════════════════════════════
   PIE! — RENAISSANCE ANIMATION ENGINE
   Vanilla JS + GSAP 3 + ScrollTrigger
   Architecture: Mouse Parallax (lerp) + Scroll Scrub + Scrollspy
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 0. Register GSAP plugins ───────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // ── 1. Mark body as loaded (triggers CSS brand underline) ──
    document.body.classList.add('loaded');

    // ── 2. Custom Cursor ───────────────────────────────────────
    const cursorDot  = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    if (cursorDot && cursorRing && window.innerWidth > 640) {
        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;
        let mouseX = 0, mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        (function cursorRaf() {
            // Dot: snaps fast
            dotX += (mouseX - dotX) * 0.55;
            dotY += (mouseY - dotY) * 0.55;
            // Ring: lags behind for elegance
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;

            cursorDot.style.transform  = `translate(${dotX - 3}px, ${dotY - 3}px)`;
            cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
            requestAnimationFrame(cursorRaf);
        })();
    }

    // ── 3. Navbar scroll behaviour ─────────────────────────────
    const navbar = document.getElementById('topNav');
    const scrolledThreshold = 60;

    function updateNavbar() {
        const scrolled = window.scrollY > scrolledThreshold;
        navbar.classList.toggle('scrolled', scrolled);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // ── 4. Canvas Particle System ──────────────────────────────
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W = 0, H = 0;

        function resizeCanvas() {
            W = canvas.width  = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        const PARTICLE_COUNT = 60;

        class Particle {
            constructor() { this.reset(true); }

            reset(init = false) {
                this.x        = Math.random() * W;
                this.y        = init ? Math.random() * H : H + 10;
                this.vx       = (Math.random() - 0.5) * 0.25;
                this.vy       = -(Math.random() * 0.4 + 0.1);
                this.size     = Math.random() * 1.6 + 0.4;
                this.baseAlpha = Math.random() * 0.35 + 0.05;
                this.alpha    = this.baseAlpha;
                this.life     = 0;
                this.maxLife  = Math.random() * 300 + 200;
                // Color: mostly warm parchment, occasional magenta
                this.isMagenta = Math.random() < 0.12;
            }

            update() {
                this.x  += this.vx;
                this.y  += this.vy;
                this.life++;

                // Fade in/out
                const progress = this.life / this.maxLife;
                if (progress < 0.15) {
                    this.alpha = this.baseAlpha * (progress / 0.15);
                } else if (progress > 0.75) {
                    this.alpha = this.baseAlpha * (1 - (progress - 0.75) / 0.25);
                } else {
                    this.alpha = this.baseAlpha;
                }

                if (this.life >= this.maxLife || this.y < -10) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

                if (this.isMagenta) {
                    ctx.fillStyle = `rgb(255, 20, 147)`;
                    // Glow
                    ctx.shadowColor = 'rgba(255, 20, 147, 0.8)';
                    ctx.shadowBlur  = 10;
                } else {
                    ctx.fillStyle = `rgb(214, 201, 176)`;
                }

                ctx.fill();
                ctx.restore();
            }
        }

        const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

        let rafId;
        function animateParticles() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => { p.update(); p.draw(); });
            rafId = requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ── 5. Hero Mouse Parallax (rAF + Lerp) ───────────────────
    //
    //  Each layer has data-depth attribute (0.02 = slow/far, 0.18 = fast/near)
    //  Linear interpolation (lerp): current += (target - current) * factor
    //
    const hero          = document.querySelector('.hero');
    const parallaxLayers = document.querySelectorAll('[data-depth]');

    // Separate lerp targets and currents per axis
    let targetX = 0, targetY = 0;
    const lerpStates = Array.from(parallaxLayers).map(() => ({ x: 0, y: 0 }));

    const LERP_FACTOR = 0.06; // smoothness (lower = more lag)

    if (hero && parallaxLayers.length && window.innerWidth > 900) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            // Normalize to [-1, 1] relative to hero center
            targetX =  (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
            targetY =  (e.clientY - rect.top    - rect.height / 2) / (rect.height / 2);
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
        });

        (function parallaxRaf() {
            parallaxLayers.forEach((layer, i) => {
                const depth = parseFloat(layer.dataset.depth) || 0.1;
                const state = lerpStates[i];

                // Lerp each layer independently
                state.x += (targetX - state.x) * LERP_FACTOR;
                state.y += (targetY - state.y) * LERP_FACTOR;

                const maxPixels = depth * 120; // scale depth to pixel movement
                const moveX = state.x * maxPixels;
                const moveY = state.y * maxPixels;

                // GPU composite — always use translate3d, never top/left
                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });

            requestAnimationFrame(parallaxRaf);
        })();
    }

    // ── 6. Hero Entrance Animation ─────────────────────────────
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

    heroTl
        // Fade in background glows
        .to('.mid-glow', {
            opacity: 1,
            duration: 1.6,
            stagger: 0.25
        }, 0)

        // Center app rises up
        .to('#heroCenterApp', {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power4.out'
        }, 0.2)

        // Eyebrow
        .to('.hero-eyebrow', {
            opacity: 1,
            y: 0,
            duration: 0.7
        }, 0.5)

        // Main title
        .to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out'
        }, 0.72)

        // Description
        .to('.hero-desc', {
            opacity: 1,
            y: 0,
            duration: 0.6
        }, 1.0)

        // Buttons
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 0.6
        }, 1.15)

        // Character images (fade in after layout settles)
        .to('.char-img', {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            stagger: 0.15
        }, 0.8)

        // Character badges
        .to('.char-badge', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15
        }, 1.3)

        // Scroll hint
        .to('#heroScrollHint', {
            opacity: 1,
            duration: 0.8
        }, 1.6);

    // ── 7. Hero ScrollTrigger Scroll-Scrub + Character Fly-in ──
    //
    //  The hero is PINNED. As user scrolls:
    //    - Characters fly inward from offscreen (x: ±340 → 0)
    //    - Center app scales down & fades slightly
    //    - Text content fades & moves up
    //    - EXPLOSION fires at end of timeline (mix-blend-mode: screen)
    //
    const heroScrollTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero',
            start:   'top top',
            end:     '+=180%',      // pinned distance: 1.8× viewport
            pin:     true,
            scrub:   1.5,            // lag factor for cinematic scrub
            anticipatePin: 1,
        }
    });

    heroScrollTl

        // Phase 1 (progress 0 → 0.4): Characters fly in
        .to('#layerCharLeft .char-left', {
            x: 0,
            ease: 'power2.inOut',
            duration: 0.4
        }, 0)

        .to('#layerCharRight .char-right', {
            x: 0,
            ease: 'power2.inOut',
            duration: 0.4
        }, 0)

        // Phase 2 (progress 0.2 → 0.55): Text lifts and fades
        .to('.hero-title, .hero-desc, .hero-actions, .hero-eyebrow', {
            y: -60,
            opacity: 0,
            ease: 'power2.in',
            duration: 0.3
        }, 0.25)

        // Phase 2b: Center app shrinks slightly
        .to('#heroCenterApp', {
            scale: 0.88,
            opacity: 0.6,
            ease: 'power2.inOut',
            duration: 0.35
        }, 0.3)

        // Phase 3 (progress 0.5 → 0.75): Characters converge to center
        .to('#layerCharLeft .char-left', {
            x: '38vw',
            scale: 0.85,
            ease: 'power3.inOut',
            duration: 0.3
        }, 0.45)

        .to('#layerCharRight .char-right', {
            x: '-38vw',
            scale: 0.85,
            ease: 'power3.inOut',
            duration: 0.3
        }, 0.45)

        // Center app fades out
        .to('#heroCenterApp', {
            opacity: 0,
            scale: 0.7,
            ease: 'power3.in',
            duration: 0.25
        }, 0.6)

        // EXPLOSION: appears with mix-blend-mode: screen
        .to('#heroExplosion', {
            opacity: 1,
            ease: 'power2.out',
            duration: 0.15
        }, 0.72)

        .to('.explosion-core', {
            scale: 1,
            ease: 'expo.out',
            duration: 0.3
        }, 0.73)

        .to('.explosion-ring', {
            scale: 1,
            ease: 'expo.out',
            stagger: 0.05,
            duration: 0.3
        }, 0.75)

        // Final fade — everything dims as we leave hero
        .to('.hero', {
            opacity: 0.6,
            ease: 'none',
            duration: 0.2
        }, 0.84);

    // ── 8. CTA Section: clip-path inset wipe animation ─────────
    //
    //  As user scrolls into CTA, the magenta overlay wipes in from bottom
    //  using clip-path: inset(%) — GPU composited, zero layout thrash
    //
    gsap.to('#ctaClipWipe', {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });

    // ── 9. Reveal Animations (all .reveal-up / .reveal-card) ───
    //
    //  Uses IntersectionObserver for lightweight scroll triggering
    //  GSAP handles the actual tween for precision easing
    //
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('pie-revealed')) {
                entry.target.classList.add('pie-revealed');

                // Get stagger delay from CSS custom property if present
                const delay = parseFloat(
                    getComputedStyle(entry.target).getPropertyValue('--card-delay')
                ) || 0;

                gsap.to(entry.target, {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    delay: delay,
                    ease: 'power3.out'
                });

                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal-up, .reveal-card').forEach(el => {
        revealObserver.observe(el);
    });

    // ── 10. Stat Counter ───────────────────────────────────────
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                countUp(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        statObserver.observe(el);
    });

    function countUp(el) {
        const target   = parseInt(el.dataset.target, 10);
        const suffix   = el.dataset.suffix || '';
        const duration = 2200; // ms
        const start    = performance.now();

        function tick(now) {
            const t        = Math.min(1, (now - start) / duration);
            const eased    = 1 - Math.pow(1 - t, 4); // ease-out-quart
            const current  = Math.round(eased * target);
            el.textContent = current + suffix;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ── 11. Feature Card Spotlight (mouse-follow gradient) ─────
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width)  * 100;
            const y = ((e.clientY - rect.top)  / rect.height) * 100;
            card.style.setProperty('--mx', `${x}%`);
            card.style.setProperty('--my', `${y}%`);
        }, { passive: true });
    });

    // ── 12. Gallery Card tilt on hover ─────────────────────────
    document.querySelectorAll('.gallery-img-wrap').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dx   = (e.clientX - cx) / (rect.width  / 2);
            const dy   = (e.clientY - cy) / (rect.height / 2);
            const rotX = -dy * 4;
            const rotY =  dx * 4;
            card.style.transform = `
                translateY(-8px) scale(1.02)
                rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)
            `;
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'none';
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform  = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
        });
    });

    // ── 13. Scrollspy — Side Nav IntersectionObserver ──────────
    //
    //  rootMargin: the "sweet spot" window.
    //  When a section crosses -30% from top to -65% from bottom,
    //  it is considered "active". This creates crisp transitions.
    //
    const sections      = document.querySelectorAll('section[data-section]');
    const sideNavItems  = document.querySelectorAll('.side-nav-item');

    function setActiveNav(id) {
        sideNavItems.forEach(a => {
            const isActive = a.dataset.target === id;
            a.classList.toggle('active', isActive);
        });
    }

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveNav(entry.target.id);
            }
        });
    }, {
        rootMargin: '-30% 0px -65% 0px',
        threshold: 0
    });

    sections.forEach(s => spyObserver.observe(s));

    // ── 14. Smooth anchor scroll (native with offset) ──────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();

            // Account for pinned hero: if targeting a section below hero,
            // we need to scroll past the pin trigger + pin distance
            const heroSection = document.getElementById('hero');
            const heroTrigger = ScrollTrigger.getById
                ? null
                : ScrollTrigger.getAll().find(t => t.trigger === heroSection);

            const offset = 0;
            const y = target.getBoundingClientRect().top + window.scrollY - offset;

            gsap.to(window, {
                scrollTo: { y, autoKill: false },
                duration: 1.1,
                ease: 'power3.inOut',
                onStart() {
                    // gsap ScrollTo plugin not loaded — fallback
                    if (typeof gsap.to === 'undefined') {
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            });

            // Plain fallback
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });

    // ── 15. Nav CTA magnetic button effect ─────────────────────
    const magneticBtns = document.querySelectorAll('.nav-cta, .btn-primary');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect   = btn.getBoundingClientRect();
            const cx     = rect.left + rect.width  / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = (e.clientX - cx) * 0.25;
            const dy     = (e.clientY - cy) * 0.25;
            gsap.to(btn, {
                x: dx,
                y: dy,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

    // ── 16. ScrollTrigger: Section entrance lines ───────────────
    //  Animate the kicker lines into view via clip-path
    gsap.utils.toArray('.section-kicker').forEach(el => {
        gsap.fromTo(el,
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)',
                duration: 0.9,
                ease: 'power3.inOut',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ── 17. Platform cards stagger ─────────────────────────────
    gsap.utils.toArray('.platform-card').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50, rotateX: 8 },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.85,
                delay: i * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ── 18. Manifesto quote line-by-line reveal ─────────────────
    const manifestoQ = document.querySelector('.manifesto-quote');
    if (manifestoQ) {
        gsap.fromTo(manifestoQ,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: manifestoQ,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // ── 19. Features grid clip-path wipe (per-card) ──────────────
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.fromTo(card,
            {
                clipPath: 'inset(100% 0 0 0)',
                opacity: 0
            },
            {
                clipPath: 'inset(0% 0 0 0)',
                opacity: 1,
                duration: 0.85,
                delay: i * 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    console.log('%c🥧 Pie! — Renaissance Edition loaded', 'color: #FF1493; font-weight: bold; font-size: 14px;');
});
