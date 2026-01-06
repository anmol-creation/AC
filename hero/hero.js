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
        dotCount: 20, // Increased from 15 as requested
        speed: 0.5, // Slightly faster for visual interest during connection
        connectionSpeed: 0.08, // Speed of line drawing
        colors: [
            '#ffffff', // Core white
            '#ff69b4', // Pink
            '#3b82f6', // Blue
            '#06b6d4', // Cyan
            '#8b5cf6'  // Violet
        ]
    };

    let width, height;
    let dots = [];
    let animationFrameId;
    let isConnected = false;
    let currentConnectionIndex = 0;
    let lineDrawProgress = 0; // 0 to 1 for the current line
    let revealTriggered = false;

    // Prefer reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Intersection Observer to pause animation when off-screen
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animationFrameId && !prefersReducedMotion) {
                    animate();
                }
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);

    // Resize Handler
    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        initDots();
    }

    // Dot Class
    class Dot {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * CONFIG.speed;
            this.vy = (Math.random() - 0.5) * CONFIG.speed;
            this.radius = 2.5;

            // Random color from palette
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        }

        update() {
            // Keep moving slowly
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initDots() {
        dots = [];
        for (let i = 0; i < CONFIG.dotCount; i++) {
            dots.push(new Dot());
        }
        // Sort dots to create a somewhat logical path (e.g., left to right)
        // to make the sequential connection look cleaner
        dots.sort((a, b) => a.x - b.x);
    }

    function drawSequentialLines() {
        // Draw all fully connected lines
        for (let i = 0; i < currentConnectionIndex; i++) {
            if (i + 1 < dots.length) {
                const start = dots[i];
                const end = dots[i + 1];

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`; // Faint white connection
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Draw current animating line
        if (currentConnectionIndex < dots.length - 1) {
            const start = dots[currentConnectionIndex];
            const end = dots[currentConnectionIndex + 1];

            const currentX = start.x + (end.x - start.x) * lineDrawProgress;
            const currentY = start.y + (end.y - start.y) * lineDrawProgress;

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`; // Brighter leading line
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Advance progress
            lineDrawProgress += CONFIG.connectionSpeed;
            if (lineDrawProgress >= 1) {
                lineDrawProgress = 0;
                currentConnectionIndex++;
            }
        } else {
            // All connections done
            if (!revealTriggered) {
                revealContent();
                revealTriggered = true;
            }
        }
    }

    function revealContent() {
        if (brandName) brandName.classList.add('visible');
        setTimeout(() => {
            if (tagline) tagline.classList.add('visible');
        }, 1000);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        dots.forEach(dot => {
            dot.update();
            dot.draw(ctx);
        });

        drawSequentialLines();

        animationFrameId = requestAnimationFrame(animate);
    }

    // Initialization
    if (!prefersReducedMotion) {
        window.addEventListener('resize', resize);
        resize(); // Initial setup
        // Animation loop is triggered by Observer
    } else {
        // Immediate reveal for reduced motion
        revealContent();
    }

})();
