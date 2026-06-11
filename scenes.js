/**
 * Scene management and interactive sequences
 */
const Scenes = (() => {
  const STORY_LINES = [
    'Hey Adwiteya...',
    "There is something I've wanted to tell you for a very long time.",
    'Ever since I got to know you, every conversation felt special.',
    'You somehow became the person I looked forward to talking to.',
    'The funny moments.',
    'The random moments.',
    'The moments that probably meant nothing to anyone else...',
    '...ended up meaning everything to me.',
    'I loved every second I got to spend with you.',
    'And somewhere along the way...',
    'I fell for you.'
  ];

  const REASONS = [
    'You make conversations feel effortless.',
    'You make me smile when I least expect it.',
    'You somehow make normal moments memorable.',
    "You're one of the first people I want to tell things to.",
    'I genuinely enjoy being around you.',
    'You make my day better just by being in it.',
    'Your laugh is my favorite sound.',
    'You have this warmth that makes everything feel okay.',
    'You remember the little things that matter.',
    'Talking to you never feels like an effort.',
    'You bring out a softer side of me.',
    'Your presence alone feels comforting.',
    'You make ordinary days feel a little magical.',
    'I admire how genuinely kind you are.',
    'You have a way of making me feel understood.',
    'Every message from you brightens my mood.',
    'You turn silence into something comfortable.',
    'Your energy is something I always look forward to.',
    'You make me want to be my best self.',
    'The way you care about people is beautiful.',
    'You have this spark that draws me in.',
    'I love how real you are with me.',
    'You make me laugh in the best way.',
    'Being around you feels like home.',
    'You are effortlessly beautiful, inside and out.',
    'I cherish every random conversation we have.',
    'You make the world feel a little less heavy.',
    'My favorite moments are the unplanned ones with you.'
  ];



  const GARDEN_MESSAGES = [
    'You just made me the happiest person alive ❤️',
    'I promise to treasure every moment with you.',
    'Thank you for saying yes, Adwiteya.',
    "I can't wait to make more memories with you.",
    'Now our story begins.',
    'I love you Adwiteya 😊'
  ];

  const NO_MESSAGES = [
    '🥺 Are you sure?',
    '❤️ Really sure?',
    '🌸 Maybe give me a chance?',
    '😭 The button seems nervous...',
    '✨ Perhaps YES is a better option?'
  ];

  let currentScene = 'opening';
  let heartMeterFill = 0;
  let noAttempts = 0;
  let gardenTimer = null;
  let shootingStarShown = false;

  function $(id) { return document.getElementById(id); }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function animateWords(container, text, options = {}) {
    return new Promise(resolve => {
      container.innerHTML = '';
      container.classList.remove('fading');
      const words = text.split(' ');
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        if (options.glow) span.classList.add('glow');
        if (options.float) span.classList.add('word-float');
        span.textContent = word;
        span.style.animationDelay = `${i * (options.wordDelay || 120)}ms`;
        container.appendChild(span);
        if (i < words.length - 1) container.appendChild(document.createTextNode(' '));
      });

      const totalIn = words.length * (options.wordDelay || 120) + 600;
      setTimeout(resolve, totalIn);
    });
  }

  function fadeOutWords(container) {
    return new Promise(resolve => {
      container.classList.add('fading');
      setTimeout(() => {
        container.innerHTML = '';
        container.classList.remove('fading');
        resolve();
      }, 600);
    });
  }

  function updateHeartMeter(progress) {
    const fill = $('heart-meter-fill');
    const meter = $('heart-meter');
    if (!fill) return;

    heartMeterFill = Math.min(100, progress);
    const y = 100 - heartMeterFill;
    fill.setAttribute('y', y);
    fill.setAttribute('height', heartMeterFill);

    meter.classList.remove('pulse');
    void meter.offsetWidth;
    meter.classList.add('pulse');

    if (heartMeterFill >= 100) {
      setTimeout(() => {
        meter.classList.add('burst');
        const rect = meter.getBoundingClientRect();
        for (let i = 0; i < 15; i++) {
          setTimeout(() => {
            ParticleSystem.spawnHeartBurst(
              rect.left + rect.width / 2 + (Math.random() - 0.5) * 40,
              rect.top + rect.height / 2,
              3
            );
          }, i * 80);
        }
      }, 800);
    }
  }

  async function transitionTo(sceneName) {
    const overlay = $('scene-transition');
    overlay.classList.add('active');
    await delay(800);

    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const next = document.querySelector(`[data-scene="${sceneName}"]`);
    if (next) next.classList.add('active');
    currentScene = sceneName;

    await delay(400);
    overlay.classList.remove('active');
  }

  /* ===== OPENING ===== */
  async function runOpening() {
    const glow = document.querySelector('.opening-glow');
    const star = $('opening-star');
    const text = $('opening-text');

    await delay(1500);
    glow.classList.add('visible');
    await delay(2000);

    star.classList.add('visible');
    await delay(1500);

    await animateWords(text, 'Out of all the billions of people in the world...', { wordDelay: 100 });
    text.classList.add('visible');
    await delay(2500);

    star.querySelector('.star-core').style.transform = 'scale(1.5)';
    await delay(2000);

    await fadeOutWords(text);
    await animateWords(text, '...there was one person who somehow became my favorite.', { wordDelay: 100, glow: true });
    await delay(3000);

    star.classList.add('transform-heart');
    await delay(2500);

    await transitionTo('story');
    $('heart-meter').hidden = false;
    runStory();
  }

  /* ===== STORY ===== */
  async function runStory() {
    const line = $('story-line');
    const total = STORY_LINES.length;

    for (let i = 0; i < total; i++) {
      await animateWords(line, STORY_LINES[i], { wordDelay: 130, float: true, glow: true });
      updateHeartMeter(((i + 1) / total) * 100);

      const pauseTime = i === 0 ? 2000 : i === total - 1 ? 3500 : 2200;
      await delay(pauseTime);
      if (i < total - 1) await fadeOutWords(line);
    }

    await delay(1500);
    $('heart-meter').hidden = true;
    await transitionTo('reasons');
    initReasons();
  }

  /* ===== REASONS ===== */
  function initReasons() {
    const field = $('reasons-field');
    field.innerHTML = '';

    REASONS.forEach((reason, i) => {
      const bubble = document.createElement('div');
      bubble.className = 'reason-bubble';
      bubble.innerHTML = `<span class="reason-number">❤️ ${i + 1}</span><span class="reason-text">${reason}</span>`;
      bubble.dataset.reason = reason;

      bubble.addEventListener('click', () => revealReason(bubble));
      field.appendChild(bubble);
    });

    $('reasons-continue').onclick = async () => {
      await transitionTo('envelope');
      initEnvelope();
    };
  }

  function revealReason(bubble) {
    if (bubble.classList.contains('revealed')) return;
    bubble.classList.add('revealed');
  }

  /* ===== MEMORIES ===== */
  function initMemories() {
    const space = $('memories-space');
    space.innerHTML = '';

    $('memories-continue').onclick = async () => {
      await transitionTo('envelope');
      initEnvelope();
    };
  }

  /* ===== ENVELOPE ===== */
  function initEnvelope() {
    const envelope = $('envelope');
    const hint = $('envelope-hint');
    const contBtn = $('envelope-continue');
    let opened = false;

    function openEnvelope() {
      if (opened) return;
      opened = true;
      envelope.classList.add('open');
      hint.style.opacity = '0';
      setTimeout(() => { contBtn.hidden = false; }, 2000);
    }

    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('touchend', (e) => {
      e.preventDefault();
      openEnvelope();
    });

    contBtn.onclick = async () => {
      ParticleSystem.hideBackground();
      await transitionTo('pre-proposal');
      runPreProposal();
    };
  }

  /* ===== PRE-PROPOSAL ===== */
  async function runPreProposal() {
    const text = $('pre-proposal-text');
    const ring = $('heartbeat-ring');
    const scene = $('scene-pre-proposal');

    await delay(2000);
    text.textContent = "There's only one thing left for me to ask...";
    text.classList.add('visible');
    await delay(3500);

    ring.classList.add('active');
    scene.classList.add('zooming');
    await delay(3000);

    await transitionTo('proposal');
    ParticleSystem.showBackground();
    initProposal();
  }

  /* ===== PROPOSAL ===== */
  function initProposal() {
    const sparkles = $('proposal-sparkles');
    sparkles.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('div');
      s.className = 'proposal-sparkle';
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${Math.random() * 4}s`;
      sparkles.appendChild(s);
    }

    setupNoButton();
    $('btn-yes').onclick = runYesCelebration;
  }

  function setupNoButton() {
    const btnNo = $('btn-no');
    const msg = $('no-message');
    const padding = 16;

    btnNo.style.position = 'fixed';

    function moveNoButton() {
      const w = btnNo.offsetWidth || 80;
      const h = btnNo.offsetHeight || 36;
      const maxX = window.innerWidth - w - padding;
      const maxY = window.innerHeight - h - padding;
      const x = padding + Math.random() * Math.max(maxX - padding, padding);
      const y = padding + Math.random() * Math.max(maxY - padding, padding);
      const rot = (Math.random() - 0.5) * 60;
      const scale = 0.6 + Math.random() * 0.5;

      btnNo.style.transition = 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btnNo.style.left = `${x}px`;
      btnNo.style.top = `${y}px`;
      btnNo.style.transform = `rotate(${rot}deg) scale(${scale})`;
    }

    function dodge(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      noAttempts++;

      const msgIndex = Math.min(noAttempts - 1, NO_MESSAGES.length - 1);
      msg.textContent = NO_MESSAGES[msgIndex];
      msg.classList.add('visible');

      moveNoButton();
    }

    moveNoButton();
    btnNo.addEventListener('mouseenter', dodge);
    btnNo.addEventListener('click', dodge);
    btnNo.addEventListener('touchstart', dodge, { passive: false });

    document.addEventListener('mousemove', (e) => {
      if (currentScene !== 'proposal') return;
      const btnRect = btnNo.getBoundingClientRect();
      const cx = btnRect.left + btnRect.width / 2;
      const cy = btnRect.top + btnRect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 70) dodge(e);
    });
  }

  /* ===== YES CELEBRATION ===== */
  async function runYesCelebration() {
    const heart = $('celebration-heart');
    const flash = document.querySelector('.celebration-flash');

    await transitionTo('celebration');

    heart.textContent = '❤️';
    heart.classList.add('active');
    flash.classList.add('active');

    await delay(500);
    ParticleSystem.startCelebration(async () => {
      await delay(500);
      await transitionTo('garden');
      runGarden();
    });
  }

  /* ===== GARDEN ===== */
  async function runGarden() {
    ParticleSystem.initGarden();
    const container = $('garden-messages');

    gardenTimer = setTimeout(() => {
      if (!shootingStarShown) showShootingStar();
    }, 30000);

    for (const msg of GARDEN_MESSAGES) {
      const el = document.createElement('div');
      el.className = 'garden-message';
      el.textContent = msg;
      container.appendChild(el);
      await delay(300);
      el.classList.add('visible');
      await delay(3500);
      el.classList.add('fade-out');
      await delay(1000);
      el.remove();
    }
  }

  function showShootingStar() {
    shootingStarShown = true;
    const star = $('shooting-star');
    if (!star) return;
    star.hidden = false;
    star.classList.add('active');
  }

  return {
    runOpening,
    get currentScene() { return currentScene; }
  };
})();
