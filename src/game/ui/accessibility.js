/**
 * @fileoverview Accessibility features for Universal Paperclips
 * Implements WCAG 2.1 AA compliance features including:
 * - ARIA labels and roles
 * - Screen reader announcements
 * - Keyboard navigation
 * - High contrast mode
 * - Focus management
 */

import { gameState } from "../core/gameState.js";
import { errorHandler } from "../core/errorHandler.js";

/**
 * Manages accessibility features for the game
 */
class AccessibilityManager {
  constructor() {
    this.announcer = null;
    this.lastAnnouncement = "";
    this.highContrastEnabled = false;
    this.reducedMotionEnabled = false;
    this.keyboardModeActive = false;
    this.focusableElements = [];
    this.currentFocusIndex = 0;

    // Check user preferences
    this.checkUserPreferences();

    // Initialize accessibility features
    this.initializeAnnouncer();
    this.initializeKeyboardNavigation();
    this.initializeHighContrast();
    this.initializeFocusManagement();
    this.addSkipLinks();
    this.enhanceElements();

    errorHandler.info("Accessibility features initialized");
  }

  /**
   * Check and apply user accessibility preferences
   */
  checkUserPreferences() {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotionEnabled = mediaQuery.matches;

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    if (highContrastQuery.matches) {
      this.enableHighContrast();
    }

    // Listen for changes
    mediaQuery.addEventListener("change", (e) => {
      this.reducedMotionEnabled = e.matches;
      this.updateAnimations();
    });

    highContrastQuery.addEventListener("change", (e) => {
      if (e.matches) {
        this.enableHighContrast();
      } else {
        this.disableHighContrast();
      }
    });
  }

  /**
   * Initialize screen reader announcer
   */
  initializeAnnouncer() {
    // Create main announcer for important events
    this.announcer = document.createElement("div");
    this.announcer.setAttribute("role", "status");
    this.announcer.setAttribute("aria-live", "polite");
    this.announcer.setAttribute("aria-atomic", "true");
    this.announcer.className = "sr-only";
    this.announcer.id = "game-announcer";
    document.body.appendChild(this.announcer);

    // Create urgent announcer for critical events
    this.urgentAnnouncer = document.createElement("div");
    this.urgentAnnouncer.setAttribute("role", "alert");
    this.urgentAnnouncer.setAttribute("aria-live", "assertive");
    this.urgentAnnouncer.setAttribute("aria-atomic", "true");
    this.urgentAnnouncer.className = "sr-only";
    this.urgentAnnouncer.id = "urgent-announcer";
    document.body.appendChild(this.urgentAnnouncer);

    // Add CSS for screen reader only content
    const style = document.createElement("style");
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Focus indicators */
      *:focus {
        outline: 3px solid #4A90E2;
        outline-offset: 2px;
      }
      
      .keyboard-mode *:focus {
        outline: 3px solid #ff6b6b;
        outline-offset: 4px;
      }
      
      /* High contrast mode */
      .high-contrast {
        background-color: #000 !important;
        color: #fff !important;
      }
      
      .high-contrast .game-section {
        background-color: #111 !important;
        border: 2px solid #fff !important;
      }
      
      .high-contrast .button {
        background-color: #fff !important;
        color: #000 !important;
        border: 2px solid #fff !important;
      }
      
      .high-contrast .button:hover {
        background-color: #000 !important;
        color: #fff !important;
      }
      
      .high-contrast .button:disabled {
        background-color: #333 !important;
        color: #666 !important;
        border-color: #666 !important;
      }
      
      .high-contrast .stat-value {
        color: #0ff !important;
        font-weight: bold;
      }
      
      /* Reduced motion */
      .reduced-motion * {
        animation: none !important;
        transition: none !important;
      }
      
      /* Skip links */
      .skip-links {
        position: absolute;
        top: -40px;
        left: 0;
        z-index: 9999;
      }
      
      .skip-links a {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      
      .skip-links a:focus {
        position: static;
        width: auto;
        height: auto;
        padding: 10px 20px;
        background: #000;
        color: #fff;
        text-decoration: none;
        border-radius: 0 0 5px 0;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Add skip navigation links
   */
  addSkipLinks() {
    const skipLinks = document.createElement("nav");
    skipLinks.className = "skip-links";
    skipLinks.setAttribute("aria-label", "Skip navigation");

    skipLinks.innerHTML = `
      <a href="#main-content">Skip to main content</a>
      <a href="#production">Skip to production</a>
      <a href="#businessDiv">Skip to business</a>
      <a href="#projectsDiv">Skip to projects</a>
      <a href="#gameManagement">Skip to game management</a>
    `;

    document.body.insertBefore(skipLinks, document.body.firstChild);

    // Add main content landmark
    const mainContent = document.querySelector(".game-container");
    mainContent.setAttribute("role", "main");
    mainContent.id = "main-content";
  }

  /**
   * Initialize keyboard navigation
   */
  initializeKeyboardNavigation() {
    // Track keyboard vs mouse usage
    document.addEventListener("mousedown", () => {
      this.keyboardModeActive = false;
      document.body.classList.remove("keyboard-mode");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        this.keyboardModeActive = true;
        document.body.classList.add("keyboard-mode");
      }

      // Handle arrow key navigation
      if (this.keyboardModeActive) {
        switch (e.key) {
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            this.focusPrevious();
            break;
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            this.focusNext();
            break;
          case "Home":
            e.preventDefault();
            this.focusFirst();
            break;
          case "End":
            e.preventDefault();
            this.focusLast();
            break;
        }
      }

      // Global keyboard shortcuts with announcements
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case " ":
            if (e.target.tagName !== "BUTTON") {
              e.preventDefault();
              const makeClipButton = document.getElementById("makeClipButton");
              if (makeClipButton && !makeClipButton.disabled) {
                makeClipButton.click();
                this.announce("Making paperclip");
              }
            }
            break;
          case "?":
            e.preventDefault();
            this.showKeyboardHelp();
            break;
        }
      }
    });
  }

  /**
   * Initialize high contrast mode
   */
  initializeHighContrast() {
    // Add toggle button
    const toggleButton = document.createElement("button");
    toggleButton.id = "highContrastToggle";
    toggleButton.className = "button";
    toggleButton.textContent = "Toggle High Contrast";
    toggleButton.setAttribute("aria-label", "Toggle high contrast mode");
    toggleButton.setAttribute("aria-pressed", "false");

    toggleButton.addEventListener("click", () => {
      this.toggleHighContrast();
    });

    // Add to game management section
    const gameManagement = document.querySelector("#gameManagement .controls");
    if (gameManagement) {
      gameManagement.appendChild(toggleButton);
    }
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    this.highContrastEnabled = !this.highContrastEnabled;
    document.body.classList.toggle("high-contrast", this.highContrastEnabled);

    const toggleButton = document.getElementById("highContrastToggle");
    toggleButton.setAttribute(
      "aria-pressed",
      this.highContrastEnabled.toString(),
    );

    this.announce(
      `High contrast mode ${this.highContrastEnabled ? "enabled" : "disabled"}`,
    );

    // Save preference
    localStorage.setItem(
      "highContrastEnabled",
      this.highContrastEnabled.toString(),
    );
  }

  /**
   * Enable high contrast mode
   */
  enableHighContrast() {
    this.highContrastEnabled = true;
    document.body.classList.add("high-contrast");
    const toggleButton = document.getElementById("highContrastToggle");
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", "true");
    }
  }

  /**
   * Disable high contrast mode
   */
  disableHighContrast() {
    this.highContrastEnabled = false;
    document.body.classList.remove("high-contrast");
    const toggleButton = document.getElementById("highContrastToggle");
    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", "false");
    }
  }

  /**
   * Update animations based on reduced motion preference
   */
  updateAnimations() {
    if (this.reducedMotionEnabled) {
      document.body.classList.add("reduced-motion");
    } else {
      document.body.classList.remove("reduced-motion");
    }
  }

  /**
   * Initialize focus management
   */
  initializeFocusManagement() {
    // Update focusable elements list
    this.updateFocusableElements();

    // Re-scan when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "hidden", "style"],
    });
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    const selector =
      'button:not(:disabled):not(.hidden), input:not(:disabled):not(.hidden), [tabindex="0"]:not(.hidden)';
    this.focusableElements = Array.from(
      document.querySelectorAll(selector),
    ).filter((el) => el.offsetParent !== null); // Filter out invisible elements
  }

  /**
   * Focus next element
   */
  focusNext() {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex =
      (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  /**
   * Focus previous element
   */
  focusPrevious() {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex =
      (this.currentFocusIndex - 1 + this.focusableElements.length) %
      this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  /**
   * Focus first element
   */
  focusFirst() {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = 0;
    this.focusableElements[0].focus();
  }

  /**
   * Focus last element
   */
  focusLast() {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = this.focusableElements.length - 1;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  /**
   * Enhance existing elements with ARIA attributes
   */
  enhanceElements() {
    // Enhance buttons
    this.enhanceButtons();

    // Enhance sliders
    this.enhanceSliders();

    // Enhance sections
    this.enhanceSections();

    // Enhance stats
    this.enhanceStats();

    // Add descriptions to complex elements
    this.addDescriptions();
  }

  /**
   * Enhance buttons with ARIA labels
   */
  enhanceButtons() {
    const buttonEnhancements = {
      makeClipButton: {
        label: "Make a paperclip. Costs 1 wire.",
        description: "Primary game action. Press spacebar as shortcut.",
      },
      buyAutoClipper: {
        label: "Buy AutoClipper. Automatically makes paperclips.",
        description: "Each AutoClipper produces clips automatically.",
      },
      buyMegaClipper: {
        label: "Buy MegaClipper. Produces clips faster than AutoClippers.",
        description: "Advanced automation for clip production.",
      },
      buyWire: {
        label: "Buy wire spool. Adds 1000 wire to inventory.",
        description: "Wire is required to make paperclips.",
      },
      buyAds: {
        label: "Buy marketing. Increases demand for paperclips.",
        description: "Higher marketing levels increase sales rate.",
      },
      toggleWireBuyer: {
        label: "Toggle automatic wire purchasing",
        description: "When enabled, automatically buys wire when running low.",
      },
      toggleCreativity: {
        label: "Toggle creativity generation",
        description: "When enabled, generates creativity points for projects.",
      },
      toggleCombat: {
        label: "Toggle probe combat mode",
        description: "Enable combat between probes in space.",
      },
    };

    Object.entries(buttonEnhancements).forEach(([id, config]) => {
      const button = document.getElementById(id);
      if (button) {
        button.setAttribute("aria-label", config.label);
        button.setAttribute("aria-describedby", `${id}-description`);

        // Add description element
        const description = document.createElement("span");
        description.id = `${id}-description`;
        description.className = "sr-only";
        description.textContent = config.description;
        button.parentNode.insertBefore(description, button.nextSibling);
      }
    });

    // Enhance price control buttons
    document
      .querySelectorAll(
        '[data-action="lowerPrice"], [data-action="raisePrice"]',
      )
      .forEach((button) => {
        const isLower = button.getAttribute("data-action") === "lowerPrice";
        button.setAttribute(
          "aria-label",
          `${isLower ? "Lower" : "Raise"} paperclip price by $0.01`,
        );
      });
  }

  /**
   * Enhance sliders with ARIA attributes
   */
  enhanceSliders() {
    const sliderEnhancements = {
      creativitySlider: {
        label: "Creativity allocation percentage",
        min: 0,
        max: 100,
        step: 1,
        description:
          "Allocate processing power between operations and creativity",
      },
      probeCombat: {
        label: "Probe combat allocation",
        min: 0,
        max: 100,
        step: 1,
        description: "Percentage of probe resources allocated to combat",
      },
      probeSpeed: {
        label: "Probe speed allocation",
        min: 0,
        max: 100,
        step: 1,
        description: "Percentage of probe resources allocated to speed",
      },
      probeReplication: {
        label: "Probe replication allocation",
        min: 0,
        max: 100,
        step: 1,
        description: "Percentage of probe resources allocated to replication",
      },
    };

    Object.entries(sliderEnhancements).forEach(([id, config]) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.setAttribute("role", "slider");
        slider.setAttribute("aria-label", config.label);
        slider.setAttribute("aria-valuemin", config.min);
        slider.setAttribute("aria-valuemax", config.max);
        slider.setAttribute("aria-valuenow", slider.value);
        slider.setAttribute("aria-describedby", `${id}-description`);

        // Add description
        const description = document.createElement("span");
        description.id = `${id}-description`;
        description.className = "sr-only";
        description.textContent = config.description;
        slider.parentNode.insertBefore(description, slider);

        // Update aria-valuenow on change
        slider.addEventListener("input", (e) => {
          e.target.setAttribute("aria-valuenow", e.target.value);
          this.announce(`${config.label}: ${e.target.value}%`);
        });
      }
    });
  }

  /**
   * Enhance sections with proper landmarks
   */
  enhanceSections() {
    const sections = document.querySelectorAll(".game-section");
    sections.forEach((section) => {
      // Add region role
      section.setAttribute("role", "region");

      // Label by heading
      const heading = section.querySelector("h2");
      if (heading) {
        const headingId =
          heading.id || `heading-${Math.random().toString(36).substr(2, 9)}`;
        heading.id = headingId;
        section.setAttribute("aria-labelledby", headingId);
      }

      // Make section headers keyboard accessible
      const header = section.querySelector(".section-header");
      if (header) {
        header.setAttribute("tabindex", "0");
        header.setAttribute("role", "button");
        header.setAttribute("aria-expanded", "true");
        header.setAttribute("aria-controls", section.id);

        // Add keyboard support
        header.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            header.click();
          }
        });

        // Update aria-expanded on toggle
        const originalClick = header.onclick;
        header.onclick = function (e) {
          if (originalClick) originalClick.call(this, e);
          const isExpanded =
            !header.nextElementSibling.classList.contains("collapsed");
          header.setAttribute("aria-expanded", isExpanded.toString());
        };
      }
    });
  }

  /**
   * Enhance stats with live regions
   */
  enhanceStats() {
    // Make important stats live regions
    const liveStats = [
      "clips",
      "funds",
      "wire",
      "operations",
      "creativity",
      "trust",
    ];

    liveStats.forEach((statId) => {
      const element = document.getElementById(statId);
      if (element) {
        element.setAttribute("aria-live", "polite");
        element.setAttribute("aria-atomic", "true");

        // Add label
        const label = element.parentNode.querySelector(".stat-label");
        if (label) {
          const labelId = `${statId}-label`;
          label.id = labelId;
          element.setAttribute("aria-labelledby", labelId);
        }
      }
    });
  }

  /**
   * Add descriptions to complex UI elements
   */
  addDescriptions() {
    // Add game description
    const header = document.querySelector(".game-header");
    if (header) {
      header.setAttribute("role", "banner");
      const h1 = header.querySelector("h1");
      if (h1) {
        h1.setAttribute(
          "aria-label",
          "Universal Paperclips: An incremental game about artificial intelligence and paperclip maximization",
        );
      }
    }

    // Add descriptions for game phases
    const productionSection = document.getElementById("production");
    if (productionSection) {
      productionSection.setAttribute(
        "aria-description",
        "Main production area. Create paperclips and manage resources.",
      );
    }

    const businessSection = document.getElementById("businessDiv");
    if (businessSection) {
      businessSection.setAttribute(
        "aria-description",
        "Business management. Control pricing, marketing, and automation.",
      );
    }

    const computeSection = document.getElementById("computeDiv");
    if (computeSection) {
      computeSection.setAttribute(
        "aria-description",
        "Computational resources. Manage processors, memory, and research.",
      );
    }
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {boolean} urgent - Whether to use assertive announcement
   */
  announce(message, urgent = false) {
    if (!message || message === this.lastAnnouncement) return;

    const announcer = urgent ? this.urgentAnnouncer : this.announcer;

    // Clear and set new message
    announcer.textContent = "";
    setTimeout(() => {
      announcer.textContent = message;
      this.lastAnnouncement = message;
    }, 100);

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = "";
    }, 1000);
  }

  /**
   * Announce game events
   * @param {string} event - Event type
   * @param {*} data - Event data
   */
  announceGameEvent(event, data) {
    switch (event) {
      case "milestone":
        this.announce(`Milestone reached: ${data.message}`, true);
        break;
      case "unlock":
        this.announce(`New feature unlocked: ${data.feature}`);
        break;
      case "achievement":
        this.announce(`Achievement earned: ${data.name}`, true);
        break;
      case "warning":
        this.announce(`Warning: ${data.message}`, true);
        break;
      case "purchase":
        this.announce(`Purchased: ${data.item}`);
        break;
      case "insufficient":
        this.announce(`Insufficient ${data.resource} for ${data.action}`);
        break;
    }
  }

  /**
   * Show keyboard shortcuts help
   */
  showKeyboardHelp() {
    const helpSection = document.getElementById("keyboardShortcuts");
    if (helpSection) {
      helpSection.scrollIntoView({ behavior: "smooth" });
      helpSection.focus();
      this.announce("Keyboard shortcuts help displayed");
    }
  }

  /**
   * Restore saved accessibility preferences
   */
  restorePreferences() {
    const saved = localStorage.getItem("highContrastEnabled");
    if (saved === "true") {
      this.enableHighContrast();
    }
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager();

// Restore preferences on load
accessibilityManager.restorePreferences();
