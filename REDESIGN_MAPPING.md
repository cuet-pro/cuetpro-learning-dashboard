# CUET Pro — "Clarity" redesign mapping

Branch: `redesign/clarity-ui` · Spec: "Clarity" implementation prompt (7 Sep 2026)

## Rule
**NEW UI (visual presentation) + OLD DATA (unchanged) + OLD LOGIC (unchanged) = final product.**

## Current → new component map

| Current | New (Clarity) | Notes |
|---|---|---|
| ad-hoc `Sidebar` in App.jsx (navy, broken ≤760px) | `Sidebar` (components/shell) — 236px ⇄ 68px rail + off-canvas drawer ≤880px w/ scrim | mobile-nav bug fixed |
| — | `Topbar` + `UserMenu` + `NotificationsPanel` | bell dropdown derives *revision-due* from real `cp_deck`; no invented notification content |
| — | mobile `BottomNav` (5 primary sections) | ≤880px |
| — | `Modal`, `ToastProvider`/`useToast` | shared shell components |
| Dashboard welcome header + countdown + manifestation strip | `DashboardHeader` (hero identity strip) | uses profile.examDate → daysLeft; dreamCollegeShort |
| Today's Plan card + challenge card 1 | `FocusCard` | weakest subject from Dashboard SUBJECTS |
| 2–3 challenge accordions | tabbed `DailyChallenges` (Word / Quiz / RC tabs) | same WORD_Q / QUIZ / RC data, same scoring |
| My Progress card | `ProgressCard` (subject rows + bars) | sparklines **omitted** — see data note |
| My Standing card | `StandingCard` | LB object, working toggle + full list (modal via shell Modal) |
| Widgets.jsx 7 accordions | 4 grouped tool tiles (Vocabulary & practice / Insights & resources / Activity / Badges) | all underlying data reachable |
| Study Kit grid | `Workbench` (category rail + searchable list + preview pane) | later phase |
| Analysis tabs | KPI strip + trend + subject table + heatmap + recommended actions; SWOT/Sub-skills preserved via retained tab bar (see SWOT decision) | later phase |
| SR stats | `StatCard`s, flip session restyle | later phase |
| Explorer table | `DataTable` w/ client sort | later phase |
| Profile fields/toggles | `Field` / `Toggle` | later phase |

## Data mapping notes (no fake data)
- Countdown, manifestation chip, target line → `useProfile()` (single source) — unchanged.
- Streak chip → existing Dashboard chip-streak value, unchanged.
- **Dashboard subject rows:** current inline `SUBJECTS` (pct/status/d) is a separate lightweight dataset from `lib/analysisData.js` `SUBJECTS` (acc/trend/weight/subSkills — different values, e.g. dashboard Economics 58% vs analysis acc 61%). Per spec §6 we may only cross-reference by name if provably compatible; values differ, so **no sparklines were added to Dashboard rows** (no invented trend). Real trend sparklines appear only in the Analysis subject table fed by analysisData.
- STREAMS duplication (profile.js vs analysisData.js): left untouched — shapes serve different scopes (profile = UI pill list; analysisData = subject data lookup). No silent merge.
- localStorage keys `cp_deck`, `cp_points`, `cp_profile`, `cp_theme` unchanged.
- `alert('Deep-link → …')` stubs preserved verbatim; new deep links use the same stub convention.

## SWOT / Sub-skills decision (spec §6)
**Chosen: option 2 (lowest structural risk)** — Analysis keeps its tab bar (restyled to Clarity), and the new unified KPI/trend/heatmap/actions treatment is layered as the enhanced Overview. `classify()`/SWOT thresholds and sub-skill drill-down remain 100% intact in their existing tabs.

## Token strategy decision (deviation, documented)
Replacing ~762 `var(--old-*)` usages across 9 CSS files with renamed tokens in one pass risks mis-mapping semantics blind. tokens.css therefore defines the **full Clarity token set** (§4) *plus a deprecated alias layer* that re-points the old navy/green vocabulary onto Clarity values. Pages are migrated to the new names file-by-file as they are rebuilt; remaining old-name usages resolve through the alias layer, so the rendered result is Clarity-consistent with zero logic change. Alias layer is removed at the end of the rebuild.
