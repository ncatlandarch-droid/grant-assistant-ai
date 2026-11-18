/* u{00A9} 2026 Think! Design and Planning, LLC. All rights reserved.
   Granted! AI Grant Assistant u{2014} Proprietary and Confidential */
/* ============================================
   Confetti Engine — Gamification Celebrations
   ────────────────────────────────────────────
   Lightweight canvas-based confetti bursts for
   milestone moments:
     • NOI Wizard step completion
     • NOI final submission
     • Proposal analysis complete
     • Pipeline stage advancement
   ============================================ */

const CONFETTI = (() => {
  let canvas, ctx, particles = [], raf = null;

  const COLORS = [
    '#FDB927', '#003DA5', '#22c55e', '#818cf8',
    '#f97316', '#ec4899', '#14b8a6', '#eab308'
  ];

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '9999'
    });
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ── Particle class ──
  class Particle {
    constructor(x, y, opts = {}) {
      this.x = x;
      this.y = y;
      this.w = 6 + Math.random() * 6;
      this.h = 4 + Math.random() * 4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.vx = (Math.random() - 0.5) * (opts.spread || 12);
      this.vy = -(Math.random() * (opts.power || 14) + 4);
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 12;
      this.gravity = opts.gravity || 0.35;
      this.drag = 0.98;
      this.opacity = 1;
      this.decay = 0.008 + Math.random() * 0.006;
      this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    }
    update() {
      this.vy += this.gravity;
      this.vx *= this.drag;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.opacity -= this.decay;
    }
    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      if (this.shape === 'rect') {
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ── Animation loop ──
  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    if (particles.length > 0) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }

  // ── Public API ──

  /** Small burst — wizard step completion */
  function burst(x, y) {
    init();
    for (let i = 0; i < 35; i++) {
      particles.push(new Particle(x, y, { spread: 8, power: 10 }));
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }

  /** Medium celebration — proposal analysis complete */
  function celebrate() {
    init();
    const cx = canvas.width / 2;
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle(cx, canvas.height * 0.3, { spread: 16, power: 16 }));
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }

  /** Big party — NOI submission or major milestone */
  function party() {
    init();
    const w = canvas.width;
    const h = canvas.height;
    // Three burst points
    const origins = [
      { x: w * 0.2, y: h * 0.4 },
      { x: w * 0.5, y: h * 0.25 },
      { x: w * 0.8, y: h * 0.4 }
    ];
    origins.forEach(o => {
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(o.x, o.y, { spread: 14, power: 18 }));
      }
    });
    if (!raf) raf = requestAnimationFrame(loop);

    // Second wave after 400ms
    setTimeout(() => {
      origins.forEach(o => {
        for (let i = 0; i < 40; i++) {
          particles.push(new Particle(o.x, o.y, { spread: 10, power: 12 }));
        }
      });
      if (!raf) raf = requestAnimationFrame(loop);
    }, 400);
  }

  /** Shower from top — pipeline advancement */
  function shower() {
    init();
    const w = canvas.width;
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        particles.push(new Particle(
          Math.random() * w, -10,
          { spread: 4, power: 2, gravity: 0.2 }
        ));
        if (!raf) raf = requestAnimationFrame(loop);
      }, i * 30);
    }
  }

  return { burst, celebrate, party, shower };
})();
