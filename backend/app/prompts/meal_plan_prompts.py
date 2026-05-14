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
                m: {"name": "料理名", "description": "短い説明", "ingredients": [{"name": "食材名", "amount": "分量"}]}
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

    return f"""条件に従い指定の食事のみ生成。

【生成対象】{selection_text}

【条件】
- {servings}人分・直近3日以内に同じ料理名不可・和洋中バランス
- 日本のスーパーで買える食材・朝食は5〜10分で作れるシンプルな料理
- description は15文字以内の短い説明
{forbidden_section}{preferences_section}
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

【条件】除外リスト以外・日本の家庭料理・{meal_type}に適したもの・description は15文字以内

【出力（JSON のみ）】
{{"name":"料理名","description":"短い説明","ingredients":[{{"name":"食材名","amount":"分量"}}]}}"""
