(function () {
  'use strict';

  const CONTACT = {
    whatsapp: '919011787494',
    phone1: '+919011787494',
    phone2: '+917219429987',
    email: 'Laxmiassociates2005@gmail.com'
  };

  const EMAIL_CFG = window.EMAIL_CONFIG || {};
  const WEB3FORMS_KEY = EMAIL_CFG.web3formsKey || '';
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  // Show content immediately — prevents blank hero on mobile if animations fail
  document.body.classList.add('loaded');

  function revealInViewport() {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('revealed');
      }
    });
  }

  // Page loader — always hide even if external assets are slow
  const pageLoader = document.getElementById('pageLoader');

  function hidePageLoader() {
    if (pageLoader) {
      pageLoader.classList.add('hidden');
    }
  }

  if (pageLoader) {
    window.addEventListener('load', function () {
      setTimeout(hidePageLoader, 400);
    });
    setTimeout(hidePageLoader, 2500);
  }

  // Subtle hero parallax
  const hero = document.getElementById('home');
  if (hero && window.matchMedia('(min-width: 992px)').matches) {
    document.addEventListener('mousemove', function (e) {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      const visual = hero.querySelector('.hero-visual');
      if (visual) {
        visual.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      }
    });
  }

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const contactForm = document.getElementById('contactForm');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function isWeb3FormsReady() {
    return WEB3FORMS_KEY && WEB3FORMS_KEY !== 'YOUR_ACCESS_KEY_HERE';
  }

  function getThankYouUrl() {
    const path = window.location.pathname;
    const base = path.includes('/') ? path.replace(/[^/]+$/, '') : '/';
    return window.location.origin + base + 'thank-you.html';
  }

  // Set FormSubmit redirect after successful send
  const formNext = document.getElementById('formNext');
  if (formNext && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    formNext.value = getThankYouUrl();
  }

  // Header scroll effect
  function handleScroll() {
    if (!header) return;

    const hero = document.getElementById('home');
    const heroBottom = hero ? hero.offsetHeight : 0;
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (hero && scrollY < heroBottom - 100) {
      header.classList.add('hero-nav');
    } else {
      header.classList.remove('hero-nav');
    }

    if (scrollProgress && docHeight > 0) {
      scrollProgress.style.width = (scrollY / docHeight) * 100 + '%';
    }

    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 600);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navToggle && navLinks) {
    const navOverlay = document.getElementById('navOverlay');

    function setMobileMenu(open) {
      navLinks.classList.toggle('active', open);
      navToggle.classList.toggle('active', open);
      if (navOverlay) {
        navOverlay.classList.toggle('active', open);
        navOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
      document.body.classList.toggle('menu-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    navToggle.addEventListener('click', function () {
      setMobileMenu(!navLinks.classList.contains('active'));
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', function () {
        setMobileMenu(false);
      });
    }

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMobileMenu(false);
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        setMobileMenu(false);
      }
    });
  }

  // Contact form → Email only
  if (contactForm) {
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    contactForm.addEventListener('submit', async function (e) {
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const service = document.getElementById('service');
      const serviceText = service.value || service.options[service.selectedIndex].text;
      const message = document.getElementById('message').value.trim();

      if (!name || !phone || !service.value) {
        e.preventDefault();
        return;
      }

      // Web3Forms: send via AJAX (stays on page, shows success message)
      if (isWeb3FormsReady()) {
        e.preventDefault();
        setFormLoading(true);
        setFormStatus('', '');

        try {
          const response = await fetch(WEB3FORMS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: WEB3FORMS_KEY,
              subject: 'New Consultation Booking — Laxmi Associates',
              from_name: 'Laxmi Associates Website',
              name: name,
              phone: phone,
              service: serviceText,
              message: message || 'Not provided'
            })
          });

          const result = await response.json();

          if (result.success === true) {
            contactForm.reset();
            setFormStatus('success', 'Thank you! Your consultation request has been sent. We will contact you within 24 hours.');
            showToast('Email sent successfully!');
          } else {
            setFormStatus('warn', 'Could not send email. Please try again or contact us at Laxmiassociates2005@gmail.com');
          }
        } catch (err) {
          setFormStatus('warn', 'Network error. Please try again or email Laxmiassociates2005@gmail.com');
        }

        setFormLoading(false);
        return;
      }

      // FormSubmit: direct POST (browser sends to your Gmail)
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        setFormStatus('warn', 'Email booking works when the site is hosted online. Upload your website files to Netlify or any web host, then test the form there.');
        return;
      }

      // Allow native form POST → FormSubmit → thank-you.html
      setFormLoading(true);
      setFormStatus('', '');
    });

    function setFormLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.classList.toggle('is-loading', loading);
    }

    function setFormStatus(type, msg) {
      if (!formStatus) return;
      formStatus.textContent = msg;
      formStatus.className = 'form-status' + (type ? ' form-status-' + type : '');
    }
  }

  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .service-card, .why-card, .category-card, .testimonial-card, .doc-card, .pricing-card, .faq-item').forEach(function (el, i) {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    revealObserver.observe(el);
  });

  revealInViewport();
  window.addEventListener('load', revealInViewport);

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(function (el) {
    counterObserver.observe(el);
  });

  function updateCountdown() {
    const deadline = new Date('2026-07-31T23:59:59');
    const now = new Date();
    const diff = deadline - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function highlightNav() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
})();
