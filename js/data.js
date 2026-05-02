// Data management and Bible utilities
class ScriptureData {
  constructor() {
    this.verses = [];
    this.groups = [];
    this.bookMapping = this.initializeBookMapping();
  }

  initializeBookMapping() {
    return {
      '创': { name: '创世记', order: 1, testament: 'old' },
      '出': { name: '出埃及记', order: 2, testament: 'old' },
      '利': { name: '利未记', order: 3, testament: 'old' },
      '民': { name: '民数记', order: 4, testament: 'old' },
      '申': { name: '申命记', order: 5, testament: 'old' },
      '书': { name: '约书亚记', order: 6, testament: 'old' },
      '士': { name: '士师记', order: 7, testament: 'old' },
      '得': { name: '路得记', order: 8, testament: 'old' },
      '撒上': { name: '撒母耳记上', order: 9, testament: 'old' },
      '撒下': { name: '撒母耳记下', order: 10, testament: 'old' },
      '王上': { name: '列王纪上', order: 11, testament: 'old' },
      '王下': { name: '列王纪下', order: 12, testament: 'old' },
      '代上': { name: '历代志上', order: 13, testament: 'old' },
      '代下': { name: '历代志下', order: 14, testament: 'old' },
      '拉': { name: '以斯拉记', order: 15, testament: 'old' },
      '尼': { name: '尼希米记', order: 16, testament: 'old' },
      '斯': { name: '以斯帖记', order: 17, testament: 'old' },
      '伯': { name: '约伯记', order: 18, testament: 'old' },
      '诗': { name: '诗篇', order: 19, testament: 'old' },
      '箴': { name: '箴言', order: 20, testament: 'old' },
      '传': { name: '传道书', order: 21, testament: 'old' },
      '歌': { name: '雅歌', order: 22, testament: 'old' },
      '赛': { name: '以赛亚书', order: 23, testament: 'old' },
      '耶': { name: '耶利米书', order: 24, testament: 'old' },
      '哀': { name: '耶利米哀歌', order: 25, testament: 'old' },
      '结': { name: '以西结书', order: 26, testament: 'old' },
      '但': { name: '但以理书', order: 27, testament: 'old' },
      '何': { name: '何西阿书', order: 28, testament: 'old' },
      '珥': { name: '约珥书', order: 29, testament: 'old' },
      '摩': { name: '阿摩司书', order: 30, testament: 'old' },
      '俄': { name: '俄巴底亚书', order: 31, testament: 'old' },
      '拿': { name: '约拿书', order: 32, testament: 'old' },
      '弥': { name: '弥迦书', order: 33, testament: 'old' },
      '鸿': { name: '那鸿书', order: 34, testament: 'old' },
      '哈': { name: '哈巴谷书', order: 35, testament: 'old' },
      '番': { name: '西番雅书', order: 36, testament: 'old' },
      '该': { name: '哈该书', order: 37, testament: 'old' },
      '亚': { name: '撒迦利亚书', order: 38, testament: 'old' },
      '玛': { name: '玛拉基书', order: 39, testament: 'old' },
      '太': { name: '马太福音', order: 40, testament: 'new' },
      '可': { name: '马可福音', order: 41, testament: 'new' },
      '路': { name: '路加福音', order: 42, testament: 'new' },
      '约': { name: '约翰福音', order: 43, testament: 'new' },
      '徒': { name: '使徒行传', order: 44, testament: 'new' },
      '罗': { name: '罗马书', order: 45, testament: 'new' },
      '林前': { name: '哥林多前书', order: 46, testament: 'new' },
      '林后': { name: '哥林多后书', order: 47, testament: 'new' },
      '加': { name: '加拉太书', order: 48, testament: 'new' },
      '弗': { name: '以弗所书', order: 49, testament: 'new' },
      '腓': { name: '腓立比书', order: 50, testament: 'new' },
      '西': { name: '歌罗西书', order: 51, testament: 'new' },
      '帖前': { name: '帖撒罗尼迦前书', order: 52, testament: 'new' },
      '帖后': { name: '帖撒罗尼迦后书', order: 53, testament: 'new' },
      '提前': { name: '提摩太前书', order: 54, testament: 'new' },
      '提后': { name: '提摩太后书', order: 55, testament: 'new' },
      '多': { name: '提多书', order: 56, testament: 'new' },
      '门': { name: '腓利门书', order: 57, testament: 'new' },
      '来': { name: '希伯来书', order: 58, testament: 'new' },
      '雅': { name: '雅各书', order: 59, testament: 'new' },
      '彼前': { name: '彼得前书', order: 60, testament: 'new' },
      '彼后': { name: '彼得后书', order: 61, testament: 'new' },
      '约一': { name: '约翰一书', order: 62, testament: 'new' },
      '约二': { name: '约翰二书', order: 63, testament: 'new' },
      '约三': { name: '约翰三书', order: 64, testament: 'new' },
      '犹': { name: '犹大书', order: 65, testament: 'new' },
      '启': { name: '启示录', order: 66, testament: 'new' }
    };
  }

  // Parse scripture reference like "太6:9-13"
  parseReference(reference) {
    if (!reference) return null;
    
    const match = reference.match(/^(.+?)(\d+):(.+)$/);
    if (!match) return null;
    
    const book = match[1].trim();
    const chapter = parseInt(match[2]);
    const versePart = match[3].trim();
    
    return {
      book,
      chapter,
      verses: versePart,
      bookInfo: this.bookMapping[book] || { name: book, order: 999, testament: 'unknown' }
    };
  }

  // Scan verses directory for JSON files
  async scanVerseFiles() {
    const res = await fetch("./verses/");
    if (!res.ok) throw new Error("scan folder fail");
    
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a"));
    
    const files = links
      .map(a => decodeURIComponent(a.getAttribute("href") || "").trim())
      .filter(href => href.toLowerCase().endsWith(".json"))
      .filter(href => !href.includes("/"))
      .sort();

    if (!files.length) throw new Error("no json file in verses folder");
    return files.map(file => `verses/${file}`);
  }

  // Load verses from a specific file
  async loadVersesFromFile(file) {
    const res = await fetch(`./${file}`);
    if (!res.ok) throw new Error(`load fail: ${file}`);
    
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`empty verses: ${file}`);
    }
    
    const normalized = data
      .map(item => {
        const reference = item.reference || item["出处"] || "";
        const text = item.text || item["内容"] || "";
        return {
          reference: String(reference).trim(),
          text: String(text).trim(),
          sourceFile: file,
          // Include any additional fields from the original data
          ...Object.fromEntries(
            Object.entries(item).filter(([key]) => 
              !['reference', 'text', '出处', '内容'].includes(key)
            )
          )
        };
      })
      .filter(item => item.reference && item.text);

    if (normalized.length === 0) {
      throw new Error(`invalid verse format: ${file}`);
    }
    
    return normalized;
  }

  // Load all verses
  async loadAllVerses(files) {
    const all = [];
    for (const file of files) {
      const items = await this.loadVersesFromFile(file);
      all.push(...items);
    }
    
    if (all.length === 0) throw new Error("no verses loaded");
    
    // Parse and enhance verses
    this.verses = all.map(verse => {
      const parsed = this.parseReference(verse.reference);
      return {
        ...verse,
        parsed
      };
    });
    
    return this.verses;
  }

  // Load groups configuration
  async loadGroups() {
    try {
      const res = await fetch("./groups.json");
      if (res.ok) {
        this.groups = await res.json();
      }
    } catch (e) {
      console.warn("Could not load groups.json:", e);
      this.groups = [];
    }
    return this.groups;
  }

  // Initialize data loading
  async initialize() {
    let verseFiles = [];
    
    // Try to scan verses directory first, fallback to groups.json
    try {
      verseFiles = await this.scanVerseFiles();
    } catch {
      const groups = await this.loadGroups();
      verseFiles = Array.isArray(groups) 
        ? groups.map(group => group?.file || "").filter(Boolean)
        : [];
    }

    if (!Array.isArray(verseFiles) || verseFiles.length === 0) {
      throw new Error("empty verse files");
    }

    await this.loadAllVerses(verseFiles);
    await this.loadGroups();
    
    return {
      verses: this.verses,
      groups: this.groups
    };
  }
}

// Export for use in other modules
window.ScriptureData = ScriptureData;