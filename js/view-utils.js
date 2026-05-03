// View mode utilities and components
class ViewUtils {
  static performSearch(verses, query) {
    const searchQuery = query.toLowerCase().trim();
    
    if (searchQuery === '') {
      return [...verses];
    } else {
      return verses.filter(verse => 
        verse.reference.toLowerCase().includes(searchQuery) ||
        verse.text.toLowerCase().includes(searchQuery)
      );
    }
  }

  static renderVerseCard(verse, isSelected = false) {
    return `
      <div class="verse-card">
        <div class="verse-header">
          <input type="checkbox" class="verse-checkbox" 
                 data-reference="${verse.reference}" 
                 ${isSelected ? 'checked' : ''}>
          <div class="verse-reference">${verse.reference}</div>
        </div>
        <div class="verse-text">${verse.text}</div>
      </div>
    `;
  }

  static renderAllView(verses, selectedVerses) {
    if (verses.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📖</div>
          <div>没有找到经文</div>
        </div>
      `;
    }

    return verses
      .map(verse => this.renderVerseCard(verse, selectedVerses.has(verse.reference)))
      .join('');
  }

  static escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  static renderGroupsView(verses, groups, selectedVerses) {
    if (groups.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <div>没有分组数据</div>
        </div>
      `;
    }

    return groups
      .map(group => {
        const groupVerses = verses.filter(verse => verse.sourceFile === group.file);
        const selCount = groupVerses.filter(v => selectedVerses.has(v.reference)).length;
        const allChecked = groupVerses.length > 0 && selCount === groupVerses.length;
        const indeterminate = selCount > 0 && selCount < groupVerses.length;

        return `
          <div class="group-section">
            <label class="group-header">
              <input type="checkbox" class="group-checkbox"
                     data-group-file="${this.escapeHtml(group.file)}"
                     ${allChecked ? 'checked' : ''}
                     ${indeterminate ? 'data-indeterminate' : ''}>
              ${this.escapeHtml(group.name)} (${groupVerses.length})
            </label>
            <div class="group-verses">
              ${groupVerses.map(verse =>
                this.renderVerseCard(verse, selectedVerses.has(verse.reference))
              ).join('')}
            </div>
          </div>
        `;
      })
      .join('');
  }

  static renderBooksView(verses, selectedVerses, bookMapping) {
    // Group verses by book
    const bookGroups = {};
    verses.forEach(verse => {
      if (verse.parsed) {
        const bookKey = verse.parsed.book;
        if (!bookGroups[bookKey]) {
          bookGroups[bookKey] = [];
        }
        bookGroups[bookKey].push(verse);
      }
    });

    // Sort books by biblical order
    const sortedBooks = Object.keys(bookGroups).sort((a, b) => {
      const orderA = bookMapping[a]?.order || 999;
      const orderB = bookMapping[b]?.order || 999;
      return orderA - orderB;
    });

    if (sortedBooks.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📜</div>
          <div>没有找到书卷</div>
        </div>
      `;
    }

    return sortedBooks
      .map(bookKey => {
        const verses = bookGroups[bookKey];
        const bookInfo = bookMapping[bookKey];
        const bookName = bookInfo?.name || bookKey;
        
        // Sort verses by chapter and verse
        const sortedVerses = verses.sort((a, b) => {
          if (a.parsed.chapter !== b.parsed.chapter) {
            return a.parsed.chapter - b.parsed.chapter;
          }
          return 0;
        });

        const selCount = sortedVerses.filter(v => selectedVerses.has(v.reference)).length;
        const allChecked = sortedVerses.length > 0 && selCount === sortedVerses.length;
        const indeterminate = selCount > 0 && selCount < sortedVerses.length;

        return `
          <div class="book-section">
            <label class="book-header">
              <input type="checkbox" class="book-checkbox"
                     data-book-key="${this.escapeHtml(bookKey)}"
                     ${allChecked ? 'checked' : ''}
                     ${indeterminate ? 'data-indeterminate' : ''}>
              ${this.escapeHtml(bookName)} (${verses.length})
            </label>
            ${sortedVerses.map(verse =>
              this.renderVerseCard(verse, selectedVerses.has(verse.reference))
            ).join('')}
          </div>
        `;
      })
      .join('');
  }

  static showError(message) {
    return `<div class="error">${message}</div>`;
  }

  static showLoading() {
    return `<div class="loading">加载中...</div>`;
  }
}

// Hamburger menu component
class HamburgerMenu {
  constructor(elements, callbacks) {
    this.elements = elements;
    this.callbacks = callbacks;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.elements.hamburger.addEventListener('click', () => this.open());
    this.elements.menuClose.addEventListener('click', () => this.close());
    this.elements.menuOverlay.addEventListener('click', () => this.close());

    this.elements.menuTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.callbacks.onTabSwitch) {
          this.callbacks.onTabSwitch(tab.dataset.view);
        }
      });
    });

    if (this.elements.menuSearchInput && this.callbacks.onSearch) {
      this.elements.menuSearchInput.addEventListener('input', (e) => {
        this.callbacks.onSearch(e.target.value);
      });
    }

    if (this.elements.menuSelectAll && this.callbacks.onSelectAll) {
      this.elements.menuSelectAll.addEventListener('click', this.callbacks.onSelectAll);
    }
  }

  open() {
    this.elements.menuOverlay.classList.add('active');
    this.elements.menuPanel.classList.add('active');
  }

  close() {
    this.elements.menuOverlay.classList.remove('active');
    this.elements.menuPanel.classList.remove('active');
  }

  updateActiveTab(view) {
    this.elements.menuTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });
  }

  updateSelectedCount(count) {
    if (this.elements.menuSelectedCount) {
      this.elements.menuSelectedCount.textContent = `已选择: ${count}`;
    }
  }
}

// Selection manager
class SelectionManager {
  constructor() {
    this.selectedVerses = new Set();
    this.callbacks = [];
  }

  onSelectionChange(callback) {
    this.callbacks.push(callback);
  }

  notifyChange() {
    this.callbacks.forEach(callback => callback(this.selectedVerses));
  }

  toggle(reference, isSelected) {
    if (isSelected) {
      this.selectedVerses.add(reference);
    } else {
      this.selectedVerses.delete(reference);
    }
    this.notifyChange();
  }

  selectAll(verses) {
    verses.forEach(verse => this.selectedVerses.add(verse.reference));
    this.notifyChange();
  }

  deselectAll() {
    this.selectedVerses.clear();
    this.notifyChange();
  }

  toggleAll(verses) {
    const allSelected = verses.every(verse => this.selectedVerses.has(verse.reference));
    if (allSelected) {
      verses.forEach(verse => this.selectedVerses.delete(verse.reference));
      this.notifyChange();
    } else {
      this.selectAll(verses);
    }
  }

  has(reference) {
    return this.selectedVerses.has(reference);
  }

  get size() {
    return this.selectedVerses.size;
  }
}

// Export for use in other modules
window.ViewUtils = ViewUtils;
window.HamburgerMenu = HamburgerMenu;
window.SelectionManager = SelectionManager;