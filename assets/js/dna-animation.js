/* ============================================
   ONCOLOGIA - DNA Helix Animation
   Interactive 3D DNA Visualization
   ============================================ */

(function() {
    'use strict';

    class DNAVisualization {
        constructor(container) {
            this.container = container;
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.connections = [];
            this.mouseX = 0;
            this.mouseY = 0;
            this.targetMouseX = 0;
            this.targetMouseY = 0;
            this.time = 0;
            this.isRunning = true;

            // Configuration
            this.config = {
                particleCount: 60,
                helixRadius: 80,
                helixHeight: 400,
                rotationSpeed: 0.008,
                waveAmplitude: 20,
                waveFrequency: 0.05,
                particleSize: { min: 2, max: 6 },
                colors: {
                    primary: '#00d4ff',
                    secondary: '#00ff88',
                    accent: '#ff00ff',
                    connection: 'rgba(0, 212, 255, 0.3)'
                },
                mouseInfluence: 50,
                glowIntensity: 15
            };

            this.init();
        }

        init() {
            this.createCanvas();
            this.createParticles();
            this.bindEvents();
            this.animate();
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.container.style.position = 'relative';
            this.container.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.resize();
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
        }

        createParticles() {
            this.particles = [];
            const { particleCount, helixRadius, helixHeight } = this.config;

            for (let i = 0; i < particleCount; i++) {
                const progress = i / particleCount;
                const angle = progress * Math.PI * 6; // 3 full rotations
                const y = (progress - 0.5) * helixHeight;

                // First strand
                this.particles.push({
                    baseAngle: angle,
                    baseY: y,
                    strand: 0,
                    size: this.randomRange(this.config.particleSize.min, this.config.particleSize.max),
                    pulseOffset: Math.random() * Math.PI * 2,
                    color: this.config.colors.primary
                });

                // Second strand (opposite)
                this.particles.push({
                    baseAngle: angle + Math.PI,
                    baseY: y,
                    strand: 1,
                    size: this.randomRange(this.config.particleSize.min, this.config.particleSize.max),
                    pulseOffset: Math.random() * Math.PI * 2,
                    color: this.config.colors.secondary
                });
            }

            // Create connections between strands
            for (let i = 0; i < particleCount; i += 3) {
                this.connections.push({
                    index1: i * 2,
                    index2: i * 2 + 1,
                    opacity: 0.3 + Math.random() * 0.4
                });
            }
        }

        bindEvents() {
            // Mouse move
            this.container.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.targetMouseX = e.clientX - rect.left - this.centerX;
                this.targetMouseY = e.clientY - rect.top - this.centerY;
            });

            // Mouse leave
            this.container.addEventListener('mouseleave', () => {
                this.targetMouseX = 0;
                this.targetMouseY = 0;
            });

            // Resize
            window.addEventListener('resize', () => this.resize());

            // Visibility change
            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
            });
        }

        randomRange(min, max) {
            return min + Math.random() * (max - min);
        }

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        animate() {
            if (!this.isRunning) {
                requestAnimationFrame(() => this.animate());
                return;
            }

            this.time += this.config.rotationSpeed;

            // Smooth mouse follow
            this.mouseX = this.lerp(this.mouseX, this.targetMouseX, 0.1);
            this.mouseY = this.lerp(this.mouseY, this.targetMouseY, 0.1);

            this.clear();
            this.drawConnections();
            this.drawParticles();
            this.drawFloatingParticles();

            requestAnimationFrame(() => this.animate());
        }

        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        getParticlePosition(particle) {
            const { helixRadius, waveAmplitude, waveFrequency, mouseInfluence } = this.config;

            const angle = particle.baseAngle + this.time;
            const wave = Math.sin(particle.baseY * waveFrequency + this.time * 2) * waveAmplitude;

            // Base position
            let x = Math.cos(angle) * (helixRadius + wave);
            let z = Math.sin(angle) * (helixRadius + wave);
            let y = particle.baseY;

            // Mouse influence
            const distX = this.mouseX / 5;
            const distY = this.mouseY / 5;
            x += distX * (1 - Math.abs(y) / 200);
            y += distY * 0.3;

            // 3D projection
            const perspective = 400;
            const scale = perspective / (perspective + z);

            return {
                x: this.centerX + x * scale,
                y: this.centerY + y * scale,
                z: z,
                scale: scale
            };
        }

        drawParticles() {
            // Sort by z for proper depth
            const sortedParticles = this.particles
                .map((p, i) => ({ ...p, index: i, pos: this.getParticlePosition(p) }))
                .sort((a, b) => a.pos.z - b.pos.z);

            sortedParticles.forEach(particle => {
                const { x, y, scale } = particle.pos;
                const pulse = Math.sin(this.time * 3 + particle.pulseOffset) * 0.3 + 1;
                const size = particle.size * scale * pulse;

                // Glow effect
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(0.5, particle.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
                gradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();

                // Core particle
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();
            });
        }

        drawConnections() {
            this.connections.forEach(conn => {
                const p1 = this.particles[conn.index1];
                const p2 = this.particles[conn.index2];

                if (!p1 || !p2) return;

                const pos1 = this.getParticlePosition(p1);
                const pos2 = this.getParticlePosition(p2);

                // Only draw if both particles are visible (z > -100)
                if (pos1.z < -100 || pos2.z < -100) return;

                const gradient = this.ctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y);
                gradient.addColorStop(0, this.config.colors.primary.replace(')', `, ${conn.opacity})`).replace('rgb', 'rgba').replace('#00d4ff', 'rgba(0, 212, 255'));
                gradient.addColorStop(0.5, this.config.colors.accent.replace(')', `, ${conn.opacity * 0.5})`).replace('rgb', 'rgba').replace('#ff00ff', 'rgba(255, 0, 255'));
                gradient.addColorStop(1, this.config.colors.secondary.replace(')', `, ${conn.opacity})`).replace('rgb', 'rgba').replace('#00ff88', 'rgba(0, 255, 136'));

                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.strokeStyle = `rgba(0, 212, 255, ${conn.opacity * 0.5})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            });
        }

        drawFloatingParticles() {
            // Add some ambient floating particles
            const count = 20;
            for (let i = 0; i < count; i++) {
                const t = this.time * 0.5 + (i / count) * Math.PI * 2;
                const x = this.centerX + Math.cos(t * 1.5 + i) * 150 + Math.sin(t * 0.7) * 50;
                const y = this.centerY + Math.sin(t + i * 0.5) * 150 + Math.cos(t * 0.5) * 30;
                const size = 1 + Math.sin(t * 2 + i) * 0.5;
                const opacity = 0.2 + Math.sin(t + i) * 0.1;

                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 212, 255, ${opacity})`;
                this.ctx.fill();
            }
        }

        destroy() {
            this.isRunning = false;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // ============================================
    // SIMPLE DNA BACKGROUND (for lighter effect)
    // ============================================
    class DNABackground {
        constructor(container) {
            this.container = container;
            this.particles = [];
            this.canvas = null;
            this.ctx = null;
            this.time = 0;
            this.init();
        }

        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.5;';
            this.container.style.position = 'relative';
            this.container.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            this.resize();
            window.addEventListener('resize', () => this.resize());

            this.createParticles();
            this.animate();
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        createParticles() {
            const count = 50;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        }

        animate() {
            this.time += 0.01;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
                this.ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist / 100)})`;
                        this.ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // HERO BACKGROUND 3D - Full Interactive Canvas
    // ============================================
    class HeroBackground3D {
        constructor(container) {
            this.container = container;
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.floatingParticles = [];
            this.connections = [];
            this.time = 0;
            this.isRunning = true;

            // Mouse state
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

            // Configuration
            this.config = {
                // DNA Helix settings
                helixParticleCount: 80,
                helixRadius: 150,
                helixHeight: 600,
                rotationSpeed: 0.004,
                waveAmplitude: 30,
                waveFrequency: 0.03,

                // Floating particles
                floatingCount: 100,
                connectionDistance: 120,

                // Visual settings
                colors: {
                    primary: { r: 0, g: 212, b: 255 },    // Cyan
                    secondary: { r: 0, g: 255, b: 136 },   // Green
                    accent: { r: 255, g: 255, b: 255 },    // White
                    connection: { r: 0, g: 212, b: 255 }   // Cyan
                },

                // Interaction
                mouseInfluence: 0.08,
                mouseLerp: 0.05,

                // Performance
                maxFPS: 60,
                reduceOnMobile: true
            };

            // Detect mobile
            this.isMobile = window.innerWidth < 768;
            if (this.isMobile && this.config.reduceOnMobile) {
                this.config.helixParticleCount = 40;
                this.config.floatingCount = 50;
            }

            this.init();
        }

        init() {
            this.createCanvas();
            this.createHelixParticles();
            this.createFloatingParticles();
            this.bindEvents();
            this.animate();
        }

        createCanvas() {
            // Create canvas element
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'hero-canvas';
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;

            // Find or create background container
            let bgContainer = this.container.querySelector('.hero-bg-container');
            if (!bgContainer) {
                bgContainer = document.createElement('div');
                bgContainer.className = 'hero-bg-container';
                bgContainer.style.cssText = 'position:absolute;inset:0;z-index:0;overflow:hidden;';
                this.container.insertBefore(bgContainer, this.container.firstChild);
            }

            bgContainer.insertBefore(this.canvas, bgContainer.firstChild);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);

            this.width = rect.width;
            this.height = rect.height;
            this.centerX = this.width / 2;
            this.centerY = this.height / 2;

            // Adjust helix position for better centering
            this.helixOffsetX = this.width * 0.55; // Slightly to the right
            this.helixOffsetY = this.height * 0.5;
        }

        createHelixParticles() {
            this.particles = [];
            const { helixParticleCount, helixRadius, helixHeight } = this.config;

            for (let i = 0; i < helixParticleCount; i++) {
                const progress = i / helixParticleCount;
                const angle = progress * Math.PI * 8; // 4 full rotations
                const y = (progress - 0.5) * helixHeight;

                // First strand
                this.particles.push({
                    baseAngle: angle,
                    baseY: y,
                    strand: 0,
                    size: 2 + Math.random() * 3,
                    pulseOffset: Math.random() * Math.PI * 2,
                    brightness: 0.6 + Math.random() * 0.4
                });

                // Second strand (opposite)
                this.particles.push({
                    baseAngle: angle + Math.PI,
                    baseY: y,
                    strand: 1,
                    size: 2 + Math.random() * 3,
                    pulseOffset: Math.random() * Math.PI * 2,
                    brightness: 0.6 + Math.random() * 0.4
                });
            }

            // Create connections between strands
            for (let i = 0; i < helixParticleCount; i += 4) {
                this.connections.push({
                    index1: i * 2,
                    index2: i * 2 + 1,
                    opacity: 0.2 + Math.random() * 0.3
                });
            }
        }

        createFloatingParticles() {
            this.floatingParticles = [];
            const { floatingCount } = this.config;

            for (let i = 0; i < floatingCount; i++) {
                this.floatingParticles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    baseX: Math.random() * this.width,
                    baseY: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: 1 + Math.random() * 2,
                    opacity: 0.1 + Math.random() * 0.4,
                    speed: 0.5 + Math.random() * 1,
                    angle: Math.random() * Math.PI * 2,
                    orbitRadius: 20 + Math.random() * 60
                });
            }
        }

        bindEvents() {
            // Mouse move on document (not just container)
            document.addEventListener('mousemove', (e) => {
                this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
                this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            // Touch support
            document.addEventListener('touchmove', (e) => {
                if (e.touches[0]) {
                    this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                    this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
                }
            }, { passive: true });

            // Resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.resize();
                    this.createFloatingParticles();
                }, 100);
            });

            // Visibility
            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
            });
        }

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        animate() {
            if (!this.isRunning) {
                requestAnimationFrame(() => this.animate());
                return;
            }

            this.time += this.config.rotationSpeed;

            // Smooth mouse interpolation
            this.mouse.x = this.lerp(this.mouse.x, this.mouse.targetX, this.config.mouseLerp);
            this.mouse.y = this.lerp(this.mouse.y, this.mouse.targetY, this.config.mouseLerp);

            this.clear();
            this.drawGlow();
            this.drawFloatingParticles();
            this.drawConnections();
            this.drawHelixParticles();

            requestAnimationFrame(() => this.animate());
        }

        clear() {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        drawGlow() {
            // Central glow effect
            const gradient = this.ctx.createRadialGradient(
                this.helixOffsetX, this.helixOffsetY, 0,
                this.helixOffsetX, this.helixOffsetY, 400
            );
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
            gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.03)');
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        getHelixPosition(particle) {
            const { helixRadius, waveAmplitude, waveFrequency, mouseInfluence } = this.config;

            const angle = particle.baseAngle + this.time;
            const wave = Math.sin(particle.baseY * waveFrequency + this.time * 2) * waveAmplitude;

            // Base position
            let x = Math.cos(angle) * (helixRadius + wave);
            let z = Math.sin(angle) * (helixRadius + wave);
            let y = particle.baseY;

            // Mouse influence
            const mouseEffect = mouseInfluence * 100;
            x += this.mouse.x * mouseEffect * (1 - Math.abs(y) / 300);
            y += this.mouse.y * mouseEffect * 0.5;

            // 3D projection
            const perspective = 500;
            const scale = perspective / (perspective + z);

            return {
                x: this.helixOffsetX + x * scale,
                y: this.helixOffsetY + y * scale,
                z: z,
                scale: scale
            };
        }

        drawHelixParticles() {
            const { colors } = this.config;

            // Sort by z for proper depth rendering
            const sortedParticles = this.particles
                .map((p, i) => ({ ...p, index: i, pos: this.getHelixPosition(p) }))
                .sort((a, b) => a.pos.z - b.pos.z);

            sortedParticles.forEach(particle => {
                const { x, y, scale, z } = particle.pos;
                const pulse = Math.sin(this.time * 4 + particle.pulseOffset) * 0.3 + 1;
                const size = particle.size * scale * pulse;
                const depthOpacity = 0.3 + (scale * 0.7);

                // Choose color based on strand
                const color = particle.strand === 0 ? colors.primary : colors.secondary;

                // Glow effect
                const glowSize = size * 4;
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.6 * depthOpacity * particle.brightness})`);
                gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.2 * depthOpacity})`);
                gradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();

                // Core particle
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${depthOpacity * particle.brightness})`;
                this.ctx.fill();
            });
        }

        drawConnections() {
            const { colors } = this.config;

            this.connections.forEach(conn => {
                const p1 = this.particles[conn.index1];
                const p2 = this.particles[conn.index2];

                if (!p1 || !p2) return;

                const pos1 = this.getHelixPosition(p1);
                const pos2 = this.getHelixPosition(p2);

                // Only draw visible connections
                if (pos1.z < -200 || pos2.z < -200) return;

                const avgScale = (pos1.scale + pos2.scale) / 2;
                const opacity = conn.opacity * avgScale;

                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.strokeStyle = `rgba(${colors.connection.r}, ${colors.connection.g}, ${colors.connection.b}, ${opacity * 0.4})`;
                this.ctx.lineWidth = avgScale;
                this.ctx.stroke();
            });
        }

        drawFloatingParticles() {
            const { colors, connectionDistance } = this.config;

            // Update and draw floating particles
            this.floatingParticles.forEach((p, i) => {
                // Organic movement
                p.angle += p.speed * 0.01;
                p.x = p.baseX + Math.cos(p.angle) * p.orbitRadius + Math.sin(this.time * p.speed) * 20;
                p.y = p.baseY + Math.sin(p.angle * 0.7) * p.orbitRadius + Math.cos(this.time * p.speed * 0.5) * 20;

                // Mouse repulsion
                const dx = (this.mouse.x * this.width / 2 + this.centerX) - p.x;
                const dy = (this.mouse.y * this.height / 2 + this.centerY) - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.x -= (dx / dist) * force * 2;
                    p.y -= (dy / dist) * force * 2;
                }

                // Wrap around edges
                if (p.x < -50) p.baseX = this.width + 50;
                if (p.x > this.width + 50) p.baseX = -50;
                if (p.y < -50) p.baseY = this.height + 50;
                if (p.y > this.height + 50) p.baseY = -50;

                // Draw particle
                const pulse = Math.sin(this.time * 3 + i) * 0.2 + 1;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, ${p.opacity})`;
                this.ctx.fill();
            });

            // Draw connections between nearby floating particles
            for (let i = 0; i < this.floatingParticles.length; i++) {
                for (let j = i + 1; j < this.floatingParticles.length; j++) {
                    const p1 = this.floatingParticles[i];
                    const p2 = this.floatingParticles[j];

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const opacity = (1 - dist / connectionDistance) * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(${colors.connection.r}, ${colors.connection.g}, ${colors.connection.b}, ${opacity})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }
        }

        destroy() {
            this.isRunning = false;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // ============================================
    // MOLECULAR VISUALIZATION (for plataforma.html)
    // ============================================
    class MolecularVisualization {
        constructor(container) {
            this.container = container;
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.floatingParticles = [];
            this.connections = [];
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.time = 0;
            this.isRunning = true;

            // Configuration
            this.config = {
                helixParticleCount: 50,
                helixRadius: 60,
                helixHeight: 500,
                rotationSpeed: 0.006,
                floatingCount: 40,
                connectionDistance: 80,
                perspective: 400,
                colors: {
                    primary: { r: 0, g: 212, b: 255 },
                    secondary: { r: 0, g: 255, b: 136 },
                    accent: { r: 255, g: 255, b: 255 },
                    connection: { r: 0, g: 212, b: 255 }
                },
                mouseInfluence: 0.1,
                mouseLerp: 0.08
            };

            // Mobile detection
            this.isMobile = window.innerWidth < 768;
            if (this.isMobile) {
                this.config.helixParticleCount = 30;
                this.config.floatingCount = 20;
            }

            this.init();
        }

        init() {
            this.createCanvas();
            this.createHelixParticles();
            this.createFloatingParticles();
            this.bindEvents();
            this.animate();
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'molecular-canvas';
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
            `;

            // Insert canvas at the beginning of the container
            this.container.style.position = 'relative';
            this.container.insertBefore(this.canvas, this.container.firstChild);

            this.ctx = this.canvas.getContext('2d');
            this.resize();
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);

            this.width = rect.width;
            this.height = rect.height;
            this.centerX = this.width / 2;
            this.centerY = this.height / 2;
        }

        createHelixParticles() {
            this.particles = [];
            this.connections = [];
            const { helixParticleCount, helixRadius, helixHeight } = this.config;

            for (let i = 0; i < helixParticleCount; i++) {
                const progress = i / helixParticleCount;
                const angle = progress * Math.PI * 6;
                const y = (progress - 0.5) * helixHeight;

                // First strand
                this.particles.push({
                    baseAngle: angle,
                    baseY: y,
                    strand: 0,
                    size: 2 + Math.random() * 4,
                    pulseOffset: Math.random() * Math.PI * 2,
                    brightness: 0.5 + Math.random() * 0.5
                });

                // Second strand
                this.particles.push({
                    baseAngle: angle + Math.PI,
                    baseY: y,
                    strand: 1,
                    size: 2 + Math.random() * 4,
                    pulseOffset: Math.random() * Math.PI * 2,
                    brightness: 0.5 + Math.random() * 0.5
                });
            }

            // Create connections
            for (let i = 0; i < helixParticleCount; i += 3) {
                this.connections.push({
                    index1: i * 2,
                    index2: i * 2 + 1,
                    opacity: 0.2 + Math.random() * 0.3
                });
            }
        }

        createFloatingParticles() {
            this.floatingParticles = [];
            const { floatingCount } = this.config;

            for (let i = 0; i < floatingCount; i++) {
                this.floatingParticles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    baseX: Math.random() * this.width,
                    baseY: Math.random() * this.height,
                    size: 1 + Math.random() * 2.5,
                    opacity: 0.1 + Math.random() * 0.3,
                    speed: 0.3 + Math.random() * 0.7,
                    angle: Math.random() * Math.PI * 2,
                    orbitRadius: 15 + Math.random() * 40
                });
            }
        }

        bindEvents() {
            // Mouse move
            this.container.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                this.mouse.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            });

            // Mouse leave
            this.container.addEventListener('mouseleave', () => {
                this.mouse.targetX = 0;
                this.mouse.targetY = 0;
            });

            // Resize
            window.addEventListener('resize', () => this.resize());

            // Visibility
            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
                if (this.isRunning) this.animate();
            });
        }

        animate() {
            if (!this.isRunning) return;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Smooth mouse
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * this.config.mouseLerp;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * this.config.mouseLerp;

            this.time += 0.016;

            // Draw elements
            this.drawGlow();
            this.drawHelixParticles();
            this.drawConnections();
            this.drawFloatingParticles();

            requestAnimationFrame(() => this.animate());
        }

        drawGlow() {
            const { colors } = this.config;
            const gradient = this.ctx.createRadialGradient(
                this.centerX, this.centerY, 0,
                this.centerX, this.centerY, 200
            );
            gradient.addColorStop(0, `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, 0.08)`);
            gradient.addColorStop(0.5, `rgba(${colors.secondary.r}, ${colors.secondary.g}, ${colors.secondary.b}, 0.03)`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        getHelixPosition(particle) {
            const { helixRadius, rotationSpeed, perspective, mouseInfluence } = this.config;

            const currentAngle = particle.baseAngle + this.time * rotationSpeed * 5;
            const mouseOffsetX = this.mouse.x * mouseInfluence;
            const mouseOffsetY = this.mouse.y * mouseInfluence;

            const x = Math.cos(currentAngle + mouseOffsetX) * helixRadius;
            const z = Math.sin(currentAngle + mouseOffsetX) * helixRadius;
            const y = particle.baseY + mouseOffsetY * 30;

            const scale = perspective / (perspective + z);
            const screenX = this.centerX + x * scale;
            const screenY = this.centerY + y * scale;

            return { x: screenX, y: screenY, z, scale };
        }

        drawHelixParticles() {
            const { colors } = this.config;

            // Sort by z for depth
            const sortedParticles = [...this.particles].map((p, i) => ({
                ...p,
                index: i,
                pos: this.getHelixPosition(p)
            })).sort((a, b) => a.pos.z - b.pos.z);

            sortedParticles.forEach(particle => {
                const { pos } = particle;
                if (pos.z < -300) return;

                const color = particle.strand === 0 ? colors.primary : colors.secondary;
                const pulse = Math.sin(this.time * 3 + particle.pulseOffset) * 0.3 + 1;
                const size = particle.size * pos.scale * pulse;
                const alpha = Math.min(1, (pos.z + 100) / 200) * particle.brightness;

                // Glow
                const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 3);
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.4})`);
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(pos.x - size * 3, pos.y - size * 3, size * 6, size * 6);

                // Core
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                this.ctx.fill();
            });
        }

        drawConnections() {
            const { colors } = this.config;

            this.connections.forEach(conn => {
                const p1 = this.particles[conn.index1];
                const p2 = this.particles[conn.index2];

                if (!p1 || !p2) return;

                const pos1 = this.getHelixPosition(p1);
                const pos2 = this.getHelixPosition(p2);

                if (pos1.z < -200 || pos2.z < -200) return;

                const avgScale = (pos1.scale + pos2.scale) / 2;
                const opacity = conn.opacity * avgScale * 0.5;

                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.strokeStyle = `rgba(${colors.connection.r}, ${colors.connection.g}, ${colors.connection.b}, ${opacity})`;
                this.ctx.lineWidth = avgScale * 0.8;
                this.ctx.stroke();
            });
        }

        drawFloatingParticles() {
            const { colors, connectionDistance } = this.config;

            this.floatingParticles.forEach((p, i) => {
                // Organic movement
                p.angle += p.speed * 0.01;
                p.x = p.baseX + Math.cos(p.angle) * p.orbitRadius + Math.sin(this.time * p.speed) * 15;
                p.y = p.baseY + Math.sin(p.angle * 0.7) * p.orbitRadius + Math.cos(this.time * p.speed * 0.5) * 15;

                // Boundary check
                if (p.x < -20) p.baseX = this.width + 20;
                if (p.x > this.width + 20) p.baseX = -20;
                if (p.y < -20) p.baseY = this.height + 20;
                if (p.y > this.height + 20) p.baseY = -20;

                // Draw
                const pulse = Math.sin(this.time * 2 + i) * 0.2 + 1;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, ${p.opacity})`;
                this.ctx.fill();
            });

            // Connections between nearby particles
            for (let i = 0; i < this.floatingParticles.length; i++) {
                for (let j = i + 1; j < this.floatingParticles.length; j++) {
                    const p1 = this.floatingParticles[i];
                    const p2 = this.floatingParticles[j];

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const opacity = (1 - dist / connectionDistance) * 0.1;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(${colors.connection.r}, ${colors.connection.g}, ${colors.connection.b}, ${opacity})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }
        }

        destroy() {
            this.isRunning = false;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // ============================================
    // DNA ANALYSIS BOX (descubrimiento page)
    // ============================================
    class DNAAnalysisBox {
        constructor(container) {
            this.container = container;
            this.canvas = container.querySelector('.analysis-particles-canvas');
            this.ctx = null;
            this.particles = [];
            this.time = 0;
            this.isRunning = true;
            this.hasAnimated = false;

            this.config = {
                particleCount: 30,
                colors: {
                    primary: { r: 0, g: 212, b: 255 },
                    secondary: { r: 255, g: 255, b: 255 }
                }
            };

            this.init();
        }

        init() {
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
                this.resize();
                this.createParticles();
                this.animate();
            }

            this.setupIntersectionObserver();
            this.bindEvents();
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.width = rect.width;
            this.height = rect.height;
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.config.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: 1 + Math.random() * 2,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: 0.1 + Math.random() * 0.3,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        }

        setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.hasAnimated = true;
                        this.startSequence();
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(this.container);
        }

        startSequence() {
            // Animate confidence counter
            const confidenceEl = this.container.querySelector('.analysis-confidence');
            if (confidenceEl) {
                const target = parseFloat(confidenceEl.dataset.target) || 98.2;
                this.animateCounter(confidenceEl, target, 2000, 2500);
            }

            // Typing effect
            const typingEl = this.container.querySelector('.analysis-typing');
            if (typingEl) {
                const text = typingEl.dataset.text || '';
                this.typeText(typingEl, text, 50, 500);
            }
        }

        animateCounter(element, target, duration, delay) {
            setTimeout(() => {
                const start = performance.now();
                const animate = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = (target * eased).toFixed(1);
                    element.textContent = `${current}%`;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                requestAnimationFrame(animate);
            }, delay);
        }

        typeText(element, text, speed, delay) {
            element.textContent = '';
            setTimeout(() => {
                let i = 0;
                const type = () => {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                        setTimeout(type, speed);
                    }
                };
                type();
            }, delay);
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                if (this.canvas) {
                    this.resize();
                }
            });

            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
                if (this.isRunning) this.animate();
            });
        }

        animate() {
            if (!this.isRunning || !this.ctx) return;

            this.ctx.clearRect(0, 0, this.width, this.height);
            this.time += 0.016;

            const { colors } = this.config;

            // Update and draw particles
            this.particles.forEach((p, i) => {
                // Move
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                // Pulse
                const pulse = Math.sin(this.time * 2 + p.pulse) * 0.3 + 1;
                const size = p.size * pulse;

                // Draw
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, ${p.opacity})`;
                this.ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 80) {
                        const opacity = (1 - dist / 80) * 0.1;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(${colors.primary.r}, ${colors.primary.g}, ${colors.primary.b}, ${opacity})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // DATA STREAM EFFECT
    // ============================================
    class DataStream {
        constructor(container) {
            this.container = container;
            this.streams = [];
            this.init();
        }

        init() {
            this.container.style.position = 'relative';
            this.container.style.overflow = 'hidden';

            const streamCount = 15;
            for (let i = 0; i < streamCount; i++) {
                this.createStream(i, streamCount);
            }
        }

        createStream(index, total) {
            const stream = document.createElement('div');
            stream.className = 'data-stream-particle';
            stream.style.cssText = `
                position: absolute;
                left: ${(index / total) * 100}%;
                top: -20px;
                width: 2px;
                height: 20px;
                background: linear-gradient(to bottom, transparent, #00d4ff, transparent);
                opacity: 0;
                animation: dataStream ${3 + Math.random() * 4}s linear infinite;
                animation-delay: ${Math.random() * 3}s;
            `;
            this.container.appendChild(stream);
            this.streams.push(stream);
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initDNAAnimations() {
        // Hero 3D Background (full screen interactive)
        const heroContainers = document.querySelectorAll('[data-hero-3d]');
        heroContainers.forEach(container => {
            new HeroBackground3D(container);
        });

        // Main DNA visualization
        const dnaContainers = document.querySelectorAll('[data-dna-visualization]');
        dnaContainers.forEach(container => {
            new DNAVisualization(container);
        });

        // Background particles
        const bgContainers = document.querySelectorAll('[data-dna-background]');
        bgContainers.forEach(container => {
            new DNABackground(container);
        });

        // Data streams
        const streamContainers = document.querySelectorAll('[data-data-stream]');
        streamContainers.forEach(container => {
            new DataStream(container);
        });

        // Molecular visualization (plataforma page)
        const molecularContainers = document.querySelectorAll('[data-molecular-visualization]');
        molecularContainers.forEach(container => {
            new MolecularVisualization(container);
        });

        // DNA Analysis Box (descubrimiento page)
        const analysisContainers = document.querySelectorAll('[data-dna-analysis]');
        analysisContainers.forEach(container => {
            new DNAAnalysisBox(container);
        });

        console.log('🧬 DNA Animations Initialized');
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDNAAnimations);
    } else {
        initDNAAnimations();
    }

    // Expose to global scope
    window.DNAVisualization = DNAVisualization;
    window.DNABackground = DNABackground;
    window.DataStream = DataStream;
    window.HeroBackground3D = HeroBackground3D;
    window.MolecularVisualization = MolecularVisualization;
    window.DNAAnalysisBox = DNAAnalysisBox;

})();
