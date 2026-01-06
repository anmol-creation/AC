(function() {
    const container = document.getElementById('hero-container');
    const canvas = document.getElementById('hero-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const brandName = container.querySelector('.hero-brand-name');
    const tagline = container.querySelector('.hero-tagline');

    // Muted Color Palette
    // Core white: #ffffff
    // Soft Blue: #60a5fa
    // Cyan: #22d3ee
    // Pink: #f472b6
    // Purple: #a78bfa
    // Teal: #2dd4bf
    const COLORS = ['#ffffff', '#60a5fa', '#22d3ee', '#f472b6', '#a78bfa', '#2dd4bf'];
    const DOT_COUNT = 20;

    let width, height;
    let dots = [];
    let animationFrameId;
    let phase = 'float'; // float, connect, unify, idle
    let phaseTimer = 0;

    // Animation Phases Duration (frames approx 60fps)
    const PHASES = {
        FLOAT: 120,    // 2 seconds float
        CONNECT: 300,  // 5 seconds connecting
        UNIFY: 180,    // 3 seconds fading to white
        IDLE: -1       // Indefinite
    };

    class Dot {
        constructor(isFirst) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow idle motion
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = 2 + Math.random(); // 2-3px
            this.baseColor = isFirst ? '#ffffff' : COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1];
            this.color = this.baseColor;
            this.alpha = 1;
            // Target for unification
            this.targetColor = '#ffffff';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Soft bounce
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

    function init() {
        resize();
        dots = [];
        for (let i = 0; i < DOT_COUNT; i++) {
            dots.push(new Dot(i === 0));
        }
        window.addEventListener('resize', resize);
        animate();
    }

    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }

    // Helper to interpolate colors
    function lerpColor(a, b, amount) {
        // Simple hex lerp or just keeping it simple for now as we transition to white
        // Since we only transition to white, we can just use white with opacity overlay or simpler logic.
        // But let's assume strict colors.
        // For simplicity in this env, we will just switch to white when unify completes or use opacity.
        // Let's implement a simple RGB lerp if needed, but fading to white is visually clean.
        return b;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update Phase
        if (phase !== 'idle') {
            phaseTimer++;
            if (phase === 'float' && phaseTimer > PHASES.FLOAT) {
                phase = 'connect';
                phaseTimer = 0;
            } else if (phase === 'connect' && phaseTimer > PHASES.CONNECT) {
                phase = 'unify';
                phaseTimer = 0;
            } else if (phase === 'unify' && phaseTimer > PHASES.UNIFY) {
                phase = 'idle';
                revealContent();
            }
        }

        // Draw Dots
        dots.forEach(dot => {
            dot.update();

            // Handle Color Unification
            if (phase === 'unify') {
                // Determine progress 0 to 1
                let progress = phaseTimer / PHASES.UNIFY;
                // Visually we want them to become white.
                // We can overlay white with alpha or change property.
                // Here we just set color to white at end.
                if (progress > 0.9) dot.color = '#ffffff';
            }

            dot.draw(ctx);
        });

        // Draw Connections
        // Logic: "Connect rarely", "Floating primary"
        // Only connect if very close.
        if (phase === 'connect' || phase === 'unify' || phase === 'idle') {
            let maxDist = 100; // Short distance
            if (phase === 'connect') maxDist = 150; // Slightly more eager during connect phase

            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < maxDist) {
                        // Rare connection: random chance or strict distance?
                        // Strict distance is better for stability.
                        // "Rarely" implies small maxDist relative to screen.

                        let alpha = 1 - (dist / maxDist);
                        // Fade in/out based on phase
                        if (phase === 'connect') {
                             // Gradual appear
                             alpha *= Math.min(1, phaseTimer / 60);
                        } else if (phase === 'unify') {
                             // Fade to white means stroke becomes white
                             ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                        } else if (phase === 'idle') {
                             // Calm, faint
                             alpha *= 0.3;
                             ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        }

                        if (phase !== 'unify' && phase !== 'idle') {
                            // Use dot color mix? Or soft glow.
                            // Prompt: "Soft glow", "Lines: Thin (0.5-1px)"
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
                        }

                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    function revealContent() {
        if (brandName) brandName.classList.add('visible');
        if (tagline) {
             // Tagline appears after brand name
            tagline.classList.add('visible');
        }
    }

    // Prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        revealContent();
    } else {
        init();
    }
})();
