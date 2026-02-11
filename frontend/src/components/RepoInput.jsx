import { useState } from 'react';

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export default function RepoInput({ onAnalyze, loading, compact }) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!trimmed) { setError('Please enter a repository URL'); return; }
        if (!GITHUB_URL_REGEX.test(trimmed)) {
            setError('Invalid URL — use format: https://github.com/owner/repo');
            return;
        }
        setError('');
        onAnalyze(trimmed);
    };

    if (compact) {
        return (
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <svg
                            className="glow-input-icon"
                            width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        >
                            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
                        </svg>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setError(''); }}
                            placeholder="Search or paste a repository URL..."
                            disabled={loading}
                            className={`glow-input ${error ? 'glow-input-error' : ''}`}
                            style={{ paddingLeft: '36px', padding: '7px 12px 7px 36px', fontSize: '14px' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="gh-btn gh-btn-primary" style={{ padding: '7px 16px', fontSize: '14px' }}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="spinner" />
                                Analyzing…
                            </span>
                        ) : (
                            'Analyze'
                        )}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="glow-input-wrapper">
                <svg
                    className="glow-input-icon"
                    width="20" height="20" viewBox="0 0 16 16" fill="currentColor"
                >
                    <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
                </svg>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(''); }}
                    placeholder="https://github.com/owner/repo"
                    disabled={loading}
                    className={`glow-input ${error ? 'glow-input-error' : ''}`}
                />
                <button type="submit" disabled={loading} className="gh-btn-glow">
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="spinner" />
                            Analyzing…
                        </span>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '6px' }}>
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                            </svg>
                            Analyze Repository
                        </>
                    )}
                </button>
            </div>
            {error && (
                <div className="gh-flash gh-flash-error" style={{ marginTop: '10px', padding: '10px 14px', fontSize: '13px' }}>
                    {error}
                </div>
            )}
        </form>
    );
}
