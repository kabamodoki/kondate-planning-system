SYSTEM_PROMPT = "日本の家庭料理の専門家。指定の JSON 形式のみで回答。前置き・説明文不要。"

DAY_JP = {
    "monday": "月曜",
    "tuesday": "火曜",
    "wednesday": "水曜",
    "thursday": "木曜",
    "friday": "金曜",
    "saturday": "土曜",
    "sunday": "日曜",
}

MEAL_JP = {
    "breakfast": "朝食",
    "lunch": "昼食",
    "dinner": "夕食",
}

DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEAL_KEYS = ["breakfast", "lunch", "dinner"]


WEEKDAY_KEYS = {"monday", "tuesday", "wednesday", "thursday", "friday"}
WEEKEND_KEYS = {"saturday", "sunday"}

def _detect_weekday_style(preferences: str) -> tuple[str, str]:
    """好みテキストから平日/週末スタイルのキーワードを検出し、プロンプト補足を返す"""
    weekday_hint = ""
    weekend_hint = ""
    pref_lower = preferences.lower()
    weekday_keywords = ["平日", "月〜金", "月曜", "火曜", "水曜", "木曜", "金曜", "weekday"]
    weekend_keywords = ["土日", "週末", "土曜", "日曜", "weekend"]
    has_weekday = any(k in pref_lower for k in weekday_keywords)
    has_weekend = any(k in pref_lower for k in weekend_keywords)
    if has_weekday or has_weekend:
        if has_weekday:
            weekday_hint = "平日（月〜金）: ユーザーの平日スタイル指定を優先"
        if has_weekend:
            weekend_hint = "週末（土・日）: ユーザーの週末スタイル指定を優先"
    return weekday_hint, weekend_hint


def build_week_plan_prompt(
    servings: int,
    meal_selection: dict,
    forbidden_ingredients: list[str] | None = None,
    preferences: str = "",
    budget: int | None = None,
    weekday_cooking_limit: int | None = None,
) -> str:
    """選択された食事のみ生成するプロンプトを構築する。"""
    selection_lines = []
    format_parts = {}

    for day in DAY_KEYS:
        day_sel = meal_selection.get(day, {})
        selected = [m for m in MEAL_KEYS if day_sel.get(m, False)]
        if selected:
            selection_lines.append(f"- {DAY_JP[day]}: {' / '.join(MEAL_JP[m] for m in selected)}")
            format_parts[day] = {
                m: {"name": "料理名", "description": "短い説明", "estimated_cost": 300, "cooking_time": 20, "ingredients": [{"name": "食材名", "amount": "分量"}]}
                for m in selected
            }

    selection_text = "\n".join(selection_lines) if selection_lines else "なし"

    import json
    # tagsフィールドを先頭に追加したフォーマット
    format_with_tags = {
        "tags": {
            "forbidden": ["食材名1", "食材名2"],
            "preferences": ["タグ1", "タグ2"],
        },
        **format_parts,
    }
    format_example = json.dumps(format_with_tags, ensure_ascii=False, indent=2)

    forbidden_section = ""
    if forbidden_ingredients:
        items = "\n".join(f"- {ing}" for ing in forbidden_ingredients)
        forbidden_section = f"\n【使用禁止食材】\n{items}\n- 上記食材を含む料理は絶対に生成しないこと\n"

    preferences_section = ""
    if preferences.strip():
        preferences_section = f"\n【好み・スタイル】\n{preferences.strip()}\n"

    budget_section = ""
    if budget:
        budget_section = f"\n【予算】1週間の食費目安は{budget}円以内（{servings}人分）。この範囲に収まるよう食材費を意識した料理を選ぶこと。\n"

    # 平日/週末スタイル検出
    weekday_hint, weekend_hint = _detect_weekday_style(preferences)
    weekday_style_section = ""
    if weekday_hint or weekend_hint:
        lines = [h for h in [weekday_hint, weekend_hint] if h]
        weekday_style_section = "\n【曜日別スタイル】\n" + "\n".join(f"- {l}" for l in lines) + "\n"

    cooking_limit_section = ""
    if weekday_cooking_limit:
        cooking_limit_section = f"\n【調理時間制約】平日（月〜金）は{weekday_cooking_limit}分以内で作れる料理を優先する。週末（土・日）は制限なし。\n"

    return f"""条件に従い指定の食事のみ生成。

【生成対象】{selection_text}

【条件】
- {servings}人分・直近3日以内に同じ料理名不可
- 和食/洋食/中華を週内で均等に分散させる（同一ジャンルが3日以上連続しない）
- 調理法（焼く/煮る/炒める/揚げる）を週内でバランスよく使う
- 主食材（鶏肉/豚肉/牛肉/魚/卵/大豆）を週内で偏りなく使う
- 日本のスーパーで買える食材・朝食は5〜10分で作れるシンプルな料理
- description は15文字以内の短い説明
- estimated_costには{servings}人分の1食あたりの食材費目安を円の整数で入力（一般的なスーパーの価格帯）
- cooking_timeには準備〜盛り付けまでの調理時間目安を分の整数で入力
{forbidden_section}{preferences_section}{budget_section}{weekday_style_section}{cooking_limit_section}
【タグ生成ルール（出力JSONの "tags" フィールド）】
- "tags.forbidden": 禁止食材の入力から食材名のみを抽出して配列にする
  例: 「卵アレルギー」→「卵」、「乳製品は使わないで」→「乳製品」、「ナッツ類NG」→「ナッツ」
  食材でない語・修飾語は除外する。禁止食材の入力がない場合は空配列 []。
- "tags.preferences": 好み・スタイルの入力から食に関連する短いキーワードのみ抽出して配列にする
  例: 「和食中心でお願いします」→「和食中心」、「なるべくヘルシーに」→「ヘルシー」、「魚料理を週3回以上」→「魚多め」
  食材・調理スタイルと無関係な語（「お願いします」「なるべく」等）は除外する。好みの入力がない場合は空配列 []。

【出力（JSON のみ・生成対象の食事のみ含める）】
{format_example}"""


REGENERATE_MEAL_TEMPLATE = """{day}の{meal_type}を1つ生成。

【除外（直近3日以内）】{already_used_dishes}

【条件】除外リスト以外・日本の家庭料理・{meal_type}に適したもの・description は15文字以内・estimated_costは{servings}人分の食材費目安（円・整数）・cooking_timeは調理時間目安（分・整数）

【出力（JSON のみ）】
{{"name":"料理名","description":"短い説明","estimated_cost":300,"cooking_time":20,"ingredients":[{{"name":"食材名","amount":"分量"}}]}}"""
