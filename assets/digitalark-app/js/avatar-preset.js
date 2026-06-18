'use strict';

/**
 * 数字分身 · 手绘双猫形象（男/女各一张，非 AI 生成）
 */
(function () {
  function assetBase() {
    const path = location.pathname.replace(/\\/g, '/');
    if (/\/apps\/[^/]+(?:\.html)?$/i.test(path)) return '../assets/avatars/';
    if (path.includes('/digitalark-app/')) {
      const root = path.slice(0, path.indexOf('/digitalark-app/') + '/digitalark-app'.length);
      return `${root}/assets/avatars/`;
    }
    return '/assets/avatars/';
  }

  const PRESETS = {
    m: { id: 'm', label: '男', gender: 'male', file: 'avatar-m.png' },
    f: { id: 'f', label: '女', gender: 'female', file: 'avatar-f.png' }
  };

  const DEFAULT_PRESET = 'm';

  function get(id) {
    return PRESETS[id] || PRESETS[DEFAULT_PRESET];
  }

  function srcFor(presetId) {
    return assetBase() + get(presetId).file;
  }

  function resolve(setup) {
    const id = setup?.avatar_preset || (setup?.subject_gender === 'female' ? 'f' : setup?.subject_gender === 'male' ? 'm' : '');
    return get(id || DEFAULT_PRESET);
  }

  function resolveId(setup) {
    return resolve(setup).id;
  }

  function applyImg(img, presetId) {
    if (!img) return;
    const p = get(presetId);
    img.src = srcFor(presetId);
    img.alt = `数字分身 · ${p.label}`;
    img.classList.add('da-stick-avatar', 'da-avatar-solo');
    img.classList.remove('da-stick-avatar--m', 'da-stick-avatar--f');
    img.classList.add(`da-stick-avatar--${p.id}`);
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center center';
    img.style.transform = 'none';
  }

  function applyAll(setup) {
    const id = resolveId(setup);
    document.querySelectorAll('.da-stick-avatar-slot img, .da-home-hero-orb img, img[data-da-stick]').forEach(img => {
      applyImg(img, id);
    });
  }

  function pickerMarkup(selectedId) {
    const sel = selectedId || DEFAULT_PRESET;
    return Object.values(PRESETS).map(p => `
      <button type="button" class="da-avatar-pick${sel === p.id ? ' on' : ''}" data-preset="${p.id}" aria-pressed="${sel === p.id}">
        <span class="da-avatar-pick-preview da-stick-avatar-slot da-stick-avatar-slot--sm">
          <img class="da-stick-avatar da-avatar-solo da-stick-avatar--${p.id}" src="${assetBase()}${p.file}" alt=""/>
        </span>
        <span class="da-avatar-pick-label">${p.label}</span>
      </button>`).join('');
  }

  function wirePicker(root, { selectedId, onChange } = {}) {
    if (!root) return;
    let current = selectedId || DEFAULT_PRESET;
    root.querySelectorAll('.da-avatar-pick').forEach(btn => {
      btn.addEventListener('click', () => {
        current = btn.dataset.preset;
        root.querySelectorAll('.da-avatar-pick').forEach(b => {
          const on = b.dataset.preset === current;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        onChange?.(current);
      });
    });
    root.querySelectorAll('.da-avatar-pick-preview img').forEach(img => {
      applyImg(img, img.closest('.da-avatar-pick')?.dataset.preset || DEFAULT_PRESET);
    });
    return () => current;
  }

  function showPickerSheet({ selectedId, onSave } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'da-sheet-overlay on';
    overlay.innerHTML = `
      <div class="da-sheet" role="dialog" aria-modal="true">
        <div class="da-sheet-head">
          <span class="t-section">选择分身形象</span>
          <button type="button" class="da-sheet-close" aria-label="关闭"><span class="mi">close</span></button>
        </div>
        <div class="da-sheet-body">
          <p class="t-body-sm" style="margin-bottom:14px;color:#767872;">先选男或女，以后可再换。</p>
          <div class="da-avatar-pick-row">${pickerMarkup(selectedId)}</div>
          <button type="button" class="btn-p da-avatar-pick-save" style="width:100%;margin-top:18px;">确定</button>
        </div>
      </div>`;
    const getSelected = wirePicker(overlay, { selectedId });
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('.da-sheet-close')) overlay.remove();
    });
    overlay.querySelector('.da-avatar-pick-save')?.addEventListener('click', async () => {
      const id = getSelected();
      await onSave?.(id, get(id));
      overlay.remove();
    });
    document.body.appendChild(overlay);
    overlay.querySelectorAll('.da-avatar-pick-preview img').forEach(img => {
      applyImg(img, img.closest('.da-avatar-pick')?.dataset.preset);
    });
  }

  window.DAAvatar = {
    assetBase,
    srcFor,
    PRESETS,
    DEFAULT_PRESET,
    get,
    resolve,
    resolveId,
    applyImg,
    applyAll,
    pickerMarkup,
    wirePicker,
    showPickerSheet,
    presetPayload(presetId) {
      const p = get(presetId);
      return { avatar_preset: p.id, subject_gender: p.gender };
    }
  };
})();
