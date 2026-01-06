(function() {
    // Isolated Hero Logic
    const container = document.getElementById('hero-container');
    const canvas = document.getElementById('hero-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const brandName = container.querySelector('.hero-brand-name');
    const tagline = container.querySelector('.hero-tagline');

    // Configuration
    const CONFIG = {
        dotCount: 15, // Strict limit 10-15
        connectionDistance: 150,
        coreDotIndex: 0,
        colors: [
            '#ffffff', // Core dot (white)
            '#ff69b4', // Pink
            '#3b82f6', // Blue
            '#06b6d4', // Cyan
            '#8b5cf6'  // Violet
        ],
        speed: 0.3, // Slowly float
        transitionSpeed: 0.0005, // Speed of color transition to white per frame
    };

    let width, height;
    let dots = [];
    let animationFrameId;
    let transitionProgress = 0; // 0 to 1

    // Prefer reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Resize Handler
    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        initDots(); // Re-initialize dots on resize for better distribution
    }

    // Dot Class
    class Dot {
        constructor(isCore = false) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * CONFIG.speed;
            this.vy = (Math.random() - 0.5) * CONFIG.speed;
            this.radius = isCore ? 3 : 2;
            this.isCore = isCore;

            // Assign color
            if (isCore) {
                this.colorBase = CONFIG.colors[0];
            } else {
                this.colorBase = CONFIG.colors[Math.floor(Math.random() * (CONFIG.colors.length - 1)) + 1];
            }
            this.currentColor = this.colorBase;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw(ctx, progress) {
            // Interpolate color towards white based on progress
            if (progress > 0 && !this.isCore) {
               this.currentColor = interpolateColor(this.colorBase, '#ffffff', progress);
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.currentColor;
            ctx.fill();
        }
    }

    // Helper: Hex to RGB interpolation
    function interpolateColor(color1, color2, factor) {
        if (factor >= 1) return color2;
        if (factor <= 0) return color1;

        const hex2rgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };

        const rgb2hex = (r, g, b) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        };

        const c1 = hex2rgb(color1);
        const c2 = hex2rgb(color2);

        const r = Math.round(c1[0] + (c2[0] - c1[0]) * factor);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * factor);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * factor);

        return rgb2hex(r, g, b);
    }

    function initDots() {
        dots = [];
        // Create Core Dot first
        dots.push(new Dot(true));
        // Create remaining dots
        for (let i = 1; i < CONFIG.dotCount; i++) {
            dots.push(new Dot(false));
        }
    }

    function drawLines() {
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONFIG.connectionDistance) {
                    const opacity = 1 - (distance / CONFIG.connectionDistance);

                    // Line color: start with dot[i]'s current color
                    // If transitioning, it will naturally become white
                    ctx.strokeStyle = dots[i].currentColor;
                    ctx.globalAlpha = opacity * 0.5; // Slight transparency
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }

        // Progress the "Unification"
        // Start transitioning after a short initial delay or immediately but slowly
        if (transitionProgress < 1) {
            transitionProgress += CONFIG.transitionSpeed;
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        dots.forEach(dot => {
            dot.update();
            dot.draw(ctx, transitionProgress);
        });

        drawLines();

        animationFrameId = requestAnimationFrame(animate);
    }

    // Initialization
    if (!prefersReducedMotion) {
        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // Reveal Text Animation
    // Wait a bit, then reveal
    setTimeout(() => {
        if (brandName) brandName.classList.add('visible');
    }, 500);

    setTimeout(() => {
        if (tagline) tagline.classList.add('visible');
    }, 1500); // 500 + some delay

})();
