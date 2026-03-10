// ============================================================
// Settings View
// ============================================================

import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import type { VentureTier, SlackNotifyEvent } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { validateToken as validateGitHub } from '../lib/github';
import { validateApiKey as validateOpenAI } from '../lib/openai';
import { testSlackWebhook, isSlackWebhookValid } from '../lib/slack';
import {
    Database, Github, Bot, FolderOpen, Save,
    CheckCircle2, AlertCircle, Trash2, Plus, RefreshCw, Loader,
    MessageSquare, Link,
} from 'lucide-react';

const SLACK_EVENT_OPTIONS: { key: SlackNotifyEvent; label: string }[] = [
    { key: 'task_done', label: 'Task completed' },
    { key: 'task_blocked', label: 'Task blocked' },
    { key: 'milestone_update', label: 'Milestone progress' },
    { key: 'health_change', label: 'Health score change' },
];

export default function SettingsView() {
    const { state, dispatch, addVenture, updateVenture } = useStore();
    const [githubToken, setGithubToken] = useState('');
    const [openaiKey, setOpenaiKey] = useState('');
    const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
    const [scanInterval, setScanInterval] = useState(15);
    const [showAddVenture, setShowAddVenture] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testingGithub, setTestingGithub] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testingOpenai, setTestingOpenai] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [githubUser, setGithubUser] = useState('');

    // Load saved tokens from localStorage on mount
    useEffect(() => {
        const savedGH = localStorage.getItem('vcc-github-token');
        const savedOAI = localStorage.getItem('vcc-openai-key');
        const savedModel = localStorage.getItem('vcc-openai-model');
        if (savedGH) setGithubToken(savedGH);
        if (savedOAI) setOpenaiKey(savedOAI);
        if (savedModel) setOpenaiModel(savedModel);
    }, []);

    // New venture form
    const [newVenture, setNewVenture] = useState({
        name: '', prefix: '', geo: 'UK' as 'UK' | 'NG', tier: 'Incubating' as 'Active Build' | 'Incubating' | 'Parked',
        status: '', stage: '', color: '#6366F1', lightColor: '#E8DAEF', description: '',
    });

    const handleAddVenture = () => {
        if (!newVenture.name || !newVenture.prefix) return;
        addVenture(newVenture);
        setNewVenture({ name: '', prefix: '', geo: 'UK', tier: 'Incubating', status: '', stage: '', color: '#6366F1', lightColor: '#E8DAEF', description: '' });
        setShowAddVenture(false);
    };

    const handleSave = () => {
        // Save tokens to localStorage
        if (githubToken) localStorage.setItem('vcc-github-token', githubToken);
        else localStorage.removeItem('vcc-github-token');
        if (openaiKey) localStorage.setItem('vcc-openai-key', openaiKey);
        else localStorage.removeItem('vcc-openai-key');
        localStorage.setItem('vcc-openai-model', openaiModel);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleTestGitHub = async () => {
        if (!githubToken) return;
        setTestingGithub('loading');
        const result = await validateGitHub(githubToken);
        if (result.valid) {
            setTestingGithub('success');
            setGithubUser(result.username || '');
        } else {
            setTestingGithub('error');
        }
        setTimeout(() => setTestingGithub('idle'), 3000);
    };

    const handleTestOpenAI = async () => {
        if (!openaiKey) return;
        setTestingOpenai('loading');
        const result = await validateOpenAI(openaiKey);
        setTestingOpenai(result.valid ? 'success' : 'error');
        setTimeout(() => setTestingOpenai('idle'), 3000);
    };

    const handleResetData = () => {
        if (confirm('This will reset ALL data to the initial seed data. Are you sure?')) {
            localStorage.removeItem('vcc-state');
            window.location.reload();
        }
    };

    return (
        <div style={{ maxWidth: 800 }}>
            {/* Supabase Connection */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <Database size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <div>
                        <div className="settings-title">Database Connection</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>Supabase PostgreSQL backend</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isSupabaseConfigured ? (
                            <><CheckCircle2 size={14} color="var(--color-success)" /><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>Connected</span></>
                        ) : (
                            <><AlertCircle size={14} color="var(--color-warning)" /><span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning)' }}>Local Mode</span></>
                        )}
                    </div>
                </div>
                {!isSupabaseConfigured && (
                    <div style={{
                        background: 'var(--color-warning-bg)', border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: 'var(--border-radius-md)', padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6,
                    }}>
                        Running in <strong>local-only mode</strong>. Data is stored in your browser's localStorage.
                        To connect Supabase, create a <code>.env</code> file with:<br />
                        <code style={{ color: 'var(--color-accent-primary)' }}>VITE_SUPABASE_URL=https://your-project.supabase.co</code><br />
                        <code style={{ color: 'var(--color-accent-primary)' }}>VITE_SUPABASE_ANON_KEY=your-anon-key</code>
                    </div>
                )}
            </div>

            {/* GitHub Integration */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <Github size={20} style={{ color: 'var(--color-text-primary)' }} />
                    <div>
                        <div className="settings-title">GitHub Integration</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>Auto-sync repo stats, commits, PRs</div>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Personal Access Token</label>
                    <input
                        type="password"
                        className="form-input"
                        value={githubToken}
                        onChange={e => setGithubToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    />
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        Generate at github.com/settings/tokens · Needs: repo, read:org scopes
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                    <button
                        className="btn btn-sm"
                        style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                        onClick={handleTestGitHub}
                        disabled={!githubToken || testingGithub === 'loading'}
                    >
                        {testingGithub === 'loading' && <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                        {testingGithub === 'success' && <CheckCircle2 size={12} color="var(--color-success)" />}
                        {testingGithub === 'error' && <AlertCircle size={12} color="var(--color-danger)" />}
                        {testingGithub === 'idle' && 'Test Connection'}
                        {testingGithub === 'success' && ` Connected as ${githubUser}`}
                        {testingGithub === 'error' && ' Invalid token'}
                        {testingGithub === 'loading' && ' Testing...'}
                    </button>
                </div>
            </div>

            {/* AI Configuration */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <Bot size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                    <div>
                        <div className="settings-title">AI Configuration</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>Powers copilot, summaries, and smart alerts</div>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">OpenAI API Key</label>
                    <input
                        type="password"
                        className="form-input"
                        value={openaiKey}
                        onChange={e => setOpenaiKey(e.target.value)}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Model</label>
                    <select
                        className="form-select"
                        value={openaiModel}
                        onChange={e => setOpenaiModel(e.target.value)}
                        style={{ width: 200 }}
                    >
                        <option value="gpt-4o-mini">GPT-4o Mini (fast, cheap)</option>
                        <option value="gpt-4o">GPT-4o (powerful)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                    <button
                        className="btn btn-sm"
                        style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
                        onClick={handleTestOpenAI}
                        disabled={!openaiKey || testingOpenai === 'loading'}
                    >
                        {testingOpenai === 'loading' && <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                        {testingOpenai === 'success' && <CheckCircle2 size={12} color="var(--color-success)" />}
                        {testingOpenai === 'error' && <AlertCircle size={12} color="var(--color-danger)" />}
                        {testingOpenai === 'idle' && 'Test API Key'}
                        {testingOpenai === 'success' && ' Key is valid'}
                        {testingOpenai === 'error' && ' Invalid key'}
                        {testingOpenai === 'loading' && ' Testing...'}
                    </button>
                </div>
                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label">Scan Interval (minutes)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={scanInterval}
                        onChange={e => setScanInterval(Number(e.target.value))}
                        min={5}
                        max={120}
                        style={{ width: 120 }}
                    />
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        How often the agent script scans for file changes and syncs data
                    </div>
                </div>
            </div>

            {/* File Watch Paths */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <FolderOpen size={20} style={{ color: 'var(--color-warning)' }} />
                    <div>
                        <div className="settings-title">Project Directories</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>Directories the agent watches for auto-sync</div>
                    </div>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Configure watch paths in the agent script's <code>agent/config.json</code> file.
                    The agent will monitor these directories for README.md, TODO.md, package.json, and CHANGELOG changes.
                </div>
                <div style={{ marginTop: 'var(--space-3)' }}>
                    {state.ventures.filter(v => v.tier !== 'Parked').map(v => (
                        <div key={v.id} style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                            padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{v.name}</span>
                            <span style={{ flex: 1, color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
                                ~/projects/{v.name.toLowerCase().replace(/\s/g, '-')}/
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* GitHub Repo Mappings */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <Link size={20} style={{ color: 'var(--color-text-primary)' }} />
                    <div>
                        <div className="settings-title">GitHub Repo Mappings</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>Link repositories to ventures for activity tracking</div>
                    </div>
                </div>
                {state.ventures.filter(v => v.tier !== 'Parked').map(v => {
                    const repos = v.integrations?.github ?? [];
                    return (
                        <div key={v.id} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{v.name}</span>
                            </div>
                            {repos.map((repo, i) => (
                                <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                                    <input
                                        className="form-input"
                                        style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}
                                        placeholder="owner/repo"
                                        value={`${repo.owner}/${repo.repo}`}
                                        onChange={e => {
                                            const [owner, ...rest] = e.target.value.split('/');
                                            const repoName = rest.join('/');
                                            const updated = [...repos];
                                            updated[i] = { owner: owner || '', repo: repoName || '' };
                                            updateVenture({ ...v, integrations: { ...v.integrations, github: updated } });
                                        }}
                                    />
                                    <button
                                        className="btn btn-ghost btn-icon btn-sm"
                                        onClick={() => {
                                            const updated = repos.filter((_, idx) => idx !== i);
                                            updateVenture({ ...v, integrations: { ...v.integrations, github: updated.length > 0 ? updated : undefined } });
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 'var(--font-size-xs)' }}
                                onClick={() => {
                                    const updated = [...repos, { owner: '', repo: '' }];
                                    updateVenture({ ...v, integrations: { ...v.integrations, github: updated } });
                                }}
                            >
                                <Plus size={12} /> Add repo
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Slack Integration */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <MessageSquare size={20} style={{ color: '#E01E5A' }} />
                    <div>
                        <div className="settings-title">Slack Integration</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>Webhook notifications per venture</div>
                    </div>
                </div>
                <div style={{
                    background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)',
                    fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6,
                }}>
                    Create an incoming webhook at <code>api.slack.com/apps</code> and paste the URL below.
                </div>
                {state.ventures.filter(v => v.tier !== 'Parked').map(v => {
                    const slack = v.integrations?.slack;
                    const webhookUrl = slack?.webhook_url ?? '';
                    const notifyOn = slack?.notify_on ?? [];
                    return (
                        <div key={v.id} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{v.name}</span>
                                {isSlackWebhookValid(webhookUrl) && <CheckCircle2 size={12} color="var(--color-success)" />}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <input
                                    className="form-input"
                                    style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}
                                    placeholder="https://hooks.slack.com/services/..."
                                    value={webhookUrl}
                                    onChange={e => {
                                        updateVenture({
                                            ...v,
                                            integrations: {
                                                ...v.integrations,
                                                slack: { webhook_url: e.target.value, channel_name: slack?.channel_name, notify_on: notifyOn },
                                            },
                                        });
                                    }}
                                />
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'var(--color-bg-secondary)', fontSize: 'var(--font-size-xs)' }}
                                    disabled={!isSlackWebhookValid(webhookUrl)}
                                    onClick={async () => {
                                        const ok = await testSlackWebhook(webhookUrl);
                                        alert(ok ? 'Webhook test successful!' : 'Webhook test failed.');
                                    }}
                                >
                                    Test
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {SLACK_EVENT_OPTIONS.map(opt => (
                                    <label key={opt.key} style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', cursor: 'pointer',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={notifyOn.includes(opt.key)}
                                            onChange={e => {
                                                const updated = e.target.checked
                                                    ? [...notifyOn, opt.key]
                                                    : notifyOn.filter(n => n !== opt.key);
                                                updateVenture({
                                                    ...v,
                                                    integrations: {
                                                        ...v.integrations,
                                                        slack: { webhook_url: webhookUrl, channel_name: slack?.channel_name, notify_on: updated },
                                                    },
                                                });
                                            }}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Venture Management */}
            <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <div>
                        <div className="settings-title">Venture Management</div>
                        <div className="settings-subtitle" style={{ marginBottom: 0 }}>{state.ventures.length} ventures in portfolio</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddVenture(!showAddVenture)}>
                        <Plus size={14} />
                        Add Venture
                    </button>
                </div>

                {showAddVenture && (
                    <div style={{
                        background: 'var(--color-bg-tertiary)', borderRadius: 'var(--border-radius-md)',
                        padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 'var(--space-3)' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Name</label>
                                <input className="form-input" value={newVenture.name} onChange={e => setNewVenture(p => ({ ...p, name: e.target.value }))} placeholder="Venture name" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Prefix</label>
                                <input className="form-input" value={newVenture.prefix} onChange={e => setNewVenture(p => ({ ...p, prefix: e.target.value.toUpperCase() }))} placeholder="XX" maxLength={3} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Geo</label>
                                <select className="form-select" value={newVenture.geo} onChange={e => setNewVenture(p => ({ ...p, geo: e.target.value as 'UK' | 'NG' }))}>
                                    <option value="UK">UK</option>
                                    <option value="NG">NG</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Stage</label>
                                <input className="form-input" value={newVenture.stage} onChange={e => setNewVenture(p => ({ ...p, stage: e.target.value }))} placeholder="e.g. MVP Development" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Tier</label>
                                <select className="form-select" value={newVenture.tier} onChange={e => setNewVenture(p => ({ ...p, tier: e.target.value as VentureTier }))}>
                                    <option value="Active Build">Active Build</option>
                                    <option value="Incubating">Incubating</option>
                                    <option value="Parked">Parked</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Color</label>
                                <input type="color" className="form-input" value={newVenture.color} onChange={e => setNewVenture(p => ({ ...p, color: e.target.value }))} style={{ height: 36, padding: 2 }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddVenture(false)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleAddVenture}>Add</button>
                        </div>
                    </div>
                )}

                {/* Venture list */}
                {state.ventures.map(v => (
                    <div key={v.id} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-color)',
                    }}>
                        <span style={{
                            width: 32, height: 32, borderRadius: 'var(--border-radius-sm)',
                            background: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 'var(--font-size-xs)', flexShrink: 0,
                        }}>
                            {v.prefix}
                        </span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{v.name}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{v.geo} · {v.tier} · {v.stage}</div>
                        </div>
                        <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => {
                                if (confirm(`Delete ${v.name}? This will also remove all associated tasks.`)) {
                                    dispatch({ type: 'DELETE_VENTURE', payload: v.id });
                                }
                            }}
                            title="Delete venture"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={14} />
                    {saved ? 'Saved ✓' : 'Save Settings'}
                </button>
                <button className="btn btn-danger" onClick={handleResetData}>
                    <RefreshCw size={14} />
                    Reset All Data
                </button>
            </div>
        </div>
    );
}
