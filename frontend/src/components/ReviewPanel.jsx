import { useState, useEffect } from 'react';
import SeverityBadge from './SeverityBadge';

/* ── Single Issue Row ── */
function IssueRow({ issue, delay }) {
    return (
        <div className="issue-row" style={{ animation: `fadeInUp 0.3s ease-out ${delay}s both` }}>
            {/* Header row */}
            <div className="issue-header">
                {/* Severity icon */}
                {issue.severity === 'critical' && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-danger-fg)" style={{ filter: 'drop-shadow(0 0 4px rgba(248, 81, 73, 0.5))' }}>
                        <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                    </svg>
                )}
                {issue.severity === 'warning' && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-attention-fg)" style={{ filter: 'drop-shadow(0 0 4px rgba(210, 153, 34, 0.5))' }}>
                        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                    </svg>
                )}
                {issue.severity === 'suggestion' && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-success-fg)" style={{ filter: 'drop-shadow(0 0 4px rgba(63, 185, 80, 0.4))' }}>
                        <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm11.28-1.72-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 1.06-1.06L6.25 9.19l3.97-3.97a.75.75 0 0 1 1.06 1.06Z" />
                    </svg>
                )}

                <SeverityBadge severity={issue.severity} />

                <span className="issue-category">
                    {issue.category}
                </span>

                {issue.line_hint && (
                    <span className="issue-line">
                        Line {issue.line_hint}
                    </span>
                )}
            </div>

            {/* Message */}
            <p className="issue-message">
                {issue.message}
            </p>

            {/* Code snippet */}
            {issue.snippet && (
                <div className="gh-code issue-snippet">
                    {issue.snippet}
                </div>
            )}
        </div>
    );
}

/* ── File Card ── */
function FileCard({ file, isExpanded, onToggle, id, delay }) {
    const criticalCount = file.issues?.filter(i => i.severity === 'critical').length || 0;
    const warningCount = file.issues?.filter(i => i.severity === 'warning').length || 0;
    const suggestionCount = file.issues?.filter(i => i.severity === 'suggestion').length || 0;
    const totalCount = file.issues?.length || 0;

    const getHighestSeverity = () => {
        if (criticalCount > 0) return 'critical';
        if (warningCount > 0) return 'warning';
        if (suggestionCount > 0) return 'suggestion';
        return 'clean';
    };

    const sevClass = `file-card-${getHighestSeverity()}`;

    return (
        <div
            className={`file-card ${sevClass}`}
            id={id}
            style={{ animation: `fadeInUp 0.4s ease-out ${delay}s both` }}
        >
            <button
                onClick={onToggle}
                className="file-card-header"
            >
                {/* Chevron */}
                <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="var(--color-fg-muted)"
                    className={`chevron ${isExpanded ? 'expanded' : ''}`}
                >
                    <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
                </svg>

                {/* File icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
                    style={{ flexShrink: 0, color: 'var(--color-fg-muted)' }}>
                    <path d="M3.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75ZM9.5 1.563V4.25c0 .138.112.25.25.25h2.688L9.5 1.563ZM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75Z" />
                </svg>

                {/* Filename */}
                <span style={{
                    fontWeight: 600,
                    color: 'var(--color-fg-default)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {file.path}
                </span>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                    {criticalCount > 0 && <span className="counter-badge counter-danger">{criticalCount}</span>}
                    {warningCount > 0 && <span className="counter-badge counter-attention">{warningCount}</span>}
                    {suggestionCount > 0 && <span className="counter-badge counter-success">{suggestionCount}</span>}
                    {totalCount === 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success-fg)', fontSize: '12px', fontWeight: 600 }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ filter: 'drop-shadow(0 0 4px rgba(63, 185, 80, 0.4))' }}>
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                            </svg>
                            No issues
                        </span>
                    )}
                </div>
            </button>

            {/* Expandable content */}
            {isExpanded && (
                <div className="file-card-body">
                    {file.issues && file.issues.length > 0 ? (
                        file.issues.map((issue, idx) => (
                            <IssueRow key={idx} issue={issue} delay={idx * 0.05} />
                        ))
                    ) : (
                        <div style={{
                            padding: '28px 16px',
                            textAlign: 'center',
                            color: 'var(--color-fg-muted)',
                            fontSize: '14px',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 16 16" fill="var(--color-success-fg)" style={{ marginBottom: '8px', filter: 'drop-shadow(0 0 6px rgba(63, 185, 80, 0.4))' }}>
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                            </svg>
                            <br />
                            No issues found. This file looks clean!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Main Review Panel ── */
export default function ReviewPanel({ results, activeFile }) {
    const [expanded, setExpanded] = useState({});

    const toggleFile = (path) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    useEffect(() => {
        if (activeFile) {
            setExpanded(prev => ({ ...prev, [activeFile]: true }));
        }
    }, [activeFile]);

    if (!results || results.length === 0) return null;

    let orderedResults = [...results];
    if (activeFile) {
        const idx = orderedResults.findIndex(f => f.path === activeFile);
        if (idx > 0) {
            const [item] = orderedResults.splice(idx, 1);
            orderedResults.unshift(item);
        }
    }

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            {orderedResults.map((file, idx) => (
                <FileCard
                    key={file.path}
                    file={file}
                    id={`file-${file.path}`}
                    isExpanded={expanded[file.path] ?? false}
                    onToggle={() => toggleFile(file.path)}
                    delay={0.1 + idx * 0.08}
                />
            ))}
        </div>
    );
}
