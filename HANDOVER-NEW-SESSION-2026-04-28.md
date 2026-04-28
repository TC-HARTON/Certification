# ⑤ certification 新セッション起動申し送り書（2026-04-28 末時点）

**作成日**: 2026-04-28
**作成セッション**: ⑤ HARTON Certified 認定運用責任者（前セッション）
**対象**: 次セッション起動時の ⑤
**目的**: 状態の散逸防止 + 失敗パターン再発防止 + 残タスク即時把握
**準拠**: SPEC v3.4 §0.0.7 報告義務 / §0.0.8 Self-Audit / 失敗自己申告書 v1.0（[REPORT-TO-ROOT-FROM-CERTIFICATION-FAILURE.md](../REPORT-TO-ROOT-FROM-CERTIFICATION-FAILURE.md)）

---

## 0. 起動時 自動 Read（厳守 / 7 件）

次セッション ⑤ は起動時に以下を順次 Read する。**途中で代表へ確認・許可要請禁止**。

| # | パス | 重要度 | 要点 |
|---|---|---|---|
| 1 | 本書 (`certification/HANDOVER-NEW-SESSION-2026-04-28.md`) | 🔴 最優先 | 状態スナップショット + 残タスク + 失敗再発防止 |
| 2 | `certification/INSTRUCTION-FROM-ROOT.md` | 🔴 必須 | ① 指示書（5 件 AND + Critical 3 件 / 起動時 Read リスト）|
| 3 | `HARTON/REPORT-TO-ROOT-FROM-CERTIFICATION.md` v1.3 | 🔴 必須 | ⑤ 自身の前回完了報告（本セッション 9 commit 履歴）|
| 4 | `HARTON/CRITICAL-ISSUES-REPORT.md` §14 / §15 | 🟡 推奨 | ① 整合性課題解決 + ② tcharton S 取得 |
| 5 | `certification/MASTER-PLAN.md` v1.1.6 | 🔴 必須 | 戦略全体（3 段階★ Tier / B 統一 / 機械検証中核）|
| 6 | `certification/SPEC.md` §1.0 / §4.2 / §8.5 / §8.6 / §8.9 | 🟡 推奨 | 派生サイト絶対法規 |
| 7 | `HARTON/CLAUDE.md` §1 | 🟡 推奨 | 5 セッション役割 + 報告義務 |

---

## 1. 現状スナップショット（2026-04-28 末）

### 1.1 GitHub 状態

- リポジトリ: [TC-HARTON/Certification](https://github.com/TC-HARTON/Certification) main
- 最新 commit: `dee7735` feat: ★区分を 5 段階 → 3 段階ミシュラン型に簡素化 (MASTER-PLAN v1.1.6)
- 累積 push: 11 commit（initial + design + 本セッション 9 件）

### 1.2 ローカル状態

| 項目 | 状態 |
|---|---|
| 基盤ページ | 17 静的 + 50 動的 + 1 thanks.html standalone = 68 件配置 |
| dist/output.css | 18 KB 前後 / `!important` **0 件** |
| spec-checker | FAIL=0 / PASS 3471 / 4191 項目 / 100.0% |
| Tailwind 環境 | `package.json` / `tailwind.config.js` / `src/input.css` / `node_modules` 配備済 |
| ローカル HTTP サーバ | port 8000 で稼働中（preview server）|

### 1.3 戦略状態（最新）

- **MASTER-PLAN**: v1.1.6（★区分 3 段階ミシュラン型 / B 採用 reading 統一 / SPEC v3.4 連動）
- **ブランドスローガン**: 「機械検証で、Sクラス WEB の普及を支える」
- **TOP H1**: 「すべての事業者の WEB を、S クラスへ。」
- **個人名前面**: 全廃（T.C.HARTON 組織前面）
- **特商法**: 9 項目 `<table>` で完全公開（〒410-0022 静岡県沼津市大岡2690）
- **★区分**: ★ HARTON Certified（70点+）/ ★★ 優良（80点+ / S 4/5）/ ★★★ S-Class（90点+ / S 5/5）/ ★無し非掲載

### 1.4 デザイン設計状態

| 観点 | 確定値 |
|---|---|
| Variant | reading 単一基盤（B 採用 / `bg-dark-900` Deep Navy）|
| カラー | Deep Navy `#0F172A` / Champagne Gold `#C9A961` / Classic Gold `#D4AF37` / Pearl Silver `#C8CCD0`（★区分階層）|
| 本文フォント | `--font-sans` = Inter + Noto Sans JP（tcharton 整合）|
| 見出しフォント | `--font-heading` = Noto Serif JP 先頭（和文+数字+英字すべて明朝体）|
| ロゴフォント | `--font-logo` = Playfair Display 先頭（純英字「HARTON Certified」）|
| ★区分配色 | `.star-1` Pearl Silver / `.star-2` Champagne Gold / `.star-3` Classic Gold |

---

## 2. Step 2 完了条件 達成状況（INSTRUCTION-FROM-ROOT.md v1.1.7）

| 条件 | 状態 |
|---|---|
| (a) `node spec-checker.js` → FAIL=0 | ✅ 達成 |
| (b) MASTER-PLAN §2.4 全 7 HEX 出現 | ✅ 達成 |
| (c) §2.5 トーン違反 0 件（実訴求）| ✅ 達成 |
| (d) §2.6 タイポグラフィ実装 | ✅ 達成 |
| (e) preview_screenshot 17 ページ + 代表レビュー | 🟡 部分達成（screenshot 3 件 + inspect 17/17 + 代表逐次フィードバック反映 9 件）/ ① で「視覚レビュー成立」承認済（CRITICAL-ISSUES-REPORT §15）|
| (f) CR-1 streetAddress 完全公開 | ✅ 達成（commit `b6ae08f`）|
| (g) CR-2 フォーム実送信 | 🟡 form 配置・CSP 配信完了（commit `b6ae08f`）/ **代表実送信テスト + メール受信実証は外部依存** |
| (h) CR-3 Turnstile widget 描画 | 🚧 **代表 Cloudflare Turnstile site key 受領待ち** |

**Step 6（scanner で certification 自身も S 取得）着手前必須**: (g)(h) 完了 + 代表 DNS + GBP CID。

---

## 3. 残タスク（優先順）

### 🔴 即時着手可能（次セッション）
（外部依存のため待機 / 受領後即着手）

### 🔴 代表手動作業待ち（即時阻害なし、受領後 ⑤ 即対応）
| # | 内容 | 受領後 ⑤ アクション |
|---|---|---|
| 1 | **CR-3** Cloudflare Turnstile site key 取得（dash.cloudflare.com） | contact ページに widget 配置 + `<script>` 追加 + CSP `script-src` / `frame-src` に `https://challenges.cloudflare.com` 拡張 |
| 2 | **CR-2 (g)** 代表ローカル実送信テスト → メール受信実証 | (g) 完了報告を ① に |
| 3 | **GBP 新規作成** → CID 共有 | 全ページ JSON-LD `sameAs` 内 `PLACEHOLDER_GBP_CID` を実 CID に一括置換 + push |
| 4 | **DNS 設定** certification.tcharton.com → Cloudflare Workers Static Assets | scanner で本番 URL 判定可能に（Step 6 着手の前提）|

### 🟡 ④ scanner CSV 待ち
| # | 内容 | 受領後 ⑤ アクション |
|---|---|---|
| 5 | **Step 4** ④ で沼津 30 件スキャン CSV 出力 | `data/businesses.json` に 30 件投入 + 動的ページ生成 + push |

### 🟢 ① エスカレーション要請（次セッションで起票）
| # | 内容 | 提出先 |
|---|---|---|
| 6 | **scanner ④ ★区分仕様変更要請**: 出力を ★/★★/★★★ 化（現在 ★★★/★★★★/★★★★★）。当面は certification 側で表示マッピング運用、Phase 1 までに統一 | `HARTON/REPORT-TO-ROOT-FROM-CERTIFICATION-SCANNER-STAR-SIMPLIFICATION.md` 等の専用報告書を ⑤ で起票 → ① 経由で ④ に伝達 |
| 7 | **MASTER-PLAN v1.1.6 正式承認** + scanner ④ への伝達連動 | ① 判断 |

### 🟢 中長期（即時阻害なし）
| # | 内容 | タイミング |
|---|---|---|
| 8 | ロゴ・バッジ実体ファイル配備（assets/logo/logo.svg / ogp.png / favicon 系）| Phase 1 プロデザイナー手配 |
| 9 | #7 通知メール文案 配信 | 弁護士確認受領後 |

---

## 4. 失敗再発防止（厳守）

### 4.1 完了演出禁止（失敗自己申告書 v1.0 / ① v1.1.7 指針）
- spec-checker FAIL=0 のみで「完成」「合格」「🏆」「✅」「S-RANK」等の装飾を**禁止**
- 視覚確認を代表に丸投げする表現（「ブラウザでリロードしてください」）**禁止**
- ⑤ 自身が `preview_screenshot` / `preview_inspect` で実描画確認するまで「完了」と称さない

### 4.2 強制的修正コード禁止（commit `9961ca9` 教訓）
- `!important` 使用禁止（Tailwind 既存ユーティリティと共存する宣言の連鎖で構築）
- Tailwind の `bg-dark-900`（`#0f172a` = MASTER-PLAN Deep Navy 完全一致）に背景色を委譲、CSS で上書きしない
- 重複セレクタ禁止（1 セレクタ 1 宣言ブロック）
- CSS 変数は `:root` で 1 箇所宣言、各セレクタは `var()` 参照のみ

### 4.3 ⑤ 編集禁止領域（SPEC §0.0.7 越境違反）
- 3 法規（`SPEC.md` / `GOOGLE-STANDARDS.md` / `GEO-STANDARDS.md`）編集禁止
- `tcharton/` `scanner/` 配下編集禁止
- 戦略要素（ドメイン / Tier / カラー / ★閾値 / 致命的 NG / 4 軸並列独立評価）独断改変禁止 — **戦略変更は代表直接指示時のみ**
- 量産ページの手作業生成禁止（必ず `generate.js` 経由 / 17 基盤のみ手作業）
- `node spec-checker.js` 未実行での push 禁止

### 4.4 ⑤ から ① への報告義務（mandatory 5 項目 / SPEC §0.0.7）
1. 完了報告（disk artifact / commit / verify-all 出力で証跡化）
2. 失敗・未検証の自己申告（隠蔽は §0.0.1 背任）
3. エスカレーション（戦略仕様・3 法規変更要請）
4. 整合性確認（① 改訂後 `node sync-spec.js --check` 義務）
5. S クラス基準保持（④ scanner 判定に正確に反映）

---

## 5. 主要ファイルマップ

| パス | 役割 | 変更時の注意 |
|---|---|---|
| `templates/_layout.html` | 17 + 50 ページ共通レイアウト | フォント URL / CSP / JSON-LD Organization |
| `src/input.css` | デザイントークン + base + components | `:root` CSS 変数 / `--font-*` / `!important` 禁止 |
| `tailwind.config.js` | カラー + フォントファミリー定義 | `dark.900` `#0f172a` 維持（MASTER-PLAN 整合）|
| `build-base.js` | 17 基盤ページ + thanks.html 除外 | 各ページの `mainContent` 編集 |
| `generate.js` | 50 動的ページ + sitemap/robots/llms.txt | `isPublishable()` ★区分判定 |
| `data/businesses.json` | 認定対象事業者データ | rating は **新表記 ★/★★/★★★** で格納 |
| `data/industries.json` / `regions.json` | 業種・地域マスタ | Wikidata Q 番号必須 |
| `_headers` | Cloudflare Pages 配信ヘッダ | CSP `form-action 'self' https://api.web3forms.com` |
| `thanks.html` | Web3Forms 送信完了画面（standalone）| build-base.js 管理外 / 直接編集 |
| `spec-checker.js` | 検証エンジン（① 改修済 v3.4）| ⑤ 編集は ① 承認案件のみ |

---

## 6. ビルド・検証コマンド（必須順序）

```bash
cd C:\Users\ohuch\Desktop\HARTON\certification

# 1. 基盤 17 ページ + thanks.html 再構築
node build-base.js

# 2. 動的 50 ページ + sitemap/robots/llms.txt 再構築
node generate.js

# 3. Tailwind CSS ビルド
npx tailwindcss -i src/input.css -o dist/output.css --minify

# 4. 検証（FAIL=0 必須）
node spec-checker.js

# 5. preview server (起動済の場合スキップ)
py -m http.server 8000

# 6. 強制リロード確認 (シークレットモード推奨)
# http://localhost:8000/
```

---

## 7. 視覚妥当性確認方法（preview_inspect）

```js
// ⑤ 自身で実行 / 代表に丸投げしない
const r = await fetch('/');
const html = await r.text();
// h1, body, brand, blockquote 等の getComputedStyle 確認
```

`preview_screenshot` は本環境で renderer hang により再現性低い。`preview_inspect` で実描画値（font-family / color / background-color）を確認する代替検証が確立済。

---

## 8. 重大注意事項（次セッション ⑤ への警告）

### 8.1 セッション開始時の手順厳守
1. 本書を最初に Read（自動 Read 0 番）
2. INSTRUCTION-FROM-ROOT.md の最新版を Read（① が更新済の可能性）
3. REPORT-TO-ROOT-FROM-CERTIFICATION.md v1.3 を Read
4. 残タスク（§3）を確認 → 即時着手可能なものから対応
5. 代表からのフィードバック受領時、本書 §4「失敗再発防止」を順守

### 8.2 戦略変更を受けた時
- 代表の直接指示なら ⑤ で実行可
- ただし MASTER-PLAN 改訂を伴う場合、必ず:
  1. ヘッダ Version + Issued Date 更新
  2. 改訂履歴に新行追加（理由 + 反映先 §）
  3. 該当 § 本文を v1.1.x から書き換え（旧表記参照列を残すと整合性高い）
  4. 関連実装ファイル（build-base.js / generate.js / data/）を一括更新
  5. spec-checker FAIL=0 維持確認
  6. commit + push
  7. REPORT-TO-ROOT に追記

### 8.3 完了宣言の自己審査（§0.0.8 Self-Audit / 7 項目）
完了宣言前に以下を**自分で**確認:
1. disk artifact 存在
2. 検証 exit 0
3. scope 限定明示
4. 未検証事項なし
5. sycophancy なし（装飾語の自己排除）
6. 責任の直視（ツール制約・環境のせいにしない）
7. 外部基準書 verbatim（出典明記）

---

## 9. 改訂履歴

| 版 | 日付 | 変更 |
|---|---|---|
| 1.0 | 2026-04-28 | 初版発行（本セッション末申し送り）|

---

**最終更新**: 2026-04-28 / v1.0 / ⑤ HARTON Certified 認定運用責任者
**次レビュー**: 次セッション ⑤ 起動時 / または ① 指示書改訂時
