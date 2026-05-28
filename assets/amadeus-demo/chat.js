/**
 * AMADEUS · 作品集对话演示
 * 优先连接 chat_server（Ollama）；离线时用 curated + PAD 展示栈状态
 */
(function () {
  'use strict';

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const params = new URLSearchParams(location.search);
  const API_BASE = (params.get('api') || '').replace(/\/$/, '');
  const SESSION_KEY = 'ama_demo_session';

  let pad = { P: 0.1, A: 0, D: 0.2, S: 0.35 };
  let turn = 0;
  let sessionId = sessionStorage.getItem(SESSION_KEY) || '';
  let curated = [];
  let pending = false;

  const els = {
    msgs: document.getElementById('amaMsgs'),
    input: document.getElementById('amaInput'),
    send: document.getElementById('amaSend'),
    banner: document.getElementById('amaBanner'),
    pad: {
      P: document.querySelector('[data-pad="P"]'),
      A: document.querySelector('[data-pad="A"]'),
      D: document.querySelector('[data-pad="D"]'),
      S: document.querySelector('[data-pad="S"]'),
    },
  };

  function fmt(v) {
    const n = Number(v);
    return (n >= 0 ? '+' : '') + n.toFixed(2);
  }

  function renderPad() {
    Object.keys(els.pad).forEach((k) => {
      if (els.pad[k]) els.pad[k].textContent = fmt(pad[k]);
    });
  }

  function appendBubble(text, role) {
    const div = document.createElement('div');
    div.className = 'ama-bubble' + (role === 'user' ? ' user' : '');
    div.textContent = text;
    els.msgs.appendChild(div);
    els.msgs.scrollTop = els.msgs.scrollHeight;
    return div;
  }

  function importance(t) {
    let w = 0.2;
    if (/喜欢|爱|死|牺牲|父亲|论文/.test(t)) w += 0.35;
    if (/chatgpt|ai|程序|复制体|别装/i.test(t)) w += 0.4;
    if (/谢谢|舒服|懂了/.test(t)) w += 0.15;
    if (/[?？]/.test(t)) w += 0.05;
    return Math.min(1, w);
  }

  function stimulus(t) {
    let p = 0;
    let a = 0;
    let d = 0;
    if (/喜欢|爱|靠近|担心/.test(t)) {
      p += 0.25;
      a += 0.35;
      d -= 0.15;
    }
    if (/拒|不够格|撑不住|麻烦/.test(t)) {
      p -= 0.35;
      a += 0.15;
    }
    if (/chatgpt|ai|程序|复制体|矛盾|prove/i.test(t)) {
      p -= 0.2;
      a += 0.45;
      d += 0.35;
    }
    if (/christina|变态|助手|中二/.test(t)) {
      p -= 0.05;
      a += 0.25;
      d += 0.15;
    }
    if (/谢谢|信你|测试/.test(t)) {
      p += 0.3;
      a -= 0.1;
    }
    if (/记忆|信息论|脑科学|世界线/.test(t)) {
      a += 0.2;
      d += 0.15;
    }
    return { p, a, d };
  }

  function updatePad(userInput) {
    const imp = importance(userInput);
    const { p: sp, a: sa, d: sd } = stimulus(userInput);
    const alpha = 0.86;
    const beta = 0.2 + imp * 0.6;
    const gamma = 0.18;
    const bondDamp = sp < 0 ? 1 - pad.S * 0.35 : 1;
    const eps = (Math.random() * 2 - 1) * 0.04;
    const next = (key, stim, base) =>
      clamp(
        Math.tanh(alpha * pad[key] + beta * stim * bondDamp + gamma * base + eps * (key === 'P' ? 1 : 0.5)),
        -1,
        1
      );
    pad = {
      P: next('P', sp, 0.08),
      A: next('A', sa, 0.05),
      D: next('D', sd, 0.12),
      S: /喜欢|担心|谢谢|信你/.test(userInput)
        ? clamp(Math.tanh(alpha * pad.S + 0.12 + imp * 0.08), -1, 1)
        : pad.S,
    };
    renderPad();
  }

  function guessDimension(text) {
    const t = text;
    if (/冈部|凶真|凤凰院|中田|世界线|christina|变态|lab/i.test(t)) return 'CANON';
    if (/梗|截图|香蕉|人就是信息|meme/i.test(t)) return 'MEME';
    if (/论文|科学|信息论|脑|实验|证明|chatgpt|ai|程序/i.test(t)) return 'SCI';
    if (/累|烦|顺|改不了|泄|压力|谢谢|听我说/i.test(t)) return 'EMO';
    if (/记得|上次|咖啡|说过|记忆/i.test(t)) return 'MEM';
    if (/喜欢|爱|靠近|陪|聊天/i.test(t)) return 'REL';
    if (/谁|是不是|怎么看|认为/i.test(t)) return 'CHAR';
    return 'CANON';
  }

  function curatedReply(userInput) {
    const dim = guessDimension(userInput);
    turn += 1;
    const idx = ((turn - 1) % 6) + 1;
    const hit = curated.find((r) => r.dimension === dim && r.turn === idx);
    if (hit) return hit.text;
    const any = curated.find((r) => r.turn === idx);
    if (any) return any.text;
    return '……你这个问题我得先想清楚。别催，我又不是定时回复机。';
  }

  async function apiChat(userInput) {
    const res = await fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput, session_id: sessionId || null }),
    });
    if (!res.ok) throw new Error('api ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'chat failed');
    if (data.session_id) {
      sessionId = data.session_id;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    if (data.pad) pad = { ...pad, ...data.pad };
    renderPad();
    return data.reply;
  }

  async function send() {
    const text = els.input.value.trim();
    if (!text || pending) return;
    pending = true;
    els.input.disabled = true;
    els.send.disabled = true;
    appendBubble(text, 'user');
    els.input.value = '';
    updatePad(text);
    const wait = appendBubble('……', 'assistant');
    wait.classList.add('pending');
    try {
      let reply;
      if (API_BASE) {
        reply = await apiChat(text);
        els.banner.classList.add('hidden');
      } else {
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
        reply = curatedReply(text);
      }
      wait.textContent = reply;
      wait.classList.remove('pending');
    } catch (e) {
      await new Promise((r) => setTimeout(r, 300));
      wait.textContent = curatedReply(text);
      wait.classList.remove('pending');
      els.banner.textContent =
        '未连接 AMADEUS 后端，当前为实验稿离线演示。部署 chat_server 后可在链接加 ?api=你的服务地址 启用完整对话。';
      els.banner.classList.remove('hidden');
    }
    pending = false;
    els.input.disabled = false;
    els.send.disabled = false;
    els.input.focus();
  }

  async function init() {
    try {
      const r = await fetch('curated.json');
      if (r.ok) curated = await r.json();
    } catch (_) {}

    renderPad();
    appendBubble(
      '神经链已建立。你可以直接问——我会按 AMADEUS 栈处理情绪与记忆，不是背固定台词。',
      'assistant'
    );

    if (API_BASE) {
      els.banner.textContent = '已连接 AMADEUS 对话服务 · 完整栈 + 模型';
      els.banner.classList.remove('hidden');
      try {
        const h = await fetch(API_BASE + '/health');
        if (!h.ok) throw new Error();
        els.banner.classList.add('hidden');
      } catch (_) {
        els.banner.textContent = 'API 地址无响应，将使用离线演示稿。';
      }
    } else {
      els.banner.textContent = '作品集演示 · 离线对话（实验 curated 稿 + PAD 状态）。连接后端：?api=服务地址';
      els.banner.classList.remove('hidden');
    }

    els.send.addEventListener('click', send);
    els.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });
  }

  init();
})();
