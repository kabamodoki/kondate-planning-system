"""
コミュニティ献立の永続化サービス。
SUPABASE_URL / SUPABASE_KEY が設定されていれば Supabase に保存・取得する。
未設定の場合はインメモリ（state.py）にフォールバックし、graceful degradation を保証する。
"""
import os
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)
JST = ZoneInfo("Asia/Tokyo")
COMMUNITY_TTL_DAYS = 10

_SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client = None

def _get_client():
    global _client
    if _client is not None:
        return _client
    if not _SUPABASE_URL or not _SUPABASE_KEY:
        return None
    try:
        from supabase import create_client
        _client = create_client(_SUPABASE_URL, _SUPABASE_KEY)
        return _client
    except Exception as e:
        logger.warning(f"Supabase client init failed: {e}")
        return None


def add_plan(plan: dict) -> None:
    """コミュニティプールに献立を追加する。失敗しても例外を上げない。"""
    client = _get_client()
    if client is None:
        # Supabase 未設定 → インメモリにフォールバック
        from app import state
        state.add_to_community(plan)
        return
    try:
        row = {
            "id": plan["id"],
            "generated_at": plan.get("generatedAt", datetime.now(JST).isoformat()),
            "servings": plan["servings"],
            "meals": plan["meals"],
            "tags": plan.get("tags", {"forbidden": [], "preferences": []}),
            "meta": plan.get("meta", {"selectedCount": 0}),
        }
        client.table("community_plans").insert(row).execute()
    except Exception as e:
        logger.warning(f"Supabase insert failed (falling back to memory): {e}")
        from app import state
        state.add_to_community(plan)


def get_plans(limit: int = 20) -> list[dict]:
    """最新のコミュニティ献立を返す。失敗時は空リスト。"""
    client = _get_client()
    if client is None:
        from app import state
        return state.get_community_plans(limit)
    try:
        cutoff = (datetime.now(JST) - timedelta(days=COMMUNITY_TTL_DAYS)).isoformat()
        res = (
            client.table("community_plans")
            .select("*")
            .gte("generated_at", cutoff)
            .order("generated_at", desc=True)
            .limit(limit)
            .execute()
        )
        rows = res.data or []
        return [
            {
                "id": r["id"],
                "generatedAt": r["generated_at"],
                "servings": r["servings"],
                "meals": r["meals"],
                "tags": r["tags"],
                "meta": r["meta"],
            }
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"Supabase select failed: {e}")
        return []
