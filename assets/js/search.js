/**
 * HARTON Stella — 検索フォーム ルーター (generate.js 自動生成 / 手動編集禁止)
 * ─────────────────────────────────────────
 * SPEC v3.4 §1.0 / §8.1 (CSP script-src 'self') 準拠
 * GEO-STANDARDS §G-3 §G-6 (位置最適化 / Lead Evidence) 連動
 * MASTER-PLAN ★区分物語 連動 (rating hash で着地ページに期待値表示)
 *
 * 動作:
 *   業種 × 地域 × ★区分 select の組合せから、
 *   既存の静的ページ URL を whitelist 方式で組立てて遷移する。
 *   未知 key / disabled option は遷移不可 (open redirect 防止)。
 *   Trusted Types 制約下で innerHTML 等の DOM 書換えは一切使用しない。
 *
 * Phase 1 拡大時:
 *   data/regions.json + data/industries.json に追加 → node generate.js で自動再生成。
 */
(function () {
  'use strict';

  var form = document.getElementById('search-form');
  if (!form) return;

  var INDUSTRY_KEYS = ["tax-accountant","lawyer","judicial-scrivener","administrative-scrivener","real-estate","restaurant","beauty","cosmetic-clinic","lodging","clinic","cram-school"];
  var REGION_KEYS = ["shizuoka","shizuoka/numazu","shizuoka/mishima","shizuoka/fuji","shizuoka/shizuoka","shizuoka/hamamatsu","tokyo","tokyo/shibuya"];
  var RATING_KEYS = ["1star","2star","3star"];

  function isAllowed(value, list) {
    if (!value) return true;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === value) return true;
    }
    return false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var industryEl = document.getElementById('search-industry');
    var regionEl = document.getElementById('search-region');
    var ratingEl = document.getElementById('search-rating');

    var industry = industryEl ? industryEl.value : '';
    var region = regionEl ? regionEl.value : '';
    var rating = ratingEl ? ratingEl.value : '';

    if (!isAllowed(industry, INDUSTRY_KEYS)) industry = '';
    if (!isAllowed(region, REGION_KEYS)) region = '';
    if (!isAllowed(rating, RATING_KEYS)) rating = '';

    var path;
    if (region && industry) {
      path = '/regions/' + region + '/industries/' + industry + '/';
    } else if (region) {
      path = '/regions/' + region + '/';
    } else if (industry) {
      path = '/industries/' + industry + '/';
    } else {
      path = '/regions/';
    }

    if (rating) path += '#' + rating;

    window.location.assign(path);
  });
})();
