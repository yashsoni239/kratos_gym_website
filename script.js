(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-menu a[href^='#']"));
  const localLinks = Array.from(document.querySelectorAll("a[href^='#']"));
  const contactForm = document.querySelector(".contact-form");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getHeaderHeight = () => (header ? header.offsetHeight : 0);

  const easeInOutCubic = (progress) => {
    if (progress < 0.5) {
      return 4 * progress * progress * progress;
    }

    return 1 - Math.pow(-2 * progress + 2, 3) / 2;
  };

  const scrollToTarget = (target) => {
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();

    if (prefersReducedMotion) {
      window.scrollTo(0, targetTop);
      return;
    }

    const startTop = window.pageYOffset;
    const distance = targetTop - startTop;
    const duration = 800;
    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startTop + distance * easeInOutCubic(progress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const closeMobileMenu = () => {
    if (!navMenu || !navToggle) {
      return;
    }

    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  };

  const toggleMobileMenu = () => {
    if (!navMenu || !navToggle) {
      return;
    }

    const isOpen = navMenu.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };

  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileMenu);
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });

  localLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");

      if (!hash) {
        return;
      }

      if (hash === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(hash);

      if (!target) {
        return;
      }

      event.preventDefault();
      closeMobileMenu();
      scrollToTarget(target);
    });
  });

  const setActiveNavLink = () => {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const scrollPosition = window.pageYOffset + getHeaderHeight() + 140;
    let currentSection = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPosition) {
        currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      const isActive = currentSection && link.getAttribute("href") === `#${currentSection.id}`;
      link.classList.toggle("active", isActive);
    });
  };

  let activeTicking = false;

  const requestActiveUpdate = () => {
    if (activeTicking) {
      return;
    }

    activeTicking = true;
    window.requestAnimationFrame(() => {
      setActiveNavLink();
      activeTicking = false;
    });
  };

  window.addEventListener("scroll", requestActiveUpdate, { passive: true });
  window.addEventListener("resize", requestActiveUpdate);
  setActiveNavLink();

  const setupClassFilters = () => {
    const classesSection = document.querySelector("#classes");
    const sectionHeader = classesSection ? classesSection.querySelector(".section-header") : null;
    const classCards = classesSection ? Array.from(classesSection.querySelectorAll(".class-card")) : [];

    if (!classesSection || !sectionHeader || classCards.length === 0) {
      return;
    }

    const filters = [
      { label: "All", value: "all" },
      { label: "Weight Loss", value: "weight-loss" },
      { label: "Powerlifting", value: "powerlifting" },
      { label: "Strength Building", value: "strength-building" },
      { label: "Weight Lifting", value: "weight-lifting" },
      { label: "CrossFit", value: "crossfit" }
    ];
    const filterBar = document.createElement("div");
    filterBar.className = "class-filters";
    filterBar.setAttribute("aria-label", "Filter fitness classes");

    filters.forEach((filter, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.dataset.filter = filter.value;
      button.textContent = filter.label;

      if (index === 0) {
        button.classList.add("active");
      }

      filterBar.appendChild(button);
    });

    sectionHeader.insertAdjacentElement("afterend", filterBar);

    classCards.forEach((card) => {
      if (!card.dataset.class) {
        const title = card.querySelector("h3");
        card.dataset.class = title ? title.textContent.trim().toLowerCase() : "";
      }
    });

    filterBar.addEventListener("click", (event) => {
      const button = event.target.closest(".filter-button");

      if (!button) {
        return;
      }

      const filterValue = button.dataset.filter;
      filterBar.querySelectorAll(".filter-button").forEach((filterButton) => {
        filterButton.classList.toggle("active", filterButton === button);
      });

      classCards.forEach((card) => {
        const shouldShow = filterValue === "all" || card.dataset.class === filterValue;
        card.classList.add("is-filtering");

        window.setTimeout(() => {
          card.classList.toggle("is-hidden", !shouldShow);
          window.requestAnimationFrame(() => {
            card.classList.remove("is-filtering");
          });
        }, 180);
      });
    });
  };

  setupClassFilters();

  const setupScrollReveal = () => {
    const revealItems = document.querySelectorAll(
      ".feature-card, .class-card, .trainer-card, .pricing-card, .testimonial-card, .contact-details, .contact-form"
    );

    if (revealItems.length === 0) {
      return;
    }

    revealItems.forEach((item) => item.classList.add("fade-in"));

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  setupScrollReveal();

  const innovationVideo = document.querySelector(".innovation-media video");
  if (innovationVideo) {
    const unmuteVideo = () => {
      innovationVideo.muted = false;
      document.removeEventListener("click", unmuteVideo);
      document.removeEventListener("keydown", unmuteVideo);
      document.removeEventListener("touchstart", unmuteVideo);
    };
    document.addEventListener("click", unmuteVideo);
    document.addEventListener("keydown", unmuteVideo);
    document.addEventListener("touchstart", unmuteVideo);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = contactForm.querySelector("#name");
      const email = contactForm.querySelector("#email");
      const message = contactForm.querySelector("#message");
      const nameValue = name ? name.value.trim() : "";
      const emailValue = email ? email.value.trim() : "";
      const messageValue = message ? message.value.trim() : "";

      if (!nameValue) {
        alert("Please enter your name.");
        if (name) {
          name.focus();
        }
        return;
      }

      if (!emailValue || !emailValue.includes("@")) {
        alert("Please enter a valid email address.");
        if (email) {
          email.focus();
        }
        return;
      }

      if (!messageValue) {
        alert("Please enter your message.");
        if (message) {
          message.focus();
        }
        return;
      }

      alert("Thank you! Your message has been sent successfully.");
      contactForm.reset();
    });
  }
})();
