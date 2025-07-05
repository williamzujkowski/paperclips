// Mobile Enhancements for Universal Paperclips

(function() {
    'use strict';
    
    // Touch-friendly slider improvements
    function enhanceSliders() {
        const sliders = document.querySelectorAll('input[type="range"]');
        
        sliders.forEach(slider => {
            // Prevent page scroll when touching sliders
            slider.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
            
            // Update value display on input
            slider.addEventListener('input', (e) => {
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay && valueDisplay.tagName === 'SPAN') {
                    valueDisplay.textContent = e.target.value + '%';
                }
            });
        });
    }
    
    // Improve button feedback on touch devices
    function enhanceButtons() {
        const buttons = document.querySelectorAll('.button');
        
        buttons.forEach(button => {
            // Add visual feedback on touch
            button.addEventListener('touchstart', (e) => {
                button.classList.add('touch-active');
            }, { passive: true });
            
            button.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    button.classList.remove('touch-active');
                }, 100);
            }, { passive: true });
            
            // Prevent double-tap zoom on buttons
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (!button.disabled) {
                    button.click();
                }
            });
        });
    }
    
    // Add pull-to-refresh prevention
    function preventPullToRefresh() {
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
            
            // If at top of page and trying to scroll up, prevent default
            if (window.scrollY === 0 && touchEndY > touchStartY) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Optimize performance for mobile
    function optimizePerformance() {
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            
            scrollTimeout = window.requestAnimationFrame(() => {
                // Update any scroll-dependent UI here
                updateStickyElements();
            });
        }, { passive: true });
    }
    
    // Update sticky elements based on scroll
    function updateStickyElements() {
        const mobileHeader = document.querySelector('.mobile-header');
        if (mobileHeader) {
            if (window.scrollY > 50) {
                mobileHeader.classList.add('scrolled');
            } else {
                mobileHeader.classList.remove('scrolled');
            }
        }
    }
    
    // Initialize mobile viewport height fix
    function setViewportHeight() {
        // Fix for mobile browsers with dynamic viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Handle orientation changes
    function handleOrientationChange() {
        // Close mobile menu on orientation change
        const hamburger = document.getElementById('hamburgerMenu');
        const mobileNav = document.getElementById('mobileNav');
        
        if (hamburger && mobileNav) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        }
        
        // Recalculate viewport height
        setViewportHeight();
    }
    
    // Initialize all enhancements
    function init() {
        // Check if on mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile || window.innerWidth <= 768) {
            enhanceSliders();
            enhanceButtons();
            preventPullToRefresh();
            optimizePerformance();
            setViewportHeight();
            
            // Event listeners
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', handleOrientationChange);
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();