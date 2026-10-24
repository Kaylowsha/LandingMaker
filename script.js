// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Auto-update copyright year (SEO: keeps content fresh)
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Navbar Scroll Effect + Scroll Progress Bar
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scroll-progress-bar');

    const updateScroll = () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            progressBar.style.width = `${percent}%`;
        }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    // Back to top button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Mobile Menu Toggle (uses CSS class instead of inline styles)
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    const closeMobileMenu = () => {
        navLinks.classList.remove('open');
        mobileMenu.setAttribute('aria-expanded', 'false');
    };

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            const willOpen = !navLinks.classList.contains('open');
            navLinks.classList.toggle('open', willOpen);
            mobileMenu.setAttribute('aria-expanded', String(willOpen));
        });

        // Close menu when clicking a link or a view button
        navLinks.querySelectorAll('a, button').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    // FAQ Accordion (with ARIA + keyboard support)
    const faqItems = document.querySelectorAll('.faq-item');
    const toggleFaq = (item) => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            const q = otherItem.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
            item.classList.add('active');
            const q = item.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'true');
        }
    };

    faqItems.forEach(item => {
        item.addEventListener('click', () => toggleFaq(item));
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFaq(item);
                }
            });
        }
    });

    // Basic Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass, .step, .section-header').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Count-up animation for stats. Starts from the number already in the HTML
    // so the final value is visible even if this script never runs.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animateCount = (el) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const match = (el.textContent || '').replace(',', '.').match(/[\d.]+/);
        const from = match ? parseFloat(match[0]) : 0;
        const format = (value) => {
            const shown = target % 1 === 0 ? Math.round(value) : Number(value).toFixed(1);
            return `${prefix}${shown}${suffix}`;
        };
        if (!Number.isFinite(target) || reduceMotion || from === target) {
            if (Number.isFinite(target)) el.textContent = format(target);
            return;
        }
        const duration = 1500;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = from + (target - from) * eased;
            el.textContent = progress === 1 ? format(target) : format(value);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

    // Portfolio filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item[data-category]');
    const portfolioGrid = document.querySelector('.portfolio-grid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (filter === 'all') {
                portfolioGrid.classList.remove('filtered');
                portfolioItems.forEach(item => item.classList.remove('hidden'));
            } else {
                portfolioGrid.classList.add('filtered');
                portfolioItems.forEach(item => {
                    item.classList.toggle('hidden', item.dataset.category !== filter);
                });
            }
        });
    });

    // Mobile CTA bar — uses the hero of the view that is actually visible
    const mobileCta = document.getElementById('mobile-cta-bar');
    const syncMobileCta = () => {
        if (!mobileCta) return;
        const activeHero = document.querySelector('.site-view:not([hidden]) .hero');
        if (!activeHero) return;
        mobileCta.classList.toggle('visible', activeHero.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener('scroll', syncMobileCta, { passive: true });
    syncMobileCta();

    // Hero slideshow
    const heroSlideshow = document.getElementById('hero-slideshow');
    if (heroSlideshow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const images = heroSlideshow.dataset.images.split(',');
        const heroImg = heroSlideshow.querySelector('img');
        let heroIndex = 0;
        setInterval(() => {
            heroImg.style.opacity = '0';
            setTimeout(() => {
                heroIndex = (heroIndex + 1) % images.length;
                heroImg.src = images[heroIndex];
                heroImg.style.opacity = '1';
            }, 400);
        }, 3000);
    }

    // Timeline del proceso: se dibuja al entrar en viewport
    document.querySelectorAll('.process').forEach(processSection => {
        const processObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    processSection.classList.add('in-view');
                    processObserver.disconnect();
                }
            });
        }, { threshold: 0.35 });
        processObserver.observe(processSection);
    });

    // Contact form → WhatsApp
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('cf-nombre').value.trim();
            const interes = document.getElementById('cf-interes').value.trim();
            const mensaje = document.getElementById('cf-mensaje').value.trim();
            if (!nombre || !interes || !mensaje) return;
            const text = `Hola Austral Prints 3D, te escribo desde el sitio.\n\n*Nombre:* ${nombre}\n*Me interesa:* ${interes}\n*Mensaje:* ${mensaje}`;
            window.open(`https://wa.me/56922050705?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    // Vista: Impresión 3D (#3d, default) o Diseño Web (#webs)
    const WEB_HASHES = new Set(['webs', 'inicio-web', 'servicios', 'proyectos', 'precios', 'proceso', 'testimonios', 'faq']);
    const GUIDE_IDS = ['como-pedir', 'precios-cantidad', 'pla-petg', 'clubes', 'faq-3d'];
    const SCROLL_IDS = new Set([
        'kit-fauna', 'productos', 'materiales', 'contacto', 'guia-3d',
        ...GUIDE_IDS,
        'inicio-web', 'servicios', 'proyectos', 'precios', 'proceso', 'testimonios', 'faq'
    ]);
    const showGuide = (id) => {
        if (!GUIDE_IDS.includes(id)) return;
        document.querySelectorAll('.guide-panel').forEach(panel => {
            panel.hidden = panel.id !== id;
        });
        document.querySelectorAll('[data-guide]').forEach(tab => {
            const on = tab.getAttribute('data-guide') === id;
            tab.classList.toggle('active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            if (tab.getAttribute('role') === 'tab') tab.tabIndex = on ? 0 : -1;
        });
    };
    const view3d = document.getElementById('view-3d');
    const viewWebs = document.getElementById('webs');
    const viewAnnouncer = document.getElementById('view-announcer');
    let currentView = '3d';
    let routeReady = false;

    const revealVisible = () => {
        document.querySelectorAll('.site-view:not([hidden]) .glass, .site-view:not([hidden]) .step, .site-view:not([hidden]) .section-header').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight * 0.95) {
                el.classList.add('fade-in');
                el.style.opacity = '';
            }
        });
    };

    const applyRoute = () => {
        const id = (location.hash || '').replace(/^#/, '');
        const view = WEB_HASHES.has(id) ? 'webs' : (id === 'contacto' ? currentView : '3d');
        currentView = view;
        if (view3d && viewWebs) {
            view3d.hidden = view !== '3d';
            viewWebs.hidden = view !== 'webs';
        }
        document.documentElement.classList.remove('boot-webs');
        document.querySelectorAll('[data-view]').forEach(el => {
            const on = el.dataset.view === view;
            el.classList.toggle('is-active', on);
            if (el.classList.contains('filter-btn')) el.classList.toggle('active', on);
            if (el.getAttribute('role') === 'tab') {
                el.setAttribute('aria-selected', on ? 'true' : 'false');
                el.tabIndex = on ? 0 : -1;
            } else {
                el.setAttribute('aria-pressed', on ? 'true' : 'false');
            }
        });
        if (routeReady && viewAnnouncer) {
            viewAnnouncer.textContent = view === '3d' ? 'Mostrando Impresión 3D' : 'Mostrando Diseño Web';
        }
        const behavior = reduceMotion ? 'auto' : 'smooth';
        const scrollNow = () => {
            if (!routeReady && !id) {
                revealVisible();
                syncMobileCta();
                return;
            }
            if (GUIDE_IDS.includes(id)) {
                showGuide(id);
                const tabs = document.querySelector('.guide-tabs');
                const navH = document.getElementById('navbar').offsetHeight;
                if (tabs) {
                    const top = tabs.getBoundingClientRect().top + window.scrollY - navH - 16;
                    window.scrollTo({ top: Math.max(0, top), behavior });
                }
            } else if (SCROLL_IDS.has(id)) {
                const target = document.getElementById(id);
                if (target) target.scrollIntoView({ behavior, block: 'start' });
            } else if (id === '3d' || id === 'webs' || id === 'inicio') {
                window.scrollTo({ top: 0, behavior });
            }
            revealVisible();
            syncMobileCta();
        };
        requestAnimationFrame(scrollNow);
        setTimeout(scrollNow, 60);
        routeReady = true;
    };

    document.querySelectorAll('[data-hash]').forEach(btn => {
        btn.addEventListener('click', () => {
            const hash = btn.getAttribute('data-hash');
            if (!hash) return;
            if (location.hash === hash) applyRoute();
            else location.hash = hash;
            if (typeof closeMobileMenu === 'function') closeMobileMenu();
        });
    });

    document.querySelectorAll('[role="tablist"]').forEach(list => {
        const tabs = [...list.querySelectorAll('[role="tab"]')];
        tabs.forEach((tab, index) => {
            tab.addEventListener('keydown', (e) => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();
                let next = index;
                if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
                if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                if (e.key === 'Home') next = 0;
                if (e.key === 'End') next = tabs.length - 1;
                tabs[next].focus();
                tabs[next].click();
            });
        });
    });

    window.addEventListener('hashchange', applyRoute);
    applyRoute();

    // 3D Tilt effect on portfolio cards (skip if reduced motion)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.portfolio-item').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) - 0.5;
                const y = ((e.clientY - rect.top) / rect.height) - 0.5;
                card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Modal Gallery Logic (with focus trap, ESC, arrow keys, dot a11y)
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.getElementById('prev-img');
    const nextBtn = document.getElementById('next-img');
    const dotsContainer = document.querySelector('.gallery-dots');

    let currentImages = [];
    let currentIndex = 0;
    let lastFocusedCard = null;

    const updateGallery = () => {
        modalImg.src = currentImages[currentIndex];
        modalImg.alt = `Imagen ${currentIndex + 1} de ${currentImages.length}`;
        dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', String(isActive));
            dot.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    };

    const openModal = (card) => {
        currentImages = card.getAttribute('data-images').split(',');
        currentIndex = 0;
        lastFocusedCard = card;

        dotsContainer.innerHTML = '';
        currentImages.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.classList.add('dot');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
            dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateGallery();
            });
            dotsContainer.appendChild(dot);
        });

        updateGallery();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedCard) lastFocusedCard.focus();
    };

    document.querySelectorAll('.pwa-card').forEach(card => {
        card.addEventListener('click', () => openModal(card));
    });

    closeBtn.addEventListener('click', closeModal);

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateGallery();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateGallery();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Keyboard: ESC closes, arrows navigate, Tab is trapped
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            updateGallery();
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % currentImages.length;
            updateGallery();
        } else if (e.key === 'Tab') {
            const focusables = modal.querySelectorAll('button, [tabindex="0"]');
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
});
