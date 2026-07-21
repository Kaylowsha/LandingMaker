document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // SISTEMA DE PARTÍCULAS CONECTADAS
    // ============================================
    const canvas = document.getElementById('particle-canvas');

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };
        let animationId;
        let isActive = true;

        // Configuración de partículas
        const config = {
            particleCount: window.innerWidth < 768 ? 60 : 120,  // Menos en móvil
            connectionDistance: 120,
            mouseConnectionDistance: 200,
            particleSpeed: 0.5,
            particleSize: { min: 1, max: 3 },
            colors: ['#00d2ff', '#9d50bb', '#00f2fe', '#ffffff'],
            lineOpacity: 0.15,
            mouseLineOpacity: 0.4
        };

        // Redimensionar canvas
        const resizeCanvas = () => {
            const hero = document.querySelector('.hero');
            if (hero) {
                canvas.width = hero.offsetWidth;
                canvas.height = hero.offsetHeight;
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Clase Partícula
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * config.particleSpeed;
                this.vy = (Math.random() - 0.5) * config.particleSpeed;
                this.size = Math.random() * (config.particleSize.max - config.particleSize.min) + config.particleSize.min;
                this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
            }

            update() {
                // Movimiento base
                this.x += this.vx;
                this.y += this.vy;

                // Rebote en bordes
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Interacción con el mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = forceDirectionX * force * this.density;
                        const directionY = forceDirectionY * force * this.density;

                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.6;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Brillo alrededor de la partícula
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 3
                );
                gradient.addColorStop(0, this.color + '20');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        // Inicializar partículas
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        };

        initParticles();

        // Dibujar conexiones entre partículas
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * config.lineOpacity;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 210, 255, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Conexiones con el mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.mouseConnectionDistance) {
                        const opacity = (1 - distance / config.mouseConnectionDistance) * config.mouseLineOpacity;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animación principal
        const animate = () => {
            if (!isActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dibujar conexiones primero (detrás de las partículas)
            drawConnections();

            // Actualizar y dibujar partículas
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationId = requestAnimationFrame(animate);
        };

        // Eventos del mouse
        const heroSection = document.querySelector('.hero');

        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });

            heroSection.addEventListener('mouseleave', () => {
                mouse.x = null;
                mouse.y = null;
            });

            // Detectar cuando el hero está visible para pausar/reanudar
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        isActive = true;
                        animate();
                    } else {
                        isActive = false;
                        if (animationId) cancelAnimationFrame(animationId);
                    }
                });
            }, { threshold: 0.1 });

            heroObserver.observe(heroSection);
        }

        // Touch support para móvil
        if (heroSection) {
            heroSection.addEventListener('touchmove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const touch = e.touches[0];
                mouse.x = touch.clientX - rect.left;
                mouse.y = touch.clientY - rect.top;
            }, { passive: true });

            heroSection.addEventListener('touchend', () => {
                mouse.x = null;
                mouse.y = null;
            });
        }

        // Iniciar animación
        animate();
    }

    // ============================================
    // CÓDIGO EXISTENTE (sin cambios)
    // ============================================

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

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
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

    // Smooth Scroll for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
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

    // Count-up animation for stats
    const animateCount = (el) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1500;
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = `${prefix}${target % 1 === 0 ? Math.floor(value) : value.toFixed(1)}${suffix}`;
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