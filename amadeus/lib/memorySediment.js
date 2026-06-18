'use strict';

const fs = require('fs');
const path = require('path');

const SEEDS_PATH = path.join(__dirname, '..', 'config', 'kurisu_sediment_seeds.json');
const MAX_SEDIMENTS = 12;
const MAX_RULE_LEN = 72;

function isSedimentEnabled() {
  const v = String(process.env.AMADEUS_MEMORY_SEDIMENT ?? '0').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'on';
}

class MemorySedimentStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.sedimentsPath = path.join(dataDir, 'kurisu_sediments.json');
    this.countersPath = path.join(dataDir, 'sediment_counters.json');
    this.seeds = this._loadSeeds();
    this.state = this._loadJSON(this.sedimentsPath, { rules: [] });
    this.counters = this._loadJSON(this.countersPath, {});
  }

  _loadSeeds() {
    try {
      const raw = JSON.parse(fs.readFileSync(SEEDS_PATH, 'utf8'));
      return Array.isArray(raw.patterns) ? raw.patterns : [];
    } catch {
      return [];
    }
  }

  _loadJSON(filePath, fallback) {
    try {
      if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {}
    return fallback;
  }

  _save() {
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    fs.writeFileSync(this.sedimentsPath, JSON.stringify(this.state, null, 2), 'utf8');
    fs.writeFileSync(this.countersPath, JSON.stringify(this.counters, null, 2), 'utf8');
  }

  _hasRule(ruleText) {
    const n = String(ruleText || '').trim();
    return (this.state.rules || []).some((r) => r.rule === n);
  }

  _addRule(rule, meta = {}) {
    const text = String(rule || '').trim().slice(0, MAX_RULE_LEN);
    if (!text || this._hasRule(text)) return null;
    const rules = this.state.rules || [];
    if (rules.length >= MAX_SEDIMENTS) rules.shift();
    const item = {
      id: `sed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      rule: text,
      source: meta.source || 'seed',
      pattern_id: meta.pattern_id || null,
      hits: meta.hits || 1,
      created_at: Date.now(),
    };
    rules.push(item);
    this.state.rules = rules;
    this._save();
    return item;
  }

  /** 启动时把种子中尚未沉淀的规则写入（仅一次） */
  bootstrapFromSeeds() {
    let added = 0;
    for (const p of this.seeds) {
      if (p.rule && !this._hasRule(p.rule)) {
        this._addRule(p.rule, { source: 'seed_bootstrap', pattern_id: p.id, hits: p.min_hits || 1 });
        added++;
      }
    }
    return added;
  }

  _matchPatterns(userText) {
    const t = String(userText || '');
    const hit = [];
    for (const p of this.seeds) {
      if (!p.user_regex) continue;
      try {
        const re = new RegExp(p.user_regex, 'i');
        if (re.test(t)) hit.push(p);
      } catch {}
    }
    return hit;
  }

  /**
   * 每轮对话后：累加计数，达到阈值则沉淀为规则
   */
  observeTurn(userText, assistantText = '') {
    if (!isSedimentEnabled()) return { newSediments: [], patterns: [] };
    const patterns = this._matchPatterns(userText);
    const newSediments = [];

    for (const p of patterns) {
      const key = p.id || p.user_regex;
      this.counters[key] = (this.counters[key] || 0) + 1;
      const need = Math.max(1, Number(p.min_hits) || 2);
      if (this.counters[key] >= need && p.rule && !this._hasRule(p.rule)) {
        const item = this._addRule(p.rule, {
          source: 'pattern',
          pattern_id: p.id,
          hits: this.counters[key],
        });
        if (item) newSediments.push(item);
      }
    }

    this._save();
    return { newSediments, patterns: patterns.map((p) => p.id) };
  }

  getRules(limit = 6) {
    return (this.state.rules || []).slice(-limit);
  }

  buildPromptBlock(limit = 5) {
    if (!isSedimentEnabled()) return '';
    const rules = this.getRules(limit);
    if (!rules.length) return '';
    const lines = rules.map((r) => `- ${r.rule}`);
    return [
      '【已内化习惯 · 与你们对话沉淀，优先遵守】',
      ...lines,
      '（不要向用户解释「系统更新了规则」）',
    ].join('\n');
  }

  getStats() {
    return {
      rule_count: (this.state.rules || []).length,
      counter_keys: Object.keys(this.counters).length,
      seed_patterns: this.seeds.length,
    };
  }
}

module.exports = { MemorySedimentStore, isSedimentEnabled, MAX_SEDIMENTS, MAX_RULE_LEN };
