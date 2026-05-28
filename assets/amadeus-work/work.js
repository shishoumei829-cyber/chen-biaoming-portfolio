/**
 * AMADEUS SYSTEM · work UI（还原 amadeus_work 布局）
 * 对话：优先 chat_server + Ollama；离线用 curated + 栈内 PAD/记忆宫
 */
(function () {
  'use strict';

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const params = new URLSearchParams(location.search);
  const API_BASE = (params.get('api') || '').replace(/\/$/, '');
  const SESSION_KEY = 'ama_work_session';

  let pad = { P: 0.12, A: 0.2, D: 0.2, S: 0.35 };
  let turn = 0;
  let sessionId = sessionStorage.getItem(SESSION_KEY) || '';
  let curated = [];
  let curvePts = [];
  let pending = false;
  const memory = { Hall: 0, Lab: 0, Cafe: 0, Forbidden: 0 };
  let idleSec = 0;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    clock: $('#awClock'),
    msgs: $('#awMsgs'),
    input: $('#awInput'),
    send: $('#awSend'),
    toast: $('#awToast'),
    log: $('#awLog'),
    score: $('#awScore'),
    pad: { P: $('#awP'), A: $('#awA'), D: $('#awD'), S: $('#awS') },
    bars: {
      sync: $('#awBarSync'),
      perc: $('#awBarPerc'),
      vol: $('#awBarVol'),
    },
    mem: {
      Hall: $('#awMemHall'),
      Lab: $('#awMemLab'),
      Cafe: $('#awMemCafe'),
      Forbidden: $('#awMemForb'),
    },
    curvePath: $('.aw-curve-path'),
    curveDot: $('.aw-curve-dot'),
  };

  function fmt(v) {
    return (Number(v) >= 0 ? '+' : '') + Number(v).toFixed(2);
  }

  function tickClock() {
    const d = new Date();
    els.clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
  }

  function renderPad() {
    ['P', 'A', 'D', 'S'].forEach((k) => {
      if (els.pad[k]) els.pad[k].textContent = fmt(pad[k]);
    });
    const score = 0.4 * pad.P + 0.25 * pad.A + 0.2 * pad.D + 0.15 * (pad.S * 2 - 1);
    if (els.score) els.score.textContent = fmt(score);
    if (els.bars.sync) els.bars.sync.style.width = Math.round(50 + score * 24) + '%';
    if (els.bars.perc) els.bars.perc.style.width = Math.round(70 + pad.A * 20) + '%';
    if (els.bars.vol) els.bars.vol.style.width = Math.round(8 + Math.abs(pad.P) * 12) + '%';
    drawCurve(score);
  }

  function drawCurve(score) {
    curvePts.push(score);
    if (curvePts.length > 48) curvePts.shift();
    const w = 200;
    const h = 60;
    const mid = h / 2;
    const xs = curvePts.map((_, i) => (i / Math.max(1, curvePts.length - 1)) * w);
    const ys = curvePts.map((s) => mid - s * (mid - 6));
    let d = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
    for (let i = 1; i < xs.length; i++) d += ` L${xs[i].toFixed(1)},${ys[i].toFixed(1)}`;
    if (els.curvePath) els.curvePath.setAttribute('d', d);
    if (els.curveDot && xs.length) {
      const li = xs.length - 1;
      els.curveDot.setAttribute('cx', xs[li]);
      els.curveDot.setAttribute('cy', ys[li]);
    }
  }

  function logLine(t) {
    if (!els.log) return;
    const p = document.createElement('div');
    p.textContent = `[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] ${t}`;
    els.log.prepend(p);
    while (els.log.children.length > 12) els.log.lastChild.remove();
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('on');
    clearTimeout(els.toast._t);
    els.toast._t = setTimeout(() => els.toast.classList.remove('on'), 3200);
  }

  function classifyMemory(text) {
    const rooms = ['Hall'];
    if (/论文|脑科学|信息|算法|世界线|意识|算力|科学/.test(text)) rooms.push('Lab');
    if (/咖啡|吃饭|天气|香蕉|cos|空调|饮料|糖/.test(text)) rooms.push('Cafe');
    if (/喜欢|爱|死|牺牲|父亲|复制体|命运|担心/.test(text)) rooms.push('Forbidden');
    return [...new Set(rooms)];
  }

  function ingestMemory(text) {
    classifyMemory(text).forEach((r) => {
      memory[r] = Math.min(99, memory[r] + 1);
      if (els.mem[r]) els.mem[r].textContent = String(memory[r]).padStart(2, '0');
    });
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
    let p = 0,
      a = 0,
      d = 0;
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

  function updatePadLocal(userInput) {
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
    if (/冈部|凶真|凤凰院|中田|世界线|christina|变态|lab/i.test(text)) return 'CANON';
    if (/梗|截图|香蕉|人就是信息/i.test(text)) return 'MEME';
    if (/论文|科学|信息论|脑|实验|chatgpt|ai|程序/i.test(text)) return 'SCI';
    if (/累|烦|顺|改不了|泄|压力|谢谢|听我说/i.test(text)) return 'EMO';
    if (/记得|上次|咖啡|说过|记忆/i.test(text)) return 'MEM';
    if (/喜欢|爱|靠近|陪|聊天/i.test(text)) return 'REL';
    if (/谁|是不是|怎么看|认为/i.test(text)) return 'CHAR';
    return 'CANON';
  }

  function curatedReply(text) {
    const dim = guessDimension(text);
    turn += 1;
    const idx = ((turn - 1) % 6) + 1;
    const hit = curated.find((r) => r.dimension === dim && r.turn === idx);
    if (hit) return hit.text;
    const any = curated.find((r) => r.turn === idx);
    return any ? any.text : '……别催。我在算该用哪种口气回你。';
  }

  function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = 'aw-msg' + (role === 'user' ? ' user' : '');
    div.textContent = text;
    els.msgs.appendChild(div);
    els.msgs.scrollTop = els.msgs.scrollHeight;
    return div;
  }

  async function apiChat(text) {
    const res = await fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, session_id: sessionId || null }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'failed');
    if (data.session_id) {
      sessionId = data.session_id;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    if (data.pad) {
      pad = { ...pad, ...data.pad };
      renderPad();
    }
    if (data.behavior) logLine('behavior → ' + data.behavior);
    if (data.memory_rooms) {
      logLine('memory rooms → ' + data.memory_rooms.join(', '));
      data.memory_rooms.forEach((r) => {
        if (memory[r] !== undefined) {
          memory[r] = Math.min(99, memory[r] + 1);
          if (els.mem[r]) els.mem[r].textContent = String(memory[r]).padStart(2, '0');
        }
      });
    }
    return data.reply;
  }

  async function send() {
    const text = els.input.value.trim();
    if (!text || pending) return;
    pending = true;
    els.input.disabled = true;
    els.send.disabled = true;
    appendMsg(text, 'user');
    els.input.value = '';
    ingestMemory(text);
    updatePadLocal(text);
    const wait = appendMsg('……', 'assistant');
    wait.classList.add('pending');
    try {
      let reply;
      if (API_BASE) {
        reply = await apiChat(text);
        logLine('neural link · model reply');
      } else {
        await new Promise((r) => setTimeout(r, 350 + Math.random() * 450));
        reply = curatedReply(text);
        logLine('offline stack · curated');
      }
      wait.textContent = reply;
      wait.classList.remove('pending');
      ingestMemory(reply);
    } catch (e) {
      updatePadLocal(text);
      wait.textContent = curatedReply(text);
      wait.classList.remove('pending');
      logLine('api fallback · ' + (e.message || 'offline'));
      toast(API_BASE ? '后端未响应，已切换离线演示稿' : '作品集演示 · 连接 chat_server 可启用完整模型');
    }
    pending = false;
    els.input.disabled = false;
    els.send.disabled = false;
    els.input.focus();
  }

  async function init() {
    tickClock();
    setInterval(tickClock, 1000);
    setInterval(() => {
      idleSec += 1;
      const el = $('#awIdle');
      if (el) el.textContent = idleSec + 's';
    }, 1000);

    try {
      const r = await fetch('../amadeus-demo/curated.json');
      if (r.ok) curated = await r.json();
    } catch (_) {}

    renderPad();
    logLine('neural link established');
    appendMsg('……神经链已同步。直接输入即可，我会按 AMADEUS 栈处理，不是背台词。', 'assistant');

    if (API_BASE) {
      try {
        const h = await fetch(API_BASE + '/health');
        if (h.ok) toast('AMADEUS 对话服务已连接');
        else throw new Error();
      } catch (_) {
        toast('API 无响应 · 使用离线演示');
      }
    }

    els.send.addEventListener('click', send);
    els.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    $('#awSkip')?.addEventListener('click', () => {
      els.input.value = '';
      els.input.focus();
    });
  }

  init();
})();
