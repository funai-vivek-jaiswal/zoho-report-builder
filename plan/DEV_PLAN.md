# Development Plan: Zoho CRM Custom Report Widget

**Project:** CRM Custom Report
**Design References:** `HLD_custom_report.md` / `LLD_custom_report.md`
**Date:** 2026-06-04

---

## Team & Capacity

| Role | Label | Daily Capacity |
|---|---|---|
| Team Lead | **Lead** | 3–4 hrs/day (review, integration, deployment) |
| Developer A — Backend | **Dev-A** | 3–4 hrs/day (Deluge functions) |
| Developer B — Frontend | **Dev-B** | 3–4 hrs/day (React widget) |

---

## Timeline Overview

| Phase | Dev-A | Dev-B | Lead | Calendar Days |
|---|---|---|---|---|
| Phase 0: Setup | 1 day | 1 day | 1 day | 2 days (all parallel) |
| Phase 1: Backend Functions | 7 days | — | 0.5 day (review) | 7 days |
| Phase 2: Frontend Widget | — | 8 days | 0.5 day (review) | 8 days (parallel with Phase 1) |
| Phase 3: Integration & Testing | 1 day | 2 days | — | 2 days (all parallel) |
| Phase 4: Security & Deployment | — | 0.5 day | 2 days | 2 days |
| **Total** | **~9 days** | **~11.5 days** | **~4 days** | **~16 working days (~3.5 weeks at 3–4 hrs/day)** |

> Phase 1 (backend) and Phase 2 (frontend) run in parallel. Dev-B uses stub/mock function responses while Dev-A builds the real Deluge functions.

---

## Phase 0: Project Setup (Days 1–2)

### Task 0-1 — Zoho CRM Environment & Custom Tab Setup
**Assignee:** Lead
**Effort:** 3.5 hrs (1 day)
**Dependencies:** None

**Description for Zoho Projects:**
Set up the Zoho CRM org environment required for the Custom Report Widget project.

Work items:
- Create the `Report_Target_Modules` custom tab with fields: `Name` (Single Line), `Module_API_Name` (Single Line). Mark `Module_API_Name` as unique.
- Create the `Report_Target_Fields` custom tab with fields: `Name` (Single Line), `Field_API_Name` (Single Line), `Target_Module` (Lookup → `Report_Target_Modules`), `Data_Type` (Picklist: Text / Number / Date / PickList / Lookup), `Is_Aggregatable` (Checkbox), `Is_Groupable` (Checkbox), `Is_Join_Key` (Checkbox).
- Create the `Saved_Report_Settings` custom tab with fields: `Name` (Single Line), `Target_Module` (Single Line), `Config_JSON` (Multi-Line), `Owner` (Lookup → Zoho User), `Shared_With_Users` (Multi-Line), `Is_Shared` (Checkbox).
- **Critical:** Configure `Saved_Report_Settings` Sharing Rules = **Private** in CRM Settings → Security Control → Sharing Rules.
- Register the widget in Zoho CRM Widget Sandbox / Developer console as a placeholder.
- Populate 2–3 sample rows in `Report_Target_Modules` and `Report_Target_Fields` for Dev-A and Dev-B sandbox testing.

**Definition of Done:** All 3 custom tabs exist with correct field types. `Saved_Report_Settings` Sharing Rules = Private confirmed. Widget placeholder loads in CRM sandbox without errors.

---

### Task 0-2 — Frontend Project Scaffold
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** None (can start same day as 0-1)

**Description for Zoho Projects:**
Initialize the React widget project with required dependencies and folder structure.

Work items:
- Initialize Vite + React 18 project under `zoho-crm-report-widget/app/`.
- Install dependencies: `@mui/material`, `@emotion/react`, `@emotion/styled`, Zoho CRM Widget SDK.
- Configure Zoho SDK initialization: `ZOHO.embeddedApp.on("PageLoad", callback)`.
- Create a shared utility `zohoFunctions.js` that wraps `ZOHO.CRM.FUNCTIONS.execute(functionName, {arguments: payload})` with loading state and error handling.
- Create the full directory structure per LLD Section 10: `src/components/` with placeholder `.jsx` files for all 8 components.
- Verify `npm run dev` loads the widget in the CRM sandbox without errors.

**Definition of Done:** `npm run dev` launches widget. ZOHO SDK `PageLoad` event fires. `zohoFunctions.js` wrapper calls a stub function and returns a mocked response without errors.

---

### Task 0-3 — Deluge Development Environment Setup
**Assignee:** Dev-A
**Effort:** 3.5 hrs (1 day)
**Dependencies:** None (can start same day as 0-1)

**Description for Zoho Projects:**
Set up the Zoho CRM Functions workspace and verify Deluge sandbox connectivity.

Work items:
- Create all 4 Deluge function stubs in the Zoho CRM Functions console: `get_my_report_settings`, `save_user_report_setting`, `share_report_setting`, `execute_custom_report`.
- In each stub, verify `zoho.loginuser` returns a valid user map (at minimum: `{"id": "...", "name": "..."}` or equivalent).
- Write a test snippet that runs a basic `zoho.crm.coql` query against `Leads` module and confirms data returns.
- Create the corresponding `.dg` placeholder files in `zoho-crm-report-widget/deluge/` in the Git repo.
- Confirm function invocation via `ZOHO.CRM.FUNCTIONS.execute()` from the frontend scaffold works end-to-end (stub response).

**Definition of Done:** All 4 Deluge function stubs exist and are invocable. `zoho.loginuser` returns a valid user ID in sandbox context. Test `zoho.crm.coql` call returns rows successfully.

---

## Phase 1: Backend — Deluge Functions (Days 3–9, Dev-A)

### Task 1-1 — get_my_report_settings.dg
**Assignee:** Dev-A
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 0-3 (Deluge env), Task 0-1 (`Saved_Report_Settings` tab exists)

**Description for Zoho Projects:**
Implement the `get_my_report_settings` Deluge function. This function is called when the widget loads to populate the user's preset list.

Logic to implement (per LLD Section 3):
1. Identify the current user: `current_user = zoho.loginuser;` → extract `current_user.get("id")`.
2. Search `Saved_Report_Settings` where `Owner = current_user_id` to get owned presets.
3. Search `Saved_Report_Settings` where `Shared_With_Users` contains `current_user_id` (string-contains search) to get shared presets.
4. Merge the two result lists; deduplicate by record ID (a user cannot own and share the same record simultaneously).
5. For each record, set `is_owner: true/false` based on whether Owner matches current user.
6. Return `{"status": "success", "presets": [...]}`.
7. Return `{"status": "error", "code": "AUTH_FAILED"}` if user context unavailable.
8. Return `{"status": "error", "code": "FETCH_FAILED"}` if CRM search fails.

**Definition of Done:** Function returns owned presets for the owner. Function returns shared presets for a recipient. Non-owner, non-shared presets are not returned. Error codes fire for invalid states.

---

### Task 1-2 — save_user_report_setting.dg
**Assignee:** Dev-A
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 1-1 (zoho.loginuser pattern established)

**Description for Zoho Projects:**
Implement the `save_user_report_setting` Deluge function. Handles both new preset creation and overwriting an existing preset.

Input payload: `{"preset_id": "existing_id_or_null", "name": "Report Name", "config_json": "{...}"}`.

Logic to implement (per LLD Section 3):
1. Get `current_user_id` from `zoho.loginuser`.
2. Validate that `config_json` parses as valid JSON. Return `INVALID_JSON` if not.
3. If `preset_id` is non-null/non-empty: fetch the existing record from `Saved_Report_Settings`. If the record `Owner` does not match `current_user_id`, return `{"status": "error", "code": "FORBIDDEN"}`.
4. If `preset_id` is null: create a new record in `Saved_Report_Settings` with Owner set to `current_user_id`.
5. If `preset_id` is valid and owner matches: update the existing record (overwrite `Name` and `Config_JSON`).
6. Return `{"status": "success", "preset_id": "saved_record_id"}`.
7. Return `{"status": "error", "code": "SAVE_FAILED"}` if the CRM insert/update call fails.

**Definition of Done:** New preset creation works and sets Owner correctly. Overwrite works for own presets. FORBIDDEN returned when a different user's preset ID is provided. INVALID_JSON returned for malformed JSON input.

---

### Task 1-3 — share_report_setting.dg
**Assignee:** Dev-A
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 1-2 (ownership pattern established)

**Description for Zoho Projects:**
Implement the `share_report_setting` Deluge function. Grants read access to a preset for one or more users in the same Zoho org.

Input payload: `{"preset_id": "record_id", "share_with_user_ids": ["user_id_1", "user_id_2"]}`.

Logic to implement (per LLD Section 3):
1. Get `current_user_id` from `zoho.loginuser`.
2. Fetch the preset record from `Saved_Report_Settings`. If Owner ≠ `current_user_id`, return `{"status": "error", "code": "FORBIDDEN"}`.
3. For each user ID in `share_with_user_ids`: validate the user exists in the same org via `zoho.crm.searchRecords("users", "id", "=", user_id)`. Return `{"status": "error", "code": "USER_NOT_FOUND", "user_id": "..."}` if any user is not found.
4. Parse the existing `Shared_With_Users` JSON array from the record (default to `[]` if empty).
5. Merge the new user IDs into the existing list; deduplicate.
6. Update the record: write the merged JSON array to `Shared_With_Users` and set `Is_Shared = true`.
7. Return `{"status": "success", "shared_with": [...full updated list...]}`.
8. Return `{"status": "error", "code": "UPDATE_FAILED"}` if the CRM update fails.

**Definition of Done:** Shared preset visible in recipient's preset list. User from another org (invalid ID) returns USER_NOT_FOUND. Non-owner attempt returns FORBIDDEN. Deduplication works if same user added twice.

---

### Task 1-4 — COQL Validation Engine (for execute_custom_report)
**Assignee:** Dev-A
**Effort:** 5 hrs (1.5 days)
**Dependencies:** Task 0-1 (`Report_Target_Modules` and `Report_Target_Fields` tabs exist with sample data)

**Description for Zoho Projects:**
Build the validation phase for the `execute_custom_report` function. This runs before any COQL query is built and rejects invalid or unauthorized configurations.

Validation steps to implement (per LLD Section 4.1):
1. Parse `config_json` string into a map/object. Return `INVALID_JSON` if parse fails.
2. Assert `primary_module` exists in `Report_Target_Modules` (search by `Module_API_Name`). Return `WHITELIST_VIOLATION` with the module name if not found.
3. For each field in `select_fields`, `filters`, `aggregations`, and `group_by`:
   - If `is_lookup == true`: split the field value on `.` to get `lookup_part` and `target_part`. Assert `lookup_part` exists in `Report_Target_Fields` where `Target_Module = primary_module` AND `Is_Join_Key = true`. Return `WHITELIST_VIOLATION` if not found.
   - If `is_lookup == false` or absent: assert the field exists in `Report_Target_Fields` where `Target_Module = primary_module`. Return `WHITELIST_VIOLATION` if not found.
4. Count unique `lookup_part` values across all `is_lookup: true` fields. If count > 3, return `JOIN_LIMIT_EXCEEDED`.
5. Assert `page_size` ≤ 200. If not, cap to 200 (do not error — silently enforce).
6. Check the primary module's record count (via a count COQL or known value). If > 50,000 records and no `filters` provided, return `NO_FILTER_ON_LARGE_MODULE`.

Return a structured validation result: `{"valid": true}` or `{"valid": false, "code": "...", "detail": "..."}`.

This validation logic should be a reusable sub-routine (Deluge function or inline map-based logic) called at the top of `execute_custom_report`.

**Definition of Done:** All validation test cases from LLD Section 11 (Unit Tests) pass: whitelist violation, JOIN limit exceeded, dot notation on non-Lookup field blocked, page_size cap. Validation runs in < 1 second with sample data.

---

### Task 1-5 — execute_custom_report.dg — COQL Builder & Executor
**Assignee:** Dev-A
**Effort:** 7 hrs (2 days)
**Dependencies:** Task 1-4 (validation engine complete)

**Description for Zoho Projects:**
Implement the main COQL query builder and executor inside `execute_custom_report`. This function is the core of the report engine.

Input payload: `{"config_json": "{...}", "page": 1, "page_size": 200}`.

Logic to implement (per LLD Sections 4.1–4.4):
1. Call the validation engine (Task 1-4). If invalid, return the error immediately.
2. **Build SELECT clause:** Iterate `select_fields`. For `is_lookup: true` fields, use the full dot notation string (e.g., `Account_Name.Account_Name`). For standard fields, use the field API name. Concatenate into `SELECT field1, field2, ...`.
3. **Build FROM clause:** Use `primary_module` value directly: `FROM Leads`.
4. **Build WHERE clause:** Iterate `filters` array. For each filter: `{field} {operator} '{value}'`. Join multiple filters with `AND`. Wrap string values in single quotes; numeric values without quotes.
5. **Build GROUP BY clause (if aggregations present):** Iterate `group_by`. Handle `is_lookup: true` fields with dot notation. Validate that all non-aggregate `select_fields` appear in `group_by` — return `COQL_ERROR` if not.
6. **Build aggregation expressions:** Replace aggregated fields in SELECT with `{function}({field}) AS {alias}` (e.g., `SUM(Annual_Revenue) AS Total_Revenue`).
7. **Build LIMIT/OFFSET:** `LIMIT {page_size} OFFSET {(page - 1) * page_size}`.
8. Concatenate final COQL string. Execute via `zoho.crm.coql(coql_string)`.
9. If execution fails, return `{"status": "error", "code": "COQL_ERROR", "detail": error_message}`.
10. Determine `has_more`: if result row count == page_size, assume more pages exist.
11. Return: `{"status": "success", "data": [...], "page": N, "page_size": N, "has_more": true/false, "credits_used_estimate": 1}`.

Reference examples from LLD Section 4.2 and 4.3 for the exact COQL syntax to generate.

**Definition of Done:** Single-module query returns correct rows. Dot notation JOIN query (e.g., `Account_Name.Account_Name`) returns related record fields. Aggregate query with GROUP BY returns aggregated rows. Error codes fire correctly for COQL failures. Pagination OFFSET works correctly across pages.

---

### Task 1-6 — Backend Code Review
**Assignee:** Lead
**Effort:** 2 hrs (0.5 day)
**Dependencies:** Tasks 1-1 through 1-5 complete

**Description for Zoho Projects:**
Lead review of all 4 Deluge functions before integration with the frontend.

Review checklist (per LLD Section 9 Security Implementation):
- `zoho.loginuser` is used in every function (not `zoho.crm.getUser("me")`).
- Owner equality check is performed before any write or share operation.
- COQL string is built entirely from validated, whitelisted identifiers — no raw user-supplied strings concatenated directly.
- No function accepts a `format=csv` or download-like parameter.
- Error codes match the LLD-specified codes for each function.
- All 9 unit test cases from LLD Section 11 are verified to pass.

**Definition of Done:** All review comments resolved. Backend functions approved for integration. LLD Section 11 unit test results documented.

---

## Phase 2: Frontend — React Widget (Days 3–10, Dev-B)

> Dev-B works in parallel with Phase 1. Use stub/mocked Deluge function responses until backend is ready.

---

### Task 2-1 — App Root, SDK Integration & State Architecture
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 0-2 (frontend scaffold exists)

**Description for Zoho Projects:**
Implement the root `App.jsx` with ZOHO SDK initialization, global React State structure, and the on-demand execution control logic.

Work items:
- Initialize ZOHO SDK: `ZOHO.embeddedApp.on("PageLoad", ...)` in `index.js`. On load, call `get_my_report_settings` to populate the preset list.
- Define top-level React State in `App.jsx`:
  - `reportConfig` (object): currently selected modules, fields, filters, aggregations. Updated on any UI change. No backend call on change.
  - `reportData` (array): cached results from last `execute_custom_report` call. Null until first run.
  - `presets` (array): loaded from `get_my_report_settings` on widget load.
  - `isStale` (boolean): set to `true` whenever `reportConfig` changes after a successful run. Cleared when "Generate Report" is clicked.
  - `isLoading` (boolean): active while any Deluge call is in progress.
  - `error` (string/null): last error message to display.
- Implement "Generate Report" button handler: clear `reportData`, set `isStale = false`, call `execute_custom_report`, store result in `reportData`.
- Show "Results may be outdated — click Generate to refresh" banner when `isStale === true`.
- Wire `zohoFunctions.js` wrapper into App state for loading/error management.

**Definition of Done:** Widget loads, SDK initializes, presets populate. Changing any config field sets `isStale = true` without triggering a backend call (verify via browser network tab — zero Deluge calls on config change). Clicking "Generate Report" triggers exactly one backend call.

---

### Task 2-2 — ModuleSelector.jsx
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 2-1 (state architecture exists)

**Description for Zoho Projects:**
Build the module selection component that allows users to pick the primary report module and up to 2 additional JOIN modules from the admin-whitelisted list.

Work items:
- On widget load (after SDK `PageLoad`), fetch `Report_Target_Modules` via a Deluge call or CRM SDK search. Populate dropdown options.
- Render a primary module dropdown (required, single-select).
- Render up to 2 additional "JOIN module" dropdowns (optional). Each additional module selection adds a slot; user can remove slots.
- Enforce maximum 3 total modules (1 primary + 2 JOIN) in UI: disable "Add JOIN Module" button when 3 modules are selected. Show tooltip: "Maximum 3 modules per report."
- On any module change: update `reportConfig.primary_module` in state, clear `select_fields` (since fields depend on module selection). Do NOT call any backend function.

**Definition of Done:** Module list matches `Report_Target_Modules` data. Max 3 modules enforced with visible UI feedback. Module change clears field selection. Zero backend calls on module change (verified via network tab).

---

### Task 2-3 — FieldPicker.jsx
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 2-2 (module selection drives field list)

**Description for Zoho Projects:**
Build the field selection component. Shows available fields for selected modules, supports multi-select with ordering, and displays type badges.

Work items:
- When modules change in state, fetch `Report_Target_Fields` filtered by selected module API names. Display as a selectable list.
- Show each field with a type badge: `Text`, `Number`, `Date`, `PickList`, `Lookup`.
- For fields with `Is_Join_Key = true` and `Data_Type = Lookup`: display the dot notation preview label (e.g., `Account_Name.Account_Name`) so users understand what they're selecting.
- Allow multi-selection. Preserve display order (ordered list — user can drag to reorder or use up/down arrows).
- Update `reportConfig.select_fields` in state as an ordered array of `{field, is_lookup}` objects matching the `Config_JSON` schema (see LLD Section 2).
- Enforce: `Is_Aggregatable` and `Is_Groupable` are mutually exclusive for a given field in a single query — add a visual indicator and prevent conflicting selection.
- No backend call on field selection change.

**Definition of Done:** Fields display with correct type badges. Lookup fields show dot notation label. Selected fields update `reportConfig.select_fields` in correct schema format. Order preserved. Mutual exclusivity enforced visually.

---

### Task 2-4 — FilterBuilder.jsx
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 2-3 (field list available for filter field picker)

**Description for Zoho Projects:**
Build the dynamic filter condition builder (WHERE clause UI). Users add filter rows to constrain the report results.

Work items:
- Render a list of filter rows, each with: field picker (from selected fields), operator dropdown, value input.
- Operator options vary by `Data_Type`:
  - `Text`: `=`, `!=`, `contains`, `starts with`
  - `Number`: `=`, `!=`, `>`, `<`, `>=`, `<=`
  - `Date`: `=`, `before`, `after`, `between` (between shows two date inputs)
  - `PickList`: `=`, `!=`
- Add/remove filter rows with "+" and "×" buttons.
- Update `reportConfig.filters` in state as an array of `{field, operator, value}` objects.
- No backend call on filter change.
- Validate: at minimum, show a warning banner if the primary module has a large record count (> 50,000) and no filter is set. (The backend will reject it, but pre-warn in UI.)

**Definition of Done:** All operator types render correctly per Data_Type. Multiple filters add correctly. Filter conditions update state. Warning banner shows for large modules with no filter. Zero backend calls on filter change.

---

### Task 2-5 — AggregationPanel.jsx
**Assignee:** Dev-B
**Effort:** 2 hrs (0.5 day)
**Dependencies:** Task 2-3 (field list with Is_Aggregatable / Is_Groupable flags)

**Description for Zoho Projects:**
Build the aggregation and GROUP BY configuration panel.

Work items:
- Render an aggregation section: function picker (SUM, AVG, COUNT, MAX, MIN) and field picker. Only fields with `Is_Aggregatable = true` appear in the field picker.
- Render a GROUP BY section: field picker. Only fields with `Is_Groupable = true` appear.
- Allow multiple aggregation rows (e.g., SUM of Revenue + COUNT of records).
- Update `reportConfig.aggregations` and `reportConfig.group_by` in state.
- When aggregations are added, show a note: "All non-aggregated selected fields must also be in GROUP BY."
- No backend call on aggregation change.

**Definition of Done:** Only eligible fields shown per type. State updated correctly. No backend calls on change.

---

### Task 2-6 — ResultTable.jsx + Copy Prevention
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 2-1 (`reportData` state exists)

**Description for Zoho Projects:**
Build the read-only result table with full copy and download prevention controls.

Work items:
- Render `reportData` as a MUI Table. Column headers derived from `select_fields` (use field API name or alias if aggregated).
- Apply copy prevention CSS (per LLD Section 6.1):
  ```css
  .report-result-table { user-select: none; -webkit-user-select: none; -moz-user-select: none; }
  ```
- Attach JavaScript event interceptors at the widget root level (per LLD Section 6.1):
  - `document.addEventListener('contextmenu', e => e.preventDefault())`
  - `document.addEventListener('copy', e => e.preventDefault())`
  - `document.addEventListener('cut', e => e.preventDefault())`
- Attach keydown interceptor on the result table `ref`: block `Ctrl+C` / `Cmd+C`.
- Support client-side column sort: clicking a column header sorts `reportData` in state — no backend call.
- Show credit warning banner if `credits_used_estimate` from the last response exceeds a configurable threshold (e.g., > 80% of known daily limit).
- Show "No results" state when `reportData` is an empty array.
- Show loading skeleton while `isLoading = true`.

**Definition of Done:** Table renders results correctly. Right-click context menu is blocked. Ctrl+C / Cmd+C produces no clipboard content inside the table. Column sort works without triggering a backend call. Loading and empty states display correctly.

---

### Task 2-7 — PaginationBar.jsx
**Assignee:** Dev-B
**Effort:** 2 hrs (0.5 day)
**Dependencies:** Task 2-6 (`reportData` and `has_more` state)

**Description for Zoho Projects:**
Build the pagination control bar for multi-page reports.

Work items:
- Display current page number: "Page N".
- Display "Load Next Page" button. Show only when `has_more = true` from the last response.
- On click: increment `reportConfig.page` by 1, call `execute_custom_report` with the new page number, append results to `reportData` (or replace — decide with team: append for scroll UX vs. replace for clarity).
- Disable "Load Next Page" button during active execution (`isLoading = true`).
- No auto-pagination on any trigger other than explicit button click.

**Definition of Done:** Next page loads only on explicit button click. Button disabled during load. No auto-load-all behavior.

---

### Task 2-8 — PresetList.jsx + SaveDialog.jsx
**Assignee:** Dev-B
**Effort:** 5 hrs (1.5 days)
**Dependencies:** Task 2-1 (presets state), backend Task 1-1, 1-2, 1-3 or stubs

**Description for Zoho Projects:**
Build the preset list panel and the save/share modal dialog.

**PresetList.jsx:**
- Display the user's presets (loaded in `App.jsx` on widget init via `get_my_report_settings`).
- Show a label or badge for shared presets: "Shared with you" vs. own presets.
- On clicking a preset: deserialize its `Config_JSON` and populate `reportConfig` state (all builder fields reset to the saved values). Set `isStale = false`. Do NOT auto-run the report.
- Allow owned presets to be deleted (call a delete endpoint or CRM SDK direct delete). Confirmation prompt required.

**SaveDialog.jsx (Modal):**
- Open on "Save" button click from the main UI.
- Text input for preset name. Pre-fill if overwriting an existing preset.
- If the entered name matches an existing own preset name: show "Overwrite existing preset?" confirmation.
- On confirm save: call `save_user_report_setting` with current `reportConfig` serialized as `config_json`.
- On success: close dialog, refresh preset list.
- **Share section (within SaveDialog or a separate Share button):** After saving, show "Share with org users" section. User search input (search Zoho org users by name). Checkbox selection of target users. On confirm: call `share_report_setting`. Show success/failure feedback.

**Definition of Done:** Presets load on widget open. Clicking a preset populates all builder fields from saved config. Save creates/overwrites correctly. Share grants access to the selected user (verified by logging in as that user and checking their preset list).

---

### Task 2-9 — Frontend Code Review
**Assignee:** Lead
**Effort:** 2 hrs (0.5 day)
**Dependencies:** Tasks 2-1 through 2-8 complete

**Description for Zoho Projects:**
Lead review of the React widget before integration testing.

Review checklist:
- Copy prevention: right-click, Ctrl+C, drag-select all blocked on result table. Verify in browser (Chrome + Firefox).
- On-demand execution: open browser Network tab, change module/field/filter — confirm zero network calls. Click "Generate Report" — confirm exactly one call fires.
- Lookup dot notation: select a Lookup field and run — confirm `is_lookup: true` in the payload sent to backend.
- Cache invalidation: run report, change a filter, confirm "Results may be outdated" banner appears. Click Generate — banner disappears.
- No `Blob`, no `URL.createObjectURL`, no `<a download>` element anywhere in source.
- State shape matches `Config_JSON` schema in LLD Section 2.

**Definition of Done:** All checklist items pass. All review comments resolved.

---

## Phase 3: Integration & Testing (Days 11–12)

### Task 3-1 — End-to-End Integration
**Assignee:** Dev-A + Dev-B
**Effort:** 3.5 hrs each (1 day)
**Dependencies:** Phases 1 and 2 complete

**Description for Zoho Projects:**
Connect the React frontend to the live Deluge functions in the Zoho CRM sandbox and run all 3 sequence diagram flows end-to-end.

Work items (run all 3 flows from LLD Section 5):
- **Flow 1 — Execute Multi-Module Report:** Select modules + fields (including 1 Lookup/dot notation field) → set 1 filter → click "Generate Report" → verify results render in the table.
- **Flow 2 — Save and Share a Preset:** Save the current config as a preset → share with a second sandbox user → log in as that user → verify the preset appears in their preset list.
- **Flow 3 — Load Shared Preset and Re-run:** As the recipient user → open widget → load the shared preset → click "Generate Report" → verify results render.
- Fix integration issues: payload format mismatches, SDK context issues, COQL field name mismatches with sandbox data.
- Document any backend API changes needed and implement fixes in coordination.

**Definition of Done:** All 3 flows complete without errors in CRM sandbox. No WHITELIST_VIOLATION errors from the test data. Shared preset visible and runnable by the recipient user.

---

### Task 3-2 — Frontend Integration Tests
**Assignee:** Dev-B
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 3-1 (integration established)

**Description for Zoho Projects:**
Run all integration test cases from LLD Section 11 that involve the frontend.

Test cases to execute:
1. Config change (module/field/filter change) does NOT trigger a backend call — verify via browser network tab. Zero calls expected.
2. Clicking "Generate Report" triggers exactly one `execute_custom_report` call — fresh data returned (not stale cache).
3. Copy attempt on result table (Ctrl+C, right-click, drag-select) — verify clipboard receives no content.
4. Large module (> 50,000 records) query submitted without any filter — verify frontend shows error or warning (backend returns `NO_FILTER_ON_LARGE_MODULE`).
5. Lookup field (dot notation) selected and run — verify `is_lookup: true` in request payload, result column displays the related record value correctly.
6. No download link present anywhere in the widget — inspect DOM for `<a download>`, `Blob`, `createObjectURL` — none should exist.

Document pass/fail result for each test case.

**Definition of Done:** All 6 test cases pass. Results documented and signed off by Lead.

---

### Task 3-3 — Backend Unit Tests
**Assignee:** Dev-A
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Task 3-1 (live Deluge functions in sandbox)

**Description for Zoho Projects:**
Execute all unit test cases from LLD Section 11 against the live Deluge functions in the Zoho CRM sandbox. Document pass/fail for each.

Test cases to run (per LLD Section 11):
1. Valid single-module query with a dot notation Lookup field → executes without error, returns rows.
2. Valid query with 3 Lookup traversals → executes without error.
3. Request with 4 Lookup traversals → returns `JOIN_LIMIT_EXCEEDED`.
4. Dot notation field referencing a non-Lookup field → returns `WHITELIST_VIOLATION`.
5. Request with a module not in `Report_Target_Modules` → returns `WHITELIST_VIOLATION`.
6. Save attempt by non-owner (wrong `preset_id`) → returns `FORBIDDEN`.
7. Share with a user ID not in the org → returns `USER_NOT_FOUND`.
8. Shared preset appears in recipient's `get_my_report_settings` result.
9. Owned preset NOT visible in non-owner non-share user's `get_my_report_settings` result.

Fix any failures found. Re-test until all 9 pass.

**Definition of Done:** All 9 unit test cases pass. Test results documented in a simple pass/fail table and shared with Lead.

---

## Phase 4: Security Review & Deployment (Days 13–14)

### Task 4-1 — Security Review
**Assignee:** Lead
**Effort:** 3.5 hrs (1 day)
**Dependencies:** Phases 1–3 complete

**Description for Zoho Projects:**
Perform a final security review against LLD Section 9 (Security Implementation) before production deployment.

Security checklist:
- [ ] `Saved_Report_Settings` tab has Sharing Rules = **Private** confirmed in production CRM org settings.
- [ ] `zoho.loginuser` used in all 4 Deluge functions (not `zoho.crm.getUser("me")`).
- [ ] COQL string is built from validated whitelist identifiers only — no raw user strings in COQL.
- [ ] No Deluge function accepts a `format=csv` or download parameter.
- [ ] Frontend source code: no `Blob`, no `URL.createObjectURL`, no `<a download>` element.
- [ ] `contextmenu`, `copy`, `cut` event interceptors active in production build.
- [ ] `user-select: none` CSS applied on result table in production build.
- [ ] Cross-org share blocked: user ID validation uses `zoho.crm.searchRecords("users")` (same org only).
- [ ] Owner check performed before every write (`save_user_report_setting`) and before every share mutation (`share_report_setting`).

Document any finding. Resolve critical findings before deployment proceeds.

**Definition of Done:** All checklist items verified. No critical security findings open. Security review signed off.

---

### Task 4-2 — Widget Build & Production Deployment
**Assignee:** Lead + Dev-B
**Effort:** 2 hrs (0.5 day)
**Dependencies:** Task 4-1 (security review signed off)

**Description for Zoho Projects:**
Build the React widget for production and deploy all components to the Zoho CRM production org.

Work items:
- Run `npm run build` in `zoho-crm-report-widget/app/`. Verify `dist/` output is clean (no errors, no TypeScript or lint failures).
- Package the widget per Zoho CRM widget deployment process (zip the dist + widget manifest).
- Deploy the widget to the production CRM org via the Zoho CRM Widget console.
- Register and activate all 4 Deluge functions in the production CRM org: `get_my_report_settings`, `save_user_report_setting`, `share_report_setting`, `execute_custom_report`.
- Run production smoke test as two different users:
  - User A: Load widget → select module → select field (including 1 Lookup) → set filter → click "Generate Report" → verify results.
  - User A: Save preset → share with User B.
  - User B: Open widget → load shared preset → click "Generate Report" → verify results.
- Verify copy prevention is active in production build (right-click blocked, Ctrl+C blocked).

**Definition of Done:** Widget live in production. All 4 Deluge functions active. Smoke test passes for both User A and User B flows. HLD and LLD review checklists updated with sign-offs.

---

### Task 4-3 — Admin Setup Guide
**Assignee:** Lead
**Effort:** 1.5 hrs (0.5 day)
**Dependencies:** Task 4-2 (production deployment done)

**Description for Zoho Projects:**
Write a short admin operations guide so the Zoho CRM admin can manage the report builder without developer involvement.

Guide should cover:
- How to add a new module to `Report_Target_Modules` (which fields to fill, what `Module_API_Name` must match).
- How to add a field to `Report_Target_Fields` (which `Data_Type` to select, when to set `Is_Join_Key`, `Is_Aggregatable`, `Is_Groupable`).
- Warning: setting `Is_Join_Key = true` on a non-Lookup type field will cause runtime errors — only set for Lookup-type fields.
- How to remove a field from the whitelist (delete the `Report_Target_Fields` record — existing presets that reference it will fail on next run with WHITELIST_VIOLATION).
- Reminder: `Saved_Report_Settings` Sharing Rules must stay = **Private** — do not change this setting.

Deliver as a 1–2 page internal document shared with the admin.

**Definition of Done:** Admin guide written and delivered to the CRM admin. Admin can add a new module + 3 fields without developer support (verified by asking the admin to do it).

---

## Summary Table (for Zoho Projects Epic / Milestone view)

| Task ID | Task Name | Assignee | Effort | Phase |
|---|---|---|---|---|
| 0-1 | Zoho CRM Environment & Custom Tab Setup | Lead | 3.5h | Setup |
| 0-2 | Frontend Project Scaffold | Dev-B | 3.5h | Setup |
| 0-3 | Deluge Development Environment Setup | Dev-A | 3.5h | Setup |
| 1-1 | get_my_report_settings.dg | Dev-A | 3.5h | Backend |
| 1-2 | save_user_report_setting.dg | Dev-A | 3.5h | Backend |
| 1-3 | share_report_setting.dg | Dev-A | 3.5h | Backend |
| 1-4 | COQL Validation Engine | Dev-A | 5h | Backend |
| 1-5 | execute_custom_report.dg — COQL Builder | Dev-A | 7h | Backend |
| 1-6 | Backend Code Review | Lead | 2h | Backend |
| 2-1 | App Root + SDK Integration + State Architecture | Dev-B | 3.5h | Frontend |
| 2-2 | ModuleSelector.jsx | Dev-B | 3.5h | Frontend |
| 2-3 | FieldPicker.jsx | Dev-B | 3.5h | Frontend |
| 2-4 | FilterBuilder.jsx | Dev-B | 3.5h | Frontend |
| 2-5 | AggregationPanel.jsx | Dev-B | 2h | Frontend |
| 2-6 | ResultTable.jsx + Copy Prevention | Dev-B | 3.5h | Frontend |
| 2-7 | PaginationBar.jsx | Dev-B | 2h | Frontend |
| 2-8 | PresetList.jsx + SaveDialog.jsx | Dev-B | 5h | Frontend |
| 2-9 | Frontend Code Review | Lead | 2h | Frontend |
| 3-1 | End-to-End Integration | Dev-A + Dev-B | 3.5h each | Integration |
| 3-2 | Frontend Integration Tests | Dev-B | 3.5h | Integration |
| 3-3 | Backend Unit Tests | Dev-A | 3.5h | Integration |
| 4-1 | Security Review | Lead | 3.5h | Deployment |
| 4-2 | Widget Build & Production Deployment | Lead + Dev-B | 2h | Deployment |
| 4-3 | Admin Setup Guide | Lead | 1.5h | Deployment |
