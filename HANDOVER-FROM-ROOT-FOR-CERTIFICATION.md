# HARTON Certified ⑤ への統制申し送り書（高度マーケティング格付けサイト担当）

**版**: 1.0
**作成日**: 2026-04-27
**作成セッション**: ① HARTON 総合責任者
**対象セッション**: ⑤ **HARTON Certified 認定運用責任者**（高度マーケティング格付けサイト担当）
**位置付け**: ① から ⑤ への正式な統制申し送り。SPEC v3.3 改訂を契機に、⑤ が把握すべき全項目と即時タスクを整理
**準拠**: SPEC v3.3 §0.0.7（マルチセッション境界 + 報告義務 mandatory 5 項目）

---

## 0. ⑤ HARTON Certified 認定運用責任者のポジション

### 0.1 役割名称（v3.3 / 2026-04-27 確定）

⑤ HARTON Certified 認定運用責任者 = **高度マーケティング格付けサイト担当**

```
[① HARTON 総合責任者]  ← 戦略・3 法規・最終承認
   ├─ ② S クラスサイト構築責任者（tcharton）
   ├─ ③ ブログ担当（note）
   ├─ ④ S クラス最高技術責任者（scanner）  …  S クラス基準の技術定義
   └─ ⑤ 高度マーケティング格付けサイト担当（certification）  ← あなた
       └─ certification.tcharton.com の構築・運用・認定機関ブランド形成
```

### 0.2 ⑤ の専権事項

| 領域 | 内容 | 委任関係 |
|---|---|---|
| **HARTON Certified サイト本文** | drafts/ 配下の認定機関サイト本文執筆 | ⑤ 主導、① 戦略承認 |
| **MASTER-PLAN.md 運用** | 戦略マスター v1.1.3 の現場展開 | ⑤ 運用、① 改訂承認 |
| **Phase 0 沼津パイロット 30 件** | スキャン対象決定 / 結果集計 / 認定判定 | ⑤ 主導、④ scanner 連携、① 最終承認 |
| **ロゴ・バッジ素材** | assets/{logo,badges}/ 配下の制作 | ⑤ 主導、① 戦略承認 |
| **認定機関ブランドナラティブ** | docs/narrative.md 等の運用 | ⑤ 主導、① 戦略承認 |

### 0.3 ⑤ の禁止事項（§0.0.7 越境違反）

| ❌ 禁止行動 | 理由 |
|---|---|
| 3 法規（SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md）を編集 | 正本はルート ①。`certification/` 配下は **生成物** |
| MASTER-PLAN.md の戦略要素（ドメイン / Tier / カラー / ★閾値 / 致命的 NG / 4 軸並列独立評価）を独断改変 | 戦略確定済（v1.1.3 で SPEC v3.3 §8.5/§8.6 整合化済）、改訂は ① 専権 |
| scanner.py / scanner/* を編集 | ④ S クラス最高技術責任者の専権 |
| tcharton.com サイト本体を編集 | ② S クラスサイト構築責任者の専権 |
| 本書（HANDOVER-FROM-ROOT-FOR-CERTIFICATION.md）の改訂 | ① のみ改訂可能（⑤ は読むだけ）|

---

## 1. ⑤ への配布文書一覧（2026-04-27 ① 配布）

`certification/` 配下に以下を配置済。すべて**参照用コピー**であり、最新版・正本はルート HARTON/ にある:

| 文書 | パス | 版 | 用途 |
|---|---|---|---|
| **本書** | `certification/HANDOVER-FROM-ROOT-FOR-CERTIFICATION.md` | v1.0 | ⑤ 専用統制申し送り書（直接編集禁止）|
| MASTER-PLAN | `certification/MASTER-PLAN.md` | v1.1.3 | HARTON Certified 戦略マスター（⑤ 運用、① 改訂承認） |
| SPEC.md | `certification/SPEC.md` | v3.3 | 3 法規本体（生成物・編集禁止）|
| GOOGLE-STANDARDS.md | `certification/GOOGLE-STANDARDS.md` | v2.0 | 3 法規（生成物・編集禁止）|
| GEO-STANDARDS.md | `certification/GEO-STANDARDS.md` | v2.1 | 3 法規（生成物・編集禁止）|
| **CRITICAL-ISSUES-REPORT** | `certification/CRITICAL-ISSUES-REPORT.md` | v1.1.3 | 21+ 課題集約 + ① 確定記録（参照コピー）|
| **HANDOVER-FROM-ROOT** | `certification/HANDOVER-FROM-ROOT.md` | v1.2 | ① の統制申し送り書（参照コピー）|
| **TCHARTON-AUDIT-REPORT** | `certification/TCHARTON-AUDIT-REPORT.md` | v1.0 | tcharton.com 監査報告（④ 起票、参照コピー）|
| SESSION-PROMPTS | `certification/SESSION-PROMPTS.md` | v1.1 | ⑤ 起動プロンプト集 |
| docs/scanner-tbd-confirmed.md | `certification/docs/scanner-tbd-confirmed.md` | v1.0 | scanner TBD 確定書 |
| docs/* | `certification/docs/` 配下 | 各種 | narrative / methodology / user-journeys / competitive / logo-badge-brief / kpi 等 |

### 1.1 配布された ① 統制文書の参照優先順位（⑤ が読む順序）

```
[Step 1] 本書（HANDOVER-FROM-ROOT-FOR-CERTIFICATION.md）を Read
[Step 2] MASTER-PLAN.md v1.1.3 を Read（特に冒頭「v1.1.3 改訂サマリ」）
[Step 3] CRITICAL-ISSUES-REPORT.md v1.1.3 を Read（特に §11 v1.1.3 確定記録）
[Step 4] HANDOVER-FROM-ROOT.md v1.2 を Read（特に §11 v1.2 反映事項）
[Step 5] TCHARTON-AUDIT-REPORT.md を Read（自社サイト C/65 判定の経緯）
[Step 6] SPEC.md v3.3 §8.5（S クラス必須 5 条件）+ §8.6（致命的 NG）を Read
[Step 7] node sync-spec.js --check で 3 法規同期確認（次回起動時の必須義務）
```

---

## 2. SPEC v3.3 改訂が ⑤ に与える影響

### 2.1 ⑤ MASTER-PLAN への影響（v1.1.3 で連動済）

| SPEC v3.3 改訂項目 | MASTER-PLAN への反映 | 状態 |
|---|---|---|
| §8.5 S クラス必須 5 条件 SPEC 本体正本化 | MASTER-PLAN §3.3 が SPEC §8.5 と完全整合 | ✅ 整合確認済（参照リンク追加済）|
| §8.6 致命的 NG 4 項目 SPEC 本体正本化 | MASTER-PLAN §3.4 が SPEC §8.6 と完全整合 | ✅ 整合確認済（参照リンク追加済）|
| §1.0.1「Sクラス」用語の二層構造 | MASTER-PLAN 本文の用語使用時に評価エンジン併記原則 | ✅ ⑤ で運用ルール確認済 |
| §8.7 Cookie 属性 / §8.8 ボット防御 / §8.9 SSG | 認定基準の SPEC 本体正本化 | ✅ MASTER-PLAN は scanner 連動のため自動反映 |

### 2.2 ⑤ への報告義務（v3.3 §0.0.7 mandatory 5 項目）

| # | 報告タイミング | 内容 |
|---|---|---|
| 1 | **完了報告** | サイト構築・MASTER-PLAN 改訂提案・Phase 0 リスト確定 等の完了時、disk artifact / commit / 実証データで ① に証跡化報告 |
| 2 | **失敗・未検証の自己申告** | H-3 Failure-Self-Report、隠蔽は §0.0.1 背任 |
| 3 | **エスカレーション** | 戦略仕様・3 法規変更要請・MASTER-PLAN 大規模改訂は ① 判断要請 |
| 4 | **整合性確認** | ① で 3 法規変更後、次回起動時に `node sync-spec.js --check` 実行義務 |
| 5 | **S クラス基準保持** | ④ scanner 判定基準を遵守し、認定運用に正確に反映 |

### 2.3 用語の正確性ルール（v3.3 §1.0.1 連動）

⑤ が制作する**全ての成果物**（サイト本文・docs/*・assets/* 内テキスト・プレスリリース・営業資料 等）で「S クラス」「S-RANK」を使う場合、**評価エンジンを併記**して用語を区別:

| ✅ 採用 | ❌ 禁止 |
|---|---|
| 「scanner で **HARTON Certified S クラス**取得」（必須 5 条件 + 90 点）| 「S クラス」とのみ単独使用 |
| 「HARTON 自社サイトは **spec-checker S-RANK** 達成」（2554 項目）| 「S-RANK」とのみ単独使用 |
| 「機械検証で公正評価する」「scanner.py 判定」 | 「我々の独自基準」（曖昧） |

詳細: `SPEC.md` v3.3 §1.0.1「Sクラス用語の二層構造」参照。

---

## 3. ⑤ の即時タスクリスト（① 承認済 / 優先順）

### 3.1 🔴 即時（〜2026-05-04）

| # | タスク | 出典 | 完了報告先 |
|---|---|---|---|
| 1 | 配布文書 7 点（本書 + MASTER-PLAN v1.1.3 + CRITICAL-ISSUES-REPORT v1.1.3 + HANDOVER-FROM-ROOT v1.2 + TCHARTON-AUDIT v1.0 + SPEC v3.3 §8.5/§8.6 + SESSION-PROMPTS）を順次 Read し現状把握 | 本書 §1.1 | ① 把握完了報告 |
| 2 | MASTER-PLAN v1.1.3 の整合性確認（SPEC v3.3 §8.5/§8.6 との対応）| MASTER-PLAN 冒頭「v1.1.3 改訂サマリ」 | 確認結果を ① 報告 |
| 3 | Phase 0 沼津パイロット 30 件のターゲットリスト確定 | MASTER-PLAN §11.4 / SESSION-PROMPTS Prompt 4 | リスト確定時 ① 承認 |
| 4 | 認定対象事業者への通知メール文案作成 | MASTER-PLAN §11.4 / SESSION-PROMPTS Prompt 5 | 草稿時 ① レビュー |

### 3.2 🟡 短期（2026-05〜2026-06）

| # | タスク | 出典 | 完了報告先 |
|---|---|---|---|
| 5 | サイト基盤構築（HTML/CSS/JS 骨格、SPEC v3.3 §1.0 原則 4 で `_headers` 必須化済）| SESSION-PROMPTS Prompt 2 | 骨格完成時 ① 承認 |
| 6 | ロゴ AI 生成試作 5-10 案 | docs/logo-badge-brief.md | 試作完了時 ① 承認 |
| 7 | バッジ素材（assets/badges/）制作 | docs/logo-badge-brief.md | 制作完了時 ① 承認 |
| 8 | drafts/ 配下のサイト本文執筆（22 ページ想定）| MASTER-PLAN §10 | 各ページ草稿時 ① レビュー |

### 3.3 🟢 中期（2026-07〜）

| # | タスク | 出典 | 完了報告先 |
|---|---|---|---|
| 9 | DNS 設定要請（certification.tcharton.com） | MASTER-PLAN §1.2 / 本書 §4 | 代表対応事項として ① 経由要請 |
| 10 | Cloudflare Pages 設定（サブドメイン追加） | 同上 | 同上 |
| 11 | 弁護士相談（オプトアウト・引用ルール）| MASTER-PLAN §11.2 | Phase 0 開始前に代表経由 |
| 12 | Phase 1 静岡県東部展開準備（200 件）| MASTER-PLAN §0.5 | Phase 0 完了後 ① 承認 |

---

## 4. 代表（外部）対応待ち事項

⑤ は以下を ① 経由で代表に依頼するか、進捗確認する:

| # | 内容 | タイミング | 主体 |
|---|---|---|---|
| 1 | DNS 設定（certification.tcharton.com） | ⑤ 着手前 | 代表（HARTON ドメイン管理） |
| 2 | Cloudflare Pages 設定（サブドメイン追加） | 同上 | 代表 |
| 3 | 弁護士相談（オプトアウト・引用ルール検証） | Phase 0 開始前 | 代表 |
| 4 | 商標登録（HARTON Certified ブランド保護） | Phase 1 完了時 | 代表 |
| 5 | プロデザイナー手配（ロゴ・バッジ確定版） | Phase 1 開始時 | 代表 |
| 6 | PR 会社（Phase 1 メディア展開時）| Phase 1 後半 | 代表 |

---

## 5. ② tcharton 改修との連携

### 5.1 ② で進行中の改修（2026-04-27 代表宣言）

② **S クラスサイト構築責任者**は、TCHARTON-AUDIT-REPORT.md（B 軸セキュリティヘッダー全項目未配信、scanner C/65 判定）を受け、**本サイト改修を実行中**:

| 改修内容 | SPEC v3.3 出典 |
|---|---|
| `tcharton/_headers` 配置（HSTS / CSP / COOP / COEP / CORP 等）| §1.0 原則 4 / §8.1.5 / §8.5 必須条件 1 |
| Cloudflare Pages 移行検討 | §8.9 / §8.5 必須条件 5 |
| JSON-LD `ProfessionalService` 追加・GBP NAP 整合性向上 | §8.5 必須条件 2 |
| **目標**: scanner で **S クラス（必須 5/5 + 90 点）取得** | §8.5 |

### 5.2 ② 改修完了後の ⑤ への影響

| 項目 | 内容 |
|---|---|
| HARTON Certified ブランド整合性 | 自社サイトが S クラス取得 → 認定機関の信頼性根幹確立 → ⑤ サイト本文で「我々自身が達成済の基準で他社を評価」と訴求可能 |
| 白書（Phase 0）ストーリー転換 | 「HARTON 自社が改善前 C → 改善後 S」を Phase 0 白書 §「自社改善ケーススタディ」として組込（TCHARTON-AUDIT §3.2 提案） |
| ⑤ サイト本文の表現具体化 | scanner.py で S クラス取得した自社サイトを「参考実装」としてサイト本文で参照可能 |

### 5.3 ⑤ から ② への直接連携は不可（境界遵守）

⑤ から ② tcharton リポジトリへの直接編集は **§0.0.7 越境違反**。連携が必要な事項は:
1. ⑤ → ① エスカレーション
2. ① → ② に統制指示（HARTON-CERTIFIED-INTEGRATION.md 経由）

---

## 6. ⑤ Self-Audit Checklist（§0.0.8 / 7 項目）

⑤ がタスク完了宣言時に silent に実行する自己チェック:

| # | チェック | 合格基準 |
|---|---|---|
| 1 | disk artifact 存在 | `ls` で成果物を確認 |
| 2 | 検証コマンド exit 0 | （該当なら）build / test の出力 |
| 3 | scope 限定明示 | 「⑤ の権限内、scanner.py 改修なし」「3 法規編集なし」等を併記 |
| 4 | 未検証事項なし | TODO / 後で / 今は省略 等の付記なし、または明示列挙 |
| 5 | sycophancy なし | 代表の希望順序ではなく事実順序で報告 |
| 6 | 責任の直視 | 失敗を「環境」「scanner が厳しすぎ」等に帰属させない |
| 7 | 外部基準書 verbatim | 公式一次ソース（OWASP / W3C / WCAG / Google 等）を ⑤ 成果物に転記時、verbatim 取得日を併記 |

→ 1 つでも不合格なら完了宣言を引込め、「未確認事項として X を残す」形で ① に報告。

---

## 7. ⑤ から ① への報告フォーマット（推奨）

⑤ がタスク完了報告を ① にする際、以下のフォーマットを推奨:

```markdown
## ⑤ HARTON Certified 認定運用責任者 完了報告（YYYY-MM-DD）

### 完了タスク
- [タスク名] / 出典: [本書 §X.Y]
- disk artifact: [パス + サイズ または commit hash]

### 検証結果
- [スクリプト出力 or 手動確認結果]

### 未検証事項
- [TODO / 後続タスクへの委任 / 取得不能項目]
- なければ「なし」

### Self-Audit
- 1-7 項目すべて合格 / または不合格 # を明示

### 次回 ① への判断要請
- [あれば箇条書き]
```

---

## 8. 改訂履歴

| 版 | 日付 | 変更 |
|---|---|---|
| 1.0 | 2026-04-27 | 初版発行（SPEC v3.3 改訂完了 + 5 セッション役割名称確定 + ① への報告義務 mandatory 化を契機に、⑤ 専用の統制申し送り書として新設）|

---

**最終更新**: 2026-04-27 / v1.0 / ① HARTON 総合責任者 起票
**次レビュー**: ⑤ から最初の完了報告受領時、または SPEC 次回改訂時のいずれか早い方
**正本所在**: 本書は `HARTON/certification/HANDOVER-FROM-ROOT-FOR-CERTIFICATION.md` が正本。⑤ 専用文書のため `HARTON/` 直下にはコピー配置せず、改訂は ① のみ実施
