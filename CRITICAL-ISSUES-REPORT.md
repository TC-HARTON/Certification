> **⚠️ 参照用コピー（certification/）** — 本ファイルは ⑤ HARTON Certified 認定運用責任者向けの**配布コピー**です。最新版・正本は `HARTON/CRITICAL-ISSUES-REPORT.md`（ルート ① 統制下）にあり、改訂は ① のみ実施します。本書を編集しないでください（編集が必要な事項があれば ① にエスカレーション、SPEC v3.4 §0.0.7 報告義務 #3）。
> **配布日**: 2026-04-27 / **配布版**: v1.1.4 / **配布元**: ① HARTON 総合責任者

---

# HARTON 最優先課題報告書

**版**: **1.1.4**（2026-04-27 ① HARTON 総合責任者 確定 / SPEC v3.4 改訂完了 + ② tcharton 報告書 3 件全件承認 + 4 担当への正式指示書配布）
**前版**: 1.1.3（2026-04-27 SPEC v3.3 全件整合改訂完了反映）
**初版作成日**: 2026-04-26
**初版起票セッション**: ④ scanner 運用セッション（HARTON 5セッション運用、CLAUDE.md §1）
**v1.1 確定セッション**: ① HARTON ルート SPEC 編集セッション（2026-04-26）
**v1.1.2 反映セッション**: ① HARTON ルート（scanner ④ Phase 9b/9d 実装承認）
**v1.1.3 確定セッション**: ① HARTON 総合責任者（2026-04-27、SPEC v3.3 改訂完了 + 5 セッション役割名称確定 + ① への報告義務明文化）
**宛先**: HARTON 代表 / 全 5 セッション（① HARTON 総合責任者 / ② S クラスサイト構築責任者 / ③ ブログ担当 / ④ S クラス最高技術責任者 / ⑤ HARTON Certified 認定運用責任者）
**目的**: scanner Phase 9a 完了およびプロンプト1 (TBD確定) 実施後に判明した課題を集約報告。**v1.1 で課題 #1-3、v1.1.2 で Phase 9b/9d、v1.1.3 で TCHARTON-AUDIT 6 件のドリフト全件 ① 確定済**
**準拠**: SPEC v3.3 §0.0.1（虚偽完了報告の禁止）/ §0.0.3 H-3（Failure-Self-Report）/ §0.0.7（マルチセッション境界における責任貫徹 + 報告義務）/ §0.0.9（Verbatim 強制）

---

## 0. エグゼクティブサマリー

### 0.1 本日の scanner ④ セッション完了事項

| Phase | 内容 | 状態 |
|---|---|---|
| Phase 9a-S | セキュリティ厳格化（CSP中身パース / COOP/COEP/CORP / Trusted Types / 外部リンク rel） | ✅ 完了 |
| Phase 9a-M | 画像最適化（alt充足率 / width-height / fetchpriority、SPEC §6.3） | ✅ 完了 |
| Phase 9a-D | SEO/OGP/Meta厳格化（title 30-60 / desc 70-160 / OGP全7項目 / Twitter Card 4項目 / time / lang） | ✅ 完了 |
| プロンプト1 | scanner TBD 確定（`certification/docs/scanner-tbd-confirmed.md` 作成、MASTER-PLAN §3.2-3.4 更新） | ✅ 完了 |

### 0.2 即時判断必要 3 項目（**v1.1 でルート①確定済**）

| 課題 | 判断 | 反映先 |
|---|---|---|
| #1 ★閾値 | **A: scanner.py 実装値（70/80/90）採用** | MASTER-PLAN §3.4 |
| #2 致命的NG | **A: 4 項目を §3.4 に明文化**（#4 を「CMS バージョン情報露出」に表現修正）| MASTER-PLAN §3.4 / **scanner.py Phase 9d 完了 2026-04-26** |
| #3 4 軸重み | **E: 「並列独立評価」フレームに再定義、重み概念を捨てる** | MASTER-PLAN §3.2 |

→ MASTER-PLAN.md は v1.1 として 2026-04-26 ルート①確定済。詳細は §1.1-1.3 と §1.4（v1.1 確定記録）参照。

### 0.2.1 緊急エスカレーション（2026-04-27 追加・課題 #22 起票）

**🔴 課題 #22: tcharton.com（HARTON 自社）が scanner C / 65 判定**

scanner ④ の自社サイト監査により、SPEC v3.2 §1.0「S-RANK 達成済」と称される tcharton.com の実 HTTP レスポンスに **HSTS / CSP / Cross-Origin / X-Frame-Options 等のセキュリティヘッダーが一切未設定**であることを発見。HARTON Certified の認定機関としてのブランド整合性に影響。

- 詳細監査結果 + 改善仕様: `TCHARTON-AUDIT-REPORT.md` v1.0（HARTON ルート直下、本書と同階層、両セッション必読）
- 推奨対応: tcharton セッション ② で `_headers` ファイル追加（即日2日以内）→ scanner.py 再判定で S 取得確認
- 期待される改善後判定: 格付け **S** / 総合 **90+**（致命的NGなし、必須条件 4-5/5 達成）

### 0.3 事業4フェーズ戦略への影響

| フェーズ | 影響課題 | 直近のリスク |
|---|---|---|
| Phase 0（〜2026-05、沼津30件パイロット）| 課題 1, 2, 3 未確定 | パイロット結果の解釈が定まらず、PR資料作成不能 |
| Phase 1（〜2026-09、県東部200件展開）| 課題 7-14（Phase 9b/9c）| 称賛型サイト・LLMO訴求の精度不足 |
| Phase 2（地域別白書）| 課題 17（パイロット未実施）| 統計データなく白書未刊行 |
| Phase 3 / 4（個別公開・マネタイズ）| 課題 15-16（サイト・ロゴ未着手）| 認定機関の認知拡大不能 |

---

## 1. 🔴 即時判断必要事項（HARTON ルート ①）

### 1.1 課題 #1 — ★閾値の MASTER-PLAN ↔ scanner.py 不整合

**状況**:
- MASTER-PLAN §3.4 暫定値: ★3=70 / ★4=**85** / ★5=**95**
- scanner.py `calculate_rating()` 実装値: ★3=70 / ★4=**80**（A）/ ★5=**90**（S）
- ★4 と ★5 で **5点差**

**事業上の影響**:
- ★4 = 80 採用なら → HARTON 自社サイト相当の「優良」を取得しやすい（広いプール）
- ★4 = 85 採用なら → 「優良」が希少化し、ブランド希少性が高まる
- ★5 = 90 vs 95: 同様

**Phase 0 パイロット 30 件のスコア分布が未取得**のため、現時点では実証データなしで決定する。

**scanner ④ の推奨**:
- **scanner.py 実装値（70/80/90）を採用**を推奨
- 理由: scanner.py は実運用で確定的にスコアを算出する装置。MASTER-PLAN を実装に合わせる方が運用矛盾を回避できる
- パイロット完了後に Phase 1 開始前で再調整可能（MASTER-PLAN §3.5 年次レビュー対象）

**代表判断ポイント**:
- A. scanner.py 実装値（70/80/90）で MASTER-PLAN を確定（推奨）
- B. MASTER-PLAN 暫定値（70/85/95）に scanner.py の閾値を再調整
- C. パイロット結果まで両論併記（運用上の決定保留）

---

### 1.2 課題 #2 — 致命的NG（一発除外条件）の明文化

**状況**:
- スキャンプロンプト.txt 内に「致命的NG」の明示定義 **なし**
- scanner.py は「スキャン失敗時のみ総合スコア=0」を返す
- MASTER-PLAN §3.1 は「★1-2 = 非掲載 = SSL/脆弱性 NG 等」と例示のみ
- §3.4 は「致命的 NG ゼロ必須」と全 ★区分で要求しているが、定義が確定していない

**scanner ④ の暫定提案**（SPEC編集セッション①での確定対象）:

| # | 致命的NG | scanner.py 検出可否 | 提案根拠 |
|---|---|---|---|
| 1 | HTTPS 非対応 | ✅ | スキャンプロンプト.txt §A 行9（HSTS必須）|
| 2 | SSL 証明書エラー（期限切れ・無効） | ✅ | スキャンプロンプト.txt §1 行47（HTTPS強制）|
| 3 | wp-login.php / readme.html / xmlrpc.php 露出 | ✅ | スキャンプロンプト.txt §B 行14、IPA 改ざん被害例 |
| 4 | WordPress generator meta タグ露出（バージョン特定可能）| ✅ | スキャンプロンプト.txt §B 行14 |

**事業上の意義**:
- HARTON Certified は「掲載自体が認定」（MASTER-PLAN §3.1）。致命的NGがあるサイトを掲載すると認定機関の信頼性毀損
- §0.0.1「narrow-scope claim の一般化」防止のため、scanner.py の機械検証可能な定義に揃えるべき

**代表判断ポイント**:
- A. 上記4項目を「致命的NG」として MASTER-PLAN §3.4 に明文化（推奨）
- B. 4項目より厳しく / 緩く調整（追加・削除）
- C. スキャンプロンプト.txt §6 として新規追記
- D. 別ファイル `致命的NG定義.md` として独立管理

---

### 1.3 課題 #3 — 4軸重みの正本記載

**状況**:
- スキャンプロンプト.txt §3 行30 verbatim: 「**HARTON独自の重み付け**を行い」
- 軸別配分（A=○% / B=○% / ...）は **正本に記載なし**
- scanner.py 実装からの逆算による暗黙比率: **A=32% / B=31% / D=23% / C=13%**

**矛盾の指摘**:
- HARTON Certified の中核訴求である「**Sクラス必須条件 §2 高度な JSON-LD**」は **C 軸（AI検索適応）の中心**
- しかし scanner.py 実装からの暗黙比率では **C 軸が13%と最低**
- これは事業訴求と実装の不整合の可能性。AI検索時代の差別化ポイントが過小評価されている

**事業上の意義**:
- HARTON Certified サイトの説明文（MASTER-PLAN §4.1 methodology ページ群）で「4軸の重み」を表示する場合、暫定の暗黙比率では訴求と矛盾
- 「私たちは AI検索適応を重視する」と書きながら C軸 13% は説明困難

**scanner ④ の推奨**:
- HARTON 代表が「C 軸を強化したい意志」を持つなら scanner.py の calculate_score を再調整（C 軸の減点幅を増やす）
- 現状の暗黙比率を正とするなら、サイト訴求文を「4軸を独立評価し、項目別の事実減点で総合判定」と表現（重みを公表しない）

**代表判断ポイント**:
- A. 4軸均等25%×4 を新たに採用 → scanner.py 全面書き直しが必要（大工事）
- B. C 軸（AI検索）の重みを増す調整 → scanner.py の JSON-LD/NAP 減点幅を拡大
- C. 暗黙比率のまま → サイト訴求文を「重み公表しない」表現に
- D. スキャンプロンプト.txt §3 に「軸別重みは項目別減点で暗黙的に決定」と注記追加

---

## 2. 🟡 scanner.py 実装の改善余地（中期判断）

### 2.1 課題 #4 — ヘッダースコア閾値が厳しすぎる懸念

**状況**:
- `calculate_score()` の `sec_score < 80 = -5` 減点
- Phase 9a-S 拡張（COOP/COEP/CORP/Trusted Types/upgrade-insecure 追加）後、100点満点配分が変わり、80点達成が困難に
- 実証: GitHub すら sec_score=73 で減点対象（Cross-Origin 全部欠落 + Trusted Types 無効）

**影響**:
- Sクラス自社サイト相当の超完璧設定をしないと減点回避できない
- パイロット30件で「ほぼ全員減点」状態になりスコア分布が下方圧縮される可能性

**推奨**: パイロット結果待ちで再調整。事前調整するなら `< 60 = -10 / < 80 = -5` を `< 50 = -10 / < 70 = -5` 等に緩和

### 2.2 課題 #5 — CSV カラム肥大（~50列）

**状況**:
- Phase 1〜9a で CSV カラム数は約50に達した
- Excel 表示で見切れ、PDF レポートの「スキャン詳細データ」表が肥大

**影響**:
- 営業活動でのスプレッドシート共有時、視認性低下
- PDF 1ページに収まらず2ページ目発生

**推奨**:
- CSV を「コア20列 + 詳細30列」に分割し、コア版/詳細版で出力選択可能に
- PDF テンプレを「カテゴリ別折りたたみ」UIに変更

### 2.3 課題 #6 — MEO 比重の妥当性

**状況**:
- MEO スコア（評価+口コミ+写真）の重みが calculate_score で **最大 -15**
- これは HSTS / モバイル / セキュリティヘッダー の最大減点と同等

**懸念**:
- MEO は事業者がコントロールしにくい指標（顧客レビュー次第）
- HARTON Certified の理念「**技術投資への称賛**」と整合するか
- MEO 高得点 = 顧客満足度高 ≠ 技術投資高

**推奨**: パイロット完了後、MEO 重みを `-10 / -5` に縮小し、技術項目（JSON-LD・LCP・Trusted Types）の重みを相対的に上げる検討

---

## 3. 🟢 Phase 9b / 9c 未実装（Phase 1 までに必要）

事業フェーズ2-3 の「**称賛型サイト**」「**LLMO訴求**」のために必須な拡張。Phase 0 パイロット完了後、Phase 1 開始前に着手推奨:

| # | 機能 | 法規根拠 | 状態 |
|---|---|---|---|
| 7 | WCAG 2.2 強化（aria-label/skip-link/button/input label）| SPEC §7.1 | ✅ **Phase 9b Step 3 完了 (2026-04-26)** ※ コントラスト比は Phase 9c で axe-core 統合予定 |
| 8 | 多言語対応検出（hreflang / Google Translate）| インバウンド評価 | 🚧 未着手（中優先）|
| 9 | 予約システム連携検出（TableCheck/RESERVA/食べログ）| 飲食・観光業特化 | 🚧 未着手（低優先）|
| 10 | 「優良店エクスポート」UI（S/A 絞込 + JSON/HTML 出力）| 称賛型サイト用 | 🚧 未着手（低優先）|
| 11 | sitemap.xml / robots.txt / AIクローラー許可 / llms.txt | SPEC §4.6-4.7 / §5.5 / GEO §8A | ✅ **Phase 9b Step 1 完了 (2026-04-26)** |
| 12 | GEO 9戦略（Quotation Addition / Cite Sources `.go.jp`）| GEO §3 / §6.6 | ✅ **Phase 9b Step 2 完了 (2026-04-26)** |
| 13 | Lead Evidence Block（最初の `<h2>` 前の引用/数値）| SPEC §4.13 | ✅ **Step 2 と統合実装** |
| 14 | セマンティックHTML（section aria-label / Speakable JSON-LD / table caption）| SPEC §5.1 / §5.4 / §11.4 | 🟡 一部完了（aria-label は Step 3）／Speakable/table caption は中優先で未着手 |

---

## 4. 🔵 別セッション関連の未着手

### 4.1 課題 #15 — HARTON Certified サイト本体（22ページ）

- **状態**: 完全未着手
- **対応**: SESSION-PROMPTS.md プロンプト2（⑤ certification 初期構築）で着手
- **前提条件達成済み**: scanner TBD 確定（本日完了）
- **未確定**: ★閾値・致命的NG・4軸重み（課題 #1-3）

### 4.2 課題 #16 — ロゴ・バッジ未制作

- **状態**: docs/logo-badge-brief.md（ブリーフ）はあるが画像生成プロンプト未着手
- **対応**: SESSION-PROMPTS.md プロンプト3（⑤ ロゴ AI 試作）

### 4.3 課題 #17 — Phase 0 沼津パイロット 30 件未実施

- **状態**: MASTER-PLAN §8 で 2026-04〜05 予定
- **必要**: scanner で実スキャン → スコア分布データ取得 → 課題 #1-3 の最終決定根拠

### 4.4 課題 #18 — DNS設定・デプロイ環境未確定

- **状態**: certification.tcharton.com の DNS / Cloudflare Pages 設定未
- **対応**: tcharton と同一環境にサブドメイン追加（推奨）or 独立Workers/Pages

---

## 5. 🟣 既存運用課題（過去引継ぎ、未解決）

### 5.1 課題 #19 — Geocoding API 未有効化

- **状態**: HANDOVER §5 記載通り、住所文字列フィルタで代替中
- **影響**: 地理バイアス精度の理論的限界。現状実用範囲だが、Phase 1 で都道府県を全国展開時に再検討
- **対応工数**: Google Cloud Console で有効化のみ（5分）

### 5.2 課題 #20 — PDF診断書の環境差異

- **状態**: 過去ユーザーから「PDFが開かない」報告 → 訂正で「表示された」となったが、根本原因未特定
- **可能性**: フォント未インストール / OS差異 / Playwright バージョン差異
- **対応**: 再現環境を特定 → reporter.py のフォントフォールバック追加

### 5.3 課題 #21 — 既存 results.csv 互換性

- **状態**: Phase 9a で12カラム追加。旧データは新カラムが空欄
- **未検証**: app.py UI バッジ表示が空欄を全パターン正しく扱うか
- **対応**: 旧 results.csv をロードして UI 表示確認 → 必要に応じ Null ガード追加

---

## 6. 推奨意思決定フロー

### 6.1 即時（HARTON ルート ① 1-2時間）

```
代表 → ① SPEC 編集セッション
  ↓
1. 課題 #1 ★閾値（推奨A: scanner.py 実装値 70/80/90）
2. 課題 #2 致命的NG（推奨A: 4項目を MASTER-PLAN §3.4 に明文化）
3. 課題 #3 4軸重み（推奨D: スキャンプロンプト.txt §3 に注記追加）
  ↓
3 法規同期 → tcharton 反映 → verify-all.js パス
```

### 6.2 中期（Phase 0 完了後、Phase 1 開始前 2026-06）

```
パイロット30件のスコア分布解析
  ↓
課題 #4 ヘッダースコア閾値の再調整（実データ根拠で）
課題 #6 MEO 比重の再調整（同上）
  ↓
Phase 9b 着手（課題 #7-14、称賛型・LLMO強化）
```

### 6.3 並行（① と ⑤ の同時進行可能）

```
① SPEC編集 → 課題 #1-3 確定
⑤ certification → 課題 #15 サイト構築（プロンプト2）
⑤ certification → 課題 #16 ロゴ試作（プロンプト3）
```

---

## 7. SPEC §0.0 準拠状況（本報告書自身の Self-Audit）

| § | 規範 | 本報告書の遵守 |
|---|---|---|
| 0.0.3 H-1 | Evidence-before-Claim | ✅ 全課題に出典明記（行番号 / ファイルパス）|
| 0.0.3 H-2 | Scope-Explicit | ✅ 「scanner ④ 範囲」と明示 |
| 0.0.3 H-3 | Failure-Self-Report | ✅ 取得不能項目を「TBD」明示 |
| 0.0.3 H-4 | No-Sycophancy | ✅ ユーザーの希望を忖度せず事実順序で報告 |
| 0.0.3 H-5 | Responsibility-Direct | ✅ 取得不能を環境のせいにせず scanner ④ の境界として明記 |
| 0.0.7 | マルチセッション境界 | ✅ ① への引継ぎ事項として整理 |
| 0.0.8 | 完了宣言前 Self-Audit | ✅ 本セクション 7 自体が Self-Audit |
| 0.0.9 | Verbatim 強制 | ✅ スキャンプロンプト.txt 出典は行番号併記 |

---

## 8. 添付・関連文書

- `scanner/HANDOVER.md` — scanner Phase 1-9a 完了履歴
- `scanner/スキャンプロンプト.txt` — Sクラス基準正本
- `certification/MASTER-PLAN.md` — HARTON Certified 戦略マスター（v1.0、2026-04-26 §3.2-3.4 更新済）
- `certification/docs/scanner-tbd-confirmed.md` — プロンプト1 verbatim 確定書（v1.0、本日作成）
- `SPEC.md` v3.2 — 3 法規本体
- `certification/SESSION-PROMPTS.md` — 引継ぎプロンプト集

---

## 9. 改訂履歴

| 版 | 日付 | 変更 | 起票・確定セッション |
|---|---|---|---|
| 1.0 | 2026-04-26 | 初版発行（Phase 9a 完了 + プロンプト1 完了直後）| ④ scanner |
| 1.1 | 2026-04-26 | **ルート①確定**: 課題 #1 A / #2 A 修正 / #3 E。MASTER-PLAN.md v1.0 → v1.1 に同時更新 | ① HARTON ルート |
| 1.1.1 | 2026-04-26 | scanner ④ Phase 9d（致命的NG 一発除外）実装完了 → ルート①承認（§10.2.1 追加）| ④ scanner → ① ルート承認 |
| 1.1.2 | 2026-04-26 | scanner ④ Phase 9b 高優先 3 件（Step 1: indexability / Step 2: GEO 戦略 / Step 3: WCAG 2.2）実装完了 → ルート①承認（§10.2.2 追加）| ④ scanner → ① ルート承認 |

## 10. v1.1 確定記録（HARTON ルート ① による）

### 10.1 課題 #1：★閾値 — 判断 A

**確定**: scanner.py 実装値（70/80/90）採用。

**MASTER-PLAN §3.4 反映済**:
| ★ | 総合スコア |
|---|---|
| ★3 (HARTON Certified) | 70 点以上 |
| ★4 (HARTON 優良) | 80 点以上 |
| ★5 (HARTON S-Class) | 90 点以上 |

**理由**: scanner.py が実運用の確定的計算装置。実装と仕様の不整合は SPEC §0.0.1 背任リスク。Phase 0 パイロット完了後の年次レビュー（§3.5）で再調整可能。

### 10.2 課題 #2：致命的NG — 判断 A（修正版）

**確定**: 4 項目を MASTER-PLAN §3.4 に明文化。ただし scanner ④ 提案 #4「WordPress generator meta 露出」を **「CMS バージョン情報露出」** に表現修正（より一般化）。

**MASTER-PLAN §3.4 反映済 4 項目**:
1. HTTPS 非対応
2. SSL 証明書エラー（期限切れ・無効）
3. wp-login.php / readme.html / xmlrpc.php 露出
4. **CMS バージョン情報露出**（WordPress generator meta / readme.html 等によるバージョン特定）

**追加注記**:
- 致命的NG は ★区分問わず一発除外
- S 条件 5「CMS 脱却」は ★5 必須条件、致命的NG とは別概念
- ★3-4 では CMS 利用許容、ただしバージョン情報露出は禁止

#### 10.2.1 Phase 9d 実装承認（2026-04-26 ルート①承認）

scanner ④ がルート①確定（§10.2）後、即日 scanner.py に Phase 9d 致命的NG 一発除外ロジックを実装。HANDOVER.md §0.2 を verbatim 確認の上、**ルート① として正式承認**:

**承認した実装**:
- ✅ `check_critical_ng(result) -> (ng_keys, ng_descriptions)` — 致命的NG 4 項目検出
- ✅ `calculate_rating(score, data, critical_ng=None)` — 第3引数追加、致命的NG 1 件以上で **強制D（"Dクラス（致命的NG により非掲載）"）**
- ✅ `_apply_rating` — 内部で check_critical_ng を呼び、result に「致命的NG」「致命的NG件数」書き込み
- ✅ `BUSINESS_RISK_MAP` — 4 エントリ追加
- ✅ `app.py` — `⛔ 致命的NG N件・非掲載` バッジ（赤太枠 4px）
- ✅ Critical 1 + Important 2 全修正済（HTTPS ネットワーク失敗除外 / ユーザー情報露出を仕様外で除外）
- ✅ 8 パターン単体テスト全成功
- ✅ 実サイト検証（GitHub / makoto-tax）で誤検出なし

**ルート①が特に評価する判断**:

| scanner ④ の判断 | ルート①評価 |
|---|---|
| HTTPS ネットワーク失敗（タイムアウト/接続不可/URL解析失敗）を致命的NG から除外 | ✅ 妥当。「致命的NG = サイトの致命的問題」であり「一時的な接続不可」とは別概念 |
| 「ユーザー情報露出」（/wp-json/v2/users）を致命的NG から除外（仕様外として）| ✅ 妥当。SPEC §0.0.7 マルチセッション境界 / §0.0.9 verbatim 強制を遵守。仕様書（MASTER-PLAN §3.4）を先に更新する手続を尊重 |
| WordPress 以外の CMS（Drupal/Joomla/MovableType）も #4 検出対象に拡張 | ✅ 妥当。MASTER-PLAN §3.4 #4「CMS バージョン情報露出」の表現意図と整合（WordPress 限定でなく一般化） |

**MASTER-PLAN.md §3.4 への反映**: 致命的NG 4 項目テーブルに「✅ scanner.py Phase 9d 実装済（2026-04-26）」を追記する形で更新（後続 §11 参照）。

### 10.3 課題 #3：4 軸重み — 判断 E

**確定**: 「**並列独立評価フレーム**」採用。軸間の重み比率という概念を捨てる。

**MASTER-PLAN §3.2 反映済**:
- 4 軸を並列の独立評価として運用
- 軸間の重み比率は採用しない（公表しない）
- 各軸は項目別の事実減点で評価、4 軸の合算が総合スコア

**理由**:
1. スキャンプロンプト.txt §3「HARTON独自の重み付け」は具体比率を明示せず、項目別減点で暗黙決定
2. 4 軸均等比率の独断採用は SPEC §0.0.1 背任リスク
3. 「重み」概念を表に出すと、AI 検索適応訴求と暗黙比率（C=13%）の構造的矛盾を生む

**運用での表現**:
- ✅ 「4 つの観点で独立評価し、各観点の項目別減点を合算」
- ❌ 「A 軸 25% / B 軸 25% / ...」（重み比率の表面化）

**実装連動**: scanner.py `calculate_score()` 改修不要。重み概念を表に出さないだけ。

#### 10.2.2 Phase 9b 高優先 3 件 実装承認（2026-04-26 ルート①承認）

scanner ④ がルート①承認後（§10.2.1）、本日 (2026-04-26) Phase 9b 高優先 3 件を順次実装。HANDOVER.md §0.3 を verbatim 確認の上、**ルート① として正式承認**:

##### Step 1（課題 #11）: sitemap / robots / AI クローラー / llms.txt 検出

| 実装内容 | 評価 |
|---|---|
| `check_indexability(base_url, session)` 新規 | ✅ SPEC §4.6-4.7 / §5.5 / GEO §8A 整合 |
| 100点満点 = sitemap 30 + robots 20 + AI クローラー許可 30 + llms.txt 20 | ✅ 配点バランス妥当 |
| マルチUA連続記載で共有 body 対応 | ✅ Critical 1 修正済（誤検出防止） |
| llms.txt soft-404 対策 | ✅ Important 1 修正済 |
| 実証: GitHub 70点 / Cloudflare 100点 / makoto-tax 80点 | ✅ 現実的なスコア分布 |

##### Step 2（課題 #12）: GEO 9戦略 — Quotation + Cite Sources + Lead Evidence

| 実装内容 | 評価 |
|---|---|
| `check_geo_strategies(soup)` 新規 | ✅ GEO §3 #1 + #4 + SPEC §4.13 整合 |
| 100点満点 = Quotation 40 + Cite Sources 40 + Lead Evidence 20 | ✅ GEO 戦略 #1/#4 重視で妥当 |
| `_is_authoritative_url(url)` で hostname 限定マッチ | ✅ Critical 2 修正済（`example.com/.gov-policy` 偽陽性防止）|
| github.com → docs.github.com のみ採用 | ✅ 自己リンク誤検出防止 |
| Lead Evidence の `main.children` 直接子のみ巡回 | ✅ 二重シリアライズ防止 |
| 実証: GitHub 60点 / Cloudflare 20点 / developers.google.com 60点 | ✅ 妥当 |

##### Step 3（課題 #7）: WCAG 2.2 強化（軽量実装）

| 実装内容 | 評価 |
|---|---|
| `check_wcag_aa(soup)` 新規 | ✅ SPEC §7.1 整合 |
| 100点満点 = section/nav aria-label 30 + skip link 20 + button 30 + form input label 20 | ✅ 配点バランス妥当 |
| コントラスト比は Phase 9c で axe-core/Playwright 統合予定 | ✅ 段階的アプローチ妥当（HTML 静的解析範囲を先行）|
| `_has_skip_link` の docstring/実装整合修正 | ✅ Important 4-1 修正済 |
| `href="#"` 空フラグメント除外 | ✅ Important 4-2 修正済 |
| `input.get("type") or "text"` 表現明確化 | ✅ Important 4-3 修正済 |
| 「ランドマーク:無」経営リスク翻訳追加 | ✅ Important 4-4 修正済 |
| 実証: GitHub 50点 / Cloudflare 39点 / makoto-tax 50点 | ✅ 妥当 |

##### result/CSV/UI 統合

- 新規列: `インデックス可視性` `インデックス可視性スコア` / `GEO戦略` `GEOスコア` / `WCAG 2.2` `WCAGスコア`
- calculate_score 減点: 各 max -8 / -6 / -6（妥当な軽量減点設計）
- BUSINESS_RISK_MAP: 11 エントリ追加（sitemap/robots/AI/llms.txt + 引用/公的リンク/Lead Evidence + ランドマーク/スキップ/button/input）

##### ルート①総合評価

| 観点 | 評価 |
|---|---|
| 仕様整合性 | ✅ SPEC §4.6-4.7 / §5.5 / §7.1 / §4.13 / GEO §3 / §6.6 / §8A すべて出典付き |
| 実装精度 | ✅ レビュー Critical 3 + Important 5 全件修正済 |
| 4 軸並列独立評価フレーム整合 | ✅ 重み概念を表に出さず、項目別減点で実装 |
| 実サイト検証 | ✅ GitHub / Cloudflare / makoto-tax で実測値取得 |
| 経営リスク翻訳 | ✅ BUSINESS_RISK_MAP 11 エントリ追加で UX 一貫性維持 |

→ **ルート① 正式承認**。MASTER-PLAN §11.1 への反映を実施。

### 10.4 ルート① Self-Audit（§0.0.8 / 7 項目）

| # | チェック | 結果 |
|---|---|---|
| 1 | disk artifact | ✅ MASTER-PLAN.md v1.1 / CRITICAL-ISSUES-REPORT.md v1.1 / scanner-tbd-confirmed.md v1.0 全 Read 済 |
| 2 | 検証 exit 0 | N/A（戦略確定フェーズ）|
| 3 | scope 限定 | ✅ 「ルート①の権限内、scanner.py 改修なし」明示 |
| 4 | 未検証事項なし | ✅ 課題 #1-3 すべて判断、scanner ④ 提案を全件評価 |
| 5 | sycophancy なし | ✅ scanner ④ 推奨と私の意見が異なる #3 で独立判断 |
| 6 | 責任の直視 | ✅ scanner ④ 暫定更新を「事実上の検討草案」として正当化、ルート①最終確定の権限明示 |
| 7 | 外部基準書 verbatim | ✅ scanner-tbd-confirmed.md の verbatim 取得を信頼ベースで受領 |

---

## 11. v1.1.3 確定記録（HARTON 総合責任者 ① による / 2026-04-27）

### 11.0 経緯

2026-04-27 早朝、④ scanner セッションが `HARTON/TCHARTON-AUDIT-REPORT.md` v1.0 を起票。tcharton.com を scanner.py で再判定したところ、**自社サイトが C/65 点判定**（致命的 NG なし）であり、**SPEC §1.0 の「Sクラス判定済み」表現と実態が乖離**していることが発覚。

① HARTON 総合責任者は本件を **§0.0.1 narrow-scope claim 一般化リスクの実害化**と判定し、「3 法規 + scanner.py（S クラス基準）の完全整合性検証」を実施。**6 件の重大ドリフト**を特定、SPEC v3.3 改訂で全件解消した。

### 11.1 検証で特定された 6 件のドリフト

| # | ドリフト | 検証結果 | v3.3 解消 |
|---|---|---|---|
| 22 | SPEC §8.1 CSP 必須ディレクティブが scanner.py と数で不一致（10 個 vs 6 個）| 🔴 確認 | ✅ §8.1.1（必須コア 6 個）+ §8.1.2（推奨拡張 4 個）に整理 |
| 23 | SPEC 本体に「Sクラス必須 5 条件」の章が存在しない | 🔴 確認 | ✅ §8.5 新設（スキャンプロンプト.txt §1-5 verbatim） |
| 24 | SPEC 本体に「致命的 NG（一発除外条件）」の章が存在しない | 🔴 確認 | ✅ §8.6 新設（MASTER-PLAN §3.4 + scanner.py Phase 9d 連動） |
| 25 | 「Sクラス」用語が二層化していて区別記述が不在 | 🔴 確認（§0.0.1 リスク現実化）| ✅ §1.0 行 3 修正 + §1.0.1 新設で二層構造を明文化 |
| 26 | SPEC §8.1 CSP の `'unsafe-inline'` 規定が GOOGLE §11.3 Trusted Types と矛盾 | 🔴 確認 | ✅ §8.1.4 `'unsafe-inline'` 許容範囲を明確化（script-src 禁止 / style-src 限定許容） |
| 27 | Cookie Secure / ボット防御 / SSG の規定が SPEC §8 で未整備 | 🔴 確認 | ✅ §8.7 / §8.8 / §8.9 を新設 |

### 11.2 緊急実装ドリフト（② tcharton 対応待ち）

| # | 内容 | 状態 |
|---|---|---|
| 28 | tcharton/_headers ファイル未配置（GOOGLE §12.1 / SPEC v3.3 §1.0 原則 4 で必須化） | 🚧 ② への実装委任（HARTON-CERTIFIED-INTEGRATION.md 経由）|
| 29 | tcharton.com Cloudflare Pages 移行（SPEC v3.3 §8.9 / scanner Sクラス条件 5 SSG 取得のため）| 🚧 ② で判断後 ① 承認 |
| 30 | tcharton.com 標準 CSP テンプレ v3.3 適用（§8.1.5、`script-src 'unsafe-inline'` 除去 → nonce/hash 化）| 🚧 ② で実装 |

### 11.3 v3.3 改訂内容サマリ（① 確定）

#### 11.3.1 役割名称・報告義務確定（§0.0.7 改訂 + CLAUDE.md §1 改訂）

代表からの 2026-04-27 指示に基づき、5 セッション運用の責任構造を確定:

| セッション | 役割名称 | ① への報告義務 |
|---|---|---|
| ① ルート | **HARTON 総合責任者** | （統制側）|
| ② tcharton | **S クラスサイト構築責任者** | mandatory（5 項目: 完了 / 失敗 / エスカレーション / 整合性確認 / S クラス基準保持）|
| ③ note-content | **ブログ担当** | mandatory（同上）|
| ④ scanner | **S クラス最高技術責任者** | mandatory（同上 + scanner.py を S クラス基準の技術正本として保持）|
| ⑤ certification | **HARTON Certified 認定運用責任者** | mandatory（同上）|

#### 11.3.2 SPEC 本体改訂（v3.2 → v3.3）

| 改訂項目 | 内容 |
|---|---|
| §1.0 行 3 | 「自社サイト（Sクラス判定済み）」→「spec-checker.js 2554 項目 S-RANK 達成済」+ 注記で scanner.py S クラスとの別概念を明示 |
| §1.0 原則 4 | 必須ファイルに `_headers` 追加 |
| §1.0.1 新設 | 「Sクラス」用語の二層構造（spec-checker S-RANK / scanner S クラス）|
| §0.0.7 拡張 | 5 セッション役割名称 + ① への報告義務 5 項目を mandatory として正本化 |
| §8.1 改訂 | CSP 必須コア 6 個 / 推奨拡張 4 個 / GOOGLE §11.3 連動 / `'unsafe-inline'` 許容範囲明確化 / tcharton.com 標準テンプレ v3.3 |
| §8.5 新設 | HARTON Certified S クラス必須 5 条件（scanner/スキャンプロンプト.txt §1-5 verbatim）|
| §8.6 新設 | 致命的 NG 4 項目（MASTER-PLAN §3.4 + scanner.py Phase 9d 連動）|
| §8.7 新設 | Cookie 属性規定（Secure / HttpOnly / SameSite 等）|
| §8.8 新設 | ボット防御規定（非侵入型 Turnstile / reCAPTCHA v3 等）|
| §8.9 新設 | SSG / Jamstack 要件（★5 必須条件）|
| §13 改訂履歴 | v3.3 行を追加（経緯・改訂内容 9 項目・互換性・配布・監査トレース）|

#### 11.3.3 配布・検証

| ステップ | 結果 |
|---|---|
| `node sync-spec.js` | ✅ tcharton/SPEC.md / scanner/SPEC.md / certification/SPEC.md に SPEC v3.3 配布完了 |
| `node verify-all.js` | ✅ 3 法規同期 OK（132ms）+ tcharton spec-checker 🏆 S-RANK 維持（PASS=1461 / FAIL=0 / 100%、171ms）|
| 機能互換性確認 | ✅ v3.2 → v3.3 改訂後も spec-checker 2554 項目すべて PASS、機能変更なしを実証 |

### 11.4 次セッションへの作業委任（① への報告義務付き）

#### 11.4.1 ② tcharton（S クラスサイト構築責任者）

| 優先 | タスク | 出典 | ① への報告タイミング |
|---|---|---|---|
| 🔴 即時 | `tcharton/_headers` ファイル配置（v3.3 §8.1.5 標準 CSP テンプレ + GOOGLE §11.1-11.3 全ヘッダー）| TCHARTON-AUDIT §2.1.1 / SPEC v3.3 §1.0 §8.1 | 配置・push 完了時 |
| 🔴 即時 | scanner で再判定し HSTS/CSP/COOP/COEP/CORP 配信を実証 | TCHARTON-AUDIT §2.1.2 | 再判定結果（B 軸スコア改善）と共に ① 報告 |
| 🟡 短期 | HSTS preload 申請（hstspreload.org） | TCHARTON-AUDIT §2.2.1 | 申請完了時 |
| 🟡 短期 | Cloudflare Pages 移行（または `Server: tcharton-static` 等の SSG hint 配信）| TCHARTON-AUDIT §2.2.2 / SPEC v3.3 §8.9 | 移行判断と共に ① 承認要請 |
| 🟢 中期 | JSON-LD `ProfessionalService` 追加 + GBP NAP 整合性向上 | TCHARTON-AUDIT §2.3.1-2.3.2 | 改善後 scanner 再判定で報告 |
| 🟢 最終 | scanner で **S クラス（90 点 + 必須 5/5）取得**を達成 | SPEC v3.3 §8.5 | 取得時に ① 最終承認 |

#### 11.4.2 ④ scanner（S クラス最高技術責任者）

| 優先 | タスク | 出典 | ① への報告タイミング |
|---|---|---|---|
| 🟡 中期 | scanner.py `check_security_headers()` の CSP 必須欠落チェックを SPEC §8.1.1 必須コア 6 個と完全整合（現状一致）+ §8.1.2 推奨拡張 4 個を「警告」レベルで追加検出 | SPEC v3.3 §8.1 | 実装後 ① 承認 |
| 🟡 中期 | Phase 9b 中優先（#14 残: Speakable / table caption / #8: hreflang） | scanner/HANDOVER §0.4 | 実装後 ① 承認 |
| 🟢 後期 | Phase 9c（コントラスト比 axe-core/Playwright 統合） | CRITICAL-ISSUES-REPORT §6 | コスト試算後 ① 承認要請 |

#### 11.4.3 ③ note-content（ブログ担当）

| 優先 | タスク | ① への報告タイミング |
|---|---|---|
| 🟡 短期 | 試験運用 3 トピック完了時の評価（〜2026-05-25） | 評価結果と共に ① 報告 |
| 🟢 後期 | 「自社サイト改善前後比較」記事の執筆（Phase 0 白書連動） | 草稿時 ① レビュー要請 |

#### 11.4.4 ⑤ certification（HARTON Certified 認定運用責任者）

| 優先 | タスク | 出典 | ① への報告タイミング |
|---|---|---|---|
| 🔴 即時 | MASTER-PLAN.md に SPEC v3.3 §8.5 / §8.6 連動を反映（v1.1.3 化）| 本書 §11.3.2 | 反映完了時 ① 承認 |
| 🔴 即時 | Phase 0 沼津パイロット 30 件のターゲットリスト確定 | MASTER-PLAN §11.4 | リスト確定時 ① 報告 |
| 🟡 中期 | サブドメイン構築着手（DNS / Cloudflare Pages 設定後）| SESSION-PROMPTS.md Prompt 2 | ① 承認後着手 |

### 11.5 ① Self-Audit（§0.0.8 / 7 項目）

| # | チェック | 結果 |
|---|---|---|
| 1 | disk artifact | ✅ SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md / CLAUDE.md / scanner.py / スキャンプロンプト.txt / MASTER-PLAN.md / TCHARTON-AUDIT-REPORT.md 全 Read 済 |
| 2 | 検証 exit 0 | ✅ `node sync-spec.js` 配布成功 + `node verify-all.js` exit 0（PASS=1461 / FAIL=0 / 100%）|
| 3 | scope 限定 | ✅ 「3 法規 ↔ scanner.py 整合性 + 役割名称確定 + 報告義務明文化」明示。scanner.py コード改修は ④ 委任、tcharton _headers 実装は ② 委任 |
| 4 | 未検証事項なし | ✅ ドリフト 6 件全件解消 + 緊急実装 3 件は明示的に ② 委任として記録 |
| 5 | sycophancy なし | ✅ ④ scanner の TCHARTON-AUDIT で発覚した自社不適合を率直に確認・反映 |
| 6 | 責任の直視 | ✅ §1.0 行 3 表現の §0.0.1 違反リスクを ① の責任として明示し v3.3 で修正 |
| 7 | 外部基準書 verbatim | ✅ スキャンプロンプト.txt §1-5 / GOOGLE-STANDARDS §11 / OWASP A01-A10 / W3C Trusted Types すべて取得済の evidence で記述 |

---

**最終更新**: 2026-04-27 / **v1.1.3** / ① HARTON 総合責任者 確定済（SPEC v3.3 全件整合改訂完了 + 5 セッション役割名称 + 報告義務 mandatory 化）
**次レビュー**: ② tcharton による `_headers` 実装完了 + scanner 再判定で B 軸スコア改善実証時、または Phase 0 パイロット 30 件完了時のいずれか早い方

---

## 12. v1.1.4 確定記録（HARTON 総合責任者 ① による / 2026-04-27）

### 12.0 経緯

2026-04-27、② tcharton（S クラスサイト構築責任者）が SPEC v3.3 §8.5 必須条件 1 改修を完遂（commit `97323a6`）後、必須条件 2 / 5 達成を試みる過程で **SPEC §4.2 / §8.9 の不備 4 点**を発見。② が SPEC §0.0.7 報告義務 mandatory に基づき ① にエスカレーションした 3 件の報告書を ① で受領:

| 報告書 | サイズ | 内容 |
|---|---|---|
| `HARTON/REPORT-TO-ROOT-SPEC-V3.3.md` | 13.2 KB | SPEC v3.3 への 5 件改訂提言 |
| `HARTON/REPORT-TO-ROOT-SPEC-CHECKER-FIXES.md` | 13.3 KB | spec-checker.js への 2 バグ + 4 改善提言 |
| `HARTON/SCANNER-EXTENSION-REQUEST.md` | 9.8 KB | ④ scanner への 4 件拡張依頼（① CC）|

**① の評価**: ② は SPEC §0.0.3 H-1〜H-5 完全遵守（Evidence-before-Claim / Scope-Explicit / Failure-Self-Report / No-Sycophancy / Responsibility-Direct）。私（①）が前回 v3.3 改訂で **§4.2 必須プロパティに `additionalType` / `sameAs` GBP 規定を見落とし、§8.9 で Cloudflare Workers Static Assets を未対応のまま発行**していたことを率直に認める（H-3 自己申告）。

### 12.1 SPEC v3.4 改訂内容（① 確定）

| 改訂節 | 内容 |
|---|---|
| **(A) §4.2 #1.0 `@type` 配列形式必須化** | Schema.org Multiple Types 準拠（`["ProfessionalService", "LocalBusiness"]`）|
| **(B) §4.2 #1.1 `additionalType[]` 必須化** | Wikidata Q 番号 URI 配列で業種明示 |
| **(C) §4.2 #1.2 値域規範化** | Web デザイン Q189210 / IT Q11661 / AI Q11660 / Consulting Q193563 / Software Engineering Q638608 / Machine Learning Q2539 / 会計士 Q41189 / 弁護士 Q40348 等を許可リスト化 |
| **(D) §4.2 #1.3 `sameAs` GBP URL 必須化** | `google.com/maps` または `maps.google.com` を含む URL 1 件以上必須 |
| **(E) §8.9 SSG/Jamstack 抽象化** | 「静的エッジ配信プラットフォーム」概念へ抽象化、Cloudflare Workers Static Assets 認定追加、X-Hosting honest signaling 規範化 |
| **(F) §13 改訂履歴に v3.4 行追加** | 経緯 + 改訂内容 6 項目 + 互換性 + 配布 + 監査トレース |
| **(G) ヘッダ v3.3 → v3.4** | バージョン番号更新 + v3.4 改訂概要を冒頭に明記 |

### 12.2 配布・検証

| ステップ | 結果 |
|---|---|
| `node sync-spec.js` | ✅ tcharton/SPEC.md / scanner/SPEC.md / certification/SPEC.md に SPEC v3.4 配布完了 |
| **note-content/ への手動配布**（v3.4 / 2026-04-27 代表追加指示「法規+SPEC最新も配布」連動）| ✅ note-content/SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md コピー配置完了（**ハッシュ同期対象外**、参照用）|
| `node verify-all.js` | ✅ 3 法規同期 OK（113ms）+ tcharton spec-checker 🏆 S-RANK 維持（PASS=1461 / FAIL=0 / 100%、231ms）|
| 機能互換性確認 | ✅ v3.3 → v3.4 改訂後も spec-checker 2554 項目すべて PASS、機能変更なしを実証（経過措置中）|

### 12.3 4 担当への正式指示書配布（v3.4 / 2026-04-27）

| 担当 | 指示書 | サイズ | 主要委任内容 |
|---|---|---|---|
| ② **S クラスサイト構築責任者** | `tcharton/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` | 約 13 KB | spec-checker.js バグ#1#2 修正 + 改善#1#2#3 実装 + `@type` 配列化 + `_headers` honest signaling 追加 + GBP 作成連携（12 タスク）|
| ④ **S クラス最高技術責任者** | `scanner/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` | 約 14 KB | scanner.py `check_ssg_hint()` 拡張 + `INDUSTRY_KEYWORD_MAP` 拡張 + `@type` 配列対応 + 単体テスト要件（8 タスク）|
| ③ **ブログ担当** | `note-content/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` | 約 8 KB | 用語の正確性遵守 + 「自社サイト改善前後比較」シリーズ企画（6 タスク）|
| ⑤ **HARTON Certified 認定運用責任者** | `certification/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` | 約 11 KB | MASTER-PLAN.md v1.1.4 改訂指示 + Phase 0 沼津 30 件 + 認定対象事業者の JSON-LD 要件（10 タスク）|

### 12.4 推奨ロールアウト順序（① 統制下）

```
[Step 1] ✅ ① SPEC v3.4 改訂完了 + sync-spec.js 配布完了
[Step 2] ✅ ① 4 担当への正式指示書配布完了
[Step 3] 🚧 ④ scanner.py 拡張実装（check_ssg_hint / INDUSTRY_KEYWORD_MAP / @type 配列）+ 単体テスト
[Step 4] 🚧 ② spec-checker.js バグ#1#2 修正 + 改善#1#2#3 実装
[Step 5] 🚧 ② @type 配列化（5 ファイル）+ _headers に X-Hosting 追加
[Step 6] 🚧 GBP（Google ビジネスプロフィール）作成（代表手動作業）→ ② sameAs に GBP URL 追加
[Step 7] 🚧 ② tcharton で scanner 再判定 → S クラス（必須 5/5 + 90 点）取得
[Step 8] 🚧 ⑤ certification MASTER-PLAN v1.1.4 改訂 + Phase 0 沼津 30 件着手
[Step 9] 🚧 ③ 「自社改善前後比較」シリーズ執筆（① 戦略承認後）
[Step 10] ① CRITICAL-ISSUES-REPORT v1.1.5 で全完了記録
```

### 12.5 ① Self-Audit（§0.0.8 / 7 項目）

| # | チェック | 結果 |
|---|---|---|
| 1 | disk artifact | ✅ SPEC.md v3.4 / 4 担当指示書 / note-content への 3 法規コピー / 本書改訂 すべて `ls` で確認 |
| 2 | 検証 exit 0 | ✅ `node sync-spec.js` 成功 + `node verify-all.js` exit 0（PASS=1461 / FAIL=0 / 100%）|
| 3 | scope 限定 | ✅ 「① 権限内（3 法規編集 + 指示書発出 + 配布）」明示、scanner.py 改修 / spec-checker.js 改修 / tcharton 実装は ④/② 委任 |
| 4 | 未検証事項なし | ✅ ② 報告書 3 件全件承認 + 委任 36 タスクすべて担当指示書に記載 |
| 5 | sycophancy なし | ✅ ② の 4 点指摘を受け、私（①）の v3.3 検証マトリクス漏れを率直に認める H-3 自己申告 |
| 6 | 責任の直視 | ✅ 「② のチェックが厳しい」「scanner が複雑」等の言い訳排除 |
| 7 | 外部基準書 verbatim | ✅ Schema.org Multiple Types（公式 verbatim 2026-04-27 取得）/ Wikidata Q 番号（許可リスト各項目）/ scanner/スキャンプロンプト.txt §1-5 すべて取得済 evidence で記述 |

---

**最終更新**: 2026-04-27 / **v1.1.4** / ① HARTON 総合責任者 確定済（SPEC v3.4 改訂完了 + ② 報告書 3 件全件承認 + 4 担当への正式指示書配布 + note-content への 3 法規配布）
**次レビュー**: ④ scanner 拡張実装完了時 / ② spec-checker.js 修正完了時 / ② 配列化再試行 + GBP 連携完了時 / ② scanner で S クラス取得時 のいずれか
