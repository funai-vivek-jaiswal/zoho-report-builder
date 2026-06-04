# Feasibility Report: Zoho CRM Custom Report Widget

**Date:** 2026-06-04
**Prepared by:** Vivek
**Status:** For Internal Review
**Context:** FunAi Soken — Zoho One / Enterprise, approx. 1,000 user licenses

---

## Executive Summary

The custom report widget was designed to solve a legitimate but narrow problem: allow consultants to run configurable cross-module queries with copy prevention and admin-controlled field access. After reviewing the actual requirement scope, available API credit budget, and native Zoho CRM capabilities, **the custom widget delivers poor return on investment relative to its complexity and running cost.**

Most of the stated requirements can be satisfied today using existing Zoho CRM features with zero development effort. The one requirement that cannot be solved by any technical approach — clipboard copy prevention — cannot be reliably solved by the custom widget either.

**Recommendation: Do not build the custom widget. Use native Zoho CRM features with targeted configuration instead.**

---

## 1. API Credit Situation

| Metric | Value |
|---|---|
| Plan | Enterprise / Zoho One |
| Base daily credits | 50,000 |
| License bonus (1,000 users × 1,000) | 1,000,000 |
| **Total daily limit** | **1,050,000 credits/day** |
| Currently used (avg 70%) | ~735,000 credits/day |
| **Available headroom** | **~315,000 credits/day (30%)** |

### Custom Widget Credit Impact Estimate

Each consultant session with the widget consumes:

| Action | Credits per call |
|---|---|
| Widget load: fetch master data (modules + fields) | 2 credits |
| Widget load: fetch user presets (`get_my_report_settings`) | 1 credit |
| Each report execution (per page of 200 records) | 1 credit |
| Each preset save | 1 credit |

| Usage Scenario | Credits/day | % of Available Headroom | Total Usage After |
|---|---|---|---|
| Light (1,000 users × 6 credits each) | 6,000 | 1.9% | ~70.6% of limit |
| Heavy (1,000 users × 18 credits each) | 18,000 | 5.7% | ~71.7% of limit |
| Peak (1,000 users × 30 credits each) | 30,000 | 9.5% | ~72.9% of limit |

### Credit Risk Assessment

On paper, the widget adds 2–10% to the existing credit load, which appears manageable. However, the real risks are:

1. **The 70% baseline will grow.** As more Zoho integrations are added, the baseline rises. There is no guaranteed ceiling on the existing 70%.
2. **Credit consumption is unpredictable.** If consultants paginate through large datasets or open the widget frequently, consumption multiplies non-linearly.
3. **No circuit breaker.** The custom widget has no mechanism to stop execution if the org approaches the daily credit limit. A single heavy-query day could exhaust the remaining 30%.
4. **Native CRM reports consume zero credits.** Every report run by a consultant in the native CRM reporting tool uses Zoho's internal database — it does not touch the API credit quota at all.

**Verdict: The credit risk is not catastrophic in isolation, but it is unnecessary. Native reports cost nothing.**

---

## 2. Original Requirements vs. Native CRM Capabilities

### 2.1 What CAN be solved with native Zoho CRM today

| Requirement | Native Solution | How |
|---|---|---|
| Cross-module reports (JOIN) | ✅ Fully supported | Native CRM Reports → Summary or Tabular Report → select fields from related modules using standard Zoho join. No COQL needed. |
| Field-level access control (admin controls visible fields) | ✅ Fully supported | **CRM Profiles → Field Permissions** — admin can mark individual fields as Read / Edit / Hidden per profile. Consultants on a restricted profile cannot see hidden fields in reports or anywhere else in CRM. |
| Module-level access control (admin controls visible modules) | ✅ Fully supported | **CRM Profiles → Module Permissions** — hide entire modules from a profile. |
| Saved report presets (favorites) | ✅ Fully supported | Native Reports can be saved with a name and accessed again at any time. Saved reports persist per user. |
| Only the creator can edit a report | ✅ Fully supported | Native Reports have owner-based edit control. Only the creator (or an admin) can modify a saved report. Others with whom it is shared can view and run, but not edit. |
| Share report with other users in same org | ✅ Fully supported | Native Reports → Share → select users, roles, or the entire org. Recipients can run the report but cannot modify it unless explicitly given edit rights. |
| Aggregation (SUM, AVG, COUNT, GROUP BY) | ✅ Fully supported | Native Summary Reports support grouping and aggregate functions natively. |
| Filtering / WHERE conditions | ✅ Fully supported | Native Reports have a full filter/criteria builder. |
| Pagination for large datasets | ✅ Fully supported | Native Reports paginate automatically. Users can scroll through results. |

### 2.2 What CANNOT be solved with native Zoho CRM (and what the widget also cannot solve)

| Requirement | Native CRM | Custom Widget | Reality |
|---|---|---|---|
| **Prevent clipboard copy (Ctrl+C)** | ❌ Cannot prevent | ❌ Cannot reliably prevent | This is a browser-level behaviour. JavaScript event interception (`copy` event) is bypassed by selecting text in the browser address bar, via DevTools, via browser extensions, or by taking a screenshot. **No web application — including a custom widget — can prevent a determined user from copying what is visible on screen.** |
| **Prevent CSV/Excel export** | ✅ Solvable | ✅ Solvable | **CRM Profiles → Data Administration → Export Records → Disable.** This fully blocks the Export button in native reports for that profile. The custom widget never had a download button, so this is equivalent. |
| **Prevent screenshot / browser PDF** | ❌ Not possible | ❌ Not possible | OS-level function. Cannot be blocked by any web application. Both solutions have the same limitation. |
| **Per-report field restriction (field X visible in report A but not report B for the same user)** | ❌ Not supported | ✅ Possible via master tabs | Native CRM field permissions are profile-level, not report-level. If this granularity is required, it is the one area where the custom widget offers something native CRM cannot. |

---

## 3. Gap Analysis: What Is Actually Unsolvable Natively

Only **one** genuine gap exists between native CRM and the custom widget requirements:

> **Per-report field granularity:** The ability to allow a user to see field X in one report but not in another, where both reports are for the same module and the user is on the same profile.

**Is this gap actually needed?**

This should be answered by stakeholders before any development decision. In most consulting use cases, the answer is no — field visibility is role-based (a consultant either can see revenue data or they cannot), not report-based.

If the answer is yes, a lighter alternative exists:
- Create **separate CRM Profiles** for user groups that need different field visibility.
- Assign users to the appropriate profile.
- No custom code required.

---

## 4. Solving the Copy Concern Properly

The discussion about disabling copy was the right instinct. Here is how to approach it:

### Step 1 — Disable Export for the Consultant Profile (Already Possible)

1. Go to **CRM Settings → Users & Control → Profiles**.
2. Select the Consultant profile (or create one if it does not exist).
3. Under **Data Administration**, set **Export Records → Disabled**.
4. This removes the Export button from all reports, list views, and module views for that profile.
5. **Zero development. Zero API credits. Done.**

### Step 2 — Contact Zoho Support for Print/PDF Controls

Ask Zoho support specifically:
- "Can the **Print** option be disabled per profile for Reports?"
- "Can **browser PDF export** via the native print dialog be blocked within the widget iframe context?"

Zoho may have org-level or profile-level controls for this that are not visible in the standard settings UI.

### Step 3 — Accept the Clipboard Copy Limitation with Policy

No technical control on any platform can prevent a user from pressing Ctrl+C or taking a screenshot of what is on their screen. This is true for:
- Zoho native reports
- Custom widget reports
- Salesforce, HubSpot, or any other SaaS CRM
- PDFs, printed documents

The correct response is a **data use policy**, not a technical control:
- Consultants sign an acceptable use agreement.
- Auditing is done at the CRM access log level (who viewed which records).
- Sensitive fields (salary, personal ID, financial data) are hidden at the Profile level so they never appear in reports at all — making clipboard copy of that data impossible.

---

## 5. Recommended Approach: Native CRM Configuration

Instead of building the custom widget, configure the following in Zoho CRM:

### 5.1 Create a Restricted Consultant Profile

| Setting | Value |
|---|---|
| Module permissions | Enable only the modules consultants need (e.g., Leads, Accounts, Contacts, Deals) |
| Field permissions | Set sensitive fields (revenue details, personal data, etc.) to **Hidden** for this profile |
| Export Records | **Disabled** |
| Import Records | **Disabled** (if not needed) |
| Mass Update | **Disabled** (if not needed) |

### 5.2 Use Native Reports for Cross-Module Queries

- Teach consultants to use **CRM Reports → Tabular / Summary Reports**.
- Pre-build shared "template" reports for common use cases.
- Allow consultants to save their own report copies from templates.
- Share reports using native report sharing (view-only).

### 5.3 Use Report Folders for Organization

- Create a **shared Report Folder** per team or project.
- Admin-created template reports live in a locked folder (view/run only).
- Consultants save their own variants in their personal folder.

### 5.4 Consider Zoho Analytics (if advanced reporting is needed)

If the cross-module reporting needs are complex (more than 3 joins, complex aggregations, dashboards), **Zoho Analytics** is included in Zoho One and is specifically designed for this:
- Zero impact on CRM API credits (Analytics uses its own sync layer).
- Purpose-built for complex multi-module reports and dashboards.
- Row-level and field-level security configurable.
- Share dashboards and reports with specific users or groups.
- Export can be restricted per workspace.

---

## 6. Decision Matrix

| Factor | Custom Widget | Native CRM | Native CRM + Zoho Analytics |
|---|---|---|---|
| API credit cost | 6,000–30,000 credits/day | **Zero** | **Zero** |
| Development effort | ~16 working days | **Zero** | ~1–2 days (Analytics setup) |
| Maintenance burden | Ongoing (Deluge + React) | **None** | Minimal (Zoho maintains it) |
| Copy prevention | Partial (JS intercept, bypassable) | **Same** (export disabled via profile) | **Same** |
| Cross-module reports | Yes | **Yes** (native joins) | **Yes** (richer joins) |
| Admin field control | Via master tabs (custom) | **Via CRM Profiles** | **Via Analytics field permissions** |
| Preset/saved reports | Via custom tab | **Native saved reports** | **Native saved reports** |
| Sharing within org | Via `share_report_setting` | **Native report sharing** | **Native sharing** |
| Per-report field granularity | **Yes** (only advantage) | No | Partial (per-workspace control) |
| Risk of credit exhaustion | Yes (unpredictable) | **None** | **None** |

---

## 7. Open Questions for Stakeholders

Before closing this decision, the following should be confirmed:

| # | Question | Who to Ask |
|---|---|---|
| 1 | Is per-report field granularity (same user, different fields visible in different reports) actually required? | Business stakeholders |
| 2 | Can Zoho support confirm that Export and Print can both be disabled per profile in native Reports? | Zoho Support |
| 3 | Is Zoho Analytics already enabled under the current Zoho One plan? | Admin |
| 4 | Are there any report use cases that require real-time data that cannot be met by native reports? | Business stakeholders |
| 5 | Is the copy concern a compliance/legal requirement or a general preference? If compliance, what specific regulation? | Legal / Compliance |

---

## 8. Summary Recommendation

| Decision | Recommendation |
|---|---|
| Build the custom widget | **No. Pause and do not proceed.** |
| Solve copy prevention | Disable Export via CRM Profile settings. Accept clipboard copy as an unpreventable browser behaviour across all platforms. |
| Solve cross-module reports | Use native CRM Reports. Pre-build shared templates for common use cases. |
| Solve field access control | Configure CRM Profiles with field-level Hidden settings for the Consultant profile. |
| Solve advanced reporting | Evaluate Zoho Analytics (included in Zoho One) before any custom development. |
| Revisit custom build | Only if stakeholder confirmation confirms a per-report field granularity requirement that cannot be met by Profile configuration or Zoho Analytics. |

---

*This report should be reviewed with the project sponsor and CRM admin before a final decision is made.*
