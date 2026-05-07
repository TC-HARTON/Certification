# HARTON ルート ① 統制申し送り書(次セッション必読)

**最新版**: **v1.11**(2026-04-30 / 統括機能版 全面刷新)
**目的**: ① セッション起動時、本書 1 ファイルで **全プロジェクト最新状態 + 経緯 + 残タスク + 判断事項** を完全把握できる統括文書。
**運用**: 5 セッション全体の指令塔として、各サブセッション(②③④⑤)からの報告を統合し、戦略判断 + SPEC 改訂 + マルチセッション統制を行う。

---

## 0. ① の責務(最初に確認)

### 0.1 5 セッション体制(v3.3 / 2026-04-27 役割名称確定)

```
[① HARTON 総合責任者]  ← 戦略・3 法規・最終承認の最高権限
   ├─ ② S クラスサイト構築責任者(tcharton)  …  実装
   ├─ ③ ブログ担当(note)                  …  発信
   ├─ ④ S クラス最高技術責任者(scanner)     …  S クラス基準の技術定義
   └─ ⑤ HARTON Stella 認定運用責任者(certification) … 認定運用
```

### 0.2 全サブセッション ① への報告義務(SPEC §0.0.7 mandatory / 5 項目)

1. **完了報告**(disk artifact / commit / verify-all 出力で証跡化)
2. **失敗・未検証の自己申告**(H-3 Failure-Self-Report)
3. **エスカレーション**(戦略仕様変更要請)
4. **整合性確認**(3 法規変更後の sync-spec.js --check 実行義務)
5. **S クラス基準の整合保持**(④ 技術正本 / ② 達成 / ① 統制)

### 0.3 4 Skill 必須化(v1.1.11 / 2026-04-28 代表確定 / ②④⑤ 共通)

| Skill | 役割 | 適用 |
|---|---|---|
| `/feature-dev:feature-dev` | Phase 1-7 構造化実装 | **mandatory**(新規 / 大規模実装着手時) |
| `/requesting-code-review` | 並列複数 reviewer 独立検証 | **mandatory**(完了報告前) |
| `/gstack` | 本番実機テスト + dogfooding | **強い推奨**(デプロイ後検証) |
| `/receiving-code-review` | review feedback 厳格処理 | **mandatory**(review 受領時) |

→ spec-checker FAIL=0 単独で「完了」「合格」「PASS」「達成」を称することは **§0.0.1 背任として絶対禁止**。

### 0.4 ① 専権事項

| 領域 | 内容 |
|---|---|
| 3 法規編集 | SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md の正本編集 |
| 戦略仕様確定 | MASTER-PLAN / CRITICAL-ISSUES-REPORT の最終確定 |
| マルチセッション統制 | 各セッション実装承認・課題確定・進捗統合 |
| 3 法規配布 | sync-spec.js TARGETS の管理 |
| 構造変更 | フォルダ構成・運用フロー変更 |

### 0.5 ① 遵守事項(SPEC §0.0 + v1.1.15 §0.0.10)

1. **§0.0.3 H-1**: 各セッション報告は disk artifact / commit hash / verbatim で証跡化
2. **§0.0.7 マルチセッション境界**: 越境は H-3 自己申告
3. **§0.0.8 完了宣言前 Self-Audit**: 7 項目(特に #4 未検証なし、#7 verbatim)
4. **§0.0.9 Verbatim 強制**: 外部基準書は公式一次ソースから取得
5. **§0.0.1 narrow-scope claim 一般化禁止**
6. **§0.0.10 判定基準厳格化原則**(v1.1.15 議題化 / 2026-04-30): 必須条件・閾値の上方向変更のみ可、緩和は ① エスカレーション必須

---

## 1. プロジェクト最新状態(2026-04-30 時点)

### 1.1 ② tcharton — 🏆 scanner ★★★ 取得 + spec-checker S-RANK 維持

| 項目 | 状態 |
|---|---|
| ドメイン | tcharton.com(Cloudflare Workers Static Assets 本番稼働) |
| spec-checker | 🏆 PASS=1462 / FAIL=0 / 100% — S-RANK |
| scanner 実機判定 | **★★★ / 総合 90 / 必須 4/4 + 1 保留 / 致命的 NG 0 / NAP 100** |
| GBP CID | `16606425942373165010`(代表手動作成) |
| GitHub | TC-HARTON/tcharton.git push 済 |

**取得経緯**(C/65 → S/90):

| 時系列 | commit | 状態 | 主要対応 |
|---|---|---|---|
| 起点 | (Phase 1 前) | C/65 | ④ TCHARTON-AUDIT で発覚 |
| Phase 1 | `97323a6` | — | HSTS preload + CSP + COOP/COEP/CORP 全配信 |
| @type 配列化 | `a12f686` | — | spec-checker バグ修正 + JSON-LD 配列化 + X-Hosting honest signaling |
| `--live` モード | `a4d34de` | — | **旧②虚偽 S-RANK 再発防止 machine gate** |
| GBP 連携 | `a3113d1` | — | sameAs CID 追加 |
| Deep Work 導線 | `06c3d1c` → `68b0f8b` | — | Form 主 CTA + Phone 補助(ビデオ会議撤回 / フォーム経由) |
| 初回スキャン | `f1a07a1` | **B/87** | NAP 90 点(住所△) |
| **住所完全公開** | `36d4328` | **🏆 S/90** | NAP 100 点(沼津市大岡2690) |

**待機**: 月次再判定継続 / 追加要請受領時

### 1.2 ④ scanner — SPEC v3.4 整合 + ★3 段階化完了 + ★★ 厳格化中(最優先)

| 項目 | 状態 |
|---|---|
| GitHub | TC-HARTON/Scanner.git push 済 |
| 単体テスト | 累計 **143 PASS / 0 FAIL** |

**完了タスク**:

| commit | 内容 | 単体テスト |
|---|---|---|
| `c003d62`(SPEC v3.4 整合 4 件) | `check_ssg_hint()` 拡張 / `INDUSTRY_KEYWORD_MAP` / `@type` 配列対応 / CSP 推奨拡張警告 | 101 PASS |
| `959fc96`(★3 段階化) | rating 出力 `S/A/B/C/D` → `★★★/★★/★/""` + 内部 ID retro-compat | 42 PASS |

**🔴🔴 最優先待機タスク(2026-04-30 確定)**:
- **★★ 必須条件 厳格化**(`passed_count >= 3` → `>= 4`) + docstring 同期 + 単体テスト更新
- 経緯: ⑤ v1.5 が `/requesting-code-review` で CRITICAL-1 検出(規範 4/5 vs 実装 3)。代表確定「**判定基準は厳格化のみ可、緩和不可**」で B 案(scanner.py を 4 に厳格化)採用。
- retro-compat 影響なし(既存 ★★ 該当なし、tcharton ★★★ 維持)

**中期待機**: Phase 0 沼津 30 件スキャン(代表リスト確定後)/ Phase 9b 中優先(#14 残 / #8 hreflang)

### 1.3 ⑤ certification — Step 1/3/5/#7/#8(草稿)完了 + Step 2 第二次厳格検証完遂 + v1.1.6.1 patch 中

| 項目 | 状態 |
|---|---|
| ドメイン | stella.tcharton.com(DNS 設定未 / 代表手動作業) |
| MASTER-PLAN | **v1.1.6**(★3 段階化反映済) → v1.1.6.1 patch 中(マッピング層撤去 + CRITICAL-2 + MEDIUM-1 解消) |
| GitHub | TC-HARTON/Certification 11 commit push 済 |

**完了 Step**:

| Step | 内容 | 結果 |
|---|---|---|
| 1 | 基盤配置(_headers / _redirects / templates) | ✅ |
| 2 | 基盤 17 + 動的 50 ページ + ルート 3 ファイル | ✅ **4250 項目 / FAIL=0 / 100%** |
| 3 | data/ JSON 構造(industries / regions / businesses 雛形) | ✅ |
| 5 | generate.js 最小実装 | ✅ |
| #7 | 通知メール文案 v0.1 | ✅ 草案保管(弁護士確認待ち) |
| #8 草稿 | MASTER-PLAN v1.1.4 → v1.1.5 → v1.1.6 改訂 | ✅ |

**v1.4 第二次厳格検証完遂**(2026-04-28):
- 第一次レビュー: CRITICAL 5 + HIGH 11(feature-dev:code-reviewer + Explore)
- 第二次レビュー: CRITICAL 1(PLACEHOLDER_GBP_CID 全 68 ファイル残存) + HIGH 5(並列 3 code-reviewer)
- 全件解消、確認モーダル + AJAX hijack 実装、contact.js 195 行新規

**v1.5 規範↔実装乖離検出**(2026-04-30):
- `/requesting-code-review` で CRITICAL-1 検出: ★★ S 条件 = MASTER-PLAN「4/5」 vs scanner.py「3」
- ① 戦略確定 → ④ 厳格化指示書発出 + SPEC v3.5 §0.0.10 議題化
- v1.1.6.1 patch は **(a) scanner 修正完了後統合方式** で push 待機

**残 Step**:

| Step | 内容 | 待機内容 |
|---|---|---|
| 4 | Phase 0 沼津 30 件投入 | ④ scanner CSV 待ち(代表リスト確定後) |
| 6 | scanner で certification 自身も S 取得 | DNS + GBP 新規 + Step 4 完了後 |
| 7 | ミシュランガイド型 サイト構造昇華 | ⑤ で着手可(Step 4 と並行可) |
| 8 | ブランド確立(マニフェスト + ★区分物語 + 失効条件) | ⑤ で MASTER-PLAN v1.1.7 草案 → ① 承認 |

### 1.4 ③ note-content — 試験運用 + 自社改善前後比較シリーズ素材確定

| 項目 | 状態 |
|---|---|
| 試験運用 | 〜2026-05-25 評価予定 |
| 自社改善前後比較シリーズ全 5 回 | 素材確定(② ★★★ 取得 + Phase 1 / @type / Workers Static Assets 認定 / S クラス取得) / 着手可 |
| 公開サイト | https://note.com/harton_official |

---

## 2. 統制文書 最新版テーブル

| 文書 | 版 | 場所 | 内容 |
|---|---|---|---|
| SPEC.md | **v3.4**(v3.5 議題中) | ルート + 3 担当生成物 | §1.0.1 二層構造 / §4.2 #1 配列+additionalType+sameAs / §8.1-8.9 / §0.0 規範 |
| GOOGLE-STANDARDS.md | v2.0 | 同上 | §11 セキュリティヘッダー / §11A AI Overviews |
| GEO-STANDARDS.md | v2.1 | 同上 | G-1〜G-6 |
| CLAUDE.md | v3.3 | ルート | 5 セッション役割 + 報告義務 |
| MASTER-PLAN.md | **v1.1.6**(v1.1.6.1 patch 中、v1.1.7 草案議題中) | certification/ | ★3 段階化 / B 採用全 reading / 9 commit 反映 |
| **CRITICAL-ISSUES-REPORT.md** | **v1.1.15** | ルート | §1-§22 全履歴(経緯の正本) |
| **HANDOVER-FROM-ROOT.md** | **v1.11**(本書) | ルート | ① 統括 |
| 各担当 INSTRUCTION-FROM-ROOT.md | 整理済 | 各フォルダ | 4 Skill 必須化反映 / Read リスト最小化済 |
| 各担当 REPORT-TO-ROOT-FROM-*.md | 継続報告ログ | ルート | ② v1.5 / ④ v1.2 / ⑤ v1.5 / ③ |

---

## 3. 確定事項履歴(v1.1.x 経緯 / 統括)

| 版 | 日付 | 主要確定 |
|---|---|---|
| v1.1 | 2026-04-26 | 課題 #1-3 確定(★閾値 70/80/90 / 致命的 NG 4 項目 / 4 軸並列独立評価) |
| v1.1.1 | 2026-04-26 | scanner Phase 9d 致命的 NG 一発除外実装承認 |
| v1.1.2 | 2026-04-26 | scanner Phase 9b 高優先 3 件完了承認 |
| v1.1.3 | 2026-04-27 | SPEC v3.3 全件整合改訂 + 5 役割名称 + 報告義務 mandatory |
| v1.1.4 | 2026-04-27 | SPEC v3.4 改訂 + ② 報告書 3 件全件承認 + 4 担当配布 |
| v1.1.5 | 2026-04-27 | **🏆 tcharton ★★★ 取得確定**(commit `36d4328`) |
| v1.1.6 | 2026-04-27 | ⑤ certification 整合性課題 6 件 ① 解決 + Tailwind 配備 |
| v1.1.7 | 2026-04-27 | ② S 取得 + ⑤ Step 2 完了 + 全担当指示書整理 |
| v1.1.8 | 2026-04-28 | ④ ★3 段階化完了 + ⑤ v1.4 第二次厳格検証 |
| v1.1.10 | 2026-04-28 | ④ ★3 段階化承認 + ⑤ v1.4 承認 + push 済 |
| v1.1.11 | 2026-04-28 | **4 Skill 必須化(②④⑤ 共通)** |
| v1.1.12 | 2026-04-28 | 全体旧ファイル整理(10 文書 archive) |
| v1.1.13 | 2026-04-28 | ⑤ Step 7 ミシュランガイド型サイト構造昇華議題化 |
| v1.1.14 | 2026-04-28 | **ブランド確立 ① 確定文言発出**(マニフェスト + ★区分物語 + 失効条件) |
| **v1.1.15** | **2026-04-30** | **判定基準厳格化原則 SPEC v3.5 §0.0.10 議題化 + ④ ★★ 4/5 厳格化指示** |

→ 詳細は `CRITICAL-ISSUES-REPORT.md` 各 §10-§22。

---

## 4. ブランド確立 ① 確定文言(v1.1.14 / MASTER-PLAN v1.1.7 §2.0/§3.0/§12 議題)

### 4.1 マニフェスト(コア / 50 字)

> **「S クラスとは、機械が客観検証する、AI 時代における信頼の最大値である」**

### 4.2 副文(200 字)

> 人間の主観や金銭、規模に依存しない。
> 4 軸(基礎・防御・AI 検索・経営)の機械検証で、誰もが再現可能な手順で到達できる頂点。
> それは「努力の結果」ではなく、「思想の到達点」である。
> ここに名を連ねる事業者は、AI 時代の信頼を定義する灯台となる。

### 4.3 信頼根拠の核(300 字 / 自社開発・自社実証)

> HARTON Stella は、世界中のどの認定機関とも異なる。
> 評価ロジックは **scanner.py** という独自開発の機械検証エンジンで、
> **4 軸並列独立評価 + 必須 5 条件 + 致命的 NG 4 項目** で構成される。
> この基準を、まず**自社サイト tcharton.com で実証し、★★★ を取得した**。
>
> **「自分が達成できない基準で他者を測ることはしない」**
>
> ――それが、HARTON Stella の唯一無二の信頼根拠である。

### 4.4 ★区分の物語(ミシュラン型 動機喚起文)

| ★ | 称号 | 物語 |
|---|---|---|
| **★** | HARTON Stella | 「同業種で確実に信頼できる」 |
| **★★** | HARTON 優良 | 「他県からでも訪れる価値がある WEB 品質」 |
| **★★★** | HARTON S-Class Certified | 「業界の方向性を定義する到達点」 |

### 4.5 失効・降格運用(MASTER-PLAN §12 議題)

```
月次再判定で機械検証劣化を検出:
  → 事業者通知 + 14 日改善猶予
  → 改善なければ正式降格・別バッジ自動切替
  → 致命的 NG 検出時は猶予なし即時非掲載
```

---

## 5. 残・代表手動作業(DNS 一括対応として保留 / memory 化済)

`memory/project_dns_consolidated_pending.md` 連動。**DNS 設定時に 4 件まとめて対応**:

| # | 内容 | 取得元 |
|---|---|---|
| 1 | Cloudflare Turnstile site key + secret | Cloudflare ダッシュボード |
| 2 | Web3Forms 本番実送信テスト | contact ページから |
| 3 | certification 用 GBP **新規作成** | <https://business.google.com>(Service Area Business 推奨) |
| 4 | DNS 設定(stella.tcharton.com → CF Workers Static Assets) | Cloudflare DNS |

→ 代表着手指示まで保留、個別進捗確認不要。

---

## 6. SPEC v3.5 議題リスト(6 件 / 中期 Phase 1 まで)

| # | 議題 | 出典 | 優先度 |
|---|---|---|---|
| 1 | business 型 spec-checker 検証実装 | ⑤ v1.4 §5.2 | 🟡 |
| 2 | PLACEHOLDER 検出ルール(PLACEHOLDER / TBD / XXX) | ⑤ v1.4 §5.3 | 🟡 |
| 3 | ★3 段階化 §11/§12 正本化 | ④ タスク#5 連動 | 🟡 |
| 4 | CWV `USE_PLAYWRIGHT=1` 標準化 | ④ TTFB 変動 H-3 | 🟡 |
| 5 | §0.0.8 #8「並列複数 reviewer 独立検証完遂」 | v1.1.11 §18 連動 | 🔴 |
| 6 | **§0.0.10「判定基準厳格化原則」新設** | **v1.1.15 §22 / 2026-04-30 確定** | 🔴🔴 **最優先** |

---

## 7. 次セッション ① 即時判断事項

### 7.1 短期(1-2 セッション以内)

| # | 判断事項 | 状態 | アクション |
|---|---|---|---|
| 1 | ④ ★★ 厳格化(passed_count >= 4)完了確認 | 待機 | ④ commit 受領後、CRITICAL-ISSUES-REPORT v1.1.16 起票 |
| 2 | ⑤ v1.1.6.1 patch (a) 統合 push 確認 | scanner 修正後 | ⑤ commit 受領後、整合性確認 |
| 3 | ⑤ MASTER-PLAN v1.1.7 草案受領 | Step 8 着手後 | ① でブランド確立 9 改訂節を承認 |
| 4 | ⑤ Step 7 ミシュラン型構造実装 | Step 8 と並行可 | 草案受領後 |

### 7.2 中期

| # | 判断事項 | 必要前提 |
|---|---|---|
| 5 | SPEC v3.5 改訂着手 | 6 議題確定済、改訂タイミング判断 |
| 6 | ⑤ Step 4 Phase 0 沼津 30 件 | 代表リスト確定 + ④ CSV |
| 7 | ⑤ Step 6 certification 自身も ★★★ 取得 | DNS + GBP 完了 + Step 4 完了 |
| 8 | ③ 自社改善前後比較シリーズ第 1 回 | ① 戦略承認 |

### 7.3 外部対応(代表手動)

§5 の 4 件(DNS 一括対応として保留)

---

## 8. ① セッション起動手順(推奨)

```
[Step 1] 本書(HANDOVER-FROM-ROOT.md v1.11)を Read
[Step 2] CRITICAL-ISSUES-REPORT.md v1.1.15 §17-§22 を Read(直近 5 セッションの確定事項)
[Step 3] 各担当の最新 REPORT-TO-ROOT-FROM-*.md を Read(前回起動以降の更新確認)
   - REPORT-TO-ROOT-FROM-TCHARTON.md(v1.5 = 🏆 S 取得確定)
   - REPORT-TO-ROOT-FROM-SCANNER.md(v1.2 = ★3 段階化完了 / ★★ 厳格化待機)
   - REPORT-TO-ROOT-FROM-CERTIFICATION.md(v1.5 = 規範↔実装乖離検出)
   - REPORT-TO-ROOT-FROM-NOTE.md(試験運用継続)
[Step 4] node sync-spec.js --check で 3 法規同期確認
[Step 5] node verify-all.js で tcharton S-RANK 維持確認
[Step 6] §0.0.7 H-3 自己申告:
   - 前セッション以降の引継ぎ事項を整理
   - 未承認の他セッション活動がないか確認
   - 代表に「現状把握完了、次の判断は ?」と確認
```

---

## 9. ① が **やってはいけない**こと(境界遵守)

| ❌ 禁止 | 理由 |
|---|---|
| tcharton/ や scanner/ や note-content/ や certification/ で実装作業を直接行う | サブセッションの権限。① は仕様・統制のみ |
| 3 法規に外部基準書を verbatim 確認なしで転記 | §0.0.9 違反 |
| 各セッションの実装精度の検証 | サブセッション側の責任。① は仕様整合性のみ確認 |
| 他セッションが進行中の作業を独断で巻き戻す | §0.0.7 マルチセッション境界違反 |
| MASTER-PLAN を独断で大改訂 | 戦略の連続性損失。改訂は v1.1.x のような追加更新で |
| 判定基準を緩和方向に変更 | **§0.0.10 厳格化のみ可・緩和不可原則違反**(v1.1.15) |
| spec-checker FAIL=0 単独で「完了」を承認 | **§0.0.1 背任**。並列複数 reviewer の CRITICAL/HIGH 全件解消との AND |

---

## 10. ① が **やるべき**こと(指令役の本領)

| ✅ 推奨行動 | 効果 |
|---|---|
| 各セッション報告書を verbatim 確認 | §0.0.3 H-1 evidence-before-claim 担保 |
| 課題エスカレーションを統合判断 | 戦略一貫性の維持 |
| バージョン管理(v1.1.x → v1.1.16 …) | 改訂履歴の追跡可能性 |
| 関連フォルダへ確定事項を共有 | マルチセッション同期 |
| Self-Audit Checklist 7 項目を毎回適用 | §0.0.8 完了宣言前の事故防止 |
| 4 Skill 必須化の遵守確認 | spec-checker 死角カバー(v1.1.15 §22.7 で実効性実証済) |
| 厳格化原則の遵守確認 | §0.0.10 認定機関の信頼性根幹 |

---

## 11. 改訂履歴

| 版 | 日付 | 変更 |
|---|---|---|
| 1.0 | 2026-04-26 | 初版発行(5 セッション体制確立後の最初の統制申し送り書) |
| 1.1 | 2026-04-26 | Phase G 整理履歴を §9 として追加 |
| 1.2 | 2026-04-27 | SPEC v3.3 全件整合改訂完了 + 5 役割名称 + 報告義務 mandatory |
| 1.3 | 2026-04-27 | SPEC v3.4 改訂 + 4 担当指示書配布 + note-content 3 法規配布 |
| 1.4 | 2026-04-27 | 🏆 tcharton ★★★ 取得 + ⑤ Step 2 完了 + 全担当指示書整理 |
| 1.5 | 2026-04-28 | ⑤ v1.3(9 commit) + MASTER-PLAN v1.1.6 + ④ ★3 段階化指示書発出 |
| 1.6 | 2026-04-28 | ④ ★3 段階化完了 + ⑤ v1.4 第二次厳格検証完遂 + push 済 + SPEC v3.5 議題確定 |
| 1.7 | 2026-04-28 | 4 Skill ②④⑤ 共通必須化 + spec-checker 杜撰対応 + DNS 一括対応 memory |
| 1.8 | 2026-04-28 | 全体旧ファイル整理完了 + 各担当 Read リスト最小化(10 文書 archive) |
| 1.9 | 2026-04-28 | ⑤ Step 7 ミシュランガイド型サイト構造昇華議題化 + MASTER-PLAN v1.1.7 改訂議題確定 |
| 1.10 | 2026-04-28 | ブランド確立 ① 確定文言発出(マニフェスト + ★区分物語 + 失効条件) + ⑤ Step 8 |
| **1.11** | **2026-04-30** | **判定基準厳格化原則 SPEC v3.5 §0.0.10 議題化 + ④ ★★ S 条件 4/5 厳格化指示 + 4 Skill 必須化の実効性実証 + 統括機能版 全面刷新**(経緯詳細 / 最新状態 / 判断事項を 1 ファイル統括) |

---

**最終更新**: 2026-04-30 / **v1.11 統括機能版** / ① HARTON 総合責任者
**次レビュー**: 次回 ① セッション起動時 / ④ ★★ 厳格化完了時 / ⑤ v1.1.6.1 push 完了時のいずれか早い方
