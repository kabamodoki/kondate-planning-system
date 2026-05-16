"""
グローバル日次バジェットの永続化サービス。
SUPABASE_URL / SUPABASE_KEY が設定されていれば Supabase の daily_budget テーブルを使用する。
未設定の場合はインメモリ（state.py）にフォールバックし、graceful degradation を保証する。
"""
import os
import logging

logger = logging.getLogger(__name__)

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


def consume_budget() -> bool:
    """バジェットを1消費する。消費できれば True、上限超えなら False。"""
    from app import state

    client = _get_client()
    if client is None:
        return state.consume_budget()

    today = state._today_jst()
    try:
        res = client.table("daily_budget").select("count").eq("date", today).execute()
        current = res.data[0]["count"] if res.data else 0

        if current >= state.DAILY_API_LIMIT:
            return False

        if res.data:
            client.table("daily_budget").update({"count": current + 1}).eq("date", today).execute()
        else:
            client.table("daily_budget").insert({"date": today, "count": 1}).execute()
        return True
    except Exception as e:
        logger.warning(f"Supabase budget consume failed (fallback to memory): {e}")
        return state.consume_budget()


def get_remaining() -> int:
    """今日の残りバジェットを返す。"""
    from app import state

    client = _get_client()
    if client is None:
        return state.get_remaining()

    today = state._today_jst()
    try:
        res = client.table("daily_budget").select("count").eq("date", today).execute()
        current = res.data[0]["count"] if res.data else 0
        return max(0, state.DAILY_API_LIMIT - current)
    except Exception as e:
        logger.warning(f"Supabase budget read failed (fallback to memory): {e}")
        return state.get_remaining()
