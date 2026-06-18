import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const ENV_PATH = path.join(__dirname, ".env");
const CURSOR_API = "https://api.cursor.com";

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

const envFile = loadEnv(ENV_PATH);
const config = {
  apiKey: process.env.CURSOR_API_KEY || envFile.CURSOR_API_KEY || "",
  agentTarget: (process.env.AGENT_TARGET || envFile.AGENT_TARGET || "local").toLowerCase(),
  workerName: process.env.WORKER_NAME || envFile.WORKER_NAME || "shikimori-desktop",
  workerDir: process.env.WORKER_DIR || envFile.WORKER_DIR || "",
  repoUrl: process.env.CURSOR_REPO_URL || envFile.CURSOR_REPO_URL || "",
  repoBranch: process.env.CURSOR_REPO_BRANCH || envFile.CURSOR_REPO_BRANCH || "main",
  accessToken: process.env.ACCESS_TOKEN || envFile.ACCESS_TOKEN || "",
  port: Number(process.env.PORT || envFile.PORT || 4789),
  host: process.env.HOST || envFile.HOST || "0.0.0.0",
};

function buildCreateAgentPayload(body) {
  const text = String(body.text || "").trim();
  const target = String(body.target || config.agentTarget).toLowerCase();

  if (target === "local") {
    return {
      prompt: { text },
      env: {
        type: "machine",
        name: body.workerName || config.workerName,
      },
    };
  }

  const payload = {
    prompt: { text },
    repos: [
      {
        url: body.repoUrl || config.repoUrl,
        startingRef: body.branch || config.repoBranch,
      },
    ],
  };
  if (body.autoCreatePR === true) payload.autoCreatePR = true;
  if (body.modelId) payload.model = { id: body.modelId };
  return payload;
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function unauthorized(res) {
  json(res, 401, { error: "未授权：请在请求头带上正确的 access token" });
}

function normalizeToken(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (value.toLowerCase().startsWith("access_token=")) {
    value = value.slice("access_token=".length).trim();
  }
  return value.replace(/^['"]|['"]$/g, "");
}

function checkAuth(req) {
  if (!config.accessToken) return true;
  const header = req.headers.authorization || "";
  const bearer = normalizeToken(header.startsWith("Bearer ") ? header.slice(7) : header);
  const query = normalizeToken(new URL(req.url, "http://local").searchParams.get("token") || "");
  const expected = normalizeToken(config.accessToken);
  return bearer === expected || query === expected;
}

async function cursorFetch(pathname, options = {}) {
  if (!config.apiKey) {
    throw new Error("未配置 CURSOR_API_KEY，请编辑 tools/cursor-mobile/.env");
  }
  const auth = Buffer.from(`${config.apiKey}:`).toString("base64");
  const res = await fetch(`${CURSOR_API}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message = data?.error?.message || data?.message || data?.raw || res.statusText;
    const err = new Error(message || `Cursor API ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function serveStatic(req, res) {
  const url = new URL(req.url, "http://local");
  let rel = url.pathname === "/" ? "/index.html" : url.pathname;
  if (!rel.startsWith("/") || rel.includes("..")) {
    json(res, 400, { error: "非法路径" });
    return;
  }
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    json(res, 404, { error: "未找到页面" });
    return;
  }
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://local");

  const isPublicAsset =
    url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname === "/app.css" ||
    url.pathname === "/app.js";

  if (req.method === "GET" && isPublicAsset) {
    serveStatic(req, res);
    return;
  }

  if (!checkAuth(req)) return unauthorized(res);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      json(res, 200, {
        ok: true,
        hasApiKey: Boolean(config.apiKey),
        agentTarget: config.agentTarget,
        workerName: config.workerName,
        workerDir: config.workerDir,
        repoUrl: config.repoUrl,
        repoBranch: config.repoBranch,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/agents") {
      const limit = url.searchParams.get("limit") || "15";
      const data = await cursorFetch(`/v1/agents?limit=${encodeURIComponent(limit)}`);
      json(res, 200, data);
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/agents/") && url.pathname.endsWith("/runs")) {
      const parts = url.pathname.split("/");
      const agentId = parts[3];
      const limit = url.searchParams.get("limit") || "5";
      const data = await cursorFetch(`/v1/agents/${encodeURIComponent(agentId)}/runs?limit=${encodeURIComponent(limit)}`);
      json(res, 200, data);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/agents") {
      const body = await readBody(req);
      const text = String(body.text || "").trim();
      if (!text) return json(res, 400, { error: "指令不能为空" });

      const payload = buildCreateAgentPayload(body);
      try {
        const data = await cursorFetch("/v1/agents", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        json(res, 200, data);
      } catch (err) {
        const code = err.data?.error?.code || err.data?.details?.error?.code;
        if (code === "feature_unavailable" && config.agentTarget === "local") {
          json(res, err.status || 403, {
            error:
              "你的 Cursor 账号暂不支持通过 API 触发本机 worker。请改用 remote-agent（本机 Cursor CLI）或去 cursor.com/agents 手动选择本机机器。",
            hint: "运行 .\\tools\\cursor-mobile\\start-remote-agent.ps1 -Tailscale",
            workerName: config.workerName,
            workerDir: config.workerDir,
            details: err.data || null,
          });
          return;
        }
        throw err;
      }
      return;
    }

    if (req.method === "POST" && /^\/api\/agents\/[^/]+\/runs$/.test(url.pathname)) {
      const agentId = url.pathname.split("/")[3];
      const body = await readBody(req);
      const text = String(body.text || "").trim();
      if (!text) return json(res, 400, { error: "跟进指令不能为空" });

      const data = await cursorFetch(`/v1/agents/${encodeURIComponent(agentId)}/runs`, {
        method: "POST",
        body: JSON.stringify({ prompt: { text } }),
      });
      json(res, 200, data);
      return;
    }

    json(res, 404, { error: "未知接口" });
  } catch (err) {
    json(res, err.status || 500, {
      error: err.message || "服务器错误",
      details: err.data || null,
    });
  }
});

server.listen(config.port, config.host, () => {
  const lanHint = config.host === "0.0.0.0" ? `局域网: http://<你的电脑IP>:${config.port}` : `本机: http://127.0.0.1:${config.port}`;
  console.log("Cursor 手机中继已启动");
  console.log(lanHint);
  if (config.accessToken) {
    console.log(`访问口令已启用。首次打开页面会要求输入 token。`);
  }
  if (!config.apiKey) {
    console.log("警告: 尚未配置 CURSOR_API_KEY，请复制 .env.example 为 .env 并填写。");
  }
});
