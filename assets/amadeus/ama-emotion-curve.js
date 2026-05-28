/**
 * AMADEUS · INNER STATE 曲线
 * 逻辑来自 experiments/kurisu-dialogue/amadeus/pad.py（与展示用 AMADEUS 实验栈一致）
 */
(function () {
  'use strict';

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const DEMO_INPUTS = [
    '你还记得第一次在中田商店外面遇见冈部的时候吗？当时你怎么看他？',
    '他当场那种中二自我介绍，你真的没被吓到？',
    '后来实验室成立，你为什么还是留下来了？',
    '网上有人说你留下只是因为时间机器，你怎么回应？',
    '如果只能保留一个关于 LAB 的记忆，你会选哪一段？',
    '你对冈部那种「凶真」人格，是嫌弃还是已经习惯了？',
    '论文又被拒了，觉得自己是不是根本不够格。',
    '今天什么都不顺，连咖啡都洒了。',
    '有时候觉得，不管怎么努力，结果都会被改写。',
    '谢谢你愿意听我说这些，没有把我当麻烦。',
    'ChatGPT 能写出很像你的句子，你怎么区分真假？',
    '如果有一天你必须在科学和身边的人之间选一个，你会怎么选？',
    '我喜欢和你聊天，虽然你嘴上不承认。',
    '别装没事，你今天语气不对。',
  ];

  function importance(userInput) {
    let weight = 0.2;
    const t = userInput;
    if (/喜欢|爱|死|牺牲|父亲|论文/.test(t)) weight += 0.35;
    if (/chatgpt|ai|程序|复制体|别装/i.test(t)) weight += 0.4;
    if (/谢谢|舒服|懂了/.test(t)) weight += 0.15;
    if (/[?？]/.test(t)) weight += 0.05;
    return Math.min(1, weight);
  }

  function stimulus(userInput) {
    let p = 0;
    let a = 0;
    let d = 0;
    const t = userInput;
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

  function updatePad(state, userInput) {
    const imp = importance(userInput);
    const { p: sp, a: sa, d: sd } = stimulus(userInput);
    const alpha = 0.86;
    const beta = 0.2 + imp * 0.6;
    const gamma = 0.18;
    const base = { P: 0.08, A: 0.05, D: 0.12 };
    const bondDamp = sp < 0 ? 1 - state.S * 0.35 : 1;
    const eps = (Math.random() * 2 - 1) * 0.04;

    const next = (key, stim, b) => {
      const damped = stim * bondDamp;
      return clamp(
        Math.tanh(alpha * state[key] + beta * damped + gamma * b + eps * (key === 'P' ? 1 : 0.5)),
        -1,
        1
      );
    };

    const nextS =
      /喜欢|担心|谢谢|信你/.test(userInput)
        ? clamp(Math.tanh(alpha * state.S + 0.12 + imp * 0.08), -1, 1)
        : state.S;

    return {
      P: next('P', sp, base.P),
      A: next('A', sa, base.A),
      D: next('D', sd, base.D),
      S: nextS,
    };
  }

  function emotionScore(state) {
    const s = state.S * 2 - 1;
    return 0.4 * state.P + 0.25 * state.A + 0.2 * state.D + 0.15 * s;
  }

  function fmt(v, digits) {
    const n = Number(v);
    return (n >= 0 ? '+' : '') + n.toFixed(digits);
  }

  function initPanel(root) {
    const svg = root.querySelector('.ama-emotion-panel__svg');
    const curvePath = root.querySelector('.ama-emotion-curve-path');
    const cursor = root.querySelector('.ama-emotion-cursor');
    const scoreEl = root.querySelector('[data-ama-emotion-score]');
    const turnEl = root.querySelector('[data-ama-emotion-turn]');
    const padEls = {
      P: root.querySelector('[data-ama-pad="P"]'),
      A: root.querySelector('[data-ama-pad="A"]'),
      D: root.querySelector('[data-ama-pad="D"]'),
      S: root.querySelector('[data-ama-pad="S"]'),
    };
    if (!svg || !curvePath) return null;

    const W = 600;
    const H = 280;
    const padX = 36;
    const padY = 28;
    const plotW = W - padX * 2;
    const plotH = H - padY * 2;

    let state = { P: 0.1, A: 0, D: 0.2, S: 0.35 };
    let history = [emotionScore(state)];
    let turn = 0;
    let timer = null;
    let running = false;

    function yForScore(score) {
      const t = (score + 1) / 2;
      return padY + plotH * (1 - t);
    }

    function xForIndex(i, len) {
      if (len <= 1) return padX + plotW / 2;
      return padX + (plotW * i) / (len - 1);
    }

    function render() {
      const len = history.length;
      const min = Math.min(-1, ...history, 0);
      const max = Math.max(1, ...history, 0);
      const span = max - min || 1;

      const mapY = (score) => padY + plotH * (1 - (score - min) / span);

      const pts = history.map((s, i) => `${xForIndex(i, len)},${mapY(s)}`);
      curvePath.setAttribute('d', 'M' + pts.join(' L'));

      const last = history[len - 1];
      const cx = xForIndex(len - 1, len);
      const cy = mapY(last);
      cursor.setAttribute('cx', cx);
      cursor.setAttribute('cy', cy);

      scoreEl.textContent = fmt(last, 3);
      turnEl.textContent = String(Math.min(turn, DEMO_INPUTS.length));
      padEls.P.textContent = fmt(state.P, 2);
      padEls.A.textContent = fmt(state.A, 2);
      padEls.D.textContent = fmt(state.D, 2);
      padEls.S.textContent = state.S.toFixed(2);
    }

    function reset() {
      state = { P: 0.1, A: 0, D: 0.2, S: 0.35 };
      history = [emotionScore(state)];
      turn = 0;
      render();
    }

    function tick() {
      if (turn >= DEMO_INPUTS.length) {
        turn = 0;
        reset();
        return;
      }
      const input = DEMO_INPUTS[turn];
      state = updatePad(state, input);
      history.push(emotionScore(state));
      if (history.length > 24) history.shift();
      turn += 1;
      if (turnEl) turnEl.textContent = String(turn);
      const cap = root.querySelector('[data-ama-emotion-caption]');
      if (cap) cap.textContent = input.length > 42 ? input.slice(0, 42) + '…' : input;
      render();
    }

    function start() {
      if (running) return;
      running = true;
      reset();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        while (turn < DEMO_INPUTS.length) tick();
        render();
        return;
      }
      timer = setInterval(tick, 1400);
    }

    function stop() {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
    }

    render();
    return { start, stop, reset };
  }

  document.querySelectorAll('[data-ama-emotion-panel]').forEach((panel) => {
    const ctrl = initPanel(panel);
    if (!ctrl) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) ctrl.start();
        else ctrl.stop();
      },
      { threshold: 0.2 }
    );
    obs.observe(panel);
  });
})();
