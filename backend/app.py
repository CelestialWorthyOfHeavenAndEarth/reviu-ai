"""
app.py — Reviu AI Flask backend.
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from github_service import get_repo_files
from ai_service import analyze_code

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

app = Flask(__name__)

# CORS — restrict to known origins in production
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
if raw_origins == "*":
    CORS(app, origins="*")
else:
    CORS(app, origins=raw_origins.split(","))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Simple in-memory rate limiter (no extra dependency needed)
# ---------------------------------------------------------------------------
from collections import defaultdict
import time

_rate_store = defaultdict(list)
RATE_LIMIT = 10          # max requests
RATE_WINDOW = 60          # per 60 seconds


def _is_rate_limited(ip: str) -> bool:
    now = time.time()
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < RATE_WINDOW]
    if len(_rate_store[ip]) >= RATE_LIMIT:
        return True
    _rate_store[ip].append(now)
    return False


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    # Rate limiting
    client_ip = request.remote_addr or "unknown"
    if _is_rate_limited(client_ip):
        return jsonify({"error": "Rate limit exceeded — please wait a minute and try again"}), 429

    data = request.get_json(force=True, silent=True)
    if not data or "repo_url" not in data:
        return jsonify({"error": "Missing 'repo_url' in request body"}), 400

    repo_url = data["repo_url"].strip()
    if "github.com" not in repo_url:
        return jsonify({"error": "Only GitHub repository URLs are supported"}), 400

    try:
        logger.info("Fetching files from %s …", repo_url)
        files = get_repo_files(repo_url)

        if not files:
            return jsonify({"error": "No .py or .js files found in this repository"}), 404

        logger.info("Analyzing %d file(s)…", len(files))
        results = [analyze_code(f) for f in files]

        return jsonify(results)

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as exc:
        logger.exception("Analysis failed")
        return jsonify({"error": f"Analysis failed: {exc}"}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    is_dev = os.getenv("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=is_dev)
