# HLD-CUSTOMREPORT-001: Zoho CRM Custom Report Widget

**Date:** 2026-06-03
**Status:** Draft
**Author:** Vivek
**Reviewers:** —
**Project:** CRM Custom Report
**PRD Reference:** `/home/vivek/project/INTERNAL/custom_report/requirement/customreport_functionality_req_new_en.md`
**ADR References:** —

---

## 0. Requirements Summary

Derived from PRD Section 0. Full detail in the PRD reference above.

### Must Requirements

| Requirement | Approach |
| :--- | :--- |
| **Prohibition of screen copying** (excluding screenshots and browser PDF export) | CSS `user-select: none` globally in React. JavaScript intercepts `copy` (Ctrl+C) and `contextmenu` (right-click) events to block clipboard transfer. |
| **Favorites save feature** (reuse of filters, field order, etc.) | Serialize selected source table, field list (ordered), filter conditions, and aggregation/grouping settings as a single JSON string stored in `Saved_Report_Settings.Config_JSON`. |
| **Only the creator can reuse and edit** (others cannot edit or delete) | Identify user via Deluge `zoho.loginuser` at save time and set as record `Owner`. Configure `Saved_Report_Settings` custom tab with Zoho CRM Sharing Rules = **Private** to enforce system-level access control. |
| **Admin-controlled master** (target tabs, fields, aggregation rules) | Admin-only master tabs (`Report_Target_Modules` / `Report_Target_Fields`). Widget loads this master on startup and maps only permitted objects, fields, and aggregation types to dropdowns. |

### Want Requirements

| Requirement | Approach |
| :--- | :--- |
| **JOIN retrieval via lookup references** (related tab access via COQL) | Add `Is_Lookup` attribute to `Report_Target_Fields`. When selected, use COQL dot notation (e.g., `SELECT Account_Name.Account_Name FROM Leads`) to dynamically fetch parent record fields — no explicit JOIN ON clause required. |
| **Sharing with users other than the creator** | Owner-explicit sharing: store share-target user/role in the preset and add `OR share_target = logged_in_user` to retrieval WHERE clause. Optional: issue a sharing URL parameter. |
| **API credit consumption consideration** | Consolidate all data access to `zoho.crm.coql` (up to 2,000 records per call). Cache results in React State. Execute backend call only when the "Generate Report" button is explicitly pressed (on-demand execution — no auto-refresh). |

---

## 1. Problem Statement

Zoho CRM's built-in report functionality does not support dynamic, user-configurable multi-module join queries with fine-grained access control. Users cannot build ad-hoc cross-module reports without CRM admin involvement, and no mechanism exists to share saved report presets with other users in the same organization. This feature delivers a self-service report builder embedded directly inside Zoho CRM as a widget.

---

## 2. Goals & Non-Goals

### Goals

- Allow end users to select fields across multiple Zoho CRM modules and execute cross-module COQL JOIN queries.
- Enforce admin-defined whitelists for which modules and fields users may query.
- Allow users to save, overwrite, and load named report presets.
- Allow users to share saved report presets with other users in the same Zoho org (explicit user/role sharing or URL parameter sharing).
- Prevent unauthorized data extraction: no file download or clipboard copy of report results.
- Stay within Zoho COQL credit limits by enforcing pagination, on-demand execution, and React State caching.
- Support COQL dot notation for Lookup field access across related modules (`SELECT Lookup.Field FROM Module`).

### Non-Goals

- Exporting or downloading report results to CSV, Excel, or any file format.
- Sending report results outside the Zoho org (email, webhook, external storage).
- Custom chart or visualization beyond tabular display.
- Real-time or scheduled (cron) report execution.
- Admin UI for managing `Report_Target_Modules` and `Report_Target_Fields` (assumed managed directly in Zoho CRM custom tab).

---

## 3. System Context Diagram (C4 L1)

```mermaid
graph TD
    EndUser["CRM User (Browser)"]
    Admin["CRM Admin"]
    Widget["Custom Report Widget\n(React, embedded in Zoho CRM)"]
    ZohoCRM["Zoho CRM Platform\n(Data, Auth, Functions, COQL)"]

    EndUser -->|"Builds & views report\nShares preset with org users"| Widget
    Admin -->|"Configures allowed modules\n& fields via Custom Tab"| ZohoCRM
    Widget -->|"ZOHO.CRM.FUNCTIONS.execute()\nWidget SDK"| ZohoCRM
    ZohoCRM -->|"COQL query results\nUser/org identity"| Widget
```

---

## 4. Container Diagram (C4 L2)

```mermaid
graph TD
    Browser["Zoho CRM Client (Browser)"]

    subgraph Widget["React Widget (Zoho CRM Embedded)"]
        UI["Condition Builder UI\n(MUI / Tailwind)"]
        SaveDialog["Save / Share Dialog\n(Modal)"]
        CopyGuard["Copy Prevention Layer\n(CSS user-select:none + JS Event Intercept)"]
    end

    subgraph Deluge["Deluge Backend Functions"]
        F1["get_my_report_settings\n(Fetch presets owned by / shared with user)"]
        F2["save_user_report_setting\n(Create / overwrite preset)"]
        F3["execute_custom_report\n(Build & run COQL JOIN query)"]
        F4["share_report_setting\n(Grant access to preset for org user)"]
    end

    subgraph ZohoDB["Zoho CRM Data Layer"]
        Std["Standard Modules\n(Leads, Accounts, Contacts, Deals, etc.)"]
        Custom1["Report_Target_Modules\n(Admin whitelist)"]
        Custom2["Report_Target_Fields\n(Admin field whitelist)"]
        Custom3["Saved_Report_Settings\n(User presets + sharing)"]
    end

    Browser -->|"Widget SDK"| Widget
    UI -->|"ZOHO.CRM.FUNCTIONS.execute()"| Deluge
    SaveDialog -->|"ZOHO.CRM.FUNCTIONS.execute()"| Deluge
    Deluge -->|"COQL"| ZohoDB
```

---

## 5. Data Flow

### 5.1 Report Execution Flow

1. User selects primary module and related modules from the admin-whitelisted dropdown.
2. User picks fields from each module, optionally sets filter conditions and aggregation rules.
3. Report conditions are held in React State. **No backend call is made until the user explicitly clicks "Generate Report"** (on-demand execution).
4. Widget calls `execute_custom_report` Deluge function via `ZOHO.CRM.FUNCTIONS.execute()`.
5. Deluge validates that all requested modules and fields exist in `Report_Target_Modules` / `Report_Target_Fields`.
6. For Lookup-type fields, Deluge builds COQL using dot notation (e.g., `SELECT Account_Name.Account_Name FROM Leads`) rather than an explicit JOIN ON clause.
7. COQL is executed via `zoho.crm.coql`; results are paginated (max 2,000 records per request).
8. Results are returned as a JSON array and **cached in React State**. Subsequent UI interactions (sort, scroll) operate on the cached data without additional backend calls.
9. Widget renders results in a read-only table with copy prevention active.

### 5.2 Preset Save / Share Flow

1. User clicks Save; Save Dialog prompts for a preset name.
2. Widget calls `save_user_report_setting`; Deluge writes to `Saved_Report_Settings` with the current user as Owner.
3. To share, user selects one or more Zoho org users; widget calls `share_report_setting`.
4. Deluge stores share relationships — either as a shared-users JSON field or a separate join table — while preserving the original Owner.
5. Recipients see the shared preset in their preset list when they next load the widget.

---

## 6. Integration Points

| External System | Purpose | Auth Method | Notes |
|---|---|---|---|
| Zoho CRM Widget SDK | Embed widget in CRM page, get current user context | Zoho Widget OAuth (automatic via SDK) | `ZOHO.CRM.CONFIG.getCurrentUser()` |
| Zoho CRM Functions (Deluge) | Execute server-side logic | Invoked via `ZOHO.CRM.FUNCTIONS.execute()` within widget context | No additional auth token needed |
| Zoho CRM COQL | Query CRM data; Lookup field access via dot notation | Deluge `zoho.crm.coql` (preferred; up to 2,000 records per call) | Subject to Zoho API credit limits |
| Zoho CRM Custom Tabs | Persist admin config & user presets | CRM standard record read/write in Deluge | `Report_Target_Modules`, `Report_Target_Fields`, `Saved_Report_Settings` |

---

## 7. Security Boundary

| Concern | Approach |
|---|---|
| Authentication | Zoho CRM session — widget SDK provides current user identity; no separate auth needed |
| Authorization | Deluge validates requested fields/modules against admin whitelist before building COQL |
| Report sharing scope | Sharing restricted to users within the same Zoho CRM org; cross-org sharing blocked |
| Data in transit | All calls occur within Zoho platform over HTTPS; no data leaves Zoho infrastructure |
| Data at rest | Stored in Zoho CRM Custom Tabs; subject to Zoho's platform encryption |
| **Download prevention** | No export endpoint exposed. Frontend has no download button. `Blob` / `URL.createObjectURL` never called. Backend returns JSON only — no file stream. |
| **Copy prevention** | `user-select: none` on result table. `contextmenu` and `copy` events are intercepted and cancelled in the widget JS. |
| **Preset access (platform level)** | `Saved_Report_Settings` custom tab configured with Zoho CRM Sharing Rules = **Private**. Platform enforces that only the Owner can view or edit the record. Shared access granted explicitly by the Owner. |
| PII fields | Report results may contain PII (names, emails) from CRM records — display only, never persisted to browser storage |

### Threat Model

| Threat | Mitigation |
|---|---|
| User queries a module not in the admin whitelist | Deluge validates every requested module API name against `Report_Target_Modules` before executing COQL. Query is rejected if any module is absent. |
| User crafts a malicious COQL string via the frontend payload | Deluge builds the COQL programmatically from validated field/module names — no raw user-supplied COQL string is ever executed. |
| User copies report data via browser clipboard (Ctrl+C) | `copy` event listener calls `event.preventDefault()`. `user-select: none` prevents drag-selection. Right-click context menu is suppressed. |
| Unauthorized user accesses another user's saved preset | `Saved_Report_Settings` tab is set to Sharing Rules = Private in Zoho CRM (platform-level enforcement). Deluge additionally filters by `Owner = current user` OR in shared access list as a defense-in-depth check. |
| COQL credit exhaustion (DoS by heavy querying) | Pagination capped at 2,000 rows per call. Deluge enforces a maximum of 3 JOIN modules per query. Frontend disables the Run button during active execution. |
| Shared report accessed by user outside the org | Zoho platform enforces org-level authentication. Share list stores Zoho User IDs; Deluge verifies current user ID is in the share list before returning results. |

---

## 8. Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18+ (Vite), MUI v5 | Zoho Widget platform requirement; component-based UI for dynamic field selection |
| Backend | Deluge (Zoho CRM Functions) | Only server-side execution environment available inside Zoho CRM PaaS |
| Data Query | Zoho COQL | Native CRM query language; only supported structured query method for multi-module JOINs |
| Data Storage | Zoho CRM Custom Tabs | No external DB available; custom tabs provide persistent structured storage within the platform |
| Styling | MUI v5 + CSS | Consistent look-and-feel within Zoho CRM widget iframe |

---

## 9. Key Technical Decisions

- **No external backend**: The system is fully contained within the Zoho CRM platform. This avoids additional infrastructure costs and auth complexity but limits query performance control to COQL constraints.
- **Admin-whitelist model**: Rather than allowing free-form COQL, all queryable modules and fields are pre-approved by an admin. This prevents data exposure and simplifies COQL injection defense.
- **COQL dot notation for Lookup fields**: Related module fields are accessed via COQL dot notation (e.g., `SELECT Account_Name.Account_Name FROM Leads`) instead of explicit JOIN ON clauses. This is simpler to build dynamically and aligns with Zoho's recommended COQL pattern for Lookup traversal.
- **`zoho.crm.coql` as sole query API**: All data retrieval uses `zoho.crm.coql` (max 2,000 records per call) instead of standard search APIs. This conserves API credits and eliminates N+1 fetch patterns.
- **React State caching + on-demand execution**: Fetched results are stored in React State. Backend is only called when the user explicitly clicks "Generate Report." UI interactions (sort, scroll) operate on cached data, eliminating redundant API calls.
- **JSON preset storage**: Report conditions are stored as a serialized JSON blob in `Config_JSON`. This allows flexible schema evolution without custom tab field changes, at the cost of losing server-side filter/search on condition internals.
- **Platform-level private sharing for presets**: `Saved_Report_Settings` is configured as Private in Zoho CRM Sharing Rules. This provides system-level access control independent of application logic, with Deluge performing an additional application-level check for shared access.
- **No file download by design**: Download capability is deliberately excluded as a security requirement. Any future export requirement must go through a separate approval-gated flow.

---

## 10. Scalability & Performance

| Metric | Current Estimate | Breaks At |
|---|---|---|
| Concurrent widget users | ~20–50 | Zoho Functions concurrent execution limit (~100); not a near-term concern |
| Records per report query | Up to 2,000 per page | COQL hard limit of 2,000 per request; multi-page fetch required for larger datasets |
| JOIN modules per query | Up to 3 | Performance degrades significantly beyond 3-way JOIN in COQL on large modules |
| Saved presets per user | Unlimited (CRM tab records) | No functional limit; UI should paginate preset list above 50 presets |
| Zoho API credit consumption | ~1–5 credits per COQL call | Zoho enforces a daily API call credit limit per org; heavy use may approach limits |

### COQL JOIN Performance Considerations

- **Index-backed lookups**: JOIN conditions in COQL must reference Lookup-type fields (which are indexed by Zoho). Joining on plain text fields (e.g., matching by name string) is not supported and will be blocked at the field whitelist level (`Data_Type` must be `Lookup` for join keys).
- **Large module joins**: Modules with > 100,000 records (e.g., `Leads`) will exhibit slower join performance. Enforce at least one WHERE filter clause on an indexed field (e.g., date range, owner) before executing a cross-module join.
- **Pagination over full scans**: Never fetch all records in a single query. Always apply `LIMIT 2000 OFFSET N` pagination. The UI must warn users if the total result set is paginated.
- **Credit budget**: Each COQL call consumes Zoho API credits. Multi-page fetches consume one credit per page. The system must display the page count to users and require explicit user action to fetch the next page (no auto-load-all).

---

## 11. Open Questions & Risks

| # | Question / Risk | Owner | Resolution Date |
|---|---|---|---|
| 1 | What is the exact Zoho API credit limit for this org? Daily cap must be confirmed to set safe COQL usage guardrails. | Admin | — |
| 2 | Does Zoho COQL support LEFT JOIN or only INNER JOIN? This affects null-record handling in multi-module reports. | Dev | — |
| 3 | How many users are expected to share a single preset? If fan-out is large, storing user IDs as a JSON list in a single field may need a dedicated join table instead. | Dev | — |
| 4 | Are there any PII compliance requirements (GDPR / personal data handling) for the report output displayed in-widget? | Legal/Admin | — |

---

## 12. HLD Review Checklist

- [x] C4 L1 context diagram present and reviewed
- [x] C4 L2 container diagram present and reviewed
- [x] All external integrations listed with auth method
- [x] Security boundary drawn — auth and encryption points identified
- [x] Threat model has at least 3 scenarios with mitigations
- [x] Technology choices justified (not just listed)
- [x] Scalability estimate provided — current load and first bottleneck named
- [x] All Non-Goals explicitly listed
- [ ] At least one reviewer has signed off before LLD starts
- [ ] ADR written for every contested or non-obvious decision
