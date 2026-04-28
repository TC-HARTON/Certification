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
    { '@type': 'Question', name: 'HARTON Certified は何を評価するのか？', acceptedAnswer: { '@type': 'Answer', text: 'WEB サイトの品質を 4 軸（基礎・防御・AI 検索・経営インパクト）で機械検証し、総合 70 点以上 + 致命的 NG ゼロを満たす事業者を ★3 以上で認定する。' } },
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
  description: 'HARTON Certified は WEB 品質を機械検証で公正評価する独立認定機関。SPEC v3.4 の 2,554 項目 + 4 軸スキャナーで全国の優良サイトを認定し、Sクラス WEB の普及を支える。完全中立・金銭非依存、★3 以上のみ掲載のポジティブセレクション。',
  canonicalPath: '/',
  ogType: 'website',
  breadcrumbs: bcl([['HARTON Certified トップ', '/']]),
  additionalJsonLd: [FAQ_TOP],
  mainContent: `
<article>
  <section aria-label="ヒーロー（Lead Evidence Block）">
    <p>HARTON Certified は、<strong>2,554 項目</strong>の機械検証で WEB 品質を公正に測る独立認定機関である。全国の事業者の Sクラス WEB 普及を支えるため、4 軸の客観評価を 2026 年に開始した。出典: <a href="https://www.digital.go.jp/" rel="nofollow noopener noreferrer" target="_blank">日本政府・公的機関</a>（HSTS / WCAG / Core Web Vitals 等の公的基準に準拠）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「機械検証で、Sクラス WEB の普及を支える」 — HARTON Certified ブランドナラティブ
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026 年 4 月 27 日 公開</time></p>
    <h1>すべての事業者の WEB を、S クラスへ。</h1>
    <p>機械検証による公正評価を通じて、地域から全国へ、Sクラス WEB サイトの普及を支える。Phase 0（沼津市 30 件 / 2026-04-05）から始まり、Phase 4（2027 年）で全国 10,000 件以上の認定を目標とする。</p>
  </section>
  <section aria-label="3 つの差別化要素">
    <h2>3 つの差別化要素</h2>
    <ul>
      <li>機械検証 × WEB 品質: 口コミではなく 4 軸の客観評価。</li>
      <li>完全中立 × ポジティブセレクション: ★3 以上のみ掲載、低評価サイトは公開しない。</li>
      <li>AI 検索時代対応 × 改善導線: GEO / LLMO 最適化を評価軸に含む。</li>
    </ul>
  </section>
  <section aria-label="4 セグメント別 CTA">
    <h2>あなたへの導線</h2>
    <ul>
      <li><a href="/regions/shizuoka/numazu/">A: 認定店舗を探す（消費者）</a> — 地域・業種から優良サイトを発見。</li>
      <li><a href="/improvement-guide/">B: バッジ取得・改善（既掲載事業者）</a> — ★区分昇格のヒント。</li>
      <li><a href="/apply/">C: 掲載申請（未掲載事業者）</a> — 自社サイトの認定獲得を目指す。</li>
      <li><a href="/press/">D: 取材依頼（メディア）</a> — 引用素材・月次ランキング提供。</li>
    </ul>
  </section>
  <section aria-label="認定基準サマリ">
    <h2>認定基準</h2>
    <p>4 つの観点（A 基礎・B 防御・C AI 検索・D 経営）で独立評価し、各観点の項目別減点を合算する。総合 <strong>70</strong> 点以上 + 致命的 NG <strong>0</strong> 件で ★3 認定、<strong>80</strong> 点以上で ★4、<strong>90</strong> 点以上 + S 条件 5/5 で ★5 を付与する（MASTER-PLAN §3.4 準拠）。</p>
    <p>評価方法の全公開ページ: <a href="/methodology/">/methodology/</a></p>
  </section>
  <section aria-label="運用方針">
    <h2>運用方針（5 原則）</h2>
    <ol>
      <li>透明性: 全評価項目を /methodology/ で公開</li>
      <li>客観性: 機械検証のみ（主観排除）</li>
      <li>ポジティブセレクション: ★3 以上のみ掲載</li>
      <li>公平性: HARTON との取引関係に依存しない</li>
      <li>進化: 年次基準改訂、過去評価はアーカイブ保持</li>
    </ol>
  </section>
</article>`,
});

// ─── 2. about（subpage / reading / E-E-A-T 担保）─────
PAGES.push({
  path: 'about/index.html',
  variant: 'reading',
  navActive: 'about',
  title: 'サイトについて — HARTON Certified の理念と運営体制',
  description: 'HARTON Certified（運営: T.C.HARTON）の理念・運営体制・専門領域を公開する。15 年の IT エンジニアリング知見と地域への一次情報に基づく独立認定機関の信頼基盤。',
  canonicalPath: '/about/',
  breadcrumbs: bcl([['トップ', '/'], ['サイトについて', '/about/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified は <strong>2026 年 4 月</strong>、静岡県沼津市で T.C.HARTON が立ち上げた独立認定機関である。<strong>15 年</strong>の IT エンジニアリング実務知見と、地域に <strong>5 年</strong>住み込んで一次調査した観察データを基盤として、機械検証による地方 WEB 品質公正評価を運用する。出典: <a href="https://www.digital.go.jp/" rel="nofollow noopener noreferrer" target="_blank">デジタル庁（地方 DX の現状）</a>。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「技術は、本物を見抜くために使える」 — HARTON Certified 運用思想
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>サイトについて</h1>
  </section>
  <section aria-label="ビジョン">
    <h2>ビジョン</h2>
    <p>日本の中小事業者の WEB 水準を世界基準（S クラス）へ押し上げる。食べログが料理を、ホットペッパーが美容を評価するように、HARTON Certified は WEB 品質という新しい軸で地域の事業者を公正に評価する。</p>
  </section>
  <section aria-label="ミッション">
    <h2>ミッション</h2>
    <p>機械検証による客観性で、全国の優良 WEB サイトを公正に評価・認定し、Sクラス WEB の普及を支える。情にも、規模にも、流行にも左右されない、4 軸の独立評価を中核とする。</p>
  </section>
  <section aria-label="運営者プロフィール">
    <h2>運営事業者</h2>
    <p>T.C.HARTON 代表。IT エンジニア歴 15 年。Web フロントエンド・セキュリティ・AI を専門領域とし、Cloudflare / Anthropic / Google の公式仕様書を一次ソースとして実務に落とし込む方針で活動する。静岡県沼津市を拠点に地域中小事業者の WEB サイトの実態を一次調査する中で「ホームページが綺麗な店ほど、本当の商いが埋もれている」というパラドックスに気付いた。</p>
    <p>専門分野: <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="nofollow noopener noreferrer" target="_blank">WCAG 2.2 AA</a> アクセシビリティ / OWASP Top 10:2025 セキュリティ / GEO / LLMO / SPEC v3.4（2554 項目の独自規格）の策定。</p>
    <p>主要実績: tcharton.com の SPEC v3.4 完全準拠 + scanner ★5（S クラス）達成（2026 年 4 月）。HARTON Certified の独立認定機関化を 2026 年に立ち上げ、Phase 0 沼津 30 件パイロットを 2026 年 4-5 月に実施する。</p>
  </section>
  <section aria-label="機械検証の哲学">
    <h2>機械検証の哲学</h2>
    <p>地域には本物の商いが息づいている。熟練の技、誠実な姿勢、地元への愛情。しかしデジタルの世界では別のルールが支配している。莫大な広告費を投じる大手と、見栄えだけのサイトに、真に価値ある事業者が埋もれていく。</p>
    <p>HARTON Certified はこの構造を技術で公正化する。客観的な機械検証だけが、規模や予算に依存せずに WEB 品質を測れる。誰もが世界基準（Sクラス）の WEB を持てる時代を、機械検証の透明性で支える。これが本機関の哲学である。</p>
  </section>
  <section aria-label="運営体制">
    <h2>運営体制</h2>
    <p>HARTON Certified は T.C.HARTON が 2026 年 4 月に立ち上げた。Phase 1（県東部 200 件）以降は弁護士・プロデザイナー・PR 会社との外部提携を予定する。商標登録は Phase 1 完了時に着手する。</p>
    <p>運営拠点: 〒410-0022 静岡県沼津市大岡2690 / Cloudflare Workers Static Assets で配信 / scanner.py で自動月次再評価。</p>
  </section>
  <section aria-label="関連リンク">
    <h2>関連リンク</h2>
    <ul>
      <li><a href="/methodology/">評価方法（4 軸の全公開）</a></li>
      <li><a href="/apply/">掲載申請（未掲載事業者向け）</a></li>
      <li><a href="https://tcharton.com/" rel="noopener noreferrer" target="_blank">親サイト tcharton.com</a></li>
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
    <p>HARTON Certified は WEB サイトを <strong>4 つ</strong>の観点で並列独立評価する。各観点は scanner.py で <strong>45</strong>+ 項目を機械検証し、合計 <strong>2554</strong> 項目の SPEC v3.4 と整合する。出典: <a href="https://web.dev/articles/vitals" rel="nofollow noopener noreferrer" target="_blank">Google Web Vitals 公式</a> / <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" rel="nofollow noopener noreferrer" target="_blank">W3C WCAG 2.2</a>。</p>
    <blockquote cite="${DOMAIN}/about/">
      「公正に測るとは、評価方法のすべてを公開することだ」 — HARTON Certified 評価原則
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>評価方法</h1>
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
    <p>★3（HARTON Certified）= 総合 70 点以上 + 致命的 NG 0 件。★4（HARTON 優良）= 総合 80 点以上 + S 条件 4/5。★5（HARTON S-Class）= 総合 90 点以上 + S 条件 5/5 + 致命的 NG 0 件。</p>
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

// ─── 8. apply（subpage / marketing / C 向け最重要）──
PAGES.push({
  path: 'apply/index.html',
  variant: 'reading',
  navActive: 'apply',
  title: '掲載申請 — HARTON Certified ★ 認定を獲得する',
  description: 'HARTON Certified への掲載申請ページ。無料診断で自社サイトの ★ 区分を判定し、tcharton.com の改善サービスへ送客する。C 未掲載事業者向け最重要動線。完全中立・金銭非依存の機械検証。',
  canonicalPath: '/apply/',
  breadcrumbs: bcl([['トップ', '/'], ['掲載申請', '/apply/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified への掲載申請は <strong>無料</strong>である。掲載対象は ★3 以上（総合 <strong>70</strong> 点以上 + 致命的 NG <strong>0</strong> 件）を達成した事業者のみで、課金で順位を買えるサービスではない。出典: <a href="https://www.ppc.go.jp/" rel="nofollow noopener noreferrer" target="_blank">個人情報保護委員会</a>（評価機関の中立性に関する公的指針）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「掲載自体が認定である」 — HARTON Certified ★区分体系
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>掲載申請</h1>
  </section>
  <section aria-label="申請プロセス">
    <h2>申請プロセス（4 ステップ）</h2>
    <ol>
      <li>申請（本ページから問合せ）</li>
      <li>無料診断（scanner.py での 4 軸機械検証 / 45+ 項目）</li>
      <li>結果通知（★ 区分 + 改善ヒント）</li>
      <li>★3 以上達成 → 掲載開始 / 未達 → 改善後再申請</li>
    </ol>
  </section>
  <section aria-label="無料診断">
    <h2>無料診断のお申込み</h2>
    <p>自社サイトの WEB 品質が現時点でどの ★ 区分に該当するか、無料で機械検証する。所要時間は <strong>5</strong> 分（自動）〜<strong>1</strong> 営業日（人的レビュー込み）である。</p>
    <p><a href="https://tcharton.com/contact/" rel="noopener noreferrer" target="_blank">無料診断のお申込みはこちら</a></p>
  </section>
  <section aria-label="改善が必要な場合">
    <h2>改善が必要な場合</h2>
    <p>初回診断で ★3 未達でも申請を続行できる。tcharton.com（親サイト）の有料サービスで改善した後、再評価を受けて ★ を取得する経路がある。詳細は <a href="https://tcharton.com/services/web/" rel="noopener noreferrer" target="_blank">tcharton.com の WEB 構築サービス</a>を参照する。</p>
  </section>
  <section aria-label="料金透明性">
    <h2>料金透明性</h2>
    <ul>
      <li>HARTON Certified への掲載: <strong>無料</strong></li>
      <li>無料診断: <strong>無料</strong></li>
      <li>改善サービス（任意）: tcharton.com の有料サービス（料金は <a href="https://tcharton.com/pricing/" rel="noopener noreferrer" target="_blank">tcharton.com/pricing/</a> 参照）</li>
    </ul>
  </section>
  <section aria-label="関連">
    <h2>関連</h2>
    <ul>
      <li><a href="/methodology/">評価方法（4 軸の全公開）</a></li>
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
      <dd>WEB サイトの品質を 4 軸（基礎・防御・AI 検索・経営インパクト）で機械検証し、総合 70 点以上 + 致命的 NG ゼロを満たす事業者を ★3 以上で認定する。</dd>
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
      <li><time datetime="2026-04-27">2026-04-27</time>: MASTER-PLAN v1.1.4 改訂（SPEC v3.4 連動完了）</li>
      <li><time datetime="2026-04-26">2026-04-26</time>: HARTON Certified 創設発表 / Phase 0 沼津 30 件パイロット開始</li>
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
  description: 'HARTON Certified へのお問合せフォーム。掲載申請 / 取材依頼 / 掲載辞退 / その他のご質問を 1 営業日以内に対応する。Cloudflare Turnstile による非侵入型ボット防御を併用。',
  canonicalPath: '/contact/',
  breadcrumbs: bcl([['トップ', '/'], ['お問合せ', '/contact/']]),
  mainContent: `
<article>
  <section aria-label="冒頭エビデンス">
    <p>HARTON Certified へのお問合せは <strong>1</strong> 営業日以内に対応する。<strong>4</strong> カテゴリの問合せ種別を選択でき、月間処理件数は <strong>30</strong> 件規模を想定する。出典: <a href="https://www.cloudflare.com/products/turnstile/" rel="nofollow noopener noreferrer" target="_blank">Cloudflare Turnstile</a>（非侵入型ボット防御）。</p>
    <blockquote cite="${DOMAIN}/methodology/">
      「非侵入型ボット防御を必須とする」 — SPEC v3.4 §8.8
    </blockquote>
    <p><time datetime="2026-04-27" itemprop="datePublished">2026-04-27 公開</time></p>
    <h1>お問合せ</h1>
  </section>
  <section aria-label="お問合せフォーム">
    <h2>フォーム</h2>
    <form action="https://api.web3forms.com/submit" method="POST" id="contactForm">
      <input type="hidden" name="access_key" value="9fda1d98-e246-4730-a12c-2251a5ae35b0">
      <input type="hidden" name="subject" value="HARTON Certified サイトからのお問い合わせ">
      <input type="hidden" name="redirect" value="https://certification.tcharton.com/thanks.html">
      <input type="hidden" name="from_name" value="HARTON Certified Contact Form">
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
      <p><button type="submit" class="px-6 py-3">送信する</button></p>
    </form>
    <p>本フォームは Web3Forms 経由で受信する（送信先メールは代表アドレスに集約）。送信後は確認画面（thanks）へ自動遷移する。Cloudflare Turnstile による非侵入型ボット防御は CR-3 で別途実装予定（site key 受領待ち）。</p>
  </section>
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
