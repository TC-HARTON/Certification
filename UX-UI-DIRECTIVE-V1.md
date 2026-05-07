# ⑤ certification UX/UI 最善化指示書 v1（① HARTON 総合責任者 確定 / 2026-04-30）

> **発信**: ① HARTON 総合責任者
> **宛先**: ⑤ HARTON Stella 認定運用責任者
> **モデル参照**: **ミシュランガイド公式 `guide.michelin.com`**
> **連動**: `BRAND-STRATEGY-V1.1.7.md` / `MASTER-PLAN.md` v1.1.7 草案議題
> **適用範囲**: stella.tcharton.com 全ページ（基盤 17 + 動的 50 + ルート 3）
> **着手前提**: Critical 3 件（CR-1 streetAddress / CR-2 Web3Forms / CR-3 Turnstile）解消後、または並行可能箇所のみ先行可

---

## 0. 本書の位置付け

⑤ certification の既存サイト構造（`drafts/` + 基盤 17 ページ + 動的 50 ページ）を、**ミシュランガイド公式の UX/UI を構造的に取込んで再設計**する。「ミシュラン的見た目」の表面模倣ではなく、**「権威ある格付け媒体としての情報設計原則」**を学習・適用する。

ブランド戦略 v1.1.7（自己実証体 / dogfooding 倫理 / 沼津起点）と整合させ、Michelin Guide にはない HARTON 独自の文脈を上乗せする。

---

## 1. ミシュランガイド公式 UX/UI 構造分析（学習対象）

### 1.1 ホーム / ディスカバリー層

| 要素 | ミシュラン公式の特徴 | HARTON への適用 |
|---|---|---|
| **Hero** | 大判編集写真 + 編集者視点コピー（季節キュレーション）| 沼津 ★★★ 取得事業者の高品質サイトのスクリーンショット + 「自己実証体 第 1 号」キュレーション |
| **キュレーション rail** | 「Just added」「Featured」「By distinction」横スクロール | 「今月の新規 ★★★」「業種別ベスト」「沼津から ★ 取得した事業者」 |
| **マップ + リスト切替** | Map / List トグル（list 既定）| 沼津エリアマップ + ★ ピンプロット（Phase 1 以降）|
| **検索バー** | 「Restaurant, city, cuisine」フリーワード + 地域 chip | 「業種・地域・★区分」3 軸 chip |

### 1.2 一覧（Listing）層

| 要素 | ミシュラン公式 | HARTON 適用 |
|---|---|---|
| **カードレイアウト** | 写真 + 店名（serif 大）+ cuisine + 地域 + price + ★アイコン（左上 overlay）| サイトスクリーンショット + 事業者名 + 業種 + 地域 + ★ 区分 |
| **★ 表示** | カード左上に MICHELIN logo + 数値ではなくアイコン群（★/★★/★★★ + Bib）| 同様に **左上 overlay**：★ / ★★ / ★★★ アイコン（v1.1.6 確定 SVG）|
| **フィルタサイドバー** | Cuisine / Distinction / Price / Services のチェックリスト + 結果件数即時更新 | **業種 / ★区分 / 地域 / 致命的 NG なし** の 4 軸フィルタ |
| **Sort** | Featured / Distinction / Just added | **★ 高い順 / 新規認定順 / 業種別** |
| **カード hover** | 微細な elevate + outline emphasis | 同（Tailwind `hover:shadow-xl transition`）|

### 1.3 詳細（Detail）層

| セクション | ミシュラン公式 | HARTON 適用 |
|---|---|---|
| **Hero** | 全幅写真 + ★アイコン + 店名 serif + cuisine + 受賞年 | サイトスクリーンショット + ★ + 事業者名 + 業種 + 認定年月 |
| **Inspector's note**（最重要 USP） | 専門家による一段落の評価文（ですます体、簡潔・上品）| **「機械検証コメント」**（scanner.py 出力を編集者が翻案 / 必須 5 条件達成内訳の物語化）|
| **Practical info** | 住所 / 営業時間 / 電話 / 予約リンク / 価格帯 / Services | **住所 / 公式 URL / 業種 / scanner 取得スコア / 4 軸内訳** |
| **構造化データ** | Restaurant + Review schema | **Organization + Review schema** + reviewRating（★ 数）|
| **「Other restaurants nearby」** | 近隣 ★ レコメンデーション 3 件 | **「同業種の他 ★ 事業者」「同地域の他 ★ 事業者」**（マトリックスリンク）|
| **MICHELIN Plate / Bib Gourmand** | 区分の意味解説リンク常設 | **「★ / ★★ / ★★★ の意味」リンク常設**（methodology へ）|

### 1.4 タイポグラフィ / カラー

| 要素 | ミシュラン公式 | HARTON 既存（v1.1.6）| HARTON 追加指示 |
|---|---|---|---|
| **見出し serif** | EB Garamond 系 | Marcellus（既定）| ✅ 維持。但し H1 サイズを 1.25 倍 |
| **本文 sans** | proprietary sans | Noto Sans JP | ✅ 維持 |
| **★ icon font** | MICHELIN custom | text `★` | **SVG コンポーネント化必須**（拡縮 + a11y `aria-label="HARTON ★★★"`）|
| **メインカラー** | Red (#C8102E) | 紺 + 金 | ✅ 維持（差別化）|
| **アクセント** | Gold for distinction | 金（既定）| ✅ 維持 |
| **背景** | 白 + 暖色グレー | 同 | ✅ 維持 |
| **写真処理** | 高彩度・編集風 | （未定）| **業者サイトのスクリーンショットを 16:9 / 高画質 / 統一トーン処理**（generate.js で puppeteer 自動取得）|

### 1.5 マイクロインタラクション

| 要素 | ミシュラン公式 | HARTON 適用 |
|---|---|---|
| **★ アニメーション** | 詳細ページ初回到達時に ★ がフェードイン+1step pop | 同（Framer Motion 不要、CSS @keyframes で実装可）|
| **画像 lazy + blur-up** | LQIP プレースホルダ | `loading="lazy"` + Cloudflare Polish |
| **スクロール深度別 nav 影** | sticky nav に shadow toggle | 同 |
| **Skeleton loader** | リスト初期描画時 | SSG 構造のため不要、但し動的フィルタ JS で適用 |

---

## 2. ⑤ 既存サイトとのギャップ分析（着手優先順）

| 優先 | 現状 | あるべき姿（Michelin 学習） | 影響 |
|---|---|---|---|
| 🔴 P0 | カード = 文字主体、写真なし | **サイトスクリーンショット必須** | 発見性 / SEO / 信頼性 |
| 🔴 P0 | フィルタ未実装 | **4 軸フィルタ（業種 / ★ / 地域 / NG なし）** | UX 中核機能 |
| 🔴 P0 | ★ アイコンが text `★` | **SVG コンポーネント + aria-label** | a11y / 視覚一貫性 |
| 🟡 P1 | 詳細ページに「機械検証コメント」なし | **scanner 出力 → 編集翻案で物語化** | USP の表現 |
| 🟡 P1 | マトリックスリンク（同業種 / 同地域）未実装 | **詳細ページ末尾レコメンド** | SEO 内部リンク + UX |
| 🟡 P1 | マップビューなし | **沼津エリア地図 + ★ ピン**（Phase 1 以降）| 地理的訴求 |
| 🟢 P2 | キュレーション rail なし | **「今月の新規 ★★★」横スクロール** | リピート訴求 |
| 🟢 P2 | ★ マイクロアニメーションなし | CSS keyframes 1 段 pop | プレミアム感 |

---

## 3. 実装 Phase 計画（⑤ 着手順序）

### Phase A: 基盤改修（Critical 3 件と並行可 / 1〜2 週間）

1. **★ SVG コンポーネント化** — `templates/_partials/star-distinction.html` 新規 + 既存 text `★` を全件置換
2. **業者サイトスクリーンショット取得自動化** — `generate.js` に Puppeteer 連携（1280×720 / 16:9 切出 / WebP 出力 / `assets/screenshots/{slug}.webp`）
3. **カードレイアウト全面改修** — 業種 listing / 地域 listing / TOP rail すべてを「写真 + 事業者名 + 業種 + 地域 + ★ overlay」型に統一
4. **詳細ページ Hero 改修** — 全幅スクリーンショット + ★ アイコン + 認定年月 + scanner スコア

### Phase B: 編集体験追加（Phase A 後 / 1 週間）

5. **「機械検証コメント」自動生成** — scanner CSV 出力 → `data/businesses.json` の `inspector_note` フィールドに ⑤ 編集翻案で投入（必須 5 条件達成内訳の物語化）
6. **マトリックスリンク** — 詳細ページ末尾「同業種の他 ★ 事業者 3 件 / 同地域の他 ★ 事業者 3 件」（generate.js で自動算出）
7. **「★ / ★★ / ★★★ の意味」常設リンク** — グローバル nav 直下 + 全詳細ページに固定 secondary nav

### Phase C: ディスカバリー強化（Phase B 後 / 1 週間）

8. **4 軸フィルタ実装** — JavaScript（依存追加なし / vanilla）+ URL パラメータ連動 + 件数即時更新
9. **TOP「今月の新規 ★★★」rail** — `published_at` ソート 横スクロール（Tailwind `overflow-x-auto snap-x`）
10. **検索バー** — `<input>` + クライアントサイドフィルタ（小規模なら全件 JSON 読込で十分）

### Phase D: 地理的訴求（Phase 1 以降 / Phase 0 沼津 30 件投入完了後）

11. **沼津エリアマップ** — Leaflet + OpenStreetMap タイル / ★ ピン / クリックで詳細ページ
12. **エリア別ヒートマップ** — 業種密度可視化

---

## 4. 完了条件 AND（4 Skill 必須化適用 / v1.1.11）

各 Phase 完了時に以下を AND 達成:

1. spec-checker FAIL=0 維持
2. **`/feature-dev:feature-dev` mandatory 適用**（Phase A〜D は新規大規模実装に該当）
3. **`/requesting-code-review` 並列複数 reviewer**:
   - reviewer A: ミシュラン公式との UX 整合性レビュー（gstack で `guide.michelin.com` 実機参照）
   - reviewer B: ブランド戦略 v1.1.7 整合性レビュー（自己実証体 / dogfooding 倫理が表現に反映されているか）
   - reviewer C: a11y / WCAG 2.2 / SVG aria-label レビュー
4. **`/gstack` 本番実機検証** mandatory（Phase A 以降は視覚変更が中核のため）
5. **`/receiving-code-review` 厳格処理**（performative agreement 禁止）
6. ① 報告 → 承認後 push

---

## 5. ① 確定: 表面模倣の禁止 / 構造的学習の徹底

### 5.1 やってはいけないこと

| ❌ 禁止 | 理由 |
|---|---|
| MICHELIN ロゴ・赤色（#C8102E）の流用 | 商標権侵害 + ブランド独自性毀損 |
| 「ミシュラン」名称をサイト本文で使う（比較・参照含む）| 第三者商標誤認誘導リスク |
| Inspector 写真や編集者顔写真の流用 | 著作権侵害 |
| 「業界のミシュラン」と自称 | ブランド戦略 v1.1.7 §6.2 禁止用語 |

### 5.2 学習すべきこと

| ✅ 学習対象 | 適用例 |
|---|---|
| カード overlay の ★ 配置原則 | HARTON ★ SVG を左上 12px padding で配置 |
| Inspector's note の文体（簡潔・上品・専門的）| 「機械検証コメント」の編集トーン |
| 詳細ページの「Other ... nearby」マトリックス構造 | 同業種 / 同地域マトリックスリンク |
| Distinction（区分）の意味を常時参照可能にする情報設計 | methodology 常設リンク |
| 大判編集写真 + serif 見出しの権威表現 | スクリーンショット 16:9 + Marcellus H1 |

---

## 6. 用語統制（本書追加分 / BRAND-STRATEGY-V1.1.7.md §6 連動）

### 6.1 新規定型語

| 用語 | 意味 | 適用先 |
|---|---|---|
| 機械検証コメント | scanner 出力 → ⑤ 編集翻案で物語化したテキスト | 詳細ページ Inspector's note 相当 |
| ★ overlay | カード左上に SVG ★ アイコンを配置する標準パターン | 一覧 / TOP rail |
| マトリックスリンク | 同業種・同地域の他 ★ 事業者へのレコメンド構造 | 詳細ページ末尾 |
| Distinction（区分）解説 | ★ / ★★ / ★★★ の意味解説（methodology へリンク）| 全ページ常設 secondary nav |

### 6.2 禁止用語（追加）

| 禁止用語 | 理由 |
|---|---|
| 「ミシュラン的」「ミシュラン風」 | §5.1 商標誤認リスク |
| 「Inspector」「審査員」 | 機械検証主体のため不適切（人間審査の含意を持たせない）|

---

## 7. 改訂履歴

| 版 | 日付 | 変更 |
|---|---|---|
| **v1** | **2026-04-30** | 初版発行（① HARTON 総合責任者 確定 / Michelin Guide 公式 UX/UI 学習 / ⑤ Phase A〜D 計画）|

---

**最終更新**: 2026-04-30 / ① HARTON 総合責任者
**次レビュー**: ⑤ Phase A 着手報告受領時 / Critical 3 件解消時のいずれか早い方
