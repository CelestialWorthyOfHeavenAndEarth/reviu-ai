"""
github_service.py — Fetch Python / JS files from a public GitHub repository.
"""

import os
import base64
import requests
from urllib.parse import urlparse

GITHUB_API = "https://api.github.com"
MAX_FILES = 10
ALLOWED_EXTENSIONS = (".py", ".js")


def _headers():
    """Build request headers, optionally with a GitHub token."""
    token = os.getenv("GITHUB_TOKEN", "").strip()
    h = {"Accept": "application/vnd.github.v3+json"}
    if token:
        h["Authorization"] = f"token {token}"
    return h


def _parse_repo(repo_url: str):
    """Extract owner and repo name from a GitHub URL."""
    path = urlparse(repo_url).path.strip("/")
    # Remove trailing .git if present
    if path.endswith(".git"):
        path = path[:-4]
    parts = path.split("/")
    if len(parts) < 2:
        raise ValueError(f"Invalid GitHub URL: {repo_url}")
    return parts[0], parts[1]


def _fetch_contents(owner: str, repo: str, path: str = ""):
    """Fetch the contents listing for a given path in a repo."""
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    resp = requests.get(url, headers=_headers(), timeout=15)
    resp.raise_for_status()
    return resp.json()


def _collect_files(owner: str, repo: str, path: str, collected: list):
    """Recursively collect files from a repository, respecting MAX_FILES."""
    if len(collected) >= MAX_FILES:
        return

    items = _fetch_contents(owner, repo, path)

    # GitHub returns a dict (not list) when the path points to a single file
    if isinstance(items, dict):
        items = [items]

    for item in items:
        if len(collected) >= MAX_FILES:
            return

        if item["type"] == "dir":
            _collect_files(owner, repo, item["path"], collected)
        elif item["type"] == "file" and item["name"].endswith(ALLOWED_EXTENSIONS):
            # Fetch individual file to get content
            file_data = _fetch_contents(owner, repo, item["path"])
            if file_data.get("encoding") == "base64" and file_data.get("content"):
                code = base64.b64decode(file_data["content"]).decode("utf-8", errors="replace")
                collected.append({
                    "name": item["name"],
                    "path": item["path"],
                    "code": code,
                })


def get_repo_files(repo_url: str) -> list:
    """
    Given a public GitHub repo URL, return up to MAX_FILES .py / .js files
    as a list of {"name", "path", "code"}.
    """
    owner, repo = _parse_repo(repo_url)
    collected: list = []
    _collect_files(owner, repo, "", collected)
    return collected
