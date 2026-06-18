'use strict';

(function () {
  const DA = window.DA;
  const path = location.pathname;

  if (window.digitalArk?.isDesktop) document.body.classList.add('da-desktop');

  const SUB_PAGES = [2, 3, 4, 5, 6];
  let trainingSetupReady = false;
  let trainingSetupCache = null;
  const SUB_TITLES = {
    2: '音色训练',
    3: '记忆训练',
    4: '关系训练',
    5: '情感训练',
    6: '认知训练'
  };

  function installNavChrome(pageIndex) {
    const nav = document.querySelector('.bottom-nav');
    const topbar = document.querySelector('.topbar');
    const isSub = SUB_PAGES.includes(pageIndex);
    if (nav) nav.style.display = isSub ? 'none' : '';
    if (topbar) topbar.style.display = isSub ? 'none' : '';

    SUB_PAGES.forEach(i => {
      const page = document.getElementById('p' + i);
      if (!page) return;
      let bar = page.querySelector('.da-subhead');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'da-subhead';
        bar.innerHTML = '<button type="button" class="da-back" aria-label="返回训练"><span class="mi">arrow_back</span>返回</button><span class="da-subhead-title"></span>';
        page.insertBefore(bar, page.firstChild);
        bar.querySelector('.da-back').onclick = () => window.go(1);
      }
      const title = bar.querySelector('.da-subhead-title');
      if (title) title.textContent = SUB_TITLES[i] || '训练';
    });
  }

  function wireMemoryTagsAndPhoto(p3, memTa) {
    if (!p3 || p3.dataset.memExtrasWired) return;
    p3.dataset.memExtrasWired = '1';
    const chipHost = p3.querySelector('.da-mem-tags');
    const addChip = chipHost?.querySelector('.chip-add');
    addChip?.addEventListener('click', () => {
      const tag = window.prompt('添加记忆标签');
      if (!tag?.trim()) return;
      const span = document.createElement('span');
      span.className = 'chip chip-g da-mem-tag';
      span.textContent = tag.trim();
      chipHost.insertBefore(span, addChip);
    });
    const uploadBtn = p3.querySelector('.da-mem-upload-btn');
    if (uploadBtn && !p3.querySelector('#daMemPhotoInput')) {
      const fi = document.createElement('input');
      fi.type = 'file';
      fi.id = 'daMemPhotoInput';
      fi.accept = 'image/*';
      fi.hidden = true;
      p3.appendChild(fi);
      uploadBtn.addEventListener('click', () => fi.click());
      fi.addEventListener('change', () => {
        const f = fi.files?.[0];
        if (!f) return;
        if (f.size > 4 * 1024 * 1024) { DA.toast('图片请小于 4MB', 'error'); return; }
        const reader = new FileReader();
        reader.onload = () => {
          p3.dataset.memPhoto = reader.result;
          DA.toast('照片已附加（提交记忆时一并保存）');
        };
        reader.readAsDataURL(f);
      });
    }
    p3._collectMemoryExtras = () => ({
      tags: [...(chipHost?.querySelectorAll('.da-mem-tag') || [])].map(el => el.textContent.trim()),
      photos: p3.dataset.memPhoto ? [p3.dataset.memPhoto] : []
    });
  }

  function wrapGo(origGo, onPage) {
    return function (i) {
      if (SUB_PAGES.includes(i) && !trainingSetupReady) {
        showTrainingSetupWizard();
        return;
      }
      origGo(i);
      installNavChrome(i);
      onPage(i);
    };
  }

  async function refreshTrainingSetupState() {
    const r = await DA.refreshTrainingSetupState();
    if (r.success) {
      trainingSetupCache = r.data;
      trainingSetupReady = !!r.data.setup_complete;
      window.DAAvatar?.applyAll(trainingSetupCache);
      applyHomeHeroAvatar();
    }
    updateTrainingUiGate();
    return r;
  }

  window.daApplyHomeHeroAvatar = function () {
    const img = document.querySelector('.da-home-shell .da-home-hero-orb img');
    if (img && window.DAAvatar) {
      window.DAAvatar.applyImg(img, window.DAAvatar.resolveId(trainingSetupCache));
    }
  };

  function applyHomeHeroAvatar() {
    window.daApplyHomeHeroAvatar();
  }

  function updateTrainingUiGate() {
    document.querySelectorAll('.da-module-list .module-row, #p1 .module-row').forEach(btn => {
      btn.classList.toggle('da-module-locked', !trainingSetupReady);
      btn.setAttribute('aria-disabled', trainingSetupReady ? 'false' : 'true');
    });
    const chatInput = document.querySelector('#p0 input[type="text"]');
    if (chatInput && (path.includes('training') || path.includes('sanctuary'))) {
      chatInput.placeholder = trainingSetupReady
        ? (chatInput.dataset.phReady || '和数字分身说点什么…')
        : '请先填写您的称呼';
      chatInput.disabled = !trainingSetupReady;
    }
  }

  function wireModuleRowsGate() {
    document.querySelectorAll('#p1 .module-row[onclick]').forEach(btn => {
      const m = btn.getAttribute('onclick')?.match(/go\((\d+)\)/);
      if (!m) return;
      const target = Number(m[1]);
      btn.removeAttribute('onclick');
      btn.addEventListener('click', () => {
        if (SUB_PAGES.includes(target) && !trainingSetupReady) {
          showTrainingSetupWizard();
          return;
        }
        window.go(target);
      });
    });
  }

  function openAvatarPicker() {
    if (!window.DAAvatar) return;
    window.DAAvatar.showPickerSheet({
      selectedId: window.DAAvatar.resolveId(trainingSetupCache),
      onSave: async (id) => {
        const av = window.DAAvatar.presetPayload(id);
        const r = await DA.saveTrainingSetup({
          ...av,
          setup_complete: trainingSetupCache?.setup_complete ?? true
        });
        if (!r.success) {
          DA.toast(r.error || '保存失败', 'error');
          return;
        }
        await refreshTrainingSetupState();
        renderHomeTraining(document.getElementById('p0'));
        DA.toast('分身形象已更新');
      }
    });
  }

  function showTrainingSetupWizard() {
    let overlay = document.getElementById('daSetupOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'daSetupOverlay';
      overlay.className = 'da-setup-overlay';
      document.body.appendChild(overlay);
    }
    overlay.className = 'da-setup-overlay';
    overlay.style.display = 'flex';
    renderSetupForm(overlay);
  }

  function renderSetupForm(overlay) {
    const draft = trainingSetupCache || {};
    const relTypes = trainingSetupCache?.relationship_types || {};
    const keyPeople = [...(draft.key_people || [])];
    const typeOpts = Object.entries(relTypes).map(([k, v]) =>
      `<option value="${k}">${v.label}</option>`
    ).join('');
    const esc = s => String(s || '').replace(/"/g, '&quot;');

    overlay.innerHTML = `
      <div class="da-setup-sheet" role="dialog" aria-labelledby="daSetupTitle">
        <button type="button" class="da-setup-close" aria-label="关闭">×</button>
        <div class="da-setup-hero">
          <div class="da-setup-avatar"><span class="mi">face_3</span></div>
          <h2 id="daSetupTitle">创建您的数字分身</h2>
          <p>您就是训练者本人。填写称呼后，7 日题目会围绕<strong>您的生活与表达习惯</strong>生成。</p>
        </div>
        <div class="da-setup-form">
          <label class="da-setup-label">怎么称呼您 <span class="req">*</span></label>
          <input type="text" class="da-setup-field" id="daSetupName" placeholder="例如：小明、张先生"
            value="${esc(draft.subject_name || draft.trainer_name)}" autocomplete="name"/>
          <label class="da-setup-label">分身形象 <span class="req">*</span></label>
          <div class="da-avatar-pick-row da-setup-avatar-pick">${window.DAAvatar?.pickerMarkup(draft.avatar_preset || (draft.subject_gender === 'female' ? 'f' : draft.subject_gender === 'male' ? 'm' : '')) || ''}</div>
          <label class="da-setup-label">一句话介绍自己 <span class="opt">选填</span></label>
          <textarea class="da-setup-field" id="daSetupBrief" rows="2"
            placeholder="性格、职业或生活状态，帮助分身更像您">${draft.subject_brief || ''}</textarea>
          <details class="da-setup-details">
            <summary>生命里的重要的人 <span class="opt">选填 · 关系题会用上</span></summary>
            <div id="daSetupPeopleList" class="da-setup-people"></div>
            <div class="da-setup-add-row">
              <input type="text" class="da-setup-field" id="daSetupPersonName" placeholder="姓名"/>
              <select class="da-setup-field" id="daSetupPersonType">${typeOpts}</select>
              <button type="button" class="da-setup-add-btn" id="daSetupAddPerson">添加</button>
            </div>
          </details>
          <button type="button" class="da-btn-primary" id="daSetupSubmit">开始 7 日训练</button>
          <button type="button" class="da-setup-demo-link" id="daSetupDemo">先体验演示：艾莉莎（预置角色）</button>
        </div>
      </div>`;

    const sheet = overlay.querySelector('.da-setup-sheet');
    const renderPeople = () => {
      const list = overlay.querySelector('#daSetupPeopleList');
      if (!list) return;
      list.innerHTML = keyPeople.length
        ? keyPeople.map((p, i) => `<span class="da-setup-person-chip">${p.name}（${relTypes[p.type]?.label || p.type}）
          <button type="button" data-i="${i}" class="da-rm-person" aria-label="移除">×</button></span>`).join('')
        : '<p class="da-setup-empty">尚未添加，可跳过</p>';
      list.querySelectorAll('.da-rm-person').forEach(b => {
        b.onclick = () => { keyPeople.splice(Number(b.dataset.i), 1); renderPeople(); };
      });
    };
    renderPeople();

    let setupAvatarPreset = draft.avatar_preset || (draft.subject_gender === 'female' ? 'f' : draft.subject_gender === 'male' ? 'm' : '');
    window.DAAvatar?.wirePicker(overlay.querySelector('.da-setup-avatar-pick'), {
      selectedId: setupAvatarPreset,
      onChange: id => { setupAvatarPreset = id; }
    });

    overlay.querySelector('.da-setup-close')?.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
    sheet?.addEventListener('click', e => e.stopPropagation());

    overlay.querySelector('#daSetupAddPerson')?.addEventListener('click', () => {
      const name = overlay.querySelector('#daSetupPersonName')?.value?.trim();
      const type = overlay.querySelector('#daSetupPersonType')?.value || 'friend';
      if (!name) { DA.toast('请填写姓名'); return; }
      keyPeople.push({ name, type });
      overlay.querySelector('#daSetupPersonName').value = '';
      renderPeople();
    });

    overlay.querySelector('#daSetupDemo')?.addEventListener('click', async () => {
      const r = await DA.enableDemoSetup();
      if (r.success) {
        await refreshTrainingSetupState();
        overlay.style.display = 'none';
        renderGuideHub();
        renderHomeTraining(document.getElementById('p0'));
        DA.toast('已进入演示模式');
      }
    });

    overlay.querySelector('#daSetupSubmit')?.addEventListener('click', async () => {
      const name = overlay.querySelector('#daSetupName')?.value?.trim();
      if (!name) { DA.toast('请填写您的称呼', 'error'); overlay.querySelector('#daSetupName')?.focus(); return; }
      if (!setupAvatarPreset) { DA.toast('请选择分身形象', 'error'); return; }
      const av = window.DAAvatar?.presetPayload(setupAvatarPreset) || {};
      trainingSetupCache = {
        mode: 'self',
        subject_name: name,
        trainer_name: name,
        trainer_role: 'self',
        subject_brief: overlay.querySelector('#daSetupBrief')?.value?.trim() || '',
        key_people: keyPeople,
        ...av
      };
      await finishSetup(overlay);
    });

    setTimeout(() => overlay.querySelector('#daSetupName')?.focus(), 80);
  }

  async function finishSetup(overlay) {
    const payload = {
      mode: 'self',
      subject_name: trainingSetupCache.subject_name,
      subject_brief: trainingSetupCache.subject_brief || '',
      trainer_name: trainingSetupCache.trainer_name || trainingSetupCache.subject_name,
      trainer_role: 'self',
      key_people: trainingSetupCache.key_people || [],
      subject_gender: trainingSetupCache.subject_gender || '',
      avatar_preset: trainingSetupCache.avatar_preset || '',
      setup_complete: true
    };
    const btn = overlay?.querySelector('#daSetupSubmit');
    if (btn) { btn.disabled = true; btn.textContent = '保存中…'; }
    const r = await DA.saveTrainingSetup(payload);
    if (btn) { btn.disabled = false; btn.textContent = '开始 7 日训练'; }
    if (!r.success) { DA.toast(r.error || '保存失败', 'error'); return; }
    if (!r.data?.setup_complete) {
      DA.toast('设定未生效，请确认已填写称呼', 'error');
      return;
    }
    await refreshTrainingSetupState();
    overlay.style.display = 'none';
    await renderGuideHub();
    if (path.includes('sanctuary') || path.includes('training')) renderHomeTraining(document.getElementById('p0'));
    updateTrainingUiGate();
    DA.toast('欢迎，' + (payload.subject_name || '') + '！可以开始情境答题了');
  }

  async function refreshProgress(root) {
    const data = await DA.loadProgress();
    DA.applyProgress(data, root || document);
    return data;
  }

  function ensureGuideBar(page) {
    let bar = page.querySelector('.da-guide-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'da-guide-bar card-w';
      bar.style.cssText = 'margin:0 24px 12px;padding:14px 16px;';
      const anchor = page.querySelector('.da-subhead') || page.querySelector('.pc');
      if (page.querySelector('.da-subhead')) page.querySelector('.da-subhead').after(bar);
      else anchor?.prepend(bar);
    }
    return bar;
  }

  function guideDayLabel(t) {
    if (!t) return '';
    if (t.rotation) return `巩固训练 · 轮播题`;
    return `第 ${t.day} 天 · ${t.day_title || '训练引导'}`;
  }

  const MOD_ICON = {
    voice: { icon: 'settings_voice', cls: 'da-mod-voice' },
    memory: { icon: 'history_edu', cls: 'da-mod-memory' },
    relationship: { icon: 'diversity_3', cls: 'da-mod-relationship' },
    emotion: { icon: 'favorite', cls: 'da-mod-emotion' },
    cognition: { icon: 'bolt', cls: 'da-mod-cognition' }
  };

  function modIconHtml(module) {
    const m = MOD_ICON[module] || MOD_ICON.memory;
    return `<div class="da-guide-module-icon ${m.cls}"><span class="mi">${m.icon}</span></div>`;
  }

  function guideSkipNoteHtml() {
    return `<p class="da-skip-note t-body-sm" style="color:#767872;margin:8px 0 0;">针对<strong>上面这个情境</strong>想不起来？点「没印象，跳过」会换<strong>下一道训练题</strong>（可能是别的场景），进度照常推进，以后可回来补。</p>`;
  }

  function appendGuideSkipBar(bar, module, afterSkip) {
    if (!bar || bar.querySelector('.da-guide-skip-bar')) return;
    const wrap = document.createElement('div');
    wrap.className = 'da-guide-skip-bar';
    wrap.style.cssText = 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center;';
    wrap.innerHTML = `<button type="button" class="btn-o da-module-skip">没印象，跳过</button>`;
    bar.appendChild(wrap);
    wrap.querySelector('.da-module-skip')?.addEventListener('click', async () => {
      const btn = wrap.querySelector('.da-module-skip');
      btn.disabled = true;
      btn.textContent = '跳过中…';
      const ok = await DA.skipGuideTask({ module });
      btn.disabled = false;
      btn.textContent = '没印象，跳过';
      if (ok && afterSkip) await afterSkip();
    });
  }

  /** 教练层：为什么做、怎么答、示例、避免什么 */
  function renderCoachBlock(t) {
    if (!t?.purpose && !t?.steps?.length) return '';
    let html = '<div class="da-coach">';
    if (t.coach_headline) html += `<p class="t-label" style="margin-bottom:8px;">${t.coach_headline}</p>`;
    if (t.purpose) html += `<p class="da-coach-purpose"><strong>为什么做这题：</strong>${t.purpose}</p>`;
    if (t.steps?.length) {
      html += '<p class="t-label" style="margin-bottom:4px;">怎么答</p><ol class="da-coach-steps">';
      t.steps.forEach(s => { html += `<li>${s}</li>`; });
      html += '</ol>';
    }
    if (t.example) html += `<p class="t-body-sm" style="margin-bottom:6px;"><strong>示例：</strong><em style="color:#596059;">${t.example}</em></p>`;
    if (t.avoid) html += `<p class="t-body-sm" style="color:#7a5c3a;"><span class="mi" style="font-size:14px;vertical-align:middle;">warning</span> 避免：${t.avoid}</p>`;
    if (t.cta) html += `<p class="t-label" style="margin-top:10px;color:#596059;">${t.cta}</p>`;
    html += '</div>';
    return html;
  }

  async function applyModuleGuide(module) {
    const pageMap = { voice: 'p2', memory: 'p3', relationship: 'p4', emotion: 'p5', cognition: 'p6' };
    const page = document.getElementById(pageMap[module]);
    if (!page) return;
    const r = await DA.fetchModuleGuide(module);
    if (!r.success) return;
    const t = r.data;
    const bar = ensureGuideBar(page);
    if (t.setup_required) {
      bar.innerHTML = `<span class="t-label">需要身份设定</span><p class="t-body-sm">${t.message}</p>
        <button type="button" class="btn-o da-open-setup" style="margin-top:8px;">去设定</button>`;
      bar.querySelector('.da-open-setup')?.addEventListener('click', showTrainingSetupWizard);
      return;
    }
    if (t.all_done || t.locked) {
      bar.innerHTML = `<span class="t-label">${guideDayLabel(t)}</span><p class="t-body-sm">${t.message}</p>`;
      if (t.coach_purpose) bar.innerHTML += renderCoachBlock({ purpose: t.coach_purpose });
      return;
    }
    bar.innerHTML = `<span class="t-label">${guideDayLabel(t)}${t.rotation ? ' · 轮播' : ''}</span>`;
    bar.innerHTML += renderCoachBlock(t);

    if (module === 'voice') {
      bar.innerHTML += `<p class="t-body-sm" style="margin-top:6px;">${t.hint || ''}</p>`;
      const litEl = page.querySelector('.da-voice-text');
      if (litEl && t.literary_text) litEl.textContent = `"${t.literary_text}"`;
      const hintEl = page.querySelector('.da-voice-hint');
      if (hintEl && t.hint) hintEl.textContent = t.hint;
    }

    if (module === 'memory') {
      const promptEl = page.querySelector('.da-mem-prompt');
      if (promptEl && t.prompt) promptEl.textContent = `"${t.prompt}"`;
      const memTa = page.querySelector('.da-mem-input');
      if (memTa && t.prompt) memTa.placeholder = (t.answer_guide && t.answer_guide[0]) || t.hint || (t.prompt + '…');
      const tierSel = document.getElementById('daMemTier');
      if (tierSel && t.tier) tierSel.value = t.tier;
      // 隐藏与引导重复的静态占位
      page.querySelectorAll('.da-static-mem').forEach(el => { el.style.display = 'none'; });
      bar.innerHTML += `<p class="t-body" style="margin-top:10px;font-weight:600;line-height:1.45;">${t.prompt}</p>`;
    }

    if (module === 'relationship') {
      const titleEl = page.querySelector('.da-rel-title');
      if (titleEl && t.scene) titleEl.textContent = t.scene;
      const labelEl = page.querySelector('.da-rel-label');
      if (labelEl && (t.scenario || t.scene)) labelEl.textContent = '当前场景：' + (t.scenario || t.scene);
      const detailEl = page.querySelector('.da-rel-detail');
      if (detailEl && t.scene_detail) detailEl.textContent = `"${t.scene_detail}"`;
      else if (detailEl && t.scene) detailEl.textContent = `"${t.scene}"`;
      bar.innerHTML += `<p class="t-body" style="margin-top:10px;font-weight:600;">${t.scene}</p>`;
      if (t.scene_detail && t.scene_detail !== t.scene) {
        bar.innerHTML += `<p class="t-body-sm" style="margin-top:4px;color:#596059;">${t.scene_detail}</p>`;
      }
      if (t.choices?.length) {
        const host = page.querySelector('.da-rel-choices');
        if (host) {
          const choicesWrap = host.querySelector('.da-dynamic-choices') || (() => {
            const w = document.createElement('div');
            w.className = 'da-dynamic-choices';
            w.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:8px;';
            host.insertBefore(w, host.firstChild);
            return w;
          })();
          choicesWrap.innerHTML = '';
          t.choices.forEach((c, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice';
            btn.innerHTML = `<p class="t-body-sm" style="color:#1c1c18;margin-bottom:4px;">"${c.text}"</p><span class="t-label" style="color:#596059;font-size:10px;">${c.label}</span>`;
            btn.onclick = () => {
              choicesWrap.querySelectorAll('.choice').forEach(x => x.classList.remove('selected'));
              btn.classList.add('selected');
              const ta = page.querySelector('textarea');
              if (ta) ta.value = c.text;
              page.dataset.relType = c.type;
            };
            if (i === 0) page.dataset.relType = c.type;
            choicesWrap.appendChild(btn);
          });
        }
      }
    }

    if (module === 'emotion') {
      const label = page.querySelector('.da-emo-label');
      if (label && t.scenario) label.textContent = '当前场景：' + t.scenario;
      const sceneP = page.querySelector('.da-emo-scene');
      if (sceneP && t.hint) sceneP.textContent = t.hint;
      else if (sceneP && t.scenario) sceneP.textContent = t.scenario;
      bar.innerHTML += `<p class="t-body" style="margin-top:10px;font-weight:600;">${t.scenario}</p>`;
    }

    if (module === 'cognition' && t.question) {
      page.querySelector('.da-cog-static')?.style && (page.querySelector('.da-cog-static').style.display = 'none');
      page.querySelector('.da-conflict-list')?.style && (page.querySelector('.da-conflict-list').style.display = 'none');
      bar.innerHTML += `<p class="t-body" style="margin-top:8px;font-weight:600;">${t.question}</p>`;
      let cogWrap = page.querySelector('.da-guide-cog');
      if (!cogWrap) {
        cogWrap = document.createElement('div');
        cogWrap.className = 'da-guide-cog';
        cogWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:10px;';
        bar.appendChild(cogWrap);
      } else cogWrap.innerHTML = '';
      (t.options || []).forEach((opt, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-o';
        b.style.fontSize = '13px';
        b.textContent = opt;
        b.onclick = async () => {
          cogWrap.querySelectorAll('.btn-o').forEach(x => { x.disabled = true; });
          if (t.task_id) {
            const r2 = await DA.submitHomeTraining({
              module: 'cognition', task_id: t.task_id, content: opt, choice_index: i
            });
            if (r2.success) {
              DA.toast(r2.data?.feedback || '已提交');
              await afterGuideAction('cognition');
            } else DA.toast(r2.error || '提交失败', 'error');
          } else {
            DA.pickConflict(t.question + ' → ' + opt);
            cogWrap.querySelectorAll('.btn-o').forEach(x => x.style.borderColor = '#c6c7c0');
            b.style.borderColor = '#596059';
          }
          cogWrap.querySelectorAll('.btn-o').forEach(x => { x.disabled = false; });
        };
        cogWrap.appendChild(b);
      });
    }

    appendGuideSkipBar(bar, module, async () => {
      await afterGuideAction(module);
    });
  }

  async function afterGuideAction(module) {
    await DA.refreshGuideState(module);
    await refreshProgress();
    if (module) await applyModuleGuide(module);
    await renderGuideHub();
    if (typeof window.daReloadHomeGuided === 'function') await window.daReloadHomeGuided();
  }

  async function renderGuideHub() {
    const p1 = document.getElementById('p1');
    if (!p1) return;
    hideP1StaticPlaceholders();
    let hub = p1.querySelector('.da-guide-hub');
    if (!hub) {
      hub = document.createElement('div');
      hub.className = 'da-guide-hub card-w';
      p1.querySelector('.pc')?.prepend(hub);
    }
    const r = await DA.fetchGuideOverview();
    if (!r.success) return;
    const g = r.data;
    if (g.setup_required) {
      hub.innerHTML = `
        <div class="da-hub-body" style="padding-top:18px;">
          <div class="da-empty-card" style="border:none;box-shadow:none;">
            <span class="mi">face_3</span>
            <p style="font-weight:600;color:#1c1c18;margin-bottom:8px;">先创建您的数字分身</p>
            <p>只需填写您的称呼，系统会围绕您本人生成 7 日训练题目。</p>
            <button type="button" class="da-btn-primary" id="daOpenSetup" style="margin-top:14px;">填写基本信息</button>
          </div>
        </div>`;
      hub.querySelector('#daOpenSetup')?.addEventListener('click', showTrainingSetupWizard);
      return;
    }
    const pct = Math.round((g.progress?.ratio || 0) * 100);
    const today = g.today || {};
    const ctxLine = g.subject_name
      ? (g.trainer_role === 'self' || g.subject_name === g.trainer_name
        ? `${g.subject_name} 的数字分身${g.curriculum_mode === 'demo' ? ' · 演示' : ''}`
        : `为「${g.subject_name}」训练 · 记录者 ${g.trainer_name}${g.curriculum_mode === 'demo' ? ' · 演示' : ''}`)
      : '';
    const m2p = {voice:2, memory:3, relationship:4, emotion:5, cognition:6};
    const taskRows = (today.tasks || []).map(t => `
      <li class="da-hub-task ${t.done ? 'done' : ''}" ${t.module ? `onclick="window.go(${m2p[t.module]})" style="cursor:pointer;"` : ''}>
        <span class="da-hub-task-check">${t.done ? '✓' : ''}</span>
        <div>
          <div class="da-hub-task-label">${t.short_label}</div>
          ${!t.done && t.purpose ? `<div class="da-hub-task-purpose">${t.purpose.slice(0, 80)}${t.purpose.length > 80 ? '…' : ''}</div>` : ''}
        </div>
      </li>`).join('');
    const nextBtn = today.next
      ? `<button type="button" class="da-btn-primary da-start-next" data-page="${today.next.module_page}">继续训练 · ${today.next.module_label}</button>`
      : (g.phase === 'consolidation'
        ? '<p class="t-body-sm" style="margin-top:12px;text-align:center;color:#596059;">初训已完成，进入各维度巩固训练。</p>'
        : '<p class="t-body-sm" style="margin-top:12px;text-align:center;color:#596059;">今日题目已全部完成，将自动解锁下一天。</p>');

    hub.innerHTML = `
      <div class="da-hub-head">
        ${ctxLine ? `<p class="da-hub-context">${ctxLine}</p>` : ''}
        <div class="da-hub-row">
          <span class="da-hub-title">${g.title || '7日训练'}</span>
          <span class="da-hub-day">${g.phase === 'consolidation' ? '巩固期' : '第 ' + g.current_day + ' 天'}</span>
        </div>
        <div class="da-hub-progress">
          <div class="pbar-wrap"><div class="pbar-fill" style="width:${pct}%"></div></div>
          <div class="da-hub-progress-label">
            <span>今日任务 ${g.progress?.completed || 0}/${g.progress?.total || 0}</span>
            <span>${pct}%</span>
          </div>
        </div>
      </div>
      <div class="da-hub-body">
        ${today.intro ? `<p class="da-hub-intro">${today.intro}</p>` : ''}
        ${taskRows ? `<p class="da-hub-checklist-title">今日清单 · ${today.day_title || ''}</p><ul style="list-style:none;margin:0;padding:0;">${taskRows}</ul>` : ''}
        ${nextBtn}
        <div class="da-hub-days">${(g.days || []).map(d =>
          `<span class="chip da-hub-day-chip ${d.current ? 'chip-s' : d.locked ? 'chip-o' : 'chip-g'}">第${d.day}天 ${d.done}/${d.total}</span>`
        ).join('')}</div>
      </div>`;
    hub.querySelector('.da-start-next')?.addEventListener('click', e => {
      const pg = Number(e.currentTarget.dataset.page);
      if (pg) window.go(pg);
    });
    await refreshProgress(p1);
  }

  const MODULE_BY_PAGE = { 2: 'voice', 3: 'memory', 4: 'relationship', 5: 'emotion', 6: 'cognition' };

  function onTrainingPage(i) {
    if (i === 1) renderGuideHub();
    if (MODULE_BY_PAGE[i]) applyModuleGuide(MODULE_BY_PAGE[i]);
  }

  function wireDragRows(container) {
    if (!container || container.dataset.dragWired) return;
    container.dataset.dragWired = '1';
    const rows = [...container.querySelectorAll('.drag-row')];
    rows.forEach(row => {
      row.draggable = true;
      row.addEventListener('dragstart', e => {
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', rows.indexOf(row));
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      row.addEventListener('drop', e => {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData('text/plain'));
        const to = rows.indexOf(row);
        if (from === to || from < 0) return;
        const parent = container;
        const dragged = rows[from];
        if (from < to) parent.insertBefore(dragged, rows[to].nextSibling);
        else parent.insertBefore(dragged, rows[to]);
        rows.splice(from, 1);
        rows.splice(to, 0, dragged);
      });
    });
  }

  function wireTrainingPages(onProgress) {
    const refresh = () => (onProgress ? onProgress() : refreshProgress());
    const afterSubmit = async (module) => afterGuideAction(module);

    // 音色 p2
    const p2 = document.getElementById('p2');
    const lit = p2?.querySelector('.da-voice-text')?.textContent?.replace(/[""「」]/g, '') || '';
    p2?.querySelector('.mic-record')?.addEventListener('click', () => DA.toggleRecord(p2.querySelector('.mic-record')));
    if (p2 && !p2.querySelector('.da-voice-submit')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-p da-voice-submit';
      btn.style.marginTop = '12px';
      btn.textContent = '提交语音样本';
      btn.onclick = async () => {
        const text = p2.querySelector('.da-voice-text')?.textContent?.replace(/[""「」]/g, '') || '';
        if (await DA.submitVoice(text)) afterSubmit('voice');
      };
      (p2.querySelector('.card:last-of-type') || p2.querySelector('.card-w') || p2.querySelector('.pc'))?.appendChild(btn);
    }

    refreshProgress().then(data => {
      if (!data?.blind_test?.ready) return;
      const host = document.querySelector('.da-overall-progress') || document.getElementById('p1')?.querySelector('.card-w');
      if (!host || host.querySelector('.da-blind-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-o da-blind-btn';
      btn.style.marginTop = '12px';
      btn.textContent = `发起盲测 (${Math.round(data.blind_test.next_milestone * 100)}%)`;
      btn.onclick = async () => {
        const r = await DA.api('POST', '/training/blind-tests/start', {
          milestone: data.blind_test.next_milestone,
          tester_name: '关系人'
        });
        if (r.success) {
          const score = prompt('关系人评分 1-10：', '8');
          if (score) {
            const sub = await DA.api('POST', '/training/blind-tests/submit', {
              session_id: r.data.id, score: Number(score)
            });
            DA.toast(sub.data?.passed ? '盲测通过' : '盲测未通过，请继续训练');
            refresh();
          }
        }
      };
      host.appendChild(btn);
    });

    // 记忆 p3
    const p3 = document.getElementById('p3');
    const memTa = p3?.querySelector('.da-mem-input');
    if (p3 && !p3.querySelector('.da-memory-extra')) {
      const extra = document.createElement('div');
      extra.className = 'da-memory-extra';
      extra.innerHTML = `
        <select id="daMemTier">
          <option value="core">核心记忆</option>
          <option value="relationship">关系记忆</option>
          <option value="daily">日常记忆</option>
          <option value="emotional">情绪记忆</option>
          <option value="shared">共同记忆</option>
          <option value="wish">未来愿望</option>
        </select>
        <input type="text" id="daMemTime" placeholder="时间（如 2008 年夏天）"/>
        <input type="text" id="daMemPlace" placeholder="地点"/>
        <input type="text" id="daMemPeople" placeholder="相关人物（逗号分隔）"/>
        <input type="text" id="daMemEmotion" placeholder="情感（如 温暖、怀念）"/>`;
      memTa?.before(extra);
    }
    wireMemoryTagsAndPhoto(p3, memTa);
    if (p3 && !p3.querySelector('.btn-p')) {
      const sb = document.createElement('button');
      sb.type = 'button';
      sb.className = 'btn-p';
      sb.style.marginTop = '14px';
      sb.textContent = '提交这段记忆';
      p3.querySelector('.pc')?.appendChild(sb);
    }
    const submitMemory = async () => {
      const people = document.getElementById('daMemPeople')?.value?.split(/[,，]/).map(s => s.trim()).filter(Boolean);
      const extras = p3?._collectMemoryExtras?.() || {};
      if (await DA.submitMemory(memTa?.value, {
        tier: document.getElementById('daMemTier')?.value || 'core',
        time: document.getElementById('daMemTime')?.value,
        place: document.getElementById('daMemPlace')?.value,
        people,
        emotion: document.getElementById('daMemEmotion')?.value,
        tags: extras.tags,
        photos: extras.photos
      })) {
        if (memTa) memTa.value = '';
        delete p3.dataset.memPhoto;
        p3.querySelectorAll('.da-mem-tag').forEach(el => el.remove());
        afterSubmit('memory');
      }
    };
    p3?.querySelector('.btn-p')?.addEventListener('click', submitMemory);
    p3?.querySelector('.da-mem-send-btn')?.addEventListener('click', submitMemory);
    p3?.querySelector('.da-mem-voice-btn')?.addEventListener('click', () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { DA.toast('不支持语音识别', 'error'); return; }
      const rec = new SR();
      rec.lang = 'zh-CN';
      rec.onresult = e => {
        if (memTa) memTa.value = (memTa.value + ' ' + e.results[0][0].transcript).trim();
        DA.toast('语音已填入');
      };
      rec.start();
      DA.toast('请说话…');
    });

    // 关系 p4
    const p4 = document.getElementById('p4');
    let relType = 'emotional';
    const relTa = p4?.querySelector('.da-rel-input');
    if (p4 && !p4.querySelector('.btn-p')) {
      const sb = document.createElement('button');
      sb.type = 'button';
      sb.className = 'btn-p';
      sb.style.marginTop = '12px';
      sb.textContent = '提交本次关系回应';
      p4.querySelector('.pc')?.appendChild(sb);
    }
    p4?.querySelector('.btn-p')?.addEventListener('click', async () => {
      const content = relTa?.value?.trim() || p4.querySelector('.choice.selected .t-body-sm')?.textContent?.trim();
      const type = p4.dataset.relType || relType;
      if (!content) {
        DA.toast('没有印象可点教练区「没印象，跳过」', 'error');
        return;
      }
      if (await DA.submitRelationship(type, content)) afterSubmit('relationship');
    });

    // 情感 p5
    const p5 = document.getElementById('p5');
    const emoInput = p5?.querySelector('.da-emo-input');
    p5?.querySelector('.btn-p')?.addEventListener('click', async () => {
      const text = emoInput?.value;
      if (!text?.trim()) {
        DA.toast('想不起可以点教练区「没印象，跳过」', 'error');
        return;
      }
      if (await DA.submitEmotion(text)) { if (emoInput) emoInput.value = ''; afterSubmit('emotion'); }
    });

    // 认知 p6
    const p6 = document.getElementById('p6');
    const dragHost = p6?.querySelector('.da-cog-drag-host');
    wireDragRows(dragHost);
    DA.api('GET', '/training/cognition/scenarios?_=' + Date.now()).then(r => {
      if (!r.success || !p6) return;
      const gt = DA.getGuideTask();
      if (gt?.module === 'cognition' && gt?.task_id && gt?.question) return;
      if (p6.querySelector('.da-conflict-list')) return;
      const list = r.data || [];
      if (!list.length) return;
      const wrap = document.createElement('div');
      wrap.className = 'da-conflict-list';
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:12px;max-height:160px;overflow-y:auto;';
      const label = document.createElement('p');
      label.className = 't-label';
      label.textContent = r.source === 'question-bank' ? '题库情境（自选参考，当前进度以教练区题目为准）' : '参考情境';
      wrap.appendChild(label);
      list.slice(0, 12).forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-o';
        b.style.fontSize = '12px';
        const txt = s.text || s.question || '';
        b.textContent = txt.slice(0, 36) + (txt.length > 36 ? '…' : '');
        b.title = txt;
        b.onclick = () => DA.pickConflict(txt);
        wrap.appendChild(b);
      });
      p6.querySelector('.da-cog-static')?.after(wrap);
    });
    if (p6 && !p6.querySelector('.btn-p')) {
      const sb = document.createElement('button');
      sb.type = 'button';
      sb.className = 'btn-p';
      sb.style.marginTop = '8px';
      sb.textContent = '提交价值排序';
      p6.querySelector('.pc')?.appendChild(sb);
    }
    p6?.querySelector('.btn-p')?.addEventListener('click', async () => {
      const values = [...p6.querySelectorAll('.drag-row .t-body')].map(el => el.textContent.trim());
      if (await DA.submitCognition(values)) afterSubmit('cognition');
    });

    p2?.addEventListener('dblclick', async () => {
      const text = p2.querySelector('.da-voice-text')?.textContent?.replace(/[""「」]/g, '') || '';
      if (await DA.submitVoice(text)) afterSubmit('voice');
    });
  }

  function wireProfileRows() {
    window.DAProfile?.installProfilePage?.();
    window.DAProfile?.installTopbar?.();
  }

  function wireChatPage(pageEl, opts) {
    const input = pageEl.querySelector('input[type="text"]');
    if (!input) return;
    let box = pageEl.querySelector('.da-chat-msgs');
    if (!box) {
      box = document.createElement('div');
      box.className = 'da-chat-msgs' + (opts.messageCards ? ' da-msg-cards' : '');
      input.closest('div[style*="width:100%"]')?.parentElement?.insertBefore(box, input.closest('div[style*="width:100%"]'));
      if (!box.parentElement) pageEl.querySelector('.pc')?.prepend(box) || pageEl.insertBefore(box, pageEl.firstChild);
    } else if (opts.messageCards) {
      box.classList.add('da-msg-cards');
    }
    const inputWrap = input.closest('div[style*="width:100%"]') || input.parentElement;
    const sendIcon = inputWrap?.querySelector('.mi-f, .mi[style*="send"]');
    sendIcon?.addEventListener('click', () => DA.sendChat(input, box, opts));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') DA.sendChat(input, box, opts);
    });
    pageEl.querySelector('.mic-record, button[style*="70px"]')?.addEventListener('click', () => {
      DA.startVoiceInput(input, box, opts);
    });

    pageEl.querySelectorAll('.btn-o, .btn-p').forEach(btn => {
      const t = btn.textContent.trim();
      if (t === '不像我') btn.onclick = () => lastFeedback(false);
      else if (t === '很像我') btn.onclick = () => lastFeedback(true);
      else if (t === '有点像') btn.onclick = () => lastPartialFeedback();
    });

    function lastPartialFeedback() {
      const last = [...DA.chatHistory].reverse().find(m => m.role === 'assistant' && !m.pending);
      if (last) DA.sendPartialFeedback(last.id);
    }

    function lastFeedback(like) {
      const last = [...DA.chatHistory].reverse().find(m => m.role === 'assistant' && !m.pending);
      if (!last) return;
      if (like) DA.sendFeedback(true, last.id);
      else DA.promptFeedbackCorrection(false, last.id, false);
    }
  }

  function initCompanionConsent() {
    const overlay = document.getElementById('daConsentOverlay');
    if (!overlay) return Promise.resolve(true);

    const uid = DA.getCompanionUserId();
    if (uid) {
      return DA.api('GET', '/companion/access?user_id=' + encodeURIComponent(uid)).then(r => {
        if (r.success && r.data?.allowed) {
          if (r.data.avatar_label) {
            const b = document.getElementById('daAvatarBadge');
            if (b) b.textContent = r.data.avatar_label;
          }
          return true;
        }
        DA.setCompanionUserId(null);
        return showConsentForm();
      }).catch(() => showConsentForm());
    }
    return showConsentForm();

    function showConsentForm() {
      return new Promise(resolve => {
        overlay.style.display = 'flex';
        overlay.classList.add('on');
        DA.api('GET', '/ethics/consent-text').then(r => {
          const c = r.data || {};
          overlay.innerHTML = `<div class="da-consent-card">
            <h2>${c.title || '使用前请知晓'}</h2>
            <p>${c.body || ''}</p>
            <input type="text" id="daConsentName" placeholder="请输入您的姓名（需与训练者授权一致）"/>
            <label><input type="checkbox" id="daConsentCheck"/> ${c.checkbox || '我理解这是数字分身'}</label>
            <button type="button" class="primary" id="daConsentBtn" disabled>进入陪护端</button>
          </div>`;
          const check = overlay.querySelector('#daConsentCheck');
          const btn = overlay.querySelector('#daConsentBtn');
          check?.addEventListener('change', () => { btn.disabled = !check.checked; });
          btn?.addEventListener('click', async () => {
            const name = overlay.querySelector('#daConsentName')?.value?.trim();
            if (!name) { DA.toast('请输入姓名', 'error'); return; }
            const idRes = await DA.api('POST', '/companion/identify', { name });
            if (!idRes.success) { DA.toast(idRes.error || '未授权', 'error'); return; }
            const cons = await DA.api('POST', '/companion/consent', {
              user_id: idRes.data.user_id, user_name: name, accepted: true
            });
            if (!cons.success) { DA.toast(cons.error || '同意失败', 'error'); return; }
            DA.setCompanionUserId(idRes.data.user_id);
            overlay.style.display = 'none';
            overlay.classList.remove('on');
            const b = document.getElementById('daAvatarBadge');
            if (b) b.textContent = c.avatar_label || '数字分身';
            resolve(true);
          });
        });
      });
    }
  }

  function initTrainingEthics() {
    const p1 = document.getElementById('p1');
    if (path.includes('training') && p1 && !p1.querySelector('.da-light-panel')) {
      const panel = document.createElement('div');
      panel.className = 'da-light-panel';
      panel.innerHTML = `
        <p class="t-body" style="font-weight:600;margin-bottom:8px;">随手记</p>
        <p class="t-body-sm" style="margin-bottom:8px;">不必正式，一行字、一段语音的想法都可以。</p>
        <textarea id="daLightNote" placeholder="现在想到的一件事…"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button type="button" class="btn-p" id="daLightSave" style="flex:1;padding:10px;border:none;border-radius:99px;background:#596059;color:#fff;">保存随手记</button>
          <button type="button" class="btn-o" id="daStopToday" style="flex:1;padding:10px;">今天到此为止</button>
        </div>`;
      p1.querySelector('.pc')?.appendChild(panel);
      panel.querySelector('#daLightSave')?.addEventListener('click', async () => {
        const v = document.getElementById('daLightNote')?.value;
        if (await DA.submitLightweightNote(v)) {
          document.getElementById('daLightNote').value = '';
          refreshProgress();
        }
      });
      panel.querySelector('#daStopToday')?.addEventListener('click', () => DA.stopTrainingForToday());
    }

    const p7 = document.getElementById('p7');
    if (p7 && !p7.querySelector('.da-ethics-panel')) {
      const ep = document.createElement('div');
      ep.className = 'da-ethics-panel card-w';
      ep.innerHTML = `
        <p class="t-body" style="font-weight:600;">隐私与授权</p>
        <input type="text" id="daTraineeName" placeholder="训练者显示名"/>
        <button type="button" class="btn-o" id="daReSetup" style="margin-bottom:8px;">修改我的基本信息</button>
        <input type="text" id="daAuthName" placeholder="新增授权关系人姓名"/>
        <input type="text" id="daAuthRel" placeholder="关系（如 子女、配偶）"/>
        <button type="button" class="btn-p" id="daAddAuth" style="padding:10px;border:none;border-radius:99px;background:#596059;color:#fff;">添加授权</button>
        <div id="daAuthList" class="t-body-sm"></div>
        <hr style="border:none;border-top:1px solid #ece7e2;margin:8px 0;"/>
        <p class="t-body-sm">哀伤淡出：随时间自动降低主动频率</p>
        <textarea id="daRitualText" rows="3" placeholder="完成仪式告别语（可选）"></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn-o" id="daSaveGrief">保存淡出设置</button>
          <button type="button" class="btn-o" id="daSeal">封存数字分身</button>
        </div>`;
      p7.querySelector('.pc')?.appendChild(ep);

      async function refreshAuth() {
        const r = await DA.api('GET', '/ethics/authorization');
        const list = document.getElementById('daAuthList');
        if (list && r.success) {
          list.innerHTML = r.data.length
            ? r.data.map(u => `${u.name}（${u.relationship || '家人'}）${u.authorized ? '' : ' [已撤销]'}
              <button type="button" data-revoke="${u.id}" style="font-size:11px;margin-left:6px;">撤销</button>`).join('<br/>')
            : '暂无授权对象，请先添加';
          list.querySelectorAll('[data-revoke]').forEach(b => {
            b.onclick = async () => {
              await DA.api('DELETE', '/ethics/authorization/' + b.dataset.revoke);
              refreshAuth();
            };
          });
        }
        const g = await DA.api('GET', '/ethics/grief-mode');
        if (g.success) {
          document.getElementById('daRitualText').value = g.data.config?.completion_ritual_text || '';
        }
      }

      document.getElementById('daReSetup')?.addEventListener('click', () => showTrainingSetupWizard());

      document.getElementById('daAddAuth')?.addEventListener('click', async () => {
        const name = document.getElementById('daAuthName')?.value?.trim();
        if (!name) return;
        await DA.api('POST', '/ethics/authorization', {
          name,
          relationship: document.getElementById('daAuthRel')?.value || '家人',
          trainee_display_name: document.getElementById('daTraineeName')?.value
        });
        document.getElementById('daAuthName').value = '';
        refreshAuth();
      });

      document.getElementById('daSaveGrief')?.addEventListener('click', async () => {
        await DA.api('POST', '/ethics/grief-mode', {
          completion_ritual_text: document.getElementById('daRitualText')?.value
        });
        DA.toast('淡出设置已保存');
      });

      document.getElementById('daSeal')?.addEventListener('click', async () => {
        if (!confirm('封存后陪护端将无法对话，确定吗？')) return;
        await DA.api('POST', '/ethics/grief-mode/seal');
        DA.toast('已封存');
      });

      refreshAuth();
    }
  }

  function initTraining() {
    DA.injectAppMenu('训练端');
    initTrainingEthics();
    wireProfileRows();
    window.DAProfile?.installTopbar?.();
    window.DAProfile?.installProfilePage?.();
    const origGo = window.go;
    window.go = wrapGo(origGo, i => {
      if (i === 0 && (path.includes('sanctuary') || path.includes('training'))) {
        renderHomeTraining(document.getElementById('p0'));
      }
      if (i === 1 || i === 7) refreshProgress();
      if (i === 7) window.DAProfile?.refreshProfilePage?.();
      onTrainingPage(i);
    });
    installNavChrome(typeof cur !== 'undefined' ? cur : 0);

    if (path.includes('sanctuary') || path.includes('training')) {
      renderHomeTraining(document.getElementById('p0'));
    } else {
      wireChatPage(document.getElementById('p0'), {
        feedback: true,
        noTts: true,
        onSetupRequired: showTrainingSetupWizard,
        onPad: (pad) => {
          const chips = document.querySelectorAll('#p0 .chip');
          DA.padToChips(pad, chips);
        }
      });
    }

    refreshTrainingSetupState().then(() => {
      wireModuleRowsGate();
      if (!trainingSetupReady) setTimeout(showTrainingSetupWizard, 300);
      refreshProgress().then(() => {
        renderGuideHub();
        if (typeof cur !== 'undefined' && MODULE_BY_PAGE[cur]) applyModuleGuide(MODULE_BY_PAGE[cur]);
      });
      if (trainingSetupReady) {
        DA.api('GET', '/companion/greeting').then(d => {
          if (d.success && d.data?.text) {
            DA.chatHistory.push({ role: 'assistant', content: d.data.text, id: 'g0' });
            const box = document.querySelector('#p0 .da-chat-msgs');
            if (box) DA.renderChat(box, true);
          }
        }).catch(() => {});
      }
    });
    wireTrainingPages(refreshProgress);
    window.daShowSetup = showTrainingSetupWizard;

    const target = sessionStorage.getItem('da_training_page');
    if (target) {
      sessionStorage.removeItem('da_training_page');
      const n = Number(target);
      if (n >= 2 && n <= 6) {
        refreshTrainingSetupState().then(() => {
          if (trainingSetupReady) window.go(n);
          else showTrainingSetupWizard();
        });
      }
    }
  }

  /** 主页：引导训练 + 自由聊天双模式（与专项页共享 task_id） */
  let homeMode = 'guided';

  async function renderHomeTraining(p0) {
    if (!p0) return;
    let shell = p0.querySelector('.da-home-shell');
    if (!shell) {
      const inner = p0.querySelector('[style*="flex:1"]') || p0;
      shell = document.createElement('div');
      shell.className = 'da-home-shell';
      inner.innerHTML = '';
      inner.appendChild(shell);
      shell.innerHTML = `
        <div class="da-home-hero">
          <div class="da-home-hero-orb">
            <div class="da-home-hero-ring" style="--pct:0"></div>
            <div class="breathing"></div>
            <img class="da-stick-avatar" data-da-stick src="../assets/avatars/stick-duo-source.png" alt="数字分身"/>
          </div>
          <p class="da-home-hero-title da-home-subject">数字分身</p>
          <p class="da-home-hero-sub da-home-tagline">按题库答题、试聊或随手记，让分身更像本人</p>
        </div>
        <div class="da-segment da-segment--triple" role="tablist" aria-label="主页训练方式">
          <button type="button" class="da-segment-btn on da-home-tab-guided" role="tab" aria-selected="true"><span class="mi">playlist_add_check</span><span class="da-segment-label">情境答题</span></button>
          <button type="button" class="da-segment-btn da-home-tab-chat" role="tab" aria-selected="false"><span class="mi">forum</span><span class="da-segment-label">试聊</span></button>
          <button type="button" class="da-segment-btn da-home-tab-ingest" role="tab" aria-selected="false"><span class="mi">sticky_note_2</span><span class="da-segment-label">随手记</span></button>
        </div>
        <div class="da-home-guided"></div>
        <div class="da-home-chat-wrap" style="display:none;">
          <div class="da-chat-msgs da-msg-cards"></div>
          <div class="da-caps-mount" style="display:none;"></div>
          <div class="da-chat-input-wrap">
            <input type="text" class="da-home-chat-input" placeholder="说点什么，看分身怎么回…"/>
            <button type="button" class="da-home-send" aria-label="发送"><span class="mi">send</span></button>
          </div>
        </div>
        <div class="da-home-ingest-wrap" style="display:none;padding:16px;background:#fff;border-radius:20px;margin-top:12px;">
          <p class="t-body" style="font-weight:600;margin-bottom:8px;">随手记一条习惯或事实</p>
          <p class="t-body-sm" style="margin-bottom:12px;color:#767872;">不走题库、不上传文件，用一句话补充 TA 该记住的事，例如「我不吃香菜」。</p>
          <textarea id="daDirectIngestNote" rows="4" style="width:100%;border:1px solid #e6e2dc;border-radius:12px;padding:12px;margin-bottom:12px;font-family:inherit;font-size:14px;outline:none;" placeholder="在这里写下你的生活习惯或事实..."></textarea>
          <button type="button" class="btn-p" id="daDirectIngestSave">保存内容</button>
        </div>`;
      shell.querySelector('.da-home-tab-guided').onclick = () => setHomeMode('guided');
      shell.querySelector('.da-home-tab-chat').onclick = () => setHomeMode('chat');
      const ingestTab = shell.querySelector('.da-home-tab-ingest');
      if (ingestTab) ingestTab.onclick = () => setHomeMode('ingest');
      shell.querySelector('#daDirectIngestSave')?.addEventListener('click', async () => {
        const ta = shell.querySelector('#daDirectIngestNote');
        const v = ta?.value;
        if (!v) { DA.toast('请填写内容'); return; }
        const r = await DA.api('POST', '/training/lightweight-note', { content: v });
        if (r.success) {
          DA.toast('内容已保存，将作为日常习惯记住。');
          ta.value = '';
        } else DA.toast('保存失败', 'error');
      });
      const chatInput = shell.querySelector('.da-home-chat-input');
      const chatBox = shell.querySelector('.da-chat-msgs');
      const capsMount = shell.querySelector('.da-caps-mount');
      const chatOpts = {
        feedback: true, noTts: true, messageCards: true,
        aiName: shell.querySelector('.da-home-subject')?.textContent || '数字分身',
        onSetupRequired: showTrainingSetupWizard,
        onCaps: caps => DA.renderCapsPanel(caps, capsMount)
      };
      shell.querySelector('.da-home-send')?.addEventListener('click', () => DA.sendChat(chatInput, chatBox, chatOpts));
      chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') DA.sendChat(chatInput, chatBox, chatOpts); });
      const heroOrb = shell.querySelector('.da-home-hero-orb');
      if (heroOrb && !heroOrb.dataset.avatarWired) {
        heroOrb.dataset.avatarWired = '1';
        heroOrb.classList.add('da-hero-tappable');
        heroOrb.tabIndex = 0;
        heroOrb.setAttribute('role', 'button');
        heroOrb.setAttribute('aria-label', '更换分身形象');
        heroOrb.addEventListener('click', () => openAvatarPicker());
        heroOrb.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAvatarPicker(); }
        });
      }
    }

    applyHomeHeroAvatar();

    async function refreshHeroMeta(g) {
      const data = await DA.loadProgress();
      const overall = data?.personality_fit ?? data?.overall_progress ?? g?.progress?.ratio ?? 0;
      const pct = Math.round(overall * 100);
      const ring = shell.querySelector('.da-home-hero-ring');
      if (ring) ring.style.setProperty('--pct', pct);
      const subj = shell.querySelector('.da-home-subject');
      if (subj && g?.subject_name) subj.textContent = g.subject_name;
      applyHomeHeroAvatar();
      const tag = shell.querySelector('.da-home-tagline');
      if (tag) {
        const fit = pct > 0 ? `拟合 ${pct}%` : '';
        if (g?.task_id) {
          const task = [fit, g.module_label || '情境答题', g.day ? `第 ${g.day} 天` : ''].filter(Boolean).join(' · ');
          tag.textContent = task;
        } else if (g?.progress?.ratio >= 1) {
          tag.textContent = fit ? `${fit} · 本轮题库已完成` : '本轮题库已完成，可试聊或做五模块专项';
        } else if (g?.message && g.message !== '可继续答题、试聊或随手记') {
          tag.textContent = fit ? `${fit} · ${g.message}` : g.message;
        } else {
          tag.textContent = fit || '按题库答题、试聊或随手记';
        }
      }
    }

    async function setHomeMode(mode) {
      homeMode = mode;
      const tabGuided = shell.querySelector('.da-home-tab-guided');
      const tabChat = shell.querySelector('.da-home-tab-chat');
      const tabIngest = shell.querySelector('.da-home-tab-ingest');
      tabGuided?.classList.toggle('on', mode === 'guided');
      tabChat?.classList.toggle('on', mode === 'chat');
      tabIngest?.classList.toggle('on', mode === 'ingest');
      tabGuided?.setAttribute('aria-selected', mode === 'guided' ? 'true' : 'false');
      tabChat?.setAttribute('aria-selected', mode === 'chat' ? 'true' : 'false');
      tabIngest?.setAttribute('aria-selected', mode === 'ingest' ? 'true' : 'false');
      shell.querySelector('.da-home-guided').style.display = mode === 'guided' ? 'block' : 'none';
      shell.querySelector('.da-home-chat-wrap').style.display = mode === 'chat' ? 'flex' : 'none';
      const iw = shell.querySelector('.da-home-ingest-wrap');
      if (iw) iw.style.display = mode === 'ingest' ? 'block' : 'none';
      if (mode === 'guided') await loadGuided();
    }

    async function loadGuided() {
      const host = shell.querySelector('.da-home-guided');
      host.innerHTML = '<div class="da-empty-card"><span class="mi">hourglass_empty</span><p>加载中…</p></div>';
      const r = await DA.fetchHomeTraining();
      if (!r.success) return;
      const g = r.data;
      await refreshHeroMeta(g);

      if (g.setup_required) {
        host.innerHTML = `<div class="da-empty-card">
          <span class="mi">face_3</span>
          <p style="font-weight:600;color:#1c1c18;margin-bottom:8px;">先填写您的称呼</p>
          <p>${g.message || '创建数字分身后即可开始情境答题与试聊。'}</p>
          <button type="button" class="da-btn-primary da-open-setup" style="margin-top:16px;">填写基本信息</button></div>`;
        host.querySelector('.da-open-setup')?.addEventListener('click', showTrainingSetupWizard);
        return;
      }
      if (!g.task_id) {
        host.innerHTML = `<div class="da-empty-card">
          <span class="mi">celebration</span>
          <p>${g.message || '本轮情境题已完成'}</p>
          <p style="margin-top:8px;font-size:13px;">可切到「试聊」感受分身，或打开底部「训练」做五模块专项。</p></div>`;
        return;
      }

      const hp = g.home_prompt || {};
      let choicesHtml = '';
      if (hp.choices?.length) {
        choicesHtml = `<div class="da-guide-choices">${hp.choices.map((c, i) =>
          `<button type="button" class="choice da-home-choice" data-i="${i}" data-type="${c.type}" data-text="${c.text.replace(/"/g, '&quot;')}">
            <p class="t-body-sm" style="margin-bottom:4px;color:#1c1c18;">「${c.text}」</p>
            <span class="t-label" style="color:#596059;">${c.label}</span></button>`).join('')}</div>
          <p class="t-body-sm" style="color:#767872;margin:8px 0 4px;">这些选项只是参考；都不像 TA 可以跳过。</p>`;
      }
      if (hp.options?.length) {
        choicesHtml = `<div class="da-guide-choices">${hp.options.map((o, i) =>
          `<button type="button" class="choice da-home-cog" data-i="${i}">
            <p class="t-body-sm" style="color:#1c1c18;">${o}</p></button>`).join('')}</div>
          <p class="t-body-sm" style="color:#767872;margin:8px 0 4px;">拿不准选哪项可以点下方「没印象，跳过」。</p>`;
      }

      const showTextSubmit = hp.input_type !== 'voice' && hp.input_type !== 'cognition_choice';
      const inputBlock = showTextSubmit ? `
        <textarea class="da-home-answer" rows="4" placeholder="在这里回答…想到什么写什么。没有印象可以点下面跳过。"></textarea>
        <div class="da-guide-actions" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button type="button" class="da-btn-primary da-home-submit" style="flex:1;min-width:140px;">提交 · 下一题</button>
          <button type="button" class="btn-o da-home-skip" style="min-width:108px;padding:12px 10px;">没印象，跳过</button>
        </div>
        ${guideSkipNoteHtml()}` : '';
      const cognitionBlock = hp.input_type === 'cognition_choice' ? `
        <div class="da-guide-actions" style="margin-top:10px;">
          <button type="button" class="btn-o da-home-skip" style="width:100%;padding:12px;">没印象，跳过</button>
        </div>
        ${guideSkipNoteHtml()}` : '';
      const voiceBlock = hp.input_type === 'voice' ? `
        <button type="button" class="da-btn-primary da-home-voice-text da-voice-text-btn">提交朗读文字<span class="da-voice-text-sub">无麦克风可先跳过录音</span></button>
        <button type="button" class="btn-o da-home-skip" style="width:100%;margin-top:8px;padding:12px;">没印象，跳过</button>
        <button type="button" class="da-btn-ghost da-go-voice" style="margin-top:8px;"><span class="mi" style="vertical-align:middle;font-size:18px;">mic</span> 去专项页录音</button>
        ${guideSkipNoteHtml()}` : '';

      host.innerHTML = `
        <article class="da-guide-card">
          <header class="da-guide-card-head">
            ${modIconHtml(g.module)}
            <div class="da-guide-card-meta">
              <span class="da-guide-day-badge">第 ${g.day} 天 · ${g.module_label}</span>
              <h2 class="da-guide-card-headline">${hp.headline || g.day_title || '训练'}</h2>
              ${g.scene_label ? `<p class="t-label" style="margin-top:4px;color:#767872;">当前情境：${g.scene_label}</p>` : ''}
            </div>
          </header>
          <div class="da-guide-card-body">
            <p class="da-guide-ask">${hp.ask || ''}</p>
            ${hp.literary_text ? `<blockquote class="da-guide-quote">${hp.literary_text}</blockquote>` : ''}
            ${hp.hint ? `<div class="da-guide-hint"><span class="mi">lightbulb</span><span>${hp.hint}</span></div>` : ''}
            ${choicesHtml}
            ${inputBlock}
            ${cognitionBlock}
            ${voiceBlock}
            ${g.coach?.purpose ? `<div class="da-guide-hint" style="margin-top:12px;margin-bottom:0;"><span class="mi">psychology</span><span>${g.coach.purpose}</span></div>` : ''}
            <p class="da-sync-note">${g.sync_note || ''}</p>
          </div>
        </article>
        <button type="button" class="da-btn-ghost da-go-module">在专项页深化本题 →</button>`;

      let selectedChoice = null;
      host.querySelectorAll('.da-home-choice').forEach(btn => {
        btn.onclick = () => {
          host.querySelectorAll('.da-home-choice').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedChoice = { index: Number(btn.dataset.i), type: btn.dataset.type, text: btn.dataset.text };
          const ta = host.querySelector('.da-home-answer');
          if (ta) ta.value = btn.dataset.text;
        };
      });
      host.querySelectorAll('.da-home-cog').forEach(btn => {
        btn.onclick = async () => {
          host.querySelectorAll('.da-home-cog').forEach(b => { b.disabled = true; });
          const r2 = await DA.submitHomeTraining({
            module: g.module, task_id: g.task_id,
            content: hp.options[Number(btn.dataset.i)], choice_index: Number(btn.dataset.i)
          });
          host.querySelectorAll('.da-home-cog').forEach(b => { b.disabled = false; });
          if (r2.success) {
            DA.toast(r2.data?.feedback || '已提交，进入下一题');
            await afterGuideAction(g.module);
          } else DA.toast(r2.error || '提交失败', 'error');
        };
      });
      host.querySelectorAll('.da-home-skip').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          const prev = btn.textContent;
          btn.textContent = '跳过中…';
          const ok = await DA.skipGuideTask({ module: g.module, task_id: g.task_id });
          btn.disabled = false;
          btn.textContent = prev;
          if (ok) await afterGuideAction(g.module);
        });
      });

      host.querySelector('.da-home-submit')?.addEventListener('click', async () => {
        const content = host.querySelector('.da-home-answer')?.value?.trim();
        if (!content) {
          DA.toast('想不起可以点「没印象，跳过」', 'error');
          return;
        }
        const btn = host.querySelector('.da-home-submit');
        btn.disabled = true;
        btn.textContent = '提交中…';
        const r2 = await DA.submitHomeTraining({
          module: g.module, task_id: g.task_id, content,
          response_type: selectedChoice?.type, choice_index: selectedChoice?.index
        });
        btn.disabled = false;
        btn.textContent = '提交 · 进入下一题';
        if (r2.success) {
          DA.toast(r2.data?.feedback || '已提交，进入下一题');
          await afterGuideAction(g.module);
        } else DA.toast(r2.error || '提交失败', 'error');
      });
      host.querySelector('.da-go-voice')?.addEventListener('click', () => {
        sessionStorage.setItem('da_training_page', String(g.module_page || 2));
        window.go(2);
      });
      host.querySelector('.da-home-voice-text')?.addEventListener('click', async () => {
        const text = hp.literary_text?.replace(/^[（(][^）)]*[）)]\s*/, '') || hp.literary_text || '';
        DA.setGuideTask(g);
        const btn = host.querySelector('.da-home-voice-text');
        btn.disabled = true;
        btn.textContent = '提交中…';
        if (await DA.submitVoice(text.replace(/^["「]|["」]$/g, ''))) {
          await afterGuideAction('voice');
        }
        btn.disabled = false;
        btn.innerHTML = '提交朗读文字<span class="da-voice-text-sub">无麦克风可先跳过录音</span>';
      });
      host.querySelector('.da-go-module')?.addEventListener('click', () => {
        sessionStorage.setItem('da_training_page', String(g.module_page || 3));
        window.go(g.module_page || 3);
      });
      DA.setGuideTask(g);
    }

    window.daReloadHomeGuided = loadGuided;
    await setHomeMode(homeMode);
  }

  function hideP1StaticPlaceholders() {
    const p1 = document.getElementById('p1');
    if (!p1) return;
    p1.querySelector('.da-p1-static-hero')?.classList.add('da-p1-static-hidden');
    p1.querySelector('.card[style*="flex-direction:column"]')?.classList.add('da-p1-static-hidden');
    p1.querySelector('.card-w .t-label + span[style*="Noto"]')?.closest('.card-w')?.classList.add('da-p1-static-hidden');
    p1.querySelector('div[style*="grid-template-columns:1fr 1fr 1fr"]')?.classList.add('da-p1-static-hidden');
    p1.querySelector('input[placeholder*="测试数字人"]')?.closest('div')?.classList.add('da-p1-static-hidden');
  }

  function initSanctuary() {
    DA.injectAppMenu('数字方舟');
    initTrainingEthics();
    wireProfileRows();
    window.DAProfile?.installTopbar?.();
    window.DAProfile?.installProfilePage?.();
    const origGo = window.go;
    window.go = wrapGo(origGo, i => {
      if (i === 0) renderHomeTraining(document.getElementById('p0'));
      if (i === 1 || i === 7) refreshProgress();
      if (i === 7) window.DAProfile?.refreshProfilePage?.();
      onTrainingPage(i);
    });
    installNavChrome(typeof cur !== 'undefined' ? cur : 0);

    renderHomeTraining(document.getElementById('p0'));

    refreshTrainingSetupState().then(() => {
      wireModuleRowsGate();
      if (!trainingSetupReady) setTimeout(showTrainingSetupWizard, 300);
      refreshProgress().then(() => {
        renderGuideHub();
        if (typeof cur !== 'undefined' && MODULE_BY_PAGE[cur]) applyModuleGuide(MODULE_BY_PAGE[cur]);
      });
    });
    wireTrainingPages(refreshProgress);
    window.daShowSetup = showTrainingSetupWizard;

    DA.api('GET', '/companion/greeting').then(d => {
      if (!trainingSetupReady) return;
      if (d.success) {
        DA.chatHistory.push({ role: 'assistant', content: d.data.text, id: 'g0' });
        const box = document.querySelector('#p0 .da-chat-msgs');
        if (box) DA.renderChat(box, false);
      }
    }).catch(() => {});
  }

  function initCompanion() {
    DA.injectAppMenu('陪护端');
    window.DAProfile?.installTopbar?.();
    DA.companionMode = 'normal';

    initCompanionConsent().then(ok => {
      if (!ok) return;

    wireChatPage(document.getElementById('p0'), {
      companion: true,
      messageCards: true,
      aiName: '数字分身',
      onArchive: (msg) => {
        const type = window.prompt('归档到训练模块：memory / relationship / emotion', 'memory');
        if (type && ['memory', 'relationship', 'emotion'].includes(type)) DA.archiveMessage(msg, type);
      },
      onAccessDenied: () => initCompanionConsent()
    });

    const p1 = document.getElementById('p1');
    if (p1 && !p1.querySelector('.da-companion-settings')) {
      const panel = document.createElement('div');
      panel.className = 'card-w da-companion-settings';
      panel.style.marginTop = '14px';
      panel.innerHTML = `
        <p class="t-body" style="font-weight:600;margin-bottom:12px;">陪伴偏好</p>
        <label class="t-body-sm" style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <input type="checkbox" id="daAutoGreeting" checked/> 允许主动问候
        </label>
        <label class="t-body-sm" style="display:block;margin-bottom:6px;">问候频率</label>
        <select id="daGreetingFreq" style="width:100%;padding:10px;border-radius:12px;border:1px solid #e6e2dc;margin-bottom:12px;font-family:inherit;">
          <option value="low">较少</option>
          <option value="medium">适中</option>
          <option value="high">较多</option>
        </select>
        <label class="t-body-sm" style="display:block;margin-bottom:6px;">安静时段</label>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <input type="time" id="daQuietStart" value="23:00" style="flex:1;padding:8px;border-radius:10px;border:1px solid #e6e2dc;"/>
          <span class="t-body-sm" style="align-self:center;">至</span>
          <input type="time" id="daQuietEnd" value="08:00" style="flex:1;padding:8px;border-radius:10px;border:1px solid #e6e2dc;"/>
        </div>
        <button type="button" class="btn-p da-save-settings" style="width:100%;padding:12px;border:none;border-radius:99px;background:#596059;color:#fff;font-weight:600;cursor:pointer;">保存设置</button>`;
      p1.querySelector('.pc')?.appendChild(panel);
      panel.querySelector('.da-save-settings')?.addEventListener('click', async () => {
        await DA.saveCompanionSettings({
          auto_greeting: document.getElementById('daAutoGreeting').checked,
          greeting_frequency: document.getElementById('daGreetingFreq').value,
          quiet_hours: {
            start: document.getElementById('daQuietStart').value,
            end: document.getElementById('daQuietEnd').value
          }
        });
      });
    }

    DA.loadCompanionStatus().then(res => {
      if (!res.success) return;
      const av = res.data.digital_avatar;
      const settings = res.data.companion_settings || {};
      const card = p1?.querySelector('.card-w:not(.da-companion-settings)');
      if (card) {
        card.querySelector('.t-body')?.replaceChildren(document.createTextNode('数字分身 · ' + av.name));
        card.querySelector('.t-body-sm').textContent =
          `关系 Lv.${av.relationship_level} · 拟合度 ${Math.round(av.personality_fit * 100)}% · ${av.mood}`;
      }
      const g = document.getElementById('daAutoGreeting');
      const f = document.getElementById('daGreetingFreq');
      const qs = document.getElementById('daQuietStart');
      const qe = document.getElementById('daQuietEnd');
      if (g) g.checked = settings.auto_greeting !== false;
      if (f) f.value = settings.greeting_frequency || 'medium';
      if (qs) qs.value = settings.quiet_hours?.start || '23:00';
      if (qe) qe.value = settings.quiet_hours?.end || '08:00';
    });

    // 主动问候轮询
    setInterval(async () => {
      const uid = DA.getCompanionUserId();
      if (!uid) return;
      const d = await DA.api('GET', '/companion/greeting?companion_user_id=' + encodeURIComponent(uid));
      if (d.success && d.data?.text) {
        const box = document.querySelector('#p0 .da-chat-msgs');
        if (box) {
          DA.chatHistory.push({ role: 'assistant', content: d.data.text, id: 'g' + Date.now() });
          DA.renderChat(box, false, { messageCards: true, aiName: '数字分身', onArchive: (msg) => {
            const type = window.prompt('归档到训练模块：memory / relationship / emotion', 'memory');
            if (type && ['memory', 'relationship', 'emotion'].includes(type)) DA.archiveMessage(msg, type);
          }});
        }
      }
    }, 120000);

    const uid = DA.getCompanionUserId();
    DA.api('GET', '/companion/greeting?companion_user_id=' + encodeURIComponent(uid || '')).then(d => {
      if (d.success) {
        DA.chatHistory.push({ role: 'assistant', content: d.data.text, id: 'g0' });
        const box = document.querySelector('#p0 .da-chat-msgs');
        if (box) DA.renderChat(box, false, { messageCards: true, aiName: '数字分身', onArchive: (msg) => {
          const type = window.prompt('归档到训练模块：memory / relationship / emotion', 'memory');
          if (type && ['memory', 'relationship', 'emotion'].includes(type)) DA.archiveMessage(msg, type);
        }});
      }
    }).catch(() => {});

    }); // initCompanionConsent
  }

  if (path.includes('training')) initTraining();
  else if (path.includes('companion')) initCompanion();
  else if (path.includes('sanctuary')) initSanctuary();
})();
