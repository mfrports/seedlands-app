// Seedlands' site. Four small jobs, nothing from anywhere else:
//   · what comes into view rises out of the ground, once (.rise → .in)
//   · a phone's clip is fetched and played only while it is seen, and begins again by
//     fading over to its first picture instead of jumping to it
//   · the rail at the right edge says where on the way down one is
//   · the Warden's note counts, as it does in the app
// Without this script everything simply stands there (see the line in each page's head).
(() => {
  const d = document;
  window.seedlands = true;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const all = (q, el = d) => Array.from(el.querySelectorAll(q));

  // Rising. One thing after another within a group: --i is its place in the row.
  // (A browser that can't tell what is in view shows everything at once, and its clips with their own controls.)
  const risers = all('.rise'), sees = 'IntersectionObserver' in window;
  const Watch = sees ? IntersectionObserver : class { observe() {} unobserve() {} };
  if (!sees) risers.forEach(el => el.classList.add('in'));
  const rising = new Watch(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      rising.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  // What stands on the first screen comes at once, whatever part of it the window shows.
  risers.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); else rising.observe(el); });

  // Clips. The first picture of each lies under it (the screen's background), so a clip
  // that ends fades away to it and starts over from there: nothing jumps.
  const clips = all('video[data-src]');
  const begin = v => {
    if (!v.src) { v.src = v.dataset.src; v.load(); }
    const p = v.play();
    if (p) p.catch(() => {});
  };
  clips.forEach(v => {
    v.muted = true;
    v.addEventListener('playing', () => v.classList.add('on'));
    v.addEventListener('ended', () => {
      v.classList.remove('on');
      setTimeout(() => { v.currentTime = 0; if (v.dataset.seen === '1') begin(v); }, 700);
    });
  });
  if (!sees) clips.forEach(v => { v.controls = true; v.classList.add('on'); v.preload = 'none'; v.src = v.dataset.src; });
  const watching = new Watch(entries => {
    for (const e of entries) {
      const v = e.target;
      v.dataset.seen = e.isIntersecting ? '1' : '0';
      // Motion not wanted: the clip stands still on its first picture, with its own controls to play it.
      if (calm.matches) { v.controls = true; v.classList.add('on'); if (!v.src) { v.preload = 'none'; v.src = v.dataset.src; } continue; }
      if (e.isIntersecting) begin(v); else v.pause();
    }
  }, { threshold: 0.3 });
  clips.forEach(v => watching.observe(v));

  // The world behind the first screen: wide or tall as the window is, played once. It ends
  // on the land at rest and stays there. Where it can't play, that last picture comes up instead.
  const world = d.querySelector('.world video');
  if (world) {
    const tall = innerHeight > innerWidth * 1.05, hold = world.parentElement;
    const still = () => {
      const img = new Image();
      img.onload = () => { hold.style.setProperty('--still', 'url(' + img.src + ')'); hold.classList.add('still'); };
      img.src = tall ? 'img/world-tall.jpg' : 'img/world-wide.jpg';
    };
    if (calm.matches) still();
    else {
      world.muted = true;
      world.addEventListener('playing', () => world.classList.add('on'), { once: true });
      world.addEventListener('error', still, { once: true });
      world.src = tall ? world.dataset.tall : world.dataset.wide;
      const p = world.play();
      if (p) p.catch(still);
    }
  }

  // The rail.
  const stops = all('.rail a');
  if (stops.length) {
    const places = stops.map(a => d.getElementById(a.hash.slice(1))).filter(Boolean);
    const mark = () => {
      const eye = scrollY + innerHeight * 0.42;
      let at = null;
      for (const p of places) if (p.getBoundingClientRect().top + scrollY <= eye) at = p;
      stops.forEach(a => a.classList.toggle('on', !!at && a.hash === '#' + at.id));
    };
    let due = false;
    addEventListener('scroll', () => { if (!due) { due = true; requestAnimationFrame(() => { due = false; mark(); }); } }, { passive: true });
    addEventListener('resize', mark);
    mark();
  }

  // The pit of the icon looks down a little further where the pointer is.
  const pit = d.querySelector('.pit');
  if (pit && !calm.matches && matchMedia('(hover: hover)').matches) {
    const hold = pit.closest('section') || pit;
    hold.addEventListener('pointermove', e => {
      const r = pit.getBoundingClientRect();
      pit.style.setProperty('--px', Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / innerWidth * 2)).toFixed(3));
      pit.style.setProperty('--py', Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / innerHeight * 2)).toFixed(3));
    });
    hold.addEventListener('pointerleave', () => { pit.style.setProperty('--px', 0); pit.style.setProperty('--py', 0); });
  }

  // The Warden's note: one warning is forgotten every ten minutes. It counts while it is
  // seen, and nine seconds in a shrieker goes off: the next mark fills and the time begins again.
  const note = d.querySelector('.warden');
  if (note) {
    const marks = all('.marks i', note), count = note.querySelector('.count'), time = note.querySelector('.time');
    let level = 2, left = 581, seen = false, since = 0;   // 9:41 to go
    const show = () => {
      count.textContent = level;
      time.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
      marks.forEach((m, i) => {
        m.classList.toggle('lit', i < level);
        m.style.setProperty('--full', i === level - 1 ? Math.max(left / 600, 0.06) : i < level ? 1 : 0.06);
      });
    };
    show();
    new Watch(es => { seen = es[0].isIntersecting; }, { threshold: 0.6 }).observe(note);
    if (!calm.matches) setInterval(() => {
      if (!seen) return;
      if (left > 1) left -= 1;
      since += 1;
      if (since === 9) { level = 3; left = 600; }   // a shrieker goes off: the ten minutes begin again
      show();
    }, 1000);
  }
})();
