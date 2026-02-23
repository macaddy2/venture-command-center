// ============================================================
// AI Copilot View — Chat + Insights + NLP Command Engine
// ============================================================
// Feature 14: Natural Language Commands
// Parses user input to execute actions: add tasks, navigate,
// generate reports, surface data, and more.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import type { ViewKey } from '../lib/types';
import { motion } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, AlertTriangle, Lightbulb,
    TrendingUp, Zap, Terminal, Command
} from 'lucide-react';
import { generateId } from '../lib/utils';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isCommand?: boolean;       // Was this parsed as a command?
    commandAction?: string;    // Human-readable action taken
}

// ─── NLP Command Matcher ────────────────────────────────────
// Returns { handled: true, response, action? } if the query
// is a command that was executed, or { handled: false } if it
// was just a question.

interface CommandResult {
    handled: boolean;
    response: string;
    action?: string;
}

function tryExecuteCommand(
    raw: string,
    store: ReturnType<typeof useStore>,
): CommandResult {
    const q = raw.toLowerCase().trim();
    const { state, dispatch, addTask } = store;

    // ── Navigation commands ──
    const viewMap: Record<string, string> = {
        dashboard: 'dashboard', home: 'dashboard',
        tasks: 'tasks', kanban: 'tasks', board: 'tasks',
        timeline: 'timeline', gantt: 'timeline',
        analytics: 'analytics', charts: 'analytics', stats: 'analytics',
        focus: 'focus', sprint: 'focus', 'focus mode': 'focus',
        financials: 'financials', money: 'financials', budget: 'financials',
        documents: 'documents', docs: 'documents', vault: 'documents',
        risks: 'risks', 'risk matrix': 'risks',
        compare: 'comparisons', comparisons: 'comparisons',
        recurring: 'recurring', 'recurring tasks': 'recurring',
        resources: 'resources', sharing: 'resources',
        digest: 'digest', 'weekly digest': 'digest',
        settings: 'settings', config: 'settings',
        alerts: 'alerts', 'predictive alerts': 'alerts',
        standup: 'standup', 'standup report': 'standup',
    };

    // "go to X", "open X", "show me X", "navigate to X", "switch to X"
    const navMatch = q.match(/^(?:go to|open|show me|navigate to|switch to|take me to)\s+(.+)$/);
    if (navMatch) {
        const target = navMatch[1].replace(/the\s+/g, '').trim();
        const viewKey = viewMap[target];
        if (viewKey) {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewKey as ViewKey });
            return { handled: true, response: `✅ Navigated to **${target}** view.`, action: `Navigated to ${target}` };
        }
    }

    // "show X" (shorter version)
    const showMatch = q.match(/^show\s+(.+)$/);
    if (showMatch) {
        const target = showMatch[1].replace(/the\s+/g, '').trim();
        const viewKey = viewMap[target];
        if (viewKey) {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewKey as ViewKey });
            return { handled: true, response: `✅ Opened **${target}** view.`, action: `Opened ${target}` };
        }
    }

    // ── Add task command ──
    // "add task <title> to <venture>" or "create task <title> for <venture>"
    const addTaskMatch = q.match(/^(?:add|create)\s+(?:a\s+)?task\s+["""]?(.+?)["""]?\s+(?:to|for|in)\s+(.+)$/);
    if (addTaskMatch) {
        const title = addTaskMatch[1].trim();
        const ventureName = addTaskMatch[2].trim();
        const venture = state.ventures.find(v =>
            v.name.toLowerCase() === ventureName ||
            v.prefix.toLowerCase() === ventureName
        );
        if (venture) {
            addTask({
                venture_id: venture.id,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                status: 'todo',
                priority: 'P1',
            });
            return {
                handled: true,
                response: `✅ Created task **"${title}"** in **${venture.name}** (P1, Todo).`,
                action: `Added task "${title}" to ${venture.name}`,
            };
        } else {
            return {
                handled: true,
                response: `⚠️ I couldn't find a venture matching **"${ventureName}"**. Available: ${state.ventures.map(v => v.prefix).join(', ')}`,
            };
        }
    }

    // ── Add P0 task ──
    const addP0Match = q.match(/^(?:add|create)\s+(?:a\s+)?(?:p0|critical|urgent)\s+task\s+["""]?(.+?)["""]?\s+(?:to|for|in)\s+(.+)$/);
    if (addP0Match) {
        const title = addP0Match[1].trim();
        const ventureName = addP0Match[2].trim();
        const venture = state.ventures.find(v =>
            v.name.toLowerCase() === ventureName ||
            v.prefix.toLowerCase() === ventureName
        );
        if (venture) {
            addTask({
                venture_id: venture.id,
                title: title.charAt(0).toUpperCase() + title.slice(1),
                status: 'todo',
                priority: 'P0',
            });
            return {
                handled: true,
                response: `🔴 Created **P0 critical** task **"${title}"** in **${venture.name}**.`,
                action: `Added P0 task "${title}" to ${venture.name}`,
            };
        }
    }

    // ── Mark task done ──
    // "mark <task> as done", "complete <task>"
    const doneMatch = q.match(/^(?:mark|set)\s+["""]?(.+?)["""]?\s+(?:as\s+)?(?:done|complete|completed|finished)$/) ||
        q.match(/^(?:complete|finish|close)\s+["""]?(.+?)["""]?$/);
    if (doneMatch) {
        const taskName = doneMatch[1].trim().toLowerCase();
        const task = state.tasks.find(t =>
            t.title.toLowerCase().includes(taskName) && t.status !== 'done'
        );
        if (task) {
            dispatch({
                type: 'UPDATE_TASK',
                payload: { ...task, status: 'done', updated_at: new Date().toISOString() },
            });
            const v = state.ventures.find(v => v.id === task.venture_id);
            return {
                handled: true,
                response: `✅ Marked **"${task.title}"** as done! (${v?.name})`,
                action: `Completed "${task.title}"`,
            };
        } else {
            return {
                handled: true,
                response: `⚠️ Couldn't find an open task matching **"${taskName}"**.`,
            };
        }
    }

    // ── Quick action: unblock ──
    const unblockMatch = q.match(/^unblock\s+["""]?(.+?)["""]?$/);
    if (unblockMatch) {
        const taskName = unblockMatch[1].trim().toLowerCase();
        const task = state.tasks.find(t =>
            t.title.toLowerCase().includes(taskName) && t.status === 'blocked'
        );
        if (task) {
            dispatch({
                type: 'UPDATE_TASK',
                payload: { ...task, status: 'todo', updated_at: new Date().toISOString() },
            });
            const v = state.ventures.find(v => v.id === task.venture_id);
            return {
                handled: true,
                response: `🔓 Unblocked **"${task.title}"** — moved to Todo. (${v?.name})`,
                action: `Unblocked "${task.title}"`,
            };
        }
    }

    // ── Select venture ──
    const selectMatch = q.match(/^(?:select|focus on|switch to venture)\s+(.+)$/);
    if (selectMatch) {
        const name = selectMatch[1].trim().toLowerCase();
        const venture = state.ventures.find(v =>
            v.name.toLowerCase() === name || v.prefix.toLowerCase() === name
        );
        if (venture) {
            dispatch({ type: 'SELECT_VENTURE', payload: venture.id });
            return {
                handled: true,
                response: `🎯 Selected **${venture.name}** (${venture.prefix}). The sidebar and views will filter to this venture.`,
                action: `Selected venture ${venture.name}`,
            };
        }
    }

    // ── Count commands ──
    if (q.match(/^(?:how many|count)\s+(?:tasks|items)\s+(?:in|for|does)\s+(.+?)(?:\s+have)?$/)) {
        const match = q.match(/(?:in|for|does)\s+(.+?)(?:\s+have)?$/);
        if (match) {
            const name = match[1].trim().toLowerCase();
            const venture = state.ventures.find(v =>
                v.name.toLowerCase() === name || v.prefix.toLowerCase() === name
            );
            if (venture) {
                const tasks = state.tasks.filter(t => t.venture_id === venture.id);
                const done = tasks.filter(t => t.status === 'done').length;
                const ip = tasks.filter(t => t.status === 'in-progress').length;
                const blocked = tasks.filter(t => t.status === 'blocked').length;
                return {
                    handled: true,
                    response: `📊 **${venture.name}** has **${tasks.length} tasks**:\n\n• ✅ ${done} done\n• 🔄 ${ip} in progress\n• ⛔ ${blocked} blocked\n• 📋 ${tasks.length - done - ip - blocked} other`,
                };
            }
        }
    }

    // ── Clear localStorage / reset ──
    if (q === 'reset data' || q === 'clear data' || q === 'factory reset') {
        return {
            handled: true,
            response: `⚠️ To reset all data, go to **Settings** → click "Reset Data". This will clear localStorage and reload seed data.\n\nI won't do this automatically to prevent accidental data loss.`,
        };
    }

    // ── Help / list commands ──
    if (q === 'help' || q === 'commands' || q === '?' || q.includes('what can you do')) {
        return {
            handled: true,
            response: `🤖 **Available Commands:**\n\n**Navigation:**\n• \`go to [view]\` — dashboard, tasks, timeline, analytics, focus, financials, documents, risks, alerts, standup, etc.\n\n**Task Management:**\n• \`add task "title" to [venture]\`\n• \`add P0 task "title" to [venture]\`\n• \`mark "task name" as done\`\n• \`unblock "task name"\`\n\n**Data Queries:**\n• \`how many tasks in [venture]\`\n• \`show health scores\`\n• \`what's blocking?\`\n• \`portfolio summary\`\n\n**Venture:**\n• \`select [venture]\` — filter to a specific venture\n\nTry any of these! I also answer natural language questions about your portfolio.`,
        };
    }

    return { handled: false, response: '' };
}

// ─── AI Response Generator ──────────────────────────────────
function generateAIResponse(query: string, store: ReturnType<typeof useStore>): string {
    const q = query.toLowerCase();
    const { venturesWithStats, portfolioStats, state } = store;

    if (q.includes('block') || q.includes('stuck')) {
        const blocked = state.tasks.filter(t => t.status === 'blocked');
        if (blocked.length === 0) return "✅ Great news — there are no blocked tasks across any of your ventures right now. Keep the momentum going!";
        const lines = blocked.map(t => {
            const v = state.ventures.find(v => v.id === t.venture_id);
            return `• **${v?.name || 'Unknown'}**: ${t.title}`;
        });
        return `⚠️ You have **${blocked.length} blocked task${blocked.length > 1 ? 's' : ''}**:\n\n${lines.join('\n')}\n\nI'd recommend resolving the P0 blockers first — they're likely holding up downstream work.`;
    }

    if (q.includes('focus') || q.includes('priority') || q.includes('this week') || q.includes('today')) {
        const activeVentures = venturesWithStats.filter(v => v.tier === 'Active Build');
        const p0Tasks = state.tasks.filter(t => t.priority === 'P0' && t.status !== 'done');
        return `🎯 **This week's focus areas:**\n\n1. **${activeVentures[0]?.name}** — ${activeVentures[0]?.tasks.inProgress} tasks in progress, health score: ${activeVentures[0]?.healthScore}/100\n2. **${activeVentures[1]?.name || 'DepositGuard'}** — has ${p0Tasks.filter(t => t.venture_id === activeVentures[1]?.id).length} P0 tasks pending\n\n📋 You have **${p0Tasks.length} P0 (critical) tasks** across all ventures that aren't done yet. I'd prioritize:\n• Unblocking registration/banking tasks\n• Continuing active development sprints\n• Reviewing any tasks in the "review" column`;
    }

    if (q.includes('summary') || q.includes('overview') || q.includes('status')) {
        return `📊 **Portfolio Summary (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}):**\n\n• **${portfolioStats.totalVentures} ventures** (${state.ventures.filter(v => v.geo === 'UK').length} UK, ${state.ventures.filter(v => v.geo === 'NG').length} NG)\n• **${portfolioStats.doneTasks}/${portfolioStats.totalTasks} tasks completed** (${portfolioStats.totalTasks > 0 ? Math.round((portfolioStats.doneTasks / portfolioStats.totalTasks) * 100) : 0}%)\n• **${portfolioStats.blockedTasks} blocked tasks** across the portfolio\n• **${portfolioStats.filledTeam}/${portfolioStats.totalTeam} roles filled** (${portfolioStats.totalTeam - portfolioStats.filledTeam} positions to hire)\n• **Average health score: ${portfolioStats.avgHealth}/100**\n\n🏆 Top performer: **${venturesWithStats.reduce((best, v) => v.healthScore > best.healthScore ? v : best, venturesWithStats[0]).name}**\n⚠️ Needs attention: **${venturesWithStats.reduce((worst, v) => v.healthScore < worst.healthScore ? v : worst, venturesWithStats[0]).name}**`;
    }

    if (q.includes('trucycle') || q.includes('tc')) {
        const tc = venturesWithStats.find(v => v.prefix === 'TC');
        if (!tc) return "I couldn't find data for TruCycle.";
        return `🟢 **TruCycle Update:**\n\n• Stage: ${tc.stage}\n• Health: ${tc.healthScore}/100\n• Tasks: ${tc.tasks.done}/${tc.tasks.total} done (${tc.tasks.inProgress} in progress, ${tc.tasks.blocked} blocked)\n• Team: ${tc.team.filled}/${tc.team.total} roles filled\n• Next milestone: ${tc.milestones[0]?.name || 'None'} (${tc.milestones[0]?.target_date || 'N/A'})\n\n💡 **Recommendation:** Focus on hiring a CTO and unblocking the bank account task to maintain momentum toward the June MVP launch.`;
    }

    if (q.includes('depositguard') || q.includes('dg')) {
        const dg = venturesWithStats.find(v => v.prefix === 'DG');
        if (!dg) return "I couldn't find data for DepositGuard.";
        return `🔵 **DepositGuard Update:**\n\n• Stage: ${dg.stage}\n• Health: ${dg.healthScore}/100\n• Tasks: ${dg.tasks.done}/${dg.tasks.total} done (${dg.tasks.inProgress} in progress, ${dg.tasks.blocked} blocked)\n• Team: ${dg.team.filled}/${dg.team.total} roles filled\n\n💡 **Recommendation:** Prioritize Ltd registration (blocked) and hire a lead developer to accelerate DepositFlow development.`;
    }

    if (q.includes('fixars') || q.includes('fx')) {
        const fx = venturesWithStats.find(v => v.prefix === 'FX');
        if (!fx) return "I couldn't find data for Fixars.";
        return `🟠 **Fixars Update:**\n\n• Stage: ${fx.stage}\n• Health: ${fx.healthScore}/100\n• Tasks: ${fx.tasks.done}/${fx.tasks.total} done (${fx.tasks.inProgress} in progress, ${fx.tasks.blocked} blocked)\n• Sub-apps: ConceptNexus, SkillsCanvas, CollabBoard, VestDen, PayPaddy, FaShop\n\n💡 **Recommendation:** Complete CAC registration, then focus on auth/identity layer before expanding sub-apps.`;
    }

    if (q.includes('pathmate') || q.includes('pm')) {
        const pm = venturesWithStats.find(v => v.prefix === 'PM');
        if (!pm) return "I couldn't find data for PathMate.";
        return `🟣 **PathMate Update:**\n\n• Stage: ${pm.stage}\n• Health: ${pm.healthScore}/100\n• Tasks: ${pm.tasks.done}/${pm.tasks.total} done (${pm.tasks.inProgress} in progress)\n\n💡 **Recommendation:** Complete competitive analysis and regulatory research before committing to development. The UK rideshare market is heavily regulated.`;
    }

    if (q.includes('health') || q.includes('score')) {
        const sorted = [...venturesWithStats].sort((a, b) => b.healthScore - a.healthScore);
        const lines = sorted.map((v, i) => {
            const bar = v.healthScore >= 60 ? '🟢' : v.healthScore >= 35 ? '🟡' : '🔴';
            return `${i + 1}. ${bar} **${v.name}** — ${v.healthScore}/100`;
        });
        return `📈 **Health Scores (ranked):**\n\n${lines.join('\n')}\n\nHealth considers: task velocity (30%), blockers (20%), team coverage (20%), milestone progress (20%), and registrations (10%).`;
    }

    if (q.includes('suggest') || q.includes('recommend') || q.includes('todo') || q.includes('what should')) {
        return `💡 **Suggested Next Actions:**\n\n1. 🏦 **TruCycle** — Open business bank account (blocked, P0)\n2. 📝 **DepositGuard** — Complete Ltd registration (blocked, P0)\n3. 👥 **Hiring** — Post CTO role for TruCycle (critical for MVP)\n4. 📊 **Fixars** — Finish CAC filing (in progress)\n5. 🔬 **PathMate** — Complete competitive analysis before May deadline\n\n💬 You can say \`add task "title" to TC\` to create tasks right from here!`;
    }

    if (q.includes('hire') || q.includes('team') || q.includes('role')) {
        const openRoles = state.teamRoles.filter(r => r.status === 'hiring');
        const lines = openRoles.map(r => {
            const v = state.ventures.find(v => v.id === r.venture_id);
            return `• **${v?.name}** — ${r.role_name}`;
        });
        return `👥 **Open Hiring Positions (${openRoles.length}):**\n\n${lines.join('\n')}\n\n📌 I'd prioritize the **CTO for TruCycle** and **Lead Developer for DepositGuard** — these are blocking active development.`;
    }

    if (q.includes('risk') || q.includes('danger')) {
        const active = state.risks.filter(r => r.status === 'active');
        if (active.length === 0) return '✅ No active risks in your portfolio. Consider doing a risk review to surface any hidden concerns.';
        const lines = active.map(r => {
            const v = state.ventures.find(v => v.id === r.venture_id);
            const color = r.likelihood >= 3 && r.impact >= 4 ? '🔴' : '🟡';
            return `• ${color} **${v?.name}**: ${r.title} (L${r.likelihood}×I${r.impact})`;
        });
        return `⚠️ **Active Risks (${active.length}):**\n\n${lines.join('\n')}\n\nSay \`go to risks\` to open the Risk Matrix.`;
    }

    return `I understand your question about "${query}". Here's what I can help with:\n\n**Commands** (type \`help\` for full list):\n• \`go to [view]\` — Navigate views\n• \`add task "title" to [venture]\` — Create tasks\n• \`mark "task" as done\` — Complete tasks\n• \`unblock "task"\` — Move blocked → todo\n\n**Questions:**\n• "What's blocking?" · "Portfolio summary"\n• "Health scores" · "TruCycle status"\n• "Suggest actions" · "Team status"\n\nIn production, I'll connect to your OpenAI API key for more intelligent analysis.`;
}

export default function AICopilot() {
    const store = useStore();
    const { state, addInsight } = store;
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `👋 **Hey Ade!** I'm your Venture Command Center AI copilot.\n\nI can **answer questions** and **execute commands** using natural language:\n\n**Commands:**\n• \`go to timeline\` — Navigate views\n• \`add task "Build API" to TC\` — Create tasks\n• \`mark "CI/CD" as done\` — Complete tasks\n• \`help\` — See all commands\n\n**Questions:**\n• "What should I focus on this week?"\n• "What's blocking my ventures?"\n• "Give me a portfolio summary"\n\nType \`help\` for a full command reference! 🚀`,
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Try command execution first
        const cmdResult = tryExecuteCommand(userMsg.content, store);

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, cmdResult.handled ? 400 : 800 + Math.random() * 1200));

        let response: string;
        let isCommand = false;
        let commandAction: string | undefined;

        if (cmdResult.handled) {
            response = cmdResult.response;
            isCommand = true;
            commandAction = cmdResult.action;
        } else {
            response = generateAIResponse(userMsg.content, store);
        }

        const assistantMsg: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString(),
            isCommand,
            commandAction,
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick action buttons
    const quickActions = [
        { label: 'Summary', query: 'Give me a portfolio summary', icon: TrendingUp },
        { label: 'Blocked?', query: 'What\'s blocking my ventures?', icon: AlertTriangle },
        { label: 'Suggest', query: 'Suggest next actions', icon: Lightbulb },
        { label: 'Health', query: 'Show health scores', icon: Sparkles },
        { label: 'Commands', query: 'help', icon: Terminal },
    ];

    // Generate insights
    const handleGenerateInsights = () => {
        addInsight({
            venture_id: null,
            type: 'summary',
            title: 'Weekly Portfolio Digest',
            content: `Your portfolio has ${store.portfolioStats.totalVentures} ventures with ${store.portfolioStats.blockedTasks} blocked tasks. Average health: ${store.portfolioStats.avgHealth}/100. Focus on unblocking P0 tasks in TruCycle and DepositGuard.`,
            severity: store.portfolioStats.blockedTasks > 0 ? 'warning' : 'info',
            is_read: false,
        });

        // Add deadline alerts as insights
        const now = new Date();
        state.milestones.forEach(m => {
            const target = new Date(m.target_date);
            const daysUntil = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const v = state.ventures.find(v => v.id === m.venture_id);
            if (daysUntil <= 30 && daysUntil > 0 && m.progress < 50) {
                addInsight({
                    venture_id: m.venture_id,
                    type: 'alert',
                    title: `${v?.prefix}: "${m.name}" at risk`,
                    content: `Due in ${daysUntil} days but only ${m.progress}% done. Consider accelerating or adjusting timeline.`,
                    severity: daysUntil <= 14 ? 'critical' : 'warning',
                    is_read: false,
                });
            }
        });

        // Add risk-based insights
        state.risks.filter(r => r.status === 'active' && r.likelihood >= 4 && r.impact >= 4).forEach(r => {
            const v = state.ventures.find(v => v.id === r.venture_id);
            addInsight({
                venture_id: r.venture_id,
                type: 'alert',
                title: `High Risk: ${r.title}`,
                content: `${v?.name}: ${r.description || 'Critical risk active'}.${r.mitigation ? ' Mitigation: ' + r.mitigation : ''}`,
                severity: 'critical',
                is_read: false,
            });
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-5)', height: 'calc(100vh - var(--header-height) - var(--space-12))' }}>
            {/* Chat */}
            <div className="ai-chat-panel">
                {/* Quick Actions */}
                <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap',
                }}>
                    {quickActions.map(a => (
                        <button
                            key={a.label}
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setInput(a.query); }}
                            style={{ fontSize: 'var(--font-size-xs)' }}
                        >
                            <a.icon size={12} />
                            {a.label}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div className="ai-chat-messages">
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            className={`ai-message ${msg.role}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                {msg.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
                                <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>
                                    {msg.role === 'assistant' ? 'VCC Copilot' : 'You'}
                                </span>
                                {msg.isCommand && msg.commandAction && (
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        padding: '1px 6px',
                                        borderRadius: 'var(--border-radius-full)',
                                        background: 'var(--color-success)20',
                                        color: 'var(--color-success)',
                                        fontWeight: 600,
                                    }}>
                                        <Command size={8} style={{ display: 'inline', marginRight: 3 }} />
                                        {msg.commandAction}
                                    </span>
                                )}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}
                                dangerouslySetInnerHTML={{
                                    __html: msg.content
                                        .replace(/`([^`]+)`/g, '<code style="background:var(--color-bg-secondary);padding:1px 5px;border-radius:3px;font-size:0.9em">$1</code>')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br/>')
                                }}
                            />
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="ai-message assistant" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bot size={13} />
                            <span className="animate-pulse" style={{ fontSize: 'var(--font-size-sm)' }}>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="ai-chat-input-area">
                    <textarea
                        className="ai-chat-input"
                        placeholder='Ask questions or type commands like "add task ..." or "go to timeline"'
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim() || isTyping}>
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Insights Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                        AI Insights
                    </h3>
                    <button className="btn btn-secondary btn-sm" onClick={handleGenerateInsights}>
                        <Zap size={12} />
                        Generate
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {state.aiInsights.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <Sparkles size={32} style={{ opacity: 0.2, marginBottom: 'var(--space-3)' }} />
                            <div className="empty-state-title">No insights yet</div>
                            <div className="empty-state-text">
                                Click "Generate" to create AI-powered insights about your portfolio.
                            </div>
                        </div>
                    ) : (
                        state.aiInsights.map(insight => (
                            <div
                                key={insight.id}
                                className={`insight-card${!insight.is_read ? ' unread' : ''}`}
                                style={{
                                    '--insight-color': insight.severity === 'critical' ? 'var(--color-danger)'
                                        : insight.severity === 'warning' ? 'var(--color-warning)'
                                            : 'var(--color-info)',
                                } as React.CSSProperties}
                                onClick={() => store.dispatch({ type: 'MARK_INSIGHT_READ', payload: insight.id })}
                            >
                                <div style={{
                                    fontSize: 'var(--font-size-sm)', fontWeight: 600,
                                    color: 'var(--color-text-primary)', marginBottom: 4,
                                }}>
                                    {insight.severity === 'critical' ? '🚨' : insight.severity === 'warning' ? '⚠️' : '💡'}{' '}
                                    {insight.title}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: 1.5,
                                }}>
                                    {insight.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
