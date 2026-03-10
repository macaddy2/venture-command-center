# Venture Command Center Enhancement Plan

## Phase 1: Add Edit Capabilities to All Entities

### 1.1 Financial Records (FinancialTracker.tsx)
- **Style**: Edit modal (multi-field: amount, type, category, description, date)
- Add `UPDATE_FINANCIAL` action to store if missing
- Add edit icon per row → opens pre-filled form modal
- Reuse existing add modal with edit mode

### 1.2 Documents (DocumentVault.tsx)
- **Style**: Edit modal (name, category, URL, notes)
- Add `UPDATE_DOCUMENT` action to store
- Add edit icon per document card → opens pre-filled form
- Reuse existing add modal with edit mode

### 1.3 Risks (RiskMatrix.tsx)
- **Style**: Edit modal (impact, likelihood, category, description, mitigation)
- Store already has `UPDATE_RISK` — just needs UI
- Add edit icon per risk item → opens pre-filled form
- Reuse existing add modal with edit mode

### 1.4 Resource Sharing (ResourceSharing.tsx)
- **Style**: Mix — inline status toggle + edit modal for details
- Add `UPDATE_RESOURCE_SHARING` action to store
- Add status toggle (active/completed/paused) as inline buttons
- Add edit icon for full detail editing via modal

### 1.5 Equity/Stakeholders (EquityTracker.tsx)
- **Style**: Edit modal (stakeholder name, ownership %, type, notes)
- Add `UPDATE_EQUITY` action to store (may already exist)
- Add edit icon per stakeholder row → pre-filled form

### 1.6 Milestones — Full CRUD (TimelineView.tsx + DetailPanel.tsx)
- **Style**: Modal for create/edit
- Add "Add Milestone" button
- Add edit icon per milestone → modal with title, description, due date, completion %
- Add delete button with confirmation
- Wire up existing store actions (ADD_MILESTONE, UPDATE_MILESTONE, DELETE_MILESTONE)

### 1.7 Team Roles — Full CRUD (DetailPanel.tsx)
- **Style**: Modal for create, inline for status toggle
- Add "Add Role" button in team section
- Add `DELETE_TEAM_ROLE` action to store
- Inline status toggle (open → hiring → filled → later)
- Edit icon for full role details (title, person, department)
- Delete button per role

### 1.8 Ventures — Expand Editable Fields (DetailPanel.tsx)
- **Style**: Inline editing (extend existing EditableField usage)
- Make tier editable (select: Active Build / Incubating / Parked)
- Make geo editable (select: UK / NG)
- Make color editable (color picker or preset swatches)
- Add venture deletion with confirmation

### 1.9 Tasks — Add Quick Delete
- Add delete button to task cards in KanbanBoard
- Add delete button in TaskForm modal

## Phase 2: New Feature Suggestions

### 2.1 Notes/Journal per Venture
- Quick daily notes attached to a venture (like a founder's log)
- Timestamped entries, markdown-friendly
- View recent notes in DetailPanel
- New "Notes" view or section

### 2.2 Goal Tracker / OKR System
- Set quarterly goals per venture (Objectives + Key Results)
- Progress bars for each key result
- Roll-up to portfolio-level goal achievement
- Ties into existing health score

### 2.3 Contact/Stakeholder Directory
- CRM-lite: track investors, advisors, partners, customers per venture
- Contact info, last interaction date, relationship type
- Quick-add from team roles

### 2.4 Activity Feed / Changelog
- Centralized timeline showing all changes across ventures
- "Task completed", "Risk added", "Milestone hit", etc.
- Filterable by venture, entity type, date range
- Great for weekly reviews

### 2.5 Quick Actions / Command Palette
- Cmd+K style palette for fast navigation and actions
- "Add task to VentureX", "Go to financials", "Create milestone"
- Builds on existing AI Copilot but faster for power users

### 2.6 Notifications / Reminders
- Due date reminders for tasks and milestones
- Budget threshold alerts (e.g., burn rate warning)
- Stale venture detection (no activity in X days)
- Browser notifications or in-app toast system

### 2.7 Data Export
- Export ventures, tasks, financials to CSV/JSON
- Portfolio snapshot PDF report
- Useful for investor updates and personal records

### 2.8 Bulk Operations
- Multi-select tasks for bulk status change, reassign, delete
- Bulk move tasks between ventures
- Bulk archive completed items
