(function () {
  'use strict';

  // ----- Smooth scroll for anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      var target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----- Advanced scroll-triggered animations -----
  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: [0.05, 0.15, 0.25]
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // Skip hero (uses CSS keyframe animations)
      if (el.closest('#hero')) return;
      el.classList.add('visible');
      observer.unobserve(el);
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
    if (!el.closest('#hero')) observer.observe(el);
  });

  // ----- Benefit cards: 3D tilt on mouse move (desktop only) -----
  function setupTiltCards() {
    var cards = document.querySelectorAll('.benefit-card');
    if (!cards.length) return;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.2s ease, box-shadow 0.3s ease';
      });
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var tiltX = (y - 0.5) * -8;
        var tiltY = (x - 0.5) * 8;
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  if (window.matchMedia('(hover: hover)').matches) {
    setupTiltCards();
  }

  // ----- Email validation -----
  var emailInput = document.getElementById('email');
  var emailError = document.getElementById('email-error');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (emailInput && emailError) {
    emailInput.addEventListener('blur', function () {
      var val = this.value.trim();
      if (val && !validateEmail(val)) {
        emailError.textContent = 'Please enter a valid email address.';
        this.classList.add('invalid');
      } else {
        emailError.textContent = '';
        this.classList.remove('invalid');
      }
    });
  }

  // ----- Form submit via Formspree (stay on page, show success) -----
  var form = document.getElementById('planner-form');
  var formWrapper = document.getElementById('form-wrapper');
  var successMessage = document.getElementById('success-message');
  var submitBtn = document.getElementById('submit-btn');

  if (form && formWrapper && successMessage && submitBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailVal = emailInput ? emailInput.value.trim() : '';

      if (emailInput && !validateEmail(emailVal)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('invalid');
        emailInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var formData = new FormData(form);

      fetch('https://formspree.io/f/xeerjjyw', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            formWrapper.hidden = true;
            successMessage.hidden = false;
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Unlock My Planner';
          if (emailError) emailError.textContent = 'Something went wrong. Please try again.';
        });
    });
  }
})();
