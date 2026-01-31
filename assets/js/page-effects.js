/* ============================================
   ONCOLOGIA - Page Specific Effects
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // TIMELINE ANIMATION (precision.html)
    // ============================================
    class TimelineAnimation {
        constructor(container) {
            this.container = container;
            this.line = container.querySelector('.timeline-progress-line');
            this.items = container.querySelectorAll('.timeline-step');
            this.hasAnimated = false;
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animate();
                        this.hasAnimated = true;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(this.container);
        }

        animate() {
            // Animate the connecting line
            if (this.line) {
                this.line.style.transition = 'height 2s ease-out';
                this.line.style.height = '100%';
            }

            // Animate each step with stagger
            this.items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('revealed');

                    // Animate the step number
                    const number = item.querySelector('.step-number');
                    if (number) {
                        number.classList.add('animate-pulse-glow');
                    }
                }, 300 * (index + 1));
            });
        }

        static initAll() {
            document.querySelectorAll('[data-timeline]').forEach(container => {
                new TimelineAnimation(container);
            });
        }
    }

    // ============================================
    // PIPELINE ANIMATION (plataforma.html)
    // ============================================
    class PipelineAnimation {
        constructor(container) {
            this.container = container;
            this.steps = container.querySelectorAll('.pipeline-step');
            this.connectors = container.querySelectorAll('.pipeline-connector');
            this.hasAnimated = false;
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animate();
                        this.hasAnimated = true;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(this.container);
        }

        animate() {
            this.steps.forEach((step, index) => {
                setTimeout(() => {
                    step.classList.add('revealed');

                    // Animate connector after step
                    if (this.connectors[index]) {
                        setTimeout(() => {
                            this.connectors[index].classList.add('active');
                        }, 200);
                    }
                }, 400 * index);
            });
        }

        static initAll() {
            document.querySelectorAll('[data-pipeline]').forEach(container => {
                new PipelineAnimation(container);
            });
        }
    }

    // ============================================
    // HERO TYPING EFFECT (index.html)
    // ============================================
    class HeroTyping {
        constructor(element) {
            this.element = element;
            this.texts = JSON.parse(element.dataset.heroTexts || '[]');
            this.currentIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.typeSpeed = 100;
            this.deleteSpeed = 50;
            this.pauseTime = 2000;
            this.init();
        }

        init() {
            if (this.texts.length === 0) return;
            this.type();
        }

        type() {
            const currentText = this.texts[this.currentIndex];

            if (this.isDeleting) {
                this.element.textContent = currentText.substring(0, this.charIndex - 1);
                this.charIndex--;
            } else {
                this.element.textContent = currentText.substring(0, this.charIndex + 1);
                this.charIndex++;
            }

            let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

            if (!this.isDeleting && this.charIndex === currentText.length) {
                delay = this.pauseTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.currentIndex = (this.currentIndex + 1) % this.texts.length;
                delay = 500;
            }

            setTimeout(() => this.type(), delay);
        }

        static initAll() {
            document.querySelectorAll('[data-hero-texts]').forEach(el => {
                new HeroTyping(el);
            });
        }
    }

    // ============================================
    // STAT COUNTER WITH SLOT MACHINE EFFECT
    // ============================================
    class SlotCounter {
        constructor(element) {
            this.element = element;
            this.target = element.dataset.target || '0';
            this.duration = parseInt(element.dataset.duration) || 2000;
            this.hasAnimated = false;
        }

        animate() {
            if (this.hasAnimated) return;
            this.hasAnimated = true;

            const digits = this.target.split('');
            this.element.innerHTML = '';

            digits.forEach((char, index) => {
                if (/\d/.test(char)) {
                    const digitWrapper = document.createElement('span');
                    digitWrapper.className = 'slot-digit-wrapper';
                    digitWrapper.style.cssText = 'display:inline-block;overflow:hidden;height:1em;';

                    const digitInner = document.createElement('span');
                    digitInner.className = 'slot-digit-inner';
                    digitInner.style.cssText = 'display:block;transition:transform 0.5s ease-out;';

                    // Create number strip
                    for (let i = 0; i <= 9; i++) {
                        const num = document.createElement('span');
                        num.style.cssText = 'display:block;height:1em;line-height:1em;';
                        num.textContent = i;
                        digitInner.appendChild(num);
                    }

                    digitWrapper.appendChild(digitInner);
                    this.element.appendChild(digitWrapper);

                    // Animate to target digit
                    setTimeout(() => {
                        const targetDigit = parseInt(char);
                        digitInner.style.transform = `translateY(-${targetDigit}em)`;
                    }, 100 + index * 150);
                } else {
                    const span = document.createElement('span');
                    span.textContent = char;
                    this.element.appendChild(span);
                }
            });
        }

        static initAll() {
            const counters = document.querySelectorAll('[data-slot-counter]');

            if (!counters.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = new SlotCounter(entry.target);
                        counter.animate();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }
    }

    // ============================================
    // BIOMARKER MATRIX EFFECT (precision.html)
    // ============================================
    class BiomarkerMatrix {
        constructor(container) {
            this.container = container;
            this.items = container.querySelectorAll('.biomarker-item');
            this.hasAnimated = false;
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animate();
                        this.hasAnimated = true;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(this.container);
        }

        animate() {
            // Random order reveal
            const shuffled = Array.from(this.items).sort(() => Math.random() - 0.5);

            shuffled.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                    item.classList.add('revealed');
                }, 80 * index);
            });
        }

        static initAll() {
            document.querySelectorAll('[data-biomarker-matrix]').forEach(container => {
                new BiomarkerMatrix(container);
            });
        }
    }

    // ============================================
    // COLLABORATION CARDS FLIP (investigacion.html)
    // ============================================
    class FlipCards {
        static init() {
            document.querySelectorAll('.collaboration-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.classList.add('flipped');
                });

                card.addEventListener('mouseleave', () => {
                    card.classList.remove('flipped');
                });
            });
        }
    }

    // ============================================
    // PARTNERS CAROUSEL (index.html)
    // ============================================
    class PartnersCarousel {
        constructor(container) {
            this.container = container;
            this.track = container.querySelector('.partners-track');
            this.items = container.querySelectorAll('.partner-item');
            this.isPaused = false;
            this.init();
        }

        init() {
            if (!this.track || !this.items.length) return;

            // Clone items for infinite scroll
            this.items.forEach(item => {
                const clone = item.cloneNode(true);
                this.track.appendChild(clone);
            });

            // Pause on hover
            this.container.addEventListener('mouseenter', () => this.pause());
            this.container.addEventListener('mouseleave', () => this.resume());
        }

        pause() {
            this.track.style.animationPlayState = 'paused';
        }

        resume() {
            this.track.style.animationPlayState = 'running';
        }

        static initAll() {
            document.querySelectorAll('[data-partners-carousel]').forEach(container => {
                new PartnersCarousel(container);
            });
        }
    }

    // ============================================
    // VALUES ANIMATION (nosotros.html)
    // ============================================
    class ValuesAnimation {
        constructor(container) {
            this.container = container;
            this.items = container.querySelectorAll('.value-card');
            this.hasAnimated = false;
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animate();
                        this.hasAnimated = true;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(this.container);
        }

        animate() {
            this.items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('revealed');
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 150 * index);
            });
        }

        static initAll() {
            document.querySelectorAll('[data-values-grid]').forEach(container => {
                new ValuesAnimation(container);
            });
        }
    }

    // ============================================
    // FORM VALIDATION FEEDBACK (contacto.html)
    // ============================================
    class FormValidation {
        constructor(form) {
            this.form = form;
            this.inputs = form.querySelectorAll('input, textarea, select');
            this.submitBtn = form.querySelector('[type="submit"]');
            this.init();
        }

        init() {
            this.inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateInput(input));
                input.addEventListener('input', () => this.clearError(input));
            });

            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        validateInput(input) {
            const wrapper = input.closest('.form-group') || input.parentElement;

            if (input.required && !input.value.trim()) {
                this.showError(wrapper, 'Este campo es requerido');
                return false;
            }

            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    this.showError(wrapper, 'Email inválido');
                    return false;
                }
            }

            this.showSuccess(wrapper);
            return true;
        }

        showError(wrapper, message) {
            wrapper.classList.remove('success');
            wrapper.classList.add('error');

            let errorEl = wrapper.querySelector('.error-message');
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message text-red-400 text-sm mt-1 block';
                wrapper.appendChild(errorEl);
            }
            errorEl.textContent = message;
        }

        showSuccess(wrapper) {
            wrapper.classList.remove('error');
            wrapper.classList.add('success');
            const errorEl = wrapper.querySelector('.error-message');
            if (errorEl) errorEl.remove();
        }

        clearError(input) {
            const wrapper = input.closest('.form-group') || input.parentElement;
            wrapper.classList.remove('error', 'success');
            const errorEl = wrapper.querySelector('.error-message');
            if (errorEl) errorEl.remove();
        }

        handleSubmit(e) {
            let isValid = true;

            this.inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                // Shake effect on button
                this.submitBtn.classList.add('shake');
                setTimeout(() => this.submitBtn.classList.remove('shake'), 500);
            } else {
                // Loading state
                this.submitBtn.classList.add('loading');
                this.submitBtn.disabled = true;
            }
        }

        static initAll() {
            document.querySelectorAll('[data-validate-form]').forEach(form => {
                new FormValidation(form);
            });
        }
    }

    // ============================================
    // FAQ ACCORDION ENHANCEMENT (contacto.html)
    // ============================================
    class FAQAccordion {
        constructor(container) {
            this.container = container;
            this.items = container.querySelectorAll('.faq-item');
            this.init();
        }

        init() {
            this.items.forEach(item => {
                const trigger = item.querySelector('.faq-trigger');
                const content = item.querySelector('.faq-content');
                const icon = item.querySelector('.faq-icon');

                if (!trigger || !content) return;

                trigger.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');

                    // Close all others
                    this.items.forEach(other => {
                        other.classList.remove('active');
                        const otherContent = other.querySelector('.faq-content');
                        if (otherContent) otherContent.style.maxHeight = '0';
                    });

                    // Toggle current
                    if (!isOpen) {
                        item.classList.add('active');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            });
        }

        static initAll() {
            document.querySelectorAll('[data-faq-accordion]').forEach(container => {
                new FAQAccordion(container);
            });
        }
    }

    // ============================================
    // NETWORK ANIMATION (investigacion.html)
    // ============================================
    class NetworkAnimation {
        constructor(container) {
            this.container = container;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.nodes = [];
            this.time = 0;
            this.init();
        }

        init() {
            this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.3;';
            this.container.style.position = 'relative';
            this.container.appendChild(this.canvas);

            this.resize();
            window.addEventListener('resize', () => this.resize());

            this.createNodes();
            this.animate();
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        createNodes() {
            const count = 30;
            for (let i = 0; i < count; i++) {
                this.nodes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 3 + 2
                });
            }
        }

        animate() {
            this.time += 0.01;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw nodes
            this.nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                this.ctx.fillStyle = '#00d4ff';
                this.ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                        this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                        this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 * (1 - dist / 120)})`;
                        this.ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }

        static initAll() {
            document.querySelectorAll('[data-network-animation]').forEach(container => {
                new NetworkAnimation(container);
            });
        }
    }

    // ============================================
    // PAGE DETECTION & INITIALIZATION
    // ============================================
    const pageEffects = {
        'index': () => {
            HeroTyping.initAll();
            PartnersCarousel.initAll();
        },
        'plataforma': () => {
            PipelineAnimation.initAll();
        },
        'descubrimiento': () => {
            SlotCounter.initAll();
        },
        'precision': () => {
            TimelineAnimation.initAll();
            BiomarkerMatrix.initAll();
        },
        'investigacion': () => {
            FlipCards.init();
            NetworkAnimation.initAll();
        },
        'nosotros': () => {
            ValuesAnimation.initAll();
        },
        'contacto': () => {
            FormValidation.initAll();
            FAQAccordion.initAll();
        }
    };

    function initPageEffects() {
        // Detect current page
        let currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        if (!currentPage || currentPage === '') currentPage = 'index';

        // Run page-specific effects
        if (pageEffects[currentPage]) {
            pageEffects[currentPage]();
        }

        // Run common effects
        SlotCounter.initAll();

        console.log(`🧬 Page Effects Initialized: ${currentPage}`);
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageEffects);
    } else {
        initPageEffects();
    }

    // Expose to global scope
    window.OncologiaPageEffects = {
        TimelineAnimation,
        PipelineAnimation,
        HeroTyping,
        SlotCounter,
        BiomarkerMatrix,
        PartnersCarousel,
        ValuesAnimation,
        FormValidation,
        FAQAccordion,
        NetworkAnimation,
        reinit: initPageEffects
    };

})();
