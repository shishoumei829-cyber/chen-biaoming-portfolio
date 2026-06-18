'use strict';

const fs = require('fs');
const path = require('path');

const SKILL_FILE = 'SKILL.md';
const DEFAULT_MAX_SKILLS = 2;
const DEFAULT_MAX_CHARS = 1400;

let _cache = { skills: [], loadedAt: 0, dirs: [] };
const CACHE_MS = 30_000;

function parseFrontmatter(raw) {
  const text = String(raw || '');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: text.trim() };
  const meta = {};
  let currentKey = null;
  let listBuf = [];
  const flushList = () => {
    if (currentKey && listBuf.length) meta[currentKey] = listBuf.slice();
    listBuf = [];
  };
  for (const line of m[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && currentKey) {
      listBuf.push(listItem[1].trim());
      continue;
    }
    flushList();
    const kv = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    currentKey = kv[1].trim();
    const val = kv[2].trim().replace(/^["']|["']$/g, '');
    if (!val) {
      listBuf = [];
      continue;
    }
    if (val.includes(',')) {
      meta[currentKey] = val.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      meta[currentKey] = val;
      currentKey = null;
    }
  }
  flushList();
  return { meta, body: m[2].trim() };
}

function resolveSkillDirs(projectRoot) {
  const root = projectRoot || path.join(__dirname, '..');
  const extra = String(process.env.AMADEUS_SKILLS_DIRS || '')
    .split(path.delimiter)
    .map((s) => s.trim())
    .filter(Boolean);
  const dirs = [
    path.join(root, 'skills'),
    path.join(root, '.cursor', 'skills'),
    ...extra,
  ];
  const home = process.env.USERPROFILE || process.env.HOME || '';
  if (String(process.env.AMADEUS_SKILLS_USER || '1').trim() !== '0' && home) {
    dirs.push(path.join(home, '.cursor', 'skills'));
  }
  return [...new Set(dirs)];
}

function loadSkillFromDir(dirPath) {
  const skillPath = path.join(dirPath, SKILL_FILE);
  if (!fs.existsSync(skillPath)) return null;
  try {
    const raw = fs.readFileSync(skillPath, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const name = String(meta.name || path.basename(dirPath)).trim();
    const description = String(meta.description || '').trim();
    const disableAuto = String(meta['disable-model-invocation'] || meta.disable_auto || '')
      .toLowerCase() === 'true';
    let triggers = meta.triggers;
    if (typeof triggers === 'string') triggers = [triggers];
    if (!Array.isArray(triggers)) triggers = [];
    triggers = triggers.map((t) => String(t).trim()).filter(Boolean);
    const modes = String(meta.modes || meta.mode || 'work,chat')
      .split(/[,，\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return {
      id: name,
      name,
      description,
      disableAuto,
      triggers,
      modes,
      body,
      dir: dirPath,
      path: skillPath,
    };
  } catch (e) {
    console.warn(`[skills] 跳过 ${dirPath}: ${e.message}`);
    return null;
  }
}

function loadAllSkills(projectRoot) {
  const dirs = resolveSkillDirs(projectRoot);
  const skills = [];
  const seen = new Set();
  for (const base of dirs) {
    if (!fs.existsSync(base)) continue;
    let entries = [];
    try {
      entries = fs.readdirSync(base, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const skill = loadSkillFromDir(path.join(base, ent.name));
      if (!skill || seen.has(skill.id)) continue;
      seen.add(skill.id);
      skills.push(skill);
    }
    const rootSkill = loadSkillFromDir(base);
    if (rootSkill && !seen.has(rootSkill.id)) {
      seen.add(rootSkill.id);
      skills.push(rootSkill);
    }
  }
  return { skills, dirs };
}

function getRegistry(projectRoot, force = false) {
  if (!force && Date.now() - _cache.loadedAt < CACHE_MS && _cache.skills.length) {
    return _cache;
  }
  const { skills, dirs } = loadAllSkills(projectRoot);
  _cache = { skills, dirs, loadedAt: Date.now() };
  if (skills.length) {
    console.log(`[skills] 已加载 ${skills.length} 个: ${skills.map((s) => s.id).join(', ')}`);
  }
  return _cache;
}

function isSkillsEnabled() {
  return String(process.env.AMADEUS_SKILLS || '1').trim() !== '0';
}

function _explicitSkillIds(userText) {
  const t = String(userText || '');
  const ids = [];
  const re = /[@＠](?:skill|技能|能力)[:：]([\w-]+)/gi;
  let m;
  while ((m = re.exec(t)) !== null) ids.push(m[1].toLowerCase());
  return ids;
}

function _scoreSkill(skill, userText, brainMode) {
  const t = String(userText || '');
  let score = 0;
  const mode = String(brainMode || 'chat').toLowerCase();
  const allowed = skill.modes.length ? skill.modes : ['work', 'chat'];
  if (!allowed.includes(mode) && !allowed.includes('all')) return 0;

  for (const id of _explicitSkillIds(t)) {
    if (id === skill.id.toLowerCase()) score += 100;
  }

  for (const trig of skill.triggers) {
    try {
      if (new RegExp(trig, 'i').test(t)) score += 40;
    } catch {
      if (t.includes(trig)) score += 25;
    }
  }

  if (!skill.disableAuto && skill.description) {
    const descWords = skill.description.match(/[\u4e00-\u9fff]{2,}|[a-z]{3,}/gi) || [];
    for (const w of descWords.slice(0, 24)) {
      if (w.length >= 2 && t.toLowerCase().includes(w.toLowerCase())) score += 3;
    }
  }

  return score;
}

/**
 * @param {string} userText
 * @param {{ brainMode?: string, projectRoot?: string, maxSkills?: number }} [opts]
 */
function matchSkills(userText, opts = {}) {
  if (!isSkillsEnabled()) return [];
  const { skills } = getRegistry(opts.projectRoot);
  if (!skills.length) return [];

  const maxSkills = Number(opts.maxSkills) || Number(process.env.AMADEUS_SKILLS_MAX) || DEFAULT_MAX_SKILLS;
  const brainMode = opts.brainMode || 'chat';

  const ranked = skills
    .map((s) => ({ skill: s, score: _scoreSkill(s, userText, brainMode) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, maxSkills));

  return ranked.map((x) => x.skill);
}

function clipSkillBody(body, maxChars) {
  const max = Number(maxChars) || DEFAULT_MAX_CHARS;
  const t = String(body || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 20)}\n…（技能正文已截断）`;
}

function buildSkillsPromptBlock(matched, opts = {}) {
  if (!matched || !matched.length) return '';
  const maxChars = Number(opts.maxChars) || Number(process.env.AMADEUS_SKILLS_CHARS) || DEFAULT_MAX_CHARS;
  const perSkill = Math.floor(maxChars / matched.length);
  const parts = [
    '【已启用技能 · 按下列步骤执行；勿向用户复述技能文件名】',
  ];
  for (const s of matched) {
    parts.push(`--- 技能: ${s.name} ---`);
    if (s.description) parts.push(`用途: ${s.description}`);
    parts.push(clipSkillBody(s.body, perSkill));
  }
  return parts.join('\n');
}

function listSkillsMeta(projectRoot) {
  const { skills, dirs } = getRegistry(projectRoot, true);
  return {
    enabled: isSkillsEnabled(),
    count: skills.length,
    scanDirs: dirs,
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      disableAuto: s.disableAuto,
      triggers: s.triggers,
      modes: s.modes,
      path: s.path,
    })),
  };
}

module.exports = {
  parseFrontmatter,
  resolveSkillDirs,
  loadAllSkills,
  getRegistry,
  isSkillsEnabled,
  matchSkills,
  buildSkillsPromptBlock,
  listSkillsMeta,
};
