import os
import hashlib
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from collections import deque

JST = ZoneInfo("Asia/Tokyo")
DAILY_API_LIMIT = int(os.getenv("DAILY_API_LIMIT", "30"))
COMMUNITY_MAX = 300
COMMUNITY_TTL_DAYS = 10

# ── グローバル日次バジェット ──────────────────────────
_budget = {"date": "", "count": 0}

def _today_jst() -> str:
    return datetime.now(JST).strftime("%Y-%m-%d")

def get_remaining() -> int:
    if _budget["date"] != _today_jst():
        _budget["date"] = _today_jst()
        _budget["count"] = 0
    return max(0, DAILY_API_LIMIT - _budget["count"])

def consume_budget() -> bool:
    """消費できれば True、上限超えなら False"""
    if _budget["date"] != _today_jst():
        _budget["date"] = _today_jst()
        _budget["count"] = 0
    if _budget["count"] >= DAILY_API_LIMIT:
        return False
    _budget["count"] += 1
    return True

# ── IP別日次制限 ──────────────────────────────────────
GENERATE_LIMIT = 3
REGENERATE_LIMIT = 10

_ip_counters: dict[str, dict] = {}

def _get_ip_counter(ip: str) -> dict:
    today = _today_jst()
    if ip not in _ip_counters or _ip_counters[ip]["date"] != today:
        _ip_counters[ip] = {"date": today, "generate": 0, "regenerate": 0}
    return _ip_counters[ip]

def check_and_consume_ip(ip: str, action: str) -> bool:
    """消費できれば True、上限超えなら False。action は 'generate' or 'regenerate'"""
    counter = _get_ip_counter(ip)
    limit = GENERATE_LIMIT if action == "generate" else REGENERATE_LIMIT
    if counter[action] >= limit:
        return False
    counter[action] += 1
    return True

# ── 結果キャッシュ ────────────────────────────────────
_cache: dict[str, dict] = {}

def build_cache_key(servings: int, meal_selection: dict, forbidden: list[str], preferences: str, budget: int | None = None) -> str:
    has_restrictions = bool(forbidden) or bool(preferences.strip()) or budget is not None
    if has_restrictions:
        key_data = f"{servings}:{json.dumps(meal_selection, sort_keys=True)}:{sorted(forbidden)}:{preferences.strip()}:{budget}"
    else:
        key_data = f"{servings}:{json.dumps(meal_selection, sort_keys=True)}"
    return hashlib.sha256(key_data.encode()).hexdigest()

def get_cache(key: str) -> dict | None:
    entry = _cache.get(key)
    if not entry:
        return None
    if datetime.now(JST) > entry["expires_at"]:
        del _cache[key]
        return None
    return entry["data"]

def set_cache(key: str, data: dict):
    _cache[key] = {
        "data": data,
        "expires_at": datetime.now(JST) + timedelta(hours=24),
    }

# ── コミュニティプール ────────────────────────────────
_community: deque = deque()

def add_to_community(plan: dict):
    now = datetime.now(JST)
    plan["generatedAt"] = now.isoformat()
    _community.appendleft(plan)
    # 件数上限
    while len(_community) > COMMUNITY_MAX:
        _community.pop()

def get_community_plans(limit: int = 20) -> list[dict]:
    cutoff = datetime.now(JST) - timedelta(days=COMMUNITY_TTL_DAYS)
    result = []
    for plan in _community:
        if len(result) >= limit:
            break
        generated_at = datetime.fromisoformat(plan["generatedAt"])
        if generated_at < cutoff:
            continue
        result.append(plan)
    return result
