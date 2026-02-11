"""
ai_service.py — Heuristic + optional ML code analysis.

Primary analysis is regex/heuristic based for reliability and speed.
If the CodeBERTa model is available it adds an ML-confidence signal,
but the demo works perfectly without it.
"""

import re
import os
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional: load HuggingFace model (lazy, first call only)
# ---------------------------------------------------------------------------
_model_pipeline = None
_model_load_attempted = False


def _get_model():
    global _model_pipeline, _model_load_attempted
    if _model_load_attempted:
        return _model_pipeline
    _model_load_attempted = True
    try:
        from transformers import pipeline as hf_pipeline
        logger.info("Loading CodeBERTa model (first request may be slow)...")
        _model_pipeline = hf_pipeline("fill-mask", model="huggingface/CodeBERTa-small-v1")
        logger.info("CodeBERTa model loaded successfully.")
    except Exception as exc:
        logger.warning("Could not load CodeBERTa model — running heuristic-only mode. %s", exc)
        _model_pipeline = None
    return _model_pipeline


# ---------------------------------------------------------------------------
# Heuristic rule sets
# ---------------------------------------------------------------------------

SECURITY_RULES = [
    {
        "pattern": re.compile(r"""(?:password|passwd|secret|api_key|apikey|token)\s*=\s*['"][^'"]{3,}['"]""", re.IGNORECASE),
        "message": "Hardcoded secret or password detected",
        "category": "Security",
        "severity": "critical",
    },
    {
        "pattern": re.compile(r"""\beval\s*\("""),
        "message": "Use of eval() — potential code injection risk",
        "category": "Security",
        "severity": "critical",
    },
    {
        "pattern": re.compile(r"""\bexec\s*\("""),
        "message": "Use of exec() — potential code injection risk",
        "category": "Security",
        "severity": "critical",
    },
    {
        "pattern": re.compile(r"""(?:execute|cursor\.execute)\s*\(\s*(?:f['"]|['"].*%\s*|['"].*\.format\s*\()""", re.IGNORECASE),
        "message": "Possible SQL injection — use parameterized queries instead",
        "category": "Security",
        "severity": "critical",
    },
    {
        "pattern": re.compile(r"""\bos\.system\s*\(|subprocess\.(?:call|run|Popen)\s*\(.*(?:input|request|arg)""", re.IGNORECASE),
        "message": "Unvalidated input may be passed to shell command",
        "category": "Security",
        "severity": "critical",
    },
]

PERFORMANCE_RULES = [
    {
        "pattern": re.compile(r"""for\s+\w+\s+in\s+.*:\s*\n\s+for\s+\w+\s+in\s+"""),
        "message": "Nested loop detected — O(n²) complexity; consider optimization",
        "category": "Performance",
        "severity": "warning",
    },
    {
        "pattern": re.compile(r"""\bSELECT\s+\*\b""", re.IGNORECASE),
        "message": "SELECT * usage — specify needed columns and consider adding indexes",
        "category": "Performance",
        "severity": "warning",
    },
    {
        "pattern": re.compile(r"""\btime\.sleep\s*\("""),
        "message": "Synchronous sleep call — may block the event loop in async contexts",
        "category": "Performance",
        "severity": "warning",
    },
    {
        "pattern": re.compile(r"""\.read(?:lines)?\s*\(\s*\)"""),
        "message": "Loading entire file into memory — consider streaming for large files",
        "category": "Performance",
        "severity": "warning",
    },
]


def _check_quality_long_functions(code: str, lines: list):
    """Detect functions longer than 50 lines."""
    issues = []
    func_start = None
    func_name = ""
    indent_level = 0

    for i, line in enumerate(lines):
        m = re.match(r'^(\s*)def\s+(\w+)', line)
        if m:
            if func_start is not None:
                length = i - func_start
                if length > 50:
                    issues.append({
                        "severity": "suggestion",
                        "category": "Code Quality",
                        "message": f"Function '{func_name}' is {length} lines long — consider breaking it up",
                        "line_hint": func_start + 1,
                        "snippet": lines[func_start].rstrip(),
                    })
            func_start = i
            func_name = m.group(2)
            indent_level = len(m.group(1))

    # Last function
    if func_start is not None:
        length = len(lines) - func_start
        if length > 50:
            issues.append({
                "severity": "suggestion",
                "category": "Code Quality",
                "message": f"Function '{func_name}' is {length} lines long — consider breaking it up",
                "line_hint": func_start + 1,
                "snippet": lines[func_start].rstrip(),
            })

    return issues


def _check_quality_missing_docstrings(code: str, lines: list):
    """Detect public functions missing docstrings."""
    issues = []
    for i, line in enumerate(lines):
        m = re.match(r'^\s*def\s+([a-zA-Z]\w*)\s*\(', line)
        if m and not m.group(1).startswith('_'):
            # Check if next non-empty line is a docstring
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1
            if j < len(lines):
                next_line = lines[j].strip()
                if not (next_line.startswith('"""') or next_line.startswith("'''")):
                    issues.append({
                        "severity": "suggestion",
                        "category": "Code Quality",
                        "message": f"Public function '{m.group(1)}' is missing a docstring",
                        "line_hint": i + 1,
                        "snippet": line.rstrip(),
                    })
    return issues


def _check_quality_magic_numbers(code: str, lines: list):
    """Detect unexplained numeric literals (magic numbers)."""
    issues = []
    magic_re = re.compile(r'(?<!=)\s+(\d{2,})\s*(?:[+\-*/%><]|$)')
    skip_re = re.compile(r'^\s*(?:#|def |class |import |from |return |range\(|.*(?:port|timeout|max|min|size|len|count|index|status|code)\s*=)', re.IGNORECASE)

    for i, line in enumerate(lines):
        if skip_re.match(line):
            continue
        for m in magic_re.finditer(line):
            num = int(m.group(1))
            if num not in (0, 1, 2, 10, 100, 1000, 200, 404, 500):
                issues.append({
                    "severity": "suggestion",
                    "category": "Code Quality",
                    "message": f"Magic number {num} — consider using a named constant",
                    "line_hint": i + 1,
                    "snippet": line.rstrip(),
                })
                break  # one per line
    return issues


def _check_quality_deep_nesting(code: str, lines: list):
    """Detect deeply nested conditionals (>3 levels)."""
    issues = []
    for i, line in enumerate(lines):
        stripped = line.rstrip()
        if stripped and not stripped.startswith('#'):
            indent = len(line) - len(line.lstrip())
            # Rough heuristic: 4 spaces per level → 16+ spaces = 4+ levels
            if indent >= 16 and re.match(r'\s+(if |elif |else:|for |while )', line):
                issues.append({
                    "severity": "suggestion",
                    "category": "Code Quality",
                    "message": "Deeply nested conditional — consider early returns or extracting functions",
                    "line_hint": i + 1,
                    "snippet": stripped,
                })
    return issues


# ---------------------------------------------------------------------------
# Main analysis entry point
# ---------------------------------------------------------------------------

def analyze_code(file_info: dict) -> dict:
    """
    Analyze a single code file and return detected issues.

    Parameters
    ----------
    file_info : dict with keys "name", "path", "code"

    Returns
    -------
    dict  { "file": name, "path": path, "issues": [...] }
    """
    code = file_info["code"]
    lines = code.split("\n")
    issues = []

    # --- Regex / heuristic rules ---
    for rule in SECURITY_RULES + PERFORMANCE_RULES:
        for m in rule["pattern"].finditer(code):
            # Determine line number
            line_num = code[:m.start()].count("\n") + 1
            snippet_line = lines[line_num - 1].rstrip() if line_num <= len(lines) else ""
            issues.append({
                "severity": rule["severity"],
                "category": rule["category"],
                "message": rule["message"],
                "line_hint": line_num,
                "snippet": snippet_line,
            })

    # --- Code quality checks ---
    issues.extend(_check_quality_long_functions(code, lines))
    issues.extend(_check_quality_missing_docstrings(code, lines))
    issues.extend(_check_quality_magic_numbers(code, lines))
    issues.extend(_check_quality_deep_nesting(code, lines))

    # --- Optional ML enhancement ---
    model = _get_model()
    if model is not None:
        try:
            # Use CodeBERTa to flag unusual code patterns
            # We check a small sample for anomaly scores
            sample_lines = [l for l in lines if l.strip() and not l.strip().startswith('#')][:5]
            for idx, sample in enumerate(sample_lines):
                trimmed = sample.strip()[:80]
                if len(trimmed) > 10:
                    masked = trimmed + " <mask>"
                    try:
                        result = model(masked, top_k=1)
                        if result and result[0].get("score", 1.0) < 0.01:
                            issues.append({
                                "severity": "suggestion",
                                "category": "Code Quality",
                                "message": "ML model flagged unusual code pattern",
                                "line_hint": idx + 1,
                                "snippet": trimmed,
                            })
                    except Exception:
                        pass  # Silently skip ML errors per-line
        except Exception as exc:
            logger.debug("ML analysis skipped: %s", exc)

    # De-duplicate issues by (line_hint, message)
    seen = set()
    unique_issues = []
    for issue in issues:
        key = (issue["line_hint"], issue["message"])
        if key not in seen:
            seen.add(key)
            unique_issues.append(issue)

    return {
        "file": file_info["name"],
        "path": file_info["path"],
        "issues": unique_issues,
    }
