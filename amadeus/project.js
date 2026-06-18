const codeSnippets = {
  memory: {
    title: "记忆宫殿",
    path: "amadeus/lib/memory.js",
    code: `class MemorySystem {
  constructor(dataDir, eventLogPath) {
    this.dataDir = dataDir;
    this.eventLogPath = eventLogPath;
    this.events = this._loadEvents();
  }

  search(query) {
    return this.events
      .map((event) => ({ ...event, score: semanticScore(query, event) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }
}`
  },
  emotion: {
    title: "情绪矩阵",
    path: "amadeus/cognitive/pad.js",
    code: `function updatePadState(prev, signal) {
  return {
    P: clamp(prev.P + signal.valence * 0.38, -1, 1),
    A: clamp(prev.A + signal.arousal * 0.26, -1, 1),
    D: clamp(prev.D + signal.control * 0.22, -1, 1),
    S: clamp(prev.S + signal.relationship * 0.18, 0, 1)
  };
}`
  },
  behavior: {
    title: "行为仲裁",
    path: "amadeus/cognitive/behavior.js",
    code: `function decideBehavior(context) {
  const candidates = scoreCandidates([
    "APPROACH",
    "CASUAL",
    "DEFEND",
    "DEFLECT",
    "ENGAGE",
    "WITHDRAW"
  ], context);

  return candidates.sort((a, b) => b.score - a.score)[0];
}`
  },
  autonomy: {
    title: "主动机制",
    path: "amadeus/autonomy_enhanced.js",
    code: `function shouldSpeakFirst(state) {
  const relationReady = state.relationshipScore > 0.62;
  const silenceLongEnough = state.silentMinutes > state.threshold;
  const hasReason = state.openLoops.length > 0 || state.drive.score > 0.7;

  return relationReady && silenceLongEnough && hasReason;
}`
  }
};

function initIndexRows() {
  document.querySelectorAll(".index-row").forEach((row) => {
    row.addEventListener("mouseenter", () => {
      if (window.gsap) gsap.to(row, { backgroundColor: "#ffc4e3", duration: 0.12 });
      else row.style.backgroundColor = "#ffc4e3";
    });

    row.addEventListener("mouseleave", () => {
      if (window.gsap) gsap.to(row, { backgroundColor: "#fff", duration: 0.16 });
      else row.style.backgroundColor = "#fff";
    });
  });
}

function initDrawer() {
  const drawer = document.getElementById("codeDrawer");
  if (!drawer) return;

  const codeTitle = document.getElementById("codeTitle");
  const codePath = document.getElementById("codePath");
  const codeBlock = document.getElementById("codeBlock");
  const drawerClose = document.getElementById("drawerClose");

  document.querySelectorAll("[data-code]").forEach((button) => {
    button.addEventListener("click", () => {
      const snippet = codeSnippets[button.dataset.code];
      if (!snippet) return;
      codeTitle.textContent = snippet.title;
      codePath.textContent = snippet.path;
      codeBlock.textContent = snippet.code;
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
    });
  });

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  drawerClose.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
}

window.addEventListener("load", () => {
  initIndexRows();
  initDrawer();
});
