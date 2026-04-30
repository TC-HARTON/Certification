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

// Phase 0 沼津パイロット結果集計 (④ scanner 出力 / ⑤ で業界レポート 2026 春に展開)
// INSTRUCTION-FROM-ROOT.md v1.12.2 §(A) 連動
const numazuSummary = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'phase-0-numazu-summary.json'), 'utf-8'));

/** 現在の運用 Phase (MASTER-PLAN §0.5 ロードマップ準拠 / Phase 0 = 沼津パイロット稼働中)
 *  data/regions.json 内の `phase` ≤ CURRENT_PHASE のみ enable、それ以外は disabled + (準備中) 表示 */
const CURRENT_PHASE = 0;

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
  title: 'HARTON Certified — 機械検証で Sクラス WEB の普及を支える独立認定機関',
  description: 'HARTON Certified は WEB 品質を機械検証で公正評価する独立認定機関。SPEC v3.4 の 2,554 項目 + 4 軸スキャナーで全国の優良サイトを認定し、Sクラス WEB の普及を支える。完全中立・金銭非依存、★ 以上のみ掲載のポジティブセレクション。',
  canonicalPath: '/',
  ogType: 'website',
  breadcrumbs: bcl([['HARTON Certified トップ', '/']]),
  additionalJsonLd: [FAQ_TOP],
  mainContent: `
<article>
  <section aria-label="マニフェスト" class="hero-manifest">
    <p class="hero-eyebrow">HARTON Certified — 自己実証型認定機関 / dogfooding 倫理</p>
    <h1 class="hero-h1">「自分が <span class="hero-stars" role="img" aria-label="3 つ星 / S-Class"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span> を取れない基準で、他者を測らない。」</h1>
    <p class="hero-manifest-text">「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」</p>
    <div class="hero-cta-row">
      <a href="/methodology/" class="hero-cta-primary">評価方法を見る</a>
      <a href="/apply/" class="hero-cta-secondary">掲載申請（無料）</a>
    </div>
  </section>
  <section aria-label="冒頭エビデンス（Lead Evidence Block）">
    <p>HARTON Certified は、<strong>2,554 項目</strong>の機械検証で WEB 品質を公正に測る独立認定機関である。全国の事業者の Sクラス WEB 普及を支えるため、4 軸の客観評価を 2026 年に開始した。沼津起点での自己実証（自社サイト ★★★ 取得）を基盤とし、地方都市から再定義する WEB 品質の民主化を推進する。出典: <a href="https://www.digital.go.jp/" rel="nofollow noopener noreferrer" target="_blank">日本政府・公的機関</a>（HSTS / WCAG / Core Web Vitals 等の公的基準に準拠）。</p>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026 年 4 月 27 日 公開</time> ／ <time datetime="2026-04-30" itemprop="dateModified">2026-04-30 v1.1.7 ブランド戦略整合改訂</time></p>
    <p>機械検証による公正評価を通じて、地域から全国へ、Sクラス WEB サイトの普及を支える。Phase 0（沼津市 ${numazuSummary.n_total} 件機械検証実測 / 8 業種 / 2026-04-30）から始まり、Phase 4（2027 年）で全 47 都道府県 10,000 件以上の認定を目標とする。</p>
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
    <h2>Phase 0 機械検証実測の公開</h2>
    <p class="featured-rail-lede">HARTON Certified は機械検証 4 軸（基礎・防御・AI 検索・経営インパクト）で WEB 品質を客観評価する独立認定機関。Phase 0 沼津市 <strong>${numazuSummary.n_total}</strong> 件機械検証で <strong>★ 獲得率 0.0%</strong>（${numazuSummary.eligible_total}/${numazuSummary.n_total}）/ 業界最高点 <strong>${numazuSummary.score_stats.max}</strong> 点 / 致命的 NG <strong>${numazuSummary.ng_pct.toFixed(1)}%</strong>。Phase 1 で全国順次拡大予定。</p>
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
          <a href="/about/" class="featured-card-link">自己実証体としての信頼根拠 →</a>
        </div>
      </li>
      <li class="featured-card">
        <div class="featured-card-thumb">
          <span class="featured-card-rating" role="img" aria-label="Phase 0 沼津 83 件機械検証実測 / ★ 認定 0 件"><svg class="star-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="opacity:0.4"><path d="M12 2L14.6 8.6L21.6 9.3L16.3 14L17.8 21L12 17.5L6.2 21L7.7 14L2.4 9.3L9.4 8.6L12 2Z" fill="currentColor"/></svg></span>
          <span class="featured-card-thumb-label" aria-hidden="true">Phase 0 完了</span>
        </div>
        <div class="featured-card-body">
          <h3 class="featured-card-name">沼津 ${numazuSummary.n_total} 件機械検証実測 (8 業種)</h3>
          <p class="featured-card-meta">2026-04-30 スキャン完了 ／ 8 業種（税理士・弁護士・不動産・飲食店・美容院・歯科医院・病院・ホテル）</p>
          <p class="featured-card-note"><strong>★ 認定 0 件</strong> ／ 致命的 NG <strong>${numazuSummary.ng_pct.toFixed(1)}%</strong>（${numazuSummary.ng_total_companies}件）／ 業界中央値 <strong>${numazuSummary.score_stats.median}</strong> 点 ／ 業界 max <strong>${numazuSummary.score_stats.max}</strong> 点。実態は隠さず堂々と公開する透明性の証明。</p>
          <a href="/news/numazu-industry-report-2026-spring/" class="featured-card-link">業界レポート 2026 春を見る →</a>
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
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は <strong>2026 年 4 月</strong>、静岡県沼津市で T.C.HARTON が立ち上げた独立認定機関である。沼津起点で自社サイト tcharton.com を機械検証し ★★★（HARTON S-Class）を取得した自己実証体 第 1 号として、業界の WEB 品質改善のため独立中立に運営する。出典: <a href="https://www.digital.go.jp/" rel="nofollow noopener noreferrer" target="_blank">デジタル庁（地方 DX の現状）</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「自分が達成できない基準で他者を測ることはしない」 — HARTON Certified 信頼根拠の核（MASTER-PLAN §2.0.4）
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time> ／ <time datetime="2026-04-30" itemprop="dateModified">2026-04-30 v1.1.7 ブランド戦略整合改訂</time></p>
    <h1>サイトについて</h1>
  </section>
  <section aria-label="マニフェスト">
    <h2>マニフェスト</h2>
    <p><strong>「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」</strong></p>
    <p>人間の主観や金銭、規模に依存しない。4 軸（基礎・防御・AI 検索・経営）の機械検証で、誰もが再現可能な手順で到達できる頂点。それは「努力の結果」ではなく、「思想の到達点」である。ここに名を連ねる事業者は、AI 時代の信頼を定義する灯台となる（MASTER-PLAN §2.0 マニフェスト 50 字 + 副文 200 字）。</p>
  </section>
  <section aria-label="私たちの信頼根拠">
    <h2>私たちの信頼根拠（自己実証体・dogfooding 倫理）</h2>
    <p>HARTON Certified は、世界中のどの認定機関とも異なる。評価ロジックは <strong>scanner.py</strong> という独自開発の機械検証エンジンで、<strong>4 軸並列独立評価 + 必須 5 条件 + 致命的 NG 4 項目</strong> で構成される。この基準を、まず<strong>自社サイト tcharton.com で実証し、★★★ を取得した</strong>。</p>
    <p><strong>「自分が達成できない基準で他者を測ることはしない」</strong>――それが、HARTON Certified の唯一無二の信頼根拠である（MASTER-PLAN §2.0.4 信頼根拠の核 300 字 verbatim）。</p>
    <p>本機関は dogfooding 倫理（自社製品＝評価基準を自社で適用する倫理規範）を 3 階層で運用する:</p>
    <ul>
      <li><strong>L1 自己適用</strong>: 自社サイト tcharton.com が認定基準で評価される（scanner.py で月次再判定）</li>
      <li><strong>L2 自己拘束</strong>: 評価結果は<strong>自己例外なし</strong>で適用される（致命的 NG / 降格条件は事業者と同条件 / tcharton.com 自身の致命的 NG 検出時は即時非掲載状態に切替）</li>
      <li><strong>L3 自己公開</strong>: 機械検証ログを全件 verbatim 公開する（評価の透明性 / 第三者検証可能性）</li>
    </ul>
    <p>これにより認定機関は「自社の基準を都合よく緩める」インセンティブを構造的に排除する（MASTER-PLAN §3.0.5 自己実証型認定の倫理規範）。</p>
  </section>
  <section aria-label="沼津起点の戦略的必然性">
    <h2>沼津起点と地方都市から再定義する WEB 品質の民主化</h2>
    <p>沼津は人口約 19 万人の静岡県東部の地方都市である。東京・大阪の制作会社が東京で ★★★ を取得しても「<strong>金と人手があれば当然</strong>」と見られる。沼津という地方都市で、tcharton.com が ★★★ を取得した事実こそ、AI 時代における <strong>「機械評価は資本に依存しない」</strong> ことの実証となる。</p>
    <p>本機関は東京中心の権威構造ではなく、<strong>地方都市から再定義</strong>する WEB 品質基準を運用する。沼津起点の実証を、Phase 1 で類似地方都市（倉敷・四日市・松本・盛岡 等）へ展開し、全国の地方事業者にとっての <strong>「届きうる頂点」</strong> という民主化メッセージを実装する（MASTER-PLAN §2.8 沼津起点の戦略的必然性）。</p>
    <p>関連: <a href="/news/numazu-industry-report-2026-spring/">沼津市 WEB 品質業界レポート 2026 春</a>（沼津市 ★ 獲得率 0/83 = 0.0% / 業種別 ★ 獲得率 + 業界最高点 一覧）</p>
  </section>
  <section aria-label="運営体制">
    <h2>運営体制</h2>
    <p>HARTON Certified は T.C.HARTON が 2026 年 4 月に立ち上げた独立認定機関である。Phase 1（類似地方都市 200 件）以降は弁護士・プロデザイナー・PR 会社との外部提携を予定する。商標登録は Phase 1 完了時に着手する。</p>
    <p>運営拠点: 〒410-0022 静岡県沼津市大岡2690 / Cloudflare Workers Static Assets で配信 / scanner.py で自動月次再評価。</p>
    <p>運営方針: 「業界の WEB 品質改善のため」が動機であり、「自社の集客のため」ではない（中立性表現原則）。</p>
  </section>
  <section aria-label="関連リンク">
    <h2>関連リンク</h2>
    <ul>
      <li><a href="/methodology/">評価方法（4 軸の全公開 + S クラス哲学的定義 + dogfooding 倫理）</a></li>
      <li><a href="/news/numazu-industry-report-2026-spring/">沼津市 WEB 品質業界レポート 2026 春（業界実測の透明公開）</a></li>
      <li><a href="/apply/">掲載申請（未掲載事業者向け / 中立性整合）</a></li>
      <li><a href="/improvement-guide/">改善ガイダンス（★ 区分昇格の実践手順）</a></li>
    </ul>
  </section>
</article>`,
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
      「自分が達成できない基準で他者を測ることはしない」 — HARTON Certified 信頼根拠の核（MASTER-PLAN §2.0.4）
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
    <p>本機関の中核原則は「<strong>自分が達成できない基準で他者を測ることはしない</strong>」である。tcharton.com（自社サイト）が自社の評価基準で <strong>★★★（HARTON S-Class）</strong>を取得した自己実証体 第 1 号として、業界の品質改善のため独立中立に運営する。</p>
    <ul>
      <li><strong>L1 自己適用</strong>: 自社サイト tcharton.com が認定基準で評価される（scanner.py 月次再判定）</li>
      <li><strong>L2 自己拘束</strong>: 評価結果は自己例外なし（致命的 NG / 降格条件は事業者と同条件）</li>
      <li><strong>L3 自己公開</strong>: 機械検証ログを全件 verbatim 公開する（評価の透明性 / 第三者検証可能性）</li>
    </ul>
    <p>沼津起点での自己実証は、地方都市から再定義する WEB 品質の民主化の旗印として機能する。詳細は <a href="/about/">サイトについて</a> + <a href="/news/numazu-industry-report-2026-spring/">沼津市 WEB 品質業界レポート 2026 春</a>。</p>
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
    <h2>評価サイクル</h2>
    <ul>
      <li>月次: 全掲載事業者を再スキャン、★区分変動を反映</li>
      <li>四半期: ★区分変動の傾向分析、改善ガイダンス更新</li>
      <li>年次: 4 軸・S 条件の見直し、SPEC v3.x との整合確認</li>
      <li>即時: 重大脆弱性発見時は 24 時間以内に掲載一時停止判断</li>
    </ul>
  </section>
</article>`,
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
    <p>HARTON Certified への掲載申請は <strong>無料</strong>である。掲載対象は ★ 以上（総合 <strong>70</strong> 点以上 + 致命的 NG <strong>0</strong> 件）を達成した事業者のみで、課金で順位を買えるサービスではない。本機関は dogfooding 倫理（自分が達成できない基準で他者を測らない）に基づき、業界の品質改善のため独立中立に運営する。出典: <a href="https://www.ppc.go.jp/" rel="nofollow noopener noreferrer" target="_blank">個人情報保護委員会</a>（評価機関の中立性に関する公的指針）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「自分が達成できない基準で他者を測らない」 — HARTON Certified 信頼根拠の核（MASTER-PLAN §2.0.4）
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
      <li><a href="/news/numazu-industry-report-2026-spring/">沼津市 WEB 品質業界レポート 2026 春（地方都市から再定義の実例）</a></li>
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
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified の ★ 区分は scanner.py の機械検証で <strong>45</strong>+ 項目を計測し、総合 <strong>70</strong>/<strong>80</strong>/<strong>90</strong> 点の 3 段階で付与する。改善ヒントはすべて公的基準に整合する。出典: <a href="https://developers.google.com/search/docs" rel="nofollow noopener noreferrer" target="_blank">Google Search Central</a> / <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「評価項目は全公開、再現性のある機械検証である」 — HARTON Certified
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>改善ガイダンス</h1>
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
    <p>HARTON Certified は <strong>2026 年 4 月</strong>に立ち上がった独立認定機関で、Phase 0 沼津 <strong>30</strong> 件を 2026 年 5 月までに完了する。月次ランキング・ロゴ・代表写真をプレス向けに無償提供する。出典: <a href="https://www.digital.go.jp/" rel="nofollow noopener noreferrer" target="_blank">日本政府公的機関</a>（中小事業者の DX 状況）。</p>
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
    <p>HARTON Certified からのお知らせを時系列で公開する。<strong>2026 年 4 月 27 日</strong>に MASTER-PLAN v<strong>1.1.4</strong> 改訂と SPEC v<strong>3.4</strong> 連動を完了した。出典: <a href="https://www.digital.go.jp/" rel="nofollow noopener noreferrer" target="_blank">公的機関基準</a>。</p>
    <blockquote cite="${DOMAIN}/about/">
      「年次で基準を改訂、過去評価もアーカイブとして残す」 — HARTON Certified 進化原則
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>お知らせ</h1>
  </section>
  <section aria-label="お知らせ一覧">
    <h2>2026 年</h2>
    <ul>
      <li><time datetime="2026-04-30">2026-04-30</time>: <a href="/news/numazu-industry-report-2026-spring/">沼津市 WEB 品質業界レポート 2026 春</a> 公開（8 業種 ${numazuSummary.n_total} 件機械検証 / ★ 認定 ${numazuSummary.eligible_total} 件 / 致命的 NG ${numazuSummary.ng_pct.toFixed(1)}%）</li>
      <li><time datetime="2026-04-27">2026-04-27</time>: MASTER-PLAN v1.1.4 改訂（SPEC v3.4 連動完了）</li>
      <li><time datetime="2026-04-26">2026-04-26</time>: HARTON Certified 創設発表 / Phase 0 沼津 30 件パイロット開始</li>
    </ul>
  </section>
</article>`,
});

// ─── 13b. 沼津業界レポート 2026 春（subpage / reading / INSTRUCTION v1.12.2 §(A) 連動）
PAGES.push({
  path: 'news/numazu-industry-report-2026-spring/index.html',
  variant: 'reading',
  navActive: '',
  title: '沼津市 WEB 品質業界レポート 2026 春 — HARTON Certified',
  description: `沼津市 8 業種 ${numazuSummary.n_total} 件機械検証実測。★ 獲得率 ${numazuSummary.eligible_total}/${numazuSummary.n_total}=0.0%。業界最高点（税理士40・弁護士49・不動産54・飲食45・美容44・歯科47・病院41・ホテル37）／NG ${numazuSummary.ng_pct.toFixed(1)}%。`,
  canonicalPath: '/news/numazu-industry-report-2026-spring/',
  ogType: 'article',
  breadcrumbs: bcl([['トップ', '/'], ['お知らせ', '/news/'], ['業界レポート 2026 春', '/news/numazu-industry-report-2026-spring/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p><strong>2026 年 4 月 30 日</strong>、沼津市 8 業種（税理士・弁護士・不動産仲介・飲食店・美容院・歯科医院・病院・ホテル）<strong>${numazuSummary.n_total}</strong> 件の公開 WEB サイトを 4 軸機械検証した。業界中央値は <strong>${numazuSummary.score_stats.median}</strong> 点（業界 max <strong>${numazuSummary.score_stats.max}</strong> 点）であり、★ 以上認定可能なサイトは <strong>${numazuSummary.eligible_total}</strong> 件、致命的 NG 発生率は <strong>${numazuSummary.ng_pct.toFixed(1)}%</strong> であった。出典: <a href="https://web.dev/articles/vitals" rel="nofollow noopener noreferrer" target="_blank">Google Web Vitals 公式</a> / <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="nofollow noopener noreferrer" target="_blank">W3C WCAG 2.2</a> / <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA 安全なウェブサイトの作り方</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「公正に測るとは、評価方法のすべてを公開することだ」 — HARTON Certified 評価原則
    </blockquote>
    <p><time datetime="2026-04-30" itemprop="datePublished">2026-04-30 スキャン実施・公開</time> ／ <time datetime="2026-05-30" itemprop="dateModified">次回更新予定: 2026-05-30</time></p>
    <h1>沼津市 WEB 品質業界レポート 2026 春</h1>
  </section>

  <section aria-label="沼津市 ★ 獲得率（統合）" class="quality-gap-section zero-cert-statement">
    <h2>沼津市 ★ 獲得率</h2>
    <div class="report-stat-display">
      <p class="report-stat-headline"><span class="report-stat-number">0.0</span><span class="report-stat-unit">%</span></p>
      <p class="report-stat-caption"><strong>沼津市 ${numazuSummary.n_total} 件中、★ 認定達成 ${numazuSummary.eligible_total} 件 / 獲得率 0.0%</strong>（2026-04-30 時点）</p>
      <p class="report-stat-note">機械検証 4 軸（A 基礎・B 防御・C AI 検索・D 経営インパクト）+ 致命的 NG 0 件 + 総合 70 点以上を全達成した事業者の割合。本レポートは業界の WEB 品質改善のために実測を公開するものであり、自社の集客を目的とするものではない。「準備中」「Coming soon」等の婉曲表現は採用しない。</p>
    </div>
  </section>

  <section aria-label="業種別 ★ 獲得率" class="industry-section">
    <h2>業種別 ★ 獲得率 + 業界最高点</h2>
    <table>
      <caption>沼津市 8 業種 ${numazuSummary.n_total} 件 業種別 ★ 獲得率と業界最高点</caption>
      <thead>
        <tr><th scope="col">業種</th><th scope="col">対象 n</th><th scope="col">★ 獲得</th><th scope="col">獲得率</th><th scope="col">業界最高点</th></tr>
      </thead>
      <tbody>
        ${(() => {
          const indKeyMap = {};
          for (const [k, v] of Object.entries(industriesData)) {
            indKeyMap[v.label_short] = k;
            indKeyMap[v.label] = k;
          }
          return numazuSummary.industries.map(s => {
            const indKey = indKeyMap[s.industry] || '';
            const indLabel = indKey && industriesData[indKey] ? industriesData[indKey].label : s.industry;
            const rate = ((s.eligible / s.n) * 100).toFixed(1);
            const linkOpen = indKey ? `<a href="/regions/shizuoka/numazu/industries/${indKey}/">` : '';
            const linkClose = indKey ? '</a>' : '';
            return `<tr><th scope="row">${linkOpen}${indLabel}${linkClose}</th><td>${s.n} 件</td><td>${s.eligible} 件</td><td>${rate}%</td><td>${s.max} 点</td></tr>`;
          }).join('\n        ');
        })()}
      </tbody>
    </table>
  </section>

  <section aria-label="致命的 NG 内訳" class="ng-table-section">
    <h2>致命的 NG 内訳（業界横断 / ${numazuSummary.ng_total_companies} 件 ／ ${numazuSummary.ng_pct.toFixed(1)}%）</h2>
    <table>
      <caption>沼津市 ${numazuSummary.n_total} 件中の致命的 NG 検出件数（複数 NG 重複事業者あり）</caption>
      <thead>
        <tr><th scope="col">致命的 NG 種類</th><th scope="col">件数</th><th scope="col">説明</th></tr>
      </thead>
      <tbody>
        ${[
          ['HTTPS非対応', numazuSummary.ng_breakdown['HTTPS非対応'] ?? 0, 'HTTPS で配信されておらず、現代ブラウザでは安全でない接続として表示される。検索評価上も不利となる'],
          ['SSL証明書', numazuSummary.ng_breakdown['SSL証明書'] ?? 0, 'SSL/TLS 証明書が期限切れ・無効・自己署名のため、ブラウザによる警告表示が発生する'],
          ['WP管理面露出', numazuSummary.ng_breakdown['WP管理面露出'] ?? 0, 'WordPress 管理画面（wp-login.php / xmlrpc.php 等）が公開状態にあり、認証ボット試行の対象となりうる'],
          ['readme.html露出', numazuSummary.ng_breakdown['readme.html露出'] ?? 0, 'WordPress 同梱の readme.html が公開状態にあり、稼働バージョンが第三者から特定可能となる'],
          ['xmlrpc.php有効', numazuSummary.ng_breakdown['xmlrpc.php有効'] ?? 0, 'XML-RPC エンドポイントが有効化されており、リフレクション攻撃に利用される可能性がある'],
          ['CMSバージョン情報露出', numazuSummary.ng_breakdown['CMSバージョン情報露出'] ?? 0, '&lt;meta name=&quot;generator&quot;&gt; 等で CMS のバージョン情報が露出しており、既知脆弱性の特定が容易な状態にある'],
        ].map(([name, count, desc]) => `<tr><th scope="row">${name}</th><td>${count} 件</td><td>${desc}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </section>

  <section aria-label="dogfooding 倫理開示">
    <h2>dogfooding 倫理：自己実証体としての透明性</h2>
    <blockquote cite="${DOMAIN}/about/">
      「自分が ★★★ を取れない基準で、他者を測らない。」 — HARTON Certified 信頼根拠の核
    </blockquote>
    <p>本機関の自己実証体 第 1 号は scanner.py により ★★★（HARTON S-Class）を取得し、月次再判定の対象となる（自己例外なし）。自己実証体 自身に致命的 NG 検出時は即時非掲載状態に切替え、機械検証ログを verbatim 公開する。沼津市 ${numazuSummary.n_total} 件の業界実測で 70 点以上を達成したサイトはゼロ件である。これは認定基準が「人間の主観や金銭、規模に依存しない」客観的な技術指標であることを業界実測で示している。</p>
  </section>

  <section aria-label="評価方法導線">
    <h2>評価方法と現状診断</h2>
    <ul>
      <li><a href="/methodology/">評価方法（4 軸機械検証 全公開）</a> — A 基礎 / B 防御 / C AI 検索 / D 経営の 4 軸独立評価とその閾値</li>
      <li><a href="/methodology/security/">B 軸 防御力・生存率</a> — 致命的 NG 4 項目の詳細と検出根拠</li>
      <li><a href="/improvement-guide/">改善ガイダンス</a> — ★区分昇格のための具体 Step（既掲載事業者向け）</li>
      <li><a href="/apply/">掲載申請</a> — 自社サイトの認定獲得を目指す事業者向け</li>
    </ul>
    <p><strong>現状診断レポート</strong>（自社サイトの 4 軸スコア + 致命的 NG 警告 + ★ 取得までの改善 Step）は CR-3 Cloudflare Turnstile 実装後に <a href="/contact/">お問合せ</a>経由で受付開始予定。</p>
  </section>

  <section aria-label="改善された場合の対応">
    <h2>改善された場合の対応 / 月次更新方針</h2>
    <p>本レポートは月次（毎月最終週）に scanner.py で全件再判定する。改善により ★ 認定可能となった事業者は、月次再判定で自動的に <a href="/regions/shizuoka/numazu/">沼津市の認定店舗ページ</a>に掲載され、業界レポートにも昇格通知が記載される。月次再判定の運用は本機関の失効・降格運用（MASTER-PLAN §12）と完全整合する（事業者通知 + 14 日改善猶予 + 致命的 NG 即時切替）。</p>
    <ul>
      <li><strong>スキャン実施日</strong>: 2026-04-30</li>
      <li><strong>次回再判定予定</strong>: 2026-05-30（月次運用 / scanner.py 自動再判定）</li>
      <li><strong>レポート更新</strong>: 月次再判定後、本ページの数値を更新する</li>
      <li><strong>新規認定通知</strong>: 改善により ★ 認定可能となった事業者は本ページ「新規認定（改善後）」枠に追記し、認定店舗ページに掲載する</li>
    </ul>
  </section>
</article>`,
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
    <p>本サイトの完全な利用規約は弁護士確認を経て Phase 0 完了時に確定する。それまでは以下の暫定方針が適用される。</p>
    <ul>
      <li>本サイトの全コンテンツは T.C.HARTON に著作権が帰属する。</li>
      <li>引用は出典明記（${DOMAIN}/methodology/）を条件として許可する。</li>
      <li>掲載対象事業者の情報は公開情報のみを収集し、第三者提供は行わない（詳細は <a href="/privacy/">プライバシーポリシー</a>）。</li>
      <li>掲載拒否権は <a href="/opt-out/">/opt-out/</a> より随時行使できる。</li>
      <li>本サイトの月次再評価で ★ 区分が変動した場合、該当事業者へメール通知後に反映する。</li>
    </ul>
    <p>出典基準: <a href="https://www.no-trouble.caa.go.jp/" rel="nofollow noopener noreferrer" target="_blank">消費者庁「特定商取引法ガイド」</a>。</p>
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
  <section aria-label="基本方針">
    <h2>基本方針</h2>
    <ul>
      <li>収集対象: 法人情報・公開連絡先のみ。個人事業主は屋号レベルのみ。</li>
      <li>保管: HARTON ローカルのみ。第三者提供なし。</li>
      <li>準拠法: 個人情報保護法 2022 改正対応 / GDPR 対応。</li>
      <li>削除請求: <a href="/contact/">/contact/</a> よりいつでも対応。</li>
    </ul>
  </section>
  <section aria-label="お問合せ">
    <h2>お問合せ・削除請求</h2>
    <p>個人情報の開示・訂正・削除等の請求は <a href="/contact/">/contact/</a> より受付する。本人確認後、合理的な期間内に対応する。</p>
  </section>
</article>`,
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
