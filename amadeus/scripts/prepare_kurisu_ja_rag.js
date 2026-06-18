/**
 * 将 data/kurisu_dialogue_ja_compiled.txt 按章节拆入 brain_data/kurisu_ja/，
 * 供 ingest.js 建 RAG 索引（日语口吻检索）。
 *
 * 用法：node scripts/prepare_kurisu_ja_rag.js
 * 索引：npm run ingest  或  npm run ingest:kurisu
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data', 'kurisu_dialogue_ja_compiled.txt');
const OUT_DIR = path.join(ROOT, 'brain_data', 'kurisu_ja');

function slug(s) {
  return String(s || '')
    .replace(/[^\w\u4e00-\u9fff]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'misc';
}

function sectionKeyFromTitle(title) {
  const t = String(title || '');
  if (/命运石之门\s*0|Amadeus/i.test(t)) return 'sg0_tv';
  if (/命运石之门\s*TV/i.test(t)) return 'sg_tv';
  if (/第22話.*長篇|koryamata/i.test(t)) return 'sg_long22';
  if (/其他名言|reviewne|萌娘/i.test(t)) return 'quotes_other';
  if (/対話示例|互動|摘錄/i.test(t)) return 'dialogue_pairs';
  if (/名言站|phoenix/i.test(t)) return 'quotes_extra';
  if (/口癖|短句/i.test(t)) return 'catchphrases';
  if (/分析用|长独白|独白块/i.test(t)) return 'monologue_blocks';
  return `misc_${slug(t)}`;
}

function epFileSuffix(epLabel) {
  const m = String(epLabel || '').match(/第\s*(\d+)\s*話/);
  return m ? `ep${m[1].padStart(2, '0')}` : slug(epLabel);
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('[prepare_kurisu_ja_rag] 源文件不存在:', SRC);
    process.exit(1);
  }

  const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);
  let sectionKey = 'kurisu';
  let sectionLabel = '台詞匯總';
  let epLabel = '';
  let buffer = [];
  const pending = [];
  const usedNames = new Map();

  function uniqueName(base) {
    const n = usedNames.get(base) || 0;
    usedNames.set(base, n + 1);
    return n === 0 ? base : `${base}_${n + 1}`;
  }

  function flush() {
    const body = buffer.map((l) => l.trim()).filter(Boolean).join('\n').trim();
    buffer = [];
    if (!body) return;

    const header = `[${sectionLabel}${epLabel ? ` · ${epLabel}` : ''} · 牧瀬紅莉栖台詞]`;
    const suffix = epLabel ? epFileSuffix(epLabel) : `block_${String(pending.length + 1).padStart(2, '0')}`;
    const fname = uniqueName(`${sectionKey}_${suffix}.txt`);
    pending.push({
      name: fname,
      content: `${header}\n${body}\n`,
    });
  }

  for (const raw of lines) {
    const line = raw.replace(/\uFEFF/g, '');
    if (!line.trim()) continue;
    if (line.startsWith('#')) continue;
    if (/^=+$/.test(line.trim())) continue;

    const sec = line.match(/^【(.+?)】/);
    if (sec && !/^【块[A-D｜|]/.test(line)) {
      flush();
      sectionLabel = line.trim();
      sectionKey = sectionKeyFromTitle(sec[1]);
      epLabel = '';
      continue;
    }

    const ep = line.match(/^---\s*(第\s*\d+\s*話)\s*---\s*$/);
    if (ep) {
      flush();
      epLabel = ep[1].replace(/\s+/g, '');
      continue;
    }

    buffer.push(line);
  }
  flush();

  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (f.endsWith('.txt')) fs.unlinkSync(path.join(OUT_DIR, f));
    }
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, '_README.txt'),
    [
      '本目录由 scripts/prepare_kurisu_ja_rag.js 从 data/kurisu_dialogue_ja_compiled.txt 生成。',
      '仅供 RAG 检索日语口吻参考，勿当逐字台词表朗读。',
      '更新语料后请运行：npm run ingest:kurisu',
      '',
    ].join('\n'),
    'utf8',
  );

  let lineCount = 0;
  for (const { name, content } of pending) {
    fs.writeFileSync(path.join(OUT_DIR, name), content, 'utf8');
    lineCount += content.split('\n').filter(Boolean).length - 1;
  }

  console.log(`[prepare_kurisu_ja_rag] 写入 ${pending.length} 个文件 → ${OUT_DIR}`);
  console.log(`[prepare_kurisu_ja_rag] 约 ${lineCount} 行台詞（含标题行）`);
}

main();
