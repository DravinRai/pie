/* ═══════════════════════════════════════════════════════════════
   PIE! — KINETIC TIMEPIECE EDITION
   Vanilla JS + GSAP 3 + ScrollTrigger
   Architecture: Video Scrub Hero + Scroll Reveals + Scrollspy
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

    // ── 4. Hero Overlay Entrance Animation ─────────────────────
    //
    //  Fades in the text overlay elements on page load.
    //  The video itself is frozen at frame 0 until scroll begins.
    //
    const heroEntranceTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });

    heroEntranceTl
        // Eyebrow badge
        .to('.hero-eyebrow', {
            opacity: 1,
            y: 0,
            duration: 0.7
        }, 0)

        // Main title
        .to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out'
        }, 0.2)

        // Description
        .to('.hero-desc', {
            opacity: 1,
            y: 0,
            duration: 0.6
        }, 0.5)

        // Buttons
        .to('.hero-actions', {
            opacity: 1,
            y: 0,
            duration: 0.6
        }, 0.65)

        // Scroll hint
        .to('#heroScrollHint', {
            opacity: 1,
            duration: 0.8
        }, 1.0);

    // ── 5. Kinetic Timepiece — Video Scroll Scrub ──────────────
    //
    //  The #hero section is PINNED for 200% of the viewport.
    //  GSAP scrubs the video's currentTime from 0 → duration
    //  as the user scrolls through the pinned zone.
    //  The text overlay fades out early so the clock takes focus.
    //
    const heroVideo = document.getElementById('hero-video');

    function initVideoScrub() {
        const duration = heroVideo.duration;
        if (!duration || isNaN(duration)) return; // guard: metadata not yet ready

        // Ensure video is paused — GSAP drives playback via currentTime
        heroVideo.pause();
        heroVideo.currentTime = 0;

        // Proxy object that GSAP can tween (video.currentTime is not directly tweenable)
        const videoProxy = { time: 0 };

        const videoScrubTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start:   'top top',
                end:     '+=200%',      // pin distance: 2× viewport height
                pin:     true,
                scrub:   1.5,           // cinematic lag factor
                anticipatePin: 1,
            }
        });

        videoScrubTl
            // Phase 1 (0 → 60%): Scrub video from first frame to last
            .to(videoProxy, {
                time: duration,
                ease: 'none',
                duration: 0.7,
                onUpdate() {
                    heroVideo.currentTime = videoProxy.time;
                }
            }, 0)

            // Phase 2 (0 → 35%): Fade out text overlay so clock takes full focus
            .to('#heroVideoOverlay', {
                opacity: 0,
                y: -40,
                ease: 'power2.in',
                duration: 0.35
            }, 0);
    }

    if (heroVideo) {
        if (heroVideo.readyState >= 1) {
            // Metadata already available (e.g. cached video)
            initVideoScrub();
        } else {
            heroVideo.addEventListener('loadedmetadata', initVideoScrub, { once: true });
        }
    }

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

    console.log('%c🕰️ Pie! — Kinetic Timepiece Edition loaded', 'color: #FF1493; font-weight: bold; font-size: 14px;');
});
