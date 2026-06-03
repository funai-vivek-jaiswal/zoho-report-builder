# 1. System Architecture

This system uses Zoho CRM as the core PaaS (Platform as a Service), with a serverless architecture consisting of React on the frontend and Deluge on the backend.

```
[ Zoho CRM Client (Browser) ]
      │
      ▼ (JSSDK / Widget Context)
┌────────────────────────────────────────────────────────┐
│  Frontend: React Widget                                │
│  - Condition Selection UI (MUI / Tailwind)             │
│  - Copy Prevention Controls (CSS / JS Event Listener)  │
│  - Save/Overwrite Dialog (Modal)                       │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ ZOHO.CRM.FUNCTIONS.execute()
                   ▼
┌────────────────────────────────────────────────────────┐
│  Backend: Deluge Functions                             │
│  - get_my_report_settings (Fetch presets)              │
│  - save_user_report_setting (New save / Overwrite)     │
│  - execute_custom_report (Dynamic COQL generation & execution) │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ COQL (Zoho Object Query Language)
                   ▼
┌────────────────────────────────────────────────────────┐
│  Data Layer: Zoho CRM Database                         │
│  - Standard Modules (Leads, Accounts, etc...)          │
│  - Custom Tabs (Master control, User favorites)        │
└────────────────────────────────────────────────────────┘
```

---

# 2. Technical Requirements

### Frontend (Widget)

- **Framework:** React 18+ (Vite or Create React App configuration)
- **UI Library:** Material-UI (MUI) v5 or Tailwind CSS (this codebase uses standard HTML/CSS with MUI-like styles)
- **SDK:** Zoho CRM Widget SDK (must be able to use APIs such as `ZOHO.CRM.FUNCTIONS`)
- **Security:**
  - Text selection blocking via `user-select: none`
  - Intercepting `contextmenu` (right-click) and `copy` (Ctrl+C) events

### Backend (Deluge)

- **Execution Environment:** Zoho CRM Functions (exposed as REST API)
- **Data Access:** Zoho CRM COQL (pagination control with a maximum of 2,000 records per request)
- **Data Format:** JSON objects (all data exchange between frontend and backend is done via JSON serialization)

---

# 3. Schema Definition for Each Tab

## ① For Admin Control: Report Target Object Settings (`Report_Target_Modules`)

A master table that defines the modules made available to users by administrators.

| Display Name | Field API Name | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| Module Name | `Name` | Single Line | Yes | For user display (e.g., `Leads`) |
| Module API Name | `Module_API_Name` | Single Line | Yes | For queries (unique key, e.g., `Leads`) |

## ② For Admin Control: Report Target Field Settings (`Report_Target_Fields`)

A master table controlling the available fields and their properties linked to each object.

| Display Name | Field API Name | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| Field Display Name | `Name` | Single Line | Yes | For user display (e.g., `Annual Revenue`) |
| Field API Name | `Field_API_Name` | Single Line | Yes | For queries (e.g., `Annual_Revenue`) |
| Parent Object | `Target_Module` | Lookup | Yes | Reference to `Report_Target_Modules` |
| Data Type | `Data_Type` | Picklist | Yes | `Text`, `Number`, `Date`, `PickList` |
| Aggregatable Flag | `Is_Aggregatable` | Checkbox | No | If True, eligible for SUM/AVG etc. |
| Groupable Flag | `Is_Groupable` | Checkbox | No | If True, eligible for GROUP BY |

## ③ For Users: Saved Report Settings (`Saved_Report_Settings`)

A table storing user-saved report conditions (presets).

| Display Name | Field API Name | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| Setting Name | `Name` | Single Line | Yes | Name entered freely by the user |
| Source Table | `Target_Module` | Single Line | Yes | Module API name (e.g., `Leads`) |
| Condition JSON | `Config_JSON` | Multi Line | Yes | JSON of selected fields, filters, and aggregation rules |
| Owner | `Owner` | Lookup | Yes | Set to the **logged-in user** for access scope control |

---

# 4. Directory Structure

Standard structure directly under the widget project root.

```text
zoho-crm-report-widget/
├── app/
│   ├── index.html
│   ├── dist/ (build output directory)
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
