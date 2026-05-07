/* ═══════════════════════════════════════════════════════════════
   HARTON Stella — お問合せフォーム制御
   ─────────────────────────────────────────────────────────────
   役割: 送信前確認モーダル + AJAX hijack + 失敗時メッセージ表示。

   設計上の WHY:
   - inline script 不使用: CSP script-src 'self' 整合のため。
   - confirmBtn は <button type="submit"> のまま JS が submit を hijack:
     JS 無効環境では標準フォーム送信 → Web3Forms が <input name="redirect">
     の URL (= /thanks.html) にリダイレクトする progressive enhancement。
   - innerHTML 不使用 / replaceChildren / textContent のみ:
     CSP require-trusted-types-for 'script' 整合のため。
   - openModal 時に form.inert = true: 確認画面表示中の背後フォーム改変
     による「確認内容と送信内容の乖離」を防ぐ (WCAG 2.2 / ARIA Dialog)。
   - フォーカストラップ: モーダル外への Tab 抜け防止 (WCAG 2.2 SC 2.1.1)。
   - submitting フラグ: 送信中の Escape / closeModal を抑止し、二重送信
     経路の発生を防ぐ。
   - role="alert" 要素には focus() を呼ばない: role="alert" は自動で
     スクリーンリーダーへ通知するため、focus() による二重アナウンスを
     避ける。

   サポートブラウザ: Chrome 89+ / Firefox 86+ / Safari 15.5+ / Edge 89+
     (form.inert 対応版)。IE11 はサポート外。
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const confirmBtn = document.getElementById('confirmBtn');
  const modal = document.getElementById('confirmModal');
  const modalCard = modal && modal.querySelector('.confirm-modal-card');
  const modalList = document.getElementById('confirmList');
  const submitBtn = document.getElementById('confirmSubmit');
  const backBtn = document.getElementById('confirmBack');
  const closeBtn = document.getElementById('confirmClose');
  const errorEl = document.getElementById('contactError');
  const statusEl = document.getElementById('contactStatus');

  if (!confirmBtn || !modal || !modalCard || !modalList || !submitBtn || !backBtn || !closeBtn) return;

  const CATEGORY_LABEL = {
    apply: '掲載申請',
    press: '取材依頼',
    'opt-out': '掲載辞退',
    other: 'その他',
  };

  let submitting = false;

  function focusableInModal() {
    return [closeBtn, submitBtn, backBtn].filter((el) => el && !el.disabled);
  }

  function setError(message) {
    if (errorEl) errorEl.textContent = message || '';
  }

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message || '';
  }

  function getValues() {
    const fd = new FormData(form);
    return {
      name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      company: (fd.get('company') || '').toString().trim(),
      category: (fd.get('category') || 'other').toString(),
      message: (fd.get('message') || '').toString().trim(),
    };
  }

  function validate(v) {
    const errors = [];
    if (!v.name) errors.push('お名前');
    if (!v.email) errors.push('メールアドレス');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.push('メールアドレス（形式）');
    if (!v.message) errors.push('お問合せ内容');
    return errors;
  }

  function renderConfirm(v) {
    const rows = [
      ['お名前', v.name],
      ['メールアドレス', v.email],
      ['事業者名', v.company || '(未入力)'],
      ['お問合せ種別', CATEGORY_LABEL[v.category] || v.category],
      ['お問合せ内容', v.message],
    ];
    const fragments = [];
    rows.forEach(([label, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      fragments.push(dt, dd);
    });
    modalList.replaceChildren(...fragments);
  }

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    form.inert = true;
    submitBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    form.inert = false;
    confirmBtn.focus();
  }

  function trapFocus(e) {
    if (modal.hidden || e.key !== 'Tab') return;
    const items = focusableInModal();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // 送信失敗共通処理 (失敗レスポンス + 通信例外で重複していたロジックを集約)
  function abortSubmit(originalLabel, message) {
    setError(message);
    setStatus('');
    submitBtn.disabled = false;
    backBtn.disabled = false;
    submitBtn.textContent = originalLabel;
    submitting = false;
    closeModal();
  }

  form.addEventListener('submit', (e) => {
    // JS 無効時は本ハンドラ未登録のため標準送信が走る (progressive enhancement)
    e.preventDefault();
    setError('');
    setStatus('');
    const values = getValues();
    const errors = validate(values);
    if (errors.length) {
      // role="alert" 要素は textContent 変更で自動アナウンスされるため focus() は呼ばない
      setError('入力に不足がある: ' + errors.join(' / '));
      return;
    }
    renderConfirm(values);
    openModal();
  });

  backBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    // 送信中の Escape は二重送信経路を生むため無効化
    if (e.key === 'Escape') {
      if (!submitting) closeModal();
      return;
    }
    trapFocus(e);
  });

  submitBtn.addEventListener('click', async () => {
    if (submitting) return;
    submitting = true;
    submitBtn.disabled = true;
    backBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = '送信中...';
    setStatus('送信中。しばらくお待ちください。');
    setError('');

    const fd = new FormData(form);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data && data.success) {
        // 遷移遅延中のモーダル残像を防ぐため location.href の前に閉じる
        setStatus('送信完了。thanks 画面へ遷移する。');
        closeModal();
        window.location.href = '/thanks.html';
        return;
      }
      abortSubmit(originalLabel, '送信に失敗した。時間をおいて再度試みるか、別経路（メール）で連絡してほしい。');
    } catch (_err) {
      abortSubmit(originalLabel, '通信エラーが発生した。時間をおいて再度試みるか、別経路（メール）で連絡してほしい。');
    }
  });
})();
