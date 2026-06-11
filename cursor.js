/**
 * Custom cursor with trailing glowing hearts
 */
const CursorTrail = (() => {
  const hearts = [];
  const maxHearts = 25;
  let layer, lastX = 0, lastY = 0, rafId;
  let enabled = true;

  function init() {
    layer = document.getElementById('cursor-layer');
    if (!layer) return;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      enabled = false;
      document.body.style.cursor = 'auto';
      return;
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('touchmove', onTouch, { passive: true });
    animate();
  }

  function onMove(e) {
    if (!enabled) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.sqrt(dx * dx + dy * dy) < 8) return;

    lastX = e.clientX;
    lastY = e.clientY;
    spawnHeart(e.clientX, e.clientY);
  }

  function onTouch(e) {
    if (!enabled || !e.touches.length) return;
    const t = e.touches[0];
    spawnHeart(t.clientX, t.clientY);
  }

  function spawnHeart(x, y) {
    const heart = document.createElement('span');
    heart.className = 'cursor-heart';
    heart.textContent = '♥';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.opacity = '1';
    heart.style.transform = 'translate(-50%, -50%) scale(1)';
    heart.dataset.life = '1';
    heart.dataset.vx = ((Math.random() - 0.5) * 0.5).toFixed(2);
    heart.dataset.vy = ((-Math.random() * 0.8 - 0.2)).toFixed(2);
    layer.appendChild(heart);
    hearts.push(heart);

    while (hearts.length > maxHearts) {
      const old = hearts.shift();
      old.remove();
    }
  }

  function animate() {
    hearts.forEach((h, i) => {
      let life = parseFloat(h.dataset.life);
      life -= 0.018;
      h.dataset.life = life;

      const vx = parseFloat(h.dataset.vx);
      const vy = parseFloat(h.dataset.vy);
      const x = parseFloat(h.style.left) + vx;
      const y = parseFloat(h.style.top) + vy;
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.opacity = life;
      h.style.transform = `translate(-50%, -50%) scale(${life})`;

      if (life <= 0) {
        h.remove();
        hearts.splice(i, 1);
      }
    });

    rafId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    hearts.forEach(h => h.remove());
    hearts.length = 0;
  }

  return { init, destroy };
})();
