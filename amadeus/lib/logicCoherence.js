'use strict';

/**
 * 对话逻辑连贯：被指出矛盾、口误、英文引号乱套等
 */

function userChallengesLogic(userText) {
  const t = String(userText || '').trim();
  if (!t) return false;
  return (
    /都.{0,16}(?:还|又|却|还要).{0,24}(?:为什么|怎么|凭|难道|吗)|既然.{0,24}(?:为什么|怎么|又)|不是.{0,10}(?:说|要|让).{0,20}(?:怎么|为什么|又)|前后矛盾|自相矛盾|你自己.{0,10}(?:说|要).{0,12}(?:怎么|又)|逻辑.{0,4}(?:乱|不通|矛盾)|说不通|讲不通|矛盾/.test(t)
    || (/[？?]/.test(t) && /都|又|却|既然|不是说/.test(t))
    || /问题(?:是|在|就)(?:这|那|这儿|那里)/.test(t)
    || /抓语病|抠字眼|说不过去|讲不通/.test(t)
  );
}

function extractChallengeKeywords(userText) {
  const t = String(userText || '');
  const stop = new Set(['笨蛋', '什么', '怎么', '为什么', '难道', '不是', '你说', '你的', '自己', '已经', '还要', '可以', '一下', '给我', '带你']);
  const keys = [];
  const han = t.match(/[\u4e00-\u9fff]{2,4}/g) || [];
  for (const w of han) {
    if (stop.has(w) || keys.includes(w)) continue;
    keys.push(w);
    if (keys.length >= 5) break;
  }
  return keys;
}

function replyAddressesChallenge(userText, reply) {
  const keys = extractChallengeKeywords(userText);
  if (!keys.length) return true;
  const o = String(reply || '');
  return keys.some((k) => o.includes(k));
}

/** 模型把两句用英文引号粘在一起、或 "" 拼接 */
function replyLooksDialogueGarbled(reply) {
  const o = String(reply || '').trim();
  if (!o) return false;
  if (/""|“”{2,}/.test(o)) return true;
  if (/^"[^"]{1,120}"[。.]?"[^"]{1,}/.test(o)) return true;
  if (/^["「][^"」]{0,120}["」][。.]?["「][^"」]{1,}/.test(o)) return true;
  const qCount = (o.match(/"/g) || []).length;
  if (qCount >= 4 && o.length < 200) return true;
  return false;
}

function normalizeChineseDialogue(reply) {
  let o = String(reply || '').trim();
  if (!o) return o;
  o = o.replace(/""+/g, '。');
  o = o.replace(/"([^"]+)"/g, '$1');
  if (/^["「『]/.test(o) && !/["」』]$/.test(o)) {
    o = o.replace(/^["「『]+/, '');
  }
  o = o.replace(/^["「『]+|["」』]+$/g, '');
  o = o.replace(/([。！？!?]){2,}/g, '$1');
  o = o.replace(/\s+/g, ' ').trim();
  return o;
}

function logicChallengeFallback(userText, recentKurisuLine = '') {
  void userText;
  void recentKurisuLine;
  return '';
}

function replyNeedsLogicRepair(userText, reply) {
  const u = String(userText || '').trim();
  const o = String(reply || '').trim();
  if (!u || !o) return { needs: false };

  const garbled = replyLooksDialogueGarbled(o);
  const challenged = userChallengesLogic(u);

  if (garbled) {
    return { needs: true, reason: 'dialogue_garbled', category: 'logic_garbled' };
  }

  if (challenged && !replyAddressesChallenge(u, o) && o.length > 12) {
    return { needs: true, reason: 'logic_dodge', category: 'logic_dodge' };
  }

  return { needs: false };
}

module.exports = {
  userChallengesLogic,
  extractChallengeKeywords,
  replyAddressesChallenge,
  replyLooksDialogueGarbled,
  normalizeChineseDialogue,
  logicChallengeFallback,
  replyNeedsLogicRepair,
};
