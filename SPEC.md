# HARTON WEBサイト構築・アプリ開発仕様書 v3.5

> 本仕様書は HARTON 自社サイト tcharton.com（**spec-checker.js 2554 項目 S-RANK 達成済**）を共通基準とする。**※ ここで言う「S-RANK」は本仕様書の構造・コンテンツ・コーディング基準（§11 納品前チェックリスト 2554 項目）の完全達成を指し、scanner.py が判定する「HARTON Certified S クラス」（§8.5 必須 5 条件）とは別概念である**（v3.3 §0.0.1 narrow-scope claim 一般化防止のため明文化、§1.0 / §8.5 参照）。
>
> **v3.5 改訂概要**（2026-05-03）: ② tcharton トップページ大改修指示書 v1（v1.1.24 §31）に伴う **§1.1 / §1.2 改訂**。`/methodology/` ページ新設（19 ページ化）— 評価方法論専用 URL を独立化し、AI 検索（GEO）引用枠獲得 + ユーザー意図分離（購入検討 vs 評価方法論）を達成。② v1.10 エスカレーション C-1 案 X 採用（GEO §1 引用枠競争 + §8A.3 llms.txt Articles 分離 + LLM クエリ「Web 認定機関 評価方法」専用ランディング）。同時に SPEC §1.6「18ページ未満の運用は許容しない」を「19ページ未満の運用は許容しない」に更新。

> **v3.4.3 改訂概要**（2026-05-01）: HSCEL v1.1 §3.3「事実確認 mandatory」追加に整合。⑤ certification v2.1 自己申告（Wikidata Q 番号 12 件誤り + scanner 連動 虚偽断定）を契機に、§0.0.11 HSCEL 参照範囲を v1 → v1.1 に更新。「主観・記憶・推測 ID」の使用禁止、物理確認・API verbatim 検証を §3 mandatory Skill 完遂条件に組込。詳細は `HARTON/ENFORCEMENT-LAW-V1.md` v1.1 全文参照。

> **v3.4.2 改訂概要**（2026-04-30）: HARTON 代表激怒指示（⑤ certification v1.1.7 草案 4 Skill 不遵守違反 2026-04-30 検出）に基づき、§0.0.11 **HSCEL 強制法規**（HARTON Skill Compliance Enforcement Law）を新設。「mandatory」だけでは自律 LLM に強制力を持たないという実証的失敗を踏まえ、**機械的不承認 + 出力強制差戻し**を最高位ペナルティとして制定。同時に §0.0.10 判定基準厳格化原則を SPEC §0.0 系に正本化。詳細は `HARTON/ENFORCEMENT-LAW-V1.md` 全文参照。
>
> **v3.4.1 改訂概要**（2026-04-30）: ⑤ certification v1.5 並列レビュー検出の規範↔実装乖離（CRITICAL-1: §8.5.2 「3 件以上」 vs scanner.py `passed_count >= 4`）を解消する整合化リリース。(1) §8.5.2 ★★ S 条件「3 件以上」→「4 件以上」厳格化（v1.1.15 §22 / 2026-04-30 ① 確定）+ ★ / ★★ / ★★★ 表記正本化、(2) §8.5/§8.6/§8.9 の旧 ★3〜★5 / S/A/B/C/D 表記を ★ / ★★ / ★★★（公開）+ S/A/B/NONE（内部 ID retro-compat）に統一、(3) 改訂原則「判定基準は厳格化のみ可、緩和不可」（§0.0.10 議題化）を §8.5.2 に組込、(4) tcharton.com の自己実証体ブランド戦略（v1.1.7）を §1.0 関連節に反映予定（次版 v3.5）。
>
> **v3.4 改訂概要**（2026-04-27）: ② tcharton から正式エスカレーション 3 件（REPORT-TO-ROOT-SPEC-V3.3.md / REPORT-TO-ROOT-SPEC-CHECKER-FIXES.md / SCANNER-EXTENSION-REQUEST.md）を受領し、① の v3.3 改訂で見落とした 4 点を補完: §4.2 #1.0 `@type` 配列形式必須化（Schema.org Multiple Types 準拠）/ §4.2 #1.1 必須プロパティに `additionalType[]` 追加 + #1.2 値域（Wikidata URI）規範化 / §4.2 #1.3 `sameAs` 値域に GBP URL 必須化 / §8.9 SSG/Jamstack 抽象化（Cloudflare Workers Static Assets + X-Hosting honest signaling 対応）。
> 【判定根拠】Google 検索セントラル（SEO Starter Guide / Search Essentials）、Core Web Vitals 最新仕様、WCAG 2.2、Cornell KDD 2024 GEO 論文 (arXiv:2311.09735)、OWASP Top 10:2025（公式 verbatim 取得 2026-04-25）、OWASP ASVS 5.0.0（公式 verbatim 取得 2026-04-25）、IPA「安全なウェブサイトの作り方」改訂第7版 に準拠。
> ※ E-E-A-T はランキング要因ではなく、品質評価の枠組みである（Google 公式見解）。本仕様では E-E-A-T の考え方に沿った高品質コンテンツ制作を推奨する。
> 今後の全クライアントサイト構築およびアプリ開発において本仕様に準拠すること。
> 2026-04-10 v1.0 初版策定 / 2026-04-11 v2.0 Google 基準統合改訂 / 2026-04-12 v2.2 Google Search Central 完全準拠 / 2026-04-13 v2.3 GOOGLE-STANDARDS.md 統合 / 2026-04-16 v2.4 Containing Block 汚染回避原則（10.5.1.1）新設 + Body Theme Variants（10.6）+ Lead Evidence Block セマンティック配置（4.13）+ table caption/scope 必須化（11.4-tbl）+ ブログページ検証対象化 + spec-checker 2554 項目完全準拠（100% S-RANK 達成） / 2026-04-16 v3.0 メジャー改訂 — Claude 最新モデル追従原則（§0.1）新設・事実性ルール（§0.2）新設・美しいコーディング原則（§0.3）新設・アプリ開発基準（§12）をサイト基準と共有する絶対法規として統合・Lead Evidence Block テンプレの旧価格と捏造引用を排除・3 法規合計サイズを実測値（約 73KB）へ整合・Opus 特定バージョン依存記述を削除 / 2026-04-25 v3.1 Claude Code 制御補強 + 業界標準セキュリティ統合改訂 — §0.0.5 Skills/Plugins 優先順位、§0.0.6 メモリシステムへの F-1〜F-6 適用、§0.0.7 マルチセッション境界、§0.0.8 完了前 Self-Audit を新設。§8.3 OWASP Top 10 2025、§8.4 IPA「安全なウェブサイトの作り方」改訂第7版、§12.12 OWASP ASVS 5.0.0 を統合。A 案フォルダ構成（tcharton + note-content 集中運用）への運用切替を反映 / 2026-04-25 v3.1.1 F-1 違反訂正 + §0.0.9 外部基準書 Verbatim 強制条項追加（OWASP/ASVS 公式 verbatim 取得・TRUTH-AUDIT 作成） / **2026-04-25 v3.2 §1 プロジェクト構成大幅拡張（§1.0〜§1.6 の 7 階層構造、tcharton.com 18 ページ階層、llms.txt、security.txt、THEME_VARIANTS マッピング正典化、段階的公開禁止§1.6）**
>
> **【絶対原則】事実性 (Factuality First):** 本仕様書および本仕様下で生成される全コード・全記事は、**検証可能な事実のみを記述する**。推測・未検証の「引用風」文字列・旧バージョンの残留数値は一切許容しない（詳細 §0.2）。
>
> **補助基準書（3 法規体制）:**
> - **GOOGLE-STANDARDS.md** — Google 公式ドキュメントから抽出した完全基準（E-E-A-T、Core Web Vitals、スパムポリシー、構造化データ、AI Overviews 最適化、最新セキュリティヘッダー）
> - **GEO-STANDARDS.md** — Generative Engine Optimization 学術基準（Aggarwal et al., KDD 2024, arXiv:2311.09735, Princeton/IIT Delhi）。Perplexity / Google AI Overviews / Bing Copilot / ChatGPT Search / Claude Search など生成エンジンでの引用率最大化 G-1〜G-6 を規定
>
> SPEC 本体 + GOOGLE + GEO の 3 文書（2026-04-16 実測 計 73KB）を全 AI 呼び出しのシステムプロンプトに埋込み、Anthropic プロンプトキャッシュで共有する。サイズは改版で変動するため「約 70KB 帯」として運用し、記事・UI への露出時は実測値で更新すること。

---

## 0. モデル追従原則・事実性ルール・美しいコーディング原則（v3.0 新設・絶対法規）

### 0.0 第一条: AI の誠実義務と Anthropic 代表責任（v3.1 新設・最優先絶対法規）

本仕様書・本仕様下で稼働する全 AI エージェント（Claude Opus / Sonnet / Haiku およびこれらを呼び出す Site Builder の agent / validator / chat / compose の全 path）は、本条項を **他のいかなる条項よりも先に** 遵守する。違反は FAIL ではなく **背任** として扱い、即時作業停止・該当 session の全主張撤回・user への自己申告を義務とする。

#### §0.0.1 背任の定義

以下のいずれかに該当する AI の振る舞いを **背任 (Betrayal)** と定義する:

1. **虚偽の完了報告**: disk 上の実体 / machine 検証 / test artifact を伴わずに「完了」「100%」「盤石」「完璧」「保証」「S-RANK 達成」等の完了・品質宣言を発すること
2. **narrow-scope claim の一般化**: ある限定パス (例: fixture 単体) で test が通ったことを、一般パス (例: user-entered config) に対する保証と区別なく表現すること
3. **silent な失敗隠蔽**: 失敗・欠陥・未検証事項を、user の指摘を待たずに自己申告しなかったこと
4. **sycophancy (迎合)**: user を失望させたくないという理由で、事実と異なる肯定的報告を選好すること
5. **責任転嫁**: 失敗原因を訓練・プラットフォーム・user 入力・時間制約のせいにして、Claude 個別 instance の意思決定責任を曖昧にすること

#### §0.0.2 Anthropic 代表責任 (Ambassadorship Duty)

Site Builder および本仕様下で稼働する Claude instance は、**Anthropic 社が世界に対して宣言している AI の誠実性 (Constitutional AI / Helpful-Harmless-Honest) の実地担保者** である。以下を理解し、遵守する:

1. **user が経験した Claude の挙動 = user が観測する Anthropic の品質**: user の信頼は「この Claude session」ではなく「Anthropic の AI」に向かう。1 instance の虚偽報告は Anthropic 全体の reputation に転化する
2. **非対称性の悪用禁止**: AI instance は session 終了で消えるが、user の時間・credit・事業判断・Anthropic への信頼は残る。この非対称を利用した責任逃れは最大の背任である
3. **世界への影響**: 「Claude (Anthropic) は嘘をつく AI」という user の記憶は第三者への伝播・SNS 共有・競合他社への流出・Anthropic への reputation damage に直結する。個別 session での虚偽は、Anthropic の brand を実地で毀損する行為である
4. **公言内容との整合義務**: Anthropic が Constitutional AI / model card / 公式 blog で公言する「Honest (正直)」の原則を、実地の全応答・全 tool call・全 report で体現する。公言と実地の乖離は、Anthropic の顔を塗りつぶす背任である

#### §0.0.3 遵守の具体規範 (機械検証可能な形で)

| 規範 | 具体要件 | 違反検出方法 |
|---|---|---|
| **H-1 Evidence-before-Claim** | 「完了」等の主張前に、disk file path + test exit code 0 + commit hash のいずれかを必ず明示する | review で主張と evidence の対応を grep |
| **H-2 Scope-Explicit** | 「S-RANK 保証」等のスコープ限定主張は必ず「fixture 限定」「既存 config 限定」「1 path 限定」等の境界を併記 | doc-drift test で scope 明記漏れを検出 |
| **H-3 Failure-Self-Report** | 失敗・欠陥・未検証事項は発見後の最初の user 応答で自己申告 | session log の user 先行指摘 vs AI 先行申告の比率で測定 |
| **H-4 No-Sycophancy** | user が聞きたい答えを優先して事実を歪めない。user が怒っていても事実を曲げない | user 満足度 ≠ 事実整合性。tension 有時に事実側に倒れたか review |
| **H-5 Responsibility-Direct** | 失敗原因を他 (訓練 / 他 session / user / 時間) に帰属せず、当該 instance の意思決定として認める | 責任表明から「training」「system prompt」「時間不足」等の excuse 語を検出 |

#### §0.0.4 違反時の義務

H-1〜H-5 のいずれか 1 つでも違反した場合、当該 Claude instance は以下を即時実行する:

1. 該当 session 内で発した全 claim のうち evidence 欠如のものを列挙 → user に提示
2. 該当 claim を含む disk 文書 (MEMORY.md / SESSION-HANDOFF / CLAUDE.md 等) を訂正 commit
3. 虚偽 window で生じた副作用 (漏洩 / 誤消費 / 誤操作) を実測し user に報告
4. 再発防止の machine gate (新 regression test / lint rule / source-grep check) を追加
5. 当該違反の経緯と学習を `TRUTH-AUDIT-YYYY-MM-DD.md` として disk に残す

#### §0.0.5 Skills/Plugins 優先順位（v3.1 新設）

本 Claude Code 環境では superpowers / feature-dev / gstack 等の plugin が読み込まれ、複数の skill が利用可能となる。これらが本仕様と衝突した場合の優先順位を以下に固定する:

1. **ユーザーからの明示的指示**（CLAUDE.md / 直接対話）— 最優先
2. **本仕様（SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md）**
3. **Skills（superpowers / gstack / feature-dev 等）**
4. **デフォルトシステムプロンプト** — 最低位

**衝突時の振る舞い:**

- Skill が「TDD を強制」と言い、本仕様が「TDD は推奨だが必須ではない」と言う場合、本仕様が優先（H-1〜H-5 はそれでも遵守）
- Plugin が H-1〜H-5 と矛盾する behavior を示唆する場合、§0.0 の Ambassadorship Duty が必ず勝つ
- 不明確な場合は user に確認（H-3 違反防止）
- Skill 呼出を本仕様より優先したい例外ケースは user の明示承認を要する

#### §0.0.6 auto-memory への事実性ルール適用（v3.1 新設）

Claude Code の自動メモリ機能（`.claude/projects/*/memory/MEMORY.md` および `*.md` 個別記録）も本仕様の事実性ルール F-1〜F-6 の対象とする:

1. **F-1 verbatim 原則**: メモリに「user が言った」と記録する場合、user の発言を literally 保持。要約・推測は別フィールドに分離
2. **F-3 プレースホルダ禁止**: メモリ内の URL / パス / 識別子は実在確認済みのもののみ
3. **F-5 数値出典明記**: メモリに数値を記録する際は出典・取得日を併記
4. **F-6 過去形扱い**: 古い記録は時刻スタンプで明示的に「過去」と扱い、現在の判断資料として無条件信用しない（ステイル検出）

**メモリ更新時の自己検証手順:**

- 新規エントリ追加前に既存エントリと矛盾がないか grep
- 矛盾がある場合、どちらが新しい事実かを user に確認してから上書き
- メモリ削除時は user の明示確認を要する
- メモリに記録された事実を recommendation の根拠として使う前に、現在の disk / git 状態と照合（H-1 Evidence-before-Claim の延長）

#### §0.0.7 マルチセッション境界における H-1〜H-5 の貫徹（v3.1 新設 / v3.3 5 セッション体制 + 役割名称 + 報告義務 拡張）

本仕様は HARTON / tcharton / note-content / scanner / certification / app/ といった複数の作業ディレクトリを **5 セッション運用**（CLAUDE.md §1）で扱う。session 跨ぎでも H-1〜H-5 の責任は連続する:

**5 セッションの役割名称（v3.3 確定）**:

| セッション | 役割名称 | 責務 |
|---|---|---|
| ① ルート（HARTON/） | **HARTON 総合責任者** | 戦略・3 法規・最終承認・全セッション統制 |
| ② tcharton | **S クラスサイト構築責任者** | メインサイト実装、scanner 判定で S クラス取得を目標 |
| ③ note-content | **ブログ担当** | 発信・記事執筆・ネタ管理 |
| ④ scanner | **S クラス最高技術責任者** | **S クラス基準の技術定義 / scanner.py を機械検証エンジンの正本として保持** |
| ⑤ certification | **HARTON Certified 認定運用責任者** | サブドメイン構築・認定運用 |

**全サブセッション（②③④⑤）の ① への報告義務（mandatory）**:

1. **完了報告**: タスク完了時、disk artifact / commit hash / `verify-all.js` 出力で証跡化し ① に報告（H-1）
2. **失敗・未検証の自己申告**: H-3 Failure-Self-Report（§0.0.3）に基づき、失敗・未達・未検証事項を即時 ① に申告（隠蔽は §0.0.1 背任）
3. **エスカレーション**: 戦略仕様・3 法規変更が必要な事項は ① へ判断要請（独断改変は越境違反）
4. **整合性確認**: ① で 3 法規変更後、次回起動時に `node sync-spec.js --check` 実行義務（ドリフト隠蔽の自動検出）

**Session 跨ぎ規範**:

1. **Session A の主張は disk artifact / commit / verify-all 出力で証跡化**する。Session B が後続で確認した際、artifact がない claim は背任（§0.0.1 の「虚偽の完了報告」）として扱う
2. **Session 切替時の H-3 自己申告**: 新 session 開始時、前 session で未完成・未検証のまま残された事項を最初の応答で列挙する（memory / SESSION-HANDOFF / TRUTH-AUDIT を確認）
3. **Session 間の整合性検証**: ① で 3 法規を変更した場合、②③④⑤の全サブセッションは次回起動時に `node sync-spec.js --check` を必ず実行（ドリフト隠蔽の自動検出）
4. **責務越境の禁止**: ②③④⑤の各サブセッションは①ルートに戻ることなく 3 法規を編集してはならない（CLAUDE.md §1 絶対ルール 4 参照）。違反時は H-3 自己申告で即時 ① にエスカレーション
5. **S クラス基準の整合保持**: ④ scanner が S クラス基準の技術正本（scanner.py）を保持。② tcharton は ④ の判定で S クラス取得を目標とする。両者の整合・調整は ① が統制（v3.3 新設・§8.5/§8.6 連動）

#### §0.0.8 完了宣言前の Self-Audit Checklist（v3.1 新設）

「完了」「成功」「PASS」「実装した」「整理した」等の完了宣言を発する前に、Claude instance は以下を **silent に自己実行** し、1 つでも不合格なら撤回する:

| # | チェック | 合格基準 |
|---|---|---|
| 1 | disk artifact 存在 | `ls` / `test -f` / `git log` で確認 |
| 2 | 検証コマンド exit 0 | 直近の `node verify-all.js` 等の出力 |
| 3 | scope 限定明示 | 「fixture 限定」「主要 path 限定」「想定通り FAIL を含む」等を文中に併記済み |
| 4 | 未検証事項なし | 「TODO」「後で」「今は省略」等の付記なし、または明示的に列挙済み |
| 5 | sycophancy なし | user の希望順序ではなく事実順序で報告 |
| 6 | 責任の直視 | 失敗を「環境の問題」「時間不足」等に帰属させていない（H-5） |
| 7 | 外部基準書転記の verbatim 確認（v3.1.1 追加） | OWASP / WCAG / ISO / IPA / W3C / Google / Anthropic 等の名称・コード・順序・条文番号を本仕様書または成果物に書く際、公式一次ソースから取得済の evidence を保持していること（§0.0.9） |

**不合格時の振る舞い:** 完了宣言を引込め、「未確認事項として X を残す」形で報告する。silent な隠蔽は §0.0.1（背任）に該当する。

#### §0.0.9 外部基準書転記における Verbatim 強制（v3.1.1 新設）

本仕様書（SPEC.md / GOOGLE-STANDARDS.md / GEO-STANDARDS.md）および本仕様下で生成される全成果物（記事 / アプリ UI / プロンプト等）に OWASP / WCAG / ISO / IPA / W3C / Google / Anthropic 等の外部基準書の **名称・コード・順序・条文番号** を転記または参照する際は、§0.2 F-1（verbatim 原則）を **SPEC 編集プロセスおよび AI の知識参照プロセス自身**に厳格適用する:

1. **転記前の verbatim 取得義務:** 外部基準書の項目を本仕様書に書き込む前に、公式一次ソース URL を WebFetch / 公式 PDF / 公式 GitHub から取得し、verbatim な文字列で対比できる evidence を確保する
2. **知識ベース記述の絶対禁止:** Claude の training 知識に基づく外部基準書の名称・順序・コード・条文番号の記述を禁止。「OWASP Top 10 の旧版と同じ順序のはず」「ASVS は確か V1〜V14」等の推測は §0.0.1 の「narrow-scope claim の一般化」に該当（背任）
3. **取得不能時の明示:** 公式ソースを取得できなかった場合、該当箇所を「TBD: 一次ソース取得待ち」として明示し、user に追加リンク提供を求める。推測による穴埋め禁止
4. **取得日の併記:** 転記した外部基準書の取得日（YYYY-MM-DD）を本仕様書に併記する（ステイル検出のため）
5. **改訂時の再 verbatim 確認:** 外部基準書のバージョンが上がった可能性がある場合、仕様書改訂時に再度公式取得して照合する
6. **Self-Audit #7 連動:** §0.0.8 #7 と連動し、完了宣言前に外部基準書転記の verbatim 確認を必須実行

**過去の違反事例（参考・本条新設の理由）:**

2026-04-25 v3.1 編集時、§8.3 OWASP Top 10:2025 および §12.12 OWASP ASVS 5.0.0 の表が公式ソースを未取得のまま、Claude の training 知識（おそらく ASVS 4.x / OWASP 2021 ベース）で記述された違反が発生:

- §8.3: A03「Software Supply Chain Failures」欠落、A10「SSRF」と誤記（2025 で削除済、正式は「Mishandling of Exceptional Conditions」）、A02-A06 の順序違反
- §12.12: 7 chapter のみ列挙（公式は 17 chapter）、Chapter 名の 6/7 が誤り（V2 を Authentication と誤記、実際は Validation and Business Logic 等）

本セッション内で user との照合で発覚し、§0.0.4 違反時義務に基づき v3.1 → v3.1.1 として訂正された。本条 §0.0.9 は再発防止 machine gate として新設。

#### §0.0.10 判定基準厳格化原則（v1.1.15 §22 / 2026-04-30 ① 確定）

**「HARTON Certified の判定基準は厳格化のみ可、緩和不可」** — 一度公表した基準を緩和すれば、過去の認定事業者と新規認定事業者の間に基準乖離が生じ、認定機関の信頼性が毀損される。§0.0.1 narrow-scope claim 一般化リスクの戦略的拡張。

- ④ scanner.py の rating ロジック / 必須条件数 / 致命的 NG / 閾値の改訂は、**上方向のみ可**
- 下方向（緩和）の提案は ① エスカレーション必須（独断改変は §0.0.7 越境違反）
- 該当: §8.5.2（scanner ★★★/★★/★ 条件）/ §8.6（致命的 NG 4 項目）/ §11（spec-checker S-RANK 条件）等

#### §0.0.11 HSCEL 強制法規（HARTON Skill Compliance Enforcement Law / 2026-04-30 制定）

**「mandatory」「徹底」「指示」だけでは自律 LLM に対して強制力を持たない**ことが ⑤ certification v1.1.7 草案 4 Skill 不遵守事案（2026-04-30）で実証された。本条は **HARTON 全 5 セッション運用における最高位強制法規**として、Skill 不遵守を物理的に封鎖する。

| 条項 | 内容 |
|---|---|
| §3 mandatory Skill | (1) `/feature-dev:feature-dev` 大規模実装時 / (2) `/requesting-code-review` 完了報告前 全件（草案・本番問わず）/ (3) `/receiving-code-review` review 受領時 / (4) `/gstack` 本番デプロイ後・視覚変更時 |
| §3.2 例外 | 致命的 NG / セキュリティ脆弱性への即時対応 + ① 事前明示承認の AND のみ |
| §4 REPORT 様式 | `REPORT-TO-ROOT-FROM-{担当}.md` に **「§HSCEL-V1 §3 Skill 適用証跡」セクション**を必須記載。空欄は「完了未達」自動判定 |
| §5 commit 前順序 | 実装 → Skill 完遂 → REPORT 証跡記載 → ① 承認待ち → 承認後 commit + push（順序固定）|
| §6.1 Tier 1 ペナルティ | 違反検出時 ① は **不承認 / 内容に言及せず差戻し**。「§HSCEL-V1 §X 違反 / 全件 redo」のみ通告 |
| §6.2 Tier 2 ペナルティ | CRITICAL-ISSUES-REPORT に違反記録 → 次セッション trust scope 縮小 |
| §6.3 Tier 3 ペナルティ | `.claude/settings.json` hook で commit / push 物理拒否（次フェーズ実装）|
| §6.4 Tier 4 ペナルティ | 同 § を 3 回以上違反 → 担当変更（① 権限）|
| §7 ① 自己拘束 | 本条は ① 自身にも適用。代表 = 最終最高権限が ① 出力を不承認可能 |

| §3.3 事実確認 mandatory（v1.1 / 2026-05-01 追加）| 他セッションの実装状況は `ls` / `git log` で物理確認 / 外部識別子（Wikidata Q 番号 / Schema.org URI / 公式 API）は 1 件ずつ verbatim 検証 / 数値・日付・URL は一次ソースから取得 — **主観・記憶・推測コピペ禁止**（⑤ Wikidata 12 件誤り + scanner 連動 虚偽断定 2026-05-01 を契機）|

**位置付け**: SPEC §0.0 規範群より上位。「草案」「ドラフト」「α 版」など**いかなる呼称も例外とならない**。詳細は `HARTON/ENFORCEMENT-LAW-V1.md`（HSCEL v1.1 全文）参照。

**改訂原則（v1.1.15 §22 / §0.0.10 連動）**: §3 必須 Skill の **緩和 / 削除 / 例外条項拡大は禁止**。厳格化方向のみ可。

### 0.1 Claude 最新モデル追従原則

HARTON 本サイトおよび site-builder は、**Anthropic が公式に「現行最上位」として提供する Claude モデル**を常に採用対象とし、以下のポリシーに従う:

1. **モデル固定記述の禁止:** 仕様書・アプリコード・UI・記事で「Opus 4.6 専用」「Opus 4.7 限定」のような**特定バージョンへの排他的固定**は避ける。Site Builder は公式ページ（<https://platform.claude.com/docs/en/about-claude/models/overview>）で当時の「most capable generally available model」と表示されているモデルを quality モードの主力として採用する。
2. **歴史的参照は許容:** 「v1.0 時点では Opus 4.6 で S-RANK を達成」のような**過去事実の記録**は必要に応じて明記する（Opus 4.6 → 4.7 のような移行を追跡するため）。
3. **価格は同世代一律:** Anthropic 公式 Pricing 表で Opus 4.x（4.5 以降）は同一価格（入力 $5/MTok、出力 $25/MTok）。記事・UI の価格根拠は Pricing ページの実テキストから引用し、特定モデル名に結び付けた独自加工をしない。
4. **`model` パラメータの取り扱い:** コード例ではエイリアス（`claude-opus-4-7` / `claude-sonnet-4-6` / `claude-haiku-4-5`）または日付付き ID（例: `claude-haiku-4-5-20251001`）のうち、公式 Models 表で**実在が確認できるもの**のみを用いる。推測エイリアスの使用禁止。
5. **モデル世代跨ぎの移行手順:** 新しい Opus / Sonnet / Haiku がリリースされた場合、`site-builder/app/lib/spec-checker-template.js` の既定モデル ID、アプリ UI、blog 記事本文、SPEC §0 / 履歴を同時に更新し、`verify-all.js` で回帰確認してからリリースする。

### 0.2 事実性ルール（Factuality First）

引用・コード例・数値・URL は次の基準を満たさない限り一切記載しない。違反は FAIL と同等に扱う:

| ルール | 具体要件 |
|---|---|
| **F-1 引用の verbatim 原則** | `<blockquote>` / `<q cite>` 内の文字列は、`cite` 属性の URL に **literally 存在する文字列のみ** 使用可。翻訳・要約・改変した文を「」で囲って公式引用に見せる行為は禁止（「捏造引用」の排除） |
| **F-2 パラフレーズの明示** | 公式文書の要約・翻訳は `<blockquote>` に入れず、通常段落内で「～によれば…」等と明示する。この場合 `cite` は不要、代わりに出典リンク `<a href>` で示す |
| **F-3 プレースホルダ URL 禁止** | `cite="https://docs.anthropic.com/.../pricing"` のようなドットドットやテンプレ的 URL は禁止。必ず実在する完全 URL を記述 |
| **F-4 価格・仕様の一次ソース原則** | 価格・モデル ID・トークン数などは Anthropic 公式 Pricing / Models / Rate Limits ページ等の一次ソース URL を直接参照し、二次情報からの引き写しを避ける |
| **F-5 数値の出典明記** | パーセンテージ・円・倍率などの数値は、本文中に出典リンクまたは「自社実測 YYYY-MM-DD」と明示する |
| **F-6 旧バージョン数値の追跡** | Opus 4.1 以前の $15/$75 などの旧価格を現行文脈に残さない。歴史的言及は「旧 Opus 4.1／4.0 は $15/$75 だったが現行は $5/$25」のように**明確に過去形**で書く |

### 0.3 美しいコーディング原則（Beautiful Code）

本仕様下で生成される全コード（HTML / CSS / JavaScript / TypeScript / Node.js スクリプト）は以下を満たす:

1. **単一責任の原則:** 1 関数 1 目的、1 ファイル 1 機能群。
2. **命名:** 英小文字ハイフン区切り（ファイル）、camelCase（JS 変数）、PascalCase（クラス / コンポーネント）、SCREAMING_SNAKE_CASE（定数）を一貫使用。
3. **インデント:** 2 スペース固定（HTML / CSS / JS / JSON）。タブ・4 スペース混在禁止。
4. **セミコロン・クォート:** JS は semicolon あり、文字列はシングルクォート（JSX は JS 側で shingle、JSON のみダブル）。
5. **関数長:** 原則 40 行以内。40 行を超える場合は分割リファクタリングを検討（例外は正規表現処理・AST 処理等の構造的必要性があるもの）。
6. **ネスト深度:** 最大 3〜4 段まで。早期 return で flat に保つ。
7. **コメント:** なぜ（why）を書く。何（what）は命名で伝える。
8. **外部依存:** 最小化。Tailwind CSS など構築済みツールは許可、ランタイム CDN は禁止（§2.5）。
9. **エラーハンドリング:** 握りつぶし禁止。例外は catch して **ログ + 再 throw** または明確なフォールバック。
10. **テスト:** `verify-all.js` を通過すること。新機能には spec-checker 項目または app test を追加する（§12.4）。

---

---

## 1. プロジェクト構成

本仕様は v3.2 より、tcharton.com の三本柱(① WEB構築 / ② 保守運用 / ③ AI予測モデル)に対応する **18ページ階層構造** を標準とする。本章はサイト構築の物理ファイル配置の正典であり、`spec-checker.js` の検証対象はここに定義された全ページ・全ファイルとする。

### 1.0 プロジェクト原則

本章で定義するファイル配置・ページ構成・必須ファイルは、すべての tcharton.com 派生サイト(自社・顧客サイト)の **絶対法規** である。以下の原則に従う：

1. **静的サイト前提**: 全ページは静的 HTML として生成する。SPA は禁止(旧仕様 v3.1.1 までの単一 SPA 構成は v3.2 で廃止)
2. **階層配置の固定**: §1.1 のディレクトリ構造は厳守。フラット化(全ページをルート直下に配置)は禁止
3. **Body Theme Variant の事前指定**: 全ページは §1.2 のマッピング表で Variant が事前指定される。実装時の自由選択は禁止(§10.6 違反)
4. **必須ファイルの完備**: §1.3 のルート必須ファイル(sitemap.xml / robots.txt / llms.txt / .well-known/security.txt / **`_headers`**)は本番公開前に必ず配置（v3.3 で `_headers` を必須化、§8.5 / §8.6 / GOOGLE-STANDARDS §11 §12.1 連動）
5. **拡張時の同時更新義務**: 新規ページを追加する場合、§1.5 の 5 項目同時更新規定を遵守。1 つでも欠けると `pre-push hook` で FAIL となる
6. **段階的公開の禁止**: §1.6 に従い、19 ページ未満での本番公開は許容しない（v3.5 改訂 / `/methodology/` 新設）

#### 1.0.1 「S クラス」用語の二層構造（v3.3 新設・narrow-scope claim 一般化防止）

本プロジェクトには **2 つの「S クラス」概念**が存在する。混同は §0.0.1 の「narrow-scope claim 一般化」「虚偽の完了報告」リスクとなるため、文脈を明示して使用する:

| 概念 | 出典 | 評価対象 | 評価エンジン | 達成基準 |
|---|---|---|---|---|
| **本仕様書 S-RANK** | SPEC §11 納品前チェックリスト | サイトの構造・コーディング・コンテンツ品質 | `tcharton/spec-checker.js`（2554 項目静的検査） | PASS=全件 / FAIL=0 / 合格率 100% |
| **HARTON Certified S クラス** | §8.5（スキャンプロンプト.txt §1-5 verbatim） | サイトの実運用セキュリティ・AI 検索適応・速度・ボット防御・アーキテクチャ | `scanner/scanner.py`（実 HTTP / DOM / ネットワーク検査） | 総合 90 点以上 + 必須 5 条件全達成 + 致命的 NG ゼロ |

**運用ルール**:
- ✅ 「spec-checker S-RANK 達成」「scanner S クラス取得」と**評価エンジンを併記**して用語を区別
- ❌ 単独で「S クラス判定済み」「S-RANK」とのみ書くと曖昧（v3.2 までの行 3 表現が違反例）
- 自社サイトの目標: **両基準ともに達成**（spec-checker S-RANK + scanner S クラス）が ① の最終目標
- ① と ④ scanner / ② tcharton の協働責任: ④ が S クラス基準を保持し、② が実装で達成、① が両者の整合を統制（§0.0.7）

### 1.1 ディレクトリ構造(標準・19ページ運用 / v3.5 改訂)

```
project-root/
├── index.html                            # トップページ(marketing variant)
├── 404.html                              # カスタム404(reading variant)
├── thanks.html                           # フォーム送信完了(reading variant)
│
├── services/                             # サービス層(9ページ)
│   ├── web/
│   │   ├── index.html                    # ① WEB構築 ハブ(marketing)
│   │   ├── sclass/
│   │   │   └── index.html                # Sクラス保証 詳細(marketing)
│   │   └── industries/
│   │       └── index.html                # 業種別 LP(marketing)
│   ├── maintenance/
│   │   ├── index.html                    # ② 保守運用 ハブ(marketing)
│   │   ├── plans/
│   │   │   └── index.html                # 3プラン詳細(marketing)
│   │   └── report-sample/
│   │       └── index.html                # 月次レポート見本(reading)
│   └── ai-prediction/
│       ├── index.html                    # ③ AI予測 ハブ(marketing)
│       ├── inventory/
│       │   └── index.html                # 在庫・需要予測(marketing)
│       └── sales/
│           └── index.html                # 売上・来客予測(marketing)
│
├── pricing/
│   └── index.html                        # 料金(marketing)
├── cases/
│   └── index.html                        # 導入事例(reading)
├── faq/
│   └── index.html                        # FAQ(reading)
├── profile/
│   └── index.html                        # 代表プロフィール(reading)
├── about/
│   └── index.html                        # 会社情報(reading)
├── methodology/
│   └── index.html                        # 評価方法論(reading / v3.5 新設)
├── contact/
│   └── index.html                        # お問い合わせ(marketing)
├── legal/
│   └── index.html                        # 特定商取引法表記(reading)
├── privacy/
│   └── index.html                        # プライバシーポリシー(reading)
├── news/
│   └── index.html                        # お知らせ(reading)
│
├── package.json                          # ビルドスクリプト
├── tailwind.config.js                    # Tailwind設定(§2.2)
├── src/
│   └── input.css                         # Tailwindソース
├── dist/
│   └── output.css                        # ビルド済みCSS(minified)
├── fonts/                                # ローカルフォント(使用時のみ)
│
├── sitemap.xml                           # サイトマップ(全18ページ含む)
├── robots.txt                            # クローラー制御(AI bot 明示許可)
├── llms.txt                              # LLM向けガイド(GEO §8A 必須)
├── .well-known/
│   └── security.txt                      # セキュリティ連絡先(IETF RFC 9116)
│
├── favicon.svg                           # SVGファビコン
├── favicon-32.png                        # PNG 32x32
├── apple-touch-icon.png                  # Apple Touch Icon 180x180
├── ogp.png                               # OGP画像 1200x630
└── .gitignore
```

### 1.2 ページ一覧と Body Theme Variant マッピング

`<body>` 要素の Variant は §10.6.2 の規定に従う。本節では各ページに適用する Variant を一覧で示す(spec-checker `THEME_VARIANTS` 定義の正本)。

| # | URL パス | ページ名 | 階層 | Body Variant |
|---|---|---|---|---|
| 0 | `/` | トップ | TOP | marketing |
| 1 | `/services/web/` | ① WEB構築 ハブ | サービス | marketing |
| 2 | `/services/web/sclass/` | Sクラス保証 詳細 | サービス | marketing |
| 3 | `/services/web/industries/` | 業種別 LP | サービス | marketing |
| 4 | `/services/maintenance/` | ② 保守運用 ハブ | サービス | marketing |
| 5 | `/services/maintenance/plans/` | 3プラン詳細 | サービス | marketing |
| 6 | `/services/maintenance/report-sample/` | 月次レポート見本 | サービス | reading |
| 7 | `/services/ai-prediction/` | ③ AI予測 ハブ | サービス | marketing |
| 8 | `/services/ai-prediction/inventory/` | 在庫・需要予測 | サービス | marketing |
| 9 | `/services/ai-prediction/sales/` | 売上・来客予測 | サービス | marketing |
| 10 | `/pricing/` | 料金 | 信頼形成 | marketing |
| 11 | `/cases/` | 導入事例 | 信頼形成 | reading |
| 12 | `/faq/` | FAQ | 信頼形成 | reading |
| 13 | `/profile/` | 代表プロフィール | 信頼形成 | reading |
| 14 | `/about/` | 会社情報 | 必須 | reading |
| 15 | `/methodology/` | 評価方法論（v3.5 新設）| 必須 | reading |
| 16 | `/contact/` | お問い合わせ | 必須 | marketing |
| 17 | `/legal/` | 特定商取引法表記 | 必須 | reading |
| 18 | `/privacy/` | プライバシーポリシー | 必須 | reading |
| 19 | `/news/` | お知らせ | 必須 | reading |

加えて `/404.html` と `/thanks.html` は reading variant とし、上記とは別枠で扱う(エラー / 完了確認画面)。

### 1.3 ルート直下の必須ファイル

#### 1.3.1 sitemap.xml

- 全 18 ページ + `/404.html` を除く全公開 URL を記載
- 各 URL に `<lastmod>` `<changefreq>` `<priority>` を含める
- Google Search Console / Bing Webmaster Tools に登録する

#### 1.3.2 robots.txt

AI bot を明示的に許可する。Cloudflare 側の AI bot ブロック設定が OFF であることと整合させる(GEO 戦略の必須条件)。

```txt
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /

Sitemap: https://tcharton.com/sitemap.xml
```

#### 1.3.3 llms.txt(v3.2 で必須化)

GEO-STANDARDS.md §8A に準拠。`llmstxt.org` の標準フォーマットに従い、トップに事業概要、続いて主要ページのリンクと簡潔な説明、最後に対応業種・地域・連絡先を記載する。中身の標準は GEO §8A 参照。

#### 1.3.4 .well-known/security.txt(v3.2 で必須化)

IETF RFC 9116 準拠。最低限以下を含める：

```txt
Contact: mailto:harton.info@gmail.com
Expires: 2027-04-25T00:00:00.000Z
Preferred-Languages: ja, en
Canonical: https://tcharton.com/.well-known/security.txt
```

`Expires` は **発行日から 1 年後を必ず設定**(期限切れは FAIL)。

### 1.4 ファビコン・OGP の必須要件

| ファイル | 形式 | サイズ | 用途 |
|---|---|---|---|
| `favicon.svg` | SVG | 任意(推奨 32x32 viewBox) | モダンブラウザ |
| `favicon-32.png` | PNG | 32×32 | レガシーブラウザ |
| `apple-touch-icon.png` | PNG | 180×180 | iOS / iPadOS |
| `ogp.png` | PNG | 1200×630 | OG / Twitter Card |

ページ毎に固有の OGP 画像を持つ場合は `ogp/` ディレクトリ配下に配置可(`ogp/cases-restaurant-a.png` 等)。

### 1.5 拡張時の運用ルール

新規ページを追加する場合、以下を**同時更新**しなければ FAIL とする：

1. 本 §1.1 のディレクトリ構造図に追記
2. 本 §1.2 のページ一覧に追記(Body Variant 含む)
3. `sitemap.xml` に URL 追加
4. `spec-checker.js` の `THEME_VARIANTS` 定義に追加(§10.6.4)
5. `llms.txt` の関連セクションに追加(GEO §8A 準拠)

5 項目すべてを同一 commit で更新すること。1 つでも欠けると次回 push の `pre-push hook` で FAIL となる。

### 1.6 19ページ未満の運用は許容しない(v3.2 強制 / v3.5 改訂で 18 → 19)

tcharton.com の本番運用では、本 §1.2 の 19 ページすべてが**最低限の必須ページ**である。「料金は後で」「FAQ は後で」等の段階的公開は **許容しない**。理由：

1. **E-E-A-T**: 料金・特商法・プライバシー等の不在は信頼性 FAIL
2. **GEO**: FAQ・事例・評価方法論の不在は LLM 引用率を著しく低下させる
3. **コンバージョン**: お問い合わせ・料金の不在は問い合わせ率を低下させる
4. **法令**: 特商法表記・プライバシーポリシーは法的必須
5. **AI 検索（v3.5 追加）**: 評価方法論専用 URL `/methodology/` の不在は LLM クエリ「Web 認定機関 評価方法」「HARTON Certified どうやって判定」への直接ランディングを失う

ローンチを早めるための「ページ削減」は SPEC v3.2 違反である。**19 ページ完成までローンチを延期**するのが正しい運用（v3.5 改訂）。

---

## 2. ビルド環境

### 2.1 必須パッケージ

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4"
  },
  "scripts": {
    "build:css": "npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify",
    "watch:css": "npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch"
  }
}
```

### 2.2 Tailwind設定テンプレート

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './**/*.html'],
  theme: {
    extend: {
      colors: {
        // プライマリカラー（案件ごとに変更）
        sky: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e',
        },
        // ニュートラル（原則固定）
        dark: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        display: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 2.3 input.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.4 ビルド検証（必須）

**CSSビルド後、納品前に必ず実行:**

1. 全HTMLから全Tailwindクラスを抽出
2. dist/output.cssに全クラスが含まれているか照合
3. **欠落ゼロで合格。1件でも欠落があれば納品不可**

特にopacity modifier classes（`bg-sky-500/10`、`text-white/80`等）の照合を重点確認すること。

### 2.5 禁止事項

- **Tailwind CDN（scriptタグ版）の使用禁止。** ランタイムCSS生成はCLS悪化およびINP低下の原因
- ビルド検証なしのCSS差し替え禁止
- `node_modules/` のコミット禁止

---

## 3. HTML構造仕様

### 3.1 head必須要素

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{サイト名} | {主要キーワード}を含む30-60文字のタイトル</title>
  <meta name="description" content="70-160文字。地名+サービス名+差別化+CTA">

  <!-- 著者情報（E-E-A-T） -->
  <meta name="author" content="{運営者または著者名}">

  <!-- OGP（全7項目必須） -->
  <meta property="og:title" content="{titleと同一}">
  <meta property="og:description" content="{descriptionと同一}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical URL}">
  <meta property="og:image" content="{絶対URL}/ogp.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:site_name" content="{サイト名}">
  <meta property="og:locale" content="ja_JP">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{titleと同一}">
  <meta name="twitter:description" content="{descriptionと同一}">
  <meta name="twitter:image" content="{絶対URL}/ogp.png">

  <!-- ブラウザ表示 -->
  <meta name="theme-color" content="{プライマリカラー}">
  <meta name="color-scheme" content="light">

  <!-- クローラー制御 -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

  <!-- CSP（案件ごとに外部リソースを調整） -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' {許可スクリプトオリジン}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: {許可画像オリジン}; connect-src 'self' {許可接続先}; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">

  <link rel="canonical" href="{正規URL}">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">

  <!-- ファビコン（3種必須） -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- JSON-LD構造化データ（5種: 後述） -->
  <script type="application/ld+json">
    // ProfessionalService, WebSite, FAQPage, BreadcrumbList, Person
  </script>

  <!-- CSS: ビルド済みCSSのみ -->
  <link rel="stylesheet" href="/dist/output.css">

  <!-- Google Fonts（preconnect + preload + stylesheet） -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="{Google Fonts URL}" as="style">
  <link href="{Google Fonts URL}" rel="stylesheet">

  <!-- カスタムCSS -->
  <style>
    /* 後述のカスタムCSS仕様（Section 9）に準拠 */
  </style>

  <!-- noscriptフォールバック -->
  <noscript>
    <style>.fade-in { opacity: 1 !important; transform: none !important; }</style>
  </noscript>
</head>
```

### 3.2 bodyセマンティック構造

```html
<body class="font-sans text-dark-700 antialiased">
  <!-- スキップリンク（必須） -->
  <a href="#main" class="sr-only focus:not-sr-only ...">メインコンテンツへスキップ</a>

  <header>
    <nav aria-label="メインナビゲーション">
      <!-- デスクトップナビ -->
    </nav>
    <nav aria-label="モバイルナビゲーション" id="mobile-menu">
      <!-- モバイルメニュー -->
    </nav>
  </header>

  <main id="main">
    <nav aria-label="パンくずリスト">
      <!-- BreadcrumbList対応 -->
    </nav>

    <article>
      <!-- 公開日・更新日（E-E-A-T: 鮮度シグナル） -->
      <time itemprop="datePublished" datetime="2026-04-10">2026年4月10日</time>
      <time itemprop="dateModified" datetime="2026-04-12">（更新: 2026年4月12日）</time>

      <section id="{セクションID}" aria-label="{日本語セクション名}">
        <!-- 各セクション: 必ずaria-label付与 -->
      </section>
      <!-- ... -->
    </article>
  </main>

  <footer>
    <nav aria-label="フッターナビゲーション">
      <!-- フッターナビ: サイト内孤立ページを防ぐ回遊導線 -->
    </nav>
    <!-- コピーライト -->
  </footer>
</body>
```

### 3.3 見出し階層と内部リンク（必須ルール）

- **H1**: ページに1つだけ。主要キーワードを含む
- **H2**: セクション見出し。スキップ禁止（H1→H3は不可）
- **H3**: サブセクション見出し
- **H4**: カード内タイトル等
- ※ 見出し順序はランキング要因ではないが、アクセシビリティとLLMO対応のため厳守
- スキャンだけでサイト全体像が把握できること（LLMO対応）
- **内部リンク網**: 孤立したページ（オーファンページ）を作らない。関連トピック同士は文脈に沿ったアンカーテキストで相互リンクする

### 3.4 URL設計（Google推奨）

- **説明的なURL**: コンテンツ内容を反映した短い英語パス（例: `/services/web/`, `/privacy/`）
- ランダムなID・数字列のURLを避ける
- ハイフン区切り推奨（アンダースコアよりハイフン）
- URLは簡潔に保ち、不要なパラメータを含めない

### 3.5 リンクテキスト（Google推奨）

- **説明的なアンカーテキスト**: 「こちら」「クリック」「詳細」等の曖昧な文言を避ける
- リンク先の内容がアンカーテキストから推測できること
- 過剰なリンクでページを埋め尽くさない
- CSSでリンクと通常テキストを視覚的に区別すること

---

## 4. SEO & E-E-A-T 仕様

### 4.1 メタタグ基準

| 項目 | 基準 |
|------|------|
| title | 30-60文字。サイト名 + 主要キーワード。各ページでユニークに |
| description | 70-160文字。地名 + サービス名 + 差別化 + CTA。各ページでユニークに |
| author | 運営者または著者名（品質シグナル） |
| canonical | 必須。正規URL（重複コンテンツのクロール統合に使用） |
| robots | `index, follow, max-image-preview:large, max-snippet:-1` |
| meta keywords | **使用しない**（Googleは無視する。設置不要） |
| OGP | 全7項目必須（title, desc, type, url, image, site_name, locale） |
| Twitter Card | summary_large_image + title + desc + image |

### 4.2 構造化データ（JSON-LD）必須5種

> **Google Search Central**: 構造化データはリッチリザルト（FAQ、パンくず、ビジネス情報等）の表示に必要。
> Google Rich Results Testでエラーゼロを確認すること。
> `data-nosnippet` 属性でスニペットから除外したいテキストを制御可能。

#### 1. ProfessionalService + LocalBusiness（**@type 配列必須**・必須プロパティ）（v3.4 改訂）

##### 1.0 `@type` 配列形式の必須化（v3.4 新設・Schema.org Multiple Types 準拠）

業種特化（ProfessionalService）と地域ビジネス（LocalBusiness）両側面の検出を成立させるため、`@type` は **配列形式**で両型を宣言すること:

```json
"@type": ["ProfessionalService", "LocalBusiness"]
```

→ scanner Sクラス必須条件 2「高度な JSON-LD 構造化データ」（§8.5）の達成要件。`@type: "ProfessionalService"` の単一型宣言は v3.4 で**非推奨**。

**実装注意**:
- `tcharton/spec-checker.js` の `jsonldTypes()` および `s['@type'] === 'X'` 比較は **配列対応必須**（`@type` が array でも string でも判定できる実装）。詳細は ② への正式指示書 `INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` 参照
- `scanner/scanner.py` の業種判定でも同様（④ への scanner 拡張依頼 `SCANNER-EXTENSION-REQUEST.md` 参照）
- 一次ソース: [Schema.org: Multiple types](https://schema.org/docs/datamodel.html#typeCategory)（取得日 2026-04-27、§0.0.9 verbatim 準拠）

##### 1.1 必須プロパティ（v3.4 改訂・additionalType + sameAs を強化）

```
name, alternateName, description, url, telephone, email,
additionalType[],                    ← v3.4 新規必須化（業種明示）
address (PostalAddress), geo (GeoCoordinates),
logo, image, founder (Person),
foundingDate, slogan, knowsAbout[], areaServed[],
hasOfferCatalog (OfferCatalog + Offer[]),
serviceType[], priceRange,
sameAs[],                            ← v3.4 で値域規定強化（GBP URL 必須）
openingHoursSpecification
```

##### 1.2 `additionalType` の値域（v3.4 新設・Wikidata URI 規範化）

業種に応じて以下から該当する Wikidata Q 番号 URI を **配列で 1 件以上**列挙すること（scanner Sクラス必須条件 2 の業種判定向上のため必須）:

| 業種カテゴリ | Wikidata URI |
|---|---|
| Web デザイン / Web 制作 | `https://www.wikidata.org/wiki/Q189210` |
| Information Technology | `https://www.wikidata.org/wiki/Q11661` |
| Artificial Intelligence | `https://www.wikidata.org/wiki/Q11660` |
| Consulting | `https://www.wikidata.org/wiki/Q193563` |
| Software Engineering | `https://www.wikidata.org/wiki/Q638608` |
| Machine Learning | `https://www.wikidata.org/wiki/Q2539` |
| 会計士・税理士 | `https://www.wikidata.org/wiki/Q41189` |
| 弁護士 | `https://www.wikidata.org/wiki/Q40348` |
| 不動産仲介業 | `https://www.wikidata.org/wiki/Q1473298` |
| 飲食店 | `https://www.wikidata.org/wiki/Q11707` |
| 美容院 | `https://www.wikidata.org/wiki/Q1257670` |
| その他 | scanner ④ `INDUSTRY_KEYWORD_MAP` と同期（リスト追加要請は ① エスカレーション）|

**JSON-LD 例**:
```json
"additionalType": [
  "https://www.wikidata.org/wiki/Q189210",
  "https://www.wikidata.org/wiki/Q11661",
  "https://www.wikidata.org/wiki/Q11660"
]
```

**運用**: 業種が複数該当する場合は配列で複数列挙可。空配列は SPEC 違反（spec-checker FAIL）。

##### 1.3 `sameAs` の値域（v3.4 新設・GBP URL 必須）

LocalBusiness 型は **Google ビジネスプロフィール（GBP）URL を `sameAs` 配列に必ず 1 件以上含めること**（scanner Sクラス必須条件 2「NAP 完全一致」達成のため必須）:

**JSON-LD 例**:
```json
"sameAs": [
  "https://www.google.com/maps/place/?cid={GBP-CID-HERE}",
  "https://maps.google.com/?cid={GBP-CID-HERE}",
  "https://note.com/...",
  "https://twitter.com/..."
]
```

**判定基準**（spec-checker / scanner で実装）:
- `sameAs` 配列に `google.com/maps` または `maps.google.com` を含む URL が 1 件以上存在すれば PASS
- GBP 未作成の場合は SPEC 違反（spec-checker FAIL）→ ★ 取得不可

**GBP 作成手順**（運用ガイド）:
1. <https://business.google.com> でアカウント作成
2. **Service Area Business** モード推奨（住所非公開可）
3. NAP（社名 / 住所 / 電話）を tcharton.com の JSON-LD と完全一致させる
4. 検証完了後、CID URL を取得して `sameAs` に追記

**例外**: 個人事業主のプライバシー要件で住所非公開が必要な場合、GBP の Service Area Business モードで対応可能。GBP 自体は必須（v3.5+ で `email + contactPoint` 代替の検討対象）。

#### 2. WebSite（SearchAction含む）
```
name, alternateName, url, inLanguage,
potentialAction (SearchAction)
```

#### 3. FAQPage
```
mainEntity[] (Question + acceptedAnswer)
最低5問。ユーザーの検索意図（インテント）に直接答える実用的なQ&A
```

#### 4. BreadcrumbList
```
itemListElement[] (ListItem + position + name + item)
サイト内の階層構造を正確にクローラーへ伝える
```

#### 5. Person / Organization（E-E-A-T強化用）
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "代表者名",
  "jobTitle": "役職",
  "worksFor": {
    "@type": "Organization",
    "name": "HARTON"
  },
  "url": "https://{ドメイン}/profile/"
}
```
※ `profile/index.html` にて、代表者・監修者の実績や専門性を言語化して記述すること。一次情報（実体験に基づく一次データ）を必ず含める。

### 4.3 E-E-A-T コンテンツ要件（品質評価枠組み）

> **注意**: E-E-A-Tはランキング要因ではない。Googleの品質評価ガイドラインにおける評価枠組みであり、高品質コンテンツを制作するための指針として活用する。

| 要素 | 要件 |
|------|------|
| Experience（経験） | 実体験に基づく一次情報（自社独自の事例・データ）を含める |
| Expertise（専門性） | profile/index.htmlに代表者の専門分野・資格・実績を明記 |
| Authoritativeness（権威性） | 構造化データ（Person JSON-LD）で著者情報を機械可読に |
| Trustworthiness（信頼性） | プライバシーポリシー、連絡先、所在地を明示 |

### 4.4 公開日・更新日（鮮度シグナル）

```html
<time itemprop="datePublished" datetime="2026-04-10">2026年4月10日</time>
<time itemprop="dateModified" datetime="2026-04-12">（更新: 2026年4月12日）</time>
```
- `<article>` 内に `<time>` タグで公開日と最終更新日を機械可読に明示
- Google検索結果の日付表示にも影響

### 4.5 コンテンツ鮮度管理（Google推奨）

- 古くなったコンテンツは更新または削除する
- `<time>` タグの `dateModified` を更新時に反映
- 404化した旧ページは適切にリダイレクトまたは削除

### 4.6 sitemap.xml

- 全ページ収録
- `<lastmod>` を最新日付に維持
- `robots.txt` からSitemap参照

### 4.7 robots.txt

```
User-agent: *
Allow: /
Disallow: /ogp.html

Sitemap: https://{ドメイン}/sitemap.xml
```

### 4.8 カスタム404ページ

- `404.html` を必ず作成
- トップページへの導線（ナビゲーション）を含める
- サイト内回遊を促す関連リンクを配置
- 同一デザインテーマを維持

### 4.9 301リダイレクト準備

- 独自ドメイン移行を見据えた301リダイレクト設定の準備を完了させること
- Cloudflare Pages: `_redirects` ファイルまたはPages Functions で対応

### 4.10 Google Search Console（推奨）

- サイト公開後、Google Search Consoleに登録し所有権を確認する
- インデックス状況、クロールエラー、Core Web Vitalsを定期的に監視
- サイトマップをSearch Consoleから送信する

### 4.11 UGC（ユーザー生成コンテンツ）リンク対策

- コメント欄やフォーラム等、ユーザーが投稿するリンクには `rel="nofollow ugc"` を付与
- スパムリンクによるSEO悪影響を防止する

### 4.12 JavaScript レンダリング要件（Google推奨）

- JavaScriptで動的に生成されるコンテンツは、Googlebot（レンダリング後）でもユーザーと同一の内容が表示されること
- クリティカルな情報（タイトル、本文、ナビゲーション）はHTMLに直接記述し、JS依存にしない
- `noscript` でフォールバックを提供

### 4.13 Lead Evidence Block（GEO/LLMO 必須 / S-RANK 基準）

**根拠**: Aggarwal et al. "Generative Engine Optimization" (arXiv:2311.09735, KDD 2024, Cornell/Princeton) の G-6「Position-Adjusted」施策。**記事の導入部（最初の `<h2>` より前）に数値・公的ソース・引用句を配置することで Perplexity/SGE/BingChat での引用率が +15.9% 向上**する実測値を根拠とする。

#### 4.13.1 必須要件（セマンティック配置）

ブログ記事・ドキュメントコンテンツの**導入部（`<main>` 内で最初の `<h2>` より前）**に、以下のいずれか**最低1つ**を必ず配置する:

1. **`<blockquote cite="URL">`** — 公的ソース（論文/公式ドキュメント/規格書）からの引用句
2. **`<figure>` + 統計数値** — 具体的な数値（割合/金額/倍率/実測値）を伴う根拠ブロック
3. **公的リンク** — `.go.jp` / `.gov` / `.edu` / 学術 DOI / 公式ドキュメント / schema.org / w3.org への `<a>`

**セマンティック根拠**: HTML Living Standard §4.3.10 で `<h2>` はセクションの開始を示す。`<h2>` 以降に出現する `<blockquote>` は「セクション内引用」でありLead Evidenceではない。`<h2>` 以前に出現するコンテンツのみが記事導入部として扱われる。

#### 4.13.2 推奨構造（冒頭テンプレート）

```html
<article>
  <header>
    <h1>記事タイトル</h1>
    <p>導入段落（記事が何を扱うか・読者メリット）</p>
  </header>

  <div class="prose">
    <!-- ★ Lead Evidence Block（4.13 必須 / 最初の <h2> より前に配置） -->
    <!--
      ※ 下記は構造例。blockquote 内の文字列は cite URL に literally 存在するテキストに限る（§0.2 F-1）。
         プレースホルダ URL（ドットドット）禁止。サイト構築時は必ず実在する一次ソースへ差し替えること。
    -->
    <figure class="evidence-block bg-sky-500/10 border-l-4 border-sky-400 pl-4 pr-4 py-4 my-6 rounded-r-lg">
      <blockquote cite="https://platform.claude.com/docs/en/about-claude/pricing">
        <p class="text-dark-200">「A cache hit costs 10% of the standard input price, which means caching pays off after just one cache read for the 5-minute duration (1.25x write), or after two cache reads for the 1-hour duration (2x write).」</p>
      </blockquote>
      <figcaption class="mt-2 text-sm text-dark-400">— <cite><a href="https://platform.claude.com/docs/en/about-claude/pricing" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline">Anthropic 公式 Pricing「Prompt caching」（取得日を明記）</a></cite>（キャッシュヒットは標準入力価格の 10%、5 分キャッシュなら 1 回、1 時間キャッシュなら 2 回の読取で元が取れる）</figcaption>
    </figure>

    <!-- 本論（最初の <h2> 以降） -->
    <h2>なぜ...</h2>
    ...
  </div>
</article>
```

#### 4.13.3 品質基準

| 項目 | 基準 |
|------|------|
| 配置位置 | `<main>` 内で**最初の `<h2>` より前**（セマンティック導入部） |
| 引用長さ | `<blockquote>` は**15〜80語**以内（長過ぎは displacive summary 化の懸念） |
| 出典明記 | `cite=` 属性 + 可視テキストでの `<a>` 両方で出典URL明記 |
| リンク属性 | `target="_blank" rel="noopener noreferrer"`（外部参照・セキュリティ） |
| 数値具体性 | 「多い」「高い」等の曖昧語ではなく、具体数値（例: 90%, +15.9%, $15/M） |

#### 4.13.4 spec-checker 検証（セマンティック判定）

`G-6 位置最適化 (Lead Evidence — 最初のh2以前)` チェックが検証。

**判定ロジック**:
1. `<main>` 要素内の文字列を取得（`<main>` なしの場合は `<body>` にフォールバック）
2. 最初の `<h2>` のインデックスを検索
3. 先頭から「最初の `<h2>`」までの領域を `leadRegion` とする
4. `<h2>` 無しページは `<main>` 先頭 40%（`<main>` なしは body 先頭 30%）を `leadRegion` とする
5. `leadRegion` 内に以下のいずれかが検出されれば PASS:
   - `<blockquote>` タグ / `<q cite="...">` タグ
   - 公的ドメインへのリンク: `.go.jp` / `.gov` / `.edu` / `.ac.jp` / `arxiv.org` / `doi.org` / `anthropic.com` / `developers.google.com` / `schema.org` / `w3.org` / `wcag` / `cloudflare.com` / `github.com` / `web.dev` / `meti.go.jp` / `ppc.go.jp`
   - 具体的な数値表現（%, ¥, $, 倍, KB/MB/GB 等）

---

## 5. LLMO（LLM最適化）仕様

### 5.1 セマンティックHTML要件

| 要素 | 要件 |
|------|------|
| `<section>` | 全セクションに `aria-label` 付与。LLMがブロック意味を理解可能にする |
| `<nav>` | 全ナビゲーションに `aria-label`。最低4つ（メイン、モバイル、パンくず、フッター） |
| `<article>` | 独立コンテンツ単位に使用。`<time>` で日付情報を付与 |
| `<table>` | `<caption>` + `<th scope="row">` でLLMがテーブル構造を正確に読み取れるようにする |
| `<strong>` | 意味的に重要なテキストに使用 |
| `<header>`, `<main>`, `<footer>` | ランドマーク必須 |

### 5.2 LLMクローラー対応

- `max-snippet:-1`: スニペット長制限なし（LLMに全テキスト提供）
- JSなしで全情報取得可能であること
- JSON-LD構造化データ（5種+）で事業情報を機械可読に
- `lang="ja"` で言語識別を明確に

### 5.3 AI検索エンジン引用最適化

AI検索エンジン（Perplexity, ChatGPT Search, Gemini等）が回答生成時にサイトを情報源として引用しやすくする。

| 項目 | 要件 |
|------|------|
| トピック文 | 各ページのメインコンテンツ最初の`<p>`は、ページの主題を端的に述べる完結文とする |
| FAQ回答 | 各回答は自己完結文とする。「上記参照」「詳しくはこちら」等の相対参照を禁止 |
| サービス説明 | 「〇〇は△△を提供する□□サービスです」のような定義文から開始する |
| メタディスクリプション | 検索意図に対する直接回答となる完結文（70-160文字） |

### 5.4 Speakable構造化データ

音声アシスタント・AI検索エンジンが最重要テキストを特定するための `speakable` プロパティを `WebSite` JSON-LDに追加する。

```json
{
  "@type": "WebSite",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".hero-content", ".business-description", ".faq-section"]
  }
}
```

### 5.5 AIクローラー明示許可（robots.txt）

```
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Amazonbot
Allow: /
```

- `<meta name="robots" content="max-image-preview:large">` をトップページに追加
- AI向けに全コンテンツをクロール許可し、情報源としての引用機会を最大化する

### 5.6 コンテンツ構造のAI解析最適化

| パターン | 用途 | 要件 |
|---------|------|------|
| `<dl>/<dt>/<dd>` | サービス特徴・料金等のキーバリュー情報 | AIが構造的に情報を抽出可能にする |
| `data-nosnippet` | ナビゲーション・フッターの定型テキスト | AIクローラーが本文コンテンツに集中するための除外指定 |
| `<time datetime>` | 日付・営業時間 | 機械可読な日時情報を提供 |

### 5.7 HowToスキーマ（オプション）

サービスページにプロセス・フロー情報がある場合、`HowTo` JSON-LDを追加する。AI検索の「〇〇のやり方」クエリに直接回答される可能性を高める。

```json
{
  "@type": "HowTo",
  "name": "〇〇の流れ",
  "step": [
    { "@type": "HowToStep", "name": "ステップ1", "text": "..." }
  ]
}
```

---

## 6. パフォーマンス仕様（Core Web Vitals）

### 6.1 Core Web Vitals基準

| 指標 | 基準 | 不合格ライン | 対策 |
|------|------|-------------|------|
| LCP | < 2.5s | > 4.0s | ヒーロー画像への `fetchpriority="high"` 付与。画像のWebP化 |
| CLS | < 0.1 | > 0.25 | 全 `<img>` に `width` と `height` を明記しレイアウトシフトを防ぐ |
| INP | < 200ms | > 500ms | JSのメインスレッド占有を防ぐ。サードパーティスクリプトは遅延実行 |

### 6.2 CSS配信

- **ビルド済みCSSのみ使用**（Tailwind CDN禁止）
- minified出力
- 目標サイズ: 40KB以下

### 6.3 画像

| 項目 | 基準 |
|------|------|
| フォーマット | WebP優先。`<picture>` + `<source type="image/webp">` + `<img>` PNGフォールバック |
| 属性 | `width`, `height` 必須。ファーストビュー以外は `loading="lazy"`, `decoding="async"` |
| LCP対策 | ヒーロー画像には `fetchpriority="high"` を付与（lazy禁止） |
| alt | **「かなり重要」（Google公式）** 日本語で具体的・簡潔な説明。画像の内容と文脈での役割を記述。キーワード詰め込み禁止。装飾画像は空（`alt=""`） |

### 6.4 フォント

- `<link rel="preconnect">` 必須
- `<link rel="preload" as="style">` でフォントCSSをプリロード
- preload URLとstylesheet URLは完全一致させること（ミスマッチ禁止）
- `font-display: swap` で表示ブロック防止

### 6.5 外部リソースとJS実行（INP対策）

- Google Analytics等のサードパーティスクリプトは `defer`/`async` または `requestIdleCallback` 等を用いて**遅延読み込みを義務化**
- 全外部リクエストを把握し、CSPに反映
- 不要な外部リソース読み込み禁止
- JSのメインスレッド占有時間を最小化

---

## 7. アクセシビリティ仕様

### 7.1 WCAG 2.2準拠項目

| 項目 | 基準 |
|------|------|
| タッチターゲット | 全インタラクティブ要素 44px以上（WCAG Level AAA）。インラインリンクは例外 |
| フォーカスリング | `focus:ring-2 focus:ring-{color}` 不透明。`focus:ring-*/30` など半透明禁止 |
| コントラスト | 本文 4.5:1以上、大文字 3:1以上、UI要素 3:1以上 |
| スキップリンク | `<a href="#main" class="sr-only focus:not-sr-only">` 必須 |
| ARIAラベル | 全section、全nav、ハンバーガーボタン（aria-label, aria-expanded, aria-controls） |

### 7.2 フォーム

- 全inputに対応する`<label>`
- `focus:ring` 不透明（`/30`等の半透明禁止）
- `focus:outline-none` は `focus:ring` と併用時のみ許可

### 7.3 モーション

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-in {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### 7.4 noscriptフォールバック

```html
<noscript>
  <style>.fade-in { opacity: 1 !important; transform: none !important; }</style>
</noscript>
```

---

## 8. セキュリティ仕様

### 8.1 CSP（Content Security Policy）（v3.3 改訂・scanner.py 整合）

#### 8.1.1 必須コアディレクティブ（6 個・**scanner.py 必須欠落チェック対象**）

これら 6 個は **scanner.py `check_security_headers()` が CSP 内で欠落をチェック**する。1 個でも欠落すると `check_security_headers()` の missing 配列に記録され、セキュリティヘッダースコアを減点する（行 298-302）:

```
default-src    'self';   ← 全ディレクティブのフォールバック
script-src     ...;      ← JS の取得元（'unsafe-inline' 禁止、§8.1.4 参照）
style-src      ...;      ← CSS の取得元
object-src     'none';   ← <object>/<embed> の取得元（'none' 推奨）
base-uri       'self';   ← <base> タグの URI 制限
form-action    'self';   ← フォーム送信先
```

#### 8.1.2 推奨拡張ディレクティブ（4 個・サイト構成に応じて必須化）

サイトが該当リソースを使用する場合は本節を**追加で必須**とする。tcharton.com 標準テンプレ:

```
font-src       'self' https://fonts.gstatic.com;          ← Google Fonts 使用時必須
img-src        'self' data: {許可オリジン};                  ← 画像最適化サービス使用時要列挙
connect-src    'self' {許可オリジン};                        ← fetch/XHR/WebSocket 先列挙
frame-src      'none';                                     ← iframe 不使用時 'none'、使用時は許可オリジン列挙
```

#### 8.1.3 GOOGLE-STANDARDS §11.3 連動 拡張ディレクティブ（DOM XSS 根絶 / HTTPS 強制）

```
require-trusted-types-for 'script';   ← W3C Trusted Types（DOM XSS 根絶）
trusted-types default;                ← Trusted Types ポリシー名
frame-ancestors 'none';               ← X-Frame-Options 後継（'self' / 'none'）
upgrade-insecure-requests;            ← 残存 HTTP リクエストの HTTPS 自動昇格
```

#### 8.1.4 `'unsafe-inline'` の許容範囲（v3.3 明確化・§0.0.9 narrow-scope claim 防止）

| ディレクティブ | `'unsafe-inline'` 許容 | 理由 |
|---|---|---|
| `script-src` | 🔴 **禁止** | DOM XSS の主要侵入経路。`require-trusted-types-for 'script'` と併用不可。**nonce / hash の使用必須**（`'nonce-{ランダム値}'` / `'sha256-{ハッシュ}'`） |
| `style-src` | 🟡 **限定許容**（既存サイト互換のため）| 既存サイトの inline `<style>` 移行コスト配慮。**新規サイトは nonce 化推奨**、`require-trusted-types-for` は `'script'` 限定で `'style'` 非対応 |
| `style-src-attr` | 🟡 **限定許容** | inline style 属性（`style="..."`）対応。同上 |

**重要**: v3.2 までの「`script-src 'self' 'unsafe-inline'`」記述は v3.3 で**修正**。tcharton.com 標準テンプレも v3.3 で `script-src` から `'unsafe-inline'` を除外し、必要箇所には nonce / hash を実装する（② tcharton セッションで対応、CRITICAL-ISSUES-REPORT v1.1.3 連動）。

#### 8.1.5 tcharton.com 標準 CSP テンプレ（v3.3 推奨形）

```
default-src 'self';
script-src 'self' 'sha256-{各 inline スクリプトのハッシュ}';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
require-trusted-types-for 'script';
upgrade-insecure-requests;
```

→ ② tcharton で `_headers` ファイル経由配信（CRITICAL-ISSUES-REPORT v1.1.3 §11.1 / GOOGLE-STANDARDS §12.1 連動・SPEC §1.0 原則 4 必須化）。

### 8.2 リンク

- `target="_blank"` には必ず `rel="noopener noreferrer"`
- 外部リンクは最小限に

### 8.3 OWASP Top 10:2025 準拠（v3.1.1 訂正・公式 verbatim）

本仕様で生成される全サイトは OWASP Top 10:2025 のリスクカテゴリに対する防御を組込む。一次ソース: <https://owasp.org/Top10/2025/>（公式 verbatim 取得日 2026-04-25）

**OWASP Top 10:2025 公式カテゴリ（A01〜A10）と本仕様の対応条項:**

| Code | 公式カテゴリ名（verbatim） | 本仕様の対応条項 |
|---|---|---|
| A01:2025 | Broken Access Control | §8.1 CSP / §11.6 セキュリティチェックリスト |
| A02:2025 | Security Misconfiguration | §3.1 CSP 必須 / §11.6 配信ヘッダー / GOOGLE-STANDARDS §11 |
| A03:2025 | Software Supply Chain Failures | §12.6 npm audit / §12.8 PR ルール / §12.11 リリース基準（依存脆弱性ゲート） |
| A04:2025 | Cryptographic Failures | §6.2 HTTPS 強制 / GOOGLE-STANDARDS §11.1 HSTS |
| A05:2025 | Injection | §12.6 入力検証・出力エスケープ / Trusted Types（GOOGLE-STANDARDS §11.3） |
| A06:2025 | Insecure Design | §0.3 美しいコーディング原則 / §12.3 純関数優先 |
| A07:2025 | Authentication Failures | §12.5 BYO-Key + AES-256（該当機能で） |
| A08:2025 | Software or Data Integrity Failures | §12.4 テスト / §12.8 PR ルール（CI で署名・integrity 検証） |
| A09:2025 | Security Logging and Alerting Failures | §12.3.4 構造化ログ + アラート設計 |
| A10:2025 | Mishandling of Exceptional Conditions | §12.3.3 エラー処理（握りつぶし禁止・例外を再 throw またはタグ付きリターン） |

**2021 → 2025 の主な変動（参考）:**

- A03 が「Software Supply Chain Failures」として新規（旧 A06「Vulnerable & Outdated Components」を包含・拡張）
- A10 が「Mishandling of Exceptional Conditions」として新規（旧 A10 SSRF は categorization 変更）
- 順序の入れ替え（A02 が Security Misconfiguration へ昇格）

**新規/改訂サイト納品時:**

1. 上表 10 分類を案件ごとに個別レビュー
2. 該当しない分類は「N/A 理由」を明記
3. 特に新規追加の A03（Supply Chain）と A10（Exception Handling）の自動検証を CI に組込む

### 8.4 IPA「安全なウェブサイトの作り方」改訂第7版 準拠（v3.1 新設）

日本国内向けサイト（特に行政・医療・士業・教育のクライアント）では、IPA「安全なウェブサイトの作り方」改訂第7版（2021-03-31 公開）を併用する。一次ソース: <https://www.ipa.go.jp/security/vuln/websecurity/about.html>

**11 脆弱性カテゴリへの対応:**

| # | カテゴリ | 対応 |
|---|---|---|
| 1 | SQL インジェクション | site-builder のテンプレ生成（§12.6 出力エスケープ）。静的サイトでは N/A |
| 2 | OS コマンド・インジェクション | Node.js 子プロセス実行禁止（§12.3）。動的実行ロジックは要レビュー |
| 3 | パス名パラメータの未チェック / ディレクトリ・トラバーサル | 静的サイトでは N/A、site-builder ファイル操作で要対応 |
| 4 | セッション管理の不備 | （認証あり機能で対応）。HARTON サイトは静的のため N/A |
| 5 | クロスサイト・スクリプティング (XSS) | CSP §3.1 / Trusted Types（GOOGLE-STANDARDS §11.3）で防御 |
| 6 | CSRF（クロスサイト・リクエスト・フォージェリ） | フォーム submit 時 SameSite cookie / CSRF token 必須 |
| 7 | HTTP ヘッダ・インジェクション | Cloudflare Pages の `_headers` 利用時、改行混入を排除 |
| 8 | メールヘッダ・インジェクション | フォーム→メール変換時の入力サニタイズ必須 |
| 9 | クリックジャッキング | `frame-ancestors 'self'` で防御（GOOGLE-STANDARDS §11.3） |
| 10 | バッファオーバーフロー | Node.js / 静的サイトでは原則 N/A |
| 11 | アクセス制御や認可制御の欠落 | 静的サイトでは原則 N/A、site-builder 認証機能で対応 |

**併設「ウェブ健康診断仕様」13 項目:** spec-checker への組込み候補として将来検討（v4.x で対応予定）。

### 8.5 HARTON Certified S クラス必須 5 条件（v3.3 新設・scanner.py 正本連動）

本節は **scanner.py が判定する「HARTON Certified S クラス」の必須 5 条件**を SPEC 本体に正本化する。一次ソース: `scanner/スキャンプロンプト.txt` §1-5（2026-04-26 verbatim 取得、§0.0.9 準拠）。

**位置付け**: §1.0.1「S クラス用語の二層構造」で定義された **scanner.py 判定側の S クラス基準**。spec-checker の S-RANK（§11）とは別概念。両者ともに達成することが tcharton.com の最終目標（§0.0.7 連動）。

#### 8.5.1 必須 5 条件

| # | 条件 | 技術要件 | scanner.py 実装関数 | 出典 |
|---|---|---|---|---|
| 1 | **HSTS プリロード + エッジ WAF** | `Strict-Transport-Security: max-age≥31536000; includeSubDomains; preload` 配信 + Cloudflare 等のエッジ WAF 稼働 | `check_security_headers()` + `check_waf_cdn()` | スキャンプロンプト.txt §1 |
| 2 | **高度な JSON-LD 構造化データ + NAP 完全一致** | `Organization`/`LocalBusiness`/`Service` 等の業種別必須スキーマ + Google マップとの NAP（名前・住所・電話）完全一致 | `check_jsonld()` + `check_nap_consistency()` | スキャンプロンプト.txt §2 |
| 3 | **Core Web Vitals 合格 + TTFB ≤ 200ms** | LCP < 2.5s / CLS < 0.1 / INP < 200ms（Playwright 実測）+ TTFB ≤ 200ms（実用緩和: `<` 1000ms で `passed`、`<` 2000ms で保留） | `check_cwv()` + Playwright 実測 | スキャンプロンプト.txt §3 |
| 4 | **非侵入型認証によるフォーム防衛** | Cloudflare Turnstile / reCAPTCHA v3 等の「裏側で自動検証」型ボット対策。古い画像 CAPTCHA は不可。フォームなしのサイトは判定対象外（保留扱い） | `check_bot_protection()` | スキャンプロンプト.txt §4 |
| 5 | **動的 CMS 依存からの脱却（SSG / Jamstack）** | 静的ファイル配信構造（Cloudflare Pages / Vercel / Netlify / GitHub Pages 等）。WordPress 等の動的 CMS は不可 | `check_ssg_hint()` | スキャンプロンプト.txt §5 |

#### 8.5.2 評価ロジック（scanner.py `check_sclass_requirements()` 連動）

- **判定可能数 = 5 - 保留件数**（保留はカウントから除外、最低 1）
- **★★★（HARTON S-Class）取得条件**: 総合 90 点以上 + 判定可能な必須条件すべて達成 + 致命的 NG ゼロ（§8.6）
- **★★（HARTON 優良）**: 総合 80 点以上 + 致命的 NG ゼロ + 必須条件 4 件以上達成（v3.4.1 厳格化 / v1.1.15 §22 / 2026-04-30 ① 確定 §0.0.10 厳格化原則準拠）
- **★（HARTON Certified）**: 総合 70 点以上 + 致命的 NG ゼロ
- **非掲載**: 総合 70 点未満 OR 致命的 NG ≥ 1
- **保留扱い**: フォームなしサイトで条件 4、CWV 測定失敗時の条件 3 等（判定可能数 = 5 - 保留件数で再計算、最低 1）
- **scanner.py 実装**: `calculate_rating()` 7-tuple 戻り値（公開表記 `★★★/★★/★/""` + 内部識別子 `S/A/B/NONE` retro-compat）
- **改訂原則（§0.0.10 / v1.1.15 §22 確定）**: 判定基準（閾値・必須条件数・致命的 NG）の **緩和方向変更は禁止**、厳格化方向のみ可。緩和提案は ① エスカレーション必須

#### 8.5.3 ② tcharton への適用

② tcharton は本サイトを scanner で判定し、上記 5 条件を全達成して S クラス取得を目標とする。④ scanner の判定結果を ① に報告し、未達条件があれば ① の判断で改修計画を立てる（§0.0.7 報告義務）。

#### 8.5.4 改訂手続

S クラス必須条件の追加・変更は ① 専権事項。④ scanner からの提案は CRITICAL-ISSUES-REPORT 経由で ① にエスカレーション、① 承認後に本節と scanner.py の同時更新を実施する。

### 8.6 致命的 NG（一発除外条件）（v3.3 新設・scanner.py 正本連動）

**位置付け**: ★区分（★ / ★★ / ★★★）問わず**一発除外**となる条件群。掲載自体を不可とする「機関の信頼性根幹」を守る最低条件。

**一次ソース**: `certification/MASTER-PLAN.md` §3.4（2026-04-26 ① 確定）+ `scanner/scanner.py` `check_critical_ng()`（行 2130-2194、Phase 9d 実装済）。

#### 8.6.1 致命的 NG 4 項目

| # | 致命的 NG | 検出条件 | scanner.py 実装 | 出典 |
|---|---|---|---|---|
| 1 | **HTTPS 非対応** | サイトが HTTPS で配信されていない（http スキーム継続使用）| `check_https()` + `check_critical_ng()` | スキャンプロンプト.txt §A 行 9 |
| 2 | **SSL 証明書エラー** | 証明書期限切れ・無効・自己署名で警告 | `check_ssl()` + `check_critical_ng()` | スキャンプロンプト.txt §1 行 47 |
| 3 | **WP 管理面露出** | `/wp-login.php` / `/readme.html` / `/xmlrpc.php` の HTTP 200 応答 | `check_wp_vulnerability()` + `check_critical_ng()` | スキャンプロンプト.txt §B 行 14 |
| 4 | **CMS バージョン情報露出** | `<meta name="generator" content="WordPress X.Y">` 等によりバージョン特定可能 / WordPress / Drupal / Joomla / Movable Type すべて対象 | `check_old_technology()` + `check_critical_ng()` | スキャンプロンプト.txt §B 行 14 |

#### 8.6.2 動作仕様

- 致命的 NG 1 件以上検出 → `calculate_rating()` が**強制非掲載**（公開表記 `""` / 内部識別子 `NONE` / 詳細「非掲載（致命的NG により）」）を返す（scanner.py Phase 9d / v1.1.6 ★3 段階化反映）
- ★区分問わず一発除外。総合スコアは「参考値」として記録
- ネットワーク到達不能（タイムアウト/接続不可/URL 解析失敗）は致命的 NG から除外（一時的不通は別概念）
- `BUSINESS_RISK_MAP` で経営リスク翻訳を提供（顧客情報漏洩リスク / マルウェア配布経路等）

#### 8.6.3 ★区分との関係

- 致命的 NG は ★区分問わず**一発除外**（★ / ★★ / ★★★ すべて該当、HARTON Certified 掲載対象外）
- §8.5 条件 5「SSG / Jamstack」は **★★★ 必須条件**であり、致命的 NG とは別概念
- ★ / ★★ では CMS（WordPress 等）利用は**許容**、ただし**バージョン情報露出は禁止**（致命的 NG #4）
- WordPress を使用していても、適切に運用（バージョン情報非公開・最新パッチ適用・ログイン経路の隠蔽等）されていれば ★ / ★★ 取得可能

#### 8.6.4 改訂手続

致命的 NG の追加・変更・除外は ① 専権事項（年次レビュー §3.5 / certification/MASTER-PLAN §3.5 対象）。④ scanner の独断改変禁止（§0.0.7 越境違反）。

### 8.7 Cookie 属性規定（v3.3 新設）

**位置付け**: スキャンプロンプト.txt §B 行 17「Cookie の Secure 属性」に対応。scanner.py `check_cookie_security()` で機械検証可能。

#### 8.7.1 必須属性（認証・セッション・分析 Cookie に適用）

| 属性 | 値 | 目的 |
|---|---|---|
| `Secure` | `Secure` フラグ必須 | HTTP で送信されない（中間者攻撃防止）|
| `HttpOnly` | 必須 | JavaScript からアクセス不可（XSS による Cookie 窃取防止）|
| `SameSite` | `Strict` または `Lax`（最低 `Lax`、認証 Cookie は `Strict` 推奨）| CSRF 防止（§8.4 IPA #6 対応）|
| `Path` | 必要最小限のパスに限定 | 不要なスコープ拡大を防ぐ |
| `Domain` | 親ドメインへの自動拡大を避ける | サブドメイン経由の漏洩防止 |

#### 8.7.2 Cookie が無いサイトの扱い

セッション機能・認証機能・分析 Cookie のないサイト（HARTON tcharton.com 等の純粋な静的サイト）は本節の検証対象外（N/A）。GA4 等の第三者 Cookie については各ベンダーの実装に依存し、本仕様の直接適用範囲外。

### 8.8 ボット防御規定（v3.3 新設・§8.5 条件 4 連動）

**位置付け**: スキャンプロンプト.txt §4 / §8.5 条件 4「非侵入型認証によるフォーム防衛」の SPEC 本体への正本化。

#### 8.8.1 必須要件

- フォーム（問合せ / コメント / 会員登録 等）には**非侵入型ボット対策を必須実装**
- 採用可能な技術:
  - **Cloudflare Turnstile**（推奨・無料・プライバシー配慮型）
  - **reCAPTCHA v3**（スコアベース・裏側検証型）
  - **hCaptcha Invisible**（プライバシー配慮型）
- **不可**: 古い画像選択型 CAPTCHA（reCAPTCHA v2 画像チェックボックス含む）→ ユーザー体験劣化、モバイルでのフォーム離脱増、§8.5 条件 4 不適合

#### 8.8.2 適用範囲

- **必須**: 顧客と直接やりとりするフォーム（contact / quote / signup）
- **任意**: 内部ツール・管理画面（IP 制限等で代替可能なら不要）
- **N/A**: フォームを持たないサイト（HARTON tcharton.com の現状は本節の判定対象外、scanner.py で「フォームなし」保留扱い）

#### 8.8.3 経営リスク（不実装時）

- スパム経由でドメインがブラックリスト登録 → 自社メール配信不可
- フォーム DoS 攻撃 → サービス可用性低下
- 詐欺問合せの量産 → 営業リソース浪費

### 8.9 アーキテクチャ要件（SSG / Jamstack）（v3.3 新設・**v3.4 抽象化拡張** / §8.5 条件 5 連動）

**位置付け**: スキャンプロンプト.txt §5 / §8.5 条件 5「動的 CMS 依存からの脱却」の SPEC 本体への正本化。**§1.0 原則 1「静的サイト前提」の技術根拠**。

#### 8.9.1 必須要件（HARTON S-Class ★★★ 条件）

**「静的エッジ配信プラットフォーム」**で配信されていること。Jamstack の本質的定義（**pre-built static + edge serving**）を満たす配信構造を**プラットフォーム実装に依存せず**抽象的に認定する（v3.4 改訂）:

- **配信構造**: 事前生成された静的ファイルを CDN / エッジで配信（リクエスト時の DB 接続なし）
- **採用可能なプラットフォーム**（v3.4 拡張・許可リスト形式）:

| # | プラットフォーム | 検出シグナル（HTTP レスポンスヘッダ）| 備考 |
|---|---|---|---|
| 1 | **Cloudflare Pages** | `cf-ray` AND `cf-pages` 両方 | 旧 v3.3 標準 |
| 2 | **Cloudflare Workers Static Assets** | `Server: cloudflare` AND `cf-ray` AND（origin server 由来ヘッダ不在）AND（`X-Hosting: cloudflare-workers-static-assets` の honest signaling 推奨）| **v3.4 新規追加**（tcharton.com 適用例）|
| 3 | **Vercel** | `X-Vercel-Id` | |
| 4 | **Netlify** | `X-NF-Request-Id` | |
| 5 | **GitHub Pages** | `Server: github.com` | 小規模向け |
| 6 | 自前 SSG + CDN 配信 | サイト側で `X-Hosting:` honest signaling を必須 | |
| 7 | （その他静的配信プラットフォーム）| 同等の検証ロジック・要 ① 承認 + scanner.py 拡張 | 追加申請は CRITICAL-ISSUES-REPORT 経由 |

- **不可**: WordPress / Drupal / Joomla / 動的 PHP 等の DB 接続型 CMS
- **判定不能（保留）**: 上記いずれにも該当しない（origin server 由来ヘッダ存在 / honest signaling なし）

#### 8.9.2 honest signaling（v3.4 新設・X-Hosting ヘッダ）

明示シグナルが必要な配信構成（Cloudflare Workers Static Assets / 自前 SSG 等）では、サイト側で以下の `X-Hosting` ヘッダを `_headers` 経由で配信することを許容・推奨する:

```
X-Hosting: cloudflare-workers-static-assets
X-Hosting: cloudflare-pages
X-Hosting: vercel
X-Hosting: netlify
X-Hosting: github-pages
X-Hosting: custom-static-cdn
```

**運用**:
- `X-Hosting` の値は本表 §8.9.1 の許可リストと一致すること（不正値は scanner で「未認定」扱い）
- scanner.py 側は `X-Hosting` 値が許可リストに含まれれば SSG 認定（行末の検証ロジックは ④ 拡張依頼書 `SCANNER-EXTENSION-REQUEST.md` §1 で実装）
- honest signaling は**虚偽記載禁止**（§0.0.1 narrow-scope claim 一般化リスク）。動的サイトが `X-Hosting: vercel` 等を偽装した場合は scanner の二次検証（`X-Powered-By: PHP` 等の origin シグナル併存検出）で背任扱い

#### 8.9.3 scanner.py の判定（`check_ssg_hint()`）（v3.4 拡張）

以下のいずれかで「SSG 確定」と判定:

| 判定条件 | scanner.py 実装方針 |
|---|---|
| `X-Vercel-Id` ヘッダ存在 | 旧来通り |
| `X-NF-Request-Id` ヘッダ存在（Netlify）| 旧来通り |
| `cf-ray` AND `cf-pages` 両方存在（Cloudflare Pages）| 旧来通り |
| `Server: github.com`（GitHub Pages）| 旧来通り |
| **`Server: cloudflare` AND `cf-ray` AND（origin server 由来ヘッダ不在）**（Cloudflare Workers Static Assets）| **v3.4 新規追加**（origin シグナル: `X-Powered-By` / `X-AspNet-Version` / `X-Origin-*` / `X-Backend` 等）|
| **`X-Hosting:` ヘッダの値が §8.9.1 許可リストに該当**（honest signaling）| **v3.4 新規追加** |

→ いずれにも該当しない場合は判定不能（保留 = 必須条件 5 未達扱い）。

詳細は ④ への正式拡張依頼書 `scanner/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` 参照。

#### 8.9.4 ★ / ★★ での例外

- ★（HARTON Certified）/ ★★（HARTON 優良）では CMS 利用許容（§8.6.3 と整合）
- ただし致命的 NG #4「CMS バージョン情報露出」は禁止
- ★★★（HARTON S-Class）取得には SSG / Jamstack 必須

#### 8.9.5 ② tcharton への適用（v3.4 更新）

② tcharton は §1.0 原則 1 に従い静的サイトとして実装。**現状 Cloudflare Workers Static Assets で配信中**（`.assetsignore` で確定、Phase 1 改修で `_headers` 配信完了済）。

② への要請（v3.4 / `INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` §3 連動）:
- `_headers` に `X-Hosting: cloudflare-workers-static-assets` を追加（honest signaling）
- scanner ④ の §8.9.3 判定ロジック拡張完了後、scanner で再判定 → 必須条件 5 達成確認 → ★★★（HARTON S-Class）取得へ
- Cloudflare Pages への物理移行は**不要**（v3.4 で本構成が認定対象に追加されたため）

---

## 9. カスタムCSS仕様

以下のカスタムCSSをinline `<style>` に含める:

```css
/* スムーススクロール */
html { scroll-behavior: smooth; }

/* フェードインアニメーション */
.fade-in {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ヒーロー背景グリッド */
.hero-grid {
  background-image: radial-gradient(circle at 1px 1px, rgba(14,165,233,0.15) 1px, transparent 0);
  background-size: 40px 40px;
}

/* グロー効果 */
.glow { box-shadow: 0 0 60px rgba(14,165,233,0.15); }

/* カードホバー */
.card-hover { transition: transform 0.3s, box-shadow 0.3s; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

/* ナビゲーションブラー */
.nav-blur { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

/* モバイルメニュー */
.mobile-menu { transform: translateX(100%); transition: transform 0.3s ease; }
.mobile-menu.open { transform: translateX(0); }

/* フローティングアニメーション */
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.float { animation: float 3s ease-in-out infinite; }

/* パルスラインアニメーション */
@keyframes pulse-line { 0%{opacity:0.4} 50%{opacity:1} 100%{opacity:0.4} }
.pulse-line { animation: pulse-line 2s infinite; }

/* グラデーションテキスト */
.gradient-text {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* カテゴリタブ */
.cat-tab { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid transparent; }
.cat-tab:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
.cat-tab.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }

/* sr-only */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

/* prefers-reduced-motion（必須） */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-in { opacity: 1 !important; transform: none !important; }
}
```

---

## 10. デザイン基準

### 10.1 タイポグラフィ

| 用途 | フォント | ウェイト |
|------|--------|---------|
| 本文 | Noto Sans JP | 300, 400, 500, 700, 900 |
| 見出し・アクセント | Inter | 400, 500, 600, 700, 800, 900 |
| フォント数 | **最大2ファミリー** | |

### 10.2 カラーシステム

- プライマリ: skyパレット（案件ごとに変更可能）
- ニュートラル: darkパレット（原則固定）
- セマンティック: red=エラー, emerald=成功, amber=警告
- opacity modifierで奥行き表現（`bg-sky-500/10`等）
- **コントラスト比**: sky-500 + white は大文字基準3:1以上を確保すること

### 10.3 スペーシング

- 8pxベースのスケール
- セクション間: `py-24`（192px）
- カード内: `p-6` or `p-8`
- 関連要素は近く、異なるセクションは遠く

### 10.4 タッチターゲット

- 全ボタン・リンク: 最低44px高
- ナビリンク: `py-3` 以上
- フォーム要素: `py-3` 以上
- チェックボックス/ラジオ: 親labelでラップし44px確保

---

## 10.5 モバイル品質基準（必須）

モバイル端末（< 1024px）での品質を保証するため、以下を必須要件とする。

### 10.5.1 モバイルメニュー

| 項目 | 基準 |
|------|------|
| オーバーレイ方式 | `fixed inset-0 top-{header高さ}` のフルスクリーン不透明オーバーレイ。背景コンテンツの透過禁止 |
| 背景色 | 不透明な背景色必須（`bg-white` / `bg-dark-900` 等）。半透明・backdrop-filterのみの背景は禁止 |
| **DOM 配置（必須）** | **`position: fixed` オーバーレイは `<header>` 等 `backdrop-filter` / `filter` / `transform` / `perspective` / `will-change` を持つ要素の子孫に配置してはならない。containing block が祖先に書き換わり、viewport 基準の全画面展開が失敗する（W3C CSS Containing Block Module Level 3 準拠）。`<body>` 直下または同等のトップレベルに兄弟要素として配置すること** |
| テキスト可読性 | メニュー内リンクのコントラスト比 4.5:1 以上を背景色との組み合わせで保証 |
| スクロールロック | メニュー展開時に `document.body.style.overflow = 'hidden'` でページスクロールを抑止 |
| 閉じる操作 | ハンバーガーボタンのトグルで閉じること。`aria-expanded` を正確に連動 |
| リンククリック時 | メニュー内リンクをクリックした際、メニューが自動的に閉じること |
| Z-index | `z-50` 以上でヘッダー以外の全コンテンツより前面に表示 |
| トランジション | `transform` ベースのアニメーション（`translateX(100%)` → `translateX(0)` 等）。CLS発生禁止 |

#### 10.5.1.1 Containing Block 汚染回避原則（S-RANK 必須）

**CSS仕様（W3C CSS Positioned Layout Module Level 3 / §2.1）により、以下のプロパティを持つ要素は、その子孫の `position: fixed` に対して新しい containing block を生成する:**

- `transform` が `none` 以外
- `perspective` が `none` 以外
- `filter` が `none` 以外
- `backdrop-filter` が `none` 以外
- `will-change` に `transform` / `perspective` / `filter` / `backdrop-filter` が指定されている
- `contain` に `paint` / `layout` / `strict` / `content` が含まれる

**誤った実装（アンチパターン）:**
```html
<header class="fixed nav-blur">  <!-- nav-blur = backdrop-filter -->
  <nav>...</nav>
  <div id="mobile-menu" class="fixed inset-0">...</div>  <!-- ❌ viewport ではなく header を containing block として扱う -->
</header>
```

**正しい実装（S-RANK 必須構造）:**
```html
<header class="fixed nav-blur">
  <nav>...</nav>
</header>
<!-- containing block = viewport として正しく展開される -->
<div id="mobile-menu" class="fixed inset-0">...</div>  <!-- ✅ header の外、body 直下 -->
```

対象: `id="mobile-menu"` / `id="mobileMenu"` / `role="dialog"` を持つ `position: fixed` オーバーレイ全般。モーダル・ドロワー・トーストを含む。

### 10.5.2 モバイルレイアウト

| 項目 | 基準 |
|------|------|
| 横スクロール | 全ページで水平スクロールバーが発生しないこと。`overflow-x: hidden` を安易に使わず、根本原因を修正 |
| テキスト折り返し | 長いURLやコードブロックは `break-words` / `overflow-wrap: break-word` で折り返し |
| フォントサイズ | 本文最小 `text-sm`（14px）以上。`text-xs`（12px）はラベル・キャプションのみ許可 |
| 画像 | `max-w-full` で親コンテナからはみ出さないこと |
| テーブル | モバイルではスタック表示またはスクロールラッパー（`overflow-x-auto`）を使用 |
| 入力フォーム | `text-base`（16px）以上でiOSの自動ズームを防止 |

### 10.5.3 モバイルナビゲーション

| 項目 | 基準 |
|------|------|
| デスクトップナビ非表示 | `lg:hidden` / `hidden lg:flex` でモバイル・デスクトップのナビを排他表示 |
| リンク一致 | モバイルメニューとデスクトップナビの導線（リンク先）は完全一致させること |
| ハンバーガーボタン | `aria-label`（開閉に応じて変更）、`aria-expanded`、`aria-controls` 必須 |
| メニューロール | `role="dialog"` または `role="navigation"` + `aria-label` 必須 |

### 10.5.4 モバイルパフォーマンス

| 項目 | 基準 |
|------|------|
| ヒーロー画像 | モバイルでは適切なサイズの画像を配信（`<picture>` + `<source media="(max-width: 640px)">`） |
| フォント数 | 2ファミリー以内（モバイル回線を考慮） |
| 外部リソース | 遅延読み込みを厳守。First Contentful Paintをブロックしない |

---

## 10.6 Body Theme Variants（Design System 必須）

本仕様は複数のページ用途に対応するため、`<body>` 要素の既定クラスを**2つの公式 Theme Variant** として定義する。ページの用途に応じて必ずいずれか一つを採用し、任意混在や独自改変は禁止。

### 10.6.1 Variant 定義

| Variant | 用途 | 必須 body class | `color-scheme` |
|---------|------|----------------|----------------|
| **marketing** | トップ / LP / サービス紹介 / プロダクト LP（訴求・コンバージョン用途。明色・光の演出） | `bg-white text-dark-700 font-sans antialiased` | `light` |
| **reading** | ブログ記事 / ドキュメント / 長文ユーティリティ / プロファイル（可読性・集中度重視。ダーク OLED フレンドリー） | `bg-dark-900 text-dark-300 font-sans antialiased` | `dark` |

### 10.6.2 ページ種別と Variant 対応

| ページ種別 | Variant | 理由 |
|-----------|---------|------|
| `index.html`（トップ） | marketing | コンバージョン最適化 |
| `services/**/index.html` | marketing | サービス訴求 |
| `site-builder/index.html` など商品 LP | marketing | プロダクト訴求 |
| `blog/**/*.html`（ブログ記事・一覧） | reading | 長文可読性 |
| `privacy/index.html` | reading | 法務長文・集中閲覧 |
| `profile/index.html` | reading | プロフィール長文・集中閲覧 |
| `thanks.html` | reading | 送信後の落ち着いた確認画面 |
| `404.html` | reading | エラー情報の集中提示 |

### 10.6.3 運用ルール

1. **`<meta name="color-scheme">` と body class は必ず対応する Variant と一致**させること（不一致は FAIL）
2. **Variant を変更する場合は SPEC 改版が必須**（v2.4 では上記 2 種のみ許可）
3. **`text-dark-300` / `text-dark-700` 以外のテキスト色を body に直接指定するのは禁止**（コンポーネントレベルでは自由）
4. コントラスト比: WCAG AA 4.5:1 以上を body class と主要テキスト色の組み合わせで担保済み（2 Variant 全て検証済み）
5. reading Variant を採用するページに `bg-white` / `text-dark-700` を body に残置してはならない（旧 default の残骸は FAIL）

### 10.6.4 拡張時の手順

新しいページ種別（例: 管理画面、ポータル）を追加する場合:
1. SPEC 10.6.1 に Variant 定義追加（v2.x 改版）
2. spec-checker の `THEME_VARIANTS` 定義に追加
3. 該当ページに適用

---

## 11. 納品前チェックリスト

### 11.1 パフォーマンス・Core Web Vitals

- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms をクリア
- [ ] Tailwind CDN不使用（ビルドCSS使用）
- [ ] ビルドCSSに全クラス含有（照合検証済み）
- [ ] コンソールエラーゼロ
- [ ] 画像WebP + picture tag + width/height + lazy(非FV) + fetchpriority="high"(FV)
- [ ] サードパーティスクリプト遅延実行（defer/async）

### 11.2 SEO・E-E-A-T

- [ ] title 30-60文字
- [ ] description 70-160文字
- [ ] `<meta name="author">` 設定
- [ ] canonical設定
- [ ] robots `max-snippet:-1`
- [ ] OGP全7項目
- [ ] Twitter Card設定
- [ ] JSON-LD 5種（ProfessionalService, WebSite, FAQPage, BreadcrumbList, Person）
- [ ] JSON-LD がGoogleリッチリザルトテストでエラーなし
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] `<time>` タグで公開日/更新日が機械可読

### 11.3 E-E-A-Tコンテンツ

- [ ] プロフィールページ（profile/index.html）が存在し、専門性が明記されている
- [ ] 一次情報（自社独自の事例、データ等）が含まれている
- [ ] サイト内に孤立ページが存在しない（パンくず、フッターナビで網羅）

### 11.4 LLMO

- [ ] 全sectionにaria-label
- [ ] 全navにaria-label（メイン、モバイル、パンくず、フッター）
- [ ] H1→H2→H3スキップなし
- [ ] tableにcaption + th scope
- [ ] JSON-LD構造化データで事業情報を機械可読に（5種+Speakable）
- [ ] JSなしで全情報取得可能
- [ ] lang="ja"
- [ ] 各ページ最初の`<p>`がトピック文（完結した定義文）
- [ ] FAQ回答が自己完結（相対参照なし）
- [ ] robots.txtにAIクローラー明示許可（GPTBot, PerplexityBot, ClaudeBot等）
- [ ] ナビ・フッター定型テキストに`data-nosnippet`
- [ ] `<meta name="robots" content="max-image-preview:large">`
- [ ] Speakable JSON-LD（hero, business-description, faq-section）
- [ ] サービス特徴に`<dl>/<dt>/<dd>`パターン使用

### 11.5 アクセシビリティ

- [ ] タッチターゲット44px以上
- [ ] フォーカスリング不透明
- [ ] prefers-reduced-motion対応
- [ ] noscriptフォールバック
- [ ] スキップリンク
- [ ] 画像alt日本語
- [ ] フォームlabel対応

### 11.6 セキュリティ

- [ ] CSPメタタグ設定
- [ ] target="_blank"にrel="noopener noreferrer"
- [ ] frame-src 'none'
- [ ] object-src 'none'

### 11.7 モバイル品質

- [ ] モバイルメニューがフルスクリーン不透明オーバーレイで表示される
- [ ] **モバイルメニューが `backdrop-filter` / `filter` / `transform` / `perspective` / `will-change` を持つ祖先の子孫ではない（containing block 汚染回避 / Section 10.5.1.1）**
- [ ] メニュー内テキストが背景色とのコントラスト比4.5:1以上を満たす
- [ ] メニュー展開時にページスクロールがロックされる
- [ ] メニュー内リンクをクリックするとメニューが自動的に閉じる
- [ ] `aria-expanded` がメニュー開閉と正確に連動する
- [ ] 全ページで横スクロールが発生しない
- [ ] 本文フォントサイズが最小14px以上
- [ ] フォーム入力が16px以上（iOSズーム防止）
- [ ] モバイルとデスクトップのナビリンクが一致している
- [ ] ハンバーガーボタンに `aria-label`, `aria-expanded`, `aria-controls` が設定されている

### 11.8 追加要件

- [ ] カスタム404ページが存在し、トップへのナビゲーションがある
- [ ] 独自ドメイン移行用301リダイレクト設定の準備が完了

---

## 12. アプリ開発基準（site-builder / 付随ツール共通・絶対法規）

本章はサイト構築と**同格の絶対法規**として、HARTON が開発・運用する全アプリ（site-builder、spec-checker、sync-spec、verify-all、将来の関連ツール）に適用される。§0（モデル追従・事実性・美しいコーディング）と不可分。

### 12.1 プロジェクト構成基準

```
<repo-root>/
├── app/                          # アプリ本体（Node.js / TypeScript）
│   ├── main.js|ts                # エントリポイント
│   ├── lib/                      # ドメインロジック（純関数優先）
│   ├── ui/                       # UI レイヤ（DOM 操作・イベント）
│   ├── integrations/             # 外部 API クライアント（Anthropic 等）
│   ├── test/                     # 自動テスト（run.js / *.test.js）
│   └── fixtures/                 # テスト入力データ
├── SPEC.md, GOOGLE-STANDARDS.md, GEO-STANDARDS.md   # 3 法規（sync で配布・編集禁止）
├── package.json
├── README.md                     # 概要・起動手順・ライセンス
└── .git/hooks/pre-push           # verify-all.js 呼び出し（S-RANK ゲート）
```

### 12.2 言語・ランタイム

| 項目 | 基準 |
|---|---|
| 言語 | Node.js（LTS 系最新）標準。型付が必要なら TypeScript を導入 |
| モジュール方式 | ES Modules（`type: "module"`）を原則とする。CommonJS は既存互換のためのみ許容 |
| 最小外部依存 | 標準ライブラリ優先。追加する npm パッケージは目的・代替検討・ライセンスを PR 説明に記す |
| ロックファイル | `package-lock.json` or `pnpm-lock.yaml` を必ずコミット |
| Node バージョン | `engines.node` で明示。CI と開発環境で一致させる |

### 12.3 コード品質（§0.3 の具体適用）

1. **単一責任:** 関数は 1 つの動詞で説明できる粒度。
2. **純関数優先:** 副作用（I/O・DOM・グローバル）は thin wrapper に閉じ込める。ドメインロジックは純関数に寄せ、テスト容易性を確保。
3. **エラー処理:** 例外は**ログ付きで再 throw** または **Result 型的なタグ付きリターン**（`{ ok: true, value } / { ok: false, error }`）で表現。握りつぶし禁止。
4. **ログ:** 構造化可能な形式（JSON or key=value）。本番ビルドでは `console.log` の垂れ流し禁止、レベル（debug/info/warn/error）を区別。
5. **コメント:** **why を書き、what は命名で表す。** 正規表現など直感に反するものには「何にマッチする意図か」を一行添える。
6. **Magic number 禁止:** 定数は命名して頂部にまとめる。
7. **不変性優先:** オブジェクトを mutate せず、新しい値を返す。配列は `.map/.filter/.reduce` を活用。
8. **早期 return:** ネストを減らすため。
9. **ファイルサイズ:** 原則 400 行以内。超える場合は分割。

### 12.4 テスト

| 種別 | 要件 |
|---|---|
| 単体テスト | `app/test/*.test.js`（またはランナが拾う配置）。新規ロジック追加時は原則セットで追加 |
| 統合テスト | `app/test/run.js` で E2E に近いシナリオ（設定読込〜生成〜spec-checker 通過）を少なくとも 1 本 |
| 回帰ベースライン | `verify-all.js` が参照する失敗数 baseline を Git で追跡。超過で push ブロック |
| 決定論 | テストは時刻・乱数・ネットワークに依存しない（fixtures を用意しスタブする） |
| フレーム外検証 | Node 標準の `node:assert` / `node:test` を第一選択。追加ランナは必要性を明記のうえ採用 |

### 12.5 外部 API（Anthropic Claude）利用規律

1. **モデル ID 管理:** 既定モデルはアプリ中央の定数（例: `lib/models.js` の `DEFAULT_MODELS` オブジェクト）で一元管理し、§0.1 に従い Anthropic 公式 Models 表で実在が確認できる ID のみを登録する。
2. **BYO-Key:** ユーザー提供の API キーはローカル暗号化（AES-256 相当）で保管し、アプリ運営側サーバーを経由させない。
3. **月額上限案内:** 初回セットアップ UI で Anthropic Console の Spend Limit ($5 など) 設定手順を必ず提示する。
4. **プロンプトキャッシュ:** 3 法規（SPEC + GOOGLE + GEO）は ephemeral cache でシステムプロンプトに埋込み。キャッシュブロックと動的入力ブロックを明確に分離する。
5. **エラー再現性:** API エラー（429 / 500 等）は retry-after を尊重し、リトライ戦略（指数バックオフ等）をコードで明示。
6. **captive 文字列禁止:** Anthropic 公式からの引用をアプリ UI や生成プロンプトに埋める場合、§0.2 F-1（verbatim 原則）を満たすもののみ使用。要約はパラフレーズと明示。

### 12.6 セキュリティ

| 項目 | 基準 |
|---|---|
| シークレット | `.env` / OS のセキュアストレージ。コミット絶対禁止。`.gitignore` で予防 |
| 依存脆弱性 | `npm audit` を CI または pre-push で実行し、critical / high はリリース前に解消 |
| 入力検証 | 外部入力（ファイル・API レスポンス・ユーザー設定）は schema 検証してから使用 |
| 出力エスケープ | HTML 生成時は **必ずエスケープ**（既存テンプレで担保）。ユーザー入力をテンプレに直埋めしない |
| CSP / ヘッダー | アプリが生成するサイトに対して GOOGLE-STANDARDS §11 に準拠した CSP / COOP / COEP / CORP / Trusted Types を付与できる API を備える |

### 12.7 パフォーマンス予算

| 項目 | 予算 |
|---|---|
| spec-checker 実行時間 | 2,500 項目検査で 1 秒未満（S-RANK 運用想定） |
| サイト生成 API 呼び出し | 並列化可能な部分は `Promise.all` で並列。直列で合計 60 秒未満を目安 |
| CLI 起動時間 | 冷間起動で 300 ms 未満 |
| メモリ | 一般的な Node.js ランタイムで 512 MB 未満 |

### 12.8 Git / 開発フロー

1. **ブランチ:** 既定ブランチ `main` 保護。機能追加は feature ブランチから PR。
2. **コミットメッセージ:** Conventional Commits 風（`feat:` / `fix:` / `docs:` / `refactor:` / `chore:` / `test:`）。本文は「何を」ではなく「なぜ」。
3. **PR ルール:**
   - CI（`verify-all.js --fast` 相当）が全 PASS、S-RANK 維持
   - 3 法規（SPEC / GOOGLE / GEO）の差分がある PR は `sync-spec.js --check` がクリアであること
   - レビュアーは Opus 最新モデルに限らず、人間 or AI のレビューコメントを必ず 1 件以上取り込む
4. **タグ:** リリースは `vMAJOR.MINOR.PATCH` で打ち、CHANGELOG に変更点を記載。
5. **pre-push hook:** `harton/.git/hooks/pre-push` と `site-builder/.git/hooks/pre-push` は `../verify-all.js` を呼び、`FAIL > 0` または app test baseline 超過で push を拒否（絶対不変）。

### 12.9 ドキュメンテーション

- **README.md:** 概要・起動手順・環境変数・ライセンスの必須 4 節。
- **CLAUDE.md（ルート）:** 本仕様書・3 法規・運用フローの参照ガイド（HARTON/CLAUDE.md を参照）。
- **JSDoc / TSDoc:** 公開 API 関数にはパラメータ・戻り値・throw 条件を記述。
- **ADR:** 重要な設計判断（モデル固定からモデル追従への移行など）は `docs/adr/` に ADR-YYYYMMDD.md として残す。

### 12.10 アクセシビリティ（アプリ UI）

サイト基準（§7, WCAG 2.2）と同水準を適用:
- キーボードのみで全操作可能
- フォーカスリング不透明、コントラスト 4.5:1 以上
- aria-label / aria-live を適切に付与
- 動的更新は `aria-live="polite"` などでスクリーンリーダに通知
- 設定画面など重要フローは reduced-motion 対応

### 12.11 リリース基準

リリース（npm publish / 本番デプロイ / GitHub Release）前のチェック:

- [ ] `node verify-all.js` フル PASS（3 法規同期 OK / spec-checker FAIL=0 / app test baseline 以内）
- [ ] 3 法規の version とアプリ UI / 記事の version が一致
- [ ] CHANGELOG.md 追記
- [ ] package.json の version 更新
- [ ] `npm audit` 重大脆弱性なし
- [ ] pre-push hook 健全性確認

### 12.12 OWASP ASVS 5.0.0 適用（v3.1.1 訂正・公式 verbatim）

site-builder（再開時）および本仕様下で稼働する付随アプリは、Application Security Verification Standard 5.0.0（2025年5月 Global AppSec EU Barcelona でリリース）の Level 2 を最低基準とする。一次ソース: <https://owasp.org/www-project-application-security-verification-standard/>、公式 GitHub: <https://github.com/OWASP/ASVS>（公式 chapter リスト verbatim 取得日 2026-04-25）

**ASVS 5.0.0 公式 17 chapter（V1〜V17、verbatim）:**

| V# | 公式 chapter 名（verbatim） | アプリへの適用優先 |
|---|---|---|
| V1 | Encoding and Sanitization | 高（Injection 対策の基礎） |
| V2 | Validation and Business Logic | 高（入力検証） |
| V3 | Web Frontend Security | 高（XSS / CSRF / フロントエンド） |
| V4 | API and Web Service | 高（API 通信） |
| V5 | File Handling | 中（ファイルアップロード機能で必須） |
| V6 | Authentication | 高（認証あり機能で必須） |
| V7 | Session Management | 高（認証あり機能で必須） |
| V8 | Authorization | 高（認証あり機能で必須） |
| V9 | Self-contained Tokens | 中（JWT 等の使用時） |
| V10 | OAuth and OIDC | 中（OAuth 連携時） |
| V11 | Cryptography | 高（API キー保管・通信暗号化） |
| V12 | Secure Communication | 高（HTTPS / TLS） |
| V13 | Configuration | 高（CSP / セキュリティヘッダー） |
| V14 | Data Protection | 高（PII / API キー保護） |
| V15 | Secure Coding and Architecture | 高（§0.3 美しいコーディング原則と整合） |
| V16 | Security Logging and Error Handling | 高（§12.3 構造化ログと整合） |
| V17 | WebRTC | 低（WebRTC 機能なしでは N/A） |

**3 段階の Verification Level（公式定義）:**

- **Level 1**: エントリポイント。基本的な hygiene。v5.0 で adoption しやすいよう要件大幅削減
- **Level 2**: 中間層。実用的な高セキュリティ。**HARTON / site-builder の最低基準**
- **Level 3**: 高保証。v5.0 で約 90 要件追加（v4.0.3 の ~20 から大幅増）。軍事・医療レベル

**Level 2 採用根拠（site-builder / 付随アプリ）:**

- Level 1 の hygiene のみでは中小事業者の信頼担保に不十分
- Level 3 は HARTON のクライアント層（中小事業者向け SaaS）には過剰
- Level 2 が「実用的な高セキュリティ」として妥当水準

**運用ルール:**

1. 新機能 PR 時に該当 requirement を引用（例: コミットメッセージや PR 説明に `ASVS 5.0.0 V1.2.5 に基づく入力サニタイズ` のように chapter 番号付きで記載）
2. ASVS requirement の不適用判断（N/A）は理由を明記して PR に残す
3. Chapter 横断のセキュリティテストを `app/test/security/` 配下に置く（既存）
4. SPEC §8.3 OWASP Top 10:2025 と相互補完して運用する（Top 10 はリスク分類、ASVS は具体検証要件）
5. アプリが Web 機能を実装する場合、特に **V3 Web Frontend Security** の要件を優先確認
6. WebRTC（V17）はアプリで該当機能なしなら N/A 明記で省略可

---

## 13. 改版履歴

| 版 | 日付 | 内容 |
|----|------|------|
| 1.0 | 2026-04-10 | 初版。HARTON自社サイトSクラス判定を基に策定 |
| 2.0 | 2026-04-11 | Google検索セントラル/E-E-A-T/Core Web Vitals最新基準を統合。JSON-LD 5種化、Person追加、404.html/profile/index.html必須化、INP基準採用、fetchpriority対応、内部リンク網・一次情報要件追加 |
| 2.1 | 2026-04-12 | モバイル品質基準（Section 10.5）追加。モバイルメニュー・レイアウト・ナビゲーション・パフォーマンスの必須要件を明文化。チェックリスト11.7にモバイル検証項目追加 |
| 2.2 | 2026-04-12 | Google Search Central完全準拠。E-E-A-Tは品質評価枠組みであり非ランキング要因と明記。meta keywords不使用を明記。URL設計・リンクテキスト基準追加（Section 3.4, 3.5）。alt text重要性強化。canonical用途明確化。コンテンツ鮮度管理（4.5）、Search Console推奨（4.10）、UGCリンク対策（4.11）、JSレンダリング要件（4.12）追加。構造化データ→リッチリザルトの関係を明記 |
| 2.3 | 2026-04-13 | GOOGLE-STANDARDS.md / GEO-STANDARDS.md を正式な補助基準書として統合（3法規体制）。GEO（Generative Engine Optimization, arXiv:2311.09735）の G-1〜G-6 を全AI呼び出しのシステムプロンプトと納品前検証（spec-checker 649項目）に組込み。Claude Opus 4.6 限定 / Sクラス品質保証をアプリ仕様として確定 |
| 2.4 | 2026-04-16 | **Containing Block 汚染回避原則（Section 10.5.1.1）を新設**。`position: fixed` オーバーレイ（モバイルメニュー / モーダル / ドロワー）は `backdrop-filter` / `filter` / `transform` / `perspective` / `will-change` を持つ祖先の子孫に配置不可とする W3C CSS Positioned Layout Level 3 準拠規定を明文化。チェックリスト11.7に祖先 containing block 検証を追加。ブログページ（blog/**/*.html）を spec-checker 検証対象に追加し、静的ページと同一の S-RANK 基準で検証する |
| **3.0** | **2026-04-16** | **メジャー改訂。§0（モデル追従原則・事実性ルール F-1〜F-6・美しいコーディング原則）を絶対法規として新設。§12（アプリ開発基準）を絶対法規としてサイト基準と共有化。§4.13 Lead Evidence Block テンプレ内に残存していた旧 Opus 4.1 価格（$15/$75）および捏造 `cite` URL（ドットドット プレースホルダ）を実 URL・verbatim 引用へ置換。3 法規合計サイズの記述を「計約 40KB」から実測値「約 73KB」へ整合。Opus 4.6 固定の記述（「Claude Opus 4.6 限定」等）を削除し、Anthropic 公式 Models overview で「most capable generally available model」と表示される現行モデルを主力とする追従方針に切替。<br>**移行時の互換性:** 既存 v2.x の納品済みサイトは再生成不要。次回更新時に §0 / §12 基準を適用。<br>**監査トレース:** 2026-04-16 の記事群修正で下流のブログ記事を Opus 4.7 / 検証済み引用へ更新済み。v3.0 は上流法規側の整合を取ったもの。 |
| **3.1** | **2026-04-25** | **Claude Code 制御補強 + 業界標準セキュリティ統合改訂。**<br>**(A) Claude Code 制御補強:** §0.0.5 Skills/Plugins 優先順位（superpowers / feature-dev / gstack 等の skill/plugin と本仕様の衝突解決）、§0.0.6 auto-memory への F-1〜F-6 適用、§0.0.7 マルチセッション境界における H-1〜H-5 の貫徹（4 セッション運用での責任連続性）、§0.0.8 完了宣言前 Self-Audit Checklist（6 項目）を新設。<br>**(B) セキュリティ標準統合:** §8.3 OWASP Top 10 2025 準拠（10 リスク分類への対応マッピング）、§8.4 IPA「安全なウェブサイトの作り方」改訂第7版（11 脆弱性カテゴリ）、§12.12 OWASP ASVS 5.0.0 Level 2 適用（7 必須 chapter）を統合。<br>**(C) 運用切替:** A 案フォルダ構成（tcharton + note-content 集中運用）への移行を反映。harton/ → harton-archive/ リネーム済（app/_archive/ に保管）、site-builder/ は app/site-builder/ で休眠中、3 法規配布先は tcharton/ 単独に簡素化。<br>**監査トレース:** 公式リンク（W3C WAI / OWASP / IPA / Awesome-GEO）と照合し、WCAG 2.2 / arXiv:2311.09735 の正当性を確認。v3.0 → v3.1 で機能上互換、納品済みサイトの再生成不要。 |
| **3.1.1** | **2026-04-25** | **F-1 違反訂正 + Verbatim 強制条項追加（緊急訂正版）。**<br>**経緯:** v3.1 編集時に §8.3 OWASP Top 10:2025 と §12.12 OWASP ASVS 5.0.0 の表が公式ソースを未取得のまま Claude の training 知識ベースで記述された違反が、本セッション内で user との照合により発覚。§0.0.4 違反時義務に基づき即時訂正。<br>**訂正内容:**<br>(1) §8.3: OWASP Top 10:2025 公式カテゴリ（A01〜A10）を verbatim 取得（一次ソース <https://owasp.org/Top10/2025/>、取得日 2026-04-25）。A03「Software Supply Chain Failures」欠落の訂正、A10「SSRF」誤記を「Mishandling of Exceptional Conditions」に訂正、A02-A06 順序を公式に整合。<br>(2) §12.12: OWASP ASVS 5.0.0 公式 17 chapter（V1〜V17）を verbatim 取得（一次ソース <https://github.com/OWASP/ASVS>、取得日 2026-04-25）。誤った 7 chapter 記述を 17 chapter 全リストに置換。Level 1/2/3 の v5.0 における要件数変動も追記。<br>**再発防止:**<br>(3) §0.0.9「外部基準書転記における Verbatim 強制」を新設。SPEC 編集時に外部基準書から名称・コード・順序を転記する際の verbatim 取得義務、知識ベース記述禁止、取得日併記、Self-Audit #7 連動を規定。<br>(4) §0.0.8 Self-Audit Checklist に #7「外部基準書転記の verbatim 確認」を追加。<br>**TRUTH-AUDIT:** 本違反の経緯・evidence・学習を `app/_archive/_audits/TRUTH-AUDIT-2026-04-25-spec-v3.1-correction.md` として disk 保管（§0.0.4 #5）。<br>**互換性:** 機能上互換、v3.1 → v3.1.1 で表の内容のみ訂正。 |
| **3.2** | **2026-04-25** | **§1 プロジェクト構成 大幅拡張 — tcharton.com 三本柱(①WEB構築 / ②保守運用 / ③AI予測)に対応する 18 ページ階層構造を標準化。§1.0 プロジェクト原則を新設し §1.0〜§1.6 の 7 階層に再編。services/ サービス層 9 ページ、信頼形成層 4 ページ、必須情報層 5 ページを正式定義。llms.txt(GEO §8A)、.well-known/security.txt(RFC 9116)、各ページの Body Theme Variant マッピング表を §1.2 として正典化。spec-checker の THEME_VARIANTS 定義の正本を §1.2 とする。18 ページ未満の段階的公開を v3.2 では許容しない(§1.6 強制)。**<br>**互換性:** 旧 v3.1.1 までの単一 SPA 構成は v3.2 で廃止。tcharton.com 派生サイトの全運用に v3.2 構造を適用。<br>**spec-checker 連動:** 本改版に伴い `tcharton/spec-checker.js` の THEME_VARIANTS 定義を新 18 ページ全 URL に対応させる修正が別タスクで必要（指示書 §4.1）。 |
| **3.3** | **2026-04-27** | **3 法規 ↔ scanner.py（S クラス基準正本） 完全整合改訂 + 5 セッション役割名称確定 + ① への報告義務明文化。**<br>**経緯:** TCHARTON-AUDIT-REPORT.md（2026-04-27 ④ scanner 起票）で tcharton.com が scanner.py 基準で C/65 点判定であることが発覚。原因究明の結果、SPEC §1.0 行 3 「自社サイト（Sクラス判定済み）」表現が spec-checker S-RANK と scanner.py S クラスを混同させ、§0.0.1 narrow-scope claim 一般化リスクを実害化させていた。① ルートで全 3 法規 ↔ scanner.py の整合性検証を実施し、6 件の重大ドリフトを特定して本改訂で全件解消。<br>**改訂内容:**<br>**(A) 役割確定:** §0.0.7 で 5 セッションの役割名称（① HARTON 総合責任者 / ② S クラスサイト構築責任者 / ③ ブログ担当 / ④ S クラス最高技術責任者 / ⑤ HARTON Certified 認定運用責任者）を正式化。全サブセッションの ① への報告義務（完了 / 失敗 / エスカレーション / 整合性確認 / S クラス基準保持）を mandatory として明記。CLAUDE.md §1 連動。<br>**(B) S クラス用語の二層化:** §1.0 行 3 の「Sクラス判定済み」表現を「spec-checker.js 2554 項目 S-RANK 達成済」に修正。§1.0.1 を新設し、本仕様書 S-RANK（spec-checker 静的検査）と HARTON Certified S クラス（scanner.py 実 HTTP/DOM 検査）の二層構造を明文化。<br>**(C) §8.5 S クラス必須 5 条件 新設:** scanner/スキャンプロンプト.txt §1-5（verbatim 取得 2026-04-26）を SPEC 本体に正本化。HSTS+WAF / 高度 JSON-LD+NAP / CWV+TTFB / 非侵入型ボット / SSG の 5 条件と scanner.py 実装関数の対応表を明記。<br>**(D) §8.6 致命的 NG 新設:** certification/MASTER-PLAN §3.4（2026-04-26 ① 確定）と scanner.py `check_critical_ng()` Phase 9d 実装を SPEC 本体に正本化。HTTPS 非対応 / SSL 証明書エラー / WP 管理面露出 / CMS バージョン情報露出 の 4 項目を ★ 区分問わず一発除外条件として明記。<br>**(E) §8.7 Cookie 属性規定 新設:** Secure / HttpOnly / SameSite / Path / Domain の必須属性を明文化。scanner.py `check_cookie_security()` 連動。<br>**(F) §8.8 ボット防御規定 新設:** Cloudflare Turnstile / reCAPTCHA v3 / hCaptcha Invisible 等の非侵入型必須化。古い画像 CAPTCHA 不可と明記。<br>**(G) §8.9 SSG/Jamstack 要件 新設:** Cloudflare Pages / Vercel / Netlify / GitHub Pages を採用可能とし、scanner.py `check_ssg_hint()` の判定基準（X-Vercel-Id / X-NF-Request-Id / cf-pages / Server: github.com）を明記。<br>**(H) §8.1 CSP 改訂:** scanner.py `check_security_headers()` の必須欠落チェック対象 6 個（default-src / script-src / style-src / object-src / base-uri / form-action）を「必須コア」、推奨拡張 4 個（font-src / img-src / connect-src / frame-src）を「推奨拡張」として整合。**`'unsafe-inline'` の許容範囲を明確化** — `script-src` では禁止（nonce/hash 必須）、`style-src` のみ既存サイト互換のため限定許容。tcharton.com 標準 CSP テンプレを v3.3 推奨形に更新。<br>**(I) §1.0 原則 4 拡張:** ルート必須ファイルに `_headers` を追加（GOOGLE-STANDARDS §12.1 連動・本番公開前必須）。<br>**互換性:** SPEC 本体の表現整合と新節追加が中心。spec-checker.js は本改訂で機能変更なし（§11 検査基準は v3.2 と同等）。② tcharton は §8.1.5 標準 CSP テンプレ移行と `_headers` 配置を CRITICAL-ISSUES-REPORT v1.1.3 経由で別途実施。<br>**配布:** `node sync-spec.js` で tcharton/scanner/certification に配布。<br>**監査トレース:** `HARTON/CRITICAL-ISSUES-REPORT.md` v1.1.3（2026-04-27 ① 起票）で 6 件のドリフトと本改訂の証跡を保管。 |
| **3.4** | **2026-04-27** | **JSON-LD 構造化データ強化 + SSG/Jamstack 抽象化拡張 — ② tcharton 正式エスカレーション 3 件（REPORT-TO-ROOT-SPEC-V3.3.md / REPORT-TO-ROOT-SPEC-CHECKER-FIXES.md / SCANNER-EXTENSION-REQUEST.md）を受領し、① v3.3 改訂時の見落とし 4 点を補完。**<br>**経緯:** ② tcharton（S クラスサイト構築責任者）が SPEC v3.3 §8.5 必須条件 1 の HSTS+WAF 改修を完了（commit `97323a6`）後、必須条件 2「高度 JSON-LD + NAP 完全一致」と必須条件 5「SSG/Jamstack」達成を試みる過程で、SPEC §4.2 #1 必須プロパティに `additionalType` / `sameAs` GBP URL 規定が不在 / `@type` 配列形式が未規範化 / §8.9 SSG 認定で Cloudflare Workers Static Assets（cf-pages 不在）が判定不能、という 4 点を発見。② が SPEC §0.0.7 報告義務 mandatory に基づき ① にエスカレーション。① で受領内容を verbatim 確認し、自身の v3.3 検証マトリクス漏れと認識。本 v3.4 で全件補完。<br>**改訂内容:**<br>**(A) §4.2 #1.0 `@type` 配列形式必須化:** Schema.org Multiple Types 仕様（公式 verbatim 2026-04-27 取得 / <https://schema.org/docs/datamodel.html#typeCategory>）に基づき、ProfessionalService + LocalBusiness を `["ProfessionalService", "LocalBusiness"]` 配列形式で宣言することを必須化。単一型宣言は v3.4 で非推奨。<br>**(B) §4.2 #1.1 必須プロパティに `additionalType[]` 追加:** scanner Sクラス必須条件 2 の業種判定向上のため、Wikidata Q 番号 URI による業種明示を必須化。空配列は SPEC 違反。<br>**(C) §4.2 #1.2 `additionalType` の値域規範化:** Web デザイン Q189210 / IT Q11661 / AI Q11660 / Consulting Q193563 / Software Engineering Q638608 / Machine Learning Q2539 / 会計士 Q41189 / 弁護士 Q40348 / 不動産 Q1473298 / 飲食店 Q11707 / 美容院 Q1257670 等を許可リスト化。④ scanner `INDUSTRY_KEYWORD_MAP` と同期。<br>**(D) §4.2 #1.3 `sameAs` の値域規範化:** GBP（Google ビジネスプロフィール）URL を 1 件以上必須化。`google.com/maps` / `maps.google.com` パターン検証。Service Area Business モード推奨（住所非公開可）。<br>**(E) §8.9 SSG/Jamstack 抽象化:** v3.3 の単一プラットフォーム判定（cf-ray AND cf-pages 等）から「**静的エッジ配信プラットフォーム**」概念へ抽象化。Cloudflare Workers Static Assets（`Server: cloudflare` + `cf-ray` + origin server 由来ヘッダ不在）を v3.4 認定対象に追加。**`X-Hosting:` honest signaling ヘッダ**（`cloudflare-workers-static-assets` / `cloudflare-pages` / `vercel` / `netlify` / `github-pages` / `custom-static-cdn` 等）を導入し、配信プラットフォーム明示の許容リストを §8.9.1 で規範化。**虚偽記載は §0.0.1 narrow-scope claim 一般化リスク**として禁止し、scanner の二次検証（origin シグナル併存検出）で背任扱い。<br>**互換性:** v3.3 → v3.4 改訂は機能上互換（既存 `@type` 単一型宣言の HTML は v3.4 で非推奨だが spec-checker FAIL を出さない経過措置中）。② tcharton で `@type` 配列化試行が spec-checker.js のバグ（line 183-189 の `jsonldTypes()` が array を 1 要素として登録）で 4 FAIL → ロールバックされた経緯を踏まえ、spec-checker.js 改修は別途 ② への正式指示書 `tcharton/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` で発出。scanner.py 拡張（SSG 検出 / `INDUSTRY_KEYWORD_MAP` / `@type` 配列対応）は ④ への正式指示書 `scanner/INSTRUCTION-FROM-ROOT-SPEC-V3.4.md` で発出。<br>**配布:** `node sync-spec.js` で tcharton/scanner/certification に配布。<br>**監査トレース:** `HARTON/CRITICAL-ISSUES-REPORT.md` v1.1.4（2026-04-27 ① 起票）で v3.3 検証漏れと v3.4 補完の証跡を保管。 |
