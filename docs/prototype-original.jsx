import { useState, useEffect } from "react";

const VENTURES = [
  { id: "tc", name: "TruCycle", prefix: "TC", geo: "UK", tier: "Active Build", color: "#27AE60", lightColor: "#D5F5E3",
    status: "Registered", stage: "MVP Development",
    tasks: { total: 24, done: 8, inProgress: 5, blocked: 1, backlog: 10 },
    team: { filled: 1, total: 5, roles: ["CTO (Hiring)", "Ops Lead (Hiring)", "UX Designer (Hiring)", "Marketing Lead (Hiring)", "BD Lead (Later)"] },
    regs: { domain: true, company: true, bank: false, legal: true },
    github: { repos: 3, commits7d: 0, prsOpen: 0, lastActivity: "Awaiting CTO" },
    milestones: [
      { name: "MVP Launch", target: "2026-06", progress: 33 },
      { name: "First 100 Users", target: "2026-08", progress: 0 },
    ]},
  { id: "dg", name: "DepositGuard", prefix: "DG", geo: "UK", tier: "Active Build", color: "#2E86C1", lightColor: "#D6EAF8",
    status: "Pending Registration", stage: "Pre-Registration",
    tasks: { total: 18, done: 3, inProgress: 4, blocked: 2, backlog: 9 },
    team: { filled: 1, total: 4, roles: ["Lead Dev (Hiring)", "Legal Advisor (Hiring)", "UX Designer (Hiring)", "Marketing (Later)"] },
    regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 2, commits7d: 0, prsOpen: 0, lastActivity: "Awaiting Dev" },
    milestones: [
      { name: "Ltd Registration", target: "2026-03", progress: 20 },
      { name: "Legal Model Validated", target: "2026-04", progress: 40 },
      { name: "Platform Beta", target: "2026-07", progress: 0 },
    ]},
  { id: "pm", name: "PathMate", prefix: "PM", geo: "UK", tier: "Incubating", color: "#8E44AD", lightColor: "#E8DAEF",
    status: "Concept", stage: "Research & Validation",
    tasks: { total: 12, done: 1, inProgress: 2, blocked: 0, backlog: 9 },
    team: { filled: 0, total: 5, roles: ["Mobile Dev (Later)", "Backend Eng (Later)", "UX Designer (Later)", "Growth Mgr (Later)", "Regulatory (Later)"] },
    regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" },
    milestones: [
      { name: "Competitive Analysis", target: "2026-04", progress: 10 },
      { name: "Company Registration", target: "2026-05", progress: 0 },
    ]},
  { id: "fx", name: "Fixars", prefix: "FX", geo: "NG", tier: "Incubating", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Pending CAC", stage: "Registration & Architecture",
    tasks: { total: 30, done: 4, inProgress: 3, blocked: 1, backlog: 22 },
    team: { filled: 0, total: 6, roles: ["CTO/Architect (Hiring)", "Full-Stack Dev (Hiring)", "Product Designer (Hiring)", "Community Lead (Hiring)", "Biz Ops (Hiring)", "Mobile Dev (Hiring)"] },
    regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 2, commits7d: 0, prsOpen: 0, lastActivity: "Architecture planning" },
    milestones: [
      { name: "CAC Registration", target: "2026-03", progress: 15 },
      { name: "Auth/Identity Layer", target: "2026-06", progress: 5 },
      { name: "First Sub-App Live", target: "2026-09", progress: 0 },
    ]},
  { id: "cn", name: "ConceptNexus", prefix: "CN", geo: "NG", tier: "Parked", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Planning", stage: "Under Fixars", tasks: { total: 8, done: 0, inProgress: 0, blocked: 0, backlog: 8 },
    team: { filled: 0, total: 0, roles: [] }, regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" }, milestones: [] },
  { id: "sc", name: "SkillsCanvas", prefix: "SC", geo: "NG", tier: "Parked", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Planning", stage: "Under Fixars", tasks: { total: 8, done: 0, inProgress: 0, blocked: 0, backlog: 8 },
    team: { filled: 0, total: 0, roles: [] }, regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" }, milestones: [] },
  { id: "cb", name: "CollabBoard", prefix: "CB", geo: "NG", tier: "Parked", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Planning", stage: "Under Fixars", tasks: { total: 8, done: 0, inProgress: 0, blocked: 0, backlog: 8 },
    team: { filled: 0, total: 0, roles: [] }, regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" }, milestones: [] },
  { id: "vd", name: "VestDen", prefix: "VD", geo: "NG", tier: "Parked", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Planning", stage: "Under Fixars", tasks: { total: 6, done: 0, inProgress: 0, blocked: 0, backlog: 6 },
    team: { filled: 0, total: 0, roles: [] }, regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" }, milestones: [] },
  { id: "pp", name: "PayPaddy", prefix: "PP", geo: "NG", tier: "Parked", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Planning", stage: "Under Fixars", tasks: { total: 4, done: 0, inProgress: 0, blocked: 0, backlog: 4 },
    team: { filled: 0, total: 0, roles: [] }, regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" }, milestones: [] },
  { id: "fs", name: "FaShop", prefix: "FS", geo: "NG", tier: "Parked", color: "#E67E22", lightColor: "#FDEBD0",
    status: "Concept", stage: "Under Fixars", tasks: { total: 2, done: 0, inProgress: 0, blocked: 0, backlog: 2 },
    team: { filled: 0, total: 0, roles: [] }, regs: { domain: true, company: false, bank: false, legal: false },
    github: { repos: 0, commits7d: 0, prsOpen: 0, lastActivity: "Not started" }, milestones: [] },
];

const tierColors = { "Active Build": "#27AE60", "Incubating": "#2E86C1", "Parked": "#95A5A6" };
const tierBg = { "Active Build": "#D5F5E3", "Incubating": "#D6EAF8", "Parked": "#F2F3F4" };

function ProgressBar({ value, color = "#2E86C1", height = 8, bg = "#E5E7E9" }) {
  return (
    <div style={{ width: "100%", height, borderRadius: height/2, background: bg, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", borderRadius: height/2, background: color, transition: "width 0.6s ease" }} />
    </div>
  );
}

function RegDot({ done }) {
  return (
    <span style={{
      display: "inline-block", width: 10, height: 10, borderRadius: "50%",
      background: done ? "#27AE60" : "#E74C3C", marginRight: 4
    }} />
  );
}

function VentureCard({ v, onClick, selected }) {
  const progress = v.tasks.total > 0 ? Math.round((v.tasks.done / v.tasks.total) * 100) : 0;
  const blocked = v.tasks.blocked > 0;
  return (
    <div onClick={() => onClick(v.id)} style={{
      background: selected ? v.lightColor : "#fff",
      border: selected ? `2px solid ${v.color}` : "1px solid #E5E7E9",
      borderRadius: 12, padding: 16, cursor: "pointer",
      transition: "all 0.2s ease", boxShadow: selected ? `0 4px 12px ${v.color}22` : "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: v.color, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5 }}>{v.prefix}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#2C3E50" }}>{v.name}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: tierColors[v.tier], background: tierBg[v.tier], padding: "2px 8px", borderRadius: 10 }}>{v.tier}</span>
      </div>
      <div style={{ fontSize: 11, color: "#7F8C8D", marginBottom: 8 }}>{v.geo} · {v.stage}</div>
      <ProgressBar value={progress} color={v.color} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "#7F8C8D" }}>{progress}% complete</span>
        <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
          {blocked && <span style={{ color: "#E74C3C", fontWeight: 600 }}>⚠ {v.tasks.blocked} blocked</span>}
          <span style={{ color: "#7F8C8D" }}>{v.tasks.inProgress} active</span>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ v }) {
  if (!v) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#95A5A6", fontSize: 14 }}>
      Select a venture to see details
    </div>
  );
  const progress = v.tasks.total > 0 ? Math.round((v.tasks.done / v.tasks.total) * 100) : 0;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: v.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>
          {v.prefix}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2C3E50" }}>{v.name}</div>
          <div style={{ fontSize: 12, color: "#7F8C8D" }}>{v.geo} · {v.tier} · {v.status}</div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div style={{ background: "#F8F9FA", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", marginBottom: 12 }}>Task Progress</div>
        <ProgressBar value={progress} color={v.color} height={12} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          {[
            { label: "Done", val: v.tasks.done, c: "#27AE60" },
            { label: "In Progress", val: v.tasks.inProgress, c: "#2E86C1" },
            { label: "Blocked", val: v.tasks.blocked, c: "#E74C3C" },
            { label: "Backlog", val: v.tasks.backlog, c: "#95A5A6" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#7F8C8D" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration */}
      <div style={{ background: "#F8F9FA", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", marginBottom: 10 }}>Registration Checklist</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { label: "Domain", done: v.regs.domain },
            { label: "Company Reg", done: v.regs.company },
            { label: "Bank Account", done: v.regs.bank },
            { label: "Legal Docs", done: v.regs.legal },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <RegDot done={r.done} />
              <span style={{ color: r.done ? "#27AE60" : "#7F8C8D" }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      {v.team.total > 0 && (
        <div style={{ background: "#F8F9FA", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", marginBottom: 10 }}>
            Team ({v.team.filled}/{v.team.total} filled)
          </div>
          <ProgressBar value={(v.team.filled / v.team.total) * 100} color={v.color} height={6} />
          <div style={{ marginTop: 10 }}>
            {v.team.roles.map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: "#7F8C8D", padding: "3px 0", borderBottom: i < v.team.roles.length - 1 ? "1px solid #E5E7E9" : "none" }}>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GitHub */}
      <div style={{ background: "#F8F9FA", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", marginBottom: 10 }}>GitHub Activity</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50" }}>{v.github.repos}</div>
            <div style={{ fontSize: 10, color: "#7F8C8D" }}>Repos</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50" }}>{v.github.commits7d}</div>
            <div style={{ fontSize: 10, color: "#7F8C8D" }}>Commits (7d)</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2C3E50" }}>{v.github.prsOpen}</div>
            <div style={{ fontSize: 10, color: "#7F8C8D" }}>Open PRs</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#95A5A6", marginTop: 8, textAlign: "center" }}>{v.github.lastActivity}</div>
      </div>

      {/* Milestones */}
      {v.milestones.length > 0 && (
        <div style={{ background: "#F8F9FA", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#2C3E50", marginBottom: 10 }}>Milestones</div>
          {v.milestones.map((m, i) => (
            <div key={i} style={{ marginBottom: i < v.milestones.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#2C3E50", fontWeight: 500 }}>{m.name}</span>
                <span style={{ color: "#95A5A6" }}>{m.target}</span>
              </div>
              <ProgressBar value={m.progress} color={v.color} height={6} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VentureCommandCenter() {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [geoFilter, setGeoFilter] = useState("all");

  const filtered = VENTURES.filter(v => {
    if (filter !== "all" && v.tier !== filter) return false;
    if (geoFilter !== "all" && v.geo !== geoFilter) return false;
    return true;
  });

  const selected = VENTURES.find(v => v.id === selectedId) || null;

  const totalTasks = VENTURES.reduce((s, v) => s + v.tasks.total, 0);
  const doneTasks = VENTURES.reduce((s, v) => s + v.tasks.done, 0);
  const blockedTasks = VENTURES.reduce((s, v) => s + v.tasks.blocked, 0);
  const totalTeamNeeded = VENTURES.reduce((s, v) => s + v.team.total, 0);
  const totalTeamFilled = VENTURES.reduce((s, v) => s + v.team.filled, 0);
  const regsComplete = VENTURES.reduce((s, v) => s + Object.values(v.regs).filter(Boolean).length, 0);
  const regsTotal = VENTURES.length * 4;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#F0F2F5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1B4F72 0%, #2E86C1 100%)", padding: "20px 24px", color: "#fff" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Venture Command Center</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Ade's Multi-Venture Portfolio Dashboard</div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, padding: "16px 24px" }}>
        {[
          { label: "Ventures", val: VENTURES.length, sub: `${VENTURES.filter(v=>v.geo==="UK").length} UK · ${VENTURES.filter(v=>v.geo==="NG").length} NG`, c: "#1B4F72" },
          { label: "Tasks Done", val: `${doneTasks}/${totalTasks}`, sub: `${Math.round((doneTasks/totalTasks)*100)}% complete`, c: "#27AE60" },
          { label: "Blocked", val: blockedTasks, sub: blockedTasks > 0 ? "Needs attention" : "All clear", c: blockedTasks > 0 ? "#E74C3C" : "#27AE60" },
          { label: "Team", val: `${totalTeamFilled}/${totalTeamNeeded}`, sub: `${totalTeamNeeded - totalTeamFilled} roles to fill`, c: "#8E44AD" },
          { label: "Registrations", val: `${regsComplete}/${regsTotal}`, sub: `${Math.round((regsComplete/regsTotal)*100)}% complete`, c: "#E67E22" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: 14, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, color: "#95A5A6", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.c, marginTop: 4 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#95A5A6", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, padding: "0 24px 12px", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All Ventures" },
          { key: "Active Build", label: "Active Build" },
          { key: "Incubating", label: "Incubating" },
          { key: "Parked", label: "Parked" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid #E5E7E9", cursor: "pointer",
            fontSize: 12, fontWeight: 500, transition: "all 0.2s",
            background: filter === f.key ? "#1B4F72" : "#fff",
            color: filter === f.key ? "#fff" : "#7F8C8D",
          }}>{f.label}</button>
        ))}
        <div style={{ width: 1, background: "#E5E7E9", margin: "0 4px" }} />
        {[
          { key: "all", label: "All Geos" },
          { key: "UK", label: "🇬🇧 UK" },
          { key: "NG", label: "🇳🇬 Nigeria" },
        ].map(f => (
          <button key={f.key} onClick={() => setGeoFilter(f.key)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid #E5E7E9", cursor: "pointer",
            fontSize: 12, fontWeight: 500, transition: "all 0.2s",
            background: geoFilter === f.key ? "#1B4F72" : "#fff",
            color: geoFilter === f.key ? "#fff" : "#7F8C8D",
          }}>{f.label}</button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, padding: "0 24px 24px", minHeight: 500 }}>
        {/* Venture Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, alignContent: "start" }}>
          {filtered.map(v => (
            <VentureCard key={v.id} v={v} onClick={setSelectedId} selected={selectedId === v.id} />
          ))}
        </div>

        {/* Detail Panel */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "auto", maxHeight: "75vh" }}>
          <DetailPanel v={selected} />
        </div>
      </div>

      {/* Blockers Alert */}
      {blockedTasks > 0 && (
        <div style={{ margin: "0 24px 24px", padding: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#DC2626", marginBottom: 8 }}>⚠ Active Blockers</div>
          {VENTURES.filter(v => v.tasks.blocked > 0).map(v => (
            <div key={v.id} style={{ fontSize: 12, color: "#7F1D1D", padding: "4px 0" }}>
              <strong>{v.name}:</strong> {v.tasks.blocked} blocked task{v.tasks.blocked > 1 ? "s" : ""} — click the venture card above for details
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", padding: "12px 24px 24px", fontSize: 11, color: "#95A5A6" }}>
        Prototype dashboard · Connect to Linear API + GitHub API for live data · v2.0
      </div>
    </div>
  );
}
