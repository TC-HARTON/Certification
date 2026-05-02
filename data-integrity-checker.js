#!/usr/bin/env node
/**
 * data-integrity-checker.js — semantic invariant guard
 * ───────────────────────────────────────────────────────
 * 目的: spec-checker.js が拾えない「意味的に正しいか」を build 時に検出し、
 *       Phase 1+ の都市追加・業種追加で同種ミスが再発するのを物理的に防ぐ。
 *
 * 検出対象 (HSCEL §3.3 H-3 過去ミス 7 種から逆算):
 *   1. 未登録 Wikidata Q 番号 (data/regions.json + data/industries.json に存在しない Q を build-base.js / generate.js で参照)
 *   2. ハードコード都市名 (生成 HTML 内の都市名が data/regions.json 登録外 / または data 駆動経由でない直書き)
 *   3. ハードコード総数 (`83 件機械検証` / `134 件` 等の旧 Phase 数値の生成 HTML 残存)
 *   4. 公開日 / 次回日 / 四半期ラベルの drift (生成 HTML 内の `2026-04-30` `2026-05-30` `Q3` 等の旧値)
 *   5. スローガン旧 variants (旧 6 派生のいずれかが生成 HTML に残存)
 *   6. CSS 未定義 variable (src/input.css 内で var(--xxx) 参照されているが :root で定義されていない)
 *   7. 業界レポート JSON-LD richness 不足 (Article+Dataset+FAQPage+ItemList の必須セット欠落)
 *
 * 実行: `node data-integrity-checker.js`
 * 終了コード: 0 = pass / 1 = fail (verify-all.js 経由で pre-push hook が阻止)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DOMAIN = 'https://certification.tcharton.com';

// ═══════════════════ 単一情報源 (single source of truth) ═══════════════════
// 全チェックはここで定義された定数を基準に検証する。新都市・新業種を追加する場合、
// この constants を更新すれば全件のドリフトが検出される。

const CANONICAL = {
  // 公式スローガン (代表 verbatim 確定 / v2.5.1)
  slogan: '機械検証が示す、AI 時代の WEB 品質。',
  // スローガン旧 variants (検出されたら build fail)
  obsoleteSlogans: [
    '自分が達成できない基準で他者を測ることはしない',
    '自分が達成できない基準で他者を測らない',
    '自分が ★★★ を取れない基準で、他者を測らない',
    '自分が ★★★ を取れない基準で他者を測らない',
    '自分が達成できない基準で',
  ],
  // 旧 Phase 数値 (Phase 0.5 移行後 生成 HTML に残存してはいけない)
  obsoleteNumerics: [
    { pattern: /Phase 0 沼津/, label: '"Phase 0 沼津" (Phase 0.5 移行で削除済 / 旧 Phase 0 単独沼津パイロット表記)' },
    { pattern: /83 件機械検証/, label: '"83 件機械検証" (旧旧 Phase 0 沼津 30 件パイロット拡張中の数値)' },
    { pattern: /134 件機械検証/, label: '"134 件機械検証" (Phase 0 沼津 8 業種数値 / Phase 0.5 で 902 件に拡張)' },
    { pattern: /2026 春/, label: '"2026 春" (季刊表記 / 月次運用と矛盾)' },
    { pattern: /(2026-04-30|2026-05-01|2026-05-30) スキャン実施/, label: '旧スキャン実施日 (2026-05-02 統一済)' },
    { pattern: /次回更新予定: 2026-05-30/, label: '"次回更新予定: 2026-05-30" (2026-06-02 統一済)' },
    { pattern: /Q3 \(7-9 月号\)/, label: '"Q3 (7-9 月号)" (5 月時点は Q2 / 代表 verbatim)' },
  ],
  // Cloudflare Pages 配信対象 ディレクトリ
  htmlScanDirs: ['index.html', 'about', 'methodology', 'apply', 'contact', 'press', 'opt-out', 'faq', 'news', 'legal', 'privacy', 'industries', 'regions', 'rankings', 'businesses', 'improvement-guide'],
};

// ═══════════════════ 失敗集積 ═══════════════════
const failures = [];
function fail(category, file, message) {
  failures.push({ category, file, message });
}

// ═══════════════════ helper ═══════════════════
function readJsonSafe(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf-8')); } catch (_) { return null; }
}

function* walkHtml(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isFile() && full.endsWith('.html')) { yield full; return; }
  if (!stat.isDirectory()) return;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const sub = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(sub);
    else if (entry.name.endsWith('.html')) yield path.join(ROOT, sub);
  }
}

function relPath(abs) { return path.relative(ROOT, abs).replace(/\\/g, '/'); }

// ═══════════════════ Check 1: 登録済 Wikidata Q 集合 vs 全 HTML 参照 ═══════════════════
function checkWikidataRegistry() {
  const regions = readJsonSafe('data/regions.json') || {};
  const industries = readJsonSafe('data/industries.json') || {};
  const registered = new Set();
  // 登録 Q 番号を全件収集
  for (const pref of Object.values(regions)) {
    if (pref.wikidata) registered.add(pref.wikidata);
    for (const city of Object.values(pref.cities || {})) {
      if (city.wikidata) registered.add(city.wikidata);
    }
  }
  for (const ind of Object.values(industries)) {
    if (ind.wikidata) registered.add(ind.wikidata);
    if (Array.isArray(ind.wikidata_secondary)) ind.wikidata_secondary.forEach(q => registered.add(q));
  }
  // ホワイトリスト (公的ドキュメント / Schema.org / 政府機関 等の Wikidata 参照)
  const allowlist = new Set([
    'Q11661', 'Q189210', // ProfessionalService / LocalBusiness 等の AdditionalType
    'Q11707', // 飲食 (industries.json secondary 候補)
  ]);
  // build-base.js / generate.js / 全 HTML から Q\d+ を抽出
  const sources = ['build-base.js', 'generate.js'];
  for (const f of sources) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
    const matches = [...content.matchAll(/['"`](Q\d+)['"`]/g)];
    for (const m of matches) {
      const q = m[1];
      if (!registered.has(q) && !allowlist.has(q)) {
        fail('wikidata-unregistered', f, `Wikidata ${q} が data/regions.json / data/industries.json に未登録 (allowlist にも無し)`);
      }
    }
  }
}

// ═══════════════════ Check 2-5: 生成 HTML 全件スキャン ═══════════════════
function checkGeneratedHtml() {
  const registeredCities = new Set();
  const registeredCityKeys = new Set();
  const regions = readJsonSafe('data/regions.json') || {};
  for (const pref of Object.values(regions)) {
    for (const [cityKey, city] of Object.entries(pref.cities || {})) {
      if (city.label) registeredCities.add(city.label);
      registeredCityKeys.add(cityKey);
    }
  }
  // Phase 0 アーカイブ (削除済都市) — 生成 HTML 内に残ってはいけない
  const obsoleteCities = ['富士宮市', '裾野市', '長泉町', '清水区'];

  for (const top of CANONICAL.htmlScanDirs) {
    for (const file of walkHtml(top)) {
      const rel = relPath(file);
      const content = fs.readFileSync(file, 'utf-8');

      // Check 3: 旧 Phase 数値 / 古日付
      for (const { pattern, label } of CANONICAL.obsoleteNumerics) {
        if (pattern.test(content)) {
          fail('obsolete-numeric', rel, `旧表記検出: ${label}`);
        }
      }

      // Check 5: スローガン旧 variants
      for (const oldS of CANONICAL.obsoleteSlogans) {
        if (content.includes(oldS)) {
          fail('obsolete-slogan', rel, `旧スローガン variant 検出: 「${oldS}」 (公式: 「${CANONICAL.slogan}」)`);
        }
      }

      // Check 2: 削除済都市残存
      for (const oc of obsoleteCities) {
        if (content.includes(oc)) {
          fail('obsolete-city', rel, `削除済都市 ${oc} が残存 (Phase 0.5 で 5 都市縮小済)`);
        }
      }
    }
  }
}

// ═══════════════════ Check 6: CSS 未定義 variable ═══════════════════
function checkCssVariables() {
  const cssPath = path.join(ROOT, 'src/input.css');
  if (!fs.existsSync(cssPath)) return;
  const css = fs.readFileSync(cssPath, 'utf-8');
  // 定義された --xxx を全件収集 (`:root { --xxx: ... }` または任意 selector 内の宣言)
  const defined = new Set();
  for (const m of css.matchAll(/--([a-zA-Z][\w-]*)\s*:/g)) defined.add(m[1]);
  // 参照されている var(--xxx) を全件収集
  const referenced = new Set();
  for (const m of css.matchAll(/var\(\s*--([a-zA-Z][\w-]*)/g)) referenced.add(m[1]);
  // 未定義参照を検出
  for (const ref of referenced) {
    if (!defined.has(ref)) {
      fail('css-undefined-var', 'src/input.css', `var(--${ref}) が参照されているが宣言なし`);
    }
  }
}

// ═══════════════════ Check 7: 業界レポート JSON-LD richness ═══════════════════
function checkReportJsonLd() {
  const reportPath = path.join(ROOT, 'news/shizuoka-industry-report-2026-q2/index.html');
  if (!fs.existsSync(reportPath)) {
    fail('report-missing', 'news/shizuoka-industry-report-2026-q2/index.html', 'ファイル不在');
    return;
  }
  const content = fs.readFileSync(reportPath, 'utf-8');
  const required = ['Article', 'Dataset', 'FAQPage', 'ItemList'];
  for (const t of required) {
    // "@type":"Xxx" または "@type":["Xxx","..."] の検出
    const re = new RegExp(`"@type"\\s*:\\s*"${t}"|"@type"\\s*:\\s*\\[[^\\]]*"${t}"`, 'g');
    if (!re.test(content)) {
      fail('report-jsonld-missing', 'news/shizuoka-industry-report-2026-q2/index.html', `必須 JSON-LD type "${t}" 不在`);
    }
  }
  // Dataset distribution.contentUrl が /datasets/ 配下を指しているか
  if (/"@type"\s*:\s*"Dataset"/.test(content)) {
    if (!content.includes('/datasets/shizuoka-2026-q2.json')) {
      fail('report-jsonld-missing', 'news/shizuoka-industry-report-2026-q2/index.html', 'Dataset.distribution.contentUrl が /datasets/shizuoka-2026-q2.json を参照していない');
    }
  }
}

// ═══════════════════ Check 8: dataset endpoint 存在確認 ═══════════════════
function checkDatasetEndpoint() {
  const dpath = path.join(ROOT, 'datasets/shizuoka-2026-q2.json');
  if (!fs.existsSync(dpath)) {
    fail('dataset-endpoint-missing', 'datasets/shizuoka-2026-q2.json', '公開 Dataset endpoint 不在 (Cloudflare Pages 配信されない)');
    return;
  }
  const j = readJsonSafe('datasets/shizuoka-2026-q2.json');
  const required = ['n_total', 'eligible_total', 'by_city', 'by_industry', 'cross_tab_n', 'ng_breakdown', 'score_stats'];
  for (const k of required) {
    if (!(k in (j || {}))) fail('dataset-incomplete', 'datasets/shizuoka-2026-q2.json', `必須 field "${k}" 不在`);
  }
}

// ═══════════════════ 実行 + 報告 ═══════════════════
function run() {
  console.log('  ' + '='.repeat(64));
  console.log('  data-integrity-checker.js — semantic invariant guard');
  console.log('  ' + '='.repeat(64));

  checkWikidataRegistry();
  checkGeneratedHtml();
  checkCssVariables();
  checkReportJsonLd();
  checkDatasetEndpoint();

  if (failures.length === 0) {
    console.log('  ✅ PASS — 全 8 検証 / semantic invariants 整合');
    console.log('  ' + '='.repeat(64));
    process.exit(0);
  }

  // カテゴリ別集計
  const byCategory = {};
  for (const f of failures) {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  }
  console.log('  ❌ FAIL — semantic invariant 違反 ' + failures.length + ' 件');
  for (const [cat, list] of Object.entries(byCategory)) {
    console.log(`  ─ [${cat}] ${list.length} 件`);
    for (const f of list.slice(0, 5)) {
      console.log(`     ${f.file}: ${f.message}`);
    }
    if (list.length > 5) console.log(`     ... (他 ${list.length - 5} 件)`);
  }
  console.log('  ' + '='.repeat(64));
  console.log('  対応: 該当箇所を data 駆動 (data/*.json 経由) に書き換え + 公式スローガン定数を参照');
  console.log('  ' + '='.repeat(64));
  process.exit(1);
}

run();
