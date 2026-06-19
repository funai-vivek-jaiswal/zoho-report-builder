---
last_agent: 設計君
last_model: gpt-5-codex
last_updated: 2026-06-19
doc_type: working
---

# カスタムレポート機能 設計レビュー案
---

## 1. システム設計案

### 1.1 まず置くべき判断

カスタムWidgetを作る前に、以下の分岐で判断する。

| 判断条件 | 推奨方針 |
|---|---|
| CRM標準レポートで必要なJOIN・保存・共有・集計が満たせる | 標準レポートを使う。開発しない。 |
| 標準レポートでは不足するが、集計・ダッシュボード中心 | Zoho Analyticsを検討する。 |
| 同一ユーザーに対して、レポート単位で表示可能項目を細かく制御したい | カスタムWidgetを検討する。 |
| コピー禁止が主目的 | カスタムWidgetでは完全解決できないため、Export無効化・権限・運用ルールで対応する。 |

### 1.2 カスタム開発する場合の全体構成

```text
Zoho CRM画面
  |
  | Widget iframe
  v
React Widget
  - レポート条件作成UI
  - プリセット保存/読込UI
  - 結果テーブル表示
  - コピー抑止UI
  |
  | ZOHO.CRM.FUNCTIONS.execute()
  v
Deluge Functions
  - get_my_report_settings
  - save_user_report_setting
  - share_report_setting
  - execute_custom_report
  |
  | zoho.crm.coql / zoho.crm.* integration tasks
  v
Zoho CRM Data
  - 標準モジュール
  - Report_Target_Modules
  - Report_Target_Fields
  - Saved_Report_Settings
```

### 1.3 データ設計

| エンティティ | 用途 | 主な項目 |
|---|---|---|
| `Report_Target_Modules` | 管理者が利用可能モジュールを制御 | `Name`, `Module_API_Name` |
| `Report_Target_Fields` | 管理者が利用可能項目・集計可否・Lookup可否を制御 | `Field_API_Name`, `Target_Module`, `Data_Type`, `Is_Aggregatable`, `Is_Groupable`, `Is_Join_Key` |
| `Saved_Report_Settings` | ユーザーの保存条件を保持 | `Name`, `Target_Module`, `Config_JSON`, `Owner`, `Shared_With_Users`, `Is_Shared` |

重要な設計条件。

| 条件 | 内容 |
|---|---|
| 保存条件 | レポート条件は `Config_JSON` にJSONとして保存する。 |
| 所有者制御 | `Owner` は `zoho.loginuser` から設定する。 |
| 共有 | 共有先ユーザーIDを `Shared_With_Users` に保持する。ただし件数が増える場合は別テーブル化を検討する。 |
| 権限制御 | `Saved_Report_Settings` はPrivate設定を必須とする。 |
| 項目制御 | COQLに入れる項目名は必ずマスタに存在するものだけにする。 |

### 1.4 実行設計

| 処理 | 方針 |
|---|---|
| 初期表示 | プリセットと利用可能モジュール/項目を取得する。 |
| 条件変更 | React Stateのみ更新し、バックエンド通信しない。 |
| レポート生成 | ユーザーが「Generate Report」を押した時だけ `execute_custom_report` を呼ぶ。 |
| ページング | 自動取得しない。「Next Page」を押した時だけ次ページを取得する。 |
| 取得件数 | 安全側に倒し、1ページ200件を上限とする。 |
| JOIN | 公式制約に合わせ、最大2 JOIN前提に修正する。 |
| 集計 | `GROUP BY` と集計項目の整合性をDeluge側でも検証する。 |

---

## 2. 懸念事項一覧・回答案

| # | 懸念 | 回答案 | 残課題 |
|---|---|---|---|
| 1 | Reactで本当に良いのか | Zoho CRM WidgetはJS SDKで埋め込みUIを作れるため、Reactは選択肢として妥当。状態管理が多い画面なのでReactの利点もある。 | React必須ではないため、「なぜReactか」をHLDに明記する。MUI込みのビルドサイズとWidget内表示速度を検証する。 |
| 2 | Widget内で処理が重くならないか | 条件変更時は通信せず、実行ボタン押下時のみ通信する設計なら負荷は抑えられる。結果表示も200件単位なら現実的。 | 1,000件以上のクライアント保持、全件ソート、無限スクロールは禁止する。実機で表示速度を測る。 |
| 3 | APIクレジットは大丈夫か | 1ページ200件、明示実行、明示ページングなら消費は抑えられる。Feasibility Reportの試算上、日次クレジットだけを見ると致命的ではない。 | 同時実行数とQuery APIのサブ同時実行制限を設計に入れる。クレジット残量取得と停止条件を具体化する。 |
| 4 | COQLのJOIN上限は大丈夫か | 現行LLDの「最大3 Lookup」は危険。公式仕様に合わせて最大2 JOINに修正する。 | 3 JOINが必須の業務要件がある場合は、Zoho Analyticsまたは別方式に切り替える。 |
| 5 | 2,000件取得前提でよいか | 2,000件を前提にしない。UI/LLDは1ページ200件に統一する。 | HLD/元要件の「最大2,000件」表現を修正し、200件ページングに揃える。 |
| 6 | コピー禁止は実現できるか | 右クリック・選択・Ctrl+Cの抑止は可能。ただしDevTools、スクリーンショット、ブラウザ機能は防げない。 | 要件名を「コピー禁止」から「カジュアルコピー抑止」に変更する。Export禁止はCRM権限で対応する。 |
| 7 | 権限漏れは起きないか | マスタホワイトリストとPrivate設定、Ownerチェックで基本線は作れる。 | Deluge側で全入力値を再検証する。フロントだけの制御にしない。 |
| 8 | 保存/共有プリセットは安全か | Ownerを必須にし、非Ownerの上書きや共有変更を拒否する。 | `Shared_With_Users` の文字列検索は件数増加時に遅くなる可能性がある。必要なら共有専用テーブル化する。 |
| 9 | 標準CRMレポートで足りるのでは | 多くの要件は標準CRMレポートまたはZoho Analyticsで代替可能。 | カスタム開発の理由を「レポート単位の項目制御」に限定して再確認する。 |
| 10 | 本番運用で止まらないか | 初期段階では利用者・対象モジュール・JOIN数・ページ数を制限する。 | API Dashboardで監視し、エラー時の表示、再試行、管理者通知を設計に追加する。 |

### 2.1 設計書への修正指示案

| 対象 | 修正内容 |
|---|---|
| HLD | 「ReactはZoho必須」ではなく「状態管理の複雑性から採用」と記載する。 |
| HLD | Concurrent users 20-50の根拠を削除または再検証待ちにする。 |
| HLD/LLD | JOIN上限を3から2へ修正する。 |
| HLD/LLD | 2,000件取得前提をやめ、200件ページングに統一する。 |
| LLD | `TOO_MANY_REQUESTS`, credit exceeded, timeout時のエラー設計を追加する。 |
| LLD | クレジット残量が閾値以下の場合の「実行停止」条件を追加する。 |
| LLD | 共有プリセットの件数増加時は別テーブル化する判断基準を追加する。 |
| Feasibility | 「標準CRM/Analyticsで代替できない条件」をDecisionとして明文化する。 |

---

## 3. UIイメージ案

### 3.1 基本方針

UIは「自由に大量データを取れるレポートツール」ではなく、「管理者が許可した範囲で、必要な時だけ実行するレポートビルダー」として設計する。

重要なUI制約。

| 制約 | UI上の表現 |
|---|---|
| 自動実行しない | 条件変更時は結果を更新せず、「結果が古い可能性があります」を表示する。 |
| API消費を意識させる | Generate/Next Pageだけが通信することを明確にする。 |
| JOIN制限 | Lookup項目は最大2系統まで。超過時は選択不可にする。 |
| 大量取得禁止 | 200件単位のページング。全件取得ボタンは置かない。 |
| コピー抑止 | 結果テーブルに「Copy restricted」表示。ただし完全防止とは書かない。 |

---