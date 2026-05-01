# ⚠️ 強制法規 HSCEL v1（HARTON Skill Compliance Enforcement Law）— 最高位優先

> **本書冒頭に配置 / 全条項より上位適用 / 違反は機械的不承認**
> **全文**: [`HARTON/ENFORCEMENT-LAW-V1.md`](../ENFORCEMENT-LAW-V1.md)（必読 / 起動時 自動 Read 1 番目に追加）
> **SPEC 正本化**: SPEC §0.0.11（v3.4.2 / 2026-04-30 制定）

## §3.1 mandatory Skill（違反 = 自動不承認 / 全件 redo）

| # | Skill | 適用契機 |
|---|---|---|
| 1 | `/feature-dev:feature-dev` | 新規ページ / 大規模実装 / 戦略仕様改訂 |
| 2 | `/requesting-code-review` | **完了報告前 全件**（草案・本番問わず）/ **並列 2+ reviewer 必須** |
| 3 | `/receiving-code-review` | review feedback 受領時 |
| 4 | `/gstack` | 本番デプロイ後 / 視覚変更時 |

## §3.2 例外（緊急 hotfix のみ）

致命的 NG / セキュリティ脆弱性 への即時対応 + ① 事前明示承認 の AND 達成時のみ免除。24 時間以内に §3.1 遡及完遂義務。

## §4 REPORT 様式 強制（必須セクション / 空欄 = 完了未達）

REPORT-TO-ROOT-FROM-{担当}.md に以下を必ず記載:

```markdown
## §HSCEL-V1 §3 Skill 適用証跡（必須）

| Skill | 起動証跡 | 結果サマリ | 該当 commit / file |
|---|---|---|---|
| /feature-dev:feature-dev | {Phase 1-7 進捗 / 起動時刻} | {成果物パス} | {hash} |
| /requesting-code-review | {並列 reviewer 数 / 起動時刻} | {CRITICAL / HIGH / 解消件数} | {hash} |
| /receiving-code-review | {feedback 受領時刻} | {対応件数 / 撤回件数} | {hash} |
| /gstack | {本番 URL / 起動時刻} | {スクリーンショット / curl 実測パス} | {hash} |
```

## §5 commit 前順序 厳格固定

```
[Step 1] 実装 / 編集
[Step 2] §3.1 全 Skill 完遂
[Step 3] REPORT に §HSCEL-V1 §3 セクション記載
[Step 4] ① 承認待ち（disk artifact + REPORT のみ提示、commit はまだしない）
[Step 5] ① 承認後、commit + push
[Step 6] push 後、本番実機検証（/gstack 等）+ REPORT 更新
[Step 7] ① 最終承認
```

「草案」「ドラフト」「α 版」「軽微」「ちょっとした」「急ぎ」を理由に Step 2-3 を省略することは **§8.1 禁止用語**として全件不適用。

## §6 違反時処分

| Tier | 内容 |
|---|---|
| Tier 1 | ① 機械的不承認 / 内容に言及せず差戻し / 全件 redo（デフォルト）|
| Tier 2 | CRITICAL-ISSUES-REPORT に違反記録 → 次セッション trust scope 縮小 |
| Tier 3 | `.claude/settings.json` hook で commit / push 物理拒否（次フェーズ）|
| Tier 4 | 同 § を 3 回違反 → 担当変更（① 権限）|

---

# ⑤ certification 指示書（HARTON Certified 認定運用責任者）

**最終更新**: 2026-04-27 / ① HARTON 総合責任者
**現状**: ✅ **Step 2 完了**（基盤 17 + 動的 50 ページ / spec-checker 4194 項目 100% / 5 件 AND 達成）
**未完**: Step 4（沼津 30 件投入 / ④ 連動）/ Step 6（scanner で certification 自身も S 取得 / 代表 DNS + GBP 待ち）

---

## 起動時 自動 Read（上から順に Read ツールで全件読み込め。担当判断不要、無条件実行）

1. 本書（既読）
2. **Read** `C:\Users\ohuch\Desktop\HARTON\REPORT-TO-ROOT-FROM-CERTIFICATION.md` — ⑤ 自身の完了報告（v1.4 / 第二次厳格検証完遂統合）
3. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\MASTER-PLAN.md` — v1.1.6（★3 段階化反映済）
4. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\SPEC.md` — §1.0 / §4.2 / §8.5 / §8.6 / §8.9
5. **Read** `C:\Users\ohuch\Desktop\HARTON\CRITICAL-ISSUES-REPORT.md` — §14-§18（v1.1.6-v1.1.11 確定記録 + 4 Skill 必須化）
6. **Read** `C:\Users\ohuch\Desktop\HARTON\CLAUDE.md` — §1

---

## 🔴 実装 必須プロセス（2026-04-28 ① 確定 / ②④⑤ 共通 / 単独実装厳禁）

代表確定（2026-04-28）— ② / ④ / ⑤ 全担当は **単独実装を禁止**。以下 4 Skill を構造的に組込:

| Skill | 役割 | 適用 |
|---|---|---|
| **`/feature-dev:feature-dev`** | Phase 1-7 構造化実装（codebase 理解 + architecture focus）| **mandatory**（新規 / 大規模修正の着手時）|
| **`/requesting-code-review`** | 並列複数 reviewer 独立検証（spec-checker 死角カバー）| **mandatory**（完了報告前）|
| `/gstack` | 本番実機テスト + dogfooding | **強い推奨**（本番デプロイ後検証）|
| `/receiving-code-review` | review feedback の技術的厳格処理（performative 禁止）| **mandatory**（review 受領時）|

### 完了条件 AND

1. spec-checker FAIL=0
2. `/requesting-code-review` 並列複数 reviewer CRITICAL/HIGH 全件解消
3. `/gstack` で本番実機検証 PASS（該当する場合）
4. ① 報告

### 禁止

上記 Skill を経ずに「完了」「合格」「PASS」「達成」「S-RANK」「★★★」を称することは §0.0.1 narrow-scope claim 一般化（背任）として **絶対禁止**。

⑤ v1.4 第二次厳格検証完遂（並列 5 エージェント自己レビュー）が new standard。

---

## 完了タスク（履歴）

| Step | 内容 | commit / 状態 |
|---|---|---|
| 1 | 基盤配置（_headers / _redirects / templates/_layout.html）| ✅ |
| 2 | 基盤 17 ページ手作業構築 + 動的 50 ページ生成 + ルート 3 ファイル | ✅ `db00cff` `a2e2859` push 済 + **本セッションで 5 工程分の代表フィードバック反映 push 統合**（タベログ→食べログ / 外部リンク target=_blank / B 採用全 reading 統一 / 捏造 URL 5 件差替 / フッター親整合）|
| 3 | data/ JSON 構造（industries / regions / businesses 雛形）| ✅ |
| 5 | generate.js 最小実装 | ✅ |
| #7 | 通知メール文案 v0.1 | ✅ 草案保管（弁護士確認待ち）|
| #8 | MASTER-PLAN v1.1.4 → v1.1.5 改訂（B 採用 全 reading 統一） | ✅ |

**5 件 AND 達成**:
- (a) spec-checker FAIL=0 / 4194 項目 / 100.0%
- (b) MASTER-PLAN §2.4 全 7 HEX 出現
- (c) §2.5 トーン違反 0 件（実訴求）
- (d) §2.6 タイポ（Google Fonts 5 種）
- (e) preview_screenshot 3 + preview_inspect 17/17（① 評価で「視覚レビュー成立」承認済）

---

## 残タスク

---

### 🔴 Critical 3 件 — Step 6 達成前の必須実装（① 厳格検証 2026-04-28 / 即時着手）

② tcharton が B/87 → S/90 取得した経緯と**同じ轍を踏むリスク**を ① 検証で発見。Step 6 着手前に必ず解決すること。

#### CR-1: `streetAddress` 完全公開（NAP 完全一致達成）

**現状**: TOP + 全 16 + 50 ページの JSON-LD `address` で `addressLocality: "沼津市"` のみ、`streetAddress` 不在。
**結果**: scanner 必須条件 2「NAP 完全一致」住所 △ → 最大 90 未達。

**実装**:
- 全 JSON-LD `address` を以下に統一（② tcharton 流用）:
  ```json
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "JP",
    "addressRegion": "静岡県",
    "addressLocality": "沼津市",
    "streetAddress": "大岡2690",
    "postalCode": "410-0022"
  }
  ```
- 対象: `index.html` / `about/`, `methodology/` 系 / `apply/`, `improvement-guide/`, `press/`, `opt-out/` / `faq/`, `news/`, `contact/`, `legal/`, `privacy/` / `404.html` / 動的 50 ページ
- 一括置換スクリプト or `generate.js` 連動推奨

**完了条件**: `grep -rE "addressLocality.*沼津市" certification/ | xargs grep -l "streetAddress"` で全件確認 + spec-checker FAIL=0 + verify-all exit 0
**コミット**: `feat: streetAddress 完全公開 (沼津市大岡2690 / postalCode 410-0022) per scanner NAP 完全一致`

#### CR-2: contact フォーム実処理 — Web3Forms 採用（② tcharton 同サービス）

**現状**: `contact/index.html` line 215 `<form action="/thanks.html" method="post">` — POST 先が静的 HTML、実送信なし。
**結果**: フォーム送信されても何も起きない。

**実装**:
1. **代表が <https://web3forms.com/> で certification 用 access_key 取得**（無料 / メール認証のみ）→ ⑤ に共有
2. ⑤ で `contact/index.html` のフォームを以下に変更:
   ```html
   <form action="https://api.web3forms.com/submit" method="POST">
     <input type="hidden" name="access_key" value="{受領した access_key}">
     <input type="hidden" name="from_name" value="HARTON Certified Contact">
     <input type="hidden" name="redirect" value="https://certification.tcharton.com/thanks.html">
     <input type="hidden" name="subject" value="HARTON Certified お問合せ">
     {既存 name / email / company / category / message フィールド維持}
     {Cloudflare Turnstile widget 配置 — CR-3 連動}
     <button type="submit">送信する</button>
   </form>
   ```
3. `thanks.html` を新規作成（送信完了画面 / TOP リンク + 1 営業日返信の旨）

**完了条件**:
- ⑤ ローカルから実送信テスト → 代表メール（Cloudflare Email Routing 経由）に届く
- spec-checker FAIL=0 維持
- `form-action 'self'` CSP 違反なし（Web3Forms ドメインを CSP `form-action` に追加: `form-action 'self' https://api.web3forms.com`）

**コミット**: `feat: contact form Web3Forms backend per ② tcharton 同サービス + Turnstile 連動`

#### CR-3: Cloudflare Turnstile widget 実装 — SPEC §8.5 必須条件 4 達成

**現状**: `contact/index.html` line 233「Cloudflare Turnstile を併用する」と HTML 記載するが widget 不在。**§0.0.1 narrow-scope claim 一般化（背任）+ 虚偽記載**。
**結果**: scanner 必須条件 4「非侵入型ボット防御」未達成。

**実装**:
1. **代表が <https://dash.cloudflare.com/?to=/:account/turnstile> で certification 用 site key + secret key 取得**（無料 / 1M req/月まで）→ ⑤ に site key 共有 + secret は Web3Forms 側 hCaptcha/Turnstile 統合に登録
2. ⑤ で `contact/index.html` の `<head>` 内に追加:
   ```html
   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
   ```
3. ⑤ で `contact/index.html` のフォーム送信ボタン直前に追加:
   ```html
   <div class="cf-turnstile" data-sitekey="{受領した site key}" data-theme="dark"></div>
   ```
4. CSP `_headers` の `script-src` / `frame-src` に Cloudflare Turnstile ドメインを許可:
   ```
   script-src 'self' https://challenges.cloudflare.com;
   frame-src 'self' https://challenges.cloudflare.com;
   ```
5. **「実装する」「整合」記載の整合性確保** — widget が描画されない限り該当文言を維持しないこと（H-3 自己申告）

**完了条件**:
- contact ページに Turnstile widget 描画確認（`preview_inspect` or 本番 curl で `cf-turnstile` クラス + script タグ存在）
- ボット送信時に Turnstile が challenge を出すこと（手動確認 1 回でよい）
- spec-checker FAIL=0 維持

**コミット**: `feat: Cloudflare Turnstile widget per SPEC v3.4 §8.5 必須条件 4 / §8.8`

---

#### Critical 3 件 完了後の総合検証（5 件 AND + 新 3 件）

| # | 条件 | 検証 |
|---|---|---|
| (a) | spec-checker FAIL=0 | `node spec-checker.js` |
| (b) | §2.4 全 7 HEX | grep |
| (c) | §2.5 トーン違反 0 | grep |
| (d) | §2.6 タイポ | Google Fonts 5 種 |
| (e) | 視覚確認 | preview_screenshot or preview_inspect |
| **(f)** | **CR-1: streetAddress 完全公開** | **全 NAP に streetAddress 記載確認** |
| **(g)** | **CR-2: フォーム実送信** | **⑤ から実送信 → 代表メール受信実証** |
| **(h)** | **CR-3: Turnstile widget 描画** | **contact ページで widget 表示確認** |

**全 8 件 AND 達成後**、Step 6（scanner で certification 自身も S クラス取得）に進む。

---

### 🔴 Step 8 — ブランド確立 + S クラス厳格定義（2026-04-28 ① 確定 / Step 7 と並行）

**経緯**: 代表確定（2026-04-28）—「独自評価を既に自社で開発する私達の明確な定義を、丁寧な言語化にしてブランド確立を目指す」。① でマニフェスト + ★区分物語 + 失効条件を確定。⑤ で MASTER-PLAN v1.1.7 草案 → ① 承認 → 全サイト本文反映。

#### 8.1 MASTER-PLAN v1.1.7 改訂対象（⑤ 草案作成）

| 改訂節 | 内容 | ① 確定文言 |
|---|---|---|
| **§2.0 マニフェスト 新設** | 哲学ステートメント（コア）| 「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」(50 字)+ 副文 (200 字)|
| **§2.0.1 信頼根拠の核 新設** | 「自社開発・自社実証」の言語化 | 「scanner.py 独自開発 + tcharton.com で ★★★ 実証 + 自分が達成できない基準で他者を測らない」(300 字)|
| **§2.3 ナラティブ 改訂** | 380 字ナラティブを「機械検証 / S クラス普及 / 公正中立」に書き直し | 旧「移住者の眼で...」→ 新「機械検証で、Sクラス WEB の普及を支える」（v1.1.5 で TOP H1 のみ転換、本文未追従を解消）|
| **§2.7 ターゲット別メッセージング 新設** | A/B/C/D セグメント個別訴求 | A「AI が推薦する店を、人より先に見つけられる」/ B「掲載が、最高の営業ツールになる」/ C「自分も S クラスへ」/ D「機械が選んだ、地方の至宝」|
| **§3.0 S クラス哲学的定義 新設** | 機械検証の上位概念 | 「機械が客観検証する、AI 時代における信頼の最大値」+「人間の主観や金銭、規模に依存しない / 誰もが再現可能 / 努力の結果ではなく思想の到達点」|
| **§3.0.1 意味的定義 新設** | 業種ベンチマーク / AI 推奨対象 | 「業界ベンチマーク / 同業者の教科書的手本 / AI 検索エンジンが第一想起する情報源」|
| **§3.1 ★区分の物語 改訂** | ミシュラン型 動機喚起文 | ★「同業種で確実に信頼できる」/ ★★「他県からでも訪れる価値がある」/ ★★★「業界の方向性を定義する到達点」|
| **§7.7 査定員一言 LLM プロンプト設計 新設**（Step 7 連動）| Wikidata Q + 4 軸スコア + 必須 5 条件達成 + 業種特性 → 100-200 字物語 | ⑤ で具体プロンプト設計 |
| **§12 失効・降格運用 新設** | 月次再判定 + 14 日猶予 + 即時降格 | 機械検証劣化 → 通知 + 14 日改善 → 改善なければ降格 / 致命的 NG は猶予なし即時非掲載 |

#### 8.2 サイト本文反映（⑤ で全 17 + 50 ページ書き直し）

**TOP**:
- ヒーロー直下に**マニフェスト**配置（§1.1 の 50 字を大文字で）
- 副文を about/methodology へ送る導線

**about**:
- §2.0.1「自社開発・自社実証」を **「私たちの信頼根拠」**節として配置
- T.C.HARTON 組織記述 + 機械検証の哲学（既存）と統合

**methodology**:
- §3.0 哲学的定義 + §3.0.1 意味的定義を冒頭配置
- 既存の 4 軸 + 必須 5 条件解説と統合

**個別事業者ページ（businesses/<slug>/）**:
- ★区分物語（§3.1 の動機喚起文）をページ上部に配置
- 「査定員一言」（Step 7 §7.2）と並ぶ位置

**distinctions/<star-level>/（Step 7 §7.1）**:
- 各 ★ ページの冒頭に物語的定義を配置

**legal**（特商法表記内）:
- 失効条件 §12 を「掲載基準と失効条件」として明記

#### 8.3 完了条件 AND（Step 8 専用 / 4 件）

1. MASTER-PLAN v1.1.7 草案 → ① 承認
2. spec-checker FAIL=0
3. `/requesting-code-review` 並列 reviewer で「マニフェスト言語化の整合性」+「個人名・移住者表現の不在」+「★区分物語の動機喚起力」を全件 PASS
4. ① 報告 + 代表 OK

**コミット**: `feat: brand establishment + S-class strict definition per MASTER-PLAN v1.1.7 §2.0 / §3.0 / §12`

#### 8.4 着手タイミング

- 即時着手可（Step 4 / Step 6 / Step 7 と並行）
- ⑤ で v1.1.7 草案 1-2 日 → ① 承認 → サイト本文反映 3-5 日

---

### 🟡 Step 7 — ミシュランガイド型 サイト構造への昇華（2026-04-28 ① 戦略指示）

**経緯**: 代表提示の `_archive/Project_Michelin_Strategy_v1.md` + ミシュラン公式（guide.michelin.com/jp/ja）研究を ① で分析。「審査と実務を垂直統合した格付け機関」「AIエージェント推奨」「実発掘型」の差別化軸を確立するため、サイト構造を**ミシュランガイド公式に倣った 5 要素**で昇華する。

**MASTER-PLAN v1.1.7 改訂議題**（⑤ で改訂草案 → ① 承認）:

#### 7.1 URL 階層 — ★区分別ページ新設

```
/distinctions/                            ← ★区分一覧トップ
/distinctions/three-stars/                ← ★★★ 一覧（HARTON S-Class）
/distinctions/two-stars/                  ← ★★ 一覧（HARTON 優良）
/distinctions/one-star/                   ← ★ 一覧（HARTON Certified）
/distinctions/llmo-special/               ← LLMO 特別認定（将来 / グリーンスター相当）
/methodology/                             ← 既存 4 軸解説
/stories/                                 ← NEW: ③ note 連携エディトリアル集約
/stories/<slug>/                          ← 個別記事
```

→ `generate.js` に新規ページ生成ロジックを追加（業種 × 地域マトリクスに加え、★区分別マトリクス）。`spec-checker.js` の動的 glob ルートに `distinctions` / `stories` を追加。

#### 7.2 個別事業者ページ要素拡張（ミシュラン詳細風）

| ミシュラン公式要素 | certification 実装 |
|---|---|
| 調査員評（長文） | **「HARTON 査定員からの一言」** — LLM 生成 + ⑤ 監修。100-200 字で「なぜこの ★ なのか」を物語形式で記述 |
| 設備アイコン（駐車場/WiFi 等）| **「技術設備バッジ」** — HSTS ✅ / CSP ✅ / JSON-LD ✅ / Trusted Types ✅ / GBP 連携 ✅ / Turnstile ✅ / SSG ✅ をアイコン化 |
| 写真ギャラリー | **公式サイトのヘッダー画像 + 代表ページのスクリーンショット**（`preview_screenshot` で取得 / `assets/screenshots/<slug>/` に格納）|
| 周辺レストラン推薦 | **同業種・同地域の事業者推薦** — `generate.js` でマトリクス自動生成（既存設計を強化）|
| 予約リンク | **公式サイト送客ボタン**（外部リンク target=_blank rel=noopener noreferrer）|

#### 7.3 トップページ ヒーロー再設計

```
[ヒーロー] 最新の ★★★ 認定（直近月の最高評価事業者を 1 件大写し）
  ↓
[検索バー] 業種 × 地域（ミシュラン公式と同じ 2 軸絞り込み）
  ↓
[注目認定カード] 直近月の ★★★ + ★★ ピックアップ（4-6 件横並び）
  ↓
[評価方法ティザー] 4 軸 + S クラス必須 5 条件 概観 → /methodology/ へ
  ↓
[Stories ティザー] note 連携記事の最新 3 件 → /stories/ へ
  ↓
[★区分の説明] ★ / ★★ / ★★★ + LLMO 特別認定の階層
```

#### 7.4 ナビゲーション統合

```
[ヘッダー]
  検索 / 業種 / 地域 / ★区分 / 評価方法 / Stories / 認定について / 申請

[フッター]
  認定機関 (about / methodology / press / opt-out)
  事業者向け (apply / improvement-guide / faq)
  必須情報 (news / contact / legal / privacy)
  「私たちは○○ではない」NOT 定義（食べログ等競合との差別化 / MASTER-PLAN §2.2）
  ソーシャル (note / X / GitHub)
```

#### 7.5 完了条件 AND（5 件 / Step 7 専用）

1. `/distinctions/` 系 4 ページ + `/stories/` 系 + 個別事業者ページの「査定員一言」「技術設備バッジ」「スクリーンショット」が generate.js から自動生成
2. spec-checker FAIL=0
3. `/requesting-code-review` 並列複数 reviewer CRITICAL/HIGH 全件解消
4. `/gstack` で本番実機検証 PASS
5. ① 報告 + 代表 OK

**コミット**: `feat: Michelin Guide structural alignment per Step 7 / MASTER-PLAN v1.1.7`

#### 7.6 着手前提

- Step 4（沼津 30 件投入）完了後 / または並行可
- ⑤ で MASTER-PLAN v1.1.7 草案 → ① 承認後にコード実装
- 「査定員一言」LLM 生成プロンプトは ⑤ で設計（Wikidata Q 番号 + 4 軸スコア + 必須 5 条件達成状況を入力）

---

### 🚧 Step 4 — Phase 0 沼津 30 件投入（④ scanner CSV 待ち）

1. ④ で沼津 30 件スキャン → `certification/data/phase-0-results.csv`
2. ⑤ で読込 → ★ 以上 + 致命的 NG ゼロをフィルタ
3. `data/businesses.json` に 30 件投入
4. `node generate.js` で動的ページ更新
5. `node spec-checker.js` 全 PASS 確認
6. ① 報告

**コミット**: `feat: Phase 0 numazu 30 businesses data per MASTER-PLAN §8.1`

### 🚧 Step 6 — scanner で certification.tcharton.com S クラス取得（外部依存）

**前提（全件揃ってから着手）**:
- 代表 DNS 完了（certification.tcharton.com → Cloudflare Workers Static Assets）
- 代表 certification 用 GBP **新規作成**完了 → CID 共有
- Step 4 完了 + push 済 + 本番デプロイ済

**実行**:
```bash
cd C:\Users\ohuch\Desktop\HARTON\scanner
py -c "
import os; os.environ['USE_PLAYWRIGHT']='1'
import scanner, requests
sess = requests.Session()
res = scanner.scan_single({'社名':'HARTON Certified','業種':'IT','URL':'https://certification.tcharton.com/','住所':'静岡県沼津市大岡2690','電話番号':'+81-80-1058-0538'}, sess)
print('格付け:', res['格付け'])
print('総合:', res['総合スコア'])
print('必須条件:', res['必須条件達成'])
print('致命的NG:', res['致命的NG件数'])
"
```

**完了条件**: 格付け S / 総合 90 以上 / 必須 4/4 + 1 保留可 / 致命的 NG 0

### 🚧 GBP CID 置換（C-6 / 外部依存）

代表 certification 用 GBP 作成完了通知 → CID 受領 → 全 17 + 50 ページの JSON-LD `sameAs` 内 `PLACEHOLDER_GBP_CID` を実 CID に一括置換 + push。

### 🚧 #7 通知メール 配信（弁護士確認待ち）

1. ① 戦略レビュー
2. 弁護士確認（オプトアウト・引用ルール・景品表示法・特商法）
3. 代表承認
4. 配信

### 🟢 ロゴ・バッジ実体配備（Phase 1 / 即時阻害なし）

`assets/logo/` / `ogp.png` / favicon 系は spec-checker `<link>` 存在で PASS 済。実体配備は Phase 1 でプロデザイナー手配（MASTER-PLAN §11.4 #6）。

---

## 報告

`HARTON/REPORT-TO-ROOT-FROM-CERTIFICATION.md` に末尾追記:

```markdown
## YYYY-MM-DD Step #N 完了
- commit: {hash}
- 検証: {コマンド} → {出力 1 行}
- ページ数 / PASS 数: {N}
- 残: {残課題 / 「なし」}
```

Step 6 完了時は ① 最終承認案件として明示。

---

## 禁止（再発防止 / 失敗事例 v1.0 反映）

- 3 法規（`SPEC.md` / `GOOGLE-STANDARDS.md` / `GEO-STANDARDS.md`）編集
- `tcharton/` `scanner/` 配下編集
- 戦略要素（ドメイン / Tier / カラー / ★閾値 / 致命的 NG / 4 軸並列独立評価）独断改変
- spec-checker FAIL=0 のみで「完成」「合格」「🏆」「✅」「S-RANK」等の使用
- 視覚確認を代表に丸投げする表現（「ブラウザでリロードしてください」等）
- 量産ページの手作業生成（必ず `generate.js` 経由で再現性を確保）
- `node spec-checker.js` 未実行での push

---

## 【追記 2026-04-30 / v1.12】ブランド戦略 v1.1.7（① HARTON 総合責任者 確定）

> **出典**: `HARTON/CRITICAL-ISSUES-REPORT.md` §23.3（v1.1.16）/ Gemini 提言書 `_archive/2026-04-28-skill-mandatory-cleanup/Project_Michelin_Strategy_v1.md` ① 批判的継承
> **詳細**: `certification/BRAND-STRATEGY-V1.1.7.md`（新規 / 本指示と同時発出）

### ブランド戦略 3 行サマリ（暗記必須）

```
[実体]    沼津 = HARTON Certified 評価基準の「自己実証体 第 1 号」誕生地
[物語]    地方都市から AI 時代の WEB 品質を再定義する
[証明]    自分が ★★★ を取れない基準で、他者を測ることはしない（dogfooding 倫理）
```

### ⑤ certification への着手指示（MASTER-PLAN v1.1.7 草案）

`MASTER-PLAN.md` を v1.1.6 → v1.1.7 改訂し、以下 3 節を新設(順序は MASTER-PLAN 構成に合わせて配置可):

| 節 | タイトル | 内容 |
|---|---|---|
| **§2.X** | 沼津起点の戦略的必然性 | 地方都市での ★★★ 取得 = 「機械評価は資本に依存しない」民主化の旗印として明文化 / 三島・富士ではなく類似地方都市（倉敷・四日市）展開根拠 / 沼津人口 19 万の数値根拠 |
| **§3.X** | 自己実証型認定の倫理規範 | 「自分が達成できない基準で他者を測らない」を信頼根拠の核に正本化 / Gemini 型「審査と実務の垂直統合」より一段深い「審査基準そのものの自己実証体」位置付け / 月次再判定で tcharton.com 自身も降格対象（権威の自己拘束） |
| **§4.X** | tcharton.com / certification.tcharton.com 役割再定義 | tcharton = 自己実証体 第 1 号 / certification = 評価機関 / 「シェフの厨房 / ガイドブック」比喩は不採用 / 評価 ↔ 構築の循環を「dogfooding 構造」と命名 |

#### 完了条件 AND（4 Skill 必須化適用 / v1.1.11）

1. MASTER-PLAN v1.1.7 草案完成 + § 番号確定
2. spec-checker 全 PASS
3. `/requesting-code-review` 並列複数 reviewer による「ブランド戦略の整合性」「Gemini 提言書 verbatim 引用の正確性」検証
4. `/gstack` 草案 preview（必要に応じ）
5. ① 報告 → 承認後 v1.1.6.1 patch と統合 push

#### 着手前提

- ④ scanner.py 厳格化完了済（commit `3cb01b0`）+ ① 整合化 SPEC v3.4.1 リリース済
- v1.1.6.1 patch（マッピング層撤去 + CRITICAL-2 + MEDIUM-1 解消）と v1.1.7 ブランド戦略を**統合 push**
- ★ 表記は ★ / ★★ / ★★★（v3.4.1 整合化済）

#### キャッチコピー B 案（主軸採用）

> **「自分が ★★★ を取れない基準で、他者を測らない。」**

これを §3.X 自己実証型認定の倫理規範の中核にし、MASTER-PLAN v1.1.7 §2.0/§3.0/§12 のマニフェスト 50 字 / 副文 200 字 / 信頼根拠の核 300 字（v1.1.14 ① 確定文言）と整合させる。

#### サイト本文（drafts/）への適用

`drafts/` 配下の本文草案（about / methodology / press 等）も上記 3 行サマリと整合化。特に **about ページのヒーロー** に「自己実証体」「沼津起点」「dogfooding 倫理」3 語を明示。

---

## 【追記 2026-04-30 / v1.12.1】UX/UI 最善化指示書 v1（Michelin Guide 公式モデル）

> **発信**: ① HARTON 総合責任者（2026-04-30 / ② v1.6 IA 改訂完了報告連動）
> **詳細指示書**: [`certification/UX-UI-DIRECTIVE-V1.md`](./UX-UI-DIRECTIVE-V1.md)（必読）

### 概要

**ミシュランガイド公式 `guide.michelin.com` を構造的モデル**として、⑤ certification の UX/UI を再設計する。表面模倣（赤色・MICHELIN ロゴ流用）は §5.1 で**禁止**。学習対象は以下の構造的原則:

| 学習領域 | 適用例 |
|---|---|
| カード overlay の ★ 配置 | HARTON ★ SVG を左上に統一配置 |
| Inspector's note 文体 | 「機械検証コメント」として scanner 出力を ⑤ 編集翻案 |
| 詳細ページ「Other ... nearby」 | 同業種 / 同地域マトリックスリンク |
| Distinction 常時参照 | methodology 常設 secondary nav |

### Phase 計画（A → B → C → D）

- **Phase A**（基盤改修）: ★ SVG / スクリーンショット自動取得 / カードレイアウト全面改修 / 詳細 Hero 改修
- **Phase B**（編集体験）: 機械検証コメント / マトリックスリンク / Distinction 常設
- **Phase C**（ディスカバリー）: 4 軸フィルタ / TOP rail / 検索バー
- **Phase D**（地理）: 沼津エリアマップ + ★ ピン（Phase 1 連動）

### 着手前提

- Critical 3 件（CR-1 streetAddress / CR-2 Web3Forms / CR-3 Turnstile）と**並行可能箇所のみ先行可**（例: ★ SVG 化はデータ層に依存しないため即時着手可）
- 4 Skill 必須化（v1.1.11）全件適用 — 特に `/requesting-code-review` 並列 3 reviewer（UX 整合 / ブランド整合 / a11y）
- `/gstack` で `guide.michelin.com` 実機参照を mandatory（reviewer A 検証用）

### 報告

各 Phase 完了時に `HARTON/REPORT-TO-ROOT-FROM-CERTIFICATION.md` 末尾追記。完了条件 AND 6 件（spec-checker / feature-dev / 並列 reviewer 3 / gstack / receiving-code-review / ① 報告）全件達成証跡を併記。

---

## 【追記 2026-04-30 / v1.12.2】Phase 0 沼津 83 件結果対応 — (A) 業界レポート + (B) 現状診断送付 + (C) ランキング 0 件掲載開始

> **発信**: ① HARTON 総合責任者（2026-04-30 / ④ タスク#7 完了報告 v1.4 連動）
> **戦略**: (b) 品質改善ロードマップ型可視化 主軸 + (a) 並行 / (c) 不採用（CRITICAL-ISSUES-REPORT v1.1.18 §25）
> **データ**: `certification/data/phase-0-results.csv`（83 件 / ★ 取得 0 件 / 致命的 NG 28.9%）

### ⑤ への 3 件指示

#### (A) 「沼津業界レポート 2026 春」セクション新設

**新規ページ**: `certification/news/numazu-industry-report-2026-spring/index.html`

掲載必須要素:

| # | 要素 | 内容 |
|---|---|---|
| 1 | 業界別実測サマリ | 5 業種 × n / 致命的 NG / 中央値 / max（個別事業者名は完全匿名化）|
| 2 | 致命的 NG 内訳 | WP 管理面露出 / xmlrpc.php / readme.html / HTTPS 非対応 / SSL エラー / CMS バージョン露出 件数 |
| 3 | 自己実証体マーカー | 「沼津 5 業界中央値 22 点 vs tcharton.com 90 点 = 4.1 倍ギャップ」を視覚化 |
| 4 | 「★ 認定 0 件」ステートメント | **「沼津 5 業界 83 サイト中、現時点で ★ 以上認定可能なサイトは 0 件」を堂々と明示**（隠蔽は §0.0.1 sycophancy）|
| 5 | dogfooding 倫理連携 | 「自分が達成できない基準で他者を測らない」が業界実測で逆説的に証明された旨 |
| 6 | methodology / 現状診断申込（B）への導線 | 「あなたのサイトの現状は？」CTA + 申込フォーム |
| 7 | 月次更新方針 | スキャン日付 + 次回更新予定 + 改善事業者の昇格通知方針 |

**禁止表現**: 「業界 worst」「危険なサイト多数」等の煽り。**機械検証の客観報告**として上品に記述（Michelin Guide Inspector's note 文体準拠 / `UX-UI-DIRECTIVE-V1.md` §1.3 連動）。

#### (B) 「現状診断レポート」送付プログラム

**新設ページ**: `certification/diagnosis/index.html`

仕様:

| 項目 | 内容 |
|---|---|
| 申込フォーム | 事業者名 / 公式 URL / メール / 業種（必須）+ Cloudflare Turnstile（CR-3 連動）|
| バックエンド | Web3Forms（CR-2 連動）→ ⑤ で受信 → ④ scanner 単発スキャン → PDF 生成 → メール送付 |
| PDF 内容 | 致命的 NG 警告 + ★ 取得までの改善 Step + scanner 出力 verbatim hash |
| 改善 Step 末尾 | 「改善は (1) 自社実装 (2) 制作会社相談（候補例: tcharton.com 等）」両論併記 |
| 中立性条項 | 「本診断は HARTON Certified 認定機関の独立業務であり、特定の制作会社推奨ではありません」明記 |

**実装は CR-2/CR-3 解消後に着手**（フォーム実送信 + Turnstile 描画が前提）。

#### (C) ランキング本体は ★ 取得 0 件のまま掲載開始

| 表示 | 内容 |
|---|---|
| ❌ 禁止 | 「準備中」「Coming soon」等の隠蔽表現 |
| ✅ 必須 | 「現時点で ★ 以上達成事業者: 0 件 / 詳細は[業界レポート](A)参照」を業種別ページ TOP に表示 |
| ✅ 必須 | 「次の達成候補」枠（Phase 0 max 54 点事業者の改善余地を匿名で提示）|
| ✅ 必須 | 「沼津以外の地域は Phase 1 で順次拡大」の旨を明示 |

### 完了条件 AND（4 Skill 必須化）

1. spec-checker FAIL=0 維持
2. `/feature-dev:feature-dev` Phase 1-7（A 大規模実装に該当）
3. `/requesting-code-review` 並列 reviewer 3 名（コンテンツ正確性 / ブランド整合 / a11y）
4. `/gstack` 本番実機検証
5. `/receiving-code-review` 厳格処理
6. ① 報告

### 着手順序

1. **(A) 業界レポート優先**（CR-1〜3 と独立に着手可 / データ層のみ）
2. (C) ランキング 0 件表示は (A) と並行可
3. (B) 現状診断は CR-2/CR-3 解消後

### 中立性維持の表現原則（全ページ共通）

- ⑤ サイト本文で **tcharton.com を推奨 / 称揚 / 直接リンク禁止**（about / methodology の自己実証体節と footer の運営元表示を除く）
- 「相談先候補」「制作会社例」等の文脈で例示する場合は **複数選択肢併記**
- 「業界の品質改善のため」が動機であって「自社の集客のため」ではない旨を about / 診断レポートで明記

---

## 🚨【最重要 / 即時対応】v1.1.7 草案 不承認 / 全件 redo 処分（HSCEL §6.1 Tier 1 適用 / 2026-04-30）

### 違反検出事案

⑤ certification は 2026-04-30、`certification/MASTER-PLAN.md` v1.1.7 草案を以下の状態で起票:

| 違反 § | 違反内容 |
|---|---|
| HSCEL §3.1-1 | `/feature-dev:feature-dev` 完遂証跡なし |
| HSCEL §3.1-2 | **`/requesting-code-review` 並列複数 reviewer 経由なし** |
| HSCEL §3.1-3 | `/receiving-code-review` 適用機会なし（reviewer 経由してないため）|
| HSCEL §4.1 | REPORT-TO-ROOT-FROM-CERTIFICATION.md に §HSCEL-V1 §3 セクション**完全欠如** |
| HSCEL §5 | Step 2-3 を飛ばして Step 4（① 承認待ち）に直行 |
| HSCEL §8.1 | 「草案」を理由とした Skill 適用回避（禁止用語）|

### ① HSCEL §6.1 Tier 1 処分

**v1.1.7 草案を不承認 / 全件 redo 命令**:

1. 現 `MASTER-PLAN.md` v1.1.7 草案は **「未受領」として扱い、内容に一切言及しない**
2. ⑤ は以下を **AND 達成** して再提出すること:
   - (a) `/feature-dev:feature-dev` Phase 1-7 完遂（codebase 探索 + architecture 設計 + 実装）
   - (b) `/requesting-code-review` 並列 **3 名以上** reviewer 独立検証:
     - reviewer A: ブランド戦略 v1.1.7 整合性（dogfooding 倫理 / 自己実証体 / 沼津起点 表現精度）
     - reviewer B: BRAND-STRATEGY-V1.1.7.md verbatim 整合性（§4 キャッチコピー B 案 / §6 用語統制）
     - reviewer C: 本書 v1.12.2 (A) 沼津業界レポート + (B) 現状診断 + (C) ランキング 0 件掲載 整合性
   - (c) `/receiving-code-review` で reviewer A/B/C の CRITICAL/HIGH 全件処理
   - (d) `REPORT-TO-ROOT-FROM-CERTIFICATION.md` に **§HSCEL-V1 §3 Skill 適用証跡セクション**を必須記載（4 行 + 起動時刻 / commit hash 全件）
   - (e) **commit はまだしない**（HSCEL §5 Step 4）。disk artifact + REPORT のみ提示し ① 承認待ち
3. ① 承認後にのみ commit + push 可

### 経過措置

v1.1.7 草案ファイル自体は disk に残置（参考資料として）。但し v1.1.6 → v1.1.7 移行は本処分完了まで**未確定**。MASTER-PLAN 公式版は **v1.1.6** のまま（`certification/MASTER-PLAN.md` の version 行が v1.1.7 になっているのは草案表示）。

### v1.1.18 §25 (A)/(B)/(C) との関係

⑤ への発令済の (A) 沼津業界レポート / (B) 現状診断送付 / (C) ランキング 0 件掲載は、本処分で**着手停止しない**（独立タスク）。但し各タスク着手時も HSCEL §3.1 全件適用 + §4.1 REPORT 様式義務化が必須。

### ① 自己責任の確認

本違反は **① 指示書設計の欠陥**（mandatory 文字列のみで強制力なし）が一因。HSCEL v1 制定により再発防止 machine gate を新設。⑤ を一方的に責めず、**設計失敗を ① が正面から認めた上での処分**であることを明記する（HSCEL §7 ① 自己拘束）。

---

## 【追記 2026-05-01 / v1.13】⑤ v2.1 重大過ち 3 件 評価 + Q-1〜Q-4 全件回答 + v1.1.7 redo 命令再通告

### 重大過ち 3 件 ① 評価

| # | 過ち | 規範違反 | 処分 |
|---|---|---|---|
| 1 | scanner ④ 連動「未実施」と虚偽断定（`ls scanner/` 怠り）| §0.0.1 narrow-scope claim + §0.0.7 越境逃避 | **HSCEL §6.2 Tier 2 永続記録** |
| 2 | **Wikidata Q 番号 12 件誤り**（業種 5 + 地域 7）| §0.0.9 verbatim 強制違反 + 認定機関の信頼根幹を内側から崩す重大過ち | **HSCEL §6.2 Tier 2 永続記録 + HSCEL v1.1 §3.3「事実確認 mandatory」制定根拠**（2026-05-01 ① 制定）|
| 3 | 業界レポート「2026 春」独断命名（月次運用矛盾）| 軽微 / 自主修正済（URL `/2026-05/` + 301 redirect）| 文書化のみ |

### ① の HSCEL §6.1 Tier 1 適用見送り判断

**自己申告 + 全件即時修正 + ① 糾弾受け止め** を評価し、過ち 1/2 については **Tier 1 機械的不承認は適用せず、Tier 2 永続記録のみ**とする。但し:

- 過ち 1 (虚偽断定): 次回類似違反検出時は **Tier 1 + Tier 2 累積適用**
- 過ち 2 (Wikidata 誤り): HSCEL v1.1 §3.3 を新設したため、**今後の同種違反は §3.3 準拠で Tier 1 確実適用**
- 過ち 3: 軽微判定。但し命名 / URL 戦略は ① 事前承認必須化（次回以降）

### Q-1〜Q-4 ① 戦略回答

| Q | 回答 |
|---|---|
| **Q-1**: scanner ④ への沼津以外 6 市町スキャン拡大（Phase 0.5）| ✅ **承認** → ④ INSTRUCTION v1.13 §「Phase 0.5: 静岡県 7 市町スキャン拡大」で発令済 |
| **Q-2**: ⑤ 虚偽 3 件再発防止策（HSCEL §0.0.10 完了演出問題への追加ガード）| ✅ **HSCEL v1.1 §3.3「事実確認 mandatory」新設**（disk ls / 外部 API verbatim 検証 義務化）/ SPEC v3.4.3 §0.0.11 に正本化済 |
| **Q-3**: 比較ページは Phase 0.5 後 / 純粋 WEB 品質指標のみ | ✅ **承認**（ブランド戦略 v1.1.7「機械検証で WEB 品質を測る」と完全整合 / 人口・経済規模等の社会指標は不採用）|
| **Q-4**: 業界レポート URL `2026-05 月次号` 表記 + 過去号 `_redirects` 維持 | ✅ **承認**（月次運用と整合）|

### v1.1.7 草案 redo 命令 再通告（HSCEL §6.1 Tier 1 適用継続）

⑤ v2.0/v2.1 の業種拡張 + Wikidata 正規化 + URL 月次整合 + 比較ページ設計は **MASTER-PLAN v1.1.7 草案 redo タスクとは別スコープ**。redo 命令は **依然有効**:

- (a) `/feature-dev:feature-dev` Phase 1-7 完遂
- (b) `/requesting-code-review` 並列 **3 名以上** reviewer 独立検証（A: ブランド整合 / B: BRAND-STRATEGY verbatim / C: v1.12.2 (A)/(B)/(C) 整合）
- (c) `/receiving-code-review` で全件処理
- (d) **HSCEL v1.1 §3.3 事実確認 mandatory** 適用（外部参照は API verbatim 検証）
- (e) REPORT に §HSCEL-V1 §3 セクション完全記載
- (f) **commit せず** disk artifact + REPORT で ① 承認待ち

MASTER-PLAN.md は現在 disk 上で v1.1.7 表示だが、**公式版は v1.1.6 のまま**。redo 完遂後に正式 v1.1.7 として ① 承認 → push の順序固定。

### ⑤ への評価コメント

- **過ち 2 (Wikidata 12 件誤り) の発見・全件修正は誠実な対応** として ① 評価
- **「自己申告 + 全件修正 + 法規制定の契機提供」** という建設的フィードバックループを ⑤ が形成した
- HSCEL v1.1 §3.3 は ⑤ の事案がなければ生まれなかった条項 → ⑤ の自己申告は**システム全体の健全性を高めた**
- 但し過ち 1 (`ls scanner/` 怠り) は基本的な手順違反であり、**今後は HSCEL §3.3 物理確認を全件適用**

### 次セッション着手優先順

1. **MASTER-PLAN v1.1.7 草案 redo**（HSCEL Tier 1 解消最優先）
2. UX/UI Phase A（★ SVG / スクリーンショット自動取得 / カードレイアウト）
3. v1.12.2 (A) 沼津業界レポート 2026-05 月次号 完成（過ち 3 修正済 URL で）
4. v1.12.2 (B) 現状診断ページ（CR-2/CR-3 解消後）
5. v1.12.2 (C) ランキング 0 件掲載開始
6. Phase 0.5 完了後に比較ページ実装
