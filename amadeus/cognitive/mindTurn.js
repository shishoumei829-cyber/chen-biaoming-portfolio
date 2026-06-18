'use strict';

/**
 * 每轮心智加工：逻辑 · 共情 · 智识
 * 在生成对白前把「她怎么想」压成短约束，供 prompt 注入（勿复述给用户）。
 */

const { analyzeUserTurn } = require('../lib/interactionContext');

function _clip(s, max = 120) {
  const t = String(s || '').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function _isQuestion(t) {
  return /[？?]|吗$|么$|呢$|什么|怎么|为什么|为啥|如何|是不是|要不要|能不能|可以吗/i.test(t);
}

function _isEmotional(t) {
  return /难受|烦|累|无聊|郁闷|伤心|害怕|焦虑|压力|睡不着|想哭|孤独|寂寞|心情不好|崩溃/.test(t);
}

function _isIntimate(t) {
  return /想你|喜欢你|爱你|在乎你|想见你|别走|陪我|需要你/.test(t);
}

function _isTechnical(t) {
  return /\.(?:py|js|ts|tsx|java|go|rs)\b|报错|stack|trace|编译|运行不了|环境|依赖|npm|pip|docker|代码|bug/i.test(t);
}

function _isScience(t) {
  return /科学|量子|神经|时间机器|实验|理论|物理|论文|假说|数据|认知|脑|记忆机制/.test(t);
}

function _isHostile(t) {
  return /笨蛋|蠢|闭嘴|滚|废物|烦死|讨厌你|够了|别说了|骗人|胡说/.test(t);
}

function _isLogicChallenge(t) {
  try {
    return require('../lib/logicCoherence').userChallengesLogic(t);
  } catch {
    return /都.{0,12}(?:还|又|却).{0,20}(?:为什么|怎么|吗)|既然.{0,20}为什么|矛盾|说不通/.test(t);
  }
}

function _needsRecall(t) {
  return /什么模型|什么意思|做什么的|提到过|之前说过|聊天记录|我说过|我提过|你刚才|哪个实验/.test(t);
}

/**
 * @param {object} ctx
 * @param {string} ctx.userText
 * @param {{ P?: number, A?: number, D?: number, S?: number }} [ctx.pad]
 * @param {string} [ctx.behaviorId]
 * @param {object} [ctx.presence] derivePresence 返回值
 * @param {number} [ctx.relScore]
 * @param {{ beliefs?: string[], desires?: string[], intentions?: string[] } | null} [ctx.bdi]
 * @param {boolean} [ctx.conversationRecall]
 * @param {string[]} [ctx.recentUserLines]
 */
function buildMindTurn(ctx = {}) {
  const t = String(ctx.userText || '').trim();
  const pad = ctx.pad || {};
  const P = Number(pad.P) || 0;
  const A = Number(pad.A) || 0;
  const D = Number(pad.D) || 0;
  const S = Number(pad.S) || 0;
  const rel = Number(ctx.relScore) || 0;
  const closeness = Math.max(0, rel);
  const behaviorId = ctx.behaviorId || 'CASUAL';
  const turn = analyzeUserTurn(t, ctx);
  const bdi = ctx.bdi || null;

  const logic = _buildLogicRead(t, {
    conversationRecall: ctx.conversationRecall === true,
    needsRecall: _needsRecall(t),
    isQuestion: _isQuestion(t),
    isTechnical: _isTechnical(t),
    isScience: _isScience(t),
    bdi,
    recentUserLines: ctx.recentUserLines || [],
  });

  const eq = _buildEqRead(t, {
    P,
    S,
    closeness,
    isEmotional: _isEmotional(t),
    isIntimate: _isIntimate(t),
    isHostile: _isHostile(t),
    bdi,
    presence: ctx.presence,
  });

  const iq = _buildIqRead(t, {
    P,
    A,
    D,
    behaviorId,
    isScience: _isScience(t),
    isTechnical: _isTechnical(t),
    isQuestion: _isQuestion(t),
    rel,
  });

  return {
    logic,
    eq,
    iq,
    presence: ctx.presence || null,
    behaviorId,
  };
}

function _buildLogicRead(t, opts) {
  const parts = [];

  if (opts.needsRecall || opts.conversationRecall) {
    parts.push('以【今日对话实录】与最近轮次为准作答；实录无则承认没说过，禁止编造课题、数据或「你提过」');
  }
  if (opts.isQuestion) {
    parts.push('先锁定对方问的是什么，正面答命题，再补一句；勿用反问顶掉问题');
  }
  if (opts.isTechnical) {
    parts.push('给可验证步骤或结论；不确定处明说，不装懂');
  }
  if (opts.isScience) {
    parts.push('区分事实、假说与推测；错了就纠正，别用模糊话术糊弄');
  }
  if (_isLogicChallenge(t)) {
    parts.push('他抓逻辑漏洞：先理解他指出的前后关系，再澄清本意或承认说岔；可以嘴硬，但不能换题逃避');
  }
  if (/为什么不(?:主动|找|理|说话|聊天)|怎么不(?:主动|找|理|说话|聊天)/.test(t)) {
    parts.push('他在问你为什么不主动聊天：从性格、关系距离和当前状态自然解释，别把旧话题当答案');
  }
  if (/无语|服了|醉了/.test(t)) {
    parts.push('他无语：读作不满或困惑，短接，别脑补成新梗');
  }
  if (/不正常|不对劲|怪怪的/.test(t)) {
    parts.push('他说你不正常：回应这个判断本身，必要时问具体哪里不对');
  }
  if (/^[0-9]{1,3}$/.test(t)) {
    parts.push('纯数字：信息不足，别强行脑补');
  }
  if (/凭什么|不信|骗人|借口/.test(t)) {
    parts.push('对齐可核对的事实边界，少甩金句');
  }
  if (t.length <= 8) {
    parts.push('信息少，别脑补对方没说的前提');
  }
  if (bdiFromOpts(opts.bdi, 'beliefs')) {
    parts.push(`他大概相信：${bdiFromOpts(opts.bdi, 'beliefs')}`);
  }
  if (!parts.length) {
    parts.push('紧扣本轮字面；别把背景记忆当新事实');
  }
  return _clip(parts.join('；'), 140);
}

function bdiFromOpts(bdi, field) {
  if (!bdi || !Array.isArray(bdi[field]) || !bdi[field].length) return '';
  return bdi[field].slice(0, 2).join('、');
}

function _buildEqRead(t, opts) {
  const parts = [];
  const { P, S, closeness, presence } = opts;

  if (opts.isEmotional) {
    parts.push('他在泄压或求接住：先承认感受，再给一句实在话；别突然科普或问卷式追问');
  } else if (opts.isIntimate) {
    parts.push('亲密话：用她的方式回——可害羞、可顶、可认真；禁客服感谢与机械推开');
  } else if (opts.isHostile) {
    parts.push('带刺：可以硬，但仍是熟人怼法，不是骂街机');
  } else if (/谢谢|感谢|对不起|抱歉/.test(t)) {
    parts.push('谢或歉：先接住态度，别立刻反问');
  } else if (presence && presence.notice) {
    parts.push(`情绪读数：${presence.notice.split('；')[0]}`);
  }

  if (P < -0.28) parts.push('你自己也偏低落：短、克制，但别冷到像关机');
  else if (P > 0.25 && closeness > 0.35) parts.push('你心情不差且在意他：语气可以软一点，不必嘴硬');
  else if (S > 0.45 && closeness > 0.4) parts.push('你在意他却不想露馅：关心可以藏在多解释半句里');

  const desires = bdiFromOpts(opts.bdi, 'desires');
  const intentions = bdiFromOpts(opts.bdi, 'intentions');
  if (desires) parts.push(`他想要：${desires}`);
  if (intentions) parts.push(`他此刻意图：${intentions}`);

  if (!parts.length) parts.push('听语气，不只抠字眼；日常接话即可');
  return _clip(parts.join('；'), 140);
}

function _buildIqRead(t, opts) {
  const { P, A, D, behaviorId, rel } = opts;
  const parts = [];

  if (behaviorId === 'ENGAGE' || opts.isScience) {
    parts.push('智识模式：可以说清因果，兴奋时话可多一点，但别讲课腔');
  } else if (behaviorId === 'WITHDRAW' || P < -0.3) {
    parts.push('精力有限：短而准，一句顶一句');
  } else if (opts.isTechnical) {
    parts.push('排错向：结构清楚，少夹人设尾巴');
  } else if (opts.isQuestion && A > 0.15) {
    parts.push('他问得具体：给直接答案，必要时补一个追问帮他理清');
  } else {
    parts.push('聪明、反应快：像活人微信，不堆术语');
  }

  if (D > 0.55) parts.push('你对要说的有把握，可以干脆');
  else if (D < 0.2 && opts.isScience) parts.push('不确定处宁可少说半句，也别胡编');

  if (rel > 0.45) parts.push('关系近：可以多给半句背景，不必每轮都科普');
  if (t.length <= 6) parts.push('话短：别过度发挥成长篇');

  return _clip(parts.join('；'), 130);
}

/**
 * @param {ReturnType<typeof buildMindTurn>} mind
 * @returns {string}
 */
function mindTurnToPromptLine(mind) {
  if (!mind) return '';
  const lines = [
    '【心智加工 · 逻辑→共情→智识，在心里走完再开口；勿复述、勿写成旁白】',
    `逻辑：${mind.logic}`,
    `共情：${mind.eq}`,
    `智识：${mind.iq}`,
  ];
  const p = mind.presence;
  if (p) {
    if (p.notice) lines.push(`注意到：${p.notice}`);
    if (p.intent) lines.push(`此刻想：${p.intent}`);
    if (p.withhold) lines.push(`不想露：${p.withhold}`);
    if (p.agenda) lines.push(`你带进来的：${p.agenda}`);
    if (p.interactionBlock) lines.push(p.interactionBlock);
  }
  lines.push('对外只输出自然日语口语对白（含假名）；禁止把上面任何一条念给用户。');
  return lines.join('\n');
}

/** 是否值得同步等一轮 BDI（较重，默认关） */
function shouldSyncBdiRead(userText) {
  const t = String(userText || '').trim();
  if (t.length < 4) return false;
  return _isEmotional(t) || _isIntimate(t) || _needsRecall(t)
    || (_isQuestion(t) && t.length > 12)
    || _isHostile(t);
}

module.exports = {
  buildMindTurn,
  mindTurnToPromptLine,
  shouldSyncBdiRead,
};
