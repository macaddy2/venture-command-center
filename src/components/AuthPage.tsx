// ============================================================
// AuthPage — Login / Sign Up Page
// ============================================================

import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/useAuth';
import { Rocket, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';

export default function AuthPage() {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }

        if (mode === 'signup') {
            if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }

        setLoading(true);

        if (mode === 'signin') {
            const { error: err } = await signIn(email, password);
            if (err) setError(err);
        } else {
            const { error: err } = await signUp(email, password);
            if (err) {
                setError(err);
            } else {
                setSuccess('Account created! Check your email to confirm, then sign in.');
                setMode('signin');
                setPassword('');
                setConfirmPassword('');
            }
        }

        setLoading(false);
    };

    const toggleMode = () => {
        setMode(m => m === 'signin' ? 'signup' : 'signin');
        setError(null);
        setSuccess(null);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="auth-page">
            {/* Background glow effects */}
            <div className="auth-glow auth-glow-1" />
            <div className="auth-glow auth-glow-2" />

            <div className="auth-card">
                {/* Branding */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <Rocket size={24} />
                    </div>
                    <h1 className="auth-brand-title">Venture Command Center</h1>
                    <p className="auth-brand-sub">
                        {mode === 'signin'
                            ? 'Sign in to your portfolio dashboard'
                            : 'Create an account to get started'
                        }
                    </p>
                </div>

                {/* Error / Success Messages */}
                {error && (
                    <div className="auth-message auth-error">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="auth-message auth-success">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="auth-email">Email</label>
                        <div className="auth-input-wrapper">
                            <Mail size={16} className="auth-input-icon" />
                            <input
                                id="auth-email"
                                type="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="auth-password">Password</label>
                        <div className="auth-input-wrapper">
                            <Lock size={16} className="auth-input-icon" />
                            <input
                                id="auth-password"
                                type={showPassword ? 'text' : 'password'}
                                className="auth-input"
                                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="auth-input-toggle"
                                onClick={() => setShowPassword(v => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="auth-confirm">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={16} className="auth-input-icon" />
                                <input
                                    id="auth-confirm"
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (
                            <><Loader size={16} className="auth-spinner" /> Processing...</>
                        ) : (
                            mode === 'signin' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <div className="auth-toggle">
                    {mode === 'signin' ? (
                        <>Don't have an account?{' '}
                            <button type="button" className="auth-toggle-btn" onClick={toggleMode}>
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>Already have an account?{' '}
                            <button type="button" className="auth-toggle-btn" onClick={toggleMode}>
                                Sign In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
