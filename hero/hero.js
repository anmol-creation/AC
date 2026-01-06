(function() {
    const container = document.getElementById('hero-container');
    const canvas = document.getElementById('hero-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const brandName = container.querySelector('.hero-brand-name');
    const tagline = container.querySelector('.hero-tagline');

    // Muted Color Palette
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

        // Immediate Animation Start
        animate();

        // Independent Timing for Content Reveal
        // 0.6s -> Brand Reveal Start
        setTimeout(() => {
            if (brandName) brandName.classList.add('visible');
        }, 600);

        // 1.4s -> Tagline Reveal
        setTimeout(() => {
            if (tagline) tagline.classList.add('visible');
        }, 1400);
    }

    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
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
                // Reveal handled by independent timers now
            }
        }

        // Draw Dots
        dots.forEach(dot => {
            dot.update();

            // Handle Color Unification
            if (phase === 'unify') {
                let progress = phaseTimer / PHASES.UNIFY;
                if (progress > 0.9) dot.color = '#ffffff';
            }

            dot.draw(ctx);
        });

        // Draw Connections
        if (phase === 'connect' || phase === 'unify' || phase === 'idle') {
            let maxDist = 100;
            if (phase === 'connect') maxDist = 150;

            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < maxDist) {
                        let alpha = 1 - (dist / maxDist);

                        if (phase === 'connect') {
                             alpha *= Math.min(1, phaseTimer / 60);
                        } else if (phase === 'unify') {
                             ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                        } else if (phase === 'idle') {
                             alpha *= 0.3;
                             ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        }

                        if (phase !== 'unify' && phase !== 'idle') {
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

    // Prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        if (brandName) brandName.classList.add('visible');
        if (tagline) tagline.classList.add('visible');
    } else {
        init();
    }
})();
