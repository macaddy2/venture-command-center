import { useState, useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

interface SelectOption {
    label: string;
    value: string;
}

interface EditableFieldProps {
    value: string;
    onSave: (value: string) => void;
    type?: 'text' | 'textarea' | 'select';
    options?: SelectOption[];
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    displayStyle?: React.CSSProperties;
}

export default function EditableField({
    value,
    onSave,
    type = 'text',
    options = [],
    placeholder = 'Click to edit...',
    className,
    style,
    displayStyle,
}: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [hovered, setHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
                inputRef.current.select();
            }
        }
    }, [editing]);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    const handleStart = () => {
        setDraft(value);
        setEditing(true);
    };

    const handleSave = () => {
        setEditing(false);
        if (draft !== value) onSave(draft);
    };

    const handleCancel = () => {
        setDraft(value);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { handleCancel(); return; }
        if (e.key === 'Enter' && type !== 'textarea') { handleSave(); }
    };

    if (editing) {
        const inputProps = {
            value: draft,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDraft(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            style: { width: '100%', ...style },
        };

        if (type === 'select') {
            return (
                <select
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                    className={`form-select ${className ?? ''}`}
                    {...inputProps}
                    onChange={e => { setDraft(e.target.value); }}
                    onBlur={() => { handleSave(); }}
                >
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    className={`form-input ${className ?? ''}`}
                    rows={3}
                    {...inputProps}
                    style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', ...style }}
                />
            );
        }

        return (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                className={`form-input ${className ?? ''}`}
                type="text"
                {...inputProps}
            />
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleStart}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                cursor: 'text',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 'var(--border-radius-sm)',
                padding: '2px 4px',
                margin: '-2px -4px',
                transition: 'background var(--transition-fast)',
                background: hovered ? 'var(--color-bg-tertiary)' : 'transparent',
                ...displayStyle,
            }}
        >
            <span style={{ flex: 1 }}>
                {value || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{placeholder}</span>}
            </span>
            <Edit2
                size={12}
                style={{
                    color: 'var(--color-text-muted)',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity var(--transition-fast)',
                    flexShrink: 0,
                }}
            />
        </div>
    );
}
