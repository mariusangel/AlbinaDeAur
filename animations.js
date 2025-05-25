document.addEventListener("DOMContentLoaded", () => {
  // Funcția principală de inițializare a animațiilor
  function initAnimations() {
    // Observer pentru secțiuni
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    // Observer pentru titlurile h2
    const h2Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.5 });

    // Observer pentru cardurile de produse
    const productObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${index * 0.1}s`;
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });

    // Observer pentru elementele de beneficiu
    const benefitObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.25 });

    // Observer pentru conținutul 'Despre Noi'
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.2 });

    // Observer pentru formularul newsletter
    const newsletterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.25 });

    const newsletterContentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelector('h2').style.animation = 'slideUp 0.8s ease-out forwards';
          entry.target.querySelector('p').style.animation = 'fadeIn 0.8s ease 0.3s forwards';
        }
      });
    }, { threshold: 0.3 });

    // Observer special pentru hero content
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    }, { threshold: 0.5 });

    // Adăugăm observer pentru about-overlay
    const aboutOverlayObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.2 });

    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          document.querySelector('.site-footer').classList.add('in-view');
        }
      });
    });

    footerObserver.observe(document.querySelector('.footer-section'));

    // Aplică observare pentru toate elementele necesare
    document.querySelectorAll('section').forEach(el => sectionObserver.observe(el));
    document.querySelectorAll('h2').forEach(el => h2Observer.observe(el));
    document.querySelectorAll('.product-card').forEach(el => productObserver.observe(el));
    document.querySelectorAll('.benefit-item').forEach(el => benefitObserver.observe(el));
    document.querySelectorAll('.about-content').forEach(el => aboutObserver.observe(el));
    document.querySelectorAll('.newsletter-form').forEach(el => newsletterObserver.observe(el));
    document.querySelectorAll('.hero-content').forEach(el => heroObserver.observe(el));
    document.querySelectorAll('.about-overlay').forEach(el => aboutOverlayObserver.observe(el));
    document.querySelectorAll('.newsletter-content').forEach(el => newsletterContentObserver.observe(el));

    // Animații specifice pentru newsletter form elements
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      const input = newsletterForm.querySelector('input');
      const button = newsletterForm.querySelector('button');
      
      newsletterObserver.observe(newsletterForm);
      if (input) input.style.transitionDelay = '0.2s';
      if (button) button.style.transitionDelay = '0.4s';
    }
  }

  initAnimations();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('[class*="in-view"]').forEach(el => {
        el.classList.remove('in-view');
        void el.offsetWidth;
        el.classList.add('in-view');
      });
    }, 250);
  });
});