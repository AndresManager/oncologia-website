/* ============================================
   ONCOLOGIA - Core Animation System
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // SCROLL REVEAL
    // ============================================
    class ScrollReveal {
        constructor() {
            this.elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
            this.init();
        }

        init() {
            if (!this.elements.length) return;

            const options = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, options);

            this.elements.forEach(el => observer.observe(el));
        }
    }

    // ============================================
    // ANIMATED COUNTER
    // ============================================
    class AnimatedCounter {
        constructor(element) {
            this.element = element;
            this.target = parseFloat(element.dataset.target) || 0;
            this.duration = parseInt(element.dataset.duration) || 2000;
            this.prefix = element.dataset.prefix || '';
            this.suffix = element.dataset.suffix || '';
            this.decimals = parseInt(element.dataset.decimals) || 0;
            this.hasAnimated = false;
        }

        animate() {
            if (this.hasAnimated) return;
            this.hasAnimated = true;

            const startTime = performance.now();
            const startValue = 0;

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.duration, 1);

                // Easing function (ease-out-expo)
                const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const currentValue = startValue + (this.target - startValue) * easeOutExpo;

                this.element.textContent = this.prefix + currentValue.toFixed(this.decimals) + this.suffix;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        }

        static initAll() {
            const counters = document.querySelectorAll('[data-counter]');

            if (!counters.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = new AnimatedCounter(entry.target);
                        counter.animate();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }
    }

    // ============================================
    // MAGNETIC BUTTONS
    // ============================================
    class MagneticButton {
        constructor(element) {
            this.element = element;
            this.strength = parseFloat(element.dataset.magneticStrength) || 0.3;
            this.init();
        }

        init() {
            this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
        }

        handleMouseMove(e) {
            const rect = this.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * this.strength;
            const deltaY = (e.clientY - centerY) * this.strength;

            this.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }

        handleMouseLeave() {
            this.element.style.transform = 'translate(0, 0)';
        }

        static initAll() {
            document.querySelectorAll('.btn-magnetic').forEach(btn => {
                new MagneticButton(btn);
            });
        }
    }

    // ============================================
    // RIPPLE EFFECT
    // ============================================
    class RippleEffect {
        static init() {
            document.querySelectorAll('.btn-ripple').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const ripple = document.createElement('span');
                    ripple.className = 'ripple-effect';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';

                    this.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            });
        }
    }

    // ============================================
    // CUSTOM CURSOR
    // ============================================
    class CustomCursor {
        constructor() {
            this.cursor = null;
            this.cursorDot = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.cursorX = 0;
            this.cursorY = 0;
            this.init();
        }

        init() {
            // Only on desktop
            if (window.innerWidth <= 768) return;

            // Create cursor elements
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            document.body.appendChild(this.cursor);

            this.cursorDot = document.createElement('div');
            this.cursorDot.className = 'custom-cursor-dot';
            document.body.appendChild(this.cursorDot);

            // Event listeners
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

            // Hover effects
            const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover], input, textarea, select');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => this.cursor.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => this.cursor.classList.remove('cursor-hover'));
            });

            // Animation loop
            this.animate();
        }

        handleMouseMove(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Dot follows immediately
            this.cursorDot.style.left = this.mouseX + 'px';
            this.cursorDot.style.top = this.mouseY + 'px';
        }

        animate() {
            // Smooth follow for main cursor
            this.cursorX += (this.mouseX - this.cursorX) * 0.15;
            this.cursorY += (this.mouseY - this.cursorY) * 0.15;

            this.cursor.style.left = this.cursorX + 'px';
            this.cursor.style.top = this.cursorY + 'px';

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // CARD TILT
    // ============================================
    class CardTilt {
        constructor(element) {
            this.element = element;
            this.maxTilt = parseFloat(element.dataset.tiltMax) || 10;
            this.init();
        }

        init() {
            this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.element.addEventListener('mouseleave', () => this.handleMouseLeave());
        }

        handleMouseMove(e) {
            const rect = this.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const percentX = (e.clientX - centerX) / (rect.width / 2);
            const percentY = (e.clientY - centerY) / (rect.height / 2);

            const tiltX = -percentY * this.maxTilt;
            const tiltY = percentX * this.maxTilt;

            this.element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        handleMouseLeave() {
            this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        }

        static initAll() {
            document.querySelectorAll('.tilt-card').forEach(card => {
                new CardTilt(card);
            });
        }
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    class SmoothScroll {
        static init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;

                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
    }

    // ============================================
    // HEADER SCROLL
    // ============================================
    class HeaderScroll {
        constructor() {
            this.header = document.querySelector('header');
            this.scrollThreshold = 50;
            this.init();
        }

        init() {
            if (!this.header) return;

            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Initial check
            this.handleScroll();
        }

        handleScroll() {
            if (window.scrollY > this.scrollThreshold) {
                this.header.classList.add('header-scrolled');
            } else {
                this.header.classList.remove('header-scrolled');
            }
        }
    }

    // ============================================
    // ACCORDION
    // ============================================
    class Accordion {
        constructor(element) {
            this.element = element;
            this.trigger = element.querySelector('.accordion-trigger');
            this.content = element.querySelector('.accordion-content');
            this.init();
        }

        init() {
            if (!this.trigger || !this.content) return;

            this.trigger.addEventListener('click', () => this.toggle());
        }

        toggle() {
            this.element.classList.toggle('active');

            if (this.element.classList.contains('active')) {
                this.content.style.maxHeight = this.content.scrollHeight + 'px';
            } else {
                this.content.style.maxHeight = '0';
            }
        }

        static initAll() {
            document.querySelectorAll('.accordion-item').forEach(item => {
                new Accordion(item);
            });
        }
    }

    // ============================================
    // PROGRESS BARS
    // ============================================
    class ProgressBar {
        static initAll() {
            const progressBars = document.querySelectorAll('.progress-bar-animated');

            if (!progressBars.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            progressBars.forEach(bar => observer.observe(bar));
        }
    }

    // ============================================
    // PAGE TRANSITIONS
    // ============================================
    class PageTransition {
        constructor() {
            this.overlay = null;
            this.init();
        }

        init() {
            // Create overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'page-transition-overlay';
            document.body.appendChild(this.overlay);

            // Intercept link clicks
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');

                // Only handle internal links
                if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.navigateTo(href);
                    });
                }
            });
        }

        navigateTo(url) {
            this.overlay.classList.add('active');

            setTimeout(() => {
                window.location.href = url;
            }, 400);
        }
    }

    // ============================================
    // LOADING SCREEN
    // ============================================
    class LoadingScreen {
        constructor() {
            this.screen = document.querySelector('.loading-screen');
            if (this.screen) {
                this.hide();
            }
        }

        hide() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.screen.classList.add('hidden');
                }, 500);
            });
        }
    }

    // ============================================
    // PARALLAX EFFECT
    // ============================================
    class Parallax {
        static init() {
            const elements = document.querySelectorAll('[data-parallax]');

            if (!elements.length) return;

            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        elements.forEach(el => {
                            const speed = parseFloat(el.dataset.parallax) || 0.5;
                            const rect = el.getBoundingClientRect();
                            const scrolled = window.scrollY;

                            if (rect.top < window.innerHeight && rect.bottom > 0) {
                                const yPos = -(scrolled * speed);
                                el.style.transform = `translateY(${yPos}px)`;
                            }
                        });
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }
    }

    // ============================================
    // FORM ANIMATIONS
    // ============================================
    class FormAnimations {
        static init() {
            const inputs = document.querySelectorAll('.form-input-animated');

            inputs.forEach(input => {
                const wrapper = input.closest('.form-group');
                if (!wrapper) return;

                input.addEventListener('focus', () => {
                    wrapper.classList.add('focused');
                });

                input.addEventListener('blur', () => {
                    if (!input.value) {
                        wrapper.classList.remove('focused');
                    }
                });

                // Check initial state
                if (input.value) {
                    wrapper.classList.add('focused');
                }
            });
        }
    }

    // ============================================
    // TEXT SCRAMBLE EFFECT
    // ============================================
    class TextScramble {
        constructor(element) {
            this.element = element;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.originalText = element.textContent;
            this.isAnimating = false;
        }

        animate() {
            if (this.isAnimating) return;
            this.isAnimating = true;

            const text = this.originalText;
            const length = text.length;
            let iteration = 0;

            const interval = setInterval(() => {
                this.element.textContent = text
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return this.chars[Math.floor(Math.random() * this.chars.length)];
                    })
                    .join('');

                if (iteration >= length) {
                    clearInterval(interval);
                    this.isAnimating = false;
                }

                iteration += 1 / 3;
            }, 30);
        }

        static initAll() {
            document.querySelectorAll('[data-scramble]').forEach(el => {
                const scramble = new TextScramble(el);

                el.addEventListener('mouseenter', () => scramble.animate());
            });
        }
    }

    // ============================================
    // TYPING EFFECT
    // ============================================
    class TypingEffect {
        constructor(element) {
            this.element = element;
            this.text = element.dataset.text || element.textContent;
            this.speed = parseInt(element.dataset.typingSpeed) || 100;
            this.delay = parseInt(element.dataset.typingDelay) || 0;
            this.hasAnimated = false;
        }

        animate() {
            if (this.hasAnimated) return;
            this.hasAnimated = true;

            this.element.textContent = '';
            this.element.style.opacity = '1';

            setTimeout(() => {
                let i = 0;
                const interval = setInterval(() => {
                    if (i < this.text.length) {
                        this.element.textContent += this.text.charAt(i);
                        i++;
                    } else {
                        clearInterval(interval);
                        this.element.classList.add('typing-done');
                    }
                }, this.speed);
            }, this.delay);
        }

        static initAll() {
            const elements = document.querySelectorAll('[data-typing]');

            if (!elements.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const typing = new TypingEffect(entry.target);
                        typing.animate();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            elements.forEach(el => observer.observe(el));
        }
    }

    // ============================================
    // STAGGER CHILDREN
    // ============================================
    class StaggerChildren {
        static init() {
            document.querySelectorAll('[data-stagger-children]').forEach(parent => {
                const children = parent.children;
                const delay = parseFloat(parent.dataset.staggerDelay) || 0.1;

                Array.from(children).forEach((child, index) => {
                    child.style.transitionDelay = `${index * delay}s`;
                });
            });
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initAllAnimations() {
        // Core systems
        new ScrollReveal();
        new HeaderScroll();
        new CustomCursor();
        new PageTransition();
        new LoadingScreen();

        // Effects
        AnimatedCounter.initAll();
        MagneticButton.initAll();
        RippleEffect.init();
        CardTilt.initAll();
        SmoothScroll.init();
        Accordion.initAll();
        ProgressBar.initAll();
        Parallax.init();
        FormAnimations.init();
        TextScramble.initAll();
        TypingEffect.initAll();
        StaggerChildren.init();

        console.log('🧬 Oncologia Animations Initialized');
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllAnimations);
    } else {
        initAllAnimations();
    }

    // Expose to global scope for manual initialization
    window.OncologiaAnimations = {
        ScrollReveal,
        AnimatedCounter,
        MagneticButton,
        CustomCursor,
        CardTilt,
        Accordion,
        TypingEffect,
        TextScramble,
        reinit: initAllAnimations
    };

})();
