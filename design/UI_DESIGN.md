# UI Design: Zoho CRM Custom Report Widget

**Date:** 2026-06-04
**Status:** Draft
**Author:** Vivek
**LLD Reference:** `LLD_custom_report.md`
**HLD Reference:** `HLD_custom_report.md`

---

## Table of Contents

1. [Functional Flow Diagrams](#1-functional-flow-diagrams)
   - 1.1 Widget Initialization
   - 1.2 Report Building and Execution
   - 1.3 Preset Save
   - 1.4 Preset Load
   - 1.5 Preset Share
2. [Screen Transition Diagram](#2-screen-transition-diagram)
3. [UI Component Hierarchy](#3-ui-component-hierarchy)
4. [Screen Layouts (Wireframes)](#4-screen-layouts-wireframes)
   - 4.1 Main Widget — Empty State
   - 4.2 Main Widget — Builder Active
   - 4.3 Main Widget — Results View
   - 4.4 Save Dialog
   - 4.5 Share Dialog
   - 4.6 Error / Warning States

---

## 1. Functional Flow Diagrams

### 1.1 Widget Initialization Flow

```mermaid
flowchart TD
    A["Widget iframe mounts in Zoho CRM page"] --> B["ZOHO.embeddedApp.on PageLoad fires"]
    B --> C["Call get_my_report_settings via ZOHO.CRM.FUNCTIONS.execute"]
    C --> D{"Response OK?"}
    D -->|No| E["Show init error banner\nRetry button available"]
    D -->|Yes| F{"Presets exist?"}
    F -->|Yes| G["Populate Preset List panel\nwith owned and shared presets"]
    F -->|No| H["Show empty preset list\nwith hint to build first report"]
    G --> I["Fetch Report_Target_Modules whitelist"]
    H --> I
    I --> J["Populate Primary Module dropdown"]
    J --> K["Widget ready for user interaction"]
```

---

### 1.2 Report Building and Execution Flow

```mermaid
flowchart TD
    Start["Widget ready"] --> MS["User selects Primary Module from dropdown"]
    MS --> FetchFields["Fetch Report_Target_Fields for selected module"]
    FetchFields --> FP["User picks fields in FieldPicker\n(multi-select, ordered)"]
    FP --> LookupCheck{"Lookup field selected?"}
    LookupCheck -->|Yes| LookupLabel["Display dot notation preview\ne.g. Account_Name.Account_Name"]
    LookupCheck -->|No| StandardField["Standard field added to select_fields"]
    LookupLabel --> StandardField
    StandardField --> FC["User adds filter conditions\nin FilterBuilder"]
    FC --> AggCheck{"Aggregation needed?"}
    AggCheck -->|Yes| AP["User sets function and field in AggregationPanel\nSUM / AVG / COUNT / MAX / MIN\nUser sets GROUP BY field"]
    AggCheck -->|No| SkipAgg["No aggregation - skip"]
    AP --> StateUpdate["All config held in React State\nNo backend call made"]
    SkipAgg --> StateUpdate
    StateUpdate --> Stale{"reportData already loaded\nfrom previous run?"}
    Stale -->|Yes| StaleBanner["Show banner: Results may be outdated\nClick Generate to refresh"]
    Stale -->|No| RunButton["Generate Report button is active"]
    StaleBanner --> RunButton
    RunButton --> UserClickRun["User clicks Generate Report"]
    UserClickRun --> ClearCache["Clear reportData cache\nSet isStale = false\nSet isLoading = true"]
    ClearCache --> CallDeluge["Call execute_custom_report\nvia ZOHO.CRM.FUNCTIONS.execute\nPayload: config_json, page 1, page_size 200"]
    CallDeluge --> Validate{"Deluge validation\npasses?"}
    Validate -->|WHITELIST_VIOLATION| ErrWhitelist["Show error: Field or module\nnot in admin whitelist"]
    Validate -->|JOIN_LIMIT_EXCEEDED| ErrJoin["Show error: Maximum 3\nLookup traversals per query"]
    Validate -->|NO_FILTER_ON_LARGE_MODULE| ErrFilter["Show error: Add at least\none filter for this module"]
    Validate -->|COQL_ERROR| ErrCOQL["Show error: Query failed\nContact admin"]
    Validate -->|Pass| BuildCOQL["Deluge builds COQL with dot notation\nand executes via zoho.crm.coql"]
    BuildCOQL --> Results["Results returned as JSON array\nCached in reportData state\nSet isLoading = false"]
    Results --> RenderTable["Render read-only ResultTable\nwith copy prevention active"]
    RenderTable --> HasMore{"has_more = true?"}
    HasMore -->|Yes| ShowNextPage["Show Load Next Page button"]
    HasMore -->|No| EndResults["Show end of results indicator"]
    ShowNextPage --> UserNextPage["User clicks Load Next Page"]
    UserNextPage --> CallDeluge
```

---

### 1.3 Preset Save Flow

```mermaid
flowchart TD
    A["User clicks Save button\n(reportConfig is populated)"] --> B["Open SaveDialog modal"]
    B --> C["User types preset name"]
    C --> D{"Name matches an\nexisting owned preset?"}
    D -->|Yes| E["Show confirmation:\nOverwrite existing preset?"]
    D -->|No| F["Treat as new preset\npreset_id = null"]
    E -->|Cancel| B
    E -->|Confirm Overwrite| G["Call save_user_report_setting\nwith existing preset_id and new config_json"]
    F --> H["Call save_user_report_setting\nwith preset_id null"]
    G --> Result{"Save result"}
    H --> Result
    Result -->|FORBIDDEN| Err1["Show error: You do not own\nthis preset"]
    Result -->|INVALID_JSON| Err2["Show error: Invalid config\nContact developer"]
    Result -->|SAVE_FAILED| Err3["Show error: Save failed\nPlease retry"]
    Result -->|Success| CloseDialog["Close dialog\nRefresh Preset List\nHighlight new preset"]
```

---

### 1.4 Preset Load Flow

```mermaid
flowchart TD
    A["User sees Preset List panel"] --> B["User clicks a preset row"]
    B --> C["Deserialize Config_JSON\nfrom preset record"]
    C --> D["Restore primary_module\ninto ModuleSelector"]
    D --> E["Fetch fields for restored module\nfrom Report_Target_Fields"]
    E --> F["Restore select_fields order\ninto FieldPicker"]
    F --> G["Restore filters array\ninto FilterBuilder"]
    G --> H["Restore aggregations and group_by\ninto AggregationPanel"]
    H --> I{"reportData exists\nfrom previous session?"}
    I -->|Yes| J["Clear reportData\nSet isStale = false"]
    I -->|No| K["Builder shows loaded config\nResults area shows empty state"]
    J --> K
    K --> L["User reviews config\nand clicks Generate Report to run"]
```

---

### 1.5 Preset Share Flow

```mermaid
flowchart TD
    A["User opens SaveDialog\nafter saving a preset"] --> B["User clicks Share button"]
    B --> C["Show Share section\nwith user search input"]
    C --> D["User types org user name"]
    D --> E["Search Zoho org users\nvia CRM SDK"]
    E --> F["Dropdown shows matching users"]
    F --> G["User selects one or more target users\nwith checkboxes"]
    G --> H["User clicks Confirm Share"]
    H --> I["Call share_report_setting\nPayload: preset_id and share_with_user_ids"]
    I --> Result{"Deluge validation result"}
    Result -->|FORBIDDEN| ErrOwner["Show error: Only the preset\nowner can share it"]
    Result -->|USER_NOT_FOUND| ErrUser["Show error: User not found\nin this Zoho org"]
    Result -->|UPDATE_FAILED| ErrUpdate["Show error: Share update failed\nPlease retry"]
    Result -->|Success| SharedOK["Show success confirmation\nwith updated share list"]
    SharedOK --> Recipient["Recipient opens widget\nand sees preset in their Preset List\nlabeled with Shared with you badge"]
```

---

## 2. Screen Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Loading : Widget iframe mounts

    Loading --> WidgetReady : SDK PageLoad fires and presets fetched
    Loading --> InitError : SDK init or network failure

    InitError --> Loading : User clicks Retry

    WidgetReady --> BuilderEmpty : User starts a new report
    WidgetReady --> PresetListOpen : User browses presets

    PresetListOpen --> BuilderLoaded : User selects a preset
    PresetListOpen --> BuilderEmpty : User clicks New Report

    state BuilderEmpty {
        [*] --> ModuleStep
        ModuleStep --> FieldStep : Primary module selected
        FieldStep --> FilterStep : At least one field selected
        FilterStep --> AggStep : Optional aggregation added
        FilterStep --> RunReady : Skip aggregation
        AggStep --> RunReady : Aggregation configured
    }

    state BuilderLoaded {
        [*] --> PresetRestored : Config populated from preset
        PresetRestored --> RunReady : Builder shows saved config
    }

    BuilderEmpty --> Executing : User clicks Generate Report
    BuilderLoaded --> Executing : User clicks Generate Report

    Executing --> ResultsView : Data returned successfully
    Executing --> ExecutionError : Deluge returns error code

    ExecutionError --> BuilderEmpty : User dismisses error
    ExecutionError --> BuilderLoaded : User dismisses error

    ResultsView --> Paginating : User clicks Load Next Page
    Paginating --> ResultsView : Next page data appended

    ResultsView --> BuilderEmpty : User modifies config
    ResultsView --> BuilderLoaded : User modifies config

    ResultsView --> SaveDialog : User clicks Save button
    BuilderEmpty --> SaveDialog : User clicks Save button
    BuilderLoaded --> SaveDialog : User clicks Save button

    SaveDialog --> ShareDialog : User clicks Share after saving
    SaveDialog --> PresetListOpen : Save confirmed and dialog closed
    SaveDialog --> BuilderEmpty : User cancels dialog

    ShareDialog --> SaveDialog : Share confirmed or cancelled
```

---

## 3. UI Component Hierarchy

```mermaid
graph TD
    App["App.jsx\nRoot state manager\nZoho SDK init\nOn-demand execution controller"]

    App --> PL["PresetList.jsx\nOwned and shared presets\nLoad or delete a preset"]
    App --> MS["ModuleSelector.jsx\nPrimary module dropdown\nJOIN module slots (max 3)"]
    App --> FP["FieldPicker.jsx\nField multi-select per module\nType badges and dot notation labels\nDrag-to-reorder"]
    App --> FB["FilterBuilder.jsx\nDynamic WHERE condition rows\nOperator options by Data_Type"]
    App --> AGG["AggregationPanel.jsx\nFunction picker per Is_Aggregatable field\nGROUP BY picker per Is_Groupable field"]
    App --> RT["ResultTable.jsx\nRead-only MUI table\nuser-select none CSS\nCopy and context menu blocked\nClient-side column sort"]
    App --> PB["PaginationBar.jsx\nPage N indicator\nLoad Next Page button\nDisabled during load"]
    App --> SD["SaveDialog.jsx\nPreset name input\nOverwrite confirmation\nSave button calls save_user_report_setting"]

    SD --> SHD["ShareDialog sub-section\nOrg user search\nCheckbox user selection\nShare button calls share_report_setting"]
```

---

## 4. Screen Layouts (Wireframes)

### 4.1 Main Widget — Empty State

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CRM Custom Report Builder                                     [Save ▾] │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                    │
│  MY PRESETS        │  BUILD YOUR REPORT                                 │
│  ─────────────     │  ─────────────────────                             │
│                    │                                                    │
│  (No presets yet)  │  Primary Module                                    │
│                    │  ┌─────────────────────────────┐                  │
│  [+ New Report]    │  │  Select a module...       ▼ │                  │
│                    │  └─────────────────────────────┘                  │
│                    │                                                    │
│                    │  [+ Add JOIN Module]                               │
│                    │                                                    │
│                    │  ─ Select a module to see available fields ─       │
│                    │                                                    │
│                    │                                                    │
│                    │  [▶ Generate Report]  ← disabled until module set  │
│                    │                                                    │
├────────────────────┴────────────────────────────────────────────────────┤
│  RESULTS                                                                │
│                                                                         │
│  Select modules and fields above, then click Generate Report.           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Main Widget — Builder Active (fields selected, filter added)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CRM Custom Report Builder                                     [Save ▾] │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                    │
│  MY PRESETS        │  BUILD YOUR REPORT                                 │
│  ─────────────     │  ─────────────────────────────────────────────     │
│                    │                                                    │
│  ● My Q1 Report    │  Primary Module          JOIN Module               │
│  ○ Sales Summary   │  ┌──────────────┐        ┌───────────────────┐    │
│  ◆ Shared: Leads   │  │  Leads     ▼ │        │  (none)         ▼ │    │
│                    │  └──────────────┘        └───────────────────┘    │
│  [+ New Report]    │  [+ Add JOIN Module]                               │
│                    │                                                    │
│                    │  FIELDS  ─────────────────────────────────────     │
│                    │  ☑ Last Name         [Text]                        │
│                    │  ☑ Annual Revenue    [Number]  [SUM eligible]      │
│                    │  ☑ ◆ Account Name   [Lookup]  → Account_Name.Account_Name │
│                    │  ☐ ◆ Account Phone  [Lookup]  → Account_Name.Phone │
│                    │  ☐ Lead Status      [PickList]                     │
│                    │                                                    │
│                    │  FILTERS  ─────────────────────────────────────    │
│                    │  [Lead Status      ▼] [=  ▼] [Open-Not Contacted] [×] │
│                    │  [+ Add Filter]                                    │
│                    │                                                    │
│                    │  AGGREGATION  ──────────────────────────────────   │
│                    │  [SUM ▼] [Annual Revenue ▼]  AS [Total_Revenue]    │
│                    │  GROUP BY: [◆ Account Name ▼]                      │
│                    │  [+ Add Aggregation]                               │
│                    │                                                    │
│                    │  [▶ Generate Report]                               │
│                    │                                                    │
├────────────────────┴────────────────────────────────────────────────────┤
│  RESULTS                                                                │
│                                                                         │
│  No results yet. Click Generate Report to run.                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

> Legend:  `◆` = Lookup (dot notation) field   `☑` = selected   `☐` = not selected

---

### 4.3 Main Widget — Results View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CRM Custom Report Builder                                     [Save ▾] │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                    │
│  MY PRESETS        │  BUILD YOUR REPORT                ▲ collapsed      │
│  ─────────────     │  [Leads]  Fields: 3  Filters: 1  [▼ Expand]       │
│                    │                                                    │
│  ● My Q1 Report    │  ⚠ Results may be outdated — click Generate to refresh │
│  ○ Sales Summary   │  (shown only when config changed after last run)   │
│  ◆ Shared: Leads   │                                                    │
│                    │  [▶ Generate Report]                               │
│  [+ New Report]    │                                                    │
├────────────────────┴────────────────────────────────────────────────────┤
│  RESULTS  —  Page 1  (200 rows per page)           Credits used: 1     │
│                                                                         │
│  ┌──────────────┬────────────────┬──────────────────┬────────────────┐  │
│  │ Last Name ↕  │ Total_Revenue  │ Account Name  ↕  │ (col 4)        │  │
│  ├──────────────┼────────────────┼──────────────────┼────────────────┤  │
│  │ Smith        │ 150,000        │ Acme Corp        │ ...            │  │
│  │ Jones        │ 220,000        │ Beta LLC         │ ...            │  │
│  │ Tanaka       │  80,000        │ Gamma Inc        │ ...            │  │
│  │ ...          │ ...            │ ...              │ ...            │  │
│  └──────────────┴────────────────┴──────────────────┴────────────────┘  │
│                                                                         │
│  Page 1  [Load Next Page →]                                             │
│  (right-click, Ctrl+C, and text selection are disabled on this table)   │
└─────────────────────────────────────────────────────────────────────────┘
```

> Column sort (`↕`) operates on cached `reportData` state — no backend call.

---

### 4.4 Save Dialog

```
                    ┌──────────────────────────────────────┐
                    │  Save Report Preset              [×] │
                    ├──────────────────────────────────────┤
                    │                                      │
                    │  Preset Name                         │
                    │  ┌──────────────────────────────┐   │
                    │  │ My Q1 Leads Report           │   │
                    │  └──────────────────────────────┘   │
                    │                                      │
                    │  ┌──────────────────────────────────┐│
                    │  │ ⚠ A preset with this name       ││
                    │  │ already exists. Overwrite?      ││
                    │  └──────────────────────────────────┘│
                    │  (shown only when name matches)      │
                    │                                      │
                    │  [Cancel]              [Save / Overwrite] │
                    └──────────────────────────────────────┘
```

---

### 4.5 Share Dialog (opened from SaveDialog after successful save)

```
                    ┌──────────────────────────────────────┐
                    │  Share Preset                    [×] │
                    ├──────────────────────────────────────┤
                    │  Preset: "My Q1 Leads Report"        │
                    │                                      │
                    │  Share with users in this org        │
                    │  ┌──────────────────────────────┐   │
                    │  │ Search by name...            │   │
                    │  └──────────────────────────────┘   │
                    │                                      │
                    │  Search results:                     │
                    │  ☐  Tanaka Hiroshi                   │
                    │  ☑  Yamamoto Keiko       ← selected  │
                    │  ☐  Suzuki Takashi                   │
                    │                                      │
                    │  Currently shared with:              │
                    │    • Yamamoto Keiko   [Remove]       │
                    │                                      │
                    │  [Cancel]              [Confirm Share]│
                    └──────────────────────────────────────┘
```

---

### 4.6 Error and Warning States

#### Validation Error Banner (below Generate Report button)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕ WHITELIST_VIOLATION                                              [×] │
│  Field "Custom_Unlisted_Field" is not in the allowed field list.         │
│  Contact your CRM admin to add this field to Report_Target_Fields.      │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕ NO_FILTER_ON_LARGE_MODULE                                        [×] │
│  The "Leads" module has over 50,000 records. Add at least one filter    │
│  before running to avoid timeout and excess credit consumption.         │
└─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕ JOIN_LIMIT_EXCEEDED                                              [×] │
│  Maximum 3 Lookup traversals per query. Remove one Lookup field         │
│  and try again.                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Stale Results Warning Banner (above result table)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠ Report configuration has changed since the last run.                │
│  Click Generate Report to refresh results with current settings.        │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Credit Warning Banner (inside result table footer)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠ API credit usage is high for today. Avoid running additional         │
│  large queries until tomorrow's credit quota resets.                    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Loading State (during Deluge function execution)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  RESULTS                                                                │
│                                                                         │
│  ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░  Running query...  │
│                                                                         │
│  [▶ Generate Report]  ← disabled during execution                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Field Type and Badge Reference

| Badge | Meaning | Eligible Operations |
|---|---|---|
| `[Text]` | Single Line or Multi-Line string field | `=`, `!=`, `contains`, `starts with` in filters |
| `[Number]` | Numeric field (currency, integer, decimal) | `=`, `!=`, `>`, `<`, `>=`, `<=`; SUM / AVG / MAX / MIN aggregation |
| `[Date]` | Date or DateTime field | `=`, `before`, `after`, `between` in filters |
| `[PickList]` | Picklist / dropdown field | `=`, `!=` in filters |
| `◆ [Lookup]` | Lookup field (dot notation traversal) | Used as JOIN key; shows dot notation label (e.g., `Account_Name.Account_Name`) |

---

## 6. Stale Banner and Cache Logic Summary

```
┌────────────────────────────────────────────────────────────────────┐
│                        REACT STATE FLOW                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  User changes any config (module / field / filter / aggregation)  │
│      → reportConfig state updated                                  │
│      → isStale = true  (if reportData is already populated)        │
│      → NO backend call                                             │
│                                                                    │
│  User clicks Generate Report                                       │
│      → reportData cleared                                          │
│      → isStale = false                                             │
│      → isLoading = true                                            │
│      → execute_custom_report called                                │
│      → result stored in reportData                                 │
│      → isLoading = false                                           │
│                                                                    │
│  User sorts a column                                               │
│      → sort applied to reportData in state                         │
│      → NO backend call                                             │
│                                                                    │
│  User clicks Load Next Page                                        │
│      → page incremented in reportConfig                            │
│      → execute_custom_report called with new page                  │
│      → result appended to reportData                               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```
