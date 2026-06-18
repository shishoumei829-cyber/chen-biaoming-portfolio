const TOKEN_KEY = "cursor-mobile-token";

const gate = document.getElementById("gate");
const app = document.getElementById("app");
const gateToken = document.getElementById("gateToken");
const gateSubmit = document.getElementById("gateSubmit");
const gateError = document.getElementById("gateError");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const modeSelect = document.getElementById("modeSelect");
const agentPanel = document.getElementById("agentPanel");
const agentSelect = document.getElementById("agentSelect");
const openAgentLink = document.getElementById("openAgentLink");
const promptInput = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const refreshAgents = document.getElementById("refreshAgents");
const agentList = document.getElementById("agentList");
const modeInfoText = document.getElementById("modeInfoText");

let agents = [];

function normalizeToken(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (value.toLowerCase().startsWith("access_token=")) {
    value = value.slice("access_token=".length).trim();
  }
  return value.replace(/^['"]|['"]$/g, "");
}

function getToken() {
  return normalizeToken(localStorage.getItem(TOKEN_KEY) || "");
}

function setToken(value) {
  localStorage.setItem(TOKEN_KEY, normalizeToken(value));
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `请求失败 ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function setStatus(kind, text) {
  statusDot.className = `dot ${kind}`;
  statusText.textContent = text;
}

function showResult(data) {
  resultBox.textContent = JSON.stringify(data, null, 2);
}

function renderAgentOptions() {
  agentSelect.innerHTML = "";
  if (!agents.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "暂无 Agent，请先新建";
    agentSelect.appendChild(opt);
    return;
  }
  for (const item of agents) {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.name || item.id} · ${item.status || "UNKNOWN"}`;
    agentSelect.appendChild(opt);
  }
  updateAgentLink();
}

function renderAgentList() {
  agentList.innerHTML = "";
  if (!agents.length) {
    const li = document.createElement("li");
    li.textContent = "暂无记录";
    agentList.appendChild(li);
    return;
  }
  for (const item of agents) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `
      <div class="agent-name">${escapeHtml(item.name || item.id)}</div>
      <div class="agent-meta">${escapeHtml(item.status || "")} · ${formatTime(item.updatedAt || item.createdAt)}</div>
    `;
    btn.addEventListener("click", () => {
      modeSelect.value = "followup";
      agentPanel.classList.remove("hidden");
      agentSelect.value = item.id;
      updateAgentLink();
      promptInput.focus();
    });
    li.appendChild(btn);
    agentList.appendChild(li);
  }
}

function updateAgentLink() {
  const selected = agents.find((a) => a.id === agentSelect.value);
  if (!selected?.url) {
    openAgentLink.classList.add("hidden");
    openAgentLink.href = "#";
    return;
  }
  openAgentLink.href = selected.url;
  openAgentLink.classList.remove("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return value;
  }
}

async function loadHealth() {
  const health = await api("/api/health");
  if (!health.hasApiKey) {
    setStatus("bad", "服务器未配置 CURSOR_API_KEY");
    return health;
  }

  if (health.agentTarget === "local") {
    setStatus("ok", `本机模式 · ${health.workerName}`);
    modeInfoText.textContent = "任务会在你电脑上执行。发送后点链接去 Cursor 网页看详情。";
  } else {
    setStatus("ok", "云端模式 · 已连接");
    modeInfoText.textContent =
      "全中文发令。任务在 Cursor 云端执行，操作 GitHub 仓库。发送后可点链接查看进度。";
  }
  return health;
}

async function loadAgents() {
  const data = await api("/api/agents?limit=15");
  agents = data.items || [];
  renderAgentOptions();
  renderAgentList();
}

async function sendPrompt() {
  const text = promptInput.value.trim();
  if (!text) {
    showResult({ error: "请先输入指令" });
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "发送中…";
  try {
    let data;
    if (modeSelect.value === "followup") {
      const agentId = agentSelect.value;
      if (!agentId) throw new Error("请选择一个 Agent 再发跟进");
      data = await api(`/api/agents/${encodeURIComponent(agentId)}/runs`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    } else {
      data = await api("/api/agents", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    }
    showResult(data);
    promptInput.value = "";
    await loadAgents();
    const url = data.agent?.url || agents.find((a) => a.id === data.run?.agentId)?.url;
    if (url) {
      setStatus("ok", `已发送，可在 Cursor 查看：${url}`);
    } else {
      setStatus("ok", "指令已发送");
    }
  } catch (err) {
    setStatus("bad", err.message);
    showResult(err.data || { error: err.message });
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "发送指令";
  }
}

function bindSendInteractions() {
  sendBtn.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") event.preventDefault();
  });
  sendBtn.addEventListener("click", () => {
    void sendPrompt();
  });

  promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void sendPrompt();
    }
  });

  promptInput.addEventListener("beforeinput", (event) => {
    if (event.inputType !== "insertLineBreak") return;
    const enterSends = localStorage.getItem("cursor-mobile-enter-sends") === "1";
    if (!enterSends) return;
    event.preventDefault();
    void sendPrompt();
  });
}

function bindMode() {
  modeSelect.addEventListener("change", () => {
    const followup = modeSelect.value === "followup";
    agentPanel.classList.toggle("hidden", !followup);
    if (followup) updateAgentLink();
  });
  agentSelect.addEventListener("change", updateAgentLink);
}

async function bootApp() {
  app.classList.remove("hidden");
  bindMode();
  bindSendInteractions();

  clearBtn.addEventListener("click", () => {
    promptInput.value = "";
    promptInput.focus();
  });
  refreshAgents.addEventListener("click", () => {
    void loadAgents().catch((err) => setStatus("bad", err.message));
  });

  try {
    await loadHealth();
    await loadAgents();
  } catch (err) {
    if (err.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      gate.classList.remove("hidden");
      app.classList.add("hidden");
      return;
    }
    setStatus("bad", err.message);
    showResult({ error: err.message });
  }
}

async function tryBootWithToken() {
  const saved = getToken();
  if (!saved) {
    gate.classList.remove("hidden");
    return;
  }
  await bootApp();
}

gateSubmit.addEventListener("click", async () => {
  const value = normalizeToken(gateToken.value);
  if (!value) {
    gateError.textContent = "请输入口令";
    gateError.classList.remove("hidden");
    return;
  }
  setToken(value);
  gateError.classList.add("hidden");
  try {
    await api("/api/health");
    gate.classList.add("hidden");
    await bootApp();
  } catch (err) {
    localStorage.removeItem(TOKEN_KEY);
    gateError.textContent = (err.message || "口令错误") + "。请只输入等号后面的值，例如 shikimori-phone-cursor-2026";
    gateError.classList.remove("hidden");
  }
});

const urlToken = normalizeToken(new URL(window.location.href).searchParams.get("token"));
if (urlToken) {
  setToken(urlToken);
  if (window.history.replaceState) {
    const clean = new URL(window.location.href);
    clean.searchParams.delete("token");
    window.history.replaceState({}, "", clean.pathname + clean.search + clean.hash);
  }
}

void tryBootWithToken();
