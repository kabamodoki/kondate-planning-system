SYSTEM_PROMPT = """あなたは栄養バランスと彩りを考えた家庭料理の専門家です。
日本の家庭で普通に作れる料理を提案します。
必ず指定された JSON 形式のみで回答してください。
前置きや説明文は不要です。JSON だけを出力してください。"""

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


def build_week_plan_prompt(
    servings: int,
    meal_selection: dict,
    forbidden_ingredients: list[str] | None = None,
    preferences: str = "",
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
                m: {"name": "料理名", "description": "一文での説明", "ingredients": [{"name": "食材名", "amount": "分量"}]}
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

    return f"""以下の条件で指定された食事のみ生成してください。

【生成対象】
{selection_text}

【条件】
- {servings}人分の食材量で生成する（食材の量はすべて{servings}人分で記載）
- 同じ料理名は直近3日以内に繰り返さない
- 日本の家庭料理を中心に（和食・洋食・中華をバランスよく）
- 材料は日本のスーパーで購入できるものに限定する
- 朝食はシンプルなもの（5〜10分で作れる程度）
- 昼食・夕食はやや充実したもの
{forbidden_section}{preferences_section}
【タグ生成ルール（出力JSONの "tags" フィールド）】
- "tags.forbidden": 禁止食材の入力から食材名のみを抽出して配列にする
  例: 「卵アレルギー」→「卵」、「乳製品は使わないで」→「乳製品」、「ナッツ類NG」→「ナッツ」
  食材でない語・修飾語は除外する。禁止食材の入力がない場合は空配列 []。
- "tags.preferences": 好み・スタイルの入力から食に関連する短いキーワードのみ抽出して配列にする
  例: 「和食中心でお願いします」→「和食中心」、「なるべくヘルシーに」→「ヘルシー」、「魚料理を週3回以上」→「魚多め」
  食材・調理スタイルと無関係な語（「お願いします」「なるべく」等）は除外する。好みの入力がない場合は空配列 []。

【出力形式（JSON のみ・説明文不要・生成対象の食事のみ含める）】
{format_example}"""


REGENERATE_MEAL_TEMPLATE = """以下の条件で{day}の{meal_type}の料理を1つ生成してください。

【除外する料理（直近3日以内に出た料理）】
{already_used_dishes}

【条件】
- 上記リストにない料理を必ず選ぶ
- 日本の家庭料理（和食・洋食・中華）
- {meal_type}に適した料理

【出力形式（JSON のみ）】
{{
  "name": "料理名",
  "description": "一文での説明",
  "ingredients": [
    {{ "name": "食材名", "amount": "分量" }}
  ]
}}"""
