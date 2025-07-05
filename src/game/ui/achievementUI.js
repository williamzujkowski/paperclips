/**
 * @fileoverview Achievement UI component for Universal Paperclips
 * Handles display and interaction with achievements
 */

import {
  achievementSystem,
  AchievementCategory,
  AchievementRarity
} from '../systems/achievements.js';
import { gameState } from '../core/gameState.js';
import { errorHandler } from '../core/errorHandler.js';
import { formatNumber } from '../../utils/formatting.js';

/**
 * Achievement UI class
 */
export class AchievementUI {
  constructor() {
    this.isVisible = false;
    this.currentFilter = 'all';
    this.currentSort = 'unlock';
    this.notificationContainer = null;
    this.achievementPanel = null;
    this.achievementList = null;

    this.bindEvents();
    this.createNotificationContainer();
  }

  /**
   * Initialize the achievement UI
   */
  initialize() {
    errorHandler.info('Initializing achievement UI');
    this.createAchievementPanel();
    this.bindAchievementEvents();
  }

  /**
   * Bind UI events
   */
  bindEvents() {
    // Listen for achievement unlocked events
    window.addEventListener('achievementUnlocked', (event) => {
      this.showNotification(event.detail);
    });

    // Listen for escape key to close panel
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible) {
        this.hidePanel();
      }
    });
  }

  /**
   * Create notification container
   */
  createNotificationContainer() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'achievementNotifications';
    this.notificationContainer.className = 'achievement-notifications';
    this.notificationContainer.innerHTML = `
      <style>
        .achievement-notifications {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          pointer-events: none;
        }
        
        .achievement-notification {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          padding: 16px 20px;
          margin-bottom: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          min-width: 300px;
          max-width: 400px;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.5s ease;
          pointer-events: auto;
          cursor: pointer;
        }
        
        .achievement-notification.show {
          opacity: 1;
          transform: translateX(0);
        }
        
        .achievement-notification.hide {
          opacity: 0;
          transform: translateX(100%);
        }
        
        .achievement-notification .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .achievement-notification .icon {
          font-size: 24px;
        }
        
        .achievement-notification .title {
          font-weight: bold;
          font-size: 16px;
        }
        
        .achievement-notification .rarity {
          font-size: 12px;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .achievement-notification .description {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .achievement-notification.rarity-common {
          background: linear-gradient(135deg, #9E9E9E, #757575);
        }
        
        .achievement-notification.rarity-uncommon {
          background: linear-gradient(135deg, #4CAF50, #388E3C);
        }
        
        .achievement-notification.rarity-rare {
          background: linear-gradient(135deg, #2196F3, #1976D2);
        }
        
        .achievement-notification.rarity-epic {
          background: linear-gradient(135deg, #9C27B0, #7B1FA2);
        }
        
        .achievement-notification.rarity-legendary {
          background: linear-gradient(135deg, #FF9800, #F57C00);
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          from { box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3); }
          to { box-shadow: 0 4px 20px rgba(255, 152, 0, 0.6); }
        }
      </style>
    `;

    document.body.appendChild(this.notificationContainer);
  }

  /**
   * Create achievement panel
   */
  createAchievementPanel() {
    this.achievementPanel = document.createElement('div');
    this.achievementPanel.id = 'achievementPanel';
    this.achievementPanel.className = 'achievement-panel';
    this.achievementPanel.style.display = 'none';

    this.achievementPanel.innerHTML = `
      <style>
        .achievement-panel {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .achievement-modal {
          background: #f0f0f0;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90%;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .achievement-header {
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .achievement-header h2 {
          margin: 0;
          font-size: 24px;
        }
        
        .achievement-stats {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .achievement-controls {
          padding: 16px 20px;
          background: #e8e8e8;
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .achievement-controls select,
        .achievement-controls button {
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }
        
        .achievement-controls button:hover {
          background: #f5f5f5;
        }
        
        .achievement-content {
          height: 500px;
          overflow-y: auto;
          padding: 20px;
        }
        
        .achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        
        .achievement-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          border: 2px solid #e0e0e0;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .achievement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .achievement-card.unlocked {
          border-color: #4CAF50;
          background: linear-gradient(135deg, #f8fff8, #ffffff);
        }
        
        .achievement-card.locked {
          opacity: 0.6;
        }
        
        .achievement-card.hidden {
          background: #f5f5f5;
          border-color: #bbb;
        }
        
        .achievement-card .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .achievement-card .icon {
          font-size: 32px;
          filter: grayscale(100%);
        }
        
        .achievement-card.unlocked .icon {
          filter: none;
        }
        
        .achievement-card .info {
          flex: 1;
        }
        
        .achievement-card .name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .achievement-card .rarity {
          font-size: 12px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          display: inline-block;
        }
        
        .rarity-common { background: #9E9E9E; }
        .rarity-uncommon { background: #4CAF50; }
        .rarity-rare { background: #2196F3; }
        .rarity-epic { background: #9C27B0; }
        .rarity-legendary { background: #FF9800; }
        
        .achievement-card .description {
          margin: 12px 0;
          color: #666;
        }
        
        .achievement-card .progress {
          margin-top: 12px;
        }
        
        .achievement-card .progress-bar {
          background: #e0e0e0;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin: 4px 0;
        }
        
        .achievement-card .progress-fill {
          background: linear-gradient(90deg, #4CAF50, #45a049);
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .achievement-card .progress-text {
          font-size: 12px;
          color: #666;
        }
        
        .achievement-card .unlock-date {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 10px;
          color: #888;
        }
        
        .category-separator {
          grid-column: 1 / -1;
          margin: 20px 0 10px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        .no-achievements {
          grid-column: 1 / -1;
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }
      </style>
      
      <div class="achievement-modal">
        <div class="achievement-header">
          <div>
            <h2>Achievements</h2>
            <div class="achievement-stats" id="achievementStats"></div>
          </div>
          <button class="close-btn" onclick="window.achievementUI.hidePanel()">&times;</button>
        </div>
        
        <div class="achievement-controls">
          <label>
            Filter:
            <select id="achievementFilter">
              <option value="all">All</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
              <option value="production">Production</option>
              <option value="economic">Economic</option>
              <option value="efficiency">Efficiency</option>
              <option value="speed">Speed</option>
              <option value="discovery">Discovery</option>
              <option value="combat">Combat</option>
              <option value="special">Special</option>
            </select>
          </label>
          
          <label>
            Sort by:
            <select id="achievementSort">
              <option value="unlock">Unlock Status</option>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="category">Category</option>
              <option value="progress">Progress</option>
            </select>
          </label>
          
          <button onclick="window.achievementUI.exportAchievements()">Export</button>
          <button onclick="window.achievementUI.shareAchievements()">Share</button>
        </div>
        
        <div class="achievement-content">
          <div class="achievement-grid" id="achievementList"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.achievementPanel);
    this.achievementList = document.getElementById('achievementList');
  }

  /**
   * Bind achievement panel events
   */
  bindAchievementEvents() {
    const filterSelect = document.getElementById('achievementFilter');
    const sortSelect = document.getElementById('achievementSort');

    filterSelect.addEventListener('change', (e) => {
      this.currentFilter = e.target.value;
      this.updateAchievementList();
    });

    sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.updateAchievementList();
    });

    // Close panel when clicking background
    this.achievementPanel.addEventListener('click', (e) => {
      if (e.target === this.achievementPanel) {
        this.hidePanel();
      }
    });
  }

  /**
   * Show achievement notification
   * @param {Object} achievement - The achievement object
   */
  showNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = `achievement-notification rarity-${achievement.rarity}`;

    notification.innerHTML = `
      <div class="header">
        <div class="icon">${achievement.icon}</div>
        <div class="info">
          <div class="title">${achievement.name}</div>
          <div class="rarity">${achievement.rarity}</div>
        </div>
      </div>
      <div class="description">${achievement.description}</div>
    `;

    // Add click handler to open achievement panel
    notification.addEventListener('click', () => {
      this.showPanel();
      this.hideNotification(notification);
    });

    this.notificationContainer.appendChild(notification);

    // Show animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto-hide after 5 seconds
    setTimeout(() => this.hideNotification(notification), 5000);
  }

  /**
   * Hide achievement notification
   * @param {HTMLElement} notification - The notification element
   */
  hideNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }

  /**
   * Show achievement panel
   */
  showPanel() {
    this.isVisible = true;
    this.achievementPanel.style.display = 'flex';
    this.updateAchievementList();
    this.updateStats();

    // Add escape key listener
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  /**
   * Hide achievement panel
   */
  hidePanel() {
    this.isVisible = false;
    this.achievementPanel.style.display = 'none';

    // Remove escape key listener
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  /**
   * Handle escape key
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      this.hidePanel();
    }
  };

  /**
   * Update achievement statistics
   */
  updateStats() {
    const stats = achievementSystem.getStatistics();
    const statsElement = document.getElementById('achievementStats');

    if (statsElement) {
      statsElement.innerHTML = `
        ${stats.totalUnlocked}/${stats.total} (${stats.percentage.toFixed(1)}%) •
        🥇 ${stats.legendaryUnlocked} •
        ⭐ ${stats.epicUnlocked} •
        💎 ${stats.rareUnlocked}
      `;
    }
  }

  /**
   * Update achievement list
   */
  updateAchievementList() {
    if (!this.achievementList) return;

    const achievements = this.getFilteredAndSortedAchievements();
    const unlocked = gameState.get('achievements.unlocked') || {};

    this.achievementList.innerHTML = '';

    if (achievements.length === 0) {
      this.achievementList.innerHTML =
        '<div class="no-achievements">No achievements match your filters.</div>';
      return;
    }

    let currentCategory = null;

    achievements.forEach((achievement) => {
      // Add category separator if needed
      if (this.currentSort === 'category' && achievement.category !== currentCategory) {
        currentCategory = achievement.category;
        const separator = document.createElement('div');
        separator.className = 'category-separator';
        separator.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
        this.achievementList.appendChild(separator);
      }

      const card = this.createAchievementCard(achievement, unlocked[achievement.id]);
      this.achievementList.appendChild(card);
    });
  }

  /**
   * Create achievement card element
   * @param {Object} achievement - The achievement object
   * @param {number|null} unlockTime - Unlock timestamp or null if locked
   * @returns {HTMLElement} The achievement card element
   */
  createAchievementCard(achievement, unlockTime) {
    const card = document.createElement('div');
    const isUnlocked = !!unlockTime;
    const progress = achievementSystem.getProgress(achievement.id);
    const isHidden = achievement.hidden && !isUnlocked;

    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isHidden ? 'hidden' : ''}`;

    const unlockDate = unlockTime ? new Date(unlockTime).toLocaleDateString() : '';
    const name = isHidden ? '???' : achievement.name;
    const description = isHidden ? 'Hidden achievement' : achievement.description;
    const icon = isHidden ? '❓' : achievement.icon;

    card.innerHTML = `
      ${unlockTime ? `<div class="unlock-date">${unlockDate}</div>` : ''}
      <div class="header">
        <div class="icon">${icon}</div>
        <div class="info">
          <div class="name">${name}</div>
          <div class="rarity rarity-${achievement.rarity}">${achievement.rarity}</div>
        </div>
      </div>
      <div class="description">${description}</div>
      ${
        !isUnlocked && !isHidden
          ? `
        <div class="progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-text">${progress.toFixed(1)}% complete</div>
        </div>
      `
          : ''
      }
    `;

    return card;
  }

  /**
   * Get filtered and sorted achievements
   * @returns {Array} Array of achievement objects
   */
  getFilteredAndSortedAchievements() {
    let achievements = Object.values(achievementSystem.achievements);
    const unlocked = gameState.get('achievements.unlocked') || {};

    // Apply filter
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'unlocked') {
        achievements = achievements.filter((a) => unlocked[a.id]);
      } else if (this.currentFilter === 'locked') {
        achievements = achievements.filter((a) => !unlocked[a.id]);
      } else if (Object.values(AchievementCategory).includes(this.currentFilter)) {
        achievements = achievements.filter((a) => a.category === this.currentFilter);
      }
    }

    // Apply sort
    achievements.sort((a, b) => {
      switch (this.currentSort) {
        case 'name':
          return a.name.localeCompare(b.name);

        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
          const aIndex = rarityOrder.indexOf(a.rarity);
          const bIndex = rarityOrder.indexOf(b.rarity);
          return bIndex - aIndex; // Reverse order (legendary first)

        case 'category':
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare !== 0) return categoryCompare;
          return a.name.localeCompare(b.name);

        case 'progress':
          const aProgress = achievementSystem.getProgress(a.id);
          const bProgress = achievementSystem.getProgress(b.id);
          return bProgress - aProgress;

        case 'unlock':
        default:
          const aUnlocked = !!unlocked[a.id];
          const bUnlocked = !!unlocked[b.id];
          if (aUnlocked !== bUnlocked) {
            return bUnlocked - aUnlocked; // Unlocked first
          }
          return a.name.localeCompare(b.name);
      }
    });

    return achievements;
  }

  /**
   * Export achievements data
   */
  exportAchievements() {
    try {
      const data = achievementSystem.exportAchievements();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `paperclips-achievements-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      this.showMessage('Achievements exported successfully!');
    } catch (error) {
      errorHandler.log('error', 'Error exporting achievements', error);
      this.showMessage('Error exporting achievements', 'error');
    }
  }

  /**
   * Share achievements
   */
  shareAchievements() {
    try {
      const shareText = achievementSystem.getShareableString();

      if (navigator.share) {
        navigator.share({
          title: 'Universal Paperclips Achievements',
          text: shareText,
          url: window.location.href
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          this.showMessage('Achievement summary copied to clipboard!');
        });
      } else {
        // Fallback: show text in a dialog
        prompt('Copy your achievement summary:', shareText);
      }
    } catch (error) {
      errorHandler.log('error', 'Error sharing achievements', error);
      this.showMessage('Error sharing achievements', 'error');
    }
  }

  /**
   * Show temporary message
   * @param {string} message - The message to show
   * @param {string} type - Message type ('success' or 'error')
   */
  showMessage(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `achievement-notification rarity-${type === 'success' ? 'uncommon' : 'rare'}`;
    notification.innerHTML = `
      <div class="header">
        <div class="icon">${type === 'success' ? '✅' : '❌'}</div>
        <div class="title">${message}</div>
      </div>
    `;

    this.notificationContainer.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => this.hideNotification(notification), 3000);
  }

  /**
   * Update achievement progress display
   */
  updateProgress() {
    if (!this.isVisible) return;

    const cards = this.achievementList.querySelectorAll('.achievement-card.locked');
    cards.forEach((card) => {
      const achievementId = card.dataset.achievementId;
      if (achievementId) {
        const progress = achievementSystem.getProgress(achievementId);
        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');

        if (progressFill) {
          progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
          progressText.textContent = `${progress.toFixed(1)}% complete`;
        }
      }
    });
  }
}

// Create and expose global instance
export const achievementUI = new AchievementUI();
window.achievementUI = achievementUI;
