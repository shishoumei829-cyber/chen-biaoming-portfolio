'use strict';

/**
 * 「我的」个人中心 — 顶栏入口 + p7 页面（QQ 式分组菜单）
 */
(function () {
  const DA = window.DA;
  if (!DA) return;

  const AVATAR_KEY = 'da_profile_avatar';
  let lastSetupForAvatar = null;
  function getAvatar() {
    try {
      const stored = localStorage.getItem(AVATAR_KEY);
      if (stored) return stored;
    } catch {}
    return window.DAAvatar?.srcFor?.('m') || '../assets/avatars/avatar-m.png';
  }

  function setAvatar(url) {
    try {
      if (url) localStorage.setItem(AVATAR_KEY, url);
      else localStorage.removeItem(AVATAR_KEY);
    } catch { /* ignore */ }
    applyAvatarAll();
  }

  function applyAvatarAll() {
    if (window.DAAvatar && lastSetupForAvatar) {
      document.querySelectorAll('.da-profile-avatar-img').forEach(img => {
        window.DAAvatar.applyImg(img, window.DAAvatar.resolveId(lastSetupForAvatar));
      });
      return;
    }
    const url = getAvatar();
    document.querySelectorAll('.da-profile-avatar-img, .topbar-avatar img, .da-topbar-profile img').forEach(img => {
      img.src = url;
    });
  }

  function openProfilePage() {
    if (typeof window.go !== 'function') return;
    if (document.getElementById('p7')) window.go(7);
    else if (document.getElementById('p1')) window.go(1);
    setTimeout(() => refreshProfilePage(), 80);
  }

  function installTopbar() {
    document.querySelectorAll('.topbar').forEach(bar => {
      if (bar.dataset.profileWired) return;
      bar.dataset.profileWired = '1';

      let btn = bar.querySelector('.da-topbar-profile');
      if (!btn) {
        const avatarBox = bar.querySelector(':scope > .topbar-avatar, :scope > .avatar-sm');
        if (avatarBox && !avatarBox.closest('.da-topbar-profile')) {
          btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'da-topbar-profile';
          btn.setAttribute('aria-label', '我的');
          avatarBox.replaceWith(btn);
          btn.appendChild(avatarBox);
          avatarBox.classList.add('topbar-avatar');
          const label = document.createElement('span');
          label.className = 'da-topbar-me-label';
          label.textContent = '我的';
          btn.appendChild(label);
        }
      }
      btn = bar.querySelector('.da-topbar-profile');
      if (btn && !btn.dataset.profileClickWired) {
        btn.dataset.profileClickWired = '1';
        btn.addEventListener('click', e => {
          e.stopPropagation();
          openProfilePage();
        });
      }

      const apps = bar.querySelector('.topbar-apps, .mi[title*="切换"]');
      if (apps && !apps.dataset.menuWired) {
        apps.dataset.menuWired = '1';
        apps.classList.add('topbar-apps');
      }
    });
    applyAvatarAll();
  }

  function sheetHtml(title, bodyHtml) {
    const el = document.createElement('div');
    el.className = 'da-sheet-overlay on';
    el.innerHTML = `
      <div class="da-sheet" role="dialog" aria-modal="true">
        <div class="da-sheet-head">
          <span class="t-section">${title}</span>
          <button type="button" class="da-sheet-close" aria-label="关闭"><span class="mi">close</span></button>
        </div>
        <div class="da-sheet-body t-body-sm">${bodyHtml}</div>
      </div>`;
    el.addEventListener('click', e => {
      if (e.target === el || e.target.closest('.da-sheet-close')) el.remove();
    });
    document.body.appendChild(el);
    return el;
  }

  function showAbout() {
    sheetHtml('关于数字方舟', `
      <p><strong>数字方舟</strong> 是本地运行的数字分身训练与陪护应用。数据默认保存在本机，不上传云端。</p>
      <p style="margin-top:12px;">版本：1.1.0<br/>训练题库：345 道情境题（五模块）<br/>模式：本人自训 / 代训</p>
      <p style="margin-top:12px;color:#767872;">训练端负责录入人格数据；陪护端供授权亲友试聊。</p>
    `);
  }

  function showHelp() {
    sheetHtml('使用说明', `
      <p><strong>1. 情境答题</strong> — 按题库回答，写入记忆、关系、情感、认知等模块。</p>
      <p style="margin-top:10px;"><strong>2. 试聊</strong> — 像聊天一样测试分身是否像本人，可点「像 / 不像」校准。</p>
      <p style="margin-top:10px;"><strong>3. 随手记</strong> — 快速补充一条习惯或事实，不必走完整题目。</p>
      <p style="margin-top:10px;"><strong>4. 五模块训练</strong> — 底部「训练」进入音色、记忆、关系、情感、认知专项。</p>
      <p style="margin-top:10px;"><strong>5. 我的</strong> — 改头像、基本信息、授权对象、查看进度与说明。</p>
    `);
  }

  function showPrivacy() {
    sheetHtml('隐私与数据', `
      <p>训练内容（文字、语音、照片）用于构建<strong>你的数字分身</strong>，保存在本机数据目录。</p>
      <p style="margin-top:10px;">授权对象经你添加后，才能在陪护端以访客身份对话；可随时撤销授权。</p>
      <p style="margin-top:10px;">可随时「封存数字分身」停止陪护端访问。哀伤淡出可降低主动问候频率。</p>
      <p style="margin-top:10px;color:#767872;">请勿在训练中输入他人隐私或敏感证件信息。</p>
    `);
  }

  function pickAvatar() {
    if (window.DAAvatar) {
      window.DAAvatar.showPickerSheet({
        selectedId: window.DAAvatar.resolveId(lastSetupForAvatar),
        onSave: async (id) => {
          const av = window.DAAvatar.presetPayload(id);
          const r = await DA.saveTrainingSetup({
            ...av,
            setup_complete: lastSetupForAvatar?.setup_complete ?? true
          });
          if (!r.success) {
            DA.toast(r.error || '保存失败', 'error');
            return;
          }
          lastSetupForAvatar = r.data;
          applyAvatarAll();
          window.DAAvatar.applyAll(lastSetupForAvatar);
          if (typeof window.daApplyHomeHeroAvatar === 'function') window.daApplyHomeHeroAvatar();
          DA.toast('分身形象已更新');
          refreshProfilePage();
        }
      });
      return;
    }
    let input = document.getElementById('daProfileAvatarInput');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'daProfileAvatarInput';
      input.accept = 'image/*';
      input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener('change', () => {
        const f = input.files?.[0];
        input.value = '';
        if (!f) return;
        if (f.size > 3 * 1024 * 1024) {
          DA.toast('图片请小于 3MB', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setAvatar(reader.result);
          DA.toast('头像已更新');
          refreshProfilePage();
        };
        reader.readAsDataURL(f);
      });
    }
    input.click();
  }

  function menuRow(icon, title, desc, action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'module-row da-profile-row';
    btn.innerHTML = `
      <div class="icon-pill"><span class="mi mi-sm">${icon}</span></div>
      <div class="da-mod-text"><strong>${title}</strong><small>${desc}</small></div>
      <span class="mi mi-sm da-mod-chevron">chevron_right</span>`;
    btn.addEventListener('click', action);
    return btn;
  }

  function sectionTitle(text) {
    const h = document.createElement('p');
    h.className = 'da-profile-section-title';
    h.textContent = text;
    return h;
  }

  async function refreshProfilePage() {
    const host = document.querySelector('#p7 .da-profile-host');
    if (!host) return;

    const [setupR, guideR, progR, dashR] = await Promise.all([
      DA.fetchTrainingSetup(),
      DA.api('GET', '/training/guide'),
      DA.loadProgress(),
      DA.fetchTrainingDashboard?.() || Promise.resolve({ success: false })
    ]);

    const setup = setupR.success ? setupR.data : {};
    const guide = guideR.success ? guideR.data : {};
    const prog = progR || {};
    const pct = Math.round((prog.personality_fit ?? prog.overall_progress ?? guide.progress?.ratio ?? 0) * 100);
    const name = setup.subject_name || setup.trainer_name || '未设置';
    const done = guide.progress?.completed ?? 0;
    const total = guide.progress?.total ?? 0;

    host.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'card-w da-profile-head';
    head.innerHTML = `
      <button type="button" class="da-profile-avatar-btn" aria-label="更换分身形象">
        <img class="da-profile-avatar-img da-stick-avatar-slot" src="" alt=""/>
        <span class="da-profile-avatar-edit"><span class="mi">face_retouching_natural</span></span>
      </button>
      <div class="da-profile-head-text">
        <p class="t-body da-profile-name" style="font-weight:600;"></p>
        <p class="t-body-sm da-profile-meta"></p>
        <button type="button" class="btn-o da-profile-edit-setup" style="margin-top:10px;padding:8px 14px;font-size:13px;">编辑资料</button>
      </div>`;
    if (window.DAAvatar) {
      lastSetupForAvatar = setup;
      window.DAAvatar.applyImg(head.querySelector('.da-profile-avatar-img'), window.DAAvatar.resolveId(setup));
    } else {
      head.querySelector('.da-profile-avatar-img').src = getAvatar();
    }
    head.querySelector('.da-profile-name').textContent = name;
    const twinStatus = dashR.success ? dashR.data?.twin_status : null;
    const ver = dashR.success ? dashR.data?.version : '';
    head.querySelector('.da-profile-meta').textContent =
      setup.setup_complete
        ? `${twinStatus?.label || '训练中'} · 拟合 ${pct}% · ${ver || 'v0.1'} · 题库 ${done}/${total || '—'}`
        : '请先完成基本信息设定';
    head.querySelector('.da-profile-avatar-btn').onclick = pickAvatar;
    head.querySelector('.da-profile-edit-setup').onclick = () => {
      if (typeof window.daShowSetup === 'function') window.daShowSetup();
      else DA.toast('请从训练页完成设定');
    };
    host.appendChild(head);

    const g1 = document.createElement('div');
    g1.className = 'da-profile-group';
    g1.appendChild(sectionTitle('训练'));
    g1.appendChild(menuRow('insights', '训练进度', `五层拟合与阶段 · ${pct}%`, () => {
      sheetHtml('训练进度', `
        <p>整体拟合：<strong>${pct}%</strong></p>
        <p style="margin-top:8px;">引导题库：${done} / ${total} 题</p>
        <p style="margin-top:8px;">阶段：${prog.stage?.name || guide.phase || '—'}</p>
      `);
    }));
    g1.appendChild(menuRow('psychology', '五模块专项', '音色 · 记忆 · 关系 · 情感 · 认知', () => {
      if (typeof window.go === 'function') window.go(1);
    }));
    g1.appendChild(menuRow('fact_check', '训练数据审查', '查看 Persona 与语料导入情况', () => {
      location.href = '/apps/persona-review.html';
    }));
    host.appendChild(g1);

    const g2 = document.createElement('div');
    g2.className = 'da-profile-group';
    g2.appendChild(sectionTitle('账号与安全'));
    g2.appendChild(menuRow('face_retouching_natural', '分身形象', '男 / 女 简笔火柴人', pickAvatar));
    g2.appendChild(menuRow('verified_user', '授权管理', '谁可以在陪护端对话', () => {
      document.querySelector('.da-ethics-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    g2.appendChild(menuRow('inventory_2', '记忆与资料', '在「记忆训练」中上传照片与文字', () => {
      if (typeof window.go === 'function') window.go(3);
      else DA.toast('请打开训练端 → 记忆训练');
    }));
    host.appendChild(g2);

    const g3 = document.createElement('div');
    g3.className = 'da-profile-group';
    g3.appendChild(sectionTitle('通用'));
    g3.appendChild(menuRow('apps', '切换应用', '主应用 / 训练端 / 陪护端', () => {
      if (typeof DA.toggleAppMenu === 'function') DA.toggleAppMenu();
      else DA.toast('请点右上角应用菜单');
    }));
    g3.appendChild(menuRow('help', '使用说明', '情境答题、试聊、五模块怎么用', showHelp));
    g3.appendChild(menuRow('privacy_tip', '隐私与数据', '本地存储、授权与封存', showPrivacy));
    g3.appendChild(menuRow('info', '关于', '版本与产品说明', showAbout));
    host.appendChild(g3);

    applyAvatarAll();
  }

  function installProfilePage() {
    const p7 = document.getElementById('p7');
    if (!p7) return;
    p7.classList.add('da-profile-page');
    const pc = p7.querySelector('.pc') || p7;
    let host = pc.querySelector('.da-profile-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'da-profile-host';
      pc.insertBefore(host, pc.firstChild);
    }
    if (!p7.dataset.profileShell) {
      p7.dataset.profileShell = '1';
      pc.querySelectorAll(':scope > *:not(.da-profile-host):not(.da-ethics-panel)').forEach(n => n.remove());
    }
    refreshProfilePage();
  }

  window.DAProfile = {
    installTopbar,
    installProfilePage,
    refreshProfilePage,
    openProfilePage,
    getAvatar,
    setAvatar,
    applyAvatarAll
  };

  document.addEventListener('DOMContentLoaded', () => {
    installTopbar();
    installProfilePage();
  });
})();
