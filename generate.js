#!/usr/bin/env node
/**
 * HARTON Certified サイト生成エンジン v0.1（最小実装）
 * ─────────────────────────────────────────
 * 生成対象:
 *   1. data/businesses.json → businesses/<slug>/index.html + businesses/<slug>/badge/index.html
 *   2. data/industries.json + businesses → industries/<industry>/index.html
 *   3. data/regions.json + businesses → regions/<pref>/<city>/index.html
 *      + regions/<pref>/<city>/industries/<industry>/index.html
 *   4. 月次集計 → rankings/<year>/<month>/index.html
 *   5. ルート必須ファイル: sitemap.xml / robots.txt / llms.txt
 *
 * 準拠:
 *   SPEC v3.4 §1.0 / §4.2 #1.0-#1.3 / §8.1-§8.9
 *   MASTER-PLAN v1.1.4 §3.6 / §4 / §9.2
 *   INSTRUCTION-FROM-ROOT.md #5
 *
 * 使い方:
 *   node generate.js                    # 全件生成（dry-run なし）
 *   node generate.js --check            # ファイル数のみ報告（書込みなし）
 *   node generate.js --businesses-only  # business ページのみ
 *
 * 注意:
 *   - business.html / industry.html / region.html / ranking-month.html / badge.html
 *     の各テンプレートは未配備（Step 5 拡張時）。雛形未存在ならスキップする
 *   - opt_out: true の事業者は全生成対象から除外
 *   - critical_ng > 0 または rating が ★ 未満 (★無し) の事業者は除外
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DOMAIN = 'https://certification.tcharton.com';

// ═══════════════════ 引数 ═══════════════════
const args = process.argv.slice(2);
const opts = {
  check: args.includes('--check'),
  businessesOnly: args.includes('--businesses-only'),
};

// ═══════════════════ ユーティリティ ═══════════════════
function readJSON(rel) {
  const p = path.join(ROOT, rel);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}
function readFileSafe(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
}
function ensureDir(p) {
  if (!opts.check) fs.mkdirSync(p, { recursive: true });
}
function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  if (!opts.check) fs.writeFileSync(full, content, 'utf-8');
}
function escHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// {{var}} / {{var.sub}} 置換（unsafe: HTML エスケープなし、JSON-LD 等で使用）
// safe 版は esc=true で HTML エスケープ
function substitute(template, ctx, esc = false) {
  return template.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, (_, key) => {
    const v = key.split('.').reduce((o, k) => (o == null ? null : o[k]), ctx);
    if (v == null) return '';
    return esc ? escHTML(v) : String(v);
  });
}

// ═══════════════════ データ読込 ═══════════════════
const industries = readJSON('data/industries.json');
const regions = readJSON('data/regions.json');
const businessesRaw = readJSON('data/businesses.json');
// Phase 0.5 静岡県 5 都市 11 業種 902 件 実測サマリ（業界レポート + 全ハブの verbatim 数値出典）
// 注: JSON の `industries` は業種ラベル文字列配列、`by_industry` がオブジェクト配列。
// 旧コードは `.industries` をオブジェクト配列として参照していたため、JSON `industries` を `industry_labels` に避難 + `by_industry` を `industries` に再エイリアスする。
const phase05Summary = (function () {
  try {
    const s = readJSON('data/phase-0.5-shizuoka-summary.json');
    if (s && Array.isArray(s.by_industry)) {
      if (Array.isArray(s.industries) && s.industries.length > 0 && typeof s.industries[0] === 'string') {
        s.industry_labels = s.industries; // 元の業種ラベル文字列配列を保持
      }
      s.industries = s.by_industry; // 旧コード互換: オブジェクト配列を `.industries` に露出
    }
    return s;
  } catch (_) { return null; }
})();
// 旧変数名互換 alias (本ファイル内の既存参照との互換性保持 / 物理データは同一)
const phase0Summary = phase05Summary;
// Phase 0.5 集約スコープ表記 (cityLabel 規定値) と Wikidata Q (静岡県) を data 駆動で取得
const PHASE05_PREF_KEY = 'shizuoka';
const PHASE05_SCOPE_LABEL = `Phase 0.5 ${(typeof regions !== 'undefined' && regions && regions[PHASE05_PREF_KEY]) ? regions[PHASE05_PREF_KEY].label : '静岡県'} 5 都市`;
const PHASE05_PREF_WIKIDATA = (typeof regions !== 'undefined' && regions && regions[PHASE05_PREF_KEY]) ? regions[PHASE05_PREF_KEY].wikidata : null;

// _schema 等のメタキーを除外
const businesses = Object.fromEntries(
  Object.entries(businessesRaw).filter(([k, v]) =>
    !k.startsWith('_') && v && typeof v === 'object' && v.scan && !v.opt_out
  )
);

// 掲載基準: ★ 以上 + 致命的 NG ゼロ（MASTER-PLAN §3.4 / 3 段階 ★区分 / 自己実証型認定構造）
// scanner.py `calculate_rating()` の `rating` フィールド（公開表示 ★★★/★★/★/""）を直接参照。
// 旧 5 段階体系→3 段階体系への橋渡しマッピング層は v1.1.6.1（2026-04-30 / scanner ④ commit 959fc96 連動）で撤去済。
function isPublishable(b) {
  if (!b.scan) return false;
  if (b.scan.critical_ng !== 0) return false;
  const r = b.scan.rating || '';
  return r === '★' || r === '★★' || r === '★★★';
}
const publishable = Object.fromEntries(
  Object.entries(businesses).filter(([_, b]) => isPublishable(b))
);

// ═══════════════════ レイアウト適用 ═══════════════════
const layoutTpl = readFileSafe('templates/_layout.html');
if (!layoutTpl) {
  console.error('  FATAL: templates/_layout.html が見つかりません。Step 1 を完了してください。');
  process.exit(1);
}

function applyLayout({ pageType, variant = 'reading', title, description, canonicalPath, robots, ogType = 'website', ogImagePath = '/ogp.png', mainContent, breadcrumbs = [], additionalJsonLd = [] }) {
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
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: DOMAIN + b.path,
        })),
      }, null, 2)}\n</script>`
    : '';

  const additionalJsonLdStr = additionalJsonLd
    .map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n</script>`)
    .join('\n\n');

  const ctx = {
    lang: 'ja',
    title,
    description,
    canonical_path: canonicalPath,
    robots: robots || 'index, follow, max-image-preview:large, max-snippet:-1',
    og_type: ogType,
    og_image_path: ogImagePath,
    theme_color: themeColor,
    color_scheme: colorScheme,
    body_class: bodyClass,
    breadcrumbs_jsonld: breadcrumbsJsonLd,
    additional_jsonld: additionalJsonLdStr,
    main_content: mainContent,
    nav_active_search: pageType === 'search' ? 'aria-current="page"' : '',
    nav_active_methodology: pageType === 'methodology' ? 'aria-current="page"' : '',
    nav_active_apply: pageType === 'apply' ? 'aria-current="page"' : '',
    nav_active_about: pageType === 'about' ? 'aria-current="page"' : '',
    nav_active_press: pageType === 'press' ? 'aria-current="page"' : '',
  };

  return substitute(layoutTpl, ctx);
}

// ═══════════════════ business JSON-LD 構築 ═══════════════════
// SPEC v3.4 §4.2 #1.0-#1.3 完全準拠
function buildBusinessJsonLd(slug, b) {
  const ind = industries[b.industry];
  if (!ind) throw new Error(`unknown industry: ${b.industry} (slug=${slug})`);

  // additionalType: 主 wikidata_uri + secondary 配列 (例: 税理士 Q688576 + 公認会計士 Q11392214)
  const additionalType = [ind.wikidata_uri, ...(ind.wikidata_secondary || [])].filter(Boolean);

  const sameAs = [];
  if (b.gbp_cid && b.gbp_cid !== '00000000000000000000') {
    sameAs.push(`https://www.google.com/maps/place/?cid=${b.gbp_cid}`);
  }
  if (b.gbp_url_short && !/PLACEHOLDER/i.test(b.gbp_url_short)) {
    sameAs.push(b.gbp_url_short);
  }
  if (b.url) sameAs.push(b.url);

  const obj = {
    '@context': 'https://schema.org',
    '@type': ind.schema_type || ['LocalBusiness', 'ProfessionalService'],
    name: b.name,
    description: `${b.address.addressLocality}の${ind.label}。HARTON Certified ${b.scan.rating}（総合 ${b.scan.score} 点）認定。`,
    url: b.url,
    telephone: b.telephone,
    additionalType,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
      addressRegion: b.address.addressRegion,
      addressLocality: b.address.addressLocality,
      streetAddress: b.address.streetAddress,
    },
    knowsAbout: ind.keywords,
    areaServed: { '@type': 'AdministrativeArea', name: b.address.addressRegion },
    sameAs,
  };
  if (b.email) obj.email = b.email;
  return obj;
}

// ═══════════════════ business ページ ═══════════════════
function generateBusinessPage(slug, b) {
  const ind = industries[b.industry];
  const [pref, city] = b.region.split('/');
  const region = regions[pref];
  const cityData = region?.cities?.[city];

  const title = `${b.name} — HARTON Certified ${b.scan.rating}（${cityData?.label || ''}の${ind.label}）`;
  const description = `HARTON Certified ${b.scan.rating}認定。${b.name}（${cityData?.label || b.address.addressLocality}・${ind.label}）の機械検証スコアと評価詳細。総合 ${b.scan.score} 点 / 致命的 NG ${b.scan.critical_ng} 件 / 必須条件 ${b.scan.must5}。公式サイトへの導線も掲載。`;
  const canonicalPath = `/businesses/${slug}/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '事業者検索', path: `/regions/${pref}/${city}/` },
    { name: ind.label, path: `/regions/${pref}/${city}/industries/${b.industry}/` },
    { name: b.name, path: canonicalPath },
  ];

  const mainContent = `
  <article>
    <header>
      <p><a href="/regions/${pref}/${city}/">${escHTML(cityData?.label || '')}</a> &gt; <a href="/regions/${pref}/${city}/industries/${b.industry}/">${escHTML(ind.label)}</a></p>
      <h1>${escHTML(b.name)}</h1>
      <p><strong>HARTON Certified ${escHTML(b.scan.rating)}</strong> 認定 / 総合スコア <strong>${b.scan.score} / 100</strong></p>
      <p>認定日: <time datetime="${escHTML(b.scan.scanned_at)}" itemprop="datePublished">${escHTML(b.scan.scanned_at)}</time></p>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>${escHTML(b.name)}（${escHTML(b.address.addressLocality)}・${escHTML(ind.label)}）は、当機関の機械検証で総合 <strong>${b.scan.score}</strong> 点（100 点満点）、必須条件 <strong>${escHTML(b.scan.must5)}</strong> 達成、致命的 NG <strong>${b.scan.critical_ng}</strong> 件で評価され、HARTON Certified ${escHTML(b.scan.rating)} と認定された。出典は <a href="https://www.ipa.go.jp/" rel="nofollow noopener noreferrer" target="_blank">公的セキュリティ基準</a>（HSTS / CSP / WCAG 2.2 AA）に整合する 4 軸の独立評価による。</p>
      <blockquote cite="https://certification.tcharton.com/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」 — HARTON Certified 評価方法</blockquote>
    </section>

    <section aria-label="4 軸スコア（並列独立評価）">
      <h2>4 軸スコア</h2>
      <p>HARTON Certified は 4 つの観点で独立評価し、各観点の項目別減点を合算する（軸間の重み比率は採用しない / MASTER-PLAN §3.2）。</p>
      <table>
        <caption>4 軸機械検証スコア（${b.scan.scanned_at} 計測 / scanner ${b.scan.scanner_version}）</caption>
        <thead>
          <tr><th scope="col">軸</th><th scope="col">名称</th><th scope="col">スコア</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">A</th><td>基礎・身だしなみ</td><td>${b.scan.axes.A} / 100</td></tr>
          <tr><th scope="row">B</th><td>防御力・生存率</td><td>${b.scan.axes.B} / 100</td></tr>
          <tr><th scope="row">C</th><td>AI 検索適応</td><td>${b.scan.axes.C} / 100</td></tr>
          <tr><th scope="row">D</th><td>経営インパクト</td><td>${b.scan.axes.D} / 100</td></tr>
        </tbody>
      </table>
    </section>

    <section aria-label="公式サイトへの導線">
      <h2>公式サイトへ</h2>
      <p>${escHTML(b.name)} の公式サイトはこちらから。</p>
      <p><a href="${escHTML(b.url)}" rel="noopener noreferrer" target="_blank">${escHTML(b.url)} を訪問する（新しいタブで開く）</a></p>
    </section>

    <section aria-label="認定バッジ">
      <h2>認定バッジ</h2>
      <p>${escHTML(b.name)} は自社サイトに以下の認定バッジを掲載できる。</p>
      <p><a href="/businesses/${slug}/badge/">バッジ取得ページへ</a></p>
    </section>

    <section aria-label="評価方法">
      <h2>評価方法</h2>
      <p>本評価は <a href="/methodology/">/methodology/</a> で全公開している 4 軸スキャナーで実施した。スキャン項目・閾値・実施手順は機械検証可能で、再現性がある。</p>
      <p>本認定は ${escHTML(b.scan.scanned_at)} 時点の評価であり、四半期再スキャンで変動する可能性がある（MASTER-PLAN §3.5）。</p>
    </section>
  </article>`;

  const additionalJsonLd = [buildBusinessJsonLd(slug, b)];

  return applyLayout({
    pageType: 'business',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    ogType: 'article',
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ badge ページ（minimal） ═══════════════════
function generateBadgePage(slug, b) {
  const title = `${b.name} 認定バッジ — HARTON Certified ${b.scan.rating}`;
  const description = `${b.name}の HARTON Certified ${b.scan.rating} 認定バッジダウンロード。SVG / PNG / HTML 埋込コードを提供。`;
  const canonicalPath = `/businesses/${slug}/badge/`;

  const mainContent = `
  <article>
    <h1>${escHTML(b.name)} 認定バッジ</h1>
    <p>HARTON Certified ${escHTML(b.scan.rating)} 認定（${escHTML(b.scan.scanned_at)}）。バッジ画像は配備後にここに表示される。</p>
    <p><a href="/businesses/${slug}/">事業者ページへ戻る</a></p>
  </article>`;

  return applyLayout({
    pageType: 'badge',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    robots: 'index, follow',
    mainContent,
  });
}

// ═══════════════════ industry ページ（hub） ═══════════════════
function generateIndustryPage(industryKey, ind) {
  const list = Object.entries(publishable)
    .filter(([_, b]) => b.industry === industryKey)
    .sort((a, b) => b[1].scan.score - a[1].scan.score)
    .slice(0, 10);

  // Phase 0.5 静岡県 5 都市横断の該当業種実測 (by_industry 集約) を description より先に取得
  let summary = null;
  if (phase05Summary && Array.isArray(phase05Summary.industries)) {
    summary = phase05Summary.industries.find(s => s.industry === ind.label_short || s.industry === ind.label) || null;
  }
  const indN = summary ? summary.n : (phase05Summary ? phase05Summary.n_total : 0);
  const indMax = summary ? summary.max : '-';

  const title = `${ind.label} 認定店舗一覧 — HARTON Certified`;
  const description = `HARTON Certified が機械検証で公正評価した${ind.label} 認定店舗一覧。${PHASE05_SCOPE_LABEL}の${ind.label}サイト ${indN} 件機械検証で ★ 以上達成 ${list.length} 件 / 業界最高点 ${indMax} 点、Phase 1 で全国順次拡大予定。評価方法は全公開、金銭非依存、ポジティブセレクション。`;
  const canonicalPath = `/industries/${industryKey}/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '業種から探す', path: '/industries/' },
    { name: ind.label, path: canonicalPath },
  ];

  const itemList = list.map(([slug, b], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': ind.schema_type || ['LocalBusiness', 'ProfessionalService'],
      '@id': DOMAIN + `/businesses/${slug}/`,
      name: b.name,
      url: b.url,
    },
  }));

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time> / <time datetime="2026-05-02" itemprop="dateModified">最終更新 2026-05-02</time></p>
      <h1>${escHTML(ind.label)} 認定店舗一覧</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>HARTON Certified が機械検証で公正評価する${escHTML(ind.label)} 認定店舗一覧。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>を達成した事業者のみ掲載する。${escHTML(PHASE05_SCOPE_LABEL)}は ${summary ? `<strong>${summary.n}</strong> 件のスキャンで ★ 獲得率 <strong>${((summary.eligible / summary.n) * 100).toFixed(1)}%</strong>（${summary.eligible}/${summary.n}）、業界最高点 <strong>${summary.max}</strong> 点` : `<strong>${phase05Summary ? phase05Summary.n_total : 0}</strong> 件のスキャンで ★ 獲得率 <strong>0.0%</strong>`}、Phase 1 で全国順次拡大予定。出典は <a href="https://schema.org/${escHTML(ind.schema_type?.[0] || 'LocalBusiness')}" rel="nofollow noopener noreferrer" target="_blank">Schema.org ${escHTML(ind.schema_type?.[0] || 'LocalBusiness')}</a> および <a href="https://www.wikidata.org/wiki/${escHTML(ind.wikidata)}" rel="nofollow noopener noreferrer" target="_blank">Wikidata ${escHTML(ind.wikidata)}</a> に整合する。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」 — HARTON Certified 評価方法</blockquote>
    </section>

    ${renderSearchForm({ presetIndustry: industryKey })}

    ${renderLeadEvidenceSection({ cityLabel: PHASE05_SCOPE_LABEL, n: summary ? summary.n : (phase05Summary ? phase05Summary.n_total : 0), eligible: summary ? summary.eligible : 0 })}

    ${renderEvaluationPointsSection(ind)}

    ${renderChecklistSection(ind)}

    ${renderPublicSources(ind, null)}

    <section aria-label="認定店舗一覧">
      <h2>認定店舗一覧（${list.length}件）</h2>
      ${list.length === 0
        ? `<p><strong>現時点で ★ 以上達成事業者: 0 件</strong>。${escHTML(PHASE05_SCOPE_LABEL)} ${summary ? summary.n : (phase05Summary ? phase05Summary.n_total : 0)} 件機械検証の実測結果は <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>を参照。静岡県 5 都市以外の地域は Phase 1（類似地方都市: 倉敷・四日市・松本・盛岡 等）で順次拡大予定。</p>`
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点 / ${escHTML(b.address.addressLocality)}</li>`).join('')}</ol>`}
    </section>

    ${renderFaqSection(ind, PHASE05_SCOPE_LABEL, summary)}

    ${renderCtaSection(ind)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const additionalJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': DOMAIN + canonicalPath + '#itemlist',
      name: `${ind.label} 認定店舗一覧 — HARTON Certified`,
      numberOfItems: list.length,
      itemListElement: itemList,
    },
    buildArticleJsonLd({
      canonicalPath,
      headline: `${ind.label} 認定店舗一覧 — HARTON Certified`,
      description,
      about: { '@type': 'Thing', name: ind.label, sameAs: ind.wikidata_uri },
    }),
    // 業種ハブは全国 forward-looking なため Service / FAQ の cityLabel/Wikidata は Phase 0.5 集約スコープ (静岡県 5 都市 / Q131320) を data 駆動で参照
    buildServiceJsonLd({ canonicalPath, ind, cityLabel: PHASE05_SCOPE_LABEL, cityWikidata: PHASE05_PREF_WIKIDATA }),
    buildHowToJsonLd({ canonicalPath, ind }),
  ];
  const faq = buildFAQPageJsonLd({ canonicalPath, ind, cityLabel: PHASE05_SCOPE_LABEL, summary });
  if (faq) additionalJsonLd.push(faq);

  return applyLayout({
    pageType: 'industry',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ region ページ（hub） ═══════════════════
function generateRegionPage(prefKey, cityKey) {
  const pref = regions[prefKey];
  const city = pref?.cities?.[cityKey];
  if (!city) return null;

  const list = Object.entries(publishable)
    .filter(([_, b]) => b.region === `${prefKey}/${cityKey}`)
    .sort((a, b) => b[1].scan.score - a[1].scan.score);

  const title = `${city.label} 認定店舗一覧 — HARTON Certified（${pref.label}）`;
  const description = `${city.label}（${pref.label}）の HARTON Certified 認定店舗一覧。機械検証で総合 70 点以上 + 致命的 NG ゼロを達成した ${list.length} 件を業種横断で掲載。`;
  const canonicalPath = `/regions/${prefKey}/${cityKey}/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '地域別検索', path: '/regions/' },
    { name: pref.label, path: `/regions/${prefKey}/` },
    { name: city.label, path: canonicalPath },
  ];

  // 業種別グルーピング
  const byIndustry = {};
  for (const [slug, b] of list) {
    if (!byIndustry[b.industry]) byIndustry[b.industry] = [];
    byIndustry[b.industry].push([slug, b]);
  }
  const industryLinks = Object.keys(byIndustry).map(k =>
    `<li><a href="/regions/${prefKey}/${cityKey}/industries/${k}/">${escHTML(industries[k]?.label || k)}（${byIndustry[k].length}件）</a></li>`
  ).join('');

  // Phase 0.5 都市別 verbatim (by_city 引用 / 5 都市すべてが対象スコープ)
  const cityRow = (phase05Summary && Array.isArray(phase05Summary.by_city))
    ? phase05Summary.by_city.find(c => c.city === city.label) || null
    : null;
  const cityN = cityRow ? cityRow.n : list.length;
  const cityEligible = cityRow ? cityRow.eligible : list.length;
  const cityNgPct = cityRow ? cityRow.ng_pct : null;
  const cityMax = cityRow ? cityRow.max : null;

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time> / <time datetime="2026-05-02" itemprop="dateModified">最終更新 2026-05-02</time></p>
      <h1>${escHTML(city.label)} 認定店舗一覧</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>${escHTML(city.label)}（${escHTML(pref.label)}）の HARTON Certified 認定店舗 <strong>${list.length}</strong> 件を業種横断で掲載する。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>を達成した事業者のみ。Phase ${city.phase || 0} 対象地域。緯度 ${city.geo?.latitude || ''} / 経度 ${city.geo?.longitude || ''}。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」 — HARTON Certified 評価方法</blockquote>
    </section>

    ${renderSearchForm({ presetRegion: `${prefKey}/${cityKey}` })}

    ${renderLeadEvidenceSection({ cityLabel: city.label, n: cityN, eligible: cityEligible })}

    ${renderRegionNarrativeSection(pref, city)}

    ${renderPublicSources(null, city)}

    <section aria-label="業種別">
      <h2>${escHTML(city.label)} 業種別検索</h2>
      <ul>${industryLinks || `<li>業種別認定は Phase 1 以降で順次拡大予定（対応業種: ${Object.values(industries).map(v => escHTML(v.label)).join('・')}）</li>`}</ul>
      <p>${escHTML(city.label)}の事業者で HARTON Certified 認定取得を目指す方は <a href="/apply/">掲載申請</a>から登録可能。AI 時代の信頼を体現する WEB 品質を機械検証で公正評価する。</p>
    </section>

    <section aria-label="認定店舗一覧">
      <h2>全認定店舗（${list.length}件）</h2>
      ${list.length === 0
        ? `<p><strong>現時点で ★ 以上達成事業者: 0 件</strong>。${cityRow ? `Phase 0.5 ${escHTML(city.label)} ${cityN} 件機械検証の業界実態 (★ 認定 ${cityEligible} 件 / 致命的 NG ${cityNgPct.toFixed(1)}% / 業界最高点 ${cityMax} 点) は <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>で堂々と公開している。` : `Phase 1 で対応開始予定。`}静岡県 5 都市以外の地域は Phase 1（類似地方都市: 倉敷・四日市・松本・盛岡 等）で順次拡大予定。</p>`
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(industries[b.industry]?.label || b.industry)} / ${escHTML(b.scan.rating)} / ${b.scan.score}点</li>`).join('')}</ol>`}
    </section>

    ${renderCtaSection(null)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const additionalJsonLd = [
    buildArticleJsonLd({
      canonicalPath,
      headline: `${city.label} 認定店舗一覧 — HARTON Certified`,
      description,
      mentions: { '@type': 'AdministrativeArea', name: city.label, sameAs: city.wikidata ? `https://www.wikidata.org/wiki/${city.wikidata}` : undefined },
    }),
    buildServiceJsonLd({ canonicalPath, ind: null, cityLabel: city.label, cityWikidata: city.wikidata }),
  ];

  return applyLayout({
    pageType: 'region',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ region × industry ページ ═══════════════════
function generateRegionIndustryPage(prefKey, cityKey, industryKey) {
  const pref = regions[prefKey];
  const city = pref?.cities?.[cityKey];
  const ind = industries[industryKey];
  if (!city || !ind) return null;

  const list = Object.entries(publishable)
    .filter(([_, b]) => b.region === `${prefKey}/${cityKey}` && b.industry === industryKey)
    .sort((a, b) => b[1].scan.score - a[1].scan.score);

  const title = `${city.label} ${ind.label} 認定店舗 — HARTON Certified`;
  const description = `${city.label}（${pref.label}）の${ind.label} HARTON Certified 認定店舗 TOP ${list.length} 件。機械検証で公正評価、総合 70 点以上のみ掲載。`;
  const canonicalPath = `/regions/${prefKey}/${cityKey}/industries/${industryKey}/`;

  // Phase 0.5 都市別 × 業種別 verbatim (cross_tab_n 引用 / 当該都市 × 当該業種の n を都市ページ FAQ/LeadEvidence に注入)
  // 設計変更 (v2.4): 旧版は「全都市で Phase 0 沼津数値を流用」していたため業種ページ FAQ が沼津固定だった。
  // Phase 0.5 で全 5 都市が同一 schema (cross_tab_n) を持つため、都市別 × 業種別 verbatim を data 駆動で参照する。
  // by_industry (pref 集計) も保持し、業界 max などの pref 横断指標は引き続きそちらを参照する。
  const indByIndustry = (phase05Summary && Array.isArray(phase05Summary.industries))
    ? phase05Summary.industries.find(s => s.industry === ind.label_short || s.industry === ind.label) || null
    : null;
  const cityIndustryKey = ind.label_short || ind.label;
  const cityIndustryN = (phase05Summary && phase05Summary.cross_tab_n && phase05Summary.cross_tab_n[city.label]
    && cityIndustryKey in phase05Summary.cross_tab_n[city.label])
    ? phase05Summary.cross_tab_n[city.label][cityIndustryKey]
    : null;
  // FAQ/JSON-LD に渡す summary は「都市別 n + pref 集計の max/median/ng_pct」をマージ (n は都市別 verbatim)
  const summary = (cityIndustryN !== null && indByIndustry)
    ? { n: cityIndustryN, eligible: 0, max: indByIndustry.max, median: indByIndustry.median, ng: indByIndustry.ng, ng_pct: indByIndustry.ng_pct, industry: indByIndustry.industry }
    : indByIndustry;
  const cityN = (cityIndustryN !== null) ? cityIndustryN : (indByIndustry ? indByIndustry.n : list.length);
  const cityEligible = list.length;

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time> / <time datetime="2026-05-02" itemprop="dateModified">最終更新 2026-05-02</time></p>
      <h1>${escHTML(city.label)} ${escHTML(ind.label)} 認定店舗</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>${escHTML(city.label)}（${escHTML(pref.label)}）の${escHTML(ind.label)} HARTON Certified 認定店舗 <strong>${list.length}</strong> 件。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>達成事業者のみ掲載する。${(cityIndustryN !== null && cityIndustryN > 0) ? `Phase 0.5 機械検証で当該都市の${escHTML(ind.label)}サイトを <strong>${cityIndustryN}</strong> 件評価し、★ 獲得率 <strong>${((list.length / cityIndustryN) * 100).toFixed(1)}%</strong>${indByIndustry ? `、業界 (静岡県 5 都市横断) 最高点 <strong>${indByIndustry.max}</strong> 点` : ''}。` : ''}出典: <a href="https://www.wikidata.org/wiki/${escHTML(ind.wikidata)}" rel="nofollow noopener noreferrer" target="_blank">Wikidata ${escHTML(ind.wikidata)}</a> / <a href="https://schema.org/${escHTML(ind.schema_type?.[0] || 'LocalBusiness')}" rel="nofollow noopener noreferrer" target="_blank">Schema.org ${escHTML(ind.schema_type?.[0] || 'LocalBusiness')}</a>。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」 — HARTON Certified 評価方法</blockquote>
    </section>

    ${renderSearchForm({ presetIndustry: industryKey, presetRegion: `${prefKey}/${cityKey}` })}

    ${renderLeadEvidenceSection({ cityLabel: city.label, n: cityN, eligible: cityEligible })}

    ${renderRegionNarrativeSection(pref, city)}

    ${renderEvaluationPointsSection(ind)}

    ${renderChecklistSection(ind)}

    ${renderPublicSources(ind, city)}

    <section aria-label="認定店舗一覧">
      <h2>${escHTML(city.label)} ${escHTML(ind.label)} 認定店舗（${list.length}件）</h2>
      ${list.length === 0
        ? `<p><strong>現時点で ★ 以上達成事業者: 0 件</strong>。${(cityIndustryN !== null && cityIndustryN > 0) ? `Phase 0.5 ${escHTML(city.label)} の${escHTML(ind.label)}サイトを ${cityIndustryN} 件機械検証${indByIndustry ? `（業界 (静岡県 5 都市横断) 最高点 ${indByIndustry.max} 点）` : ''}。` : ''}実測結果は <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>を参照。Phase 1 で類似地方都市に順次拡大予定。</p>`
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点</li>`).join('')}</ol>`}
    </section>

    ${renderFaqSection(ind, city.label, summary)}

    ${renderCtaSection(ind)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const additionalJsonLd = [
    buildArticleJsonLd({
      canonicalPath,
      headline: `${city.label} ${ind.label} 認定店舗 — HARTON Certified`,
      description,
      about: { '@type': 'Thing', name: ind.label, sameAs: ind.wikidata_uri },
      mentions: { '@type': 'AdministrativeArea', name: city.label, sameAs: city.wikidata ? `https://www.wikidata.org/wiki/${city.wikidata}` : undefined },
    }),
    buildServiceJsonLd({ canonicalPath, ind, cityLabel: city.label, cityWikidata: city.wikidata }),
    buildHowToJsonLd({ canonicalPath, ind }),
  ];
  const faq = buildFAQPageJsonLd({ canonicalPath, ind, cityLabel: city.label, summary });
  if (faq) additionalJsonLd.push(faq);

  return applyLayout({
    pageType: 'region-industry',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs: [
      { name: 'トップ', path: '/' },
      { name: '地域から探す', path: '/regions/' },
      { name: pref.label, path: `/regions/${prefKey}/` },
      { name: city.label, path: `/regions/${prefKey}/${cityKey}/` },
      { name: ind.label, path: canonicalPath },
    ],
    additionalJsonLd,
  });
}

// ═══════════════════ 共通: ★区分物語 verbatim (INSTRUCTION-FROM-ROOT v1.1.14 / MASTER-PLAN §3.1) ═══════════════════
// MASTER-PLAN v1.1.6 公式版に整合。GEO §G-1 (引用句) + §G-3 (数値) + §G-6 (Lead Evidence) 連動。
function renderRatingNarratives() {
  return `
    <section aria-label="★区分の物語" class="rating-narratives">
      <h2>★区分の物語（期待値）</h2>
      <ul>
        <li id="rating-1star"><strong>★ HARTON Certified</strong> — 「AI 時代の信頼を体現する」（総合 70 点以上 + 致命的 NG 0 件）</li>
        <li id="rating-2star"><strong>★★ HARTON 優良</strong> — 「地域を代表する WEB 品質」（総合 80 点以上 + 必須 5 条件 4/5 達成）</li>
        <li id="rating-3star"><strong>★★★ HARTON S-Class</strong> — 「業界の頂点に立つ WEB 品質」（総合 90 点以上 + 必須 5 条件 5/5 達成）</li>
      </ul>
    </section>`;
}

// ═══════════════════ 共通: 検索フォーム (data 駆動 / 全ハブ埋込 / 初期値プリセット対応) ═══════════════════
function renderSearchForm({ presetIndustry = '', presetRegion = '', presetRating = '' } = {}) {
  const indCount = Object.keys(industries).length;
  const indOptions = Object.entries(industries).map(([k, v]) => {
    const sel = k === presetIndustry ? ' selected' : '';
    return `<option value="${k}"${sel}>${escHTML(v.label)}</option>`;
  }).join('');
  const regionOptGroups = Object.entries(regions).map(([prefKey, pref]) => {
    const prefPhase = pref.phase ?? 0;
    const prefDisabled = prefPhase > 0 ? ' disabled' : '';
    const prefSuffix = prefPhase > 0 ? '（準備中）' : '';
    const prefSel = prefKey === presetRegion ? ' selected' : '';
    const cities = Object.entries(pref.cities || {}).map(([cityKey, c]) => {
      const value = `${prefKey}/${cityKey}`;
      const sel = value === presetRegion ? ' selected' : '';
      const phase = c.phase ?? 0;
      const disabled = phase > 0 ? ' disabled' : '';
      const suffix = phase > 0 ? '（準備中）' : '';
      return `<option value="${value}"${sel}${disabled}>${escHTML(pref.label)} ${escHTML(c.label)}${suffix}</option>`;
    }).join('');
    return `<optgroup label="${escHTML(pref.label)}"><option value="${prefKey}"${prefSel}${prefDisabled}>${escHTML(pref.label)} 全域${prefSuffix}</option>${cities}</optgroup>`;
  }).join('');
  const ratingOptions = ['3star', '2star', '1star'].map(r => {
    const sel = r === presetRating ? ' selected' : '';
    const label = r === '3star' ? '★★★ のみ（HARTON S-Class）'
      : r === '2star' ? '★★ 以上（HARTON 優良 + S-Class）'
      : '★ 以上（HARTON Certified 以上）';
    return `<option value="${r}"${sel}>${label}</option>`;
  }).join('');
  return `
    <section aria-label="認定店舗を絞り込む" class="search-section">
      <h2>認定店舗を絞り込む</h2>
      <p class="search-lede">業種・地域・★区分で認定店舗を絞り込む。AI 時代の信頼を持つ事業者を、人より先に発見する。</p>
      <form id="search-form" action="/regions/" method="GET" class="search-form" role="search">
        <div class="search-field">
          <label for="search-industry">業種</label>
          <select id="search-industry" name="industry">
            <option value=""${presetIndustry === '' ? ' selected' : ''}>すべての業種（${indCount} 業種）</option>
            ${indOptions}
          </select>
        </div>
        <div class="search-field">
          <label for="search-region">地域</label>
          <select id="search-region" name="region">
            <option value=""${presetRegion === '' ? ' selected' : ''}>すべての地域</option>
            ${regionOptGroups}
          </select>
        </div>
        <div class="search-field">
          <label for="search-rating">★区分</label>
          <select id="search-rating" name="rating">
            <option value=""${presetRating === '' ? ' selected' : ''}>すべての認定（全件）</option>
            ${ratingOptions}
          </select>
        </div>
        <div class="search-field search-field-submit">
          <button type="submit">絞り込む</button>
        </div>
      </form>
      <script src="/assets/js/search.js" defer></script>
    </section>`;
}

// ═══════════════════ 共通: Lead Evidence section (GEO §G-6 / 業界レポート bridge 統合) ═══════════════════
function renderLeadEvidenceSection({ cityLabel, n, eligible = 0 } = {}) {
  const safeLabel = cityLabel || (typeof PHASE05_SCOPE_LABEL !== 'undefined' ? PHASE05_SCOPE_LABEL : '静岡県 5 都市');
  const safeN = (typeof n === 'number') ? n : (phase05Summary ? phase05Summary.n_total : 0);
  const rate = safeN > 0 ? ((eligible / safeN) * 100).toFixed(1) : '0.0';
  return `
    <aside aria-label="${safeLabel} ★ 獲得率 + 信頼根拠" class="report-bridge">
      <p><strong>${safeLabel} ★ 獲得率: ${eligible} / ${safeN} = ${rate}%</strong>（Phase 0.5 機械検証 / 2026-05-02 時点）。業種別 ★ 獲得率と業界最高点は <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>に公開している。</p>
      <p>評価方法は <a href="/methodology/">機械検証 4 軸（基礎・防御・AI 検索・経営インパクト）</a>で全公開する。<strong>「機械検証が示す、AI 時代の WEB 品質。」</strong>が本機関の信頼根拠の核である（運営元については <a href="/about/">サイトについて</a>を参照）。</p>
    </aside>`;
}

// renderReportBridge() は後方互換 alias
function renderReportBridge() {
  return renderLeadEvidenceSection();
}

// 共通: search.js script タグ
function renderSearchScript() {
  return `<script src="/assets/js/search.js" defer></script>`;
}

// ═══════════════════ JSON-LD Builders (B 案 richness / @id URI 厳格分離) ═══════════════════

function buildArticleJsonLd({ canonicalPath, headline, description, about, mentions }) {
  const pageId = DOMAIN + canonicalPath;
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': pageId + '#article',
    headline,
    description,
    datePublished: '2026-05-02',
    dateModified: '2026-05-02',
    author: { '@type': 'Organization', '@id': DOMAIN + '/#org', name: 'HARTON Certified' },
    publisher: { '@type': 'Organization', '@id': DOMAIN + '/#org', name: 'T.C.HARTON', url: 'https://tcharton.com/' },
    inLanguage: 'ja',
  };
  if (about) obj.about = about;
  if (mentions) obj.mentions = mentions;
  return obj;
}

// FAQ プレースホルダ展開: {city}/{industry}/{n}/{eligible}/{max}/{ng}/{ng_pct}/{median} (city × industry 単位 / summary)
// および {max_pref}/{ng_pct_pref}/{median_pref}/{ng_pref} (pref 5 都市集計単位 / prefStats / 静岡県 5 都市 by_industry)
// summary = phase05Summary.by_industry[該当業種] または都市別 merged summary (例: { n:18, eligible:0, max:40, ng:5, ng_pct:27.78, median:17.5 })
// prefStats = phase05Summary.by_industry[該当業種] (常に静岡県 5 都市集計 / city ページでも pref 集計を別系統で参照可能)
// 安全性: ng_pct は Number() coerce で文字列型エラー防止 / summary=null 時は fallback で `-` 置換し未展開残存を防ぐ
function expandFaqPlaceholders(text, ind, cityLabel, summary, prefStats) {
  let s = text.replace(/\{city\}/g, cityLabel).replace(/\{industry\}/g, ind.label);
  if (summary) {
    s = s.replace(/\{n\}/g, summary.n)
      .replace(/\{eligible\}/g, summary.eligible)
      .replace(/\{max\}/g, summary.max)
      // {ng} の word-boundary は日本語/`}` 後で発火しないため除去 (reviewer 信頼 87)
      // {ng_pct} は `_` を間に挟むため \{ng\} (= リテラル {ng}) と衝突しない
      .replace(/\{ng\}/g, summary.ng)
      .replace(/\{ng_pct\}/g, `${Number(summary.ng_pct).toFixed(1)}%`)
      .replace(/\{median\}/g, summary.median);
  }
  // pref 集計プレースホルダ (Phase 0.5 静岡県 5 都市 by_industry)
  if (prefStats) {
    s = s.replace(/\{max_pref\}/g, prefStats.max)
      .replace(/\{ng_pref\}/g, prefStats.ng)
      .replace(/\{ng_pct_pref\}/g, `${Number(prefStats.ng_pct).toFixed(1)}%`)
      .replace(/\{median_pref\}/g, prefStats.median);
  }
  // 防御層: 未展開プレースホルダを `-` で置換 (HTML/JSON-LD に {} が露出するのを防ぐ)
  s = s.replace(/\{(n|eligible|max|ng|ng_pct|median|max_pref|ng_pref|ng_pct_pref|median_pref)\}/g, '-');
  return s;
}

function buildFAQPageJsonLd({ canonicalPath, ind, cityLabel, summary = null, prefStats = null }) {
  cityLabel = cityLabel || (typeof PHASE05_SCOPE_LABEL !== 'undefined' ? PHASE05_SCOPE_LABEL : '静岡県 5 都市');
  // prefStats fallback: phase05Summary.by_industry から該当業種を引く
  if (!prefStats && phase05Summary && Array.isArray(phase05Summary.by_industry) && ind) {
    prefStats = phase05Summary.by_industry.find(s => s.industry === ind.label_short || s.industry === ind.label) || null;
  }
  if (!ind || !Array.isArray(ind.faq_industry)) return null;
  const pageId = DOMAIN + canonicalPath;
  const mainEntity = ind.faq_industry.map(qa => ({
    '@type': 'Question',
    name: expandFaqPlaceholders(qa.q, ind, cityLabel, summary, prefStats),
    acceptedAnswer: {
      '@type': 'Answer',
      text: expandFaqPlaceholders(qa.a, ind, cityLabel, summary, prefStats),
    },
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': pageId + '#faq',
    mainEntity,
  };
}

function buildServiceJsonLd({ canonicalPath, ind, cityLabel, cityWikidata }) {
  cityLabel = cityLabel || (typeof PHASE05_SCOPE_LABEL !== 'undefined' ? PHASE05_SCOPE_LABEL : '静岡県 5 都市');
  const pageId = DOMAIN + canonicalPath;
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': pageId + '#service',
    name: ind ? `${cityLabel} ${ind.label} WEB 品質認定` : `${cityLabel} WEB 品質認定`,
    serviceType: 'WEB Quality Certification',
    provider: { '@type': 'Organization', '@id': DOMAIN + '/#org', name: 'HARTON Certified' },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: cityLabel,
      ...(cityWikidata ? { sameAs: `https://www.wikidata.org/wiki/${cityWikidata}` } : {}),
    },
    url: pageId,
  };
  if (ind) obj.audience = { '@type': 'Audience', audienceType: `${ind.label}事業者` };
  return obj;
}

const INDUSTRY_HOWTO_STEPS = [
  { name: 'HTTPS 常時 SSL 化', text: 'Let\'s Encrypt + HSTS preload 登録で総合スコア +15 点 / 致命的 NG 解消。' },
  { name: 'JSON-LD Schema.org 実装', text: '業種固有の Schema.org type を name + address + telephone + url の 4 項目以上で実装。スコア +12 点。' },
  { name: 'Content Security Policy + Trusted Types 適用', text: 'script-src self + require-trusted-types-for script 適用で致命的 NG 解消。' },
  { name: 'AI 検索最適化（GEO/LLMO）', text: 'llms.txt 配置 + FAQPage JSON-LD + 公的リンク 3 件以上で AI クローラー引用率を高める。スコア +10 点。' },
  { name: 'Core Web Vitals 改善 + 静的生成（SSG）', text: 'LCP < 2.5s / CLS < 0.1 / INP < 200ms 達成 + Jamstack/SSG 構成で総合スコア +8 点。' },
];
function buildHowToJsonLd({ canonicalPath, ind }) {
  const pageId = DOMAIN + canonicalPath;
  const indLabel = ind ? ind.label : 'WEB';
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': pageId + '#howto',
    name: `${indLabel}サイトが HARTON Certified ★★★ を取得するための 5 Step`,
    totalTime: 'PT90D',
    step: INDUSTRY_HOWTO_STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

// ═══════════════════ 9 section 標準テンプレート (LLMO キーワード散布 + spam 回避) ═══════════════════

function renderPublicSources(ind, city) {
  // 公的機関リンクは AI クローラー引用シグナル強化のため rel="nofollow" を除去 (noopener noreferrer のみ retain)
  // GEO §G-2 公的リンク 5+ 件を保証するため、ind/city 不在時も fallback 公的ソースで補充
  const items = [];
  if (ind && Array.isArray(ind.public_sources)) {
    for (const src of ind.public_sources) {
      items.push(`<li><a href="${escHTML(src.url)}" rel="noopener noreferrer" target="_blank">${escHTML(src.label)}</a></li>`);
    }
  }
  if (city && city.city_facts && city.city_facts.public_url) {
    items.push(`<li><a href="${escHTML(city.city_facts.public_url)}" rel="noopener noreferrer" target="_blank">${escHTML(city.city_facts.public_source_label)}</a></li>`);
  }
  // 共通公的ソース (常時)
  items.push(`<li><a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="noopener noreferrer" target="_blank">IPA「安全なウェブサイトの作り方」</a></li>`);
  items.push(`<li><a href="https://www.digital.go.jp/" rel="noopener noreferrer" target="_blank">デジタル庁</a></li>`);
  // ind なし時の fallback (GEO §G-2 5+ 件保証)
  if (!ind) {
    items.push(`<li><a href="https://laws.e-gov.go.jp/" rel="noopener noreferrer" target="_blank">e-Gov 法令検索</a></li>`);
    items.push(`<li><a href="https://www.soumu.go.jp/" rel="noopener noreferrer" target="_blank">総務省</a></li>`);
    items.push(`<li><a href="https://schema.org/LocalBusiness" rel="noopener noreferrer" target="_blank">Schema.org LocalBusiness</a></li>`);
  }
  return `
    <section aria-label="参照・出典" class="public-sources">
      <h2>参照・出典(公的ソース)</h2>
      <ul>${items.join('')}</ul>
    </section>`;
}

function renderFaqSection(ind, cityLabel, summary = null, prefStats = null) {
  cityLabel = cityLabel || (typeof PHASE05_SCOPE_LABEL !== 'undefined' ? PHASE05_SCOPE_LABEL : '静岡県 5 都市');
  if (!prefStats && phase05Summary && Array.isArray(phase05Summary.by_industry) && ind) {
    prefStats = phase05Summary.by_industry.find(s => s.industry === ind.label_short || s.industry === ind.label) || null;
  }
  if (!ind || !Array.isArray(ind.faq_industry)) return '';
  const items = ind.faq_industry.map(qa => {
    const q = escHTML(expandFaqPlaceholders(qa.q, ind, cityLabel, summary, prefStats));
    const a = escHTML(expandFaqPlaceholders(qa.a, ind, cityLabel, summary, prefStats));
    return `<details open><summary>${q}</summary><div class="faq-answer"><p>${a}</p></div></details>`;
  }).join('');
  return `
    <section aria-label="よくある質問" class="faq-section">
      <h2>よくある質問</h2>
      ${items}
    </section>`;
}

function renderCtaSection(ind) {
  const indLabel = ind ? ind.label : '';
  return `
    <section aria-label="次のアクション" class="cta-section">
      <h2>次のアクション</h2>
      <ul>
        <li><a href="/apply/"><strong>${indLabel ? `この業種で最初の ★ 認定を取得する` : '★ 認定を取得する'}</strong></a> — 掲載申請(無料 / Phase 0.5 静岡県 5 都市 + Phase 1 拡大予定地域)</li>
        <li><a href="/improvement-guide/">改善ガイダンス</a> — ★ 認定取得までの 5 Step (HTTPS / JSON-LD / CSP / GEO/LLMO / SSG)</li>
        <li><a href="/methodology/">評価方法</a> — 4 軸機械検証 + 必須 5 条件 + 致命的 NG 4 項目の詳細</li>
        <li><a href="/contact/">お問合せ</a> — 現状診断レポート受付(CR-2/CR-3 実装後 順次開始)</li>
      </ul>
    </section>`;
}

function renderUpdatePolicySection() {
  return `
    <section aria-label="四半期更新方針" class="update-policy">
      <h2>四半期更新方針</h2>
      <p><time datetime="2026-05-02" itemprop="dateModified">最終スキャン: 2026-05-02</time> / <time datetime="2026-06-02">次回再判定予定: 2026-06-02</time>。四半期再判定で改善した事業者は自動的に認定店舗ページに掲載される(MASTER-PLAN §12 / 14 日改善猶予 + 致命的 NG 即時切替)。</p>
    </section>`;
}

function renderEvaluationPointsSection(ind) {
  if (!ind || !Array.isArray(ind.evaluation_points)) return '';
  const items = ind.evaluation_points.map(p => `<li>${escHTML(p)}</li>`).join('');
  return `
    <section aria-label="業種固有の評価ポイント" class="evaluation-points">
      <h2>${escHTML(ind.label)} の WEB 品質評価ポイント</h2>
      <ul>${items}</ul>
    </section>`;
}

function renderChecklistSection(ind) {
  if (!ind || !Array.isArray(ind.checklist)) return '';
  const items = ind.checklist.map(c => `<li>${escHTML(c)}</li>`).join('');
  return `
    <section aria-label="業種別チェックリスト" class="checklist-section">
      <h2>${escHTML(ind.label)} WEB 品質チェックリスト</h2>
      <ol>${items}</ol>
    </section>`;
}

function renderRegionNarrativeSection(pref, city) {
  if (!city || !city.city_facts) return '';
  const cf = city.city_facts;
  const keywords = (cf.area_keywords || []).join('・');
  return `
    <section aria-label="地域特性と WEB 品質" class="region-narrative">
      <h2>${escHTML(city.label)} の地域特性と WEB 品質</h2>
      <p>${escHTML(city.label)}は ${escHTML(pref.label)}に属する人口 <strong>${escHTML(cf.population)}</strong> の地方都市である。最寄り駅 <strong>${escHTML(cf.station)}</strong>。地域キーワード: ${escHTML(keywords)}。HARTON Certified は地方都市から AI 時代の WEB 品質を再定義する独立認定機関であり、${escHTML(city.label)}の事業者サイトを 4 軸(基礎・防御・AI 検索適応・経営インパクト)で機械検証する。HTTPS / JSON-LD / Schema.org / Trusted Types / SSG / Core Web Vitals / WCAG 2.2 AA / GEO/LLMO 全項目を客観評価する。</p>
    </section>`;
}


// ═══════════════════ /regions/ 都道府県別ハブ ═══════════════════
function generateRegionsIndexPage() {
  const prefList = Object.entries(regions);
  const title = `地域から探す — HARTON Certified 認定店舗`;
  const description = `HARTON Certified 認定店舗を地域から探す。Phase 0.5 静岡県 5 都市（沼津・三島・富士・静岡・浜松）${phase05Summary ? phase05Summary.n_total : 0} 件機械検証 / ★ 認定 ${phase05Summary ? phase05Summary.eligible_total : 0} 件 / 業界中央値 ${phase05Summary && phase05Summary.score_stats ? phase05Summary.score_stats.median : '-'} 点。Phase 1 で全国 47 都道府県へ順次拡大予定。`;
  const canonicalPath = `/regions/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '地域から探す', path: canonicalPath },
  ];

  const itemList = prefList.map(([key, p], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'AdministrativeArea',
      '@id': DOMAIN + `/regions/${key}/`,
      name: p.label,
      sameAs: p.wikidata ? `https://www.wikidata.org/wiki/${p.wikidata}` : undefined,
    },
  }));

  const prefCards = prefList.map(([key, p]) => {
    const cityCount = Object.keys(p.cities || {}).length;
    const phase0Cities = Object.values(p.cities || {}).filter(c => (c.phase ?? 0) === 0).length;
    return `<li><a href="/regions/${key}/"><strong>${escHTML(p.label)}</strong></a> — 対応 ${cityCount} 市町（Phase 0 active: ${phase0Cities} 市）</li>`;
  }).join('');

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time></p>
      <h1>地域から探す</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>HARTON Certified 認定店舗を都道府県・市町村から探す。Phase 0.5 起点は <strong>静岡県 5 都市（沼津・三島・富士・静岡・浜松）</strong>（${phase05Summary ? phase05Summary.n_total : 0} 件機械検証 / ★ 認定 <strong>${phase05Summary ? phase05Summary.eligible_total : 0}</strong> 件 / 致命的 NG <strong>${phase05Summary ? phase05Summary.ng_pct.toFixed(1) : '0.0'}%</strong>）。出典は <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA「安全なウェブサイトの作り方」</a>に整合する 4 軸機械検証による。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」 — HARTON Certified 評価方法</blockquote>
    </section>

    ${renderSearchForm()}

    ${renderLeadEvidenceSection({ cityLabel: PHASE05_SCOPE_LABEL, n: phase05Summary ? phase05Summary.n_total : 0, eligible: phase05Summary ? phase05Summary.eligible_total : 0 })}

    ${renderPublicSources(null, null)}

    <section aria-label="対応都道府県一覧">
      <h2>対応都道府県（${prefList.length} 都道府県）</h2>
      <ul>${prefCards}</ul>
      <p>Phase 1 で全国 <strong>47</strong> 都道府県・<strong>10,000+</strong> 件への拡大を予定（類似地方都市優先: 倉敷・四日市・松本・盛岡 等 / 人口 15-25 万人規模）。</p>
    </section>

    ${renderCtaSection(null)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const additionalJsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'HARTON Certified 対応都道府県一覧',
    numberOfItems: prefList.length,
    itemListElement: itemList,
  }];

  return applyLayout({
    pageType: 'search',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ /regions/{pref}/ 市町村別ハブ ═══════════════════
function generatePrefIndexPage(prefKey) {
  const pref = regions[prefKey];
  if (!pref) return null;

  const cityList = Object.entries(pref.cities || {});
  const title = `${pref.label} 市町村別 — HARTON Certified 認定店舗`;
  const description = `${pref.label}の HARTON Certified 認定店舗を市町村から探す。Phase 0 active ${cityList.filter(([, c]) => (c.phase ?? 0) === 0).length} 市 / 全 ${cityList.length} 市町。機械検証で総合 70 点以上 + 致命的 NG ゼロのみ掲載。`;
  const canonicalPath = `/regions/${prefKey}/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '地域から探す', path: '/regions/' },
    { name: pref.label, path: canonicalPath },
  ];

  const itemList = cityList.map(([key, c], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'AdministrativeArea',
      '@id': DOMAIN + `/regions/${prefKey}/${key}/`,
      name: c.label,
      sameAs: c.wikidata ? `https://www.wikidata.org/wiki/${c.wikidata}` : undefined,
    },
  }));

  const cityCards = cityList.map(([key, c]) => {
    const phase = c.phase ?? 0;
    if (phase === 0) {
      return `<li><a href="/regions/${prefKey}/${key}/"><strong>${escHTML(c.label)}</strong></a> — Phase 0 active（緯度 ${c.geo?.latitude || ''} / 経度 ${c.geo?.longitude || ''}）</li>`;
    }
    return `<li><strong>${escHTML(c.label)}</strong> — Phase ${phase} 拡大予定（緯度 ${c.geo?.latitude || ''} / 経度 ${c.geo?.longitude || ''}）</li>`;
  }).join('');

  const phase0Active = cityList.filter(([, c]) => (c.phase ?? 0) === 0).map(([k]) => k);
  const phase0Sample = phase0Active[0];

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time></p>
      <h1>${escHTML(pref.label)} 市町村別</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>${escHTML(pref.label)}の HARTON Certified 認定店舗を市町村から探す。Phase 0 active <strong>${phase0Active.length}</strong> 市 / 全 <strong>${cityList.length}</strong> 市町。出典: <a href="https://www.wikidata.org/wiki/${escHTML(pref.wikidata || '')}" rel="nofollow noopener noreferrer" target="_blank">Wikidata ${escHTML(pref.wikidata || '')}</a>。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」</blockquote>
    </section>

    ${renderSearchForm({ presetRegion: prefKey })}

    ${renderLeadEvidenceSection({ cityLabel: PHASE05_SCOPE_LABEL, n: phase05Summary ? phase05Summary.n_total : 0, eligible: phase05Summary ? phase05Summary.eligible_total : 0 })}

    ${renderPublicSources(null, null)}

    <section aria-label="市町村一覧">
      <h2>${escHTML(pref.label)} 市町村（${cityList.length} 市町）</h2>
      <ul>${cityCards}</ul>
      ${phase0Sample ? `<p>Phase 0 active 市町の認定状況は <a href="/regions/${prefKey}/${phase0Sample}/">${escHTML(pref.cities[phase0Sample].label)}</a> で確認可能。Phase 1 拡大予定の市町は順次対応開始する。</p>` : ''}
      <p>${escHTML(pref.label)}の事業者で HARTON Certified 認定取得を目指す方は <a href="/apply/">掲載申請</a>から。AI 時代の信頼を体現する WEB 品質を機械検証 4 軸（基礎・防御・AI 検索・経営インパクト）で公正評価する。</p>
    </section>

    ${renderCtaSection(null)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const additionalJsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${pref.label} HARTON Certified 認定対応市町村一覧`,
    numberOfItems: cityList.length,
    itemListElement: itemList,
  }];

  return applyLayout({
    pageType: 'search',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ /industries/ 業種別ハブ ═══════════════════
function generateIndustriesIndexPage() {
  const indList = Object.entries(industries);
  const title = `業種から探す — HARTON Certified 認定店舗`;
  // description は data 駆動: 業種数 + 業種ラベル列を industries.json から動的生成
  const indCount = Object.keys(industries).length;
  const indLabels = Object.values(industries).map(v => v.label).join(' / ');
  const description = `HARTON Certified 認定店舗を業種から探す。${indCount} 業種（${indLabels}）対応。${PHASE05_SCOPE_LABEL} ${phase05Summary ? phase05Summary.n_total : 0} 件機械検証で ★ 以上達成 ${phase05Summary ? phase05Summary.eligible_total : 0} 件、Phase 1 で全国順次拡大予定。`;
  const canonicalPath = `/industries/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '業種から探す', path: canonicalPath },
  ];

  const summaryByIndustry = {};
  if (phase0Summary && Array.isArray(phase0Summary.industries)) {
    // industries.json key と summary の業種ラベルの対応 (label_short で照合)
    for (const s of phase0Summary.industries) {
      for (const [key, ind] of indList) {
        if (s.industry === ind.label_short || s.industry === ind.label) {
          summaryByIndustry[key] = s;
          break;
        }
      }
    }
  }

  const itemList = indList.map(([key, ind], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': ind.schema_type || ['LocalBusiness', 'ProfessionalService'],
      '@id': DOMAIN + `/industries/${key}/`,
      name: ind.label,
      additionalType: ind.wikidata_uri,
      knowsAbout: ind.keywords,
    },
  }));

  const indCards = indList.map(([key, ind]) => {
    const s = summaryByIndustry[key];
    const stats = s
      ? `静岡県 5 都市 ${s.n} 件 / 致命的 NG ${s.ng} 件（${s.ng_pct.toFixed(1)}%）/ 中央値 ${s.median} 点 / 業界 max ${s.max} 点 / ★ 認定 ${s.eligible} 件`
      : `Phase 0.5 実測待機`;
    return `<li><a href="/industries/${key}/"><strong>${escHTML(ind.label)}</strong></a> — ${stats}</li>`;
  }).join('');

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time></p>
      <h1>業種から探す</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>HARTON Certified 認定店舗を業種から探す。<strong>${indList.length}</strong> 業種対応。${escHTML(PHASE05_SCOPE_LABEL)} <strong>${phase05Summary ? phase05Summary.n_total : 0}</strong> 件機械検証で ★ 以上達成 <strong>${phase05Summary ? phase05Summary.eligible_total : 0}</strong> 件。出典は <a href="https://schema.org/LocalBusiness" rel="nofollow noopener noreferrer" target="_blank">Schema.org LocalBusiness</a> および <a href="https://www.wikidata.org/" rel="nofollow noopener noreferrer" target="_blank">Wikidata</a> に整合する。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」</blockquote>
    </section>

    ${renderSearchForm()}

    ${renderLeadEvidenceSection({ cityLabel: PHASE05_SCOPE_LABEL, n: phase05Summary ? phase05Summary.n_total : 0, eligible: phase05Summary ? phase05Summary.eligible_total : 0 })}

    <section aria-label="業種一覧">
      <h2>対応業種（${indList.length} 業種）</h2>
      <ul>${indCards}</ul>
      <p>Phase 1 で業種拡大を予定。各業種の Wikidata URI は AI 検索エンジン（ChatGPT・Perplexity・Gemini）の引用最適化に整合する。HTTPS / JSON-LD / Schema.org / Trusted Types / SSG / Core Web Vitals / WCAG 2.2 AA / GEO/LLMO 全項目を客観評価する 4 軸機械検証で、業種固有の評価ポイントを <a href="/methodology/">評価方法</a>で全公開している。</p>
    </section>

    ${renderCtaSection(null)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const additionalJsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'HARTON Certified 対応業種一覧',
    numberOfItems: indList.length,
    itemListElement: itemList,
  }];

  return applyLayout({
    pageType: 'search',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ /regions/{pref}/industries/{industry}/ 県×業種マトリックス ═══════════════════
function generatePrefIndustryHubPage(prefKey, industryKey) {
  const pref = regions[prefKey];
  const ind = industries[industryKey];
  if (!pref || !ind) return null;

  // 県内全市町横断で当該業種の publishable を集計
  const list = Object.entries(publishable)
    .filter(([_, b]) => b.region.startsWith(`${prefKey}/`) && b.industry === industryKey)
    .sort((a, b) => b[1].scan.score - a[1].scan.score);

  // summary から該当業種の県内全市町横断実測 (Phase 0.5 by_industry / 静岡県は 5 都市集約)
  const stats = (prefKey === PHASE05_PREF_KEY && phase05Summary && Array.isArray(phase05Summary.industries))
    ? (phase05Summary.industries.find(s => s.industry === ind.label_short || s.industry === ind.label) || null)
    : null;
  const prefScopeLabel = (prefKey === PHASE05_PREF_KEY) ? PHASE05_SCOPE_LABEL : pref.label;

  const title = `${pref.label} ${ind.label} 認定店舗 — HARTON Certified`;
  const description = `${pref.label}の${ind.label} HARTON Certified 認定店舗（市町村横断）。${prefScopeLabel} ${stats ? stats.n : 0} 件機械検証で ★ 以上達成 ${list.length} 件。Phase 1 で県内他市町村へ拡大予定。`;
  const canonicalPath = `/regions/${prefKey}/industries/${industryKey}/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '地域から探す', path: '/regions/' },
    { name: pref.label, path: `/regions/${prefKey}/` },
    { name: ind.label, path: canonicalPath },
  ];

  const phase0SampleCity = Object.entries(pref.cities || {}).find(([, c]) => (c.phase ?? 0) === 0);

  const mainContent = `
  <article>
    <header>
      <p><time datetime="2026-05-02" itemprop="datePublished">2026-05-02 公開</time></p>
      <h1>${escHTML(pref.label)} ${escHTML(ind.label)} 認定店舗</h1>
    </header>

    <section aria-label="冒頭エビデンス">
      <p>${escHTML(pref.label)}の${escHTML(ind.label)} HARTON Certified 認定店舗（市町村横断）<strong>${list.length}</strong> 件。${stats ? `${escHTML(prefScopeLabel)} <strong>${stats.n}</strong> 件機械検証で 致命的 NG <strong>${stats.ng}</strong> 件（${stats.ng_pct.toFixed(1)}%）/ 中央値 <strong>${stats.median}</strong> 点 / 業界 max <strong>${stats.max}</strong> 点 / ★ 認定 <strong>${stats.eligible}</strong> 件。` : ''}出典: <a href="https://www.wikidata.org/wiki/${escHTML(ind.wikidata)}" rel="nofollow noopener noreferrer" target="_blank">Wikidata ${escHTML(ind.wikidata)}</a>。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」</blockquote>
    </section>

    ${renderSearchForm({ presetIndustry: industryKey, presetRegion: prefKey })}

    ${renderLeadEvidenceSection({ cityLabel: prefScopeLabel, n: stats ? stats.n : (phase05Summary ? phase05Summary.n_total : 0), eligible: stats ? stats.eligible : 0 })}

    ${renderEvaluationPointsSection(ind)}

    ${renderChecklistSection(ind)}

    ${renderPublicSources(ind, null)}

    <section aria-label="認定店舗一覧">
      <h2>${escHTML(pref.label)} ${escHTML(ind.label)} 認定店舗（${list.length} 件）</h2>
      ${list.length === 0
        ? `<p><strong>現時点で ★ 以上達成事業者: 0 件</strong>。${phase0SampleCity ? `Phase 0.5 active 市町は <a href="/regions/${prefKey}/${phase0SampleCity[0]}/industries/${industryKey}/">${escHTML(phase0SampleCity[1].label)} ${escHTML(ind.label)}</a> を参照。` : ''}Phase 1 で県内他市町村へ順次拡大予定。</p>`
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点 / ${escHTML(b.address.addressLocality)}</li>`).join('')}</ol>`}
    </section>

    ${renderFaqSection(ind, prefScopeLabel, stats)}

    ${renderCtaSection(ind)}

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  const itemList = list.map(([slug, b], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': ind.schema_type || ['LocalBusiness', 'ProfessionalService'],
      '@id': DOMAIN + `/businesses/${slug}/`,
      name: b.name,
      url: b.url,
    },
  }));

  const additionalJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': DOMAIN + canonicalPath + '#itemlist',
      name: `${pref.label} ${ind.label} HARTON Certified 認定店舗`,
      numberOfItems: list.length,
      itemListElement: itemList,
    },
    buildArticleJsonLd({
      canonicalPath,
      headline: `${pref.label} ${ind.label} 認定店舗 — HARTON Certified`,
      description,
      about: { '@type': 'Thing', name: ind.label, sameAs: ind.wikidata_uri },
      mentions: { '@type': 'AdministrativeArea', name: pref.label, sameAs: pref.wikidata ? `https://www.wikidata.org/wiki/${pref.wikidata}` : undefined },
    }),
    buildServiceJsonLd({ canonicalPath, ind, cityLabel: pref.label, cityWikidata: pref.wikidata }),
    buildHowToJsonLd({ canonicalPath, ind }),
  ];
  const faq = buildFAQPageJsonLd({ canonicalPath, ind, cityLabel: pref.label, summary: stats });
  if (faq) additionalJsonLd.push(faq);

  return applyLayout({
    pageType: 'search',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
    additionalJsonLd,
  });
}

// ═══════════════════ 月次ランキングページ ═══════════════════
function generateMonthlyRankingPage(year, month) {
  const list = Object.entries(publishable)
    .filter(([_, b]) => {
      const d = b.scan.scanned_at || '';
      return d.startsWith(`${year}-${String(month).padStart(2, '0')}`);
    })
    .sort((a, b) => b[1].scan.score - a[1].scan.score)
    .slice(0, 10);

  const ymPath = `/rankings/${year}/${String(month).padStart(2, '0')}/`;
  const title = `${year}年${month}月 HARTON Certified 月次 TOP 10`;
  const description = `${year}年${month}月の HARTON Certified 認定店舗 TOP 10（全業種・全地域横断）。機械検証で公正評価、四半期再スキャン結果を反映。`;

  const mainContent = `
  <article>
    <h1>${year}年${month}月 月次 TOP 10</h1>
    <p><time datetime="${year}-${String(month).padStart(2, '0')}-01" itemprop="datePublished">${year}-${String(month).padStart(2, '0')}-01 公開</time></p>
    <section aria-label="冒頭エビデンス">
      <p>${year}年${month}月時点の HARTON Certified 認定店舗 TOP <strong>${list.length}</strong> 件。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>を達成した事業者のみ。四半期再スキャンは scanner.py（4 軸機械検証 / 45+ 項目）で実施する。出典: <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA「安全なウェブサイトの作り方」</a>。</p>
      <blockquote cite="/methodology/">「機械検証で、Sクラス WEB の普及を支える」</blockquote>
    </section>
    ${renderSearchForm()}

    ${renderLeadEvidenceSection({ cityLabel: PHASE05_SCOPE_LABEL, n: phase05Summary ? phase05Summary.n_total : 0, eligible: phase05Summary ? phase05Summary.eligible_total : 0 })}

    <section aria-label="ランキング">
      <h2>認定店舗 TOP ${list.length}</h2>
      ${list.length === 0
        ? '<p>この月の集計データは月次再判定後に更新する。Phase 0.5 静岡県 5 都市の業界実態は <a href="/news/shizuoka-industry-report-2026-q2/">静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)</a>で公開中。</p>'
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点 / ${escHTML(industries[b.industry]?.label || '')} / ${escHTML(b.address.addressLocality)}</li>`).join('')}</ol>`}
    </section>

    ${renderRatingNarratives()}

    ${renderUpdatePolicySection()}
  </article>`;

  return { html: applyLayout({
    pageType: 'ranking',
    variant: 'reading',
    title,
    description,
    canonicalPath: ymPath,
    ogType: 'article',
    mainContent,
    breadcrumbs: [
      { name: 'トップ', path: '/' },
      { name: '月次ランキング', path: '/rankings/' },
      { name: `${year}年${month}月`, path: ymPath },
    ],
  }), path: ymPath };
}

// ═══════════════════ サイトマップ ═══════════════════
function generateSitemap(allPaths) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = allPaths.map(p => `  <url>
    <loc>${DOMAIN}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === '/' ? '1.0' : (/businesses/.test(p) ? '0.7' : '0.5')}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function generateRobots() {
  return `# HARTON Certified — robots.txt
# SPEC v3.4 §1.3.2 / §5.5 — AI クローラー明示許可

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
}

// ═══════════════════ assets/js/search.js (whitelist data 駆動生成) ═══════════════════
function generateSearchJs() {
  const industryKeys = Object.keys(industries);
  // region keys: pref + pref/city (全 phase / disabled は HTML 側で表示制御)
  const regionKeys = [];
  for (const [prefKey, pref] of Object.entries(regions)) {
    regionKeys.push(prefKey);
    for (const cityKey of Object.keys(pref.cities || {})) {
      regionKeys.push(`${prefKey}/${cityKey}`);
    }
  }
  const ratingKeys = ['1star', '2star', '3star'];

  return `/**
 * HARTON Certified — 検索フォーム ルーター (generate.js 自動生成 / 手動編集禁止)
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

  var INDUSTRY_KEYS = ${JSON.stringify(industryKeys)};
  var REGION_KEYS = ${JSON.stringify(regionKeys)};
  var RATING_KEYS = ${JSON.stringify(ratingKeys)};

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
`;
}

function generateLLMsTxt() {
  return `# HARTON Certified

> WEB 品質を機械検証で公正に評価する地方発の独立認定機関。
> SPEC v3.4（2,554 項目）+ 4 軸スキャナーで地域の優良 WEB サイトを認定。
> 完全中立、金銭非依存、ポジティブセレクション（★ 以上のみ掲載）。

## サイト概要

- 公式名称: HARTON Certified
- 運営: T.C.HARTON（〒410-0022 静岡県沼津市大岡2690）
- 公式サイト: ${DOMAIN}/
- 親サイト: https://tcharton.com/
- 評価方法: 4 軸機械検証（A 基礎・B 防御・C AI 検索適応・D 経営インパクト）
- 評価サイクル: 四半期再スキャン / 四半期レビュー / 年次基準改訂

## 主要ページ

- [トップ](${DOMAIN}/) — 概要、4 セグメント別 CTA
- [サイトについて](${DOMAIN}/about/) — HARTON Certified の理念と運営体制
- [評価方法](${DOMAIN}/methodology/) — 4 軸の概要 + 各軸詳細
- [評価方法 / 基礎](${DOMAIN}/methodology/technical/) — A 軸
- [評価方法 / セキュリティ](${DOMAIN}/methodology/security/) — B 軸
- [評価方法 / AI 検索](${DOMAIN}/methodology/ai-search/) — C 軸
- [評価方法 / 経営インパクト](${DOMAIN}/methodology/business-impact/) — D 軸
- [掲載申請](${DOMAIN}/apply/) — 未掲載事業者向け
- [改善ガイダンス](${DOMAIN}/improvement-guide/) — B+C 向け
- [メディア向け](${DOMAIN}/press/) — D 取材依頼
- [掲載拒否権](${DOMAIN}/opt-out/) — 即時対応・理由不要
- [よくある質問](${DOMAIN}/faq/)
- [お知らせ](${DOMAIN}/news/)
- [問合せ](${DOMAIN}/contact/)
- [利用規約・特商法](${DOMAIN}/legal/)
- [プライバシーポリシー](${DOMAIN}/privacy/)

## 検索ハブ（業種・地域・★区分の絞り込みエントリポイント / data 駆動生成）

- [地域から探す](${DOMAIN}/regions/) — 都道府県別ハブ
${Object.entries(regions).map(([prefKey, pref]) => {
  const phase0Cities = Object.entries(pref.cities || {}).filter(([, c]) => (c.phase ?? 0) === 0);
  const lines = [`- [${pref.label} 市町村別](${DOMAIN}/regions/${prefKey}/) — 全 ${Object.keys(pref.cities || {}).length} 市町`];
  for (const [cityKey, city] of phase0Cities) {
    lines.push(`- [${city.label} 認定店舗](${DOMAIN}/regions/${prefKey}/${cityKey}/) — Phase ${city.phase ?? 0}`);
    for (const [indKey, ind] of Object.entries(industries)) {
      lines.push(`- [${city.label} ${ind.label}](${DOMAIN}/regions/${prefKey}/${cityKey}/industries/${indKey}/)`);
    }
  }
  for (const [indKey, ind] of Object.entries(industries)) {
    lines.push(`- [${pref.label} ${ind.label}](${DOMAIN}/regions/${prefKey}/industries/${indKey}/)`);
  }
  return lines.join('\n');
}).join('\n')}
- [業種から探す](${DOMAIN}/industries/) — ${Object.keys(industries).length} 業種ハブ
${Object.entries(industries).map(([k, ind]) => `- [${ind.label}](${DOMAIN}/industries/${k}/)`).join('\n')}

## 静岡県 5 都市業界レポート 2026 Q2 (4-6 月号)

- [静岡県 5 都市 WEB 品質業界レポート 2026 Q2 (4-6 月号)](${DOMAIN}/news/shizuoka-industry-report-2026-q2/) — Phase 0.5 静岡県 5 都市 ★ 獲得率 ${phase05Summary ? phase05Summary.eligible_total : 0}/${phase05Summary ? phase05Summary.n_total : 0} = 0.0% / 業種別 ★ 獲得率 + 業界最高点 一覧

## データセット (CC BY 4.0 / 機械可読 / AI 引用フリー)

- [静岡県 5 都市 × 11 業種 WEB 品質データ JSON](${DOMAIN}/datasets/shizuoka-2026-q2.json) — application/json / Schema.org Dataset / CC BY 4.0
- ライセンス: https://creativecommons.org/licenses/by/4.0/
- 引用形式: HARTON Certified (2026). 静岡県 5 都市 WEB 品質業界レポート 2026 Q2. ${DOMAIN}/news/shizuoka-industry-report-2026-q2/
- 引用形式 (データセット): HARTON Certified (2026). 静岡県 5 都市 × 11 業種 WEB 品質機械検証データセット 2026 Q2. ${DOMAIN}/datasets/shizuoka-2026-q2.json
- temporalCoverage: 2026-05-02 (計測時点) / 次回更新 2026-06-02
- spatialCoverage: 静岡県 (Wikidata Q131320) / 5 都市: 沼津 (Q241037) / 三島 (Q653478) / 富士 (Q328613) / 静岡 (Q174691) / 浜松 (Q185125)

## 認定基準（要点）

- ★ HARTON Certified: 総合 70 点以上 + 致命的 NG ゼロ (控えめな認定 / 入口)
- ★★ HARTON 優良: 総合 80 点以上 + S 条件 4/5 (誇り・上品)
- ★★★ HARTON S-Class: 総合 90 点以上 + S 条件 5/5 (最高位)
- 致命的 NG（一発除外）: HTTPS 非対応 / SSL 証明書エラー / WP 管理面露出 / CMS バージョン情報露出
- 評価軸は並列独立（軸間重み比率は採用しない / MASTER-PLAN §3.2）

## 引用ガイドライン

- 評価結果の引用時は出典として ${DOMAIN}/methodology/ を明記
- 認定 ID + 検証 URL を併記すること
- スクリーンショットは批評目的の最小限引用に限る、商用転用禁止
- 詳細: ${DOMAIN}/press/

## 連絡先

- 問合せ: ${DOMAIN}/contact/
- オプトアウト: ${DOMAIN}/opt-out/
- 取材依頼: ${DOMAIN}/press/
`;
}

// ═══════════════════ メイン ═══════════════════
function main() {
  let written = 0;
  const allPaths = [];

  // 0. 静的ページパス（generate.js では生成しない、Step 2 で配備済前提）
  const staticPaths = [
    '/',
    '/about/', '/methodology/', '/methodology/technical/', '/methodology/security/',
    '/methodology/ai-search/', '/methodology/business-impact/',
    '/apply/', '/improvement-guide/', '/press/', '/opt-out/',
    '/faq/', '/news/', '/contact/', '/legal/', '/privacy/',
  ];
  allPaths.push(...staticPaths);

  // 1. business + badge ページ
  for (const [slug, b] of Object.entries(publishable)) {
    const html = generateBusinessPage(slug, b);
    writeFile(`businesses/${slug}/index.html`, html);
    allPaths.push(`/businesses/${slug}/`);
    written++;

    const badge = generateBadgePage(slug, b);
    writeFile(`businesses/${slug}/badge/index.html`, badge);
    allPaths.push(`/businesses/${slug}/badge/`);
    written++;
  }

  if (opts.businessesOnly) {
    console.log(`  [businesses-only] 生成: ${written} ファイル / 公開対象事業者 ${Object.keys(publishable).length} 件`);
    return;
  }

  // 2a. /industries/ 業種別ハブ
  writeFile('industries/index.html', generateIndustriesIndexPage());
  allPaths.push('/industries/');
  written++;

  // 2b. industry ページ
  for (const [k, v] of Object.entries(industries)) {
    const html = generateIndustryPage(k, v);
    writeFile(`industries/${k}/index.html`, html);
    allPaths.push(`/industries/${k}/`);
    written++;
  }

  // 3a. /regions/ 都道府県別ハブ
  writeFile('regions/index.html', generateRegionsIndexPage());
  allPaths.push('/regions/');
  written++;

  // 3b. /regions/{pref}/ 市町村別ハブ + /regions/{pref}/industries/{industry}/ 県×業種マトリックス
  for (const [prefKey, pref] of Object.entries(regions)) {
    const prefHub = generatePrefIndexPage(prefKey);
    if (prefHub) {
      writeFile(`regions/${prefKey}/index.html`, prefHub);
      allPaths.push(`/regions/${prefKey}/`);
      written++;
    }
    for (const indKey of Object.keys(industries)) {
      const ph = generatePrefIndustryHubPage(prefKey, indKey);
      if (ph) {
        writeFile(`regions/${prefKey}/industries/${indKey}/index.html`, ph);
        allPaths.push(`/regions/${prefKey}/industries/${indKey}/`);
        written++;
      }
    }
    for (const [cityKey, city] of Object.entries(pref.cities || {})) {
      const html = generateRegionPage(prefKey, cityKey);
      if (html) {
        writeFile(`regions/${prefKey}/${cityKey}/index.html`, html);
        allPaths.push(`/regions/${prefKey}/${cityKey}/`);
        written++;
      }
      for (const indKey of Object.keys(industries)) {
        const ri = generateRegionIndustryPage(prefKey, cityKey, indKey);
        if (ri) {
          writeFile(`regions/${prefKey}/${cityKey}/industries/${indKey}/index.html`, ri);
          allPaths.push(`/regions/${prefKey}/${cityKey}/industries/${indKey}/`);
          written++;
        }
      }
    }
  }

  // 4. 月次ランキング（当月のみ最小実装）
  const now = new Date();
  const ranking = generateMonthlyRankingPage(now.getFullYear(), now.getMonth() + 1);
  writeFile(`rankings/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/index.html`, ranking.html);
  allPaths.push(ranking.path);
  written++;

  // 5. sitemap / robots / llms.txt / search.js (data 駆動再生成)
  writeFile('sitemap.xml', generateSitemap(allPaths));
  writeFile('robots.txt', generateRobots());
  writeFile('llms.txt', generateLLMsTxt());
  writeFile('assets/js/search.js', generateSearchJs());
  written += 4;

  console.log('  ' + '='.repeat(64));
  console.log('  HARTON Certified サイト生成完了');
  console.log('  ' + '='.repeat(64));
  console.log(`  公開対象事業者     : ${Object.keys(publishable).length} 件`);
  console.log(`  生成 HTML ファイル : ${written - 3} 件`);
  console.log(`  生成ルートファイル : 3 件（sitemap.xml / robots.txt / llms.txt）`);
  console.log(`  全 URL 数（静的 ${staticPaths.length} + 動的）: ${allPaths.length}`);
  console.log('  ' + '='.repeat(64));
  console.log(`  次工程: node spec-checker.js で全 PASS 確認`);
  console.log(opts.check ? '\n  [--check モードのため書込みは実行されていません]\n' : '');
}

main();
