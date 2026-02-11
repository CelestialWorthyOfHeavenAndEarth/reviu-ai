import { useState } from 'react';
import RepoInput from './components/RepoInput';
import FileTree from './components/FileTree';
import ReviewPanel from './components/ReviewPanel';
import './index.css';

const EXAMPLE_REPOS = [
  { name: 'pallets/flask', desc: 'Python micro web framework' },
  { name: 'psf/requests', desc: 'HTTP library for Python' },
  { name: 'tiangolo/fastapi', desc: 'Modern Python web framework' },
];

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Security Analysis',
    desc: 'Detect vulnerabilities like SQL injection, XSS, hardcoded secrets, and insecure configurations.',
  },
  {
    icon: '⚡',
    title: 'Performance Review',
    desc: 'Identify bottlenecks, memory leaks, N+1 queries, and optimization opportunities.',
  },
  {
    icon: '✨',
    title: 'Code Quality',
    desc: 'Get suggestions for better patterns, cleaner architecture, and best practices.',
  },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFile, setActiveFile] = useState(null);
  const [repoName, setRepoName] = useState('');
  const [analyzeTime, setAnalyzeTime] = useState(0);

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError('');
    setResults(null);
    setActiveFile(null);
    const startTime = Date.now();

    const parts = url.replace(/\/$/, '').split('/');
    setRepoName(parts.slice(-2).join('/'));

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResults(data);
      setAnalyzeTime(((Date.now() - startTime) / 1000).toFixed(1));
    } catch (err) {
      setError(err.message || 'Failed to connect. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const summary = results ? results.reduce((acc, file) => {
    (file.issues || []).forEach(i => {
      if (i.severity === 'critical') acc.critical++;
      else if (i.severity === 'warning') acc.warning++;
      else acc.suggestion++;
    });
    acc.total = acc.critical + acc.warning + acc.suggestion;
    return acc;
  }, { critical: 0, warning: 0, suggestion: 0, total: 0 }) : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ═══ Animated Background ═══ */}
      <div className="app-bg">
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
      </div>

      {/* ═══ Sticky Glassmorphism Header ═══ */}
      <div className="gh-header">
        <a href="/" className="gh-header-logo">
          <svg height="32" viewBox="0 0 16 16" width="32" style={{ fill: 'var(--color-fg-default)' }}>
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </svg>
        </a>

        {/* Search bar in header (visible when we have results) */}
        {(results || loading) && (
          <div style={{ flex: 1, maxWidth: '640px' }}>
            <RepoInput onAnalyze={handleAnalyze} loading={loading} compact />
          </div>
        )}

        <div className="gh-header-nav">
          <span className="gh-header-brand">Reviu AI</span>
        </div>
      </div>

      {/* ═══ Repo Header (shows when we have results or loading) ═══ */}
      {(results || loading) && (
        <div className="repo-header">
          <div className="repo-header-name">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-fg-muted)">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
            </svg>
            {repoName && (
              <>
                <a href="#">{repoName.split('/')[0]}</a>
                <span className="separator">/</span>
                <a href="#" style={{ fontWeight: 700 }}>{repoName.split('/')[1]}</a>
              </>
            )}
          </div>

          <div className="gh-tabs">
            <button className="gh-tab">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" /></svg>
              Code
            </button>
            <button className="gh-tab active">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" /></svg>
              Security Review
              {summary && summary.total > 0 && (
                <span className="counter">{summary.total}</span>
              )}
            </button>
            <button className="gh-tab">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z" /></svg>
              Insights
            </button>
          </div>
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <main style={{ flex: 1 }}>
        <div className="content-area">

          {/* ════ Loading State ════ */}
          {loading && (
            <div className="loading-state">
              <div className="loading-ring" />
              <div className="loading-text" style={{ textAlign: 'center' }}>
                <h3>Analyzing repository…</h3>
                <p>
                  Fetching and scanning files from <strong>{repoName}</strong>
                </p>
              </div>
              {/* Floating code snippets during loading */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '60px' }}>
                <div className="floating-code" style={{ top: 0, left: '10%', animationDelay: '0s' }}>
                  {'const review = await ai.analyze()'}
                </div>
                <div className="floating-code" style={{ top: '20px', right: '5%', animationDelay: '2s', color: '#a371f7' }}>
                  {'// scanning for vulnerabilities...'}
                </div>
              </div>
            </div>
          )}

          {/* ════ Error ════ */}
          {error && !loading && (
            <div className="container" style={{ paddingTop: '40px' }}>
              <div className="gh-flash gh-flash-error" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-danger-fg)" style={{ marginTop: '2px', flexShrink: 0 }}>
                    <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                  </svg>
                  <div>
                    <strong>Analysis failed</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ Results ════ */}
          {results && !loading && (
            <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
              {/* Summary banner */}
              <div className="gh-box results-summary">
                <div className="gh-box-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-accent-fg)">
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>
                      {results.length} file{results.length !== 1 ? 's' : ''} analyzed
                    </span>
                    <span style={{ color: 'var(--color-fg-muted)', fontSize: '12px' }}>
                      in {analyzeTime}s
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {summary.critical > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span className="counter-badge counter-danger">{summary.critical}</span>
                        <span style={{ color: 'var(--color-fg-muted)' }}>critical</span>
                      </span>
                    )}
                    {summary.warning > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span className="counter-badge counter-attention">{summary.warning}</span>
                        <span style={{ color: 'var(--color-fg-muted)' }}>warnings</span>
                      </span>
                    )}
                    {summary.suggestion > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span className="counter-badge counter-success">{summary.suggestion}</span>
                        <span style={{ color: 'var(--color-fg-muted)' }}>suggestions</span>
                      </span>
                    )}
                    {summary.total === 0 && (
                      <span style={{ color: 'var(--color-success-fg)', fontSize: '13px', fontWeight: 600 }}>
                        ✓ All clear — no issues found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Two-column layout */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <FileTree
                  results={results}
                  activeFile={activeFile}
                  onSelectFile={(path) => {
                    setActiveFile(path);
                    setTimeout(() => {
                      const el = document.getElementById(`file-${path}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }}
                />
                <ReviewPanel results={results} activeFile={activeFile} />
              </div>
            </div>
          )}

          {/* ════ Hero Landing — Empty State ════ */}
          {!results && !loading && !error && (
            <div className="hero-section">
              {/* Badge */}
              <div className="hero-badge">
                AI-Powered Code Review
              </div>

              {/* Main headline */}
              <h1 className="hero-title">
                Build <span className="gradient-text">secure</span> software,
                <br />
                ship with <span className="gradient-text">confidence</span>.
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle">
                Paste any public GitHub repository URL and get instant AI-driven analysis for security vulnerabilities, performance issues, and code quality improvements.
              </p>

              {/* Glowing search bar */}
              <div className="hero-input-wrapper">
                <RepoInput onAnalyze={handleAnalyze} loading={loading} />
              </div>

              {/* Example repos */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px', animation: 'fadeInUp 0.8s ease-out 0.8s both' }}>
                {EXAMPLE_REPOS.map((repo) => (
                  <button
                    key={repo.name}
                    className="gh-btn"
                    onClick={() => handleAnalyze(`https://github.com/${repo.name}`)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-fg-muted)">
                      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
                    </svg>
                    {repo.name}
                  </button>
                ))}
              </div>

              {/* Feature cards */}
              <div className="features-grid">
                {FEATURES.map((feat, i) => (
                  <div key={i} className="feature-card">
                    <div className="feature-icon">{feat.icon}</div>
                    <h4>{feat.title}</h4>
                    <p>{feat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Security Checks</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">&lt;30s</div>
                  <div className="stat-label">Analysis Time</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Repos to Scan</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="app-footer">
        <span>© 2026 Reviu AI</span>
        <a href="#">About</a>
        <a href="#">Docs</a>
        <span style={{ color: 'var(--color-fg-subtle)' }}>Built for Hackathon 2026</span>
      </footer>
    </div>
  );
}
