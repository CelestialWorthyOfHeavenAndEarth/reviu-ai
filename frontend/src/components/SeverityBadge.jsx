export default function SeverityBadge({ severity }) {
    const config = {
        critical: { label: '● critical', cls: 'gh-label-danger' },
        warning: { label: '▲ warning', cls: 'gh-label-attention' },
        suggestion: { label: '◆ suggestion', cls: 'gh-label-success' },
    };
    const { label, cls } = config[severity] || config.suggestion;
    return <span className={`gh-label ${cls}`}>{label}</span>;
}
