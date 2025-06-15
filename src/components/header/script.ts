(() => {
  "use strict";

  try {
    // Configuration
    const ANIMATION_DURATION = 300;
    const SCROLL_THRESHOLD = 50; // Pixel de scroll avant activation de l'effet

    // Cache des éléments DOM
    const elements = {
      mobileMenu: document.getElementById("mobile-menu")!,
      mobileMenuToggle: document.getElementById("mobile-menu-toggle")!,
      overlay: document.querySelector("[data-menu-overlay]")!,
      closeBtn: document.querySelector("[data-menu-close]")!,
      menuLinks: document.querySelectorAll("[data-menu-link]"),
      dropdownButtons: document.querySelectorAll("[data-dropdown]"),
      desktopHeader: document.getElementById("desktop-header")!,
      mobileHeader: document.getElementById("mobile-header")!,
    };

    // Gestion optimisée de l'effet de scroll
    let ticking = false;

    function updateHeaderOnScroll() {
      const currentScrollY = window.scrollY;
      const shouldBlur = currentScrollY > SCROLL_THRESHOLD;

      // Appliquer l'effet aux deux headers
      [elements.desktopHeader, elements.mobileHeader].forEach((header) => {
        if (header) {
          header.classList.toggle("scrolled", shouldBlur);
        }
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateHeaderOnScroll);
        ticking = true;
      }
    }

    // Initialiser l'effet de scroll
    window.addEventListener("scroll", onScroll, { passive: true });

    // Vérifier l'état initial au chargement
    updateHeaderOnScroll();

    // État du menu
    let isMenuOpen = false;

    // Gestion du menu mobile
    function toggleMenu() {
      isMenuOpen = !isMenuOpen;

      if (isMenuOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    }

    function openMenu() {
      const { mobileMenu, mobileMenuToggle } = elements;

      mobileMenu.classList.remove("mobile-menu-closed");
      mobileMenu.setAttribute("aria-hidden", "false");
      mobileMenuToggle.setAttribute("aria-expanded", "true");
      mobileMenuToggle.classList.add("menu-open");
      document.body.style.overflow = "hidden";

      // Focus sur le premier lien
      setTimeout(() => {
        (elements.menuLinks[0] as HTMLElement)?.focus();
      }, ANIMATION_DURATION);
    }

    function closeMenu() {
      const { mobileMenu, mobileMenuToggle } = elements;

      mobileMenu.classList.add("mobile-menu-closed");
      mobileMenu.setAttribute("aria-hidden", "true");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      mobileMenuToggle.classList.remove("menu-open");
      document.body.style.overflow = "";

      // Focus de retour
      mobileMenuToggle.focus();
      isMenuOpen = false;
    }

    // Event Listeners
    elements.mobileMenuToggle?.addEventListener("click", toggleMenu);
    elements.overlay?.addEventListener("click", closeMenu);
    elements.closeBtn?.addEventListener("click", closeMenu);

    // Fermer le menu avec Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    });

    // Fermer le menu lors du clic sur un lien
    elements.menuLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Gestion des dropdowns
    elements.dropdownButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        // Fermer tous les dropdowns
        elements.dropdownButtons.forEach((btn) => {
          btn.setAttribute("aria-expanded", "false");
        });

        // Toggle celui-ci
        if (!isExpanded) {
          button.setAttribute("aria-expanded", "true");
        }
      });
    });

    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener("click", (e: MouseEvent) => {
      if (
        !e.target ||
        !(e.target instanceof HTMLElement) ||
        !e.target.closest(".dropdown")
      ) {
        elements.dropdownButtons.forEach((btn) => {
          btn.setAttribute("aria-expanded", "false");
        });
      }
    });

    const themeToggles = document.querySelectorAll(".theme-controller");
    themeToggles.forEach((toggle, index) => {
      toggle.addEventListener("change", () => {
        themeToggles.forEach((otherToggle, otherIndex) => {
          if (index !== otherIndex) {
            (otherToggle as HTMLInputElement).checked = (
              toggle as HTMLInputElement
            ).checked;
            // Dispatcher manuellement l'événement 'change' pour notifier DaisyUI
            otherToggle.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    });
  } catch (error) {
    // Gestion globale des erreurs pour le script Header
    console.error("[Header Script] Erreur inattendue détectée:", error);
    
    // Log des informations contextuelles pour le debugging
    if (error instanceof Error) {
      console.error("[Header Script] Message:", error.message);
      console.error("[Header Script] Stack:", error.stack);
    }
    
    // Optionnel : signaler l'erreur à un service de monitoring
    // en production, vous pourriez envoyer ceci à un service comme Sentry
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      // Service de monitoring en production uniquement
      // window.reportError?.(error);
    }
  }
})(); 