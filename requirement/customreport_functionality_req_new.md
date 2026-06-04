# 0. 要求定義・機能要件 (Requirements Definition)

本システムが満たすべき要求一覧、およびそれを実現するための技術的アプローチのアウトラインです。

### 必須要件 (Must Requirements)

| 要求事項 | システム側での実現アプローチ |
| :--- | :--- |
| **画面コピーの禁止**（スクリーンショットやブラウザPDF化を除く） | React（フロントエンド）にて、CSSの `user-select: none` をグローバル適用し、ドラッグ選択を完全にブロック。さらにJavaScriptのイベントリスナーで `copy`（Ctrl+C）および `contextmenu`（右クリック）をインターセプトし、クリップボードへのデータ退避を防止する。 |
| **お気に入り保存機能**（フィルタ・項目順序等の使い回し） | ユーザーが選択した「元テーブル」「表示項目リスト（配列順序を維持）」「フィルター条件」「集計・グループ化設定」を単一のJSON文字列に変換。カスタムタブ `Saved_Report_Settings` のマルチラインフィールドへ一括格納する。 |
| **本人のみ再利用・編集可能**（他人は編集・削除不可） | 保存時、Delugeの `zoho.loginuser` から実行ユーザーを特定し、レコードの `Owner`（所有者）に設定。Zoho CRMの標準機能である「共有ルール」で当該カスタムタブを「非公開（Private）」に設定することで、他者からの閲覧・編集・削除をシステムレベルでシャットアウトする。 |
| **管理者による制御マスタ**（対象タブ、項目、集計可否の指定） | 管理者のみがアクセスできるマスタタブ（`Report_Target_Modules` / `Report_Target_Fields`）を構築。ウィジェット起動時にこのマスタを読み込み、許可されたオブジェクト・項目・集計種別のみを動的に選択プルダウンへマッピングする。 |

### 希望要件 (Want Requirements)

| 要求事項 | システム側での実現アプローチ |
| :--- | :--- |
| **ルックアップ参照のJOIN取得**（COQLによる関連タブ取得） | 項目設定マスタ（`Report_Target_Fields`）に、該当項目が「ルックアップ（Lookup）」であることを示す属性を追加。ユーザーがこれを選択した際、COQLの特性（`SELECT Account_Name.Account_Name FROM Leads` 等のドット記法）を利用して、親レコードの特定フィールドを動的に結合取得するロジックをDeluge側へ組み込む。 |
| **作成者以外への共有方法** | **所有権共有モデル:** 所有者（Owner）が明示的に他ユーザーへ「共有」レコードを作成するか、マスタに「共有先（ユーザー/ロール選択フィールド）」を追加し、Deluge側で取得クエリの `WHERE` 句に `OR 共有先 = ログインユーザー` を追加する。または共有用URLパラメータを発行する。 |
| **APIクレジット消費の考慮** | 1リクエストで大量のAPIを消費する標準APIを避け、**最大2,000件を一撃で取得できるCOQL（`zoho.crm.coql`）に通信を一本化**する。さらに、一度取得したデータはReactのStateにキャッシュし、「レポートを生成」ボタンが明示的に押された場合のみバックエンドへ通信する設計（オンデマンド実行）を徹底する。 |

---


# 1. システム構成 (System Architecture)

本システムは、Zoho CRMをコアPaaS（Platform as a Service）とし、フロントエンドにReact、バックエンドにDelugeを用いたサーバーレスアーキテクチャで構成されます。

```
[ Zoho CRM クライアント (Browser) ]
      │
      ▼ (JSSDK / Widget Context)
┌────────────────────────────────────────────────────────┐
│  フロントエンド: React ウィジェット                     │
│  - 条件選択 UI (MUI / Tailwind)                        │
│  - コピー防止制御 (CSS / JS Event Listener)            │
│  - 保存/上書きダイアログ (Modal)                        │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ ZOHO.CRM.FUNCTIONS.execute()
                   ▼
┌────────────────────────────────────────────────────────┐
│  バックエンド: Deluge 関数                              │
│  - get_my_report_settings (プリセット取得)              │
│  - save_user_report_setting (新規保存・上書き)          │
│  - execute_custom_report (動的COQL生成・実行)           │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ COQL (Zoho Object Query Language)
                   ▼
┌────────────────────────────────────────────────────────┐
│  データ層: Zoho CRM データベース                        │
│  - 標準モジュール (Leads, Accounts, etc...)             │
│  - カスタムタブ (マスタ制御、ユーザーお気に入り)         │
└────────────────────────────────────────────────────────┘

```

---

# 2. 技術要件 (Technical Requirements)

### フロントエンド (Widget)

* **Framework:** React 18+ (Vite または Create React App 構成)
* **UI Library:** Material-UI (MUI) v5 または Tailwind CSS (本コードでは標準HTML/CSSおよびMUIライクなスタイルを採用)
* **SDK:** Zoho CRM Widget SDK (`ZOHO.CRM.FUNCTIONS` などのAPIを利用可能であること)
* **Security:** * `user-select: none` によるテキスト選択のブロッキング
* `contextmenu` (右クリック) および `copy` (Ctrl+C) イベントのインターセプト



### バックエンド (Deluge)

* **Execution Environment:** Zoho CRM Functions (REST APIとして公開)
* **Data Access:** Zoho CRM COQL (1リクエスト最大2,000件のページネーション制御)
* **Data Format:** JSONオブジェクト（フロント・バック間のデータ授受はすべてJSON文字列化して実施）

---

# 3. 各タブのテーブル定義書 (Schema Definition)

## ① 管理者制御用：レポート対象オブジェクト設定 (`Report_Target_Modules`)

管理者がユーザーに開放するモジュールを定義するマスタ。

| フィールド表示名 | フィールドAPI名 | 型 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| モジュール名 | `Name` | シングルライン | ○ | ユーザー表示用 (例: `見込み客`) |
| モジュールAPI名 | `Module_API_Name` | シングルライン | ○ | クエリ用 (一意のキー、例: `Leads`) |

## ② 管理者制御用：レポート対象項目設定 (`Report_Target_Fields`)

オブジェクトに紐づく、利用可能な項目と特性を制御するマスタ。

| フィールド表示名 | フィールドAPI名 | 型 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| 項目表示名 | `Name` | シングルライン | ○ | ユーザー表示用 (例: `売上高`) |
| 項目API名 | `Field_API_Name` | シングルライン | ○ | クエリ用 (例: `Annual_Revenue`) |
| 親オブジェクト | `Target_Module` | ルックアップ | ○ | `Report_Target_Modules` への参照 |
| データ型 | `Data_Type` | 選択肢 | ○ | `Text`, `Number`, `Date`, `PickList` |
| 集計可能フラグ | `Is_Aggregatable` | チェックボックス | － | Trueの場合、SUM/AVG等の対象にする |
| グループ化可能フラグ | `Is_Groupable` | チェックボックス | － | Trueの場合、GROUP BYの対象にする |

## ③ ユーザー用：レポートお気に入り設定 (`Saved_Report_Settings`)

ユーザーが保存したレポートの条件（プリセット）を格納するテーブル。

| フィールド表示名 | フィールドAPI名 | 型 | 必須 | 備考 |
| --- | --- | --- | --- | --- |
| 設定名 | `Name` | シングルライン | ○ | ユーザーが任意に入力する名称 |
| 元テーブル | `Target_Module` | シングルライン | ○ | モジュールAPI名 (例: `Leads`) |
| 条件JSON | `Config_JSON` | マルチライン | ○ | 選択項目、フィルタ、集計ルールのJSON |
| 所有者 | `Owner` | ルックアップ | ○ | 閲覧範囲制御のため**ログインユーザー**を設定 |

---

# 4. ディレクトリ構成 (Directory Structure)

ウィジェットのプロジェクトルート直下の標準的な構造です。

```text
zoho-crm-report-widget/
├── app/
│   ├── index.html
│   ├── dist/ (ビルド成果物格納用)
│   └── src/
│       ├── index.js
│       ├── App.jsx
│       ├── App.css
│       └── components/
│           └── SaveDialog.jsx
└── deluge/
    ├── get_my_report_settings.dg
    ├── save_user_report_setting.dg
    └── execute_custom_report.dg

```

---

