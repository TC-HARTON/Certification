/* HARTON Certified — モバイルメニュー (WCAG 2.1.1 / 2.4.3 / 2.4.7 準拠)
 * Esc キーで閉じる + 閉じるボタン + フォーカストラップ + フォーカス復帰 */
(function () {
  'use strict';
  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobile-menu');
  var closeBtn = document.getElementById('menuClose');
  if (!toggle || !menu) return;

  var lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    menu.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'モバイルメニューを閉じる');
    // 開いたら最初のフォーカス可能要素に移動
    var firstFocusable = menu.querySelector('button, a, [tabindex]');
    if (firstFocusable) firstFocusable.focus();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'モバイルメニューを開く');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    } else {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', function () {
    if (menu.classList.contains('hidden')) open();
    else close();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  // Esc キーで閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
      e.preventDefault();
      close();
    }
  });

  // メニュー内のリンククリックで自動的に閉じる (UX 改善)
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      // ナビゲーション後に閉じる (transition 完了を待たない / 即時閉)
      close();
    }
  });

  // フォーカストラップ (Tab キーで menu 外に出ない)
  menu.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || menu.classList.contains('hidden')) return;
    var focusables = menu.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
