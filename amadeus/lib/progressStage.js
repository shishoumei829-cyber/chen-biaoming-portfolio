'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'progress_stage.json');

let cachedConfig = null;

function loadConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    cachedConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    cachedConfig = { default_stage: 'lab_early', stages: {} };
  }
  return cachedConfig;
}

function getStatePath(dataDir) {
  return dataDir ? path.join(dataDir, 'progress_stage_state.json') : null;
}

function readPersistedStage(dataDir) {
  const p = getStatePath(dataDir);
  if (!p || !fs.existsSync(p)) return '';
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    return String(raw.stage_id || raw.id || '').trim();
  } catch {
    return '';
  }
}

function writePersistedStage(dataDir, stageId) {
  const p = getStatePath(dataDir);
  if (!p) return false;
  const cfg = loadConfig();
  if (!cfg.stages || !cfg.stages[stageId]) return false;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    p,
    JSON.stringify({ stage_id: stageId, updated_at: Date.now() }, null, 2),
    'utf8',
  );
  return true;
}

function isStoryStageEnabled() {
  const v = String(process.env.AMADEUS_STORY_STAGE ?? '1').trim().toLowerCase();
  return v !== '0' && v !== 'false' && v !== 'off';
}

function resolveStageId(override, dataDir) {
  if (!isStoryStageEnabled()) return 'full';
  const id = String(
    override || readPersistedStage(dataDir) || process.env.AMADEUS_PROGRESS_STAGE || '',
  ).trim();
  const cfg = loadConfig();
  if (id && cfg.stages && cfg.stages[id]) return id;
  const def = cfg.default_stage || 'lab_early';
  return cfg.stages && cfg.stages[def] ? def : 'lab_early';
}

function getStage(stageId, dataDir) {
  const cfg = loadConfig();
  const id = resolveStageId(stageId, dataDir);
  const stage = (cfg.stages && cfg.stages[id]) || cfg.stages.lab_early || {};
  return { id, ...stage };
}

/**
 * 用阶段记忆包替代完整 soul（full 阶段除外）
 */
function applyProgressToSoul(fullSoul, stageId, dataDir) {
  const stage = getStage(stageId, dataDir);
  if (stage.use_full_soul) {
    return { soul: String(fullSoul || '').trim(), stage };
  }
  const brief = String(stage.memory_brief || '').trim();
  return {
    soul: brief || String(fullSoul || '').slice(0, 1200),
    stage,
  };
}

function buildStagePromptBlock(stageId, dataDir) {
  if (!isStoryStageEnabled()) return '';
  const stage = getStage(stageId, dataDir);
  if (stage.use_full_soul) {
    const ceiling = stage.knowledge_ceiling;
    if (!ceiling) return '';
    return `【剧情认知】${stage.label}\n${ceiling}`;
  }

  const lines = [
    `【剧情认知 · ${stage.label || stage.id}】`,
    stage.description ? `时间位置：${stage.description}` : '',
    stage.knowledge_ceiling ? `上限：${stage.knowledge_ceiling}` : '',
  ];

  const forbidden = Array.isArray(stage.forbidden_spoilers)
    ? stage.forbidden_spoilers.filter(Boolean)
    : [];
  if (forbidden.length) {
    lines.push('禁止主动剧透或当作已亲身经历：');
    forbidden.slice(0, 8).forEach((f) => lines.push(`- ${f}`));
  }

  return lines.filter(Boolean).join('\n').trim();
}

function listStages() {
  const cfg = loadConfig();
  return Object.entries(cfg.stages || {}).map(([id, s]) => ({
    id,
    label: s.label || id,
    description: s.description || '',
    use_full_soul: !!s.use_full_soul,
  }));
}

module.exports = {
  loadConfig,
  isStoryStageEnabled,
  resolveStageId,
  getStage,
  applyProgressToSoul,
  buildStagePromptBlock,
  listStages,
  readPersistedStage,
  writePersistedStage,
};
