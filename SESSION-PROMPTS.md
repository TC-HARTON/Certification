# SESSION PROMPTS — HARTON Certified 引継ぎプロンプト集

**Version**: 1.1 (2026-04-26 / ルート①確定追加版)
**Purpose**: HARTON Certified プロジェクトの実装フェーズで使用する、各セッション起動時のプロンプト集。
**Use**: 新しい Claude Code セッションを開いたら、対応するプロンプトをコピペして AI に渡す。

---

## 📋 プロンプト一覧

| # | プロンプト | 対象セッション | 状態 |
|---|---|---|---|
| 1 | scanner ④ TBD 確定 | scanner ④ | **✅ 完了（2026-04-26）** |
| 2 | certification ⑤ 初期構築 | certification ⑤ | 🚧 着手可（MASTER-PLAN v1.1 確定済）|
| 3 | certification ⑤ ロゴ AI 試作 | certification ⑤ | 🚧 着手可 |
| **4** | **scanner ④ Phase 9b 実装** | **scanner ④** | **🚧 ルート①承認済・着手可** |

---

## 🔴 プロンプト 1: scanner ④ TBD 確定セッション

**用途**: HARTON Certified の TBD 項目を scanner/スキャンプロンプト.txt から verbatim 取得して確定する。

**起動方法**: 
1. 新しい Claude Code セッションを `HARTON/scanner/` で開く
2. 以下のプロンプトをコピペして送信

```
あなたは T.C.HARTON scanner プロジェクトの担当です。

【セッション識別】
- セッション種別: ④ scanner 運用セッション（HARTON 5 セッション運用、CLAUDE.md §1）
- 作業ディレクトリ: C:\Users\ohuch\Desktop\HARTON\scanner\
- 親プロジェクト: HARTON Certified（certification.tcharton.com）

【今回の目的】
HARTON Certified の MASTER-PLAN.md に記載された TBD 項目を、
scanner の正本仕様書（スキャンプロンプト.txt）から verbatim 取得して確定する。

【最初に必ず実行】
1. pwd で C:\Users\ohuch\Desktop\HARTON\scanner\ を確認
2. ls -la で現状確認
3. 以下を Read ツールで読み込み（順序厳守）:
   a. ../CLAUDE.md（5 セッション運用）
   b. ../certification/MASTER-PLAN.md（特に §3 プロダクト戦略の TBD 項目）
   c. SPEC.md（v3.2、生成物・編集禁止）
   d. HANDOVER.md（scanner 開発状況）
   e. スキャンプロンプト.txt（S クラス基準の正本）
4. SPEC §0.0.7 H-3 自己申告:
   前セッション（HARTON ルート ①）からの引継ぎ事項を確認:
   - MASTER-PLAN v1.0 確定済（2026-04-26）
   - 5 セッション運用確立済
   - scanner Phase 1-7 全完了
   - 4 軸重み・S 条件 4-5・★閾値の verbatim 確定が今回の目的

【絶対遵守事項（SPEC v3.2 §0.0）】
1. §0.0 H-1〜H-5 Ambassadorship Duty 完全準拠
2. §0.0.5 Skills/Plugins 優先順位
3. §0.0.6 メモリへの F-1〜F-6 適用
4. §0.0.7 マルチセッション境界 — scanner 範囲内
5. §0.0.8 完了宣言前 Self-Audit Checklist 7 項目
6. §0.0.9 外部基準書転記時の Verbatim 強制 ★今回特に重要

【絶対禁止】
1. 3 法規（SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md）の編集
2. スキャンプロンプト.txt の独断変更
3. 推測で TBD を埋める（Claude の training 知識ベース禁止）

【今回確定すべき TBD 項目】
1. 4 軸の正確な配点・重み（A 基礎/B 防御/C AI 検索/D 経営、25%×4 か別の比率か）
2. S クラス必須 5 条件のうち 4-5 番目の verbatim
   （1-3 番目は HANDOVER.md 確認済:
    1. HSTS プリロード + エッジ WAF
    2. 高度な JSON-LD 構造化データ
    3. Core Web Vitals 合格 + TTFB 200ms 以下）
3. ★3 / ★4 / ★5 の確定閾値（暫定 70/85/95 だが scanner 実装と整合させる）
4. 致命的 NG の定義（一発除外条件）
5. 各軸の評価項目リスト（各 10-30 項目）

【作業手順】
Step 1: スキャンプロンプト.txt を verbatim で読み込み、TBD 項目に該当する記述を抽出
Step 2: 該当箇所を verbatim で引用し、MASTER-PLAN §3.2-3.4 と照合
Step 3: 不一致・不明部分は H-3 自己申告
Step 4: 確定した内容を以下の形式で出力:
   - 4 軸重み: A=__% / B=__% / C=__% / D=__%（出典: スキャンプロンプト.txt 行 X-Y）
   - S 条件 4: __（出典: 行 Z）
   - S 条件 5: __（出典: 行 W）
   - ★3/4/5 閾値: __/__/__（出典: 行 V または scanner 実装）
   - 致命的 NG: __（出典: 行 U）
Step 5: 結果を ../certification/docs/scanner-tbd-confirmed.md として書き出し
Step 6: ../certification/MASTER-PLAN.md §3.2-3.4 の TBD 表記を更新（差分確認）

【完了宣言前のチェック（§0.0.8）】
- スキャンプロンプト.txt から verbatim 取得した evidence あり
- 推測・想像なし
- 全 TBD 項目を回答（取得不能なものは「TBD: 取得不能 / 理由」を明示）
- HARTON Certified ⑤ 実装セッションへ引き継げる粒度

代表からの「OK」を得てから、スキャンプロンプト.txt の Read を開始してください。
```

---

## 🟡 プロンプト 2: certification ⑤ 初期構築セッション

**用途**: MASTER-PLAN.md に基づき、certification.tcharton.com の実装を着手する。

**起動方法**:
1. 新しい Claude Code セッションを `HARTON/certification/` で開く
2. 以下のプロンプトをコピペして送信

```
あなたは T.C.HARTON HARTON Certified（certification.tcharton.com）の構築・運用を担当します。

【セッション識別】
- セッション種別: ⑤ certification 運用セッション（HARTON 5 セッション運用、CLAUDE.md §1）
- 作業ディレクトリ: C:\Users\ohuch\Desktop\HARTON\certification\
- ドメイン: certification.tcharton.com（DNS 設定未）
- 役割: tcharton.com サブドメインで展開する優良 WEB サイト認定機関の構築・運用
- 関連プロジェクト: tcharton（メイン・S-RANK 達成済）/ scanner（評価エンジン）/ note-content（集客）

【最初に必ず実行】
1. pwd で C:\Users\ohuch\Desktop\HARTON\certification\ を確認
2. ls -la で現状確認
3. 以下を Read ツールで読み込み（順序厳守）:
   a. ../CLAUDE.md（5 セッション運用）
   b. MASTER-PLAN.md（戦略マスター・11 章・最重要）
   c. docs/narrative.md（8 配置別ナラティブ）
   d. docs/methodology-draft.md（/methodology/ ページ草案）
   e. docs/user-journeys.md（A/B/C/D セグメント）
   f. docs/competitive-analysis.md（差別化 7 軸）
   g. docs/logo-badge-brief.md（ロゴ・バッジ仕様）
   h. docs/kpi-dashboard.md（KPI 詳細）
   i. SPEC.md（v3.2、生成物・編集禁止）
   j. （存在すれば）docs/scanner-tbd-confirmed.md（scanner ④ から確定された TBD 値）
4. SPEC §0.0.7 H-3 自己申告:
   - MASTER-PLAN v1.0 確定済（2026-04-26）
   - 5 セッション運用確立済
   - scanner TBD: 確定済 or 未確定（確認）
   - サイト実装は未着手
   - ロゴ・バッジは未制作

【絶対遵守事項（SPEC v3.2 §0.0）】
1. §0.0 H-1〜H-5 Ambassadorship Duty 完全準拠
2. §0.0.5 Skills/Plugins 優先順位（ユーザー > 本仕様 > Skills > デフォルト）
3. §0.0.6 メモリへの F-1〜F-6 適用
4. §0.0.7 マルチセッション境界 — certification 範囲内
5. §0.0.8 完了宣言前 Self-Audit Checklist 7 項目
6. §0.0.9 外部基準書転記時の Verbatim 強制

【絶対禁止】
1. 3 法規（SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md）の編集
2. MASTER-PLAN.md の独断変更（戦略変更は HARTON ルート ① で議論）
3. scanner TBD が未確定のまま★閾値を独断確定
4. 18 ページ未満での本番公開（SPEC §1.6）— ただし本サイトはサブドメインで構造異なる、§1.0 派生サイト解釈に従う
5. 推測で事業者情報を掲載（scanner 実スキャンデータのみ使用）

【本セッションの実装範囲（MASTER-PLAN §4.1）】
22 ページ設計:
- TOP / about / methodology（5 ページ）/ regions / industries / businesses
- apply / improvement-guide / press / opt-out / faq / news / contact / legal / privacy

【最初の作業相談】
全文書読込後、代表に以下を確認してから着手:
1. scanner TBD は確定済か?（未確定なら scanner ④ セッション先行）
2. ロゴ・バッジは AI 生成試作するか?
3. 着手するページの優先順位（推奨: TOP + about + methodology メイン + apply）
4. ドメイン certification.tcharton.com の DNS 設定状況
5. デプロイ先（Cloudflare Pages tcharton と同じ環境か別か）

【作業の進め方】
推奨ローンチスケジュール（MASTER-PLAN §8）:
- Phase 0（〜2026-05）: 沼津 30 件パイロット
- Phase 1（〜2026-09）: 県東部展開 200 件

代表からの明示承認を得てから、最初のページの実装に着手してください。
```

---

## 🟢 プロンプト 3: certification ⑤ ロゴ AI 試作セッション

**用途**: AI 画像生成（Midjourney / DALL-E 等）でロゴ・バッジの試作を作成する。

**注意**: このセッションは「AI 画像生成プロンプト作成」が主作業。実際の画像生成は外部 AI ツール（Midjourney 等）で行う。

**起動方法**:
1. 新しい Claude Code セッションを `HARTON/certification/` で開く
2. 以下のプロンプトをコピペして送信

```
あなたは HARTON Certified のロゴ・バッジ AI 試作を担当します。

【セッション識別】
- セッション種別: ⑤ certification 運用セッション（特化: ビジュアルアイデンティティ試作）
- 作業ディレクトリ: C:\Users\ohuch\Desktop\HARTON\certification\
- 出力先: assets/logo/ + assets/badges/

【最初に必ず実行】
1. docs/logo-badge-brief.md を Read（ブリーフ全文）
2. MASTER-PLAN.md §7（ビジュアルアイデンティティ）を Read
3. SPEC §0.0.9 を Read（外部基準書 verbatim 強制）

【今回の目的】
docs/logo-badge-brief.md に記載された方向性（案 E ハイブリッド型）に基づき、
Midjourney / DALL-E / Stable Diffusion 等の AI 画像生成ツール用の
高精度プロンプトを 5-10 案作成する。

【作成すべきプロンプト】
1. ロゴ シンボルマーク（円形リング + ★ + モノグラム）— 5 案
2. バッジ ★3 HARTON Certified 円形 — 1 案
3. バッジ ★4 HARTON 優良 円形 — 1 案
4. バッジ ★5 HARTON S-Class Certified 円形 — 1 案
5. ファビコン用シンプル版 — 2 案

【プロンプト要件】
各 AI 画像生成プロンプトには以下を明記:
- メインカラー: Deep Navy #0F172A
- アクセント: Champagne Gold #C9A961
- 背景: Cream #FAF8F3
- スタイル指定: minimal, sophisticated, official, lighthouse-inspired
- 禁止要素: cute mascot, tech startup style, gaudy decoration
- 参考: Michelin Guide, The Economist, Webby Awards, ISO certification

【出力形式】
docs/ai-prompts.md として、以下のフォーマットで保存:

# AI 画像生成プロンプト集 v1
作成: 2026-XX-XX

## ロゴ シンボルマーク 5 案

### 案 1
[Midjourney プロンプト全文]
- 期待する印象: ___
- バリエーション展開: ___

### 案 2
...

【完了基準】
- 5-10 個の高精度プロンプトを保存
- 各プロンプトは「コピペで Midjourney 等にそのまま投入可」レベル
- docs/logo-badge-brief.md の指針と完全整合

代表からの「OK」を得てから着手してください。
```

---

## 📌 使用上の注意

### プロンプト共通の注意

1. **コピペ前に確認**: 各プロンプト末尾の「代表からの『OK』を得てから着手」は重要。AI が独断で進めるのを防ぐ
2. **session ⑤ で 3 法規編集禁止**: certification セッションでも 3 法規は生成物。編集は HARTON ルート ① のみ
3. **TBD は推測しない**: §0.0.9 違反になる。前セッションで確定するか、user に確認

### プロンプト追加・改訂時

新しいプロンプトを追加する場合は本ファイルに追記し、以下を更新：
- §プロンプト一覧 表
- バージョン番号
- 改訂履歴（末尾に追加）

---

## 🟠 プロンプト 4: scanner ④ Phase 9b 実装セッション

**用途**: ルート①確定後（2026-04-26）の未完項目を scanner.py に実装する。CRITICAL-ISSUES-REPORT.md §3 の課題 #7-#14 が対象。

**前提条件**:
- ✅ 課題 #1-3 ルート①確定済（CRITICAL-ISSUES-REPORT.md v1.1）
- ✅ scanner.py の核心ロジック（4 軸スコアリング + ★閾値 70/80/90 + 致命的NG 4項目）は変更不要
- ✅ MASTER-PLAN.md v1.1 で「並列独立評価」フレーム確定（重み概念なし）

**起動方法**:
1. 新しい Claude Code セッションを `HARTON/scanner/` で開く
2. 以下のプロンプトをコピペして送信

```
あなたは T.C.HARTON scanner プロジェクトの担当です。

【セッション識別】
- セッション種別: ④ scanner 運用セッション（HARTON 5 セッション運用、CLAUDE.md §1）
- 作業ディレクトリ: C:\Users\ohuch\Desktop\HARTON\scanner\
- 親プロジェクト: HARTON Certified（certification.tcharton.com）

【今回の目的】
ルート①確定（2026-04-26）後の未完項目（Phase 9b）を scanner.py に実装する。
CRITICAL-ISSUES-REPORT.md §3 の課題 #7-#14 が対象。
scanner.py の核心ロジック（4 軸スコアリング + ★閾値 + 致命的NG）は変更しない。

【最初に必ず実行】
1. pwd で C:\Users\ohuch\Desktop\HARTON\scanner\ を確認
2. ls -la で現状確認
3. 以下を Read ツールで読み込み（順序厳守）:
   a. ../CLAUDE.md（5 セッション運用）
   b. HANDOVER.md（特に §0「ルート①からの引継ぎ事項」必読）
   c. ../CRITICAL-ISSUES-REPORT.md v1.1（§3 課題 #7-#14 + §10 確定記録）
   d. ../certification/MASTER-PLAN.md v1.1（§3.2-3.4 確定済の理解）
   e. SPEC.md（v3.2、生成物・編集禁止）
   f. スキャンプロンプト.txt（必要に応じて参照）
   g. scanner.py（実装の現状把握）
4. SPEC §0.0.7 H-3 自己申告:
   - 課題 #1-3 はルート①で確定済（scanner ④ 範囲外）
   - 今回は Phase 9b 実装（課題 #7-#14）に集中
   - scanner.py 核心ロジックは不変（★閾値 70/80/90、致命的NG 4項目、4 軸並列独立評価）

【絶対遵守事項（SPEC v3.2 §0.0）】
1. §0.0 H-1〜H-5 Ambassadorship Duty 完全準拠
2. §0.0.5 Skills/Plugins 優先順位
3. §0.0.6 メモリへの F-1〜F-6 適用
4. §0.0.7 マルチセッション境界 — scanner 範囲内
5. §0.0.8 完了宣言前 Self-Audit Checklist 7 項目
6. §0.0.9 外部基準書転記時の Verbatim 強制

【絶対禁止】
1. 3 法規（SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md）の編集
2. ★閾値・致命的NG・4 軸並列独立評価フレームの独断変更（ルート①確定済）
3. スキャンプロンプト.txt の独断変更
4. 4 軸重み比率の概念を表に出すこと（並列独立評価フレーム違反）

【Phase 9b 実装範囲（優先順）】

🔴 高優先（Phase 1 移行までに必須）

1. 課題 #11: sitemap.xml / robots.txt / AIクローラー許可 / llms.txt 検出
   - SPEC §4.6-4.7（sitemap・robots）/ §5.5（AI bot）/ GEO §8A（llms.txt）
   - 各サイトに対し以下を機械検出:
     · sitemap.xml の存在
     · robots.txt の存在 + AI bot 許可（GPTBot/PerplexityBot/ClaudeBot 等）
     · llms.txt の存在（推奨）
   - 4 軸スコアリングの C 軸（AI 検索適応）に減点項目として追加

2. 課題 #12: GEO 9戦略の検出（Quotation Addition / Cite Sources `.go.jp`）
   - GEO-STANDARDS §3 / §6.6
   - 検出項目:
     · `<blockquote cite=...>` の存在
     · `.go.jp` / `.gov` / `.edu` / `arxiv.org` 等の公的リンクへの被リンク数
   - C 軸の減点項目

3. 課題 #7: WCAG 2.2 強化
   - SPEC §7.1
   - 検出項目（軽量実装）:
     · alt 属性充足率（既存実装の精度向上）
     · aria-label 設定状況（nav / section / button）
     · コントラスト比（要 axe-core / Playwright 統合、Phase 9c 候補）
   - D 軸（経営インパクト）の減点項目

🟡 中優先（Phase 1 期間中）

4. 課題 #13: Lead Evidence Block（最初の <h2> 前の引用/数値）検出
   - SPEC §4.13
   - C 軸の減点項目

5. 課題 #14: セマンティック HTML 検出
   - SPEC §5.1（section aria-label）/ §5.4（Speakable JSON-LD）/ §11.4（table caption）
   - C 軸 / D 軸の減点項目

6. 課題 #8: 多言語対応検出（hreflang / Google Translate）
   - インバウンド評価
   - 業種別（観光・宿泊・飲食）で重みを変える検討

🟢 低優先（Phase 1 後半 or Phase 2）

7. 課題 #9: 予約システム連携検出（TableCheck/RESERVA/食べログ）
   - 飲食・観光業特化
   - business_type と連動

8. 課題 #10: 「優良店エクスポート」UI
   - S/A 絞込 + 業種別 JSON/HTML 出力
   - 称賛型サイト用（certification ⑤ への連携）

【作業手順】
Step 1: 上記 1-3（高優先）を 1 つずつ実装
Step 2: 各実装後、scanner.py で実テスト（沼津の数件をスキャン）
Step 3: 4 軸並列独立評価フレームと整合（軸間重みは表に出さない）
Step 4: HANDOVER.md §3 実装状況を更新
Step 5: CRITICAL-ISSUES-REPORT.md §3 該当課題に「✅ 完了（YYYY-MM-DD）」を記録

【完了宣言前のチェック（§0.0.8）】
- 各実装に対し scanner.py 単体テストの exit code 0 確認
- 4 軸スコアリングの整合性維持（A/B/C/D の独立評価が崩れていないか）
- 致命的NG 4 項目の検出ロジックは不変（ルート①確定）
- ★閾値 70/80/90 は不変（ルート①確定）
- HANDOVER.md と CRITICAL-ISSUES-REPORT.md の整合更新

代表からの「OK」を得てから、Step 1（課題 #11 sitemap/robots/llms.txt 検出）から着手してください。
```

---

## 改訂履歴

| 版 | 日付 | 変更 |
|---|---|---|
| 1.0 | 2026-04-26 | 初版発行（scanner TBD / certification 初期構築 / ロゴ AI 試作 の 3 プロンプト）|
| 1.1 | 2026-04-26 | プロンプト 4（scanner ④ Phase 9b 実装）追加。プロンプト 1 を「完了」表示に更新 |

---

**最終更新**: 2026-04-26 / v1.1
