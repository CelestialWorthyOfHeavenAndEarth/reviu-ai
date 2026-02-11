export default function FileTree({ results, activeFile, onSelectFile }) {
    if (!results || results.length === 0) return null;

    const getHighestSeverity = (issues) => {
        if (!issues || issues.length === 0) return 'clean';
        if (issues.some(i => i.severity === 'critical')) return 'critical';
        if (issues.some(i => i.severity === 'warning')) return 'warning';
        return 'suggestion';
    };

    const getExtClass = (name) => {
        const ext = name?.split('.').pop() || '';
        const map = { py: 'file-icon-py', js: 'file-icon-js', ts: 'file-icon-ts', jsx: 'file-icon-jsx', css: 'file-icon-css' };
        return map[ext] || '';
    };

    return (
        <div className="sidebar">
            <div className="glass-card">
                {/* Header */}
                <div className="gh-box-header">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--color-accent-fg)' }}>
                        <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Files</span>
                    <span className="counter-badge" style={{
                        background: 'rgba(163, 113, 247, 0.3)',
                        color: 'var(--color-fg-default)',
                        marginLeft: 'auto',
                    }}>
                        {results.length}
                    </span>
                </div>

                {/* File List */}
                {results.map((file, idx) => {
                    const sev = getHighestSeverity(file.issues);
                    const isActive = activeFile === file.path;
                    const count = file.issues?.length || 0;

                    return (
                        <div
                            key={idx}
                            className="gh-box-row"
                            onClick={() => onSelectFile(file.path)}
                            style={{
                                background: isActive ? 'rgba(56, 139, 253, 0.08)' : undefined,
                                borderLeft: isActive ? '2px solid var(--color-accent-fg)' : '2px solid transparent',
                                animation: `fadeInUp 0.4s ease-out ${0.1 + idx * 0.05}s both`,
                            }}
                        >
                            {/* File icon */}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
                                className={getExtClass(file.name || file.path)}
                                style={{ flexShrink: 0, color: 'var(--color-fg-muted)' }}>
                                <path d="M3.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75ZM9.5 1.563V4.25c0 .138.112.25.25.25h2.688L9.5 1.563ZM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75Z" />
                            </svg>

                            {/* Filename */}
                            <span className="file-name" style={{
                                flex: 1,
                                fontSize: '13px',
                                color: isActive ? 'var(--color-accent-fg)' : 'var(--color-fg-default)',
                                fontWeight: isActive ? 600 : 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                transition: 'color 0.2s',
                            }}>
                                {file.path}
                            </span>

                            {/* Issue dot + count */}
                            <span className={`dot dot-${sev}`} />
                            {count > 0 && (
                                <span style={{ fontSize: '12px', color: 'var(--color-fg-muted)', fontWeight: 500 }}>{count}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
