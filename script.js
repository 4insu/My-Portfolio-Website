document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------ */
  /* Mobile hamburger menu                                              */
  /* ------------------------------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const navLinks = nav ? nav.querySelectorAll('.nav-link') : [];

  const closeMenu = () => {
    hamburger.classList.remove('is-active');
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  if (hamburger && nav) {
    hamburger.addEventListener('click', toggleMenu);

    // Close the mobile menu whenever a nav link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close the mobile menu if the viewport is resized back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth scroll for in-page anchor links                             */
  /* (CSS scroll-behavior handles most of this; this JS fallback keeps  */
  /* it working consistently across all browsers and updates focus for  */
  /* accessibility.)                                                    */
  /* ------------------------------------------------------------------ */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Move focus to the section for keyboard/screen-reader users
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------ */
  /* Highlight the active nav link based on scroll position             */
  /* ------------------------------------------------------------------ */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkMap = new Map();

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkMap.set(href.slice(1), link);
    }
  });

  if ('IntersectionObserver' in window && sections.length && navLinkMap.size) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinkMap.get(entry.target.id);
          if (!link) return;

          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('is-current'));
            link.classList.add('is-current');
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                        */
  /* ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ */
  /* Resume button                                                      */
  /* For a local file (e.g. resume.pdf sitting next to index.html) we    */
  /* verify it exists before downloading, and show a friendly notice     */
  /* instead of a broken browser error if it hasn't been added yet.      */
  /* For an external link (Google Drive, Dropbox, etc.) we skip that     */
  /* check entirely — cross-origin HEAD requests get blocked by CORS     */
  /* and would always look like a "missing file", so those links are     */
  /* left to behave natively (open in a new tab via target="_blank").    */
  /* ------------------------------------------------------------------ */
  const resumeBtn = document.getElementById('resume-btn');

  if (resumeBtn) {
    const resumeUrl = resumeBtn.getAttribute('href');
    const isExternal = /^https?:\/\//i.test(resumeUrl) &&
      !resumeUrl.startsWith(window.location.origin);

    if (!isExternal) {
      resumeBtn.addEventListener('click', (event) => {
        event.preventDefault();

        fetch(resumeUrl, { method: 'HEAD' })
          .then((res) => {
            if (res.ok) {
              const link = document.createElement('a');
              link.href = resumeUrl;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.download = resumeBtn.getAttribute('download') || '';
              document.body.appendChild(link);
              link.click();
              link.remove();
            } else {
              showResumeNotice();
            }
          })
          .catch(() => showResumeNotice());
      });
    }
    // External links need no JS at all — the anchor's own href/target
    // attributes handle opening it correctly.
  }

  function showResumeNotice() {
    const existing = document.getElementById('resume-notice');
    if (existing) {
      existing.remove();
    }

    const notice = document.createElement('div');
    notice.id = 'resume-notice';
    notice.className = 'resume-notice';
    notice.setAttribute('role', 'status');
    notice.textContent = 'Resume coming soon — check back shortly.';

    resumeBtn.insertAdjacentElement('afterend', notice);

    window.setTimeout(() => {
      notice.classList.add('is-visible');
    }, 10);

    window.setTimeout(() => {
      notice.classList.remove('is-visible');
      window.setTimeout(() => notice.remove(), 300);
    }, 3200);
  }
});