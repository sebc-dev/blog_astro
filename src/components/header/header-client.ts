/**
 * Script côté client pour le composant Header
 * Gère les thèmes, le menu mobile et les interactions
 */

// Types pour les thèmes
type Theme = 'light-blue' | 'dark-blue';

interface HeaderElements {
  menu: HTMLElement | null;
  menuToggle: HTMLButtonElement | null;
  overlay: HTMLElement | null;
  closeBtn: HTMLElement | null;
}

class HeaderManager {
  private readonly LIGHT_THEME: Theme = 'light-blue';
  private readonly DARK_THEME: Theme = 'dark-blue';
  private elements: HeaderElements;
  private isMenuOpen: boolean = false;

  constructor() {
    this.elements = this.getElements();
    this.init();
  }

  private getElements(): HeaderElements {
    return {
      menu: document.getElementById('mobile-menu'),
      menuToggle: document.getElementById('mobile-menu-toggle') as HTMLButtonElement,
      overlay: document.querySelector('[data-menu-overlay]'),
      closeBtn: document.querySelector('[data-menu-close]')
    };
  }

  private init(): void {
    this.initTheme();
    this.initMobileMenu();
    this.initDropdowns();
  }

  // === GESTION DES THÈMES ===
  private getInitialTheme(): Theme {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved === this.LIGHT_THEME || saved === this.DARK_THEME) {
      return saved;
    }
    
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? this.LIGHT_THEME : this.DARK_THEME;
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateThemeIcons(theme);
  }

  private updateThemeIcons(theme: Theme): void {
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    
    buttons.forEach(button => {
      const lightIcon = button.querySelector('.theme-light') as HTMLElement;
      const darkIcon = button.querySelector('.theme-dark') as HTMLElement;
      
      if (lightIcon && darkIcon) {
        const isLight = theme === this.LIGHT_THEME;
        lightIcon.style.display = isLight ? 'block' : 'none';
        darkIcon.style.display = isLight ? 'none' : 'block';
      }
    });
  }

  private toggleTheme = (): void => {
    const current = document.documentElement.getAttribute('data-theme') as Theme;
    const newTheme = current === this.LIGHT_THEME ? this.DARK_THEME : this.LIGHT_THEME;
    this.applyTheme(newTheme);
  };

  private initTheme(): void {
    // Application initiale
    this.applyTheme(this.getInitialTheme());
    
    // Event listeners pour les boutons de thème
    document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
      toggle.addEventListener('click', this.toggleTheme);
    });
    
    // Écoute des changements système
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? this.LIGHT_THEME : this.DARK_THEME);
      }
    });
  }

  // === GESTION DU MENU MOBILE ===
  private openMenu(): void {
    const { menu, menuToggle } = this.elements;
    if (!menu || !menuToggle) return;

    this.isMenuOpen = true;
    menu.style.transform = 'translateX(0)';
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  private closeMenu(): void {
    const { menu, menuToggle } = this.elements;
    if (!menu || !menuToggle) return;

    this.isMenuOpen = false;
    menu.style.transform = 'translateX(100%)';
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  private toggleMenu = (): void => {
    this.isMenuOpen ? this.closeMenu() : this.openMenu();
  };

  private initMobileMenu(): void {
    const { menuToggle, overlay, closeBtn } = this.elements;

    menuToggle?.addEventListener('click', this.toggleMenu);
    overlay?.addEventListener('click', () => this.closeMenu());
    closeBtn?.addEventListener('click', () => this.closeMenu());

    // Fermeture avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }

  // === GESTION DES DROPDOWNS ===
  private initDropdowns(): void {
    document.querySelectorAll('[data-dropdown]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // Fermer tous les autres
        document.querySelectorAll('[data-dropdown]').forEach(btn => {
          btn.setAttribute('aria-expanded', 'false');
        });
        
        // Toggle actuel
        if (!isExpanded) {
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Fermer au clic externe
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.('.dropdown')) {
        document.querySelectorAll('[data-dropdown]').forEach(btn => {
          btn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
}

// Initialisation uniquement côté client
if (typeof window !== 'undefined') {
  new HeaderManager();
}

export default HeaderManager;
