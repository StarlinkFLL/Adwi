/**
 * Background particles, celebration explosion, and garden scene renderer
 */
const ParticleSystem = (() => {
  let bgCanvas, bgCtx;
  let celebCanvas, celebCtx;
  let gardenCanvas, gardenCtx;
  let bgParticles = [];
  let celebParticles = [];
  let gardenState = null;
  let animFrameId = null;
  let gardenAnimId = null;
  let reducedMotion = false;

  class Particle {
    constructor(w, h, type = 'star') {
      this.type = type;
      this.reset(w, h);
    }

    reset(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.01;
    }

    update(w, h) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.twinkle += this.twinkleSpeed;

      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;
    }

    draw(ctx) {
      const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 182, 217, ${alpha})`;
      ctx.fill();
    }
  }

  class CelebParticle {
    constructor(cx, cy) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.x = cx;
      this.y = cy;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 6 + 2;
      this.life = 1;
      this.decay = Math.random() * 0.015 + 0.008;
      this.color = Math.random() > 0.5 ? '#ff4fa3' : '#ffb6d9';
      this.shape = Math.random() > 0.7 ? 'heart' : 'circle';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.globalAlpha = this.life;
      if (this.shape === 'heart') {
        drawHeart(ctx, this.x, this.y, this.size, this.color);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -3, -10, 2, 0, 10);
    ctx.bezierCurveTo(10, 2, 5, -3, 0, 3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function initBackground() {
    bgCanvas = document.getElementById('bg-canvas');
    if (!bgCanvas) return;
    bgCtx = bgCanvas.getContext('2d');
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resizeBg();
    window.addEventListener('resize', resizeBg);

    const count = reducedMotion ? 30 : 80;
    bgParticles = Array.from({ length: count }, () =>
      new Particle(bgCanvas.width, bgCanvas.height)
    );

    animateBg();
  }

  function resizeBg() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  function animateBg() {
    if (!bgCtx) return;
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    bgParticles.forEach(p => {
      p.update(bgCanvas.width, bgCanvas.height);
      p.draw(bgCtx);
    });

    if (Math.random() < 0.003 && !reducedMotion) {
      const sx = Math.random() * bgCanvas.width;
      const sy = Math.random() * bgCanvas.height;
      bgCtx.beginPath();
      bgCtx.arc(sx, sy, 3, 0, Math.PI * 2);
      bgCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      bgCtx.fill();
    }

    animFrameId = requestAnimationFrame(animateBg);
  }

  function spawnHeartBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.textContent = '❤';
      el.style.cssText = `
        position: fixed; left: ${x}px; top: ${y}px; font-size: ${Math.random() * 10 + 8}px;
        color: #ff4fa3; pointer-events: none; z-index: 9998;
        animation: heartBurstUp ${1 + Math.random()}s ease forwards;
      `;
      el.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  function startCelebration(onComplete) {
    celebCanvas = document.getElementById('celebration-canvas');
    if (!celebCanvas) return;
    celebCtx = celebCanvas.getContext('2d');
    celebCanvas.width = window.innerWidth;
    celebCanvas.height = window.innerHeight;

    const cx = celebCanvas.width / 2;
    const cy = celebCanvas.height / 2;

    celebParticles = [];
    for (let i = 0; i < 500; i++) {
      celebParticles.push(new CelebParticle(cx, cy));
    }

    let frame = 0;
    const maxFrames = 120;

    function animateCeleb() {
      celebCtx.fillStyle = 'rgba(8, 8, 8, 0.1)';
      celebCtx.fillRect(0, 0, celebCanvas.width, celebCanvas.height);

      celebParticles = celebParticles.filter(p => p.life > 0);
      celebParticles.forEach(p => {
        p.update();
        p.draw(celebCtx);
      });

      frame++;
      if (frame < maxFrames) {
        requestAnimationFrame(animateCeleb);
      } else if (onComplete) {
        onComplete();
      }
    }

    animateCeleb();
  }

  function initGarden() {
    gardenCanvas = document.getElementById('garden-canvas');
    if (!gardenCanvas) return;
    gardenCtx = gardenCanvas.getContext('2d');
    resizeGarden();
    window.addEventListener('resize', resizeGarden);

    gardenState = {
      flowers: [],
      petals: [],
      butterflies: [],
      sparkles: [],
      startTime: Date.now()
    };

    for (let i = 0; i < 15; i++) {
      setTimeout(() => spawnFlower(), i * 400);
    }

    spawnLanterns();
    animateGarden();
  }

  function resizeGarden() {
    if (!gardenCanvas) return;
    gardenCanvas.width = window.innerWidth;
    gardenCanvas.height = window.innerHeight;
  }

  function spawnFlower() {
    if (!gardenState) return;
    const w = gardenCanvas.width;
    const h = gardenCanvas.height;
    gardenState.flowers.push({
      x: Math.random() * w,
      baseY: h,
      height: 0,
      maxHeight: Math.random() * 120 + 80,
      type: Math.random() > 0.5 ? 'rose' : 'cherry',
      growSpeed: Math.random() * 2 + 1,
      bloom: 0,
      sway: Math.random() * Math.PI * 2
    });
  }

  function spawnLanterns() {
    const container = document.getElementById('garden-lanterns');
    if (!container) return;
    for (let i = 0; i < 8; i++) {
      const lantern = document.createElement('div');
      lantern.className = 'lantern';
      lantern.textContent = '🏮';
      lantern.style.left = `${10 + Math.random() * 80}%`;
      lantern.style.animationDelay = `${Math.random() * 8}s`;
      lantern.style.animationDuration = `${6 + Math.random() * 4}s`;
      container.appendChild(lantern);
    }
  }

  function drawRose(ctx, x, y, size, bloom) {
    const petals = Math.floor(bloom * 5) + 1;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.3, size * 0.4 * bloom, size * 0.25 * bloom, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, ${79 + i * 10}, 163, ${0.6 + bloom * 0.4})`;
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(x, y, size * 0.2 * bloom, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4fa3';
    ctx.fill();
  }

  function drawCherry(ctx, x, y, size, bloom) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * size * 0.5 * bloom;
      const py = y + Math.sin(angle) * size * 0.5 * bloom;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.35 * bloom, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 182, 217, ${0.5 + bloom * 0.5})`;
      ctx.fill();
    }
  }

  function drawStem(ctx, x, y, height, sway) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.sin(sway) * 15, y - height / 2, x + Math.sin(sway) * 8, y - height);
    ctx.strokeStyle = 'rgba(80, 120, 60, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function animateGarden() {
    if (!gardenCtx || !gardenState) return;
    const w = gardenCanvas.width;
    const h = gardenCanvas.height;
    const time = Date.now();

    gardenCtx.clearRect(0, 0, w, h);

    gardenState.flowers.forEach(f => {
      if (f.height < f.maxHeight) f.height += f.growSpeed;
      if (f.height >= f.maxHeight * 0.8 && f.bloom < 1) f.bloom += 0.02;
      f.sway += 0.02;

      const topY = f.baseY - f.height;
      drawStem(gardenCtx, f.x, f.baseY, f.height, f.sway);
      if (f.type === 'rose') drawRose(gardenCtx, f.x + Math.sin(f.sway) * 8, topY, 18, f.bloom);
      else drawCherry(gardenCtx, f.x + Math.sin(f.sway) * 8, topY, 20, f.bloom);
    });

    if (Math.random() < 0.05) {
      gardenState.petals.push({
        x: Math.random() * w,
        y: -10,
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * 2 + 1,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        size: Math.random() * 6 + 4,
        color: Math.random() > 0.5 ? '#ffb6d9' : '#ff4fa3'
      });
    }

    gardenState.petals = gardenState.petals.filter(p => p.y < h + 20);
    gardenState.petals.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      gardenCtx.save();
      gardenCtx.translate(p.x, p.y);
      gardenCtx.rotate(p.rotation * Math.PI / 180);
      gardenCtx.fillStyle = p.color;
      gardenCtx.globalAlpha = 0.7;
      gardenCtx.beginPath();
      gardenCtx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      gardenCtx.fill();
      gardenCtx.restore();
    });

    if (Math.random() < 0.002) {
      gardenState.butterflies.push({
        x: -20,
        y: Math.random() * h * 0.6,
        speedX: Math.random() * 2 + 1,
        wingPhase: 0
      });
    }

    gardenState.butterflies = gardenState.butterflies.filter(b => b.x < w + 30);
    gardenState.butterflies.forEach(b => {
      b.x += b.speedX;
      b.y += Math.sin(b.wingPhase) * 0.5;
      b.wingPhase += 0.15;
      gardenCtx.font = '20px serif';
      gardenCtx.fillText('🦋', b.x, b.y);
    });

    if (Math.random() < 0.02) {
      gardenState.sparkles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        life: 1
      });
    }

    gardenState.sparkles = gardenState.sparkles.filter(s => s.life > 0);
    gardenState.sparkles.forEach(s => {
      s.life -= 0.03;
      gardenCtx.beginPath();
      gardenCtx.arc(s.x, s.y, 3 * s.life, 0, Math.PI * 2);
      gardenCtx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
      gardenCtx.fill();
    });

    gardenAnimId = requestAnimationFrame(animateGarden);
  }

  function stopGarden() {
    if (gardenAnimId) cancelAnimationFrame(gardenAnimId);
    gardenState = null;
  }

  function hideBackground() {
    if (bgCanvas) bgCanvas.style.opacity = '0';
  }

  function showBackground() {
    if (bgCanvas) bgCanvas.style.opacity = '1';
  }

  return {
    initBackground,
    spawnHeartBurst,
    startCelebration,
    initGarden,
    stopGarden,
    hideBackground,
    showBackground
  };
})();

// Heart burst animation keyframes injected once
(function injectBurstStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes heartBurstUp {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(var(--tx, 0), -120px) scale(0.5); }
    }
  `;
  document.head.appendChild(style);
})();
