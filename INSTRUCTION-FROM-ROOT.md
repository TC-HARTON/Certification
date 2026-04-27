# ⑤ certification 指示書（HARTON Certified 認定運用責任者）

**発行**: 2026-04-27 / ① HARTON 総合責任者
**目標**: certification.tcharton.com 構築 + **自身も scanner で S クラス（必須 5/5 + 90 点）取得** + Phase 0 沼津 30 件

---

## 起動時 自動 Read（上から順に Read ツールで全件読み込め。担当判断不要、無条件実行）

1. 本書（既読）
2. **Read** `C:\Users\ohuch\Desktop\HARTON\REPORT-TO-ROOT-FROM-CERTIFICATION.md` — ⑤ 自身の前回完了報告（Step 1/3/5/#7/#8 完了 + 整合性課題 6 件エスカレーション）
3. **Read** `C:\Users\ohuch\Desktop\HARTON\CRITICAL-ISSUES-REPORT.md` — §14（① 整合性課題 6 件解決）+ §13（tcharton S 取得）+ §12（v1.1.4 経緯）
4. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\MASTER-PLAN.md` — 戦略全体（v1.1.4）
5. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\HANDOVER-FROM-ROOT-FOR-CERTIFICATION.md` — ⑤ 専用統制
6. **Read** `C:\Users\ohuch\Desktop\HARTON\certification\SPEC.md` — §1.0 / §4.2 #1 / §8.1 / §8.5-§8.9
7. **Read** `C:\Users\ohuch\Desktop\HARTON\CLAUDE.md` — §1（役割名称 + 報告義務）

全 7 件 Read 完了 → 本書「ロードマップ」へ。途中で代表へ確認・許可要請禁止。

---

## ① による整合性課題 解決状況（Step 2 着手前提）

| # | 課題 | 解決 |
|---|---|---|
| C-1 | spec-checker.js `c11_3_eeat()` profile/ → about/ | ✅ |
| C-2 | Tailwind 環境配備 | ✅ `package.json` / `tailwind.config.js` / `src/input.css` 配置済 |
| C-3 | `getVariant()` MASTER-PLAN §4.1 整合 | ✅ |
| C-4 | レポート見出し v3.4 / 22 ページ設計 | ✅ |
| C-5 | `_headers` `script-src 'self'`（inline 不使用 static design）| ✅ ⑤ 暫定追認 |
| C-6 | certification 用 GBP **新規作成**（独立認定機関の中立性）| 🚧 代表手動作業 |

詳細: `HARTON/CRITICAL-ISSUES-REPORT.md` §14。

---

## ロードマップ（順守 / 8 タスク）

| Step | タスク | 状態 | 依存 |
|---|---|---|---|
| 1 | 基盤配置（_headers / _redirects / templates/_layout.html）| ✅ 完了 | — |
| 2 | 基盤 17 ページ手作業構築 | 🔴 **本セッション最優先** | C-1〜C-3 ✅ + Tailwind ビルド |
| 3 | data/ JSON 構造（industries / regions / businesses 雛形）| ✅ 完了 | — |
| 4 | Phase 0 沼津 30 件投入 | ⏸ ④ scanner CSV 待ち | — |
| 5 | generate.js 最小実装 | ✅ 完了 | — |
| 6 | scanner で S クラス取得確認 | ⏸ 代表 DNS + GBP 新規作成待ち | Step 2/4 完了 |
| #7 | 認定対象事業者 通知メール文案 | ✅ 草案 v0.1 | 弁護士確認待ち |
| #8 | MASTER-PLAN.md v1.1.4 改訂 | ✅ 完了 | — |

---

## 本セッション最優先: Step 2 — 基盤 17 ページ手作業構築

### 事前準備（必ず最初に実行）

```bash
cd C:\Users\ohuch\Desktop\HARTON\certification
npm install
npx tailwindcss -i src/input.css -o dist/output.css
```

**完了条件**: `dist/output.css` 生成

### 17 ページ要件

| 階層 | URL | type | 必須要素 |
|---|---|---|---|
| TOP | `/` | full | 高度 JSON-LD 5 種 / ブランドナラティブ / 4 セグメント CTA |
| 信頼の核 | `/about/` | subpage | HARTON 紹介 + 代表略歴（**E-E-A-T 担保元**）|
| 信頼の核 | `/methodology/` | hub | 4 軸概観 + 各軸への導線 |
| 信頼の核 | `/methodology/technical/` | subpage | A 軸 基礎・身だしなみ |
| 信頼の核 | `/methodology/security/` | subpage | B 軸 防御力・生存率 |
| 信頼の核 | `/methodology/ai-search/` | subpage | C 軸 AI 検索適応 |
| 信頼の核 | `/methodology/business-impact/` | subpage | D 軸 経営インパクト |
| 動線 | `/apply/` | subpage | **C 向け CTA / tcharton.com 送客 ★最重要** |
| 動線 | `/improvement-guide/` | subpage | B+C 向け改善ガイダンス |
| 動線 | `/press/` | subpage | D 向けメディア素材 |
| 動線 | `/opt-out/` | minimal | 掲載拒否権 |
| 必須 | `/faq/` | subpage | よくある質問 |
| 必須 | `/news/` | subpage | お知らせ |
| 必須 | `/contact/` | subpage | 問合せ + Cloudflare Turnstile（§8.5 #4 / §8.8）|
| 必須 | `/legal/` | minimal | 利用規約・特商法 |
| 必須 | `/privacy/` | minimal | プライバシーポリシー |
| 補助 | `/404.html` | minimal | エラーページ |

**全ページ共通要件（SPEC v3.4 §4.2 #1）**:
- JSON-LD `Organization` の `@type: ["Organization"]`（配列形式）
- `additionalType: ["https://www.wikidata.org/wiki/Q11661"]`（IT・認定機関）
- `sameAs`: 代表 GBP 新規作成（C-6）後に追記 + tcharton.com / note.com

**完了条件**: `node spec-checker.js` → FAIL=0
**コミット**: `feat: certification base 17 pages built per SPEC v3.4`

---

## Step 4 — Phase 0 沼津 30 件投入（④ CSV 受領後）

1. ④ scanner で沼津 30 件スキャン完了 → `scanner/results.csv` 出力（待機中）
2. ⑤ で CSV 読込 → ★3 以上 + 致命的 NG ゼロをフィルタ
3. `data/businesses.json` に変換投入（30 行 + slug 付与）
4. ① 報告

**コミット**: `feat: Phase 0 numazu 30 businesses data per MASTER-PLAN §8.1`

---

## Step 6 — scanner で certification S クラス取得確認

### 前提（全件揃ってから着手）
- 代表 DNS 完了（certification.tcharton.com → Cloudflare Workers Static Assets）
- 代表 GBP **新規作成**完了 → CID 共有
- Step 2 / 4 完了 + push 済 + 本番デプロイ済

### 実行

```bash
cd C:\Users\ohuch\Desktop\HARTON\scanner
py -c "
import os; os.environ['USE_PLAYWRIGHT']='1'
import scanner, requests
sess = requests.Session()
res = scanner.scan_single({'社名':'HARTON Certified','業種':'IT','URL':'https://certification.tcharton.com/','住所':'静岡県沼津市','電話番号':''}, sess)
print('格付け:', res['格付け'])
print('総合:', res['総合スコア'])
print('必須条件:', res['必須条件達成'])
print('致命的NG:', res['致命的NG件数'])
"
```

**完了条件（全て満たす）**:
- 格付け: `S`
- 総合: 90 以上
- 必須条件: `4/4` 以上 + 1 保留可
- 致命的 NG: 0

---

## #7 — 通知メール（弁護士確認待ち）

`certification/drafts/notification-template.md` v0.1 草案保管済。配信前必須プロセス:
1. ① 戦略レビュー
2. 弁護士確認（オプトアウト・引用ルール・景品表示法・特商法）
3. 代表承認
4. 配信

---

## 報告

各タスク完了時、`HARTON/REPORT-TO-ROOT-FROM-CERTIFICATION.md` に末尾追記:

```markdown
## 2026-MM-DD Step #N 完了
- commit: {hash}
- 検証: {コマンド} → {出力 1 行}
- ページ数 / PASS 数: {N}
- 残: {残課題 / 「なし」}
```

#6 完了時は ① 最終承認案件として明示。

---

## 待ち合わせ

- **Step 4**: ④ scanner CSV 出力待ち
- **Step 6**: 代表 DNS 完了 + 代表 GBP 新規作成完了待ち
- **#7 配信**: 弁護士確認待ち

---

## 禁止

- 3 法規（`SPEC.md` / `GOOGLE-STANDARDS.md` / `GEO-STANDARDS.md`）編集
- `tcharton/` `scanner/` 配下編集
- 戦略要素（ドメイン / Tier / カラー / ★閾値 / 致命的 NG / 4 軸並列独立評価）独断改変
- 量産ページの手作業生成（必ず `generate.js` 経由で再現性を確保）
- `node spec-checker.js` 未実行での push
