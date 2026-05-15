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

# ── IP別制限 ──────────────────────────────────────────
GENERATE_LIMIT = 3       # 1時間ウィンドウ内
REGENERATE_LIMIT = 5     # 日次（バジェット消費なし）

_ip_counters: dict[str, dict] = {}

def check_and_consume_generate_ip(ip: str) -> bool:
    """生成: 1時間ウィンドウで3回まで。消費できれば True、超過なら False"""
    now = datetime.now(JST)
    entry = _ip_counters.setdefault(ip, {})
    gen = entry.setdefault("generate", {"count": 0, "window_start": now})
    if now - gen["window_start"] >= timedelta(hours=1):
        gen["count"] = 0
        gen["window_start"] = now
    if gen["count"] >= GENERATE_LIMIT:
        return False
    gen["count"] += 1
    return True

def check_and_consume_regenerate_ip(ip: str) -> bool:
    """再生成: 日次で5回まで。消費できれば True、超過なら False"""
    today = _today_jst()
    entry = _ip_counters.setdefault(ip, {})
    regen = entry.setdefault("regenerate", {"count": 0, "date": today})
    if regen["date"] != today:
        regen["count"] = 0
        regen["date"] = today
    if regen["count"] >= REGENERATE_LIMIT:
        return False
    regen["count"] += 1
    return True

# ── 結果キャッシュ ────────────────────────────────────
_cache: dict[str, dict] = {}

def build_cache_key(servings: int, meal_selection: dict, forbidden: list[str], preferences: str, budget: int | None = None, breakfast_limit: int | None = None, lunch_limit: int | None = None, dinner_limit: int | None = None) -> str:
    has_restrictions = bool(forbidden) or bool(preferences.strip()) or budget is not None or any(x is not None for x in [breakfast_limit, lunch_limit, dinner_limit])
    if has_restrictions:
        key_data = f"{servings}:{json.dumps(meal_selection, sort_keys=True)}:{sorted(forbidden)}:{preferences.strip()}:{budget}:{breakfast_limit}:{lunch_limit}:{dinner_limit}"
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
