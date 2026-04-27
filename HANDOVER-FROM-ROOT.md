> **⚠️ 参照用コピー（certification/）** — 本ファイルは ⑤ HARTON Certified 認定運用責任者向けの**配布コピー**です。最新版・正本は `HARTON/HANDOVER-FROM-ROOT.md`（ルート ① 統制下）にあり、改訂は ① のみ実施します。本書を編集しないでください（編集が必要な事項があれば ① にエスカレーション、SPEC v3.4 §0.0.7 報告義務 #3）。
> **配布日**: 2026-04-27 / **配布版**: v1.3 / **配布元**: ① HARTON 総合責任者

---

# HARTON ルート ① 統制申し送り書（次セッション必読）

**最新版**: **v1.3**（2026-04-27 更新 / SPEC v3.4 改訂 + 4 担当指示書配布 + note-content への 3 法規配布）
**作成日**: 2026-04-26（v1.0）→ 2026-04-26（v1.1）→ **2026-04-27（v1.2）**
**作成セッション**: ① HARTON 総合責任者（SPEC 編集権限保持）
**対象**: 次の **HARTON 総合責任者 ①** セッション
**目的**: ① は **5 セッション全体の指令役・最終承認権限**。本書を読むことで、全プロジェクトの最新状態と次に判断すべき事項を即座に把握できる。
**v1.2 主要更新**: SPEC v3.3 全件整合改訂完了 + 5 セッション役割名称確定 + ① への報告義務 mandatory 化

---

## 0. HARTON ルート ① の責務（最初に確認）

### 0.1 ルート ① のポジション

HARTON ルート ① = **HARTON 総合責任者**（v3.3 / 2026-04-27 確定）。**5 セッション体制の中央指令塔・最終承認権限**:

```
[① HARTON 総合責任者]  ← 戦略・3 法規・最終承認の最高権限
   ├─ ② S クラスサイト構築責任者（tcharton）  …  実装
   ├─ ③ ブログ担当（note）                  …  発信
   ├─ ④ S クラス最高技術責任者（scanner）     …  S クラス基準の技術定義
   └─ ⑤ HARTON Certified 認定運用責任者（certification） … 認定運用
```

**全サブセッションの ① への報告義務**（SPEC v3.3 §0.0.7 mandatory / CLAUDE.md §1）:
1. 完了報告（disk artifact / commit / verify-all 出力で証跡化）
2. 失敗・未検証の自己申告（H-3 Failure-Self-Report）
3. エスカレーション（戦略仕様変更要請）
4. 整合性確認（3 法規変更後の sync-spec.js --check 実行義務）
5. S クラス基準の整合保持（④ が技術正本 / ② が達成 / ① が統制）

### 0.2 ルート ① の専権事項

| 領域 | 専権内容 | 委任先 |
|---|---|---|
| **3 法規編集** | SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md の正本編集 | なし（ルート①絶対）|
| **戦略仕様確定** | MASTER-PLAN / CRITICAL-ISSUES-REPORT の最終確定 | なし（ルート①絶対）|
| **マルチセッション統制** | 各セッションの実装承認・課題確定・進捗統合 | なし（ルート①絶対）|
| **3 法規配布** | sync-spec.js TARGETS の管理 | なし（ルート①絶対）|
| **構造変更** | フォルダ構成・運用フロー変更 | なし（ルート①絶対）|

### 0.3 ルート ① の遵守事項（SPEC v3.2 §0.0 準拠）

1. **§0.0.3 H-1**: 各セッションからの引継ぎ報告は disk artifact / commit hash / verbatim 確認で証跡化
2. **§0.0.7 マルチセッション境界**: サブセッション①②③④⑤の権限境界を尊重、越境は H-3 自己申告
3. **§0.0.8 完了宣言前 Self-Audit**: 7 項目チェック必須（特に #4 未検証事項なし、#7 外部基準書 verbatim）
4. **§0.0.9 Verbatim 強制**: 外部基準書（OWASP / WCAG / SPEC §X.Y / scanner.py 仕様）からの引用は verbatim
5. **§0.0.1 narrow-scope claim 一般化禁止**: 1 セッションの確認結果を全体保証として使わない

---

## 1. 全プロジェクト最新状態（2026-04-26 時点）

### 1.1 tcharton（②）— **本番稼働中・🏆 S-RANK 達成済**

| 項目 | 状態 |
|---|---|
| ドメイン | tcharton.com（Cloudflare Pages 本番稼働）|
| 22 ページ実装 | ✅ 完了 |
| spec-checker | ✅ 🏆 S-RANK（PASS=1,461 / FAIL=0 / WARN=0）|
| GA4 / Search Console / Web3Forms / Email Routing | ✅ 全統合済 |
| GitHub | TC-HARTON/tcharton.git（main、32+ commits、push 済）|
| **HARTON Certified 連携** | 🚧 `tcharton/HARTON-CERTIFIED-INTEGRATION.md` 共有済（2026-04-26）→ ②着手待ち |

### 1.2 note-content（③）— 試験運用中

| 項目 | 状態 |
|---|---|
| 初稿 | `drafts/2026-04-25-saturday-note-kickoff.md`（6.6 KB）|
| 試験運用方針 | 3 トピック試験運用版（〜2026-05-25 評価）|
| 公開サイト | https://note.com/harton_official |

### 1.3 scanner（④）— **Phase 9b/9d 完了・本番運用フェーズ**

| 項目 | 状態 |
|---|---|
| Phase 進捗 | Phase 0-7 + 9a + **9d**（致命的NG 一発除外）+ **9b 高優先 3 件**（sitemap/robots/llms.txt + GEO 戦略 + WCAG 2.2）完了 |
| TBD 確定 | ✅ scanner-tbd-confirmed.md v1.0（2026-04-26 verbatim 取得）|
| ルート①承認 | ✅ Phase 9d / Phase 9b 高優先 3 件（CRITICAL-ISSUES-REPORT v1.1.2 §10.2.1, §10.2.2）|
| 残作業 | 中優先（#13 残/#14 残/#8）+ 低優先（#9/#10）|
| 4 軸検証項目数 | 45+ 項目（A 10 / B 15 / C 8 / D 12+ scanner.py 実装）|

### 1.4 certification（⑤）— **MASTER-PLAN v1.1.2 確定・実装未着手**

| 項目 | 状態 |
|---|---|
| ドメイン | certification.tcharton.com（DNS 設定未）|
| 戦略確定度 | ✅ MASTER-PLAN v1.1.2（ドメイン・Tier・カラー・ナラティブ・ロゴ方向・★閾値・致命的NG・4 軸並列独立評価フレーム すべて確定）|
| 文書整備 | ✅ MASTER-PLAN.md / 補助 6 文書 / scanner-tbd-confirmed.md / SESSION-PROMPTS.md |
| サイト実装 | 🚧 22 ページ未着手 |
| ロゴ・バッジ | 🚧 未制作（AI 試作プロンプト準備済）|
| Phase 0 パイロット | 🚧 沼津 30 件未実施 |

### 1.5 app/ — 休眠領域（運用範囲外）

| 領域 | 用途 |
|---|---|
| `app/site-builder/` | 休眠アプリ（tcharton 完成後 or certification ⑤ 自動化で再開検討）|
| `app/_archive/harton-archive/` | 旧 harton/ サイト凍結 |
| `app/_archive/_audits/` | TRUTH-AUDIT 文書（v3.1 違反訂正記録）|
| `app/_archive/_migration/` | A 案移行作業跡 |
| `app/_backups/` | スクリプト・SPEC バックアップ群 |

---

## 2. 3 法規・統制文書の最新状態

| 文書 | 版 | 確定日 | 場所 |
|---|---|---|---|
| SPEC.md | **v3.2** | 2026-04-25 | ルート（正本）+ tcharton/scanner/certification（生成物）|
| GOOGLE-STANDARDS.md | v2.0 | 2026-04-16 | 同上 |
| GEO-STANDARDS.md | v2.1 | 2026-04-25 | 同上 |
| CLAUDE.md | 5 セッション運用版 | 2026-04-26 | ルート |
| MASTER-PLAN.md | **v1.1.2** | 2026-04-26 | certification/ |
| CRITICAL-ISSUES-REPORT.md | **v1.1.2** | 2026-04-26 | ルート |
| scanner-tbd-confirmed.md | v1.0 | 2026-04-26 | certification/docs/ |
| SESSION-PROMPTS.md | v1.1 | 2026-04-26 | certification/ |
| HARTON-CERTIFIED-INTEGRATION.md | **v1.0**（新規）| 2026-04-26 | tcharton/ |
| 本書（HANDOVER-FROM-ROOT.md）| **v1.0**（新規）| 2026-04-26 | ルート |

---

## 3. ルート① が完了した最新の確定事項（2026-04-26）

### 3.1 課題 #1-3 ルート①確定（v1.1）

| 課題 | 判断 | 反映先 |
|---|---|---|
| #1 ★閾値 | A: scanner.py 実装値（70/80/90）採用 | MASTER-PLAN §3.4 |
| #2 致命的NG | A 修正版: 4 項目明文化（#4 を「CMS バージョン情報露出」に表現修正）| MASTER-PLAN §3.4 |
| #3 4 軸重み | E: 「並列独立評価」フレーム採用（重み概念不採用）| MASTER-PLAN §3.2 |

### 3.2 scanner ④ Phase 9d / Phase 9b 高優先 ルート①承認（v1.1.1 / v1.1.2）

| Phase | 内容 | 承認版 |
|---|---|---|
| Phase 9d | 致命的NG 一発除外ロジック実装 | v1.1.1（§10.2.1）|
| Phase 9b Step 1 | sitemap / robots / AI クローラー / llms.txt 検出 | v1.1.2（§10.2.2）|
| Phase 9b Step 2 | GEO 9戦略（Quotation / Cite Sources / Lead Evidence）| v1.1.2（§10.2.2）|
| Phase 9b Step 3 | WCAG 2.2 強化（aria-label / skip / button / input label）| v1.1.2（§10.2.2）|

### 3.3 関連フォルダへの共有

| 共有先 | 文書 | 内容 |
|---|---|---|
| `tcharton/` | HARTON-CERTIFIED-INTEGRATION.md（v1.0、新規）| サブドメイン連携・メインサイト側必須対応 |
| `scanner/HANDOVER.md` | §0.1 ルート①引継ぎ + §0.2 Phase 9d / §0.3 Phase 9b 完了詳細 | scanner ④ 自身が更新済 |
| `certification/MASTER-PLAN.md` | v1.1.2 | 戦略マスター |
| `CRITICAL-ISSUES-REPORT.md` | v1.1.2 | 21 課題集約 + 承認記録 |

---

## 4. 次セッション（次の HARTON ルート ①）が判断すべき事項

### 4.1 即時判断（短期・1-2 セッション以内）

| # | 判断事項 | 状況 | 推奨アクション |
|---|---|---|---|
| 1 | tcharton ② への HARTON Certified リンク設置承認 | tcharton/HARTON-CERTIFIED-INTEGRATION.md §3.1 で要請中 | tcharton ② セッションを起動 → 実装依頼 |
| 2 | certification ⑤ 初期構築着手承認 | MASTER-PLAN v1.1.2 確定済、SESSION-PROMPTS.md Prompt 2 で着手可 | certification ⑤ セッションを起動 |
| 3 | scanner ④ Phase 9b 中優先（#14 残/#8）着手承認 | scanner ④ HANDOVER §0.4 で待機中 | scanner ④ セッションで継続 |
| 4 | ロゴ・バッジ AI 試作の意思決定 | docs/logo-badge-brief.md ブリーフ完備 | certification ⑤ で SESSION-PROMPTS.md Prompt 3 着手 |

### 4.2 中期判断（Phase 0 完了後）

| # | 判断事項 | 必要データ |
|---|---|---|
| 1 | ★閾値 70/80/90 の維持 or 再調整 | Phase 0 沼津 30 件のスコア分布 |
| 2 | scanner.py ヘッダースコア閾値の緩和（課題 #4）| Phase 0 実データ |
| 3 | MEO 比重の再調整（課題 #6）| Phase 0 実データ |
| 4 | サイト訴求文の最終確定 | Phase 0 結果 + デザイン完成 |

### 4.3 外部対応（HARTON 代表）

| # | 対応 | タイミング |
|---|---|---|
| 1 | DNS 設定（certification.tcharton.com）| certification ⑤ 着手前 |
| 2 | Cloudflare Pages 設定（サブドメイン追加）| 同上 |
| 3 | 弁護士相談（オプトアウト・引用ルール）| Phase 0 開始前 |
| 4 | 商標登録（HARTON Certified ブランド保護）| Phase 1 完了時 |

---

## 5. ルート① が次セッションで最初に実行すべき手順

```
[Step 1] 本書（HANDOVER-FROM-ROOT.md）を Read
[Step 2] CLAUDE.md（5 セッション運用版）を Read
[Step 3] CRITICAL-ISSUES-REPORT.md v1.1.2 を Read（特に §10 確定記録）
[Step 4] certification/MASTER-PLAN.md v1.1.2 を Read（特に §11 残作業リスト）
[Step 5] sync-spec.js --check で 3 法規同期確認
[Step 6] verify-all.js で tcharton S-RANK 維持確認
[Step 7] §0.0.7 H-3 自己申告:
   - 前セッションからの引継ぎ事項を整理
   - 未承認の他セッション活動がないか確認
   - 代表に「現状把握完了、次の判断は ?」と確認
```

---

## 6. ルート① が **やってはいけない**こと（境界遵守）

| ❌ 禁止行動 | 理由 |
|---|---|
| tcharton/ や scanner/ や note-content/ で実装作業を直接行う | サブセッションの権限。ルート①は仕様・統制のみ |
| 3 法規に外部基準書を verbatim 確認なしで転記 | §0.0.9 違反リスク（v3.1 の OWASP 違反事例参照）|
| 各セッションの実装精度の検証 | サブセッション側の責任。ルート①は仕様整合性のみ確認 |
| 他セッションが進行中の作業を独断で巻き戻す | §0.0.7 マルチセッション境界違反 |
| MASTER-PLAN を独断で大改訂 | 戦略の連続性損失。改訂は v1.1.x のような追加更新で |

---

## 7. ルート① が **やるべき**こと（指令役の本領）

| ✅ 推奨行動 | 効果 |
|---|---|
| 各セッションの引継ぎ書を verbatim 確認 | §0.0.3 H-1 evidence-before-claim 担保 |
| 課題エスカレーションを統合判断 | 戦略一貫性の維持 |
| バージョン管理（v1.x → v1.1.x → v1.1.2 等）| 改訂履歴の追跡可能性 |
| バックアップを毎回取る | ロールバック可能性 |
| 関連フォルダへ確定事項を共有 | マルチセッション同期（本日 tcharton/HARTON-CERTIFIED-INTEGRATION.md 等）|
| Self-Audit Checklist 7 項目を毎回適用 | §0.0.8 完了宣言前の事故防止 |

---

## 8. 緊急時の判断ガイド

### 8.1 サブセッションが MASTER-PLAN を独断更新した場合

ルート①承認が必要な変更（戦略仕様）に対しては:
1. 変更内容を verbatim 確認
2. 妥当性を SPEC §0.0.x 観点で評価
3. 妥当なら CRITICAL-ISSUES-REPORT に「ルート①承認」記録追加
4. 不当なら次セッションでサブセッション側に戻し変更を依頼

### 8.2 Phase 9c（コントラスト比など重い実装）が必要になった場合

- axe-core / Playwright 統合は scanner ④ の判断
- ルート①は仕様整合性（SPEC §7.1 等）のみ確認
- パイロット 30 件のコスト試算後にルート①承認

### 8.3 サイト本番デプロイ時の最終承認

- tcharton: 既に本番稼働中（追加変更時は spec-checker S-RANK 維持必須）
- certification: 初回デプロイ時にルート①最終承認必要
- 各 push 時の pre-push hook 経由 verify-all.js で自動ゲート

---

## 9. Phase G 整理履歴（2026-04-26 実施）

ルート① 統制下フォルダの精査・整理を実施。代表承認の上、4 段階で実行：

### G.A: HARTON ルート整理（実施済）

| 移動 | 移動元 | 移動先 |
|---|---|---|
| `spec_section1_revision_guide_v1.1.md`（28 KB）| HARTON/ | `app/_archive/_migration/` |
| `tcharton_18pages_spec.md`（42 KB）| HARTON/ | `app/_archive/_migration/` |

→ HARTON ルート直下が **8 ファイル**にスッキリ（運用ガイド + 統制文書のみ）。

### G.B: app/_backups/ 整理（実施済）

10 ファイル → 4 マイルストーン保持 + 6 中間ファイルを `intermediate/` に移動：

```
app/_backups/
├── CLAUDE.md.backup-pre-5session-20260426-182308 (5 セッション化直前)
├── SPEC.md.backup-pre-v3.2-20260425-130112 (v3.1.1→v3.2 移行直前)
├── sync-spec.js.backup-20260425-100520 (v3.0 期最古)
├── verify-all.js.backup-20260425-100520 (v3.0 期最古)
└── intermediate/  ← 中間 6 ファイルを集約
    ├── CLAUDE.md.backup-pre-certification-20260426-160839
    ├── CLAUDE.md.backup-pre-scanner-target-20260426-114635
    ├── sync-spec.js.backup-pre-certification-20260426-160839
    ├── sync-spec.js.backup-pre-sb-removal-20260425-105944
    ├── sync-spec.js.backup-pre-scanner-target-20260426-114635
    └── verify-all.js.backup-pre-sb-removal-20260425-105944
└── master-plan-history/  ← MASTER-PLAN 改版履歴（既存、変更なし）
```

→ ロールバック必要時はマイルストーンから復元、詳細履歴は `intermediate/` から復元可能。

### G.C: scanner/ への整理通知（scanner ④ 委任）

scanner/HANDOVER.md §0.0 に「ルート① からの整理要請」を追加。次回 scanner ④ セッションで判断：
1. `scanner/SESSION-PROMPTS.md`（certification/ 正本の重複コピー、削除推奨）
2. `scanner/__pycache__/`（再生成可能、削除 + `.gitignore` 化推奨）
3. `scanner/_test.js`（2026-04-05、用途不明、確認要）

→ §0.0.7 マルチセッション境界遵守、ルート① では直接削除せず。

### G.D: HANDOVER-FROM-ROOT.md 更新（実施中）

本セクション §9 の追加が G.D に該当。整理履歴を永続記録。

### Self-Audit（§0.0.8 / 7 項目）

| # | チェック | 結果 |
|---|---|---|
| 1 | disk artifact | ✅ 移動先全確認、削除なし |
| 2 | 検証 exit 0 | ✅ 全 mv 成功 |
| 3 | scope 限定 | ✅ ルート①権限内、scanner/ は通知のみ |
| 4 | 未検証事項なし | ✅ 参照確認済（spec_section1 と tcharton_18pages の相互参照は同行先で維持）|
| 5 | sycophancy なし | ✅ 削除でなく移動の保守的選択を維持 |
| 6 | 責任の直視 | ✅ scanner ④ への judgement を尊重 |
| 7 | 外部基準書 verbatim | N/A |

---

**最終更新**: 2026-04-27 / **v1.2** / ① HARTON 総合責任者 セッション
**次レビュー**: 次回 ① セッション起動時

---

## 10. 改訂履歴

| 版 | 日付 | 変更 |
|---|---|---|
| 1.0 | 2026-04-26 | 初版発行（5 セッション体制確立後の最初の統制申し送り書）|
| 1.1 | 2026-04-26 | Phase G 整理履歴を §9 として追加（ルート ./ 8 ファイル化、app/_backups/ 4 マイルストーン化）|
| **1.2** | **2026-04-27** | **SPEC v3.3 全件整合改訂完了。TCHARTON-AUDIT-REPORT.md（④ 起票 2026-04-27）で発覚した「3 法規 ↔ scanner.py の重大ドリフト 6 件」を ① で全件解消。役割名称確定（HARTON 総合責任者 / S クラスサイト構築責任者 / ブログ担当 / S クラス最高技術責任者 / HARTON Certified 認定運用責任者）+ ① への報告義務 mandatory 化（5 項目）。SPEC §1.0.1 / §8.5-§8.9 新設、§8.1 整合改訂、§0.0.7 拡張。CLAUDE.md §1 全面改訂。tcharton ② への `_headers` 実装委任（CRITICAL-ISSUES-REPORT v1.1.3 §11.4.1）。** |
| **1.3** | **2026-04-27** | **SPEC v3.4 改訂完了 + 4 担当への正式指示書配布 + note-content への 3 法規配布。** ② tcharton から正式エスカレーション 3 件（REPORT-TO-ROOT-SPEC-V3.3.md / REPORT-TO-ROOT-SPEC-CHECKER-FIXES.md / SCANNER-EXTENSION-REQUEST.md）を受領し、① v3.3 検証マトリクス漏れ 4 点を v3.4 で全件補完: §4.2 #1.0 `@type` 配列規範化 / §4.2 #1.1-#1.3 `additionalType` + `sameAs` GBP 必須化 / §8.9 SSG 抽象化（Cloudflare Workers Static Assets + X-Hosting honest signaling）。`tcharton/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md`（② 12 タスク）/ `scanner/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md`（④ 8 タスク）/ `note-content/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md`（③ 6 タスク）/ `certification/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md`（⑤ 10 タスク）を発出。代表追加指示「法規+SPEC最新も配布」に基づき note-content/ にも SPEC v3.4 / GOOGLE / GEO を参照用コピー配布（ハッシュ同期対象外）。CRITICAL-ISSUES-REPORT v1.1.4 に全件証跡保管。 |

---

## 11. v1.2 反映事項（2026-04-27 SPEC v3.3 改訂完了）

### 11.1 完了済み（① セッション内で実施）

| # | 作業 | 結果 |
|---|---|---|
| 1 | CLAUDE.md §1 改訂（役割名称 + 報告義務節新設）| ✅ |
| 2 | SPEC §0.0.7 改訂（5 セッション役割 + 報告義務 mandatory 5 項目 + Session 跨ぎ規範 5 項目）| ✅ |
| 3 | SPEC §1.0 行 3 表現修正（Sクラス → spec-checker S-RANK 明確化）| ✅ |
| 4 | SPEC §1.0.1 新設（Sクラス用語の二層構造）| ✅ |
| 5 | SPEC §1.0 原則 4 拡張（_headers 必須化）| ✅ |
| 6 | SPEC §8.1 改訂（CSP 必須コア 6 + 推奨拡張 4 + unsafe-inline 許容範囲 + tcharton.com 標準テンプレ v3.3）| ✅ |
| 7 | SPEC §8.5 新設（Sクラス必須 5 条件、scanner.py 関数対応表付き）| ✅ |
| 8 | SPEC §8.6 新設（致命的 NG 4 項目、scanner.py Phase 9d 連動）| ✅ |
| 9 | SPEC §8.7 新設（Cookie 属性規定）| ✅ |
| 10 | SPEC §8.8 新設（ボット防御規定）| ✅ |
| 11 | SPEC §8.9 新設（SSG/Jamstack 要件）| ✅ |
| 12 | SPEC §13 改訂履歴 v3.3 追記 | ✅ |
| 13 | `node sync-spec.js` 配布 | ✅ tcharton/scanner/certification 全配布完了 |
| 14 | `node verify-all.js` S-RANK 維持確認 | ✅ PASS=1461 / FAIL=0 / 100%（機能互換改訂を実証）|
| 15 | CRITICAL-ISSUES-REPORT.md v1.1.3 起票（§11 全件追加）| ✅ |
| 16 | 本書 v1.2 更新 | ✅（本セクション）|
| 17 | tcharton/HARTON-CERTIFIED-INTEGRATION.md 更新（_headers 実装要請）| 🚧 次に実施 |
| 18 | scanner/HANDOVER.md 追記（CSP 整合要請 + 報告義務）| 🚧 次に実施 |
| 19 | note-content/README.md 追記（報告義務）| 🚧 次に実施 |
| 20 | certification/MASTER-PLAN.md 追記（v1.1.3 反映）| 🚧 次に実施 |

### 11.2 次セッション ① が即時判断すべき事項（v1.2 更新）

#### 11.2.1 ② tcharton への対応（Sクラス取得への道筋）

| 優先 | タスク | 状態 |
|---|---|---|
| 🔴 1 | `tcharton/_headers` 実装承認指示 → ② セッション起動 | HARTON-CERTIFIED-INTEGRATION.md 経由要請済 |
| 🔴 2 | scanner で再判定し B 軸スコア改善実証 | ② 完了後の必須報告事項 |
| 🟡 3 | HSTS preload 申請 + Cloudflare Pages 移行判断 | ② からの提案待ち |
| 🟢 4 | scanner で **S クラス（90点 + 必須5/5）取得** | 最終目標、達成時 ① 最終承認 |

#### 11.2.2 ④ scanner への対応

| 優先 | タスク | 状態 |
|---|---|---|
| 🟡 1 | scanner.py CSP 推奨拡張 4 個（font-src / img-src / connect-src / frame-src）警告レベル検出追加 | SPEC v3.3 §8.1.2 連動 |
| 🟡 2 | Phase 9b 中優先（#14 残 / #8 hreflang） | scanner/HANDOVER §0.4 |
| 🟢 3 | Phase 9c コントラスト比 axe-core/Playwright 統合 | コスト試算後 ① 承認 |

#### 11.2.3 ⑤ certification への対応

| 優先 | タスク | 状態 |
|---|---|---|
| 🔴 1 | MASTER-PLAN.md に SPEC v3.3 §8.5 §8.6 連動を反映（v1.1.3 化）| 即時 |
| 🔴 2 | Phase 0 沼津パイロット 30 件のターゲットリスト確定 | 即時 |
| 🟡 3 | サブドメイン構築着手（DNS / Cloudflare Pages 設定後）| ① 承認後 |

### 11.3 ① 自身が次セッションで最初に確認すべき事項

```
[Step 1] 本書 v1.2 を Read
[Step 2] CLAUDE.md（v3.3 役割名称版）を Read
[Step 3] CRITICAL-ISSUES-REPORT.md v1.1.3 を Read（特に §11 v1.1.3 確定記録）
[Step 4] certification/MASTER-PLAN.md（v1.1.3 反映状況）を Read
[Step 5] sync-spec.js --check で 3 法規同期確認（v3.3 配布後の状態）
[Step 6] verify-all.js で tcharton S-RANK 維持確認
[Step 7] §0.0.7 H-3 自己申告:
   - ② tcharton から _headers 実装の完了報告があるか確認
   - ④ scanner から CSP 推奨拡張対応の進捗報告があるか確認
   - ⑤ certification から MASTER-PLAN v1.1.3 反映の完了報告があるか確認
   - 代表に「現状把握完了、次の判断は ?」と確認
```

---
