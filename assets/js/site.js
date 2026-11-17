/* ShadowOps website — shared behaviour */
(() => {
  const CONTACT_EMAIL = 'info@shadowops.eu'; // change here to update the contact form target
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header shadow on scroll */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) toggle.addEventListener('click', () => {
    const open = root.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* services dropdown */
  document.querySelectorAll('.nav-drop').forEach(drop => {
    const btn = drop.querySelector('button');
    const set = open => { drop.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    let hoverOpened = 0;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      // a click right after hover-open should not immediately close the menu again
      if (Date.now() - hoverOpened < 600) return set(true);
      set(!drop.classList.contains('open'));
    });
    if (matchMedia('(hover: hover) and (min-width: 921px)').matches) {
      drop.addEventListener('mouseenter', () => { if (!drop.classList.contains('open')) hoverOpened = Date.now(); });
      let t; drop.addEventListener('mouseenter', () => { clearTimeout(t); set(true); });
      drop.addEventListener('mouseleave', () => { t = setTimeout(() => set(false), 160); });
    }
    document.addEventListener('click', e => { if (!drop.contains(e.target)) set(false); });
    drop.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); } });
  });

  /* close the mobile menu after following an in-page link */
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
    root.classList.remove('menu-open'); toggle && toggle.setAttribute('aria-expanded', 'false');
  }));

  /* footer year */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* home hero: the light that reveals findings */
  const hero = document.querySelector('[data-light]');
  if (hero) {
    const found = hero.querySelector('.found');
    const set = (x, y) => [hero, found].forEach(el => { el.style.setProperty('--x', x + 'px'); el.style.setProperty('--y', y + 'px'); });
    let pointer = false, t = 0, raf;
    hero.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      pointer = true; const r = hero.getBoundingClientRect(); set(e.clientX - r.left, e.clientY - r.top);
    });
    hero.addEventListener('pointerleave', () => { pointer = false; });
    if (!reduce) {
      const drift = () => {
        if (!pointer) { const r = hero.getBoundingClientRect(); t += .006;
          set(r.width * (.55 + .36 * Math.sin(t * 1.3)), r.height * (.5 + .3 * Math.sin(t * 1.9 + 1))); }
        raf = requestAnimationFrame(drift);
      };
      new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) drift(); }).observe(hero);
    } else { const r = hero.getBoundingClientRect(); set(r.width * .68, r.height * .45); }
    const hint = document.getElementById('hint');
    if (hint && matchMedia('(hover: none)').matches) hint.textContent = 'The light is scanning. Each highlight is a kind of finding we report.';
  }

  /* contact form: preselect from ?service= and open a prepared email */
  const form = document.getElementById('contact-form');
  if (form) {
    const want = new URLSearchParams(location.search).get('service');
    if (want) form.querySelectorAll('input[name="service"]').forEach(i => { if (i.value === want) i.checked = true; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const f = new FormData(form);
      const services = f.getAll('service');
      const body = [
        `Name: ${f.get('name')}`, `Company: ${f.get('company') || '-'}`, `Email: ${f.get('email')}`,
        `Services: ${services.length ? services.join(', ') : 'Not sure yet'}`,
        `Timing: ${f.get('timing') || '-'}`, '', f.get('message') || ''
      ].join('\n');
      const subject = `Enquiry: ${services[0] || 'Offensive security'}${f.get('company') ? ' – ' + f.get('company') : ''}`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const status = document.getElementById('form-status');
      if (status) status.textContent = 'Your email app should open with the message ready to send. If it does not, write to ' + CONTACT_EMAIL + '.';
    });
  }
})();
