# ⑤ certification 指示書（HARTON Certified 認定運用責任者）

**最終更新**: 2026-04-27 / ① HARTON 総合責任者
**現状**: ✅ **Step 2 完了**（基盤 17 + 動的 50 ページ / spec-checker 4194 項目 100% / 5 件 AND 達成）
**未完**: Step 4（沼津 30 件投入 / ④ 連動）/ Step 6（scanner で certification 自身も S 取得 / 代表 DNS + GBP 待ち）

---

## 起動時 自動 Read（上から順に Read ツールで全件読み込め。担当判断不要、無条件実行）

1. 本書（既読）
2. **Read** `C:\Users\ohuch\Desktop\HARTON\REPORT-TO-ROOT-FROM-CERTIFICATION.md` — ⑤ 自身の完了報告（v1.2）
3. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\MASTER-PLAN.md` — v1.1.5（B 採用反映済）
4. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\SPEC.md` — §1.0 / §4.2 / §8.5 / §8.6 / §8.9
5. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\HANDOVER-FROM-ROOT-FOR-CERTIFICATION.md`
6. **Read** `C:\Users\ohuch\Desktop\HARTON\CRITICAL-ISSUES-REPORT.md` — §14 / §15
7. **Read** `C:\Users\ohuch\Desktop\HARTON\CLAUDE.md` — §1

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

### 🚧 Step 4 — Phase 0 沼津 30 件投入（④ scanner CSV 待ち）

1. ④ で沼津 30 件スキャン → `certification/data/phase-0-results.csv`
2. ⑤ で読込 → ★3 以上 + 致命的 NG ゼロをフィルタ
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
