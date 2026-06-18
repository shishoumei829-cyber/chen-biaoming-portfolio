'use strict';

const {
  callWorkBrain,
  dialogueToMessages,
  isWorkBrainEnabled,
  pipeWorkStreamToSse,
} = require('./workBrain');
const { stripChatMarkdown } = require('../cognitive/replyAlign');

function stripModelThinking(raw) {
  return String(raw || '')
    .replace(/\u003credacted_thinking\u003e[\s\S]*?\u003c\/redacted_thinking\u003e/gi, '')
    .replace(/\u003cthink\u003e[\s\S]*?\u003c\/think\u003e/gi, '')
    .replace(/\u003credacted_thinking\u003e[\s\S]*$/gi, '')
    .trim();
}

function finalizeWorkReply(text) {
  return stripChatMarkdown(stripModelThinking(text));
}

/**
 * /chat 工作脑分支
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {object} ctx
 */
async function handleWorkBrainChat(req, res, ctx) {
  const skillBlock = ctx.skillBlock || '';
  if (skillBlock) {
    console.log(`[skills] 工作脑注入技能块 ${skillBlock.length} 字`);
  }
  if (!isWorkBrainEnabled()) {
    const msg = '工作脑未配置：在环境变量设置 AMADEUS_WORK_BRAIN=gemini 与 AMADEUS_GEMINI_API_KEY（见 env.example）';
    if (ctx.useStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }
    return res.status(503).json({ error: msg, brain: 'work', ok: false });
  }

  const useStream = ctx.useStream === true;
  const maxTok = Number.isFinite(ctx.maxTok) ? ctx.maxTok : undefined;
  const temp = Number.isFinite(ctx.temp) ? ctx.temp : 0.35;
  const messages = dialogueToMessages(ctx.dialogue, ctx.userContent);

  console.log(`[work-brain] provider route messages=${messages.length} stream=${useStream}`);

  try {
    const result = await callWorkBrain({
      messages,
      systemExtra: skillBlock,
      temperature: temp,
      maxTokens: maxTok,
      stream: useStream,
    });

    if (result.stream) {
      return pipeWorkStreamToSse(result.provider, result.response, res, (full) => {
        const content = finalizeWorkReply(full);
        if (typeof ctx.onAssistantReply === 'function') ctx.onAssistantReply(content);
      });
    }

    const content = finalizeWorkReply(result.text);
    if (typeof ctx.onAssistantReply === 'function') ctx.onAssistantReply(content);

    return res.json({
      response: content,
      brain: 'work',
      provider: result.provider,
      choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content } }],
    });
  } catch (err) {
    console.error('[work-brain]', err.message);
    if (useStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }
    return res.status(502).json({ error: err.message, brain: 'work', ok: false });
  }
}

module.exports = { handleWorkBrainChat, finalizeWorkReply };
