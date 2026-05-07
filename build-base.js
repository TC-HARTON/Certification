#!/usr/bin/env node
/**
 * HARTON Certified 基盤 17 ページ構築スクリプト
 * ─────────────────────────────────────────
 * 目的: MASTER-PLAN §4.1 / SPEC v3.4 §1.0 / §4.2 / §8.1 / §11.x / GEO 整合の 17 基盤ページを生成
 * 設計: 各ページの本文・JSON-LD・Lead Evidence は本書内にハンド執筆
 *       共通 boilerplate（head meta / CSP / OGP / favicon / header / footer / mobile menu）は templates/_layout.html で統一
 *
 * 生成対象（MASTER-PLAN §4.1 + getVariant 準拠）:
 *   marketing : index.html / apply / contact
 *   reading   : about / methodology + 4 / improvement-guide / press / opt-out / faq / news / legal / privacy / 404
 *
 * 完了条件: `node spec-checker.js` → FAIL=0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DOMAIN = 'https://certification.tcharton.com';

// ═══════════════════ data 読込 (TOP 検索バー全国対応 / 動的生成) ═══════════════════
// MASTER-PLAN §0.5 ロードマップ「Phase 4 で 47 都道府県」前提で data 駆動構造を堅持。
// build-base.js のハードコード違反 (代表指摘 2026-04-30) を解消し、industries.json /
// regions.json の追加だけで自動的に検索バー option が拡張される設計に統一。
const industriesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'industries.json'), 'utf-8'));
const regionsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'regions.json'), 'utf-8'));

// Phase 0.5 静岡県 5 都市 11 業種結果集計 (④ scanner 出力 / ⑤ で業界レポート 2026 Q2 (4-6 月号)に展開)
// INSTRUCTION-FROM-ROOT.md v1.12.2 §(A) + v1.13 (5 都市 / 11 業種一律化) 連動
const shizuokaSummary = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'phase-0.5-shizuoka-summary.json'), 'utf-8'));
// 旧 schema との互換キー（テンプレ側で .industries / .eligible_total を参照するため）
shizuokaSummary.industries = shizuokaSummary.by_industry;

/** 現在の運用 Phase (MASTER-PLAN §0.5 ロードマップ準拠 / Phase 0 = 沼津パイロット稼働中)
 *  data/regions.json 内の `phase` ≤ CURRENT_PHASE のみ enable、それ以外は disabled + (準備中) 表示 */
const CURRENT_PHASE = 1;

/** TOP 検索バー業種 select options を data/industries.json から動的生成
 *  scanner ④ INDUSTRY_WIKIDATA_MAP との整合は scanner_category フィールドで段階整備予定 */
function buildIndustryOptions() {
  return Object.entries(industriesData)
    .map(([key, v]) => `          <option value="${key}">${v.label}</option>`)
    .join('\n');
}

/** TOP 検索バー地域 select options を data/regions.json から動的生成
 *  47 都道府県 × 市町村のグループ構造で <optgroup> + <option> 出力 (HTML 標準)
 *  phase ≤ CURRENT_PHASE のみ enable / 未開始地域は disabled + (準備中) 表示 (Reviewer M-1) */
function buildRegionOptions() {
  const groups = Object.entries(regionsData).map(([prefKey, pref]) => {
    const prefDisabled = (pref.phase ?? 0) > CURRENT_PHASE ? ' disabled' : '';
    const prefSuffix = prefDisabled ? '（準備中）' : '';
    const prefOption = `          <option value="${prefKey}"${prefDisabled}>${pref.label} 全域${prefSuffix}</option>`;
    const cityOptions = Object.entries(pref.cities || {})
      .map(([cityKey, city]) => {
        const cityDisabled = (city.phase ?? 0) > CURRENT_PHASE ? ' disabled' : '';
        const citySuffix = cityDisabled ? '（準備中）' : '';
        return `            <option value="${prefKey}/${cityKey}"${cityDisabled}>${pref.label} ${city.label}${citySuffix}</option>`;
      })
      .join('\n');
    return `          <optgroup label="${pref.label}">\n${prefOption}\n${cityOptions}\n          </optgroup>`;
  }).join('\n');
  return groups;
}

const INDUSTRY_OPTIONS_HTML = buildIndustryOptions();
const REGION_OPTIONS_HTML = buildRegionOptions();
const INDUSTRY_COUNT = Object.keys(industriesData).length;
const REGION_PREF_COUNT = Object.keys(regionsData).length;
const REGION_CITY_COUNT = Object.values(regionsData).reduce((sum, p) => sum + Object.keys(p.cities || {}).length, 0);

// ═══════════════════ ユーティリティ ═══════════════════
function readFile(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf-8'); }
function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}
function substitute(template, ctx) {
  return template.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, (_, key) => {
    const v = key.split('.').reduce((o, k) => (o == null ? null : o[k]), ctx);
    return v == null ? '' : String(v);
  });
}

const layoutTpl = readFile('templates/_layout.html');

function applyLayout({ pageType, variant, navActive, title, description, canonicalPath, robots, ogType = 'website', mainContent, breadcrumbs = [], additionalJsonLd = [] }) {
  const themeColor = variant === 'marketing' ? '#FAF8F3' : '#0F172A';
  const colorScheme = variant === 'marketing' ? 'light' : 'dark';
  const bodyClass = variant === 'marketing'
    ? 'bg-white text-dark-700 font-sans antialiased'
    : 'bg-dark-900 text-dark-300 font-sans antialiased';

  const breadcrumbsJsonLd = breadcrumbs.length > 0
    ? `<script type="application/ld+json">\n${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem', position: i + 1, name: b.name, item: DOMAIN + b.path,
        })),
      }, null, 2)}\n</script>`
    : '';

  const additionalJsonLdStr = additionalJsonLd
    .map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`)
    .join('\n\n');

  const ctx = {
    lang: 'ja', title, description,
    canonical_path: canonicalPath,
    robots: robots || 'index, follow, max-image-preview:large, max-snippet:-1',
    og_type: ogType,
    og_image_path: '/ogp.png',
    theme_color: themeColor,
    color_scheme: colorScheme,
    body_class: bodyClass,
    breadcrumbs_jsonld: breadcrumbsJsonLd,
    additional_jsonld: additionalJsonLdStr,
    main_content: mainContent,
    nav_active_search: navActive === 'search' ? 'aria-current="page"' : '',
    nav_active_methodology: navActive === 'methodology' ? 'aria-current="page"' : '',
    nav_active_apply: navActive === 'apply' ? 'aria-current="page"' : '',
    nav_active_about: navActive === 'about' ? 'aria-current="page"' : '',
    nav_active_press: navActive === 'press' ? 'aria-current="page"' : '',
  };
  return substitute(layoutTpl, ctx);
}

// ═══════════════════ ページ別 JSON-LD 補助 ═══════════════════
function bcl(items) {
  return items.map(([name, p]) => ({ name, path: p }));
}

const FAQ_TOP = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'HARTON Certified は何を評価するのか？', acceptedAnswer: { '@type': 'Answer', text: 'WEB サイトの品質を 4 軸（基礎・防御・AI 検索・経営インパクト）で機械検証し、総合 70 点以上 + 致命的 NG ゼロを満たす事業者を ★ 以上で認定する。' } },
    { '@type': 'Question', name: '掲載は有料か？', acceptedAnswer: { '@type': 'Answer', text: '無料である。HARTON Certified は完全中立・金銭非依存で運用し、課金で順位を買えるサービスではない。' } },
    { '@type': 'Question', name: '評価項目は公開されているか？', acceptedAnswer: { '@type': 'Answer', text: '評価項目・閾値・実施手順は /methodology/ ですべて公開している。再現性のある機械検証である。' } },
    { '@type': 'Question', name: '掲載を拒否したい場合は？', acceptedAnswer: { '@type': 'Answer', text: '/opt-out/ より理由不要で 24 時間以内に対応する。再掲載は事業者の明示申請がない限り行わない。' } },
    { '@type': 'Question', name: '食べログとは何が違うのか？', acceptedAnswer: { '@type': 'Answer', text: '食べログは口コミで業務品質を評価する。HARTON Certified は機械検証で WEB 品質を評価する。評価軸が独立で、両立は補完関係である。' } },
  ],
};

// PERSON_FOUNDER は個人前面廃止により削除 (代表 UX フィードバック「全体的に個人名不要」/ 2026-04-28)

// ═══════════════════ ページ定義 ═══════════════════
const PAGES = [];

// ─── 1. TOP（full / marketing）─────────────────────
PAGES.push({
  path: 'index.html',
  variant: 'reading',
  navActive: '',
  title: 'HARTON Certified — 機械検証 WEB 品質認定機関',
  description: 'HARTON Certified は WEB 品質を機械検証 (2,554 項目 / 4 軸) で公正評価する金銭非依存・評価基準全公開型の独立認定機関。Sクラス WEB の普及を支える。完全中立・金銭非依存、★ 以上のみ掲載のポジティブセレクション。',
  canonicalPath: '/',
  ogType: 'website',
  breadcrumbs: bcl([['HARTON Certified トップ', '/']]),
  additionalJsonLd: [FAQ_TOP],
  mainContent: `
<article>
  <section aria-label="マニフェスト" class="hero-manifest">
    <p class="hero-eyebrow">HARTON Certified — 機械検証で WEB 品質を評価する独立認定機関</p>
    <h1 class="hero-h1">機械検証が示す、AI 時代の WEB 品質。</h1>
    <p class="hero-manifest-text">「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」</p>
    <div class="hero-cta-row">
      <a href="/methodology/" class="hero-cta-primary">評価方法を見る</a>
      <a href="/apply/" class="hero-cta-secondary">掲載申請（無料）</a>
    </div>
  </section>
  <section aria-label="冒頭エビデンス（Lead Evidence Block）">
    <p>HARTON Certified は、<strong>2,554 項目</strong>の機械検証で WEB 品質を公正に測る、<strong>金銭非依存・評価基準全公開型の独立認定機関</strong>である。掲載料・認定料・広告料を一切徴収せず、評価項目・閾値・実施手順は <a href="/methodology/">methodology</a> で全て開示する。全国の事業者の Sクラス WEB 普及を支えるため、4 軸の客観評価を 2026 年に開始した。沼津起点での自己実証（自社サイト ★★★ 取得 / dogfooding 倫理）を基盤とし、地方都市から再定義する WEB 品質の民主化を推進する。出典: <a href="https://www.digital.go.jp/resources/govdashboard/local-government-dx#guidance2" rel="nofollow noopener noreferrer" target="_blank">日本政府・公的機関</a>（HSTS / WCAG / Core Web Vitals 等の公的基準に準拠）。</p>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026 年 4 月 27 日 公開</time> ／ <time datetime="2026-04-30" itemprop="dateModified">2026-04-30 v1.1.7 ブランド戦略整合改訂</time></p>
    <p>機械検証による公正評価を通じて、地域から全国へ、Sクラス WEB サイトの普及を支える。Phase 0.5（静岡県 5 都市 ${shizuokaSummary.n_total} 件機械検証実測 / 11 業種 / 2026-05-01）から始まり、Phase 4（2027 年）で全 47 都道府県 10,000 件以上の認定を目標とする。</p>
  </section>
  <section aria-label="認定店舗を絞り込む" class="search-section">
    <h2>認定店舗を絞り込む</h2>
    <p class="search-lede"><strong>機械が客観検証で選んだ</strong>優良サイトを、業種・地域・★区分で絞り込む。AI 時代の信頼を持つ事業者を、人より先に発見する。現在 <strong>${INDUSTRY_COUNT}</strong> 業種 / <strong>${REGION_PREF_COUNT}</strong> 都道府県 <strong>${REGION_CITY_COUNT}</strong> 市町村に対応（MASTER-PLAN §0.5 ロードマップ目標: Phase 4 で全 47 都道府県・全国 10,000+ 件展開予定）。</p>
    <form id="search-form" action="/regions/" method="GET" class="search-form" role="search">
      <div class="search-field">
        <label for="search-industry">業種</label>
        <select id="search-industry" name="industry">
          <option value="">すべての業種（${INDUSTRY_COUNT} 業種）</option>
${INDUSTRY_OPTIONS_HTML}
        </select>
      </div>
      <div class="search-field">
        <label for="search-region">地域</label>
        <select id="search-region" name="region">
          <option value="">すべての地域（${REGION_PREF_COUNT} 都道府県 / ${REGION_CITY_COUNT} 市町村）</option>
${REGION_OPTIONS_HTML}
        </select>
      </div>
      <div class="search-field">
        <label for="search-rating">★区分</label>
        <select id="search-rating" name="rating">
          <option value="">すべての認定（全件）</option>
          <option value="3star">★★★ のみ（HARTON S-Class）</option>
          <option value="2star">★★ 以上（HARTON 優良 + S-Class）</option>
          <option value="1star">★ 以上（HARTON Certified 以上）</option>
        </select>
      </div>
      <div class="search-field search-field-submit">
        <button type="submit">絞り込む</button>
      </div>
    </form>
    <script src="/assets/js/search.js" defer></script>
  </section>
  <section aria-label="注目認定 rail" class="featured-rail-section">
    <h2>Phase 0.5 機械検証実測の公開</h2>
    <p class="featured-rail-lede">HARTON Certified は機械検証 4 軸（基礎・防御・AI 検索・経営インパクト）で WEB 品質を客観評価する独立認定機関。Phase 0.5 静岡県 5 都市 11 業種 <strong>${shizuokaSummary.n_total}</strong> 件機械検証で <strong>★ 獲得率 0.0%</strong>（${shizuokaSummary.eligible_total}/${shizuokaSummary.n_total}）/ 業界最高点 <strong>${shizuokaSummary.score_stats.max}</strong> 点 / 致命的 NG <strong>${shizuokaSummary.ng_pct.toFixed(1)}%</strong>。Phase 1 で全国順次拡大予定。</p>
    <ul class="featured-rail" role="list">
      <li class="featured-card">
        <div class="featured-card-thumb">
          <span class="featured-card-rating" role="img" aria-label="★★★ HARTON S-Class Certified"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span>
          <span class="featured-card-thumb-label" aria-hidden="true">tcharton.com</span>
        </div>
        <div class="featured-card-body">
          <h3 class="featured-card-name">自己実証体 第 1 号: tcharton.com</h3>
          <p class="featured-card-meta">IT・WEB 制作 ／ 静岡県沼津市</p>
          <p class="featured-card-note">scanner 実機判定で <strong>総合 90 点 / 必須 4/4 + 1 保留 / 致命的 NG 0 / NAP 100</strong>。dogfooding 倫理に基づく自己実証体。</p>
          <a href="/case-studies/tcharton-com/" class="featured-card-link">課題 → 改善 → 取得 の詳細 (7 commit timeline) を見る →</a>
        </div>
      </li>
      <li class="featured-card">
        <div class="featured-card-thumb">
          <span class="featured-card-rating" role="img" aria-label="Phase 0.5 静岡県 5 都市 902 件機械検証実測 / ★ 認定 0 件"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="opacity:0.4"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span>
          <span class="featured-card-thumb-label" aria-hidden="true">Phase 0.5 完了</span>
        </div>
        <div class="featured-card-body">
          <h3 class="featured-card-name">静岡県 5 都市 ${shizuokaSummary.n_total} 件機械検証実測 (11 業種)</h3>
          <p class="featured-card-meta">2026-05-01 スキャン完了 ／ 5 都市（沼津・三島・富士・静岡・浜松）× 11 業種（税理士・弁護士・司法書士・行政書士・不動産・飲食・美容院・美容クリニック・宿泊・クリニック・学習塾）</p>
          <p class="featured-card-note"><strong>★ 認定 0 件</strong> ／ 致命的 NG <strong>${shizuokaSummary.ng_pct.toFixed(1)}%</strong>（${shizuokaSummary.ng_total_companies}件）／ 業界中央値 <strong>${shizuokaSummary.score_stats.median}</strong> 点 ／ 業界 max <strong>${shizuokaSummary.score_stats.max}</strong> 点。実態は隠さず堂々と公開する透明性の証明。</p>
          <a href="/news/shizuoka-industry-report-2026-q2/" class="featured-card-link">静岡 5 都市レポート Q2 を見る →</a>
        </div>
      </li>
      <li class="featured-card">
        <div class="featured-card-thumb">
          <span class="featured-card-thumb-label" aria-hidden="true">5 都市比較</span>
        </div>
        <div class="featured-card-body">
          <h3 class="featured-card-name">静岡県 5 都市 WEB 品質比較</h3>
          <p class="featured-card-meta">${shizuokaSummary.n_total} 件 / 11 業種横断 ／ 業界最高点降順</p>
          <p class="featured-card-note">沼津・三島・富士・静岡・浜松を <strong>★ 認定取得率 / 業界最高点 / 致命的 NG%</strong> で横並び比較。都市 × 業種 cross-tab マトリクスで業種別の偏りも可視化 (CC BY 4.0 / 機械可読 Dataset 公開)。</p>
          <a href="/comparison/regions/shizuoka/" class="featured-card-link">5 都市比較を見る →</a>
        </div>
      </li>
      <li class="featured-card featured-card-placeholder">
        <div class="featured-card-thumb">
          <span class="featured-card-thumb-label" aria-hidden="true">展開予定</span>
        </div>
        <div class="featured-card-body">
          <h3 class="featured-card-name">Phase 1 類似地方都市展開</h3>
          <p class="featured-card-meta">〜2026-09 ／ 倉敷・四日市・松本・盛岡 等（人口 15-25 万人規模）</p>
          <p class="featured-card-note">隣接市ではなく <strong>類似地方都市</strong>を優先展開（MASTER-PLAN §2.8.3）。沼津起点での実証を全国の地方事業者にとっての「届きうる頂点」へ拡張し、<strong>WEB 品質の民主化</strong>と<strong>地方都市から再定義</strong>を実装する。</p>
          <a href="/methodology/" class="featured-card-link">評価方法を見る →</a>
        </div>
      </li>
    </ul>
  </section>
  <section aria-label="3 つの差別化要素">
    <h2>3 つの差別化要素</h2>
    <ul>
      <li>機械検証 × WEB 品質: 口コミではなく 4 軸の客観評価。</li>
      <li>完全中立 × ポジティブセレクション: ★ 以上のみ掲載、★無しサイトは公開しない。</li>
      <li>AI 検索時代対応 × 改善導線: GEO / LLMO 最適化を評価軸に含む。</li>
    </ul>
  </section>
  <section aria-label="4 セグメント別 CTA">
    <h2>あなたへの導線</h2>
    <ul>
      <li><a href="/regions/shizuoka/numazu/">A: 認定店舗を探す（消費者）</a> —「<strong>AI が推薦する店を、人より先に見つけられる</strong>」</li>
      <li><a href="/improvement-guide/">B: バッジ取得・改善（既掲載事業者）</a> —「<strong>掲載が、最高の営業ツールになる</strong>」</li>
      <li><a href="/apply/">C: 掲載申請（未掲載事業者）</a> —「<strong>自分も S クラスへ</strong>」</li>
      <li><a href="/press/">D: 取材依頼（メディア）</a> —「<strong>機械が選んだ、地方の至宝</strong>」</li>
    </ul>
  </section>
  <section aria-label="★区分の物語" class="distinction-cards-section">
    <h2>★区分の物語</h2>
    <p class="distinction-lede">4 つの観点（A 基礎・B 防御・C AI 検索・D 経営）で並列独立評価し、各観点の項目別減点を合算する（MASTER-PLAN §3.2）。各 ★区分は、機械検証スコアと S 条件達成度に応じて、固有の<strong>物語</strong>を持つ。</p>
    <ul class="distinction-cards" role="list">
      <li class="distinction-card distinction-1">
        <div class="distinction-card-rating" role="img" aria-label="HARTON Certified ★（1 つ星）">
          <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg>
        </div>
        <h3 class="distinction-card-title">HARTON Certified</h3>
        <p class="distinction-card-story">「AI 時代の信頼を体現する」</p>
        <dl class="distinction-card-criteria">
          <dt>総合スコア</dt><dd>70 点以上（B 以上）</dd>
          <dt>致命的 NG</dt><dd>0 件必須</dd>
          <dt>S 条件</dt><dd>不問（控えめな認定 / 入口）</dd>
        </dl>
      </li>
      <li class="distinction-card distinction-2">
        <div class="distinction-card-rating" role="img" aria-label="HARTON 優良 ★★（2 つ星）">
          <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg>
        </div>
        <h3 class="distinction-card-title">HARTON 優良</h3>
        <p class="distinction-card-story">「地域を代表する WEB 品質」</p>
        <dl class="distinction-card-criteria">
          <dt>総合スコア</dt><dd>80 点以上（A）</dd>
          <dt>致命的 NG</dt><dd>0 件必須</dd>
          <dt>S 条件</dt><dd>4 件以上達成（誇り・上品）</dd>
        </dl>
      </li>
      <li class="distinction-card distinction-3">
        <div class="distinction-card-rating" role="img" aria-label="HARTON S-Class Certified ★★★（3 つ星 / 最高位）">
          <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg>
          <svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg>
        </div>
        <h3 class="distinction-card-title">HARTON S-Class Certified</h3>
        <p class="distinction-card-story">「業界の頂点に立つ WEB 品質」</p>
        <dl class="distinction-card-criteria">
          <dt>総合スコア</dt><dd>90 点以上（S）</dd>
          <dt>致命的 NG</dt><dd>0 件必須</dd>
          <dt>S 条件</dt><dd>5/5 完全達成（業界ベンチマーク）</dd>
        </dl>
      </li>
    </ul>
    <p class="distinction-cards-footer">出典: <a href="/methodology/">評価方法（4 軸機械検証 全公開）</a> / 物語文言: ① 確定（CRITICAL-ISSUES-REPORT v1.1.14 §21.1.4）</p>
  </section>
  <section aria-label="運用方針">
    <h2>運用方針（5 原則）</h2>
    <ol>
      <li>透明性: 全評価項目を /methodology/ で公開</li>
      <li>客観性: 機械検証のみ（主観排除）</li>
      <li>ポジティブセレクション: ★ 以上のみ掲載</li>
      <li>公平性: HARTON との取引関係に依存しない</li>
      <li>進化: 年次基準改訂、過去評価はアーカイブ保持</li>
    </ol>
  </section>
</article>`,
});

// ─── 2. about（subpage / reading / E-E-A-T 担保 / v1.1.7 ブランド戦略整合）─────
PAGES.push({
  path: 'about/index.html',
  variant: 'reading',
  navActive: 'about',
  title: 'サイトについて — HARTON Certified の理念と自己実証体としての信頼根拠',
  description: 'HARTON Certified（運営: T.C.HARTON）の理念と dogfooding 倫理に基づく自己実証型認定機関の信頼根拠。沼津起点の自己実証（自社 ★★★ 取得）+ 地方都市から再定義する WEB 品質の民主化を運営方針とする。',
  canonicalPath: '/about/',
  breadcrumbs: bcl([['トップ', '/'], ['サイトについて', '/about/']]),
  mainContent: `
<article>
  <header>
    <h1>サイトについて</h1>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time> ／ <time datetime="2026-05-04" itemprop="dateModified">2026-05-04 v1.18 ストーリーテリング統合</time></p>
  </header>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は <strong>2026 年 4 月</strong>、静岡県沼津市で T.C.HARTON が立ち上げた、<strong>金銭非依存・評価基準全公開型</strong>の独立認定機関である。掲載料・認定料・広告料を一切徴収せず、評価項目・閾値・実施手順は <a href="/methodology/">methodology</a> で全て開示する。沼津起点で自社サイト tcharton.com を機械検証し ★★★（HARTON S-Class）を取得した自己実証体 第 1 号として、業界の WEB 品質改善のため運営する (dogfooding 倫理)。出典: <a href="https://www.digital.go.jp/resources/govdashboard/local-government-dx#guidance2" rel="nofollow noopener noreferrer" target="_blank">デジタル庁（地方 DX の現状）</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「機械検証が示す、AI 時代の WEB 品質。」 — HARTON Certified 信頼根拠の核（MASTER-PLAN §2.0.4）
    </blockquote>
  </section>
  <section aria-label="マニフェスト">
    <h2>マニフェスト</h2>
    <p><strong>「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」</strong></p>
    <p>人間の主観や金銭、規模に依存しない。4 軸（基礎・防御・AI 検索・経営）の機械検証で、誰もが再現可能な手順で到達できる頂点。それは「努力の結果」ではなく、「思想の到達点」である。ここに名を連ねる事業者は、AI 時代の信頼を定義する灯台となる（MASTER-PLAN §2.0 マニフェスト 50 字 + 副文 200 字）。</p>
  </section>
  <section aria-label="私たちの信頼根拠">
    <h2>私たちの信頼根拠（自己実証体・dogfooding 倫理）</h2>
    <p>HARTON Certified は、世界中のどの認定機関とも異なる。評価ロジックは <strong>scanner.py</strong> という独自開発の機械検証エンジンで、<strong>4 軸並列独立評価 + 必須 5 条件 + 致命的 NG 4 項目</strong> で構成される。この基準を、まず<strong>自社サイト tcharton.com で実証し、★★★ を取得した</strong>。</p>
    <p><strong>「機械検証が示す、AI 時代の WEB 品質。」</strong>――それが、HARTON Certified の唯一無二の信頼根拠である（MASTER-PLAN §2.0.4 信頼根拠の核 300 字 verbatim）。</p>
    <p>本機関は dogfooding 倫理（自社製品＝評価基準を自社で適用する倫理規範）を 3 階層で運用する:</p>
    <ul>
      <li><strong>L1 自己適用</strong>: 自社サイト tcharton.com が認定基準で評価される（scanner.py 月次再判定 (四半期末レポート集計)）</li>
      <li><strong>L2 自己拘束</strong>: 評価結果は<strong>自己例外なし</strong>で適用される（致命的 NG / 降格条件は事業者と同条件 / tcharton.com 自身の致命的 NG 検出時は即時非掲載状態に切替）</li>
      <li><strong>L3 自己公開</strong>: 機械検証ログを全件 verbatim 公開する（評価の透明性 / 第三者検証可能性）</li>
    </ul>
    <p>これにより認定機関は「自社の基準を都合よく緩める」インセンティブを構造的に排除する（MASTER-PLAN §3.0.5 自己実証型認定の倫理規範）。</p>
  </section>
  <section aria-label="沼津起点の戦略的必然性">
    <h2>沼津起点と地方都市から再定義する WEB 品質の民主化</h2>
    <p>沼津は人口約 19 万人の静岡県東部の地方都市である。東京・大阪の制作会社が東京で ★★★ を取得しても「<strong>金と人手があれば当然</strong>」と見られる。沼津という地方都市で、tcharton.com が ★★★ を取得した事実こそ、AI 時代における <strong>「機械評価は資本に依存しない」</strong> ことの実証となる。</p>
    <p>本機関は東京中心の権威構造ではなく、<strong>地方都市から再定義</strong>する WEB 品質基準を運用する。沼津起点の実証を、Phase 1 で類似地方都市（倉敷・四日市・松本・盛岡 等）へ展開し、全国の地方事業者にとっての <strong>「届きうる頂点」</strong> という民主化メッセージを実装する（MASTER-PLAN §2.8 沼津起点の戦略的必然性）。</p>
    <p>関連: <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>（沼津市 ★ 獲得率 0/83 = 0.0% / 業種別 ★ 獲得率 + 業界最高点 一覧）</p>
  </section>
  <section aria-label="自己実証 ストーリー要約" class="about-story-summary">
    <h2>自己実証体 第 1 号: tcharton.com の 3 段ストーリー</h2>
    <p>運営主体 T.C.HARTON の自社サイト tcharton.com は、HARTON Certified の評価基準を最初に適用された自己実証体 第 1 号である。「<strong>機械検証が示す、AI 時代の WEB 品質。</strong>」を実証するため、自社サイトを認定基準まで引き上げる過程を以下 3 段で公開する:</p>
    <ol class="about-story-3step">
      <li><strong>課題</strong>: 初期スコア <strong>C/65</strong> (★ 認定基準 70 点未達 / scanner.py 機械検証で発覚)</li>
      <li><strong>改善</strong>: 7 commit + 住所完全公開 (HSTS preload / CSP / JSON-LD 配列化 / GBP 連携 / NAP 100)</li>
      <li><strong>取得</strong>: 🏆 <strong>S/90 (★★★ HARTON S-Class)</strong> commit <code>36d4328</code> (2026-04-27 / 必須 4/4 + 致命的 NG 0 / NAP 100)</li>
    </ol>
    <p><a href="/case-studies/tcharton-com/"><strong>課題 → 改善 → 取得 の詳細 (verbatim 7 commit timeline) を見る →</strong></a></p>
  </section>
  <section aria-label="運営体制">
    <h2>運営体制</h2>
    <p>HARTON Certified は T.C.HARTON が 2026 年 4 月に立ち上げた、金銭非依存・評価基準全公開型の独立認定機関である。Phase 1（類似地方都市 200 件）以降は弁護士・プロデザイナー・PR 会社との外部提携を予定する。商標登録は Phase 1 完了時に着手する。</p>
    <p>運営拠点: 〒410-0022 静岡県沼津市大岡2690 / Cloudflare Workers Static Assets で配信 / scanner.py 月次再判定 + 四半期末レポート公開 (Q1/Q2/Q3/Q4)。</p>
    <p>運営方針: 「業界の WEB 品質改善のため」が動機であり、「自社の集客のため」ではない（中立性表現原則）。</p>
  </section>
  <section aria-label="関連リンク">
    <h2>関連リンク</h2>
    <ul>
      <li><a href="/case-studies/tcharton-com/">自己実証体 第 1 号 詳細 (★★★ HARTON S-Class 取得 7 commit timeline)</a></li>
      <li><a href="/methodology/">評価方法（4 軸の全公開 + S クラス哲学的定義 + dogfooding 倫理）</a></li>
      <li><a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)（業界実測の透明公開）</a></li>
      <li><a href="/apply/">掲載申請（未掲載事業者向け / 中立性整合）</a></li>
      <li><a href="/improvement-guide/">改善ガイダンス（★ 区分昇格の実践手順）</a></li>
    </ul>
  </section>
</article>`,
  additionalJsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': ['Article', 'AboutPage'],
      '@id': `${DOMAIN}/about/#article`,
      headline: 'HARTON Certified の理念と自己実証体としての信頼根拠',
      description: 'WEB 品質を機械検証で公正に評価する地方発の独立認定機関 HARTON Certified の理念、dogfooding 倫理、自己実証型認定構造、沼津起点の地方都市から再定義するブランド戦略。',
      datePublished: '2026-04-27',
      dateModified: '2026-05-02',
      inLanguage: 'ja',
      isAccessibleForFree: true,
      author: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'HARTON Certified' },
      publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'T.C.HARTON', url: 'https://tcharton.com/' },
      mainEntityOfPage: `${DOMAIN}/about/`,
      about: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'HARTON Certified' },
    },
  ],
});

// ─── 3. methodology（hub / reading）──────────────────
PAGES.push({
  path: 'methodology/index.html',
  variant: 'reading',
  navActive: 'methodology',
  title: '評価方法 — HARTON Certified の 4 軸機械検証',
  description: 'HARTON Certified の 4 軸機械検証（基礎・防御・AI 検索・経営インパクト）の概観と各軸詳細。評価項目・閾値・実施手順を完全公開する透明性の中核ページ。',
  canonicalPath: '/methodology/',
  breadcrumbs: bcl([['トップ', '/'], ['評価方法', '/methodology/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は WEB サイトを <strong>4 つ</strong>の観点で並列独立評価する。各観点は scanner.py で <strong>45</strong>+ 項目を機械検証し、合計 <strong>2554</strong> 項目の SPEC v3.4.2 と整合する。本機関は dogfooding 倫理（自己実証体としての自社サイト ★★★ 取得）と地方都市から再定義する WEB 品質の民主化を運営方針とする。出典: <a href="https://web.dev/articles/vitals" rel="nofollow noopener noreferrer" target="_blank">Google Web Vitals 公式</a> / <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="nofollow noopener noreferrer" target="_blank">W3C WCAG 2.2</a>。</p>
    <blockquote cite="${DOMAIN}/about/">
      「機械検証が示す、AI 時代の WEB 品質。」 — HARTON Certified 信頼根拠の核（MASTER-PLAN §2.0.4）
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time> ／ <time datetime="2026-04-30" itemprop="dateModified">2026-04-30 v1.1.7 ブランド戦略整合改訂</time></p>
    <h1>評価方法</h1>
  </section>
  <section aria-label="S クラスの哲学的定義">
    <h2>S クラスの哲学的定義</h2>
    <p><strong>「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」</strong>（MASTER-PLAN §3.0 / マニフェスト 50 字 verbatim）</p>
    <p>本機関の S クラスは、人間の主観や金銭、規模に依存しない。4 軸（基礎・防御・AI 検索・経営）の機械検証で、誰もが再現可能な手順で到達できる頂点。それは「努力の結果」ではなく、「<strong>思想の到達点</strong>」である。S クラス取得は、業界ベンチマーク・同業者の教科書的手本・AI 検索エンジンが第一想起する情報源としての位置を意味する（§3.0.4 意味的定義）。</p>
  </section>
  <section aria-label="自己実証型認定の倫理規範">
    <h2>自己実証型認定の倫理規範（dogfooding 倫理）</h2>
    <p>本機関の中核原則は「<strong>機械検証が示す、AI 時代の WEB 品質。</strong>」である (dogfooding 倫理: 自社評価基準を自社サイトに先に適用する)。tcharton.com（自社サイト）が自社の評価基準で <strong>★★★（HARTON S-Class）</strong>を取得した自己実証体 第 1 号として、業界の品質改善のため独立中立に運営する。</p>
    <ul>
      <li><strong>L1 自己適用</strong>: 自社サイト tcharton.com が認定基準で評価される（scanner.py 月次再判定 (四半期末レポート集計)）</li>
      <li><strong>L2 自己拘束</strong>: 評価結果は自己例外なし（致命的 NG / 降格条件は事業者と同条件）</li>
      <li><strong>L3 自己公開</strong>: 機械検証ログを全件 verbatim 公開する（評価の透明性 / 第三者検証可能性）</li>
    </ul>
    <p>沼津起点での自己実証は、地方都市から再定義する WEB 品質の民主化の旗印として機能する。詳細は <a href="/about/">サイトについて</a> + <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>。</p>
  </section>
  <section aria-label="評価の 5 原則">
    <h2>評価の 5 原則</h2>
    <ul>
      <li>透明性: 評価項目・閾値・実施手順を全公開する。</li>
      <li>客観性: 主観的判断を排除し、scanner.py による自動計測のみ。</li>
      <li>ポジティブセレクション: 良いサイトを称え、低評価サイトは公開しない。</li>
      <li>公平性: 業種・規模・HARTON との取引関係に一切依存しない。</li>
      <li>進化: 年次で基準を改訂し、過去評価もアーカイブとして保持する。</li>
    </ul>
  </section>
  <section aria-label="4 軸概観">
    <h2>4 軸機械検証（並列独立評価）</h2>
    <table>
      <caption>HARTON Certified 4 軸の役割と詳細導線</caption>
      <thead>
        <tr><th scope="col">軸</th><th scope="col">名称</th><th scope="col">評価対象</th><th scope="col">詳細</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">A</th><td>基礎・身だしなみ</td><td>SSL / 速度 / 基本構造</td><td><a href="/methodology/technical/">A 軸詳細</a></td></tr>
        <tr><th scope="row">B</th><td>防御力・生存率</td><td>脆弱性 / WAF / CSP</td><td><a href="/methodology/security/">B 軸詳細</a></td></tr>
        <tr><th scope="row">C</th><td>AI 検索適応</td><td>JSON-LD / セマンティック</td><td><a href="/methodology/ai-search/">C 軸詳細</a></td></tr>
        <tr><th scope="row">D</th><td>経営インパクト</td><td>OGP / モバイル / A11y</td><td><a href="/methodology/business-impact/">D 軸詳細</a></td></tr>
      </tbody>
    </table>
    <p>軸間の重み比率は採用しない。各軸は項目別の事実減点で評価し、4 軸の合算が総合スコアとなる（MASTER-PLAN §3.2）。</p>
  </section>
  <section aria-label="★区分">
    <h2>★区分の閾値（MASTER-PLAN §3.4）</h2>
    <ul class="star-tiers">
      <li>
        <span class="star star-1" role="img" aria-label="HARTON Certified ★（1 つ星）"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span>
        <div>
          <strong>HARTON Certified</strong>
          <p>総合 <strong>70</strong> 点以上 + 致命的 NG <strong>0</strong> 件 + S 条件不問。物語: 「<strong>AI 時代の信頼を体現する</strong>」</p>
        </div>
      </li>
      <li>
        <span class="star star-2" role="img" aria-label="HARTON 優良 ★★（2 つ星）"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span>
        <div>
          <strong>HARTON 優良</strong>
          <p>総合 <strong>80</strong> 点以上 + 致命的 NG <strong>0</strong> 件 + S 条件 <strong>4/5</strong> 達成。物語: 「<strong>地域を代表する WEB 品質</strong>」</p>
        </div>
      </li>
      <li>
        <span class="star star-3" role="img" aria-label="HARTON S-Class ★★★（3 つ星 / 最高位）"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span>
        <div>
          <strong>HARTON S-Class Certified</strong>
          <p>総合 <strong>90</strong> 点以上 + 致命的 NG <strong>0</strong> 件 + S 条件 <strong>5/5</strong> 完全達成。物語: 「<strong>業界の頂点に立つ WEB 品質</strong>」</p>
        </div>
      </li>
    </ul>
  </section>
  <section aria-label="致命的 NG">
    <h2>致命的 NG（一発除外条件）</h2>
    <ul>
      <li>HTTPS 非対応 — 出典: <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA「安全なウェブサイトの作り方」</a></li>
      <li>SSL 証明書エラー（期限切れ・無効）</li>
      <li>WP 管理面露出（wp-login.php / readme.html / xmlrpc.php）</li>
      <li>CMS バージョン情報露出（generator meta タグ等）</li>
    </ul>
    <p>★区分問わず一発除外する。scanner.py Phase 9d で機械検出を実装済（2026-04-26）。</p>
  </section>
  <section aria-label="評価サイクル">
    <h2>評価サイクル (canonical / 全ページ統一)</h2>
    <ul>
      <li><strong>月次スキャン</strong>: 全掲載対象事業者 + 業界レポート対象母集団を毎月初に scanner.py で全件再判定。★ 区分変動を月次反映。</li>
      <li><strong>四半期レポート</strong>: 月次データを四半期末 (Q1: 1-3月 / Q2: 4-6月 / Q3: 7-9月 / Q4: 10-12月) に集計し、業界レポート + 比較ページを公開。</li>
      <li><strong>年次基準改訂</strong>: 4 軸・S 条件・閾値を年次で見直し、SPEC v3.x と整合確認。</li>
      <li><strong>即時対応</strong>: 重大脆弱性発見時は 24 時間以内に掲載一時停止判断。</li>
    </ul>
    <p>自己実証体 tcharton.com も例外なく月次スキャン + 四半期レポート対象として運用される (dogfooding 倫理 / 自己例外なし)。</p>
  </section>
</article>`,
  additionalJsonLd: [
    // Article: AI クローラーが評価方法を引用しやすくする
    {
      '@context': 'https://schema.org',
      '@type': ['Article', 'TechArticle'],
      '@id': `${DOMAIN}/methodology/#article`,
      headline: 'HARTON Certified 4 軸機械検証 評価方法',
      description: 'HARTON Certified の 4 軸機械検証 (A 基礎・B 防御・C AI 検索・D 経営インパクト) の評価項目・閾値・実施手順を完全公開。SPEC v3.4.2 の 2,554 項目と整合。scanner.py による自動計測。',
      datePublished: '2026-04-27',
      dateModified: '2026-05-02',
      inLanguage: 'ja',
      isAccessibleForFree: true,
      author: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'HARTON Certified' },
      publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'T.C.HARTON' },
      mainEntityOfPage: `${DOMAIN}/methodology/`,
      proficiencyLevel: 'Expert',
    },
    // DefinedTermSet: 4 軸の用語定義 (AI 引用時の意味解像度向上)
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      '@id': `${DOMAIN}/methodology/#axes`,
      name: 'HARTON Certified 4 軸機械検証 用語集',
      hasDefinedTerm: [
        { '@type': 'DefinedTerm', '@id': `${DOMAIN}/methodology/technical/#term`, name: 'A 軸 基礎・身だしなみ', description: 'HTTPS / SSL / Core Web Vitals (LCP 2.5s / CLS 0.1 / INP 200ms) / モバイル対応 / 画像最適化を機械検証する評価軸。', url: `${DOMAIN}/methodology/technical/`, inDefinedTermSet: `${DOMAIN}/methodology/#axes` },
        { '@type': 'DefinedTerm', '@id': `${DOMAIN}/methodology/security/#term`, name: 'B 軸 防御力・生存率', description: 'CSP / Trusted Types / HSTS / WP 管理面非露出 / CMS バージョン非露出など脆弱性・WAF・防御層を機械検証する評価軸。', url: `${DOMAIN}/methodology/security/`, inDefinedTermSet: `${DOMAIN}/methodology/#axes` },
        { '@type': 'DefinedTerm', '@id': `${DOMAIN}/methodology/ai-search/#term`, name: 'C 軸 AI 検索適応 (GEO/LLMO)', description: 'JSON-LD Schema.org / FAQPage / HowTo / Article / Dataset / llms.txt / セマンティック構造を機械検証する AI 検索エンジン引用最適化評価軸。', url: `${DOMAIN}/methodology/ai-search/`, inDefinedTermSet: `${DOMAIN}/methodology/#axes` },
        { '@type': 'DefinedTerm', '@id': `${DOMAIN}/methodology/business-impact/#term`, name: 'D 軸 経営インパクト', description: 'OGP / Twitter Cards / モバイル UX / WCAG 2.2 AA アクセシビリティ / NAP 整合性など事業 KPI 直結項目を機械検証する評価軸。', url: `${DOMAIN}/methodology/business-impact/`, inDefinedTermSet: `${DOMAIN}/methodology/#axes` },
        { '@type': 'DefinedTerm', '@id': `${DOMAIN}/methodology/#fatal-ng`, name: '致命的 NG (Fatal NG)', description: 'HTTPS 非対応 / SSL 証明書エラー / WP 管理面露出 (wp-login.php / xmlrpc.php) / CMS バージョン情報露出のいずれかが検出された状態。★ 区分問わず一発除外条件 (MASTER-PLAN §3.4)。', inDefinedTermSet: `${DOMAIN}/methodology/#axes` },
      ],
    },
    // HowTo: ★★★ 取得 5 Step (90 日)
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${DOMAIN}/methodology/#howto-sclass`,
      name: 'HARTON ★★★ S-Class WEB 品質を取得する 5 Step (90 日)',
      description: 'HARTON Certified ★★★ HARTON S-Class (総合 90 点以上 + 致命的 NG 0 件 + S 条件 5/5) を 90 日で取得するための機械検証ベースの実践 5 Step。',
      totalTime: 'PT90D',
      inLanguage: 'ja',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'HTTPS 常時 SSL 化 + HSTS preload', text: "Let's Encrypt + Cloudflare で常時 HTTPS 化、HSTS max-age 31536000 / includeSubDomains / preload を Strict-Transport-Security ヘッダで設定し hstspreload.org に登録。総合スコア +15 点 / 致命的 NG「HTTPS 非対応」「SSL 証明書」を解消。" },
        { '@type': 'HowToStep', position: 2, name: 'JSON-LD Schema.org 実装', text: '業種固有の Schema.org type (LegalService / MedicalBusiness / RealEstateAgent / Restaurant 等) を name + address + telephone + url + openingHours + sameAs (Wikidata) の 6 項目以上で実装。BreadcrumbList + Article + FAQPage + Service の構造化データを全頁配置。スコア +12 点。' },
        { '@type': 'HowToStep', position: 3, name: 'CSP + Trusted Types 適用', text: "Content-Security-Policy: default-src 'self'; script-src 'self'; require-trusted-types-for 'script'; を _headers / .htaccess / nginx.conf で設定。インラインスクリプトを排除し JS は外部化。XSS / CSRF 攻撃面を最小化。致命的 NG 解消 + B 軸 +10 点。" },
        { '@type': 'HowToStep', position: 4, name: 'GEO/LLMO 最適化 (AI 検索適応)', text: '/llms.txt 配置 (300+ 行 / 全 URL カタログ + 用語集) + FAQPage JSON-LD (5+ 質問) + 公的リンク 5+ 件 (IPA / 政府機関 / Wikidata / Schema.org) + canonical URL 統一。AI クローラー (Perplexity / Google AI Overview / Bing Chat) 引用率向上。C 軸 +10 点。' },
        { '@type': 'HowToStep', position: 5, name: 'Core Web Vitals + SSG / Jamstack', text: 'LCP < 2.5s / CLS < 0.1 / INP < 200ms 達成。Astro / Next.js SSG / Eleventy で静的生成、Cloudflare Pages / Netlify / Vercel に配信。WCAG 2.2 AA アクセシビリティ達成 (フォーカス可視 / コントラスト比 4.5:1 / キーボード操作完備)。A 軸 +8 点 / D 軸 +10 点。' },
      ],
    },
  ],
});

// ─── 4-7. methodology 各軸（subpage / reading）─────
const AXIS_PAGES = [
  {
    slug: 'technical',
    title: 'A 軸 基礎・身だしなみ — HARTON Certified 評価方法',
    desc: 'A 軸（基礎・身だしなみ）は HTTPS / SSL / モバイル対応 / 表示速度 / 画像最適化を機械検証する。Core Web Vitals の LCP 2.5 秒以下 / CLS 0.1 以下 / INP 200ms 以下が目標値。',
    label: 'A 軸 基礎・身だしなみ',
    points: [
      'HTTPS / SSL/TLS 強度（TLS 1.2 / 1.3 対応 + 有効期限）',
      'HSTS（max-age 1 年以上 + includeSubDomains + preload）',
      '表示速度（Core Web Vitals: LCP 2.5 秒以下 / CLS 0.1 以下 / INP 200ms 以下）',
      'TTFB 200ms 以下（実用緩和: 1 秒以下で passed）',
      'モバイル対応（viewport / タップ領域 44px / レスポンシブ）',
      '画像最適化（alt / width-height / fetchpriority / WebP）',
    ],
    metric: '15',
    src: 'https://web.dev/articles/vitals',
    srcLabel: 'Google Web Vitals 公式',
  },
  {
    slug: 'security',
    title: 'B 軸 防御力・生存率 — HARTON Certified 評価方法',
    desc: 'B 軸（防御力・生存率）は脆弱性 / WAF / CSP / Cookie / Cross-Origin / Trusted Types を機械検証する。OWASP Top 10:2025 + IPA 安全なウェブサイトの作り方 11 項目を網羅。',
    label: 'B 軸 防御力・生存率',
    points: [
      'CSP 必須 9 ディレクティブ（default-src / script-src / style-src / font-src / img-src / frame-src / object-src / base-uri / form-action）',
      'Cross-Origin Isolation（COOP / COEP / CORP）',
      'Trusted Types（require-trusted-types-for: script）',
      'WAF / CDN（Cloudflare 等のエッジ防御稼働）',
      '脆弱性検知（WordPress / jQuery 古いライブラリ）',
      'Cookie 属性（Secure / HttpOnly / SameSite）',
      '非侵入型ボット防御（Cloudflare Turnstile / reCAPTCHA v3）',
    ],
    metric: '20',
    src: 'https://owasp.org/Top10/2025/',
    srcLabel: 'OWASP Top 10:2025 公式',
  },
  {
    slug: 'ai-search',
    title: 'C 軸 AI 検索適応 — HARTON Certified 評価方法',
    desc: 'C 軸（AI 検索適応）は JSON-LD 構造化データ / セマンティック HTML / NAP 整合性 / GEO 戦略を機械検証する。Aggarwal et al. KDD2024 GEO 9 戦略に整合する評価軸。',
    label: 'C 軸 AI 検索適応',
    points: [
      'JSON-LD 必須 5 種（Organization / WebSite / FAQPage / BreadcrumbList / Person）',
      '@type 配列形式（Schema.org Multiple Types 準拠）',
      'additionalType に Wikidata Q 番号 URI 配列',
      'sameAs に Google ビジネスプロフィール URL を必ず含む',
      'NAP（社名・住所・電話）の Google マップとの完全一致',
      'AI クローラー明示許可（GPTBot / ClaudeBot / PerplexityBot 等）',
      'llms.txt（GEO §8A 必須）',
    ],
    metric: '12',
    src: 'https://schema.org/docs/datamodel.html',
    srcLabel: 'Schema.org Data Model 公式',
  },
  {
    slug: 'business-impact',
    title: 'D 軸 経営インパクト — HARTON Certified 評価方法',
    desc: 'D 軸（経営インパクト）は OGP / SNS 連携 / モバイル最適化 / アクセシビリティ / SEO E-E-A-T を機械検証する。WCAG 2.2 AA + Google E-E-A-T 評価枠組みに整合。',
    label: 'D 軸 経営インパクト',
    points: [
      'OGP 7 項目（og:title / description / type / url / image / site_name / locale）',
      'Twitter Card 4 項目（summary_large_image / title / description / image）',
      'WCAG 2.2 AA（コントラスト 4.5:1 / aria-label / skip link / form label）',
      'モバイル最適化（タップ領域 44px / フルスクリーンメニュー）',
      'SEO（title 30-60 字 / description 70-160 字 / canonical / robots max-snippet:-1）',
      'E-E-A-T（プロフィール一次情報 / 公開日 / 更新日 / 著者明示）',
    ],
    metric: '18',
    src: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
    srcLabel: 'W3C WCAG 2.2 公式',
  },
];
for (const a of AXIS_PAGES) {
  PAGES.push({
    path: `methodology/${a.slug}/index.html`,
    variant: 'reading',
    navActive: 'methodology',
    title: a.title,
    description: a.desc,
    canonicalPath: `/methodology/${a.slug}/`,
    breadcrumbs: bcl([['トップ', '/'], ['評価方法', '/methodology/'], [a.label, `/methodology/${a.slug}/`]]),
    mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>${a.label}は scanner.py で <strong>${a.metric}</strong>+ 項目を機械検証する。判定は項目別減点で 100 点満点に集約され、4 軸の合算が総合スコアとなる。出典: <a href="${a.src}" rel="nofollow noopener noreferrer" target="_blank">${a.srcLabel}</a>（取得日 <strong>2026-04-27</strong>）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「項目別の事実減点で評価し、軸間の重み比率は採用しない」 — MASTER-PLAN §3.2
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>${a.label}</h1>
  </section>
  <section aria-label="評価項目">
    <h2>主要評価項目</h2>
    <ul>${a.points.map(p => `<li>${p}</li>`).join('')}</ul>
    <p>項目数 <strong>${a.metric}</strong>+ / 100 点満点 / 各項目の減点幅は SPEC v3.4 §8.x で定義する。</p>
  </section>
  <section aria-label="改善ヒント">
    <h2>★ 区分昇格のヒント</h2>
    <p>本軸での減点を最小化するには、上記項目を順に検査し、欠落を補うことが効果的である。詳細な改善手順は <a href="/improvement-guide/">/improvement-guide/</a> を参照する。</p>
  </section>
  <section aria-label="関連">
    <h2>関連</h2>
    <ul>
      <li><a href="/methodology/">評価方法トップに戻る</a></li>
      <li><a href="/apply/">掲載申請（C 向け）</a></li>
    </ul>
  </section>
</article>`,
  });
}

// ─── 8. apply（subpage / reading / C 向け最重要 / v1.1.7 中立性整合 / 2026-04-30 改訂）──
PAGES.push({
  path: 'apply/index.html',
  variant: 'reading',
  navActive: 'apply',
  title: '掲載申請 — HARTON Certified ★ 認定を獲得する',
  description: 'HARTON Certified への掲載申請ページ。無料機械検証で自社サイトの ★ 区分を判定する。dogfooding 倫理に基づく完全中立・金銭非依存の認定機関。改善は自社実装または外部コンサルタント・WEB 専門事業者への相談（複数選択肢併記）の両論で支援する。C 未掲載事業者向け最重要動線。',
  canonicalPath: '/apply/',
  breadcrumbs: bcl([['トップ', '/'], ['掲載申請', '/apply/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified への掲載申請は <strong>無料</strong>である。掲載対象は ★ 以上（総合 <strong>70</strong> 点以上 + 致命的 NG <strong>0</strong> 件）を達成した事業者のみで、課金で順位を買えるサービスではない。本機関は dogfooding 倫理（自社製品＝評価基準を自社で適用する倫理規範）に基づき、業界の品質改善のため独立中立に運営する。出典: <a href="https://www.ppc.go.jp/" rel="nofollow noopener noreferrer" target="_blank">個人情報保護委員会</a>（評価機関の中立性に関する公的指針）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「機械検証が示す、AI 時代の WEB 品質。」 — HARTON Certified 信頼根拠の核（MASTER-PLAN §2.0.4）
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time> ／ <time datetime="2026-04-30" itemprop="dateModified">2026-04-30 中立性整合改訂</time></p>
    <h1>掲載申請</h1>
  </section>
  <section aria-label="申請プロセス">
    <h2>申請プロセス（4 ステップ）</h2>
    <ol>
      <li>申請（本ページの<a href="/contact/">お問合せフォーム</a>から）</li>
      <li>無料診断（scanner.py での 4 軸機械検証 / 45+ 項目）</li>
      <li>結果通知（★ 区分 + 改善ヒント / 機械検証ログ verbatim）</li>
      <li>★ 以上達成 → 掲載開始 / 未達 → 改善後再申請</li>
    </ol>
  </section>
  <section aria-label="無料診断">
    <h2>無料診断のお申込み</h2>
    <p>自社サイトの WEB 品質が現時点でどの ★ 区分に該当するか、無料で機械検証する。所要時間は <strong>5</strong> 分（自動）〜<strong>1</strong> 営業日（人的レビュー込み）である。Cloudflare Turnstile による非侵入型ボット防御は CR-3 で別途実装予定（site key 受領後）。</p>
    <p><a href="/contact/">お問合せフォームから無料診断を申込む →</a></p>
  </section>
  <section aria-label="改善が必要な場合 / 中立性表現原則">
    <h2>改善が必要な場合</h2>
    <p>初回診断で ★ 未達でも申請を続行できる。改善経路は事業者の判断で以下から選択する（HARTON Certified は<strong>業界の品質改善のため</strong>独立中立に運営し、特定の制作会社の推奨はしない）:</p>
    <ol>
      <li><strong>自社実装</strong>: <a href="/methodology/">評価方法ページ</a>と <a href="/improvement-guide/">改善ガイダンス</a>を参考に、社内で SPEC 整合の改善を実装する。機械検証で項目別の不適合が示されるため、再現可能な手順で対応できる</li>
      <li><strong>制作会社相談</strong>: 独立した WEB 制作会社・コンサルタントに改善を依頼する。相談先候補は事業者の判断で選定する（地元商工会議所・IT 関連協会の紹介、複数社相見積もりが推奨される一般的な調達手順）</li>
    </ol>
    <p>改善後は再度本ページから無料診断を申込むことで、★ 区分の再判定を受けられる。月次再判定で ★ 区分が更新される運用は MASTER-PLAN §12 失効・降格運用と整合する。</p>
  </section>
  <section aria-label="料金透明性">
    <h2>料金透明性</h2>
    <ul>
      <li>HARTON Certified への掲載: <strong>無料</strong></li>
      <li>無料機械検証診断: <strong>無料</strong></li>
      <li>改善サービス（任意）: 事業者の選択する制作会社・コンサルタントの料金体系に従う（本機関は仲介・推奨しない）</li>
    </ul>
    <p>本機関の中立性は dogfooding 倫理（自社サイトも月次再判定対象 / 自己例外なし）と「自社の集客のためではなく、業界の品質改善のため」の運営方針で担保される（MASTER-PLAN §3.0.5 自己実証型認定の倫理規範）。</p>
  </section>
  <section aria-label="関連">
    <h2>関連</h2>
    <ul>
      <li><a href="/methodology/">評価方法（4 軸の全公開）</a></li>
      <li><a href="/improvement-guide/">改善ガイダンス（★ 区分昇格の実践手順）</a></li>
      <li><a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)（地方都市から再定義の実例）</a></li>
      <li><a href="/contact/">お問合せ</a></li>
      <li><a href="/opt-out/">掲載拒否権</a></li>
    </ul>
  </section>
</article>`,
});

// ─── 9. improvement-guide（subpage / reading）───────
PAGES.push({
  path: 'improvement-guide/index.html',
  variant: 'reading',
  navActive: '',
  title: '改善ガイダンス — ★ 区分を上げるための実践手順',
  description: 'HARTON Certified ★ 区分昇格の実践手順。SPEC v3.4 §4.2 #1.0-#1.3 への対応 / GBP 作成 / NAP 完全一致 / Trusted Types 等の機械検証可能な改善点を順に解説する。',
  canonicalPath: '/improvement-guide/',
  breadcrumbs: bcl([['トップ', '/'], ['改善ガイダンス', '/improvement-guide/']]),
  mainContent: `
<article>
  <header>
    <h1>改善ガイダンス</h1>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time> ／ <time datetime="2026-05-03" itemprop="dateModified">最終更新 2026-05-03 (v1.18 観点 2 ストーリーテリング統合)</time></p>
  </header>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified の ★ 区分は scanner.py の機械検証で <strong>45</strong>+ 項目を計測し、総合 <strong>70</strong>/<strong>80</strong>/<strong>90</strong> 点の 3 段階で付与する。改善ヒントはすべて公的基準に整合する。出典: <a href="https://developers.google.com/search/docs" rel="nofollow noopener noreferrer" target="_blank">Google Search Central</a> / <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「評価項目は全公開、再現性のある機械検証である」 — HARTON Certified
    </blockquote>
  </section>

  <section aria-label="課題から取得への 5 Step タイムライン" class="guide-timeline-section">
    <h2>「課題 → 改善 → ★ 取得」5 Step タイムライン (90 日)</h2>
    <p>HARTON Certified の自己実証体 第 1 号 <a href="/case-studies/tcharton-com/">tcharton.com</a> が辿った経路を、未来の認定事業者向けに 5 Step として体系化した。各 Step は scanner.py で機械検証可能な技術項目で構成され、人手判断は介在しない (再現性原則)。</p>
    <ol class="guide-timeline">
      <li class="guide-step guide-step-1">
        <div class="guide-step-marker"><span class="guide-step-num">Step 1</span><span class="guide-step-day">Day 1-15</span></div>
        <div class="guide-step-body">
          <h3>HTTPS 常時 SSL 化 + HSTS preload</h3>
          <p class="guide-step-effect">A 軸 +15 点 / 致命的 NG 「HTTPS 非対応」「SSL 証明書」解消</p>
          <p>Let's Encrypt + Cloudflare で常時 HTTPS 化、HSTS max-age=31536000 + includeSubDomains + preload を <code>Strict-Transport-Security</code> ヘッダで設定し <a href="https://hstspreload.org/" rel="noopener noreferrer" target="_blank">hstspreload.org</a> に登録。tcharton.com は commit <code>97323a6</code> で対応。</p>
        </div>
      </li>
      <li class="guide-step guide-step-2">
        <div class="guide-step-marker"><span class="guide-step-num">Step 2</span><span class="guide-step-day">Day 16-30</span></div>
        <div class="guide-step-body">
          <h3>JSON-LD Schema.org 実装 + GBP 連携</h3>
          <p class="guide-step-effect">C 軸 +12 点 / D 軸 +5 点 (NAP)</p>
          <p>業種固有の Schema.org type (LegalService / MedicalBusiness / RealEstateAgent / Restaurant 等) を name + address + telephone + url + openingHours + sameAs (Wikidata + GBP CID) の 6 項目以上で実装。BreadcrumbList + Article + FAQPage + Service の構造化データを全頁配置。tcharton.com は commit <code>a12f686</code> + <code>a3113d1</code> で対応。</p>
        </div>
      </li>
      <li class="guide-step guide-step-3">
        <div class="guide-step-marker"><span class="guide-step-num">Step 3</span><span class="guide-step-day">Day 31-45</span></div>
        <div class="guide-step-body">
          <h3>CSP + Trusted Types + セキュリティヘッダ</h3>
          <p class="guide-step-effect">B 軸 +10 点 / 致命的 NG 「WP 管理面露出」「CMS バージョン情報露出」解消</p>
          <p><code>Content-Security-Policy: default-src 'self'; script-src 'self'; require-trusted-types-for 'script';</code> を <code>_headers</code> で設定。インラインスクリプトを排除し JS は外部化。<code>frame-ancestors 'none'</code> / <code>X-Content-Type-Options nosniff</code> / <code>Referrer-Policy strict-origin-when-cross-origin</code> を併設。tcharton.com は commit <code>97323a6</code> で対応。</p>
        </div>
      </li>
      <li class="guide-step guide-step-4">
        <div class="guide-step-marker"><span class="guide-step-num">Step 4</span><span class="guide-step-day">Day 46-65</span></div>
        <div class="guide-step-body">
          <h3>GEO/LLMO 最適化 (AI 検索適応)</h3>
          <p class="guide-step-effect">C 軸 +10 点</p>
          <p><code>/llms.txt</code> 配置 (300+ 行 / 全 URL カタログ + 用語集) + FAQPage JSON-LD (5+ 質問) + 公的リンク 5+ 件 (IPA / 政府機関 / Wikidata / Schema.org / W3C) + canonical URL 統一。AI クローラー (ChatGPT Search / Perplexity / Google AI Overview / Bing Chat / Gemini) 引用率向上。</p>
        </div>
      </li>
      <li class="guide-step guide-step-5">
        <div class="guide-step-marker"><span class="guide-step-num">Step 5</span><span class="guide-step-day">Day 66-90</span></div>
        <div class="guide-step-body">
          <h3>Core Web Vitals + WCAG 2.2 AA + NAP 完全一致</h3>
          <p class="guide-step-effect">A 軸 +8 点 + D 軸 +10 点 + NAP 100 点 → ★★★ 90 点 達成圏</p>
          <p>LCP < 2.5s / CLS < 0.1 / INP < 200ms 達成 + Astro / Next.js SSG / Eleventy で静的生成、Cloudflare Pages / Netlify / Vercel に配信。WCAG 2.2 AA 達成 (フォーカス可視 / コントラスト比 4.5:1 / キーボード操作完備 / アクセシブルランドマーク)。streetAddress 完全公開で NAP 100 点。tcharton.com は commit <code>36d4328</code> で 🏆 S/90 取得。</p>
        </div>
      </li>
    </ol>
    <p class="guide-timeline-note">本タイムラインは tcharton.com 実装経緯から抽出された再現可能パターンである。各 Step の具体実装は以下の章で詳細化する。詳細は <a href="/case-studies/tcharton-com/">tcharton.com 自己実証 case study</a> + <a href="/methodology/">評価方法 4 軸</a>を参照。</p>
  </section>

  <section aria-label="JSON-LD 改善">
    <h2>JSON-LD（C 軸の中核 / SPEC v3.4 §4.2 #1）</h2>
    <ul>
      <li>@type を配列形式で <code>["LocalBusiness", "ProfessionalService"]</code> 等で宣言</li>
      <li>additionalType に Wikidata Q 番号 URI を 1 件以上配列で列挙</li>
      <li>sameAs に Google ビジネスプロフィール URL（<code>google.com/maps</code> または <code>maps.google.com</code> 含む）を 1 件以上</li>
      <li>NAP（社名・住所・電話）は GBP と完全一致</li>
    </ul>
  </section>
  <section aria-label="GBP 作成">
    <h2>Google ビジネスプロフィール（GBP）作成手順</h2>
    <ol>
      <li><a href="https://www.google.com/intl/ja_jp/business/" rel="nofollow noopener noreferrer" target="_blank">Google ビジネスプロフィール公式</a> でアカウント作成</li>
      <li>Service Area Business モード推奨（住所非公開可）</li>
      <li>NAP を JSON-LD と完全一致させる</li>
      <li>検証完了後、CID URL を取得し sameAs に追記</li>
    </ol>
  </section>
  <section aria-label="セキュリティヘッダ">
    <h2>セキュリティヘッダ（B 軸 / SPEC v3.4 §8.1）</h2>
    <p>必須コア <strong>6</strong> 個（default-src / script-src / style-src / object-src / base-uri / form-action）+ 推奨拡張 <strong>4</strong> 個（font-src / img-src / connect-src / frame-src）+ DOM XSS 根絶系（require-trusted-types-for / frame-ancestors / upgrade-insecure-requests）を <code>_headers</code> ファイルで配信する。</p>
  </section>
  <section aria-label="Core Web Vitals">
    <h2>Core Web Vitals（A 軸 / 公的基準）</h2>
    <p>LCP 2.5 秒以下 / CLS 0.1 以下 / INP 200ms 以下を達成する。画像 width-height 指定 / fonts.googleapis 使用時 display=swap 必須 / Tailwind CDN 不使用（事前ビルド成果物のみ）。</p>
  </section>
  <section aria-label="関連">
    <h2>関連</h2>
    <ul>
      <li><a href="/methodology/">評価方法トップ</a></li>
      <li><a href="/apply/">掲載申請</a></li>
    </ul>
  </section>
</article>`,
  additionalJsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${DOMAIN}/improvement-guide/#howto`,
      name: '★ HARTON Certified 認定取得の改善 5 Step (90 日)',
      description: 'HARTON Certified ★ 認定 (総合 70 点以上 + 致命的 NG 0 件) を 90 日で取得するための機械検証ベースの実践 5 Step。事業者が自社で実装可能な手順を全公開。',
      totalTime: 'PT90D',
      inLanguage: 'ja',
      author: { '@type': 'Organization', '@id': `${DOMAIN}/#org` },
      step: [
        { '@type': 'HowToStep', position: 1, name: 'HTTPS 常時 SSL 化 + HSTS preload 登録', text: "Let's Encrypt + Cloudflare で常時 HTTPS 化、HSTS max-age 31536000 / includeSubDomains / preload を Strict-Transport-Security ヘッダで設定し https://hstspreload.org/ に登録。致命的 NG「HTTPS 非対応」「SSL 証明書」を解消し総合スコア +15 点。", url: `${DOMAIN}/improvement-guide/#step-https` },
        { '@type': 'HowToStep', position: 2, name: 'Google ビジネスプロフィール (GBP) + JSON-LD Schema.org 実装', text: 'GBP で NAP (Name/Address/Phone) を整備、JSON-LD で業種固有 Schema.org type (LegalService / MedicalBusiness / RealEstateAgent / Restaurant 等) を name + address + telephone + url + openingHours + sameAs (Wikidata + GBP CID) の 6 項目以上で実装。BreadcrumbList + Article + FAQPage + Service の構造化データを全頁配置。スコア +12 点。', url: `${DOMAIN}/improvement-guide/#step-jsonld` },
        { '@type': 'HowToStep', position: 3, name: 'CSP + Trusted Types + セキュリティヘッダ', text: "Content-Security-Policy: default-src 'self'; script-src 'self'; require-trusted-types-for 'script'; を _headers / .htaccess / nginx.conf で設定。インラインスクリプトを排除し JS は外部化。frame-ancestors 'none' / X-Content-Type-Options nosniff / Referrer-Policy strict-origin-when-cross-origin を併設。XSS / Clickjacking / CSRF 攻撃面を最小化。致命的 NG「WP 管理面露出」「CMS バージョン情報露出」を解消し B 軸 +10 点。", url: `${DOMAIN}/improvement-guide/#step-csp` },
        { '@type': 'HowToStep', position: 4, name: 'GEO/LLMO 最適化 (AI 検索適応)', text: '/llms.txt 配置 (300+ 行 / 全 URL カタログ + 用語集) + FAQPage JSON-LD (5+ 質問) + 公的リンク 5+ 件 (IPA / 政府機関 / Wikidata / Schema.org / W3C) + canonical URL 統一 + sitemap.xml priority 適切。AI クローラー (Perplexity / Google AI Overview / Bing Chat / ChatGPT Search) 引用率向上。C 軸 +10 点。', url: `${DOMAIN}/improvement-guide/#step-geo` },
        { '@type': 'HowToStep', position: 5, name: 'Core Web Vitals + SSG/Jamstack + WCAG 2.2 AA', text: 'LCP < 2.5s / CLS < 0.1 / INP < 200ms 達成。Astro / Next.js SSG / Eleventy で静的生成、Cloudflare Pages / Netlify / Vercel に配信。WCAG 2.2 AA 達成 (フォーカス可視 / コントラスト比 4.5:1 / キーボード操作完備 / アクセシブルランドマーク)。OGP / Twitter Cards 完備。A 軸 +8 点 / D 軸 +10 点。', url: `${DOMAIN}/improvement-guide/#step-cwv` },
      ],
    },
  ],
});

// ─── 10. press（subpage / reading）──────────────────
PAGES.push({
  path: 'press/index.html',
  variant: 'reading',
  navActive: 'press',
  title: 'メディア向け — HARTON Certified の引用素材と取材依頼',
  description: 'メディア向けページ。月次ランキング CSV / ロゴ・代表写真高解像度 / 引用条件・クレジット表記方法 / 取材実績・問合せフォームを提供する。',
  canonicalPath: '/press/',
  breadcrumbs: bcl([['トップ', '/'], ['メディア向け', '/press/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は <strong>2026 年 4 月</strong>に立ち上がった独立認定機関で、Phase 0.5 静岡県 5 都市 (沼津・三島・富士・静岡・浜松) × 11 業種 <strong>${shizuokaSummary.n_total}</strong> 件機械検証を 2026 年 5 月 2 日に完了した。月次ランキング・ロゴ・代表写真・<a href="/datasets/shizuoka-2026-q2.json">機械可読データセット (CC BY 4.0)</a> をプレス向けに無償提供する。出典: <a href="https://www.digital.go.jp/resources/govdashboard/local-government-dx#guidance2" rel="nofollow noopener noreferrer" target="_blank">日本政府公的機関</a>（中小事業者の DX 状況）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「機械検証で、Sクラス WEB の普及を支える」 — HARTON Certified ブランドナラティブ
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>メディア向け</h1>
  </section>
  <section aria-label="引用素材">
    <h2>引用可能データ</h2>
    <ul>
      <li>月次ランキング: <a href="/rankings/2026/04/">2026 年 4 月の TOP 10</a>（CSV / JSON も提供予定）</li>
      <li>ロゴ・バッジ素材: <a href="/assets/logo/">/assets/logo/</a></li>
      <li>代表写真高解像度: 取材依頼時に個別提供</li>
    </ul>
  </section>
  <section aria-label="クレジット表記">
    <h2>クレジット表記ルール</h2>
    <p>引用時は出典として「HARTON Certified（${DOMAIN}/methodology/）」を明記する。スクリーンショットは批評目的の最小限引用に限り、商用転用は禁止する。認定店舗紹介時は認定 ID と検証 URL を併記する。</p>
  </section>
  <section aria-label="取材実績">
    <h2>取材実績</h2>
    <p>立ち上げ直後（2026 年 4 月時点）。Phase 0 完了時点で本セクションを更新する。</p>
  </section>
  <section aria-label="取材依頼">
    <h2>取材依頼</h2>
    <p><a href="/contact/">/contact/</a> から「メディア取材」を選択して送信する。T.C.HARTON 代表に直接届く運用である。</p>
  </section>
  <section aria-label="関連">
    <h2>関連</h2>
    <ul>
      <li><a href="/about/">サイトについて（運営者プロフィール）</a></li>
      <li><a href="/methodology/">評価方法（公的基準への整合）</a></li>
    </ul>
  </section>
</article>`,
});

// ─── 11. opt-out（minimal / reading）────────────────
PAGES.push({
  path: 'opt-out/index.html',
  variant: 'reading',
  navActive: '',
  title: '掲載拒否権 — HARTON Certified',
  description: 'HARTON Certified への掲載拒否窓口。理由不要、24 時間以内に対応、関連データを即時削除する。再掲載は事業者の明示申請がない限り行わない。',
  canonicalPath: '/opt-out/',
  robots: 'index, follow',
  mainContent: `
<article>
  <h1>掲載拒否権</h1>
  <section aria-label="窓口">
    <p>本機関への掲載をご希望されない場合、本ページから 24 時間以内に対応する。理由のご説明は不要である。</p>
    <p>掲載拒否の方法:</p>
    <ul>
      <li>メール: <a href="mailto:opt-out@certification.tcharton.com">opt-out@certification.tcharton.com</a></li>
      <li>問合せフォーム: <a href="/contact/">/contact/</a> で「掲載辞退」を選択</li>
    </ul>
    <p>掲載辞退いただいた場合、関連データを即時削除する。今後の再掲載は事業者の明示的な申請がない限り行わない。</p>
  </section>
</article>`,
});

// ─── 12. faq（subpage / reading）────────────────────
PAGES.push({
  path: 'faq/index.html',
  variant: 'reading',
  navActive: '',
  title: 'よくある質問 — HARTON Certified の評価・運営に関する Q&A',
  description: 'HARTON Certified への質問集。評価方法 / 掲載基準 / 課金方針 / オプトアウト / 食べログ等との違い / 弁護士相談済の法的整備状況などを Q&A 形式でまとめる。',
  canonicalPath: '/faq/',
  breadcrumbs: bcl([['トップ', '/'], ['よくある質問', '/faq/']]),
  additionalJsonLd: [FAQ_TOP],
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified によくある質問を <strong>5</strong> 項目に整理した。評価方法 / 掲載基準 / 課金方針の核心点を <strong>2026 年 4 月</strong>時点の運営方針で回答する。出典: <a href="https://www.ppc.go.jp/" rel="nofollow noopener noreferrer" target="_blank">個人情報保護委員会</a>（中立評価機関の運用指針）。</p>
    <blockquote cite="${DOMAIN}/about/">
      「全評価項目を /methodology/ で公開し、再現性のある機械検証で運用する」
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>よくある質問</h1>
  </section>
  <section aria-label="質問一覧">
    <h2>質問</h2>
    <dl>
      <dt>Q1: HARTON Certified は何を評価するのか？</dt>
      <dd>WEB サイトの品質を 4 軸（基礎・防御・AI 検索・経営インパクト）で機械検証し、総合 70 点以上 + 致命的 NG ゼロを満たす事業者を ★ 以上で認定する。</dd>
      <dt>Q2: 掲載は有料か？</dt>
      <dd>無料である。完全中立・金銭非依存で運用し、課金で順位を買えるサービスではない。</dd>
      <dt>Q3: 評価項目は公開されているか？</dt>
      <dd>評価項目・閾値・実施手順は <a href="/methodology/">/methodology/</a> ですべて公開している。再現性のある機械検証である。</dd>
      <dt>Q4: 掲載を拒否したい場合は？</dt>
      <dd><a href="/opt-out/">/opt-out/</a> より理由不要で 24 時間以内に対応する。再掲載は事業者の明示申請がない限り行わない。</dd>
      <dt>Q5: 食べログとは何が違うのか？</dt>
      <dd>食べログは口コミで業務品質を評価する。HARTON Certified は機械検証で WEB 品質を評価する。評価軸が独立で、両立は補完関係である。</dd>
    </dl>
  </section>
</article>`,
});

// ─── 13. news（subpage / reading）───────────────────
PAGES.push({
  path: 'news/index.html',
  variant: 'reading',
  navActive: '',
  title: 'お知らせ — HARTON Certified の運営状況更新',
  description: 'HARTON Certified からのお知らせ一覧。新規認定 / 基準改訂 / 月次ランキング更新 / 取材実績などの運営状況を時系列で公開する。MASTER-PLAN 改訂と SPEC v3.x 連動の最新履歴も記録する。',
  canonicalPath: '/news/',
  breadcrumbs: bcl([['トップ', '/'], ['お知らせ', '/news/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified からのお知らせを時系列で公開する。<strong>2026 年 4 月 27 日</strong>に MASTER-PLAN v<strong>1.1.4</strong> 改訂と SPEC v<strong>3.4</strong> 連動を完了した。出典: <a href="https://www.digital.go.jp/resources/govdashboard/local-government-dx#guidance2" rel="nofollow noopener noreferrer" target="_blank">公的機関基準</a>。</p>
    <blockquote cite="${DOMAIN}/about/">
      「年次で基準を改訂、過去評価もアーカイブとして残す」 — HARTON Certified 進化原則
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>お知らせ</h1>
  </section>
  <section aria-label="お知らせ一覧">
    <h2>2026 年</h2>
    <ul>
      <li><time datetime="2026-05-01">2026-05-01</time>: <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a> 公開（5 都市 × 11 業種 ${shizuokaSummary.n_total} 件機械検証 / ★ 認定 ${shizuokaSummary.eligible_total} 件 / 致命的 NG ${shizuokaSummary.ng_pct.toFixed(1)}%）</li>
      <li><time datetime="2026-04-27">2026-04-27</time>: MASTER-PLAN v1.1.4 改訂（SPEC v3.4 連動完了）</li>
      <li><time datetime="2026-04-26">2026-04-26</time>: HARTON Certified 創設発表 / Phase 0.5 静岡県 5 都市パイロット計画策定</li>
    </ul>
  </section>
</article>`,
});

// ─── 13b. 静岡県 5 都市業界レポート 2026 Q2 (4-6 月号)（subpage / reading / INSTRUCTION v1.12.2 §(A) 連動）
PAGES.push({
  path: 'news/shizuoka-industry-report-2026-q2/index.html',
  variant: 'reading',
  navActive: '',
  title: '静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号) — HARTON Certified',
  description: `静岡県 5 都市（沼津・三島・富士・静岡・浜松）× 11 業種 ${shizuokaSummary.n_total} 件機械検証実測。★ 獲得率 ${shizuokaSummary.eligible_total}/${shizuokaSummary.n_total}=${shizuokaSummary.n_total > 0 ? (shizuokaSummary.eligible_total / shizuokaSummary.n_total * 100).toFixed(1) : '0.0'}%。業界最高点（税理士52・弁護士49・司法書士54・行政書士52・不動産54・飲食50・美容院44・美容クリニック45・宿泊51・クリニック53・学習塾46）／NG ${shizuokaSummary.ng_pct.toFixed(1)}%。`,
  canonicalPath: '/news/shizuoka-industry-report-2026-q2/',
  ogType: 'article',
  breadcrumbs: bcl([['トップ', '/'], ['お知らせ', '/news/'], ['業界レポート 2026 Q2 (4-6 月号)', '/news/shizuoka-industry-report-2026-q2/']]),
  mainContent: `
<article>
  <header>
    <h1>静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</h1>
    <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 スキャン実施・公開</time> ／ <time datetime="2026-06-02" itemprop="dateModified">次回更新予定: 2026-06-02</time></p>
  </header>
  <section aria-label="冒頭エビデンス">
    <p><strong>2026 年 5 月 2 日</strong>、静岡県 5 都市（沼津市・三島市・富士市・静岡市・浜松市）× 11 業種（税理士・弁護士・司法書士・行政書士・不動産仲介・飲食店・美容院・美容クリニック・宿泊施設・クリニック / 診療所・学習塾）<strong>${shizuokaSummary.n_total}</strong> 件の公開 WEB サイトを 4 軸機械検証した。業界中央値は <strong>${shizuokaSummary.score_stats.median}</strong> 点（業界 max <strong>${shizuokaSummary.score_stats.max}</strong> 点）であり、★ 以上認定可能なサイトは <strong>${shizuokaSummary.eligible_total}</strong> 件、致命的 NG 発生率は <strong>${shizuokaSummary.ng_pct.toFixed(1)}%</strong> であった。本レポートのデータ全件は <a href="/datasets/shizuoka-2026-q2.json" type="application/json">機械可読 JSON</a> として CC BY 4.0 で公開する (AI クローラー / 研究者 / 引用フリー)。出典: <a href="https://web.dev/articles/vitals" rel="noopener noreferrer" target="_blank">Google Web Vitals 公式</a> / <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="noopener noreferrer" target="_blank">W3C WCAG 2.2</a> / <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="noopener noreferrer" target="_blank">IPA 安全なウェブサイトの作り方</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「公正に測るとは、評価方法のすべてを公開することだ」 — HARTON Certified 評価原則
    </blockquote>
  </section>

  <section aria-label="Phase 0.5 から Phase 1+ 成功への道筋" class="report-narrative-section">
    <h2>Phase 0.5 → Phase 1+: 成功への道筋 (3 段ストーリー)</h2>
    <p>Phase 0.5 静岡県 5 都市 ${shizuokaSummary.n_total} 件機械検証で ★ 認定取得は <strong>0 件</strong>であった。これは「失敗」ではなく、機械検証で WEB 品質を測る独立認定機関としての <strong>透明性の証明</strong>であり、未来の認定事業者への明確な道筋を示すデータである。</p>
    <ol class="report-narrative-3step">
      <li class="narrative-step-challenge">
        <h3><span class="narrative-num">1</span> 現状 (Phase 0.5 / 2026-05-02)</h3>
        <p>静岡県 5 都市 ${shizuokaSummary.n_total} 件で ★ 認定 <strong>0/${shizuokaSummary.n_total} = 0.0%</strong>。業界中央値 ${shizuokaSummary.score_stats.median} 点 / 業界 max ${shizuokaSummary.score_stats.max} 点 / 致命的 NG ${shizuokaSummary.ng_pct.toFixed(1)}%。WP 管理面露出 ${shizuokaSummary.ng_breakdown['WP管理面露出']} 件 / HTTPS 非対応 ${shizuokaSummary.ng_breakdown['HTTPS非対応']} 件 / SSL 証明書失効 ${shizuokaSummary.ng_breakdown['SSL証明書']} 件 / CMS バージョン情報露出 ${shizuokaSummary.ng_breakdown['CMSバージョン情報露出']} 件。</p>
      </li>
      <li class="narrative-step-improvement">
        <h3><span class="narrative-num">2</span> 改善 (90 日 / 5 Step)</h3>
        <p>運営主体 T.C.HARTON の自社サイト tcharton.com が辿った 5 Step (HTTPS preload + JSON-LD + CSP + GEO/LLMO + Core Web Vitals) を 90 日で実装すれば、業界 max 54 点 → 70 点まで +16 点引き上げ可能。<a href="/improvement-guide/">改善ガイダンス 5 Step タイムライン</a>で具体的 config 値・header 文字列・ファイルパスを全公開。<a href="/case-studies/tcharton-com/">tcharton.com 自己実証 case study</a> で 7 commit timeline を verbatim 確認可能。</p>
      </li>
      <li class="narrative-step-acquired">
        <h3><span class="narrative-num">3</span> 取得 (Phase 1+ / 2026-06-02 月次再判定〜)</h3>
        <p>月次再判定で改善した事業者は自動的に ★ HARTON Certified 取得 → <a href="/regions/shizuoka/">静岡県 5 都市の認定店舗ページ</a>に掲載 + 本レポートに昇格通知。Phase 1 (主要 20 都市 / 2026 Q3〜) で全国順次拡大予定。tcharton.com (★★★ HARTON S-Class) と並ぶ自己実証体 第 2 号は静岡県 5 都市から最初に生まれることが期待される。</p>
      </li>
    </ol>
  </section>

  <section aria-label="評価結果の取扱いに関する注意" class="report-disclaimer-section">
    <p><strong>本レポートの取扱いについて</strong>: 本レポートに記載される「致命的 NG」(HTTPS 非対応 / SSL 証明書 / WP 管理面露出 / CMS バージョン情報露出) の表記は SPEC v3.4 で定義された<strong>具体的技術項目の検出</strong>を意味し、対象事業者の事業品質や信用度に対する評価ではない。評価結果はスキャン実施時点 (2026-05-02) のスナップショットであり、対象 WEB サイトの現在状態を保証するものではない。検出結果に異議がある事業者は <a href="/contact/">scanner 結果訂正請求</a> または <a href="/opt-out/">/opt-out/</a> より速やかに申立て可能である。詳細は <a href="/legal/">利用規約 第 3 条 (機械検証の限界と免責)</a>を参照。</p>
  </section>

  <section aria-label="静岡県 5 都市 ★ 獲得率（統合）" class="quality-gap-section zero-cert-statement">
    <h2>静岡県 5 都市 ★ 獲得率</h2>
    <div class="report-stat-display">
      <p class="report-stat-headline"><span class="report-stat-number">0.0</span><span class="report-stat-unit">%</span></p>
      <p class="report-stat-caption"><strong>静岡県 5 都市 ${shizuokaSummary.n_total} 件中、★ 認定達成 ${shizuokaSummary.eligible_total} 件 / 獲得率 0.0%</strong>（2026-05-02 時点）</p>
      <p class="report-stat-note">機械検証 4 軸（A 基礎・B 防御・C AI 検索・D 経営インパクト）+ 致命的 NG 0 件 + 総合 70 点以上を全達成した事業者の割合。本レポートは業界の WEB 品質改善のために実測を公開するものであり、自社の集客を目的とするものではない。「準備中」「Coming soon」等の婉曲表現は採用しない。</p>
    </div>
  </section>

  <section aria-label="都市別 WEB 品質ランキング" class="region-section">
    <h2>都市別 WEB 品質ランキング</h2>
    <p class="region-section-lede"><strong>★ 認定取得率</strong> = ★ 認定取得 ÷ 対象 n × 100% (実際の認定割合)。Phase 0.5 全 5 都市で <strong>0.0%</strong> (★ 認定取得サイト 0 件)。表は<strong>業界最高点 (= 当該都市内 1 位サイトのスコア)</strong>降順でソート。最高点が高い都市ほど ★ 認定基準 (70 点) に近い 1 サイトが存在することを示す。致命的 NG% は母集団全体の防御水準 (低いほど良)。</p>
    <table>
      <caption>静岡県 5 都市 ${shizuokaSummary.n_total} 件 都市別 WEB 品質ランキング (2026-05-02 時点)</caption>
      <thead>
        <tr><th scope="col">順位</th><th scope="col">都市</th><th scope="col">対象 n</th><th scope="col">★ 獲得</th><th scope="col">★ 認定取得率</th><th scope="col">業界最高点 / 70 点</th><th scope="col">致命的 NG%</th></tr>
      </thead>
      <tbody>
        ${(() => {
          const cityKeyMap = { '沼津市': 'numazu', '三島市': 'mishima', '富士市': 'fuji', '静岡市': 'shizuoka', '浜松市': 'hamamatsu' };
          const sorted = [...shizuokaSummary.by_city].sort((a, b) => b.max - a.max);
          return sorted.map((c, i) => {
            const cityKey = cityKeyMap[c.city] || '';
            const certRate = c.n > 0 ? ((c.eligible / c.n) * 100).toFixed(1) : '0.0';
            const linkOpen = cityKey ? `<a href="/regions/shizuoka/${cityKey}/">` : '';
            const linkClose = cityKey ? '</a>' : '';
            const ngClass = c.ng_pct < 30 ? 'ng-low' : c.ng_pct < 35 ? 'ng-mid' : 'ng-high';
            return `<tr><td>${i + 1}</td><th scope="row">${linkOpen}${c.city}${linkClose}</th><td>${c.n} 件</td><td>${c.eligible} 件</td><td><strong>${certRate}%</strong></td><td>${c.max} / 70 点</td><td class="${ngClass}">${c.ng_pct.toFixed(1)}%</td></tr>`;
          }).join('\n        ');
        })()}
      </tbody>
    </table>
    <p class="region-section-note">凡例: ★ 認定取得率 = ★ 認定取得件数 ÷ 母集団対象 n。Phase 0.5 では全 5 都市で <strong>0/n = 0.0%</strong> (★ 認定基準 70 点に到達した事業者ゼロ)。NG% 色分け: 緑 = 30% 未満 (相対良) / 黄 = 30-35% / 赤 = 35% 以上 (相対悪)。</p>
  </section>

  <section aria-label="業種別 WEB 品質ランキング" class="industry-section">
    <h2>業種別 WEB 品質ランキング</h2>
    <p class="industry-section-lede"><strong>★ 認定取得率</strong> = ★ 認定取得 ÷ 対象 n × 100% (実際の認定割合)。Phase 0.5 全 11 業種で <strong>0.0%</strong>。表は<strong>業界最高点 (= 当該業種内 1 位サイトのスコア)</strong>降順。NG% が高い業種は防御層 (HTTPS / WP 管理面 / CMS 露出) の改善余地が大きい。</p>
    <table>
      <caption>静岡県 5 都市 11 業種 ${shizuokaSummary.n_total} 件 業種別 WEB 品質ランキング (2026-05-02 時点)</caption>
      <thead>
        <tr><th scope="col">順位</th><th scope="col">業種</th><th scope="col">対象 n</th><th scope="col">★ 獲得</th><th scope="col">★ 認定取得率</th><th scope="col">業界最高点 / 70 点</th><th scope="col">致命的 NG%</th></tr>
      </thead>
      <tbody>
        ${(() => {
          const indKeyMap = {};
          for (const [k, v] of Object.entries(industriesData)) {
            indKeyMap[v.label_short] = k;
            indKeyMap[v.label] = k;
          }
          // Phase 0.5 集約: 11 業種一律。Phase 0 アーカイブ (歯科医院・病院) は by_industry に残置されているが本表からは除外。
          const phase05Industries = ['税理士','弁護士','司法書士','行政書士','不動産','飲食店','美容院','美容クリニック','宿泊施設','クリニック・診療所','学習塾'];
          const sorted = shizuokaSummary.by_industry
            .filter(s => phase05Industries.includes(s.industry))
            .sort((a, b) => b.max - a.max);
          return sorted.map((s, i) => {
            const indKey = indKeyMap[s.industry] || '';
            const indLabel = indKey && industriesData[indKey] ? industriesData[indKey].label : s.industry;
            const certRate = s.n > 0 ? ((s.eligible / s.n) * 100).toFixed(1) : '0.0';
            const linkOpen = indKey ? `<a href="/industries/${indKey}/">` : '';
            const linkClose = indKey ? '</a>' : '';
            const ngClass = s.ng_pct < 30 ? 'ng-low' : s.ng_pct < 40 ? 'ng-mid' : 'ng-high';
            return `<tr><td>${i + 1}</td><th scope="row">${linkOpen}${indLabel}${linkClose}</th><td>${s.n} 件</td><td>${s.eligible} 件</td><td><strong>${certRate}%</strong></td><td>${s.max} / 70 点</td><td class="${ngClass}">${s.ng_pct.toFixed(1)}%</td></tr>`;
          }).join('\n        ');
        })()}
      </tbody>
    </table>
  </section>

  <section aria-label="致命的 NG 内訳" class="ng-table-section">
    <h2>致命的 NG 内訳（業界横断 / ${shizuokaSummary.ng_total_companies} 件 ／ ${shizuokaSummary.ng_pct.toFixed(1)}%）</h2>
    <table>
      <caption>静岡県 5 都市 ${shizuokaSummary.n_total} 件中の致命的 NG 検出件数（複数 NG 重複事業者あり）</caption>
      <thead>
        <tr><th scope="col">致命的 NG 種類</th><th scope="col">件数</th><th scope="col">説明</th></tr>
      </thead>
      <tbody>
        ${[
          ['HTTPS非対応', shizuokaSummary.ng_breakdown['HTTPS非対応'] ?? 0, 'HTTPS で配信されておらず、現代ブラウザでは安全でない接続として表示される。検索評価上も不利となる'],
          ['SSL証明書', shizuokaSummary.ng_breakdown['SSL証明書'] ?? 0, 'SSL/TLS 証明書が期限切れ・無効・自己署名のため、ブラウザによる警告表示が発生する'],
          ['WP管理面露出', shizuokaSummary.ng_breakdown['WP管理面露出'] ?? 0, 'WordPress 管理画面（wp-login.php / xmlrpc.php 等）が公開状態にあり、認証ボット試行の対象となりうる'],
          ['readme.html露出', shizuokaSummary.ng_breakdown['readme.html露出'] ?? 0, 'WordPress 同梱の readme.html が公開状態にあり、稼働バージョンが第三者から特定可能となる'],
          ['xmlrpc.php有効', shizuokaSummary.ng_breakdown['xmlrpc.php有効'] ?? 0, 'XML-RPC エンドポイントが有効化されており、リフレクション攻撃に利用される可能性がある'],
          ['CMSバージョン情報露出', shizuokaSummary.ng_breakdown['CMSバージョン情報露出'] ?? 0, '&lt;meta name=&quot;generator&quot;&gt; 等で CMS のバージョン情報が露出しており、既知脆弱性の特定が容易な状態にある'],
        ].map(([name, count, desc]) => `<tr><th scope="row">${name}</th><td>${count} 件</td><td>${desc}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </section>

  <section aria-label="dogfooding 倫理開示">
    <h2>dogfooding 倫理：自己実証体としての透明性</h2>
    <blockquote cite="${DOMAIN}/about/">
      「機械検証が示す、AI 時代の WEB 品質。」 — HARTON Certified 信頼根拠の核
    </blockquote>
    <p>本機関の自己実証体 第 1 号は scanner.py により ★★★（HARTON S-Class）を取得し、月次再判定の対象となる（自己例外なし）。自己実証体 自身に致命的 NG 検出時は即時非掲載状態に切替え、機械検証ログを verbatim 公開する。静岡県 5 都市 ${shizuokaSummary.n_total} 件の業界実測で 70 点以上を達成したサイトはゼロ件である。これは認定基準が「人間の主観や金銭、規模に依存しない」客観的な技術指標であることを業界実測で示している。</p>
  </section>

  <section aria-label="関連ページ">
    <h2>関連ページ</h2>
    <ul>
      <li><a href="/comparison/regions/shizuoka/"><strong>静岡県 5 都市 WEB 品質比較</strong></a> — 5 都市横並び + 都市 × 業種 cross-tab + 業種横並びの 3 表で詳細比較</li>
      <li><a href="/datasets/shizuoka-2026-q2.json">機械可読 JSON データセット (CC BY 4.0)</a> — Schema.org Dataset / AI クローラー引用フリー</li>
      <li><a href="/methodology/">評価方法（4 軸機械検証 全公開）</a> — A 基礎 / B 防御 / C AI 検索 / D 経営の 4 軸独立評価とその閾値</li>
      <li><a href="/methodology/security/">B 軸 防御力・生存率</a> — 致命的 NG 4 項目の詳細と検出根拠</li>
      <li><a href="/improvement-guide/">改善ガイダンス</a> — ★区分昇格のための具体 Step（既掲載事業者向け）</li>
      <li><a href="/apply/">掲載申請</a> — 自社サイトの認定獲得を目指す事業者向け</li>
    </ul>
    <p><strong>現状診断レポート</strong>（自社サイトの 4 軸スコア + 致命的 NG 警告 + ★ 取得までの改善 Step）は CR-3 Cloudflare Turnstile 実装後に <a href="/contact/">お問合せ</a>経由で受付開始予定。</p>
  </section>

  <section aria-label="改善された場合の対応">
    <h2>改善された場合の対応 / 四半期更新方針</h2>
    <p>本レポートは月次に scanner.py で全件再判定する。改善により ★ 認定可能となった事業者は、月次再判定で自動的に <a href="/regions/shizuoka/">静岡県 5 都市の認定店舗ページ</a>に掲載され、業界レポートにも昇格通知が記載される。再判定の運用は本機関の失効・降格運用（MASTER-PLAN §12）と完全整合する（事業者通知 + 14 日改善猶予 + 致命的 NG 即時切替）。</p>
    <ul>
      <li><strong>スキャン実施日</strong>: 2026-05-02</li>
      <li><strong>次回再判定予定</strong>: 2026-06-02（月次運用 / scanner.py 自動再判定）</li>
      <li><strong>レポート更新</strong>: 月次再判定後、本ページの数値を更新する</li>
      <li><strong>新規認定通知</strong>: 改善により ★ 認定可能となった事業者は本ページ「新規認定（改善後）」枠に追記し、認定店舗ページに掲載する</li>
    </ul>
  </section>

  ${(() => {
    // 防御的 helper: city 行が summary から欠落しても build を crash させない (reviewer 信頼 82)
    const cityStat = (name, key) => {
      const c = shizuokaSummary.by_city.find(c => c.city === name);
      return c && key in c ? c[key] : '—';
    };
    const cityCertRate = (name) => {
      const c = shizuokaSummary.by_city.find(c => c.city === name);
      return c && typeof c.n === 'number' && c.n > 0 ? `${(c.eligible / c.n * 100).toFixed(1)}%` : '0.0%';
    };
    const ngBd = (name) => shizuokaSummary.ng_breakdown && (name in shizuokaSummary.ng_breakdown) ? shizuokaSummary.ng_breakdown[name] : '—';
    return `<section aria-label="よくある質問" class="report-faq-section">
    <h2>よくある質問 (静岡県 5 都市集計)</h2>
    <details open><summary>静岡県 5 都市 全体で ★ 認定取得サイトは何件ありますか？</summary><div class="faq-answer"><p><strong>0 件</strong> (902 件中 / 2026-05-02 時点)。Phase 0.5 機械検証では総合 70 点以上 + 致命的 NG 0 件を全達成したサイトはゼロでした。業界中央値は ${shizuokaSummary.score_stats.median} 点、業界 max は ${shizuokaSummary.score_stats.max} 点であり、★ 認定基準 (70 点) との差は 16 点です。</p></div></details>
    <details><summary>5 都市の中で WEB 品質が最も高い (★ 認定に最も近い) 都市はどこですか？</summary><div class="faq-answer"><p><strong>★ 認定取得率は全 5 都市で 0.0%</strong> (Phase 0.5 では全件未達)。業界最高点 (= 当該都市内 1 位サイト) ベースでは <strong>沼津市 ${cityStat('沼津市','max')} 点</strong> が最高、次いで富士市 ${cityStat('富士市','max')} 点 / 浜松市 ${cityStat('浜松市','max')} 点 / 静岡市 ${cityStat('静岡市','max')} 点 / 三島市 ${cityStat('三島市','max')} 点。いずれも ★ 認定基準 (70 点) には未到達です。致命的 NG% が最も低いのは三島市 (${typeof cityStat('三島市','ng_pct')==='number'?cityStat('三島市','ng_pct').toFixed(1)+'%':'—'}) で、母集団全体の防御水準は最高です。</p></div></details>
    <details><summary>11 業種の中で WEB 品質が最も高い業種はどれですか？</summary><div class="faq-answer"><p>業界最高点ベースで <strong>司法書士 (54 点) / 不動産仲介 (54 点)</strong> が最高、次いでクリニック・診療所 (53 点) / 税理士・会計士 (52 点) / 行政書士 (52 点)。逆に最高点が低いのは美容院 (44 点) / 美容クリニック (45 点) / 学習塾 (46 点) です。NG% (防御層改善余地) が最も大きいのは行政書士 (48.6%) と美容クリニック (46.5%) です。</p></div></details>
    <details><summary>このレポートのデータは引用・再利用可能ですか？</summary><div class="faq-answer"><p>はい。<a href="/datasets/shizuoka-2026-q2.json">機械可読 JSON</a> として CC BY 4.0 で公開しています。AI クローラー / 研究機関 / メディアによる引用・再利用フリー (出典明記必須)。引用形式: 「HARTON Certified (2026). 静岡県 5 都市 WEB 品質業界レポート 2026 Q2. ${DOMAIN}/news/shizuoka-industry-report-2026-q2/」。</p></div></details>
    <details><summary>致命的 NG が業界で最も多いのはどの種類ですか？</summary><div class="faq-answer"><p><strong>WordPress 管理面露出 (${ngBd('WP管理面露出')} 件)</strong> が最多で、HTTPS 非対応 (${ngBd('HTTPS非対応')} 件) / SSL 証明書失効 (${ngBd('SSL証明書')} 件) / CMS バージョン情報露出 (${ngBd('CMSバージョン情報露出')} 件) と続きます。WP 管理面露出は wp-login.php / xmlrpc.php 等が公開状態のことで、認証ボット攻撃の入口となります。改善は IP 制限 / Basic 認証 / 2FA で即時可能です。</p></div></details>
    <details><summary>次回スキャンと改善後の再判定はいつですか？</summary><div class="faq-answer"><p><strong>次回スキャンは 2026-06-02</strong> (月次運用 / scanner.py 自動再判定)。改善により ★ 認定可能となった事業者は月次再判定で自動的に <a href="/regions/shizuoka/">静岡県 5 都市の認定店舗ページ</a>に掲載されます。事業者からの即時再スキャン依頼は <a href="/contact/">お問合せ</a>から受付。</p></div></details>
  </section>`;
  })()}
</article>`,
  additionalJsonLd: [
    // Article: AI クローラー (Perplexity / Google AI Overview / Bing Chat) 引用最適化
    {
      '@context': 'https://schema.org',
      '@type': ['Article', 'Report'],
      '@id': `${DOMAIN}/news/shizuoka-industry-report-2026-q2/#article`,
      headline: '静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)',
      alternativeHeadline: 'Shizuoka 5-City WEB Quality Industry Report 2026 Q2',
      description: `静岡県 5 都市 (沼津・三島・富士・静岡・浜松) × 11 業種 ${shizuokaSummary.n_total} 件機械検証実測。★ 獲得率 ${shizuokaSummary.eligible_total}/${shizuokaSummary.n_total} = 0.0% / 業界中央値 ${shizuokaSummary.score_stats.median} 点 / 業界 max ${shizuokaSummary.score_stats.max} 点 / 致命的 NG ${shizuokaSummary.ng_pct.toFixed(1)}%。`,
      datePublished: '2026-05-02',
      dateModified: '2026-05-02',
      inLanguage: 'ja',
      isAccessibleForFree: true,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      author: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'HARTON Certified', url: DOMAIN + '/' },
      publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'T.C.HARTON', url: 'https://tcharton.com/' },
      mainEntityOfPage: `${DOMAIN}/news/shizuoka-industry-report-2026-q2/`,
      about: [
        { '@type': 'AdministrativeArea', name: '静岡県', sameAs: 'https://www.wikidata.org/wiki/Q131320' },
        { '@type': 'Thing', name: 'WEB Quality Certification', sameAs: 'https://schema.org/QualitativeValue' },
      ],
      mentions: [
        { '@type': 'AdministrativeArea', name: '沼津市', sameAs: 'https://www.wikidata.org/wiki/Q241037' },
        { '@type': 'AdministrativeArea', name: '三島市', sameAs: 'https://www.wikidata.org/wiki/Q653478' },
        { '@type': 'AdministrativeArea', name: '富士市', sameAs: 'https://www.wikidata.org/wiki/Q328613' },
        { '@type': 'AdministrativeArea', name: '静岡市', sameAs: 'https://www.wikidata.org/wiki/Q174691' },
        { '@type': 'AdministrativeArea', name: '浜松市', sameAs: 'https://www.wikidata.org/wiki/Q185125' },
      ],
      citation: 'HARTON Certified (2026). 静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号). https://certification.tcharton.com/news/shizuoka-industry-report-2026-q2/',
    },
    // Dataset: AI / 研究者が直接統計参照可能な機械可読データ (Schema.org Dataset 仕様準拠)
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': `${DOMAIN}/news/shizuoka-industry-report-2026-q2/#dataset`,
      name: '静岡県 5 都市 × 11 業種 WEB 品質機械検証データ 2026 Q2',
      alternateName: 'Shizuoka 5-City × 11-Industry WEB Quality Verification Dataset 2026 Q2',
      description: '静岡県 5 都市 (沼津・三島・富士・静岡・浜松) × 11 業種 902 件の公開 WEB サイトを HARTON Certified scanner.py (4 軸 / 2,554 項目) で機械検証した結果データセット。総合スコア / ★ 認定可否 / 致命的 NG 内訳 / 業界中央値・max / 都市 × 業種 cross-tab を含む。',
      url: `${DOMAIN}/news/shizuoka-industry-report-2026-q2/`,
      identifier: 'harton-certified-shizuoka-2026-q2',
      keywords: ['WEB 品質', 'Web Quality', '機械検証', 'Machine Verification', '静岡県', 'Shizuoka', 'Web Vitals', 'WCAG 2.2', 'GEO/LLMO', 'Schema.org', 'HTTPS', 'CSP'],
      datePublished: '2026-05-02',
      dateModified: '2026-05-02',
      temporalCoverage: '2026-05-02', // 計測時点の単一日付 (Schema.org 仕様準拠 / reviewer 信頼 88 修正)
      spatialCoverage: {
        '@type': 'Place',
        name: '静岡県',
        geo: { '@type': 'GeoShape', box: '34.5 137.4 35.7 139.2' },
        sameAs: 'https://www.wikidata.org/wiki/Q131320',
      },
      inLanguage: 'ja',
      isAccessibleForFree: true,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'HARTON Certified', url: DOMAIN + '/' },
      publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'T.C.HARTON', url: 'https://tcharton.com/' },
      variableMeasured: [
        { '@type': 'PropertyValue', name: '対象サイト数 (n_total)', value: shizuokaSummary.n_total, unitText: 'サイト' },
        { '@type': 'PropertyValue', name: '★ 認定取得サイト数 (eligible_total)', value: shizuokaSummary.eligible_total, unitText: 'サイト' },
        { '@type': 'PropertyValue', name: '業界中央値スコア (score_stats.median)', value: shizuokaSummary.score_stats.median, unitText: '点 (0-100)' },
        { '@type': 'PropertyValue', name: '業界最高点 (score_stats.max)', value: shizuokaSummary.score_stats.max, unitText: '点 (0-100)' },
        { '@type': 'PropertyValue', name: '致命的 NG 発生率 (ng_pct)', value: shizuokaSummary.ng_pct, unitText: '%' },
        { '@type': 'PropertyValue', name: '致命的 NG 件数 (ng_total_companies)', value: shizuokaSummary.ng_total_companies, unitText: 'サイト' },
        { '@type': 'PropertyValue', name: '都市別 cross-tab (cross_tab_n)', description: '都市 × 業種別の対象サイト数を二次元配列で格納' },
      ],
      distribution: [
        {
          '@type': 'DataDownload',
          '@id': `${DOMAIN}/datasets/shizuoka-2026-q2.json#download`,
          encodingFormat: 'application/json',
          contentUrl: `${DOMAIN}/datasets/shizuoka-2026-q2.json`,
          name: '静岡県 5 都市 WEB 品質データ JSON',
          description: 'AI クローラー / 研究機関 / メディアによる引用・再利用可能な機械可読 JSON。CC BY 4.0',
          inLanguage: 'ja',
          encodesCreativeWork: { '@id': `${DOMAIN}/news/shizuoka-industry-report-2026-q2/#dataset` },
        },
      ],
      citation: 'HARTON Certified (2026). 静岡県 5 都市 × 11 業種 WEB 品質機械検証データセット 2026 Q2. https://certification.tcharton.com/datasets/shizuoka-2026-q2.json',
      isBasedOn: { '@type': 'CreativeWork', '@id': `${DOMAIN}/methodology/#article`, name: 'HARTON Certified SPEC v3.4 (2,554 項目 / 4 軸機械検証)', url: `${DOMAIN}/methodology/` },
    },
    // FAQPage: AI Overview / Featured Snippet 引用機会の獲得
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${DOMAIN}/news/shizuoka-industry-report-2026-q2/#faq`,
      mainEntity: [
        { '@type': 'Question', name: '静岡県 5 都市 全体で ★ 認定取得サイトは何件ありますか？', acceptedAnswer: { '@type': 'Answer', text: `0 件 (902 件中 / 2026-05-02 時点)。Phase 0.5 機械検証では総合 70 点以上 + 致命的 NG 0 件を全達成したサイトはゼロ。業界中央値は ${shizuokaSummary.score_stats.median} 点、業界 max は ${shizuokaSummary.score_stats.max} 点、★ 認定基準 (70 点) との差は 16 点。` } },
        { '@type': 'Question', name: '5 都市の中で WEB 品質が最も高い都市はどこですか？', acceptedAnswer: { '@type': 'Answer', text: `★ 認定取得率は全 5 都市で 0.0% (Phase 0.5 では全件未達)。業界最高点ベースで沼津市 ${shizuokaSummary.by_city.find(c=>c.city==='沼津市').max} 点が最高。致命的 NG% が最も低いのは三島市 (${shizuokaSummary.by_city.find(c=>c.city==='三島市').ng_pct.toFixed(1)}%) で、母集団全体の防御水準は最高。` } },
        { '@type': 'Question', name: '11 業種の中で WEB 品質が最も高い業種はどれですか？', acceptedAnswer: { '@type': 'Answer', text: '業界最高点ベースで司法書士 (54 点) / 不動産仲介 (54 点) が最高、次いでクリニック・診療所 (53 点) / 税理士・会計士 (52 点) / 行政書士 (52 点)。NG% (防御層改善余地) が最も大きいのは行政書士 (48.6%) と美容クリニック (46.5%)。' } },
        { '@type': 'Question', name: 'このレポートのデータは引用・再利用可能ですか？', acceptedAnswer: { '@type': 'Answer', text: `はい。機械可読 JSON (${DOMAIN}/datasets/shizuoka-2026-q2.json) として CC BY 4.0 で公開。AI クローラー / 研究機関 / メディアによる引用・再利用フリー (出典明記必須)。` } },
        { '@type': 'Question', name: '致命的 NG が業界で最も多いのはどの種類ですか？', acceptedAnswer: { '@type': 'Answer', text: `WordPress 管理面露出 (${shizuokaSummary.ng_breakdown['WP管理面露出']} 件) が最多で、HTTPS 非対応 (${shizuokaSummary.ng_breakdown['HTTPS非対応']} 件) / SSL 証明書失効 (${shizuokaSummary.ng_breakdown['SSL証明書']} 件) / CMS バージョン情報露出 (${shizuokaSummary.ng_breakdown['CMSバージョン情報露出']} 件) と続く。` } },
        { '@type': 'Question', name: '次回スキャンはいつですか？', acceptedAnswer: { '@type': 'Answer', text: '次回スキャンは 2026-06-02 (月次運用 / scanner.py 自動再判定)。改善により ★ 認定可能となった事業者は月次再判定で自動的に静岡県 5 都市の認定店舗ページに掲載される。' } },
      ],
    },
    // ItemList (5 都市): 各都市ページへのリンク構造化
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${DOMAIN}/news/shizuoka-industry-report-2026-q2/#cities`,
      name: '静岡県 5 都市 WEB 品質ランキング 2026 Q2 (業界最高点降順)',
      numberOfItems: 5,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: [...shizuokaSummary.by_city]
        .sort((a, b) => b.max - a.max)
        .map((c, i) => {
          const cityKeyMap = { '沼津市': 'numazu', '三島市': 'mishima', '富士市': 'fuji', '静岡市': 'shizuoka', '浜松市': 'hamamatsu' };
          const cityWikiMap = { '沼津市': 'Q241037', '三島市': 'Q653478', '富士市': 'Q328613', '静岡市': 'Q174691', '浜松市': 'Q185125' };
          return {
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'AdministrativeArea',
              name: c.city,
              url: `${DOMAIN}/regions/shizuoka/${cityKeyMap[c.city]}/`,
              sameAs: `https://www.wikidata.org/wiki/${cityWikiMap[c.city]}`,
              description: `${c.city}: 対象 ${c.n} 件 / ★ 認定取得 ${c.eligible} 件 / 認定取得率 ${c.n>0?(c.eligible/c.n*100).toFixed(1):'0.0'}% / 業界最高点 ${c.max} 点 / 致命的 NG ${c.ng_pct.toFixed(1)}%`,
            },
          };
        }),
    },
  ],
});

// ─── 14. contact（subpage / marketing / form あり）──
PAGES.push({
  path: 'contact/index.html',
  variant: 'reading',
  navActive: '',
  title: 'お問合せ — HARTON Certified',
  description: 'HARTON Certified へのお問合せフォーム。掲載申請 / 取材依頼 / 掲載辞退 / その他のご質問を 1 営業日以内に対応する。送信前に内容確認画面を表示し、Web3Forms 経由で受信する。',
  canonicalPath: '/contact/',
  breadcrumbs: bcl([['トップ', '/'], ['お問合せ', '/contact/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified へのお問合せは <strong>1</strong> 営業日以内に対応する。<strong>4</strong> カテゴリの問合せ種別を選択でき、月間処理件数は <strong>30</strong> 件規模を想定する。送信前に確認画面で内容を再確認できる。非侵入型ボット防御（<a href="https://www.cloudflare.com/products/turnstile/" rel="nofollow noopener noreferrer" target="_blank">Cloudflare Turnstile</a>）は CR-3 で別途実装予定（site key 受領後）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「非侵入型ボット防御を必須とする」 — SPEC v3.4 §8.8
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>お問合せ</h1>
  </section>
  <section aria-label="お問合せフォーム">
    <h2>フォーム</h2>
    <form action="https://api.web3forms.com/submit" method="POST" id="contactForm" novalidate>
      <input type="hidden" name="access_key" value="9fda1d98-e246-4730-a12c-2251a5ae35b0">
      <input type="hidden" name="subject" value="HARTON Certified サイトからのお問い合わせ">
      <input type="hidden" name="from_name" value="HARTON Certified Contact Form">
      <!-- JS 無効環境では Web3Forms が直接ここへリダイレクトする / JS 有効環境では fetch で hijack するため未参照 -->
      <input type="hidden" name="redirect" value="https://certification.tcharton.com/thanks.html">
      <input type="checkbox" name="botcheck" class="hidden" style="display:none" tabindex="-1" autocomplete="off">
      <p><label for="name">お名前（必須）</label>
      <input type="text" id="name" name="name" required></p>
      <p><label for="email">メールアドレス（必須）</label>
      <input type="email" id="email" name="email" required></p>
      <p><label for="company">事業者名（任意）</label>
      <input type="text" id="company" name="company"></p>
      <p><label for="category">お問合せ種別</label>
      <select id="category" name="category">
        <option value="apply">掲載申請</option>
        <option value="press">取材依頼</option>
        <option value="opt-out">掲載辞退</option>
        <option value="other">その他</option>
      </select></p>
      <p><label for="message">お問合せ内容（必須）</label>
      <textarea id="message" name="message" rows="6" required></textarea></p>
      <p><button type="submit" id="confirmBtn" class="px-6 py-3">入力内容を確認する</button></p>
      <p id="contactError" role="alert" tabindex="-1"></p>
      <p id="contactStatus" role="status" aria-live="polite"></p>
    </form>
    <p>本フォームは Web3Forms 経由で受信する。JS 有効環境では送信前に確認画面で内容を確認でき、送信完了後は thanks 画面へ自動遷移する。JS 無効環境では確認画面を介さず直接 Web3Forms に送信する（progressive enhancement / SPEC §7.4 noscript fallback 整合）。非侵入型ボット防御（Cloudflare Turnstile）は CR-3 で別途実装予定（site key 受領後）。</p>
  </section>

  <!-- 確認モーダル (送信前の最終確認画面 / JS で表示制御 / JS 無効時は表示されない) -->
  <div id="confirmModal" class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirmTitle" hidden>
    <div class="confirm-modal-card">
      <button type="button" id="confirmClose" class="confirm-close" aria-label="閉じる"><span aria-hidden="true">×</span></button>
      <h2 id="confirmTitle">入力内容の確認</h2>
      <p>以下の内容で送信する。誤りがなければ「この内容で送信する」、修正したい場合は「戻って修正する」を選ぶ。</p>
      <dl id="confirmList"></dl>
      <div class="confirm-actions">
        <button type="button" id="confirmSubmit" class="confirm-primary">この内容で送信する</button>
        <button type="button" id="confirmBack" class="confirm-secondary">戻って修正する</button>
      </div>
    </div>
  </div>

  <script src="/assets/js/contact.js" defer></script>
  <section aria-label="プライバシー">
    <h2>送信内容の取扱い</h2>
    <p>収集する情報: お名前 / メールアドレス / 事業者名 / 種別 / 内容のみ。第三者提供なし。詳細は <a href="/privacy/">プライバシーポリシー</a>を参照する。</p>
  </section>
</article>`,
});

// ─── 15. legal（minimal / reading / 特商法 11 条準拠）──────
PAGES.push({
  path: 'legal/index.html',
  variant: 'reading',
  navActive: '',
  title: '利用規約・特定商取引法表記 — HARTON Certified',
  description: 'HARTON Certified サイトの利用規約および特定商取引法に基づく表記。事業者 T.C.HARTON / 〒410-0022 静岡県沼津市大岡2690。',
  canonicalPath: '/legal/',
  robots: 'index, follow',
  mainContent: `
<article>
  <h1>利用規約・特定商取引法表記</h1>

  <section aria-label="特定商取引法に基づく表記">
    <h2>特定商取引法に基づく表記</h2>
    <p>本表記は特定商取引法第 11 条（通信販売についての広告）に基づく事業者情報である。HARTON Certified は無料で運用される独立認定機関であり、課金を伴う物販・役務提供は本サイト経由で行わない。</p>

    <table>
      <caption>事業者情報（特商法第 11 条 準拠）</caption>
      <tbody>
        <tr><th scope="row">事業者名</th><td>T.C.HARTON</td></tr>
        <tr><th scope="row">所在地</th><td>〒410-0022 静岡県沼津市大岡2690</td></tr>
        <tr><th scope="row">運営事業</th><td>HARTON Certified（独立認定機関 / 機械検証による WEB 品質公正評価）</td></tr>
        <tr><th scope="row">連絡先</th><td><a href="/contact/">/contact/</a> のお問合せフォームより受付。1 営業日以内に返信する。</td></tr>
        <tr><th scope="row">運営サイト</th><td><a href="${DOMAIN}/">${DOMAIN}/</a></td></tr>
        <tr><th scope="row">役務対価</th><td>無料。掲載料・認定料・更新料その他の課金は一切発生しない（完全中立 / 金銭非依存運用）。</td></tr>
        <tr><th scope="row">役務提供時期</th><td>掲載申請受付後 1 営業日以内に scanner.py による機械検証を開始する。診断結果は 5 日以内に通知する。</td></tr>
        <tr><th scope="row">支払方法</th><td>無料役務のため発生しない。</td></tr>
        <tr><th scope="row">返品・キャンセル</th><td>事業者側からの掲載辞退は <a href="/opt-out/">/opt-out/</a> より随時受け付ける。理由不要、24 時間以内に対応する。</td></tr>
      </tbody>
    </table>
  </section>

  <section aria-label="利用規約">
    <h2>利用規約</h2>
    <p>本利用規約 (以下「本規約」) は、HARTON Certified (以下「本サービス」) の利用条件を定めるものである。本サービスを利用する全ての利用者 (掲載事業者・閲覧者・データ利用者) は本規約に同意したものとみなす。</p>

    <h3>第 1 条 (本サービスの目的)</h3>
    <p>本サービスは、機械検証 (scanner.py / SPEC v3.4 / 2,554 項目 / 4 軸) による WEB サイト品質の客観評価を通じ、AI 検索時代における信頼ある WEB の普及を支援することを目的とする。本サービスは特定の事業者を不利益に取扱う意図を一切有しない。</p>

    <h3>第 2 条 (掲載基準と中立性)</h3>
    <p>本サービスは以下の運営方針により公正性を担保する:</p>
    <ul>
      <li>金銭非依存運用: 掲載料・認定料・更新料・広告料その他の対価を一切徴収しない (本ページ上部「特商法表記」参照)。</li>
      <li>評価基準全公開: 評価項目・閾値・実施手順は <a href="/methodology/">/methodology/</a> で全て開示する。</li>
      <li>scanner.py による機械的判定: 評価結果は人為的判断を排し、自動計測のみで生成する。</li>
      <li>自己実証体としての適用: 運営主体 T.C.HARTON の自社サイト tcharton.com も本サービスの評価基準を自社で適用しており、★★★ HARTON S-Class を取得している (dogfooding 倫理 / 詳細は <a href="/about/">/about/</a>)。</li>
      <li>ポジティブセレクション: ★ 以上達成事業者のみ掲載対象とし、未達事業者の個別公開は行わない (業種別集計データのみ統計値として公開)。</li>
    </ul>

    <h3>第 3 条 (機械検証の限界と免責)</h3>
    <p>scanner.py による機械検証は以下の前提で運用される。利用者はこれを理解した上で本サービスのデータを利用するものとする:</p>
    <ul>
      <li>評価結果は<strong>機械検証実施時点</strong>のスナップショットであり、対象 WEB サイトの現在状態を保証するものではない。</li>
      <li>「致命的 NG」の表記は SPEC v3.4 で定義された<strong>具体的技術項目</strong> (HTTPS 非対応 / SSL 証明書 / WP 管理面露出 / CMS バージョン情報露出) の検出を意味し、対象事業者の事業品質や信用度に対する評価ではない。</li>
      <li>scanner.py は機械的検出ツールである以上、設定・構成によっては誤検出 (false positive) が発生し得る。検出結果に異議がある事業者は <a href="/contact/">/contact/</a> より「scanner 結果訂正請求」として申立てが可能であり、本機関は速やかに再検証する。</li>
      <li>本サービスは合理的努力で正確性を期するが、検証結果の絶対的正確性 / 完全性 / 特定目的適合性を保証しない。利用者の判断・行動に起因する損害について、本機関は法令で許容される最大限において責任を負わない。</li>
    </ul>

    <h3>第 4 条 (掲載拒否権 / opt-out)</h3>
    <p>掲載対象事業者は <a href="/opt-out/">/opt-out/</a> より掲載辞退申立てが可能。理由は不要であり、24 時間以内に該当事業者を本サービス全体から除外する。再掲載は事業者の明示申請がない限り行わない。</p>

    <h3>第 5 条 (著作権 / コンテンツのライセンス)</h3>
    <p>本サイトのコンテンツに対する著作権は次の通り運用する:</p>
    <ul>
      <li><strong>サイトデザイン / レイアウト / コピーライティング / ロゴ / バッジ素材 / ブランド要素</strong>: T.C.HARTON に帰属。無断複製・転用を禁ずる。</li>
      <li><strong>機械検証統計データ (業界レポート / 比較ページ / Dataset endpoint)</strong>: <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> ライセンスで公開。出典明記の上、AI クローラー・研究機関・メディア・教育機関による引用・再利用フリー (license URL: <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">https://creativecommons.org/licenses/by/4.0/</a>)。</li>
      <li>引用形式: 「HARTON Certified (2026). [レポート名]. ${DOMAIN}/[ページ URL]」</li>
      <li>機械可読 Dataset endpoint: <a href="/datasets/shizuoka-2026-q2.json">/datasets/shizuoka-2026-q2.json</a> 他、Phase 1+ で順次拡張</li>
    </ul>

    <h3>第 6 条 (準拠法 / 管轄)</h3>
    <p>本規約の解釈および本サービスに関する一切の紛争には日本法を適用する。本サービスに関連する紛争については、<strong>静岡地方裁判所沼津支部</strong>を第一審の専属的合意管轄裁判所とする。</p>

    <h3>第 7 条 (本規約の改訂)</h3>
    <p>本規約は事業環境・法令改正・運用知見の変化に応じ改訂することがある。重要改訂時は <a href="/news/">/news/</a> で公表後 14 日間の周知期間を設けた上で発効する。</p>

    <p><time datetime="2026-05-02" itemprop="dateModified">2026-05-02 公開・最終更新</time> ／ 出典基準: <a href="https://www.no-trouble.caa.go.jp/" rel="nofollow noopener noreferrer" target="_blank">消費者庁「特定商取引法ガイド」</a> / <a href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow noopener noreferrer" target="_blank">Creative Commons CC BY 4.0</a></p>
  </section>
</article>`,
});

// ─── 16. privacy（minimal / reading）────────────────
PAGES.push({
  path: 'privacy/index.html',
  variant: 'reading',
  navActive: '',
  title: 'プライバシーポリシー — HARTON Certified',
  description: 'HARTON Certified の個人情報取扱方針。法人情報・公開連絡先のみ収集、第三者提供なし、個人情報保護法 2022 改正・GDPR 対応。',
  canonicalPath: '/privacy/',
  robots: 'index, follow',
  mainContent: `
<article>
  <h1>プライバシーポリシー</h1>
  <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 制定・公開</time> ／ <time datetime="2026-05-02" itemprop="dateModified">最終更新 2026-05-02</time> ／ 個人情報保護法 (2022 年改正) + GDPR 第 13 条 + Cookie 規制 (ePrivacy) 整合</p>

  <section aria-label="運営主体">
    <h2>1. 運営主体 (個人情報取扱事業者)</h2>
    <table>
      <caption>個人情報保護法 第 32 条 第 1 項 第 1 号 準拠</caption>
      <tbody>
        <tr><th scope="row">事業者名</th><td>T.C.HARTON</td></tr>
        <tr><th scope="row">所在地</th><td>〒410-0022 静岡県沼津市大岡2690</td></tr>
        <tr><th scope="row">代表者</th><td>大内 達也</td></tr>
        <tr><th scope="row">運営サービス</th><td>HARTON Certified (${DOMAIN}/)</td></tr>
        <tr><th scope="row">個人情報保護管理責任者</th><td>大内 達也 (代表者兼任)</td></tr>
        <tr><th scope="row">問合せ窓口</th><td><a href="/contact/">/contact/</a> (1 営業日以内に返信)</td></tr>
      </tbody>
    </table>
  </section>

  <section aria-label="収集する個人情報">
    <h2>2. 収集する個人情報の項目と利用目的</h2>
    <p>本サービスは以下の個人情報のみを、明示された利用目的の範囲内で収集する。</p>
    <table>
      <caption>個人情報項目と利用目的 (個人情報保護法 第 17 条 / GDPR 第 13 条 第 1 項 c 号 準拠)</caption>
      <thead><tr><th scope="col">情報項目</th><th scope="col">取得経路</th><th scope="col">利用目的</th><th scope="col">法的根拠</th></tr></thead>
      <tbody>
        <tr><td>氏名</td><td>/contact/ お問合せフォーム入力</td><td>お問合せへの回答 / 取材対応 / 掲載申請対応 / 掲載辞退対応</td><td>本人同意 (フォーム送信時)</td></tr>
        <tr><td>メールアドレス</td><td>/contact/ お問合せフォーム入力</td><td>同上 (返信先として)</td><td>本人同意</td></tr>
        <tr><td>事業者名 (任意)</td><td>/contact/ お問合せフォーム入力</td><td>事業者単位での問合せ管理</td><td>本人同意</td></tr>
        <tr><td>お問合せ種別</td><td>/contact/ お問合せフォーム選択</td><td>適切な対応経路への振分け</td><td>本人同意</td></tr>
        <tr><td>お問合せ内容</td><td>/contact/ お問合せフォーム入力</td><td>具体的問合せへの回答</td><td>本人同意</td></tr>
        <tr><td>IP アドレス / User-Agent</td><td>HTTP リクエストヘッダ (自動収集)</td><td>不正アクセス防止 / アクセスログ調査</td><td>正当な利益 (Cloudflare ログ)</td></tr>
      </tbody>
    </table>
    <p>本サービスは「要配慮個人情報」(個人情報保護法 第 2 条 第 3 項) を一切取得しない。Cookie・ローカルストレージ等のトラッキング技術は<strong>使用しない</strong> (アクセス解析 / 広告配信 / 行動追跡なし)。</p>
  </section>

  <section aria-label="第三者処理者">
    <h2>3. 個人情報の処理を委託する第三者 (sub-processor)</h2>
    <p>本サービスは以下の第三者処理者を利用する。各社は適切なデータ保護措置を講じている (個人情報保護法 第 25 条 / GDPR 第 28 条 / PIPA 第 24 条 越境転送準拠)。</p>
    <table>
      <caption>個人情報処理の委託先一覧</caption>
      <thead><tr><th scope="col">委託先</th><th scope="col">委託業務</th><th scope="col">所在国</th><th scope="col">プライバシーポリシー</th></tr></thead>
      <tbody>
        <tr><td><strong>Web3Forms</strong> (運営: Surbiton Labs LLP)</td><td>お問合せフォーム送信処理 (フォームデータの代理受信 → 本機関メールへの転送)</td><td>米国</td><td><a href="https://web3forms.com/privacy" rel="noopener noreferrer" target="_blank">https://web3forms.com/privacy</a></td></tr>
        <tr><td><strong>Cloudflare, Inc.</strong></td><td>サイトホスティング (Cloudflare Pages) / CDN / DDoS 防御 / SSL 終端</td><td>米国 (PoP は EU・日本含む全世界)</td><td><a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer" target="_blank">https://www.cloudflare.com/privacypolicy/</a></td></tr>
      </tbody>
    </table>
    <p><strong>越境移転に関する同意</strong>: お問合せフォーム送信は Web3Forms (米国) 経由で処理される。サイト閲覧時のアクセスログは Cloudflare の世界各地の PoP を経由する。これらは個人情報の越境移転に該当する (PIPA 第 24 条)。フォーム送信を以て本越境移転に同意したものとみなす。同意しない場合はメール (詳細は §6) でのお問合せをご利用いただきたい。</p>
  </section>

  <section aria-label="保管期間">
    <h2>4. 個人情報の保管期間</h2>
    <ul>
      <li><strong>お問合せフォーム経由の個人情報</strong>: 問合せ対応完了後 <strong>6 ヶ月</strong>以内に削除する。但し以下の例外あり:
        <ul>
          <li>掲載申請受理 → 認定取得した事業者の連絡先: 認定有効期間中 (★ 取消・降格・opt-out まで) 保管</li>
          <li>法令上の保管義務がある場合 (税法・特定商取引法等): 当該法令所定の期間</li>
        </ul>
      </li>
      <li><strong>アクセスログ (IP / User-Agent)</strong>: Cloudflare 標準保持期間 (通常 7 日間 / 不正アクセス調査時は 30 日まで延長可能)</li>
      <li><strong>Web3Forms 側保管</strong>: Web3Forms 規約に準拠 (詳細は同社プライバシーポリシー参照)</li>
    </ul>
  </section>

  <section aria-label="第三者提供">
    <h2>5. 第三者提供の禁止</h2>
    <p>本機関は本人同意なく個人情報を第三者へ提供しない (個人情報保護法 第 27 条)。例外は以下のみ:</p>
    <ul>
      <li>法令に基づく場合 (裁判所・捜査機関からの正式な開示命令等)</li>
      <li>人の生命・身体・財産の保護のため緊急に必要な場合</li>
      <li>本人同意があり、その範囲内での提供</li>
      <li>個人を特定できない統計的データへの加工後の公開 (業界レポート等 / CC BY 4.0)</li>
    </ul>
  </section>

  <section aria-label="本人の権利">
    <h2>6. 本人の権利 (開示・訂正・削除・停止請求)</h2>
    <p>本人は自己の個人情報について以下の権利を行使できる (個人情報保護法 第 33-39 条 / GDPR 第 15-22 条):</p>
    <ul>
      <li>開示請求 (どのような情報が保管されているか)</li>
      <li>訂正・追加・削除請求 (誤り / 古い情報の修正)</li>
      <li>利用停止請求 / 第三者提供停止請求</li>
      <li>データポータビリティ (構造化データ形式での移転)</li>
      <li>異議申立て (処理に対する反対表明)</li>
    </ul>
    <p><strong>請求方法</strong>: 以下のいずれかで受付。本人確認後、原則 2 週間以内 (法定上限 30 日) に対応する。手数料は無料。</p>
    <ul>
      <li>お問合せフォーム: <a href="/contact/">/contact/</a> (種別「その他」で個人情報請求と明記)</li>
      <li>メール直接送付: <strong>certification@tcharton.com</strong></li>
      <li>書面: 〒410-0022 静岡県沼津市大岡2690 T.C.HARTON 個人情報保護管理責任者 宛</li>
    </ul>
    <p>掲載対象事業者の掲載辞退については、より迅速な専用窓口 <a href="/opt-out/">/opt-out/</a> をご利用いただきたい (24 時間以内対応)。</p>
  </section>

  <section aria-label="掲載対象事業者の取扱い">
    <h2>7. 機械検証対象事業者の情報の取扱い</h2>
    <p>HARTON Certified は公開 WEB サイトを scanner.py で機械検証する独立認定機関である。検証対象となる事業者情報の取扱いは以下の通り:</p>
    <ul>
      <li><strong>収集情報</strong>: 公開 WEB サイトの URL / 公開メタデータ (Schema.org / OGP / robots.txt 等) / HTTP レスポンスヘッダのみ。事業者の非公開情報は一切収集しない。</li>
      <li><strong>個別公開条件</strong>: ★ 以上 (総合 70 点 + 致命的 NG 0 件) を達成した事業者のみ。未達事業者の個別情報は公開しない (業種別集計値のみ統計データとして公開)。</li>
      <li><strong>opt-out</strong>: <a href="/opt-out/">/opt-out/</a> より理由不要・24 時間以内に該当事業者を本サービス全体から除外。</li>
      <li><strong>異議・訂正</strong>: scanner 検出結果への異議申立ては <a href="/contact/">/contact/</a> より受付。</li>
    </ul>
  </section>

  <section aria-label="改定">
    <h2>8. 本ポリシーの改定</h2>
    <p>本ポリシーは法令改正・運用知見・第三者処理者変更等に応じ改定することがある。重要な改定時は <a href="/news/">/news/</a> で公表後 14 日間の周知期間を設けた上で発効する。</p>
  </section>
</article>`,
});

// ─── 17a. case-studies hub (新設 / v1.18 観点 2 ストーリーテリング基盤 / Goodpatch 型 3 段)
PAGES.push({
  path: 'case-studies/index.html',
  variant: 'reading',
  navActive: '',
  title: '導入事例 — HARTON Certified ★ 取得への道筋',
  description: '機械検証で ★ 認定を取得した事業者の「課題 → 改善 → 取得」3 段ストーリー。自己実証体 第 1 号 tcharton.com (★★★ HARTON S-Class) を含む全件公開。Phase 0.5 では認定取得 0 件のため、自己実証 + 業界共通改善ロードマップを公開する。',
  canonicalPath: '/case-studies/',
  breadcrumbs: bcl([['トップ', '/'], ['導入事例', '/case-studies/']]),
  mainContent: `
<article>
  <header>
    <h1>導入事例 — ★ 取得への道筋</h1>
    <p><time datetime="2026-05-03" itemprop="datePublished">2026-05-03 公開</time> ／ <time datetime="2026-05-03" itemprop="dateModified">最終更新 2026-05-03</time></p>
  </header>

  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は機械検証で WEB 品質を測る独立認定機関である。本ページは ★ 認定を取得した事業者が辿った「<strong>課題 → 改善 → 取得</strong>」の 3 段ストーリーを公開する。Phase 0.5 静岡県 5 都市 ${shizuokaSummary.n_total} 件機械検証では ★ 認定取得は 0 件であるが、運営主体 T.C.HARTON の自社サイト tcharton.com が <strong>★★★ HARTON S-Class</strong> を取得した自己実証体 第 1 号として、全事業者に向けて取得経緯を verbatim 公開する。</p>
    <blockquote cite="${DOMAIN}/about/">
      「機械検証が示す、AI 時代の WEB 品質。」 — HARTON Certified
    </blockquote>
  </section>

  <section aria-label="自己実証体 第 1 号" class="case-studies-list">
    <h2>自己実証体 第 1 号</h2>
    <ul class="case-studies-cards">
      <li class="case-card case-card-featured">
        <div class="case-card-meta">
          <span class="case-card-rating" aria-label="★★★ HARTON S-Class">★★★</span>
          <span class="case-card-class">HARTON S-Class</span>
        </div>
        <h3 class="case-card-title">tcharton.com — 沼津起点の自己実証 (旧 C/65 → 🏆 S/90)</h3>
        <p class="case-card-meta-line">IT・WEB 制作 ／ 静岡県沼津市 ／ 取得 2026-04-27 / commit <code>36d4328</code></p>
        <p class="case-card-summary">運営主体 T.C.HARTON の自社サイト。dogfooding 倫理に基づき、自社評価基準を自社サイトに先に適用した第 1 号。旧スコア C/65 から 7 commit と 1 個の住所完全公開で 🏆 S/90 (HARTON S-Class) を取得した記録的事例。</p>
        <a href="/case-studies/tcharton-com/" class="case-card-link">課題 → 改善 → 取得 の詳細を見る →</a>
      </li>
    </ul>
  </section>

  <section aria-label="未来の認定事業者" class="case-studies-future">
    <h2>未来の認定事業者の方へ</h2>
    <p>Phase 0.5 静岡県 5 都市 ${shizuokaSummary.n_total} 件機械検証では ★ 認定取得は 0 件 (業界中央値 ${shizuokaSummary.score_stats.median} 点 / 業界 max ${shizuokaSummary.score_stats.max} 点 / 認定基準 70 点)。但し、tcharton.com の自己実証経緯が示す通り、<strong>HTTPS + JSON-LD + CSP + GEO/LLMO + Core Web Vitals の 5 Step を 90 日で実装すれば ★★★ HARTON S-Class まで到達可能</strong>である。</p>
    <ul>
      <li><a href="/improvement-guide/"><strong>改善ガイダンス 5 Step (90 日)</strong></a> — HTTPS / JSON-LD / CSP / GEO/LLMO / CWV の各 step 実装手順 + tcharton.com 7 commit からの抽出パターン</li>
      <li><a href="/methodology/">評価方法 4 軸機械検証</a> — A 基礎 / B 防御 / C AI 検索 / D 経営の閾値全公開</li>
      <li><a href="/apply/">掲載申請 (無料)</a> — 自社サイトの ★ 区分判定を申込</li>
    </ul>
  </section>

  <section aria-label="関連ページ">
    <h2>関連ページ</h2>
    <ul>
      <li><a href="/about/">サイトについて</a> — dogfooding 倫理 + 自己実証体 第 1 号の信頼根拠</li>
      <li><a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2</a> — Phase 0.5 全体実測</li>
      <li><a href="/comparison/regions/shizuoka/">静岡県 5 都市 WEB 品質比較</a> — 都市横並び比較</li>
    </ul>
  </section>
</article>`,
  additionalJsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${DOMAIN}/case-studies/#list`,
      name: 'HARTON Certified 認定事業者 導入事例一覧',
      numberOfItems: 1,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Article',
            '@id': `${DOMAIN}/case-studies/tcharton-com/#article`,
            headline: 'tcharton.com — 沼津起点の自己実証 (旧 C/65 → 🏆 S/90)',
            url: `${DOMAIN}/case-studies/tcharton-com/`,
          },
        },
      ],
    },
  ],
});

// ─── 17b. case-studies/tcharton-com/ (Goodpatch 型 3 段 case study / 自己実証体 第 1 号 詳細物語)
PAGES.push({
  path: 'case-studies/tcharton-com/index.html',
  variant: 'reading',
  navActive: '',
  title: 'tcharton.com — 沼津起点の自己実証体 第 1 号 (★★★ HARTON S-Class) — HARTON Certified',
  description: 'HARTON Certified 運営主体 T.C.HARTON の自社サイト tcharton.com が、自社評価基準を自社サイトに先に適用し ★★★ HARTON S-Class を取得した自己実証体 第 1 号の詳細記録。旧 C/65 → 🏆 S/90 までの「課題 → 改善 → 取得」7 commit timeline を verbatim 公開。dogfooding 倫理の原典。',
  canonicalPath: '/case-studies/tcharton-com/',
  ogType: 'article',
  breadcrumbs: bcl([['トップ', '/'], ['導入事例', '/case-studies/'], ['tcharton.com', '/case-studies/tcharton-com/']]),
  mainContent: `
<article class="case-study-article">
  <header>
    <h1>tcharton.com — 沼津起点の自己実証体 第 1 号</h1>
    <p class="case-study-subtitle">旧 C/65 → 🏆 S/90 (HARTON S-Class) / 7 commit + 住所完全公開で達成</p>
    <p class="case-study-meta"><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 取得記録</time> ／ <time datetime="2026-05-03" itemprop="dateModified">最終更新 2026-05-03</time> ／ 運営: <a href="https://tcharton.com/" rel="noopener noreferrer" target="_blank">T.C.HARTON</a></p>
  </header>

  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は機械検証で WEB 品質を測る独立認定機関である。本機関の中核原則は「<strong>機械検証が示す、AI 時代の WEB 品質。</strong>」であり、運営主体 T.C.HARTON は dogfooding 倫理 (自社評価基準を自社サイトに先に適用する) に基づき、自社サイト <a href="https://tcharton.com/" rel="noopener noreferrer" target="_blank">tcharton.com</a> を <strong>scanner.py 機械検証の最初の評価対象</strong>とした。本ページはその「課題 → 改善 → 取得」全行程を verbatim 公開する。</p>
    <blockquote cite="${DOMAIN}/about/">
      「自分が達成できない基準で他者を測ることはしない」 — HARTON Certified 信頼根拠の核
    </blockquote>
  </section>

  <section aria-label="3 段ストーリー" class="case-study-3step">
    <h2>3 段ストーリー: 課題 → 改善 → 取得</h2>

    <div class="case-step case-step-challenge">
      <div class="case-step-marker"><span class="case-step-num">1</span><span class="case-step-label">課題</span></div>
      <div class="case-step-body">
        <h3>初期スコア C/65 — 機械検証で発覚した品質ギャップ</h3>
        <p><strong>2026 年 Phase 1 着手前</strong>、自社サイト tcharton.com を scanner.py で初回評価したところ、総合 <strong>65 点 (C 区分)</strong> という結果を得た。本機関の認定基準は ★ HARTON Certified が <strong>70 点 + 致命的 NG 0 件</strong> であり、自社サイト自体が認定基準未達という事実を直視する必要があった。</p>
        <p>具体的な課題:</p>
        <ul>
          <li><strong>A 軸 基礎</strong>: HSTS preload 未登録 / Core Web Vitals 一部未達 (LCP > 2.5s)</li>
          <li><strong>B 軸 防御</strong>: CSP 未配信 / Trusted Types 未適用 / WP 管理面検出</li>
          <li><strong>C 軸 AI 検索</strong>: JSON-LD <code>@type</code> 単一 (配列化前) / sameAs Wikidata 未連携 / GBP CID 未取得</li>
          <li><strong>D 軸 経営</strong>: NAP 不完全 (住所 △ / streetAddress 非公開) / OGP 未整備</li>
        </ul>
        <p>これらは scanner ④ S クラス最高技術責任者の TCHARTON-AUDIT で全件機械検出された。「自分が達成できない基準で他者を測らない」原則に従い、認定機関として運用開始する前に自社サイトを認定基準まで引き上げる必要があった。</p>
      </div>
    </div>

    <div class="case-step case-step-improvement">
      <div class="case-step-marker"><span class="case-step-num">2</span><span class="case-step-label">改善</span></div>
      <div class="case-step-body">
        <h3>7 commit + 住所完全公開 — 90 日相当の機械検証ベース改善</h3>
        <p>scanner.py の検出結果を逐次解消する形で、7 段階の commit と 1 個の重要決定 (住所完全公開) で改善した。各 commit は SPEC v3.4 / GOOGLE-STANDARDS v2.0 / GEO-STANDARDS v2.1 整合の機械検証可能な変更のみで構成される (人手判断は介在しない)。</p>
        <table class="case-timeline-table">
          <caption>tcharton.com 改善 timeline (commit verbatim)</caption>
          <thead>
            <tr><th scope="col">#</th><th scope="col">commit</th><th scope="col">主要対応</th><th scope="col">対応軸</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td><code>97323a6</code></td><td>HSTS preload 登録 + CSP 配信 + COOP/COEP/CORP 全配信</td><td>A + B</td></tr>
            <tr><td>2</td><td><code>a12f686</code></td><td>JSON-LD <code>@type</code> 配列化 + X-Hosting honest signaling + spec-checker バグ修正</td><td>C</td></tr>
            <tr><td>3</td><td><code>a4d34de</code></td><td><code>--live</code> モード追加 (旧 ② 虚偽 S-RANK 再発防止 machine gate)</td><td>(machine gate)</td></tr>
            <tr><td>4</td><td><code>a3113d1</code></td><td>GBP CID 取得 + sameAs に追加 (Google ビジネスプロフィール連携)</td><td>C + D</td></tr>
            <tr><td>5</td><td><code>06c3d1c</code> → <code>68b0f8b</code></td><td>Deep Work 導線 (Form 主 CTA + Phone 補助 / ビデオ会議撤回 → フォーム経由)</td><td>D</td></tr>
            <tr><td>6</td><td><code>f1a07a1</code> 初回スキャン</td><td><strong>B/87 取得</strong> (NAP 90 点 / 住所 △ で最大 90 未達)</td><td>(検証)</td></tr>
            <tr><td>7</td><td><strong><code>36d4328</code> 住所完全公開</strong></td><td><strong>NAP 100 点達成</strong> (沼津市大岡2690 streetAddress + postalCode 410-0022)</td><td>D</td></tr>
          </tbody>
        </table>
        <p>住所完全公開は ① HARTON 総合責任者 / ④ scanner ★ 最高技術責任者 / 代表 大内 達也の 3 者協議で「中立性 + dogfooding 倫理 + 認定機関の信頼根拠」の優先で決定された。プライバシーリスク vs E-E-A-T 信頼向上の trade-off を機械検証スコアという客観指標で論断した代表事例である。</p>
      </div>
    </div>

    <div class="case-step case-step-acquired">
      <div class="case-step-marker"><span class="case-step-num">3</span><span class="case-step-label">取得</span></div>
      <div class="case-step-body">
        <h3>🏆 S/90 (HARTON S-Class) 取得 — 自己実証体 第 1 号確定</h3>
        <p>commit <code>36d4328</code> で住所完全公開した直後の scanner.py 再判定で <strong>総合 90 点 / 必須条件 4/4 + 1 保留 / 致命的 NG 0 件 / NAP 100 点</strong> を達成し、<strong>★★★ HARTON S-Class</strong> 認定を取得した。</p>
        <p>取得詳細:</p>
        <ul>
          <li><strong>総合スコア</strong>: 90 点 (★★★ 認定基準 90 点をジャストで達成 / dogfooding 倫理上「自社の集客のため」ではないため過剰追求せず)</li>
          <li><strong>必須条件</strong>: 4/4 達成 + 1 保留 (CR-3 Cloudflare Turnstile は別実装途中)</li>
          <li><strong>致命的 NG</strong>: 0 件 (HTTPS / SSL / WP 管理面 / CMS バージョン 全件 clean)</li>
          <li><strong>NAP 完全一致</strong>: 100 点 (Schema.org PostalAddress + GBP + footer 三重整合)</li>
          <li><strong>取得 commit</strong>: <code>36d4328</code> (2026-04-27)</li>
        </ul>
        <p>これにより、tcharton.com は HARTON Certified の <strong>自己実証体 第 1 号 (the first dogfooding subject)</strong> として確定した。</p>
      </div>
    </div>
  </section>

  <section aria-label="dogfooding 倫理の証明">
    <h2>dogfooding 倫理の証明 — なぜ自己実証体が必要か</h2>
    <p>世界中のどの認定機関とも異なり、HARTON Certified の評価ロジックは <strong>scanner.py</strong> という独自開発の機械検証エンジンで、4 軸並列独立評価 + 必須 5 条件 + 致命的 NG 4 項目で構成される。この基準を、まず自社サイト tcharton.com で実証し、★★★ を取得した。</p>
    <ul>
      <li><strong>L1 自己適用</strong>: 自社サイト tcharton.com が認定基準で評価される (scanner.py 月次再判定対象)</li>
      <li><strong>L2 自己拘束</strong>: 評価結果は自己例外なし (致命的 NG / 降格条件は他事業者と同条件)</li>
      <li><strong>L3 自己公開</strong>: 機械検証ログを全件 verbatim 公開する (本ページがその物理証拠)</li>
    </ul>
    <p>この原則 (本ページ冒頭に blockquote 引用) が、本ページで verbatim 公開する 7 commit timeline の核にある。スコア向上のため自社の住所を完全公開する判断も、評価機関としての中立性を維持するための dogfooding 倫理から導かれた。</p>
  </section>

  <section aria-label="未来事業者への道筋">
    <h2>未来事業者へ — あなたのサイトが ★ を取得するための具体経路</h2>
    <p>tcharton.com の経緯は特殊事例ではない。同じ機械検証基準と同じ 5 Step (90 日) で、全国の事業者が ★ HARTON Certified ↦ ★★ HARTON 優良 ↦ ★★★ HARTON S-Class まで到達可能である。</p>
    <ol>
      <li><strong>Step 1 (HTTPS 常時 SSL 化 + HSTS preload)</strong>: tcharton.com では commit #1 で対応 → A 軸 +15 点</li>
      <li><strong>Step 2 (JSON-LD Schema.org + GBP)</strong>: commit #2-#4 で対応 → C 軸 +12 点</li>
      <li><strong>Step 3 (CSP + Trusted Types)</strong>: commit #1 で対応 → B 軸 +10 点 / 致命的 NG 解消</li>
      <li><strong>Step 4 (GEO/LLMO 最適化)</strong>: <code>llms.txt</code> + FAQPage + 公的リンク 5+ → C 軸 +10 点</li>
      <li><strong>Step 5 (Core Web Vitals + WCAG 2.2 AA)</strong>: SSG + 画像最適化 → A 軸 +8 点 / D 軸 +10 点</li>
    </ol>
    <p>各 Step の具体的 config 値・header 文字列・ファイルパスは <a href="/improvement-guide/">改善ガイダンス</a>で公開する。自社サイトの ★ 取得を目指す事業者は <a href="/apply/">掲載申請 (無料)</a>から開始可能である。</p>
  </section>

  <section aria-label="関連ページ">
    <h2>関連ページ</h2>
    <ul>
      <li><a href="/about/">サイトについて — dogfooding 倫理の詳細</a></li>
      <li><a href="/methodology/">評価方法 — 4 軸機械検証 + 2,554 項目</a></li>
      <li><a href="/improvement-guide/">改善ガイダンス — 5 Step (90 日) HowTo</a></li>
      <li><a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 — Phase 0.5 全体実測</a></li>
    </ul>
  </section>
</article>`,
  additionalJsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': ['Article', 'Report'],
      '@id': `${DOMAIN}/case-studies/tcharton-com/#article`,
      headline: 'tcharton.com — 沼津起点の自己実証体 第 1 号 (★★★ HARTON S-Class)',
      description: '運営主体 T.C.HARTON の自社サイト tcharton.com が dogfooding 倫理に基づき、scanner.py 機械検証で旧 C/65 → 🏆 S/90 (HARTON S-Class) を 7 commit + 住所完全公開で取得した自己実証体 第 1 号の詳細記録。',
      datePublished: '2026-04-27',
      dateModified: '2026-05-03',
      inLanguage: 'ja',
      isAccessibleForFree: true,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      author: { '@type': 'Organization', '@id': `${DOMAIN}/#org` },
      publisher: { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'T.C.HARTON', url: 'https://tcharton.com/' },
      mainEntityOfPage: `${DOMAIN}/case-studies/tcharton-com/`,
      about: { '@type': 'Organization', name: 'tcharton.com', url: 'https://tcharton.com/', sameAs: 'https://www.google.com/maps/place/?cid=16606425942373165010' },
      mentions: [
        { '@type': 'Organization', '@id': `${DOMAIN}/#org`, name: 'HARTON Certified' },
        { '@type': 'AdministrativeArea', name: '沼津市', sameAs: 'https://www.wikidata.org/wiki/Q241037' },
      ],
      keywords: ['dogfooding', '自己実証体', '★★★ HARTON S-Class', '機械検証', 'scanner.py', 'NAP 完全一致', 'HSTS preload', 'CSP', 'JSON-LD', 'GBP'],
      citation: 'HARTON Certified (2026). tcharton.com — 沼津起点の自己実証体 第 1 号. https://certification.tcharton.com/case-studies/tcharton-com/',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${DOMAIN}/case-studies/tcharton-com/#howto-acquired`,
      name: 'tcharton.com が ★★★ HARTON S-Class を取得した 5 Step (90 日)',
      description: '機械検証で WEB 品質 ★★★ を取得するための、tcharton.com 自身が辿った 5 Step の具体的実装手順。各 step は scanner.py で機械検証可能な技術項目で構成される。',
      totalTime: 'PT90D',
      inLanguage: 'ja',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'HTTPS 常時 SSL 化 + HSTS preload + CSP/Trusted Types (commit 97323a6)', text: 'A 軸 +15 点 + B 軸 +10 点。tcharton.com では同 commit 97323a6 で A 軸 (HSTS preload max-age=31536000 + includeSubDomains + preload を hstspreload.org 登録) と B 軸 (Content-Security-Policy: default-src self; script-src self; require-trusted-types-for script + COOP/COEP/CORP) を一括対応。致命的 NG「HTTPS 非対応」「SSL 証明書」「WP 管理面露出」「CMS バージョン情報露出」を全件解消。' },
        { '@type': 'HowToStep', position: 2, name: 'JSON-LD @type 配列化 + GBP CID 連携 (commit a12f686 + a3113d1)', text: 'C 軸 +12 点。Organization の @type を ["Organization", "ProfessionalService", "LocalBusiness"] 配列化 + sameAs に Google Maps CID URL 追加 + additionalType に Wikidata 概念 URI 追加。' },
        { '@type': 'HowToStep', position: 3, name: '(統合) Step 1 で CSP + Trusted Types を一括対応済', text: 'tcharton.com では Step 1 と同じ commit 97323a6 で A 軸 + B 軸を一括対応。一般的には独立 step として実装可能 (HSTS preload と CSP は技術的に異なるレイヤー)。本 case study では同 commit で纏められたため Step 1 に統合表示。Step 2-5 で C/D 軸 + Core Web Vitals 段階的積み上げ。' },
        { '@type': 'HowToStep', position: 4, name: 'GEO/LLMO 最適化 (llms.txt + FAQPage + 公的リンク)', text: 'C 軸 +10 点。/llms.txt 配置 + FAQPage JSON-LD (5+ Q&A) + IPA / 政府機関 / Wikidata / Schema.org / W3C への公的リンク 5+ 件。AI クローラー引用率向上。' },
        { '@type': 'HowToStep', position: 5, name: 'Core Web Vitals + WCAG 2.2 AA + NAP 完全公開 (commit 36d4328)', text: 'A 軸 +8 点 + D 軸 +10 点 + NAP 100 点。LCP < 2.5s / CLS < 0.1 / INP < 200ms 達成 + Cloudflare Workers Static Assets で配信 + streetAddress 完全公開で NAP 100 点達成。最終的に総合 90 点 ★★★ HARTON S-Class 取得。' },
      ],
    },
  ],
});

// ─── 17. 404（minimal / reading）────────────────────
PAGES.push({
  path: '404.html',
  variant: 'reading',
  navActive: '',
  title: 'ページが見つかりません（404）— HARTON Certified',
  description: 'お探しのページが見つかりません。トップページから目的のコンテンツへお進みください。',
  canonicalPath: '/404.html',
  robots: 'noindex, nofollow',
  mainContent: `
<article>
  <h1>ページが見つかりません（404）</h1>
  <section aria-label="404">
    <p>お探しのページは見つからない。URL の打ち間違い、または当該ページが移動・削除された可能性がある。</p>
    <ul>
      <li><a href="/">トップページへ戻る</a></li>
      <li><a href="/methodology/">評価方法</a></li>
      <li><a href="/apply/">掲載申請</a></li>
      <li><a href="/contact/">お問合せ</a></li>
    </ul>
  </section>
</article>`,
});

// thanks.html は standalone（独立 HTML / build-base.js 管理外）として `certification/thanks.html` に配置。
// tcharton.com/thanks.html を参照し、ヒーロー 2 col + アニメ check + 10 秒カウントダウン等の特殊レイアウトを実装。
// build-base.js の通常 article 型レイアウトに合わないため意図的に分離（再ビルドで上書きしないよう PAGES から除外）。

// ═══════════════════ 実行 ═══════════════════
let written = 0;
for (const p of PAGES) {
  const html = applyLayout(p);
  writeFile(p.path, html);
  written++;
}
console.log('  ' + '='.repeat(64));
console.log(`  HARTON Certified 基盤 17 ページ生成完了`);
console.log('  ' + '='.repeat(64));
console.log(`  生成ファイル: ${written} 件`);
console.log(`  次工程: npx tailwindcss -i src/input.css -o dist/output.css`);
console.log(`  検証   : node spec-checker.js`);
console.log('  ' + '='.repeat(64));
