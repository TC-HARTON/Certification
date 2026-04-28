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
 *   - critical_ng > 0 または rating が ★3 未満の事業者は除外
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

// _schema 等のメタキーを除外
const businesses = Object.fromEntries(
  Object.entries(businessesRaw).filter(([k, v]) =>
    !k.startsWith('_') && v && typeof v === 'object' && v.scan && !v.opt_out
  )
);

// 掲載基準: ★3 以上 + 致命的 NG ゼロ（MASTER-PLAN §3.4）
function isPublishable(b) {
  if (!b.scan) return false;
  if (b.scan.critical_ng !== 0) return false;
  const r = b.scan.rating || '';
  return r === '★★★' || r === '★★★★' || r === '★★★★★';
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

  const additionalType = [ind.wikidata_uri].filter(Boolean);

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
      <p>本認定は ${escHTML(b.scan.scanned_at)} 時点の評価であり、月次再スキャンで変動する可能性がある（MASTER-PLAN §3.5）。</p>
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

  const title = `${ind.label} 全国 TOP 10 — HARTON Certified 認定店舗`;
  const description = `HARTON Certified が機械検証で公正評価した、全国の${ind.label}優良サイト TOP 10。総合スコア順に掲載中（${list.length}件）。評価方法は全公開、金銭非依存、ポジティブセレクション。`;
  const canonicalPath = `/industries/${industryKey}/`;

  const breadcrumbs = [
    { name: 'トップ', path: '/' },
    { name: '業種別検索', path: '/industries/' },
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
    <h1>${escHTML(ind.label)} 全国 TOP 10</h1>
    <section aria-label="冒頭エビデンス">
      <p>HARTON Certified が機械検証で公正評価した、${escHTML(ind.label)} の優良サイト TOP <strong>${list.length}</strong> 件。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>を達成した事業者のみ掲載する（MASTER-PLAN §3.4）。出典は <a href="https://schema.org/${escHTML(ind.schema_type?.[0] || 'LocalBusiness')}" rel="nofollow noopener noreferrer" target="_blank">Schema.org ${escHTML(ind.schema_type?.[0] || 'LocalBusiness')}</a> および <a href="https://www.wikidata.org/wiki/${escHTML(ind.wikidata)}" rel="nofollow noopener noreferrer" target="_blank">Wikidata ${escHTML(ind.wikidata)}</a> に整合する。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る、地方発の認定機関」</blockquote>
    </section>

    <section aria-label="ランキング">
      <h2>認定店舗一覧（${list.length}件）</h2>
      ${list.length === 0
        ? '<p>このカテゴリの認定店舗は現在準備中。</p>'
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点 / ${escHTML(b.address.addressLocality)}</li>`).join('')}</ol>`}
    </section>
  </article>`;

  const additionalJsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${ind.label} 全国 TOP 10 — HARTON Certified`,
    numberOfItems: list.length,
    itemListElement: itemList,
  }];

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

  const mainContent = `
  <article>
    <h1>${escHTML(city.label)} 認定店舗一覧</h1>
    <section aria-label="冒頭エビデンス">
      <p>${escHTML(city.label)}（${escHTML(pref.label)}）の HARTON Certified 認定店舗 <strong>${list.length}</strong> 件を業種横断で掲載する。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>を達成した事業者のみ。Phase ${city.phase || 0} 対象地域。緯度 ${city.geo?.latitude || ''} / 経度 ${city.geo?.longitude || ''}。</p>
      <blockquote cite="/methodology/">「機械検証で、Sクラス WEB の普及を支える」 — HARTON Certified ブランドナラティブ</blockquote>
    </section>

    <section aria-label="業種別">
      <h2>業種別検索</h2>
      <ul>${industryLinks || '<li>準備中</li>'}</ul>
    </section>

    <section aria-label="認定店舗一覧">
      <h2>全認定店舗（${list.length}件）</h2>
      ${list.length === 0
        ? '<p>この地域の認定店舗は現在準備中。</p>'
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(industries[b.industry]?.label || b.industry)} / ${escHTML(b.scan.rating)} / ${b.scan.score}点</li>`).join('')}</ol>`}
    </section>
  </article>`;

  return applyLayout({
    pageType: 'region',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs,
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

  const title = `${city.label} ${ind.label} TOP 10 — HARTON Certified`;
  const description = `${city.label}（${pref.label}）の${ind.label} HARTON Certified 認定店舗 TOP ${list.length} 件。機械検証で公正評価、総合 70 点以上のみ掲載。`;
  const canonicalPath = `/regions/${prefKey}/${cityKey}/industries/${industryKey}/`;

  const mainContent = `
  <article>
    <h1>${escHTML(city.label)} ${escHTML(ind.label)} TOP 10</h1>
    <section aria-label="冒頭エビデンス">
      <p>${escHTML(city.label)} の${escHTML(ind.label)} 認定店舗 <strong>${list.length}</strong> 件。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>達成。出典: <a href="https://www.wikidata.org/wiki/${escHTML(ind.wikidata)}" rel="nofollow noopener noreferrer" target="_blank">Wikidata ${escHTML(ind.wikidata)}</a>。</p>
      <blockquote cite="/methodology/">「機械検証で WEB 品質を公正に測る」 — HARTON Certified</blockquote>
    </section>
    <section aria-label="認定店舗一覧">
      <h2>認定店舗（${list.length}件）</h2>
      ${list.length === 0
        ? '<p>このカテゴリの認定店舗は現在準備中。</p>'
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点</li>`).join('')}</ol>`}
    </section>
  </article>`;

  return applyLayout({
    pageType: 'region-industry',
    variant: 'reading',
    title,
    description,
    canonicalPath,
    mainContent,
    breadcrumbs: [
      { name: 'トップ', path: '/' },
      { name: pref.label, path: `/regions/${prefKey}/` },
      { name: city.label, path: `/regions/${prefKey}/${cityKey}/` },
      { name: ind.label, path: canonicalPath },
    ],
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
  const description = `${year}年${month}月の HARTON Certified 認定店舗 TOP 10（全業種・全地域横断）。機械検証で公正評価、月次再スキャン結果を反映。`;

  const mainContent = `
  <article>
    <h1>${year}年${month}月 月次 TOP 10</h1>
    <p><time datetime="${year}-${String(month).padStart(2, '0')}-01" itemprop="datePublished">${year}-${String(month).padStart(2, '0')}-01 公開</time></p>
    <section aria-label="冒頭エビデンス">
      <p>${year}年${month}月時点の HARTON Certified 認定店舗 TOP <strong>${list.length}</strong> 件。総合 <strong>70 点</strong>以上 + 致命的 NG <strong>0 件</strong>を達成した事業者のみ。月次再スキャンは scanner.py（4 軸機械検証 / 45+ 項目）で実施する。出典: <a href="https://www.ipa.go.jp/security/vuln/websecurity/about.html" rel="nofollow noopener noreferrer" target="_blank">IPA「安全なウェブサイトの作り方」</a>。</p>
      <blockquote cite="/methodology/">「機械検証で、Sクラス WEB の普及を支える」</blockquote>
    </section>
    <section aria-label="ランキング">
      <h2>認定店舗 TOP ${list.length}</h2>
      ${list.length === 0
        ? '<p>この月の集計データは現在準備中。</p>'
        : `<ol>${list.map(([slug, b]) => `<li><a href="/businesses/${slug}/">${escHTML(b.name)}</a> — ${escHTML(b.scan.rating)} / ${b.scan.score}点 / ${escHTML(industries[b.industry]?.label || '')} / ${escHTML(b.address.addressLocality)}</li>`).join('')}</ol>`}
    </section>
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

function generateLLMsTxt() {
  return `# HARTON Certified

> WEB 品質を機械検証で公正に評価する地方発の独立認定機関。
> SPEC v3.4（2,554 項目）+ 4 軸スキャナーで地域の優良 WEB サイトを認定。
> 完全中立、金銭非依存、ポジティブセレクション（★3 以上のみ掲載）。

## サイト概要

- 公式名称: HARTON Certified
- 運営: T.C.HARTON（〒410-0022 静岡県沼津市大岡2690）
- 公式サイト: ${DOMAIN}/
- 親サイト: https://tcharton.com/
- 評価方法: 4 軸機械検証（A 基礎・B 防御・C AI 検索適応・D 経営インパクト）
- 評価サイクル: 月次再スキャン / 四半期レビュー / 年次基準改訂

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

## 認定基準（要点）

- ★★★ HARTON Certified: 総合 70 点以上 + 致命的 NG ゼロ
- ★★★★ HARTON 優良: 総合 80 点以上 + S 条件 4/5
- ★★★★★ HARTON S-Class: 総合 90 点以上 + S 条件 5/5
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

  // 2. industry ページ
  for (const [k, v] of Object.entries(industries)) {
    const html = generateIndustryPage(k, v);
    writeFile(`industries/${k}/index.html`, html);
    allPaths.push(`/industries/${k}/`);
    written++;
  }

  // 3. region ページ + region × industry ページ
  for (const [prefKey, pref] of Object.entries(regions)) {
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

  // 5. sitemap / robots / llms.txt
  writeFile('sitemap.xml', generateSitemap(allPaths));
  writeFile('robots.txt', generateRobots());
  writeFile('llms.txt', generateLLMsTxt());
  written += 3;

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
